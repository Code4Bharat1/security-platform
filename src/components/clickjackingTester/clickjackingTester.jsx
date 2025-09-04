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
} from "lucide-react";

/* ============================== Helpers ============================== */

// Safe API base (falls back to /api if env var is missing)
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
    High: "bg-red-100 text-red-800 border-red-200",
    Medium: "bg-amber-100 text-amber-800 border-amber-200",
    Safe: "bg-emerald-100 text-emerald-800 border-emerald-200",
  };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${
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
    const hostOk = u.hostname && u.hostname.includes(".") && u.hostname.length > 1;
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
  if (data.reason === "INVALID_LINK") return data.message || "Invalid link or page not found.";
  if (data.reason === "UPSTREAM_HTTP_ERROR") {
    return `Site responded ${data.upstreamStatus || ""}`.trim();
  }
  return data.message || "Scan failed.";
};

/* ============================== Component ============================== */

export default function ClickjackingTester() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null); // { ok?: boolean, ... } or { error: string }
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("results"); // results | vulns | recs
  const reportRef = useRef(null);

  const handleTest = async () => {
    const raw = url.trim();
    if (!raw) return setResult({ error: "Please enter a URL to test." });
    const normalized = normalizeUrl(raw);
    if (!isValidUrl(normalized))
      return setResult({ error: "Invalid URL. Example: https://example.com" });

    setLoading(true);
    setResult(null);

    try {
      const { data, status } = await api.post(
        "/clickjacking/jacking",
        { url: normalized },
        { validateStatus: () => true }
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

  /* --------------------------- PDF generation -------------------------- */
  const downloadPdf = () => {
    if (!result || result.ok === false) return;

    const doc = new jsPDF({ unit: "pt" });
    const now = new Date().toLocaleString();

    // Title
    doc.setFontSize(18);
    doc.text("Clickjacking Security Report", 40, 40);
    doc.setFontSize(11);
    doc.text(`Target: ${result.url || url}`, 40, 65);
    doc.text(`Generated: ${now}`, 40, 82);

    // Severity
    doc.setFontSize(12);
    doc.text("Overall Severity:", 40, 110);
    const sevColor =
      severity === "High" ? [200, 0, 0] : severity === "Medium" ? [180, 120, 0] : [0, 120, 80];
    doc.setTextColor(...sevColor);
    doc.text(severity || "—", 160, 110);
    doc.setTextColor(0, 0, 0);

    // Security headers table
    autoTable(doc, {
      startY: 130,
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
      styles: { fontSize: 10 },
      headStyles: { fillColor: [18, 164, 84] },
    });

    // Protection mechanisms
    const pmY = (doc.lastAutoTable?.finalY || 130) + 20;
    doc.setFontSize(12);
    doc.text("Protection Mechanisms Detected:", 40, pmY);
    const lines = (Array.isArray(result?.protectedBy) ? result.protectedBy : ["None"]).join("\n");
    doc.setFontSize(10);
    doc.text(lines || "None", 40, pmY + 18);

    // Recommendations
    const recStart = pmY + 18 + 14 * (lines.split("\n").length || 1) + 20;
    doc.setFontSize(12);
    doc.text("Recommendations:", 40, recStart);

    const recs = Array.isArray(result?.recommendations) ? result.recommendations : [];
    let y = recStart + 18;
    if (recs.length === 0) {
      doc.setFontSize(10);
      doc.text("No recommendations. Site appears protected.", 40, y);
    } else {
      recs.forEach((r, idx) => {
        doc.setFontSize(11);
        doc.text(`${idx + 1}. ${r.title} (${r.priority || "info"})`, 40, y);
        y += 14;
        doc.setFontSize(10);
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

    doc.save("clickjacking-report.pdf");
  };

  /* ------------------------------ Server snippets ----------------------------- */
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

  /* ============================== Render ============================== */

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      <div className="max-w-4xl mx-auto" ref={reportRef}>
        {/* Header */}
        <div className="text-center mb-8">
          <img src="/tools/card-images/clickjacking.png" alt="verify" className="w-16 h-20 mb-4 mt-7" />
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full mb-4 shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Clickjacking Security Tester</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Test websites for clickjacking by checking frame-busting protections
            (X-Frame-Options and CSP <code>frame-ancestors</code>).
          </p>
        </div>

        {/* Input */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-green-100">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Target URL</label>
            <div className="relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTest()}
                placeholder="Enter target URL (e.g. https://example.com)"
                className="w-full border-2 border-green-200 px-4 py-4 pr-12 rounded-xl focus:border-green-500 focus:outline-none transition-all duration-200 text-gray-800 placeholder-gray-500 text-lg"
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTest}
              disabled={loading || !url.trim()}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg flex items-center justify-center gap-3 shadow-lg"
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Testing Security...
                </>
              ) : (
                <>
                  <Shield className="w-6 h-6" />
                  Test for Clickjacking
                </>
              )}
            </button>

            {result && result.ok !== false && !result.error && (
              <button
                onClick={downloadPdf}
                className="px-4 py-4 rounded-xl bg-white border-2 border-green-200 hover:border-green-400 text-green-700 font-semibold flex items-center gap-2"
              >
                <FileDown className="w-5 h-5" />
                Download PDF
              </button>
            )}
          </div>
        </div>

        {/* Results / Errors */}
        {result && (
          <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden">
            {(result.ok === false) || result.error ? (
              <div className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Test Failed</h3>
                    <p className="text-gray-600">Unable to complete the security test</p>
                  </div>
                </div>
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                  <p className="text-red-700 font-medium">
                    {buildErrorText(result)}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Banner */}
                <div
                  className={`p-6 ${
                    result.isProtected
                      ? "bg-gradient-to-r from-green-600 to-emerald-600"
                      : "bg-gradient-to-r from-red-600 to-rose-600"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        {result.isProtected ? (
                          <Lock className="w-6 h-6 text-white" />
                        ) : (
                          <Unlock className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">
                          {result.isProtected ? "Protected" : "Vulnerable"}
                        </h3>
                        <p className="text-white text-opacity-90">
                          {result.isProtected
                            ? "This website has clickjacking protection"
                            : "This website is vulnerable to clickjacking attacks"}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {severity && <SeverityBadge level={severity} />}
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="px-6 pt-4">
                  <div className="flex gap-2 bg-gray-50 rounded-lg p-1 w-full md:w-auto">
                    {[
                      { key: "results", label: "Results" },
                      { key: "vulns", label: "Vulnerabilities" },
                      { key: "recs", label: "Recommendations" },
                    ].map((t) => (
                      <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`px-4 py-2 rounded-md text-sm font-semibold ${
                          tab === t.key
                            ? "bg-white shadow text-gray-900"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab content */}
                <div className="p-6">
                  {tab === "results" && (
                    <div className="space-y-6">
                      <div className="rounded-xl p-6 border-2 bg-gray-50">
                        <div className="text-sm text-gray-700 font-semibold">
                          Protection Level
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${
                              result.isProtected
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                          >
                            {result.isProtected ? "Protection Found" : "No Protection"}
                          </span>
                          {!result.isProtected && (
                            <span className="text-sm text-gray-700">
                              No clickjacking protection detected
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Security Headers */}
                      <div className="rounded-xl border border-gray-200">
                        <div className="px-6 py-4 border-b bg-gray-50 rounded-t-xl">
                          <h4 className="font-semibold text-gray-800">Security Headers</h4>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center justify-between border rounded-lg p-4">
                            <div>
                              <div className="font-medium text-gray-800">X-Frame-Options</div>
                              <div className="text-sm text-gray-600">
                                {headersInfo.xfoPresent ? headersInfo.xfoValue : "Missing"}
                              </div>
                            </div>
                            <SeverityBadge
                              level={
                                headersInfo.xfoPresent
                                  ? headersInfo.xfoValue?.includes("SAMEORIGIN") ||
                                    headersInfo.xfoValue?.includes("DENY")
                                    ? "Safe"
                                    : "Medium"
                                  : "High"
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between border rounded-lg p-4">
                            <div>
                              <div className="font-medium text-gray-800">CSP frame-ancestors</div>
                              <div className="text-sm text-gray-600">
                                {headersInfo.cspFaPresent ? "Present" : "Missing"}
                              </div>
                            </div>
                            <SeverityBadge level={headersInfo.cspFaPresent ? "Safe" : "High"} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {tab === "vulns" && (
                    <div className="rounded-xl p-6 border-2 bg-red-50 border-red-200">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                        <h4 className="text-lg font-bold text-red-800">No Clickjacking Protection</h4>
                      </div>
                      <p className="text-red-700">
                        No <code>X-Frame-Options</code> or CSP <code>frame-ancestors</code> directive found.
                      </p>
                      <p className="text-red-700 mt-2">
                        Impact: Website can be embedded in iframes on any domain.
                      </p>
                    </div>
                  )}

                  {tab === "recs" && (
                    <div className="space-y-6">
                      {/* Smart recommendations from API if present */}
                      {Array.isArray(result.recommendations) && result.recommendations.length > 0 && (
                        <div className="space-y-4">
                          {result.recommendations.map((rec) => (
                            <div key={rec.id} className="rounded-xl border p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <div className="font-semibold text-gray-900">{rec.title}</div>
                                  <p className="text-sm text-gray-600 mt-1">{rec.explain}</p>
                                  {rec.snippet && (
                                    <div className="mt-3">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-semibold text-gray-500">
                                          Header snippet
                                        </span>
                                        <button
                                          onClick={() => onCopy(rec.snippet)}
                                          className="text-gray-600 hover:text-gray-900 text-xs inline-flex items-center gap-1"
                                        >
                                          <Copy className="w-3.5 h-3.5" />
                                          Copy
                                        </button>
                                      </div>
                                      <pre className="text-sm bg-gray-900 text-green-200 rounded-lg p-3 overflow-x-auto">
{rec.snippet}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                                <span
                                  className={`h-7 px-3 inline-flex items-center rounded-full text-xs font-semibold border
                                  ${
                                    rec.priority === "high"
                                      ? "bg-red-50 text-red-700 border-red-200"
                                      : rec.priority === "medium"
                                      ? "bg-amber-50 text-amber-700 border-amber-200"
                                      : "bg-slate-50 text-slate-700 border-slate-200"
                                  }`}
                                >
                                  {rec.priority || "info"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Fixed guidance */}
                      <div className="rounded-xl border p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="font-semibold text-gray-900">Implement Basic Protection</div>
                            <p className="text-sm text-gray-600 mt-1">Add X-Frame-Options header</p>
                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-semibold text-gray-500">Copy value</span>
                                <button
                                  onClick={() => onCopy("X-Frame-Options: SAMEORIGIN")}
                                  className="text-gray-600 hover:text-gray-900 text-xs inline-flex items-center gap-1"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                  Copy
                                </button>
                              </div>
                              <pre className="text-sm bg-gray-900 text-green-200 rounded-lg p-3 overflow-x-auto">
X-Frame-Options: SAMEORIGIN
                              </pre>
                            </div>
                          </div>
                          <span className="h-7 px-3 inline-flex items-center rounded-full text-xs font-semibold border bg-red-50 text-red-700 border-red-200">
                            high priority
                          </span>
                        </div>
                      </div>

                      <div className="rounded-xl border p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="font-semibold text-gray-900">Implement CSP Protection</div>
                            <p className="text-sm text-gray-600 mt-1">
                              Add Content-Security-Policy <code>frame-ancestors</code> directive
                            </p>
                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-semibold text-gray-500">Copy value</span>
                                <button
                                  onClick={() => onCopy("Content-Security-Policy: frame-ancestors 'self'")}
                                  className="text-gray-600 hover:text-gray-900 text-xs inline-flex items-center gap-1"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                  Copy
                                </button>
                              </div>
                              <pre className="text-sm bg-gray-900 text-green-200 rounded-lg p-3 overflow-x-auto">
Content-Security-Policy: frame-ancestors 'self'
                              </pre>
                            </div>
                          </div>
                          <span className="h-7 px-3 inline-flex items-center rounded-full text-xs font-semibold border bg-red-50 text-red-700 border-red-200">
                            high priority
                          </span>
                        </div>
                      </div>

                      {/* Server tabs */}
                      <div className="rounded-xl border">
                        <div className="border-b bg-gray-50 px-4 pt-3">
                          <div className="flex flex-wrap gap-2">
                            {Object.keys(serverSnippets).map((k) => (
                              <button
                                key={k}
                                onClick={() => setServerTab(k)}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                                  serverTab === k ? "bg-white shadow" : "text-gray-600 hover:text-gray-900"
                                }`}
                              >
                                {k}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm text-gray-600">Add to your configuration:</div>
                            <button
                              onClick={() => onCopy(serverSnippets[serverTab])}
                              className="text-gray-600 hover:text-gray-900 text-xs inline-flex items-center gap-1"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              Copy
                            </button>
                          </div>
                          <pre className="text-sm bg-gray-900 text-green-200 rounded-lg p-3 overflow-x-auto">
{serverSnippets[serverTab]}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
