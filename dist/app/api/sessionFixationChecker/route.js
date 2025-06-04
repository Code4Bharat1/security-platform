"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.POST = POST;
var _server = require("next/server");
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (c = i[4] || 3, u = i[5] === e ? i[3] : i[5], i[4] = 3, i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { if (r) i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n;else { var o = function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); }; o("next", 0), o("throw", 1), o("return", 2); } }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; } // /app/api/sessionFixationChecker/route.js
function analyzeSessionFixation(code) {
  var issues = [];

  // Check if code mentions login but no session regeneration
  var hasLogin = /login/i.test(code);
  var regeneratesSession = /session_regenerate_id\(\)|req\.session\.regenerate\(\)/i.test(code);
  if (hasLogin && !regeneratesSession) {
    issues.push({
      severity: 'high',
      message: 'Session ID is NOT regenerated on login — vulnerability to Session Fixation.',
      suggestion: 'Call session_regenerate_id() or equivalent immediately after login.'
    });
  }

  // Check if session ID is passed in URL parameters
  var sessionInUrl = /sessionid=|sid=|sessid=/i.test(code);
  if (sessionInUrl) {
    issues.push({
      severity: 'medium',
      message: 'Session ID appears to be passed in URL parameters — risky practice.',
      suggestion: 'Avoid passing session identifiers in URLs. Use cookies with secure flags instead.'
    });
  }

  // Check if session cookies have HttpOnly and Secure flags
  var missingHttpOnly = !/HttpOnly/i.test(code);
  var missingSecure = !/Secure/i.test(code);
  if (missingHttpOnly || missingSecure) {
    issues.push({
      severity: 'medium',
      message: "Session cookie missing ".concat(missingHttpOnly ? 'HttpOnly' : '', " ").concat(missingSecure ? 'Secure' : '', " flag(s)."),
      suggestion: 'Set HttpOnly and Secure flags on session cookies to protect them.'
    });
  }
  if (issues.length === 0) {
    issues.push({
      severity: 'low',
      message: 'No session fixation vulnerabilities detected.',
      suggestion: 'Session handling looks safe based on the provided code.'
    });
  }
  return issues;
}
function POST(_x) {
  return _POST.apply(this, arguments);
}
function _POST() {
  _POST = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(request) {
    var _yield$request$json, code, report;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.n) {
        case 0:
          _context.n = 1;
          return request.json();
        case 1:
          _yield$request$json = _context.v;
          code = _yield$request$json.code;
          if (!(!code || typeof code !== 'string')) {
            _context.n = 2;
            break;
          }
          return _context.a(2, _server.NextResponse.json({
            error: 'Invalid input: "code" string required.'
          }, {
            status: 400
          }));
        case 2:
          report = analyzeSessionFixation(code);
          return _context.a(2, _server.NextResponse.json({
            report: report
          }));
      }
    }, _callee);
  }));
  return _POST.apply(this, arguments);
}