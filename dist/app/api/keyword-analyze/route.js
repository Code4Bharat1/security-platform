"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.POST = POST;
var _server = require("next/server");
var cheerio = _interopRequireWildcard(require("cheerio"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t2 in e) "default" !== _t2 && {}.hasOwnProperty.call(e, _t2) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t2)) && (i.get || i.set) ? o(f, _t2, i) : f[_t2] = e[_t2]); return f; })(e, t); }
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
var STOPWORDS = new Set(['the', 'and', 'for', 'are', 'but', 'with', 'you', 'was', 'this', 'that', 'from', 'have', 'has', 'had', 'not', 'all', 'can', 'your', 'about', 'they', 'will', 'would', 'there', 'their', 'what', 'when', 'which', 'how', 'who', 'our', 'out', 'into', 'them', 'his', 'her', 'she', 'him', 'its', 'then', 'been', 'being', 'also']);
function POST(_x) {
  return _POST.apply(this, arguments);
}
function _POST() {
  _POST = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(req) {
    var _yield$req$json, url, res, html, $, text, words, filteredWords, totalWords, singleCounts, bigramCounts, i, pair, singleDensity, bigramDensity, _t;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.n) {
        case 0:
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
            error: 'URL is required'
          }, {
            status: 400
          }));
        case 2:
          _context.p = 2;
          _context.n = 3;
          return fetch(url);
        case 3:
          res = _context.v;
          _context.n = 4;
          return res.text();
        case 4:
          html = _context.v;
          $ = cheerio.load(html);
          text = $('body').text().replace(/\s+/g, ' ').toLowerCase();
          words = text.match(/\b\w+\b/g) || [];
          filteredWords = words.filter(function (word) {
            return word.length > 2 && !STOPWORDS.has(word);
          });
          totalWords = filteredWords.length; // Single keyword count
          singleCounts = {};
          filteredWords.forEach(function (word) {
            singleCounts[word] = (singleCounts[word] || 0) + 1;
          });

          // Bigrams (two-word phrases)
          bigramCounts = {};
          for (i = 0; i < filteredWords.length - 1; i++) {
            pair = "".concat(filteredWords[i], " ").concat(filteredWords[i + 1]);
            bigramCounts[pair] = (bigramCounts[pair] || 0) + 1;
          }
          singleDensity = Object.entries(singleCounts).map(function (_ref) {
            var _ref2 = _slicedToArray(_ref, 2),
              word = _ref2[0],
              count = _ref2[1];
            return {
              phrase: word,
              count: count,
              percentage: (count / totalWords * 100).toFixed(2)
            };
          }).sort(function (a, b) {
            return b.count - a.count;
          }).slice(0, 10);
          bigramDensity = Object.entries(bigramCounts).map(function (_ref3) {
            var _ref4 = _slicedToArray(_ref3, 2),
              phrase = _ref4[0],
              count = _ref4[1];
            return {
              phrase: phrase,
              count: count,
              percentage: (count / totalWords * 100).toFixed(2)
            };
          }).sort(function (a, b) {
            return b.count - a.count;
          }).slice(0, 10);
          return _context.a(2, _server.NextResponse.json({
            singleWords: singleDensity,
            phrases: bigramDensity,
            totalWords: totalWords
          }));
        case 5:
          _context.p = 5;
          _t = _context.v;
          return _context.a(2, _server.NextResponse.json({
            error: 'Fetch failed',
            details: _t.message
          }, {
            status: 500
          }));
      }
    }, _callee, null, [[2, 5]]);
  }));
  return _POST.apply(this, arguments);
}