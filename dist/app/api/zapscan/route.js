"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = handler;
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (c = i[4] || 3, u = i[5] === e ? i[3] : i[5], i[4] = 3, i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { if (r) i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n;else { var o = function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); }; o("next", 0), o("throw", 1), o("return", 2); } }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
// File: pages/api/zapscan.js
function handler(_x, _x2) {
  return _handler.apply(this, arguments);
}
function _handler() {
  _handler = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(req, res) {
    var ZAP_API_URL, ZAP_API_KEY, url, spiderUrl, spiderResponse, errorText, spiderData, scanUrl, scanResponse, _errorText, scanData, apiUrl, zapResponse, _errorText2, data, formattedResults, _t, _t2;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.n) {
        case 0:
          // Add CORS headers if needed
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

          // Handle OPTIONS request (for CORS preflight)
          if (!(req.method === 'OPTIONS')) {
            _context.n = 1;
            break;
          }
          return _context.a(2, res.status(200).end());
        case 1:
          // Configuration - Update this if needed
          ZAP_API_URL = "http://127.0.0.1:8080"; // ZAP API base URL
          ZAP_API_KEY = ""; // Leave empty if API key is disabled
          if (!(req.method === "POST")) {
            _context.n = 14;
            break;
          }
          console.log("Received POST request to start scan");
          _context.p = 2;
          url = req.body.url;
          if (url) {
            _context.n = 3;
            break;
          }
          console.error("Missing URL in request body");
          return _context.a(2, res.status(400).json({
            message: "URL is required"
          }));
        case 3:
          console.log("Processing URL:", url);

          // STEP 1: First, spider the site to add it to the ZAP tree
          console.log("Starting spider scan to add URL to the ZAP tree...");
          spiderUrl = "".concat(ZAP_API_URL, "/JSON/spider/action/scan/?url=").concat(encodeURIComponent(url));
          console.log("Spider URL:", spiderUrl);
          _context.n = 4;
          return fetch(spiderUrl);
        case 4:
          spiderResponse = _context.v;
          if (spiderResponse.ok) {
            _context.n = 6;
            break;
          }
          _context.n = 5;
          return spiderResponse.text();
        case 5:
          errorText = _context.v;
          console.error("ZAP Spider API error:", errorText);
          return _context.a(2, res.status(500).json({
            message: "ZAP Spider API returned an error",
            error: errorText
          }));
        case 6:
          _context.n = 7;
          return spiderResponse.json();
        case 7:
          spiderData = _context.v;
          console.log("Spider scan started:", spiderData);

          // Wait for spider to complete (simple delay, in production use polling)
          console.log("Waiting for spider to complete...");
          _context.n = 8;
          return new Promise(function (resolve) {
            return setTimeout(resolve, 10000);
          });
        case 8:
          // STEP 2: Now start the active scan
          console.log("Starting active scan for URL:", url);
          scanUrl = "".concat(ZAP_API_URL, "/JSON/ascan/action/scan/?url=").concat(encodeURIComponent(url));
          console.log("Active scan URL:", scanUrl);
          _context.n = 9;
          return fetch(scanUrl);
        case 9:
          scanResponse = _context.v;
          if (scanResponse.ok) {
            _context.n = 11;
            break;
          }
          _context.n = 10;
          return scanResponse.text();
        case 10:
          _errorText = _context.v;
          console.error("ZAP Active Scan API error:", _errorText);
          return _context.a(2, res.status(500).json({
            message: "ZAP Active Scan API returned an error",
            error: _errorText
          }));
        case 11:
          _context.n = 12;
          return scanResponse.json();
        case 12:
          scanData = _context.v;
          console.log("Active scan started:", scanData);
          return _context.a(2, res.status(200).json({
            message: "Scan process started successfully",
            spiderId: spiderData.scan || "unknown",
            scanId: scanData.scan || "unknown"
          }));
        case 13:
          _context.p = 13;
          _t = _context.v;
          console.error("Error starting scan:", _t);
          return _context.a(2, res.status(500).json({
            message: "Error starting scan",
            error: _t.message
          }));
        case 14:
          if (!(req.method === "GET")) {
            _context.n = 21;
            break;
          }
          console.log("Received GET request for scan results");
          _context.p = 15;
          // Construct the ZAP API URL for alerts
          apiUrl = "".concat(ZAP_API_URL, "/JSON/core/view/alerts/");
          console.log("Fetching alerts from ZAP:", apiUrl);

          // Make request to ZAP
          _context.n = 16;
          return fetch(apiUrl);
        case 16:
          zapResponse = _context.v;
          if (zapResponse.ok) {
            _context.n = 18;
            break;
          }
          _context.n = 17;
          return zapResponse.text();
        case 17:
          _errorText2 = _context.v;
          console.error("ZAP API error:", _errorText2, "Status:", zapResponse.status);
          return _context.a(2, res.status(500).json({
            message: "ZAP API returned an error",
            error: _errorText2,
            status: zapResponse.status
          }));
        case 18:
          _context.n = 19;
          return zapResponse.json();
        case 19:
          data = _context.v;
          console.log("ZAP results retrieved, alert count:", data.alerts ? data.alerts.length : 0);

          // Format the data to match what the frontend expects
          formattedResults = (data.alerts || []).map(function (alert) {
            return {
              name: alert.name || "Unknown Issue",
              url: alert.url || "N/A",
              risk: alert.risk || "Unknown",
              description: alert.description || "No description available"
            };
          }); // Return formatted results
          return _context.a(2, res.status(200).json({
            message: "Scan results retrieved",
            results: formattedResults
          }));
        case 20:
          _context.p = 20;
          _t2 = _context.v;
          console.error("Error fetching results:", _t2);
          return _context.a(2, res.status(500).json({
            message: "Error fetching results",
            error: _t2.message
          }));
        case 21:
          // If the request method is neither POST nor GET
          console.error("Method ".concat(req.method, " not allowed"));
          return _context.a(2, res.status(405).json({
            message: "Method ".concat(req.method, " Not Allowed")
          }));
      }
    }, _callee, null, [[15, 20], [2, 13]]);
  }));
  return _handler.apply(this, arguments);
}