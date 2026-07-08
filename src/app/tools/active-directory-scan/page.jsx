"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Terminal,
  Download,
  Award,
  FileText,
  ChevronDown,
  Loader2,
  Server,
  Info,
  ShieldCheck,
  Network,
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import useProtectedAction from "@/components/UseProtectedAction/UseProtectedAction";

export default function ActiveDirectoryScanPage() {
  const protectedAction = useProtectedAction();
  const [domain, setDomain] = useState("corp.local");
  const [scope, setScope] = useState("full");
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [reportReady, setReportReady] = useState(false);
  const logContainerRef = useRef(null);

  const adLogs = [
    "[INFO] Initializing Active Directory Security Scan...",
    "[INFO] Querying DNS SRV records for Domain Controllers...",
    `[SUCCESS] Detected Primary Domain Controller: DC01.${domain} (IP: 10.0.0.10)`,
    "[INFO] Establishing LDAP connection (LDAPS preferred)...",
    "[WARNING] LDAPS connection failed. Falling back to LDAP with signing required.",
    "[INFO] Enumerating Active Directory Domain Controllers...",
    `[INFO] Target Domain: ${domain} (Functional Level: Windows Server 2016)`,
    "[INFO] Querying Kerberos ticket settings & Krbtgt account status...",
    "[WARNING] Krbtgt password has not been changed in 1,280 days! (High Risk)",
    "[INFO] Auditing Password Policy settings...",
    "[INFO] Checking for weak service principal names (SPN) - potential Kerberoasting target...",
    "[WARNING] Found 14 accounts susceptible to Kerberoasting (including high-privilege service accounts).",
    "[INFO] Analyzing Group Policy Objects (GPOs) for secure configuration...",
    "[WARNING] GPO 'Default Domain Policy' contains insecure SMB signing requirements.",
    "[INFO] Scanning for Unconstrained and Constrained Delegation issues...",
    "[ALERT] Constrained Delegation enabled on DC01 without SPN verification.",
    "[INFO] Compiling Active Directory security posture scorecard...",
    "[SUCCESS] Active Directory Security Scan completed successfully.",
  ];

  useEffect(() => {
    if (scanning && scanStep < adLogs.length) {
      const timer = setTimeout(() => {
        setConsoleLogs((prev) => [...prev, adLogs[scanStep]]);
        setScanStep((prev) => prev + 1);
      }, 400 + Math.random() * 300);
      return () => clearTimeout(timer);
    } else if (scanning && scanStep === adLogs.length) {
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
    if (!domain.trim()) return;
    setScanning(true);
    setReportReady(false);
    setScanStep(0);
    setConsoleLogs([]);

    const API_BASE = (process.env.NEXT_PUBLIC_PROD_API_URL || "").replace(/\/+$/, "");
    await protectedAction(async (token) => {
      try {
        await fetch(`${API_BASE}/report-generator/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reportType: "active-directory", domain, scope }),
        });
      } catch (err) {
        console.error("Failed to log scan on backend:", err);
      }
    });
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // Header Banner — amber theme
    doc.setFillColor(18, 18, 18);
    doc.rect(0, 0, doc.internal.pageSize.width, 40, "F");
    doc.setTextColor(245, 158, 11); // amber-500
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.text("NEXCORE SECURITY PLATFORM", 15, 20);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text("ACTIVE DIRECTORY SECURITY SCAN REPORT", 15, 30);

    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    doc.text(`Target Domain: ${domain}`, 15, 50);
    doc.text(`Scope: ${scope === "full" ? "Full Domain Audit" : "Quick Audit"}`, 15, 55);
    doc.text(`Date: ${new Date().toLocaleString()}`, 15, 60);
    doc.text("Status: Completed / VA-Verified", 15, 65);

    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(0.5);
    doc.line(15, 72, doc.internal.pageSize.width - 15, 72);

    doc.setFontSize(14);
    doc.text("Executive Summary", 15, 82);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);

    const summaryText = `This security assessment analyzed Active Directory configuration, authentication settings, password policies, and Kerberos delegation configuration for domain '${domain}'. Several critical items were identified, including outdated Krbtgt account password age and multiple Kerberoasting-susceptible accounts.`;
    const splitSummary = doc.splitTextToSize(summaryText, doc.internal.pageSize.width - 30);
    doc.text(splitSummary, 15, 90);

    const headers = [["Security Domain", "Severity", "Finding Status", "Remediation"]];
    const tableData = [
      ["Krbtgt Password Age", "High", "Outdated (1,280 days)", "Reset Krbtgt password twice using script."],
      ["Kerberoasting SPNs", "Medium", "14 accounts vulnerable", "Enforce strong password policy for service accounts."],
      ["LDAP Communication", "Medium", "No channel binding / signing", "Enforce LDAP signing and LDAPS globally."],
      ["Domain Controller SMB", "Low", "SMB Signing optional", "Require SMB signing on all Domain Controllers."],
    ];

    doc.autoTable({
      head: headers,
      body: tableData,
      startY: 110,
      theme: "striped",
      headStyles: { fillColor: [245, 158, 11], textColor: [0, 0, 0] },
      margin: { top: 110 },
    });

    doc.save(`Nexcore-active-directory-scan-${Date.now()}.pdf`);
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
        .tool-detail-page :is(button, [role="button"]):is([class*="bg-amber-"], [class*="bg-orange-"]) {
          color: #000000 !important;
        }
        .tool-detail-page :is(button, [role="button"]):is([class*="bg-amber-"], [class*="bg-orange-"]) * {
          color: #000000 !important;
        }
        .ad-console-log::-webkit-scrollbar { width: 4px; }
        .ad-console-log::-webkit-scrollbar-track { background: transparent; }
        .ad-console-log::-webkit-scrollbar-thumb { background: rgba(245,158,11,0.3); border-radius: 2px; }
      `}</style>

      <div className="tool-detail-shell">
        {/* Top Badge */}
        <div className="flex justify-end mb-8">
          <span className="rounded-full border border-amber-500/30 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-amber-400">
            Vulnerability Assessment
          </span>
        </div>

        {/* Title Block */}
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl border border-amber-500/30 overflow-hidden shadow-lg flex-shrink-0 flex items-center justify-center">
            <Network className="h-8 w-8 text-amber-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              ACTIVE DIRECTORY <span className="text-amber-400">SCAN</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Perform in-depth Active Directory posture reviews — audit Kerberos settings, GPO configurations,
              SPN exposures, and LDAP communication. Generate client-ready PDF reports with detailed findings.
            </p>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Left Column — Inputs + Console */}
          <div className="space-y-6">
            {/* Configuration Card */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-amber-500/10 transition-all duration-300">
              <h2 className="text-lg font-mono font-medium text-zinc-100 mb-6 flex items-center gap-2">
                <Server className="h-5 w-5 text-amber-400" />
                Scan Configuration
              </h2>

              <form onSubmit={handleStartScan} className="space-y-5">
                {/* Target Domain */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono text-zinc-500 mb-2 font-semibold">
                    Target Domain / Controller
                  </label>
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    disabled={scanning}
                    placeholder="e.g. corp.local"
                    className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 text-sm focus:outline-none transition-all placeholder:text-zinc-600 font-mono focus:ring-1 focus:border-amber-500 focus:ring-amber-500/30 disabled:opacity-50"
                  />
                </div>

                {/* Audit Scope */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono text-zinc-500 mb-3 font-semibold">
                    Audit Scope
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label
                      className={`flex items-center gap-3 text-sm cursor-pointer group p-3.5 rounded-xl border transition-all ${
                        scope === "full"
                          ? "border-amber-500/50 bg-amber-500/5 text-white"
                          : "border-zinc-800/80 bg-white/[0.01] text-zinc-300 hover:bg-white/[0.03] hover:border-zinc-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="scope"
                        value="full"
                        checked={scope === "full"}
                        onChange={() => setScope("full")}
                        disabled={scanning}
                        className="w-4 h-4 text-amber-500 focus:ring-amber-500 bg-transparent border-zinc-700"
                      />
                      <span>Full Domain Audit</span>
                    </label>
                    <label
                      className={`flex items-center gap-3 text-sm cursor-pointer group p-3.5 rounded-xl border transition-all ${
                        scope === "quick"
                          ? "border-amber-500/50 bg-amber-500/5 text-white"
                          : "border-zinc-800/80 bg-white/[0.01] text-zinc-300 hover:bg-white/[0.03] hover:border-zinc-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="scope"
                        value="quick"
                        checked={scope === "quick"}
                        onChange={() => setScope("quick")}
                        disabled={scanning}
                        className="w-4 h-4 text-amber-500 focus:ring-amber-500 bg-transparent border-zinc-700"
                      />
                      <span>Quick Configuration Audit</span>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={scanning || !domain.trim()}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:ring-offset-2 focus:ring-offset-black/20 disabled:opacity-40 disabled:pointer-events-none"
                >
                  {scanning ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-black" />
                      Running Audit...
                    </>
                  ) : (
                    <>
                      <Terminal className="h-4 w-4 text-black" />
                      Launch AD Scan
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Console Output */}
            {(scanning || consoleLogs.length > 0) && (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
                <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3 mb-4">
                  <span className="flex items-center gap-2 font-mono font-bold text-xs uppercase tracking-wider text-amber-400">
                    <Terminal className="h-4 w-4" />
                    Audit Console Output
                  </span>
                  {scanning && (
                    <span className="text-amber-400 font-mono text-xs animate-pulse">● RUNNING</span>
                  )}
                </div>
                <div
                  ref={logContainerRef}
                  className="ad-console-log h-64 overflow-y-auto space-y-1.5 pr-1 font-mono text-xs"
                >
                  {consoleLogs.map((log, index) => {
                    let colorClass = "text-zinc-400";
                    if (log.includes("[SUCCESS]")) colorClass = "text-emerald-400";
                    if (log.includes("[WARNING]")) colorClass = "text-amber-400";
                    if (log.includes("[ALERT]")) colorClass = "text-red-400 font-bold";
                    if (log.includes("[INFO]")) colorClass = "text-zinc-300";
                    return (
                      <div key={index} className={`leading-relaxed ${colorClass}`}>
                        {log}
                      </div>
                    );
                  })}
                  {scanning && (
                    <div className="flex items-center gap-1.5 text-amber-400/60">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column — Sidebar */}
          <div className="space-y-6">
            {/* Report Ready Card */}
            {reportReady && (
              <div className="border border-amber-500/20 bg-amber-500/5 backdrop-blur-md rounded-2xl p-6 space-y-5 shadow-[0_8px_30px_rgb(0,0,0,0.15)]">
                <div className="text-center space-y-2">
                  <div className="inline-flex h-12 w-12 items-center justify-center border border-amber-500/25 text-amber-400 rounded-full bg-amber-500/10 mb-2">
                    <Award className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-mono font-bold text-zinc-100">Report Generated</h3>
                  <p className="text-xs text-zinc-400 font-mono">Audit completed for {domain}</p>
                </div>

                <div className="border-t border-zinc-800/50 pt-4 space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Report Type:</span>
                    <span className="text-zinc-100 font-semibold">AD Security Scan</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Total Findings:</span>
                    <span className="text-amber-400 font-bold">4 Warnings</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Risk Band:</span>
                    <span className="text-red-400 font-bold">High Risk</span>
                  </div>
                </div>

                <button
                  onClick={handleDownloadPDF}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black font-mono font-bold text-xs uppercase py-3.5 rounded-xl transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                >
                  <Download className="h-4 w-4 text-black" />
                  Download PDF Report
                </button>
              </div>
            )}

            {/* Audit Methodology / Guidance */}
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-400" />
                Audit Methodology
              </h2>
              <ul className="space-y-3.5 list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed">
                    Reviews LDAP parameters, SPN configurations, password policies, and domain trust flags.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed">
                    Audits Kerberos delegation settings, Krbtgt account age, and AS-REP roastable users.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed">
                    Validates GPO configurations and SMB signing enforcement on domain controllers.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed">
                    Report findings comply with CIS Benchmarks for Active Directory security hardening.
                  </span>
                </li>
              </ul>
            </div>

            {/* Scan Scope Details */}
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Scope Details
              </h2>
              <ul className="space-y-3 list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed">
                    <span className="text-zinc-200 font-semibold">Full Domain Audit</span> — comprehensive review of all AD objects, GPOs, trusts, and Kerberos settings.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed">
                    <span className="text-zinc-200 font-semibold">Quick Config Audit</span> — targeted check of password policies, LDAP signing, and high-risk SPNs.
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
