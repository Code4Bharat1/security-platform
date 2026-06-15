function urlField(overrides = {}) {
  return {
    label: "Target URL",
    description:
      "Use the exact web address you intend to test, including the scheme whenever possible.",
    placeholder: "https://example.com",
    examples: ["https://example.com", "https://app.example.com/login"],
    validator: "url",
    required: true,
    commonMistakes: [
      "Entering only a path such as /login instead of the full target URL.",
      "Using a localhost or private address when the backend scanner runs remotely.",
      "Forgetting the https:// prefix and accidentally targeting the wrong scheme.",
    ],
    bestPractices: [
      "Prefer HTTPS URLs so the tool checks the same route your users rely on.",
      "Point the scan at the page or endpoint that actually reflects or processes input.",
    ],
    ...overrides,
  };
}

function domainField(overrides = {}) {
  return {
    label: "Domain",
    description:
      "Enter the hostname the tool should resolve or enumerate, without protocol prefixes.",
    placeholder: "example.com",
    examples: ["example.com", "api.example.com"],
    validator: "domain",
    required: true,
    commonMistakes: [
      "Including https:// in a domain-only field.",
      "Using a URL path instead of the hostname.",
    ],
    bestPractices: [
      "Use the root domain for broad discovery tasks such as subdomain enumeration.",
      "Use a specific subdomain when you only want to inspect one host.",
    ],
    ...overrides,
  };
}

function ipField(overrides = {}) {
  return {
    label: "IP Address",
    description:
      "Use a public IP address exactly as routed, without hostnames or URL prefixes.",
    placeholder: "8.8.8.8",
    examples: ["8.8.8.8", "2001:4860:4860::8888"],
    validator: "ip",
    required: true,
    commonMistakes: [
      "Pasting a hostname instead of an IP address.",
      "Adding a port or scheme to the IP field.",
    ],
    bestPractices: [
      "Use the exact address you observed in DNS, logs, or network telemetry.",
    ],
    ...overrides,
  };
}

function codeField(overrides = {}) {
  return {
    label: "Code",
    description:
      "Paste the relevant application or configuration code that should be analyzed.",
    placeholder: "Paste source code here...",
    examples: ["function handler(req, res) { /* ... */ }"],
    validator: "code",
    required: false,
    commonMistakes: [
      "Pasting only a tiny fragment without the surrounding security logic.",
      "Leaving placeholder text in the editor and scanning empty content.",
    ],
    bestPractices: [
      "Include the full request handling path when the tool looks for auth, session, or injection flaws.",
      "Mask secrets before sharing or exporting results outside your team.",
    ],
    ...overrides,
  };
}

function fileField(overrides = {}) {
  return {
    label: "File Upload",
    description:
      "Upload a source file when you prefer not to paste the content manually.",
    placeholder: "",
    examples: [".js", ".ts", ".php", ".txt"],
    validator: "file",
    required: false,
    commonMistakes: [
      "Uploading a binary or unsupported file type to a text analyzer.",
      "Assuming the file upload replaced a required URL or host field.",
    ],
    bestPractices: [
      "Use uploads for large source files to avoid truncating code in the browser.",
    ],
    ...overrides,
  };
}

function tokenField(overrides = {}) {
  return {
    label: "Token",
    description:
      "Paste the raw token value exactly as issued so the tool can parse and inspect it.",
    placeholder: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    examples: [
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMifQ.signature",
    ],
    validator: "token",
    required: true,
    commonMistakes: [
      "Including explanatory text or quotes around the token.",
      "Copying only one segment of a JWT instead of the full value.",
    ],
    bestPractices: [
      "Work with test tokens whenever possible.",
      "Avoid posting production secrets or tokens into screenshots or tickets.",
    ],
    ...overrides,
  };
}

function jsonField(label, overrides = {}) {
  return {
    label,
    description:
      "Supply valid JSON when the target endpoint expects structured input.",
    placeholder: '{\n  "key": "value"\n}',
    examples: ['{ "Content-Type": "application/json" }'],
    validator: "json",
    required: false,
    ...overrides,
  };
}

function timeoutField(overrides = {}) {
  return {
    label: "Timeout",
    description:
      "Set a realistic request timeout so slow endpoints do not appear broken too early.",
    placeholder: "5000",
    examples: ["5000", "10000"],
    validator: "timeoutMs",
    required: false,
    ...overrides,
  };
}

function hostField(overrides = {}) {
  return {
    label: "Host",
    description:
      "Enter a resolvable hostname or IP address without a path.",
    placeholder: "example.com",
    examples: ["example.com", "203.0.113.10"],
    validator: "host",
    required: true,
    ...overrides,
  };
}

function portField(overrides = {}) {
  return {
    label: "Port",
    description:
      "Use the numeric TCP or UDP port that the service listens on.",
    placeholder: "443",
    examples: ["80", "443", "27017"],
    validator: "port",
    required: true,
    ...overrides,
  };
}

function portRangeField(overrides = {}) {
  return {
    label: "Port or Range",
    description:
      "Scan a single port, a contiguous range, or the built-in common list.",
    placeholder: "80, 80-443, or common",
    examples: ["443", "80-1024", "common"],
    validator: "portRange",
    required: true,
    ...overrides,
  };
}

function textField(label, overrides = {}) {
  return {
    label,
    description: overrides.description || "Provide the value requested by this tool.",
    placeholder: overrides.placeholder || "",
    examples: overrides.examples || [],
    validator: overrides.validator || "text",
    required: overrides.required ?? false,
    ...overrides,
  };
}

function buildChecklist(primaryFieldKey, targetLabel) {
  return [
    {
      label: `Confirm you are authorized to test this ${targetLabel}.`,
      fieldKey: null,
      advisory: true,
    },
    {
      label: `Provide a valid ${targetLabel} value before running the scan.`,
      fieldKey: primaryFieldKey,
    },
    {
      label: "Review any validation warnings before starting a long or expensive scan.",
      fieldKey: null,
      advisory: true,
    },
  ];
}

function buildTool(slug, config) {
  return {
    slug,
    title: config.title,
    summary: config.summary,
    category: config.category || "security",
    panelIntro:
      config.panelIntro ||
      "Use this in-platform guide to prepare clean inputs, avoid common mistakes, and troubleshoot failures quickly.",
    fields: config.fields,
    checklist: config.checklist || [],
    commonMistakes: config.commonMistakes || [],
    bestPractices: config.bestPractices || [],
    troubleshooting: config.troubleshooting || [],
  };
}

export const securityToolGuidanceRegistry = {
  firewallDashboard: buildTool("firewallDashboard", {
    title: "WAF Scanner Guidance",
    summary:
      "Validate the public website URL and use the exact host fronted by the WAF so detection results are meaningful.",
    fields: {
      url: urlField({
        label: "Website URL",
        selectors: ['input[type="url"]', 'input[placeholder*="Enter URL"]'],
      }),
    },
    checklist: buildChecklist("url", "website URL"),
    commonMistakes: [
      "Testing a login path behind a different hostname than the production edge.",
      "Using an internal URL that bypasses the WAF entirely.",
    ],
    bestPractices: [
      "Scan the same public hostname your clients use so the WAF fingerprint is accurate.",
    ],
    troubleshooting: [
      {
        keywords: ["ownership", "verify ownership"],
        title: "Ownership verification blocked the scan",
        body: "Complete ownership verification for the same root domain before running protected web scans.",
      },
    ],
  }),
  "vuln-scanner": buildTool("vuln-scanner", {
    title: "Vulnerability Scanner Guidance",
    summary:
      "Point the scanner at the exact web origin you want assessed and expect the broadest coverage when the target is reachable over HTTPS.",
    fields: {
      url: urlField({
        selectors: ['input[placeholder="https://example.com"]'],
      }),
    },
    checklist: buildChecklist("url", "website URL"),
    commonMistakes: [
      "Scanning the marketing home page when the vulnerable flow actually lives on a subdomain or API route.",
    ],
    bestPractices: [
      "Start with a stable public URL and then review the resulting findings before moving to narrower paths.",
    ],
  }),
  "Source-Code": buildTool("Source-Code", {
    title: "Source Code Analyzer Guidance",
    summary:
      "Provide either pasted code or an uploaded source file so the analyzer can inspect injection and unsafe output handling.",
    fields: {
      code: codeField({
        selectors: ['textarea[placeholder*="Paste your HTML"]'],
        atLeastOneOf: ["file"],
      }),
      file: fileField({
        selectors: ['input[type="file"]'],
        atLeastOneOf: ["code"],
      }),
    },
    checklist: [
      {
        label: "Provide either pasted code or an uploaded file.",
        fieldKey: "code",
      },
      {
        label: "Include the complete request or rendering flow when testing injection issues.",
        advisory: true,
      },
    ],
    commonMistakes: [
      "Uploading compiled bundles instead of readable source code.",
      "Scanning only the template without the controller or handler logic.",
    ],
    bestPractices: [
      "Mask real secrets before exporting or sharing scan results.",
    ],
  }),
  codeAnalysis: buildTool("codeAnalysis", {
    title: "JavaScript Security Analyzer Guidance",
    summary:
      "Choose the closest language mode, then paste the full code path that handles user-controlled data.",
    fields: {
      language: textField("Language", {
        selectors: ['select'],
        required: true,
        description:
          "Match the parser mode to the syntax you are scanning so issues are classified accurately.",
        validMessage: "Language mode selected.",
      }),
      code: codeField({
        selectors: ['textarea[placeholder*="Paste/Examples"]'],
      }),
    },
    checklist: [
      {
        label: "Select the parser mode that matches the source code.",
        fieldKey: "language",
      },
      {
        label: "Paste the full vulnerable flow, not just one line.",
        fieldKey: "code",
      },
    ],
  }),
  subdomainEnumeration: buildTool("subdomainEnumeration", {
    title: "Subdomain Enumeration Guidance",
    summary:
      "Use the root domain when you want broad coverage and avoid adding protocol prefixes in this field.",
    fields: {
      domain: domainField({
        selectors: ['input[placeholder*="example.com"]'],
      }),
    },
    checklist: buildChecklist("domain", "domain"),
  }),
  webrecon: buildTool("webrecon", {
    title: "Website Recon Guidance",
    summary:
      "Use DNS lookup for quick checks and the deep scan when you want WHOIS, SSL, headers, and service-enumeration context.",
    fields: {
      domain: domainField({
        selectors: ['input[placeholder*="Enter domain"]'],
      }),
      recordType: textField("Record Type", {
        selectors: ['select'],
        required: true,
        description:
          "Pick the DNS record family you want to resolve in the quick lookup panel.",
        validMessage: "Record type selected.",
      }),
    },
    checklist: [
      {
        label: "Use a domain, not a full URL, in the recon lookup field.",
        fieldKey: "domain",
      },
      {
        label: "Pick the record type that matches your question before running a DNS lookup.",
        fieldKey: "recordType",
      },
    ],
  }),
  fingerPrint: buildTool("fingerPrint", {
    title: "Technology Fingerprinter Guidance",
    summary:
      "Use a public web URL that serves the real application so framework and third-party detections are representative.",
    fields: {
      url: urlField({
        selectors: ['input[placeholder="https://example.com"]'],
      }),
    },
    checklist: buildChecklist("url", "website URL"),
  }),
  bruteForce: buildTool("bruteForce", {
    title: "Directory Brute Forcer Guidance",
    summary:
      "Use only on targets you are authorized to probe. Recursive scans produce deeper coverage but significantly more requests.",
    fields: {
      target: urlField({
        label: "Target URL",
        selectors: ['input[placeholder="https://example.com"]'],
      }),
      recursive: textField("Recursive Scan", {
        selectors: ['input[type="checkbox"]'],
        required: false,
        description:
          "Recursive mode follows discovered paths and increases scan depth and runtime.",
        validMessage: "Recursive mode preference captured.",
      }),
    },
    checklist: buildChecklist("target", "target URL"),
    commonMistakes: [
      "Starting recursive scans against large sites without understanding the request volume.",
    ],
    bestPractices: [
      "Prefer a scoped staging target or a small path list for initial testing.",
    ],
  }),
  mochaForm: buildTool("mochaForm", {
    title: "Mocha API Testing Guidance",
    summary:
      "Define a clean endpoint, valid JSON where applicable, and a realistic timeout so the API test reflects real request behavior.",
    fields: {
      endpoint: urlField({
        label: "API Endpoint URL",
        selectors: ['input[placeholder="https://example.com"]'],
      }),
      method: textField("Request Method", {
        selectors: ['select'],
        required: true,
        description:
          "Choose the HTTP method that matches the operation you want to test.",
        validMessage: "HTTP method selected.",
      }),
      testDescription: textField("Test Description", {
        selectors: ['input[placeholder*="Describe what this test should do"]'],
        required: false,
        emptyMessage:
          "A short description helps keep exported results and test intent clear.",
      }),
      headers: jsonField("Headers", {
        selectors: ['textarea[placeholder*="Authorization"]'],
        validator: "headersJson",
        optionalEmptyMessage:
          "Leave headers empty unless the endpoint requires auth or custom request metadata.",
      }),
      body: jsonField("Request Body", {
        selectors: ['textarea[placeholder*="john@example.com"]'],
        optionalEmptyMessage:
          "GET requests usually do not need a body. Add JSON only for write operations.",
      }),
      timeoutMs: timeoutField({
        selectors: ['input[type="number"]'],
      }),
    },
    checklist: [
      {
        label: "Provide a valid API endpoint URL.",
        fieldKey: "endpoint",
      },
      {
        label: "Validate JSON headers or body before submitting.",
        fieldKey: "headers",
      },
      {
        label: "Use a timeout that reflects normal API latency.",
        fieldKey: "timeoutMs",
      },
    ],
  }),
  wordpressForm: buildTool("wordpressForm", {
    title: "WordPress Scanner Guidance",
    summary:
      "Point the scanner at the live WordPress site root so version, theme, and plugin checks map to the correct deployment.",
    fields: {
      url: urlField({
        label: "WordPress Site URL",
        selectors: ['input[placeholder="https://example.com"]'],
      }),
    },
    checklist: buildChecklist("url", "WordPress site URL"),
  }),
  apiForm: buildTool("apiForm", {
    title: "API Security Tester Guidance",
    summary:
      "Use a public API endpoint, valid JSON structures, and the minimum headers needed to reproduce the request securely.",
    fields: {
      url: urlField({
        label: "API Endpoint URL",
        selectors: ['input[name="url"]'],
      }),
      method: textField("HTTP Method", {
        selectors: ['select[name="method"]'],
        required: true,
        description:
          "Choose the request method that matches the endpoint behavior you want to inspect.",
        validMessage: "HTTP method selected.",
      }),
      headers: jsonField("Request Headers", {
        selectors: ['textarea[name="headers"]'],
        validator: "headersJson",
      }),
      body: jsonField("Request Body", {
        selectors: ['textarea[name="body"]'],
      }),
      timeout: timeoutField({
        label: "Timeout",
        selectors: ['input[name="timeout"]'],
      }),
    },
    checklist: [
      { label: "Use a valid endpoint URL.", fieldKey: "url" },
      {
        label: "Validate JSON headers before sending requests.",
        fieldKey: "headers",
      },
      {
        label: "Validate JSON body when testing non-GET operations.",
        fieldKey: "body",
      },
    ],
  }),
  portScannerForm: buildTool("portScannerForm", {
    title: "Port Scanner Guidance",
    summary:
      "Use a resolvable host and a realistic port scope so the scan finishes quickly and reports actionable exposure.",
    fields: {
      host: hostField({
        selectors: ['input[placeholder*="example.com or 192.168.1.1"]'],
      }),
      portInput: portRangeField({
        selectors: ['input[placeholder*="80-10000"]'],
      }),
      filter: textField("Port Filter", {
        selectors: ['select'],
        required: true,
        description:
          "Filter the result set to open, closed, or all scanned ports.",
        validMessage: "Result filter selected.",
      }),
    },
    checklist: [
      {
        label: "Provide a valid host or IP address.",
        fieldKey: "host",
      },
      {
        label: "Use a valid port, range, or the keyword common.",
        fieldKey: "portInput",
      },
    ],
  }),
  clickjackingTester: buildTool("clickjackingTester", {
    title: "Clickjacking Tester Guidance",
    summary:
      "Scan the public page that should resist iframe embedding so the headers you inspect match the real browser experience.",
    fields: {
      url: urlField({
        selectors: ['input[placeholder*="https://example.com"]'],
      }),
    },
    checklist: buildChecklist("url", "page URL"),
  }),
  csrfChecker: buildTool("csrfChecker", {
    title: "CSRF Analyzer Guidance",
    summary:
      "Paste or upload the request-handling code that contains forms, cookie handling, or CSRF token validation logic.",
    fields: {
      code: codeField({
        selectors: ['textarea[placeholder*="Paste your HTML"]'],
        atLeastOneOf: ["file"],
      }),
      file: fileField({
        selectors: ['input[type="file"]'],
        atLeastOneOf: ["code"],
      }),
    },
    checklist: [
      {
        label: "Provide code or upload a supported source file.",
        fieldKey: "code",
      },
      {
        label: "Include token generation, cookie handling, and validation paths when possible.",
        advisory: true,
      },
    ],
  }),
  httpsCheckerForm: buildTool("httpsCheckerForm", {
    title: "HTTPS Security Checker Guidance",
    summary:
      "Use a domain name without protocol prefixes so the tool can test redirect behavior and header enforcement cleanly.",
    fields: {
      domain: domainField({
        selectors: ['input[placeholder*="Enter domain"]'],
      }),
    },
    checklist: buildChecklist("domain", "domain"),
  }),
  JWTSignatureValidator: buildTool("JWTSignatureValidator", {
    title: "JWT Signature Validator Guidance",
    summary:
      "Paste the complete JWT, choose the correct algorithm, and provide the matching secret or PEM key material.",
    fields: {
      token: tokenField({
        label: "JWT Token",
        selectors: ['textarea[placeholder*="Paste your JWT Token"]'],
      }),
      algorithm: textField("Algorithm", {
        selectors: ['select'],
        required: true,
        description:
          "Pick the signing algorithm that matches the issuer configuration when auto-detection is not enough.",
        validMessage: "Algorithm selected.",
      }),
      secret: textField("Secret or Public Key", {
        selectors: [
          'input[placeholder*="HMAC secret"]',
          'textarea[placeholder*="BEGIN PUBLIC KEY"]',
        ],
        validator: "pemOrSecret",
        required: true,
        description:
          "Use the HMAC secret for HS* tokens or the PEM public key for RS*/ES* validation.",
      }),
    },
    checklist: [
      { label: "Paste the full JWT value.", fieldKey: "token" },
      {
        label: "Choose the correct algorithm and matching secret or key.",
        fieldKey: "secret",
      },
    ],
  }),
  OAuthTokenInspector: buildTool("OAuthTokenInspector", {
    title: "OAuth Token Inspector Guidance",
    summary:
      "Paste the raw token so the inspector can decode claims, expiry, and security issues without extra formatting noise.",
    fields: {
      token: tokenField({
        selectors: ['textarea[placeholder*="eyJhbGciOiJIUzI1Ni"]'],
      }),
    },
    checklist: [
      { label: "Paste the full token value.", fieldKey: "token" },
      {
        label: "Use a non-production token whenever possible.",
        advisory: true,
      },
    ],
  }),
  obfuscationChecker: buildTool("obfuscationChecker", {
    title: "Obfuscation Checker Guidance",
    summary:
      "Paste suspicious code or upload one or more source files so the checker can score obfuscation intensity and decode obvious patterns.",
    fields: {
      code: codeField({
        selectors: ['textarea[placeholder*="gsvdahcdswdmjsnxzcvb"]'],
        atLeastOneOf: ["file"],
      }),
      file: fileField({
        selectors: ['input[type="file"]'],
        atLeastOneOf: ["code"],
      }),
    },
    checklist: [
      {
        label: "Provide code or upload one or more source files.",
        fieldKey: "code",
      },
    ],
  }),
  openRedirectTester: buildTool("openRedirectTester", {
    title: "Open Redirect Tester Guidance",
    summary:
      "Use a redirect-capable URL and test the parameter names that the application actually honors.",
    fields: {
      url: urlField({
        label: "URL to Test",
        selectors: ['input[id="url"]'],
      }),
      paramName: textField("Redirect Parameter Name", {
        selectors: ['input[id="paramName"]'],
        required: false,
        description:
          "Use the exact parameter the application reads when you disable auto-scan mode.",
        emptyMessage:
          "Manual parameter mode is optional when you are already auto-scanning common redirect keys.",
      }),
      params: textField("Parameter Names to Scan", {
        selectors: ['input[id="params"]'],
        required: false,
        description:
          "Comma-separated list of candidate redirect parameters to brute-force in auto-scan mode.",
      }),
    },
    checklist: [
      { label: "Use a valid target URL.", fieldKey: "url" },
      {
        label: "Review which parameter names the application uses for redirection.",
        advisory: true,
      },
    ],
  }),
  regexDetector: buildTool("regexDetector", {
    title: "Regex Injection Detector Guidance",
    summary:
      "Paste the regex-using code or upload a source file so the analyzer can find unsafe dynamic expressions and suggest escaping.",
    fields: {
      code: codeField({
        selectors: ['textarea[placeholder*="Paste your JavaScript code here"]'],
        atLeastOneOf: ["file"],
      }),
      file: fileField({
        selectors: ['input[type="file"]'],
        atLeastOneOf: ["code"],
      }),
    },
    checklist: [
      {
        label: "Provide code or upload a supported source file.",
        fieldKey: "code",
      },
    ],
  }),
  reverseDNSLookup: buildTool("reverseDNSLookup", {
    title: "Reverse DNS Guidance",
    summary:
      "Use a public IP address so the tool can perform PTR, geolocation, ASN, and blacklist lookups against the correct host.",
    fields: {
      ip: ipField({
        selectors: ['input[placeholder*="8.8.8.8"]'],
      }),
    },
    checklist: buildChecklist("ip", "IP address"),
  }),
  secretKeyScanner: buildTool("secretKeyScanner", {
    title: "Secret Key Scanner Guidance",
    summary:
      "Scan source code or configuration text for exposed credentials, and only enable online validation when you control the keys being tested.",
    fields: {
      file: fileField({
        selectors: ['input[type="file"]'],
        atLeastOneOf: ["code"],
      }),
      code: codeField({
        selectors: ['textarea[placeholder*="Paste your code"]'],
        atLeastOneOf: ["file"],
      }),
      validateOnline: textField("Online Validation", {
        selectors: ['input[type="checkbox"]'],
        required: false,
        description:
          "Online validation may send key material to provider endpoints. Use it only on assets you own and are authorized to test.",
      }),
    },
    checklist: [
      {
        label: "Provide code or upload a text-based source file.",
        fieldKey: "code",
      },
      {
        label: "Enable online validation only for keys you are allowed to test externally.",
        advisory: true,
      },
    ],
  }),
  sessionFixationChecker: buildTool("sessionFixationChecker", {
    title: "Session Fixation Guidance",
    summary:
      "Paste the server-side login or session code path, or upload a source file that contains session creation and regeneration logic.",
    fields: {
      code: codeField({
        selectors: ['textarea[placeholder*="Paste your login / session code"]'],
        atLeastOneOf: ["file"],
      }),
      file: fileField({
        selectors: ['input[type="file"]'],
        atLeastOneOf: ["code"],
      }),
    },
    checklist: [
      {
        label: "Provide code or upload a source file for analysis.",
        fieldKey: "code",
      },
      {
        label: "Include login, privilege-escalation, and logout handling when possible.",
        advisory: true,
      },
    ],
  }),
  whoisLookup: buildTool("whoisLookup", {
    title: "WHOIS Lookup Guidance",
    summary:
      "Use a domain name only. WHOIS is most useful when you want registrar, age, or status context around an internet-facing asset.",
    fields: {
      domain: domainField({
        selectors: ['input[placeholder="example.com"]'],
      }),
    },
    checklist: buildChecklist("domain", "domain"),
  }),
  xssTester: buildTool("xssTester", {
    title: "XSS Tester Guidance",
    summary:
      "Use the exact URL and parameter that reflect user input, then choose either one custom payload or a curated payload list.",
    fields: {
      url: urlField({
        label: "Target URL",
        selectors: ['input[placeholder*="Target URL"]'],
      }),
      param: textField("Parameter Name", {
        selectors: ['input[placeholder*="Parameter name"]'],
        required: true,
        description:
          "Specify the query or body parameter that the target page reads from user input.",
        examples: ["q", "search", "redirect"],
      }),
      payloads: textField("Payload List", {
        selectors: [
          'textarea[placeholder="One payload per line"]',
          'textarea[placeholder="Single payload"]',
        ],
        required: true,
        description:
          "Use a payload list for breadth or a single custom payload when you are narrowing down one reflection context.",
      }),
    },
    checklist: [
      { label: "Provide a valid target URL.", fieldKey: "url" },
      {
        label: "Use the parameter name that actually reaches the vulnerable sink.",
        fieldKey: "param",
      },
    ],
  }),
  "nexpose-scan": buildTool("nexpose-scan", {
    title: "SQLi Scanner Guidance",
    summary:
      "Use a testable URL with a clearly injectable parameter and remember that unreachable or rate-limited targets can reduce confidence.",
    fields: {
      url: urlField({
        label: "Target URL",
        selectors: ['input[placeholder="https://example.com"]'],
      }),
    },
    checklist: buildChecklist("url", "target URL"),
    commonMistakes: [
      "Pointing the scan at a static page with no parameterized input at all.",
    ],
  }),
  "mdr-monitor": buildTool("mdr-monitor", {
    title: "MDR Monitor Guidance",
    summary:
      "Use a reachable public website URL so the monitor can assess the same surface your users or sensors encounter.",
    fields: {
      url: urlField({
        selectors: ['input[placeholder*="Enter website URL"]'],
      }),
    },
    checklist: buildChecklist("url", "website URL"),
  }),
  DbSecurityChecker: buildTool("DbSecurityChecker", {
    title: "Database Security Checker Guidance",
    summary:
      "Use the real database network coordinates and enable only the checks that make sense for the service you are evaluating.",
    fields: {
      dbType: textField("Database Type", {
        selectors: ['select'],
        required: true,
        description:
          "Pick the database family so the scanner applies the right assumptions and checks.",
        validMessage: "Database type selected.",
      }),
      host: hostField({
        selectors: ['input[value="127.0.0.1"]'],
        label: "Host / IP",
      }),
      port: portField({
        selectors: ['input[value="27017"]'],
      }),
      username: textField("Username", {
        selectors: ['input[type="text"]:not([placeholder])'],
        required: false,
        description:
          "Optional username used for authenticated checks when the environment allows it.",
      }),
      password: textField("Password", {
        selectors: ['input[type="password"]'],
        required: false,
        description:
          "Only use credentials you are authorized to test. Password fields are never required for a basic reachability check.",
      }),
    },
    checklist: [
      { label: "Select the correct database type.", fieldKey: "dbType" },
      {
        label: "Use the host and port that the database actually listens on.",
        fieldKey: "host",
      },
    ],
  }),
  "domain-to-ip": buildTool("domain-to-ip", {
    title: "Domain to IP Guidance",
    summary:
      "Use a hostname only so the resolver can return the IP address mapped to that domain.",
    fields: {
      domain: domainField({
        selectors: ['input[placeholder="Enter domain"]'],
      }),
    },
    checklist: buildChecklist("domain", "domain"),
  }),
  "Data-Leak": buildTool("Data-Leak", {
    title: "Data Leak Guidance",
    summary:
      "Use sanitized identifiers or authorized test data when searching for leaked assets or exposure records.",
    fields: {
      identifier: textField("Identifier", {
        selectors: [],
        required: true,
        description:
          "Use the email, username, or other identifier that the data leak workflow expects.",
      }),
    },
    checklist: [
      {
        label: "Use only identifiers you are authorized to search for.",
        advisory: true,
      },
    ],
  }),
};

export function getSecurityToolGuidance(slug) {
  return securityToolGuidanceRegistry[slug] || null;
}

export function isSecurityToolGuided(slug) {
  return Boolean(getSecurityToolGuidance(slug));
}

export function getTroubleshootingMatches(tool, errorText = "") {
  if (!tool || !errorText) return [];
  const normalized = String(errorText).toLowerCase();
  return (tool.troubleshooting || []).filter((item) =>
    (item.keywords || []).some((keyword) => normalized.includes(keyword))
  );
}
