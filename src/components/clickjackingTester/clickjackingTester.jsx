                      "use client";

import { useMemo, useRef, useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Lock,
  Unlock,
  FileDown,
  Copy,
  Globe,
  Info,
  Terminal,
  Activity,
  ChevronDown
} from "lucide-react";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";

const API_BASE = (
  (typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_PROD_API_URL &&
    process.env.NEXT_PUBLIC_PROD_API_URL.trim()) ||
  "/api"
).replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

const SeverityBadge = ({ level }) => {
  const map = {
    High: "border-red-500/40 bg-red-500/5 text-red-400",
    Medium: "border-orange-500/40 bg-orange-500/5 text-orange-400",
    Safe: "border-zinc-800 bg-zinc-900/40 text-zinc-350",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold font-mono border uppercase tracking-wider ${
        map[level] || map.Medium
      }`}
    >
      {level || "Medium"}
    </span>
  );
};

const isValidUrl = (urlString) => {
  try {
    const u = new URL(urlString);
    const proto = u.protocol === "http:" || u.protocol === "https:";
    const hostOk =
      u.hostname && u.hostname.includes(".") && u.hostname.length > 1;
    const notLocal =
      !u.hostname.includes("localhost") && !u.hostname.includes("127.0.0.1");
    return proto && hostOk && notLocal;
  } catch {
    return false;
  }
};

const normalizeUrl = (v) => (/^https?:\/\//i.test(v) ? v : `https://${v}`);

const buildErrorText = (data) => {
  if (!data) return "Scan failed.";
  if (data.error) return data.error;
  if (data.reason === "INVALID_LINK")
    return data.message || "Invalid link or page not found.";
  if (data.reason === "UPSTREAM_HTTP_ERROR") {
    return `Site responded ${data.upstreamStatus || ""}`.trim();
  }
  return data.message || "Scan failed.";
};

export default function ClickjackingTester() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("results");
  const reportRef = useRef(null);
  const protectedAction = useProtectedAction();

  const handleTest = async () => {
    const raw = url.trim();
    if (!raw) return setResult({ error: "Please enter a URL to test." });
    const normalized = normalizeUrl(raw);
    if (!isValidUrl(normalized))
      return setResult({ error: "Invalid URL. Example: https://example.com" });

    setLoading(true);
    setResult(null);

    await protectedAction(async (token) => {
      try {
        const { data, status } = await api.post(
          "/clickjacking/jacking",
          { url: normalized },
          {
            headers: { Authorization: `Bearer ${token}` },
            validateStatus: () => true,
          }
        );

        if (status >= 400) {
          setResult({ error: buildErrorText(data) });
          return;
        }

        if (data?.ok === false) {
          setResult({
            error: buildErrorText(data),
            reason: data.reason,
            upstreamStatus: data.upstreamStatus,
          });
          return;
        }

        setResult(data);
        setTab("results");
      } catch (err) {
        let m = "Request failed. Please try again.";
        if (err.code === "ECONNABORTED") m = "Request timed out.";
        setResult({ error: m });
      } finally {
        setLoading(false);
      }
    });
  };

  const onCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  };

  const severity =
    result && result.ok !== false
      ? result?.severity || (result?.isProtected ? "Safe" : "High")
      : undefined;

  const headersInfo = useMemo(() => {
    const h = result?.headers || {};
    return {
      xfoPresent: !!h.hasXfo || !!h.xFrameOptions,
      xfoValue: h.xFrameOptions || null,
      cspFaPresent: !!h.hasCspFrameAncestors || false,
    };
  }, [result]);

  const downloadPdf = () => {
    if (!result || result.ok === false) return;

    const doc = new jsPDF({ unit: "pt" });
    const now = new Date().toLocaleString();

    // Red Team banner style
    doc.setFillColor(18, 18, 18);
    doc.rect(0, 0, 595, 55, "F");

    doc.setTextColor(239, 68, 68);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("CLICKJACKING SECURITY REPORT", 40, 35);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text(`Target: ${result.url || url} | Generated: ${now}`, 40, 48);

    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    doc.text(`Overall Severity: ${severity || "—"}`, 40, 85);

    autoTable(doc, {
      startY: 105,
      head: [["Check", "Status", "Details"]],
      body: [
        [
          "X-Frame-Options",
          headersInfo.xfoPresent ? "Present" : "Missing",
          headersInfo.xfoValue || "—",
        ],
        [
          "CSP frame-ancestors",
          headersInfo.cspFaPresent ? "Present" : "Missing",
          headersInfo.cspFaPresent ? "Directive found" : "—",
        ],
      ],
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [239, 68, 68] },
    });

    const pmY = (doc.lastAutoTable?.finalY || 105) + 20;
    doc.text("Protection Mechanisms Detected:", 40, pmY);
    const lines = (
      Array.isArray(result?.protectedBy) ? result.protectedBy : ["None"]
    ).join("\n");
    doc.setFontSize(9);
    doc.text(lines || "None", 40, pmY + 18);

    const recStart = pmY + 18 + 14 * (lines.split("\n").length || 1) + 20;
    doc.setFontSize(11);
    doc.text("Recommendations:", 40, recStart);

    const recs = Array.isArray(result?.recommendations) ? result.recommendations : [];
    let y = recStart + 18;
    if (recs.length === 0) {
      doc.setFontSize(9);
      doc.text("No recommendations. Site appears protected.", 40, y);
    } else {
      recs.forEach((r, idx) => {
        doc.setFontSize(10);
        doc.text(`${idx + 1}. ${r.title} (${r.priority || "info"})`, 40, y);
        y += 14;
        doc.setFontSize(9);
        const exp = doc.splitTextToSize(r.explain || "", 515);
        doc.text(exp, 50, y);
        y += exp.length * 12 + 6;
        if (r.snippet) {
          const sn = doc.splitTextToSize(r.snippet, 515);
          doc.setFont("courier", "normal");
          doc.text(sn, 50, y);
          doc.setFont("helvetica", "normal");
          y += sn.length * 12 + 8;
        }
        y += 6;
        if (y > 760 && idx < recs.length - 1) {
          doc.addPage();
          y = 40;
        }
      });
    }

    doc.save("clickjacking_security_report.pdf");
  };

  const serverSnippets = {
    Apache: `# X-Frame-Options
Header always append X-Frame-Options SAMEORIGIN

# Content Security Policy
Header always set Content-Security-Policy "frame-ancestors 'self';"`,
    Nginx: `# In server block
add_header X-Frame-Options "SAMEORIGIN" always;
add_header Content-Security-Policy "frame-ancestors 'self';" always;`,
    "Express.js": `// app.js
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Content-Security-Policy', "frame-ancestors 'self'");
  next();
});`,
    "Next.js": `// next.config.js (headers)
async headers() {
  return [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
      ],
    },
  ];
}`,
    Django: `# settings.py
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_HSTS_SECONDS = 0

# Middleware
def frame_headers(get_response):
    def middleware(request):
        response = get_response(request)
        response['X-Frame-Options'] = 'SAMEORIGIN'
        response['Content-Security-Policy'] = "frame-ancestors 'self'"
        return response
    return middleware`,
  };

  const [serverTab, setServerTab] = useState("Apache");

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

      <div className="tool-detail-shell" ref={reportRef}>
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
              CLICKJACKING <span className="text-red-400">TESTER</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Test target domains against framing vulnerabilities. Audits X-Frame-Options parameters and Content Security Policy frame-ancestors compliance.
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
                <Globe className="h-5 w-5 text-red-400" />
                Target Verification Scope
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                    Website URL
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-650" />
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleTest()}
                      placeholder="https://example.com"
                      className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 pl-12 text-sm focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 focus:shadow-[0_0_12px_rgba(239,68,68,0.08)] focus:outline-none transition-all placeholder:text-zinc-600 font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleTest}
                    disabled={loading || !url.trim()}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-black rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] focus:outline-none disabled:opacity-40"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Scanning framing properties...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 text-black" />
                        Test for Clickjacking
                      </>
                    )}
                  </button>

                  {result && result.ok !== false && !result.error && (
                    <button
                      onClick={downloadPdf}
                      className="px-4 py-4 rounded-xl bg-zinc-900/40 hover:bg-red-500/5 text-zinc-350 hover:text-red-400 border border-zinc-800/80 hover:border-red-500/30 font-mono font-bold text-xs uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FileDown className="w-4 h-4" />
                      PDF Report
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Error outcome block */}
            {result && (result.ok === false || result.error) && (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] space-y-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 border border-red-500/20 bg-red-500/5 rounded-xl flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-mono font-bold text-zinc-200 uppercase tracking-wider">
                      Validation Failed
                    </h3>
                    <p className="text-xs font-mono text-zinc-550 mt-0.5">
                      Unable to resolve target framing configs
                    </p>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-red-500/20 bg-red-955/10 text-red-400 text-xs font-mono">
                  {buildErrorText(result)}
                </div>
              </div>
            )}

            {/* Results Block */}
            {result && !result.error && result.ok !== false && (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.2)] overflow-hidden space-y-6">
                
                {/* Result header banner */}
                <div
                  className={`p-6 border-b border-zinc-900 ${
                    result.isProtected
                      ? "bg-zinc-900/60"
                      : "bg-red-950/20"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 border border-zinc-800/50 bg-zinc-950/40 rounded-xl flex items-center justify-center flex-shrink-0">
                        {result.isProtected ? (
                          <Lock className="w-5 h-5 text-red-400" />
                        ) : (
                          <Unlock className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-mono font-bold text-zinc-100 uppercase tracking-wider">
                          {result.isProtected ? "Protected" : "Vulnerable"}
                        </h3>
                        <p className="text-xs font-mono text-zinc-450 mt-0.5">
                          {result.isProtected
                            ? "Framing capabilities are blocked or safe"
                            : "Target is vulnerable to UI redress exploits"}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {severity && <SeverityBadge level={severity} />}
                    </div>
                  </div>
                </div>

                {/* Tabs selection line */}
                <div className="px-6">
                  <div className="flex gap-2 border-b border-zinc-900 pb-px">
                    {[
                      { key: "results", label: "Overview" },
                      { key: "vulns", label: "Vulnerability Info" },
                      { key: "recs", label: "Fix Snippets" },
                    ].map((t) => (
                      <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`px-4 py-2.5 text-xs font-mono font-semibold transition-all ${
                          tab === t.key
                            ? "border-b-2 border-red-500 text-red-400"
                            : "text-zinc-550 hover:text-zinc-400"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab contents */}
                <div className="p-6 pt-0">
                  {tab === "results" && (
                    <div className="space-y-6">
                      <div className="rounded-xl p-5 border border-zinc-850 bg-zinc-900/40 font-mono text-xs">
                        <div className="text-zinc-550 font-bold uppercase tracking-wider mb-2">
                          Audit Protection Summary
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-lg border font-bold uppercase tracking-wider ${
                              result.isProtected
                                ? "border-zinc-800 bg-zinc-900/40 text-zinc-350"
                                : "border-red-500/40 bg-red-500/5 text-red-400"
                            }`}
                          >
                            {result.isProtected ? "Protected" : "Vulnerable"}
                          </span>
                          {!result.isProtected && (
                            <span className="text-zinc-400">
                              No security frame wrappers detected on target index.
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Header details check cards */}
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider">
                          Response Header Audit
                        </h4>
                        
                        <div className="grid gap-4 sm:grid-cols-2 font-mono text-xs">
                          <div className="flex items-center justify-between border border-zinc-850 bg-zinc-900/40 rounded-xl p-4">
                            <div>
                              <div className="font-semibold text-zinc-350">
                                X-Frame-Options
                              </div>
                              <div className="text-[11px] text-zinc-500 mt-1 break-all">
                                {headersInfo.xfoPresent
                                  ? headersInfo.xfoValue
                                  : "Missing"}
                              </div>
                            </div>
                            <SeverityBadge
                              level={
                                headersInfo.xfoPresent
                                  ? headersInfo.xfoValue?.includes("SAMEORIGIN") || headersInfo.xfoValue?.includes("DENY")
                                    ? "Safe"
                                    : "Medium"
                                  : "High"
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between border border-zinc-850 bg-zinc-900/40 rounded-xl p-4">
                            <div>
                              <div className="font-semibold text-zinc-350">
                                CSP frame-ancestors
                              </div>
                              <div className="text-[11px] text-zinc-500 mt-1">
                                {headersInfo.cspFaPresent
                                  ? "Present"
                                  : "Missing"}
                              </div>
                            </div>
                            <SeverityBadge level={headersInfo.cspFaPresent ? "Safe" : "High"} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {tab === "vulns" && (
                    <div className="rounded-xl p-5 border border-red-500/20 bg-red-955/10 font-mono text-xs space-y-3">
                      <div className="flex items-center gap-2.5">
                        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <h4 className="font-bold text-red-450 uppercase tracking-wide">
                          Vulnerability Status: Redress Risk
                        </h4>
                      </div>
                      <p className="text-zinc-300 leading-relaxed">
                        No active <code>X-Frame-Options</code> parameter or CSP <code>frame-ancestors</code> directive identified in index responses.
                      </p>
                      <p className="text-zinc-400 leading-relaxed border-t border-red-500/10 pt-2">
                        <strong>Threat Vector:</strong> Malicious actors can frame target pages in transparent wrappers to intercept clicks, hijack user actions, and harvest session parameters.
                      </p>
                    </div>
                  )}

                  {tab === "recs" && (
                    <div className="space-y-6">
                      {/* Dynamic recommendations from backend */}
                      {Array.isArray(result.recommendations) &&
                        result.recommendations.length > 0 && (
                          <div className="space-y-4">
                            {result.recommendations.map((rec) => (
                              <div
                                key={rec.id}
                                className="rounded-xl border border-zinc-850 bg-zinc-900/40 p-5 font-mono text-xs space-y-3"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="space-y-1.5">
                                    <div className="font-bold text-zinc-200">
                                      {rec.title}
                                    </div>
                                    <p className="text-zinc-450 leading-relaxed">
                                      {rec.explain}
                                    </p>
                                    {rec.snippet && (
                                      <div className="mt-3 space-y-1.5">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider">
                                            Snippet Override
                                          </span>
                                          <button
                                            onClick={() => onCopy(rec.snippet)}
                                            className="text-red-400 hover:text-red-300 text-[10px] uppercase font-bold inline-flex items-center gap-1 cursor-pointer"
                                          >
                                            <Copy className="w-3.5 h-3.5" />
                                            Copy
                                          </button>
                                        </div>
                                        <pre className="text-xs bg-zinc-950/65 text-red-400 border border-zinc-900 rounded-lg p-3 overflow-x-auto leading-relaxed">
                                          {rec.snippet}
                                        </pre>
                                      </div>
                                    )}
                                  </div>
                                  <span
                                    className={`px-2 py-0.5 inline-flex items-center rounded-lg text-[10px] font-bold border font-mono uppercase tracking-wider flex-shrink-0
                                  ${
                                    rec.priority === "high"
                                      ? "border-red-500/40 bg-red-500/5 text-red-400"
                                      : rec.priority === "medium"
                                      ? "border-orange-500/40 bg-orange-500/5 text-orange-400"
                                      : "border-zinc-800 bg-zinc-900/40 text-zinc-400"
                                  }`}
                                  >
                                    {rec.priority || "info"}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                      {/* Static server snippets fallback */}
                      <div className="rounded-xl border border-zinc-850 bg-zinc-900/40 p-5 font-mono text-xs space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1.5 w-full">
                            <div className="font-bold text-zinc-200">
                              Enforce Frame-Busting Protocols
                            </div>
                            <p className="text-zinc-455">
                              Configure web servers to reject cross-origin iframe embedding actions.
                            </p>
                            <div className="mt-3 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider">
                                  Standard Directive
                                </span>
                                <button
                                  onClick={() => onCopy("X-Frame-Options: SAMEORIGIN")}
                                  className="text-red-400 hover:text-red-300 text-[10px] uppercase font-bold inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                  Copy
                                </button>
                              </div>
                              <pre className="text-xs bg-zinc-950/65 text-red-400 border border-zinc-900 rounded-lg p-3 overflow-x-auto">
                                X-Frame-Options: SAMEORIGIN
                              </pre>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 inline-flex items-center rounded-lg text-[10px] font-bold border border-red-500/40 bg-red-500/5 text-red-400 uppercase tracking-wider flex-shrink-0">
                            High Priority
                          </span>
                        </div>
                      </div>

                      {/* Server Config Tab Panel */}
                      <div className="rounded-xl border border-zinc-850 bg-zinc-900/40 overflow-hidden font-mono text-xs">
                        <div className="border-b border-zinc-900 bg-zinc-950/20 px-4 pt-3">
                          <div className="flex flex-wrap gap-2">
                            {Object.keys(serverSnippets).map((k) => (
                              <button
                                key={k}
                                onClick={() => setServerTab(k)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                  serverTab === k
                                    ? "bg-red-500 text-black font-bold"
                                    : "text-zinc-500 hover:text-zinc-350"
                                }`}
                              >
                                {k}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="p-5 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
                              Config syntax parameter overrides:
                            </div>
                            <button
                              onClick={() => onCopy(serverSnippets[serverTab])}
                              className="text-red-450 hover:text-red-350 text-[10px] uppercase font-bold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              Copy Config
                            </button>
                          </div>
                          <pre className="text-xs bg-zinc-950/65 text-red-400 border border-zinc-900 rounded-lg p-3 overflow-x-auto leading-relaxed">
                            {serverSnippets[serverTab]}
                          </pre>
                        </div>
                      </div>

                    </div>
                  )}
                </div>

              </div>
            )}

          </div>

          {/* Right Column (Guidance) */}
          <div className="space-y-6">
            
            {/* Guidance sidebar card */}
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Info className="text-red-400 w-4 h-4" />
                Tester Guidance
              </h2>
              <ul className="space-y-3.5 list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Audits target domain responsiveness inside custom frames and boundaries.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Verifies X-Frame-Options headers presence and resolves value settings.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Checks frame-ancestors parameters in CSP configurations to block overlay leaks.
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
