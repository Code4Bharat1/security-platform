// components/webAppAudit/webAppAudit.jsx
"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  Filter,
  Shield,
  Lock,
  Cookie,
  ServerCog,
  Database,
  Network,
  FileText
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";

/* ─────────────── Severity Badge styling ─────────────── */
const SEV_STYLES = {
  critical: "bg-red-500/15 text-red-400 border-red-500/30",
  high: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  low: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  info: "bg-zinc-800 text-zinc-400 border-zinc-700",
  Unknown: "bg-zinc-800 text-zinc-450 border border-zinc-700",
};

function SeverityBadge({ severity }) {
  const norm = severity ? severity.toLowerCase() : "info";
  const label = norm.toUpperCase();
  const isHigh = norm === "high";
  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[0.62rem] font-mono font-bold uppercase tracking-wider ${SEV_STYLES[norm] || SEV_STYLES.Unknown}`}
      style={isHigh ? { color: "#000000" } : {}}
    >
      {label}
    </span>
  );
}

export default function WebAppAudit() {
  const router = useRouter();
  const protectedAction = useProtectedAction();
  
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [scanData, setScanData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [showOnlyFailures, setShowOnlyFailures] = useState(false);
  
  const logContainerRef = useRef(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [consoleLogs]);

  const API_BASE = useMemo(
    () => (process.env.NEXT_PUBLIC_PROD_API_URL || "").replace(/\/+$/, ""),
    []
  );

  const validateUrl = (v) => {
    const val = (v || "").trim();
    const urlPattern = new RegExp(
      "^(https?:\\/\\/)?(([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}(:\\d+)?(\\/.*)?$",
      "i"
    );
    return !!urlPattern.test(val);
  };

  const handleStartScan = async (e) => {
    e.preventDefault();
    if (!validateUrl(url)) {
      setErrorMsg("Please provide a valid target URL (e.g. example.com).");
      return;
    }

    setScanning(true);
    setErrorMsg("");
    setScanData(null);
    setConsoleLogs([]);
    setActiveTab("overview");

    const addLog = (msg, delay = 0) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          setConsoleLogs((prev) => [...prev, msg]);
          resolve();
        }, delay);
      });
    };

    const domain = url.replace(/^https?:\/\//, "").split("/")[0];

    await addLog(`[INFO] Initializing Web Application Test workspace...`, 100);
    await addLog(`[INFO] Resolving DNS hosts for target: ${domain}`, 150);
    await addLog(`[INFO] Launching passive HTTP response header checks...`, 150);

    await protectedAction(async (token) => {
      try {
        await addLog(`[INFO] Querying target socket endpoint via audit server...`, 100);

        const res = await fetch(`${API_BASE}/scan/web-app-audit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ url })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Web application configuration audit failed.");
        }

        await addLog(`[INFO] Analysing response security headers (HSTS, CSP, etc.)...`, 150);
        await addLog(`[INFO] Parsing set-cookie directives & session cookie attributes...`, 150);
        await addLog(`[INFO] Loading target SSL certificate structure...`, 150);
        await addLog(`[INFO] Launching WAF/firewall detection tests...`, 100);

        if (data.firewall?.detected) {
          await addLog(`[WARNING] Firewall detected: ${data.firewall.wafType} is shielding the target.`, 100);
        }

        const vulnCount = data.vulnerabilities?.length || 0;
        if (vulnCount > 0) {
          await addLog(`[WARNING] Configuration audit completed. Flagged ${vulnCount} security gaps.`, 100);
        } else {
          await addLog(`[SUCCESS] Configuration checks complete. No major exposures found.`, 100);
        }

        await addLog(`[SUCCESS] Web application configuration audit completed.`, 100);

        setScanData(data);
      } catch (err) {
        await addLog(`[ERROR] Scan process failed: ${err.message}`, 100);
        setErrorMsg(err.message);
      } finally {
        setScanning(false);
      }
    });
  };

  // Filtered issues list
  const filteredIssues = useMemo(() => {
    if (!scanData || !scanData.vulnerabilities) return [];
    return showOnlyFailures 
      ? scanData.vulnerabilities.filter(v => v.severity === "high" || v.severity === "critical") 
      : scanData.vulnerabilities;
  }, [scanData, showOnlyFailures]);

  // Export PDF Report
  const handleDownloadPDF = () => {
    if (!scanData) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const M = 40;
    let y = 56;
    
    // Header Banner
    doc.setFillColor(18, 18, 18);
    doc.rect(0, 0, doc.internal.pageSize.width, 80, "F");
    
    doc.setTextColor(245, 158, 11); // Warm Amber
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("NEXCORE SECURITY PLATFORM", M, 35);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text("WEB APPLICATION SECURITY CONFIGURATION REPORT", M, 55);
    y = 110;
    
    // Scan Meta Info
    doc.setTextColor(50, 50, 50);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Target Host: ${scanData.domain}`, M, y);
    doc.text(`Scan Date:   ${new Date(scanData.timestamp).toLocaleString()}`, M, y + 15);
    doc.text(`Sec Grade:   ${scanData.securityGrade || "N/A"}`, M, y + 30);
    y += 55;
    
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(0.5);
    doc.line(M, y, doc.internal.pageSize.width - M, y);
    y += 20;

    // Summary
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Executive Summary", M, y);
    y += 15;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    const summaryText = `This report lists configuration, security header, session cookie, and SSL/TLS findings for the target host ${scanData.domain}. A total of ${scanData.vulnerabilities?.length || 0} issues were identified.`;
    const splitSummary = doc.splitTextToSize(summaryText, doc.internal.pageSize.width - (M * 2));
    doc.text(splitSummary, M, y);
    y += splitSummary.length * 12 + 15;

    // Findings Table
    const headers = [["Vulnerability / Control Check", "Severity", "Description", "Remediation Guide"]];
    const tableData = (scanData.vulnerabilities || []).map(v => [
      v.description,
      v.severity?.toUpperCase(),
      v.details,
      v.recommendation
    ]);

    autoTable(doc, {
      head: headers,
      body: tableData,
      startY: y,
      theme: "striped",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [245, 158, 11], textColor: [255, 255, 255] },
      margin: { left: M, right: M }
    });
    
    doc.save(`Nexcore-web-audit-report-${Date.now()}.pdf`);
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
            Vulnerability Assessment Team
          </span>
        </div>

        {/* Title Block */}
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center bg-zinc-950/20" style={{ border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <Globe className="h-8 w-8 text-amber-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              WEB APP <span className="text-amber-400">TEST</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Audits headers, cookies, TLS versions, WAF shields, and server configuration issues to identify weaknesses before attackers can exploit them.
            </p>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* Input Form */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-amber-500/10 transition-all duration-300">
              <h2 className="text-lg font-mono font-medium text-zinc-100 mb-6 flex items-center gap-2">
                <Globe className="h-5 w-5 text-amber-400" />
                Target Domain Audit
              </h2>
              
              <form onSubmit={handleStartScan} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                    Target URL / Hostname
                  </label>
                  <input 
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={scanning}
                    placeholder="https://example.com"
                    className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 text-xs focus:border-amber-500/50 focus:outline-none transition-all placeholder:text-zinc-600 font-mono"
                  />
                </div>

                <div className="flex justify-end border-t border-zinc-900 pt-4">
                  <button 
                    type="submit"
                    disabled={scanning || !url.trim()}
                    className="w-full sm:w-auto bns-submit-btn rounded-xl font-mono font-bold text-xs uppercase px-8 py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 focus:outline-none disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {scanning ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Terminal className="h-4 w-4" />
                        Run Configuration Audit
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Error notifications */}
            {errorMsg && (
              <div className="border border-red-500/30 bg-red-500/10 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-450 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-mono font-semibold text-red-400">Scan Failed</p>
                  <p className="text-xs text-red-300/75 mt-1 leading-relaxed">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* Console Log stream */}
            {(scanning || consoleLogs.length > 0) && (
              <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 font-mono text-xs text-white/80 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                <div className="flex items-center justify-between border-b border-zinc-800/40 pb-3">
                  <span className="flex items-center gap-2 font-bold text-amber-400">
                    <Terminal className="h-4 w-4" />
                    AUDIT SCAN PROCESS
                  </span>
                  {scanning && <span className="text-amber-400 animate-pulse">● RUNNING</span>}
                </div>
                
                <div 
                  ref={logContainerRef}
                  className="h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar text-zinc-400 font-mono"
                >
                  {consoleLogs.map((log, index) => {
                    let color = "text-zinc-400";
                    if (log.includes("[SUCCESS]")) color = "text-amber-400";
                    if (log.includes("[WARNING]")) color = "text-orange-400";
                    if (log.includes("[ERROR]")) color = "text-red-500 font-bold";
                    
                    return (
                      <div key={index} className={`leading-relaxed ${color}`}>
                        {log}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Dashboard Tabs & Results */}
            {scanData && !scanning && (
              <div className="space-y-6">
                
                {/* Tabs bar */}
                <div className="flex border-b border-zinc-800/80 overflow-x-auto custom-scrollbar">
                  {[
                    { key: "overview", label: "Overview", icon: Activity },
                    { key: "issues", label: "Findings", icon: ShieldAlert },
                    { key: "headers", label: "Headers", icon: ServerCog },
                    { key: "cookies", label: "Cookies", icon: Cookie },
                    { key: "ssl", label: "SSL/TLS", icon: Lock },
                    { key: "firewall", label: "WAF/Shield", icon: Shield }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-1.5 px-4 py-3 border-b-2 font-mono text-xs uppercase font-bold transition-all whitespace-nowrap ${
                        activeTab === tab.key
                          ? "border-amber-500 text-amber-400 bg-amber-500/[0.02]"
                          : "border-transparent text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      <tab.icon className="h-3.5 w-3.5" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab content wrappers */}
                <div className="bg-zinc-950/10 border border-zinc-900 rounded-2xl p-6">
                  
                  {/* OVERVIEW TAB */}
                  {activeTab === "overview" && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-6 flex-wrap md:flex-nowrap">
                        <div className="h-24 w-24 rounded-full border-4 border-amber-500/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-4xl font-mono font-bold text-amber-400">{scanData.securityGrade || "C"}</span>
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-lg font-mono font-bold text-zinc-200">Security Grade Report</h3>
                          <p className="text-xs text-zinc-400 font-mono">
                            Scanned host {scanData.domain}. Detected {scanData.vulnerabilities?.length || 0} issues during configuration audits.
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="border border-zinc-900 bg-zinc-900/20 p-4 rounded-xl space-y-1.5">
                          <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-zinc-550">TLS Connection</span>
                          <p className={`text-sm font-mono font-bold ${scanData.ssl?.valid ? "text-emerald-450" : "text-red-400"}`}>
                            {scanData.ssl?.valid ? "Valid / Encrypted" : "Weak / Not Found"}
                          </p>
                        </div>
                        <div className="border border-zinc-900 bg-zinc-900/20 p-4 rounded-xl space-y-1.5">
                          <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-zinc-550">WAF Protection</span>
                          <p className="text-sm font-mono font-bold text-zinc-200">
                            {scanData.firewall?.detected ? `Active (${scanData.firewall.wafType})` : "No Firewall Detected"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FINDINGS TAB */}
                  {activeTab === "issues" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] uppercase font-mono font-bold text-zinc-500">Security Findings list</span>
                        <button
                          onClick={() => setShowOnlyFailures(prev => !prev)}
                          className={`flex items-center gap-1.5 text-[0.65rem] font-mono px-2 py-0.5 rounded-lg border transition-all ${
                            showOnlyFailures
                              ? "border-amber-500/40 text-amber-400 bg-amber-500/10"
                              : "border-zinc-700/60 text-zinc-500 hover:border-zinc-650"
                          }`}
                        >
                          <Filter className="h-3 w-3" />
                          {showOnlyFailures ? "High & Critical Only" : "Show All Risks"}
                        </button>
                      </div>

                      <div className="divide-y divide-zinc-900 border border-zinc-900 rounded-xl overflow-hidden max-h-[360px] overflow-y-auto">
                        {filteredIssues.map((v, i) => (
                          <div key={i} className="p-4 space-y-1 bg-zinc-950/15">
                            <div className="flex items-center justify-between gap-4">
                              <span className="font-mono text-xs font-bold text-zinc-200">{v.description}</span>
                              <SeverityBadge severity={v.severity} />
                            </div>
                            <p className="text-xs text-zinc-400 font-mono">{v.details}</p>
                            {v.recommendation && (
                              <p className="text-[10px] font-mono text-zinc-500 pt-1.5 border-t border-zinc-900/40">
                                <span className="text-amber-500 font-semibold uppercase">Remediation: </span>{v.recommendation}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* HEADERS TAB */}
                  {activeTab === "headers" && (
                    <div className="space-y-4 max-h-[360px] overflow-y-auto">
                      <table className="w-full text-left font-mono text-xs">
                        <thead>
                          <tr className="border-b border-zinc-900 text-zinc-500">
                            <th className="pb-2 font-semibold">Response Header</th>
                            <th className="pb-2 font-semibold">Value / Audit Check</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900">
                          {Object.entries(scanData.headers || {}).map(([key, val]) => (
                            <tr key={key} className="text-zinc-400">
                              <td className="py-2.5 pr-4 text-zinc-300 font-semibold">{key}</td>
                              <td className="py-2.5 break-all max-w-[200px] text-zinc-500">{String(val)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* COOKIES TAB */}
                  {activeTab === "cookies" && (
                    <div className="space-y-4">
                      {scanData.sessionManagement?.sessionCookies?.length > 0 ? (
                        <div className="space-y-4 max-h-[360px] overflow-y-auto">
                          {scanData.sessionManagement.sessionCookies.map((cookie, i) => (
                            <div key={i} className="border border-zinc-900 p-4 rounded-xl space-y-2 bg-zinc-900/10">
                              <div className="flex items-center justify-between border-b border-zinc-900 pb-1.5">
                                <span className="font-mono text-xs font-bold text-zinc-200">{cookie.name}</span>
                                <span className="text-[9px] uppercase tracking-wider font-mono text-zinc-500">Cookie Type</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-500">
                                <div>
                                  <span className="text-zinc-600 font-bold">HttpOnly:</span> {cookie.attributes?.httponly ? "Yes" : "No"}
                                </div>
                                <div>
                                  <span className="text-zinc-600 font-bold">Secure:</span> {cookie.attributes?.secure ? "Yes" : "No"}
                                </div>
                                <div>
                                  <span className="text-zinc-600 font-bold">SameSite:</span> {cookie.attributes?.samesite || "None"}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10 text-zinc-500 font-mono text-xs">
                          No session cookies were set by the target host response headers.
                        </div>
                      )}
                    </div>
                  )}

                  {/* SSL TAB */}
                  {activeTab === "ssl" && (
                    <div className="space-y-4">
                      {scanData.ssl ? (
                        <div className="space-y-3 font-mono text-xs text-zinc-400">
                          <div className="flex justify-between border-b border-zinc-900/60 pb-1.5">
                            <span className="text-zinc-500">Certificate Status:</span>
                            <span className={scanData.ssl.valid ? "text-emerald-450 font-bold" : "text-red-400 font-bold"}>
                              {scanData.ssl.valid ? "Valid" : "Invalid"}
                            </span>
                          </div>
                          {scanData.ssl.issuer && (
                            <div className="flex justify-between border-b border-zinc-900/60 pb-1.5">
                              <span className="text-zinc-500">Issuer Authority:</span>
                              <span className="text-zinc-300 text-right">{scanData.ssl.issuer}</span>
                            </div>
                          )}
                          {scanData.ssl.validFrom && (
                            <div className="flex justify-between border-b border-zinc-900/60 pb-1.5">
                              <span className="text-zinc-500">Issued On:</span>
                              <span className="text-zinc-300">{new Date(scanData.ssl.validFrom).toLocaleDateString()}</span>
                            </div>
                          )}
                          {scanData.ssl.validTo && (
                            <div className="flex justify-between border-b border-zinc-900/60 pb-1.5">
                              <span className="text-zinc-500">Expires On:</span>
                              <span className="text-zinc-300">{new Date(scanData.ssl.validTo).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-10 text-zinc-500 font-mono text-xs">
                          No SSL handshake metadata retrieved.
                        </div>
                      )}
                    </div>
                  )}

                  {/* WAF TAB */}
                  {activeTab === "firewall" && (
                    <div className="space-y-4">
                      <div className="font-mono text-xs text-zinc-400 space-y-2">
                        <div className="flex justify-between">
                          <span>WAF State:</span>
                          <span className="font-bold text-zinc-300">
                            {scanData.firewall?.detected ? "Shield Detected" : "No Shield"}
                          </span>
                        </div>
                        {scanData.firewall?.detected && (
                          <>
                            <div className="flex justify-between">
                              <span>WAF Provider:</span>
                              <span className="font-bold text-amber-400">{scanData.firewall.wafType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Detection Confidence:</span>
                              <span className="text-zinc-300 font-semibold">{scanData.firewall.confidence?.toUpperCase()}</span>
                            </div>
                          </>
                        )}
                      </div>

                      {scanData.firewall?.testResults?.length > 0 && (
                        <div className="border border-zinc-900 rounded-xl overflow-hidden mt-4">
                          <table className="w-full text-left font-mono text-[10px]">
                            <thead>
                              <tr className="bg-zinc-900/30 text-zinc-550 border-b border-zinc-900">
                                <th className="p-2 font-semibold">Test Probe</th>
                                <th className="p-2 font-semibold">HTTP Code</th>
                                <th className="p-2 font-semibold">Result</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-900 text-zinc-400">
                              {scanData.firewall.testResults.map((t, idx) => (
                                <tr key={idx}>
                                  <td className="p-2 font-bold text-zinc-350">{t.type}</td>
                                  <td className="p-2 text-zinc-500">{t.statusCode}</td>
                                  <td className={`p-2 font-semibold ${t.blocked ? "text-emerald-450" : "text-amber-400"}`}>
                                    {t.blocked ? "Blocked (Success)" : "Allowed"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                </div>

              </div>
            )}
            
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {scanData && !scanning ? (
              <div className="border border-amber-500/30 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-6 shadow-[0_8px_30px_rgb(0,0,0,0.15)] animate-[fadeIn_0.3s_ease-out]">
                <div className="text-center space-y-2">
                  <div className="inline-flex h-12 w-12 items-center justify-center border border-amber-500/25 text-amber-400 rounded-full bg-amber-500/10 mb-2">
                    {scanData.vulnerabilities?.length > 3 ? (
                      <ShieldAlert className="h-6 w-6" />
                    ) : (
                      <CheckCircle2 className="h-6 w-6" />
                    )}
                  </div>
                  <h3 className="text-xl font-mono font-bold text-zinc-100">Scan Complete</h3>
                  <p className="text-xs text-zinc-400">{scanData.domain}</p>
                </div>

                <div className="border-t border-zinc-800/40 pt-4 space-y-3 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Vulnerabilities:</span>
                    <span className="text-amber-400 font-bold font-mono">{scanData.vulnerabilities?.length || 0} Findings</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">SSL Certificate:</span>
                    <span className={`font-bold ${scanData.ssl?.valid ? "text-emerald-450" : "text-red-400"}`}>
                      {scanData.ssl?.valid ? "Valid" : "Weak/Expired"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Firewall Shield:</span>
                    <span className="text-zinc-200 font-bold">{scanData.firewall?.detected ? "Enabled" : "Disabled"}</span>
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
                <p className="text-sm font-mono uppercase tracking-wider font-semibold text-zinc-200">No Audit Executed</p>
                <p className="text-xs max-w-[240px] mx-auto leading-relaxed">
                  Provide a web URL target to trigger a secure audit of headers, SSL/TLS certifications, and cookie attributes.
                </p>
              </div>
            )}

            {/* Specifications sidebar card */}
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Info className="text-amber-400 w-4 h-4" />
                Audit Scope
              </h2>
              <ul className="space-y-3.5 list-none pl-0">
                {[
                  "Security Headers: Analyzes CSP directives, frame-ancestors parameters, HSTS preloads.",
                  "Cookie Protections: Evaluates SameSite properties, HttpOnly and Secure session values.",
                  "WAF Detection: Active checking logic detecting Cloudflare, AWS WAF, and others.",
                  "SSL/TLS Handsake: Audits validity dates, certificate expiry, and signature keys."
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
