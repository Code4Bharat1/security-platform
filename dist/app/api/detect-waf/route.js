"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.POST = POST;
var _server = require("next/server");
var _nodeFetch = _interopRequireDefault(require("node-fetch"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (c = i[4] || 3, u = i[5] === e ? i[3] : i[5], i[4] = 3, i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { if (r) i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n;else { var o = function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); }; o("next", 0), o("throw", 1), o("return", 2); } }, _regeneratorDefine2(e, r, n, t); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
var wafSigns = [
// Cloudflare
{
  header: "server",
  value: "cloudflare",
  waf: "Cloudflare"
}, {
  header: "cf-ray",
  value: "",
  waf: "Cloudflare"
},
// Sucuri
{
  header: "x-sucuri-id",
  value: "",
  waf: "Sucuri"
}, {
  header: "x-sucuri-block",
  value: "",
  waf: "Sucuri"
},
// Incapsula (Imperva)
{
  header: "x-iinfo",
  value: "",
  waf: "Imperva (Incapsula)"
}, {
  header: "x-cdn",
  value: "imperva",
  waf: "Imperva (Incapsula)"
},
// MaxCDN
{
  header: "x-edge-location",
  value: "",
  waf: "MaxCDN"
}, {
  header: "server",
  value: "netdna",
  waf: "MaxCDN"
},
// Edgecast
{
  header: "server",
  value: "ecs",
  waf: "Edgecast"
},
// Distil Networks
{
  header: "x-distil-cs",
  value: "",
  waf: "Distil Networks"
}, {
  header: "x-distil-identify",
  value: "",
  waf: "Distil Networks"
},
// Reblaze
{
  header: "rbzid",
  value: "",
  waf: "Reblaze"
}, {
  header: "set-cookie",
  value: "rbzid",
  waf: "Reblaze"
},
// CloudFront
{
  header: "via",
  value: "cloudfront",
  waf: "CloudFront"
}, {
  header: "x-amz-cf-id",
  value: "",
  waf: "CloudFront"
}, {
  header: "server",
  value: "cloudfront",
  waf: "CloudFront"
},
// ✅ Additional WAFs
{
  header: "server",
  value: "cloudbric",
  waf: "Cloudbric"
}, {
  header: "x-cw-cache",
  value: "",
  waf: "Comodo cWatch"
}, {
  header: "x-crawlprotect-id",
  value: "",
  waf: "CrawlProtect"
}, {
  header: "server",
  value: "cloudprotector",
  waf: "Cloud Protector"
}, {
  header: "server",
  value: "cloudfloor",
  waf: "Cloudfloor"
},
// ✅ Newly Added per your request
{
  header: "server",
  value: "akamai",
  waf: "Akamai"
}, {
  header: "x-akamai-transformed",
  value: "",
  waf: "Akamai"
}, {
  header: "server",
  value: "cloudfloordns",
  waf: "CloudfloorDNS"
}, {
  header: "server",
  value: "cloudfirewall",
  waf: "Cloud Firewall"
}];
function POST(_x) {
  return _POST.apply(this, arguments);
}
function _POST() {
  _POST = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(req) {
    var _yield$req$json, url, response, headers, status, detectedWAF, matchedHeaders, _iterator, _step, sign, headerValue, securityHeaders, hasSecurityHeaders, serverHeader, dashboard, _t;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.n) {
        case 0:
          _context.p = 0;
          _context.n = 1;
          return req.json();
        case 1:
          _yield$req$json = _context.v;
          url = _yield$req$json.url;
          if (url) {
            _context.n = 2;
            break;
          }
          return _context.a(2, _server.NextResponse.json({
            message: 'URL is required.'
          }, {
            status: 400
          }));
        case 2:
          _context.n = 3;
          return (0, _nodeFetch["default"])(url, {
            method: 'GET'
          });
        case 3:
          response = _context.v;
          headers = response.headers;
          status = response.status;
          detectedWAF = null;
          matchedHeaders = [];
          _iterator = _createForOfIteratorHelper(wafSigns);
          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              sign = _step.value;
              headerValue = headers.get(sign.header);
              if (headerValue && (sign.value === "" || headerValue.toLowerCase().includes(sign.value))) {
                detectedWAF = sign.waf;
                matchedHeaders.push({
                  header: sign.header,
                  value: headerValue
                });
              }
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }
          securityHeaders = ["x-waf-status", "x-firewall", "x-protected-by", "x-sucuri-id", "cf-ray"];
          hasSecurityHeaders = securityHeaders.some(function (header) {
            return headers.has(header);
          });
          serverHeader = headers.get("server") || ""; // Prepare a visual firewall dashboard response
          dashboard = {
            url: url,
            statusCode: status,
            detected: detectedWAF ? true : false,
            firewallName: detectedWAF || (status === 403 || status === 406 || hasSecurityHeaders || !serverHeader ? "Protected or Obfuscated" : "Not Found"),
            matchedHeaders: matchedHeaders,
            securityHeadersDetected: securityHeaders.filter(function (header) {
              return headers.has(header);
            }),
            serverHeader: serverHeader,
            protectionLevel: status === 403 || status === 406 ? "High" : detectedWAF ? "Moderate" : "None"
          };
          return _context.a(2, _server.NextResponse.json({
            message: detectedWAF ? "Firewall Detected: ".concat(detectedWAF) : dashboard.firewallName === "Protected or Obfuscated" ? "Firewall is protected" : "Firewall not found",
            dashboard: dashboard
          }));
        case 4:
          _context.p = 4;
          _t = _context.v;
          return _context.a(2, _server.NextResponse.json({
            message: 'Error: ' + _t.message
          }, {
            status: 500
          }));
      }
    }, _callee, null, [[0, 4]]);
  }));
  return _POST.apply(this, arguments);
}