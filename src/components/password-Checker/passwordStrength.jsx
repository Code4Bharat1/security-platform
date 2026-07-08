"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Lock,
  Key,
  Copy,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  Info,
  Sliders,
  Shield
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const API_BASE = (process.env.NEXT_PUBLIC_PROD_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");
const ENDPOINT = "/password/analyze";

export default function PasswordCheckerPage() {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [data, setData] = useState(null);
  const [copied, setCopied] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);

  // Clipboard helper
  const copyToClipboard = async (text, setCopiedState) => {
    if (!text) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopiedState(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedState(false), 1500);
    } catch {
      setCopiedState(false);
      toast.error("Failed to copy.");
    }
  };

  // analyze as you type (debounced)
  useEffect(() => {
    const t = setTimeout(async () => {
      setErr(null);
      if (pw === "") {
        setData(null);
        return;
      }
      setLoading(true);
      try {
        const tokenRaw = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const token = tokenRaw ? tokenRaw.replace(/^"|"$/g, "") : "";
        const r = await fetch(`${API_BASE}${ENDPOINT}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ password: pw }),
        });
        const json = await r.json();
        if (!r.ok) throw new Error(json?.message || `HTTP ${r.status}`);
        setData(json);
      } catch (e) {
        setErr(e?.message || "Failed to analyze.");
        setData(null);
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => clearTimeout(t);
  }, [pw]);

  const pct = data ? data.score : 0;
  const label = data ? data.label : "—";

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
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.25);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.45);
        }
      `}</style>

      <div className="tool-detail-shell">
        <Toaster position="top-right" reverseOrder={false} />

        {/* Top Badge */}
        <div className="flex justify-end mb-8">
          <span className="rounded-full border border-emerald-500/30 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-emerald-400">
            Green Team
          </span>
        </div>

        {/* Title Block */}
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl border border-emerald-500/30 overflow-hidden shadow-lg flex-shrink-0 flex items-center justify-center">
            <Lock className="h-8 w-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              PASSWORD <span className="text-emerald-400">STRENGTH</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Evaluate Shannon entropy, brute-force timelines, and character pool completeness in real-time.
            </p>
          </div>
        </div>

        {/* 2 Column Settings and Guidance Layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">

          {/* Left Column */}
          <div className="space-y-6">
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-emerald-500/10 transition-all duration-300">
              <h2 className="text-lg font-mono font-medium text-zinc-100 mb-6 flex items-center gap-2">
                <Sliders className="text-emerald-400 w-5 h-5" />
                <span>Analyzer Settings</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[13px] uppercase tracking-widest font-mono text-zinc-350 font-semibold">
                      Target Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShow(!show)}
                      className="text-xs font-mono text-zinc-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5 focus:outline-none"
                    >
                      {show ? <EyeOff size={13} /> : <Eye size={13} />}
                      {show ? "Mask Characters" : "Show Characters"}
                    </button>
                  </div>

                  <div className="relative flex items-center">
                    <input
                      type={show ? "text" : "password"}
                      value={pw}
                      onChange={(e) => setPw(e.target.value)}
                      className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-4 pr-32 text-base focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 focus:shadow-[0_0_12px_rgba(16,185,129,0.08)] focus:outline-none transition-all placeholder:text-zinc-500 font-mono tracking-wider"
                      placeholder="Type a secure credential..."
                    />

                    <div className="absolute right-2 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(pw, setCopied)}
                        disabled={!pw}
                        className="p-2 rounded-lg border border-zinc-800 bg-zinc-950/80 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none"
                        title="Copy Password"
                      >
                        {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>

                      {pw && (
                        <button
                          type="button"
                          onClick={() => {
                            setPw("");
                            setData(null);
                          }}
                          className="px-2.5 py-2 rounded-lg border border-zinc-800 bg-zinc-950/80 text-xs font-mono text-zinc-400 hover:text-rose-400 hover:border-rose-500/30 transition-all focus:outline-none"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  disabled={loading || !pw}
                  onClick={async () => {
                    setErr(null);
                    setLoading(true);
                    try {
                      const tokenRaw = typeof window !== "undefined" ? localStorage.getItem("token") : null;
                      const token = tokenRaw ? tokenRaw.replace(/^"|"$/g, "") : "";
                      const r = await fetch(`${API_BASE}${ENDPOINT}`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({ password: pw }),
                      });
                      const json = await r.json();
                      if (!r.ok) throw new Error(json?.message || `HTTP ${r.status}`);
                      setData(json);
                      toast.success("Security audit completed!");
                    } catch (e) {
                      setErr(e?.message || "Failed to analyze.");
                      setData(null);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="w-full bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/50 rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-2 focus:ring-offset-black/20 disabled:opacity-40 disabled:pointer-events-none"
                >
                  {loading ? <RefreshCw className="animate-spin w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                  {loading ? "Analyzing..." : "Analyze Password"}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Info className="text-emerald-400 w-4 h-4" />
                Specs & Guidance
              </h2>
              <ul className="space-y-3.5 list-none pl-0">
                {[
                  "Prioritize Length: Make passwords at least 12 to 16 characters long.",
                  "Make Them Unpredictable: Avoid using common words. Instead, string together four to seven random, unrelated words into a memorable passphrase.",
                  "Use a Mix of Characters: Combine uppercase and lowercase letters, numbers, and special symbols (e.g., !@#$%^&*) throughout the password.",
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/60 mt-1.5 flex-shrink-0" />
                    <span className="text-xs text-zinc-400 leading-relaxed">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* Dynamic Analysis Results Section */}
        {pw && (() => {
          const suggestions = [];
          if (data) {
            if ((data.length || 0) < 14) {
              suggestions.push("Increase password length to 14+ characters.");
            }
            if (!data.classes?.symbol) {
              suggestions.push("Add more symbols to expand character pool complexity.");
            }
            if (!data.classes?.upper) {
              suggestions.push("Add uppercase characters for higher entropy.");
            }
            if (!data.classes?.number) {
              suggestions.push("Add numbers to prevent simple character pool brute-forcing.");
            }
            if (data.advice && data.advice.length > 0) {
              data.advice.forEach(adv => {
                if (adv.toLowerCase().includes("repeat") || adv.toLowerCase().includes("sequence")) {
                  suggestions.push("Avoid repeated characters.");
                } else if (adv.toLowerCase().includes("common") || adv.toLowerCase().includes("dictionary")) {
                  suggestions.push("Avoid common words.");
                }
              });
            }
          }

          return (
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-emerald-500/10 transition-all duration-300 space-y-6 animate-[fadeIn_0.3s_ease-out]">
              <h2 className="text-lg font-mono font-medium text-zinc-100 border-b border-zinc-800/40 pb-3 flex items-center gap-2">
                <Shield className="text-emerald-400 w-5 h-5" />
                <span>ANALYSIS RESULTS</span>
              </h2>

              {loading ? (
                <div className="flex items-center justify-center py-6 gap-2 text-sm text-zinc-500 font-mono">
                  <RefreshCw className="animate-spin text-emerald-400" size={16} />
                  Scanning credential strength...
                </div>
              ) : err ? (
                <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-950/10 text-rose-400 text-xs font-mono">
                  Error during analysis: {err}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Stacking score/meter and character badges vertically with nice gap */}
                  <div className="space-y-5">
                    {/* Strength Meter Progress */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-sm font-mono">
                        <span className="text-zinc-350 font-medium">Security Score: {pct}%</span>
                        <span className={`font-bold uppercase tracking-wider ${pct < 35 ? "text-rose-400" : pct < 60 ? "text-amber-400" : pct < 80 ? "text-emerald-400" : "text-green-400"
                          }`}>
                          {label}
                        </span>
                      </div>

                      <div className="h-2.5 w-full rounded-full bg-zinc-900 overflow-hidden p-[1px] border border-zinc-800/40">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${pct < 35 ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]" :
                              pct < 60 ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]" :
                                pct < 80 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" :
                                  "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]"
                            }`}
                          style={{ width: `${Math.max(4, pct)}%` }}
                        />
                      </div>
                    </div>

                    {/* Character Types Section */}
                    <div className="pt-2">
                      <label className="block text-xs uppercase tracking-widest font-mono text-zinc-500 font-semibold mb-2">
                        Character Types
                      </label>
                      <div className="flex flex-wrap gap-2.5">
                        <Badge ok={data?.classes?.lower}>Lowercase</Badge>
                        <Badge ok={data?.classes?.upper}>Uppercase</Badge>
                        <Badge ok={data?.classes?.number}>Numbers</Badge>
                        <Badge ok={data?.classes?.symbol}>Symbols</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-5 border-t border-zinc-850">
                    {/* Score Card */}
                    <div className={
                      pct < 35 ? "p-5 rounded-xl border border-rose-500/20 bg-rose-950/10 text-rose-400 shadow-[inset_0_0_12px_rgba(244,63,94,0.02)] transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between gap-3" :
                      pct < 60 ? "p-5 rounded-xl border border-amber-500/20 bg-amber-950/10 text-amber-400 shadow-[inset_0_0_12px_rgba(245,158,11,0.02)] transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between gap-3" :
                      "p-5 rounded-xl border border-emerald-500/20 bg-emerald-950/10 text-emerald-400 shadow-[inset_0_0_12px_rgba(16,185,129,0.02)] transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between gap-3"
                    }>
                      <div className="flex justify-between items-start">
                        <span className="text-[11px] uppercase font-mono tracking-widest text-zinc-400 font-semibold">Security Score</span>
                        <Shield size={14} className="opacity-60 text-emerald-400" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold font-mono tracking-tight">{pct}%</div>
                        <div className="text-[10px] uppercase font-mono tracking-wider opacity-60 mt-0.5">{label}</div>
                      </div>
                    </div>

                    {/* Entropy Card */}
                    <div className={
                      (data?.entropyBits || 0) < 35 ? "p-5 rounded-xl border border-rose-500/20 bg-rose-950/10 text-rose-400 shadow-[inset_0_0_12px_rgba(244,63,94,0.02)] transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between gap-3" :
                      (data?.entropyBits || 0) < 60 ? "p-5 rounded-xl border border-amber-500/20 bg-amber-950/10 text-amber-400 shadow-[inset_0_0_12px_rgba(245,158,11,0.02)] transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between gap-3" :
                      "p-5 rounded-xl border border-emerald-500/20 bg-emerald-950/10 text-emerald-400 shadow-[inset_0_0_12px_rgba(16,185,129,0.02)] transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between gap-3"
                    }>
                      <div className="flex justify-between items-start">
                        <span className="text-[11px] uppercase font-mono tracking-widest text-zinc-400 font-semibold">Entropy</span>
                        <Sliders size={14} className="opacity-65 text-emerald-400" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold font-mono tracking-tight">{data?.entropyBits || 0} bits</div>
                        <div className="text-[10px] uppercase font-mono tracking-wider opacity-60 mt-0.5 truncate">
                          {(data?.entropyBits || 0) < 35 ? "Low Randomness" : (data?.entropyBits || 0) < 60 ? "Moderate Randomness" : "Excellent Randomness"}
                        </div>
                      </div>
                    </div>

                    {/* Crack Time Card */}
                    <div className={
                      pct < 35 ? "p-5 rounded-xl border border-rose-500/20 bg-rose-955/10 text-rose-400 shadow-[inset_0_0_12px_rgba(244,63,94,0.02)] transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between gap-3" :
                      pct < 60 ? "p-5 rounded-xl border border-amber-500/20 bg-amber-955/10 text-amber-450 shadow-[inset_0_0_12px_rgba(245,158,11,0.02)] transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between gap-3" :
                      "p-5 rounded-xl border border-emerald-500/20 bg-emerald-955/10 text-emerald-455 shadow-[inset_0_0_12px_rgba(16,185,129,0.02)] transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between gap-3"
                    }>
                      <div className="flex justify-between items-start">
                        <span className="text-[11px] uppercase font-mono tracking-widest text-zinc-400 font-semibold">Time To Crack</span>
                        <Lock size={14} className="opacity-65 text-emerald-400" />
                      </div>
                      <div>
                        <div className="text-base font-bold font-mono tracking-tight truncate" title={data?.crackTime?.human}>{data?.crackTime?.human || "—"}</div>
                        <div className="text-[10px] uppercase font-mono tracking-wider opacity-60 mt-0.5">EST. CRACK TIME</div>
                      </div>
                    </div>

                    {/* Length Card */}
                    <div className={
                      (data?.length || 0) < 8 ? "p-5 rounded-xl border border-rose-500/20 bg-rose-950/10 text-rose-400 shadow-[inset_0_0_12px_rgba(244,63,94,0.02)] transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between gap-3" :
                      (data?.length || 0) < 12 ? "p-5 rounded-xl border border-amber-500/20 bg-amber-950/10 text-amber-400 shadow-[inset_0_0_12px_rgba(245,158,11,0.02)] transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between gap-3" :
                      "p-5 rounded-xl border border-emerald-500/20 bg-emerald-950/10 text-emerald-400 shadow-[inset_0_0_12px_rgba(16,185,129,0.02)] transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between gap-3"
                    }>
                      <div className="flex justify-between items-start">
                        <span className="text-[11px] uppercase font-mono tracking-widest text-zinc-400 font-semibold">Length</span>
                        <Key size={14} className="opacity-65 text-emerald-400" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold font-mono tracking-tight">{data?.length || 0} Characters</div>
                        <div className="text-[10px] uppercase font-mono tracking-wider opacity-60 mt-0.5">
                          Recommended: 14+
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Improvement Suggestions Section */}
                  {suggestions.length > 0 && (
                    <div className="pt-5 border-t border-zinc-850 space-y-3">
                      <label className="block text-xs uppercase tracking-widest font-mono text-zinc-400 font-semibold">
                        Improvement Suggestions
                      </label>
                      <ul className="space-y-2.5 pl-1">
                        {suggestions.map((sug, index) => (
                          <li key={index} className="text-xs font-mono text-zinc-300 flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-450 mt-1.5 flex-shrink-0 animate-pulse" />
                            <span>{sug}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}

        {/* Footer info */}
        <footer className="text-[10px] text-zinc-600 font-mono text-center border-t border-zinc-900 pt-6">
          🛡️ Zero-Knowledge Security Policy: Passwords are analyzed in memory only. No raw credentials are ever written to persistent disk or logs.
        </footer>
      </div>

      {/* Cryptographic Specs Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-zinc-900 border border-zinc-850 w-full max-w-2xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Shield className="text-emerald-400 w-5 h-5" />
                <h3 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider">
                  CRYPTOGRAPHIC ENTROPY SPECIFICATION
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-200 transition-colors p-1.5 focus:outline-none font-mono text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="p-5 max-h-[60vh] overflow-auto text-xs bg-zinc-950 text-emerald-400/90 font-mono leading-relaxed custom-scrollbar border-b border-zinc-850 space-y-4">
              <div>
                <span className="text-zinc-500 font-semibold block mb-1 uppercase tracking-wider">// 1. Shannon Entropy Formula</span>
                <p className="text-zinc-300">
                  Entropy measures the randomness of a password based on its length and alphabet size.
                </p>
                <div className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-800/40 my-2 text-emerald-300 text-sm text-center font-bold">
                  E = L × log₂(R)
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Where:<br />
                  • <strong className="text-zinc-200">L</strong> = Password length (number of characters)<br />
                  • <strong className="text-zinc-200">R</strong> = Range of character pool (alphabet size)<br />
                  • <strong className="text-zinc-200">log₂(R)</strong> = Bits of entropy per character
                </p>
              </div>

              <div className="border-t border-zinc-900 pt-3">
                <span className="text-zinc-500 font-semibold block mb-1 uppercase tracking-wider">// 2. Alphabet Size Allocation (R)</span>
                <table className="w-full text-left text-zinc-300 border-collapse text-[11px] mt-2">
                  <thead>
                    <tr className="border-b border-zinc-900 text-zinc-400">
                      <th className="pb-1 font-semibold">Character Class</th>
                      <th className="pb-1 font-semibold text-center">Pool Size (R)</th>
                      <th className="pb-1 font-semibold text-right">Bits/Char</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/40">
                    <tr>
                      <td className="py-1">Lowercase letters [a-z]</td>
                      <td className="py-1 text-center">26</td>
                      <td className="py-1 text-right">~4.70 bits</td>
                    </tr>
                    <tr>
                      <td className="py-1">Uppercase letters [A-Z]</td>
                      <td className="py-1 text-center">26</td>
                      <td className="py-1 text-right">~4.70 bits</td>
                    </tr>
                    <tr>
                      <td className="py-1">Numeric digits [0-9]</td>
                      <td className="py-1 text-center">10</td>
                      <td className="py-1 text-right">~3.32 bits</td>
                    </tr>
                    <tr>
                      <td className="py-1">Special Symbols [ASCII printable]</td>
                      <td className="py-1 text-center">33</td>
                      <td className="py-1 text-right">~5.04 bits</td>
                    </tr>
                    <tr className="font-semibold text-emerald-400">
                      <td className="py-1">Full Alphanumeric + Symbols</td>
                      <td className="py-1 text-center">95</td>
                      <td className="py-1 text-right">~6.57 bits</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="border-t border-zinc-900 pt-3">
                <span className="text-zinc-500 font-semibold block mb-1 uppercase tracking-wider">// 3. Estimated Brute-Force Crack Time</span>
                <p className="text-zinc-300">
                  The time in seconds required to crack a password assuming an attacker guesses 50% of the key space.
                </p>
                <div className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-800/40 my-2 text-emerald-300 text-sm text-center font-bold">
                  T = (2^(E - 1)) / G
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Where:<br />
                  • <strong className="text-zinc-200">E</strong> = Bits of entropy computed<br />
                  • <strong className="text-zinc-200">G</strong> = Guesses per second (guesses/sec)<br />
                  • <strong className="text-emerald-400">10,000,000,000 guesses/sec (10 GH/s)</strong> is assumed (typical GPU array capability).
                </p>
              </div>

              <div className="border-t border-zinc-900 pt-3">
                <span className="text-zinc-500 font-semibold block mb-1 uppercase tracking-wider">// 4. Enterprise Compliance Thresholds</span>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  • <strong className="text-rose-400">&lt; 35 bits</strong>: Weak. Vulnerable to fast dictionary attacks.<br />
                  • <strong className="text-amber-400">35 – 59 bits</strong>: Medium. Decent security, but vulnerable to customized GPU arrays.<br />
                  • <strong className="text-emerald-400">60 – 79 bits</strong>: Strong. Fully compliant for ordinary system credentials.<br />
                  • <strong className="text-green-400">80+ bits</strong>: Very Strong. Resistant to state-sponsored brute-force clusters.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-zinc-900 flex justify-end">
              <button
                onClick={() => setModalOpen(false)}
                className="bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/50 py-2.5 px-4 rounded-xl transition-all duration-300 font-mono font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Acknowledge Spec
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Badge({ ok, children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono transition-all ${ok
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.06)]"
          : "border-zinc-800 bg-zinc-900/40 text-zinc-500"
        }`}
    >
      {ok ? (
        <Check size={12} className="text-emerald-400 flex-shrink-0" />
      ) : (
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 flex-shrink-0" />
      )}
      {children}
    </span>
  );
}
