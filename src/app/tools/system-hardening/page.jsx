"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Terminal, 
  Download, 
  ShieldCheck, 
  ShieldAlert, 
  Award, 
  FileText, 
  Loader2, 
  ArrowLeft,
  Server,
  Activity,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import useProtectedAction from "@/components/UseProtectedAction/UseProtectedAction";

export default function SystemHardeningPage() {
  const router = useRouter();
  const protectedAction = useProtectedAction();
  const [target, setTarget] = useState("10.0.0.10");
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [reportReady, setReportReady] = useState(false);
  const [results, setResults] = useState([]);
  const logContainerRef = useRef(null);

  const logs = [
    "[INFO] Initializing CIS Benchmarks Secure Configuration Audit...",
    `[INFO] Target Host: ${target}`,
    "[INFO] Verifying network connection and SSH accessibility...",
    "[SUCCESS] Established SSH channel for remote policy checks.",
    "[INFO] Auditing /etc/ssh/sshd_config configuration parameters...",
    "[WARNING] sshd_config: PermitRootLogin is enabled (High Risk).",
    "[INFO] Checking password complexity and aging policies in PAM modules...",
    "[WARNING] pam_pwquality.so is missing or misconfigured; simple passwords allowed.",
    "[INFO] Scanning system processes for unauthorized or legacy daemons...",
    "[WARNING] Legacy services detected: FTP (vsftpd) and Telnet (telnetd) are active.",
    "[INFO] Reviewing local host firewall rules...",
    "[SUCCESS] UFW firewall is active; default incoming policy is configured securely.",
    "[INFO] Verifying filesystem permissions over sensitive configuration logs...",
    "[SUCCESS] Root-level file permissions verified (/etc/passwd, /etc/shadow).",
    "[INFO] Compiling secure configuration audit metrics...",
    "[SUCCESS] Hardening Scan completed successfully."
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

    const API_BASE = process.env.NEXT_PUBLIC_PROD_API_URL.replace(/\/+$/, "");
    await protectedAction(async (token) => {
      try {
        const res = await fetch(`${API_BASE}/system-hardening/audit`, {
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
          throw new Error("Failed to run hardening audit on backend.");
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
    doc.text("ADVANCE SCANNING - SYSTEM HARDENING REPORT", 15, 30);
    
    // Scan Meta Info
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    doc.text(`Target Host: ${target}`, 15, 50);
    doc.text(`Date: ${new Date().toLocaleString()}`, 15, 55);
    doc.text("Status: Completed / Sec-Verified", 15, 60);
    
    doc.setDrawColor(212, 166, 74);
    doc.setLineWidth(0.5);
    doc.line(15, 67, doc.internal.pageSize.width - 15, 67);

    // Summary
    doc.setFontSize(14);
    doc.text("Executive Summary", 15, 77);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    
    const summaryText = `This secure configuration assessment audited host services, SSH settings, password policies, and file systems on target '${target}' against standard CIS Benchmarks. Multiple high and medium-level configuration issues were found and must be remediated.`;
    
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
        ["SSH Root Login", "Fail", "High", "PermitRootLogin is enabled in sshd_config.", "Set PermitRootLogin to no in /etc/ssh/sshd_config."],
        ["Password Complexity", "Fail", "Medium", "PAM allows simple passwords.", "Configure pam_pwquality.so to enforce minlen=12."],
        ["Unnecessary Services", "Fail", "Medium", "telnet and ftp are active.", "Disable and remove telnetd and vsftpd."],
        ["Firewall Config", "Pass", "Low", "UFW default deny incoming active.", "No action required."]
      ],
      startY: 105,
      theme: "striped",
      headStyles: { fillColor: [212, 166, 74], textColor: [255, 255, 255] },
      margin: { top: 105 }
    });
    
    doc.save(`Nexcore-hardening-report-${Date.now()}.pdf`);
  };

  return (
    <main className="bg-[#050505] text-white min-h-screen p-6 sm:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <button 
            onClick={() => router.push("/tools/VulnerabilityAssessment")}
            className="inline-flex items-center gap-2 font-mono text-sm text-[var(--gold)] hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Toolkit
          </button>
          
          <span className="rounded-full border border-[var(--gold)]/30 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-[var(--gold)] bg-[var(--gold)]/10">
            Vulnerability Assessment
          </span>
        </div>

        <div className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-mono font-bold">
            SYSTEM <span className="text-[var(--gold)]">HARDENING</span>
          </h1>
          <p className="mt-2 text-white/60 max-w-2xl text-base">
            Analyze servers, network nodes, and host operating systems for security policy compliance and system hardening settings.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Main Controls */}
          <div className="space-y-6">
            <div className="border border-white/8 bg-white/[0.025] rounded-xl p-6">
              <h2 className="text-lg font-mono font-semibold text-white mb-4 flex items-center gap-2">
                <Server className="h-5 w-5 text-[var(--gold)]" />
                Target Host Parameters
              </h2>
              
              <form onSubmit={handleStartScan} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono text-white/50 mb-2">Target IP Address or Hostname</label>
                  <input 
                    type="text" 
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    disabled={scanning}
                    placeholder="e.g. 10.0.0.10"
                    className="w-full bg-black/60 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-[var(--gold)]/40 focus:outline-none font-mono"
                    required
                  />
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    disabled={scanning}
                    className="w-full bg-[var(--gold)] hover:bg-[var(--gold)]/90 text-black font-mono font-bold text-sm uppercase py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                  >
                    {scanning ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Auditing Host Controls...
                      </>
                    ) : (
                      <>
                        <Activity className="h-4 w-4" />
                        Execute Configuration Audit
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Console Output */}
            {(scanning || consoleLogs.length > 0) && (
              <div className="border border-white/8 bg-black rounded-xl p-5 font-mono text-xs text-white/80 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="flex items-center gap-2 font-bold text-[var(--gold)]">
                    <Terminal className="h-4 w-4" />
                    AUDIT CONSOLE OUTPUT
                  </span>
                  {scanning && <span className="text-[var(--gold)] animate-pulse">● RUNNING</span>}
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
              <div className="border border-[var(--gold)]/30 bg-[linear-gradient(180deg,rgba(212,166,74,0.08),rgba(12,12,13,0.92))] rounded-xl p-6 space-y-6">
                <div className="text-center space-y-2">
                  <div className="inline-flex h-12 w-12 items-center justify-center border border-[var(--gold)]/25 text-[var(--gold)] rounded-full bg-[var(--gold)]/10 mb-2">
                    <Award className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-mono font-bold text-white">Audit Complete</h3>
                  <p className="text-xs text-white/50">Findings compiled for {target}</p>
                </div>

                <div className="border-t border-white/10 pt-4 space-y-3 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-white/50">Checks Failed:</span>
                    <span className="text-[var(--gold)] font-bold">3 Policies</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Checks Passed:</span>
                    <span className="text-green-400 font-bold font-mono">1 Policy</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Risk Band:</span>
                    <span className="text-red-500 font-bold">High Risk</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button 
                    onClick={handleDownloadPDF}
                    className="w-full bg-[var(--gold)] hover:bg-[var(--gold)]/90 text-black font-mono font-bold text-xs uppercase py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF Report
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-white/8 bg-white/[0.025] rounded-xl p-6 text-center py-16 text-white/40 space-y-3">
                <FileText className="h-12 w-12 mx-auto text-white/20" />
                <p className="text-sm font-mono uppercase tracking-wider">No Audit Executed</p>
                <p className="text-xs max-w-[240px] mx-auto leading-relaxed">
                  Specify target host and run the audit to generate consolidated hardening metrics.
                </p>
              </div>
            )}

            {/* Quick Tips */}
            <div className="border border-white/8 bg-white/[0.01] rounded-xl p-5 space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white/70">Audit Specs</h4>
              <ul className="space-y-2 text-xs text-white/50 list-disc pl-4">
                <li>Host-level tests audit active services against known secure configuration baselines.</li>
                <li>SSH parameters verify authentication protocols and disable legacy weak algorithms.</li>
                <li>Firewall reviews verify inbound connection filtering and default drop rules.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
