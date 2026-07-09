const COMMON_SECOND_LEVEL_SUFFIXES = new Set([
  "ac.in",
  "ac.uk",
  "co.in",
  "co.jp",
  "co.nz",
  "co.uk",
  "com.au",
  "com.sg",
  "gov.in",
  "gov.uk",
  "org.in",
  "org.uk",
]);

const IPV4_REGEX =
  /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
const IPV6_REGEX =
  /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(([0-9a-fA-F]{1,4}:){1,7}:)|(([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4})|(([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2})|(([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3})|(([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4})|(([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5})|(([0-9a-fA-F]{1,4}:){1}(:[0-9a-fA-F]{1,4}){1,6})|(:((:[0-9a-fA-F]{1,4}){1,7}|:)))$/;

function normalizeString(value) {
  if (typeof value === "boolean") return value ? "true" : "";
  if (Array.isArray(value)) return value.join(", ");
  return String(value || "").trim();
}

function normalizeUrl(value) {
  const trimmed = normalizeString(value);
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function extractHostname(value) {
  const normalized = normalizeUrl(value);
  if (!normalized) return "";

  try {
    return new URL(normalized).hostname.toLowerCase();
  } catch {
    return trimmedToHost(value);
  }
}

function trimmedToHost(value) {
  return normalizeString(value)
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "")
    .toLowerCase();
}

function getRootDomain(value) {
  const host = extractHostname(value);
  const parts = host.split(".").filter(Boolean);
  if (parts.length <= 2) return host;
  const lastTwo = parts.slice(-2).join(".");
  if (COMMON_SECOND_LEVEL_SUFFIXES.has(lastTwo)) {
    return parts.slice(-3).join(".");
  }
  return lastTwo;
}

function validateRequired(field, value, allValues) {
  const normalized = normalizeString(value);
  if (normalized) return null;

  if (Array.isArray(field.atLeastOneOf) && field.atLeastOneOf.length > 0) {
    const anyValue = field.atLeastOneOf.some((key) =>
      normalizeString(allValues?.[key]).length > 0
    );
    if (anyValue) return null;
  }

  return {
    status: "error",
    message: `${field.label || "This field"} is required.`,
    fixHint: field.requiredHint || "Fill in this field before running the tool.",
    example: field.examples?.[0] || "",
  };
}

function ok(message, field, example) {
  return {
    status: "success",
    message,
    fixHint: "",
    example: example || field?.examples?.[0] || "",
  };
}

function info(message, field, fixHint = "", example = "") {
  return {
    status: "info",
    message,
    fixHint,
    example: example || field?.examples?.[0] || "",
  };
}

function warning(message, field, fixHint = "", example = "") {
  return {
    status: "warning",
    message,
    fixHint,
    example: example || field?.examples?.[0] || "",
  };
}

function error(message, field, fixHint = "", example = "") {
  return {
    status: "error",
    message,
    fixHint,
    example: example || field?.examples?.[0] || "",
  };
}

function validateUrlField(field, value) {
  const raw = normalizeString(value);
  if (!raw) {
    return info(
      "Use a public HTTP or HTTPS target you are authorized to test.",
      field,
      "Include the full scheme to avoid ambiguous parsing."
    );
  }

  if (!/^https?:\/\//i.test(raw)) {
    if (/^[a-z0-9.-]+\.[a-z]{2,}/i.test(raw)) {
      return warning(
        "Add https:// explicitly so the tool targets the intended scheme.",
        field,
        "Most scanners behave more predictably with a fully qualified URL."
      );
    }
    return error(
      "Enter a valid HTTP or HTTPS URL.",
      field,
      "Example: https://example.com"
    );
  }

  try {
    const parsed = new URL(raw);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return error(
        "Only http:// or https:// targets are supported.",
        field,
        "Replace other URI schemes with a web URL."
      );
    }

    if (
      /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/i.test(parsed.hostname) ||
      parsed.hostname.endsWith(".local")
    ) {
      return warning(
        "Localhost-style targets often fail on remote scanners.",
        field,
        "Use a publicly reachable test host when the backend performs network requests."
      );
    }

    return ok("", field);
  } catch {
    return error(
      "This does not look like a valid web URL.",
      field,
      "Example: https://example.com/path"
    );
  }
}

function validateDomainField(field, value) {
  const raw = normalizeString(value);
  if (!raw) {
    return info(
      "Enter the root domain or subdomain you want to inspect.",
      field,
      "Do not include protocol prefixes unless the tool explicitly asks for a URL."
    );
  }

  if (/^https?:\/\//i.test(raw)) {
    return error(
      "This field expects a domain, not a full URL.",
      field,
      "Use example.com instead of https://example.com"
    );
  }

  const host = trimmedToHost(raw);
  const valid =
    /^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/i.test(host) && !host.includes("..");
  if (!valid) {
    return error(
      "Enter a valid domain or hostname.",
      field,
      "Example: example.com or api.example.com"
    );
  }

  if (host !== getRootDomain(host)) {
    return info(
      "Subdomain format looks valid.",
      field,
      "Use the root domain when the tool needs broad coverage across all subdomains."
    );
  }

  return ok("Domain format looks valid.", field);
}

function validateIpField(field, value) {
  const raw = normalizeString(value);
  if (!raw) {
    return info(
      "Enter a public IPv4 or IPv6 address.",
      field,
      "Example: 8.8.8.8 or 2001:4860:4860::8888"
    );
  }

  if (IPV4_REGEX.test(raw) || IPV6_REGEX.test(raw)) {
    return ok("IP address format looks valid.", field);
  }

  return error(
    "Enter a valid IPv4 or IPv6 address.",
    field,
    "Remove hostnames or URL prefixes from this field."
  );
}

function validateJsonField(field, value) {
  const raw = normalizeString(value);
  if (!raw) {
    return info(
      field.optionalEmptyMessage || "Leave this empty unless the endpoint requires JSON input.",
      field
    );
  }

  try {
    const parsed = JSON.parse(raw);
    if (parsed === null || Array.isArray(parsed) || typeof parsed !== "object") {
      return warning(
        "Valid JSON was provided, but an object payload is usually expected here.",
        field,
        "Wrap single values inside an object when the API expects key/value input."
      );
    }
    return ok("JSON syntax is valid.", field);
  } catch {
    return error(
      "JSON syntax is invalid.",
      field,
      "Check commas, quotes, and closing braces."
    );
  }
}

function validateTokenField(field, value) {
  const raw = normalizeString(value);
  if (!raw) {
    return info(
      "Paste the raw token without extra words or quotes.",
      field,
      "For JWT tools, use the entire bearer token value."
    );
  }

  if (raw.split(".").length === 3) {
    return ok("Token looks like a JWT with header, payload, and signature segments.", field);
  }

  if (raw.length < 20) {
    return error(
      "This token looks too short or incomplete.",
      field,
      "Paste the entire token value exactly as issued."
    );
  }

  return info(
    "Token format is accepted, but verify you pasted the full value.",
    field,
    "Remove the Bearer prefix unless the tool explicitly asks for it."
  );
}

function validateCodeField(field, value, allValues) {
  const raw = normalizeString(value);
  const hasSiblingValue =
    Array.isArray(field.atLeastOneOf) &&
    field.atLeastOneOf.some((key) => normalizeString(allValues?.[key]).length > 0);

  if (!raw && !hasSiblingValue) {
    return info(
      "Paste source code or upload a file before scanning.",
      field,
      "Large files are often easier to test with upload instead of copy/paste."
    );
  }

  if (!raw) {
    return info(
      "No pasted code detected. Uploaded content will be used instead.",
      field
    );
  }

  if (raw.length < 20) {
    return warning(
      "This snippet is very short. Results may be inconclusive.",
      field,
      "Include the full vulnerable flow when possible, not just one line."
    );
  }

  return ok("Code input is ready for analysis.", field);
}

function validateFileField(field, value, allValues) {
  const raw = normalizeString(value);
  const hasSiblingValue =
    Array.isArray(field.atLeastOneOf) &&
    field.atLeastOneOf.some((key) => normalizeString(allValues?.[key]).length > 0);

  if (!raw && hasSiblingValue) {
    return info(
      "No file selected. The tool will rely on the pasted input instead.",
      field
    );
  }

  if (!raw) {
    return info(
      "Upload a source file if you do not want to paste the content manually.",
      field
    );
  }

  return ok("File input is present.", field, raw);
}

function validateTimeoutField(field, value) {
  const raw = normalizeString(value);
  if (!raw) {
    return info(
      "Use a realistic timeout for the target you are testing.",
      field,
      "Short timeouts reduce waiting, but may create false negatives on slow endpoints."
    );
  }

  const numeric = Number(raw);
  if (Number.isNaN(numeric)) {
    return error(
      "Timeout must be a number.",
      field,
      "Enter milliseconds such as 5000 or 10000."
    );
  }

  if (numeric < 1000) {
    return warning(
      "Very short timeouts often cause avoidable request failures.",
      field,
      "Use at least 1000 ms for internet-facing targets."
    );
  }

  if (numeric > 60000) {
    return warning(
      "Very long timeouts can slow large test runs significantly.",
      field,
      "Reduce the timeout if the tool appears stuck on unresponsive targets."
    );
  }

  return ok("Timeout value looks reasonable.", field);
}

function validatePortRangeField(field, value) {
  const raw = normalizeString(value).toLowerCase();
  if (!raw) {
    return info(
      "Use a single port, a numeric range, or the word common.",
      field,
      "Examples: 443, 80-1024, common"
    );
  }

  if (raw === "common") {
    return ok("The scanner will test the built-in common service list.", field);
  }

  const range = raw.match(/^(\d{1,5})\s*-\s*(\d{1,5})$/);
  if (range) {
    const start = Number(range[1]);
    const end = Number(range[2]);
    if (start >= 1 && end <= 65535 && start <= end) {
      return ok("Port range format looks valid.", field);
    }
    return error(
      "Ports must stay between 1 and 65535.",
      field,
      "Example: 80-443"
    );
  }

  const single = Number(raw);
  if (!Number.isNaN(single) && single >= 1 && single <= 65535) {
    return ok("Single-port format looks valid.", field);
  }

  return error(
    "Use a single port, a valid range, or the word common.",
    field,
    "Examples: 22, 443, 1-1024, common"
  );
}

function validatePemOrSecretField(field, value, allValues) {
  const raw = normalizeString(value);
  if (!raw) {
    return info(
      "Provide the shared secret or the PEM-formatted verification key.",
      field
    );
  }

  const algorithm = normalizeString(allValues?.algorithm);
  const expectsPem = /^(RS|ES)/i.test(algorithm);
  if (expectsPem && !/BEGIN (PUBLIC KEY|CERTIFICATE)/.test(raw)) {
    return warning(
      "This algorithm usually expects a PEM public key or certificate.",
      field,
      "Paste the full BEGIN/END block for asymmetric validation."
    );
  }

  if (!expectsPem && raw.length < 8) {
    return warning(
      "Very short HMAC secrets are usually weak or incomplete.",
      field,
      "Use the exact shared secret configured by the issuer."
    );
  }

  return ok("Signature material is present.", field);
}

function validateHostField(field, value) {
  const raw = normalizeString(value);
  if (!raw) {
    return info(
      "Use a resolvable hostname or IP address.",
      field,
      "Examples: example.com, 203.0.113.10"
    );
  }

  if (IPV4_REGEX.test(raw) || IPV6_REGEX.test(raw)) {
    return ok("Host IP format looks valid.", field);
  }

  if (/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/i.test(raw)) {
    return ok("Hostname format looks valid.", field);
  }

  return error(
    "Enter a valid hostname or IP address.",
    field,
    "Avoid including URL schemes or paths in this field."
  );
}

function validatePortField(field, value) {
  const raw = normalizeString(value);
  if (!raw) {
    return info(
      "Use the service port that the target actually listens on.",
      field,
      "Common examples are 80, 443, 27017, or 5432."
    );
  }

  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return error(
      "Port must be a whole number between 1 and 65535.",
      field
    );
  }

  return ok("Port value looks valid.", field);
}

function validateFreeTextField(field, value) {
  const raw = normalizeString(value);
  if (!raw) {
    return info(field.emptyMessage || "You can leave this blank if it is not required.", field);
  }
  return ok(field.validMessage || "Input captured.", field);
}

const VALIDATORS = {
  url: validateUrlField,
  domain: validateDomainField,
  ip: validateIpField,
  json: validateJsonField,
  headersJson: validateJsonField,
  token: validateTokenField,
  code: validateCodeField,
  file: validateFileField,
  timeoutMs: validateTimeoutField,
  portRange: validatePortRangeField,
  pemOrSecret: validatePemOrSecretField,
  host: validateHostField,
  port: validatePortField,
  text: validateFreeTextField,
};

export function validateGuidanceField(field, value, allValues = {}) {
  const requiredError = validateRequired(field, value, allValues);
  if (requiredError) return requiredError;

  const validator = VALIDATORS[field.validator];
  if (!validator) {
    return validateFreeTextField(field, value, allValues);
  }

  return validator(field, value, allValues);
}

export function getFieldValueFromElement(element) {
  if (!element) return "";
  if (element.type === "checkbox") return element.checked;
  if (element.type === "file") {
    return Array.from(element.files || []).map((file) => file.name);
  }
  if (element.tagName === "SELECT" && element.multiple) {
    return Array.from(element.selectedOptions || []).map((option) => option.value);
  }
  return element.value ?? "";
}
