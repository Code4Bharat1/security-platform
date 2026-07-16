"use client";

import { useState } from "react";
import {
  Link2,
  Copy,
  Check,
  RefreshCw,
  Info,
  Sliders,
  Shield,
  Clock,
  Globe,
  FileText,
  Download,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import useProtectedAction from "@/components/UseProtectedAction/UseProtectedAction";
import { generateURLShortenerPDF } from "./generateURLShortenerPDF";

export default function UrlShortener() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [copiedResult, setCopiedResult] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(null);

  const protectedAction = useProtectedAction();

  const downloadPDF = async (item = null) => {
    toast.loading("Generating PDF Report...", { id: "pdf-gen" });

    try {
      const data = item
        ? { result: item }
        : { result: { original: originalUrl, short: shortUrl, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }, history };

      await generateURLShortenerPDF(
        data,
        (msg) => {
          if (msg) {
            toast.loading(msg, { id: "pdf-gen" });
          }
        }
      );
      toast.success("PDF report downloaded!", { id: "pdf-gen" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF report", { id: "pdf-gen" });
    }
  };

  const handleShorten = async () => {
    const trimmedUrl = originalUrl.trim();
    if (!trimmedUrl) return;

    let formatted = trimmedUrl;
    if (!/^https?:\/\//i.test(formatted)) {
      formatted = 'https://' + formatted;
    }

    let isValid = false;
    try {
      const parsed = new URL(formatted);
      const hostname = parsed.hostname;
      const isIp = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname);
      if ((parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
          (hostname === 'localhost' || isIp || hostname.includes('.'))) {
        isValid = true;
      }
    } catch (_) {
      isValid = false;
    }

    if (!isValid) {
      setError("❌ Invalid URL. Please enter a valid URL (e.g., https://example.com).");
      setShortUrl("");
      return;
    }

    setLoading(true);
    setError("");
    setShortUrl("");

    const apiBase = process.env.NEXT_PUBLIC_PROD_API_URL || "http://localhost:5000/api";
    const url = `${apiBase.replace("/api", "")}/shorten`;

    await protectedAction(async (userToken) => {
      try {
        const res = await fetch(`${url}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({ originalUrl }),
        });

        const data = await res.json();
        if (res.ok) {
          const professionalUrl = `${url.replace("/shorten", "")}/${data.code}`;
          setShortUrl(professionalUrl);
          
          const now = new Date();
          const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setHistory(prev => [
            {
              original: originalUrl,
              short: professionalUrl,
              code: data.code,
              timestamp
            },
            ...prev
          ]);
          toast.success("Short URL generated successfully!");
        } else {
          setError(data.message || "Failed to shorten URL.");
        }
      } catch (err) {
        setError("❌ Failed to shorten URL.");
      }
    });
    setLoading(false);
  };

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
            <Link2 className="h-8 w-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              URL <span className="text-emerald-400">SHORTENER</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Make your long links short, clean & professional for secure link distribution.
            </p>
          </div>
        </div>

        {/* 2-Column Grid Layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Left Column */}
          <div className="space-y-6 min-w-0">
            {/* Form card */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-emerald-500/10 transition-all duration-300">
              <h2 className="text-lg font-mono font-medium text-zinc-100 mb-6 flex items-center gap-2">
                <Sliders className="text-emerald-400 w-5 h-5" />
                Shortener Settings
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-mono text-zinc-400 mb-2 font-semibold">
                    Target Long URL
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="https://example.com/very-long-path-name"
                      value={originalUrl}
                      onChange={(e) => setOriginalUrl(e.target.value)}
                      className="w-full pl-10 bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3 text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 focus:shadow-[0_0_12px_rgba(16,185,129,0.08)] focus:outline-none transition-all placeholder:text-zinc-600 font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleShorten}
                    disabled={loading || !originalUrl}
                    className="w-full bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/50 py-3.5 px-4 rounded-xl transition-all duration-300 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] focus:outline-none disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="animate-spin w-4 h-4" />
                        Shortening...
                      </>
                    ) : (
                      <>
                        <Link2 className="w-4 h-4" />
                        Generate Short URL
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Results Panel */}
            {shortUrl && (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-emerald-500/10 transition-all duration-300 space-y-4">
                <h2 className="text-lg font-mono font-medium text-zinc-100 border-b border-zinc-800/40 pb-3 flex items-center gap-2">
                  <Shield className="text-emerald-400 w-5 h-5" />
                  Shortener Results
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest font-mono text-zinc-400 mb-2 font-semibold">
                      Shortened Link
                    </label>
                    <div className="flex gap-2">
                      <div className="w-full bg-zinc-900/60 border border-zinc-800 text-emerald-400 font-mono text-sm p-3.5 rounded-xl truncate select-all flex items-center">
                        {shortUrl}
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(shortUrl);
                            setCopiedResult(true);
                            toast.success("Short URL copied!");
                            setTimeout(() => setCopiedResult(false), 1500);
                          } catch {
                            toast.error("Failed to copy.");
                          }
                        }}
                        className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/80 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all flex items-center justify-center flex-shrink-0 cursor-pointer"
                        title="Copy link"
                      >
                        {copiedResult ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadPDF({ original: originalUrl, short: shortUrl, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) })}
                        className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/80 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all flex items-center justify-center flex-shrink-0 cursor-pointer"
                        title="Download PDF Report"
                      >
                        <FileText size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-955/10 text-rose-400 text-xs font-mono">
                {error}
              </div>
            )}

            {/* Session Activity history */}
            {history.length > 0 && (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-emerald-500/10 transition-all duration-300 space-y-5">
                <div className="flex justify-between items-center border-b border-zinc-850 pb-3 mb-2">
                  <h2 className="text-lg font-mono font-medium text-zinc-100 flex items-center gap-2">
                    <Clock className="text-emerald-400 w-5 h-5" />
                    Session History
                  </h2>
                  <button
                    type="button"
                    onClick={() => downloadPDF()}
                    className="px-3 py-1.5 bg-zinc-900/40 hover:bg-emerald-500/5 text-zinc-300 hover:text-emerald-400 border border-zinc-800/80 hover:border-emerald-500/30 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Download Bulk PDF Report"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PDF
                  </button>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4.5 rounded-xl border border-emerald-500/20 bg-emerald-950/10 text-emerald-400 shadow-[inset_0_0_12px_rgba(16,185,129,0.02)] transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between gap-1">
                    <span className="text-[10px] uppercase font-mono tracking-widest !text-black font-semibold">Total Shortened</span>
                    <span className="text-2xl font-bold font-mono !text-black">{history.length}</span>
                  </div>
                  <div className="p-4.5 rounded-xl border border-emerald-500/20 bg-emerald-950/10 text-emerald-400 shadow-[inset_0_0_12px_rgba(16,185,129,0.02)] transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between gap-1">
                    <span className="text-[10px] uppercase font-mono tracking-widest !text-black font-semibold">Redirect Hops</span>
                    <span className="text-xs font-bold font-mono mt-2 !text-black">301 Permanent</span>
                  </div>
                </div>

                {/* Scroll Area List */}
                <div className="max-h-80 overflow-y-auto bg-zinc-950/40 p-4 border border-zinc-800/80 rounded-xl font-mono custom-scrollbar text-xs">
                  <div className="divide-y divide-zinc-800/50">
                    {history.map((item, idx) => (
                      <div key={idx} className="py-3 flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-emerald-500/20 bg-emerald-500/5 text-emerald-400">
                              Active
                            </span>
                            <span className="text-[10px] text-zinc-500">{item.timestamp}</span>
                          </div>
                          <div className="truncate">
                            <a href={item.short} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 hover:underline transition-all truncate select-all">
                              {item.short}
                            </a>
                          </div>
                          <div className="text-[10px] text-zinc-500 break-all whitespace-normal">
                            → {item.original}
                          </div>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(item.short);
                                setCopiedIndex(idx);
                                toast.success("Copied!");
                                setTimeout(() => setCopiedIndex(null), 1500);
                              } catch {
                                toast.error("Failed to copy.");
                              }
                            }}
                            className="p-2 rounded-lg border border-zinc-850 bg-zinc-900/40 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/20 transition-all flex items-center justify-center cursor-pointer"
                            title="Copy link"
                          >
                            {copiedIndex === idx ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadPDF(item)}
                            className="p-2 rounded-lg border border-zinc-850 bg-zinc-900/40 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/20 transition-all flex items-center justify-center cursor-pointer"
                            title="Download PDF Report"
                          >
                            <FileText size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Info className="text-emerald-400 w-4 h-4" />
                Specs & Guidance
              </h4>

              <ul className="space-y-3.5 list-none pl-0">
                {[
                  "Mitigate Phishing: Shortened URLs can hide malicious destinations. Use only for authorized domains.",
                  "Avoid Hops: Multiple redirection chains trigger security blocks by enterprise email filters.",
                  "Traceable Auditing: Session logging enables tracking access patterns for verification.",
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
      </div>
    </div>
  );
}
