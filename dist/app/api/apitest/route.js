"use strict";

function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (c = i[4] || 3, u = i[5] === e ? i[3] : i[5], i[4] = 3, i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { if (r) i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n;else { var o = function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); }; o("next", 0), o("throw", 1), o("return", 2); } }, _regeneratorDefine2(e, r, n, t); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
var express = require("express");
var axios = require("axios");
var app = express();
var rateLimit = require("express-rate-limit");
var helmet = require("helmet");

// Apply basic security middleware
app.use(helmet());
app.use(express.json({
  limit: '1mb'
}));

// Rate limiting to prevent abuse
var apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  // 15 minutes
  max: 100,
  // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false
});
app.use(apiLimiter);

// Function to test API security aspects
var testAPI = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(url, method, headers, body) {
    var options,
      testHeaders,
      response,
      _args = arguments,
      _t;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.n) {
        case 0:
          options = _args.length > 4 && _args[4] !== undefined ? _args[4] : {};
          _context.p = 1;
          if (isValidUrl(url)) {
            _context.n = 2;
            break;
          }
          return _context.a(2, {
            error: "Invalid URL format"
          });
        case 2:
          // Add default headers for testing if not provided
          testHeaders = _objectSpread({
            "User-Agent": "API-Security-Tester/1.0"
          }, headers);
          _context.n = 3;
          return axios({
            method: method,
            url: url,
            headers: testHeaders,
            data: body,
            timeout: options.timeout || 5000,
            // Prevent long wait times
            validateStatus: function validateStatus() {
              return true;
            } // Don't throw on any status code
          });
        case 3:
          response = _context.v;
          return _context.a(2, {
            status: response.status,
            statusText: response.statusText,
            responseTime: response.headers['x-response-time'] || 'Not provided',
            securityScorecard: calculateSecurityScore(response),
            securityChecks: {
              authentication: analyzeAuthentication(headers, response),
              sensitiveDataExposure: checkSensitiveData(response.data),
              headerSecurity: checkSecurityHeaders(response.headers),
              injectionVulnerability: checkForInjectionVulnerability(response),
              cors: analyzeCorsPolicy(response.headers),
              ssl: analyzeSSL(url, response)
            },
            recommendations: generateRecommendations(response, headers)
          });
        case 4:
          _context.p = 4;
          _t = _context.v;
          console.error("Error testing API ".concat(url, ":"), _t.message);
          return _context.a(2, {
            error: _t.message,
            errorType: _t.code || _t.name,
            recommendations: ["Ensure the API endpoint is accessible and correct", "Check network connectivity", _t.code === 'ECONNREFUSED' ? "The server may be down or blocking requests" : null, _t.code === 'ETIMEDOUT' ? "Consider increasing the timeout value" : null].filter(Boolean)
          });
      }
    }, _callee, null, [[1, 4]]);
  }));
  return function testAPI(_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
}();

// Validate URL format
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Calculate overall security score based on findings
function calculateSecurityScore(response) {
  var score = 100;
  var headers = response.headers;

  // Deduct points for missing security headers
  if (!headers["content-security-policy"]) score -= 10;
  if (!headers["x-content-type-options"]) score -= 5;
  if (!headers["x-frame-options"]) score -= 5;
  if (!headers["strict-transport-security"]) score -= 10;

  // Deduct points for questionable CORS settings
  if (headers["access-control-allow-origin"] === "*") score -= 8;

  // HTTP instead of HTTPS
  if (response.config.url.startsWith("http://")) score -= 20;

  // Potential sensitive data exposure
  if (JSON.stringify(response.data).match(/(password|token|secret|key|credential)/i)) score -= 15;

  // Status code issues
  if (response.status === 500) score -= 5; // Internal server error

  return {
    score: Math.max(0, score),
    rating: score > 90 ? "Excellent" : score > 70 ? "Good" : score > 50 ? "Fair" : "Poor"
  };
}

// Function to analyze authentication
function analyzeAuthentication(requestHeaders, response) {
  var authHeader = requestHeaders.Authorization || requestHeaders.authorization;

  // Check for common auth headers
  if (authHeader) {
    if (authHeader.startsWith("Bearer ")) {
      return {
        status: "JWT/Bearer Token Present",
        secure: authHeader.startsWith("Bearer ey") ? "Valid JWT format" : "Suspicious token format"
      };
    } else if (authHeader.startsWith("Basic ")) {
      return {
        status: "Basic Auth Present",
        secure: "Warning: Basic Auth transmits credentials in base64 encoding (not encrypted)"
      };
    } else {
      return {
        status: "Custom Auth Present",
        secure: "Unknown authentication scheme"
      };
    }
  }

  // Check for API key in headers or query
  var potentialApiKeys = Object.keys(requestHeaders).filter(function (key) {
    return key.toLowerCase().includes('api-key') || key.toLowerCase().includes('apikey') || key.toLowerCase().includes('x-api-key');
  });
  if (potentialApiKeys.length > 0) {
    return {
      status: "API Key Present",
      secure: "API keys should be kept secure and rotated regularly"
    };
  }

  // Check for auth-related cookies
  var cookies = requestHeaders.cookie || '';
  if (cookies.includes('session') || cookies.includes('token') || cookies.includes('auth')) {
    return {
      status: "Cookie-based Auth Present",
      secure: "Ensure cookies use HttpOnly and Secure flags"
    };
  }

  // No auth detected
  return {
    status: "No Authentication Detected",
    secure: response.status === 401 ? "API correctly returns 401 Unauthorized" : "API allows unauthenticated access"
  };
}

// Function to check security headers
function checkSecurityHeaders(headers) {
  return {
    CORS: analyzeCorsPolicy(headers),
    ContentSecurityPolicy: headers["content-security-policy"] ? {
      status: "Enabled",
      value: summarizeCSP(headers["content-security-policy"])
    } : {
      status: "Missing",
      recommendation: "Implement Content-Security-Policy"
    },
    XFrameOptions: headers["x-frame-options"] ? {
      status: "Configured",
      value: headers["x-frame-options"]
    } : {
      status: "Not Configured",
      recommendation: "Set X-Frame-Options to DENY or SAMEORIGIN"
    },
    StrictTransportSecurity: headers["strict-transport-security"] ? {
      status: "Enabled",
      value: headers["strict-transport-security"]
    } : {
      status: "Missing",
      recommendation: "Implement HSTS"
    },
    XContentTypeOptions: headers["x-content-type-options"] ? {
      status: "Configured",
      value: headers["x-content-type-options"]
    } : {
      status: "Missing",
      recommendation: "Set X-Content-Type-Options to nosniff"
    },
    ReferrerPolicy: headers["referrer-policy"] ? {
      status: "Configured",
      value: headers["referrer-policy"]
    } : {
      status: "Missing",
      recommendation: "Consider setting a Referrer-Policy"
    },
    PermissionsPolicy: headers["permissions-policy"] ? {
      status: "Configured"
    } : {
      status: "Missing",
      recommendation: "Consider implementing Permissions-Policy"
    }
  };
}

// Function to detect sensitive data exposure
function checkSensitiveData(data) {
  // Deeper regex patterns for common sensitive information
  var regexPatterns = {
    password: /\b(?:password|passwd|pwd)\b\s*[=:]\s*["']?[^"'\s]+["']?/i,
    token: /\b(?:token|auth_token|access_token|jwt)\b\s*[=:]\s*["']?[A-Za-z0-9._-]+["']?/i,
    secret: /\b(?:secret|api_secret|client_secret)\b\s*[=:]\s*["']?[^"'\s]+["']?/i,
    key: /\b(?:key|api_key|apikey|private_key)\b\s*[=:]\s*["']?[^"'\s]+["']?/i,
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
    ssn: /\b\d{3}-?\d{2}-?\d{4}\b/,
    creditCard: /\b(?:\d{4}[- ]?){3}\d{4}\b/,
    ipAddress: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/
  };

  // Convert data to string for analysis
  var dataString = _typeof(data) === 'object' ? JSON.stringify(data) : String(data);
  var findings = {};
  var exposureDetected = false;

  // Check each pattern
  for (var _i = 0, _Object$entries = Object.entries(regexPatterns); _i < _Object$entries.length; _i++) {
    var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
      key = _Object$entries$_i[0],
      regex = _Object$entries$_i[1];
    var matches = dataString.match(regex);
    if (matches) {
      exposureDetected = true;
      findings[key] = matches.length === 1 ? "Potential exposure detected" : "Multiple exposures detected (".concat(matches.length, ")");
    }
  }
  return {
    status: exposureDetected ? "Potential Data Exposure" : "No obvious data exposure",
    details: exposureDetected ? findings : "No sensitive data patterns detected in response",
    recommendation: exposureDetected ? "Review and secure the exposed data in responses" : ""
  };
}

// Check for potential injection vulnerabilities
function checkForInjectionVulnerability(response) {
  var responseData = _typeof(response.data) === 'object' ? JSON.stringify(response.data) : String(response.data);

  // Check for error messages that might indicate injection vulnerabilities
  var sqlErrorPatterns = [/SQL syntax/i, /ORA-\d{5}/i,
  // Oracle errors
  /SQLSTATE\[\d+/i, /mysqli?_/i, /PDOException/i, /DB2 SQL error/i, /syntax error at or near/i // PostgreSQL
  ];
  var noSqlErrorPatterns = [/MongoDB.*?Error/i, /CouchDB.*?Error/i, /TypeError.*?Cannot read property/i];
  var stackTracePatterns = [/at .* \(.*:\d+:\d+\)/i, /File ".*", line \d+/i, /on line \d+/i];
  var findings = {};

  // Check for SQL injection clues
  for (var _i2 = 0, _sqlErrorPatterns = sqlErrorPatterns; _i2 < _sqlErrorPatterns.length; _i2++) {
    var pattern = _sqlErrorPatterns[_i2];
    if (pattern.test(responseData)) {
      findings.sqlInjection = "Potential SQL error disclosure detected";
      break;
    }
  }

  // Check for NoSQL injection clues
  for (var _i3 = 0, _noSqlErrorPatterns = noSqlErrorPatterns; _i3 < _noSqlErrorPatterns.length; _i3++) {
    var _pattern = _noSqlErrorPatterns[_i3];
    if (_pattern.test(responseData)) {
      findings.noSqlInjection = "Potential NoSQL error disclosure detected";
      break;
    }
  }

  // Check for stack traces
  for (var _i4 = 0, _stackTracePatterns = stackTracePatterns; _i4 < _stackTracePatterns.length; _i4++) {
    var _pattern2 = _stackTracePatterns[_i4];
    if (_pattern2.test(responseData)) {
      findings.stackTrace = "Potential stack trace disclosure detected";
      break;
    }
  }

  // Check for common error disclosure patterns
  if (/exception|error|failure|warning|debug/i.test(responseData)) {
    findings.errorDisclosure = "General error information disclosure detected";
  }
  var vulnerabilityDetected = Object.keys(findings).length > 0;
  return {
    status: vulnerabilityDetected ? "Potential Vulnerabilities Detected" : "No obvious vulnerabilities",
    details: vulnerabilityDetected ? findings : "No common error patterns detected in response",
    recommendation: vulnerabilityDetected ? "Review error handling and ensure detailed errors are not exposed to clients" : ""
  };
}

// Analyze CORS policy
function analyzeCorsPolicy(headers) {
  var corsHeaders = {
    allowOrigin: headers["access-control-allow-origin"],
    allowMethods: headers["access-control-allow-methods"],
    allowHeaders: headers["access-control-allow-headers"],
    allowCredentials: headers["access-control-allow-credentials"],
    exposeHeaders: headers["access-control-expose-headers"],
    maxAge: headers["access-control-max-age"]
  };

  // Filter out undefined values
  var activeCorsHeaders = Object.fromEntries(Object.entries(corsHeaders).filter(function (_ref2) {
    var _ref3 = _slicedToArray(_ref2, 2),
      _ = _ref3[0],
      v = _ref3[1];
    return v !== undefined;
  }));
  var corsStatus = "Not Configured";
  var recommendation = "";
  if (Object.keys(activeCorsHeaders).length > 0) {
    corsStatus = "Configured";

    // Check for overly permissive settings
    if (corsHeaders.allowOrigin === "*") {
      recommendation = "Warning: Wildcard origin (*) allows any site to make requests";
    } else if (corsHeaders.allowOrigin && !corsHeaders.allowOrigin.startsWith("https://")) {
      recommendation = "Consider restricting CORS to secure origins (https://)";
    }
    if (corsHeaders.allowCredentials === "true" && corsHeaders.allowOrigin === "*") {
      recommendation += "\nUnsafe configuration: allowCredentials with wildcard origin";
    }
  } else {
    recommendation = "CORS is not configured, which may be intentional for non-browser APIs";
  }
  return {
    status: corsStatus,
    details: Object.keys(activeCorsHeaders).length > 0 ? activeCorsHeaders : "No CORS headers found",
    recommendation: recommendation
  };
}

// Analyze SSL/TLS configuration
function analyzeSSL(url, response) {
  var isHttps = url.startsWith("https://");
  if (!isHttps) {
    return {
      status: "Insecure",
      details: "Connection is not using HTTPS",
      recommendation: "Implement HTTPS with a valid SSL/TLS certificate"
    };
  }

  // Check HSTS header
  var hstsHeader = response.headers["strict-transport-security"];
  return {
    status: "Secure",
    details: "Connection is using HTTPS",
    hstsStatus: hstsHeader ? "HSTS Implemented" : "HSTS Not Implemented",
    recommendation: !hstsHeader ? "Consider implementing HSTS (Strict-Transport-Security header)" : ""
  };
}

// Summarize CSP for readability
function summarizeCSP(cspHeader) {
  if (!cspHeader) return "Not provided";

  // If CSP is very long, provide a summary
  if (cspHeader.length > 100) {
    var directives = cspHeader.split(';').length;
    return "".concat(directives, " directives configured (").concat(cspHeader.substring(0, 50), "...)");
  }
  return cspHeader;
}

// Generate actionable recommendations
function generateRecommendations(response, requestHeaders) {
  var recommendations = [];
  var headers = response.headers;

  // Authentication recommendations
  if (!requestHeaders.Authorization && !requestHeaders.authorization) {
    recommendations.push("Implement authentication for API endpoints with sensitive operations");
  }

  // Security header recommendations
  if (!headers["content-security-policy"]) {
    recommendations.push("Implement Content-Security-Policy header");
  }
  if (!headers["x-frame-options"]) {
    recommendations.push("Set X-Frame-Options header to DENY or SAMEORIGIN");
  }
  if (!headers["strict-transport-security"]) {
    recommendations.push("Implement HTTP Strict Transport Security (HSTS)");
  }
  if (!headers["x-content-type-options"]) {
    recommendations.push("Set X-Content-Type-Options header to nosniff");
  }

  // CORS recommendations
  if (headers["access-control-allow-origin"] === "*") {
    recommendations.push("Avoid using wildcard (*) in Access-Control-Allow-Origin");
  }

  // HTTP vs HTTPS
  if (response.config.url.startsWith("http://")) {
    recommendations.push("Switch from HTTP to HTTPS for secure communication");
  }

  // Rate limiting recommendations
  if (!headers["x-ratelimit-limit"] && !headers["x-rate-limit-limit"]) {
    recommendations.push("Implement rate limiting to prevent abuse");
  }

  // Content type recommendations
  if (!headers["content-type"]) {
    recommendations.push("Specify Content-Type header in responses");
  }
  return recommendations;
}

// Create routes for API testing
app.post("/api/apitest", /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(req, res) {
    var _req$body, url, _req$body$method, method, _req$body$headers, headers, _req$body$body, body, _req$body$options, options, result, _t2;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.n) {
        case 0:
          _req$body = req.body, url = _req$body.url, _req$body$method = _req$body.method, method = _req$body$method === void 0 ? "GET" : _req$body$method, _req$body$headers = _req$body.headers, headers = _req$body$headers === void 0 ? {} : _req$body$headers, _req$body$body = _req$body.body, body = _req$body$body === void 0 ? {} : _req$body$body, _req$body$options = _req$body.options, options = _req$body$options === void 0 ? {} : _req$body$options;
          if (url) {
            _context2.n = 1;
            break;
          }
          return _context2.a(2, res.status(400).json({
            error: "API URL is required",
            example: {
              url: "https://api.example.com/endpoint",
              method: "GET",
              headers: {
                "Authorization": "Bearer token",
                "Content-Type": "application/json"
              },
              body: {
                key: "value"
              }
            }
          }));
        case 1:
          _context2.p = 1;
          _context2.n = 2;
          return testAPI(url, method, headers, body, options);
        case 2:
          result = _context2.v;
          res.json(result);
          _context2.n = 4;
          break;
        case 3:
          _context2.p = 3;
          _t2 = _context2.v;
          res.status(500).json({
            error: "An unexpected error occurred while processing your request",
            message: _t2.message
          });
        case 4:
          return _context2.a(2);
      }
    }, _callee2, null, [[1, 3]]);
  }));
  return function (_x5, _x6) {
    return _ref4.apply(this, arguments);
  };
}());

// Add a health check endpoint
app.get("/health", function (req, res) {
  res.json({
    status: "OK",
    uptime: process.uptime()
  });
});

// Add a simple documentation endpoint
app.get("/", function (req, res) {
  res.json({
    name: "API Security Tester",
    version: "1.0.0",
    endpoints: {
      "/api/apitest": {
        method: "POST",
        description: "Test the security of an API endpoint",
        body: {
          url: "Required - The API URL to test",
          method: "Optional - HTTP method (default: GET)",
          headers: "Optional - Request headers object",
          body: "Optional - Request body object",
          options: "Optional - Additional testing options"
        },
        example: {
          request: {
            url: "https://api.example.com/users",
            method: "POST",
            headers: {
              "Authorization": "Bearer YOUR_TOKEN",
              "Content-Type": "application/json"
            },
            body: {
              "username": "testuser"
            }
          }
        }
      },
      "/health": {
        method: "GET",
        description: "Health check endpoint"
      }
    }
  });
});

// Global error handler
app.use(function (err, req, res, next) {
  console.error("Global error:", err.stack);
  res.status(500).json({
    error: "Server Error",
    message: "Something went wrong while processing your request"
  });
});

// Start Server
var PORT = process.env.PORT || 5000;
app.listen(PORT, function () {
  return console.log("API Security Tester running on http://localhost:".concat(PORT));
});

// Export app for testing
module.exports = app;