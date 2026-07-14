"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Terminal, 
  Download, 
  ShieldCheck, 
  Award, 
  FileText, 
  Loader2, 
  Cloud,
  Key,
  Info,
  Globe,
  Settings,
  AlertTriangle,
  Lock,
  CheckCircle,
  Eye,
  Filter
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
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
      <span className="inline-flex items-center gap-1 text-emerald-400 font-mono text-xs font-semibold">
        <CheckCircle className="h-3.5 w-3.5" />
        PASS
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-red-400 font-mono text-xs font-semibold">
      <AlertTriangle className="h-3.5 w-3.5" />
      FAIL
    </span>
  );
}

export default function CloudSecurityPage() {
  const router = useRouter();
  const protectedAction = useProtectedAction();

  // Connection fields
  const [target, setTarget] = useState("AWS-Production-Profile");
  const [provider, setProvider] = useState("AWS");
  const [awsAccessKeyId, setAwsAccessKeyId] = useState("");
  const [awsSecretAccessKey, setAwsSecretAccessKey] = useState("");
  const [awsSessionToken, setAwsSessionToken] = useState("");

  const [scanning, setScanning] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [reportReady, setReportReady] = useState(false);
  const [results, setResults] = useState([]);
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

  // Handle audit execution
  const handleStartScan = async (e) => {
    e.preventDefault();
    if (!target.trim()) return;

    setScanning(true);
    setReportReady(false);
    setErrorMsg("");
    setConsoleLogs([]);

    const addLog = (msg, delay = 0) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          setConsoleLogs((prev) => [...prev, msg]);
          resolve();
        }, delay);
      });
    };

    // Client side progress updates
    await addLog("[INFO] Starting Cloud Credential Validation audit workspace...", 100);
    await addLog(`[INFO] Selected cloud target: ${target} [Provider: ${provider}]`, 150);

    if (awsAccessKeyId) {
      await addLog("[INFO] Programmatic credentials supplied. Initializing active Signature V4 signer...", 200);
      await addLog("[INFO] Generating query credentials payload...", 200);
    } else {
      await addLog("[INFO] No access keys supplied. Executing audit in sandbox/simulation mode...", 200);
      await addLog("[INFO] Initializing sandbox environment profiles...", 200);
    }

    const API_BASE = (process.env.NEXT_PUBLIC_PROD_API_URL || "").replace(/\/+$/, "");

    await protectedAction(async (token) => {
      try {
        await addLog("[INFO] Establishing connection to backend audit engine...", 100);
        
        const res = await fetch(`${API_BASE}/cloud-security/audit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            target: target.trim(),
            awsAccessKeyId: awsAccessKeyId.trim() || undefined,
            awsSecretAccessKey: awsSecretAccessKey.trim() || undefined,
            awsSessionToken: awsSessionToken.trim() || undefined
          })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to complete credential audit.");
        }

        await addLog("[INFO] Backend responded. Processing AWS service output logs...", 150);
        await addLog("[INFO] Parsing IAM credential report CSV data...", 150);
        
        // Dynamic logs based on results
        const hasRootKeys = data.findings.some(f => f.control === 'Root Access Keys' && f.status === 'Fail');
        const hasRootMfa = data.findings.some(f => f.control === 'Root Account MFA' && f.status === 'Fail');
        const hasUserMfa = data.findings.some(f => f.control === 'MFA Enforcement (IAM)' && f.status === 'Fail');
        
        if (hasRootMfa) await addLog("[ALERT] Root account lacks active Multi-Factor Authentication device!", 100);
        if (hasRootKeys) await addLog("[ALERT] Found programmatic access keys active on Root account!", 100);
        if (hasUserMfa) await addLog("[WARNING] Found IAM users with console login permissions lacking MFA!", 100);
        
        await addLog("[INFO] Validating policy rotation configurations...", 100);
        await addLog("[INFO] Resolving least privilege boundary maps...", 150);
        await addLog("[SUCCESS] Compliance scorecard and reports generated.", 150);

        setResults(data.findings || []);
        setSummaryText(data.summary || "");
        setRiskScore(data.riskScore || 0);
        setReportReady(true);
      } catch (err) {
        await addLog(`[ERROR] Audit process failed: ${err.message}`, 100);
        setErrorMsg(err.message);
      } finally {
        setScanning(false);
      }
    });
  };

  // Filtered findings list
  const filteredFindings = useMemo(() => {
    return showOnlyFailures ? results.filter(f => f.status === "Fail") : results;
  }, [results, showOnlyFailures]);

  // Dynamic PDF report generation matching standard layout guidelines
  const handleDownloadPDF = () => {
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
    doc.text("CLOUD SECURITY - CREDENTIAL VALIDATION REPORT", M, 55);
    y = 110;
    
    // Scan Meta Info
    doc.setTextColor(50, 50, 50);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Target Target: ${target}`, M, y);
    doc.text(`Cloud Provider: ${provider}`, M, y + 15);
    doc.text(`Audit Date: ${new Date().toLocaleString()}`, M, y + 30);
    doc.text(`Consolidated Risk Score: ${riskScore}/100`, M, y + 45);
    y += 70;
    
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
    const splitSummary = doc.splitTextToSize(
      summaryText || "Assessment evaluated the cloud environment configuration, identity profiles, and credential access keys against standard CIS Cloud Benchmarks.", 
      doc.internal.pageSize.width - (M * 2)
    );
    doc.text(splitSummary, M, y);
    y += splitSummary.length * 12 + 15;

    // Findings Table
    const headers = [["Control Checked", "Status", "Severity", "Details", "Remediation Guide"]];
    const tableData = results.map(finding => [
      finding.control,
      finding.status,
      finding.severity,
      finding.details,
      finding.remediation
    ]);

    doc.autoTable({
      head: headers,
      body: tableData,
      startY: y,
      theme: "striped",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [245, 158, 11], textColor: [255, 255, 255] },
      margin: { left: M, right: M }
    });
    
    doc.save(`Nexcore-credential-validation-report-${Date.now()}.pdf`);
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
        .tool-detail-page ::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 158, 11, 0.55) !important;
        }
        .tool-detail-page ::selection {
          background: rgba(245, 158, 11, 0.22) !important;
          color: #fffbeb !important;
        }
        .bns-loading-card p, .bns-loading-card span {
          color: #f4f4f5 !important;
        }
        .bns-preset-btn.active {
          border-color: rgba(245, 158, 11, 0.6) !important;
          background: rgba(245, 158, 11, 0.08) !important;
          color: #f4f4f5 !important;
        }
        .bns-preset-btn.active * {
          color: inherit !important;
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
            <Cloud className="h-8 w-8 text-amber-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              CREDENTIAL <span className="text-amber-400">VALIDATION</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Audit cloud access keys, user profiles, MFA enforcement, and IAM policies. Supports secure programmatic AWS scans using temporary credentials.
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
                <Settings className="h-5 w-5 text-amber-400" />
                Connection Profile & API Keys
              </h2>
              
              <form onSubmit={handleStartScan} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                      Cloud Provider
                    </label>
                    <select
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                      disabled={scanning}
                      className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3 text-sm focus:border-amber-500/50 focus:outline-none transition-all font-mono"
                    >
                      <option value="AWS" className="bg-zinc-950 text-zinc-100">AWS (Amazon Web Services)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                      Profile / Environment Name
                    </label>
                    <input 
                      type="text" 
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      disabled={scanning}
                      placeholder="e.g. AWS-Production"
                      className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3 text-sm focus:border-amber-500/50 focus:outline-none transition-all font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="border-t border-zinc-800/40 my-3 pt-3 space-y-4">
                  <div className="border border-amber-500/10 p-3.5 rounded-xl">
                    <p className="text-[0.68rem] text-zinc-400 font-mono leading-relaxed flex items-start gap-2">
                      <Lock className="h-4.5 w-4.5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span>
                        <b>Optional:</b> Enter temporary AWS Access Keys below to query a live AWS account. Credentials are not stored on disk and are only used in memory for Signature V4 request signing. Leave blank for simulated sandbox audits.
                      </span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[0.62rem] uppercase tracking-wider font-mono text-zinc-400 mb-1.5 font-bold">
                        AWS Access Key ID
                      </label>
                      <input 
                        type="text"
                        value={awsAccessKeyId}
                        onChange={(e) => setAwsAccessKeyId(e.target.value)}
                        disabled={scanning}
                        placeholder="AKIA..."
                        className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-2.5 text-xs focus:border-amber-500/50 focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[0.62rem] uppercase tracking-wider font-mono text-zinc-400 mb-1.5 font-bold">
                        AWS Secret Access Key
                      </label>
                      <input 
                        type="password"
                        value={awsSecretAccessKey}
                        onChange={(e) => setAwsSecretAccessKey(e.target.value)}
                        disabled={scanning}
                        placeholder="••••••••••••••••"
                        className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-2.5 text-xs focus:border-amber-500/50 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[0.62rem] uppercase tracking-wider font-mono text-zinc-400 mb-1.5 font-bold">
                      AWS Session Token (Optional)
                    </label>
                    <input 
                      type="text"
                      value={awsSessionToken}
                      onChange={(e) => setAwsSessionToken(e.target.value)}
                      disabled={scanning}
                      placeholder="IQoJb3JpZ2luX2Vj..."
                      className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-2.5 text-xs focus:border-amber-500/50 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    disabled={scanning}
                    className="w-full bns-submit-btn rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 focus:outline-none disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {scanning ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Auditing IAM Credentials...
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4" />
                        Run Credential Validation Audit
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="border border-red-500/30 bg-red-500/10 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-mono font-semibold text-red-400">Scan Execution Error</p>
                  <p className="text-xs text-red-300/70 mt-1 leading-relaxed">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* Console Output */}
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

            {/* Detailed Findings Table */}
            {reportReady && results.length > 0 && !scanning && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs uppercase font-mono font-bold text-zinc-300">Compliance Audit Controls</span>
                  <button
                    onClick={() => setShowOnlyFailures(prev => !prev)}
                    className={`flex items-center gap-1.5 text-[0.65rem] font-mono px-2.5 py-1.2 rounded-lg border transition-all ${
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
                    {filteredFindings.map((finding, idx) => (
                      <div key={idx} className="p-4 bg-zinc-950/10 space-y-2 hover:bg-amber-500/[0.02] transition-all">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="font-mono text-sm font-bold text-zinc-200">{finding.control}</span>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={finding.status} />
                            <SeverityBadge severity={finding.severity} />
                          </div>
                        </div>
                        <p className="text-xs text-zinc-400 font-mono leading-relaxed">{finding.details}</p>
                        {finding.status === "Fail" && (
                          <div className="border-t border-dashed border-zinc-850 pt-2 text-[0.68rem] font-mono text-zinc-500">
                            <span className="text-amber-500 font-semibold uppercase">Remediation Guide: </span>
                            {finding.remediation}
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
                    {riskScore > 30 ? (
                      <AlertTriangle className="h-6 w-6" />
                    ) : (
                      <ShieldCheck className="h-6 w-6" />
                    )}
                  </div>
                  <h3 className="text-xl font-mono font-bold text-zinc-100">Audit Complete</h3>
                  <p className="text-xs text-zinc-400">{target}</p>
                </div>

                <div className="border-t border-zinc-800/40 pt-4 space-y-3 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Total Controls:</span>
                    <span className="text-zinc-200 font-bold">{results.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Controls Failed:</span>
                    <span className="text-orange-400 font-bold">{results.filter(f => f.status === 'Fail').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Risk Score:</span>
                    <span className={`font-bold ${riskScore > 50 ? "text-red-500" : riskScore > 20 ? "text-amber-400" : "text-emerald-400"}`}>{riskScore}/100</span>
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
                  Specify target credentials and run the validation audit to generate consolidated assessment findings.
                </p>
              </div>
            )}

            {/* Specs & Guidance sidebar card */}
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Info className="text-amber-400 w-4 h-4" />
                Audit Scope (CIS Benchmarks)
              </h2>
              <ul className="space-y-3.5 list-none pl-0">
                {[
                  "Root MFA Device: Check dual-factor authentication on root account.",
                  "Root Access Keys: Flags dangerous programmatic access keys enabled on root.",
                  "User MFA Audits: Assesses group mappings for console users lacking MFA setup.",
                  "Credential Rotations: Identifies active IAM profile access keys exceeding 90-day lifespans.",
                  "Account Inactivity: Spotlights active credential patterns dormant for 120+ days."
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
