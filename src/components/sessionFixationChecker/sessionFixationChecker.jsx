"use client";

import { useRef, useState } from "react";
import {
  Shield,
  Upload,
  AlertTriangle,
  CheckCircle,
  FileText,
  X,
  Lock,
  Download,
  Globe,
  Info,
  Terminal,
  Activity,
  Layers,
  Cpu,
  ShieldAlert
} from "lucide-react";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";
import { generateSessionFixationPDF } from "./generateSessionFixationPDF";

export default function SessionFixationChecker() {
  const [code, setCode] = useState("");
  const [report, setReport] = useState(null);
  const [summary, setSummary] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [reportId, setReportId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const reportRef = useRef(null);

  const protectedAction = useProtectedAction();
  const apiBase = (process.env.NEXT_PUBLIC_PROD_API_URL || "").replace(
    /\/+$/,
    ""
  );

  const addToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 5000);
  };
  const removeToast = (id) => setToasts((p) => p.filter((t) => t.id !== id));

  const handleLookup = async (e) => {
    e?.preventDefault?.();

    setReport(null);
    setSummary(null);
    setMetrics(null);
    setComparison(null);
    setReportId(null);

    const v = code.trim();
    if (!v) {
      addToast("Please enter some code to analyze", "error");
      return;
    }
    if (!apiBase) {
      addToast(
        "API base URL not set. Define NEXT_PUBLIC_PROD_API_URL.",
        "error"
      );
      return;
    }

    setLoading(true);

    await protectedAction(async (token) => {
      try {
        const res = await fetch(`${apiBase}/session/sessionFixationChecker`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ code: v }),
        });

        const json = await res.json();

        if (!res.ok) {
          addToast(json?.error || "Failed to analyze code.", "error");
        } else {
          setReport(json?.report || []);
          setSummary(json?.summary || null);
          setMetrics(json?.metrics || null);
          setComparison(json?.comparison || null);
          setReportId(json?.reportId || null);

          const high = (json?.report || []).filter(
            (x) => (x.severity || "").toLowerCase() === "high"
          ).length;
          const crit = (json?.report || []).filter(
            (x) => (x.severity || "").toLowerCase() === "critical"
          ).length;

          if (crit) addToast(`Critical: ${crit} findings`, "error");
          else if (high) addToast(`High: ${high} findings`, "warning");
          else
            addToast(
              `Analysis complete (${json?.report?.length || 0} issues)`,
              "success"
            );
        }
      } catch (err) {
        addToast("Network error: " + (err?.message || String(err)), "error");
      } finally {
        setLoading(false);
      }
    });
  };

  const handleFileUpload = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/\.(js|jsx|ts|tsx|php|py|java|cs|rb|go|txt)$/i.test(f.name)) {
      addToast("Upload a valid code file", "error");
      return;
    }
    const r = new FileReader();
    r.onload = (ev) => {
      setCode(String(ev.target?.result || ""));
      addToast(`Loaded ${f.name}`, "success");
    };
    r.onerror = () => addToast("Failed to read file", "error");
    r.readAsText(f);
  };

  const openExport = (fmt) => {
    if (!reportId) {
      addToast("Analyze first to get a report id", "error");
      return;
    }
    if (!apiBase) {
      addToast(
        "API base URL not set. Define NEXT_PUBLIC_PROD_API_URL.",
        "error"
      );
      return;
    }
    window.open(
      `${apiBase}/session/sessionFixationChecker/export/${reportId}?format=${fmt}`,
      "_blank"
    );
  };

  const fileSafe = (s) =>
    s
      .replace(/[^\w\-]+/g, "_")
      .replace(/_+/g, "_")
      .toLowerCase();

  const downloadPDF = () => {
    if (!report) {
      addToast("No report to export", "error");
      return;
    }
    generateSessionFixationPDF(report, summary, metrics);
  };

  const getSeverityIcon = (s) => {
    const v = (s || "").toLowerCase();
    if (v === "critical" || v === "high")
      return <AlertTriangle className="w-5 h-5 text-red-400" />;
    if (v === "medium")
      return <AlertTriangle className="w-5 h-5 text-orange-400" />;
    return <Shield className="w-5 h-5 text-zinc-400" />;
  };

  const badge = (s) => {
    const v = (s || "").toLowerCase();
    const base = "px-2.5 py-0.5 rounded-lg text-[10px] font-bold font-mono border uppercase tracking-wider";
    if (v === "critical" || v === "high") {
      return `${base} border-red-500/40 bg-red-500/5 text-red-400`;
    }
    if (v === "medium") {
      return `${base} border-orange-500/40 bg-orange-500/5 text-orange-400`;
    }
    return `${base} border-zinc-800 bg-zinc-900/40 text-zinc-350`;
  };

  const getToastIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-red-400" />;
      case "error":
        return <ShieldAlert className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      default:
        return <Shield className="w-5 h-5 text-zinc-400" />;
    }
  };

  const getToastBg = (type) => {
    switch (type) {
      case "success":
        return "bg-zinc-950/90 border-zinc-800 text-zinc-200";
      case "error":
        return "bg-zinc-950/90 border-red-900/50 text-red-400";
      case "warning":
        return "bg-zinc-950/90 border-orange-900/50 text-orange-400";
      default:
        return "bg-zinc-950/90 border-zinc-800 text-zinc-200";
    }
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

      {/* Toast Overlay */}
      <div className="fixed top-4 right-4 z-50 space-y-2 font-mono text-xs">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`${getToastBg(
              t.type
            )} border rounded-xl p-4 shadow-xl backdrop-blur-md max-w-sm animate-in slide-in-from-right duration-300`}
          >
            <div className="flex items-start gap-3">
              {getToastIcon(t.type)}
              <p className="flex-1 text-zinc-300 leading-normal">{t.message}</p>
              <button
                onClick={() => removeToast(t.id)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

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
            <Lock className="h-8 w-8 text-red-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              SESSION FIXATION <span className="text-red-400">CHECKER</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Validate authentication and session codebases. Audits session identifier regeneration triggers and flags insecure cookies configurations.
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
                Session Fixation Audit
              </h2>

              <div className="space-y-4">
                <textarea
                  rows={8}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste login logic, cookie handling routines, or session middlewares here..."
                  className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-4 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 resize-none placeholder:text-zinc-650"
                />

                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="file"
                      accept=".js,.jsx,.ts,.tsx,.php,.py,.java,.cs,.rb,.go,.txt"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <div className="flex items-center justify-center gap-2 px-4 py-4 bg-zinc-900/40 hover:bg-red-50/5 text-zinc-350 hover:text-red-450 border border-zinc-800/80 hover:border-red-500/30 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all duration-300">
                      <Upload className="w-4 h-4" />
                      <span>Upload Code File</span>
                    </div>
                  </label>

                  <button
                    onClick={handleLookup}
                    disabled={loading || !code.trim()}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-black rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] focus:outline-none disabled:opacity-40"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Analyzing signatures...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-black" />
                        Analyze Session Code
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Completion Banner */}
            {report && (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.2)] text-center space-y-6">
                <div className="w-12 h-12 mx-auto border border-red-500/30 bg-red-500/5 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-red-400" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-mono font-bold text-zinc-100 uppercase tracking-wider">
                    ✓ ANALYSIS COMPLETED
                  </h2>
                  <p className="text-zinc-400 font-mono text-xs max-w-xl mx-auto leading-relaxed">
                    The security assessment has completed successfully. Review the findings below or download the detailed report for complete analysis.
                  </p>
                </div>
                <div className="flex justify-center gap-4 flex-wrap">
                  <button
                    onClick={downloadPDF}
                    className="px-6 py-3 bg-red-500 hover:bg-red-600 text-black rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                  >
                    <Download className="w-4 h-4 text-black" />
                    Download Report
                  </button>
                  <button
                    onClick={() => {
                      setReport(null);
                      setSummary(null);
                      setMetrics(null);
                      setComparison(null);
                      setReportId(null);
                      setCode("");
                    }}
                    className="px-6 py-3 bg-zinc-900/40 hover:bg-red-500/5 text-zinc-350 hover:text-red-400 border border-zinc-800/80 hover:border-red-500/30 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer"
                  >
                    <Activity className="w-4 h-4" />
                    Run New Scan
                  </button>
                </div>
              </div>
            )}

            {/* Results Section */}
            {report !== null && (
              <div ref={reportRef} className="space-y-6 mt-6">
                
                {/* Score breakdown metrics card */}
                <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] space-y-6">
                  {/* Dynamic security summary values */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs text-left">
                    <div className="bg-zinc-900/40 border border-zinc-850 p-4 rounded-xl space-y-1">
                      <span className="text-[10px] text-zinc-550 block font-bold uppercase tracking-wider">Security Status</span>
                      <span className={`text-sm font-extrabold block ${
                        report.some(r => r.status === "Failed" && (r.severity === "Critical" || r.severity === "High")) 
                          ? "text-red-400" 
                          : report.some(r => r.status === "Failed") 
                          ? "text-orange-450" 
                          : report.filter(r => r.status === "Passed").length === 0 
                          ? "text-zinc-550" 
                          : "text-green-400"
                      }`}>
                        {(() => {
                          const naCount = report.filter(r => r.status === "N/A" || r.status === "Unable to Verify").length;
                          if (naCount === report.length) return "Unable to Verify";
                          if (report.some(r => r.status === "Failed" && (r.severity === "Critical" || r.severity === "High"))) return "Vulnerable";
                          if (report.some(r => r.status === "Failed")) return "Potential Risk";
                          return "Secure";
                        })()}
                      </span>
                    </div>

                    <div className="bg-zinc-900/40 border border-zinc-850 p-4 rounded-xl space-y-1">
                      <span className="text-[10px] text-zinc-550 block font-bold uppercase tracking-wider">Security Score</span>
                      <span className="text-sm font-extrabold text-zinc-200 block">
                        {(() => {
                          const active = report.filter(r => r.status !== "N/A" && r.status !== "Unable to Verify");
                          const scoreVal = active.length > 0 
                            ? Math.round((active.filter(r => r.status === "Passed").length / active.length) * 100) 
                            : 100;
                          return `${scoreVal} / 100`;
                        })()}
                      </span>
                    </div>

                    <div className="bg-zinc-900/40 border border-zinc-850 p-4 rounded-xl space-y-1">
                      <span className="text-[10px] text-zinc-550 block font-bold uppercase tracking-wider">Risk Level</span>
                      <span className="text-sm font-extrabold text-zinc-200 block">
                        {(() => {
                          const active = report.filter(r => r.status !== "N/A" && r.status !== "Unable to Verify");
                          const scoreVal = active.length > 0 
                            ? Math.round((active.filter(r => r.status === "Passed").length / active.length) * 100) 
                            : 100;
                          if (scoreVal < 40) return "Critical Risk";
                          if (scoreVal < 70) return "High Risk";
                          if (scoreVal < 90) return "Moderate Risk";
                          return "Secure (Low Risk)";
                        })()}
                      </span>
                    </div>

                    <div className="bg-zinc-900/40 border border-zinc-850 p-4 rounded-xl space-y-1">
                      <span className="text-[10px] text-zinc-550 block font-bold uppercase tracking-wider">Checks Summary</span>
                      <div className="text-[10px] text-zinc-400 space-y-0.5 mt-0.5">
                        <div className="flex justify-between">
                          <span>Passed:</span>
                          <span className="text-green-400 font-bold">{report.filter(r => r.status === "Passed").length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Failed:</span>
                          <span className="text-red-400 font-bold">{report.filter(r => r.status === "Failed").length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Unable to Verify:</span>
                          <span className="text-zinc-500 font-bold">{report.filter(r => r.status === "N/A" || r.status === "Unable to Verify").length}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {comparison && (
                    <div className="text-[10px] font-mono text-zinc-550 border-t border-zinc-900/60 pt-3">
                      {comparison.previousReportId
                        ? `Compared to previous scan: Δ${
                            comparison.deltaFindings >= 0 ? "+" : ""
                          }${comparison.deltaFindings}`
                        : "No previous scan with matching file identity"}
                    </div>
                  )}

                  {metrics && (
                    <div className="grid md:grid-cols-2 gap-4 text-xs font-mono text-zinc-450 border-t border-zinc-900/60 pt-4 text-left">
                      <div className="bg-zinc-900/40 border border-zinc-850 p-3 rounded-xl space-y-1">
                        <span className="text-[9px] text-zinc-550 block font-bold uppercase tracking-wider">Cookie Headers</span>
                        HttpOnly: <span className="text-zinc-250 font-semibold">{String(metrics.cookieFlags?.httpOnly)}</span>, 
                        Secure: <span className="text-zinc-250 font-semibold">{String(metrics.cookieFlags?.secure)}</span>, 
                        SameSite: <span className="text-zinc-250 font-semibold">{String(metrics.cookieFlags?.sameSite || "—")}</span>
                      </div>
                      <div className="bg-zinc-900/40 border border-zinc-850 p-3 rounded-xl space-y-1">
                        <span className="text-[9px] text-zinc-550 block font-bold uppercase tracking-wider">Token Quality</span>
                        Entropy Hint: <span className="text-zinc-250 font-semibold">{metrics.tokenEntropyHint || "—"}</span> • 
                        Reuse Risk: <span className="text-red-400 font-semibold">{metrics.tokenReuseRisk || "—"}</span>
                      </div>
                      <div className="bg-zinc-900/40 border border-zinc-850 p-3 rounded-xl space-y-1">
                        <span className="text-[9px] text-zinc-550 block font-bold uppercase tracking-wider">Session Bindings</span>
                        IP Address: <span className="text-zinc-250 font-semibold">{metrics.ipBinding ? "yes" : "no"}</span> • 
                        User-Agent: <span className="text-zinc-250 font-semibold">{metrics.uaBinding ? "yes" : "no"}</span>
                      </div>
                      <div className="bg-zinc-900/40 border border-zinc-850 p-3 rounded-xl space-y-1">
                        <span className="text-[9px] text-zinc-550 block font-bold uppercase tracking-wider">MFA / Invalidation</span>
                        MFA Enabled: <span className="text-zinc-250 font-semibold">{metrics.mfaPresent ? "yes" : "no"}</span> • 
                        Regen on Escalation: <span className="text-zinc-250 font-semibold">{metrics.regenOnPrivEsc ? "yes" : "no"}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Specific issues list */}
                {Array.isArray(report) && report.filter(r => r.status === "Failed").length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      <h2 className="text-base font-mono font-bold text-zinc-200 uppercase tracking-wider">
                        Security Scan Report ({report.filter(r => r.status === "Failed").length} flaws)
                      </h2>
                    </div>
                    {report.filter(r => r.status === "Failed").map((f, i) => (
                      <div
                        key={i}
                        className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] font-mono text-xs space-y-3"
                      >
                        <div className="flex items-center justify-between gap-4 border-b border-zinc-900 pb-3 flex-wrap">
                          <div className="flex items-center gap-2 flex-wrap">
                            {getSeverityIcon(f.severity)}
                            <span className={badge(f.severity)}>
                              {(f.severity || "").toUpperCase()} • CVSS {f.cvss ?? "—"} • {f.exploitability || "—"} exploitability
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-550 uppercase tracking-wide font-semibold text-right flex-1">
                            Rule: {f.rule || "—"}
                          </span>
                        </div>
                        
                        <div className="text-zinc-350 space-y-2 text-left">
                          <p>
                            <strong className="text-zinc-500">Issue:</strong> {f.message}
                          </p>
                          {f.reasoning && (
                            <p className="text-zinc-400">
                              <strong className="text-zinc-500">Reasoning:</strong> {f.reasoning}
                            </p>
                          )}
                          {f.attackScenario && (
                            <p className="text-zinc-400">
                              <strong className="text-zinc-500">Attack Vectors:</strong> {f.attackScenario}
                            </p>
                          )}
                        </div>

                        {Array.isArray(f.locations) && f.locations.length > 0 && (
                          <div className="mt-3 border-t border-zinc-900/60 pt-3 text-left">
                            <span className="text-[10px] text-zinc-550 block font-bold uppercase tracking-wider mb-2">Line Locations</span>
                            <ul className="space-y-1.5 pl-0 list-none text-zinc-400">
                              {f.locations.slice(0, 5).map((loc, k) => (
                                <li key={k} className="flex items-start gap-2">
                                  <code className="text-red-400 font-bold shrink-0">Line {loc.line}:</code>
                                  <span className="text-zinc-500 break-all">{loc.snippet}</span>
                                </li>
                              ))}
                            </ul>
                            {f.locations.length > 5 && (
                              <p className="text-zinc-550 text-[10px] mt-1.5">
                                + {f.locations.length - 5} more locations...
                              </p>
                            )}
                          </div>
                        )}

                        {f.suggestion && (
                          <div className="bg-zinc-900/40 border border-zinc-850 p-4 rounded-xl space-y-1 mt-4 text-left">
                            <span className="text-[10px] text-zinc-550 block font-bold uppercase tracking-wider">Recommended Remediation</span>
                            <p className="text-red-400 font-semibold">{f.suggestion}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Default State */}
            {report === null && !loading && (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-16 shadow-[0_8px_30px_rgb(0,0,0,0.2)] text-center space-y-4">
                <div className="w-12 h-12 mx-auto border border-zinc-800/60 bg-zinc-900/40 rounded-xl flex items-center justify-center">
                  <Lock className="w-5 h-5 text-zinc-500" />
                </div>
                <h2 className="text-sm font-mono font-bold text-zinc-200 uppercase tracking-wider">
                  Ready to audit source code
                </h2>
                <p className="text-zinc-550 font-mono text-xs">
                  Paste server-side routines and trigger "Analyze Session Code" to parse vulnerabilities.
                </p>
              </div>
            )}

          </div>

          {/* Right Column (Guidance) */}
          <div className="space-y-6">
            
            {/* Guidance sidebar card */}
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Info className="text-red-400 w-4 h-4" />
                Checker Guidance
              </h2>
              <ul className="space-y-3.5 list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Scans configuration middleware to locate session regeneration calls.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Verifies HttpOnly, SameSite, and Secure flags parameters on cookies.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Checks validation parameters linking sessions to remote client IP and User-Agent headers.
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
