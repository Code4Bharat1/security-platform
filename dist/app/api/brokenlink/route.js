"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.POST = POST;
exports["default"] = handler;
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (c = i[4] || 3, u = i[5] === e ? i[3] : i[5], i[4] = 3, i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { if (r) i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n;else { var o = function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); }; o("next", 0), o("throw", 1), o("return", 2); } }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
var axios = require("axios");
var cheerio = require("cheerio");

// Function to fetch webpage and extract links
var extractLinks = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(url) {
    var _yield$axios$get, data, $, links, linkMap, _t;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.n) {
        case 0:
          _context.p = 0;
          _context.n = 1;
          return axios.get(url);
        case 1:
          _yield$axios$get = _context.v;
          data = _yield$axios$get.data;
          $ = cheerio.load(data);
          links = [];
          linkMap = new Map(); // To track which page each link was found on
          $("a").each(function (_, element) {
            var link = $(element).attr("href");
            if (link && link.startsWith("http")) {
              links.push(link);
              linkMap.set(link, url); // Store the current page URL as the source
            }
          });
          return _context.a(2, {
            links: links,
            linkMap: linkMap
          });
        case 2:
          _context.p = 2;
          _t = _context.v;
          console.error("Error fetching page:", _t.message);
          return _context.a(2, {
            links: [],
            linkMap: new Map()
          });
      }
    }, _callee, null, [[0, 2]]);
  }));
  return function extractLinks(_x) {
    return _ref.apply(this, arguments);
  };
}();

// Function to check if links are broken
var checkLinks = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(links, linkMap) {
    var results;
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.n) {
        case 0:
          _context3.n = 1;
          return Promise.all(links.map(/*#__PURE__*/function () {
            var _ref3 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(link) {
              var response, _t2;
              return _regenerator().w(function (_context2) {
                while (1) switch (_context2.n) {
                  case 0:
                    _context2.p = 0;
                    _context2.n = 1;
                    return axios.get(link, {
                      timeout: 5000,
                      // 5 second timeout
                      validateStatus: false // Don't throw on error status codes
                    });
                  case 1:
                    response = _context2.v;
                    return _context2.a(2, {
                      url: link,
                      status: response.status,
                      working: response.status >= 200 && response.status < 400,
                      foundOn: linkMap.get(link)
                    });
                  case 2:
                    _context2.p = 2;
                    _t2 = _context2.v;
                    return _context2.a(2, {
                      url: link,
                      status: _t2.response ? _t2.response.status : "Network Error",
                      error: _t2.message,
                      working: false,
                      foundOn: linkMap.get(link)
                    });
                }
              }, _callee2, null, [[0, 2]]);
            }));
            return function (_x4) {
              return _ref3.apply(this, arguments);
            };
          }()));
        case 1:
          results = _context3.v;
          return _context3.a(2, results);
      }
    }, _callee3);
  }));
  return function checkLinks(_x2, _x3) {
    return _ref2.apply(this, arguments);
  };
}();

// Next.js API route handler for App Router (Next.js 13+)
function POST(_x5) {
  return _POST.apply(this, arguments);
} // For Pages Router (Next.js 12 and below)
function _POST() {
  _POST = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(request) {
    var body, url, _yield$extractLinks, links, linkMap, checkedLinks, brokenLinks, _t3;
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.n) {
        case 0:
          _context4.p = 0;
          _context4.n = 1;
          return request.json();
        case 1:
          body = _context4.v;
          url = body.url;
          if (url) {
            _context4.n = 2;
            break;
          }
          return _context4.a(2, new Response(JSON.stringify({
            error: "URL is required"
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json'
            }
          }));
        case 2:
          _context4.n = 3;
          return extractLinks(url);
        case 3:
          _yield$extractLinks = _context4.v;
          links = _yield$extractLinks.links;
          linkMap = _yield$extractLinks.linkMap;
          _context4.n = 4;
          return checkLinks(links, linkMap);
        case 4:
          checkedLinks = _context4.v;
          // Filter broken links (status codes >= 400 or errors)
          brokenLinks = checkedLinks.filter(function (link) {
            return !link.working;
          });
          return _context4.a(2, new Response(JSON.stringify({
            url: url,
            totalLinks: links.length,
            brokenLinks: brokenLinks.map(function (link) {
              return {
                url: link.url,
                status: link.status,
                error: link.error || "Status Code: ".concat(link.status),
                foundOn: link.foundOn || url
              };
            })
          }), {
            status: 200,
            headers: {
              'Content-Type': 'application/json'
            }
          }));
        case 5:
          _context4.p = 5;
          _t3 = _context4.v;
          console.error("Error processing request:", _t3);
          return _context4.a(2, new Response(JSON.stringify({
            error: "Failed to check links"
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json'
            }
          }));
      }
    }, _callee4, null, [[0, 5]]);
  }));
  return _POST.apply(this, arguments);
}
function handler(_x6, _x7) {
  return _handler.apply(this, arguments);
}
function _handler() {
  _handler = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(req, res) {
    var url, _yield$extractLinks2, links, linkMap, checkedLinks, brokenLinks, _t4;
    return _regenerator().w(function (_context5) {
      while (1) switch (_context5.n) {
        case 0:
          if (!(req.method !== 'POST')) {
            _context5.n = 1;
            break;
          }
          return _context5.a(2, res.status(405).json({
            error: 'Method not allowed'
          }));
        case 1:
          _context5.p = 1;
          url = req.body.url;
          if (url) {
            _context5.n = 2;
            break;
          }
          return _context5.a(2, res.status(400).json({
            error: "URL is required"
          }));
        case 2:
          _context5.n = 3;
          return extractLinks(url);
        case 3:
          _yield$extractLinks2 = _context5.v;
          links = _yield$extractLinks2.links;
          linkMap = _yield$extractLinks2.linkMap;
          _context5.n = 4;
          return checkLinks(links, linkMap);
        case 4:
          checkedLinks = _context5.v;
          // Filter broken links (status codes >= 400 or errors)
          brokenLinks = checkedLinks.filter(function (link) {
            return !link.working;
          });
          return _context5.a(2, res.status(200).json({
            url: url,
            totalLinks: links.length,
            brokenLinks: brokenLinks.map(function (link) {
              return {
                url: link.url,
                status: link.status,
                error: link.error || "Status Code: ".concat(link.status),
                foundOn: link.foundOn || url
              };
            })
          }));
        case 5:
          _context5.p = 5;
          _t4 = _context5.v;
          console.error("Error processing request:", _t4);
          return _context5.a(2, res.status(500).json({
            error: "Failed to check links"
          }));
      }
    }, _callee5, null, [[1, 5]]);
  }));
  return _handler.apply(this, arguments);
}