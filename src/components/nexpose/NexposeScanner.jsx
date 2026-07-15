"use client";

import { useMemo, useState } from "react";
import {
  Radar,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Clipboard,
  Shield,
  Globe,
  CheckCircle2,
  Clock,
  Server,
  FileDown,
  Download,
  Info,
  Terminal,
  Activity,
  Layers,
  Cpu,
  ShieldAlert
} from "lucide-react";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";
import { generateSQLiPDF } from "./generateSQLiPDF";

const API_BASE = process.env.NEXT_PUBLIC_PROD_API_URL;

function isValidHttpUrl(value) {
  try {
    const u = new URL(String(value).trim());
    return (u.protocol === "http:" || u.protocol === "https:") && !!u.hostname;
  } catch {
    return false;
  }
}

export default function NexposeScanner() {
  const [url, setUrl] = useState("");
  const [paramName] = useState("test");
  const [method] = useState("GET");
  const [postEncoder] = useState("form");
  const [customHeaders] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [urlError, setUrlError] = useState("");
  const [openIdx, setOpenIdx] = useState(null);
  const [showPositivesOnly, setShowPositivesOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const protectedAction = useProtectedAction();
  const urlIsValid = isValidHttpUrl(url);

  function onUrlChange(v) {
    const val = v.replace(/\s+/g, " ").trim();
    setUrl(val);
    if (!val) {
      setUrlError("");
      return;
    }
    setUrlError(
      isValidHttpUrl(val) ? "" : "Invalid URL. Use http(s)://host[/path]"
    );
  }

  async function handleScan() {
    setError("");
    setResult(null);

    if (!url.trim()) {
      setUrlError("URL is required");
      return;
    }
    if (!urlIsValid) {
      setUrlError("Invalid URL. Use http(s)://host[/path]");
      return;
    }

    await protectedAction(async (token) => {
      setScanning(true);

      let headers = {};
      if (customHeaders?.trim()) {
        try {
          headers = JSON.parse(customHeaders);
        } catch {
          setScanning(false);
          setError("Custom headers must be valid JSON.");
          return;
        }
      }

      try {
        const res = await fetch(`${API_BASE}/nexpose/sql`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...headers,
          },
          body: JSON.stringify({
            url,
            method,
            paramName,
            headers,
            postEncoder,
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.message || `HTTP ${res.status}`);
        }
        setResult(data);
      } catch (e) {
        setError(e.message || "Failed to scan.");
      } finally {
        setScanning(false);
      }
    });
  }

  function copy(text) {
    navigator.clipboard.writeText(text).catch(() => {});
  }

  function exportPDF() {
    if (!result) return;
    generateSQLiPDF(result);
  };

  function exportJSON() {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = "sqli_scan_result.json";
    a.click();
    URL.revokeObjectURL(href);
  }

  const rows = useMemo(() => {
    if (!result) return [];
    return showPositivesOnly ? result.findings || [] : result.tests || [];
  }, [result, showPositivesOnly]);

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
            <Radar className="h-8 w-8 text-red-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              SQLi <span className="text-red-400">SCANNER</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Probe dynamic backend database endpoints for SQL injection vectors. Automatically scans parameters using error, boolean-blind, and time-based payloads.
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
                <Terminal className="h-5 w-5 text-red-400" />
                SQL Injection Parameters
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                    Target Website URL
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-650" />
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => onUrlChange(e.target.value)}
                      placeholder="https://example.com/search?id=1"
                      className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 pl-12 text-sm focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 focus:shadow-[0_0_12px_rgba(239,68,68,0.08)] focus:outline-none transition-all placeholder:text-zinc-600 font-mono"
                    />
                  </div>
                  {urlError && (
                    <div className="mt-2 text-xs font-mono text-red-400">
                      {urlError}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleScan}
                  disabled={scanning || !urlIsValid}
                  className="w-full bg-red-500 hover:bg-red-600 text-black rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] focus:outline-none disabled:opacity-40"
                >
                  {scanning ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Auditing database...
                    </>
                  ) : (
                    <>
                      <Radar className="w-4 h-4 text-black" />
                      Start SQLi Scan
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-955/10 text-red-400 text-xs font-mono flex items-start gap-2">
                <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" />
                <span>Scan Error: {error}</span>
              </div>
            )}

            {/* Results Details */}
            {result && (
              <div className="space-y-6">
                
                {/* Summary Score Card */}
                <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] space-y-4 font-mono text-xs">
                  
                  {/* Status Banner */}
                  {result.scanStatus !== "ok" && (
                    <div
                      className={`p-4 rounded-xl border text-[11px] leading-relaxed space-y-1 ${
                        result.scanStatus === "unreachable"
                          ? "bg-red-955/10 border-red-500/20 text-red-400"
                          : result.scanStatus === "inconclusive"
                          ? "bg-orange-955/10 border-orange-500/20 text-orange-400"
                          : "bg-zinc-900/40 border-zinc-800/80 text-zinc-300"
                      }`}
                    >
                      <div className="font-bold uppercase tracking-wider text-xs">
                        Scan State: {result.scanStatus}
                      </div>
                      <div>{result.message}</div>
                      <div className="text-[10px] text-zinc-500 pt-1">
                        Attempted: <span className="font-bold text-zinc-300">{result.payloadsAttempted}</span> · 
                        Succeeded: <span className="font-bold text-zinc-300">{result.payloadsSucceeded}</span> · 
                        Success rate: <span className="font-bold text-zinc-300">{Math.round((result.successRate || 0) * 100)}%</span>
                      </div>
                    </div>
                  )}

                  {/* Standard Summary info */}
                  {(result.scanStatus === "ok" || result.scanStatus === "degraded") && (
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-900 pb-4">
                      <div className="space-y-1 text-zinc-400">
                        <div className="font-bold text-zinc-200 uppercase tracking-wide">
                          Scan Completed{" "}
                          {result.scanStatus === "degraded" && "(degraded confidence)"}
                        </div>
                        <div>
                          {result.payloadsAttempted} payloads attempted · {result.payloadsSucceeded} responses received
                        </div>
                        <div className="text-[10px] text-zinc-500 pt-0.5">
                          Types: {(result.coverage?.typesAttempted || []).join(", ")}
                        </div>
                        <div className="text-[10px] text-zinc-550">OWASP Mapping: {result.owasp}</div>
                      </div>

                      <div className="text-left sm:text-right flex-shrink-0">
                        <span className="text-[10px] text-zinc-550 block font-bold uppercase tracking-wider">Risk Score</span>
                        <span className="text-2xl font-extrabold text-red-450 block">{result.riskScore} / 100</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">{result.riskLevel}</span>
                      </div>
                    </div>
                  )}

                  <div className="text-[10px] text-zinc-500 pt-1">
                    Method: <span className="text-zinc-350 font-bold">{result.method}</span> &nbsp;|&nbsp; 
                    Parameter Key: <span className="text-zinc-350 font-bold">{result.paramName}</span>
                  </div>

                  {/* Proof of concept URL */}
                  {result.pocUrl && (
                    <div className="mt-4 flex flex-wrap items-center gap-2 bg-zinc-900/40 border border-zinc-850 p-3 rounded-xl">
                      <ExternalLink size={14} className="text-zinc-500 flex-shrink-0" />
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">PoC Node:</span>
                      <a
                        href={result.pocUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-red-400 hover:text-red-500 underline break-all flex-1 min-w-0"
                      >
                        {result.pocUrl}
                      </a>
                      <button
                        onClick={() => copy(result.pocUrl)}
                        className="px-2.5 py-1 text-[10px] bg-zinc-950 hover:bg-zinc-900 text-zinc-300 border border-zinc-850 hover:border-zinc-700 rounded-lg flex items-center gap-1 cursor-pointer font-bold uppercase"
                      >
                        <Clipboard size={12} /> Copy
                      </button>
                    </div>
                  )}
                </div>

                {/* Filters toggle controls */}
                <div className="flex items-center justify-between font-mono text-xs text-zinc-400">
                  <div>
                    Display logs:{" "}
                    <span className="font-bold text-zinc-200">
                      {showPositivesOnly
                        ? result.findingsCount || 0
                        : result.payloadsAttempted || 0}
                    </span>{" "}
                    {showPositivesOnly ? "positives" : "scans"}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setShowPositivesOnly(false)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer border ${
                        !showPositivesOnly
                          ? "bg-red-500/5 text-red-400 border-red-500/40"
                          : "bg-zinc-900/40 text-zinc-400 border-zinc-850 hover:bg-zinc-900/60"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setShowPositivesOnly(true)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer border ${
                        showPositivesOnly
                          ? "bg-red-500/5 text-red-400 border-red-500/40"
                          : "bg-zinc-900/40 text-zinc-400 border-zinc-850 hover:bg-zinc-900/60"
                      }`}
                    >
                      Positives
                    </button>
                  </div>
                </div>

                {/* Vulnerability details lists */}
                {result?.vulnerable && result?.vulnerabilityDetails?.length > 0 && (
                  <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] space-y-4 font-mono text-xs">
                    <h3 className="text-sm font-mono font-bold text-zinc-200 flex items-center gap-2 border-b border-zinc-850 pb-2.5">
                      <ShieldAlert className="w-4 h-4 text-red-400" />
                      Exploitable Vulnerabilities
                    </h3>

                    <div className="space-y-4">
                      {result.vulnerabilityDetails.map((v, i) => (
                        <div key={i} className="p-4 rounded-xl border border-red-500/20 bg-red-955/10 text-zinc-300 space-y-3">
                          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
                            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                              {v.method}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                              Param: {v.parameter}
                            </span>
                            <span className="px-2 py-0.5 rounded border border-red-500/30 bg-red-500/5 text-red-400">
                              Risk: {v.risk}
                            </span>
                            <span className="px-2 py-0.5 rounded border border-zinc-800 bg-zinc-900/80 text-zinc-400 font-mono">
                              {v.owasp}
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-[10px] text-zinc-550 block font-bold uppercase tracking-wider">Working Injection Payload</span>
                            <div className="flex items-center gap-2">
                              <code className="break-all bg-zinc-950 border border-zinc-900 px-3 py-2 rounded-xl text-red-400 font-semibold block flex-1 font-mono text-[11px] leading-relaxed">
                                {v.payload}
                              </code>
                              <button
                                onClick={() => copy(v.payload)}
                                className="px-3 py-2.5 text-[10px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700 rounded-xl whitespace-nowrap cursor-pointer uppercase font-bold"
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Scan logs tables */}
                <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] space-y-4 font-mono text-xs">
                  <h3 className="text-sm font-mono font-bold text-zinc-200 flex items-center gap-2 border-b border-zinc-850 pb-2.5">
                    <Activity className="w-4 h-4 text-red-400" />
                    Injection Scan Logs
                  </h3>

                  {(() => {
                    const itemsPerPage = 10;
                    const totalItems = rows.length;
                    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
                    
                    const safePage = Math.min(currentPage, totalPages);
                    const startIdx = (safePage - 1) * itemsPerPage;
                    const pageRows = rows.slice(startIdx, startIdx + itemsPerPage);

                    return (
                      <>
                        <div className="overflow-x-auto rounded-xl border border-zinc-850 bg-zinc-900/10">
                          <table className="min-w-full text-[11px] text-zinc-350 leading-relaxed table-fixed">
                            <colgroup>
                              <col className="w-12" />
                              <col className="w-28" />
                              <col />
                              <col className="w-16" />
                              <col className="w-20" />
                              <col className="w-24" />
                            </colgroup>
                            <thead className="bg-zinc-900/40 border-b border-zinc-850 text-zinc-500 font-bold uppercase tracking-wider text-[9px]">
                              <tr>
                                <th className="px-4 py-3 text-left">#</th>
                                <th className="px-4 py-3 text-left">Type</th>
                                <th className="px-4 py-3 text-left">Evidence / Error</th>
                                <th className="px-4 py-3 text-left">HTTP</th>
                                <th className="px-4 py-3 text-left">Time(ms)</th>
                                <th className="px-4 py-3 text-left">Details</th>
                              </tr>
                            </thead>
                            <tbody>
                              {pageRows.map((f, localIdx) => {
                                const globalIdx = startIdx + localIdx;
                                const open = openIdx === globalIdx;
                                return (
                                  <tr key={globalIdx} className="border-t border-zinc-900 align-top hover:bg-zinc-900/40 transition-colors">
                                    <td className="px-4 py-3 text-zinc-650 font-bold">{globalIdx + 1}</td>
                                    <td className="px-4 py-3 text-zinc-300 font-semibold">{f.type}</td>
                                    <td className="px-4 py-3 text-zinc-400 break-all">
                                      {f.evidence || (f.error ? "Request failed" : "—")}
                                    </td>
                                    <td className="px-4 py-3 text-zinc-400">{String(f.status)}</td>
                                    <td className="px-4 py-3 text-zinc-450">{String(f.timeMs)}</td>
                                    <td className="px-4 py-3">
                                      <button
                                        onClick={() => setOpenIdx(open ? null : globalIdx)}
                                        className="px-2.5 py-1 text-[10px] bg-zinc-900 border border-zinc-850 text-zinc-300 rounded-lg inline-flex items-center gap-1 hover:border-zinc-700 cursor-pointer uppercase font-bold select-none"
                                      >
                                        {open ? "Hide" : "View"}
                                        {open ? (
                                          <ChevronUp size={12} />
                                        ) : (
                                          <ChevronDown size={12} />
                                        )}
                                      </button>
                                      {open && (
                                        <div className="mt-3 p-3.5 bg-zinc-950/70 border border-zinc-850 rounded-xl space-y-1.5 leading-relaxed text-zinc-400 text-[10px]">
                                          <div>
                                            <span className="font-bold text-zinc-600">Parameter Key:</span> {f.param}
                                          </div>
                                          <div>
                                            <span className="font-bold text-zinc-600">Method:</span> {f.method}
                                          </div>
                                          <div className="break-all">
                                            <span className="font-bold text-zinc-600">Payload:</span> {f.payload}
                                          </div>
                                          {f.pocUrl && (
                                            <div className="break-all">
                                              <span className="font-bold text-zinc-600">PoC URL:</span> {f.pocUrl}
                                            </div>
                                          )}
                                          <div>
                                            <span className="font-bold text-zinc-600">Risk rating:</span> {f.risk}
                                          </div>
                                          {f.error && (
                                            <div className="text-red-400">
                                              <span className="font-bold">Error status:</span> {f.error}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                              {!rows.length && (
                                <tr>
                                  <td className="px-4 py-8 text-center text-zinc-600 font-mono" colSpan={6}>
                                    No scan logs to display.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination container OUTSIDE the scroll box */}
                        {totalItems > itemsPerPage && (
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] border-t border-zinc-900 pt-4 px-2">
                            <span className="text-zinc-550 order-2 sm:order-1">
                              Showing {startIdx + 1}–{Math.min(startIdx + itemsPerPage, totalItems)} of {totalItems} logs
                            </span>
                            <div className="flex items-center gap-1.5 order-1 sm:order-2 w-full sm:w-auto justify-center">
                              <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={safePage === 1}
                                className="px-2.5 py-1 bg-zinc-900 border border-zinc-850 hover:border-zinc-700 disabled:opacity-40 text-zinc-300 rounded-md cursor-pointer disabled:cursor-not-allowed font-bold"
                              >
                                Prev
                              </button>
                              <span className="text-zinc-450 px-1 font-semibold whitespace-nowrap">
                                Page {safePage} / {totalPages}
                              </span>
                              <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={safePage === totalPages}
                                className="px-2.5 py-1 bg-zinc-900 border border-zinc-850 hover:border-zinc-700 disabled:opacity-40 text-zinc-300 rounded-md cursor-pointer disabled:cursor-not-allowed font-bold"
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* Export Options */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={exportJSON}
                    className="px-4 py-2.5 bg-zinc-900/40 hover:bg-red-500/5 text-zinc-350 hover:text-red-400 border border-zinc-800/80 hover:border-red-500/30 rounded-xl font-mono font-bold text-xs uppercase transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> JSON Export
                  </button>
                  <button
                    onClick={exportPDF}
                    className="px-4 py-2.5 bg-zinc-900/40 hover:bg-red-500/5 text-zinc-350 hover:text-red-400 border border-zinc-800/80 hover:border-red-500/30 rounded-xl font-mono font-bold text-xs uppercase transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5" /> PDF Report
                  </button>
                </div>

              </div>
            )}

          </div>

          {/* Right Column (Guidance) */}
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
                    Scans website parameters against error-based database injection signatures (MySQL, PostgreSQL, MSSQL).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Audits boolean and time delay variations (sleep delays validation checks).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Enforces clean Proof of Concept URLs verification and clipboard copying logic.
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
