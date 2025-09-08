"use client";
import React, { useState } from "react";
import { Loader2, Search, Clock, Shield, FileText } from "lucide-react";

export default function VulnScanner() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [scanData, setScanData] = useState(null);
  const [loading, setLoading] = useState(false);

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

    // ---- Mock API Call Simulation ----
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
          daysRemaining: 95,
        },
        vulnerabilities: [
          {
            severity: "medium",
            type: "missing_security_headers",
            description: "Missing Content Security Policy header",
            recommendation: "Implement a CSP header to prevent XSS attacks",
          },
          {
            severity: "low",
            type: "cookie_security",
            description: "Cookies without Secure flag",
            recommendation: "Add Secure flag to all cookies",
          },
          {
            severity: "low",
            type: "information_disclosure",
            description: "Server version disclosed in headers",
            recommendation: "Hide server version information",
          },
        ],
      };
      setScanData(mockData);
      setLoading(false);
    }, 2000);
  };

  const getSeverityColor = (severity) => {
    switch ((severity || "").toLowerCase()) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500";
      case "low":
        return "bg-blue-500/20 text-blue-400 border-blue-500";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500";
    }
  };

  const StatCard = ({ title, value, hint, icon }) => (
    <div className="bg-black p-6 rounded-xl border border-white">
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <h3 className="text-lg font-medium text-white">{title}</h3>
      </div>
      <p className="text-3xl font-bold mb-2 text-white">{value}</p>
      {hint && <p className="text-sm text-gray-400">{hint}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8 p-4">
          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mr-4 overflow-hidden">
            <img
              src="/RedTeam/code.png"
              alt="Security Scanner"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              Protect Your <span className="text-red-500">Website</span>
            </h1>
            <p className="text-gray-400 mt-1 text-lg">
              Our advanced security scanner identifies vulnerabilities before
              attackers can exploit them.
            </p>
          </div>
        </div>

        {/* Scanner Form */}
        <div className="bg-black border border-white rounded-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            Website Vulnerability Scanner
          </h2>

          <div className="max-w-md mx-auto">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full bg-transparent border border-white rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              autoComplete="off"
              spellCheck={false}
            />

            {error && (
              <p className="text-red-400 text-sm text-center mb-4">{error}</p>
            )}

            <button
  onClick={handleSubmit}
  disabled={loading}
  className="w-fit mx-auto bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-3 transition-all duration-300 border border-white"
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

        {/* Results */}
        {scanData && !loading && (
          <div className="bg-black border border-white rounded-2xl p-8 mt-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Scan Results for {scanData.domain}
            </h2>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <StatCard
                title="SSL Certificate"
                value={
                  scanData.ssl?.valid ? (
                    <span className="text-green-400">VALID</span>
                  ) : (
                    <span className="text-red-400">INVALID</span>
                  )
                }
                hint={`Expires in ${scanData.ssl.daysRemaining} days`}
                icon={<Shield className="text-green-400" size={24} />}
              />
              <StatCard
                title="Security Issues"
                value={
                  <span
                    className={
                      scanData.vulnerabilityCount > 0
                        ? "text-red-400"
                        : "text-green-400"
                    }
                  >
                    {scanData.vulnerabilityCount}
                  </span>
                }
                hint="Vulnerabilities detected"
                icon={<FileText className="text-red-400" size={24} />}
              />
              <StatCard
                title="Response Time"
                value={<span className="text-blue-400">{scanData.timespan} ms</span>}
                hint="Main page fetch time"
                icon={<Clock className="text-blue-400" size={24} />}
              />
            </div>

            {/* Vulnerabilities Table */}
            <h3 className="text-xl font-semibold text-white mb-4">
              Vulnerabilities
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border border-white">
                <thead>
                  <tr className="border-b border-white">
                    <th className="py-3 px-4 text-gray-400">Severity</th>
                    <th className="py-3 px-4 text-gray-400">Type</th>
                    <th className="py-3 px-4 text-gray-400">Description</th>
                    <th className="py-3 px-4 text-gray-400">Recommendation</th>
                  </tr>
                </thead>
                <tbody>
                  {scanData.vulnerabilities.map((v, i) => (
                    <tr key={i} className="border-b border-white">
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 text-xs rounded-full border ${getSeverityColor(
                            v.severity
                          )}`}
                        >
                          {v.severity.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white font-medium">
                        {v.type.replace(/_/g, " ")}
                      </td>
                      <td className="py-3 px-4 text-gray-300">{v.description}</td>
                      <td className="py-3 px-4 text-gray-400">
                        {v.recommendation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
