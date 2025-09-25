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
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Responsive Vulnerability Scanner component
 * - Keeps original logic (validateUrl, fetchHistory, handleSubmit, generatePDF, etc.)
 * - Adds mobile-first responsive Tailwind classes
 * - Ensures tables are horizontally scrollable on small screens
 * - Buttons are full-width on mobile, inline on larger screens
 * - Reduces large paddings and images on small screens
 *
 * Replace your existing component file with this. All original features preserved.
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

    autoTable(doc, {
      startY: 44,
      head: [["Header", "Value"]],
      body: keyRows,
    });

    // Vulnerabilities table
    if (Array.isArray(scanData.vulnerabilities) && scanData.vulnerabilities.length) {
      const vulnerabilityData = scanData.vulnerabilities.map((v) => [
        (v.severity || "").toUpperCase(),
        (v.type || "").replace(/_/g, " "),
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

                  <div className="mt-2 sm:mt-0">
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

              {/* Top stats - stacked on mobile, grid on md+ */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  icon={<Shield className="text-green-400" size={20} />}
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
                      {scanData.vulnerabilityCount || 0}
                    </span>
                  }
                  hint="Vulnerabilities detected"
                  icon={<FileText className="text-red-400" size={20} />}
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
                  <div className="bg-black p-4 rounded-xl border border-white">
                    <h3 className="text-lg font-semibold mb-3 text-white">
                      Summary
                    </h3>
                    <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                      <li>
                        Status:{" "}
                        <span className={getRiskLevelColor(scanData.riskLevel)}>
                          {scanData.riskLevel?.toUpperCase() || "—"}
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
                              Recommendation
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white">
                          {scanData.vulnerabilities.map((v, i) => (
                            <tr key={i} className="hover:bg-gray-900 align-top">
                              <td className="px-4 py-3 whitespace-nowrap align-top">
                                <span
                                  className={`inline-block px-2 py-1 text-xs rounded-full border ${getSeverityColor(
                                    v.severity
                                  )}`}
                                >
                                  {v.severity?.toUpperCase()}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white align-top">
                                {(v.type || "").replace(/_/g, " ")}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-300 align-top max-w-[28rem] break-words">
                                <div>
                                  <p>{v.description}</p>
                                  {v.details && (
                                    <p className="text-xs mt-1 text-gray-500">
                                      {v.details}
                                    </p>
                                  )}
                                </div>
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
                                <span
                                  className={
                                    scanData.ssl.valid
                                      ? "text-green-400 font-medium"
                                      : "text-red-400 font-medium"
                                  }
                                >
                                  {scanData.ssl.valid ? "Valid" : "Invalid"}
                                </span>
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
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold mb-1 text-white">
                            Content-Security-Policy
                          </h3>
                          <p className="text-sm text-gray-300 break-words">
                            {scanData.headers.csp.present
                              ? scanData.headers.csp.policy || "(empty policy)"
                              : "Missing CSP header"}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-2 text-white">Issues</h4>
                            {Array.isArray(scanData.headers.csp.issues) &&
                            scanData.headers.csp.issues.length ? (
                              <ul className="list-disc list-inside text-sm text-red-400">
                                {scanData.headers.csp.issues.map((i, idx) => (
                                  <li key={idx}>{i}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-green-400">None</p>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2 text-white">Directives</h4>
                            {scanData.headers.csp.directives &&
                            Object.keys(scanData.headers.csp.directives).length ? (
                              <ul className="text-sm text-gray-300 space-y-1">
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
                              <p className="text-sm text-gray-400">—</p>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-400">No CSP data available.</p>
                    )}
                  </div>
                )}

                {/* Benchmark */}
                {activeTab === "benchmark" && (
                  <div className="bg-black p-4 sm:p-6 rounded-xl border border-white">
                    {scanData?.headers?._benchmark ? (
                      <>
                        <div className="flex items-center gap-2 mb-3">
                          <BarChart className="text-slate-400" />
                          <h3 className="text-lg font-semibold text-white">Benchmark</h3>
                        </div>
                        <p className="text-sm text-gray-400 mb-4">
                          Compared against last {scanData.headers._benchmark.comparedTo} scans for this domain.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-black p-3 rounded border border-white">
                            <div className="text-sm text-gray-300">
                              <div className="mb-1">
                                <span className="font-medium text-white">Grade:</span>{" "}
                                <span className="text-slate-300">
                                  {scanData.headers._benchmark.grade}
                                </span>
                              </div>
                              {scanData.headers._benchmark.deltas && (
                                <ul className="list-disc list-inside text-sm text-gray-300">
                                  <li>
                                    Vuln Count Δ: {scanData.headers._benchmark.deltas.vulnCountDelta}
                                  </li>
                                  <li>
                                    Missing Sec Headers Δ: {scanData.headers._benchmark.deltas.missingSecHeadersDelta}
                                  </li>
                                  <li>
                                    Weak Cookies Δ: {scanData.headers._benchmark.deltas.weakCookiesDelta}
                                  </li>
                                  <li>
                                    CSP Issues Δ: {scanData.headers._benchmark.deltas.cspIssuesDelta}
                                  </li>
                                </ul>
                              )}
                            </div>
                          </div>
                          <div className="bg-black p-3 rounded border border-white">
                            <div className="text-sm text-gray-300">
                              <div className="mb-1 font-medium text-white">Notes</div>
                              <p className="text-sm text-gray-400">
                                Negative deltas are good (improvement). If the grade is
                                C or D, prioritize fixing missing security headers and
                                CSP issues first.
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-400">Benchmark not available.</p>
                    )}
                  </div>
                )}

                {/* Download PDF Button */}
                <div className="flex justify-center sm:justify-end mt-4">
                  <button
                    onClick={generatePDF}
                    className="bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded border border-white flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">Download PDF Report</span>
                  </button>
                </div>

                {/* History */}
                {activeTab === "history" && (
                  <div className="bg-black p-4 sm:p-6 rounded-xl border border-white">
                    <div className="flex items-center gap-2 mb-3">
                      <History className="text-slate-400" />
                      <h3 className="text-lg font-semibold text-white">Recent History</h3>
                    </div>
                    {!history ? (
                      <p className="text-gray-400">Loading…</p>
                    ) : history?.error ? (
                      <p className="text-red-400 text-sm">{history.error}</p>
                    ) : history?.items?.length ? (
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
                                Risk
                              </th>
                              <th className="px-3 py-2 border-b border-white text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Grade
                              </th>
                              <th className="px-3 py-2 border-b border-white text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Time
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white">
                            {history.items.map((row, i) => (
                              <tr key={i} className="hover:bg-gray-900">
                                <td className="px-3 py-2 text-xs sm:text-sm text-gray-300">
                                  {new Date(row.timestamp).toLocaleString()}
                                </td>
                                <td className="px-3 py-2 text-xs sm:text-sm text-gray-300">
                                  {row.vulnerabilityCount ?? "—"}
                                </td>
                                <td className="px-3 py-2 text-xs sm:text-sm">
                                  <span className={`${getRiskLevelColor(row.riskLevel)} font-medium`}>
                                    {row.riskLevel?.toUpperCase() || "—"}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-xs sm:text-sm text-gray-300">
                                  {row?.headers?._benchmark?.grade || "—"}
                                </td>
                                <td className="px-3 py-2 text-xs sm:text-sm text-gray-300">
                                  {typeof row.timespan === "number" ? `${row.timespan} ms` : "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-400">No history.</p>
                    )}
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
