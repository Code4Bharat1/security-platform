"use client";

import { useMemo, useState } from "react";
import {
  Link2,
  RefreshCcw,
  Download,
  AlertTriangle,
  ShieldCheck,
  Search,
  Info,
  Loader2,
  XCircle,
  Globe,
  List,
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";

const prettyDate = (iso) => (iso ? new Date(iso).toLocaleString() : "-");

export default function LinkDetector() {
  const API_BASE = useMemo(
    () => (process.env.NEXT_PUBLIC_PROD_API_URL || "").replace(/\/+$/, ""),
    []
  );

  const [link, setLink] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [bulkResults, setBulkResults] = useState([]);
  const [error, setError] = useState("");
  const protectedAction = useProtectedAction();

  const handleScan = async () => {
    if (!link.trim()) return;
    setScanning(true);
    setResult(null);
    setError("");
    await protectedAction(async (userToken) => {
      try {
        const res = await fetch(`${API_BASE}/link-detector/link-scan`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({ url: link.trim() }),
        });
        const data = await res.json();
        if (res.ok) {
          setResult(data);
        } else {
          setError(data?.message || "Link check failed.");
        }
      } catch (err) {
        console.error("Request error:", err);
        setError("Failed to check the link.");
      } finally {
        setScanning(false);
      }
    });
  };

  const handleBulk = async () => {
    const lines = bulkText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (!lines.length) return;
    setScanning(true);
    setBulkResults([]);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/link-detector/bulk-scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: lines }),
      });
      const data = await res.json();
      if (res.ok) {
        setBulkResults(data.results || []);
      } else {
        setError(data?.message || "Bulk scan failed.");
      }
    } catch (e) {
      setError("Failed to perform bulk scan.");
    } finally {
      setScanning(false);
    }
  };

  const statusBadge = (status) => {
    if (status === "safe")
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-950/30 text-emerald-400 border border-emerald-500/25">
          <ShieldCheck size={12} /> Safe
        </span>
      );
    if (status === "suspicious")
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-950/30 text-amber-400 border border-amber-500/25">
          <AlertTriangle size={12} /> Suspicious
        </span>
      );
    if (status === "malicious")
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-rose-950/30 text-rose-400 border border-rose-500/25">
          <XCircle size={12} /> Malicious
        </span>
      );
    if (status === "invalid")
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-zinc-800/50 text-zinc-400 border border-zinc-700/50">
          Invalid
        </span>
      );
    return (
      <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-zinc-800/50 text-zinc-400 border border-zinc-700/50">
        Unknown
      </span>
    );
  };

  const downloadTxt = (payload, fileName = "link_report.txt") => {
    const blob = new Blob([payload], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const buildTxtReport = (r) => {
    const lines = [];
    lines.push(`URL: ${r.url}`);
    lines.push(`Final URL: ${r.finalUrl || "-"}`);
    lines.push(`Status: ${r.status} (Trust Index: ${r.trustIndex ?? "-"})`);
    lines.push(`Message: ${r.message || "-"}`);
    lines.push(`HTTPS: ${r.ssl?.isHttps ? "Yes" : "No"}`);
    lines.push(`Onion: ${r.onion ? "Yes" : "No"}`);
    lines.push(`Redirect Chain:`);
    (r.redirectChain || []).forEach((u, i) => lines.push(`  ${i + 1}. ${u}`));
    lines.push(`Suspicious Keywords: ${(r.suspicious?.keywordsFound || []).join(", ") || "-"}`);
    lines.push(`Typosquat of: ${r.suspicious?.typosquatOf || "-"}`);
    lines.push(`Shortener Expanded: ${r.suspicious?.shortenerExpanded ? "Yes" : "No"}`);
    lines.push(`Suspicious Domain: ${r.suspicious?.suspiciousDomain ? "Yes" : "No"}`);
    if (r.suspicious?.cnameChain?.length)
      lines.push(`CNAME Chain: ${r.suspicious.cnameChain.join(" -> ")}`);
    if (r.suspicious?.blacklistMatches?.length)
      lines.push(`Blacklist Matches: ${r.suspicious.blacklistMatches.join(", ")}`);
    if (r.contentFindings) {
      lines.push(`Content Findings:`);
      lines.push(
        `  CryptoMiner: ${r.contentFindings.hasCryptoMiner ? "Yes" : "No"}, Suspicious Eval: ${r.contentFindings.suspiciousInlineEval ? "Yes" : "No"}, External JS: ${r.contentFindings.externalJsCount ?? "-"}, Forms: ${r.contentFindings.formsCount ?? "-"}`
      );
    }
    if (r.geo)
      lines.push(`Geo/IP: ${r.geo.ip || "-"} ${r.geo.country || ""} ${r.geo.region || ""} ${r.geo.city || ""}`);
    lines.push(`Screenshot: ${r.screenshotPath || "-"}`);
    lines.push(`Scanned At: ${prettyDate(r.scannedAt)}`);
    return lines.join("\n");
  };

  const downloadPdf = (r, fileName = "link_report.pdf") => {
    const doc = new jsPDF({ unit: "pt" });

    // Header Banner
    doc.setFillColor(18, 18, 18);
    doc.rect(0, 0, doc.internal.pageSize.width, 40, "F");
    doc.setTextColor(16, 185, 129);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(18);
    doc.text("NEXCORE SECURITY PLATFORM", 15, 20);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text("LINK DETECTOR SCAN REPORT", 15, 30);

    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.5);
    doc.line(15, 48, doc.internal.pageSize.width - 15, 48);

    const summary = [
      ["URL", r.url],
      ["Final URL", r.finalUrl || "-"],
      ["Status", `${r.status} (Trust Index: ${r.trustIndex ?? "-"})`],
      ["Message", r.message || "-"],
      ["HTTPS", r.ssl?.isHttps ? "Yes" : "No"],
      ["Onion", r.onion ? "Yes" : "No"],
      ["IP / Country", `${r.geo?.ip || "-"} / ${r.geo?.country || "-"}`],
      ["Scanned At", prettyDate(r.scannedAt)],
    ];

    autoTable(doc, {
      startY: 58,
      head: [["Field", "Value"]],
      body: summary,
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 14,
      head: [["Redirect Chain"]],
      body: (r.redirectChain || []).map((u, i) => [`${i + 1}. ${u}`]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
    });

    const suspRows = [
      ["Keywords", (r.suspicious?.keywordsFound || []).join(", ") || "Not Found"],
      ["Typosquat of", r.suspicious?.typosquatOf || "-"],
      ["Shortener Expanded", r.suspicious?.shortenerExpanded ? "Yes" : "No"],
      ["Suspicious Domain", r.suspicious?.suspiciousDomain ? "Yes" : "No"],
      ["CNAME Chain", (r.suspicious?.cnameChain || []).length ? r.suspicious.cnameChain.join(" -> ") : "-"],
      ["Blacklist Matches", (r.suspicious?.blacklistMatches || []).join(", ") || "-"],
    ];
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 14,
      head: [["Suspicious Indicators", "Value"]],
      body: suspRows,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
    });

    const contentRows = r.contentFindings
      ? Object.entries(r.contentFindings).map(([k, v]) => [k, String(v)])
      : [["-", "-"]];
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 14,
      head: [["Content Findings", "Value"]],
      body: contentRows,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
    });

    doc.save(fileName);
  };

  const bulkToCsv = (items) => {
    const header = ["url","finalUrl","status","trustIndex","isHttps","onion","ip","country","keywords","typosquatOf","shortener","suspiciousDomain","blacklistMatches","scannedAt"].join(",");
    const rows = items.map((r) =>
      [
        JSON.stringify(r.url || ""),
        JSON.stringify(r.finalUrl || ""),
        r.status || "",
        r.trustIndex ?? "",
        r.ssl?.isHttps ? 1 : 0,
        r.onion ? 1 : 0,
        r.geo?.ip || "",
        r.geo?.country || "",
        (r.suspicious?.keywordsFound || []).join("|"),
        r.suspicious?.typosquatOf || "",
        r.suspicious?.shortenerExpanded ? 1 : 0,
        r.suspicious?.suspiciousDomain ? 1 : 0,
        (r.suspicious?.blacklistMatches || []).join("|"),
        prettyDate(r.scannedAt),
      ].join(",")
    );
    return [header, ...rows].join("\n");
  };

  const downloadCsv = (items) => {
    const csv = bulkToCsv(items);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bulk_link_scan.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="tool-detail-page min-h-screen"
      style={{
        "--hero-ambient-a": "rgba(16, 185, 129, 0.08)",
        "--hero-ambient-b": "rgba(16, 185, 129, 0.03)",
        "--glow-primary": "0 0 34px rgba(16, 185, 129, 0.16)",
        "--gold": "#10b981",
        "--gold-strong": "#34d399",
        "--gold-dark": "#047857",
        "--ring": "rgba(16, 185, 129, 0.34)",
        "--surface-glow": "rgba(16, 185, 129, 0.14)",
      }}
    >
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
        .tool-detail-page .bg-black\/30 {
          background:
            radial-gradient(circle at center, rgba(16, 185, 129, 0.04), transparent 55%),
            linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)) !important;
          box-shadow:
            inset 0 0 0 1px rgba(255,255,255,0.01),
            0 0 40px rgba(16, 185, 129, 0.04) !important;
          border-color: rgba(16, 185, 129, 0.12) !important;
        }
        details > summary { list-style: none; }
        details > summary::-webkit-details-marker { display: none; }
      `}</style>

      <div className="tool-detail-shell">
        {/* Top Badge */}
        <div className="flex justify-end mb-8">
          <span className="rounded-full border border-emerald-500/30 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-emerald-400">
            Green Team
          </span>
        </div>

        {/* Title Block */}
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl border border-emerald-500/30 overflow-hidden shadow-lg flex-shrink-0 flex items-center justify-center">
            <Link2 className="h-8 w-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              LINK <span className="text-emerald-400">DETECTOR</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Detect malicious, suspicious, or unsafe links. Analyzes redirects, SSL, typosquatting, blacklist hits, and more.
            </p>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Left Column: Scan Controls */}
          <div className="space-y-6">
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-emerald-500/10 transition-all duration-300">
              {/* Card header + mode toggle */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-mono font-medium text-zinc-100 flex items-center gap-2">
                  <Search className="h-5 w-5 text-emerald-400" />
                  {bulkMode ? "Bulk Scan" : "Single Link Scan"}
                </h2>
                <div className="flex items-center gap-3">
                  {/* Bulk toggle */}
                  <span className="text-xs text-zinc-400 font-mono uppercase tracking-wider">Bulk</span>
                  <button
                    onClick={() => {
                      setBulkMode(!bulkMode);
                      setResult(null);
                      setBulkResults([]);
                      setError("");
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                      bulkMode ? "bg-emerald-500/30 border border-emerald-500/40" : "bg-zinc-800 border border-zinc-700"
                    }`}
                    aria-pressed={bulkMode}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform ${
                        bulkMode ? "translate-x-5 bg-emerald-400" : "bg-zinc-400"
                      }`}
                    />
                  </button>
                  {/* Reset */}
                  <button
                    onClick={() => {
                      setLink("");
                      setBulkText("");
                      setResult(null);
                      setBulkResults([]);
                      setError("");
                    }}
                    className="bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/50 rounded-xl font-mono font-bold text-[11px] uppercase px-3 py-2 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center gap-1.5 cursor-pointer hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] focus:outline-none"
                  >
                    <RefreshCcw size={13} /> Reset
                  </button>
                </div>
              </div>

              {/* Single mode */}
              {!bulkMode ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest font-mono text-zinc-400 mb-2 font-semibold">
                      Target URL
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="https://example.com"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !scanning && link.trim()) handleScan();
                        }}
                        disabled={scanning}
                        className="w-full pl-10 bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 focus:shadow-[0_0_12px_rgba(16,185,129,0.08)] focus:outline-none transition-all placeholder:text-zinc-600 font-mono"
                      />
                    </div>
                  </div>
                  <div className="pt-1">
                    <button
                      onClick={handleScan}
                      disabled={scanning || !link.trim()}
                      className="w-full bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/50 rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-2 focus:ring-offset-black/20 disabled:opacity-40 disabled:pointer-events-none"
                    >
                      {scanning ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Scanning...
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4" />
                          Check Link
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* Bulk mode */
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest font-mono text-zinc-400 mb-2 font-semibold">
                      URLs (one per line)
                    </label>
                    <textarea
                      rows={8}
                      placeholder={"https://example1.com\nhttps://example2.com\n..."}
                      value={bulkText}
                      onChange={(e) => setBulkText(e.target.value)}
                      disabled={scanning}
                      className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 focus:shadow-[0_0_12px_rgba(16,185,129,0.08)] focus:outline-none transition-all placeholder:text-zinc-600 font-mono resize-none"
                    />
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={handleBulk}
                      disabled={scanning || !bulkText.trim()}
                      className="flex-1 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/50 rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-2 focus:ring-offset-black/20 disabled:opacity-40 disabled:pointer-events-none"
                    >
                      {scanning ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Scanning...
                        </>
                      ) : (
                        <>
                          <List className="h-4 w-4" />
                          Scan All
                        </>
                      )}
                    </button>
                    {bulkResults.length > 0 && (
                      <button
                        onClick={() => downloadCsv(bulkResults)}
                        className="bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/50 px-4 py-2 rounded-xl transition-all duration-300 font-mono font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] focus:outline-none"
                      >
                        <Download size={14} /> CSV
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Loader */}
            {scanning && (
              <div className="flex flex-col items-center justify-center p-10 bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.15)] animate-pulse">
                <Loader2 className="h-8 w-8 text-emerald-400 animate-spin mb-4" />
                <p className="text-emerald-400 font-mono font-bold text-xs uppercase tracking-widest text-center">
                  Scanning target link...
                </p>
                <span className="text-[10px] text-zinc-500 font-mono mt-2 text-center">
                  Checking redirects, SSL, blacklists & content signals
                </span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-rose-500/25 bg-rose-500/5 p-4 text-rose-400">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider mb-1">Scan Error</div>
                    <div className="text-xs text-rose-300">{error}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Single result */}
            {result && !scanning && (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_12px_40px_rgb(0,0,0,0.2)] space-y-5 hover:border-emerald-500/10 transition-all duration-300">
                {/* Result header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800/50 pb-4">
                  <div className="flex items-center gap-3">
                    {statusBadge(result.status)}
                    <span className="text-xs font-mono text-zinc-400">
                      Trust Index:{" "}
                      <span className="text-emerald-400 font-bold">{result.trustIndex ?? "-"}</span>
                      /100
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadPdf(result, "link_report.pdf")}
                      className="bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/50 px-3.5 py-2 rounded-xl transition-all duration-300 font-mono font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] focus:outline-none"
                    >
                      <Download size={14} /> PDF
                    </button>
                    <button
                      onClick={() => downloadTxt(buildTxtReport(result))}
                      className="bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/50 px-3.5 py-2 rounded-xl transition-all duration-300 font-mono font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] focus:outline-none"
                    >
                      <Download size={14} /> TXT
                    </button>
                  </div>
                </div>

                {/* Core info grid */}
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    ["URL", result.url],
                    ["Final URL", result.finalUrl || "-"],
                    ["HTTPS", result.ssl?.isHttps ? "Yes" : "No"],
                    ["Onion Link", result.onion ? "Yes" : "No"],
                    ["IP", result.geo?.ip || "-"],
                    ["Country", result.geo?.country || "-"],
                  ].map(([label, val]) => (
                    <div key={label} className="bg-zinc-900/30 rounded-xl p-3.5 border border-zinc-800/50">
                      <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-1">{label}</div>
                      <div className="text-xs text-zinc-300 font-mono break-all">{val}</div>
                    </div>
                  ))}
                </div>

                {result.message && (
                  <div className="bg-zinc-900/30 rounded-xl p-3.5 border border-zinc-800/50">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-1">Message</div>
                    <div className="text-xs text-zinc-300">{result.message}</div>
                  </div>
                )}

                {/* Collapsible detail sections */}
                {[
                  {
                    label: "Redirect Chain",
                    content: (result.redirectChain || []).length > 0 ? (
                      <ol className="list-decimal ml-5 space-y-1">
                        {(result.redirectChain || []).map((u, i) => (
                          <li key={i} className="text-xs text-zinc-300 font-mono break-all">{u}</li>
                        ))}
                      </ol>
                    ) : <span className="text-xs text-zinc-500">No redirects detected.</span>,
                  },
                  {
                    label: "Suspicious Indicators",
                    content: (
                      <div className="grid sm:grid-cols-2 gap-2">
                        {[
                          ["Keywords", (result.suspicious?.keywordsFound || []).join(", ") || "None"],
                          ["Typosquat of", result.suspicious?.typosquatOf || "-"],
                          ["Shortener Expanded", result.suspicious?.shortenerExpanded ? "Yes" : "No"],
                          ["Suspicious Domain", result.suspicious?.suspiciousDomain ? "Yes" : "No"],
                          ...(result.suspicious?.cnameChain?.length ? [["CNAME Chain", result.suspicious.cnameChain.join(" → ")]] : []),
                          ...(result.suspicious?.blacklistMatches?.length ? [["Blacklist", result.suspicious.blacklistMatches.join(", ")]] : []),
                        ].map(([k, v]) => (
                          <div key={k} className="flex flex-col">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">{k}</span>
                            <span className="text-xs text-zinc-300 font-mono break-all">{v}</span>
                          </div>
                        ))}
                      </div>
                    ),
                  },
                  {
                    label: "Content Findings",
                    content: (
                      <div className="grid sm:grid-cols-2 gap-2">
                        {[
                          ["CryptoMiner", result.contentFindings?.hasCryptoMiner ? "Yes" : "No"],
                          ["Suspicious Eval", result.contentFindings?.suspiciousInlineEval ? "Yes" : "No"],
                          ["External JS", result.contentFindings?.externalJsCount ?? "-"],
                          ["Forms", result.contentFindings?.formsCount ?? "-"],
                        ].map(([k, v]) => (
                          <div key={k} className="flex flex-col">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">{k}</span>
                            <span className="text-xs text-zinc-300 font-mono">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    ),
                  },
                ].map(({ label, content }) => (
                  <details key={label} className="group">
                    <summary className="flex items-center justify-between cursor-pointer select-none bg-zinc-900/30 border border-zinc-800/50 rounded-xl px-4 py-3 text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300 hover:border-emerald-500/20 hover:text-zinc-100 transition-all">
                      {label}
                      <span className="text-zinc-600 group-open:rotate-180 transition-transform text-base">▾</span>
                    </summary>
                    <div className="mt-2 bg-zinc-900/20 border border-zinc-800/40 rounded-xl p-4">
                      {content}
                    </div>
                  </details>
                ))}

                <p className="text-[10px] text-zinc-600 font-mono">
                  Scanned At: {prettyDate(result.scannedAt)}
                </p>
              </div>
            )}

            {/* Bulk results table */}
            {bulkResults.length > 0 && !scanning && (
              <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.15)] hover:border-emerald-500/10 transition-all duration-300">
                <div className="border-b border-zinc-800/50 bg-zinc-900/10 px-6 py-4 flex items-center justify-between">
                  <h3 className="text-sm font-mono font-semibold uppercase tracking-wider text-zinc-200">
                    Bulk Scan Results — {bulkResults.length} URLs
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono">
                    <thead className="bg-zinc-900/40 text-zinc-400 text-[10px] uppercase tracking-wider border-b border-zinc-800/50">
                      <tr>
                        {["Status", "URL", "Final URL", "Trust", "HTTPS", "IP", "Country"].map((h) => (
                          <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/40">
                      {bulkResults.map((r, i) => (
                        <tr key={i} className="hover:bg-zinc-900/10 transition-colors">
                          <td className="px-4 py-3">{statusBadge(r.status)}</td>
                          <td className="px-4 py-3 break-all max-w-[180px] text-zinc-300">{r.url}</td>
                          <td className="px-4 py-3 break-all max-w-[180px] text-zinc-400">{r.finalUrl || "-"}</td>
                          <td className="px-4 py-3 text-emerald-400 font-bold">{r.trustIndex ?? "-"}</td>
                          <td className="px-4 py-3 text-zinc-300">{r.ssl?.isHttps ? "Yes" : "No"}</td>
                          <td className="px-4 py-3 text-zinc-400">{r.geo?.ip || "-"}</td>
                          <td className="px-4 py-3 text-zinc-400">{r.geo?.country || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Guidance Sidebar */}
          <div className="space-y-6">
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Info className="h-4 w-4 text-emerald-400" />
                Scan Scope & Guidance
              </h4>
              <ul className="space-y-3.5 list-none pl-0">
                {[
                  "Follows redirect chains and captures the final resolved destination URL.",
                  "Verifies TLS/SSL certificate validity and flags non-HTTPS connections.",
                  "Detects typosquatting attempts against known brand domains.",
                  "Expands shortened URLs (bit.ly, tinyurl, etc.) to reveal the real target.",
                  "Matches against multiple threat intelligence blacklists.",
                  "Performs CNAME chain traversal to detect hidden hosting.",
                  "Inspects page content for cryptominers, suspicious eval calls, and form counts.",
                  "Resolves geolocation and ASN data for the destination IP.",
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/60 mt-1.5 flex-shrink-0" />
                    <span className="text-xs text-zinc-400 leading-relaxed">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Status legend */}
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Status Legend
              </h4>
              <div className="space-y-2.5">
                {[
                  { label: "Safe", cls: "text-emerald-400 border-emerald-500/25", desc: "No threats detected." },
                  { label: "Suspicious", cls: "text-orange-400 border-orange-500/25", desc: "Potential risk signals found." },
                  { label: "Malicious", cls: "bg-rose-950/30 text-rose-400 border-rose-500/25", desc: "Active threat confirmed." },
                  { label: "Invalid", cls: "bg-zinc-800/50 text-zinc-400 border-zinc-700/50", desc: "URL could not be resolved." },
                ].map(({ label, cls, desc }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${cls}`}>
                      {label}
                    </span>
                    <span className="text-xs text-zinc-500">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
