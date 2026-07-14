"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Terminal, 
  Download, 
  Award, 
  FileText, 
  Loader2, 
  FileCode, 
  Upload, 
  Info,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Filter
} from "lucide-react";
import { generateMalwaveScanPDF } from "@/components/malwaveScan/generateMalwaveScanPDF";
import useProtectedAction from "@/components/UseProtectedAction/UseProtectedAction";

/* ─────────────── Severity Badge styling ─────────────── */
const SEV_STYLES = {
  Critical: "bg-red-500/15 text-red-400 border-red-500/30",
  High: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  Medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Low: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Unknown: "bg-zinc-800 text-zinc-400 border border-zinc-700",
};

function SeverityBadge({ severity }) {
  const norm = severity ? severity.charAt(0).toUpperCase() + severity.slice(1).toLowerCase() : "Unknown";
  const isHigh = norm === "High";
  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[0.62rem] font-mono font-bold uppercase tracking-wider ${SEV_STYLES[norm] || SEV_STYLES.Unknown}`}
      style={isHigh ? { color: "#000000" } : {}}
    >
      {norm}
    </span>
  );
}

export default function DependencyCheckPage() {
  const router = useRouter();
  const protectedAction = useProtectedAction();
  const [packageJsonText, setPackageJsonText] = useState(`{
  "dependencies": {
    "lodash": "^4.17.15",
    "colors-checker": "^1.0.2",
    "minimist": "^1.2.0"
  }
}`);
  const [fileName, setFileName] = useState("package.json");
  const [scanning, setScanning] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [reportReady, setReportReady] = useState(false);
  const [results, setResults] = useState([]);
  const [riskScore, setRiskScore] = useState(0);
  const [summaryText, setSummaryText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showOnlyFailures, setShowOnlyFailures] = useState(false);

  const logContainerRef = useRef(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [consoleLogs]);

  // File Upload Helper
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      setPackageJsonText(evt.target.result);
    };
    reader.readAsText(file);
  };

  // Run Dependency Audit Scan
  const handleStartScan = async (e) => {
    e.preventDefault();
    if (!packageJsonText.trim()) return;

    setScanning(true);
    setReportReady(false);
    setErrorMsg("");
    setConsoleLogs([]);
    setResults([]);

    const addLog = (msg, delay = 0) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          setConsoleLogs((prev) => [...prev, msg]);
          resolve();
        }, delay);
      });
    };

    await addLog("[INFO] Initializing Malwave dependency scan workspace...", 100);
    await addLog(`[INFO] Targeted manifest file: ${fileName}`, 150);
    await addLog("[INFO] Validating JSON syntax baseline...", 150);

    const API_BASE = (process.env.NEXT_PUBLIC_PROD_API_URL || "").replace(/\/+$/, "");

    await protectedAction(async (token) => {
      try {
        await addLog("[INFO] Transmitting manifest data to SCA scan engine...", 100);
        
        const res = await fetch(`${API_BASE}/dependency-check/analyze`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            packageJsonText,
            target: fileName
          })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to complete dependency analysis.");
        }

        await addLog("[INFO] Manifest loaded. Resolving dependency configurations...", 100);
        await addLog("[INFO] Querying OSV.dev vulnerability database in parallel...", 150);

        if (data.issues?.length > 0) {
          const criticalCount = data.issues.filter(i => i.severity === "Critical").length;
          const highCount = data.issues.filter(i => i.severity === "High").length;
          
          if (criticalCount > 0) {
            await addLog(`[ALERT] Flagged ${criticalCount} Critical vulnerabilities / supply-chain exposures!`, 100);
          }
          if (highCount > 0) {
            await addLog(`[WARNING] Detected ${highCount} High severity CVE references!`, 100);
          }
          
          data.issues.forEach(issue => {
            if (issue.severity === "Critical") {
              setConsoleLogs(prev => [...prev, `[ALERT] typosquatting: ${issue.name} mimicking popular packages.`]);
            } else {
              setConsoleLogs(prev => [...prev, `[WARNING] ${issue.name} (${issue.currentVersion}) -> ${issue.vulnerability}`]);
            }
          });
        } else {
          await addLog("[SUCCESS] No vulnerable dependencies found in manifest.", 100);
        }

        await addLog("[INFO] Audit scorecard generated.", 100);
        await addLog("[SUCCESS] Malwave Scan completed successfully.", 150);

        setResults(data.issues || []);
        setRiskScore(data.riskScore || 0);
        setSummaryText(data.summary || "");
        setReportReady(true);
      } catch (err) {
        await addLog(`[ERROR] Audit process failed: ${err.message}`, 100);
        setErrorMsg(err.message);
      } finally {
        setScanning(false);
      }
    });
  };

  // Filtered issues list
  const filteredIssues = useMemo(() => {
    return showOnlyFailures ? results.filter(i => i.severity === "Critical" || i.severity === "High") : results;
  }, [results, showOnlyFailures]);

  // Export PDF Report
  const handleDownloadPDF = () => {
    generateMalwaveScanPDF(results, fileName, riskScore, summaryText);
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
        {/* Navigation & Header */}
        <div className="flex justify-end mb-8">
          <span className="rounded-full border border-amber-500/30 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-amber-400">
            Vulnerability Assessment
          </span>
        </div>

        {/* Title Block */}
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center bg-zinc-950/20" style={{ border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <FileCode className="h-8 w-8 text-amber-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              MALWAVE <span className="text-amber-400">SCAN</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Software Composition Analysis (SCA). Upload manifest declarations to query OSV.dev APIs for known CVEs, and run typosquatting checking algorithms.
            </p>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* Form card */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-amber-500/10 transition-all duration-300">
              <h2 className="text-lg font-mono font-medium text-zinc-100 mb-6 flex items-center gap-2">
                <FileCode className="h-5 w-5 text-amber-400" />
                Manifest Declaration Configs
              </h2>
              
              <form onSubmit={handleStartScan} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                    package.json file contents
                  </label>
                  <textarea 
                    value={packageJsonText}
                    onChange={(e) => setPackageJsonText(e.target.value)}
                    disabled={scanning}
                    rows={8}
                    className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 text-xs focus:border-amber-500/50 focus:outline-none transition-all placeholder:text-zinc-600 font-mono"
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-zinc-900 pt-4">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer bg-zinc-900/40 border border-zinc-800/80 hover:border-amber-500/35 hover:bg-amber-500/5 px-4 py-2.5 rounded-xl text-xs text-zinc-350 hover:text-amber-400 transition flex items-center gap-2 font-semibold font-mono">
                      <Upload className="h-4 w-4 text-amber-400" />
                      Choose Manifest
                      <input 
                        type="file" 
                        accept=".json"
                        onChange={handleFileUpload}
                        className="hidden" 
                        disabled={scanning}
                      />
                    </label>
                    <span className="text-xs text-zinc-500 font-mono truncate max-w-[120px]">File: {fileName}</span>
                  </div>

                  <button 
                    type="submit"
                    disabled={scanning || !packageJsonText.trim()}
                    className="w-full sm:w-auto bns-submit-btn rounded-xl font-mono font-bold text-xs uppercase px-8 py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 focus:outline-none disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {scanning ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Auditing...
                      </>
                    ) : (
                      <>
                        <Terminal className="h-4 w-4" />
                        Run Package Audit
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Parse Errors alerts */}
            {errorMsg && (
              <div className="border border-red-500/30 bg-red-500/10 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-450 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-mono font-semibold text-red-400">Parsing Failure</p>
                  <p className="text-xs text-red-300/75 mt-1 leading-relaxed">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* Console Log outputs */}
            {(scanning || consoleLogs.length > 0) && (
              <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 font-mono text-xs text-white/80 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                <div className="flex items-center justify-between border-b border-zinc-800/40 pb-3">
                  <span className="flex items-center gap-2 font-bold text-amber-400">
                    <Terminal className="h-4 w-4" />
                    AUDIT LOG STREAM
                  </span>
                  {scanning && <span className="text-amber-400 animate-pulse">● RUNNING</span>}
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
                    
                    return (
                      <div key={index} className={`leading-relaxed ${color}`}>
                        {log}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Findings Lists */}
            {reportReady && results.length > 0 && !scanning && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs uppercase font-mono font-bold text-zinc-300">Package Security Risks</span>
                  <button
                    onClick={() => setShowOnlyFailures(prev => !prev)}
                    className={`flex items-center gap-1.5 text-[0.65rem] font-mono px-2.5 py-1 rounded-lg border transition-all ${
                      showOnlyFailures
                        ? "border-amber-500/40 text-amber-400 bg-amber-500/10"
                        : "border-zinc-700/60 text-zinc-500 hover:border-zinc-650"
                    }`}
                  >
                    <Filter className="h-3 w-3" />
                    {showOnlyFailures ? "High & Critical Only" : "Show All Risks"}
                  </button>
                </div>

                <div className="border border-zinc-800/80 rounded-2xl overflow-hidden">
                  <div className="divide-y divide-zinc-850 max-h-[500px] overflow-y-auto">
                    {filteredIssues.map((issue, idx) => (
                      <div key={idx} className="p-4 bg-zinc-950/10 space-y-2 transition-all">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="font-mono text-sm font-bold text-zinc-200">{issue.name}</span>
                          <SeverityBadge severity={issue.severity} />
                        </div>
                        
                        <p className="text-xs text-zinc-400 font-mono leading-relaxed">{issue.vulnerability}</p>

                        <div className="flex gap-4 text-[10px] font-mono text-zinc-550 border-t border-zinc-900/60 pt-2">
                          <div>
                            <span className="text-zinc-600 font-bold">Installed Version:</span> {issue.currentVersion}
                          </div>
                          {issue.latestVersion && issue.latestVersion !== "N/A" && (
                            <div>
                              <span className="text-zinc-600 font-bold">Safe Version:</span> {issue.latestVersion}
                            </div>
                          )}
                        </div>

                        {issue.remediation && (
                          <div className="border-t border-dashed border-zinc-850 pt-2 text-[0.68rem] font-mono text-zinc-550">
                            <span className="text-amber-500 font-semibold uppercase">Remediation: </span>
                            {issue.remediation}
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
            {reportReady && !scanning ? (
              <div className="border border-amber-500/30 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-6 shadow-[0_8px_30px_rgb(0,0,0,0.15)] animate-[fadeIn_0.3s_ease-out]">
                <div className="text-center space-y-2">
                  <div className="inline-flex h-12 w-12 items-center justify-center border border-amber-500/25 text-amber-400 rounded-full bg-amber-500/10 mb-2">
                    {riskScore > 35 ? (
                      <ShieldAlert className="h-6 w-6" />
                    ) : (
                      <CheckCircle2 className="h-6 w-6" />
                    )}
                  </div>
                  <h3 className="text-xl font-mono font-bold text-zinc-100">Scan Complete</h3>
                  <p className="text-xs text-zinc-400">{fileName}</p>
                </div>

                <div className="border-t border-zinc-800/40 pt-4 space-y-3 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Total Checked:</span>
                    <span className="text-zinc-200 font-bold">{results.length} Issues</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Critical Threats:</span>
                    <span className="text-red-500 font-bold">{results.filter(r => r.severity === 'Critical').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Risk index:</span>
                    <span className={`font-bold ${riskScore > 50 ? "text-red-500" : riskScore > 20 ? "text-amber-400" : "text-emerald-450"}`}>{riskScore}/100</span>
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
                  Provide package specifications and start the audit to retrieve Software Composition Analysis (SCA) metrics.
                </p>
              </div>
            )}

            {/* Specs & Guidance sidebar card */}
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Info className="text-amber-400 w-4 h-4" />
                SCA Scope
              </h2>
              <ul className="space-y-3.5 list-none pl-0">
                {[
                  "Typosquatting Check: Identifies package names designed to mimic popular libraries.",
                  "OSV.dev Vulnerabilities: Queries OSV APIs to detect open CVEs and security advisories.",
                  "Remediation Patches: Recommends secure fixed version numbers for package.json.",
                  "Dependencies Inventory: Scans direct packages inside node projects."
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
