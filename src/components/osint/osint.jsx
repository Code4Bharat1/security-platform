"use client";
import { useState } from "react";
import {
  ExternalLink,
  Search,
  ShieldAlert,
  Sliders,
  Shield,
  Info,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Database
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";

const getStatusBadge = (status) => {
  const base = "px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider font-semibold border whitespace-nowrap";
  switch (status) {
    case "not_found":
      return `${base} border-emerald-500/20 bg-emerald-500/5 text-emerald-400`;
    case "found":
      return `${base} border-rose-500/20 bg-rose-500/5 text-rose-400`;
    case "invalid":
    case "error":
      return `${base} border-amber-500/20 bg-amber-500/5 text-amber-400`;
    default:
      return `${base} border-zinc-800 bg-zinc-900 text-zinc-400`;
  }
};

export default function OsintTool() {
  const [queryType, setQueryType] = useState("username"); // username | email | phone
  const [queryValue, setQueryValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null); // { success, details, foundOn, ... }
  const [error, setError] = useState("");
  const protectedAction = useProtectedAction();

  const handleCheck = async () => {
    if (!queryValue.trim()) return;
    setLoading(true);
    setResults(null);
    setError("");
    await protectedAction(async (userToken) => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_PROD_API_URL || "http://localhost:5000/api";
        const res = await fetch(
          `${apiBase}/osint/check`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userToken}`,
            },
            body: JSON.stringify({ [queryType]: queryValue }),
          }
        );
        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.message || "Scan failed");
          toast.error("Vulnerability scan failed.");
        } else {
          setResults(data);
          toast.success("Security query completed!");
        }
      } catch (e) {
        setError(e.message || "Network error");
        toast.error("Failed to complete scan.");
      } finally {
        setLoading(false);
      }
    });
  };

  const foundCount = results?.details?.filter(r => r.status === "found").length || 0;
  const notFoundCount = results?.details?.filter(r => r.status === "not_found").length || 0;

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
        .tool-detail-page .scan-button {
          background-color: #10b981 !important;
          color: #000000 !important;
          border-color: #10b981 !important;
        }
        .tool-detail-page .scan-button:hover,
        .tool-detail-page .scan-button:focus,
        .tool-detail-page .scan-button:active {
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
              <Database className="text-emerald-400 w-8 h-8" />
            </div>
            <div>
              <h1 className="font-mono font-bold text-2xl md:text-3xl text-zinc-100 tracking-tight">
                DATA <span className="text-emerald-400">BREACH</span>
              </h1>
              <p className="text-sm text-zinc-350 mt-2 max-w-2xl font-mono leading-relaxed">
                Verify if credential identifiers or profiles appear in public data leaks.
              </p>
            </div>
          </div>
          <div className="hidden sm:block">
            <span className="rounded-full border border-emerald-500/30 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-emerald-400 whitespace-nowrap">
              Green Team
            </span>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left panel: Settings, Scanner, Results */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-emerald-500/10 transition-all duration-300">
              <h2 className="text-lg font-mono font-medium text-zinc-100 mb-6 flex items-center gap-2">
                <Sliders className="text-emerald-400 w-5 h-5" />
                <span>Scan Parameters</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-4">
                  <label className="block text-xs uppercase tracking-widest font-mono text-zinc-400 mb-2 font-semibold">
                    Query Type
                  </label>
                  <select
                    value={queryType}
                    onChange={(e) => setQueryType(e.target.value)}
                    className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3 text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 focus:outline-none transition-all font-mono cursor-pointer"
                  >
                    <option value="username" className="bg-zinc-950 text-zinc-100">Username</option>
                    <option value="email" className="bg-zinc-950 text-zinc-100">Email</option>
                    <option value="phone" className="bg-zinc-950 text-zinc-100">Phone</option>
                  </select>
                </div>

                <div className="sm:col-span-8">
                  <label className="block text-xs uppercase tracking-widest font-mono text-zinc-400 mb-2 font-semibold">
                    Target Value
                  </label>
                  <input
                    type="text"
                    placeholder={`Enter target ${queryType}…`}
                    value={queryValue}
                    onChange={(e) => setQueryValue(e.target.value)}
                    className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3 text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 focus:shadow-[0_0_12px_rgba(16,185,129,0.08)] focus:outline-none transition-all placeholder:text-zinc-600 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-5">
                <button
                  onClick={handleCheck}
                  disabled={loading || !queryValue.trim()}
                  className="scan-button bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/50 py-3.5 px-4 rounded-xl transition-all duration-300 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-2 focus:ring-offset-black/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="animate-spin w-4 h-4" />
                      <span>Scanning…</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Scan Platforms</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-950/10 text-rose-400 text-xs font-mono flex items-start gap-2">
                <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Results Panel */}
            {results && (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-emerald-500/10 transition-all duration-300 space-y-5 animate-[fadeIn_0.3s_ease-out]">
                <h2 className="text-lg font-mono font-medium text-zinc-100 border-b border-zinc-800/40 pb-3 flex items-center gap-2">
                  <Shield className="text-emerald-400 w-5 h-5" />
                  <span>Scan Results</span>
                </h2>

                <div className="text-xs text-zinc-400 font-mono flex gap-2 flex-wrap items-center">
                  <span className="font-semibold text-zinc-300">Target:</span>
                  <span className="px-2 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-zinc-350 uppercase tracking-widest text-[9px]">{results.queryType}</span>
                  <span className="text-zinc-550">→</span>
                  <span className="text-zinc-200 break-all select-all">{results.queryValue}</span>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4.5 rounded-xl border border-emerald-500/20 bg-emerald-950/10 text-emerald-400 shadow-[inset_0_0_12px_rgba(16,185,129,0.02)] transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between gap-1">
                    <span className="text-[9px] uppercase font-mono tracking-widest text-zinc-400 font-semibold">Total Audits</span>
                    <span className="text-xl font-bold font-mono">{results?.details?.length || 0}</span>
                  </div>
                  <div className="p-4.5 rounded-xl border border-rose-500/20 bg-rose-955/10 text-rose-455 shadow-[inset_0_0_12px_rgba(244,63,94,0.02)] transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between gap-1">
                    <span className="text-[9px] uppercase font-mono tracking-widest text-zinc-400 font-semibold">Leaks Found</span>
                    <span className="text-xl font-bold font-mono">{foundCount}</span>
                  </div>
                  <div className="p-4.5 rounded-xl border border-emerald-500/20 bg-emerald-950/10 text-emerald-400 shadow-[inset_0_0_12px_rgba(16,185,129,0.02)] transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between gap-1">
                    <span className="text-[9px] uppercase font-mono tracking-widest text-zinc-400 font-semibold">Clean Checks</span>
                    <span className="text-xl font-bold font-mono">{notFoundCount}</span>
                  </div>
                </div>

                {/* Scroll Area List */}
                <div className="max-h-80 overflow-y-auto bg-zinc-950/40 p-4.5 border border-zinc-800/80 rounded-xl font-mono custom-scrollbar text-xs">
                  <div className="divide-y divide-zinc-800/50">
                    {(results.details || []).map((row, idx) => (
                      <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="font-semibold text-zinc-200 text-sm">
                            {row.platform}
                          </div>
                          <div className="truncate">
                            {row.url ? (
                              <a
                                href={row.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-400 hover:text-emerald-300 hover:underline transition-all truncate select-all inline-flex items-center gap-1"
                              >
                                <span>{row.url}</span>
                                <ExternalLink size={12} className="flex-shrink-0" />
                              </a>
                            ) : (
                              <span className="text-zinc-500 italic text-[11px]">No public endpoint registered</span>
                            )}
                          </div>
                          {row.note && (
                            <div className="text-[10px] text-amber-400 flex items-center gap-1 pt-0.5">
                              <AlertCircle size={10} />
                              <span>{row.note}</span>
                            </div>
                          )}
                          {row.error && (
                            <div className="text-[10px] text-rose-400 flex items-center gap-1 pt-0.5">
                              <ShieldAlert size={10} />
                              <span>Error: {row.error}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          <span className={getStatusBadge(row.status)}>{row.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-[10px] text-zinc-500 font-mono italic">
                  * Note: Some platforms restrict profiles behind API limits or anti-bot measures. Redundant checks may flag as unknown.
                </div>
              </div>
            )}
          </div>

          {/* Right panel: guidance */}
          <div className="lg:col-span-4 bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-emerald-500/10 transition-all duration-300 flex flex-col justify-between h-fit">
            <div>
              <h2 className="text-lg font-mono font-medium text-zinc-100 mb-6 flex items-center gap-2">
                <Info className="text-emerald-400 w-5 h-5" />
                <span>Threat guidance</span>
              </h2>

              <div className="space-y-4 text-xs md:text-sm font-mono text-zinc-300 leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                  <span>
                    <strong className="text-emerald-400 font-semibold">Credential Stuffing:</strong> Breached usernames are matched against common leak catalogs to test reuse.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                  <span>
                    <strong className="text-emerald-400 font-semibold">Dossier Correlation:</strong> Cross-referencing profiles across platforms allows threat modeling.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                  <span>
                    <strong className="text-emerald-400 font-semibold">Mitigation Strategy:</strong> Implement unique randomized passphrases and enable secondary authentication methods (MFA).
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
