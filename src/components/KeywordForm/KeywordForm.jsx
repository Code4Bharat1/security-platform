"use client";
import { useState } from "react";
import {
  Search,
  BarChart3,
  Globe,
  AlertCircle,
  CheckCircle,
  Loader2,
  FileText,
  FileDown,
  Info,
  Sliders,
  Database,
  Award,
  TrendingUp,
  List
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import toast, { Toaster } from "react-hot-toast";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";

export default function KeywordPage() {
  const [url, setUrl] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("density"); // density | intelligence
  const protectedAction = useProtectedAction();

  const handleSubmit = async (e) => {
    e.preventDefault?.();
    if (!url.trim()) return;

    setLoading(true);
    setError("");
    setReport(null);
    await protectedAction(async (userToken) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s

        const apiBase = process.env.NEXT_PUBLIC_PROD_API_URL || "http://localhost:5000/api";
        const response = await fetch(
          `${apiBase}/keyword/analyze`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userToken}`,
            },
            body: JSON.stringify({ url }),
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Server error");
        }

        const data = await response.json();
        setReport(data);
        toast.success("Keyword intelligence audit complete!");
      } catch (err) {
        console.error("Keyword analysis failed:", err);
        setError(
          err.name === "AbortError"
            ? "Request timeout"
            : err.message || "Network error"
        );
        toast.error("Failed to complete audit.");
      } finally {
        setLoading(false);
      }
    });
  };

  /* ---------- Exports ---------- */
  const exportPDF = () => {
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
    doc.text("KEYWORD DENSITY AUDIT REPORT", 15, 30);

    // Scan Meta Info
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    doc.text(`Target: ${url}`, 15, 52);
    if (report.title) doc.text(`Title: ${report.title}`, 15, 62);
    if (report.metaDescription)
      doc.text(
        `Meta Description: ${trim(report.metaDescription, 120)}`,
        15,
        72
      );
    doc.text(`Date: ${new Date().toLocaleString()}`, 15, 82);

    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.5);
    doc.line(15, 90, doc.internal.pageSize.width - 15, 90);

    // Summary
    doc.setFontSize(12);
    doc.text("Summary Metrics", 15, 105);
    autoTable(doc, {
      startY: 112,
      head: [["Metric", "Value"]],
      body: [
        ["Total Words", String(report.totalWords ?? 0)],
        ["Top Keywords (count)", String(report.singleWords?.length ?? 0)],
        ["Top Phrases (count)", String(report.phrases?.length ?? 0)],
      ],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
      columnStyles: { 0: { cellWidth: 180 }, 1: { cellWidth: 340 } },
      theme: "grid",
    });

    // Top Single Keywords
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 18,
      head: [["Keyword", "Count", "Density (%)"]],
      body: (report.singleWords || []).map((k) => [
        k.phrase,
        String(k.count),
        String(k.percentage),
      ]),
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 280 },
        1: { cellWidth: 100 },
        2: { cellWidth: 140 },
      },
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
      theme: "striped",
    });

    // Top Two-word Phrases
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 18,
      head: [["Two-word Phrase", "Count", "Density (%)"]],
      body: (report.phrases || []).map((k) => [
        k.phrase,
        String(k.count),
        String(k.percentage),
      ]),
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 280 },
        1: { cellWidth: 100 },
        2: { cellWidth: 140 },
      },
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
      theme: "striped",
    });

    doc.save(`keyword-report-${safeHostname(url)}.pdf`);
  };

  const exportInsightPDF = () => {
    const i = report?.insights;
    if (!i) return;
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
    doc.text("KEYWORD INTELLIGENCE INSIGHT REPORT", 15, 30);

    // Scan Meta Info
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    doc.text(`Website: ${i.header?.website || safeHostname(url)}`, 15, 52);
    doc.text(`Total Keywords Extracted: ${i.totals?.totalExtracted ?? 0}`, 15, 62);
    doc.text(`Filtered SEO Keywords: ${i.totals?.filteredSEOKeywords ?? 0}`, 15, 72);
    doc.text(`Date: ${new Date().toLocaleString()}`, 15, 82);

    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.5);
    doc.line(15, 90, doc.internal.pageSize.width - 15, 90);

    // High Priority
    doc.setFontSize(12);
    doc.text("High-Priority Keywords", 15, 105);
    autoTable(doc, {
      startY: 112,
      head: [
        [
          "Keyword",
          "Search Volume",
          "CPC (USD)",
          "Difficulty (%)",
          "Trend (6 mo)",
          "Intent",
        ],
      ],
      body: (i.highPriority || []).map((row) => [
        row.keyword,
        row.searchVolume ?? "-",
        row.cpc ?? "-",
        row.difficulty ?? "-",
        row.trend ?? "—",
        row.intent ?? "-",
      ]),
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
      theme: "striped",
    });

    // Long-tail
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 18,
      head: [["Keyword", "Search Volume", "Difficulty (%)", "CTR Potential"]],
      body: (i.longTail || []).map((row) => [
        row.keyword,
        row.searchVolume ?? "-",
        row.difficulty ?? "-",
        row.ctrPotential ?? "-",
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [52, 211, 153], textColor: [255, 255, 255] },
      theme: "striped",
    });

    // Competitor Overlap
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 18,
      head: [
        ["Keyword", "Rank on Your Site", "Rank on Competitor", "Competitor"],
      ],
      body: (i.competitorOverlap || []).map((row) => [
        row.keyword,
        String(row.rankOnYourSite ?? "-"),
        String(row.rankOnCompetitor ?? "-"),
        row.competitorUrl ? row.competitorUrl.replace(/^https?:\/\//, "") : "-",
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [4, 120, 87], textColor: [255, 255, 255] },
      theme: "grid",
    });

    // Suggested Actions
    const actions = (i.suggestedActions || [])
      .map((a, idx) => `${idx + 1}. ${a}`)
      .join("\n");
    const startY = doc.lastAutoTable.finalY + 24;
    doc.setFontSize(12);
    doc.text("Suggested Actions", 15, startY);
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(actions || "—", 515);
    doc.text(lines, 15, startY + 16);

    doc.save(`insight-report-${safeHostname(url)}.pdf`);
  };

  const exportTXT = () => {
    if (!report) return;

    const lines = [];
    lines.push("Keyword Density Report");
    lines.push(`Target: ${url}`);
    if (report.title) lines.push(`Title: ${report.title}`);
    if (report.metaDescription)
      lines.push(`Meta Description: ${report.metaDescription}`);
    lines.push(`Timestamp: ${new Date().toISOString()}`);
    lines.push("");

    lines.push("Summary");
    lines.push(`- Total Words: ${report.totalWords ?? 0}`);
    lines.push(`- Top Keywords (count): ${report.singleWords?.length ?? 0}`);
    lines.push(`- Top Phrases (count): ${report.phrases?.length ?? 0}`);
    lines.push("");

    lines.push("Top Single Keywords:");
    lines.push("Keyword\tCount\tDensity(%)");
    (report.singleWords || []).forEach((k) =>
      lines.push(`${k.phrase}\t${k.count}\t${k.percentage}`)
    );
    lines.push("");

    lines.push("Top Two-word Phrases:");
    lines.push("Phrase\tCount\tDensity(%)");
    (report.phrases || []).forEach((k) =>
      lines.push(`${k.phrase}\t${k.count}\t${k.percentage}`)
    );

    downloadText(lines.join("\n"), `keyword-report-${safeHostname(url)}.txt`);
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
        .tool-detail-page table {
          display: table !important;
          width: 100% !important;
        }
        .tool-detail-page .tool-detail-panel,
        .tool-detail-page .bg-gray-900,
        .tool-detail-page .bg-zinc-900\/70,
        .tool-detail-page .bg-black\/60,
        .tool-detail-page .bg-gray-850,
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
        .tool-detail-page .action-btn {
          background-color: #10b981 !important;
          color: #000000 !important;
          border-color: #10b981 !important;
        }
        .tool-detail-page .action-btn:hover,
        .tool-detail-page .action-btn:focus,
        .tool-detail-page .action-btn:active {
          background-color: #10b981 !important;
          color: #000000 !important;
          opacity: 1 !important;
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.3) !important;
        }
      `}</style>

      <div className="tool-detail-shell">
        {/* Team Header Badges & Title Icons */}
        <div className="flex justify-between items-start gap-4 mt-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
              <BarChart3 className="text-emerald-400 w-8 h-8" />
            </div>
            <div>
              <h1 className="font-mono font-bold text-2xl md:text-3xl text-zinc-100 tracking-tight">
                KEYWORD <span className="text-emerald-400">INTELLIGENCE</span>
              </h1>
              <p className="text-sm text-zinc-350 mt-2 max-w-2xl font-mono leading-relaxed">
                Analyze keyword density, extract single/phrase frequencies, and access keyword intelligence metrics.
              </p>
            </div>
          </div>
          <div className="hidden sm:block">
            <span className="rounded-full border border-emerald-500/30 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-emerald-400 whitespace-nowrap">
              Green Team
            </span>
          </div>
        </div>

        {/* 2-Column Grid Layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Left Column: Input Form & Progress */}
          <div className="space-y-6">
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-emerald-500/10 transition-all duration-300">
              <h2 className="text-lg font-mono font-medium text-zinc-100 mb-6 flex items-center gap-2">
                <Search className="h-5 w-5 text-emerald-400" />
                Analyze Web Content
              </h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="url" className="block text-xs uppercase tracking-widest font-mono text-zinc-400 mb-2 font-semibold">Target Website URL</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                    <input
                      id="url"
                      type="text"
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value.trim())}
                      disabled={loading}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !loading && url.trim())
                          handleSubmit(e);
                      }}
                      className="w-full pl-11 bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3 text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 focus:shadow-[0_0_12px_rgba(16,185,129,0.08)] focus:outline-none transition-all placeholder:text-zinc-600 font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !url.trim()}
                    className="action-btn w-full bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/50 rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-2 focus:ring-offset-black/20 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        Analyze Keyword Density
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {loading && (
              <div className="flex flex-col items-center justify-center p-10 bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.15)] animate-[pulse_2s_infinite]">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-4" />
                <p className="text-emerald-400 font-mono font-bold text-xs uppercase tracking-widest text-center">
                  Analyzing keyword density...
                </p>
                <span className="text-[10px] text-zinc-500 font-mono mt-2 text-center">
                  This may take a few moments while we crawl and index the target website.
                </span>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-rose-500/25 bg-rose-500/5 p-4 text-rose-450">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-455 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-1">
                      Analysis Failed
                    </h3>
                    <p className="text-xs text-rose-300">{error}</p>
                  </div>
                </div>
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
              <ul className="space-y-3.5 text-xs text-zinc-300 list-none pl-0 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/60 mt-1.5 flex-shrink-0" />
                  <span>Crawls the target site content, ignoring standard stopwords.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/60 mt-1.5 flex-shrink-0" />
                  <span>Calculates keyword density percentages for single and two-word combinations.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/60 mt-1.5 flex-shrink-0" />
                  <span>Estimates SEO keyword intelligence, CPC rates, search volumes, and difficulty.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/60 mt-1.5 flex-shrink-0" />
                  <span>Extracts competitor overlap data and rank information.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Report Section */}
        {report && !loading && !error && (
          <div className="mt-8 space-y-8 animate-[fadeIn_0.3s_ease-out]">
            {/* Success + Exports */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between shadow-[0_8px_30px_rgb(0,0,0,0.15)] hover:border-emerald-500/10 transition-all">
              <div className="flex items-center gap-4">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">
                    Analysis Complete!
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Found{" "}
                    <span className="font-mono text-emerald-400 font-bold">{report.totalWords}</span>{" "}
                    total words analyzed.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={exportPDF}
                  className="action-btn bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/50 px-3.5 py-2 rounded-xl transition-all duration-300 font-mono font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] focus:outline-none"
                >
                  <FileText className="w-4 h-4" /> Export PDF
                </button>
                {report.insights && (
                  <button
                    onClick={exportInsightPDF}
                    className="action-btn bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/50 px-3.5 py-2 rounded-xl transition-all duration-300 font-mono font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] focus:outline-none"
                  >
                    <FileText className="w-4 h-4" /> Insight PDF
                  </button>
                )}
                <button
                  onClick={exportTXT}
                  className="action-btn bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/50 px-3.5 py-2 rounded-xl transition-all duration-300 font-mono font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] focus:outline-none"
                >
                  <FileDown className="w-4 h-4" /> Export TXT
                </button>
              </div>
            </div>

            {/* Tool Tab Nav */}
            <div className="flex border-b border-zinc-800/80 tool-tab-nav">
              <button
                onClick={() => setActiveTab("density")}
                className={`tool-tab-button font-mono text-xs cursor-pointer ${
                  activeTab === "density"
                    ? "tool-tab-button-active text-emerald-400 border-b-transparent"
                    : "tool-tab-button-idle text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Density Auditor
              </button>
              {report.insights && (
                <button
                  onClick={() => setActiveTab("intelligence")}
                  className={`tool-tab-button font-mono text-xs cursor-pointer ${
                    activeTab === "intelligence"
                      ? "tool-tab-button-active text-emerald-400 border-b-transparent"
                      : "tool-tab-button-idle text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Intelligence Report
                </button>
              )}
            </div>

            {/* TAB CONTENT 1: Density Auditor */}
            {activeTab === "density" && (
              <div className="space-y-8 animate-[fadeIn_0.2s_ease-out]">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard value={report.totalWords} label="Total Words" />
                  <StatCard value={report.singleWords?.length || 0} label="Top Keywords" />
                  <StatCard value={report.phrases?.length || 0} label="Key Phrases" />
                </div>

                {/* Single Keywords */}
                <TableBlock title="Top Single Keywords">
                  <div className="max-h-96 overflow-y-auto custom-scrollbar">
                    <Table header={["Keyword", "Count", "Density (%)"]}>
                      {(report.singleWords || []).map(
                        ({ phrase, count, percentage }) => (
                          <tr
                            key={phrase}
                            className="border-b last:border-0 border-zinc-800/50 hover:bg-zinc-900/10 transition-colors"
                          >
                            <td className="px-6 py-4 font-mono text-sm text-zinc-300 font-semibold">
                              {phrase}
                            </td>
                            <td className="px-6 py-4 text-center font-mono">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/30 text-emerald-400 border border-emerald-500/20">
                                {count}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center font-mono">
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-16 bg-zinc-800/40 rounded-full h-1.5">
                                  <div
                                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1.5 rounded-full transition-all"
                                    style={{
                                      width: `${Math.min(
                                        Number(percentage) * 4,
                                        100
                                      )}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-xs text-zinc-400">
                                  {percentage}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </Table>
                  </div>
                </TableBlock>

                {/* Two-word Phrases */}
                <TableBlock title="Top Two-word Phrases">
                  <div className="max-h-96 overflow-y-auto custom-scrollbar">
                    <Table header={["Phrase", "Count", "Density (%)"]}>
                      {(report.phrases || []).map(({ phrase, count, percentage }) => (
                        <tr
                          key={phrase}
                          className="border-b last:border-0 border-zinc-800/50 hover:bg-zinc-900/10 transition-colors"
                        >
                          <td className="px-6 py-4 font-mono text-sm text-zinc-300 font-semibold">
                            {phrase}
                          </td>
                          <td className="px-6 py-4 text-center font-mono">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/30 text-emerald-400 border border-emerald-500/20">
                              {count}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center font-mono">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 bg-zinc-800/40 rounded-full h-1.5">
                                <div
                                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1.5 rounded-full transition-all"
                                  style={{
                                    width: `${Math.min(
                                      Number(percentage) * 4,
                                      100
                                    )}%`,
                                  }}
                                />
                              </div>
                              <span className="text-xs text-zinc-400">
                                {percentage}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </Table>
                  </div>
                </TableBlock>
              </div>
            )}

            {/* TAB CONTENT 2: Intelligence Report */}
            {activeTab === "intelligence" && report.insights && (
              <div className="space-y-8 animate-[fadeIn_0.2s_ease-out]">
                {/* Summary Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard value={report.insights.totals?.totalExtracted || 0} label="Extracted Keywords" />
                  <StatCard value={report.insights.totals?.filteredSEOKeywords || 0} label="Filtered SEO Targets" />
                  <StatCard value={new Set(report.insights.competitorOverlap?.map(c => c.competitorUrl)).size || 0} label="Tracked Competitors" />
                </div>

                {/* High-Priority Keywords */}
                <TableBlock title="High-Priority Keywords">
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    <Table header={["Keyword", "Search Vol", "CPC (USD)", "Difficulty", "Trend", "Intent"]}>
                      {(report.insights.highPriority || []).map((row, idx) => (
                        <tr key={idx} className="border-b last:border-0 border-zinc-800/50 hover:bg-zinc-900/10 transition-colors">
                          <td className="px-6 py-4 font-mono text-sm text-zinc-300 font-semibold">{row.keyword}</td>
                          <td className="px-6 py-4 text-center font-mono text-zinc-400">{row.searchVolume ?? "-"}</td>
                          <td className="px-6 py-4 text-center font-mono text-zinc-400">{row.cpc ? `$${row.cpc}` : "-"}</td>
                          <td className="px-6 py-4 text-center font-mono">
                            <span className={`px-2 py-0.5 rounded text-[10px] border ${
                              row.difficulty > 65
                                ? "border-rose-500/20 bg-rose-500/5 text-rose-400"
                                : row.difficulty > 35
                                ? "border-amber-500/20 bg-amber-500/5 text-amber-400"
                                : "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
                            }`}>
                              {row.difficulty}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center font-mono text-zinc-400">{row.trend || "-"}</td>
                          <td className="px-6 py-4 text-center font-mono">
                            <span className="px-2 py-0.5 rounded text-[10px] border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 uppercase tracking-widest text-[8px]">
                              {row.intent ?? "commercial"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </Table>
                  </div>
                </TableBlock>

                {/* Long-tail Keywords */}
                <TableBlock title="Long-tail Keyword Targets">
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    <Table header={["Keyword", "Search Vol", "Difficulty", "CTR Potential"]}>
                      {(report.insights.longTail || []).map((row, idx) => (
                        <tr key={idx} className="border-b last:border-0 border-zinc-800/50 hover:bg-zinc-900/10 transition-colors">
                          <td className="px-6 py-4 font-mono text-sm text-zinc-300 font-semibold">{row.keyword}</td>
                          <td className="px-6 py-4 text-center font-mono text-zinc-400">{row.searchVolume ?? "-"}</td>
                          <td className="px-6 py-4 text-center font-mono">
                            <span className="px-2 py-0.5 rounded text-[10px] border border-emerald-500/20 bg-emerald-500/5 text-emerald-400">
                              {row.difficulty}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center font-mono text-zinc-400">{row.ctrPotential ?? "High"}</td>
                        </tr>
                      ))}
                    </Table>
                  </div>
                </TableBlock>

                {/* Competitor Overlap */}
                <TableBlock title="Competitor Keyword Share">
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    <Table header={["Keyword", "Your Rank", "Competitor Rank", "Competitor URL"]}>
                      {(report.insights.competitorOverlap || []).map((row, idx) => (
                        <tr key={idx} className="border-b last:border-0 border-zinc-800/50 hover:bg-zinc-900/10 transition-colors">
                          <td className="px-6 py-4 font-mono text-sm text-zinc-300 font-semibold">{row.keyword}</td>
                          <td className="px-6 py-4 text-center font-mono text-zinc-400">{row.rankOnYourSite ?? "-"}</td>
                          <td className="px-6 py-4 text-center font-mono text-emerald-450 font-semibold">{row.rankOnCompetitor ?? "-"}</td>
                          <td className="px-6 py-4 font-mono text-xs max-w-[200px] truncate">
                            <a
                              href={row.competitorUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-400 hover:text-emerald-300 hover:underline transition-all truncate"
                            >
                              {row.competitorUrl ? row.competitorUrl.replace(/^https?:\/\//, "") : "-"}
                            </a>
                          </td>
                        </tr>
                      ))}
                    </Table>
                  </div>
                </TableBlock>

                {/* Suggested Actions */}
                <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-emerald-500/10 transition-all duration-300 space-y-4">
                  <h3 className="text-md font-mono font-medium text-zinc-100 flex items-center gap-2">
                    <Award className="h-5 w-5 text-emerald-400" />
                    <span>Suggested Audit Actions</span>
                  </h3>
                  <div className="space-y-3.5 text-sm font-mono text-zinc-300 leading-relaxed">
                    {(report.insights.suggestedActions || []).map((action, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- UI bits ---------- */
function StatCard({ value, label }) {
  return (
    <div
      className="p-4.5 rounded-xl border border-emerald-500/20 text-emerald-400 shadow-[inset_0_0_12px_rgba(16,185,129,0.02)] transition-all duration-300 hover:scale-[1.01]"
      style={{ backgroundColor: "rgba(16, 185, 129, 0.08)" }}
    >
      <div className="text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5 font-medium">{label}</div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
    </div>
  );
}

function TableBlock({ title, children }) {
  return (
    <div className="border border-zinc-800/85 bg-zinc-950/20 backdrop-blur-md rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.15)] hover:border-emerald-500/10 transition-all duration-300">
      <div className="border-b border-zinc-850 bg-zinc-900/10 px-6 py-4.5">
        <h3 className="text-sm font-mono font-semibold uppercase tracking-wider text-zinc-200">{title}</h3>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

function Table({ header, children }) {
  return (
    <table className="w-full">
      <thead className="bg-zinc-900/40 text-zinc-400 font-mono text-[10px] uppercase tracking-wider border-b border-zinc-800/50">
        <tr>
          {header.map((h, i) => (
            <th
              key={h}
              className={`px-6 py-4.5 font-medium ${i > 0 ? "text-center" : "text-left"}`}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-800/50 text-xs">{children}</tbody>
    </table>
  );
}

/* ---------- helpers ---------- */
function safeHostname(u) {
  try {
    return (
      new URL(u.startsWith("http") ? u : `https://${u}`).hostname || "site"
    );
  } catch {
    return "site";
  }
}
function trim(s, n) {
  const x = String(s || "");
  return x.length > n ? x.slice(0, n - 1) + "…" : x;
}
function downloadText(content, filename) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
