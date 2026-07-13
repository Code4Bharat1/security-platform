"use client";

import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  TrendingUp,
  Globe,
  Search,
  Info,
  Loader2,
  XCircle,
  FileText,
  Download,
  Edit3,
  Lock as LockIcon,
  Unlock,
  AlertCircle,
  CheckCircle2,
  Check,
  AlertTriangle,
  Target,
  Users,
  Gauge
} from "lucide-react";
import useProtectedAction from "@/components/UseProtectedAction/UseProtectedAction";
import toast from "react-hot-toast";
import { generateKeywordPDF } from "@/components/KeywordForm/generateKeywordPDF";

const API_BASE =
  process.env.NEXT_PUBLIC_PROD_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "";
const ENDPOINT = "/keywords/generate";

export default function KeywordIntelligencePage() {
  const [url, setUrl] = useState("");
  const [competitor, setCompetitor] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [raw, setRaw] = useState([]);

  const [editable, setEditable] = useState(false);
  const [highPriority, setHighPriority] = useState([]);
  const [longTail, setLongTail] = useState([]);
  const [overlap, setOverlap] = useState([]);
  const [totalWords, setTotalWords] = useState(0);
  const [overOptimization, setOverOptimization] = useState([]);
  const [readability, setReadability] = useState(null);

  // Advanced SEO and Audit State
  const [overallSeoScore, setOverallSeoScore] = useState(0);
  const [seoAudit, setSeoAudit] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [competitorAnalysis, setCompetitorAnalysis] = useState(null);
  const [summary, setSummary] = useState(null);

  const [activeTab, setActiveTab] = useState("keywords"); // "keywords" | "competitor" | "audit"

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
      return url ? new URL(url.startsWith("http") ? url : `https://${url}`).origin : "";
    } catch {
      return "";
    }
  }, [url]);

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
          body: JSON.stringify({ url: normalized, competitor: competitor.trim() }),
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

        const highPri = data.highPriority || data.insights?.highPriority || [];
        const lTail = data.longTail || data.insights?.longTail || [];
        const over = data.overlap || data.insights?.competitorOverlap || [];
        setHighPriority(highPri);
        setLongTail(lTail);
        setOverlap(over);

        setOverallSeoScore(data.overallSeoScore || 0);
        setSeoAudit(data.seoAudit || null);
        setRecommendations(data.recommendations || []);
        setCompetitorAnalysis(data.competitorAnalysis || null);
        setSummary(data.summary || data.insights || null);
        setTotalWords(data.totalWords || 0);
        setOverOptimization(data.overOptimization || []);
        setReadability(data.readability || null);

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
    if (["volume", "cpc", "difficulty", "opportunityScore", "rank", "compRank"].includes(key)) {
      row[key] = value === "" ? "" : Number(value);
    } else {
      row[key] = value;
    }
    next[i] = row;
    setRows(next);
  }

  function exportTXT() {
    const lines = [];
    lines.push(`========================================================`);
    lines.push(`🛡️ KEYWORD INTELLIGENCE AUDIT REPORT — ${dateStr}`);
    lines.push(`========================================================`);
    if (websiteHost) lines.push(`Website Target:     ${websiteHost}`);
    if (summary?.competitor) lines.push(`Competitor Target:  ${summary.competitor}`);
    lines.push(`Overall SEO Score:  ${overallSeoScore}/100 (${summary?.overallGrade || "B"})`);
    lines.push(`Date Generated:     ${new Date().toLocaleString()}`);
    lines.push(`--------------------------------------------------------`);
    lines.push("");
    lines.push(`EXECUTIVE SUMMARY:`);
    lines.push(summary?.executiveSummary || "N/A");
    lines.push("");
    lines.push("HIGH-PRIORITY KEYWORDS:");
    highPriority.forEach((r, i) =>
      lines.push(
        `${i + 1}. ${r.keyword} | Vol: ${r.volume || "—"} | CPC: $${r.cpc || "—"} | Diff: ${r.difficulty}% | Intent: ${r.intent || "—"} (${r.intentConfidence}%) | Category: ${r.category || "—"}`
      )
    );
    lines.push("");
    lines.push("LONG-TAIL OPPORTUNITIES:");
    longTail.forEach((r, i) =>
      lines.push(
        `${i + 1}. ${r.keyword} | Vol: ${r.volume || "—"} | Diff: ${r.difficulty}% | Opportunity Score: ${r.opportunityScore || "—"}`
      )
    );
    lines.push("");
    lines.push("COMPETITOR OVERLAP & GAP ANALYSIS:");
    overlap.forEach((r, i) =>
      lines.push(
        `${i + 1}. ${r.keyword} | Yours: Rank ${r.yours || "—"} | Competitor: Rank ${r.competitor || "—"} | Status: ${r.gap || "—"}`
      )
    );
    lines.push("");
    lines.push("ON-PAGE SEO AUDIT RESULTS:");
    if (seoAudit) {
      lines.push(`- Title Status:        ${seoAudit.titleStatus} (${seoAudit.titleLength} chars)`);
      lines.push(`- Meta Description:    ${seoAudit.metaDescStatus} (${seoAudit.metaDescLength} chars)`);
      lines.push(`- H1 Tags Count:       ${seoAudit.h1Count} (${seoAudit.h1Status})`);
      lines.push(`- Keyword Density:     ${seoAudit.keywordDensityPct}% (${seoAudit.keywordDensityStatus})`);
      lines.push(`- Mobile Friendly:     ${seoAudit.mobileFriendly ? "Yes" : "No"}`);
      lines.push(`- Open Graph Tags:     ${seoAudit.hasOgTags ? "Present" : "Missing"}`);
      lines.push(`- Canonical Tag:       ${seoAudit.hasCanonical ? "Present" : "Missing"}`);
    }
    lines.push("");
    lines.push("RECOMMENDED ACTION PLAN:");
    recommendations.forEach((r, i) => {
      lines.push(`${i + 1}. [${r.type} Priority] ${r.title} (${r.action})`);
      lines.push(`   Description: ${r.description}`);
    });

    const blob = new Blob([lines.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "keyword-intel-report.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function exportPDF() {
    await generateKeywordPDF({
      url,
      totalWords,
      overOptimization,
      readability,
      highPriority,
      longTail,
      overlap
    }, url);
  }

  const hasData = highPriority.length + longTail.length > 0;

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
        .tool-detail-page table {
          display: table !important;
          width: 100% !important;
        }
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
              KEYWORD <span className="text-emerald-400">INTELLIGENCE</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Extract SEO search terms, check CPC rates, difficulty scores, evaluate competitor gaps, and audit on-page metadata.
            </p>
          </div>
        </div>

        {/* Top Input & Intent Indicators Grid */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px] items-stretch mb-8">
          {/* Input Lookup Card */}
          <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-emerald-500/10 transition-all duration-300 flex flex-col justify-between">
            <h2 className="text-lg font-mono font-medium text-zinc-100 mb-6 flex items-center gap-2">
              <Search className="h-5 w-5 text-emerald-400" />
              Analyze Web Content
            </h2>

            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="grid gap-4 md:grid-cols-2">
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
                      onChange={(e) => setUrl(e.target.value)}
                      disabled={loading}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !loading && url.trim()) analyze();
                      }}
                      className="w-full pl-10 bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 focus:shadow-[0_0_12px_rgba(16,185,129,0.08)] focus:outline-none transition-all placeholder:text-zinc-600 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest font-mono text-zinc-400 mb-2 font-semibold">
                    Competitor URL (Optional)
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="https://competitor.com"
                      value={competitor}
                      onChange={(e) => setCompetitor(e.target.value)}
                      disabled={loading}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !loading && url.trim()) analyze();
                      }}
                      className="w-full pl-10 bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 focus:shadow-[0_0_12px_rgba(16,185,129,0.08)] focus:outline-none transition-all placeholder:text-zinc-600 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-4">
                <button
                  onClick={analyze}
                  disabled={loading || !url.trim()}
                  className="flex-1 min-w-[120px] bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/50 rounded-xl font-mono font-bold text-xs uppercase py-3.5 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] focus:outline-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Generate Report
                    </>
                  )}
                </button>

                <button
                  onClick={() => setEditable((v) => !v)}
                  disabled={!hasData || loading}
                  className="bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/50 px-4 py-3 rounded-xl transition-all duration-300 font-mono font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] focus:outline-none"
                >
                  {editable ? <LockIcon size={14} /> : <Edit3 size={14} />}
                  {editable ? "Lock Editing" : "Edit Metrics"}
                </button>

                <button
                  onClick={exportTXT}
                  disabled={!hasData || loading}
                  className="bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/50 px-4 py-3 rounded-xl transition-all duration-300 font-mono font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] focus:outline-none"
                >
                  <Download size={14} /> TXT
                </button>

                <button
                  onClick={exportPDF}
                  disabled={!hasData || loading}
                  className="bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/50 px-4 py-3 rounded-xl transition-all duration-300 font-mono font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] focus:outline-none"
                >
                  <Download size={14} /> PDF
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Intent Indicators Sidebar Card */}
          <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2 mb-4">
                <Globe className="h-4 w-4 text-emerald-400" />
                Intent Indicators
              </h4>
              <div className="space-y-2.5">
                {[
                  { intent: "Commercial", desc: "Buy, hire, agency, price terms", color: "text-amber-400" },
                  { intent: "Transactional", desc: "Best, vs, comparison, quote terms", color: "text-indigo-400" },
                  { intent: "Informational", desc: "How, what, guide, tutorial terms", color: "text-emerald-400" },
                  { intent: "Navigational", desc: "Brand or directional terms", color: "text-sky-400" },
                ].map(({ intent, desc, color }) => (
                  <div key={intent} className="flex flex-col py-1.5 border-b border-zinc-800/40 last:border-0">
                    <span className={`text-[11px] font-mono font-bold ${color}`}>{intent}</span>
                    <span className="text-[10px] text-zinc-500 font-mono mt-0.5">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="flex flex-col items-center justify-center p-10 bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.15)] animate-pulse mb-8">
            <Loader2 className="h-8 w-8 text-emerald-400 animate-spin mb-4" />
            <p className="text-emerald-400 font-mono font-bold text-xs uppercase tracking-widest text-center">
              Analyzing keyword intelligence...
            </p>
            <span className="text-[10px] text-zinc-500 font-mono mt-2 text-center">
              Executing DOM extraction pipelines, calculating difficulty vectors, and evaluating local search parameters.
            </span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="rounded-xl border border-rose-500/25 bg-rose-500/5 p-4 text-rose-400 mb-8">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider mb-1">Lookup Error</div>
                <div className="text-xs text-rose-300">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Main Dashboard results */}
        {hasData && !loading && (
          <div className="space-y-6">
            {/* Executive Score Summary Card */}
            <div className="grid gap-6 md:grid-cols-[160px_1fr] bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-md">
              <div className="flex flex-col items-center justify-center border-r border-zinc-850 md:pr-6 gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">SEO Score</span>
                <div className="relative w-24 h-24 flex items-center justify-center rounded-full border-4 border-emerald-500/10 shadow-[inset_0_0_12px_rgba(16,185,129,0.06)]">
                  <span className="text-3xl font-extrabold font-mono text-emerald-400">{overallSeoScore}</span>
                  <span className="text-[10px] font-mono text-zinc-500 absolute bottom-3">/100</span>
                </div>
                <span className="px-3 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Grade: {summary?.overallGrade || "B"}
                </span>
              </div>
              <div className="flex flex-col justify-between py-1 space-y-3">
                <div>
                  <h3 className="text-sm font-mono font-bold text-zinc-200 uppercase tracking-wide">Executive Summary</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-mono mt-2">{summary?.executiveSummary}</p>
                </div>
                <div className="flex flex-wrap gap-4 text-[10px] font-mono text-zinc-500">
                  <div>Extracted: <span className="text-zinc-300 font-semibold">{summary?.totalKeywordsExtracted || raw.length}</span></div>
                  <div>Filtered SEO: <span className="text-zinc-300 font-semibold font-bold">{summary?.filteredSEOKeywords || (highPriority.length + longTail.length)}</span></div>
                  <div> <span className="text-emerald-400 font-semibold uppercase"></span></div>
                </div>
              </div>
            </div>

            {/* Dashboard Tabs Switched View */}
            <div className="flex border-b border-zinc-800/60 pb-px gap-1">
              {[
                { id: "keywords", label: "Keyword Analytics", icon: Target },
                { id: "competitor", label: "Competitor Gap", icon: Users },
                { id: "audit", label: "On-Page SEO Audit", icon: Gauge }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider border border-transparent rounded-t-xl transition-all cursor-pointer ${activeTab === tab.id
                      ? "bg-zinc-950/40 text-emerald-400 border-zinc-800/80 border-b-transparent"
                      : "text-zinc-500 hover:text-zinc-300"
                      }`}
                  >
                    <Icon size={13} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab content 1: Keywords */}
            {activeTab === "keywords" && (
              <div className="space-y-6">
                <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-md">
                  <TableHP
                    rows={highPriority}
                    editable={editable}
                    onChange={(i, key, val) =>
                      onChangeCell(highPriority, setHighPriority, i, key, val)
                    }
                  />
                </div>

                <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-md">
                  <TableLT
                    rows={longTail}
                    editable={editable}
                    onChange={(i, key, val) =>
                      onChangeCell(longTail, setLongTail, i, key, val)
                    }
                  />
                </div>
              </div>
            )}

            {/* Tab content 2: Competitor Overlap */}
            {activeTab === "competitor" && (
              <div className="space-y-6">
                {competitorAnalysis && (
                  <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    {[
                      { label: "Overlap Score", val: `${competitorAnalysis.overlapPct}%`, color: "text-indigo-400" },
                      { label: "Shared Keywords", val: competitorAnalysis.sharedKeywords, color: "text-emerald-400" },
                      { label: "Missing Keywords", val: competitorAnalysis.missingKeywords, color: "text-amber-400" },
                      { label: "Competitor Visibility", val: `${competitorAnalysis.visibilityComp}%`, color: "text-sky-400" }
                    ].map((stat, i) => (
                      <div key={i} className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/30 font-mono flex flex-col justify-between gap-1">
                        <span className="text-[9px] uppercase tracking-wider text-zinc-500">{stat.label}</span>
                        <span className={`text-xl font-bold ${stat.color}`}>{stat.val}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-md">
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
            )}

            {/* Tab content 3: SEO Audit & Action plan */}
            {activeTab === "audit" && (
              <div className="space-y-6">
                {/* Checklist Grid */}
                <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-md">
                  <h3 className="text-sm font-mono font-bold text-zinc-200 uppercase tracking-wider mb-4">On-Page SEO Checklist Audit</h3>
                  <div className="grid gap-4 md:grid-cols-2 font-mono text-xs text-zinc-400">
                    {seoAudit && (
                      <>
                        <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-800 bg-zinc-950/20">
                          <span>Title Tag Status ({seoAudit.titleLength} chars)</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${seoAudit.titleStatus === "Optimal" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>
                            {seoAudit.titleStatus}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-800 bg-zinc-950/20">
                          <span>Meta Description Status ({seoAudit.metaDescLength} chars)</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${seoAudit.metaDescStatus === "Optimal" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>
                            {seoAudit.metaDescStatus}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-800 bg-zinc-950/20">
                          <span>H1 Tags Count ({seoAudit.h1Count} present)</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${seoAudit.h1Status === "Optimal" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}>
                            {seoAudit.h1Status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-800 bg-zinc-950/20">
                          <span>Keyword Density ({seoAudit.keywordDensityPct}%)</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${seoAudit.keywordDensityStatus === "Optimal" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>
                            {seoAudit.keywordDensityStatus}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-800 bg-zinc-950/20">
                          <span>Mobile Friendliness (Viewport)</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${seoAudit.mobileFriendly ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}>
                            {seoAudit.mobileFriendly ? "Responsive" : "Unfriendly"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-800 bg-zinc-950/20">
                          <span>Structured Schema Markup</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${seoAudit.hasStructuredData ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-zinc-800 text-zinc-500"}`}>
                            {seoAudit.hasStructuredData ? "Detected" : "None"}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Recommendations list */}
                <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_12px_40px_rgb(0,0,0,0.2)] space-y-4 hover:border-emerald-500/10 transition-all duration-300">
                  <h3 className="text-sm font-mono font-bold text-zinc-200 uppercase tracking-wider">
                    Actionable Recommendations Plan
                  </h3>
                  <div className="space-y-3">
                    {recommendations.map((rec, i) => (
                      <div key={i} className="flex gap-3 bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-3.5">
                        {rec.type === "High" ? (
                          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="font-mono">
                          <div className="text-xs font-bold text-zinc-200 flex items-center gap-2">
                            <span className={`text-[10px] px-2 py-px rounded font-semibold ${rec.type === "High" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : rec.type === "Medium" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-zinc-800 text-zinc-400"}`}>
                              {rec.type} Priority
                            </span>
                            {rec.title} ({rec.action})
                          </div>
                          <div className="text-[11px] text-zinc-400 leading-relaxed mt-1">{rec.description}</div>
                        </div>
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

/* ---------- Shared dark table styles ---------- */

const theadCls =
  "bg-zinc-900/50 text-zinc-300 [&>tr>th]:px-3 [&>tr>th]:py-2.5 [&>tr>th]:font-mono [&>tr>th]:font-semibold [&>tr>th]:text-xs [&>tr>th]:text-left border-b border-zinc-800/50";
const rowCls =
  "border-t border-zinc-800/40 hover:bg-zinc-900/10 transition-colors [&>td]:px-3 [&>td]:py-2.5 [&>td]:text-xs [&>td]:font-mono";
const inputCls =
  "w-24 border border-zinc-800 bg-zinc-950/40 text-zinc-100 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30";
const inputSmCls =
  "w-20 border border-zinc-800 bg-zinc-950/40 text-zinc-100 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30";
const selectCls =
  "border border-zinc-800 bg-zinc-950/40 text-zinc-100 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30";

const SparklineUp = () => (
  <svg className="w-16 h-6 stroke-emerald-500 fill-none stroke-[2] inline-block" viewBox="0 0 50 20">
    <path d="M 0 18 L 10 12 L 20 15 L 30 5 L 40 8 L 50 2" />
  </svg>
);

const SparklineDown = () => (
  <svg className="w-16 h-6 stroke-rose-500 fill-none stroke-[2] inline-block" viewBox="0 0 50 20">
    <path d="M 0 2 L 10 8 L 20 5 L 30 15 L 40 12 L 50 18" />
  </svg>
);

const SparklineFlat = () => (
  <svg className="w-16 h-6 stroke-zinc-500 fill-none stroke-[2] inline-block" viewBox="0 0 50 20">
    <path d="M 0 10 L 10 12 L 20 8 L 30 11 L 40 9 L 50 10" />
  </svg>
);

function TableHP({ rows, editable, onChange }) {
  return (
    <div>
      <h2 className="text-sm font-mono font-semibold text-zinc-200 mb-3 flex items-center gap-1.5">
        High-Priority Keywords
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm rounded-xl overflow-hidden border border-zinc-800/60">
          <thead className={theadCls}>
            <tr>
              <th>Keyword</th>
              <th>Volume (Est.)</th>
              <th>CPC (USD)</th>
              <th>Difficulty</th>
              <th>Trend</th>
              <th>Intent (Conf %)</th>
              <th>Opportunity</th>
            </tr>
          </thead>
          <tbody className="text-zinc-300">
            {rows.map((r, i) => (
              <tr key={i} className={rowCls}>
                <td className="font-medium text-zinc-200">{r.keyword}</td>
                <td>
                  {editable ? (
                    <input
                      type="number"
                      className={inputCls}
                      value={r.volume}
                      onChange={(e) => onChange(i, "volume", e.target.value)}
                    />
                  ) : (
                    r.volume || "—"
                  )}
                </td>
                <td>
                  {editable ? (
                    <input
                      type="number"
                      step="0.01"
                      className={inputSmCls}
                      value={r.cpc}
                      onChange={(e) => onChange(i, "cpc", e.target.value)}
                    />
                  ) : (
                    r.cpc ? `$${r.cpc}` : "—"
                  )}
                </td>
                <td>
                  {editable ? (
                    <input
                      type="number"
                      className={inputSmCls}
                      value={r.difficulty}
                      onChange={(e) =>
                        onChange(i, "difficulty", e.target.value)
                      }
                    />
                  ) : (
                    r.difficulty ? `${r.difficulty}%` : "—"
                  )}
                </td>
                <td>
                  {editable ? (
                    <input
                      className={inputCls}
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
                <td>
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
                    <div className="flex flex-col">
                      {r.intent === "Navigational" ? <span className="px-2 py-0.5 rounded bg-sky-950/20 text-sky-400 font-semibold text-[10px] border border-sky-500/20 max-w-[100px] text-center">Navigational</span> :
                        r.intent === "Informational" ? <span className="px-2 py-0.5 rounded bg-emerald-950/20 text-emerald-400 font-semibold text-[10px] border border-emerald-500/20 max-w-[100px] text-center">Informational</span> :
                          r.intent === "Commercial" ? <span className="px-2 py-0.5 rounded bg-amber-950/20 text-amber-400 font-semibold text-[10px] border border-amber-500/20 max-w-[100px] text-center">Commercial</span> :
                            r.intent === "Transactional" ? <span className="px-2 py-0.5 rounded bg-indigo-950/20 text-indigo-400 font-semibold text-[10px] border border-indigo-500/20 max-w-[100px] text-center">Transactional</span> :
                              <span>{r.intent || "—"}</span>
                      }
                      <span className="text-[9px] text-zinc-550 mt-0.5">Conf: {r.intentConfidence}%</span>
                    </div>
                  )}
                </td>
                <td>
                  {editable ? (
                    <input
                      type="number"
                      className={inputSmCls}
                      value={r.opportunityScore}
                      onChange={(e) => onChange(i, "opportunityScore", e.target.value)}
                    />
                  ) : (
                    <span className="font-semibold text-emerald-400">{r.opportunityScore || "—"}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TableLT({ rows, editable, onChange }) {
  return (
    <div>
      <h2 className="text-sm font-mono font-semibold text-zinc-200 mb-3 flex items-center gap-1.5">
        Long-Tail Opportunities
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm rounded-xl overflow-hidden border border-zinc-800/60">
          <thead className={theadCls}>
            <tr>
              <th>Keyword</th>
              <th>Volume (Est.)</th>
              <th>Difficulty</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Opportunity</th>
            </tr>
          </thead>
          <tbody className="text-zinc-300">
            {rows.map((r, i) => (
              <tr key={i} className={rowCls}>
                <td className="font-medium text-zinc-200">{r.keyword}</td>
                <td>
                  {editable ? (
                    <input
                      type="number"
                      className={inputCls}
                      value={r.volume}
                      onChange={(e) => onChange(i, "volume", e.target.value)}
                    />
                  ) : (
                    r.volume || "—"
                  )}
                </td>
                <td>
                  {editable ? (
                    <input
                      type="number"
                      className={inputSmCls}
                      value={r.difficulty}
                      onChange={(e) =>
                        onChange(i, "difficulty", e.target.value)
                      }
                    />
                  ) : (
                    r.difficulty ? `${r.difficulty}%` : "—"
                  )}
                </td>
                <td>{r.category || "Long-tail"}</td>
                <td className={
                  r.priority === "High" ? "text-emerald-400 font-semibold" :
                    r.priority === "Medium" ? "text-amber-400 font-semibold" :
                      "text-zinc-550"
                }>
                  {r.priority || "—"}
                </td>
                <td>
                  <span className="font-semibold text-emerald-400">{r.opportunityScore || "—"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TableOverlap({ rows, editable, onChange }) {
  return (
    <div>
      <h2 className="text-sm font-mono font-semibold text-zinc-200 mb-3 flex items-center gap-1.5">
        Competitor Overlap & Gap Analysis
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm rounded-xl overflow-hidden border border-zinc-800/60">
          <thead className={theadCls}>
            <tr>
              <th>Keyword</th>
              <th>Your Rank</th>
              <th>Competitor Rank</th>
              <th>Gap Status</th>
            </tr>
          </thead>
          <tbody className="text-zinc-300">
            {rows.map((r, i) => (
              <tr key={i} className={rowCls}>
                <td className="font-medium text-zinc-200">{r.keyword}</td>
                <td>
                  {editable ? (
                    <input
                      type="number"
                      className={inputCls}
                      value={r.yours}
                      onChange={(e) => onChange(i, "yours", e.target.value)}
                    />
                  ) : (
                    r.yours || "—"
                  )}
                </td>
                <td>
                  {editable ? (
                    <input
                      type="number"
                      className={inputCls}
                      value={r.competitor}
                      onChange={(e) =>
                        onChange(i, "competitor", e.target.value)
                      }
                    />
                  ) : (
                    r.competitor || "—"
                  )}
                </td>
                <td>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.gap === "Opportunity" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                    r.gap === "Gap" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                      "bg-zinc-800 text-zinc-400 border border-zinc-700/50"
                    }`}>
                    {r.gap || "Shared"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
