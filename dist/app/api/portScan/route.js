"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GET = GET;
var _server = require("next/server");
function _regeneratorValues(e) { if (null != e) { var t = e["function" == typeof Symbol && Symbol.iterator || "@@iterator"], r = 0; if (t) return t.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) return { next: function next() { return e && r >= e.length && (e = void 0), { value: e && e[r++], done: !e }; } }; } throw new TypeError(_typeof(e) + " is not iterable"); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (c = i[4] || 3, u = i[5] === e ? i[3] : i[5], i[4] = 3, i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { if (r) i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n;else { var o = function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); }; o("next", 0), o("throw", 1), o("return", 2); } }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; } // File: /app/api/portScan/route.js
var net = require('net');

// Common port definitions for better reporting
var commonPorts = {
  20: {
    service: "FTP-Data",
    description: "File Transfer Protocol (data)",
    risk: "Medium"
  },
  21: {
    service: "FTP",
    description: "File Transfer Protocol (control)",
    risk: "Medium"
  },
  22: {
    service: "SSH",
    description: "Secure Shell",
    risk: "Low"
  },
  23: {
    service: "Telnet",
    description: "Unencrypted text communications",
    risk: "High"
  },
  25: {
    service: "SMTP",
    description: "Simple Mail Transfer Protocol",
    risk: "Medium"
  },
  53: {
    service: "DNS",
    description: "Domain Name System",
    risk: "Medium"
  },
  80: {
    service: "HTTP",
    description: "Hypertext Transfer Protocol",
    risk: "Medium"
  },
  110: {
    service: "POP3",
    description: "Post Office Protocol v3",
    risk: "Medium"
  },
  143: {
    service: "IMAP",
    description: "Internet Message Access Protocol",
    risk: "Medium"
  },
  443: {
    service: "HTTPS",
    description: "HTTP Secure",
    risk: "Low"
  },
  993: {
    service: "IMAPS",
    description: "IMAP Secure",
    risk: "Low"
  },
  995: {
    service: "POP3S",
    description: "POP3 Secure",
    risk: "Low"
  },
  1433: {
    service: "MSSQL",
    description: "Microsoft SQL Server",
    risk: "High"
  },
  3306: {
    service: "MySQL",
    description: "MySQL Database",
    risk: "High"
  },
  3389: {
    service: "RDP",
    description: "Remote Desktop Protocol",
    risk: "High"
  },
  5432: {
    service: "PostgreSQL",
    description: "PostgreSQL Database",
    risk: "High"
  },
  5900: {
    service: "VNC",
    description: "Virtual Network Computing",
    risk: "High"
  },
  8080: {
    service: "HTTP-Alternate",
    description: "Alternative HTTP port",
    risk: "Medium"
  },
  8443: {
    service: "HTTPS-Alternate",
    description: "Alternative HTTPS port",
    risk: "Medium"
  }
};

// Function to scan a single port
var scanPort = function scanPort(host, port) {
  var timeout = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 3000;
  return new Promise(function (resolve) {
    var socket = new net.Socket();

    // Set timeout to prevent hanging
    socket.setTimeout(timeout);

    // Attempt to connect to the port
    socket.connect({
      port: port,
      host: host
    }, function () {
      // Port is open if we can connect
      socket.destroy();
      resolve({
        open: true
      });
    });

    // Handle connection errors (likely closed ports)
    socket.on('error', function () {
      resolve({
        open: false
      });
    });

    // Handle connection timeouts
    socket.on('timeout', function () {
      socket.destroy();
      resolve({
        open: false
      });
    });
  });
};

// Function to get port information
var getPortInfo = function getPortInfo(port, isOpen) {
  // Use our common ports database or generate generic info
  if (commonPorts[port]) {
    return {
      open: isOpen,
      service: commonPorts[port].service,
      description: commonPorts[port].description,
      risk: isOpen ? commonPorts[port].risk : "None"
    };
  } else {
    return {
      open: isOpen,
      service: isOpen ? "Unknown" : "-",
      description: isOpen ? "Unidentified service" : "-",
      risk: isOpen ? "Medium" : "None"
    };
  }
};

// Function to determine overall risk level
var calculateRiskLevel = function calculateRiskLevel(openPorts) {
  if (openPorts.length === 0) return "Low";

  // Check for high risk ports
  var highRiskPorts = openPorts.filter(function (port) {
    return commonPorts[port] && commonPorts[port].risk === "High";
  });
  if (highRiskPorts.length > 0) return "High";
  if (openPorts.length > 5) return "Medium";
  return "Low";
};

// Main API handler function
function GET(_x) {
  return _GET.apply(this, arguments);
} // Generate security recommendations based on scan results
function _GET() {
  _GET = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(request) {
    var _URL, searchParams, host, startPort, endPort, scanResults, scanPromises, _loop, port, openPorts, response, _t;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.n) {
        case 0:
          // Get URL parameters
          _URL = new URL(request.url), searchParams = _URL.searchParams;
          host = searchParams.get('host');
          startPort = parseInt(searchParams.get('startPort'), 10);
          endPort = parseInt(searchParams.get('endPort'), 10); // Validate input parameters
          if (host) {
            _context2.n = 1;
            break;
          }
          return _context2.a(2, _server.NextResponse.json({
            error: "Host parameter is required"
          }, {
            status: 400
          }));
        case 1:
          // Validate port range
          if (isNaN(startPort)) startPort = 1;
          if (isNaN(endPort)) endPort = startPort;

          // Enforce limits for performance/security
          if (!(endPort - startPort > 100)) {
            _context2.n = 2;
            break;
          }
          return _context2.a(2, _server.NextResponse.json({
            error: "Port range too large. Maximum scan range is 100 ports."
          }, {
            status: 400
          }));
        case 2:
          _context2.p = 2;
          scanResults = {};
          scanPromises = []; // Create array of ports to scan
          _loop = /*#__PURE__*/_regenerator().m(function _loop(port) {
            return _regenerator().w(function (_context) {
              while (1) switch (_context.n) {
                case 0:
                  scanPromises.push(scanPort(host, port).then(function (result) {
                    scanResults[port] = getPortInfo(port, result.open);
                  }));
                case 1:
                  return _context.a(2);
              }
            }, _loop);
          });
          port = startPort;
        case 3:
          if (!(port <= endPort)) {
            _context2.n = 5;
            break;
          }
          return _context2.d(_regeneratorValues(_loop(port)), 4);
        case 4:
          port++;
          _context2.n = 3;
          break;
        case 5:
          _context2.n = 6;
          return Promise.all(scanPromises);
        case 6:
          // Identify which ports are open
          openPorts = Object.keys(scanResults).filter(function (port) {
            return scanResults[port].open;
          }).map(function (port) {
            return parseInt(port, 10);
          }); // Prepare response data
          response = {
            host: host,
            scanTime: new Date().toISOString(),
            ports: scanResults,
            summary: {
              total: Object.keys(scanResults).length,
              open: openPorts.length,
              closed: Object.keys(scanResults).length - openPorts.length,
              riskAssessment: calculateRiskLevel(openPorts)
            },
            recommendations: generateRecommendations(openPorts, scanResults)
          };
          return _context2.a(2, _server.NextResponse.json(response));
        case 7:
          _context2.p = 7;
          _t = _context2.v;
          console.error("Port scan error:", _t);
          return _context2.a(2, _server.NextResponse.json({
            error: "Failed to complete port scan"
          }, {
            status: 500
          }));
      }
    }, _callee, null, [[2, 7]]);
  }));
  return _GET.apply(this, arguments);
}
function generateRecommendations(openPorts, scanResults) {
  var recommendations = [];
  if (openPorts.length === 0) {
    recommendations.push("No open ports detected. Continue regular security monitoring.");
    return recommendations;
  }
  recommendations.push("Close unnecessary ports to reduce attack surface.");

  // Add specific recommendations based on detected ports
  if (openPorts.includes(21) || openPorts.includes(20)) {
    recommendations.push("FTP uses unencrypted connections. Consider using SFTP (SSH File Transfer) instead.");
  }
  if (openPorts.includes(23)) {
    recommendations.push("Telnet sends data in plaintext. Replace with SSH for secure remote access.");
  }
  if (openPorts.includes(3306) || openPorts.includes(1433) || openPorts.includes(5432)) {
    recommendations.push("Database ports should not be directly exposed to the internet. Use a VPN or SSH tunnel.");
  }
  if (openPorts.includes(3389)) {
    recommendations.push("RDP should be restricted to trusted IP addresses with strong authentication.");
  }

  // Check for HTTP without HTTPS
  if (openPorts.includes(80) && !openPorts.includes(443)) {
    recommendations.push("HTTP detected without HTTPS. Implement TLS/SSL for secure communications.");
  }
  return recommendations;
}