"use client";

import { useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  FileDown,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  FileText,
  Zap,
  Globe,
  Database,
  Eye,
  EyeOff,
  Search,
  Info,
  Loader2,
  TrendingUp,
} from "lucide-react";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";

export default function WebsiteOptimizationTool() {
  const [url, setUrl] = useState("");
  const [info, setInfo] = useState("");
  const [result, setResult] = useState(null);
  const [showRaw, setShowRaw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const protection = useProtectedAction();

  const downloadPDF = () => {
    if (!result) return;
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
    doc.text("WEBSITE OPTIMIZATION REPORT", 15, 30);

    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.5);
    doc.line(15, 48, doc.internal.pageSize.width - 15, 48);

    // Metadata
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Target URL: ${result.url}`, 15, 62);
    doc.text(`Scan Date:  ${new Date(result.timestamp).toLocaleString()}`, 15, 74);

    // Table 1: Score Summary
    const scoreSummary = [
      ["Performance Score", `${result.score} / 100`],
      ["Baseline SEO Score", `${result.seoScore} / 100`],
    ];

    autoTable(doc, {
      startY: 88,
      head: [["Metric Category", "Score / Details"]],
      body: scoreSummary,
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
    });

    // Table 2: Detailed Performance Metrics
    const performanceMetrics = [
      ["Page Load Time", `${result.loadTimeMs} ms`],
      ["HTML Page Size", `${result.pageSizeKB} KB`],
      ["Gzip/Brotli Compression", result.compression && result.compression !== "None" ? result.compression : "Disabled"],
      ["Browser Caching", result.caching ? "Active" : "Missing"],
    ];

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 16,
      head: [["Performance Item", "Measurement"]],
      body: performanceMetrics,
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
    });

    // Table 3: Actionable Recommendations
    const cleanRecommendations = (result.recommendations || []).map((rec) => {
      const parsed = parseRec(rec);
      const priority = parsed.type === "error" ? "High" : parsed.type === "warning" ? "Medium" : "Info";
      return [priority, parsed.text];
    });

    if (cleanRecommendations.length > 0) {
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 16,
        head: [["Priority", "Recommendation Details"]],
        body: cleanRecommendations,
        styles: { fontSize: 8, cellPadding: 4 },
        headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
        columnStyles: {
          0: { cellWidth: 70, fontStyle: "bold" },
          1: { cellWidth: 430 },
        },
        didParseCell: (data) => {
          if (data.column.index === 0 && data.cell.section === "body") {
            if (data.cell.raw === "High") {
              data.cell.styles.textColor = [239, 68, 68];
            } else if (data.cell.raw === "Medium") {
              data.cell.styles.textColor = [245, 158, 11];
            } else {
              data.cell.styles.textColor = [14, 165, 233];
            }
          }
        },
      });
    }

    let filename = "website-optimization-report.pdf";
    try {
      const parsed = new URL(result.url);
      filename = `optimization-report-${parsed.hostname.replace(/[^a-z0-9]/gi, "_")}.pdf`;
    } catch (e) {
      // ignore
    }

    doc.save(filename);
  };

  const handleScan = async () => {
    const trimmedUrl = url.trim();

    if (!trimmedUrl || !trimmedUrl.startsWith("http")) {
      setError("❌ Please enter a valid URL that starts with http or https.");
      setInfo("");
      setResult(null);
      return;
    }

    await protection(async (userToken) => {
      try {
        setLoading(true);
        setError("");
        setInfo("");
        setResult(null);

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/website-optimization`,
          {
            url: trimmedUrl,
          },
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );

        setInfo(response.data.message);
        setResult(response.data.data);
      } catch (err) {
        console.error("❌ Error during scan:", err);
        setError(
          err.response?.data?.error || "Something went wrong. Please try again."
        );
      } finally {
        setLoading(false);
      }
    });
  };

  const parseRec = (rec) => {
    let type = "info";
    let cleanText = rec;
    if (rec.startsWith("🔴")) {
      type = "error";
      cleanText = rec.replace(/^🔴\s*/, "");
    } else if (rec.startsWith("🟡")) {
      type = "warning";
      cleanText = rec.replace(/^🟡\s*/, "");
    } else if (rec.startsWith("🎉")) {
      type = "success";
      cleanText = rec.replace(/^🎉\s*/, "");
    }
    return { type, text: cleanText };
  };

  const getLoadTimeColorClass = (ms) => {
    if (ms < 500) return "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
    if (ms < 1500) return "text-amber-400 border-amber-500/20 bg-amber-500/5";
    return "text-rose-400 border-rose-500/20 bg-rose-500/5";
  };

  const getPageSizeColorClass = (kb) => {
    if (kb < 200) return "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
    if (kb < 512) return "text-amber-400 border-amber-500/20 bg-amber-500/5";
    return "text-rose-400 border-rose-500/20 bg-rose-500/5";
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
        .tool-detail-page .bg-black\/30 {
          background:
            radial-gradient(circle at center, rgba(16, 185, 129, 0.04), transparent 55%),
            linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)) !important;
          box-shadow:
            inset 0 0 0 1px rgba(255,255,255,0.01),
            0 0 40px rgba(16, 185, 129, 0.04) !important;
          border-color: rgba(16, 185, 129, 0.12) !important;
        }
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
            <TrendingUp className="h-8 w-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              WEBSITE <span className="text-emerald-400">OPTIMIZATION</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Analyze speed factors, caching policies, compression parameters, and semantic tags to boost core web vitals.
            </p>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Input Form Card */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-emerald-500/10 transition-all duration-300">
              <h2 className="text-lg font-mono font-medium text-zinc-100 mb-6 flex items-center gap-2">
                <Search className="h-5 w-5 text-emerald-400" />
                Performance Auditor
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-mono text-zinc-400 mb-2 font-semibold">
                    Target Website URL
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value.trim())}
                      disabled={loading}
                      className="w-full pl-10 bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 focus:shadow-[0_0_12px_rgba(16,185,129,0.08)] focus:outline-none transition-all placeholder:text-zinc-600 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    onClick={handleScan}
                    disabled={loading || !url.trim()}
                    className="w-full bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/50 rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-2 focus:ring-offset-black/20 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing Page Data...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4" />
                        Run Audit
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Loading Indicator */}
            {loading && (
              <div className="flex flex-col items-center justify-center p-10 bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.15)] animate-pulse">
                <Loader2 className="h-8 w-8 text-emerald-400 animate-spin mb-4" />
                <p className="text-emerald-400 font-mono font-bold text-xs uppercase tracking-widest text-center">
                  Executing optimization checks...
                </p>
                <span className="text-[10px] text-zinc-500 font-mono mt-2 text-center">
                  Testing caching policies, compression settings, and image vectors
                </span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="rounded-xl border border-rose-500/25 bg-rose-500/5 p-4 text-rose-400">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider mb-1">Audit Failed</div>
                    <div className="text-xs text-rose-300">{error}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Results Dashboard */}
            {result && !loading && (
              <div className="space-y-6">
                {/* Visual Score Rings */}
                <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_12px_40px_rgb(0,0,0,0.2)] hover:border-emerald-500/10 transition-all duration-300 flex flex-col sm:flex-row gap-8 justify-around items-center">
                  {/* Performance Score */}
                  <div className="flex flex-col items-center">
                    <span className="mb-3 text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">Performance Score</span>
                    <div className="relative h-28 w-28">
                      <svg className="h-28 w-28 transform -rotate-90">
                        <circle
                          className="text-zinc-800"
                          strokeWidth="8"
                          stroke="currentColor"
                          fill="transparent"
                          r="45"
                          cx="56"
                          cy="56"
                        />
                        <circle
                          className={result.score >= 80 ? "text-emerald-400" : result.score >= 50 ? "text-amber-400" : "text-rose-400"}
                          strokeWidth="8"
                          strokeDasharray={2 * Math.PI * 45}
                          strokeDashoffset={2 * Math.PI * 45 - (result.score / 100) * (2 * Math.PI * 45)}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                          r="45"
                          cx="56"
                          cy="56"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xl font-bold font-mono text-zinc-100">
                        {result.score}
                      </span>
                    </div>
                  </div>

                  {/* SEO Score */}
                  <div className="flex flex-col items-center">
                    <span className="mb-3 text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">Baseline SEO Score</span>
                    <div className="relative h-28 w-28">
                      <svg className="h-28 w-28 transform -rotate-90">
                        <circle
                          className="text-zinc-800"
                          strokeWidth="8"
                          stroke="currentColor"
                          fill="transparent"
                          r="45"
                          cx="56"
                          cy="56"
                        />
                        <circle
                          className={result.seoScore >= 80 ? "text-emerald-400" : result.seoScore >= 50 ? "text-amber-400" : "text-rose-400"}
                          strokeWidth="8"
                          strokeDasharray={2 * Math.PI * 45}
                          strokeDashoffset={2 * Math.PI * 45 - (result.seoScore / 100) * (2 * Math.PI * 45)}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                          r="45"
                          cx="56"
                          cy="56"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xl font-bold font-mono text-zinc-100">
                        {result.seoScore}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Load Time */}
                  <div className={`flex flex-col p-4 rounded-xl border ${getLoadTimeColorClass(result.loadTimeMs)}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span className="text-[10px] uppercase tracking-wider font-mono opacity-85">Load Time</span>
                    </div>
                    <span className="text-base font-mono font-bold">{result.loadTimeMs} ms</span>
                  </div>

                  {/* Page Size */}
                  <div className={`flex flex-col p-4 rounded-xl border ${getPageSizeColorClass(result.pageSizeKB)}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 flex-shrink-0" />
                      <span className="text-[10px] uppercase tracking-wider font-mono opacity-85">Page Size</span>
                    </div>
                    <span className="text-base font-mono font-bold">{result.pageSizeKB} KB</span>
                  </div>

                  {/* Compression */}
                  <div className={`flex flex-col p-4 rounded-xl border ${
                    result.compression && result.compression !== "None"
                      ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
                      : "text-rose-400 border-rose-500/20 bg-rose-500/5"
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 flex-shrink-0" />
                      <span className="text-[10px] uppercase tracking-wider font-mono opacity-85">Compression</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-sm font-bold">
                      {result.compression && result.compression !== "None" ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{result.compression}</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          <span>Disabled</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Browser Caching */}
                  <div className={`flex flex-col p-4 rounded-xl border ${
                    result.caching
                      ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
                      : "text-rose-400 border-rose-500/20 bg-rose-500/5"
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Database className="w-4 h-4 flex-shrink-0" />
                      <span className="text-[10px] uppercase tracking-wider font-mono opacity-85">Caching</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-sm font-bold">
                      {result.caching ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          <span>Missing</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recommendations checklist */}
                <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_12px_40px_rgb(0,0,0,0.2)] space-y-4 hover:border-emerald-500/10 transition-all duration-300">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">Recommendations</h3>
                  {result.recommendations && result.recommendations.length > 0 ? (
                    <div className="space-y-3">
                      {result.recommendations.map((rec, index) => {
                        const parsed = parseRec(rec);
                        return (
                          <div key={index} className="flex items-start gap-3 bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-3.5">
                            {parsed.type === "error" && (
                              <XCircle className="w-4.5 h-4.5 text-rose-400 mt-0.5 flex-shrink-0" />
                            )}
                            {parsed.type === "warning" && (
                              <AlertCircle className="w-4.5 h-4.5 text-amber-400 mt-0.5 flex-shrink-0" />
                            )}
                            {parsed.type === "info" && (
                              <AlertCircle className="w-4.5 h-4.5 text-sky-400 mt-0.5 flex-shrink-0" />
                            )}
                            {parsed.type === "success" && (
                              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                            )}
                            <span className="text-xs font-mono text-zinc-300 leading-relaxed">{parsed.text}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-emerald-400 text-xs font-mono">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                      <span>Excellent! Your website meets all baseline performance and SEO standards.</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={downloadPDF}
                    className="w-full bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/50 px-4 py-3 rounded-xl transition-all duration-300 font-mono font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] focus:outline-none"
                  >
                    <FileDown className="w-4.5 h-4.5" />
                    <span>Download PDF Report</span>
                  </button>
                  <button
                    onClick={() => setShowRaw(!showRaw)}
                    className="w-full bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/50 px-4 py-3 rounded-xl transition-all duration-300 font-mono font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] focus:outline-none"
                  >
                    {showRaw ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    <span>{showRaw ? "Hide Raw Report" : "View Raw Report"}</span>
                  </button>
                </div>

                {showRaw && info && (
                  <pre className="whitespace-pre-wrap rounded-xl border border-zinc-800/80 bg-black p-4 text-xs font-mono text-emerald-500 overflow-x-auto shadow-inner">
                    {info}
                  </pre>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Specs & Guidance Sidebar */}
          <div className="space-y-6">
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Info className="h-4 w-4 text-emerald-400" />
                Optimization Scope
              </h4>
              <ul className="space-y-3.5 list-none pl-0">
                {[
                  "Analyzes response payload size and network delivery speeds.",
                  "Inspects HTTP response headers for compression parameters (Gzip, Brotli).",
                  "Verifies cache control headers and expiration indicators.",
                  "Reviews page layouts for critical SEO tags (Titles, OpenGraph, Canonical).",
                  "Rates core metrics on a scale of 0 to 100.",
                  "Outputs clear priority suggestions to streamline configurations.",
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/60 mt-1.5 flex-shrink-0" />
                    <span className="text-xs text-zinc-400 leading-relaxed">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-400" />
                Load Time Benchmarks
              </h4>
              <div className="space-y-2.5">
                {[
                  { range: "< 500 ms", label: "Optimized (Fast)", color: "text-emerald-400" },
                  { range: "500 – 1499 ms", label: "Average Speed", color: "text-amber-400" },
                  { range: ">= 1500 ms", label: "Unoptimized (Slow)", color: "text-rose-400" },
                ].map(({ range, label, color }) => (
                  <div key={range} className="flex items-center justify-between py-1.5 border-b border-zinc-800/40 last:border-0">
                    <span className={`text-[11px] font-mono font-bold ${color}`}>{range}</span>
                    <span className="text-[11px] text-zinc-500 font-mono">{label}</span>
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
