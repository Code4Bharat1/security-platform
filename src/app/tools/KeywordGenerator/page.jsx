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
} from "lucide-react";
import useProtectedAction from "@/components/UseProtectedAction/UseProtectedAction";

const API_BASE =
  process.env.NEXT_PUBLIC_PROD_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "";
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

    // Header Banner
    doc.setFillColor(18, 18, 18);
    doc.rect(0, 0, doc.internal.pageSize.width, 40, "F");
    doc.setTextColor(16, 185, 129);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(18);
    doc.text("NEXCORE SECURITY PLATFORM", 15, 20);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text("KEYWORD INTELLIGENCE INSIGHT REPORT", 15, 30);

    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.5);
    doc.line(15, 48, doc.internal.pageSize.width - 15, 48);

    doc.setTextColor(80, 80, 80);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Keyword Intelligence Report — ${dateStr}`, marginX, 68);
    if (websiteHost) doc.text(`Website: ${websiteHost}`, marginX, 82);
    doc.text(`Total Keywords Extracted: ${raw.length}`, marginX, 96);
    doc.text(
      `Filtered SEO Keywords: ${highPriority.length + longTail.length}`,
      marginX,
      110
    );

    autoTable(doc, {
      startY: 130,
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
      styles: { fontSize: 8 },
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
      margin: { left: marginX, right: marginX },
      theme: "grid",
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [["Keyword", "Search Volume", "Difficulty (%)", "CTR Potential"]],
      body: longTail.map((r) => [
        r.keyword,
        r.volume || "—",
        r.difficulty || "—",
        r.ctrPotential || "—",
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
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
      startY: doc.lastAutoTable.finalY + 20,
      head: [overlapHeaders],
      body: overlapBody,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
      margin: { left: marginX, right: marginX },
      theme: "grid",
    });

    doc.save("keyword-intel-report.pdf");
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
              Extract SEO search terms, gauge search volumes, CPC rates, domain overlaps, and map user transaction intent indicators.
            </p>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Input Lookup Card */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-emerald-500/10 transition-all duration-300">
              <h2 className="text-lg font-mono font-medium text-zinc-100 mb-6 flex items-center gap-2">
                <Search className="h-5 w-5 text-emerald-400" />
                Analyze Web Content
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
                      onChange={(e) => setUrl(e.target.value)}
                      disabled={loading}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !loading && url.trim()) analyze();
                      }}
                      className="w-full pl-10 bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 focus:shadow-[0_0_12px_rgba(16,185,129,0.08)] focus:outline-none transition-all placeholder:text-zinc-600 font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-1">
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

            {/* Loading Indicator */}
            {loading && (
              <div className="flex flex-col items-center justify-center p-10 bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.15)] animate-pulse">
                <Loader2 className="h-8 w-8 text-emerald-400 animate-spin mb-4" />
                <p className="text-emerald-400 font-mono font-bold text-xs uppercase tracking-widest text-center">
                  Analyzing keyword intelligence...
                </p>
                <span className="text-[10px] text-zinc-500 font-mono mt-2 text-center">
                  Crawl results parsing, sorting volume indices, and matching search difficulties
                </span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="rounded-xl border border-rose-500/25 bg-rose-500/5 p-4 text-rose-400">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider mb-1">Lookup Error</div>
                    <div className="text-xs text-rose-300">{error}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Tables and Dashboard results */}
            {hasData && !loading && (
              <div className="space-y-6">
                {/* Meta details banner */}
                <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-4 flex flex-wrap gap-4 text-xs font-mono text-zinc-400">
                  <div>
                    Website: <span className="text-zinc-100 font-semibold">{websiteHost || "—"}</span>
                  </div>
                  <div>
                    Total Keywords: <span className="text-zinc-100 font-semibold">{raw.length}</span>
                  </div>
                  <div>
                    Filtered SEO: <span className="text-zinc-100 font-semibold">{highPriority.length + longTail.length}</span>
                  </div>
                </div>

                {/* Table HP */}
                <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-md">
                  <TableHP
                    rows={highPriority}
                    editable={editable}
                    onChange={(i, key, val) =>
                      onChangeCell(highPriority, setHighPriority, i, key, val)
                    }
                  />
                </div>

                {/* Table LT */}
                <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-md">
                  <TableLT
                    rows={longTail}
                    editable={editable}
                    onChange={(i, key, val) =>
                      onChangeCell(longTail, setLongTail, i, key, val)
                    }
                  />
                </div>

                {/* Table Overlap */}
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

                {/* Actionable recommendations card */}
                <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_12px_40px_rgb(0,0,0,0.2)] space-y-4 hover:border-emerald-500/10 transition-all duration-300">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                    Suggested Actions
                  </h3>
                  <div className="space-y-3">
                    {[
                      "Remove low-value keywords (menus, UI labels, boilerplate noise).",
                      "Create high-quality content around high-volume, lower-difficulty keywords.",
                      "Optimize title/meta tags for top commercial-intent search terms.",
                      "Build backlink index profiles targeting long-tail opportunity URLs.",
                    ].map((text, i) => (
                      <div key={i} className="flex items-start gap-3 bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-3.5">
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span className="text-xs font-mono text-zinc-300 leading-relaxed">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Specs & Guidance Sidebar */}
          <div className="space-y-6">
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Info className="h-4 w-4 text-emerald-400" />
                Intelligence Parameters
              </h4>
              <ul className="space-y-3.5 list-none pl-0">
                {[
                  "Identifies high-priority commercial terms with key intent labels.",
                  "Filters long-tail opportunities for specific semantic queries.",
                  "Calculates competitor overlap statistics and rank variations.",
                  "Allows inline metadata adjustment to mock index metrics.",
                  "Supports text and PDF reports for audit archiving.",
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
        🔥 High-Priority Keywords
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm rounded-xl overflow-hidden border border-zinc-800/60">
          <thead className={theadCls}>
            <tr>
              <th>Keyword</th>
              <th>Search Volume</th>
              <th>CPC (USD)</th>
              <th>Difficulty (%)</th>
              <th>Trend (6 mo)</th>
              <th>Intent</th>
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
                    r.cpc || "—"
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
                    r.difficulty || "—"
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
                    r.intent === "Navigational" ? <span className="px-2.5 py-0.5 rounded-full bg-sky-950/20 text-sky-400 font-semibold text-[10px] border border-sky-500/20 shadow-sm">Navigational</span> :
                      r.intent === "Informational" ? <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/20 text-emerald-400 font-semibold text-[10px] border border-emerald-500/20 shadow-sm">Informational</span> :
                        r.intent === "Commercial" ? <span className="px-2.5 py-0.5 rounded-full bg-amber-950/20 text-amber-400 font-semibold text-[10px] border border-amber-500/20 shadow-sm">Commercial</span> :
                          r.intent === "Transactional" ? <span className="px-2.5 py-0.5 rounded-full bg-indigo-950/20 text-indigo-400 font-semibold text-[10px] border border-indigo-500/20 shadow-sm">Transactional</span> :
                            r.intent || "—"
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
        💡 Long-Tail Opportunities
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm rounded-xl overflow-hidden border border-zinc-800/60">
          <thead className={theadCls}>
            <tr>
              <th>Keyword</th>
              <th>Search Volume</th>
              <th>Difficulty (%)</th>
              <th>CTR Potential</th>
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
                    r.difficulty || "—"
                  )}
                </td>
                <td className={
                  r.ctrPotential === "High" ? "text-emerald-400 font-semibold" :
                    r.ctrPotential === "Medium" ? "text-amber-400 font-semibold" :
                      "text-zinc-500"
                }>
                  {r.ctrPotential || "—"}
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
  const isCustomOverlap = rows.length > 0 && ('commonCompetitors' in rows[0] || 'sharedKeywords' in rows[0]);

  return (
    <div>
      <h2 className="text-sm font-mono font-semibold text-zinc-200 mb-3 flex items-center gap-1.5">
        📌 Competitor Overlap
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm rounded-xl overflow-hidden border border-zinc-800/60">
          <thead className={theadCls}>
            {isCustomOverlap ? (
              <tr>
                <th>Common Competitors</th>
                <th>Shared Keywords</th>
                <th>Overlap Score</th>
              </tr>
            ) : (
              <tr>
                <th>Keyword</th>
                <th>Rank on Your Site</th>
                <th>Rank on Competitor</th>
              </tr>
            )}
          </thead>
          <tbody className="text-zinc-300">
            {rows.map((r, i) => (
              <tr key={i} className={rowCls}>
                {isCustomOverlap ? (
                  <>
                    <td className="font-medium text-zinc-300">{r.commonCompetitors}</td>
                    <td className="text-zinc-300">{r.sharedKeywords}</td>
                    <td className="text-emerald-400 font-semibold">{r.overlapScore}</td>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
