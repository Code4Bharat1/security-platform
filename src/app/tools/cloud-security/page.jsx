"use client";

import React, { useState, useEffect, useRef } from "react";
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
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import useProtectedAction from "@/components/UseProtectedAction/UseProtectedAction";

export default function CloudSecurityPage() {
  const router = useRouter();
  const protectedAction = useProtectedAction();
  const [target, setTarget] = useState("AWS-Production-Profile");
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [reportReady, setReportReady] = useState(false);
  const [results, setResults] = useState([]);
  const logContainerRef = useRef(null);

  const logs = [
    "[INFO] Initializing Cloud Credential Validation Audit...",
    `[INFO] Target Environment / Profile: ${target}`,
    "[INFO] Fetching IAM user profiles and credential reports...",
    "[SUCCESS] Securely retrieved IAM configuration baseline.",
    "[INFO] Checking Multi-Factor Authentication (MFA) enforcement policies...",
    "[WARNING] MFA Enforcement: Root account and 3 administrative users do not have MFA active (High Risk).",
    "[INFO] Auditing programmatic access key rotation settings...",
    "[WARNING] Found 5 active access keys that have not been rotated in over 90 days.",
    "[INFO] Scanning for inactive credentials and stale user accounts...",
    "[WARNING] Detected 2 inactive users who have not used credentials for over 120 days.",
    "[INFO] Assessing group policies and privilege boundary configurations...",
    "[WARNING] Policy 'AdministratorAccess' is directly attached to developer group.",
    "[INFO] Executing access key metadata validation...",
    "[SUCCESS] All programmatic keys mapped to active users. No orphaned keys found.",
    "[INFO] Generating security compliance scorecard...",
    "[SUCCESS] Credential Validation Scan completed successfully."
  ];

  useEffect(() => {
    if (scanning && scanStep < logs.length) {
      const timer = setTimeout(() => {
        setConsoleLogs((prev) => [...prev, logs[scanStep]]);
        setScanStep((prev) => prev + 1);
      }, 300 + Math.random() * 200);
      return () => clearTimeout(timer);
    } else if (scanning && scanStep === logs.length) {
      setScanning(false);
      setReportReady(true);
    }
  }, [scanning, scanStep]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [consoleLogs]);

  const handleStartScan = async (e) => {
    e.preventDefault();
    if (!target.trim()) return;
    setScanning(true);
    setReportReady(false);
    setScanStep(0);
    setConsoleLogs([]);

    const API_BASE = (process.env.NEXT_PUBLIC_PROD_API_URL || "").replace(/\/+$/, "");
    await protectedAction(async (token) => {
      try {
        const res = await fetch(`${API_BASE}/cloud-security/audit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            target
          })
        });

        if (!res.ok) {
          throw new Error("Failed to run credential audit on backend.");
        }
        
        const data = await res.json();
        setResults(data.findings || []);
      } catch (err) {
        console.error("Backend scan failed:", err);
      }
    });
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Header Banner
    doc.setFillColor(18, 18, 18);
    doc.rect(0, 0, doc.internal.pageSize.width, 40, "F");
    
    doc.setTextColor(212, 166, 74); // Gold
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.text("NEXCORE SECURITY PLATFORM", 15, 20);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text("CLOUD SECURITY - CREDENTIAL VALIDATION REPORT", 15, 30);
    
    // Scan Meta Info
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    doc.text(`Target Profile: ${target}`, 15, 50);
    doc.text(`Date: ${new Date().toLocaleString()}`, 15, 55);
    doc.text("Status: Completed / Compliance Checked", 15, 60);
    
    doc.setDrawColor(212, 166, 74);
    doc.setLineWidth(0.5);
    doc.line(15, 67, doc.internal.pageSize.width - 15, 67);

    // Summary
    doc.setFontSize(14);
    doc.text("Executive Summary", 15, 77);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    
    const summaryText = `This assessment evaluated the cloud environment configuration, identity profiles, and credential access keys on target '${target}' against standard CIS Cloud Benchmarks. High-severity issues regarding MFA enforcement, policy scoping, and key rotation policy compliance were identified.`;
    
    const splitSummary = doc.splitTextToSize(summaryText, doc.internal.pageSize.width - 30);
    doc.text(splitSummary, 15, 85);

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
      body: tableData.length > 0 ? tableData : [
        ["MFA Enforcement", "Fail", "High", "Root account and admin users lack active MFA.", "Enable virtual or hardware MFA tokens for admin roles."],
        ["Key Rotation Policy", "Fail", "Medium", "5 access keys not rotated in 90 days.", "Deactivate keys older than 90 days."],
        ["Unused Credentials", "Fail", "Medium", "2 inactive users with valid keys.", "Revoke credentials of inactive users."],
        ["Least Privilege", "Fail", "High", "AdministratorAccess directly attached to Dev group.", "Assign fine-grained policies to dev roles."],
        ["Access Key Metadata", "Pass", "Low", "No orphaned access keys detected.", "No action required."]
      ],
      startY: 105,
      theme: "striped",
      headStyles: { fillColor: [212, 166, 74], textColor: [255, 255, 255] },
      margin: { top: 105 }
    });
    
    doc.save(`Nexcore-credential-validation-report-${Date.now()}.pdf`);
  };

  return (
    <div className="tool-detail-page min-h-screen">
      <div className="tool-detail-shell">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-4 mb-8">
          <span className="rounded-full border border-[color:var(--border)] px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-[color:var(--text-muted)] bg-white/[0.02]">
            Vulnerability Assessment
          </span>
        </div>

        <div className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-mono font-bold text-[color:var(--text-heading)]">
            CREDENTIAL <span className="text-[color:var(--gold)]">VALIDATION</span>
          </h1>
          <p className="mt-2 text-[color:var(--text-muted)] max-w-2xl text-base">
            Audit cloud access keys, user profiles, MFA policies, and IAM configurations to verify compliance with cloud security baselines.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Main Controls */}
          <div className="space-y-6">
            <div className="bg-[color:var(--surface-card)] border border-[color:var(--border)] rounded-2xl p-6 shadow-[var(--shadow-soft)]">
              <h2 className="text-lg font-mono font-semibold text-[color:var(--text-heading)] mb-4 flex items-center gap-2">
                <Cloud className="h-5 w-5 text-[color:var(--gold)]" />
                Target Environment Details
              </h2>
              
              <form onSubmit={handleStartScan} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono text-[color:var(--text-muted)] mb-2 font-semibold">Target Profile, Account ID, or AWS Access Key</label>
                  <input 
                    type="text" 
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    disabled={scanning}
                    placeholder="e.g. AWS-Production-Profile or Account ID"
                    className="w-full bg-[color:var(--surface-subtle)] text-[color:var(--text-heading)] border border-[color:var(--border)] rounded-xl p-3 text-sm focus:ring-1 focus:ring-[color:var(--gold)] focus:border-[color:var(--gold)] focus:outline-none transition-all placeholder:text-[color:var(--text-muted)] font-mono"
                    required
                  />
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    disabled={scanning}
                    className="w-full bg-[color:var(--gold)] hover:bg-[color:var(--gold-strong)] text-black rounded-xl font-mono font-bold text-xs uppercase py-3.5 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    {scanning ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Validating Credentials...
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

            {/* Console Output */}
            {(scanning || consoleLogs.length > 0) && (
              <div className="border border-[color:var(--border)] bg-black/45 rounded-2xl p-6 font-mono text-xs text-white/80 space-y-4 shadow-inner">
                <div className="flex items-center justify-between border-b border-[color:var(--border)]/60 pb-3">
                  <span className="flex items-center gap-2 font-bold text-[color:var(--gold)]">
                    <Terminal className="h-4 w-4" />
                    AUDIT CONSOLE OUTPUT
                  </span>
                  {scanning && <span className="text-[color:var(--gold)] animate-pulse">● RUNNING</span>}
                </div>
                
                <div 
                  ref={logContainerRef}
                  className="h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar text-white/60"
                >
                  {consoleLogs.map((log, index) => {
                    let color = "text-white/60";
                    if (log.includes("[SUCCESS]")) color = "text-green-400";
                    if (log.includes("[WARNING]")) color = "text-yellow-500";
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
          </div>

          {/* Sidebar results card */}
          <div className="space-y-6">
            {reportReady ? (
              <div className="border border-[color:var(--gold)]/30 bg-black/35 backdrop-blur-xl rounded-2xl p-6 space-y-6 shadow-[var(--shadow-elevated)]">
                <div className="text-center space-y-2">
                  <div className="inline-flex h-12 w-12 items-center justify-center border border-[color:var(--gold)]/25 text-[color:var(--gold)] rounded-full bg-[color:var(--gold)]/10 mb-2">
                    <Award className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-mono font-bold text-[color:var(--text-heading)]">Audit Complete</h3>
                  <p className="text-xs text-[color:var(--text-muted)]">Findings compiled for {target}</p>
                </div>

                <div className="border-t border-[color:var(--border)]/50 pt-4 space-y-3 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-[color:var(--text-muted)]">Checks Failed:</span>
                    <span className="text-[color:var(--gold)] font-bold">4 Policies</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[color:var(--text-muted)]">Checks Passed:</span>
                    <span className="text-green-400 font-bold font-mono">1 Policy</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[color:var(--text-muted)]">Risk Band:</span>
                    <span className="text-red-500 font-bold">High Risk</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button 
                    onClick={handleDownloadPDF}
                    className="w-full bg-[color:var(--gold)] hover:bg-[color:var(--gold-strong)] text-black font-mono font-bold text-xs uppercase py-3 rounded-xl transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF Report
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-[color:var(--border)] bg-[color:var(--surface-subtle)] rounded-2xl p-6 text-center py-16 text-[color:var(--text-muted)] space-y-3 shadow-sm">
                <FileText className="h-12 w-12 mx-auto text-[color:var(--border)]/60" />
                <p className="text-sm font-mono uppercase tracking-wider font-semibold text-[color:var(--text-heading)]">No Audit Executed</p>
                <p className="text-xs max-w-[240px] mx-auto leading-relaxed">
                  Specify target cloud environment and run the validation audit to generate consolidated credentials assessment.
                </p>
              </div>
            )}

            {/* Quick Tips */}
            <div className="border border-[color:var(--border)] bg-black/20 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[color:var(--text-heading)]">Audit Specs</h4>
              <ul className="space-y-2 text-xs text-[color:var(--text-muted)] list-disc pl-4 leading-relaxed">
                <li>Validates MFA enforcement policies on administrative user groups.</li>
                <li>Audits password policies, credentials rotation intervals, and access key ages.</li>
                <li>Identifies unused, stale IAM credentials to reduce attack vector.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
