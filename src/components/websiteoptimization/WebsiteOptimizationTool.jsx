"use client";

import { useState } from "react";
import axios from "axios";
import {
  FileDown, CheckCircle2, XCircle, AlertCircle, Clock, FileText,
  Zap, Globe, Database, Eye, EyeOff, Search, Info, Loader2,
  TrendingUp, Shield, Accessibility, Code2, Image, Link2,
} from "lucide-react";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";
import { generateWebsiteOptimizationPDF } from "./generateWebsiteOptimizationPDF";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Parse recommendation emoji prefix into a severity type */
const parseRec = (rec) => {
  if (!rec) return { type: "info", text: rec };
  if (rec.startsWith("🔴")) return { type: "error",   text: rec.replace(/^🔴\s*/, "") };
  if (rec.startsWith("🟡")) return { type: "warning", text: rec.replace(/^🟡\s*/, "") };
  if (rec.startsWith("🎉")) return { type: "success", text: rec.replace(/^🎉\s*/, "") };
  if (rec.startsWith("ℹ️")) return { type: "info",    text: rec.replace(/^ℹ️\s*/, "") };
  return { type: "info", text: rec };
};

/** Tailwind colour classes for a numeric score 0–100 */
const scoreColour = (v) =>
  v >= 80 ? "text-emerald-400" : v >= 50 ? "text-amber-400" : "text-rose-400";

/** Return/missing display */
const val = (v, fallback = "—") =>
  v !== undefined && v !== null && v !== "" ? String(v) : fallback;

/** Boolean badge */
const boolBadge = (v, trueLabel = "Yes", falseLabel = "No") =>
  v ? `✅ ${trueLabel}` : `❌ ${falseLabel}`;

// ─────────────────────────────────────────────────────────────────────────────
// SCORE RING  (Bug F-4 fix: viewBox added; Bug F-5 fix: valid Tailwind sizes)
// ─────────────────────────────────────────────────────────────────────────────
function ScoreRing({ label, value, icon: Icon }) {
  const colour = scoreColour(value ?? 0);
  const R = 45;
  const circumference = 2 * Math.PI * R;
  const offset = circumference - ((value ?? 0) / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      {Icon && <Icon className={`w-4 h-4 ${colour}`} />}
      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 text-center">
        {label}
      </span>
      {/* viewBox added (Bug F-4); w/h use valid Tailwind classes (Bug F-5) */}
      <div className="relative w-24 h-24">
        <svg
          className="w-24 h-24 -rotate-90"
          viewBox="0 0 112 112"
          aria-label={`${label}: ${value ?? 0} out of 100`}
        >
          <circle
            className="text-zinc-800"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r={R}
            cx="56"
            cy="56"
          />
          <circle
            className={colour}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={R}
            cx="56"
            cy="56"
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-lg font-bold font-mono ${colour}`}>
          {value ?? "—"}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// METRIC CARD  (small coloured tile used in the 2×2 grids)
// ─────────────────────────────────────────────────────────────────────────────
function MetricCard({ icon: Icon, label, value, good }) {
  const colour =
    good === true  ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" :
    good === false ? "text-rose-400 border-rose-500/20 bg-rose-500/5" :
                     "text-amber-400 border-amber-500/20 bg-amber-500/5";
  return (
    <div className={`flex flex-col p-4 rounded-xl border ${colour}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span className="text-[10px] uppercase tracking-wider font-mono opacity-85">{label}</span>
      </div>
      <span className="text-sm font-mono font-bold mt-0.5">{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION CARD  (collapsible content card with a header)
// ─────────────────────────────────────────────────────────────────────────────
function SectionCard({ icon: Icon, title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.15)] hover:border-emerald-500/10 transition-all duration-300">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 focus:outline-none"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
          <Icon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          {title}
        </span>
        <span className={`text-zinc-500 text-xs font-mono transition-transform duration-200 ${open ? "rotate-180" : ""}`}>▲</span>
      </button>
      {open && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA TABLE  (two-column key/value table)
// ─────────────────────────────────────────────────────────────────────────────
function DataTable({ rows }) {
  return (
    <div className="divide-y divide-zinc-800/50 rounded-xl overflow-hidden border border-zinc-800/50">
      {rows.map(([key, value, status]) => (
        <div key={key} className="flex items-start justify-between gap-4 px-4 py-2.5 bg-zinc-900/20 hover:bg-zinc-900/40 transition-colors">
          <span className="text-[11px] font-mono text-zinc-500 whitespace-nowrap flex-shrink-0 pt-0.5">{key}</span>
          <span className={`text-[11px] font-mono text-right break-all ${
            status === "good"    ? "text-emerald-400" :
            status === "bad"     ? "text-rose-400"    :
            status === "warning" ? "text-amber-400"   :
                                   "text-zinc-300"
          }`}>{value}</span>
        </div>
      ))}
    </div>
  );
}

// PDF helper functions removed. Replaced by generateWebsiteOptimizationPDF.js

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function WebsiteOptimizationTool() {
  const [url, setUrl]         = useState("");
  const [info, setInfo]       = useState("");
  const [result, setResult]   = useState(null);
  const [showRaw, setShowRaw] = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(null);
  const protection            = useProtectedAction();

  // ── PDF download using Unified PDF Reporting Framework ────────────────────
  const downloadPDF = async () => {
    if (!result) return;
    await generateWebsiteOptimizationPDF(result, setPdfProgress);
  };

  // ── URL validation — Bug F-1 fix: use URL() parse, not just startsWith ────
  const validateUrl = (raw) => {
    const trimmed = raw.trim();
    if (!trimmed) return "Please enter a URL.";
    // Prepend https:// if no scheme given to allow pasting bare domains
    const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    try {
      const parsed = new URL(withScheme);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return "Only http and https URLs are supported.";
      }
      if (!parsed.hostname || parsed.hostname.length < 2) {
        return "Please enter a valid hostname.";
      }
      return null; // valid
    } catch {
      return "Invalid URL format. Example: https://example.com";
    }
  };

  // ── Scan handler ──────────────────────────────────────────────────────────
  const handleScan = async () => {
    const validationError = validateUrl(url);
    if (validationError) {
      setError(validationError);
      setInfo("");
      setResult(null);
      return;
    }

    await protection(async (userToken) => {
      try {
        setLoading(true);
        setError("");
        setInfo("");
        setResult(null);

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/website-optimization`,
          { url: url.trim() },
          { headers: { Authorization: `Bearer ${userToken}` } }
        );

        setInfo(response.data.message);
        setResult(response.data.data);
      } catch (err) {
        // Bug F-2 fix: differentiate error messages
        const status = err.response?.status;
        const msg    = err.response?.data?.error;
        if (status === 401 || status === 403) {
          setError("Authentication error. Please sign in again.");
        } else if (msg?.toLowerCase().includes("timed out")) {
          setError("The target site did not respond within 15 seconds. It may be slow or blocking automated requests.");
        } else if (msg?.toLowerCase().includes("unable to reach") || msg?.toLowerCase().includes("failed to fetch")) {
          setError("Could not reach the target site. Check the URL and ensure the site is publicly accessible.");
        } else if (msg?.toLowerCase().includes("internal network")) {
          setError("Scanning internal network addresses is not permitted.");
        } else {
          setError(msg || "Something went wrong. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    });
  };

  // ── Derived display values from result ────────────────────────────────────
  const sh = result?.securityHeaders || {};
  const se = result?.seoExtended     || {};
  const ac = result?.accessibility   || {};
  const rh = result?.resourceHints   || {};
  const hs = se.headingStructure     || {};

  const compressionLabel = result?.compression && result.compression !== "None"
    ? result.compression : "Disabled";
  const cachingLabel     = result?.caching ? "Active" : "Missing";

  return (
    <div
      className="tool-detail-page min-h-screen"
      style={{
        "--hero-ambient-a": "rgba(16, 185, 129, 0.08)",
        "--hero-ambient-b": "rgba(16, 185, 129, 0.03)",
        "--gold": "#10b981",
      }}
    >
      <div className="tool-detail-shell">
        {/* Top Badge */}
        <div className="flex justify-end mb-8">
          <span className="rounded-full border border-emerald-500/30 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-emerald-400">
            Green Team
          </span>
        </div>

        {/* Title */}
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="h-8 w-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              WEBSITE <span className="text-emerald-400">OPTIMIZATION</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base">
              Analyze performance, security headers, technical SEO, accessibility, and resource optimization.
            </p>
          </div>
        </div>

        {/* Layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">

          {/* ── LEFT COLUMN ── */}
          <div className="space-y-6">

            {/* Input card */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-emerald-500/10 transition-all duration-300">
              <h2 className="text-base font-mono font-medium text-zinc-100 mb-5 flex items-center gap-2">
                <Search className="h-4 w-4 text-emerald-400" />
                Performance Auditor
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="webopt-target-url" className="block text-xs uppercase tracking-widest font-mono text-zinc-400 mb-2 font-semibold">
                    Target Website URL
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      id="webopt-target-url"
                      type="text"
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !loading && handleScan()}
                      disabled={loading}
                      className="w-full pl-10 bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 focus:outline-none transition-all placeholder:text-zinc-600 font-mono"
                    />
                  </div>
                </div>
                <button
                  onClick={handleScan}
                  disabled={loading || !url.trim()}
                  className="w-full bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/50 rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-40 disabled:pointer-events-none"
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing…</>
                  ) : (
                    <><Search className="h-4 w-4" /> Run Audit</>
                  )}
                </button>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center p-10 bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl animate-pulse">
                <Loader2 className="h-8 w-8 text-emerald-400 animate-spin mb-4" />
                <p className="text-emerald-400 font-mono font-bold text-xs uppercase tracking-widest text-center">
                  Running optimization audit…
                </p>
                <span className="text-[10px] text-zinc-500 font-mono mt-2 text-center">
                  Checking headers · SEO · security · accessibility · resources
                </span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-rose-500/25 bg-rose-500/5 p-4 text-rose-400">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider mb-1">Audit Failed</div>
                    <div className="text-xs text-rose-300">{error}</div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Results ── */}
            {result && !loading && (
              <div className="space-y-6">

                {/* Cache notice — Task 23 */}
                {result.isCached && (
                  <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-3.5 flex items-start gap-3">
                    <Info className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs font-mono text-amber-300">
                      <span className="font-bold uppercase tracking-wider">Cached Result</span> — This report was generated{" "}
                      {result.cachedAt
                        ? new Date(result.cachedAt).toLocaleString()
                        : "previously"}{" "}
                      and is served from cache (TTL 24 h). Re-scan after the TTL expires for fresh data.
                    </div>
                  </div>
                )}

                {/* 4 Score rings — Task 16 (Bug F-4: viewBox; Bug F-5: valid Tailwind) */}
                <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_12px_40px_rgb(0,0,0,0.2)] hover:border-emerald-500/10 transition-all duration-300">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-6">
                    Scores Overview
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 justify-items-center">
                    <ScoreRing label="Performance"   value={result.score}             icon={TrendingUp}   />
                    <ScoreRing label="SEO"           value={result.seoScore}          icon={Search}       />
                    <ScoreRing label="Security"      value={result.securityScore}     icon={Shield}       />
                    <ScoreRing label="Accessibility" value={result.accessibilityScore}icon={Accessibility}/>
                  </div>
                </div>

                {/* Quick metrics grid */}
                <div className="grid grid-cols-2 gap-4">
                  <MetricCard
                    icon={Clock}
                    label="Response Time"
                    value={`${result.loadTimeMs} ms`}
                    good={result.loadTimeMs < 500 ? true : result.loadTimeMs < 1500 ? null : false}
                  />
                  <MetricCard
                    icon={FileText}
                    label="Page Size"
                    value={`${result.pageSizeKB} KB`}
                    good={result.pageSizeKB < 200 ? true : result.pageSizeKB < 512 ? null : false}
                  />
                  <MetricCard
                    icon={Zap}
                    label="Compression"
                    value={compressionLabel}
                    good={result.compression && result.compression !== "None" ? true : false}
                  />
                  <MetricCard
                    icon={Database}
                    label="Caching"
                    value={cachingLabel}
                    good={result.caching}
                  />
                </div>

                {/* Security Headers — Task 17 */}
                <SectionCard icon={Shield} title="Security Headers">
                  <DataTable rows={[
                    ["Content-Security-Policy",   val(sh.csp?.value),               sh.csp?.present ? "good" : "bad"],
                    ["Strict-Transport-Security", val(sh.hsts?.value),              sh.hsts?.present ? "good" : "bad"],
                    ["X-Frame-Options",           val(sh.xFrameOptions?.value),     sh.xFrameOptions?.present ? "good" : "bad"],
                    ["X-Content-Type-Options",    val(sh.xContentTypeOpts?.value),  sh.xContentTypeOpts?.present ? "good" : "bad"],
                    ["Referrer-Policy",           val(sh.referrerPolicy?.value),    sh.referrerPolicy?.present ? "good" : "bad"],
                    ["Permissions-Policy",        val(sh.permissionsPolicy?.value), sh.permissionsPolicy?.present ? "good" : "bad"],
                    ["X-XSS-Protection",          val(sh.xXssProtection?.value),    sh.xXssProtection?.present ? "good" : "bad"],
                  ]} />
                </SectionCard>

                {/* Extended SEO — Task 17 */}
                <SectionCard icon={Search} title="Technical SEO">
                  <DataTable rows={[
                    ["Title",               val(se.title, "Missing"),                   se.title ? (se.titleLength >= 10 && se.titleLength <= 70 ? "good" : "warning") : "bad"],
                    ["Title Length",        se.titleLength ? `${se.titleLength} chars` : "—", se.titleLength >= 10 && se.titleLength <= 70 ? "good" : "warning"],
                    ["Meta Description",    se.description ? `${se.description.substring(0,60)}…` : "Missing", se.description ? "good" : "bad"],
                    ["Desc Length",         se.descLength ? `${se.descLength} chars` : "—",  se.descLength >= 50 && se.descLength <= 160 ? "good" : "warning"],
                    ["Canonical URL",       val(se.canonical, "Missing"),               se.canonical ? "good" : "bad"],
                    ["H1 Tag",              se.hasH1 ? `Present (${se.h1Count})` : "Missing", se.hasH1 ? (se.h1Count === 1 ? "good" : "warning") : "bad"],
                    ["Heading Structure",   `H1:${hs.h1||0} H2:${hs.h2||0} H3:${hs.h3||0} H4:${hs.h4||0}`, ""],
                    ["Heading Skips",       se.headingSkip ? "Detected" : "None",       se.headingSkip ? "bad" : "good"],
                    ["Open Graph Title",    boolBadge(se.hasOgTitle),                   se.hasOgTitle ? "good" : "warning"],
                    ["Open Graph Desc",     boolBadge(se.hasOgDescription),             se.hasOgDescription ? "good" : "warning"],
                    ["Open Graph Image",    boolBadge(se.hasOgImage),                   se.hasOgImage ? "good" : "warning"],
                    ["Twitter Card",        boolBadge(se.hasTwitterCard),               se.hasTwitterCard ? "good" : "warning"],
                    ["JSON-LD Data",        boolBadge(se.hasJsonLd),                    se.hasJsonLd ? "good" : "warning"],
                    ["robots.txt",          se.robotsTxt === "found" ? "✅ Found" : se.robotsTxt === "error" ? "⚠️ Error" : "❌ Not Found", se.robotsTxt === "found" ? "good" : "bad"],
                    ["sitemap.xml",         se.sitemapXml === "found" ? "✅ Found" : se.sitemapXml === "error" ? "⚠️ Error" : "❌ Not Found", se.sitemapXml === "found" ? "good" : "bad"],
                    ["Lang Attribute",      val(se.langAttr, "Missing"),                se.langAttr ? "good" : "bad"],
                    ["HTTPS",               boolBadge(se.isHttpsUrl),                   se.isHttpsUrl ? "good" : "bad"],
                    ["Redirect Chain",      `${se.redirectChain ?? 0} redirect(s)`,     (se.redirectChain ?? 0) <= 1 ? "good" : "warning"],
                    ["Images Missing Alt",  String(se.imagesWithoutAlt ?? 0),           (se.imagesWithoutAlt ?? 0) === 0 ? "good" : "bad"],
                    ["Images Empty Alt",    `${se.imagesWithEmptyAlt ?? 0} (decorative — valid)`, ""],
                  ]} />
                </SectionCard>

                {/* Accessibility — Task 17 */}
                <SectionCard icon={Accessibility} title="Accessibility">
                  <DataTable rows={[
                    ["HTML Lang",           val(ac.langAttr, "Missing"),              ac.langAttr ? "good" : "bad"],
                    ["Skip Nav Link",       boolBadge(ac.hasSkipLink),                ac.hasSkipLink ? "good" : "warning"],
                    ["ARIA Landmarks",      String(ac.ariaLandmarks ?? 0),            (ac.ariaLandmarks ?? 0) > 0 ? "good" : "bad"],
                    ["Unlabelled Inputs",   String(ac.formInputsWithoutLabel ?? 0),   (ac.formInputsWithoutLabel ?? 0) === 0 ? "good" : "bad"],
                    ["Images Missing Alt",  String(ac.imagesWithoutAlt ?? 0),         (ac.imagesWithoutAlt ?? 0) === 0 ? "good" : "bad"],
                    ["Heading Skips",       ac.headingSkips ? "Detected" : "None",    ac.headingSkips ? "bad" : "good"],
                    ["Buttons No Text",     String(ac.buttonsMissingText ?? 0),       (ac.buttonsMissingText ?? 0) === 0 ? "good" : "bad"],
                    ["Links No Text",       String(ac.linksMissingText ?? 0),         (ac.linksMissingText ?? 0) === 0 ? "good" : "warning"],
                  ]} />
                </SectionCard>

                {/* Resource Optimization — Task 17 */}
                <SectionCard icon={Code2} title="Resource Optimization">
                  <DataTable rows={[
                    ["Total Images",          String(rh.totalImages ?? 0),                           ""],
                    ["Lazy-Loaded Images",    `${rh.lazyLoadedImages ?? 0} / ${rh.totalImages ?? 0}`,(rh.totalImages > 5 && (rh.lazyLoadedImages ?? 0) === 0) ? "warning" : "good"],
                    ["Next-Gen Images",       `${rh.nextGenImages ?? 0} (WebP / AVIF)`,              (rh.nextGenImages ?? 0) > 0 ? "good" : "warning"],
                    ["Inline Scripts",        String(rh.inlineScripts ?? 0),                        (rh.inlineScripts ?? 0) > 5 ? "warning" : "good"],
                    ["Inline Style Attrs",    String(rh.inlineStyles ?? 0),                         (rh.inlineStyles ?? 0) > 10 ? "warning" : "good"],
                    ["Render-Blocking CSS",   String(rh.renderBlockingCss ?? 0),                    (rh.renderBlockingCss ?? 0) > 3 ? "warning" : "good"],
                    ["Preloaded Fonts",       String(rh.preloadedFonts ?? 0),                       (rh.preloadedFonts ?? 0) > 0 ? "good" : "warning"],
                  ]} />
                </SectionCard>

                {/* Recommendations */}
                <SectionCard icon={AlertCircle} title="Recommendations">
                  {result.recommendations?.length > 0 ? (
                    <div className="space-y-2.5">
                      {result.recommendations.map((rec, i) => {
                        const p = parseRec(rec);
                        return (
                          <div key={i} className="flex items-start gap-3 bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-3">
                            {p.type === "error"   && <XCircle      className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />}
                            {p.type === "warning" && <AlertCircle  className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />}
                            {p.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />}
                            {p.type === "info"    && <Info         className="w-4 h-4 text-sky-400 mt-0.5 flex-shrink-0" />}
                            <span className="text-xs font-mono text-zinc-300 leading-relaxed">{p.text}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-emerald-400 text-xs font-mono">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                      <span>No critical recommendations — the page meets baseline optimization standards.</span>
                    </div>
                  )}
                </SectionCard>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={downloadPDF}
                    disabled={pdfProgress !== null}
                    className="w-full bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/50 px-4 py-3 rounded-xl font-mono font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {pdfProgress ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> {pdfProgress}</>
                    ) : (
                      <><FileDown className="w-4 h-4" /> Download PDF Report</>
                    )}
                  </button>
                  <button
                    onClick={() => setShowRaw((v) => !v)}
                    className="w-full bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/50 px-4 py-3 rounded-xl font-mono font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] focus:outline-none cursor-pointer"
                  >
                    {showRaw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showRaw ? "Hide Raw Report" : "View Raw Report"}
                  </button>
                </div>

                {showRaw && info && (
                  <pre className="whitespace-pre-wrap rounded-xl border border-zinc-800/80 bg-black p-4 text-xs font-mono text-emerald-500 overflow-x-auto shadow-inner">
                    {info}
                  </pre>
                )}

              </div>
            )}
          </div>

          {/* ── RIGHT SIDEBAR — Task 20 (accurate scope description) ── */}
          <div className="space-y-6">

            {/* What this tool checks */}
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Info className="h-4 w-4 text-emerald-400" />
                Audit Scope
              </h4>
              <ul className="space-y-3 list-none pl-0">
                {[
                  "Measures server response time and HTML document size.",
                  "Detects Gzip / Brotli compression on the HTML response.",
                  "Validates Cache-Control directives (rejects no-store / no-cache).",
                  "Checks all 7 security response headers (CSP, HSTS, X-Frame-Options, etc.).",
                  "Audits title, description, canonical, Open Graph, Twitter Cards, JSON-LD.",
                  "Fetches /robots.txt and /sitemap.xml to verify their presence.",
                  "Inspects heading hierarchy (H1–H6) and detects heading level skips.",
                  "Checks ARIA landmarks, form labels, skip links, and button/link text.",
                  "Detects lazy-loaded images, WebP/AVIF usage, and render-blocking CSS.",
                  "Generates a 4-score report: Performance · SEO · Security · Accessibility.",
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/60 mt-1.5 flex-shrink-0" />
                    <span className="text-xs text-zinc-400 leading-relaxed">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Response time benchmarks */}
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-400" />
                Response Time Benchmarks
              </h4>
              <p className="text-[10px] text-zinc-500 font-mono leading-relaxed">
                Measures server-to-server transfer time. Not equivalent to browser FCP / LCP. Use
                Google PageSpeed Insights for real-user Core Web Vitals.
              </p>
              <div className="space-y-2">
                {[
                  { range: "< 500 ms",     label: "Excellent",  color: "text-emerald-400" },
                  { range: "500 – 1199 ms", label: "Acceptable", color: "text-amber-400"  },
                  { range: "≥ 1200 ms",    label: "Slow",       color: "text-rose-400"    },
                ].map(({ range, label, color }) => (
                  <div key={range} className="flex items-center justify-between py-1.5 border-b border-zinc-800/40 last:border-0">
                    <span className={`text-[11px] font-mono font-bold ${color}`}>{range}</span>
                    <span className="text-[11px] text-zinc-500 font-mono">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Score legend */}
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                Score Legend
              </h4>
              <div className="space-y-2">
                {[
                  { range: "80 – 100", label: "Good",       color: "text-emerald-400" },
                  { range: "50 – 79",  label: "Needs Work", color: "text-amber-400"   },
                  { range: "0 – 49",   label: "Poor",       color: "text-rose-400"    },
                ].map(({ range, label, color }) => (
                  <div key={range} className="flex items-center justify-between py-1.5 border-b border-zinc-800/40 last:border-0">
                    <span className={`text-[11px] font-mono font-bold ${color}`}>{range}</span>
                    <span className="text-[11px] text-zinc-500 font-mono">{label}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
          {/* ── END RIGHT SIDEBAR ── */}

        </div>
      </div>
    </div>
  );
}
