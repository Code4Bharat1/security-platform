"use client";

import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Search,
  BarChart3,
  Globe,
  AlertCircle,
  Loader2,
  FileText,
  FileDown,
  Info,
  Sliders,
  Award,
  List,
  Clock,
  Database
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import useProtectedAction from "@/components/UseProtectedAction/UseProtectedAction";

const API_BASE =
  process.env.NEXT_PUBLIC_PROD_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:5000/api";
const ENDPOINT = "/keywords/generate";

export default function KeywordIntelligencePage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [raw, setRaw] = useState([]);

  const [editable, setEditable] = useState(false);
  const [highPriority, setHighPriority] = useState([]);
  const [longTail, setLongTail] = useState([]);
  const [overlap, setOverlap] = useState([]);

  const protectedAction = useProtectedAction();

  const [dateStr, setDateStr] = useState("");
  useEffect(() => {
    setDateStr(
      new Date().toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    );
  }, []);

  const websiteHost = useMemo(() => {
    try {
      return url ? new URL(url).origin : "";
    } catch {
      return "";
    }
  }, [url]);

  function classifyIntent(k) {
    const s = k.toLowerCase();
    if (/(buy|price|agency|hire|company|services?|solutions?)/.test(s))
      return "Commercial";
    if (/(best|vs|comparison|deal|quote|pricing)/.test(s))
      return "Transactional";
    if (/(how|what|why|guide|tutorial|benefits|tips)/.test(s))
      return "Informational";
    return "Navigational";
  }

  function seedTables(keywords) {
    const hp = keywords
      .filter((k) => k.trim().split(/\s+/).length <= 3)
      .slice(0, 6)
      .map((k) => ({
        keyword: k,
        volume: "",
        cpc: "",
        difficulty: "",
        trend6m: "",
        intent: classifyIntent(k) || "",
      }));

    const lt = keywords
      .filter((k) => k.trim().split(/\s+/).length >= 3)
      .slice(0, 8)
      .map((k) => ({
        keyword: k,
        volume: "",
        cpc: "",
        difficulty: "",
        trend6m: "",
        intent: classifyIntent(k) || "",
      }));

    const overlapCandidates = keywords.filter((k) =>
      /(services?|solutions?)/i.test(k)
    );
    const ov = overlapCandidates.slice(0, 6).map((k) => ({
      keyword: k,
      yours: "",
      competitor: "",
    }));

    setHighPriority(hp);
    setLongTail(lt);
    setOverlap(ov);
  }

  async function analyze() {
    setError(null);

    let normalized = url.trim();
    if (!normalized) return;

    try {
      if (!/^https?:\/\//i.test(normalized))
        normalized = `https://${normalized}`;
      const u = new URL(normalized);
      if (!/^https?:$/.test(u.protocol)) throw new Error("bad");
    } catch {
      setError("Invalid URL. Please enter a full http(s) link.");
      toast.error("Invalid Target URL.");
      return;
    }

    setLoading(true);
    await protectedAction(async (userToken) => {
      try {
        const r = await fetch(`${API_BASE}${ENDPOINT}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({ url: normalized }),
        });

        if (!r.ok) {
          let msg = "";
          try {
            const data = await r.json();
            msg = data?.message || "";
          } catch { }
          const friendly =
            r.status === 400 || r.status === 404
              ? "Invalid URL. The page was not found or is unreachable."
              : msg && /invalid url|unreachable|not found/i.test(msg)
                ? "Invalid URL. The page was not found or is unreachable."
                : "please enter a valid URL.";
          setError(friendly);
          toast.error("Vulnerability scan failed.");
          return;
        }

        const data = await r.json();
        const kws = Array.isArray(data.keywords) ? data.keywords : [];
        setRaw(kws);

        if (Array.isArray(data.highPriority) && data.highPriority.length) {
          setHighPriority(data.highPriority);
        } else {
          seedTables(kws);
        }
        if (Array.isArray(data.longTail)) setLongTail(data.longTail);
        if (Array.isArray(data.overlap)) setOverlap(data.overlap);
        toast.success("Keyword intelligence report generated!");
      } catch (e) {
        const msg = String(e?.message || "");
        if (
          /ENOTFOUND|EAI_AGAIN|ECONNREFUSED|ETIMEDOUT|Failed to fetch|NetworkError|TypeError: Failed to fetch/i.test(
            msg
          )
        ) {
          setError("Invalid URL. The site is unreachable.");
        } else {
          setError("Sorry, something went wrong.");
        }
        toast.error("Failed to complete scan.");
      } finally {
        setLoading(false);
      }
    });
  }

  function onChangeCell(rows, setRows, i, key, value) {
    const next = rows.slice();
    const row = { ...rows[i] };
    if (["volume", "cpc", "difficulty"].includes(key)) {
      row[key] = value === "" ? "" : Number(value);
    } else {
      row[key] = value;
    }
    next[i] = row;
    setRows(next);
  }

  function exportTXT() {
    const lines = [];
    lines.push(`Keyword Intelligence Report — ${dateStr}`);
    if (websiteHost) lines.push(`Website: ${websiteHost}`);
    lines.push("");
    lines.push("High-Priority Keywords:");
    highPriority.forEach((r, i) =>
      lines.push(
        `${i + 1}. ${r.keyword}  | Vol:${r.volume || "-"}  CPC:${r.cpc || "-"
        }  Diff:${r.difficulty || "-"}  Intent:${r.intent || "-"}`
      )
    );
    lines.push("");
    lines.push("Long-Tail Opportunities:");
    longTail.forEach((r, i) =>
      lines.push(
        `${i + 1}. ${r.keyword}  | Vol:${r.volume || "-"}  Diff:${r.difficulty || "-"
        }  CTR:(fill)`
      )
    );
    lines.push("");
    lines.push("Competitor Overlap:");
    overlap.forEach((r, i) =>
      lines.push(
        `${i + 1}. ${r.keyword}  | Rank on your site: ${r.yours || "-"
        } | Rank on competitor: ${r.competitor || "-"}`
      )
    );
    lines.push("");
    lines.push("Suggested Actions:");
    lines.push(
      "1) Remove low-value keywords and noise.",
      "2) Create content around high-intent, lower-difficulty terms.",
      "3) Optimize title/meta for top commercial terms.",
      "4) Build backlinks to long-tail opportunity pages."
    );

    const blob = new Blob([lines.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "keyword-intel-report.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function exportPDF() {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const marginX = 40;

    doc.setFontSize(14);
    doc.text("Enhanced Industry-Level Output Structure", marginX, 48);
    doc.setFontSize(10);
    doc.text(`Keyword Intelligence Report — ${dateStr}`, marginX, 68);
    if (websiteHost) doc.text(`Website: ${websiteHost}`, marginX, 84);
    doc.text(`Total Keywords Extracted: ${raw.length}`, marginX, 100);
    doc.text(
      `Filtered SEO Keywords: ${highPriority.length + longTail.length}`,
      marginX,
      116
    );

    autoTable(doc, {
      startY: 140,
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
      body: highPriority.map((r) => [
        r.keyword,
        r.volume || "—",
        r.cpc || "—",
        r.difficulty || "—",
        r.trend6m === "↗" ? "Rising" : r.trend6m === "↘" ? "Falling" : r.trend6m === "↔" ? "Stable" : r.trend6m || "—",
        r.intent || "—",
      ]),
      styles: { fontSize: 9 },
      headStyles: { fontStyle: "bold" },
      margin: { left: marginX, right: marginX },
      theme: "grid",
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 22,
      head: [["Keyword", "Search Volume", "Difficulty (%)", "CTR Potential"]],
      body: longTail.map((r) => [
        r.keyword,
        r.volume || "—",
        r.difficulty || "—",
        r.ctrPotential || "—",
      ]),
      styles: { fontSize: 9 },
      headStyles: { fontStyle: "bold" },
      margin: { left: marginX, right: marginX },
      theme: "grid",
    });

    const isCustomOverlap = overlap.length > 0 && ('commonCompetitors' in overlap[0] || 'sharedKeywords' in overlap[0]);
    const overlapHeaders = isCustomOverlap
      ? ["Common Competitors", "Shared Keywords", "Overlap Score"]
      : ["Keyword", "Rank on Your Site", "Rank on Competitor"];
    const overlapBody = overlap.map((r) =>
      isCustomOverlap
        ? [r.commonCompetitors || "—", r.sharedKeywords || "—", r.overlapScore || "—"]
        : [r.keyword || "—", r.yours || "—", r.competitor || "—"]
    );

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 22,
      head: [overlapHeaders],
      body: overlapBody,
      styles: { fontSize: 9 },
      headStyles: { fontStyle: "bold" },
      margin: { left: marginX, right: marginX },
      theme: "grid",
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 22,
      head: [["Suggested Actions"]],
      body: [
        ["1. Remove low-value keywords."],
        ["2. Create content around high-intent, lower-difficulty keywords."],
        ["3. Optimize title/meta for top commercial-intent keywords."],
        ["4. Build backlinks targeting long-tail opportunities."],
      ],
      styles: { fontSize: 9, cellPadding: 6 },
      headStyles: { fontStyle: "bold" },
      margin: { left: marginX, right: marginX },
      theme: "grid",
    });

    doc.save("keyword-intel-report.pdf");
  }

  const hasData = highPriority.length + longTail.length > 0;

  return (
    <div
      className="min-h-screen bg-black text-slate-100 tool-detail-page"
      style={{
        '--hero-ambient-a': 'rgba(16, 185, 129, 0.08)',
        '--hero-ambient-b': 'rgba(16, 185, 129, 0.03)',
        '--glow-primary': '0 0 34px rgba(16, 185, 129, 0.16)',
        '--gold': '#10b981',
        '--gold-strong': '#34d399',
        '--gold-dark': '#047857',
        '--ring': 'rgba(16, 185, 129, 0.34)',
        '--surface-glow': 'rgba(16, 185, 129, 0.14)',
      }}
    >
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

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <Toaster position="top-right" reverseOrder={false} />

        {/* Team Header Badges & Title Icons */}
        <div className="flex justify-between items-start gap-4 mt-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
              <BarChart3 className="text-emerald-400 w-8 h-8" />
            </div>
            <div>
              <h1 className="font-mono font-bold text-2xl md:text-3xl text-zinc-100 tracking-tight">
                KEYWORD <span className="text-emerald-400">INTELLIGENCE</span>
              </h1>
              <p className="text-sm text-zinc-350 mt-2 max-w-2xl font-mono leading-relaxed">
                Generate a comprehensive keyword intelligence report for your website, complete with actionable insights.
              </p>
            </div>
          </div>
          <div className="hidden sm:block">
            <span className="rounded-full border border-emerald-500/30 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-emerald-400 whitespace-nowrap">
              Green Team
            </span>
          </div>
        </div>

        {/* 2-Column Grid Layout for settings & actions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left panel: Settings */}
          <div className="lg:col-span-8">
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-emerald-500/10 transition-all duration-300 h-full flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-mono font-medium text-zinc-100 mb-6 flex items-center gap-2">
                  <Sliders className="text-emerald-400 w-5 h-5" />
                  <span>Generator settings</span>
                </h2>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs uppercase tracking-widest font-mono text-zinc-400 font-semibold">
                        Website URL
                      </label>
                      {dateStr && (
                        <span className="text-[10px] text-zinc-500 font-mono" suppressHydrationWarning>
                          {dateStr}
                        </span>
                      )}
                    </div>
                    <input
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com/"
                      className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3 text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 focus:shadow-[0_0_12px_rgba(16,185,129,0.08)] focus:outline-none transition-all placeholder:text-zinc-600 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5 pt-6">
                <button
                  onClick={analyze}
                  disabled={loading || !url}
                  className="action-btn px-5 py-3.5 rounded-xl font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Generate</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setEditable((v) => !v)}
                  disabled={!hasData}
                  className="action-btn bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/50 px-4 py-3.5 rounded-xl transition-all duration-300 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40"
                >
                  {editable ? "Lock Editing" : "Edit Metrics"}
                </button>

                <button
                  onClick={exportTXT}
                  disabled={!hasData}
                  className="action-btn bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/50 px-4 py-3.5 rounded-xl transition-all duration-300 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Export TXT</span>
                </button>

                <button
                  onClick={exportPDF}
                  disabled={!hasData}
                  className="action-btn bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/50 px-4 py-3.5 rounded-xl transition-all duration-300 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40"
                >
                  <FileText className="w-4 h-4" />
                  <span>Export PDF</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Suggested Actions */}
          <div className="lg:col-span-4">
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-emerald-500/10 transition-all duration-300 h-full flex flex-col justify-between space-y-5">
              <div>
                <h2 className="text-lg font-mono font-medium text-zinc-100 mb-6 flex items-center gap-2">
                  <List className="text-emerald-400 w-5 h-5" />
                  <span>Suggested Actions</span>
                </h2>

                <div className="space-y-4 text-xs md:text-sm font-mono text-zinc-300 leading-relaxed">
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                    <span>Remove low-value keywords (menus, UI labels, noise).</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                    <span>Create content around high-volume, lower-difficulty keywords.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                    <span>Optimize title/meta tags for top commercial-intent terms.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                    <span>Build backlinks targeting long-tail opportunities.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {error && (
          <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-950/10 text-rose-400 text-xs font-mono flex items-start gap-2 max-w-6xl">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>Error: {error}</span>
          </div>
        )}

        {/* Results Block - Spans 100% full-width below settings & suggestions */}
        {hasData && (
          <div className="space-y-8 animate-[fadeIn_0.3s_ease-out] w-full">
            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div
                className="p-5 rounded-xl border border-emerald-500/20 text-emerald-400 shadow-[inset_0_0_12px_rgba(16,185,129,0.02)] transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between gap-1.5"
                style={{ backgroundColor: "rgba(16, 185, 129, 0.08)" }}
              >
                <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-semibold">Website</span>
                <span className="text-md font-semibold font-mono truncate text-zinc-200">{websiteHost.replace(/^https?:\/\//, "") || "—"}</span>
              </div>
              <div
                className="p-5 rounded-xl border border-emerald-500/20 text-emerald-400 shadow-[inset_0_0_12px_rgba(16,185,129,0.02)] transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between gap-1.5"
                style={{ backgroundColor: "rgba(16, 185, 129, 0.08)" }}
              >
                <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-semibold">Extracted Keywords</span>
                <span className="text-3xl font-bold font-mono text-zinc-200">{raw.length}</span>
              </div>
              <div
                className="p-5 rounded-xl border border-emerald-500/20 text-emerald-400 shadow-[inset_0_0_12px_rgba(16,185,129,0.02)] transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between gap-1.5"
                style={{ backgroundColor: "rgba(16, 185, 129, 0.08)" }}
              >
                <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-semibold">Filtered SEO Targets</span>
                <span className="text-3xl font-bold font-mono text-zinc-200">{highPriority.length + longTail.length}</span>
              </div>
            </div>

            {/* High Priority Table */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-emerald-500/10 transition-all duration-300 space-y-4">
              <h3 className="text-lg font-mono font-medium text-zinc-100 flex items-center gap-2 border-b border-zinc-800/40 pb-3">
                <BarChart3 className="h-5 w-5 text-emerald-400" />
                <span>High-Priority Keywords</span>
              </h3>
              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                <TableHP
                  rows={highPriority}
                  editable={editable}
                  onChange={(i, key, val) =>
                    onChangeCell(highPriority, setHighPriority, i, key, val)
                  }
                />
              </div>
            </div>

            {/* Long Tail Table */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-emerald-500/10 transition-all duration-300 space-y-4">
              <h3 className="text-lg font-mono font-medium text-zinc-100 flex items-center gap-2 border-b border-zinc-800/40 pb-3">
                <Sliders className="h-5 w-5 text-emerald-400" />
                <span>Long-Tail Keyword Opportunities</span>
              </h3>
              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                <TableLT
                  rows={longTail}
                  editable={editable}
                  onChange={(i, key, val) =>
                    onChangeCell(longTail, setLongTail, i, key, val)
                  }
                />
              </div>
            </div>

            {/* Overlap Table */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-emerald-500/10 transition-all duration-300 space-y-4">
              <h3 className="text-lg font-mono font-medium text-zinc-100 flex items-center gap-2 border-b border-zinc-800/40 pb-3">
                <Database className="h-5 w-5 text-emerald-400" />
                <span>Competitor Overlap</span>
              </h3>
              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                <TableOverlap
                  rows={overlap}
                  editable={editable}
                  onChange={(i, key, val) => {
                    const next = overlap.slice();
                    next[i] = {
                      ...next[i],
                      [key]: val === "" ? "" : Number(val),
                    };
                    setOverlap(next);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Shared dark table styles ---------- */

const theadCls =
  "bg-zinc-900/40 text-zinc-400 font-mono text-[10px] uppercase tracking-wider border-b border-zinc-800/50 [&>tr>th]:px-4 [&>tr>th]:py-3.5 [&>tr>th]:font-semibold";
const rowCls =
  "border-b last:border-0 border-zinc-800/40 hover:bg-zinc-900/10 transition-colors [&>td]:px-4 [&>td]:py-3 text-zinc-300 font-mono text-xs";
const inputCls =
  "bg-zinc-900/60 text-zinc-100 border border-zinc-800 rounded-lg px-2 py-1 text-xs focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 focus:outline-none transition-all font-mono";
const selectCls =
  "w-full bg-zinc-900/60 text-zinc-100 border border-zinc-800 rounded-lg px-2 py-1 text-xs focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 focus:outline-none transition-all font-mono cursor-pointer";

const SparklineUp = () => (
  <svg className="w-16 h-6 stroke-green-500 fill-none stroke-[2] inline-block" viewBox="0 0 50 20">
    <path d="M 0 18 L 10 12 L 20 15 L 30 5 L 40 8 L 50 2" />
  </svg>
);

const SparklineDown = () => (
  <svg className="w-16 h-6 stroke-red-500 fill-none stroke-[2] inline-block" viewBox="0 0 50 20">
    <path d="M 0 2 L 10 8 L 20 5 L 30 15 L 40 12 L 50 18" />
  </svg>
);

const SparklineFlat = () => (
  <svg className="w-16 h-6 stroke-slate-550 fill-none stroke-[2] inline-block" viewBox="0 0 50 20">
    <path d="M 0 10 L 10 12 L 20 8 L 30 11 L 40 9 L 50 10" />
  </svg>
);

function TableHP({ rows, editable, onChange }) {
  return (
    <table className="w-full text-left border-collapse">
      <thead className={theadCls}>
        <tr>
          <th className="px-4 py-3.5 text-left w-1/3">Keyword</th>
          <th className="px-4 py-3.5 text-right">Search Volume</th>
          <th className="px-4 py-3.5 text-right font-mono">CPC (USD)</th>
          <th className="px-4 py-3.5 text-center">Difficulty (%)</th>
          <th className="px-4 py-3.5 text-center">Trend (6 mo)</th>
          <th className="px-4 py-3.5 text-center">Intent</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b last:border-0 border-zinc-800/40 hover:bg-zinc-900/10 transition-colors [&>td]:px-4 [&>td]:py-3 text-zinc-300 font-mono text-xs">
            <td className="px-4 py-3 text-left font-semibold text-zinc-200">{r.keyword}</td>
            <td className="px-4 py-3 text-right">
              {editable ? (
                <input
                  type="number"
                  className={`${inputCls} w-24 text-right`}
                  value={r.volume}
                  onChange={(e) => onChange(i, "volume", e.target.value)}
                />
              ) : (
                r.volume || "—"
              )}
            </td>
            <td className="px-4 py-3 text-right">
              {editable ? (
                <input
                  type="number"
                  step="0.01"
                  className={`${inputCls} w-20 text-right`}
                  value={r.cpc}
                  onChange={(e) => onChange(i, "cpc", e.target.value)}
                />
              ) : (
                r.cpc ? `$${r.cpc}` : "—"
              )}
            </td>
            <td className="px-4 py-3 text-center">
              {editable ? (
                <input
                  type="number"
                  className={`${inputCls} w-20 text-center`}
                  value={r.difficulty}
                  onChange={(e) =>
                    onChange(i, "difficulty", e.target.value)
                  }
                />
              ) : (
                r.difficulty ? (
                  <span className={`px-2 py-0.5 rounded text-[10px] border ${r.difficulty > 65
                    ? "border-rose-500/20 bg-rose-500/5 text-rose-400"
                    : r.difficulty > 35
                      ? "border-amber-500/20 bg-amber-500/5 text-amber-400"
                      : "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
                    }`}>
                    {r.difficulty}%
                  </span>
                ) : "—"
              )}
            </td>
            <td className="px-4 py-3 text-center">
              {editable ? (
                <input
                  className={`${inputCls} w-24 text-center`}
                  placeholder="↗, ↘, ↔"
                  value={r.trend6m || ""}
                  onChange={(e) => onChange(i, "trend6m", e.target.value)}
                />
              ) : (
                r.trend6m === "↗" ? <SparklineUp /> :
                  r.trend6m === "↘" ? <SparklineDown /> :
                    r.trend6m === "↔" ? <SparklineFlat /> :
                      r.trend6m || "—"
              )}
            </td>
            <td className="px-4 py-3 text-center">
              {editable ? (
                <select
                  className={selectCls}
                  value={r.intent || ""}
                  onChange={(e) => onChange(i, "intent", e.target.value)}
                >
                  <option value="">—</option>
                  <option>Commercial</option>
                  <option>Transactional</option>
                  <option>Informational</option>
                  <option>Navigational</option>
                </select>
              ) : (
                r.intent === "Navigational" ? <span className="px-2 py-0.5 rounded text-[10px] border border-blue-500/20 bg-blue-500/5 text-blue-400 uppercase tracking-widest text-[8px]">Navigational</span> :
                  r.intent === "Informational" ? <span className="px-2 py-0.5 rounded text-[10px] border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 uppercase tracking-widest text-[8px]">Informational</span> :
                    r.intent === "Commercial" ? <span className="px-2 py-0.5 rounded text-[10px] border border-amber-500/20 bg-amber-500/5 text-amber-400 uppercase tracking-widest text-[8px]">Commercial</span> :
                      r.intent === "Transactional" ? <span className="px-2 py-0.5 rounded text-[10px] border border-violet-500/20 bg-violet-500/5 text-violet-400 uppercase tracking-widest text-[8px]">Transactional</span> :
                        r.intent || "—"
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TableLT({ rows, editable, onChange }) {
  return (
    <table className="w-full text-left border-collapse">
      <thead className={theadCls}>
        <tr>
          <th className="px-4 py-3.5 text-left w-2/5">Keyword</th>
          <th className="px-4 py-3.5 text-right">Search Volume</th>
          <th className="px-4 py-3.5 text-center">Difficulty (%)</th>
          <th className="px-4 py-3.5 text-center">CTR Potential</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b last:border-0 border-zinc-800/40 hover:bg-zinc-900/10 transition-colors [&>td]:px-4 [&>td]:py-3 text-zinc-300 font-mono text-xs">
            <td className="px-4 py-3 text-left font-semibold text-zinc-200">{r.keyword}</td>
            <td className="px-4 py-3 text-right">
              {editable ? (
                <input
                  type="number"
                  className={`${inputCls} w-28 text-right`}
                  value={r.volume}
                  onChange={(e) => onChange(i, "volume", e.target.value)}
                />
              ) : (
                r.volume || "—"
              )}
            </td>
            <td className="px-4 py-3 text-center">
              {editable ? (
                <input
                  type="number"
                  className={`${inputCls} w-24 text-center`}
                  value={r.difficulty}
                  onChange={(e) =>
                    onChange(i, "difficulty", e.target.value)
                  }
                />
              ) : (
                r.difficulty ? (
                  <span className="px-2 py-0.5 rounded text-[10px] border border-emerald-500/20 bg-emerald-500/5 text-emerald-400">
                    {r.difficulty}%
                  </span>
                ) : "—"
              )}
            </td>
            <td className={`px-4 py-3 text-center font-semibold ${r.ctrPotential === "High" ? "text-emerald-450 font-semibold" :
              r.ctrPotential === "Medium" ? "text-amber-450 font-semibold" :
                "text-zinc-450"
              }`}>
              {r.ctrPotential || "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TableOverlap({ rows, editable, onChange }) {
  const isCustomOverlap = rows.length > 0 && ('commonCompetitors' in rows[0] || 'sharedKeywords' in rows[0]);

  return (
    <table className="w-full text-left border-collapse">
      <thead className={theadCls}>
        {isCustomOverlap ? (
          <tr>
            <th className="px-4 py-3.5 text-left w-2/5">Common Competitors</th>
            <th className="px-4 py-3.5 text-right">Shared Keywords</th>
            <th className="px-4 py-3.5 text-center">Overlap Score</th>
          </tr>
        ) : (
          <tr>
            <th className="px-4 py-3.5 text-left w-2/5">Keyword</th>
            <th className="px-4 py-3.5 text-right">Rank on Your Site</th>
            <th className="px-4 py-3.5 text-right">Rank on Competitor</th>
          </tr>
        )}
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b last:border-0 border-zinc-800/40 hover:bg-zinc-900/10 transition-colors [&>td]:px-4 [&>td]:py-3 text-zinc-300 font-mono text-xs">
            {isCustomOverlap ? (
              <>
                <td className="px-4 py-3 text-left font-semibold text-zinc-200">{r.commonCompetitors}</td>
                <td className="px-4 py-3 text-right">{r.sharedKeywords}</td>
                <td className="px-4 py-3 text-center text-emerald-400 font-bold">{r.overlapScore}</td>
              </>
            ) : (
              <>
                <td className="px-4 py-3 text-left font-semibold text-zinc-200">{r.keyword}</td>
                <td className="px-4 py-3 text-right">
                  {editable ? (
                    <input
                      type="number"
                      className={`${inputCls} w-24 text-right`}
                      value={r.yours}
                      onChange={(e) => onChange(i, "yours", e.target.value)}
                    />
                  ) : (
                    r.yours || "—"
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {editable ? (
                    <input
                      type="number"
                      className={`${inputCls} w-24 text-right`}
                      value={r.competitor}
                      onChange={(e) =>
                        onChange(i, "competitor", e.target.value)
                      }
                    />
                  ) : (
                    r.competitor || "—"
                  )}
                </td>
              </>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
