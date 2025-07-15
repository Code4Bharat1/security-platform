"use client";
import React from "react";
import { useState } from "react";
import { Search, Loader2, SearchIcon } from "lucide-react";
export default function Vulnscanner() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [scanData, setScanData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const validateUrl = (url) => {
    const urlPattern = new RegExp(
      "^(https?:\\/\\/)?(([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}(:\\d+)?(\\/.*)?$",
      "i"
    );
    return !!urlPattern.test(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateUrl(url)) {
      setError("Please enter a valid website URL.");
      return;
    }

    setError("");
    setLoading(true);
    setScanData(null);

    try {
      const response = await fetch('https://zypher.code4bharat.com//api/scan/run-scan', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const result = await response.json();

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      setScanData(result);
      setLoading(false);
      setActiveTab("overview");
    } catch (error) {
      console.error("Error:", error);
      setError("Something went wrong.");
      setLoading(false);
    }
  };

  // Helper function to get severity color
  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRiskLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 mb-5 ">
      <img src="verify.png" alt="verify" className="w-16 h-20 mb-4 mt-7" />
      <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mt-3">
        Protect Your Website
      </h1>
      <p className="text-lg text-slate-600 max-w-2xl mx-auto text-center mt-3 mb-3">
        Our advanced security scanner identifies vulnerabilities before
        attackers can exploit them.
      </p>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-center mb-4 text-green-800">
            Website Vulnerability Scanner
          </h1>
          <form onSubmit={handleSubmit}>
            <input
              type="url"
              id="websiteUrl"
              name="websiteUrl"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              required
              className="w-full border border-gray-300 rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-green-800"
            />
            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
            <button
              type="submit"
              className="w-full bg-green-800 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors duration-300 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <SearchIcon className="h-5 w-5" />
              )}
              {loading ? "Scanning..." : "Scan"}
            </button>
          </form>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-green-800 border-opacity-50 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              Scanning website for vulnerabilities...
            </p>
          </div>
        )}

        {/* Results Section */}
        {scanData && !loading && (
          <div className="p-6">
            {/* Summary Header */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">
                    Scan Results: {scanData.domain}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Scanned on {new Date(scanData.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  <span className="font-bold">Risk Level: </span>
                  <span
                    className={`font-bold ${getRiskLevelColor(
                      scanData.riskLevel
                    )}`}
                  >
                    {scanData.riskLevel?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex flex-wrap -mb-px">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`mr-4 py-2 px-4 font-medium text-sm border-b-2 ${
                    activeTab === "overview"
                      ? "border-green-800 text-green-800"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("vulnerabilities")}
                  className={`mr-4 py-2 px-4 font-medium text-sm border-b-2 ${
                    activeTab === "vulnerabilities"
                      ? "border-green-800 text-green-800"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Vulnerabilities
                  {scanData.vulnerabilities?.length > 0 && (
                    <span className="ml-2 px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                      {scanData.vulnerabilities.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("ssl")}
                  className={`mr-4 py-2 px-4 font-medium text-sm border-b-2 ${
                    activeTab === "ssl"
                      ? "border-green-800 text-green-800"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  SSL Certificate
                </button>
                <button
                  onClick={() => setActiveTab("headers")}
                  className={`py-2 px-4 font-medium text-sm border-b-2 ${
                    activeTab === "headers"
                      ? "border-green-800 text-green-800"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  HTTP Headers
                </button>
              </nav>
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-medium mb-2">
                      SSL Certificate
                    </h3>
                    <p className="text-3xl font-bold mb-2">
                      {scanData.ssl?.valid ? (
                        <span className="text-green-600">VALID</span>
                      ) : (
                        <span className="text-red-600">INVALID</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">
                      {scanData.ssl?.daysRemaining > 0
                        ? `Expires in ${scanData.ssl.daysRemaining} days`
                        : "Certificate expired"}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-medium mb-2">
                      Security Issues
                    </h3>
                    <p className="text-3xl font-bold mb-2">
                      <span
                        className={
                          scanData.vulnerabilityCount > 0
                            ? "text-red-600"
                            : "text-green-600"
                        }
                      >
                        {scanData.vulnerabilityCount || 0}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Vulnerabilities detected
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-medium mb-2">
                      Risk Assessment
                    </h3>
                    <p
                      className={`text-3xl font-bold mb-2 ${getRiskLevelColor(
                        scanData.riskLevel
                      )}`}
                    >
                      {scanData.riskLevel?.toUpperCase() || "UNKNOWN"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Overall security risk
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Vulnerabilities Tab */}
            {activeTab === "vulnerabilities" && (
              <div className="overflow-x-auto">
                {scanData.vulnerabilities &&
                scanData.vulnerabilities.length > 0 ? (
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Severity
                        </th>
                        <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Recommendation
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {scanData.vulnerabilities.map((vuln, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(
                                vuln.severity
                              )}`}
                            >
                              {vuln.severity?.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {vuln.type?.replace(/_/g, " ")}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div>
                              <p>{vuln.description}</p>
                              {vuln.details && (
                                <p className="text-xs mt-1 text-gray-400">
                                  {vuln.details}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {vuln.recommendation ||
                              "No specific recommendation provided"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-green-600 font-medium">
                      No vulnerabilities detected!
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      This doesn't guarantee the site is fully secure, but no
                      common vulnerabilities were found.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* SSL Tab */}
            {activeTab === "ssl" && (
              <div>
                {scanData.ssl ? (
                  <div className="bg-white rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50 w-1/4">
                            Status
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={
                                scanData.ssl.valid
                                  ? "text-green-600 font-medium"
                                  : "text-red-600 font-medium"
                              }
                            >
                              {scanData.ssl.valid ? "Valid" : "Invalid"}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">
                            Issuer
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {scanData.ssl.issuer || "Unknown"}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">
                            Valid From
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {scanData.ssl.validFrom || "N/A"}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">
                            Valid To
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {scanData.ssl.validTo || "N/A"}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">
                            Days Remaining
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={
                                scanData.ssl.daysRemaining > 30
                                  ? "text-green-600 font-medium"
                                  : scanData.ssl.daysRemaining > 0
                                  ? "text-yellow-600 font-medium"
                                  : "text-red-600 font-medium"
                              }
                            >
                              {scanData.ssl.daysRemaining || "0"}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-red-600 font-medium">
                      SSL certificate information not available
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      There was an issue retrieving SSL certificate data.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Headers Tab */}
            {activeTab === "headers" && (
              <div>
                {scanData.headers ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Header
                          </th>
                          <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Value
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {Object.entries(scanData.headers).map(
                          ([key, value], index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {key}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 break-words max-w-xs">
                                {typeof value === "string"
                                  ? value
                                  : JSON.stringify(value)}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 font-medium">
                      HTTP headers not available
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      There was an issue retrieving HTTP headers.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
