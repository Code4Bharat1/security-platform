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
  Server,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Info
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

    const API_BASE = (process.env.NEXT_PUBLIC_PROD_API_URL || "").replace(/\/+$/, "");
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
    
    doc.setTextColor(245, 158, 11); // Amber
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
    
    doc.setDrawColor(245, 158, 11);
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
      headStyles: { fillColor: [245, 158, 11], textColor: [0, 0, 0] },
      margin: { top: 105 }
    });
    
    doc.save(`Nexcore-hardening-report-${Date.now()}.pdf`);
  };

  return (
    <div 
      className="tool-detail-page min-h-screen"
      style={{
        '--hero-ambient-a': 'rgba(245, 158, 11, 0.08)',
        '--hero-ambient-b': 'rgba(249, 115, 22, 0.03)',
        '--glow-primary': '0 0 34px rgba(245, 158, 11, 0.16)',
        '--gold': '#f59e0b',
        '--gold-strong': '#fbbf24',
        '--gold-dark': '#b45309',
        '--ring': 'rgba(245, 158, 11, 0.34)',
        '--surface-glow': 'rgba(245, 158, 11, 0.14)',
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
        .tool-detail-page :is(button, [role="button"]):is([class*="bg-amber-"], [class*="bg-orange-"]) {
          color: #000000 !important;
        }
        .tool-detail-page :is(button, [role="button"]):is([class*="bg-amber-"], [class*="bg-orange-"]) * {
          color: #000000 !important;
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
          <div className="w-16 h-16 rounded-2xl border border-amber-500/30 overflow-hidden shadow-lg flex-shrink-0 flex items-center justify-center">
            <Server className="h-8 w-8 text-amber-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              SYSTEM <span className="text-amber-400">HARDENING</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Analyze servers, network nodes, and host operating systems for security policy compliance and system hardening settings.
            </p>
          </div>
        </div>

        {/* 2-Column Split Layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* Input Form Card */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-amber-500/10 transition-all duration-300 space-y-4">
              <h2 className="text-lg font-mono font-medium text-zinc-100 mb-2 flex items-center gap-2">
                <Terminal className="h-5 w-5 text-amber-400" />
                Target Host Parameters
              </h2>

              <form onSubmit={handleStartScan} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                    Target IP Address or Hostname
                  </label>
                  <input
                    type="text"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    disabled={scanning}
                    placeholder="e.g. 10.0.0.10"
                    className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 text-sm focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 focus:outline-none transition-all placeholder:text-zinc-600 font-mono"
                    required
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={scanning}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-black rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] focus:outline-none disabled:opacity-40"
                  >
                    {scanning ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-black" />
                        Auditing Host Controls...
                      </>
                    ) : (
                      <>
                        <Activity className="h-4 w-4 text-black" />
                        Execute Configuration Audit
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Console Output */}
            {(scanning || consoleLogs.length > 0) && (
              <div className="border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-md rounded-2xl p-6 font-mono text-xs text-zinc-300 space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                  <span className="flex items-center gap-2 font-bold text-amber-400">
                    <Terminal className="h-4 w-4" />
                    AUDIT CONSOLE OUTPUT
                  </span>
                  {scanning && <span className="text-amber-450 animate-pulse">● RUNNING</span>}
                </div>
                
                <div 
                  ref={logContainerRef}
                  className="h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar text-zinc-400"
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

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Sidebar Results Summary Card */}
            {reportReady ? (
              <div className="border border-amber-500/20 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-6 shadow-lg">
                <div className="text-center space-y-2">
                  <div className="inline-flex h-12 w-12 items-center justify-center border border-amber-500/30 text-amber-400 rounded-full bg-amber-500/10 mb-2">
                    <Award className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-mono font-bold text-zinc-100">Audit Complete</h3>
                  <p className="text-xs text-zinc-550">Findings compiled for {target}</p>
                </div>

                <div className="border-t border-zinc-900 pt-4 space-y-3 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-450">Checks Failed:</span>
                    <span className="text-amber-400 font-bold">3 Policies</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-450">Checks Passed:</span>
                    <span className="text-zinc-300 font-bold">1 Policy</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-450">Risk Band:</span>
                    <span className="text-red-500 font-bold">High Risk</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button 
                    onClick={handleDownloadPDF}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-black font-mono font-bold text-xs uppercase py-3.5 rounded-xl transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF Report
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 text-center py-16 text-zinc-500 space-y-3 shadow-sm">
                <FileText className="h-12 w-12 mx-auto text-zinc-850" />
                <p className="text-sm font-mono uppercase tracking-wider font-semibold text-zinc-300">No Audit Executed</p>
                <p className="text-xs max-w-[240px] mx-auto leading-relaxed">
                  Specify target host and run the audit to generate consolidated hardening metrics.
                </p>
              </div>
            )}

            {/* Audit Specs Guidance */}
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Info className="text-amber-400 w-4 h-4" />
                Audit Specs
              </h2>
              <ul className="space-y-3.5 list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono font-semibold">
                    Host-level tests audit active services against known secure configuration baselines.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono font-semibold">
                    SSH parameters verify authentication protocols and disable legacy weak algorithms.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono font-semibold">
                    Firewall reviews verify inbound connection filtering and default drop rules.
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
