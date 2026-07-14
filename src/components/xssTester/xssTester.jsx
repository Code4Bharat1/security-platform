"use client";

import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Shield,
  Upload,
  AlertTriangle,
  CheckCircle,
  X,
  Download,
  Globe,
  Info,
  Terminal,
  Activity,
  Layers,
  Cpu,
  ShieldAlert,
  CheckCircle2,
  FileDown
} from "lucide-react";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";
import { generateXssTesterPDF } from "./generateXssTesterPDF";

export default function XssTester() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [payloadCount, setPayloadCount] = useState(null);
  const [payloadLoading, setPayloadLoading] = useState(true);

  const protectedAction = useProtectedAction();
  const apiBase = (process.env.NEXT_PUBLIC_PROD_API_URL || "").replace(/\/+$/, "");

  useEffect(() => {
    const fetchPayloads = async () => {
      try {
        const tokenRaw =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const token = tokenRaw ? tokenRaw.replace(/^"|"$/g, "") : "";
        const res = await fetch(`${apiBase}/xssTester/payloads`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setPayloadCount(data.count ?? 0);
        }
      } catch {
        // silent fail
      } finally {
        setPayloadLoading(false);
      }
    };
    fetchPayloads();
  }, [apiBase]);

  const handleTest = async (e) => {
    e?.preventDefault?.();
    setResult(null);
    setLoading(true);

    await protectedAction(async (token) => {
      try {
        const res = await fetch(`${apiBase}/xssTester/xssTester-scan`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            url,
            domScan: true,
            takeScreenshots: true,
            autoBypass: true,
          }),
        });

        const data = await res.json();
        setResult(data);
      } catch (err) {
        setResult({ error: String(err) });
      }
    });

    setLoading(false);
  };

  const makePdf = () => {
    generateXssTesterPDF(result, url);
  };

  const downloadJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const urlObj = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = urlObj;
    a.download = "xss-report.json";
    a.click();
    URL.revokeObjectURL(urlObj);
  };

  const riskBadge = (risk) => {
    const map = {
      High: "text-red-400 bg-red-950/20 border border-red-500/20",
      Medium: "text-orange-400 bg-orange-950/20 border border-orange-500/20",
      Low: "text-zinc-350 bg-zinc-900/40 border border-zinc-800",
      None: "text-zinc-500 bg-zinc-900/10 border border-zinc-900",
    };
    return map[risk] || map.None;
  };

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
            <Terminal className="h-8 w-8 text-red-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              ADVANCED XSS <span className="text-red-400">SCANNER</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Automated Cross-Site Scripting (XSS) assessments. Injects payloads across dynamic query parameters and evaluates reflections in real-time response nodes.
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
                XSS Injection Parameters
              </h2>

              <form onSubmit={handleTest} className="space-y-4">
                <div>
                  <label htmlFor="xss-url-input" className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                    Target Website URL
                  </label>
                  <div className="relative flex items-center">
                    <Globe className="absolute left-4 w-4 h-4 text-zinc-650" />
                    <input
                      id="xss-url-input"
                      type="url"
                      placeholder="e.g., https://site.com/search?id=1&query=test"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      required
                      className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 pl-12 text-sm focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 focus:shadow-[0_0_12px_rgba(239,68,68,0.08)] focus:outline-none transition-all placeholder:text-zinc-600 font-mono"
                    />
                  </div>
                </div>

                {/* Auto detection Pills */}
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <div className="flex items-center gap-2 bg-zinc-900/40 border border-zinc-850 rounded-lg px-3.5 py-1.5 font-mono text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-450 animate-pulse"></span>
                    <span className="text-zinc-450">
                      Query params auto-detect (defaults to <code className="text-red-400">q</code>)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-zinc-900/40 border border-zinc-850 rounded-lg px-3.5 py-1.5 font-mono text-[10px]">
                    {payloadLoading ? (
                      <span className="text-zinc-500 animate-pulse">Checking payloads database...</span>
                    ) : payloadCount !== null ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        <span className="text-zinc-400">
                          <span className="text-red-400 font-bold">{payloadCount}</span> payloads armed
                        </span>
                      </>
                    ) : (
                      <span className="text-zinc-500">Managed payloads active</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="submit"
                    id="xss-run-scan-btn"
                    disabled={loading || !url.trim()}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-black rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] focus:outline-none disabled:opacity-40"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Injecting payloads...
                      </>
                    ) : (
                      <>
                        <Terminal className="w-4 h-4 text-black" />
                        Run XSS Scan
                      </>
                    )}
                  </button>

                  {result && !result.error && (
                    <>
                      <button
                        type="button"
                        id="xss-download-pdf-btn"
                        onClick={makePdf}
                        className="px-5 py-4 rounded-xl bg-zinc-900/40 hover:bg-red-50/5 text-zinc-350 hover:text-red-450 border border-zinc-800/80 hover:border-red-500/30 font-mono font-bold text-xs uppercase transition-all duration-350 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <FileDown className="w-4 h-4" />
                        PDF Report
                      </button>
                      <button
                        type="button"
                        id="xss-download-json-btn"
                        onClick={downloadJson}
                        className="px-5 py-4 rounded-xl bg-zinc-900/40 hover:bg-red-50/5 text-zinc-350 hover:text-red-450 border border-zinc-800/80 hover:border-red-500/30 font-mono font-bold text-xs uppercase transition-all duration-350 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        JSON
                      </button>
                    </>
                  )}
                </div>
              </form>
            </div>

            {/* Scan Results details report */}
            {result && (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] space-y-6">

                <h3 className="text-sm font-mono font-bold text-zinc-200 flex items-center gap-2 border-b border-zinc-850 pb-2.5">
                  <Activity className="w-4 h-4 text-red-400" />
                  XSS Injection Results
                </h3>

                {!result.error ? (
                  <div className="space-y-5 font-mono text-xs">

                    {/* Tested parameters badge strip */}
                    {result.detectedParams?.length > 0 && (
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-zinc-550 font-bold uppercase tracking-wider text-[10px]">Parameters Tested:</span>
                        {result.detectedParams.map((p) => (
                          <span
                            key={p}
                            className="px-2 py-0.5 border border-red-500/30 bg-red-500/5 text-red-450 rounded-lg text-[10px] font-bold font-mono"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Summary statistics grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: "Total Runs", value: result.summary?.total ?? "—", color: "text-zinc-200" },
                        { label: "High Risk", value: result.summary?.high ?? 0, color: "text-red-450" },
                        { label: "Medium Risk", value: result.summary?.medium ?? 0, color: "text-orange-450" },
                        { label: "Low Risk", value: result.summary?.low ?? 0, color: "text-zinc-400" },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="bg-zinc-900/40 border border-zinc-850 rounded-xl p-3 text-center">
                          <div className={`text-xl font-bold ${color}`}>{value}</div>
                          <div className="text-zinc-500 text-[10px] uppercase tracking-wide mt-1">{label}</div>
                        </div>
                      ))}
                    </div>

                    {/* WAF and rate limit status info */}
                    <div className="grid sm:grid-cols-2 gap-3 p-3.5 bg-zinc-900/20 border border-zinc-850 rounded-xl text-[11px] text-zinc-450">
                      <div>
                        WAF Shield:{" "}
                        <span className={result.waf?.detected ? "text-orange-400 font-bold" : "text-zinc-400"}>
                          {result.waf?.detected ? `Detected (${result.waf?.vendor || "unknown"})` : "Not detected"}
                        </span>
                      </div>
                      <div>
                        Rate Limit:{" "}
                        <span className={result.rateLimit?.detected ? "text-orange-400 font-bold" : "text-zinc-400"}>
                          {result.rateLimit?.detected ? `Active (${result.rateLimit?.reason})` : "Not detected"}
                        </span>
                      </div>
                    </div>

                    {/* Table results list */}
                    <div className="overflow-x-auto rounded-xl border border-zinc-850 bg-zinc-900/10">
                      <table className="min-w-full text-[11px] text-zinc-350 leading-relaxed">
                        <thead className="bg-zinc-900/40 border-b border-zinc-850 text-zinc-500 font-bold uppercase tracking-wider text-[9px]">
                          <tr className="text-left">
                            <th className="py-3 px-3">#</th>
                            <th className="py-3 px-3">Param</th>
                            <th className="py-3 px-3">Payload Injected</th>
                            <th className="py-3 px-3">Context</th>
                            <th className="py-3 px-3">Reflected</th>
                            <th className="py-3 px-3">DOM Exec</th>
                            <th className="py-3 px-3">Risk Rating</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(result.runs || []).map((r, idx) => (
                            <tr
                              key={idx}
                              className="border-t border-zinc-900 align-top hover:bg-zinc-900/40 transition-colors"
                            >
                              <td className="py-2.5 px-3 text-zinc-650 font-bold">{idx + 1}</td>
                              <td className="py-2.5 px-3">
                                <span className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded font-mono text-[10px]">
                                  {r.param || "—"}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-mono break-all text-zinc-200 max-w-xs text-[10px]">
                                {r.payload}
                              </td>
                              <td className="py-2.5 px-3 text-zinc-400">{r.context || "—"}</td>
                              <td className="py-2.5 px-3">
                                {r.reflected ? (
                                  <span className="text-red-400 font-bold">Yes</span>
                                ) : (
                                  <span className="text-zinc-600">No</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3">
                                {r.domExecuted ? (
                                  <span className="text-red-400 font-bold">Yes</span>
                                ) : (
                                  <span className="text-zinc-600">No</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className={riskBadge(r.risk)}>
                                  {r.risk || "—"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Reflection Highlight (first hit) */}
                    {(result.runs || []).some((r) => r.reflection?.highlighted) && (
                      <div className="space-y-2 border-t border-zinc-900 pt-4">
                        <span className="text-[10px] text-zinc-550 block font-bold uppercase tracking-wider">Reflected Payload Trace</span>
                        {(result.runs || [])
                          .filter((r) => r.reflection?.highlighted)
                          .slice(0, 1)
                          .map((r, idx) => (
                            <pre
                              key={idx}
                              className="bg-zinc-950/65 border border-zinc-900 rounded-xl p-4 overflow-x-auto text-[11px] leading-relaxed text-red-400 font-mono whitespace-pre-wrap"
                            >
                              {r.reflection?.highlighted}
                            </pre>
                          ))}
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-red-500/20 bg-red-955/10 text-red-400 text-xs font-mono">
                    Analysis Error: {String(result.error)}
                  </div>
                )}

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
                    Scans URL query parameters for dynamic script reflections.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Audits outputs contexts (HTML body, attributes, inline JS scripts) to determine exploitability.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Identifies downstream DOM execution vulnerabilities using automated checks.
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
