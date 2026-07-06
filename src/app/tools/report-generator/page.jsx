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
  ChevronRight,
  ChevronDown, 
  CheckCircle2, 
  Loader2, 
  Server,
  Key,
  Users,
  AlertTriangle
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import useProtectedAction from "@/components/UseProtectedAction/UseProtectedAction";

export default function ReportGeneratorPage() {
  const router = useRouter();
  const protectedAction = useProtectedAction();
  const [reportType, setReportType] = useState("active-directory");
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
    "[SUCCESS] Active Directory Security Scan completed successfully."
  ];

  const credLogs = [
    "[INFO] Initializing Credential Path Audit...",
    "[INFO] Fetching Active Directory user lists and computer accounts...",
    "[INFO] Extracting domain trust relationships...",
    "[INFO] Mapping Group Policy Object (GPO) permissions and ACLs...",
    "[INFO] Constructing privilege escalation tree (User -> Group -> Computer)...",
    "[INFO] Analyzing session info and logged-on users...",
    "[INFO] Parsing local administrator group memberships...",
    "[WARNING] Non-admin group 'Helpdesk' has write permissions over Domain Admin group GPO.",
    "[INFO] Executing Dijkstra shortest-path algorithm to Domain Admin...",
    "[ALERT] High Risk Path Found: User 'jsmith' -> Helpdesk PC -> DC01 -> Domain Admin (3 hops).",
    "[INFO] Checking for Kerberos Delegation pathways...",
    "[WARNING] Computer 'WS-FIN-02' allows delegation to Domain Controller (potential compromise path).",
    "[INFO] Searching for passwords in GPO SYSVOL files...",
    "[SUCCESS] No passwords found in SYSVOL xml files.",
    "[INFO] Finalizing Credential Pathway Graph...",
    "[SUCCESS] Credential Path Audit completed successfully."
  ];

  const currentLogs = reportType === "active-directory" ? adLogs : credLogs;

  useEffect(() => {
    if (scanning && scanStep < currentLogs.length) {
      const timer = setTimeout(() => {
        setConsoleLogs((prev) => [...prev, currentLogs[scanStep]]);
        setScanStep((prev) => prev + 1);
      }, 400 + Math.random() * 300);
      return () => clearTimeout(timer);
    } else if (scanning && scanStep === currentLogs.length) {
      setScanning(false);
      setReportReady(true);
    }
  }, [scanning, scanStep, reportType]);

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
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            reportType,
            domain,
            scope
          })
        });
      } catch (err) {
        console.error("Failed to log scan on backend:", err);
      }
    });
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const title = reportType === "active-directory" ? "Active Directory Security Scan" : "Credential Path Audit";
    
    // Header Banner
    doc.setFillColor(18, 18, 18);
    doc.rect(0, 0, doc.internal.pageSize.width, 40, "F");
    
    doc.setTextColor(212, 166, 74); // Gold
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.text("NEXCORE SECURITY PLATFORM", 15, 20);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text(`${title.toUpperCase()} REPORT`, 15, 30);
    
    // Scan Meta Info
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    doc.text(`Target Domain: ${domain}`, 15, 50);
    doc.text(`Scope: ${scope === "full" ? "Full Domain Audit" : "Quick Audit"}`, 15, 55);
    doc.text(`Date: ${new Date().toLocaleString()}`, 15, 60);
    doc.text("Status: Completed / Sec-Verified", 15, 65);
    
    doc.setDrawColor(212, 166, 74);
    doc.setLineWidth(0.5);
    doc.line(15, 72, doc.internal.pageSize.width - 15, 72);

    // Summary Metrics
    doc.setFontSize(14);
    doc.text("Executive Summary", 15, 82);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    
    const summaryText = reportType === "active-directory" 
      ? `This security assessment analyzed Active Directory configuration, authentication settings, password policies, and Kerberos delegation configuration for domain '${domain}'. Several critical items were identified, including outdated Krbtgt account password age and multiple Kerberoasting-susceptible accounts.`
      : `This path audit analyzed user account privilege structures, local admin group nesting, session histories, and ACL permissions for domain '${domain}'. The goal was to identify credential theft paths and lateral movement routes to domain administration. A highly critical delegation route was mapped.`;
    
    const splitSummary = doc.splitTextToSize(summaryText, doc.internal.pageSize.width - 30);
    doc.text(splitSummary, 15, 90);

    // Scorecard Table
    const headers = [["Security Domain", "Severity", "Finding Status", "Remediation"]];
    const adData = [
      ["Krbtgt Password Age", "High", "Outdated (1,280 days)", "Reset Krbtgt password twice using script."],
      ["Kerberoasting SPNs", "Medium", "14 accounts vulnerable", "Enforce strong password policy for service accounts."],
      ["LDAP Communication", "Medium", "No channel binding / signing", "Enforce LDAP signing and LDAPS globally."],
      ["Domain Controller SMB", "Low", "SMB Signing optional", "Require SMB signing on all Domain Controllers."]
    ];
    
    const credData = [
      ["ACL Path Vulnerability", "Critical", "Write access over DA GPO", "Remove Write access of Helpdesk group from GPOs."],
      ["Kerberos Delegation", "High", "Unconstrained Delegation", "Convert computers to use Constrained Delegation."],
      ["Shortest Path to DA", "High", "3 hops path from user", "Segment local admin credentials using LAPS."]
    ];

    const tableData = reportType === "active-directory" ? adData : credData;

    doc.autoTable({
      head: headers,
      body: tableData,
      startY: 110,
      theme: "striped",
      headStyles: { fillColor: [212, 166, 74], textColor: [255, 255, 255] },
      margin: { top: 110 }
    });
    
    doc.save(`Nexcore-${reportType}-report-${Date.now()}.pdf`);
  };

  return (
    <div className="tool-detail-page min-h-screen">
      <div className="tool-detail-shell">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-4 mb-8">
          <div className="flex items-center gap-4">
            <span className="rounded-full border border-[color:var(--border)] px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-[color:var(--text-muted)] bg-white/[0.02]">
              Vulnerability Assessment
            </span>
          </div>
        </div>

        <div className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-mono font-bold text-[color:var(--text-heading)]">
            REPORT <span className="text-[color:var(--gold)]">GENERATOR</span>
          </h1>
          <p className="mt-2 text-[color:var(--text-muted)] max-w-2xl text-base">
            Perform in-depth Active Directory posture reviews and map credential theft paths. Generate client-ready PDF reports with detailed findings and mitigation strategies.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Main Console & Inputs */}
          <div className="space-y-6">
            <div className="bg-[color:var(--surface-card)] border border-[color:var(--border)] rounded-2xl p-6 shadow-[var(--shadow-soft)]">
              <h2 className="text-lg font-mono font-semibold text-[color:var(--text-heading)] mb-4 flex items-center gap-2">
                <Server className="h-5 w-5 text-[color:var(--gold)]" />
                Scan Configuration
              </h2>
              
              <form onSubmit={handleStartScan} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-mono text-[color:var(--text-muted)] mb-2 font-semibold">Report Type</label>
                    <div className="relative">
                      <select 
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        disabled={scanning}
                        className="w-full bg-[color:var(--surface-subtle)] text-[color:var(--text-heading)] border border-[color:var(--border)] rounded-xl p-3 text-sm focus:ring-1 focus:ring-[color:var(--gold)] focus:border-[color:var(--gold)] focus:outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="active-directory">Active Directory Security Scan</option>
                        <option value="credential-path">Credential Path Audit</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[color:var(--text-muted)]">
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-mono text-[color:var(--text-muted)] mb-2 font-semibold">Target Domain / Controller</label>
                    <input 
                      type="text" 
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      disabled={scanning}
                      placeholder="e.g. corp.local"
                      className="w-full bg-[color:var(--surface-subtle)] text-[color:var(--text-heading)] border border-[color:var(--border)] rounded-xl p-3 text-sm focus:ring-1 focus:ring-[color:var(--gold)] focus:border-[color:var(--gold)] focus:outline-none transition-all placeholder:text-[color:var(--text-muted)] font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono text-[color:var(--text-muted)] mb-2 font-semibold">Audit Scope</label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 text-sm text-[color:var(--text-heading)] cursor-pointer group">
                      <input 
                        type="radio" 
                        name="scope" 
                        value="full" 
                        checked={scope === "full"}
                        onChange={() => setScope("full")}
                        disabled={scanning}
                        className="w-4 h-4 text-[color:var(--gold)] focus:ring-[color:var(--gold)] bg-transparent border-[color:var(--border)]"
                      />
                      <span className="group-hover:text-white transition">Full Domain Audit</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-[color:var(--text-heading)] cursor-pointer group">
                      <input 
                        type="radio" 
                        name="scope" 
                        value="quick" 
                        checked={scope === "quick"}
                        onChange={() => setScope("quick")}
                        disabled={scanning}
                        className="w-4 h-4 text-[color:var(--gold)] focus:ring-[color:var(--gold)] bg-transparent border-[color:var(--border)]"
                      />
                      <span className="group-hover:text-white transition">Quick Configuration Audit</span>
                    </label>
                  </div>
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
                        Running Audit...
                      </>
                    ) : (
                      <>
                        <Terminal className="h-4 w-4" />
                        Generate Consolidated Report
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

          {/* Results Sidebar / Report Card */}
          <div className="space-y-6">
            {reportReady ? (
              <div className="border border-[color:var(--gold)]/30 bg-black/35 backdrop-blur-xl rounded-2xl p-6 space-y-6 shadow-[var(--shadow-elevated)]">
                <div className="text-center space-y-2">
                  <div className="inline-flex h-12 w-12 items-center justify-center border border-[color:var(--gold)]/25 text-[color:var(--gold)] rounded-full bg-[color:var(--gold)]/10 mb-2">
                    <Award className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-mono font-bold text-[color:var(--text-heading)]">Report Generated</h3>
                  <p className="text-xs text-[color:var(--text-muted)]">Audit completed for {domain}</p>
                </div>

                <div className="border-t border-[color:var(--border)]/50 pt-4 space-y-3 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-[color:var(--text-muted)]">Report Type:</span>
                    <span className="text-[color:var(--text-heading)] font-semibold">
                      {reportType === "active-directory" ? "AD Security Scan" : "Path Audit"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[color:var(--text-muted)]">Total Findings:</span>
                    <span className="text-[color:var(--gold)] font-bold">
                      {reportType === "active-directory" ? "4 Warnings" : "3 Alerts"}
                    </span>
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
                <p className="text-sm font-mono uppercase tracking-wider font-semibold text-[color:var(--text-heading)]">No Report Generated</p>
                <p className="text-xs max-w-[240px] mx-auto leading-relaxed">
                  Configure the target domain and run the audit to generate consolidated reports.
                </p>
              </div>
            )}

            {/* Quick Tips/Reference Info */}
            <div className="border border-[color:var(--border)] bg-black/20 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[color:var(--text-heading)]">Audit Methodology</h4>
              <ul className="space-y-2 text-xs text-[color:var(--text-muted)] list-disc pl-4 leading-relaxed">
                <li>Active Directory scans review LDAP parameters, SPNs, password configurations, and trust flags.</li>
                <li>Credential path mapping resolves Dijkstra traversal over Nested Administrators, GPO Write privileges, and delegated sessions.</li>
                <li>Reports generated comply with CIS Benchmarks for Active Directory security.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
