"use client";

import { useMemo, useRef, useState } from "react";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";
import { generateBrokenLinkPDF } from "./generateBrokenLinkPDF";
import { toast } from "react-hot-toast";
import {
  Link2Off,
  Globe,
  Search,
  Loader2,
  ShieldAlert,
  Info,
  Terminal,
  Activity,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Copy,
  ExternalLink,
  Layers,
  HelpCircle
} from "lucide-react";

export default function BrokenStreamPage() {
  const [url, setUrl] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [summary, setSummary] = useState(null);
  const eventSourceRef = useRef(null);

  const protectedAction = useProtectedAction();

  const apiBase = useMemo(
    () => (process.env.NEXT_PUBLIC_PROD_API_URL || "").replace(/\/+$/, ""),
    []
  );

  async function copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      toast.success("Copied to clipboard!");
    } catch (err) {
      toast.error("Copy failed. You can copy manually.");
    }
  }

  const startCheck = async () => {
    if (!url) return;

    await protectedAction(async (token) => {
      setLoading(true);
      setItems([]);
      setSummary(null);
      setProgress({ done: 0, total: 0 });

      if (eventSourceRef.current) eventSourceRef.current.close();

      try {
        const streamUrl = `${apiBase}/brokenlink/brokenlink-stream?url=${encodeURIComponent(
          url
        )}&token=${encodeURIComponent(token)}`;

        const es = new EventSource(streamUrl);
        eventSourceRef.current = es;

        es.onmessage = (event) => {
          const data = JSON.parse(event.data || "{}");

          if (data.type === "total") {
            setProgress((prev) => ({ ...prev, total: data.total || 0 }));
          } else if (data.type === "link") {
            setItems((prev) => {
              const k = `${data.url}::${data.sourcePath}`;
              if (prev.some((r) => `${r.url}::${r.sourcePath}` === k))
                return prev;
              return [...prev, data];
            });
            setProgress((prev) => ({ ...prev, done: prev.done + 1 }));
          } else if (data.type === "summary") {
            setSummary(data.payload);
          } else if (data.type === "done") {
            setLoading(false);
            es.close();
          } else if (data.type === "error") {
            toast.error(data.message || "Error occurred");
            setLoading(false);
            es.close();
          }
        };

        es.onerror = () => {
          toast.error("Connection error.");
          setLoading(false);
          es.close();
        };
      } catch (err) {
        console.error("Stream error:", err);
        toast.error("Something went wrong while streaming.");
        setLoading(false);
      }
    });
  };

  function computedSeverity(item) {
    if (item.finalUrl && item.finalUrl !== item.url) return "redirect";
    if (Number(item.status) >= 400) return "critical";
    return "ok";
  }

  function severityBadge(sev) {
    const base = "px-2.5 py-0.5 rounded-lg text-[10px] font-bold font-mono border uppercase tracking-wider";
    if (sev === "critical")
      return `${base} border-red-500/40 bg-red-500/5 text-red-400`;
    if (sev === "redirect")
      return `${base} border-orange-500/40 bg-orange-500/5 text-orange-400`;
    return `${base} border-zinc-800/80 bg-zinc-900/40 text-zinc-400`;
  }

  function statusTint(sev) {
    if (sev === "critical") return "border-red-500/20 bg-red-955/10 text-zinc-200";
    if (sev === "redirect") return "border-orange-500/20 bg-orange-955/10 text-zinc-200";
    return "border-zinc-800/80 bg-zinc-900/20 text-zinc-300";
  }

  function csvEscape(v) {
    const s = `${v ?? ""}`;
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }

  function downloadBlob(content, name, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadCSV() {
    const headers = [
      "Anchor",
      "URL",
      "Final URL",
      "Status",
      "Status Text",
      "Severity",
      "Internal/External",
      "Location",
      "Redirect Hops",
      "Priority",
      "Found On (path)",
      "Suggestion",
    ];
    const rows = items.map((i) => [
      i.anchorText,
      i.url,
      i.finalUrl || "",
      i.status,
      i.statusText,
      i.severity,
      i.scope,
      i.location,
      i.redirectHops,
      i.priorityScore,
      i.sourcePath || "",
      i.suggestion || "",
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map(csvEscape).join(","))
      .join("\n");
    downloadBlob(csv, "broken-links.csv", "text/csv;charset=utf-8");
  }

  function downloadTXT() {
    const lines = [];
    items.forEach((i) => {
      lines.push(
        `${(i.severity || "").toUpperCase()} | ${i.status} ${i.statusText} | ${
          i.scope
        }`
      );
      lines.push(`Anchor: ${i.anchorText || "-"}`);
      lines.push(`URL: ${i.url}`);
      if (i.finalUrl && i.finalUrl !== i.url)
        lines.push(`Final: ${i.finalUrl} (hops: ${i.redirectHops})`);
      lines.push(`Location: ${i.location} | Found on: ${i.sourcePath || "-"}`);
      if (i.suggestion) lines.push(`Suggestion: ${i.suggestion}`);
      lines.push("---");
    });
    downloadBlob(
      lines.join("\n"),
      "broken-links.txt",
      "text/plain;charset=utf-8"
    );
  }

  async function downloadPDF() {
    generateBrokenLinkPDF(items, summary, url);
  }

  return (
    <div 
      className="tool-detail-page min-h-screen"
      style={{
        '--hero-ambient-a': 'rgba(239, 68, 68, 0.08)',
        '--hero-ambient-b': 'rgba(249, 115, 22, 0.03)',
        '--glow-primary': '0 0 34px rgba(239, 68, 68, 0.16)',
        '--gold': '#ef4444',
        '--gold-strong': '#f87171',
        '--gold-dark': '#b91c1c',
        '--ring': 'rgba(239, 68, 68, 0.34)',
        '--surface-glow': 'rgba(239, 68, 68, 0.14)',
      }}
    >
      <style>{`
        .tool-detail-page .tool-detail-shell {
          padding-top: 3.5rem !important;
        }
        .tool-detail-page ::-webkit-scrollbar-thumb {
          background: rgba(239, 68, 68, 0.35) !important;
        }
        .tool-detail-page ::-webkit-scrollbar-thumb:hover {
          background: rgba(239, 68, 68, 0.55) !important;
        }
        .tool-detail-page ::selection {
          background: rgba(239, 68, 68, 0.22) !important;
          color: #fef2f2 !important;
        }
        .tool-detail-page :is(button, [role="button"]):is([class*="bg-red-"], [class*="bg-rose-"]) {
          color: #000000 !important;
        }
        .tool-detail-page :is(button, [role="button"]):is([class*="bg-red-"], [class*="bg-rose-"]) * {
          color: #000000 !important;
        }
      `}</style>

      <div className="tool-detail-shell">
        {/* Navigation & Header */}
        <div className="flex justify-end mb-8">
          <span className="rounded-full border border-red-500/30 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-red-400">
            Red Team
          </span>
        </div>

        {/* Title Block */}
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl border border-red-500/30 overflow-hidden shadow-lg flex-shrink-0 flex items-center justify-center">
            <Link2Off className="h-8 w-8 text-red-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              BROKEN LINK <span className="text-red-400">CHECKER</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Audit external and internal hyperlinks in real-time. Trace redirect pathways, identify dead endpoints, and optimize reference layouts.
            </p>
          </div>
        </div>

        {/* 2-Column Split Layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* Input Form Card */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-red-500/10 transition-all duration-300 space-y-4">
              <h2 className="text-lg font-mono font-medium text-zinc-100 mb-2 flex items-center gap-2">
                <Globe className="h-5 w-5 text-red-400" />
                Link Assessment Scope
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                    Website URL
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-650" />
                    <input
                      type="text"
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      disabled={loading}
                      className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 pl-12 text-sm focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 focus:shadow-[0_0_12px_rgba(239,68,68,0.08)] focus:outline-none transition-all placeholder:text-zinc-600 font-mono"
                    />
                  </div>
                </div>

                <button
                  onClick={startCheck}
                  disabled={loading || !url}
                  className="w-full bg-red-500 hover:bg-red-600 text-black rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] focus:outline-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      Checking Streaming Redirects...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 text-black" />
                      Check Links
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Progress Metrics */}
            {progress.total > 0 && (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] font-mono text-xs space-y-3">
                <div className="flex justify-between items-center text-zinc-300">
                  <span>Stream Validation Progress</span>
                  <span className="text-red-400 font-bold">{progress.done} / {progress.total} links resolved</span>
                </div>
                <div className="w-full bg-zinc-900 border border-zinc-850 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-red-500 h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        100,
                        (progress.done / progress.total) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Scan Summary */}
            {summary && (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] space-y-4">
                <h3 className="text-sm font-mono font-bold text-zinc-200 flex items-center gap-2 border-b border-zinc-850 pb-2.5">
                  <Terminal className="w-4 h-4 text-red-400" />
                  Audit Summary Metrics
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                  <div className="bg-zinc-900/40 border border-zinc-800/80 p-3 rounded-xl">
                    <span className="text-[10px] text-zinc-550 block mb-0.5">Total Links</span>
                    <span className="text-zinc-200 font-bold text-sm">{summary.total}</span>
                  </div>
                  <div className="bg-zinc-900/40 border border-zinc-800/80 p-3 rounded-xl">
                    <span className="text-[10px] text-zinc-550 block mb-0.5">Working</span>
                    <span className="text-red-400 font-bold text-sm">{summary.working}</span>
                  </div>
                  <div className="bg-zinc-900/40 border border-zinc-800/80 p-3 rounded-xl">
                    <span className="text-[10px] text-zinc-550 block mb-0.5">Broken</span>
                    <span className="text-red-400 font-bold text-sm">{summary.broken}</span>
                  </div>
                  <div className="bg-zinc-900/40 border border-zinc-800/80 p-3 rounded-xl">
                    <span className="text-[10px] text-zinc-550 block mb-0.5">Redirects</span>
                    <span className="text-orange-400 font-bold text-sm">{summary.redirects}</span>
                  </div>
                </div>

                {summary.diff && (
                  <div className="text-[11px] font-mono text-zinc-400 bg-zinc-900/20 p-3 rounded-xl border border-zinc-850">
                    Change compared to last scan: Broken{" "}
                    <span className="text-red-400 font-bold">
                      {summary.diff.broken >= 0 ? "+" : ""}
                      {summary.diff.broken}
                    </span>{" "}
                    · Fixed <span className="text-red-400 font-bold">{summary.diff.fixed}</span>
                  </div>
                )}
              </div>
            )}

            {/* Export Buttons */}
            {items.length > 0 && (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={downloadCSV}
                  className="px-4 py-2.5 bg-zinc-900/40 hover:bg-red-500/5 text-zinc-350 hover:text-red-400 border border-zinc-800/80 hover:border-red-500/30 rounded-xl font-mono font-bold text-xs uppercase transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  CSV Export
                </button>
                <button
                  onClick={downloadTXT}
                  className="px-4 py-2.5 bg-zinc-900/40 hover:bg-red-500/5 text-zinc-350 hover:text-red-400 border border-zinc-800/80 hover:border-red-500/30 rounded-xl font-mono font-bold text-xs uppercase transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  TXT Export
                </button>
                <button
                  onClick={downloadPDF}
                  className="px-4 py-2.5 bg-zinc-900/40 hover:bg-red-500/5 text-zinc-350 hover:text-red-400 border border-zinc-800/80 hover:border-red-500/30 rounded-xl font-mono font-bold text-xs uppercase transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  PDF Report
                </button>
              </div>
            )}

            {/* Findings List */}
            {items.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {items.map((i, idx) => {
                  const sev = computedSeverity(i);
                  return (
                    <div
                      key={`${i.url}-${idx}`}
                      className={`p-4 rounded-xl border font-mono text-xs flex flex-col justify-between ${statusTint(sev)}`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={severityBadge(sev)}>{sev}</span>
                          <span className="font-bold text-zinc-250">
                            [{i.status} {i.statusText}]
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900/80 border border-zinc-800/60 text-zinc-400">
                            {i.scope}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900/80 border border-zinc-800/60 text-zinc-400">
                            {i.location}
                          </span>
                        </div>
                        
                        <div className="text-zinc-400 space-y-1 mt-1 leading-relaxed">
                          <div>
                            <span className="text-zinc-550">Anchor:</span> {i.anchorText || "-"}
                          </div>
                          <div className="overflow-hidden">
                            <span className="text-zinc-550 block">Target Link</span>
                            <a
                              href={i.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline break-all text-red-400 hover:text-red-300 block font-semibold"
                            >
                              {i.url}
                            </a>
                          </div>
                          {i.finalUrl && i.finalUrl !== i.url && (
                            <div>
                              <span className="text-zinc-550 block">Redirected Link ({i.redirectHops} hops)</span>
                              <a
                                className="underline break-all block text-zinc-350"
                                href={i.finalUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {i.finalUrl}
                              </a>
                            </div>
                          )}
                          <div className="text-[10px] text-zinc-550 border-t border-zinc-900 pt-1.5 mt-1.5">
                            Source: {i.sourcePath || "-"} | Priority: {i.priorityScore}
                          </div>
                        </div>
                      </div>

                      {i.suggestion && (
                        <div className="mt-3 bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-900 flex justify-between items-center gap-2">
                          <div className="text-zinc-450 leading-normal">
                            <span className="text-[10px] text-zinc-600 block uppercase font-bold tracking-wider">Fix Suggestion</span>
                            {i.suggestion}
                          </div>
                          <button
                            onClick={() => copyToClipboard(i.finalUrl || i.url)}
                            className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-900 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                            title="Copy link to clipboard"
                          >
                            <Copy size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Guidance sidebar card */}
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Info className="text-red-400 w-4 h-4" />
                Scanner Guidance
              </h2>
              <ul className="space-y-3.5 list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Audits target domain link maps in real-time using asynchronous workers.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Identifies redirect loops, dead pointers, and security header parameters.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Calculates link priority score to prioritize critical remediation tasks.
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
