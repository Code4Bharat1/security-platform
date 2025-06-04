"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.POST = POST;
var _server = require("next/server");
var _axios = _interopRequireDefault(require("axios"));
var _cheerio = require("cheerio");
var _url = require("url");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (c = i[4] || 3, u = i[5] === e ? i[3] : i[5], i[4] = 3, i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { if (r) i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n;else { var o = function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); }; o("next", 0), o("throw", 1), o("return", 2); } }, _regeneratorDefine2(e, r, n, t); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; } // File: app/api/sitemap-generator/route.js
// Function to normalize URL (add protocol if missing)
var normalizeUrl = function normalizeUrl(url) {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return "https://".concat(url);
  }
  return url;
};

// Function to check if a URL belongs to the same domain
var isSameDomain = function isSameDomain(baseUrl, url) {
  try {
    var baseHostname = new _url.URL(baseUrl).hostname;
    var urlHostname = new _url.URL(url).hostname;
    return baseHostname === urlHostname;
  } catch (error) {
    return false;
  }
};

// Function to extract and normalize links from HTML
var _extractLinks = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(url, baseUrl) {
    var visited,
      depth,
      maxDepth,
      _yield$axios$get,
      data,
      $,
      links,
      _iterator,
      _step,
      link,
      _args = arguments,
      _t,
      _t2;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.n) {
        case 0:
          visited = _args.length > 2 && _args[2] !== undefined ? _args[2] : new Set();
          depth = _args.length > 3 && _args[3] !== undefined ? _args[3] : 3;
          maxDepth = _args.length > 4 && _args[4] !== undefined ? _args[4] : 3;
          if (!(depth > maxDepth || visited.has(url))) {
            _context.n = 1;
            break;
          }
          return _context.a(2, visited);
        case 1:
          // Mark as visited
          visited.add(url);
          _context.p = 2;
          _context.n = 3;
          return _axios["default"].get(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; SitemapGenerator/1.0)'
            },
            timeout: 10000 // 10 second timeout
          });
        case 3:
          _yield$axios$get = _context.v;
          data = _yield$axios$get.data;
          $ = cheerio.load(data);
          links = new Set(); // Extract all links
          $('a').each(function (_, element) {
            var link = $(element).attr('href');

            // Skip if no href or it's a fragment/mailto/tel link
            if (!link || link.startsWith('#') || link.startsWith('mailto:') || link.startsWith('tel:')) {
              return;
            }
            try {
              // Handle relative URLs
              if (!link.startsWith('http')) {
                var base = new _url.URL(url);
                if (link.startsWith('/')) {
                  link = "".concat(base.protocol, "//").concat(base.hostname).concat(link);
                } else {
                  // Remove last part of path for relative links
                  var basePath = base.pathname;
                  if (!basePath.endsWith('/')) {
                    basePath = basePath.substring(0, basePath.lastIndexOf('/') + 1);
                  }
                  link = "".concat(base.protocol, "//").concat(base.hostname).concat(basePath).concat(link);
                }
              }

              // Only process links from the same domain
              if (isSameDomain(baseUrl, link)) {
                links.add(link);
              }
            } catch (error) {
              // Skip invalid URLs
            }
          });

          // Recursively crawl discovered links
          if (!(depth < maxDepth)) {
            _context.n = 10;
            break;
          }
          _iterator = _createForOfIteratorHelper(links);
          _context.p = 4;
          _iterator.s();
        case 5:
          if ((_step = _iterator.n()).done) {
            _context.n = 7;
            break;
          }
          link = _step.value;
          if (visited.has(link)) {
            _context.n = 6;
            break;
          }
          _context.n = 6;
          return _extractLinks(link, baseUrl, visited, depth + 1, maxDepth);
        case 6:
          _context.n = 5;
          break;
        case 7:
          _context.n = 9;
          break;
        case 8:
          _context.p = 8;
          _t = _context.v;
          _iterator.e(_t);
        case 9:
          _context.p = 9;
          _iterator.f();
          return _context.f(9);
        case 10:
          return _context.a(2, visited);
        case 11:
          _context.p = 11;
          _t2 = _context.v;
          console.error("Error crawling ".concat(url, ": ").concat(_t2.message));
          return _context.a(2, visited);
      }
    }, _callee, null, [[4, 8, 9, 10], [2, 11]]);
  }));
  return function extractLinks(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

// Main API handler
function POST(_x3) {
  return _POST.apply(this, arguments);
}
function _POST() {
  _POST = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(request) {
    var _yield$request$json, url, _yield$request$json$d, depth, normalizedUrl, maxDepth, visited, urls, urlArray, xml, _t3;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.n) {
        case 0:
          _context2.p = 0;
          _context2.n = 1;
          return request.json();
        case 1:
          _yield$request$json = _context2.v;
          url = _yield$request$json.url;
          _yield$request$json$d = _yield$request$json.depth;
          depth = _yield$request$json$d === void 0 ? 3 : _yield$request$json$d;
          if (url) {
            _context2.n = 2;
            break;
          }
          return _context2.a(2, _server.NextResponse.json({
            error: 'URL is required'
          }, {
            status: 400
          }));
        case 2:
          normalizedUrl = normalizeUrl(url);
          maxDepth = Math.min(Math.max(parseInt(depth), 1), 5); // Limit depth between 1-5
          visited = new Set(); // Start crawling
          _context2.n = 3;
          return _extractLinks(normalizedUrl, normalizedUrl, visited, 1, maxDepth);
        case 3:
          urls = _context2.v;
          // Convert Set to Array for response
          urlArray = Array.from(urls); // Generate XML content
          xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
          xml += "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n";
          urlArray.forEach(function (link) {
            xml += "  <url>\n    <loc>".concat(link, "</loc>\n  </url>\n");
          });
          xml += "</urlset>";
          return _context2.a(2, _server.NextResponse.json({
            success: true,
            pagesFound: urlArray.length,
            urls: urlArray,
            xml: xml
          }));
        case 4:
          _context2.p = 4;
          _t3 = _context2.v;
          console.error('Sitemap generation error:', _t3);
          return _context2.a(2, _server.NextResponse.json({
            error: 'Failed to generate sitemap',
            message: _t3.message
          }, {
            status: 500
          }));
      }
    }, _callee2, null, [[0, 4]]);
  }));
  return _POST.apply(this, arguments);
}