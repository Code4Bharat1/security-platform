"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Loader2, Search as SearchIcon, Clock, Shield, History, Cookie, FileText, BarChart } from "lucide-react";

export default function Vulnscanner() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [scanData, setScanData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [history, setHistory] = useState(null);
  const API_BASE = useMemo(
    () => (process.env.NEXT_PUBLIC_PROD_API_URL || "").replace(/\/+$/, ""),
    []
  );

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

  const fetchHistory = async (domain) => {
    try {
      const res = await fetch(
        `${API_BASE}/scan/history?domain=${encodeURIComponent(domain)}&limit=10`
      );
      const data = await res.json();
      setHistory(data);
    } catch (e) {
      setHistory({ error: e.message });
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateUrl(url)) {
    setError("Please enter a valid website URL.");
    return;
  }

  const domain = domainFromUrl(url);
  setError("");
  setLoading(true);
  setScanData(null);
  setHistory(null);

  try {
    const response = await fetch(`${API_BASE}/scan/run-scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: `https://${domain}` }),
    });

    const result = await response.json();
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setScanData(result);
    setActiveTab("overview");
    setLoading(false);

    // Only fetch history if the domain looks valid
    fetchHistory(domain);
  } catch (err) {
    console.error("Error:", err);
    setError("Something went wrong.");
    setLoading(false);
  }
};


  const getSeverityColor = (severity) => {
    switch ((severity || "").toLowerCase()) {
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
    switch ((level || "").toLowerCase()) {
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

  const renderRawHeaders = (raw) => {
    // raw is an array like [k,v,k,v,...]
    if (!Array.isArray(raw) || raw.length === 0) return null;
    const rows = [];
    for (let i = 0; i < raw.length; i += 2) {
      rows.push([raw[i], raw[i + 1]]);
    }
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Header
              </th>
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.map(([k, v], idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {k}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 break-words max-w-xl">
                  {v}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const StatCard = ({ title, value, hint, icon }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <h3 className="text-lg font-medium">{title}</h3>
      </div>
      <p className="text-3xl font-bold mb-1">{value}</p>
      {hint && <p className="text-sm text-gray-500">{hint}</p>}
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 mb-5">
      <img src="/vuln_scanner.png" alt="verify" className="w-16 h-20 mb-4 mt-7" />
      <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mt-3">
        Protect Your Website
      </h1>
      <p className="text-lg text-slate-600 max-w-2xl mx-auto text-center mt-3 mb-3">
        Our advanced security scanner identifies vulnerabilities before
        attackers can exploit them.
      </p>

      <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl">
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
              autoComplete="off"
              spellCheck={false}
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

        {/* Results */}
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

            {/* Top stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <StatCard
                title="SSL Certificate"
                value={
                  scanData.ssl?.valid ? (
                    <span className="text-green-600">VALID</span>
                  ) : (
                    <span className="text-red-600">INVALID</span>
                  )
                }
                hint={
                  scanData.ssl?.daysRemaining > 0
                    ? `Expires in ${scanData.ssl.daysRemaining} days`
                    : "Certificate expired"
                }
                icon={<Shield className="text-green-700" />}
              />
              <StatCard
                title="Security Issues"
                value={
                  <span
                    className={
                      scanData.vulnerabilityCount > 0
                        ? "text-red-600"
                        : "text-green-600"
                    }
                  >
                    {scanData.vulnerabilityCount || 0}
                  </span>
                }
                hint="Vulnerabilities detected"
                icon={<FileText className="text-slate-700" />}
              />
              <StatCard
                title="Response Time"
                value={
                  <span className="text-slate-800">
                    {typeof scanData.timespan === "number"
                      ? `${scanData.timespan} ms`
                      : "—"}
                  </span>
                }
                hint="Main page fetch time"
                icon={<Clock className="text-slate-700" />}
              />
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex flex-wrap -mb-px">
                {[
                  ["overview", "Overview"],
                  ["vulnerabilities", "Vulnerabilities"],
                  ["ssl", "SSL"],
                  ["headers", "HTTP Headers"],
                  ["raw", "Raw Headers"],
                  ["cookies", "Cookies"],
                  ["csp", "CSP"],
                  ["benchmark", "Benchmark"],
                  ["history", "History"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`mr-4 py-2 px-4 font-medium text-sm border-b-2 ${
                      activeTab === key
                        ? "border-green-800 text-green-800"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Overview */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-2">Summary</h3>
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    <li>
                      Status:{" "}
                      <span className={getRiskLevelColor(scanData.riskLevel)}>
                        {scanData.riskLevel?.toUpperCase()}
                      </span>
                    </li>
                    <li>Vulnerabilities: {scanData.vulnerabilityCount || 0}</li>
                    <li>
                      HTTP:{" "}
                      {scanData.headers?.httpVersion
                        ? `HTTP/${scanData.headers.httpVersion}`
                        : "—"}{" "}
                      • Status:{" "}
                      {scanData.headers?.statusCode
                        ? `${scanData.headers.statusCode} ${scanData.headers.statusMessage || ""}`
                        : "—"}
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Vulnerabilities */}
            {activeTab === "vulnerabilities" && (
              <div className="overflow-x-auto">
                {scanData.vulnerabilities?.length ? (
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Severity
                        </th>
                        <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Recommendation
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {scanData.vulnerabilities.map((v, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(
                                v.severity
                              )}`}
                            >
                              {v.severity?.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {(v.type || "").replace(/_/g, " ")}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <div>
                              <p>{v.description}</p>
                              {v.details && (
                                <p className="text-xs mt-1 text-gray-400">
                                  {v.details}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {v.recommendation || "—"}
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
                      This doesn't guarantee full security, but no common
                      issues were found.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* SSL */}
            {activeTab === "ssl" && (
              <div>
                {scanData.ssl ? (
                  <div className="bg-white rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-gray-50 w-1/4">
                            Status
                          </td>
                          <td className="px-6 py-4 text-sm">
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
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-gray-50">
                            Issuer
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {scanData.ssl.issuer || "Unknown"}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-gray-50">
                            Valid From
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {scanData.ssl.validFrom || "N/A"}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-gray-50">
                            Valid To
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {scanData.ssl.validTo || "N/A"}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-gray-50">
                            Days Remaining
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={
                                scanData.ssl.daysRemaining > 30
                                  ? "text-green-600 font-medium"
                                  : scanData.ssl.daysRemaining > 0
                                  ? "text-yellow-600 font-medium"
                                  : "text-red-600 font-medium"
                              }
                            >
                              {scanData.ssl.daysRemaining ?? "0"}
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

            {/* Normalized HTTP headers */}
            {activeTab === "headers" && (
              <div>
                {scanData.headers ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Header
                          </th>
                          <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Value
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {Object.entries(scanData.headers)
                          .filter(
                            ([k]) =>
                              ![
                                "rawHeaders",
                                "httpVersion",
                                "statusCode",
                                "statusMessage",
                                "cookies",
                                "csp",
                                "_benchmark",
                              ].includes(k)
                          )
                          .map(([key, value], index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {key}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 break-words max-w-xl">
                                {typeof value === "string"
                                  ? value
                                  : JSON.stringify(value)}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                    <div className="text-sm text-gray-500 mt-3">
                      HTTP/{scanData.headers?.httpVersion || "—"} •{" "}
                      {scanData.headers?.statusCode
                        ? `${scanData.headers.statusCode} ${scanData.headers.statusMessage || ""}`
                        : "—"}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 font-medium">
                      HTTP headers not available
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Raw headers */}
            {activeTab === "raw" && (
              <div>
                {scanData?.headers?.rawHeaders?.length ? (
                  renderRawHeaders(scanData.headers.rawHeaders)
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 font-medium">No raw headers.</p>
                  </div>
                )}
              </div>
            )}

            {/* Cookies */}
            {activeTab === "cookies" && (
              <div>
                {Array.isArray(scanData?.headers?.cookies) &&
                scanData.headers.cookies.length ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cookie
                          </th>
                          <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Flags
                          </th>
                          <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Issues
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {scanData.headers.cookies.map((c, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {c.name || "(unnamed)"}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {Array.isArray(c.flags) && c.flags.length
                                ? c.flags.join(", ")
                                : "—"}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {Array.isArray(c.issues) && c.issues.length ? (
                                <ul className="list-disc list-inside text-red-700">
                                  {c.issues.map((x, idx) => (
                                    <li key={idx}>{x}</li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-green-700">None</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 font-medium">No cookies set.</p>
                  </div>
                )}
              </div>
            )}

            {/* CSP */}
            {activeTab === "csp" && (
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                {scanData?.headers?.csp ? (
                  <>
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold mb-1">
                        Content-Security-Policy
                      </h3>
                      <p className="text-sm text-gray-700 break-words">
                        {scanData.headers.csp.present
                          ? scanData.headers.csp.policy || "(empty policy)"
                          : "Missing CSP header"}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Issues</h4>
                        {Array.isArray(scanData.headers.csp.issues) &&
                        scanData.headers.csp.issues.length ? (
                          <ul className="list-disc list-inside text-sm text-red-700">
                            {scanData.headers.csp.issues.map((i, idx) => (
                              <li key={idx}>{i}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-green-700">None</p>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Directives</h4>
                        {scanData.headers.csp.directives &&
                        Object.keys(scanData.headers.csp.directives).length ? (
                          <ul className="text-sm text-gray-700 space-y-1">
                            {Object.entries(
                              scanData.headers.csp.directives
                            ).map(([k, vals]) => (
                              <li key={k}>
                                <span className="font-medium">{k}:</span>{" "}
                                {Array.isArray(vals) ? vals.join(" ") : String(vals)}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-600">—</p>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-600">No CSP data available.</p>
                )}
              </div>
            )}

            {/* Benchmark */}
            {activeTab === "benchmark" && (
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                {scanData?.headers?._benchmark ? (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart className="text-slate-700" />
                      <h3 className="text-lg font-semibold">Benchmark</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Compared against last {scanData.headers._benchmark.comparedTo} scans for this domain.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded border">
                        <div className="text-sm text-gray-700">
                          <div className="mb-1">
                            <span className="font-medium">Grade:</span>{" "}
                            <span className="text-slate-800">
                              {scanData.headers._benchmark.grade}
                            </span>
                          </div>
                          {scanData.headers._benchmark.deltas && (
                            <ul className="list-disc list-inside">
                              <li>
                                Vuln Count Δ:{" "}
                                {scanData.headers._benchmark.deltas.vulnCountDelta}
                              </li>
                              <li>
                                Missing Sec Headers Δ:{" "}
                                {scanData.headers._benchmark.deltas.missingSecHeadersDelta}
                              </li>
                              <li>
                                Weak Cookies Δ:{" "}
                                {scanData.headers._benchmark.deltas.weakCookiesDelta}
                              </li>
                              <li>
                                CSP Issues Δ:{" "}
                                {scanData.headers._benchmark.deltas.cspIssuesDelta}
                              </li>
                            </ul>
                          )}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded border">
                        <div className="text-sm text-gray-700">
                          <div className="mb-1 font-medium">Notes</div>
                          <p className="text-sm text-gray-600">
                            Negative deltas are good (improvement). If the grade is
                            C or D, prioritize fixing missing security headers and
                            CSP issues first.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-600">Benchmark not available.</p>
                )}
              </div>
            )}

            {/* History */}
            {activeTab === "history" && (
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <History className="text-slate-700" />
                  <h3 className="text-lg font-semibold">Recent History</h3>
                </div>
                {!history ? (
                  <p className="text-gray-600">Loading…</p>
                ) : history?.error ? (
                  <p className="text-red-600 text-sm">{history.error}</p>
                ) : history?.items?.length ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vulnerabilities
                          </th>
                          <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Risk
                          </th>
                          <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Grade
                          </th>
                          <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Time
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {history.items.map((row, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm text-gray-700">
                              {new Date(row.timestamp).toLocaleString()}
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-700">
                              {row.vulnerabilityCount ?? "—"}
                            </td>
                            <td className="px-6 py-3 text-sm">
                              <span className={`${getRiskLevelColor(row.riskLevel)} font-medium`}>
                                {row.riskLevel?.toUpperCase() || "—"}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-700">
                              {row?.headers?._benchmark?.grade || "—"}
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-700">
                              {typeof row.timespan === "number" ? `${row.timespan} ms` : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-600">No history.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
