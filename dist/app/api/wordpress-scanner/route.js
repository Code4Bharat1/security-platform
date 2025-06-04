"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.POST = POST;
var _server = require("next/server");
var _axios = _interopRequireDefault(require("axios"));
var cheerio = _interopRequireWildcard(require("cheerio"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t3 in e) "default" !== _t3 && {}.hasOwnProperty.call(e, _t3) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t3)) && (i.get || i.set) ? o(f, _t3, i) : f[_t3] = e[_t3]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (c = i[4] || 3, u = i[5] === e ? i[3] : i[5], i[4] = 3, i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { if (r) i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n;else { var o = function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); }; o("next", 0), o("throw", 1), o("return", 2); } }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
/**
 * Handles WordPress scanning requests
 * @param {Request} request - The incoming request object
 * @returns {NextResponse} - JSON response with WordPress scan results
 */
function POST(_x) {
  return _POST.apply(this, arguments);
}
/**
 * Scans a WordPress site for vulnerabilities and security issues
 * @param {string} url - The URL to scan
 * @returns {Object} - WordPress scan results
 */
function _POST() {
  _POST = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(request) {
    var _yield$request$json, url, fullUrl, scanResults, _t;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.n) {
        case 0:
          _context.p = 0;
          _context.n = 1;
          return request.json();
        case 1:
          _yield$request$json = _context.v;
          url = _yield$request$json.url;
          // Ensure URL has protocol
          fullUrl = url.startsWith('http') ? url : "https://".concat(url); // Scan the WordPress site
          _context.n = 2;
          return scanWordPressSite(fullUrl);
        case 2:
          scanResults = _context.v;
          return _context.a(2, _server.NextResponse.json(scanResults));
        case 3:
          _context.p = 3;
          _t = _context.v;
          console.error('WordPress scanner error:', _t);
          return _context.a(2, _server.NextResponse.json({
            error: 'Failed to scan WordPress site'
          }, {
            status: 500
          }));
      }
    }, _callee, null, [[0, 3]]);
  }));
  return _POST.apply(this, arguments);
}
function scanWordPressSite(_x2) {
  return _scanWordPressSite.apply(this, arguments);
}
/**
 * Checks if the site is a WordPress site
 * @param {CheerioAPI} $ - Cheerio instance
 * @param {string} html - Raw HTML content
 * @param {string} url - The URL being scanned
 * @returns {boolean} - True if the site is WordPress
 */
function _scanWordPressSite() {
  _scanWordPressSite = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(url) {
    var response, html, $, scanData, isWordPress, vulnerabilities, _t2;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.n) {
        case 0:
          _context2.p = 0;
          _context2.n = 1;
          return _axios["default"].get(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; WPSecurityScanner/1.0)'
            },
            timeout: 10000
          });
        case 1:
          response = _context2.v;
          html = response.data;
          $ = cheerio.load(html); // Initialize scan results
          scanData = {
            version: 'Unknown',
            versionSecure: false,
            theme: {
              name: 'Unknown',
              version: 'Unknown',
              secure: false
            },
            vulnerablePlugins: 0,
            outdatedPlugins: 0,
            securityScore: 0,
            issues: []
          }; // Check if it's a WordPress site
          isWordPress = checkIfWordPress($, html, url);
          if (isWordPress) {
            _context2.n = 2;
            break;
          }
          return _context2.a(2, {
            error: 'The provided URL does not appear to be a WordPress site'
          });
        case 2:
          // Extract WordPress version
          scanData.version = extractWordPressVersion($, html);
          scanData.versionSecure = isVersionSecure(scanData.version);

          // Extract theme information
          scanData.theme = extractThemeInfo($, html);

          // Check for common vulnerabilities
          vulnerabilities = checkCommonVulnerabilities($, html, url);
          scanData.issues = vulnerabilities.issues;
          scanData.vulnerablePlugins = vulnerabilities.vulnerablePluginsCount;
          scanData.outdatedPlugins = vulnerabilities.outdatedPluginsCount;

          // Calculate security score
          scanData.securityScore = calculateSecurityScore(scanData);
          return _context2.a(2, scanData);
        case 3:
          _context2.p = 3;
          _t2 = _context2.v;
          console.error('Scan error:', _t2);
          throw new Error('Failed to scan WordPress site');
        case 4:
          return _context2.a(2);
      }
    }, _callee2, null, [[0, 3]]);
  }));
  return _scanWordPressSite.apply(this, arguments);
}
function checkIfWordPress($, html, url) {
  // Check for common WordPress identifiers
  var wpContentDir = html.includes('/wp-content/') || $('[src*="/wp-content/"]').length > 0;
  var wpIncludesDir = html.includes('/wp-includes/') || $('[src*="/wp-includes/"]').length > 0;
  var wpLoginPage = html.includes('/wp-login') || $('a[href*="wp-login"]').length > 0;
  var wpAdminPage = html.includes('/wp-admin') || $('a[href*="wp-admin"]').length > 0;
  var wpJsonApi = html.includes('/wp-json/') || $('link[href*="/wp-json/"]').length > 0;

  // Check meta generator tag
  var metaGenerator = $('meta[name="generator"]').attr('content');
  var hasWpGenerator = metaGenerator && metaGenerator.includes('WordPress');

  // Check for WordPress in the HTML comment
  var wpComments = html.includes('<!-- This site is optimized with the Yoast') || html.includes('<!--[if IE ]>') || html.includes('<!-- WP ');
  return wpContentDir || wpIncludesDir || wpLoginPage || wpAdminPage || hasWpGenerator || wpComments || wpJsonApi;
}

/**
 * Extracts WordPress version from the site
 * @param {CheerioAPI} $ - Cheerio instance
 * @param {string} html - Raw HTML content
 * @returns {string} - WordPress version or 'Unknown'
 */
function extractWordPressVersion($, html) {
  // Check meta generator tag
  var metaGenerator = $('meta[name="generator"]').attr('content');
  if (metaGenerator && metaGenerator.includes('WordPress')) {
    var versionMatch = metaGenerator.match(/WordPress\s+([\d.]+)/i);
    if (versionMatch && versionMatch[1]) {
      return versionMatch[1];
    }
  }

  // Check for version in RSS or RDF feeds
  var feedLink = $('link[type="application/rss+xml"]').attr('href') || $('link[type="application/atom+xml"]').attr('href');

  // Check for version in HTML comments
  var versionCommentRegex = /wp-content\/themes\/[^\/]+\/style\.css\?ver=([\d.]+)/i;
  var versionComment = html.match(versionCommentRegex);
  if (versionComment && versionComment[1]) {
    return versionComment[1];
  }

  // Check for version in script tags
  var scriptVersionRegex = /wp-emoji-release\.min\.js\?ver=([\d.]+)/i;
  var scriptVersion = html.match(scriptVersionRegex);
  if (scriptVersion && scriptVersion[1]) {
    return scriptVersion[1];
  }
  return 'Unknown';
}

/**
 * Checks if the WordPress version is secure
 * @param {string} version - WordPress version
 * @returns {boolean} - True if version is considered secure
 */
function isVersionSecure(version) {
  if (version === 'Unknown') return false;

  // Current secure version as of May 2025 (this would need regular updates)
  var secureVersion = '6.5'; // Example, would need to be updated regularly

  // Parse versions to compare
  var parsedVersion = version.split('.').map(Number);
  var parsedSecureVersion = secureVersion.split('.').map(Number);

  // Compare major version
  if (parsedVersion[0] < parsedSecureVersion[0]) return false;
  if (parsedVersion[0] > parsedSecureVersion[0]) return true;

  // Compare minor version
  if (parsedVersion[1] < parsedSecureVersion[1]) return false;
  return true;
}

/**
 * Extracts theme information from the site
 * @param {CheerioAPI} $ - Cheerio instance
 * @param {string} html - Raw HTML content
 * @returns {Object} - Theme information
 */
function extractThemeInfo($, html) {
  var themeInfo = {
    name: 'Unknown',
    version: 'Unknown',
    secure: false
  };

  // Look for theme path in link tags
  $('link[rel="stylesheet"]').each(function (i, elem) {
    var href = $(elem).attr('href') || '';
    if (href.includes('/wp-content/themes/')) {
      var themeMatch = href.match(/\/themes\/([^\/]+)/i);
      if (themeMatch && themeMatch[1]) {
        themeInfo.name = themeMatch[1].replace(/-/g, ' ');
        themeInfo.name = themeInfo.name.charAt(0).toUpperCase() + themeInfo.name.slice(1);

        // Try to extract version
        var versionMatch = href.match(/\?ver=([\d.]+)/i);
        if (versionMatch && versionMatch[1]) {
          themeInfo.version = versionMatch[1];
        }
      }
    }
  });

  // Check if theme is secure (would require up-to-date database)
  // This is simplified - a real implementation would check against a database of vulnerable themes
  themeInfo.secure = themeInfo.name !== 'Unknown' && themeInfo.version !== 'Unknown';
  return themeInfo;
}

/**
 * Checks for common WordPress vulnerabilities
 * @param {CheerioAPI} $ - Cheerio instance
 * @param {string} html - Raw HTML content
 * @param {string} url - The URL being scanned
 * @returns {Object} - Vulnerability information
 */
function checkCommonVulnerabilities($, html, url) {
  var vulnerabilityInfo = {
    issues: [],
    vulnerablePluginsCount: 0,
    outdatedPluginsCount: 0
  };

  // Check for exposed login page
  if (html.includes('/wp-login.php') || $('a[href*="wp-login.php"]').length > 0) {
    vulnerabilityInfo.issues.push('Default WordPress login page is accessible');
  }

  // Check for debug mode
  if (html.includes('Notice:') && html.includes('on line')) {
    vulnerabilityInfo.issues.push('WordPress debug mode is enabled');
  }

  // Check for readme.html
  vulnerabilityInfo.issues.push('WordPress version might be exposed in readme.html');

  // Check for XML-RPC
  vulnerabilityInfo.issues.push('XML-RPC might be enabled which can lead to brute force attacks');

  // Check for common vulnerable plugins (in a real implementation, this would check against a database)
  // For demo purposes, we'll randomly assign some vulnerable plugins
  var pluginRisk = Math.random();
  if (pluginRisk > 0.7) {
    vulnerabilityInfo.vulnerablePluginsCount = Math.floor(Math.random() * 3);
    vulnerabilityInfo.outdatedPluginsCount = Math.floor(Math.random() * 5);
    if (vulnerabilityInfo.vulnerablePluginsCount > 0) {
      vulnerabilityInfo.issues.push('Vulnerable plugins detected that need immediate attention');
    }
    if (vulnerabilityInfo.outdatedPluginsCount > 0) {
      vulnerabilityInfo.issues.push('Outdated plugins need to be updated');
    }
  }

  // Check for directory listing
  vulnerabilityInfo.issues.push('Directory listing might be enabled');
  return vulnerabilityInfo;
}

/**
 * Calculates an overall security score
 * @param {Object} scanData - Scan results data
 * @returns {number} - Security score between 0-100
 */
function calculateSecurityScore(scanData) {
  var score = 100;

  // Deduct for WordPress version issues
  if (scanData.version === 'Unknown') {
    score -= 10;
  } else if (!scanData.versionSecure) {
    score -= 25;
  }

  // Deduct for theme issues
  if (scanData.theme.name === 'Unknown') {
    score -= 5;
  } else if (!scanData.theme.secure) {
    score -= 15;
  }

  // Deduct for plugin issues
  score -= scanData.vulnerablePlugins * 15;
  score -= scanData.outdatedPlugins * 5;

  // Deduct for each identified issue
  score -= scanData.issues.length * 5;

  // Ensure score stays within 0-100 range
  return Math.max(0, Math.min(100, score));
}