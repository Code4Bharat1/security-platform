"use client";
import React, { useState } from "react";
import { Loader2, Search, Clock, Shield, History, FileText, BarChart, Menu, X } from "lucide-react";

export default function Vulnscanner() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [scanData, setScanData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [history, setHistory] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const validateUrl = (v) => {
    const val = (v || "").trim();
    const urlPattern = new RegExp(
      "^(https?:\\/\\/)?(([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}(:\\d+)?(\\/.*)?$",
      "i"
    );
    return !!urlPattern.test(val);
  };

  const domainFromUrl = (v) =>
    (v || "").trim().replace(/^https?:\/\//, "").split("/")[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateUrl(url)) {
      setError("Please enter a valid website URL.");
      return;
    }

    setError("");
    setLoading(true);
    setScanData(null);
    setHistory(null);

    // Simulate API call with mock data
    setTimeout(() => {
      const mockData = {
        domain: domainFromUrl(url),
        timestamp: Date.now(),
        riskLevel: "medium",
        vulnerabilityCount: 3,
        timespan: 245,
        ssl: {
          valid: true,
          issuer: "Let's Encrypt Authority X3",
          validFrom: "2024-01-15",
          validTo: "2025-04-15",
          daysRemaining: 95
        },
        headers: {
          httpVersion: "1.1",
          statusCode: 200,
          statusMessage: "OK",
          "content-type": "text/html; charset=UTF-8",
          "x-frame-options": "DENY",
          "strict-transport-security": "max-age=31536000",
          "x-content-type-options": "nosniff"
        },
        vulnerabilities: [
          {
            severity: "medium",
            type: "missing_security_headers",
            description: "Missing Content Security Policy header",
            recommendation: "Implement a CSP header to prevent XSS attacks"
          },
          {
            severity: "low", 
            type: "cookie_security",
            description: "Cookies without Secure flag",
            recommendation: "Add Secure flag to all cookies"
          },
          {
            severity: "low",
            type: "information_disclosure",
            description: "Server version disclosed in headers",
            recommendation: "Hide server version information"
          }
        ]
      };
      setScanData(mockData);
      setLoading(false);
    }, 2000);
  };

  const getSeverityColor = (severity) => {
    switch ((severity || "").toLowerCase()) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getRiskLevelColor = (level) => {
    switch ((level || "").toLowerCase()) {
      case "high":
        return "text-red-400";
      case "medium":
        return "text-yellow-400";
      case "low":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  const StatCard = ({ title, value, hint, icon }) => (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <h3 className="text-lg font-medium text-white">{title}</h3>
      </div>
      <p className="text-3xl font-bold mb-2 text-white">{value}</p>
      {hint && <p className="text-sm text-gray-400">{hint}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="bg-black/95 backdrop-blur-sm border-b border-red-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">IMG</span>
                </div>
              </div>
              <div className="hidden md:flex space-x-8">
                <a href="#" className="text-white hover:text-red-400 transition-colors">Home</a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">About Us</a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Tools</a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Service</a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Contact</a>
              </div>
            </div>
            <div className="hidden md:block">
              <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors">
                Login
              </button>
            </div>
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/95 border-t border-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#" className="block px-3 py-2 text-white">Home</a>
              <a href="#" className="block px-3 py-2 text-gray-300">About Us</a>
              <a href="#" className="block px-3 py-2 text-gray-300">Tools</a>
              <a href="#" className="block px-3 py-2 text-gray-300">Service</a>
              <a href="#" className="block px-3 py-2 text-gray-300">Contact</a>
              <button className="w-full text-left px-3 py-2 bg-red-500 text-white rounded-lg mt-4">
                Login
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 to-transparent"></div>
        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
            <Shield size={40} className="text-white" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Protect Your <span className="text-red-500">Website</span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Our advanced security scanner identifies vulnerabilities before attackers can exploit them.
          </p>

          {/* Scanner Form */}
          <div className="bg-black/60 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-white">Website Vulnerability Scanner</h2>
            
            <div className="space-y-6">
              <div>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  required
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
              
              {error && (
                <p className="text-red-400 text-sm text-left">{error}</p>
              )}
              
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-3 transition-all duration-300"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
                {loading ? "Scanning..." : "Scan"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-12">
            <div className="w-16 h-16 mx-auto mb-6 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xl text-gray-300">Scanning website for vulnerabilities...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {scanData && !loading && (
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden">
            
            {/* Results Header */}
            <div className="p-8 border-b border-gray-800">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Scan Results: {scanData.domain}
                  </h2>
                  <p className="text-gray-400">
                    Scanned on {new Date(scanData.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-800/50 px-6 py-3 rounded-lg border border-gray-700">
                  <span className="text-gray-300 text-sm">Risk Level: </span>
                  <span className={`font-bold text-lg ${getRiskLevelColor(scanData.riskLevel)}`}>
                    {scanData.riskLevel?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="p-8 border-b border-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  title="SSL Certificate"
                  value={
                    scanData.ssl?.valid ? (
                      <span className="text-green-400">VALID</span>
                    ) : (
                      <span className="text-red-400">INVALID</span>
                    )
                  }
                  hint={
                    scanData.ssl?.daysRemaining > 0
                      ? `Expires in ${scanData.ssl.daysRemaining} days`
                      : "Certificate expired"
                  }
                  icon={<Shield className="text-green-400" size={24} />}
                />
                <StatCard
                  title="Security Issues"
                  value={
                    <span className={scanData.vulnerabilityCount > 0 ? "text-red-400" : "text-green-400"}>
                      {scanData.vulnerabilityCount || 0}
                    </span>
                  }
                  hint="Vulnerabilities detected"
                  icon={<FileText className="text-red-400" size={24} />}
                />
                <StatCard
                  title="Response Time"
                  value={
                    <span className="text-blue-400">
                      {typeof scanData.timespan === "number" ? `${scanData.timespan} ms` : "—"}
                    </span>
                  }
                  hint="Main page fetch time"
                  icon={<Clock className="text-blue-400" size={24} />}
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-800">
              <nav className="flex flex-wrap px-8">
                {[
                  ["overview", "Overview"],
                  ["vulnerabilities", "Vulnerabilities"],
                  ["ssl", "SSL Certificate"],
                  ["headers", "HTTP Headers"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === key
                        ? "border-red-500 text-red-400"
                        : "border-transparent text-gray-400 hover:text-white hover:border-gray-600"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-xl font-semibold text-white mb-4">Security Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Overall Status:</span>
                        <span className={`font-semibold ${getRiskLevelColor(scanData.riskLevel)}`}>
                          {scanData.riskLevel?.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Vulnerabilities Found:</span>
                        <span className="text-white font-semibold">{scanData.vulnerabilityCount || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">SSL Status:</span>
                        <span className={scanData.ssl?.valid ? "text-green-400" : "text-red-400"}>
                          {scanData.ssl?.valid ? "Secure" : "Insecure"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "vulnerabilities" && (
                <div className="space-y-6">
                  {scanData.vulnerabilities?.length ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left py-4 px-6 text-gray-400 font-medium">Severity</th>
                            <th className="text-left py-4 px-6 text-gray-400 font-medium">Type</th>
                            <th className="text-left py-4 px-6 text-gray-400 font-medium">Description</th>
                            <th className="text-left py-4 px-6 text-gray-400 font-medium">Recommendation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {scanData.vulnerabilities.map((v, i) => (
                            <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/20">
                              <td className="py-4 px-6">
                                <span className={`px-3 py-1 text-xs rounded-full border ${getSeverityColor(v.severity)}`}>
                                  {v.severity?.toUpperCase()}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-white font-medium">
                                {(v.type || "").replace(/_/g, " ")}
                              </td>
                              <td className="py-4 px-6 text-gray-300">
                                {v.description}
                              </td>
                              <td className="py-4 px-6 text-gray-400">
                                {v.recommendation || "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                        <Shield className="text-green-400" size={32} />
                      </div>
                      <p className="text-green-400 font-semibold text-lg mb-2">No vulnerabilities detected!</p>
                      <p className="text-gray-400">Your website appears to be secure from common threats.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "ssl" && (
                <div className="space-y-6">
                  {scanData.ssl ? (
                    <div className="bg-gray-800/30 rounded-xl border border-gray-700 overflow-hidden">
                      <table className="w-full">
                        <tbody>
                          <tr className="border-b border-gray-700">
                            <td className="py-4 px-6 text-gray-400 font-medium bg-gray-800/50">Status</td>
                            <td className="py-4 px-6">
                              <span className={scanData.ssl.valid ? "text-green-400" : "text-red-400"}>
                                {scanData.ssl.valid ? "Valid & Secure" : "Invalid"}
                              </span>
                            </td>
                          </tr>
                          <tr className="border-b border-gray-700">
                            <td className="py-4 px-6 text-gray-400 font-medium bg-gray-800/50">Issuer</td>
                            <td className="py-4 px-6 text-white">{scanData.ssl.issuer || "Unknown"}</td>
                          </tr>
                          <tr className="border-b border-gray-700">
                            <td className="py-4 px-6 text-gray-400 font-medium bg-gray-800/50">Valid From</td>
                            <td className="py-4 px-6 text-white">{scanData.ssl.validFrom || "N/A"}</td>
                          </tr>
                          <tr className="border-b border-gray-700">
                            <td className="py-4 px-6 text-gray-400 font-medium bg-gray-800/50">Valid Until</td>
                            <td className="py-4 px-6 text-white">{scanData.ssl.validTo || "N/A"}</td>
                          </tr>
                          <tr>
                            <td className="py-4 px-6 text-gray-400 font-medium bg-gray-800/50">Days Remaining</td>
                            <td className="py-4 px-6">
                              <span className={
                                scanData.ssl.daysRemaining > 30 ? "text-green-400" :
                                scanData.ssl.daysRemaining > 0 ? "text-yellow-400" : "text-red-400"
                              }>
                                {scanData.ssl.daysRemaining ?? "0"} days
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-red-400 font-semibold mb-2">SSL certificate information unavailable</p>
                      <p className="text-gray-400">Unable to retrieve SSL certificate details.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "headers" && (
                <div className="space-y-6">
                  {scanData.headers ? (
                    <div className="bg-gray-800/30 rounded-xl border border-gray-700 overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-700 bg-gray-800/50">
                            <th className="text-left py-4 px-6 text-gray-400 font-medium">Header</th>
                            <th className="text-left py-4 px-6 text-gray-400 font-medium">Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(scanData.headers)
                            .filter(([k]) => !["httpVersion", "statusCode", "statusMessage"].includes(k))
                            .map(([key, value], index) => (
                              <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/20">
                                <td className="py-4 px-6 text-white font-medium">{key}</td>
                                <td className="py-4 px-6 text-gray-300 break-all">
                                  {typeof value === "string" ? value : JSON.stringify(value)}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-400">HTTP headers not available</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};