"use client";

import { useState } from "react";
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Upload,
  Lock,
  Terminal,
  Activity,
  Info,
  Globe,
  ShieldAlert
} from "lucide-react";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";

export default function DbSecurityChecker() {
  const [form, setForm] = useState({
    dbType: "MongoDB",
    host: "127.0.0.1",
    port: "27017",
    username: "",
    password: "",
    checks: [],
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const protectedAction = useProtectedAction();

  const toggleCheck = (check) => {
    setForm((prev) => ({
      ...prev,
      checks: prev.checks.includes(check)
        ? prev.checks.filter((c) => c !== check)
        : [...prev.checks, check],
    }));
  };

  const runScan = async () => {
    if (!protectedAction) return;

    await protectedAction(async (token) => {
      setLoading(true);
      setResult(null);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/dbscan/scan`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(form),
          }
        );

        const data = await res.json();
        setResult(data);
      } catch (err) {
        console.error("Scan error:", err);
        setResult({ error: err?.message || "Unexpected error" });
      } finally {
        setLoading(false);
      }
    });
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
            <Database className="h-8 w-8 text-red-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              DATABASE SECURITY <span className="text-red-400">CHECKER</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Validate database network configs and safety permissions. Audits credentials, SSL handshakes, and transport layer encryption flags.
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
                Database Access Audit
              </h2>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                      DB Type
                    </label>
                    <select
                      value={form.dbType}
                      onChange={(e) => setForm({ ...form, dbType: e.target.value })}
                      className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 text-sm focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 focus:outline-none transition-all font-mono"
                    >
                      <option className="bg-zinc-950 text-zinc-300">MongoDB</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                      Host / IP Address
                    </label>
                    <input
                      type="text"
                      value={form.host}
                      onChange={(e) => setForm({ ...form, host: e.target.value })}
                      className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 text-sm focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 focus:outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                      Port Number
                    </label>
                    <input
                      type="text"
                      value={form.port}
                      onChange={(e) => setForm({ ...form, port: e.target.value })}
                      className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 text-sm focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 focus:outline-none transition-all font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                      Username
                    </label>
                    <input
                      type="text"
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      placeholder="optional"
                      className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 text-sm focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 focus:outline-none transition-all font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                      Password
                    </label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="optional"
                      className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 text-sm focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 focus:outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 py-2 font-mono text-xs text-zinc-350">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.checks.includes("ssl")}
                      onChange={() => toggleCheck("ssl")}
                      className="w-4.5 h-4.5 text-red-500 focus:ring-red-500 bg-transparent border-zinc-700 rounded"
                    />
                    <span>Audit SSL/TLS config</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.checks.includes("auth")}
                      onChange={() => toggleCheck("auth")}
                      className="w-4.5 h-4.5 text-red-500 focus:ring-red-500 bg-transparent border-zinc-700 rounded"
                    />
                    <span>Verify Authentication state</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.checks.includes("encryption")}
                      onChange={() => toggleCheck("encryption")}
                      className="w-4.5 h-4.5 text-red-500 focus:ring-red-500 bg-transparent border-zinc-700 rounded"
                    />
                    <span>Check storage Encryption status</span>
                  </label>
                </div>

                <button
                  onClick={runScan}
                  disabled={loading}
                  className="w-full bg-red-500 hover:bg-red-600 text-black rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] focus:outline-none disabled:opacity-40"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Auditing database endpoints...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4 text-black" />
                      Run Security Scan
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Results Details */}
            {result && (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] space-y-6">
                
                <h3 className="text-sm font-mono font-bold text-zinc-200 flex items-center gap-2 border-b border-zinc-900 pb-2.5">
                  <Activity className="w-4 h-4 text-red-400" />
                  Database Audit Outcome
                </h3>

                {result.error || result.message ? (
                  <div className="p-4 rounded-xl border border-red-500/20 bg-red-955/10 text-red-400 text-xs font-mono flex items-start gap-2.5">
                    <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <div className="font-bold uppercase tracking-wider">Scan Failed</div>
                      <p className="text-zinc-300">{result.error || result.message}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5 font-mono text-xs">
                    
                    {/* Score breakdown strip */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl p-4 border border-zinc-850 bg-zinc-900/40 text-center">
                        <span className="text-[10px] text-zinc-550 block mb-1">Security Score</span>
                        <span className="text-2xl font-extrabold text-red-450">{result.securityScore} / 100</span>
                      </div>

                      <div className="rounded-xl p-4 border border-zinc-850 bg-zinc-900/40 text-center">
                        <span className="text-[10px] text-zinc-550 block mb-1">Total Flags Found</span>
                        <span className="text-2xl font-extrabold text-zinc-200">{result.issues}</span>
                      </div>
                    </div>

                    {/* Findings checklist */}
                    <div className="space-y-2.5">
                      <span className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider block">Security Findings Checklists</span>
                      <div className="space-y-2">
                        {Array.isArray(result.findings) && result.findings.map((f, i) => (
                          <div
                            key={i}
                            className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                              f.type === "warning"
                                ? "border-red-500/20 bg-red-955/10 text-red-400"
                                : "border-zinc-850 bg-zinc-900/40 text-zinc-350"
                            }`}
                          >
                            {f.type === "warning" ? (
                              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-red-450 mt-0.5 flex-shrink-0" />
                            )}
                            <span className="leading-relaxed">{f.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Remediation suggestions */}
                    {Array.isArray(result.suggestions) && result.suggestions.length > 0 && (
                      <div className="space-y-2.5 border-t border-zinc-900 pt-4">
                        <span className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider block">Fix Suggestions</span>
                        <ul className="space-y-2 list-none pl-0">
                          {result.suggestions.map((s, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-zinc-400">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                              <span className="leading-relaxed">{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

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
                Checker Guidance
              </h2>
              <ul className="space-y-3.5 list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Scans database configurations to map authentication settings.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Verifies target database transport ports security protocols (SSL/TLS verification).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Audits database engines encryption states for database security controls.
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
