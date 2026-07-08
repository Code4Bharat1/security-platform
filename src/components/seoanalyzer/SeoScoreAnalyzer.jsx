"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  Globe,
  Search,
  Info,
  Loader2,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
} from "lucide-react";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";

export default function SeoScoreAnalyzer() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const protectedAction = useProtectedAction();

  const strengths =
    result?.summary?.strengths || result?.strengths || [];
  const weaknesses =
    result?.summary?.weaknesses || result?.issues || [];
  const metaDescription =
    result?.metaDescription || result?.description || "N/A";

  const analyzeSEO = async () => {
    if (!url.trim()) {
      setError("Please enter a valid URL");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    let requestStarted = false;
    await protectedAction(async (userToken) => {
      requestStarted = true;
      try {
        const normalizedUrl = /^https?:\/\//i.test(url.trim())
          ? url.trim()
          : `https://${url.trim()}`;
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/seo/analyze`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userToken}`,
            },
            body: JSON.stringify({ url: normalizedUrl }),
          }
        );

        const data = await res.json();

        if (res.ok) {
          setResult(data);
        } else {
          setError(data.message || "Something went wrong!");
        }
      } catch (err) {
        console.log(err);
        setError("Failed to connect with backend!");
      } finally {
        setLoading(false);
      }
    });
    if (!requestStarted) {
      setLoading(false);
    }
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
        .tool-detail-page .bg-black\/30 {
          background:
            radial-gradient(circle at center, rgba(16, 185, 129, 0.04), transparent 55%),
            linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)) !important;
          box-shadow:
            inset 0 0 0 1px rgba(255,255,255,0.01),
            0 0 40px rgba(16, 185, 129, 0.04) !important;
          border-color: rgba(16, 185, 129, 0.12) !important;
        }
      `}</style>

      <div className="tool-detail-shell">
        {/* Top Badge */}
        <div className="flex justify-end mb-8">
          <span className="rounded-full border border-emerald-500/30 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-emerald-400">
            Green Team
          </span>
        </div>

        {/* Title Block */}
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl border border-emerald-500/30 overflow-hidden shadow-lg flex-shrink-0 flex items-center justify-center">
            <TrendingUp className="h-8 w-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              SEO SCORE <span className="text-emerald-400">ANALYZER</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Evaluate metadata tags, headers, image vectors, and crawling parameters to optimize search indexing potential.
            </p>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Input Form Card */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-emerald-500/10 transition-all duration-300">
              <h2 className="text-lg font-mono font-medium text-zinc-100 mb-6 flex items-center gap-2">
                <Search className="h-5 w-5 text-emerald-400" />
                SEO Parameter Scan
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-mono text-zinc-400 mb-2 font-semibold">
                    Target Website URL
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      disabled={loading}
                      className="w-full pl-10 bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 focus:shadow-[0_0_12px_rgba(16,185,129,0.08)] focus:outline-none transition-all placeholder:text-zinc-600 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    onClick={analyzeSEO}
                    disabled={loading || !url.trim()}
                    className="w-full bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/50 rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-2 focus:ring-offset-black/20 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing SEO Tags...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4" />
                        Analyze SEO
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Loading Indicator */}
            {loading && (
              <div className="flex flex-col items-center justify-center p-10 bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.15)] animate-pulse">
                <Loader2 className="h-8 w-8 text-emerald-400 animate-spin mb-4" />
                <p className="text-emerald-400 font-mono font-bold text-xs uppercase tracking-widest text-center">
                  Executing page analysis...
                </p>
                <span className="text-[10px] text-zinc-500 font-mono mt-2 text-center">
                  Parsing headings, image alt descriptors, and social media tags
                </span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="rounded-xl border border-rose-500/25 bg-rose-500/5 p-4 text-rose-400">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider mb-1">Analysis Error</div>
                    <div className="text-xs text-rose-300">{error}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Results Dashboard */}
            {result && !loading && (
              <div className="space-y-6">
                {/* Score Circle Card */}
                <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_12px_40px_rgb(0,0,0,0.2)] hover:border-emerald-500/10 transition-all duration-300 flex flex-col items-center">
                  <h2 className="mb-4 text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                    Overall SEO Score
                  </h2>
                  <div className="relative h-32 w-32">
                    <svg className="h-32 w-32 transform -rotate-90">
                      <circle
                        className="text-zinc-800"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                        r="50"
                        cx="64"
                        cy="64"
                      />
                      <circle
                        className={
                          result.score >= 80
                            ? "text-emerald-400"
                            : result.score >= 50
                            ? "text-amber-400"
                            : "text-rose-400"
                        }
                        strokeWidth="8"
                        strokeDasharray={2 * Math.PI * 50}
                        strokeDashoffset={
                          2 * Math.PI * 50 -
                          ((result.score || 0) / 100) * (2 * Math.PI * 50)
                        }
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="50"
                        cx="64"
                        cy="64"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold font-mono text-zinc-100">
                      {result.score || 0}
                    </span>
                  </div>
                </div>

                {/* Metadata details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-5 hover:border-emerald-500/10 transition-all">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-emerald-400" />
                      Page Title
                    </h3>
                    <p className="text-xs font-mono text-zinc-200 leading-relaxed break-all">
                      {result.title || "N/A"}
                    </p>
                  </div>

                  <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-5 hover:border-emerald-500/10 transition-all">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-2">
                      <Info className="h-4 w-4 text-emerald-400" />
                      Meta Description
                    </h3>
                    <p className="text-xs font-mono text-zinc-200 leading-relaxed break-all">
                      {metaDescription}
                    </p>
                  </div>
                </div>

                {/* Strengths & Weaknesses Checklist */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-zinc-950/20 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-6 shadow-md">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 mb-4 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Strengths
                    </h3>
                    <ul className="space-y-2.5 list-none pl-0">
                      {strengths.length > 0 ? (
                        strengths.map((item, index) => (
                          <li key={index} className="flex items-start gap-2 text-xs font-mono text-zinc-300">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/60 mt-1.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))
                      ) : (
                        <li className="text-xs font-mono text-zinc-500">No parameters checked.</li>
                      )}
                    </ul>
                  </div>

                  <div className="bg-zinc-950/20 backdrop-blur-md border border-rose-500/20 rounded-2xl p-6 shadow-md">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400 mb-4 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Weaknesses / Issues
                    </h3>
                    <ul className="space-y-2.5 list-none pl-0">
                      {weaknesses.length > 0 ? (
                        weaknesses.map((item, index) => (
                          <li key={index} className="flex items-start gap-2 text-xs font-mono text-zinc-300">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500/60 mt-1.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))
                      ) : (
                        <li className="text-xs font-mono text-zinc-500">No issues found.</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Specs & Guidance Sidebar */}
          <div className="space-y-6">
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Info className="h-4 w-4 text-emerald-400" />
                SEO Scan Scope
              </h4>
              <ul className="space-y-3.5 list-none pl-0">
                {[
                  "Evaluates HTML heading hierarchies (H1 through H6 formats).",
                  "Scans semantic markup constraints for proper body content structures.",
                  "Inspects image arrays to find missing descriptive 'alt' tag elements.",
                  "Verifies robots.txt guidelines and sitemap discovery protocols.",
                  "Ensures baseline structural parameters for target page indexes.",
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/60 mt-1.5 flex-shrink-0" />
                    <span className="text-xs text-zinc-400 leading-relaxed">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Score Mappings
              </h4>
              <div className="space-y-2.5">
                {[
                  { range: "80 – 100", label: "Excellent SEO Health", color: "text-emerald-400" },
                  { range: "50 – 79", label: "Needs Improvements", color: "text-amber-400" },
                  { range: "0 – 49", label: "Poor Crawl Potential", color: "text-rose-400" },
                ].map(({ range, label, color }) => (
                  <div key={range} className="flex items-center justify-between py-1.5 border-b border-zinc-800/40 last:border-0">
                    <span className={`text-[11px] font-mono font-bold ${color}`}>{range}</span>
                    <span className="text-[11px] text-zinc-500 font-mono">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
