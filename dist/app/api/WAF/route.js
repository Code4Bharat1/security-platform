"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GET = GET;
exports.POST = POST;
function _regeneratorValues(e) { if (null != e) { var t = e["function" == typeof Symbol && Symbol.iterator || "@@iterator"], r = 0; if (t) return t.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) return { next: function next() { return e && r >= e.length && (e = void 0), { value: e && e[r++], done: !e }; } }; } throw new TypeError(_typeof(e) + " is not iterable"); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (c = i[4] || 3, u = i[5] === e ? i[3] : i[5], i[4] = 3, i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { if (r) i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n;else { var o = function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); }; o("next", 0), o("throw", 1), o("return", 2); } }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
// Function to analyze WAF rules based on detected WAFs and headers
function analyzeWafRules(detectedWAFs, headers, statusCode) {
  if (detectedWAFs.length === 0) {
    return {
      protectionLevel: "None",
      activeRules: [],
      riskLevel: "High",
      recommendations: ["Implement a WAF solution to protect against common web attacks", "Consider Cloudflare, AWS WAF, or other leading solutions", "Implement rate limiting to prevent brute force attacks"]
    };
  }
  var analysis = {
    protectionLevel: "Medium",
    activeRules: [],
    riskLevel: "Medium",
    recommendations: []
  };

  // Analyze headers for specific protection mechanisms
  var headersStr = JSON.stringify(headers).toLowerCase();

  // Check for specific WAF providers and their typical rules
  if (detectedWAFs.includes("Cloudflare")) {
    analysis.activeRules.push("DDoS Protection");
    if (headersStr.includes("cf-ray")) {
      analysis.activeRules.push("Request Tracing");
    }
    if (headers["cf-cache-status"]) {
      analysis.activeRules.push("Content Caching");
    }
    if (headers["cf-mitigated"]) {
      analysis.activeRules.push("Threat Mitigation Active");
      analysis.protectionLevel = "High";
    }
    if (statusCode === 403) {
      analysis.activeRules.push("Active Blocking Rules");
    }
  }
  if (detectedWAFs.includes("AWS WAF")) {
    analysis.activeRules.push("AWS Managed Rules");
    if (statusCode === 403) {
      analysis.activeRules.push("IP Reputation Filtering");
    }
  }
  if (detectedWAFs.includes("Imperva")) {
    analysis.activeRules.push("Advanced Bot Protection");
    analysis.activeRules.push("Virtual Patching");
    analysis.protectionLevel = "High";
  }
  if (detectedWAFs.includes("F5 BIG-IP")) {
    analysis.activeRules.push("Protocol Validation");
    analysis.activeRules.push("Advanced Threat Protection");
    analysis.protectionLevel = "High";
  }

  // Check for security headers
  if (headers["strict-transport-security"]) {
    analysis.activeRules.push("HSTS Enabled");
  }
  if (headers["x-xss-protection"]) {
    analysis.activeRules.push("XSS Protection");
  }
  if (headers["x-content-type-options"]) {
    analysis.activeRules.push("Content Type Protection");
  }
  if (headers["content-security-policy"]) {
    analysis.activeRules.push("Content Security Policy");
    analysis.protectionLevel = "High";
  }

  // Determine risk level based on protection level
  if (analysis.protectionLevel === "High") {
    analysis.riskLevel = "Low";
  } else if (analysis.protectionLevel === "Medium") {
    analysis.riskLevel = "Medium";
  } else {
    analysis.riskLevel = "High";
  }

  // Generate recommendations based on findings
  if (!analysis.activeRules.includes("Content Security Policy")) {
    analysis.recommendations.push("Implement Content Security Policy (CSP) headers");
  }
  if (!analysis.activeRules.includes("HSTS Enabled")) {
    analysis.recommendations.push("Enable HTTP Strict Transport Security (HSTS)");
  }
  if (analysis.protectionLevel !== "High") {
    analysis.recommendations.push("Consider upgrading to enterprise-level WAF protection");
  }

  // If multiple WAFs detected
  if (detectedWAFs.length > 1) {
    analysis.recommendations.push("Optimize multiple WAF configuration to prevent conflicts");
  }
  return analysis;
}

// Save this as app/api/WAF/route.js
function GET(_x) {
  return _GET.apply(this, arguments);
} // Also support POST method for backward compatibility
function _GET() {
  _GET = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(req) {
    var _URL, searchParams, targetUrl, headers, statusCode, methodUsed, methods, _loop, _i, _methods, wafSignatures, detectedWAFs, _loop2, _i2, _Object$entries, ruleAnalysis, _t2;
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.n) {
        case 0:
          _URL = new URL(req.url), searchParams = _URL.searchParams;
          targetUrl = searchParams.get("url");
          if (targetUrl) {
            _context3.n = 1;
            break;
          }
          return _context3.a(2, new Response(JSON.stringify({
            error: "URL required"
          }), {
            status: 400,
            headers: {
              "Content-Type": "application/json"
            }
          }));
        case 1:
          _context3.p = 1;
          // Initialize variables to store response and headers
          headers = {};
          statusCode = 0;
          methodUsed = ''; // Try multiple methods with different options
          methods = ["GET", "HEAD", "OPTIONS"];
          _loop = /*#__PURE__*/_regenerator().m(function _loop() {
            var method, controller, timeoutId, requestOptions, fetchResponse, _t;
            return _regenerator().w(function (_context) {
              while (1) switch (_context.n) {
                case 0:
                  method = _methods[_i];
                  _context.p = 1;
                  // Set up request with timeout and appropriate headers
                  controller = new AbortController();
                  timeoutId = setTimeout(function () {
                    return controller.abort();
                  }, 10000); // 10 second timeout
                  requestOptions = {
                    method: method,
                    signal: controller.signal,
                    headers: {
                      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                      'Accept': '*/*',
                      'Accept-Language': 'en-US,en;q=0.9',
                      'Connection': 'keep-alive'
                    },
                    redirect: 'follow',
                    credentials: 'omit'
                  };
                  _context.n = 2;
                  return fetch(targetUrl, requestOptions);
                case 2:
                  fetchResponse = _context.v;
                  clearTimeout(timeoutId);

                  // If we got any response, store it even if not "ok"
                  statusCode = fetchResponse.status;
                  methodUsed = method;

                  // Extract headers even from non-ok responses
                  headers = Object.fromEntries(fetchResponse.headers.entries());

                  // If we got a successful response, no need to try other methods
                  if (!fetchResponse.ok) {
                    _context.n = 3;
                    break;
                  }
                  return _context.a(2, 1);
                case 3:
                  _context.n = 5;
                  break;
                case 4:
                  _context.p = 4;
                  _t = _context.v;
                  console.log("".concat(method, " request failed:"), _t.message);
                  // Continue to the next method
                case 5:
                  return _context.a(2);
              }
            }, _loop, null, [[1, 4]]);
          });
          _i = 0, _methods = methods;
        case 2:
          if (!(_i < _methods.length)) {
            _context3.n = 5;
            break;
          }
          return _context3.d(_regeneratorValues(_loop()), 3);
        case 3:
          if (!_context3.v) {
            _context3.n = 4;
            break;
          }
          return _context3.a(3, 5);
        case 4:
          _i++;
          _context3.n = 2;
          break;
        case 5:
          if (!(Object.keys(headers).length === 0)) {
            _context3.n = 6;
            break;
          }
          throw new Error("Could not connect to the target URL using any method. Last status: ".concat(statusCode));
        case 6:
          // Expanded list of WAF providers with common header indicators
          wafSignatures = {
            "Cloudflare": ["cf-ray", "cloudflare"],
            "Imperva": ["incap_ses", "visid_incap", "imperva"],
            "Akamai": ["akamai", "akamaighost"],
            "Sucuri": ["sucuri", "sucurisecurity"],
            "AWS WAF": ["awselb", "aws-waf"],
            "F5 BIG-IP": ["bigip", "f5"],
            "Fastly": ["fastly"],
            "Barracuda": ["barracuda"],
            "Fortinet": ["fortigate", "fortiwebcloud"],
            "ModSecurity": ["modsecurity"]
          };
          detectedWAFs = []; // Check headers for WAF signatures
          _loop2 = /*#__PURE__*/_regenerator().m(function _loop2() {
            var _Object$entries$_i, provider, signatures, headersString;
            return _regenerator().w(function (_context2) {
              while (1) switch (_context2.n) {
                case 0:
                  _Object$entries$_i = _slicedToArray(_Object$entries[_i2], 2), provider = _Object$entries$_i[0], signatures = _Object$entries$_i[1];
                  headersString = JSON.stringify(headers).toLowerCase();
                  if (signatures.some(function (sig) {
                    return headersString.includes(sig.toLowerCase());
                  })) {
                    detectedWAFs.push(provider);
                  }
                case 1:
                  return _context2.a(2);
              }
            }, _loop2);
          });
          _i2 = 0, _Object$entries = Object.entries(wafSignatures);
        case 7:
          if (!(_i2 < _Object$entries.length)) {
            _context3.n = 9;
            break;
          }
          return _context3.d(_regeneratorValues(_loop2()), 8);
        case 8:
          _i2++;
          _context3.n = 7;
          break;
        case 9:
          // Analyze WAF rules and protection capabilities
          ruleAnalysis = analyzeWafRules(detectedWAFs, headers, statusCode); // Return results with proper headers
          return _context3.a(2, new Response(JSON.stringify({
            waf: detectedWAFs.length > 0 ? detectedWAFs : "No WAF detected",
            headers: headers,
            statusCode: statusCode,
            methodUsed: methodUsed,
            ruleAnalysis: ruleAnalysis
          }), {
            status: 200,
            headers: {
              "Content-Type": "application/json"
            }
          }));
        case 10:
          _context3.p = 10;
          _t2 = _context3.v;
          console.error("WAF detection error:", _t2);

          // Return more detailed error for troubleshooting
          return _context3.a(2, new Response(JSON.stringify({
            error: "Scan failed: ".concat(_t2.message),
            url: targetUrl,
            timestamp: new Date().toISOString(),
            errorType: _t2.name,
            stack: process.env.NODE_ENV === 'development' ? _t2.stack : undefined
          }), {
            status: 500,
            headers: {
              "Content-Type": "application/json"
            }
          }));
      }
    }, _callee, null, [[1, 10]]);
  }));
  return _GET.apply(this, arguments);
}
function POST(_x2) {
  return _POST.apply(this, arguments);
}
function _POST() {
  _POST = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(req) {
    var body, url, newUrl, _t3;
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.n) {
        case 0:
          _context4.p = 0;
          _context4.n = 1;
          return req.json();
        case 1:
          body = _context4.v;
          url = body.url; // Create a new request with the URL as a search parameter
          newUrl = new URL(req.url);
          newUrl.searchParams.set("url", url);

          // Forward to the GET handler
          return _context4.a(2, GET(new Request(newUrl, {
            headers: req.headers
          })));
        case 2:
          _context4.p = 2;
          _t3 = _context4.v;
          return _context4.a(2, new Response(JSON.stringify({
            error: "Invalid request: ".concat(_t3.message)
          }), {
            status: 400,
            headers: {
              "Content-Type": "application/json"
            }
          }));
      }
    }, _callee2, null, [[0, 2]]);
  }));
  return _POST.apply(this, arguments);
}