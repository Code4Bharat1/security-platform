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
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; } // File: /app/api/sharepoint-scanner/route.js
/**
 * Handles SharePoint security scanning requests
 * @param {Request} request - The incoming request object
 * @returns {NextResponse} - JSON response with SharePoint scan results
 */
function POST(_x) {
  return _POST.apply(this, arguments);
}
/**
 * Scans a SharePoint site for security vulnerabilities and issues
 * @param {string} url - The URL to scan
 * @returns {Object} - SharePoint scan results
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
          fullUrl = url.startsWith('http') ? url : "https://".concat(url); // Scan the SharePoint site
          _context.n = 2;
          return scanSharePointSite(fullUrl);
        case 2:
          scanResults = _context.v;
          return _context.a(2, _server.NextResponse.json(scanResults));
        case 3:
          _context.p = 3;
          _t = _context.v;
          console.error('SharePoint scanner error:', _t);
          return _context.a(2, _server.NextResponse.json({
            error: 'Failed to scan SharePoint site'
          }, {
            status: 500
          }));
      }
    }, _callee, null, [[0, 3]]);
  }));
  return _POST.apply(this, arguments);
}
function scanSharePointSite(_x2) {
  return _scanSharePointSite.apply(this, arguments);
}
/**
 * Checks if a URL appears to be a SharePoint site
 * @param {string} url - The URL to check
 * @returns {boolean} - True if the URL appears to be a SharePoint site
 */
function _scanSharePointSite() {
  _scanSharePointSite = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(url) {
    var _t2;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.n) {
        case 0:
          _context2.p = 0;
          if (isSharePointUrl(url)) {
            _context2.n = 1;
            break;
          }
          return _context2.a(2, {
            error: 'The provided URL does not appear to be a SharePoint site'
          });
        case 1:
          _context2.n = 2;
          return new Promise(function (resolve) {
            return setTimeout(resolve, 1500);
          });
        case 2:
          return _context2.a(2, generateSharePointScanResults(url));
        case 3:
          _context2.p = 3;
          _t2 = _context2.v;
          console.error('Scan error:', _t2);
          throw new Error('Failed to scan SharePoint site');
        case 4:
          return _context2.a(2);
      }
    }, _callee2, null, [[0, 3]]);
  }));
  return _scanSharePointSite.apply(this, arguments);
}
function isSharePointUrl(url) {
  // Check for common SharePoint URL patterns
  return url.includes('.sharepoint.com') || url.includes('/sites/') || url.includes('/teams/') || url.includes('/_layouts/') || url.toLowerCase().includes('sharepoint');
}

/**
 * Generates simulated SharePoint scan results
 * @param {string} url - The SharePoint URL
 * @returns {Object} - Simulated scan results
 */
function generateSharePointScanResults(url) {
  // Determine SharePoint version based on URL patterns
  var version = determineSharePointVersion(url);

  // Determine if the version is still supported
  var versionSupported = isVersionSupported(version);

  // Determine authentication type based on URL patterns
  var authInfo = determineAuthenticationType(url);

  // Determine external sharing settings
  var externalSharing = determineExternalSharing(url);

  // Generate random permission issues count (0-5)
  var permissionIssues = Math.floor(Math.random() * 6);

  // Determine security patch status
  var securityPatches = determineSecurityPatches(version);

  // Generate random vulnerabilities based on the version and other factors
  var vulnerabilities = generateVulnerabilities(version, authInfo, externalSharing);

  // Calculate security score
  var securityScore = calculateSecurityScore({
    versionSupported: versionSupported,
    authenticationSecure: authInfo.secure,
    externalSharing: externalSharing,
    permissionIssues: permissionIssues,
    securityPatches: securityPatches,
    vulnerabilitiesCount: vulnerabilities.length
  });
  return {
    version: version,
    versionSupported: versionSupported,
    authenticationType: authInfo.type,
    authenticationSecure: authInfo.secure,
    externalSharing: externalSharing,
    permissionIssues: permissionIssues,
    securityPatches: securityPatches,
    vulnerabilities: vulnerabilities,
    securityScore: securityScore
  };
}

/**
 * Determines the SharePoint version based on URL patterns
 * @param {string} url - The SharePoint URL
 * @returns {string} - SharePoint version
 */
function determineSharePointVersion(url) {
  // For demonstration purposes, we'll assign versions based on URL patterns
  if (url.includes('modern')) {
    return 'SharePoint Online (Modern)';
  } else if (url.includes('online')) {
    return 'SharePoint Online';
  } else if (url.includes('2019')) {
    return 'SharePoint 2019';
  } else if (url.includes('2016')) {
    return 'SharePoint 2016';
  } else if (url.includes('2013')) {
    return 'SharePoint 2013';
  } else {
    var versions = ['SharePoint Online (Modern)', 'SharePoint Online', 'SharePoint 2019', 'SharePoint 2016', 'SharePoint 2013'];
    return versions[Math.floor(Math.random() * versions.length)];
  }
}

/**
 * Checks if a SharePoint version is still supported
 * @param {string} version - SharePoint version
 * @returns {boolean} - True if the version is still supported
 */
function isVersionSupported(version) {
  // For demonstration purposes, we'll consider older versions unsupported
  return !(version.includes('2013') || version.includes('2010') || version.includes('2007'));
}

/**
 * Determines the authentication type based on URL patterns
 * @param {string} url - The SharePoint URL
 * @returns {Object} - Authentication type and security status
 */
function determineAuthenticationType(url) {
  // For demonstration purposes, we'll assign auth types based on URL patterns
  if (url.includes('adfs') || url.includes('saml')) {
    return {
      type: 'ADFS/SAML',
      secure: true
    };
  } else if (url.includes('azuread')) {
    return {
      type: 'Azure AD',
      secure: true
    };
  } else if (url.includes('modern')) {
    return {
      type: 'Modern Authentication',
      secure: true
    };
  } else if (url.includes('ntlm') || url.includes('basic')) {
    return {
      type: 'NTLM/Basic',
      secure: false
    };
  } else {
    // Randomly pick an authentication type
    var authTypes = [{
      type: 'Azure AD',
      secure: true
    }, {
      type: 'Modern Authentication',
      secure: true
    }, {
      type: 'ADFS',
      secure: true
    }, {
      type: 'NTLM',
      secure: false
    }, {
      type: 'Forms Based Authentication',
      secure: false
    }];
    return authTypes[Math.floor(Math.random() * authTypes.length)];
  }
}

/**
 * Determines external sharing settings
 * @param {string} url - The SharePoint URL
 * @returns {string} - External sharing status
 */
function determineExternalSharing(url) {
  // For demonstration purposes, we'll assign external sharing settings based on URL patterns
  if (url.includes('external') || url.includes('public')) {
    return "Unrestricted";
  } else if (url.includes('private') || url.includes('internal')) {
    return "Disabled";
  } else {
    // Randomly pick an external sharing setting
    var sharingOptions = ["Disabled", "Limited", "Unrestricted"];
    return sharingOptions[Math.floor(Math.random() * sharingOptions.length)];
  }
}

/**
 * Determines security patch status
 * @param {string} version - SharePoint version
 * @returns {string} - Security patch status
 */
function determineSecurityPatches(version) {
  // For demonstration purposes, we'll assign patch status based on version
  if (version.includes('Online')) {
    return "Up to date";
  } else if (version.includes('2019')) {
    return Math.random() > 0.3 ? "Up to date" : "Missing patches";
  } else if (version.includes('2016')) {
    return Math.random() > 0.5 ? "Up to date" : "Missing patches";
  } else {
    return Math.random() > 0.7 ? "Up to date" : "Missing patches";
  }
}

/**
 * Generates vulnerabilities based on SharePoint configuration
 * @param {string} version - SharePoint version
 * @param {Object} authInfo - Authentication information
 * @param {string} externalSharing - External sharing status
 * @returns {Array} - List of vulnerabilities
 */
function generateVulnerabilities(version, authInfo, externalSharing) {
  var vulnerabilities = [];

  // Add vulnerabilities based on version
  if (version.includes('2013')) {
    vulnerabilities.push("Using unsupported SharePoint version (2013)");
  }

  // Add vulnerabilities based on authentication
  if (!authInfo.secure) {
    vulnerabilities.push("Insecure authentication method in use");
    vulnerabilities.push("Modern authentication not enabled");
  }

  // Add vulnerabilities based on external sharing
  if (externalSharing === "Unrestricted") {
    vulnerabilities.push("Unrestricted external sharing poses security risk");
  }

  // Add random common vulnerabilities
  var commonVulnerabilities = ["Anonymous access enabled for some content", "Administrator accounts with weak passwords", "Excessive permissions granted to standard users", "Missing critical security patches", "Guest access not properly monitored", "Missing audit logs configuration", "Sensitive content without information protection", "Default permission inheritance broken in multiple locations"];

  // Add 0-3 random common vulnerabilities
  var vulnCount = Math.floor(Math.random() * 4);
  for (var i = 0; i < vulnCount; i++) {
    var randomVuln = commonVulnerabilities[Math.floor(Math.random() * commonVulnerabilities.length)];
    if (!vulnerabilities.includes(randomVuln)) {
      vulnerabilities.push(randomVuln);
    }
  }
  return vulnerabilities;
}

/**
 * Calculates overall security score
 * @param {Object} scanData - Scan results data
 * @returns {number} - Security score between 0-100
 */
function calculateSecurityScore(scanData) {
  var score = 100;

  // Deduct for unsupported version
  if (!scanData.versionSupported) {
    score -= 25;
  }

  // Deduct for insecure authentication
  if (!scanData.authenticationSecure) {
    score -= 20;
  }

  // Deduct for external sharing
  if (scanData.externalSharing === "Unrestricted") {
    score -= 15;
  } else if (scanData.externalSharing === "Limited") {
    score -= 5;
  }

  // Deduct for permission issues
  score -= scanData.permissionIssues * 5;

  // Deduct for security patches
  if (scanData.securityPatches === "Missing patches") {
    score -= 15;
  }

  // Deduct for each vulnerability
  score -= scanData.vulnerabilitiesCount * 7;

  // Ensure score stays within 0-100 range
  return Math.max(0, Math.min(100, Math.round(score)));
}