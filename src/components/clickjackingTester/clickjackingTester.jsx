"use client";
import { useMemo, useRef, useState } from "react";
import {
  Shield,
  AlertTriangle,
  XCircle,
  Search,
  Lock,
  Unlock,
  FileDown,
  Copy,
} from "lucide-react";

/* ============================== Helpers ============================== */

// Mock API for demonstration
const mockApi = {
  post: async (endpoint, data) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const url = data.url;
    
    // Mock response based on URL
    if (url.includes('protected')) {
      return {
        data: {
          ok: true,
          url: url,
          isProtected: true,
          severity: "Safe",
          headers: {
            hasXfo: true,
            xFrameOptions: "SAMEORIGIN",
            hasCspFrameAncestors: true
          },
          protectedBy: ["X-Frame-Options", "CSP frame-ancestors"],
          recommendations: []
        },
        status: 200
      };
    } else {
      return {
        data: {
          ok: true,
          url: url,
          isProtected: false,
          severity: "High",
          headers: {
            hasXfo: false,
            xFrameOptions: null,
            hasCspFrameAncestors: false
          },
          protectedBy: [],
          recommendations: [
            {
              id: "xfo",
              title: "Add X-Frame-Options Header",
              priority: "high",
              explain: "Implement X-Frame-Options to prevent clickjacking attacks",
              snippet: "X-Frame-Options: SAMEORIGIN"
            }
          ]
        },
        status: 200
      };
    }
  }
};

const SeverityBadge = ({ level }) => {
  const map = {
    High: "bg-red-500/20 text-red-300 border-red-500/30",
    Medium: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    Safe: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
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
    return proto && hostOk;
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
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("results");
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
      const { data, status } = await mockApi.post(
        "/clickjacking/jacking",
        { url: normalized }
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

  const downloadPdf = () => {
    alert("PDF download functionality - would generate report here");
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
  };

  const [serverTab, setServerTab] = useState("Apache");

  /* ============================== Render ============================== */

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto" ref={reportRef}>
       {/* Header */}
<div className="flex items-center justify-start mb-8 ml-0">
  {/* Image */}
  <img 
    src="/RedTeam/lickjacking.png" 
    alt="Security Scanner" 
    className="w-20 h-20 ml-6 object-contain"
  />

  {/* Text */}
  <div className="text-left">
    <h1 className="text-4xl font-bold text-white mb-3">
      Clickjacking Security Tester
    </h1>
    <p className="text-gray-400 text-lg max-w-2xl">
      Test websites for clickjacking by checking frame-busting protections 
      (X-Frame-Options and CSP frame-ancestors).
    </p>
  </div>
</div>



        {/* Input */}
        <div className="bg-gray-900 rounded-2xl border-2 border-white-700 p-8 mb-8">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-white mb-3">Target URL</label>
            <div className="relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTest()}
                placeholder="https://example.com"
                className="w-full bg-black border-2 border-white-600 px-4 py-4 pr-12 rounded-xl focus:border-red-500 focus:outline-none transition-all duration-200 text-white placeholder-gray-500 text-lg"
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTest}
              disabled={loading || !url.trim()}
              className="flex-1 bg-red-600 text-white px-8 py-4 rounded-xl hover:bg-red-700 disabled:bg-red-600 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  Test for Clickjacking
                </>
              )}
            </button>

            {result && result.ok !== false && !result.error && (
              <button
                onClick={downloadPdf}
                className="px-4 py-4 rounded-xl bg-gray-800 border-2 border-white-600 hover:border-white-500 text-white font-semibold flex items-center gap-2"
              >
                <FileDown className="w-5 h-5" />
                PDF
              </button>
            )}
          </div>
        </div>

        {/* Results / Errors */}
        {result && (
          <div className="bg-gray-900 rounded-2xl border border-white-700 overflow-hidden">
            {(result.ok === false) || result.error ? (
              <div className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-red-900/50 rounded-full flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Test Failed</h3>
                    <p className="text-gray-400">Unable to complete the security test</p>
                  </div>
                </div>
                <div className="bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg">
                  <p className="text-red-300 font-medium">
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
                  <div className="flex gap-2 bg-black rounded-lg p-1 w-full md:w-auto">
                    {[
                      { key: "results", label: "Results" },
                      { key: "vulns", label: "Vulnerabilities" },
                      { key: "recs", label: "Recommendations" },
                    ].map((t) => (
                      <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                          tab === t.key
                            ? "bg-gray-800 text-white"
                            : "text-gray-400 hover:text-white"
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
                      <div className="rounded-xl p-6 border-2 bg-black border-white-700">
                        <div className="text-sm text-gray-300 font-semibold">
                          Protection Level
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${
                              result.isProtected
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                            }`}
                          >
                            {result.isProtected ? "Protection Found" : "No Protection"}
                          </span>
                          {!result.isProtected && (
                            <span className="text-sm text-gray-400">
                              No clickjacking protection detected
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Security Headers */}
                      <div className="rounded-xl border border-white-700">
                        <div className="px-6 py-4 border-b border-white-700 bg-gray-800 rounded-t-xl">
                          <h4 className="font-semibold text-white">Security Headers</h4>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center justify-between border border-white-700 rounded-lg p-4 bg-gray-800">
                            <div>
                              <div className="font-medium text-white">X-Frame-Options</div>
                              <div className="text-sm text-gray-400">
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

                          <div className="flex items-center justify-between border border-white-700 rounded-lg p-4 bg-gray-800">
                            <div>
                              <div className="font-medium text-white">CSP frame-ancestors</div>
                              <div className="text-sm text-gray-400">
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
                    <div className="rounded-xl p-6 border-2 bg-red-900/20 border-red-500/30">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                        <h4 className="text-lg font-bold text-red-300">No Clickjacking Protection</h4>
                      </div>
                      <p className="text-red-300">
                        No <code className="bg-red-900/50 px-1 rounded">X-Frame-Options</code> or CSP <code className="bg-red-900/50 px-1 rounded">frame-ancestors</code> directive found.
                      </p>
                      <p className="text-red-300 mt-2">
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
                            <div key={rec.id} className="rounded-xl border border-white-700 p-4 bg-gray-800">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <div className="font-semibold text-white">{rec.title}</div>
                                  <p className="text-sm text-gray-400 mt-1">{rec.explain}</p>
                                  {rec.snippet && (
                                    <div className="mt-3">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-semibold text-gray-500">
                                          Header snippet
                                        </span>
                                        <button
                                          onClick={() => onCopy(rec.snippet)}
                                          className="text-gray-400 hover:text-white text-xs inline-flex items-center gap-1"
                                        >
                                          <Copy className="w-3.5 h-3.5" />
                                          Copy
                                        </button>
                                      </div>
                                      <pre className="text-sm bg-black text-green-400 rounded-lg p-3 overflow-x-auto">
{rec.snippet}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                                <span
                                  className={`h-7 px-3 inline-flex items-center rounded-full text-xs font-semibold border
                                  ${
                                    rec.priority === "high"
                                      ? "bg-red-500/20 text-red-300 border-red-500/30"
                                      : rec.priority === "medium"
                                      ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                      : "bg-slate-500/20 text-slate-300 border-slate-500/30"
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
                      <div className="rounded-xl border border-white-700 p-4 bg-gray-800">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="font-semibold text-white">Implement Basic Protection</div>
                            <p className="text-sm text-gray-400 mt-1">Add X-Frame-Options header</p>
                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-semibold text-gray-500">Copy value</span>
                                <button
                                  onClick={() => onCopy("X-Frame-Options: SAMEORIGIN")}
                                  className="text-gray-400 hover:text-white text-xs inline-flex items-center gap-1"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                  Copy
                                </button>
                              </div>
                              <pre className="text-sm bg-black text-green-400 rounded-lg p-3 overflow-x-auto">
X-Frame-Options: SAMEORIGIN
                              </pre>
                            </div>
                          </div>
                          <span className="h-7 px-3 inline-flex items-center rounded-full text-xs font-semibold border bg-red-500/20 text-red-300 border-red-500/30">
                            high priority
                          </span>
                        </div>
                      </div>

                      <div className="rounded-xl border border-white-700 p-4 bg-gray-800">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="font-semibold text-white">Implement CSP Protection</div>
                            <p className="text-sm text-gray-400 mt-1">
                              Add Content-Security-Policy <code className="bg-gray-900 px-1 rounded">frame-ancestors</code> directive
                            </p>
                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-semibold text-gray-500">Copy value</span>
                                <button
                                  onClick={() => onCopy("Content-Security-Policy: frame-ancestors 'self'")}
                                  className="text-gray-400 hover:text-white text-xs inline-flex items-center gap-1"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                  Copy
                                </button>
                              </div>
                              <pre className="text-sm bg-black text-green-400 rounded-lg p-3 overflow-x-auto">
Content-Security-Policy: frame-ancestors 'self'
                              </pre>
                            </div>
                          </div>
                          <span className="h-7 px-3 inline-flex items-center rounded-full text-xs font-semibold border bg-red-500/20 text-red-300 border-red-500/30">
                            high priority
                          </span>
                        </div>
                      </div>

                      {/* Server tabs */}
                      <div className="rounded-xl border border-white-700">
                        <div className="border-b border-white-700 bg-gray-800 px-4 pt-3">
                          <div className="flex flex-wrap gap-2">
                            {Object.keys(serverSnippets).map((k) => (
                              <button
                                key={k}
                                onClick={() => setServerTab(k)}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                                  serverTab === k ? "bg-black text-white" : "text-gray-400 hover:text-white"
                                }`}
                              >
                                {k}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm text-gray-400">Add to your configuration:</div>
                            <button
                              onClick={() => onCopy(serverSnippets[serverTab])}
                              className="text-gray-400 hover:text-white text-xs inline-flex items-center gap-1"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Copy
                            </button>
                          </div>
                          <pre className="text-sm bg-black text-green-400 rounded-lg p-3 overflow-x-auto">
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