"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.POST = POST;
var _sslChecker = _interopRequireDefault(require("ssl-checker"));
var _axios = _interopRequireDefault(require("axios"));
var _https = _interopRequireDefault(require("https"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (c = i[4] || 3, u = i[5] === e ? i[3] : i[5], i[4] = 3, i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { if (r) i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n;else { var o = function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); }; o("next", 0), o("throw", 1), o("return", 2); } }, _regeneratorDefine2(e, r, n, t); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function POST(_x) {
  return _POST.apply(this, arguments);
}
function _POST() {
  _POST = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(request) {
    var _yield$request$json, url, domain, formattedUrl, scanResults, agent, response, headers, securityHeaders, _i, _Object$entries, _Object$entries$_i, header, message, commonPaths, _i2, _commonPaths, path, testUrl, _response, _t, _t2, _t3, _t4;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.n) {
        case 0:
          _context.n = 1;
          return request.json();
        case 1:
          _yield$request$json = _context.v;
          url = _yield$request$json.url;
          _context.p = 2;
          // Sanitize and format the URL
          domain = url.replace(/^https?:\/\//, "").split("/")[0];
          formattedUrl = "https://".concat(domain);
          console.log("Processing URL:", formattedUrl);

          // Collect all scan results
          scanResults = {
            domain: domain,
            timestamp: new Date().toISOString(),
            ssl: null,
            headers: null,
            openPorts: null,
            vulnerabilities: []
          }; // 1. Check SSL certificate
          _context.p = 3;
          _context.n = 4;
          return (0, _sslChecker["default"])(domain);
        case 4:
          scanResults.ssl = _context.v;
          _context.n = 6;
          break;
        case 5:
          _context.p = 5;
          _t = _context.v;
          scanResults.vulnerabilities.push({
            type: "ssl",
            severity: "high",
            description: "SSL certificate issue detected",
            details: _t.message
          });
        case 6:
          _context.p = 6;
          agent = new _https["default"].Agent({
            rejectUnauthorized: false // Allow self-signed certificates
          });
          _context.n = 7;
          return _axios["default"].get(formattedUrl, {
            timeout: 5000,
            httpsAgent: agent,
            validateStatus: function validateStatus() {
              return true;
            } // Accept any status code
          });
        case 7:
          response = _context.v;
          headers = response.headers;
          scanResults.headers = headers;

          // Check for missing security headers
          securityHeaders = {
            "strict-transport-security": "Strict Transport Security not configured",
            "content-security-policy": "Content Security Policy not configured",
            "x-content-type-options": "X-Content-Type-Options not configured",
            "x-frame-options": "X-Frame-Options not configured",
            "x-xss-protection": "X-XSS-Protection not configured"
          };
          for (_i = 0, _Object$entries = Object.entries(securityHeaders); _i < _Object$entries.length; _i++) {
            _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2), header = _Object$entries$_i[0], message = _Object$entries$_i[1];
            if (!headers[header]) {
              scanResults.vulnerabilities.push({
                type: "header",
                severity: "medium",
                description: message,
                recommendation: "Add the ".concat(header, " header to enhance security")
              });
            }
          }

          // Check for server information disclosure
          if (headers.server) {
            scanResults.vulnerabilities.push({
              type: "information_disclosure",
              severity: "low",
              description: "Server information disclosure",
              details: "Server header reveals: ".concat(headers.server),
              recommendation: "Hide server information in HTTP headers"
            });
          }
          _context.n = 9;
          break;
        case 8:
          _context.p = 8;
          _t2 = _context.v;
          scanResults.vulnerabilities.push({
            type: "connection",
            severity: "medium",
            description: "Failed to connect or retrieve headers",
            details: _t2.message
          });
        case 9:
          // 3. Check for common misconfigurations by testing URLs
          commonPaths = ["/.git/config", "/.env", "/wp-config.php", "/phpinfo.php", "/admin", "/config", "/backup", "/wp-admin", "/server-status"];
          _i2 = 0, _commonPaths = commonPaths;
        case 10:
          if (!(_i2 < _commonPaths.length)) {
            _context.n = 15;
            break;
          }
          path = _commonPaths[_i2];
          _context.p = 11;
          testUrl = "".concat(formattedUrl).concat(path);
          _context.n = 12;
          return _axios["default"].get(testUrl, {
            timeout: 3000,
            httpsAgent: new _https["default"].Agent({
              rejectUnauthorized: false
            }),
            validateStatus: function validateStatus() {
              return true;
            }
          });
        case 12:
          _response = _context.v;
          // Check for successful responses to sensitive paths
          if (_response.status === 200) {
            scanResults.vulnerabilities.push({
              type: "exposure",
              severity: "high",
              description: "Potentially sensitive resource exposed",
              details: "".concat(path, " is accessible (Status: ").concat(_response.status, ")"),
              recommendation: "Restrict access to this resource"
            });
          }
          _context.n = 14;
          break;
        case 13:
          _context.p = 13;
          _t3 = _context.v;
        case 14:
          _i2++;
          _context.n = 10;
          break;
        case 15:
          // Filter out any null properties and add summary
          scanResults.vulnerabilityCount = scanResults.vulnerabilities.length;
          scanResults.riskLevel = scanResults.vulnerabilityCount > 5 ? "high" : scanResults.vulnerabilityCount > 2 ? "medium" : "low";
          return _context.a(2, new Response(JSON.stringify(scanResults), {
            status: 200,
            headers: {
              'Content-Type': 'application/json'
            }
          }));
        case 16:
          _context.p = 16;
          _t4 = _context.v;
          console.error("Vulnerability Scanner Error:", _t4);
          return _context.a(2, new Response(JSON.stringify({
            error: "Failed to complete vulnerability scan",
            message: _t4.message
          }), {
            status: 500
          }));
      }
    }, _callee, null, [[11, 13], [6, 8], [3, 5], [2, 16]]);
  }));
  return _POST.apply(this, arguments);
}