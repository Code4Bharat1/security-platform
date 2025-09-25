"use client";
import React, { useEffect, useMemo, useState,  } from "react";
import { useRouter } from "next/navigation";

import {
  Loader2,
  Search as SearchIcon,
  Clock,
  Shield,
  History,
  Cookie,
  FileText,
  BarChart,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Enhanced Vulnerability Scanner component
 * - Updated to handle new backend functionalities
 * - Added support for new vulnerability types
 * - Enhanced security analysis display
 * - Improved vulnerability categorization and severity handling
 */

export default function Vulnscanner() {
  const router = useRouter();
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
      setHistory(null);
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
  if (e && e.preventDefault) e.preventDefault();

  if (!validateUrl(url)) {
    setError("Please enter a valid website URL.");
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/gain-access"); // ✅ Not logged in → redirect
    return;
  }

  const domain = domainFromUrl(url);
  setError("");
  setLoading(true);
  setScanData(null);
  setHistory(null);

  try {
    // ✅ Step 1: Inspect token
    const inspectRes = await fetch("http://localhost:4180/api/auth/inspect-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ token }),
    });

    const inspectData = await inspectRes.json();
    if (!inspectRes.ok || inspectData.meta?.isExpired) {
      setError("Your session expired. Please login again.");
      router.push("/gain-access");
      return;
    }

    // ✅ Step 2: Run scan (your original code)
    const response = await fetch(`${API_BASE}/scan/run-scan`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // 👈 
      },
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
    fetchHistory(domain);

    // ✅ Step 3: Deduct 1 credit after success
    await fetch("http://localhost:4180/api/auth/recharge-credits", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount: -1 }), // 👈 credit deduct
    });

  } catch (err) {
    console.error("Error:", err);
    setError("Something went wrong.");
  } finally {
    setLoading(false);
  }
};


  const getSeverityColor = (severity) => {
    switch ((severity || "").toLowerCase()) {
      case "critical":
        return "bg-purple-500/20 text-purple-400 border-purple-500";
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

  const getSeverityIcon = (severity) => {
    switch ((severity || "").toLowerCase()) {
      case "critical":
        return <XCircle className="w-4 h-4 text-purple-400" />;
      case "high":
        return <XCircle className="w-4 h-4 text-red-400" />;
      case "medium":
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case "low":
        return <Info className="w-4 h-4 text-blue-400" />;
      default:
        return <Info className="w-4 h-4 text-gray-400" />;
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

  const getVulnerabilityTypeLabel = (type) => {
    const typeLabels = {
      ssl: "SSL/TLS",
      clickjacking: "Clickjacking",
      form: "Form Security",
      cleartext_credentials: "Cleartext Credentials",
      external_url: "External URLs",
      cgi_http_error: "CGI HTTP Errors",
      cgi_load: "CGI Load Issues",
      cgi_injectable: "CGI Injection",
      header: "Security Headers",
      information_disclosure: "Information Disclosure",
      cookie: "Cookie Security",
      csp: "Content Security Policy",
      exposure: "Resource Exposure"
    };
    return typeLabels[type] || type.replace(/_/g, " ");
  };

  const generatePDF = () => {
    if (!scanData) return;

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text("Vulnerability Scan Report", 14, 20);

    // Domain & timestamp
    try {
      doc.setFontSize(11);
      doc.text(`Domain: ${scanData.domain || url}`, 14, 30);
      const ts = scanData.timestamp
        ? new Date(scanData.timestamp).toLocaleString()
        : new Date().toLocaleString();
      doc.text(`Scan Date: ${ts}`, 14, 36);
    } catch (e) {
      // ignore minor failures
    }

    // Key scan data table
    const keyRows = [
      ["Risk Level", (scanData.riskLevel || "—").toString().toUpperCase()],
      ["Vulnerabilities", String(scanData.vulnerabilityCount || 0)],
      ["SSL Valid", scanData.ssl?.valid ? "VALID" : "INVALID"],
      ["Response Time", scanData.timespan ? `${scanData.timespan} ms` : "—"],
    ];

    if (scanData.headers?._benchmark?.grade) {
      keyRows.push(["Security Grade", scanData.headers._benchmark.grade]);
    }

    autoTable(doc, {
      startY: 44,
      head: [["Metric", "Value"]],
      body: keyRows,
    });

    // Vulnerabilities table
    if (Array.isArray(scanData.vulnerabilities) && scanData.vulnerabilities.length) {
      const vulnerabilityData = scanData.vulnerabilities.map((v) => [
        (v.severity || "").toUpperCase(),
        getVulnerabilityTypeLabel(v.type || ""),
        v.description || "—",
        v.recommendation || "—",
      ]);

      autoTable(doc, {
        startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : 0,
        head: [["Severity", "Type", "Description", "Recommendation"]],
        body: vulnerabilityData,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [220, 220, 220], textColor: 20 },
      });
    }

    // SSL details
    if (scanData.ssl) {
      const sslRows = [
        ["Status", scanData.ssl.valid ? "Valid" : "Invalid"],
        ["Issuer", scanData.ssl.issuer || "Unknown"],
        ["Valid From", scanData.ssl.validFrom || "N/A"],
        ["Valid To", scanData.ssl.validTo || "N/A"],
        ["Days Remaining", String(scanData.ssl.daysRemaining ?? "N/A")],
      ];
      autoTable(doc, {
        startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : 0,
        head: [["SSL Details", "Value"]],
        body: sslRows,
        styles: { fontSize: 10 },
      });
    }

    // HTTP Headers (filtered)
    if (scanData.headers) {
      const headersData = Object.entries(scanData.headers)
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
        .map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)]);

      if (headersData.length) {
        autoTable(doc, {
          startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : 0,
          head: [["Header", "Value"]],
          body: headersData,
          styles: { fontSize: 9 },
        });
      }
    }

    // Benchmark data
    if (scanData.headers?._benchmark) {
      const benchmarkData = [
        ["Security Grade", scanData.headers._benchmark.grade],
        ["Compared to last", `${scanData.headers._benchmark.comparedTo} scans`],
      ];
      if (scanData.headers._benchmark.deltas) {
        const deltas = scanData.headers._benchmark.deltas;
        benchmarkData.push(
          ["Vulnerability Count Δ", String(deltas.vulnCountDelta)],
          ["Missing Sec Headers Δ", String(deltas.missingSecHeadersDelta)],
          ["Weak Cookies Δ", String(deltas.weakCookiesDelta)],
          ["CSP Issues Δ", String(deltas.cspIssuesDelta)]
        );
      }
      autoTable(doc, {
        startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : 0,
        head: [["Benchmark", "Value"]],
        body: benchmarkData,
        styles: { fontSize: 10 },
      });
    }

    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.text("Generated by Vulnerability Scanner", 14, pageHeight - 10);

    doc.save("scan_report.pdf");
  };

  const renderRawHeaders = (raw) => {
    if (!Array.isArray(raw) || raw.length === 0) return null;
    const rows = [];
    for (let i = 0; i < raw.length; i += 2) {
      rows.push([raw[i], raw[i + 1]]);
    }
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-black border border-white text-white">
          <thead>
            <tr className="bg-black">
              <th className="px-4 py-2 border-b border-white text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Header
              </th>
              <th className="px-4 py-2 border-b border-white text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Value
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white">
            {rows.map(([k, v], idx) => (
              <tr key={idx} className="hover:bg-gray-900">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
                  {k}
                </td>
                <td className="px-4 py-3 text-sm text-gray-300 break-words max-w-xs">
                  {v}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Small stat card - responsive
  const StatCard = ({ title, value, hint, icon }) => (
    <div className="bg-black p-4 sm:p-6 rounded-xl border border-white">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex-shrink-0">{icon}</div>
        <h3 className="text-base sm:text-lg font-medium text-white">{title}</h3>
      </div>
      <p className="text-2xl sm:text-3xl font-bold mb-1 text-white">{value}</p>
      {hint && <p className="text-xs sm:text-sm text-gray-400">{hint}</p>}
    </div>
  );

  const getCriticalVulnCount = () => {
    if (!scanData?.vulnerabilities) return 0;
    return scanData.vulnerabilities.filter(v => v.severity?.toLowerCase() === 'critical').length;
  };

  const getHighVulnCount = () => {
    if (!scanData?.vulnerabilities) return 0;
    return scanData.vulnerabilities.filter(v => v.severity?.toLowerCase() === 'high').length;
  };

  useEffect(() => {
    // If user had a domain in the url already, fetch history proactively
    if (validateUrl(url)) {
      const domain = domainFromUrl(url);
      fetchHistory(domain);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 md:p-8 mt-15">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-30 h-30 bg-gray-800 rounded-full border-2 border-red-500 flex items-center justify-center overflow-hidden">
            <img
              src="/RedTeam/vuln_scanner.png"
              alt="Security Scanner"
              className="w-30 h-30 object-contain"
            />
          </div>

          <div className="flex-1">
            <h1 className="text-xl sm:text-3xl font-bold">
              Vulnerability <span className="text-red-500">Scanner</span>
            </h1>
            <p className="text-gray-400 text-sm sm:text-base mt-1">
              Our advanced security scanner identifies vulnerabilities before
              attackers can exploit them.
            </p>
          </div>
        </div>

        <div className="bg-black border border-white rounded-2xl overflow-hidden">
          <div className="p-4 sm:p-8 border-b border-white">
            <h2 className="text-lg sm:text-2xl font-bold text-center mb-4">
              Website Vulnerability Scanner
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="url"
                  id="websiteUrl"
                  name="websiteUrl"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  required
                  className="flex-1 bg-transparent border border-white rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                  autoComplete="off"
                  spellCheck={false}
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 border border-white"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <SearchIcon className="h-4 w-4" />
                  )}
                  <span className="text-sm">
                    {loading ? "Scanning..." : "Scan"}
                  </span>
                </button>
              </div>

              {error && (
                <p className="text-red-400 text-sm mt-1 break-words">{error}</p>
              )}
            </form>
          </div>

          {/* Loading indicator */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-red-500 border-opacity-50 mx-auto"></div>
              <p className="mt-3 text-gray-400 text-sm">
                Scanning website for vulnerabilities...
              </p>
            </div>
          )}

          {/* Results */}
          {scanData && !loading && (
            <div className="p-4 sm:p-8 space-y-6">
              {/* Summary Header */}
              <div className="p-4 bg-black rounded-xl border border-white">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">
                      Scan Results: {scanData.domain}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-400">
                      Scanned on{" "}
                      {scanData.timestamp
                        ? new Date(scanData.timestamp).toLocaleString()
                        : "—"}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                    {scanData.headers?._benchmark?.grade && (
                      <div>
                        <span className="font-bold text-white mr-2">Grade:</span>
                        <span className="text-blue-400 font-bold">
                          {scanData.headers._benchmark.grade}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="font-bold text-white mr-2">Risk Level:</span>
                      <span
                        className={`font-bold ${getRiskLevelColor(
                          scanData.riskLevel
                        )}`}
                      >
                        {scanData.riskLevel?.toUpperCase() || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top stats - Enhanced with new metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    scanData.ssl?.daysRemaining !== undefined
                      ? scanData.ssl.daysRemaining > 0
                        ? `Expires in ${scanData.ssl.daysRemaining} days`
                        : "Certificate expired"
                      : "Certificate status unknown"
                  }
                  icon={<Shield className="text-green-400" size={20} />}
                />
                <StatCard
                  title="Critical Issues"
                  value={
                    <span className="text-purple-400">
                      {getCriticalVulnCount()}
                    </span>
                  }
                  hint="Immediate attention required"
                  icon={<XCircle className="text-purple-400" size={20} />}
                />
                <StatCard
                  title="High Risk Issues"
                  value={
                    <span className="text-red-400">
                      {getHighVulnCount()}
                    </span>
                  }
                  hint="Should be addressed soon"
                  icon={<AlertTriangle className="text-red-400" size={20} />}
                />
                <StatCard
                  title="Response Time"
                  value={
                    <span className="text-blue-400">
                      {typeof scanData.timespan === "number"
                        ? `${scanData.timespan} ms`
                        : "—"}
                    </span>
                  }
                  hint="Main page fetch time"
                  icon={<Clock className="text-blue-400" size={20} />}
                />
              </div>

              {/* Tabs */}
              <div>
                <nav className="flex flex-wrap gap-2 border-b border-white pb-2">
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
                      className={`py-1 px-3 text-xs sm:text-sm font-medium rounded-t-md border-b-2 ${
                        activeTab === key
                          ? "border-red-500 text-red-400"
                          : "border-transparent text-gray-400 hover:text-white hover:border-gray-500"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab contents */}
              <div>
                {/* Overview */}
                {activeTab === "overview" && (
                  <div className="space-y-4">
                    <div className="bg-black p-4 rounded-xl border border-white">
                      <h3 className="text-lg font-semibold mb-3 text-white">
                        Security Summary
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                            <li>
                              Risk Level:{" "}
                              <span className={getRiskLevelColor(scanData.riskLevel)}>
                                {scanData.riskLevel?.toUpperCase() || "—"}
                              </span>
                            </li>
                            <li>Total Vulnerabilities: {scanData.vulnerabilityCount || 0}</li>
                            <li>Critical Issues: {getCriticalVulnCount()}</li>
                            <li>High Risk Issues: {getHighVulnCount()}</li>
                          </ul>
                        </div>
                        <div>
                          <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
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
                            <li>
                              Security Grade:{" "}
                              {scanData.headers?._benchmark?.grade ? (
                                <span className="text-blue-400 font-medium">
                                  {scanData.headers._benchmark.grade}
                                </span>
                              ) : (
                                "Not available"
                              )}
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Quick vulnerability breakdown */}
                    {scanData.vulnerabilities?.length > 0 && (
                      <div className="bg-black p-4 rounded-xl border border-white">
                        <h3 className="text-lg font-semibold mb-3 text-white">
                          Vulnerability Breakdown
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {['critical', 'high', 'medium', 'low'].map(severity => {
                            const count = scanData.vulnerabilities.filter(
                              v => v.severity?.toLowerCase() === severity
                            ).length;
                            return (
                              <div key={severity} className="text-center">
                                <div className={`text-2xl font-bold ${
                                  severity === 'critical' ? 'text-purple-400' :
                                  severity === 'high' ? 'text-red-400' :
                                  severity === 'medium' ? 'text-yellow-400' :
                                  'text-blue-400'
                                }`}>
                                  {count}
                                </div>
                                <div className="text-xs text-gray-400 uppercase">
                                  {severity}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Vulnerabilities */}
                {activeTab === "vulnerabilities" && (
                  <div className="overflow-x-auto">
                    {scanData.vulnerabilities?.length ? (
                      <table className="min-w-full bg-black border border-white text-white">
                        <thead>
                          <tr className="bg-black">
                            <th className="px-4 py-2 border-b border-white text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Severity
                            </th>
                            <th className="px-4 py-2 border-b border-white text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-4 py-2 border-b border-white text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Description
                            </th>
                            <th className="px-4 py-2 border-b border-white text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Details
                            </th>
                            <th className="px-4 py-2 border-b border-white text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Recommendation
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white">
                          {scanData.vulnerabilities.map((v, i) => (
                            <tr key={i} className="hover:bg-gray-900 align-top">
                              <td className="px-4 py-3 whitespace-nowrap align-top">
                                <div className="flex items-center gap-2">
                                  {getSeverityIcon(v.severity)}
                                  <span
                                    className={`inline-block px-2 py-1 text-xs rounded-full border ${getSeverityColor(
                                      v.severity
                                    )}`}
                                  >
                                    {v.severity?.toUpperCase()}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white align-top">
                                {getVulnerabilityTypeLabel(v.type || "")}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-300 align-top max-w-[20rem] break-words">
                                {v.description}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-400 align-top max-w-[16rem] break-words">
                                {v.details && (
                                  <p className="text-xs text-gray-500">
                                    {v.details}
                                  </p>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-400 align-top max-w-[20rem] break-words">
                                {v.recommendation || "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                        <p className="text-green-400 font-medium">
                          No vulnerabilities detected!
                        </p>
                        <p className="text-gray-400 text-sm mt-2">
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
                      <div className="bg-black rounded-xl border border-white overflow-hidden">
                        <table className="min-w-full divide-y divide-white text-white">
                          <tbody className="divide-y divide-white">
                            <tr>
                              <td className="px-4 py-3 text-sm font-medium text-white bg-black w-1/3">
                                Status
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <div className="flex items-center gap-2">
                                  {scanData.ssl.valid ? (
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-red-400" />
                                  )}
                                  <span
                                    className={
                                      scanData.ssl.valid
                                        ? "text-green-400 font-medium"
                                        : "text-red-400 font-medium"
                                    }
                                  >
                                    {scanData.ssl.valid ? "Valid" : "Invalid"}
                                  </span>
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 text-sm font-medium text-white bg-black">
                                Issuer
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-300">
                                {scanData.ssl.issuer || "Unknown"}
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 text-sm font-medium text-white bg-black">
                                Valid From
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-300">
                                {scanData.ssl.validFrom || "N/A"}
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 text-sm font-medium text-white bg-black">
                                Valid To
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-300">
                                {scanData.ssl.validTo || "N/A"}
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 text-sm font-medium text-white bg-black">
                                Days Remaining
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <span
                                  className={
                                    scanData.ssl.daysRemaining > 30
                                      ? "text-green-400 font-medium"
                                      : scanData.ssl.daysRemaining > 0
                                      ? "text-yellow-400 font-medium"
                                      : "text-red-400 font-medium"
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
                        <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                        <p className="text-red-400 font-medium">
                          SSL certificate information not available
                        </p>
                        <p className="text-gray-400 text-sm mt-2">
                          There was an issue retrieving SSL certificate data.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Headers */}
                {activeTab === "headers" && (
                  <div>
                    {scanData.headers ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-black border border-white text-white">
                          <thead>
                            <tr className="bg-black">
                              <th className="px-4 py-2 border-b border-white text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Header
                              </th>
                              <th className="px-4 py-2 border-b border-white text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Value
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white">
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
                                <tr key={index} className="hover:bg-gray-900">
                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
                                    {key}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-300 break-words max-w-[30rem]">
                                    {typeof value === "string"
                                      ? value
                                      : JSON.stringify(value)}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                        <div className="text-sm text-gray-400 mt-3">
                          HTTP/{scanData.headers?.httpVersion || "—"} •{" "}
                          {scanData.headers?.statusCode
                            ? `${scanData.headers.statusCode} ${scanData.headers.statusMessage || ""
                              }`
                            : "—"}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-400 font-medium">
                          HTTP headers not available
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Raw Headers */}
                {activeTab === "raw" && (
                  <div>{scanData?.headers?.rawHeaders?.length ? renderRawHeaders(scanData.headers.rawHeaders) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400 font-medium">No raw headers.</p>
                    </div>
                  )}</div>
                )}

                {/* Cookies */}
                {activeTab === "cookies" && (
                  <div>
                    {Array.isArray(scanData?.headers?.cookies) &&
                    scanData.headers.cookies.length ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-black border border-white text-white">
                          <thead>
                            <tr className="bg-black">
                              <th className="px-4 py-2 border-b border-white text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Cookie
                              </th>
                              <th className="px-4 py-2 border-b border-white text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Flags
                              </th>
                              <th className="px-4 py-2 border-b border-white text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Issues
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white">
                            {scanData.headers.cookies.map((c, i) => (
                              <tr key={i} className="hover:bg-gray-900">
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
                                  {c.name || "(unnamed)"}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-300">
                                  {Array.isArray(c.flags) && c.flags.length
                                    ? c.flags.join(", ")
                                    : "—"}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  {Array.isArray(c.issues) && c.issues.length ? (
                                    <ul className="list-disc list-inside text-red-400">
                                      {c.issues.map((x, idx) => (
                                        <li key={idx}>{x}</li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <span className="text-green-400">None</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Cookie className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400 font-medium">No cookies set.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* CSP */}
                {activeTab === "csp" && (
                  <div className="bg-black p-4 sm:p-6 rounded-xl border border-white">
                    {scanData?.headers?.csp ? (
                      <>
                        <div className="flex items-center gap-2 mb-4">
                          <Shield className="text-blue-400" />
                          <h3 className="text-lg font-semibold text-white">
                            Content-Security-Policy
                          </h3>
                          <div className="flex items-center gap-1">
                            {scanData.headers.csp.present ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-400" />
                            )}
                            <span className={`text-sm font-medium ${
                              scanData.headers.csp.present ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {scanData.headers.csp.present ? 'Present' : 'Missing'}
                            </span>
                          </div>
                        </div>
                        
                        {scanData.headers.csp.present && (
                          <div className="mb-4">
                            <h4 className="font-semibold mb-2 text-white">Policy</h4>
                            <p className="text-sm text-gray-300 break-words bg-gray-900 p-3 rounded border">
                              {scanData.headers.csp.policy || "(empty policy)"}
                            </p>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-2 text-white flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-400" />
                              Issues ({Array.isArray(scanData.headers.csp.issues) ? scanData.headers.csp.issues.length : 0})
                            </h4>
                            {Array.isArray(scanData.headers.csp.issues) &&
                            scanData.headers.csp.issues.length ? (
                              <ul className="list-disc list-inside text-sm text-red-400 space-y-1">
                                {scanData.headers.csp.issues.map((issue, idx) => (
                                  <li key={idx}>{issue}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-green-400 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                No issues found
                              </p>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2 text-white">Directives</h4>
                            {scanData.headers.csp.directives &&
                            Object.keys(scanData.headers.csp.directives).length ? (
                              <div className="text-sm text-gray-300 space-y-2 max-h-60 overflow-y-auto">
                                {Object.entries(
                                  scanData.headers.csp.directives
                                ).map(([k, vals]) => (
                                  <div key={k} className="bg-gray-900 p-2 rounded">
                                    <span className="font-medium text-blue-400">{k}:</span>{" "}
                                    <span className="text-gray-300">
                                      {Array.isArray(vals) ? vals.join(" ") : String(vals)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400">No directives found</p>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400">No CSP data available.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Benchmark */}
                {activeTab === "benchmark" && (
                  <div className="bg-black p-4 sm:p-6 rounded-xl border border-white">
                    {scanData?.headers?._benchmark ? (
                      <>
                        <div className="flex items-center gap-2 mb-4">
                          <BarChart className="text-slate-400" />
                          <h3 className="text-lg font-semibold text-white">Security Benchmark</h3>
                          <div className="ml-auto">
                            <span className="text-2xl font-bold text-blue-400">
                              {scanData.headers._benchmark.grade}
                            </span>
                            <span className="text-sm text-gray-400 ml-1">Grade</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-400 mb-4">
                          Compared against the last {scanData.headers._benchmark.comparedTo} scans for this domain.
                        </p>
                        
                        {scanData.headers._benchmark.deltas && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-black p-4 rounded border border-white">
                              <h4 className="font-semibold mb-3 text-white">Performance Deltas</h4>
                              <div className="space-y-2 text-sm">
                                {Object.entries(scanData.headers._benchmark.deltas).map(([key, delta]) => {
                                  const label = key
                                    .replace(/([A-Z])/g, ' $1')
                                    .replace(/^./, str => str.toUpperCase())
                                    .replace('Delta', '');
                                  const isImprovement = delta < 0;
                                  return (
                                    <div key={key} className="flex items-center justify-between">
                                      <span className="text-gray-300">{label}:</span>
                                      <span className={`font-medium ${
                                        isImprovement ? 'text-green-400' : 
                                        delta > 0 ? 'text-red-400' : 'text-gray-400'
                                      }`}>
                                        {delta > 0 ? '+' : ''}{delta}
                                        {isImprovement && ' ↓'}
                                        {delta > 0 && ' ↑'}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="bg-black p-4 rounded border border-white">
                              <h4 className="font-semibold mb-3 text-white">Recommendations</h4>
                              <div className="text-sm text-gray-300 space-y-2">
                                <p>• Negative deltas indicate improvement</p>
                                <p>• Focus on critical and high-severity issues first</p>
                                <p>• For grades C or D, prioritize security headers and CSP</p>
                                {scanData.headers._benchmark.grade === 'D' && (
                                  <p className="text-red-400">• Immediate attention required for security posture</p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <BarChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400">Benchmark data not available.</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Run more scans to establish baseline metrics.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* History */}
                {activeTab === "history" && (
                  <div className="bg-black p-4 sm:p-6 rounded-xl border border-white">
                    <div className="flex items-center gap-2 mb-4">
                      <History className="text-slate-400" />
                      <h3 className="text-lg font-semibold text-white">Scan History</h3>
                    </div>
                    {!history ? (
                      <div className="text-center py-4">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-400">Loading history...</p>
                      </div>
                    ) : history?.error ? (
                      <div className="text-center py-8">
                        <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                        <p className="text-red-400 text-sm">{history.error}</p>
                      </div>
                    ) : history?.items?.length ? (
                      <div>
                        <p className="text-sm text-gray-400 mb-4">
                          Showing {history.items.length} recent scans for {history.domain}
                        </p>
                        <div className="overflow-x-auto">
                          <table className="min-w-full bg-black border border-white text-white">
                            <thead>
                              <tr className="bg-black">
                                <th className="px-3 py-2 border-b border-white text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  Date
                                </th>
                                <th className="px-3 py-2 border-b border-white text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  Vulnerabilities
                                </th>
                                <th className="px-3 py-2 border-b border-white text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  Risk Level
                                </th>
                                <th className="px-3 py-2 border-b border-white text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  Grade
                                </th>
                                <th className="px-3 py-2 border-b border-white text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  Response Time
                                </th>
                                <th className="px-3 py-2 border-b border-white text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  SSL Status
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white">
                              {history.items.map((row, i) => (
                                <tr key={i} className="hover:bg-gray-900">
                                  <td className="px-3 py-2 text-xs sm:text-sm text-gray-300">
                                    {new Date(row.timestamp).toLocaleString()}
                                  </td>
                                  <td className="px-3 py-2 text-xs sm:text-sm text-center">
                                    <span className={`font-medium ${
                                      (row.vulnerabilityCount || 0) === 0 ? 'text-green-400' :
                                      (row.vulnerabilityCount || 0) <= 2 ? 'text-yellow-400' :
                                      'text-red-400'
                                    }`}>
                                      {row.vulnerabilityCount ?? "—"}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 text-xs sm:text-sm">
                                    <span className={`${getRiskLevelColor(row.riskLevel)} font-medium`}>
                                      {row.riskLevel?.toUpperCase() || "—"}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 text-xs sm:text-sm text-center">
                                    <span className="text-blue-400 font-medium">
                                      {row?.headers?._benchmark?.grade || "—"}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 text-xs sm:text-sm text-gray-300 text-center">
                                    {typeof row.timespan === "number" ? `${row.timespan} ms` : "—"}
                                  </td>
                                  <td className="px-3 py-2 text-xs sm:text-sm text-center">
                                    {row.ssl?.valid !== undefined ? (
                                      <span className={row.ssl.valid ? 'text-green-400' : 'text-red-400'}>
                                        {row.ssl.valid ? '✓' : '✗'}
                                      </span>
                                    ) : '—'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400">No scan history available.</p>
                        <p className="text-sm text-gray-500 mt-2">
                          This is the first scan for this domain.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Download PDF Button */}
                {scanData && (
                  <div className="flex justify-center sm:justify-end mt-6 pt-4 border-t border-white">
                    <button
                      onClick={generatePDF}
                      className="bg-red-600 hover:bg-red-500 text-white py-2 px-6 rounded border border-white flex items-center gap-2 transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">Download PDF Report</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}     