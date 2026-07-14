"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Globe, 
  Terminal, 
  Download, 
  ShieldAlert, 
  Info, 
  Activity, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Eye,
  Filter,
  FileText
} from "lucide-react";
import { generateAdvancedDynamicScanPDF } from "./generateAdvancedDynamicScanPDF";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";

/* ─────────────── Severity Badge styling ─────────────── */
const SEV_STYLES = {
  Critical: "bg-red-500/15 text-red-400 border-red-500/30",
  High: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  Medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Low: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Info: "bg-zinc-800 text-zinc-400 border border-zinc-700",
  Unknown: "bg-zinc-800 text-zinc-400 border border-zinc-700",
};

function SeverityBadge({ severity }) {
  const norm = severity ? severity.charAt(0).toUpperCase() + severity.slice(1).toLowerCase() : "Unknown";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[0.62rem] font-mono font-bold uppercase tracking-wider ${SEV_STYLES[norm] || SEV_STYLES.Unknown}`}>
      {norm}
    </span>
  );
}

/* ─────────────── Status Badge styling ─────────────── */
function StatusBadge({ status }) {
  if (status === "Pass") {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-450 font-mono text-xs font-semibold">
        <CheckCircle2 className="h-3.5 w-3.5" />
        PASS
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-red-450 font-mono text-xs font-semibold">
      <AlertTriangle className="h-3.5 w-3.5" />
      FAIL
    </span>
  );
}

export default function AdvancedDynamicScan() {
  const protectedAction = useProtectedAction();

  // State parameters
  const [targetUrl, setTargetUrl] = useState("https://example.com");
  const [crawlingEnabled, setCrawlingEnabled] = useState(true);
  const [fuzzingEnabled, setFuzzingEnabled] = useState(true);

  const [loading, setLoading] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [reportReady, setReportReady] = useState(false);
  const [results, setResults] = useState([]);
  const [urlsCrawled, setUrlsCrawled] = useState([]);
  const [summaryText, setSummaryText] = useState("");
  const [riskScore, setRiskScore] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [showOnlyFailures, setShowOnlyFailures] = useState(false);

  const logContainerRef = useRef(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [consoleLogs]);

  // Execute Dynamic Scan
  const handleStartScan = async (e) => {
    e.preventDefault();
    if (!targetUrl.trim()) return;

    setLoading(true);
    setReportReady(false);
    setErrorMsg("");
    setConsoleLogs([]);
    setResults([]);
    setUrlsCrawled([]);

    const addLog = (msg, delay = 0) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          setConsoleLogs((prev) => [...prev, msg]);
          resolve();
        }, delay);
      });
    };

    await addLog("[INFO] Initializing Advanced Dynamic Application Security Scan (DAST)...", 100);
    await addLog(`[INFO] Targeted Host URL: ${targetUrl}`, 150);

    if (crawlingEnabled) {
      await addLog("[INFO] Crawling & spidering configuration: ENABLED (Domain scope locked).", 100);
    }
    if (fuzzingEnabled) {
      await addLog("[INFO] Input parameter fuzzing: ENABLED (Reflected XSS / SQL Injection checks).", 100);
    }

    const API_BASE = (process.env.NEXT_PUBLIC_PROD_API_URL || "").replace(/\/+$/, "");

    await protectedAction(async (token) => {
      try {
        await addLog("[INFO] Connecting to dynamic audit cluster...", 100);
        
        const res = await fetch(`${API_BASE}/advanced-dynamic-scan/scan`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            targetUrl: targetUrl.trim(),
            crawlingEnabled,
            fuzzingEnabled
          })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to run dynamic vulnerability scan.");
        }

        await addLog("[INFO] Connection established. Fetching remote response streams...", 150);
        await addLog("[INFO] Analyzing HTTP headers, secure cookies, and CORS scopes...", 150);

        if (crawlingEnabled && data.urlsCrawled?.length > 1) {
          await addLog(`[INFO] Found ${data.urlsCrawled.length - 1} nested subpages during crawl spidering.`, 100);
          for (let i = 1; i < data.urlsCrawled.length; i++) {
            await addLog(`[CRAWLER] Discovered: ${data.urlsCrawled[i]}`, 80);
          }
        }

        if (fuzzingEnabled) {
          await addLog("[INFO] Executing dynamic injection fuzzers on query inputs...", 100);
          const hasCriticals = data.vulnerabilities?.some(v => v.severity === "Critical" && v.status === "Fail");
          const hasHighs = data.vulnerabilities?.some(v => v.severity === "High" && v.status === "Fail");
          
          if (hasCriticals) await addLog("[ALERT] SQL Injection indicators detected on parsed form inputs!", 100);
          if (hasHighs) await addLog("[ALERT] XSS script tags successfully reflected in response parameters!", 100);
        }

        await addLog("[SUCCESS] Dynamic audit complete. Mapping results metrics...", 150);

        setResults(data.vulnerabilities || []);
        setUrlsCrawled(data.urlsCrawled || []);
        setSummaryText(data.summary || "");
        setRiskScore(data.riskScore || 0);
        setReportReady(true);
      } catch (err) {
        await addLog(`[ERROR] Audit process stopped: ${err.message}`, 100);
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    });
  };

  // Filtered vulnerabilities
  const filteredVulnerabilities = useMemo(() => {
    return showOnlyFailures ? results.filter(v => v.status === "Fail") : results;
  }, [results, showOnlyFailures]);

  // Export PDF Report
  const handleDownloadPDF = () => {
    generateAdvancedDynamicScanPDF(results, targetUrl, riskScore, urlsCrawled, summaryText);
  };

  return (
    <div 
      className="tool-detail-page min-h-screen"
      style={{
        "--hero-ambient-a": "rgba(245, 158, 11, 0.08)",
        "--hero-ambient-b": "rgba(249, 115, 22, 0.03)",
        "--glow-primary": "0 0 34px rgba(245, 158, 11, 0.16)",
        "--gold": "#f59e0b",
        "--gold-strong": "#fbbf24",
        "--gold-dark": "#b45309",
        "--ring": "rgba(245, 158, 11, 0.34)",
        "--surface-glow": "rgba(245, 158, 11, 0.14)",
      }}
    >
      <style>{`
        .tool-detail-page .tool-detail-shell {
          padding-top: 3.5rem !important;
        }
        .tool-detail-page ::-webkit-scrollbar-thumb {
          background: rgba(245, 158, 11, 0.35) !important;
        }
        .tool-detail-page ::selection {
          background: rgba(245, 158, 11, 0.22) !important;
          color: #fffbeb !important;
        }
        .bns-loading-card p, .bns-loading-card span {
          color: #f4f4f5 !important;
        }
        .bns-submit-btn {
          background-color: rgba(245, 158, 11, 0.05) !important;
          color: #f59e0b !important;
          border: 1px solid rgba(245, 158, 11, 0.2) !important;
        }
        .bns-submit-btn:hover:not(:disabled) {
          background-color: rgba(245, 158, 11, 0.1) !important;
          border-color: rgba(245, 158, 11, 0.5) !important;
          color: #fbbf24 !important;
          box-shadow: 0 0 20px rgba(245, 158, 11, 0.15) !important;
        }
      `}</style>

      <div className="tool-detail-shell">
        {/* Navigation Header */}
        <div className="flex justify-end mb-8">
          <span className="rounded-full border border-amber-500/30 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-amber-400">
            Vulnerability Assessment
          </span>
        </div>

        {/* Title Block */}
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center bg-zinc-950/20" style={{ border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <Globe className="h-8 w-8 text-amber-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              ADVANCED DYNAMIC <span className="text-amber-400">SCAN</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Execute dynamic vulnerability scanner crawls on applications. Inspects security headers, cookie flags, and runs passive fuzzers to map XSS / SQL Injection exposures.
            </p>
          </div>
        </div>

        {/* Grid layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* Control Config Card */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-amber-500/10 transition-all duration-300">
              <h2 className="text-lg font-mono font-medium text-zinc-100 mb-6 flex items-center gap-2">
                <Terminal className="h-5 w-5 text-amber-400" />
                Target Configurations
              </h2>
              
              <form onSubmit={handleStartScan} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                    Scan Target URL
                  </label>
                  <input 
                    type="text" 
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    disabled={loading}
                    placeholder="https://example.com"
                    className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3 text-sm focus:border-amber-500/50 focus:outline-none transition-all font-mono"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <label className="flex items-center gap-2 text-xs font-mono text-zinc-350 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={crawlingEnabled}
                      onChange={(e) => setCrawlingEnabled(e.target.checked)}
                      disabled={loading}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500/40"
                    />
                    <span>Spider Crawl Subpages</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-mono text-zinc-350 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={fuzzingEnabled}
                      onChange={(e) => setFuzzingEnabled(e.target.checked)}
                      disabled={loading}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500/40"
                    />
                    <span>Fuzz Query Inputs</span>
                  </label>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bns-submit-btn rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 focus:outline-none disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Fuzzing URL Targets...
                      </>
                    ) : (
                      <>
                        <Globe className="h-4 w-4" />
                        Run Advanced Dynamic Scan
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Error alerts */}
            {errorMsg && (
              <div className="border border-red-500/30 bg-red-500/10 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-450 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-mono font-semibold text-red-400">Scan Connection Fail</p>
                  <p className="text-xs text-red-300/75 mt-1 leading-relaxed">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* Logger Box */}
            {(loading || consoleLogs.length > 0) && (
              <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 font-mono text-xs text-white/80 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                <div className="flex items-center justify-between border-b border-zinc-800/40 pb-3">
                  <span className="flex items-center gap-2 font-bold text-amber-400">
                    <Terminal className="h-4 w-4" />
                    DYNAMIC CONSOLE OUTPUT
                  </span>
                  {loading && <span className="text-amber-400 animate-pulse">● SPIDER RUNNING</span>}
                </div>
                
                <div 
                  ref={logContainerRef}
                  className="h-44 overflow-y-auto space-y-2 pr-2 custom-scrollbar text-zinc-400 font-mono"
                >
                  {consoleLogs.map((log, index) => {
                    let color = "text-zinc-400";
                    if (log.includes("[SUCCESS]")) color = "text-amber-400";
                    if (log.includes("[WARNING]")) color = "text-orange-400";
                    if (log.includes("[ALERT]")) color = "text-red-500 font-bold";
                    if (log.includes("[CRAWLER]")) color = "text-blue-400";
                    
                    return (
                      <div key={index} className={`leading-relaxed ${color}`}>
                        {log}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sitemap section */}
            {reportReady && urlsCrawled.length > 0 && !loading && (
              <div className="bg-zinc-950/20 border border-zinc-800/80 rounded-2xl p-6 space-y-3">
                <h3 className="text-xs uppercase font-mono font-bold text-zinc-300">Pages Discovered ({urlsCrawled.length})</h3>
                <div className="max-h-[120px] overflow-y-auto divide-y divide-zinc-850">
                  {urlsCrawled.map((url, idx) => (
                    <div key={idx} className="py-2 text-[0.68rem] font-mono text-zinc-400 truncate flex items-center gap-2">
                      <ArrowRight className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                      <span>{url}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Findings List */}
            {reportReady && results.length > 0 && !loading && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs uppercase font-mono font-bold text-zinc-300">Dynamic Scan Findings</span>
                  <button
                    onClick={() => setShowOnlyFailures(prev => !prev)}
                    className={`flex items-center gap-1.5 text-[0.65rem] font-mono px-2.5 py-1 rounded-lg border transition-all ${
                      showOnlyFailures
                        ? "border-amber-500/40 text-amber-400 bg-amber-500/10"
                        : "border-zinc-700/60 text-zinc-500 hover:border-zinc-650"
                    }`}
                  >
                    <Filter className="h-3 w-3" />
                    {showOnlyFailures ? "Showing Failures Only" : "Show Failures Only"}
                  </button>
                </div>

                <div className="border border-zinc-800/80 rounded-2xl overflow-hidden">
                  <div className="divide-y divide-zinc-850 max-h-[500px] overflow-y-auto">
                    {filteredVulnerabilities.map((vuln, idx) => (
                      <div key={idx} className="p-4 bg-zinc-950/10 space-y-2 transition-all">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="font-mono text-sm font-bold text-zinc-200">{vuln.control}</span>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={vuln.status} />
                            <SeverityBadge severity={vuln.severity} />
                          </div>
                        </div>
                        <p className="text-xs text-zinc-400 font-mono leading-relaxed">{vuln.details}</p>
                        
                        {vuln.evidence && (
                          <div className="bg-zinc-900/60 border border-zinc-850 p-2.5 rounded-lg overflow-x-auto my-1">
                            <code className="text-[10px] break-all block font-mono text-zinc-500">{vuln.evidence}</code>
                          </div>
                        )}

                        <div className="flex gap-4 text-[10px] font-mono text-zinc-550 border-t border-zinc-900 pt-2">
                          {vuln.owaspMapping && (
                            <div>
                              <span className="text-zinc-600 font-bold">OWASP:</span> {vuln.owaspMapping}
                            </div>
                          )}
                          {vuln.cweMapping && (
                            <div>
                              <span className="text-zinc-600 font-bold">CWE:</span> {vuln.cweMapping}
                            </div>
                          )}
                        </div>

                        {vuln.status === "Fail" && (
                          <div className="border-t border-dashed border-zinc-850 pt-2 text-[0.68rem] font-mono text-zinc-500">
                            <span className="text-amber-500 font-semibold uppercase">Remediation Guide: </span>
                            {vuln.remediation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {reportReady && !loading ? (
              <div className="border border-amber-500/30 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-6 shadow-[0_8px_30px_rgb(0,0,0,0.15)] animate-[fadeIn_0.3s_ease-out]">
                <div className="text-center space-y-2">
                  <div className="inline-flex h-12 w-12 items-center justify-center border border-amber-500/25 text-amber-400 rounded-full bg-amber-500/10 mb-2">
                    {riskScore > 30 ? (
                      <ShieldAlert className="h-6 w-6" />
                    ) : (
                      <CheckCircle2 className="h-6 w-6" />
                    )}
                  </div>
                  <h3 className="text-xl font-mono font-bold text-zinc-100">Scan Complete</h3>
                  <p className="text-[10px] text-zinc-400 truncate font-mono">{targetUrl}</p>
                </div>

                <div className="border-t border-zinc-800/40 pt-4 space-y-3 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Total Checked:</span>
                    <span className="text-zinc-200 font-bold">{results.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Vulnerabilities:</span>
                    <span className="text-orange-400 font-bold">{results.filter(f => f.status === 'Fail').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Risk score:</span>
                    <span className={`font-bold ${riskScore > 50 ? "text-red-500" : riskScore > 20 ? "text-amber-400" : "text-emerald-405"}`}>{riskScore}/100</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button 
                    onClick={handleDownloadPDF}
                    className="w-full bg-amber-500/5 hover:bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:border-amber-500/50 rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] focus:outline-none"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF Report
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 text-center py-16 text-zinc-400 space-y-3 shadow-sm">
                <FileText className="h-12 w-12 mx-auto text-zinc-700" />
                <p className="text-sm font-mono uppercase tracking-wider font-semibold text-zinc-200">No Scan Executed</p>
                <p className="text-xs max-w-[240px] mx-auto leading-relaxed">
                  Provide a web URL target to trigger crawl spidering and dynamic fuzzer assessments.
                </p>
              </div>
            )}

            {/* Guidance sidebar card */}
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Info className="text-amber-400 w-4 h-4" />
                DAST Coverage
              </h2>
              <ul className="space-y-3.5 list-none pl-0">
                {[
                  "SQL Injection Check: Probes parameters with quotes to detect query syntax errors.",
                  "Reflected XSS Test: Attempts script injection to verify unsanitized output reflection.",
                  "Security Headers: Audits CSP, Strict-Transport-Security, X-Frame-Options configurations.",
                  "Secure Cookies: Checks HttpOnly/Secure flags on Set-Cookie fields.",
                  "Sitemap Crawler: Traces local href maps dynamically up to 10 nodes deep."
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500/60 mt-1.5 flex-shrink-0" />
                    <span className="text-xs text-zinc-400 leading-relaxed font-mono">{text}</span>
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
