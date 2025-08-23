"use client";

import { useState } from "react";
import {
  Shield, CheckCircle, XCircle, AlertTriangle, Globe, Lock,
  FileText, FileDown
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white border border-green-100 px-3 py-2">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  );
}

export default function HttpsCheckerPage() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    if (!domain) {
      setError("Please enter a domain name");
      return;
    }

    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    
    if (!domainRegex.test(cleanDomain)) {
      setError("Please enter a valid domain name (e.g., example.com)");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_PROD_API_URL;
      if (!apiUrl) {
        setError("API URL is not configured. Please set NEXT_PUBLIC_PROD_API_URL environment variable.");
        return;
      }

      const res = await fetch(`${apiUrl}/http/https-enforcement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: cleanDomain }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 404) {
          setError("Domain not found. Please check the domain name and try again.");
        } else {
          setError(`API error (${res.status}): ${data.error || res.statusText}`);
        }
        return;
      }

      if (data.success) {
        setResult(data);
      } else {
        if (data.error && (
          data.error.toLowerCase().includes('not found') ||
          data.error.toLowerCase().includes('does not exist') ||
          data.error.toLowerCase().includes('invalid domain') ||
          data.error.toLowerCase().includes('nxdomain')
        )) {
          setError("Domain not found. Please check the domain name and try again.");
        } else {
          setError(data.error || "Unknown error occurred");
        }
      }
    } catch (err) {
      console.error("Error during HTTPS check:", err);
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError("Unable to connect to the API. Please check your internet connection.");
      } else {
        setError(`Network error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleCheck();
  };

  const renderRecommendations = () => {
    if (!result) return null;
    const recs = [];

    if (!result.httpRedirectsToHttps) {
      recs.push({
        icon: <XCircle className="w-5 h-5 text-red-500" />,
        text: "The site does NOT redirect HTTP traffic to HTTPS. This can expose users to insecure connections and man-in-the-middle attacks.",
        type: "error"
      });
    }

    if (!result.hstsEnabled) {
      recs.push({
        icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
        text: "The site does NOT have the Strict-Transport-Security (HSTS) header enabled. Without HSTS, browsers won't remember to always use HTTPS.",
        type: "warning"
      });
    } else if (result.hstsMaxAge && result.hstsMaxAge < 15768000) {
      recs.push({
        icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
        text: `The HSTS max-age is set to ${result.hstsMaxAge.toLocaleString()} seconds, which is below the recommended 6 months (15,768,000 seconds).`,
        type: "warning"
      });
    }

    if (recs.length === 0) {
      recs.push({
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        text: "HTTPS enforcement is excellent! The site has proper redirection and HSTS configuration.",
        type: "success"
      });
    }

    return (
      <div className="mt-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-green-800">Security Recommendations</h3>
        </div>
        <div className="space-y-3">
          {recs.map((rec, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
              {rec.icon}
              <p className="text-sm text-gray-700 leading-relaxed">{rec.text}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ---------- EXPORT HELPERS ----------

  const safeName = (name) =>
    String(name || "site").replace(/[^a-z0-9.-]/gi, "_").toLowerCase();

  const buildSummaryRows = (r) => ([
    ["Target", r.target || "-"],
    ["HTTP → HTTPS Redirect", r.httpRedirectsToHttps ? "Enabled" : "Disabled"],
    ["HSTS Enabled", r.hstsEnabled ? "Yes" : "No"],
    ["HSTS max-age", r.hstsMaxAge != null ? String(r.hstsMaxAge) : "—"],
  ]);

  const buildAdditionalRows = (ai) => {
    if (!ai) return [];
    return [
      ["HTTP Version", ai.httpVersion ?? "—"],
      ["ALPN", ai.alpn ?? "—"],
      ["TLS Protocol", ai.tlsProtocol ?? "—"],
      ["TLS Cipher", ai.tlsCipher ?? "—"],
      ["Server", ai.server ?? "—"],
      ["X-Powered-By", ai.xPoweredBy ?? "—"],
      ["CDN Provider", ai.cdnProvider ?? "—"],
      ["Cache-Control", ai.cacheControl ?? "—"],
      ["CSP", ai.csp?.enabled ? (ai.csp.reportOnly ? "Report-Only" : "Enabled") : "Not set"],
      ["HSTS includeSubDomains", String(ai.hsts?.includeSubDomains ?? false)],
      ["HSTS preload flag", String(ai.hsts?.preload ?? false)],
      ["HSTS preload-ready", String(ai.hsts?.preloadReady ?? false)],
      ["Redirect Status", String(ai.redirect?.fromHttpStatus ?? "—")],
      ["Redirect Location", ai.redirect?.location || "—"],
    ];
  };

  const handleDownloadPDF = () => {
    if (!result) return;

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const M = 40;
    let y = 56;

    const H = (txt) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(txt, M, y);
      y += 18;
    };
    const sub = (txt) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(txt, M, y);
      y += 16;
    };

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("HTTPS Security Report", M, y);
    y += 24;
    sub(`Generated: ${new Date().toLocaleString()}`);
    sub(`Target: ${result.target}`);

    // Summary
    y += 6;
    H("Summary");
    autoTable(doc, {
      startY: y,
      head: [["Field", "Value"]],
      body: buildSummaryRows(result),
      styles: { font: "helvetica", fontSize: 10 },
      margin: { left: M, right: M },
    });
    y = doc.lastAutoTable.finalY + 16;

    // Missing headers
    H("Missing Headers");
    autoTable(doc, {
      startY: y,
      head: [["Header"]],
      body: (result.missingHeaders?.length ? result.missingHeaders : ["None"]).map(h => [h]),
      styles: { fontSize: 10 },
      margin: { left: M, right: M },
    });
    y = doc.lastAutoTable.finalY + 16;

    // Upcoming headers
    H("Upcoming / Modern Hardening Headers");
    autoTable(doc, {
      startY: y,
      head: [["Header"]],
      body: (result.upcomingHeaders?.length ? result.upcomingHeaders : ["None"]).map(h => [h]),
      styles: { fontSize: 10 },
      margin: { left: M, right: M },
    });
    y = doc.lastAutoTable.finalY + 16;

    // Additional info
    H("Additional Information");
    autoTable(doc, {
      startY: y,
      head: [["Field", "Value"]],
      body: buildAdditionalRows(result.additionalInfo),
      styles: { fontSize: 10 },
      margin: { left: M, right: M },
      columnStyles: { 0: { cellWidth: 180 }, 1: { cellWidth: 320 } },
    });
    y = doc.lastAutoTable.finalY + 16;

    // Raw headers (truncate to keep file small)
    const raw = result.rawHeaders || {};
    const entries = Object.entries(raw);
    const MAX_RAW = 40;
    H("Raw Headers");
    autoTable(doc, {
      startY: y,
      head: [["Header", "Value"]],
      body: (entries.length ? entries.slice(0, MAX_RAW) : [["—", "—"]]).map(([k, v]) => [k, String(v)]),
      styles: { fontSize: 9 },
      margin: { left: M, right: M },
      columnStyles: { 0: { cellWidth: 180 }, 1: { cellWidth: 320 } },
    });
    if (entries.length > MAX_RAW) {
      const lastY = doc.lastAutoTable.finalY + 14;
      doc.setFontSize(10);
      doc.text(`…and ${entries.length - MAX_RAW} more headers truncated.`, M, lastY);
    }

    doc.save(`HTTPS_Report_${safeName(result.target)}.pdf`);
  };

  const handleDownloadTXT = () => {
    if (!result) return;

    const lines = [];
    const ai = result.additionalInfo || {};
    const raw = result.rawHeaders || {};

    lines.push("HTTPS Security Report");
    lines.push("====================================");
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push(`Target:    ${result.target}`);
    lines.push("");
    lines.push("Summary");
    lines.push("------------------------------------");
    buildSummaryRows(result).forEach(([k, v]) => lines.push(`${k}: ${v}`));
    lines.push("");

    lines.push("Missing Headers");
    lines.push("------------------------------------");
    if (result.missingHeaders?.length) result.missingHeaders.forEach(h => lines.push(h));
    else lines.push("None");
    lines.push("");

    lines.push("Upcoming / Modern Hardening Headers");
    lines.push("------------------------------------");
    if (result.upcomingHeaders?.length) result.upcomingHeaders.forEach(h => lines.push(h));
    else lines.push("None");
    lines.push("");

    lines.push("Additional Information");
    lines.push("------------------------------------");
    buildAdditionalRows(ai).forEach(([k, v]) => lines.push(`${k}: ${v}`));
    lines.push("");

    lines.push("Raw Headers");
    lines.push("------------------------------------");
    Object.entries(raw).forEach(([k, v]) => lines.push(`${k}: ${String(v)}`));

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `HTTPS_Report_${safeName(result.target)}.txt`;
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(link.href);
    link.remove();
  };

  // ---------- UI ----------

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
      <div className="max-w-2xl mx-auto pt-10">
        {/* Header */}
        <div className="text-center mb-8">
          <img src="/https-security.png" alt="verify" className="w-16 h-20 mb-4 mt-7" />
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Lock className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              HTTPS Security Checker
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Verify your website's HTTPS configuration and security headers
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white shadow-xl rounded-2xl p-8 border border-green-100">
          {/* Input Section */}
          <div className="space-y-4 mb-6">
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
              <input
                type="text"
                placeholder="Enter domain (e.g., example.com)"
                value={domain}
                onChange={(e) => setDomain(e.target.value.trim())}
                onKeyPress={handleKeyPress}
                className="w-full pl-12 pr-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-gray-700 outline-none"
              />
            </div>
            
            <button
              onClick={handleCheck}
              disabled={loading || !domain}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analyzing Security...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Shield className="w-5 h-5" />
                  Check HTTPS Security
                </div>
              )}
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700 font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Results Display */}
          {result && (
            <div className="space-y-6">
              {/* Header + Actions */}
              <div className="flex items-center justify-between pb-4 border-b border-green-100">
                <div className="text-center md:text-left">
                  <h2 className="text-xl font-semibold text-gray-800 mb-1">
                    Security Analysis for
                  </h2>
                  <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {result.target}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadPDF}
                    className="h-10 px-4 rounded-lg border border-green-700 text-green-700 hover:bg-green-50 transition"
                    title="Download PDF"
                  >
                    <div className="inline-flex items-center gap-2">
                      <FileText className="h-4 w-4" /> PDF
                    </div>
                  </button>
                  <button
                    onClick={handleDownloadTXT}
                    className="h-10 px-4 rounded-lg border border-green-700 text-green-700 hover:bg-green-50 transition"
                    title="Download TXT"
                  >
                    <div className="inline-flex items-center gap-2">
                      <FileDown className="h-4 w-4" /> TXT
                    </div>
                  </button>
                </div>
              </div>

              {/* Results Grid */}
              <div className="grid gap-4">
                {/* HTTP Redirect */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3">
                    {result.httpRedirectsToHttps ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500" />
                    )}
                    <span className="font-medium text-gray-700">HTTP → HTTPS Redirect</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    result.httpRedirectsToHttps 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {result.httpRedirectsToHttps ? "Enabled" : "Disabled"}
                  </span>
                </div>

                {/* HSTS */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3">
                    {result.hstsEnabled ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-yellow-500" />
                    )}
                    <span className="font-medium text-gray-700">HSTS Header</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    result.hstsEnabled 
                      ? "bg-green-100 text-green-800" 
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {result.hstsEnabled ? "Enabled" : "Disabled"}
                  </span>
                </div>

                {/* HSTS Max Age */}
                {result.hstsEnabled && result.hstsMaxAge && (
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <div className="flex items-center gap-3">
                      <Shield className="w-6 h-6 text-green-500" />
                      <span className="font-medium text-gray-700">HSTS Max-Age</span>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                      {Number(result.hstsMaxAge).toLocaleString()} seconds
                    </span>
                  </div>
                )}
              </div>

              {/* Missing Headers */}
              <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                <h3 className="font-semibold text-red-800 mb-3">Missing Headers</h3>
                {result.missingHeaders?.length ? (
                  <ul className="list-disc list-inside space-y-1 text-red-800">
                    {result.missingHeaders.map((h) => (
                      <li key={h} className="text-sm">{h}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-red-800">None 🎉</p>
                )}
              </div>

              {/* Upcoming / Modern Hardening Headers */}
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                <h3 className="font-semibold text-amber-800 mb-3">Upcoming Headers (Modern Hardening)</h3>
                {result.upcomingHeaders?.length ? (
                  <ul className="list-disc list-inside space-y-1 text-amber-900">
                    {result.upcomingHeaders.map((h) => (
                      <li key={h} className="text-sm">{h}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-amber-900">All modern hardening headers present (or not applicable).</p>
                )}
                <p className="mt-2 text-xs text-amber-700">
                  Tip: Consider adding COOP/COEP/CORP to strengthen isolation; review impact on embedded content.
                </p>
              </div>

              {/* Additional Information */}
              <div className="rounded-xl border border-green-200 bg-green-50 p-5">
                <h3 className="font-semibold text-green-800 mb-4">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <InfoRow label="HTTP Version" value={result.additionalInfo?.httpVersion || "—"} />
                  <InfoRow label="ALPN" value={result.additionalInfo?.alpn || "—"} />
                  <InfoRow label="TLS Protocol" value={result.additionalInfo?.tlsProtocol || "—"} />
                  <InfoRow label="TLS Cipher" value={result.additionalInfo?.tlsCipher || "—"} />
                  <InfoRow label="Server" value={result.additionalInfo?.server || "—"} />
                  <InfoRow label="X-Powered-By" value={result.additionalInfo?.xPoweredBy || "—"} />
                  <InfoRow label="CDN Provider" value={result.additionalInfo?.cdnProvider || "—"} />
                  <InfoRow label="Cache-Control" value={result.additionalInfo?.cacheControl || "—"} />
                </div>

                {/* HSTS details */}
                <div className="mt-4 text-sm">
                  <h4 className="font-medium text-green-900 mb-2">HSTS Details</h4>
                  <ul className="list-disc list-inside space-y-1 text-green-900">
                    <li>includeSubDomains: {String(result.additionalInfo?.hsts?.includeSubDomains ?? false)}</li>
                    <li>preload flag: {String(result.additionalInfo?.hsts?.preload ?? false)}</li>
                    <li>Preload-ready: {String(result.additionalInfo?.hsts?.preloadReady ?? false)}</li>
                  </ul>
                </div>

                {/* Redirect details */}
                <div className="mt-4 text-sm">
                  <h4 className="font-medium text-green-900 mb-2">Redirect</h4>
                  <div className="space-y-1 text-green-900">
                    <div>Status (HTTP → HTTPS): {result.additionalInfo?.redirect?.fromHttpStatus ?? "—"}</div>
                    <div>Location: {result.additionalInfo?.redirect?.location || "—"}</div>
                  </div>
                </div>
              </div>

              {/* Raw Headers */}
              <div className="rounded-xl border border-gray-200 bg-gray-50">
                <div className="px-4 py-3 border-b bg-gray-100 font-semibold">Raw Headers</div>
                <div className="p-4 overflow-auto">
                  <pre className="text-xs text-gray-800 whitespace-pre-wrap">
{JSON.stringify(result.rawHeaders || {}, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Recommendations */}
              {renderRecommendations()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
