"use client";

import { useMemo, useState, useCallback } from "react";
import {
  Search as SearchIcon,
  Shield,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  FileText,
  FileJson,
  Download,
  Loader2,
  Info,
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";

const badge = (tone) =>
  ({
    good: "border-emerald-500/20 bg-emerald-500/5 text-emerald-450 shadow-[inset_0_0_12px_rgba(16,185,129,0.02)]",
    warn: "border-amber-500/20 bg-amber-500/5 text-amber-400 shadow-[inset_0_0_12px_rgba(245,158,11,0.02)]",
    bad: "border-rose-500/20 bg-rose-500/5 text-rose-450 shadow-[inset_0_0_12px_rgba(244,63,94,0.02)]",
    info: "border-sky-500/20 bg-sky-500/5 text-sky-400 shadow-[inset_0_0_12px_rgba(14,165,233,0.02)]",
  }[tone] || "border-zinc-800 bg-zinc-900/30 text-zinc-400");

const chip = (tone) =>
  ({
    good: "text-emerald-400 bg-emerald-950/30 border border-emerald-500/25",
    warn: "text-amber-400 bg-amber-950/30 border border-amber-500/25",
    bad: "text-rose-400 bg-rose-950/30 border border-rose-500/25",
    info: "text-sky-400 bg-sky-950/30 border border-sky-500/25",
  }[tone] || "text-zinc-400 bg-zinc-850 border border-zinc-700");

export default function MetaForm() {
  const [url, setUrl] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const apiBase = useMemo(
    () => (process.env.NEXT_PUBLIC_PROD_API_URL || "").replace(/\/+$/, ""),
    []
  );
  const protectedAction = useProtectedAction();
  const Hero = {
    title: "Protect Your Website",
    desc: "Analyze security/SEO meta tags & headers, detect duplicates, preview Open Graph, and audit CORS.",
    imgPath: "/GreenTeam/meta_tag.png",
  };
  async function analyze(e) {
    e?.preventDefault?.();
    if (!url) return;
    setLoading(true);
    setReport(null);
    await protectedAction(async (userToken) => {
      try {
        const targetUrl = url.trim();
        const res = await fetch(`${apiBase}/meta/meta-analyze`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({ url: targetUrl }),
        });
        const data = await res.json();
        if (!res.ok) {
          setReport({
            error:
              data?.error || "Meta tag analysis failed. Please try again.",
            targetUrl: data?.targetUrl || targetUrl,
          });
          return;
        }
        setReport(data);
      } catch (err) {
        console.error(err);
        setReport({ error: "Failed to analyze" });
      } finally {
        setLoading(false);
      }
    });
  }

  // ---------- Exports ----------
  function dlBlob(blob, name) {
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(u);
  }
  function downloadJSON() {
    if (!report) return;
    dlBlob(
      new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }),
      `meta-report.json`
    );
  }
  function downloadTXT() {
    if (!report) return;
    const lines = [];
    lines.push(`Target: ${report.targetUrl}`);
    lines.push(`Fetched: ${report.fetchedUrl || "-"}`);
    lines.push(`Timestamp: ${report.timestamp}`);
    lines.push("");
    lines.push(`SEO Score: ${report.scores?.seo}/10`);
    lines.push(`Security Score: ${report.scores?.security}/10`);
    lines.push(`Total Score: ${report.scores?.total}/10`);
    lines.push("");
    lines.push("Security Checks:");
    (report.security?.checks || []).forEach((c) =>
      lines.push(
        ` - ${c.key}: ${c.exists ? "FOUND" : "MISSING"}${
          c.value ? ` → ${c.value}` : ""
        } (${c.severity}) ${c.note ? `| ${c.note}` : ""}`
      )
    );
    lines.push("");
    lines.push("SEO Checks:");
    (report.seo?.checks || []).forEach((c) =>
      lines.push(` - ${c.key}: ${c.status}${c.detail ? ` | ${c.detail}` : ""}`)
    );
    lines.push("");
    lines.push("CORS:");
    if (report.cors?.error) {
      lines.push(` - Error: ${report.cors.error}`);
    } else {
      lines.push(
        ` - Allow-Origin: ${
          report.cors?.headers?.allow_origin || "Not Present"
        }`
      );
      lines.push(
        ` - Allow-Credentials: ${
          report.cors?.headers?.allow_credentials || "Not Present"
        }`
      );
      lines.push(
        ` - Allow-Methods: ${
          report.cors?.headers?.allow_methods || "Not Present"
        }`
      );
      lines.push(
        ` - Allow-Headers: ${
          report.cors?.headers?.allow_headers || "Not Present"
        }`
      );
      lines.push(
        ` - Expose-Headers: ${
          report.cors?.headers?.expose_headers || "Not Present"
        }`
      );
      lines.push(` - Verdict: ${report.cors?.verdict || "-"}`);
      (report.cors?.recommendations || []).forEach((r) =>
        lines.push(`   * ${r}`)
      );
    }
    dlBlob(
      new Blob([lines.join("\n")], { type: "text/plain" }),
      `meta-report.txt`
    );
  }
  function downloadHTML() {
    if (!report) return;
    const html = `
<!doctype html><html><head><meta charset="utf-8"><title>Meta Report</title>
<style>
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Arial,sans-serif;padding:24px;}
h1{margin:0 0 6px} .muted{color:#666} .badge{display:inline-block;padding:2px 8px;border-radius:999px;border:1px solid #ddd;font-size:12px}
table{border-collapse:collapse;width:100%;font-size:13px} td,th{border:1px solid #ddd;padding:6px 8px;text-align:left}
.section{margin:18px 0}
</style></head><body>
<h1>Meta Tag & CORS Report</h1>
<div class="muted">Target: ${escapeHtml(
      report.targetUrl
    )} | Fetched: ${escapeHtml(report.fetchedUrl || "")} | ${escapeHtml(
      report.timestamp || ""
    )}</div>

<div class="section">
  <h3>Scores</h3>
  <div class="badge">SEO: ${report.scores?.seo}/10</div>
  <div class="badge">Security: ${report.scores?.security}/10</div>
  <div class="badge">Total: ${report.scores?.total}/10</div>
</div>

<div class="section">
  <h3>Security Checks</h3>
  <table><thead><tr><th>Header/Meta</th><th>Status/Value</th><th>Severity</th><th>Note</th></tr></thead><tbody>
  ${(report.security?.checks || [])
    .map(
      (c) =>
        `<tr><td>${escapeHtml(c.key)}</td><td>${escapeHtml(
          c.exists ? c.value || "Present" : "Missing"
        )}</td><td>${escapeHtml(c.severity)}</td><td>${escapeHtml(
          c.note || ""
        )}</td></tr>`
    )
    .join("")}
  </tbody></table>
</div>

<div class="section">
  <h3>SEO Checks</h3>
  <table><thead><tr><th>Item</th><th>Status</th><th>Detail</th></tr></thead><tbody>
  ${(report.seo?.checks || [])
    .map(
      (c) =>
        `<tr><td>${escapeHtml(c.key)}</td><td>${escapeHtml(
          c.status
        )}</td><td>${escapeHtml(c.detail || "")}</td></tr>`
    )
    .join("")}
  </tbody></table>
</div>

<div class="section">
  <h3>CORS</h3>
  ${
    report.cors?.error
      ? `<div class="badge">Error: ${escapeHtml(report.cors.error)}</div>`
      : `<table><thead><tr><th>Header</th><th>Value</th></tr></thead><tbody>
    <tr><td>Access-Control-Allow-Origin</td><td>${escapeHtml(
      report.cors?.headers?.allow_origin || "Not Present"
    )}</td></tr>
    <tr><td>Access-Control-Allow-Credentials</td><td>${escapeHtml(
      report.cors?.headers?.allow_credentials || "Not Present"
    )}</td></tr>
    <tr><td>Access-Control-Allow-Methods</td><td>${escapeHtml(
      report.cors?.headers?.allow_methods || "Not Present"
    )}</td></tr>
    <tr><td>Access-Control-Allow-Headers</td><td>${escapeHtml(
      report.cors?.headers?.allow_headers || "Not Present"
    )}</td></tr>
    <tr><td>Access-Control-Expose-Headers</td><td>${escapeHtml(
      report.cors?.headers?.expose_headers || "Not Present"
    )}</td></tr>
  </tbody></table>
  <p><b>Verdict:</b> ${escapeHtml(report.cors?.verdict || "-")}</p>
  <ul>${(report.cors?.recommendations || [])
    .map((r) => `<li>${escapeHtml(r)}</li>`)
    .join("")}</ul>`
  }
</div>
</body></html>`;
    dlBlob(new Blob([html], { type: "text/html" }), `meta-report.html`);
  }
  async function downloadPDF() {
    if (!report) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    // Header Banner
    doc.setFillColor(18, 18, 18);
    doc.rect(0, 0, doc.internal.pageSize.width, 40, "F");

    doc.setTextColor(16, 185, 129); // Emerald Green
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(20);
    doc.text("NEXCORE SECURITY PLATFORM", 15, 20);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text("META TAGS & CORS AUDIT REPORT", 15, 30);

    // Scan Meta Info
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    doc.text(`Domain: ${report.targetUrl}`, 15, 52);
    if (report.fetchedUrl) doc.text(`Fetched URL: ${report.fetchedUrl}`, 15, 62);
    doc.text(`Date: ${new Date().toLocaleString()}`, 15, 72);

    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.5);
    doc.line(15, 80, doc.internal.pageSize.width - 15, 80);

    // Summary Block
    doc.setFontSize(12);
    doc.text("Executive Summary", 15, 95);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);

    const summaryText = `This report lists the meta-tags checks and CORS analysis for the host domain '${report.targetUrl}'. SEO Score: ${report.scores?.seo}/10. Security Score: ${report.scores?.security}/10. Total Score: ${report.scores?.total}/10.`;
    const splitSummary = doc.splitTextToSize(summaryText, doc.internal.pageSize.width - 30);
    doc.text(splitSummary, 15, 108);

    // Security Table
    autoTable(doc, {
      startY: 135,
      head: [["Header/Meta", "Status/Value", "Severity", "Note"]],
      body: (report.security?.checks || []).map((c) => [
        c.key,
        c.exists ? c.value || "Present" : "Missing",
        c.severity || "",
        c.note || "",
      ]),
      styles: { fontSize: 8, cellWidth: "wrap" },
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
      columnStyles: { 1: { cellWidth: 180 }, 3: { cellWidth: 160 } },
    });

    // SEO Table
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [["SEO Item", "Status", "Detail"]],
      body: (report.seo?.checks || []).map((c) => [
        c.key,
        c.status,
        c.detail || "",
      ]),
      styles: { fontSize: 8, cellWidth: "wrap" },
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
      columnStyles: { 2: { cellWidth: 260 } },
    });

    // CORS Table
    const corsStart = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text("CORS Configuration Info", 15, corsStart);
    if (report.cors?.error) {
      doc.setFontSize(9);
      doc.text(`Error: ${report.cors.error}`, 15, corsStart + 15);
    } else {
      autoTable(doc, {
        startY: corsStart + 10,
        head: [["Header", "Value"]],
        body: [
          ["Allow-Origin", report.cors?.headers?.allow_origin || "Not Present"],
          ["Allow-Credentials", report.cors?.headers?.allow_credentials || "Not Present"],
          ["Allow-Methods", report.cors?.headers?.allow_methods || "Not Present"],
          ["Allow-Headers", report.cors?.headers?.allow_headers || "Not Present"],
          ["Expose-Headers", report.cors?.headers?.expose_headers || "Not Present"],
          ["Verdict", report.cors?.verdict || "-"],
        ],
        styles: { fontSize: 8, cellWidth: "wrap" },
        headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
        columnStyles: { 1: { cellWidth: 360 } },
      });
      const recs = (report.cors?.recommendations || []).join("; ");
      if (recs) {
        doc.setFontSize(8);
        doc.text(`Recommendations: ${recs}`, 15, doc.lastAutoTable.finalY + 14);
      }
    }
    doc.save(`meta-report-${report.targetUrl}.pdf`);
  };
  return (
    <div className="tool-detail-page min-h-screen" style={{
      '--hero-ambient-a': 'rgba(16, 185, 129, 0.08)',
      '--hero-ambient-b': 'rgba(16, 185, 129, 0.03)',
      '--glow-primary': '0 0 34px rgba(16, 185, 129, 0.16)',
      '--gold': '#10b981',
      '--gold-strong': '#34d399',
      '--gold-dark': '#047857',
      '--ring': 'rgba(16, 185, 129, 0.34)',
      '--surface-glow': 'rgba(16, 185, 129, 0.14)',
    }}>
      <style>{`
        .tool-detail-page .tool-detail-shell {
          padding-top: 3.5rem !important;
        }
        .tool-detail-page ::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.35) !important;
        }
        .tool-detail-page ::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.55) !important;
        }
        .tool-detail-page ::selection {
          background: rgba(16, 185, 129, 0.22) !important;
          color: #e6fffa !important;
        }
        .tool-detail-page .tool-detail-panel,
        .tool-detail-page .bg-gray-900,
        .tool-detail-page .bg-zinc-900\/70,
        .tool-detail-page .bg-black\/60,
        .tool-detail-page .bg-gray-800,
        .tool-detail-page .bg-gray-800\/60,
        .tool-detail-page .bg-black\/50,
        .tool-detail-page .bg-black\/30,
        .tool-detail-page .bg-gray-50,
        .tool-detail-page .bg-white {
          background:
            radial-gradient(circle at center, rgba(16, 185, 129, 0.04), transparent 55%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.01)) !important;
          box-shadow:
            inset 0 0 0 1px rgba(255, 255, 255, 0.01),
            0 0 40px rgba(16, 185, 129, 0.04) !important;
          border-color: rgba(16, 185, 129, 0.12) !important;
        }
      `}</style>
      <div className="tool-detail-shell">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-4 mb-8">
          <span className="rounded-full border border-emerald-500/30 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-emerald-400">
            Green Team
          </span>
        </div>

        {/* Title Section */}
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl border border-emerald-500/30 overflow-hidden shadow-lg flex-shrink-0 flex items-center justify-center">
            <Shield className="h-8 w-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              META TAG <span className="text-emerald-400">ANALYZER</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Analyze security/SEO meta tags & headers, detect duplicates, preview Open Graph, and audit CORS policies.
            </p>
          </div>
        </div>

        {/* 2-Column Grid Layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Left Column: Input Form & Progress */}
          <div className="space-y-6">
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-emerald-500/10 transition-all duration-300">
              <h2 className="text-lg font-mono font-medium text-zinc-100 mb-6 flex items-center gap-2">
                <SearchIcon className="h-5 w-5 text-emerald-400" />
                Analyze Target Website
              </h2>

              <form onSubmit={analyze} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-mono text-zinc-400 mb-2 font-semibold">Target Website URL</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value.trim())}
                      className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 pr-10 text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 focus:shadow-[0_0_12px_rgba(16,185,129,0.08)] focus:outline-none transition-all placeholder:text-zinc-650 font-mono"
                      required
                      disabled={loading}
                    />
                    <SearchIcon className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || !url}
                    className="w-full bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/50 rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-2 focus:ring-offset-black/20 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <SearchIcon className="h-4 w-4" />
                        Start Security Analysis
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {loading && (
              <div className="flex flex-col items-center justify-center p-10 bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.15)] animate-[pulse_2s_infinite]">
                <Shield className="h-8 w-8 animate-pulse text-emerald-400 mb-4" />
                <p className="text-emerald-400 font-mono font-bold text-xs uppercase tracking-widest text-center">
                  Scanning Target Site...
                </p>
                <span className="text-[10px] text-zinc-500 font-mono mt-2 text-center">
                  Fetching meta tags, security headers & CORS policy
                </span>
              </div>
            )}
          </div>

          {/* Right Column: Specs & Guide */}
          <div className="space-y-6">
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Info className="h-4 w-4 text-emerald-400" />
                Audit Scope & Guidance
              </h4>
              <ul className="space-y-3.5 text-xs text-zinc-400 list-none pl-0 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/60 mt-1.5 flex-shrink-0" />
                  <span>Audits basic SEO tags (Title, Description, Keywords, Robots, Canonical).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/60 mt-1.5 flex-shrink-0" />
                  <span>Checks for modern security headers (CSP, HSTS, X-Frame-Options, X-Content-Type).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/60 mt-1.5 flex-shrink-0" />
                  <span>Generates live Open Graph visual preview card matching social network specifications.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/60 mt-1.5 flex-shrink-0" />
                  <span>Performs live server CORS preflight queries to check origin exposure.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Results Block */}
        {!loading && report && (
          <div className="mt-8 bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_12px_40px_rgb(0,0,0,0.2)] space-y-6 hover:border-emerald-500/10 transition-all duration-300">
            {report.error && (
              <div className="rounded-xl border border-rose-500/25 bg-rose-500/5 p-4 text-rose-400">
                <div className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-450" />
                  <div>
                    <div className="font-semibold text-sm">Analysis Failed</div>
                    <div className="mt-1 text-xs text-rose-300">{report.error}</div>
                    {report.targetUrl && (
                      <div className="mt-2 text-[10px] font-mono opacity-80">
                        Target: {report.targetUrl}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!report.error && (
              <>
                {/* Top summary + export */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/50 pb-4">
                  <div>
                    <div className="text-xs text-zinc-400">
                      Target:{" "}
                      <span className="font-mono text-emerald-400">{report.targetUrl}</span>
                    </div>
                    {report.fetchedUrl && (
                      <div className="text-xs text-zinc-400 mt-1">
                        Final URL:{" "}
                        <span className="font-mono text-emerald-400">{report.fetchedUrl}</span>
                      </div>
                    )}
                    <div className="text-[10px] text-zinc-500 mt-1.5 font-mono">
                      Report Generated: {report.timestamp}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={downloadPDF}
                      className="bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/50 px-3.5 py-2 rounded-xl transition-all duration-300 font-mono font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] focus:outline-none"
                    >
                      <FileText className="h-4 w-4" /> PDF
                    </button>
                    <button
                      onClick={downloadHTML}
                      className="bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/50 px-3.5 py-2 rounded-xl transition-all duration-300 font-mono font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] focus:outline-none"
                    >
                      <Download className="h-4 w-4" /> HTML
                    </button>
                    <button
                      onClick={downloadJSON}
                      className="bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/50 px-3.5 py-2 rounded-xl transition-all duration-300 font-mono font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] focus:outline-none"
                    >
                      <FileJson className="h-4 w-4" /> JSON
                    </button>
                    <button
                      onClick={downloadTXT}
                      className="bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/50 px-3.5 py-2 rounded-xl transition-all duration-300 font-mono font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] focus:outline-none"
                    >
                      <FileText className="h-4 w-4" /> TXT
                    </button>
                  </div>
                </div>

                {/* Scores */}
                <div className="grid gap-3 text-white sm:grid-cols-3">
                  <ScoreCard
                    label="SEO Score"
                    value={`${report.scores?.seo}/10`}
                  />
                  <ScoreCard
                    label="Security Score"
                    value={`${report.scores?.security}/10`}
                  />
                  <ScoreCard
                    label="Total Score"
                    value={`${report.scores?.total}/10`}
                  />
                </div>

                {/* Security meta/header checks */}
                <Section title="Security Meta Tag Checks">
                  <div className="grid gap-3">
                    {(report.security?.checks || []).map((c, i) => (
                      <div
                        key={i}
                        className={`p-4 border rounded-xl transition-all duration-300 hover:scale-[1.005] ${badge(
                          toneFromSeverity(c)
                        )}`}
                      >
                        <div className="flex items-center gap-2">
                          {c.exists ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          ) : c.severity === "HIGH" ? (
                            <XCircle className="h-4 w-4 text-rose-455" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-amber-400" />
                          )}
                          <div className="font-semibold text-xs tracking-wide">{c.key}</div>
                          <div
                            className={`ml-auto text-[10px] px-2 py-0.5 rounded font-mono font-bold ${chip(
                              toneFromSeverity(c)
                            )}`}
                          >
                            {c.severity}
                          </div>
                        </div>
                        <div className="text-xs mt-2 text-zinc-300">
                          <b className="text-zinc-400">Status:</b> {c.exists ? "Exists" : "Missing"}{" "}
                          {c.value ? `→ ${c.value}` : ""}
                          {c.note ? (
                            <span className="ml-2 text-zinc-405 font-normal">({c.note})</span>
                          ) : null}
                        </div>
                        {c.suggestion ? (
                          <div className="text-xs mt-1.5 text-zinc-300">
                            <b className="text-zinc-400">Suggestion:</b> {c.suggestion}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </Section>

                {/* SEO evaluation */}
                <Section title="SEO Meta Tag Evaluation">
                  <div className="grid gap-3">
                    {(report.seo?.checks || []).map((c, i) => {
                      const tone =
                        c.status?.toLowerCase().includes("missing") ||
                        c.status?.toLowerCase().includes("deprecated")
                          ? "bad"
                          : c.status?.toLowerCase().includes("warning")
                          ? "warn"
                          : "good";
                      return (
                        <div
                          key={i}
                          className={`p-4 border rounded-xl transition-all duration-300 hover:scale-[1.005] ${badge(tone)}`}
                        >
                          <div className="flex items-center gap-2">
                            {tone === "bad" ? (
                              <XCircle className="h-4 w-4 text-rose-455" />
                            ) : tone === "warn" ? (
                              <AlertTriangle className="h-4 w-4 text-amber-400" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            )}
                            <div className="font-semibold text-xs tracking-wide">{c.key}</div>
                          </div>
                          <div className="text-xs mt-2 text-zinc-300">
                            <b className="text-zinc-400">Status:</b> {c.status}{" "}
                            {c.detail ? ` — ${c.detail}` : ""}
                          </div>
                          {c.suggestion ? (
                            <div className="text-xs mt-1.5 text-zinc-300">
                              <b className="text-zinc-400">Suggestion:</b> {c.suggestion}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </Section>

                {/* Duplicates & conflicts */}
                <Section title="Duplicate / Conflicting Tags">
                  <div className="grid gap-3">
                    {(report.duplicates || []).map((d, i) => (
                      <div
                        key={i}
                        className={`p-4 border rounded-xl transition-all duration-300 hover:scale-[1.005] ${badge("warn")}`}
                      >
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-400" />
                          <div className="font-semibold text-xs tracking-wide">{d.issue}</div>
                        </div>
                        {d.detail ? (
                          <div className="text-xs mt-2 text-zinc-350">{d.detail}</div>
                        ) : null}
                      </div>
                    ))}
                    {(!report.duplicates || report.duplicates.length === 0) && (
                      <div className={`p-4 rounded-xl border ${badge("good")}`}>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          <div className="font-semibold text-xs tracking-wide">
                            No duplicate or conflicting tags detected.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Section>

                {/* Social preview */}
                <Section title="Social Media Preview (Open Graph)">
                  <div className="border border-zinc-800/80 rounded-2xl p-5 bg-zinc-950/40 font-mono text-zinc-300 space-y-3">
                    <div className="border border-zinc-800/50 rounded-xl p-4 bg-zinc-900/40 shadow-inner max-w-lg">
                      <div className="font-bold text-base text-zinc-100">
                        {report.og?.title || "—"}
                      </div>
                      <div className="text-xs text-zinc-400 mt-1 line-clamp-3 leading-relaxed">
                        {report.og?.description || "—"}
                      </div>
                      <div className="mt-3">
                        {report.og?.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={report.og.image}
                            alt="og image preview"
                            className="max-h-48 rounded-lg border border-zinc-800 object-contain w-full bg-black/20"
                          />
                        ) : (
                          <div className="text-[10px] text-zinc-500 font-mono italic">
                            No og:image specified
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      Using fallback tag mapping: og:title / og:description / og:image
                    </div>
                  </div>
                </Section>

                {/* CORS */}
                <Section title="CORS Header Analysis">
                  {report.cors?.error ? (
                    <div className={`p-4 border rounded-xl ${badge("warn")}`}>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-400" />
                        <div className="text-xs font-semibold">Could not analyze CORS: {report.cors.error}</div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto rounded-xl border border-zinc-800/60 shadow-md">
                        <table className="min-w-full text-xs bg-zinc-950/20 divide-y divide-zinc-800/50">
                          <tbody>
                            {[
                              [
                                "Access-Control-Allow-Origin",
                                report.cors?.headers?.allow_origin || "Not Present",
                              ],
                              [
                                "Access-Control-Allow-Credentials",
                                report.cors?.headers?.allow_credentials || "Not Present",
                              ],
                              [
                                "Access-Control-Allow-Methods",
                                report.cors?.headers?.allow_methods || "Not Present",
                              ],
                              [
                                "Access-Control-Allow-Headers",
                                report.cors?.headers?.allow_headers || "Not Present",
                              ],
                              [
                                "Access-Control-Expose-Headers",
                                report.cors?.headers?.expose_headers || "Not Present",
                              ],
                            ].map(([k, v]) => (
                              <tr key={k} className="border-b last:border-0 border-zinc-800/50 hover:bg-zinc-900/10 transition-colors">
                                <td className="px-4 py-3 font-mono font-medium bg-zinc-900/30 text-zinc-400 border-r border-zinc-800/50 w-1/3">
                                  {k}
                                </td>
                                <td className="px-4 py-3 font-mono text-zinc-300">{v}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div
                        className={`mt-4 p-4 border rounded-xl ${
                          report.cors?.verdict
                            ?.toLowerCase()
                            .includes("vulnerable") ||
                          report.cors?.verdict?.toLowerCase().includes("weak")
                            ? badge("bad")
                            : badge("good")
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {report.cors?.verdict
                            ?.toLowerCase()
                            .includes("vulnerable") ||
                          report.cors?.verdict
                            ?.toLowerCase()
                            .includes("weak") ? (
                            <XCircle className="h-4 w-4 text-rose-455" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          )}
                          <div className="font-semibold text-xs tracking-wide">
                            Verdict: {report.cors?.verdict || "—"}
                          </div>
                        </div>
                        {report.cors?.recommendations?.length ? (
                          <ul className="list-disc ml-6 text-xs mt-2 space-y-1 text-zinc-300">
                            {report.cors.recommendations.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    </>
                  )}
                </Section>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- helpers & tiny components ---------- */

function ScoreCard({ label, value }) {
  return (
    <div className="p-4.5 rounded-xl border border-emerald-500/20 bg-emerald-950/10 text-emerald-400 shadow-[inset_0_0_12px_rgba(16,185,129,0.02)] transition-all duration-300 hover:scale-[1.01]">
      <div className="text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5 font-medium">{label}</div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="space-y-4 border-t border-zinc-800/60 pt-6 mt-6 first:border-none first:pt-0 first:mt-0">
      <div className="flex items-center gap-2">
        <Eye className="h-5 w-5 text-emerald-400" />
        <h3 className="text-sm font-mono font-semibold uppercase tracking-wider text-zinc-200">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function toneFromSeverity(c) {
  if (!c?.exists) return "bad";
  if (c.severity === "HIGH") return "bad";
  if (c.severity === "MEDIUM") return "warn";
  return "good";
}

function escapeHtml(s = "") {
  return String(s).replace(
    /[&<>"']/g,
    (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        m
      ])
  );
}
