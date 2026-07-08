"use client";

import { useState } from "react";
import {
  Search,
  Loader2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Shield,
  ShieldAlert,
  Code,
  Globe,
  Info,
  Terminal,
  Activity,
  Layers,
  Cpu,
  ExternalLink,
  CheckCircle2
} from "lucide-react";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";
import { toast } from "react-hot-toast";

const EXAMPLES = [
  "https://httpbin.org/get",
  "https://jsonplaceholder.typicode.com/posts/1",
];

const DEFAULT_HEADERS = '{\n  "Content-Type": "application/json"\n}';
const DEFAULT_BODY = "{\n  \n}";

const getSeverityColor = (score) => {
  if (score > 80) return "text-zinc-300";
  if (score > 60) return "text-orange-400";
  return "text-red-500 font-bold";
};

const getStatusSymbol = (status) => {
  if (["Secure", "Enabled", "Configured", "Present"].includes(status)) return "✔";
  if (["Missing", "Not Configured", "Insecure"].includes(status)) return "✖";
  return "ℹ";
};

const renderJsonPreview = (input, emptyLabel = "No body") => {
  try {
    if (!input || input.trim() === "{}") {
      return <div className="text-zinc-550 italic font-mono text-xs">{emptyLabel}</div>;
    }

    const parsed = JSON.parse(input);
    return (
      <pre className="font-mono text-xs text-zinc-400 overflow-x-auto">{JSON.stringify(parsed, null, 2)}</pre>
    );
  } catch {
    return <div className="text-red-400 font-mono text-xs">Invalid JSON</div>;
  }
};

const SectionCard = ({ title, children }) => (
  <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-850">
    <h5 className="font-semibold text-xs font-mono text-red-450 uppercase tracking-wider mb-2">{title}</h5>
    <div className="mt-1">{children}</div>
  </div>
);

const DetailBlock = ({ title, status, tone = "text-zinc-300", children }) => (
  <div className="text-xs font-mono">
    <div className="flex items-center gap-1.5">
      <span className="text-red-500">{getStatusSymbol(status)}</span>
      <span className="font-medium text-zinc-400">{title}: </span>
      <span className={tone}>{status}</span>
    </div>
    {children}
  </div>
);

export default function Apiform() {
  const protectedAction = useProtectedAction();
  const [formData, setFormData] = useState({
    url: "",
    method: "GET",
    headers: DEFAULT_HEADERS,
    body: DEFAULT_BODY,
    timeout: 5000,
  });
  const [error, setError] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("headers");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let formattedUrl = formData.url.trim();
    if (formattedUrl && !/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    try {
      new URL(formattedUrl);
    } catch {
      setError("Please enter a valid API URL (for example https://api.example.com/resource).");
      return;
    }

    let headers = {};
    try {
      headers = formData.headers ? JSON.parse(formData.headers) : {};
      if (!headers || typeof headers !== "object" || Array.isArray(headers)) {
        throw new Error("invalid headers");
      }
    } catch {
      setError('Invalid JSON in headers. Example: { "Authorization": "Bearer <token>" }');
      return;
    }

    let body = undefined;
    if (!["GET", "HEAD"].includes(formData.method)) {
      try {
        body = formData.body ? JSON.parse(formData.body) : {};
        if (!body || typeof body !== "object" || Array.isArray(body)) {
          throw new Error("invalid body");
        }
      } catch {
        setError('Invalid JSON in body. Example: { "key": "value" }');
        return;
      }
    }

    const backendUrl = process.env.NEXT_PUBLIC_PROD_API_URL?.replace(/\/$/, "");
    if (!backendUrl) {
      setError("Backend API URL is not configured.");
      return;
    }

    const requestData = {
      url: formattedUrl,
      method: formData.method,
      headers,
      body,
      options: { timeout: parseInt(formData.timeout, 10) || 5000 },
    };

    setError("");
    setLoading(true);
    setResults(null);

    let requestStarted = false;
    await protectedAction(async (token) => {
      requestStarted = true;
      try {
        const response = await fetch(`${backendUrl}/apiTest/apitest-scan`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestData),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data?.error || `Request failed (${response.status})`);
        }

        setResults(data);
      } catch (err) {
        console.error("API Test Error:", err);
        setError(err?.message || "Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    });

    if (!requestStarted) {
      setLoading(false);
    }
  };

  const formatRequestHeaders = () => {
    try {
      const parsedHeaders = JSON.parse(formData.headers);
      return Object.entries(parsedHeaders).map(([key, value]) => (
        <div key={key} className="font-mono text-xs">
          <span className="text-red-400 font-semibold">{key}</span>: {String(value)}
        </div>
      ));
    } catch {
      return <div className="text-red-400 font-mono text-xs">Invalid JSON</div>;
    }
  };

  const randomExample = () => EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)];

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
            <Code className="h-8 w-8 text-red-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              API SECURITY <span className="text-red-400">TESTER</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Validate target endpoints configuration, verify CORS frameworks, inspect header compliance guidelines, and identify injection vectors.
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
                API Target Configuration
              </h2>
              <div className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-850 text-xs text-zinc-450 leading-relaxed font-mono">
                The live tester scans public routes and blocks localhost, private-network, and metadata endpoints for SSRF safety.
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs uppercase tracking-wider font-mono text-zinc-400 font-semibold">
                      API Endpoint URL
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((current) => ({ ...current, url: randomExample() }))
                      }
                      className="text-red-400 hover:text-red-300 text-xs font-mono"
                    >
                      Random Example
                    </button>
                  </div>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-650" />
                    <input
                      type="text"
                      name="url"
                      value={formData.url}
                      onChange={handleInputChange}
                      placeholder={EXAMPLES[0]}
                      required
                      className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 pl-12 text-sm focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 focus:shadow-[0_0_12px_rgba(239,68,68,0.08)] focus:outline-none transition-all placeholder:text-zinc-600 font-mono"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                      HTTP Method
                    </label>
                    <select
                      name="method"
                      value={formData.method}
                      onChange={handleInputChange}
                      className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 text-sm focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 focus:outline-none transition-all font-mono"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                      <option value="PATCH">PATCH</option>
                      <option value="HEAD">HEAD</option>
                      <option value="OPTIONS">OPTIONS</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                      Request Timeout (ms)
                    </label>
                    <input
                      type="number"
                      name="timeout"
                      value={formData.timeout}
                      onChange={handleInputChange}
                      min="1000"
                      max="30000"
                      className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 text-sm focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 focus:outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                    Request Headers (JSON)
                  </label>
                  <textarea
                    name="headers"
                    value={formData.headers}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 text-xs focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 focus:outline-none transition-all font-mono"
                  />
                </div>

                {!["GET", "HEAD"].includes(formData.method) && (
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                      Request Body (JSON)
                    </label>
                    <textarea
                      name="body"
                      value={formData.body}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 text-xs focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 focus:outline-none transition-all font-mono"
                    />
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={loading || !formData.url}
                  className="w-full bg-red-500 hover:bg-red-600 text-black rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] focus:outline-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      Testing API Security...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 text-black" />
                      Run Test
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-955/10 text-red-400 text-xs font-mono flex items-start gap-2">
                <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" />
                <span>API Test Error: {error}</span>
              </div>
            )}

            {/* Request Preview (Non-loading state, no results yet) */}
            {!loading && !results && (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] space-y-4">
                <h3 className="text-sm font-mono font-bold text-zinc-200 flex items-center gap-2 border-b border-zinc-850 pb-2.5">
                  <Terminal className="w-4 h-4 text-red-400" />
                  Request Preview
                </h3>
                <div className="text-zinc-200 font-mono text-xs break-all bg-zinc-900/40 border border-zinc-850 p-3 rounded-xl">
                  {formData.method} {formData.url || EXAMPLES[0]}
                </div>

                <div className="flex border-b border-zinc-800/80">
                  <button
                    type="button"
                    className={`px-4 py-2.5 text-xs font-mono font-semibold transition-all ${
                      activeTab === "headers"
                        ? "border-b-2 border-red-500 text-red-400"
                        : "text-zinc-550 hover:text-zinc-400"
                    }`}
                    onClick={() => setActiveTab("headers")}
                  >
                    Headers
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2.5 text-xs font-mono font-semibold transition-all ${
                      activeTab === "body"
                        ? "border-b-2 border-red-500 text-red-400"
                        : "text-zinc-550 hover:text-zinc-400"
                    }`}
                    onClick={() => setActiveTab("body")}
                  >
                    Body
                  </button>
                </div>

                <div className="p-4 bg-zinc-900/20 border border-zinc-850 rounded-xl">
                  {activeTab === "headers" ? (
                    <div className="text-zinc-300 space-y-1">{formatRequestHeaders()}</div>
                  ) : (
                    <div className="text-zinc-300">
                      {renderJsonPreview(formData.body, "No body content defined")}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {loading && (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.2)] text-center space-y-4 font-mono text-xs text-zinc-400">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-red-400" />
                <p>Analyzing TLS channels and scanning request signatures...</p>
              </div>
            )}

            {/* Results Panel */}
            {!loading && results && (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] space-y-6">
                
                {/* Header title */}
                <div className="flex justify-between items-center border-b border-zinc-900 pb-4 flex-wrap gap-4">
                  <div>
                    <h3 className="text-lg font-mono font-bold text-zinc-100 uppercase tracking-wider">
                      Security Analysis Results
                    </h3>
                    <p className="text-xs font-mono text-zinc-500 mt-0.5">
                      Endpoint scan diagnostic report
                    </p>
                  </div>
                  <button
                    onClick={() => setResults(null)}
                    className="px-3.5 py-2 bg-zinc-900/40 hover:bg-red-500/5 text-zinc-350 hover:text-red-400 border border-zinc-800/80 hover:border-red-500/30 rounded-xl font-mono font-bold text-xs uppercase transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Test Another
                  </button>
                </div>

                {/* Scorecard block */}
                {results.securityScorecard && (
                  <div className="flex items-center justify-between p-4 bg-zinc-900/40 rounded-xl border border-zinc-850">
                    <div className="font-mono">
                      <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Security Score</h4>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span
                          className={`text-2xl font-bold ${getSeverityColor(
                            results.securityScorecard.score
                          )}`}
                        >
                          {results.securityScorecard.score} / 100
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-md border font-semibold ${getSeverityColor(
                            results.securityScorecard.score
                          )} border-zinc-800 bg-zinc-950/40`}
                        >
                          {results.securityScorecard.rating}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center bg-zinc-900/60 border border-zinc-800/50 rounded-xl h-12 w-12 flex-shrink-0">
                      {results.securityScorecard.score > 80 ? (
                        <Shield className="h-6 w-6 text-zinc-400" />
                      ) : (
                        <ShieldAlert
                          className={`h-6 w-6 ${getSeverityColor(results.securityScorecard.score)}`}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Response summary */}
                <div className="space-y-3 font-mono text-xs">
                  <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Response Summary</h4>
                  <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-850 space-y-2 text-zinc-350">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500">HTTP Status:</span>
                      <span
                        className={`font-bold ${
                          results.status >= 400 ? "text-red-550" : "text-zinc-200"
                        }`}
                      >
                        {results.status}
                      </span>
                      <span className="text-zinc-400">({results.statusText})</span>
                    </div>
                    {results.targetUrl && (
                      <div className="break-all">
                        <span className="text-zinc-500">Target Endpoint:</span> {results.targetUrl}
                      </div>
                    )}
                    {typeof results.responseTime === "number" && (
                      <div>
                        <span className="text-zinc-550">Response Time:</span> {results.responseTime} ms
                      </div>
                    )}
                    {results.note && (
                      <div className="text-orange-400 border-t border-zinc-900 pt-2 mt-2">
                        <span className="text-zinc-550 block text-[9px] uppercase font-bold tracking-wider mb-0.5">Note</span>
                        {results.note}
                      </div>
                    )}
                  </div>
                </div>

                {/* Security checks section */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider mb-2">Security Checks</h4>

                  <div className="space-y-4">
                    {results.securityChecks?.authentication && (
                      <SectionCard title="Authentication Check">
                        <div className="text-xs font-mono text-zinc-300">
                          <span className="text-zinc-500">Status: </span>
                          {results.securityChecks.authentication.status}
                        </div>
                        {results.securityChecks.authentication.secure && (
                          <div className="text-xs font-mono mt-1 text-zinc-450">
                            <span className="text-zinc-500">Security Note: </span>
                            {results.securityChecks.authentication.secure}
                          </div>
                        )}
                      </SectionCard>
                    )}

                    {results.securityChecks?.headerSecurity && (
                      <SectionCard title="Security Headers">
                        <div className="space-y-3 mt-1.5 font-mono text-xs">
                          {Object.entries(results.securityChecks.headerSecurity).map(
                            ([key, value]) => (
                              <div key={key} className="border-b border-zinc-900/50 pb-2.5 last:border-0 last:pb-0">
                                <div className="flex items-center gap-1.5 font-semibold text-zinc-350">
                                  <span className="text-red-500">{getStatusSymbol(value.status)}</span>
                                  <span>{key}:</span>
                                </div>
                                <div className="ml-5 text-zinc-450 mt-0.5">
                                  {value.status}
                                  {value.recommendation && (
                                    <div className="text-orange-400 text-[10px] mt-1">
                                      {value.recommendation}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </SectionCard>
                    )}

                    {results.securityChecks?.ssl && (
                      <SectionCard title="SSL/TLS Security">
                        <DetailBlock
                          title="Status"
                          status={results.securityChecks.ssl.status}
                          tone={
                            results.securityChecks.ssl.status === "Secure"
                              ? "text-zinc-300"
                              : "text-red-500"
                          }
                        >
                          {results.securityChecks.ssl.hstsStatus && (
                            <div className="mt-1 ml-5 text-zinc-450">
                              <span className="text-zinc-550">HSTS: </span>
                              {results.securityChecks.ssl.hstsStatus}
                            </div>
                          )}
                          {results.securityChecks.ssl.recommendation && (
                            <div className="text-orange-400 text-[10px] mt-1 ml-5">
                              {results.securityChecks.ssl.recommendation}
                            </div>
                          )}
                        </DetailBlock>
                      </SectionCard>
                    )}

                    {results.securityChecks?.corsPolicy && (
                      <SectionCard title="CORS Policy">
                        <div className="text-xs font-mono text-zinc-350 space-y-1">
                          <div>
                            <span className="text-zinc-550">Status: </span>
                            {results.securityChecks.corsPolicy.status}
                          </div>
                          <div>
                            <span className="text-zinc-550">Origin: </span>
                            {results.securityChecks.corsPolicy.origin}
                          </div>
                          <div>
                            <span className="text-zinc-550">Credentials: </span>
                            {results.securityChecks.corsPolicy.credentials}
                          </div>
                        </div>
                        {results.securityChecks.corsPolicy.recommendation && (
                          <div className="text-orange-400 text-[10px] mt-2 border-t border-zinc-900 pt-1.5">
                            {results.securityChecks.corsPolicy.recommendation}
                          </div>
                        )}
                      </SectionCard>
                    )}

                    {results.securityChecks?.cookieSecurity && (
                      <SectionCard title="Cookie Security">
                        <div className="text-xs font-mono text-zinc-300">
                          <span className="text-zinc-550">Status: </span>
                          {results.securityChecks.cookieSecurity.status}
                        </div>
                        {results.securityChecks.cookieSecurity.details?.length > 0 && (
                          <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-850 mt-2 font-mono text-xs">
                            <div className="font-semibold text-zinc-400 mb-1">Details:</div>
                            <pre className="text-[10px] overflow-auto max-h-40 text-zinc-550">
                              {JSON.stringify(
                                results.securityChecks.cookieSecurity.details,
                                null,
                                2
                              )}
                            </pre>
                          </div>
                        )}
                      </SectionCard>
                    )}

                    {results.securityChecks?.cachePolicy && (
                      <SectionCard title="Cache Policy">
                        <div className="text-xs font-mono text-zinc-300">
                          <span className="text-zinc-550">Status: </span>
                          {results.securityChecks.cachePolicy.status}
                        </div>
                        <div className="text-xs font-mono mt-1 text-zinc-450">
                          <span className="text-zinc-550">Value: </span>
                          {results.securityChecks.cachePolicy.value}
                        </div>
                      </SectionCard>
                    )}

                    {results.securityChecks?.sensitiveDataExposure && (
                      <SectionCard title="Sensitive Data Exposure">
                        <DetailBlock
                          title="Status"
                          status={results.securityChecks.sensitiveDataExposure.status}
                          tone={
                            results.securityChecks.sensitiveDataExposure.status ===
                            "No obvious data exposure"
                              ? "text-zinc-300"
                              : "text-orange-400"
                          }
                        >
                          {results.securityChecks.sensitiveDataExposure.details &&
                            results.securityChecks.sensitiveDataExposure.details !==
                              "No sensitive data patterns detected in response" && (
                              <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-850 mt-2 font-mono text-xs">
                                <div className="font-semibold text-zinc-400">Details:</div>
                                <pre className="text-[10px] overflow-auto max-h-40 text-zinc-550">
                                  {JSON.stringify(
                                    results.securityChecks.sensitiveDataExposure.details,
                                    null,
                                    2
                                  )}
                                </pre>
                              </div>
                            )}
                        </DetailBlock>
                      </SectionCard>
                    )}

                    {results.securityChecks?.injectionVulnerability && (
                      <SectionCard title="Injection Vulnerabilities">
                        <DetailBlock
                          title="Status"
                          status={results.securityChecks.injectionVulnerability.status}
                          tone={
                            results.securityChecks.injectionVulnerability.status ===
                            "No obvious vulnerabilities"
                              ? "text-zinc-300"
                              : "text-orange-400"
                          }
                        >
                          {results.securityChecks.injectionVulnerability.details &&
                            results.securityChecks.injectionVulnerability.details !==
                              "No common error patterns detected in response" && (
                              <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-850 mt-2 font-mono text-xs">
                                <div className="font-semibold text-zinc-400">Details:</div>
                                <pre className="text-[10px] overflow-auto max-h-40 text-zinc-550">
                                  {JSON.stringify(
                                    results.securityChecks.injectionVulnerability.details,
                                    null,
                                    2
                                  )}
                                </pre>
                              </div>
                            )}
                        </DetailBlock>
                      </SectionCard>
                    )}
                  </div>
                </div>

                {/* Recommendations */}
                {results.recommendations?.length > 0 && (
                  <div className="space-y-3 font-mono text-xs">
                    <h4 className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider">Recommendations</h4>
                    <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-850">
                      <ul className="list-none pl-0 space-y-2">
                        {results.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2.5 text-zinc-450">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                            <span className="leading-relaxed">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Full Response details */}
                <details className="mt-4 font-mono text-xs border border-zinc-900 p-3.5 rounded-xl bg-zinc-950/20">
                  <summary className="cursor-pointer text-red-400 hover:text-red-300 font-semibold flex items-center">
                    <Code className="h-4 w-4 mr-1.5" />
                    View Full Response Details
                  </summary>
                  <div className="mt-3 p-3 bg-zinc-900/40 border border-zinc-850 rounded-lg text-xs overflow-auto max-h-96 text-zinc-450">
                    <pre className="whitespace-pre-wrap font-mono text-[10px] leading-relaxed">
                      {JSON.stringify(results, null, 2)}
                    </pre>
                  </div>
                </details>
              </div>
            )}

          </div>

          {/* Right Column (Specs & Guidance) */}
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
                    Audits custom request headers against API authorization standards.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Validates CORS permissions frameworks to flag wildcard setups.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Checks session cookie security flags (Secure, HttpOnly, SameSite).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Verifies inputs to locate common injection signatures.
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
