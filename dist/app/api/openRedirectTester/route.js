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
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
// If not installed, run: npm install node-fetch@2

// Utility to replace redirect param in URL
function replaceRedirectParam(originalUrl, paramName, testUrl) {
  try {
    var url = new URL(originalUrl);
    if (!url.searchParams.has(paramName)) return null;
    url.searchParams.set(paramName, testUrl);
    return url.toString();
  } catch (_unused) {
    return null;
  }
}

// Utility to follow redirects and get final URL (max 10 redirects)
function followRedirects(_x) {
  return _followRedirects.apply(this, arguments);
}
function _followRedirects() {
  _followRedirects = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(url) {
    var maxRedirects,
      currentUrl,
      i,
      res,
      location,
      base,
      _args = arguments;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.n) {
        case 0:
          maxRedirects = _args.length > 1 && _args[1] !== undefined ? _args[1] : 10;
          currentUrl = url;
          i = 0;
        case 1:
          if (!(i < maxRedirects)) {
            _context.n = 5;
            break;
          }
          _context.n = 2;
          return (0, _nodeFetch["default"])(currentUrl, {
            redirect: 'manual'
          });
        case 2:
          res = _context.v;
          if (!(res.status >= 300 && res.status < 400 && res.headers.has('location'))) {
            _context.n = 3;
            break;
          }
          location = res.headers.get('location'); // Handle relative redirects
          if (location.startsWith('/')) {
            base = new URL(currentUrl);
            location = base.origin + location;
          }
          currentUrl = location;
          _context.n = 4;
          break;
        case 3:
          return _context.a(3, 5);
        case 4:
          i++;
          _context.n = 1;
          break;
        case 5:
          return _context.a(2, currentUrl);
      }
    }, _callee);
  }));
  return _followRedirects.apply(this, arguments);
}
function POST(_x2) {
  return _POST.apply(this, arguments);
}
function _POST() {
  _POST = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(request) {
    var _yield$request$json, url, _yield$request$json$p, paramName, testRedirectUrl, testUrl, finalUrl, originalDomain, finalDomain, vulnerable, _t;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.n) {
        case 0:
          _context2.p = 0;
          _context2.n = 1;
          return request.json();
        case 1:
          _yield$request$json = _context2.v;
          url = _yield$request$json.url;
          _yield$request$json$p = _yield$request$json.paramName;
          paramName = _yield$request$json$p === void 0 ? 'redirect' : _yield$request$json$p;
          if (!(!url || typeof url !== 'string')) {
            _context2.n = 2;
            break;
          }
          return _context2.a(2, _server.NextResponse.json({
            error: 'Invalid URL'
          }, {
            status: 400
          }));
        case 2:
          // Use a safe test redirect URL
          testRedirectUrl = 'https://example.com/malicious';
          testUrl = replaceRedirectParam(url, paramName, testRedirectUrl);
          if (testUrl) {
            _context2.n = 3;
            break;
          }
          return _context2.a(2, _server.NextResponse.json({
            error: "Redirect parameter '".concat(paramName, "' not found in URL.")
          }, {
            status: 400
          }));
        case 3:
          _context2.n = 4;
          return followRedirects(testUrl);
        case 4:
          finalUrl = _context2.v;
          // Determine vulnerability: if final URL matches testRedirectUrl or domain differs from original domain
          originalDomain = new URL(url).hostname;
          finalDomain = new URL(finalUrl).hostname;
          vulnerable = finalUrl === testRedirectUrl || finalDomain !== originalDomain;
          return _context2.a(2, _server.NextResponse.json({
            originalUrl: url,
            testedUrl: testUrl,
            finalUrl: finalUrl,
            vulnerable: vulnerable,
            originalDomain: originalDomain,
            finalDomain: finalDomain
          }));
        case 5:
          _context2.p = 5;
          _t = _context2.v;
          return _context2.a(2, _server.NextResponse.json({
            error: _t.message || 'Internal error'
          }, {
            status: 500
          }));
      }
    }, _callee2, null, [[0, 5]]);
  }));
  return _POST.apply(this, arguments);
}