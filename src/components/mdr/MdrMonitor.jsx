"use client";

import React, { useState } from "react";
import { 
  Shield, 
  Terminal, 
  Info, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Loader2
} from "lucide-react";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";

export default function MdrMonitor() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const protectedAction = useProtectedAction();

  const handleMonitor = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setData(null);

    await protectedAction(async (userToken) => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/mdr-monitor`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userToken}`,
            },
            body: JSON.stringify({ url }),
          }
        );

        const json = await res.json();
        setData(json);
      } catch (err) {
        setData({ summary: "Failed to connect to MDR Monitor server." });
      }

      setLoading(false);
    });
  };

  const isAlert = data && (
    data.summary?.includes("Failed") ||
    data.summary?.includes("Unreachable") ||
    data.threatsFound
  );

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
            <Activity className="h-8 w-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              MDR <span className="text-blue-400">MONITOR</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Managed Detection & Response workspace. Monitor live hosts, intercept telemetry logs, audit anomalies, and trigger playbooks to counter cyber threats.
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
                <Activity className="h-5 w-5 text-blue-400" />
                Target Monitor Parameters
              </h2>

              <div className="space-y-4">
                {/* URL Input */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                    Target Website URL
                  </label>
                  <input
                    type="text"
                    placeholder="Enter website URL (e.g. https://example.com)..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value.trim())}
                    className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 text-sm focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 focus:shadow-[0_0_12px_rgba(59,130,246,0.08)] focus:outline-none transition-all placeholder:text-zinc-600 font-mono"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    onClick={handleMonitor}
                    disabled={loading || !url}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-black rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2 focus:ring-offset-black/20 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-black" />
                        Analyzing Host Telemetry...
                      </>
                    ) : (
                      <>
                        <Terminal className="h-4 w-4 text-black" />
                        Start Monitoring
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Results block */}
            {data && (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-blue-500/10 transition-all duration-300 space-y-5">
                
                {/* Alert panel header */}
                <div className={`border rounded-xl p-4 flex items-start gap-3 font-mono text-xs ${
                  isAlert
                    ? "border-red-500/30 bg-red-500/10 text-red-400"
                    : "border-blue-500/30 bg-blue-500/10 text-blue-400"
                }`}>
                  {isAlert ? (
                    <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  ) : (
                    <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <h2 className="text-sm font-mono font-bold uppercase tracking-wider">
                      {isAlert ? "Anomalies/Errors Logged" : "System Reputable"}
                    </h2>
                    <p className="text-[11px] font-mono text-zinc-400 mt-1">
                      {data.summary}
                    </p>
                  </div>
                </div>

                {/* Detailed Logs */}
                {data.results && (
                  <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl font-mono text-xs space-y-3">
                    <h3 className="text-sm font-mono font-bold text-blue-400 mb-2 border-b border-zinc-800/40 pb-2 flex items-center gap-1.5">
                      <Terminal className="w-4 h-4" />
                      MDR Scan Logs
                    </h3>
                    <ul className="space-y-2.5 list-none pl-0">
                      {data.results.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500/60 mt-1.5 flex-shrink-0" />
                          <span className="text-xs text-zinc-300 leading-relaxed font-mono">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
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
                MDR Scope
              </h2>
              <ul className="space-y-3.5 list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Monitors remote web servers and calculates live endpoint vulnerability scores.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Audits TLS, DNS, security headers, and ports configurations for active exploits.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Reports intrusion telemetry to facilitate SOC playbooks execution.
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
