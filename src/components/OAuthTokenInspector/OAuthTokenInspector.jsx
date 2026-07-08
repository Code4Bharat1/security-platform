"use client";

import React, { useEffect, useMemo, useState } from "react";
import { generateOAuthPDF } from "./generateOAuthPDF";
import { 
  Shield, 
  Download, 
  Terminal, 
  Info, 
  Key, 
  FileText,
  AlertTriangle,
  Lock,
  ChevronDown,
  Loader2
} from "lucide-react";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";

/* ---------- small helpers ---------- */
const safeName = (str) =>
  String(str || "token")
    .toLowerCase()
    .replace(/[^a-z0-9._-]/gi, "_")
    .slice(0, 60);

const fmtDateTime = (epoch) =>
  epoch == null ? "Not Present" : new Date(epoch * 1000).toLocaleString();

const getExpiredMessage = (epoch) => {
  if (epoch == null) return "Cannot be calculated";
  const secAgo = Math.floor(Date.now() / 1000) - epoch;
  if (secAgo <= 0) return "Not Expired";
  const daysAgo = Math.floor(secAgo / 86400);
  const dateStr = new Date(epoch * 1000).toLocaleString();
  if (daysAgo >= 1) {
    return `Expired ${daysAgo} day${daysAgo > 1 ? "s" : ""} ago`;
  }
  return `Expired on ${dateStr}`;
};

function fmtDuration(s) {
  if (s == null) return "Cannot be calculated";
  const neg = s < 0;
  s = Math.abs(s);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  const parts = [];
  if (d) parts.push(`${d}d`);
  if (h || d) parts.push(`${h}h`);
  if (m || h || d) parts.push(`${m}m`);
  parts.push(`${sec}s`);
  return (neg ? "-" : "") + parts.join(" ");
}

/* Basic client-side score if backend doesn't provide one */
function computeScore(payload = {}, issues = []) {
  let score = 100;
  const breakdown = [];

  const penalize = (label, pts) => {
    score -= pts;
    breakdown.push({ label, delta: -pts });
  };

  if (!("exp" in payload)) penalize("Missing exp", 25);
  if (!("iat" in payload)) penalize("Missing iat", 10);
  if (!("iss" in payload)) penalize("Missing iss", 10);
  if (!("sub" in payload)) penalize("Missing sub", 5);

  if (payload.exp && Date.now() >= payload.exp * 1000)
    penalize("Token expired", 30);

  issues.forEach((i) => {
    if (String(i).toLowerCase().includes("alg: none"))
      penalize("alg: none", 50);
  });

  score = Math.max(0, Math.min(100, score));
  return { score, breakdown };
}

const API_BASE = (process.env.NEXT_PUBLIC_PROD_API_URL || "").replace(/\/$/, "");
const USE_API_PREFIX = !/\/api$/i.test(API_BASE);
const ENDPOINT = `${API_BASE}${USE_API_PREFIX ? "/api" : ""}/auth/oauthTokenInspector`;

export default function OAuthTokenInspector() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState(null);
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  const [pdfProgress, setPdfProgress] = useState(null);

  const protection = useProtectedAction();

  /* live clock for countdown */
  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  /* auto-hide toast */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (message, type = "success") => setToast({ message, type });

  const analyzeToken = async () => {
    setLoading(true);
    setResult(null);

    await protection(async (userToken) => {
      try {
        const res = await fetch(ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({ token }),
        });
        const data = await res.json().catch(() => ({}));
        setResult(data);
        if (!res.ok || data?.error) {
          showToast(data?.error || `Analysis failed (${res.status})`, "error");
        } else {
          showToast("Token analyzed successfully!", "success");
        }
      } catch (e) {
        setResult({ error: "Connection error. Is the API running?" });
        showToast("Connection error. Please try again.", "error");
      } finally {
        setLoading(false);
      }
    });
  };

  const payload = result?.payload || {};
  const issues = result?.issues || [];

  const expEpoch = result?.meta?.expEpoch ?? payload?.exp ?? null;
  const iatEpoch = result?.meta?.iatEpoch ?? payload?.iat ?? null;

  const cleanIssues = useMemo(() => {
    return issues.map((issue) => {
      if (issue.startsWith("Token expired ") && expEpoch) {
        return getExpiredMessage(expEpoch);
      }
      return issue;
    });
  }, [issues, expEpoch]);

  const isExpired = result?.meta?.isExpired ?? (expEpoch ? now >= expEpoch : null);

  const lifetimePercentUsed = useMemo(() => {
    if (result?.meta?.lifetimePercentUsed != null)
      return result.meta.lifetimePercentUsed;
    if (expEpoch != null && iatEpoch != null && expEpoch > iatEpoch) {
      const used = Math.min(Math.max(now - iatEpoch, 0), expEpoch - iatEpoch);
      return Math.round((used / (expEpoch - iatEpoch)) * 100);
    }
    return null;
  }, [result?.meta?.lifetimePercentUsed, expEpoch, iatEpoch, now]);

  const timeRemaining = useMemo(() => {
    if (expEpoch == null) return null;
    return expEpoch - now;
  }, [expEpoch, now]);

  const scoreObj = useMemo(() => {
    if (result?.meta?.securityScore != null) {
      return {
        score: result.meta.securityScore,
        breakdown: result.meta.scoreBreakdown || [],
      };
    }
    return computeScore(payload, issues);
  }, [result?.meta?.securityScore, result?.meta?.scoreBreakdown, payload, issues]);

  const score = scoreObj.score;
  const scoreBarColor = score >= 80 ? "bg-blue-500" : score >= 60 ? "bg-orange-500" : "bg-red-500";
  const progressColor = timeRemaining == null ? "bg-zinc-700" : isExpired ? "bg-red-500" : (lifetimePercentUsed ?? 0) >= 80 ? "bg-orange-500" : "bg-blue-500";
  const riskLevel = score >= 80 ? "Low" : score >= 60 ? "Medium" : "High";

  const handleDownloadTxt = () => {
    if (!result || result.error) return;
    const lines = [
      "OAuth Token Report",
      `Generated: ${new Date().toLocaleString()}`,
      "",
      "== Summary ==",
      `Issued At: ${fmtDateTime(iatEpoch)}`,
      `Expires At: ${fmtDateTime(expEpoch)}`,
      `Time Remaining: ${expEpoch == null ? "Cannot be calculated" : timeRemaining <= 0 ? getExpiredMessage(expEpoch) : fmtDuration(timeRemaining)}`,
      `Algorithm: ${result?.header?.alg ?? "Not Present"}`,
      `Token Type: ${result?.header?.typ ?? "JWT"}`,
      `Audience (aud): ${payload.aud ? (Array.isArray(payload.aud) ? payload.aud.join(", ") : String(payload.aud)) : "Not Present"}`,
      `Security Score: ${score}/100 (${riskLevel} Risk)`,
      "",
      "== Issues ==",
      ...(cleanIssues.length ? cleanIssues : ["None"]),
      "",
      "== Payload ==",
      JSON.stringify(payload, null, 2),
      "",
      "== Score Breakdown ==",
      ...(scoreObj.breakdown.length
        ? scoreObj.breakdown.map((b) => `- ${b.label}${b.delta ? ` (${b.delta})` : ""}`)
        : ["Not Present"]),
      "",
    ].join("\n");

    const nameFrom = payload.iss || payload.sub || payload.jti;
    const filename = `OAuth_Report_${safeName(nameFrom)}.txt`;

    const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
    const urlObj = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = urlObj;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(urlObj);
  };

  const handleDownloadPdf = async () => {
    if (!result || result.error) return;
    await generateOAuthPDF(result, token, setPdfProgress);
  };

  return (
    <div 
      className="tool-detail-page min-h-screen"
      style={{
        '--hero-ambient-a': 'rgba(59, 130, 246, 0.08)',
        '--hero-ambient-b': 'rgba(6, 182, 212, 0.03)',
        '--glow-primary': '0 0 34px rgba(59, 130, 246, 0.16)',
        '--gold': '#3b82f6',
        '--gold-strong': '#60a5fa',
        '--gold-dark': '#1d4ed8',
        '--ring': 'rgba(59, 130, 246, 0.34)',
        '--surface-glow': 'rgba(59, 130, 246, 0.14)',
      }}
    >
      <style>{`
        .tool-detail-page .tool-detail-shell {
          padding-top: 3.5rem !important;
        }
        .tool-detail-page ::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.35) !important;
        }
        .tool-detail-page ::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.55) !important;
        }
        .tool-detail-page ::selection {
          background: rgba(59, 130, 246, 0.22) !important;
          color: #eff6ff !important;
        }
        .tool-detail-page :is(button, [role="button"]):is([class*="bg-blue-"], [class*="bg-sky-"]) {
          color: #000000 !important;
        }
        .tool-detail-page :is(button, [role="button"]):is([class*="bg-blue-"], [class*="bg-sky-"]) * {
          color: #000000 !important;
        }
      `}</style>

      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right duration-300">
          <div
            className={`px-6 py-4 rounded-xl border backdrop-blur-md font-mono text-xs uppercase tracking-wider ${
              toast.type === "success"
                ? "bg-blue-950/90 border-blue-500/30 text-blue-400"
                : "bg-red-950/90 border-red-500/30 text-red-400"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="font-semibold">{toast.message}</span>
              <button
                onClick={() => setToast(null)}
                className="ml-2 text-zinc-400 hover:text-zinc-200"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="tool-detail-shell">
        {/* Navigation & Header */}
        <div className="flex justify-end mb-8">
          <span className="rounded-full border border-blue-500/30 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-blue-400">
            Blue Team
          </span>
        </div>

        {/* Title Block */}
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl border border-blue-500/30 overflow-hidden shadow-lg flex-shrink-0 flex items-center justify-center">
            <Lock className="h-8 w-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              OAUTH TOKEN <span className="text-blue-400">INSPECTOR</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Analyze JSON Web Tokens (JWT), inspect claims metadata, calculate lifecycle expiration metrics, and audit protocol parameters.
            </p>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* Form Card */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-blue-500/10 transition-all duration-300 space-y-5">
              <h2 className="text-lg font-mono font-medium text-zinc-100 mb-2 flex items-center gap-2">
                <Lock className="h-5 w-5 text-blue-400" />
                Token Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                    Paste Your OAuth Token (JWT)
                  </label>
                  <textarea
                    rows={6}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 text-xs focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 focus:shadow-[0_0_12px_rgba(59,130,246,0.08)] focus:outline-none transition-all placeholder:text-zinc-650 font-mono resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={analyzeToken}
                    disabled={!token.trim() || loading}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-black rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2 focus:ring-offset-black/20 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-black" />
                        Analyzing Token claims...
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4 text-black" />
                        Inspect OAuth Token
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Results block */}
            {result && (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-blue-500/10 transition-all duration-300 space-y-6">
                
                {result.error ? (
                  <div className="border border-red-500/30 bg-red-500/10 rounded-xl p-4 flex items-center gap-3 text-red-400">
                    <AlertTriangle className="h-6 w-6" />
                    <div>
                      <h2 className="text-lg font-mono font-bold uppercase tracking-wider">
                        Error Occurred
                      </h2>
                      <p className="text-xs font-mono text-zinc-400 mt-0.5">
                        {result.error}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Exporters */}
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={handleDownloadPdf}
                        disabled={pdfProgress !== null}
                        className="flex-1 bg-zinc-900/40 hover:bg-blue-500/5 text-zinc-300 hover:text-blue-400 border border-zinc-800/80 hover:border-blue-500/30 rounded-xl font-mono font-bold text-xs uppercase py-3.5 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {pdfProgress ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                            <span>{pdfProgress}</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            <span>Download PDF Report</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleDownloadTxt}
                        className="flex-1 bg-zinc-900/40 hover:bg-blue-500/5 text-zinc-300 hover:text-blue-400 border border-zinc-800/80 hover:border-blue-500/30 rounded-xl font-mono font-bold text-xs uppercase py-3.5 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <FileText className="w-4 h-4" />
                        Download TXT Report
                      </button>
                    </div>

                    {/* Summary metrics grid cards */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl font-mono text-xs">
                        <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-semibold mb-1 block">
                          Issued At
                        </span>
                        <span className="font-semibold text-zinc-100">
                          {fmtDateTime(iatEpoch)}
                        </span>
                      </div>

                      <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl font-mono text-xs">
                        <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-semibold mb-1 block">
                          Expires At
                        </span>
                        <span className="font-semibold text-zinc-100">
                          {expEpoch == null ? "Not Present" : fmtDateTime(expEpoch)}
                        </span>
                      </div>

                      {/* Lifetime Countdown */}
                      <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl font-mono text-xs">
                        <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-semibold mb-1 block">
                          Time Remaining
                        </span>
                        <span className="font-semibold text-zinc-100">
                          {expEpoch == null ? "Cannot be calculated" : timeRemaining <= 0 ? getExpiredMessage(expEpoch) : fmtDuration(timeRemaining)}
                        </span>
                        {lifetimePercentUsed != null && (
                          <div className="mt-3 h-1.5 w-full bg-zinc-850 rounded-full overflow-hidden">
                            <div
                              className={`${progressColor} h-1.5`}
                              style={{
                                width: `${Math.min(Math.max(lifetimePercentUsed, 0), 100)}%`,
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Security Score */}
                      <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl font-mono text-xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-semibold">
                              Token Security Score
                            </span>
                            <span className="text-[10px] text-zinc-100 font-bold">{score}/100</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-850 rounded-full overflow-hidden mb-2.5">
                            <div
                              className={`${scoreBarColor} h-1.5`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between border-t border-zinc-800/60 pt-2">
                          <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-semibold">
                            Risk Level
                          </span>
                          <span className={`text-[10px] font-bold uppercase ${
                            riskLevel === "Low" ? "text-blue-400" : riskLevel === "Medium" ? "text-orange-400" : "text-red-400"
                          }`}>
                            {riskLevel} Risk
                          </span>
                        </div>
                        {!!scoreObj.breakdown.length && (
                          <ul className="mt-2 text-[10px] text-zinc-400 list-none pl-0 space-y-1">
                            {scoreObj.breakdown.map((b, i) => (
                              <li key={i} className="flex items-center gap-1">
                                <span className="inline-block w-1 h-1 rounded-full bg-zinc-500" />
                                <span>{b.label} {b.delta ? `(${b.delta})` : ""}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Token Header Metadata (Algorithm, Type & Audience) */}
                      <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl font-mono text-xs col-span-1 sm:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-semibold mb-1 block">
                              Algorithm
                            </span>
                            <span className="font-semibold text-zinc-100 uppercase">
                              {result?.header?.alg ?? "Not Present"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-semibold mb-1 block">
                              Token Type
                            </span>
                            <span className="font-semibold text-zinc-100 uppercase">
                              {result?.header?.typ ?? "JWT"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-semibold mb-1 block">
                              Audience (aud)
                            </span>
                            <span className="font-semibold text-zinc-100 break-all">
                              {payload.aud ? (Array.isArray(payload.aud) ? payload.aud.join(", ") : String(payload.aud)) : "Not Present"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Security Issues Panel */}
                    {cleanIssues.length > 0 ? (
                      <div className="bg-orange-950/20 border border-orange-500/30 rounded-xl p-4 space-y-3">
                        <h3 className="text-sm font-mono font-bold text-orange-400 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4" />
                          Security Issues Detected
                        </h3>
                        <div className="space-y-2">
                          {cleanIssues.map((issue, idx) => (
                            <div
                              key={idx}
                              className="bg-zinc-900/40 border border-zinc-800/80 text-zinc-300 p-2.5 rounded-lg text-xs font-mono"
                            >
                              {issue}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="border border-blue-500/30 bg-blue-500/10 rounded-xl p-4 flex items-center gap-3 text-blue-400">
                        <Shield className="h-6 w-6" />
                        <div>
                          <h2 className="text-sm font-mono font-bold uppercase tracking-wider">
                            Token Validated
                          </h2>
                          <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                            No critical compliance or configuration issues were detected.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Decoded Claims Payload */}
                    <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl font-mono text-xs overflow-auto">
                      <h3 className="text-sm font-mono font-bold text-blue-400 mb-2 border-b border-zinc-800/40 pb-2 flex items-center gap-1.5">
                        <Terminal className="w-4 h-4" />
                        Decoded Claims Payload
                      </h3>
                      <pre className="text-xs text-zinc-300 leading-relaxed">
                        {JSON.stringify(payload, null, 2)}
                      </pre>
                    </div>
                  </>
                )}

              </div>
            )}

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Guidance sidebar card */}
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Info className="text-blue-400 w-4 h-4" />
                Inspector Scope
              </h2>
              <ul className="space-y-3.5 list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Parses JWT claim definitions (iss, sub, aud, exp, iat, jti).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Audits token expiration countdowns and flags active lifespan percentages.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Scores token vulnerability thresholds based on cryptographic configurations.
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
