"use client";

import React, { useState } from "react";
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Globe,
  FileText,
  FileDown,
  ListChecks,
  Info,
  Rows,
  Loader2,
  Lock,
  ArrowRight
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";
import OwnershipVerificationWizard from "@/components/ownership/OwnershipVerificationWizard";

function Badge({ ok, yesText = "Enabled", noText = "Disabled" }) {
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full font-mono font-bold text-[9px] uppercase tracking-wider ${
        ok 
          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
          : "bg-red-500/10 text-red-400 border border-red-500/20"
      }`}
    >
      {ok ? yesText : noText}
    </span>
  );
}

function Pill({ text }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-xl border border-blue-500/30 bg-blue-500/5 text-blue-400 text-[10px] font-mono font-semibold uppercase tracking-wider">
      {text}
    </span>
  );
}

function KV({ k, v }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-zinc-900/40 border border-zinc-850 px-3.5 py-2.5 font-mono text-xs">
      <span className="text-zinc-450">{k}</span>
      <span className="font-semibold text-zinc-200 break-all">{v}</span>
    </div>
  );
}

export default function HttpsCheckerPage() {
  const SKIP_DOMAIN_VERIFICATION_FOR_TESTING = true;

  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [ownershipVerified, setOwnershipVerified] = useState(false);
  const protectedAction = useProtectedAction();

  const handleCheck = async () => {
    if (!domain) {
      setError("Please enter a domain name");
      return;
    }
    const domainRegex =
      /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (!domainRegex.test(cleanDomain)) {
      setError("Please enter a valid domain name (e.g., example.com)");
      return;
    }
    if (!ownershipVerified && !SKIP_DOMAIN_VERIFICATION_FOR_TESTING) {
      setError("Verify ownership of this domain before checking HTTPS security.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    await protectedAction(async (token) => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_PROD_API_URL;
        if (!apiUrl) {
          setError(
            "API URL is not configured. Please set NEXT_PUBLIC_PROD_API_URL environment variable."
          );
          return;
        }
        const res = await fetch(`${apiUrl}/http/https-enforcement`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ target: cleanDomain }),
        });

        const data = await res.json();
        if (!res.ok) {
          if (res.status === 404) {
            setError(
              "Domain not found. Please check the domain name and try again."
            );
          } else {
            setError(
              `API error (${res.status}): ${data.error || res.statusText}`
            );
          }
          return;
        }
        if (data.success) {
          setResult(data);
        } else {
          if (
            data.error &&
            (data.error.toLowerCase().includes("not found") ||
              data.error.toLowerCase().includes("does not exist") ||
              data.error.toLowerCase().includes("invalid domain") ||
              data.error.toLowerCase().includes("nxdomain"))
          ) {
            setError(
              "Domain not found. Please check the domain name and try again."
            );
          } else {
            setError(data.error || "Unknown error occurred");
          }
        }
      } catch (err) {
        console.error("Error during HTTPS check:", err);
        if (err.name === "TypeError" && err.message.includes("fetch")) {
          setError(
            "Unable to connect to the API. Please check your internet connection."
          );
        } else {
          setError(`Network error: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleCheck();
  };

  const renderRecommendations = () => {
    if (!result) return null;
    const recs = [];
    if (!result.httpRedirectsToHttps) {
      recs.push({
        icon: <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />,
        text: "The site does NOT redirect HTTP traffic to HTTPS. This can expose users to insecure connections and man-in-the-middle attacks.",
      });
    }
    if (!result.hstsEnabled) {
      recs.push({
        icon: <AlertTriangle className="w-4 h-4 text-orange-450 mt-0.5 flex-shrink-0" />,
        text: "The site does NOT have the Strict-Transport-Security (HSTS) header enabled. Without HSTS, browsers won't remember to always use HTTPS.",
      });
    } else if (result.hstsMaxAge && result.hstsMaxAge < 15768000) {
      recs.push({
        icon: <AlertTriangle className="w-4 h-4 text-orange-450 mt-0.5 flex-shrink-0" />,
        text: `The HSTS max-age is set to ${result.hstsMaxAge.toLocaleString()} seconds, which is below the recommended 6 months (15,768,000 seconds).`,
      });
    }
    if (result.missingHeaders?.length) {
      recs.push({
        icon: <ListChecks className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />,
        text: `Missing recommended security headers: ${result.missingHeaders.join(", ")}.`,
      });
    }
    if (recs.length === 0) {
      recs.push({
        icon: <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />,
        text: "HTTPS enforcement is excellent! The site has proper redirection and HSTS configuration.",
      });
    }
    return (
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-5 shadow-lg space-y-4 font-mono text-xs">
        <h3 className="text-sm font-mono font-bold text-zinc-200 flex items-center gap-2 border-b border-zinc-850 pb-2.5">
          <Shield className="w-4 h-4 text-blue-400" />
          Security Recommendations
        </h3>
        <div className="space-y-3.5">
          {recs.map((rec, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 bg-zinc-950/20 rounded-xl border border-zinc-800/80 text-zinc-350"
            >
              {rec.icon}
              <p className="text-xs leading-relaxed">{rec.text}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const safeName = (name) =>
    String(name || "site")
      .replace(/[^a-z0-9.-]/gi, "_")
      .toLowerCase();

  const buildSummaryRows = (r) => [
    ["Target Domain", r.target || "-"],
    ["HTTP → HTTPS Redirect", r.httpRedirectsToHttps ? "Enabled" : "Disabled"],
    ["HSTS Enabled", r.hstsEnabled ? "Yes" : "No"],
    ["HSTS max-age (seconds)", r.hstsMaxAge != null ? String(r.hstsMaxAge) : "—"],
  ];

  const buildAdditionalRows = (ai) => {
    if (!ai) return [];
    return [
      ["HTTP Version", ai.httpVersion ?? "—"],
      ["ALPN Support", ai.alpn ?? "—"],
      ["TLS Protocol Version", ai.tlsProtocol ?? "—"],
      ["TLS Cipher Suite", ai.tlsCipher ?? "—"],
      ["Web Server", ai.server ?? "—"],
      ["X-Powered-By", ai.xPoweredBy ?? "—"],
      ["CDN Provider", ai.cdnProvider ?? "—"],
      ["Cache-Control", ai.cacheControl ?? "—"],
      [
        "CSP Policy",
        ai.csp?.enabled
          ? ai.csp.reportOnly
            ? "Report-Only"
            : "Enabled"
          : "Not set",
      ],
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

    // Header Banner
    doc.setFillColor(18, 18, 18);
    doc.rect(0, 0, doc.internal.pageSize.width, 80, "F");
    
    doc.setTextColor(59, 130, 246);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("NEXCORE SECURITY PLATFORM", M, 35);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text("HTTPS SECURITY AUDIT REPORT", M, 55);
    y = 110;

    doc.setTextColor(50, 50, 50);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, M, y);
    doc.text(`Target Host: ${result.target}`, M, y + 16);
    y += 36;

    autoTable(doc, {
      startY: y,
      head: [["Field", "Value"]],
      body: buildSummaryRows(result),
      headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
      styles: { fontSize: 10 },
      margin: { left: M, right: M },
    });
    y = doc.lastAutoTable.finalY + 16;

    autoTable(doc, {
      startY: y,
      head: [["Missing Recommended Headers"]],
      body: (result.missingHeaders?.length
        ? result.missingHeaders
        : ["None"]
      ).map((h) => [h]),
      headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
      styles: { fontSize: 10 },
      margin: { left: M, right: M },
    });
    y = doc.lastAutoTable.finalY + 16;

    autoTable(doc, {
      startY: y,
      head: [["Upcoming / Modern Hardening Headers"]],
      body: (result.upcomingHeaders?.length
        ? result.upcomingHeaders
        : ["None"]
      ).map((h) => [h]),
      headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
      styles: { fontSize: 10 },
      margin: { left: M, right: M },
    });
    y = doc.lastAutoTable.finalY + 16;

    autoTable(doc, {
      startY: y,
      head: [["Additional Host Information", "Value"]],
      body: buildAdditionalRows(result.additionalInfo),
      headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
      styles: { fontSize: 10 },
      margin: { left: M, right: M },
      columnStyles: { 0: { cellWidth: 180 }, 1: { cellWidth: 320 } },
    });
    y = doc.lastAutoTable.finalY + 16;

    const raw = result.rawHeaders || {};
    const entries = Object.entries(raw);
    const MAX_RAW = 40;
    
    autoTable(doc, {
      startY: y,
      head: [["Raw Response Header", "Value"]],
      body: (entries.length ? entries.slice(0, MAX_RAW) : [["—", "—"]]).map(
        ([k, v]) => [k, String(v)]
      ),
      headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
      styles: { fontSize: 9 },
      margin: { left: M, right: M },
      columnStyles: { 0: { cellWidth: 180 }, 1: { cellWidth: 320 } },
    });
    if (entries.length > MAX_RAW) {
      const lastY = doc.lastAutoTable.finalY + 14;
      doc.setFontSize(10);
      doc.text(
        `…and ${entries.length - MAX_RAW} more headers truncated.`,
        M,
        lastY
      );
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
    if (result.missingHeaders?.length)
      result.missingHeaders.forEach((h) => lines.push(h));
    else lines.push("None");
    lines.push("");
    lines.push("Upcoming / Modern Hardening Headers");
    lines.push("------------------------------------");
    if (result.upcomingHeaders?.length)
      result.upcomingHeaders.forEach((h) => lines.push(h));
    else lines.push("None");
    lines.push("");
    lines.push("Additional Information");
    lines.push("------------------------------------");
    buildAdditionalRows(ai).forEach(([k, v]) => lines.push(`${k}: ${v}`));
    lines.push("");
    lines.push("Raw Headers");
    lines.push("------------------------------------");
    Object.entries(raw).forEach(([k, v]) => lines.push(`${k}: ${String(v)}`));
    const blob = new Blob([lines.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `HTTPS_Report_${safeName(result.target)}.txt`;
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(link.href);
    link.remove();
  };

  const RawHeadersGrid = ({ headers }) => {
    const entries = Object.entries(headers || {});
    if (!entries.length) {
      return (
        <div className="text-zinc-550 font-mono">
          No raw response headers found.
        </div>
      );
    }
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {entries.map(([k, v]) => {
          const val = String(v ?? "—");
          const short = val.length > 80 ? val.slice(0, 80) + "…" : val;
          return (
            <div
              key={k}
              className="rounded-xl bg-zinc-900/40 border border-zinc-850 px-3.5 py-2.5 font-mono text-xs flex flex-col justify-between"
              title={`${k}: ${val}`}
            >
              <div className="text-zinc-500 font-mono text-[10px] mb-1 uppercase tracking-wider">{k}</div>
              <div className="text-zinc-200 break-all">{short}</div>
            </div>
          );
        })}
      </div>
    );
  };

  const ListSection = ({ title, items }) => {
    return (
      <div className="bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-xl space-y-3 font-mono text-xs">
        <h3 className="text-sm font-mono font-bold text-zinc-200 border-b border-zinc-850 pb-2 flex items-center gap-1.5">
          <Terminal className="w-4 h-4 text-blue-400" />
          {title}
        </h3>
        {items?.length ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {items.map((h) => (
              <Pill key={h} text={h} />
            ))}
          </div>
        ) : (
          <div className="text-zinc-550 pt-1">None returned.</div>
        )}
      </div>
    );
  };

  return (
    <div 
      className="tool-detail-page min-h-screen"
      style={{
        '--hero-ambient-a': 'rgba(59, 130, 246, 0.08)',
        '--hero-ambient-b': 'rgba(6, 182, 212, 0.03)',
        '--glow-primary': '0 0 34px rgba(59, 130, 246, 0.16)',
        '--gold': '#3b82f6',
        '--gold-strong': '#60a5fa',
        '--gold-dark': '#1d4ed8',
        '--ring': 'rgba(59, 130, 246, 0.34)',
        '--surface-glow': 'rgba(59, 130, 246, 0.14)',
      }}
    >
      <style>{`
        .tool-detail-page .tool-detail-shell {
          padding-top: 3.5rem !important;
        }
        .tool-detail-page ::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.35) !important;
        }
        .tool-detail-page ::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.55) !important;
        }
        .tool-detail-page ::selection {
          background: rgba(59, 130, 246, 0.22) !important;
          color: #eff6ff !important;
        }
        .tool-detail-page :is(button, [role="button"]):is([class*="bg-blue-"], [class*="bg-sky-"]) {
          color: #000000 !important;
        }
        .tool-detail-page :is(button, [role="button"]):is([class*="bg-blue-"], [class*="bg-sky-"]) * {
          color: #000000 !important;
        }
      `}</style>

      <div className="tool-detail-shell">
        {/* Navigation & Header */}
        <div className="flex justify-end mb-8">
          <span className="rounded-full border border-blue-500/30 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-blue-400">
            Blue Team
          </span>
        </div>

        {/* Title Block */}
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl border border-blue-500/30 overflow-hidden shadow-lg flex-shrink-0 flex items-center justify-center">
            <Lock className="h-8 w-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              HTTPS SECURITY <span className="text-blue-400">CHECKER</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Validate web server TLS configurations, analyze transport layer security redirection protocols, and audit missing HTTP headers.
            </p>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* Form Card */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-blue-500/10 transition-all duration-300 space-y-5">
              <h2 className="text-lg font-mono font-medium text-zinc-100 mb-2 flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-400" />
                Target Host Parameters
              </h2>

              <div className="space-y-4">
                {/* Domain Input */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                    Target Domain Name
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-650" />
                    <input
                      type="text"
                      placeholder="Enter domain (e.g. example.com)"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value.trim())}
                      onKeyPress={handleKeyPress}
                      className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 pl-12 text-sm focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 focus:shadow-[0_0_12px_rgba(59,130,246,0.08)] focus:outline-none transition-all placeholder:text-zinc-600 font-mono"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    onClick={handleCheck}
                    disabled={loading || !domain}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-black rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2 focus:ring-offset-black/20 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        Analyzing TLS Security...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 text-black" />
                        Check HTTPS Security
                      </>
                    )}
                  </button>
                </div>

                {/* Ownership Wizard */}
                <OwnershipVerificationWizard
                  targetValue={domain}
                  targetLabel="Domain"
                  onVerifiedChange={setOwnershipVerified}
                />
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-950/10 text-red-400 text-xs font-mono flex items-start gap-2">
                <XCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>Security Audit Failed: {error}</span>
              </div>
            )}

            {/* Results output */}
            {result && (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-blue-500/10 transition-all duration-300 space-y-6">
                
                {/* Header title + actions */}
                <div className="flex items-center justify-between gap-4 flex-wrap border-b border-zinc-800/40 pb-4">
                  <div>
                    <h3 className="text-lg font-mono font-bold text-zinc-100 uppercase tracking-wider">
                      Security Analysis for
                    </h3>
                    <p className="text-xl font-mono font-bold text-blue-450 mt-0.5">
                      {result.target}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleDownloadPDF}
                      className="px-4 py-2.5 bg-zinc-900/40 hover:bg-blue-500/5 text-zinc-300 hover:text-blue-400 border border-zinc-800/80 hover:border-blue-500/30 rounded-xl font-mono font-bold text-xs uppercase transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      PDF Report
                    </button>
                    <button
                      onClick={handleDownloadTXT}
                      className="px-4 py-2.5 bg-zinc-900/40 hover:bg-blue-500/5 text-zinc-300 hover:text-blue-400 border border-zinc-800/80 hover:border-blue-500/30 rounded-xl font-mono font-bold text-xs uppercase transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      TXT Report
                    </button>
                  </div>
                </div>

                {/* Redirect / HSTS cards */}
                <div className="grid gap-4">
                  
                  {/* Redirect status */}
                  <div className="flex items-center justify-between p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-xl">
                    <div className="flex items-center gap-3">
                      {result.httpRedirectsToHttps ? (
                        <CheckCircle className="w-5 h-5 text-blue-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className="font-mono text-xs uppercase tracking-wider text-zinc-300 font-semibold">
                        HTTP → HTTPS Redirect
                      </span>
                    </div>
                    <Badge ok={result.httpRedirectsToHttps} />
                  </div>

                  {/* HSTS Status */}
                  <div className="flex items-center justify-between p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-xl">
                    <div className="flex items-center gap-3">
                      {result.hstsEnabled ? (
                        <CheckCircle className="w-5 h-5 text-blue-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className="font-mono text-xs uppercase tracking-wider text-zinc-300 font-semibold">
                        Strict Transport Security (HSTS)
                      </span>
                    </div>
                    <Badge ok={result.hstsEnabled} yesText="Yes" noText="No" />
                  </div>

                </div>

                {/* Recommendations */}
                {renderRecommendations()}

                {/* Missing headers */}
                <ListSection
                  title="Missing Recommended Headers"
                  items={result.missingHeaders}
                />

                {/* Raw response headers */}
                <div className="bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-xl space-y-4">
                  <h3 className="text-sm font-mono font-bold text-zinc-200 border-b border-zinc-850 pb-2 flex items-center gap-1.5">
                    <Rows className="w-4 h-4 text-blue-400" />
                    Raw Response Headers
                  </h3>
                  <RawHeadersGrid headers={result.rawHeaders} />
                </div>

                {/* Upcoming Modern Headers */}
                <ListSection
                  title="Upcoming / Modern Hardening Headers"
                  items={result.upcomingHeaders}
                />

                {/* Additional Info KV list */}
                <div className="bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-xl space-y-4">
                  <h3 className="text-sm font-mono font-bold text-zinc-200 border-b border-zinc-850 pb-2 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-blue-400" />
                    Additional Information
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(result.additionalInfo
                      ? buildAdditionalRows(result.additionalInfo)
                      : []
                    ).map(([k, v]) => (
                      <KV key={k} k={k} v={v} />
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Guidance sidebar card */}
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Info className="text-blue-400 w-4 h-4" />
                Checker Scope
              </h2>
              <ul className="space-y-3.5 list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Audits HTTP-to-HTTPS redirect logic to prevent cleartext token leakage.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Verifies Strict-Transport-Security (HSTS) policies and preload flags.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Inspects raw response headers to detect missing CSP, XFO, or XXP directives.
                  </span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
