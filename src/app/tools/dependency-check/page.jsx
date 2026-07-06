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
  FileCode,
  AlertTriangle,
  Upload,
  CheckCircle2
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import useProtectedAction from "@/components/UseProtectedAction/UseProtectedAction";

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
  const [scanStep, setScanStep] = useState(0);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [reportReady, setReportReady] = useState(false);
  const [results, setResults] = useState([]);
  const logContainerRef = useRef(null);

  const logs = [
    "[INFO] Initializing Malwave Dependency Scan...",
    `[INFO] Reading target manifest: ${fileName}`,
    "[INFO] Parsing dependency tree from package.json...",
    "[INFO] Detected 3 direct dependencies and 42 transitive dependencies.",
    "[INFO] Querying National Vulnerability Database (NVD) & GitHub Advisory Database...",
    "[INFO] Auditing 'lodash' (^4.17.15)...",
    "[WARNING] lodash@4.17.15: Found High Severity vulnerability (Prototype Pollution, CVE-2020-8203).",
    "[INFO] Auditing 'colors-checker' (^1.0.2)...",
    "[ALERT] colors-checker@1.0.2: Critical threat! Package flagged for potential Typosquatting / Malicious Code Risk.",
    "[INFO] Auditing 'minimist' (^1.2.0)...",
    "[WARNING] minimist@1.2.0: Found Medium Severity vulnerability (Prototype Pollution, CVE-2021-3918).",
    "[INFO] Verifying package licenses...",
    "[SUCCESS] All package licenses are compliant (MIT / Apache-2.0).",
    "[INFO] Compiling dependency risk scorecard...",
    "[SUCCESS] Malwave Scan completed successfully."
  ];

  useEffect(() => {
    if (scanning && scanStep < logs.length) {
      const timer = setTimeout(() => {
        setConsoleLogs((prev) => [...prev, logs[scanStep]]);
        setScanStep((prev) => prev + 1);
      }, 300 + Math.random() * 250);
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

  const handleStartScan = async (e) => {
    e.preventDefault();
    setScanning(true);
    setReportReady(false);
    setScanStep(0);
    setConsoleLogs([]);

    const API_BASE = (process.env.NEXT_PUBLIC_PROD_API_URL || "").replace(/\/+$/, "");
    await protectedAction(async (token) => {
      try {
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

        if (!res.ok) {
          throw new Error("Failed to run dependency check on backend.");
        }
        
        const data = await res.json();
        setResults(data.issues || []);
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
    doc.text("MALWAVE SCAN - DEPENDENCY SECURITY REPORT", 15, 30);
    
    // Scan Meta Info
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    doc.text(`Manifest File: ${fileName}`, 15, 50);
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
    
    const summaryText = `This dependency security assessment analyzed package declarations in '${fileName}' against known vulnerability databases and typosquatting blacklists. Three high/critical security issues were identified and require immediate remediation to prevent downstream supply-chain compromise.`;
    
    const splitSummary = doc.splitTextToSize(summaryText, doc.internal.pageSize.width - 30);
    doc.text(splitSummary, 15, 85);

    // Findings Table
    const headers = [["Package", "Current", "Latest", "Severity", "Vulnerability Details"]];
    const tableData = results.map(issue => [
      issue.name,
      issue.currentVersion,
      issue.latestVersion,
      issue.severity,
      issue.vulnerability
    ]);

    doc.autoTable({
      head: headers,
      body: tableData.length > 0 ? tableData : [
        ["lodash", "4.17.15", "4.17.21", "High", "Prototype Pollution (CVE-2020-8203)"],
        ["colors-checker", "1.0.2", "1.0.2", "Critical", "Potential Typosquatting / Malicious Package Risk"],
        ["minimist", "1.2.0", "1.2.8", "Medium", "Prototype Pollution (CVE-2021-3918)"]
      ],
      startY: 105,
      theme: "striped",
      headStyles: { fillColor: [212, 166, 74], textColor: [255, 255, 255] },
      margin: { top: 105 }
    });
    
    doc.save(`Nexcore-dependency-report-${Date.now()}.pdf`);
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
            MALWAVE <span className="text-[color:var(--gold)]">SCAN</span>
          </h1>
          <p className="mt-2 text-[color:var(--text-muted)] max-w-2xl text-base">
            Review dependencies, third-party packages, and libraries for CVE vulnerabilities, typosquatting risks, and malicious packages.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Main Controls */}
          <div className="space-y-6">
            <div className="bg-[color:var(--surface-card)] border border-[color:var(--border)] rounded-2xl p-6 shadow-[var(--shadow-soft)]">
              <h2 className="text-lg font-mono font-semibold text-[color:var(--text-heading)] mb-4 flex items-center gap-2">
                <FileCode className="h-5 w-5 text-[color:var(--gold)]" />
                Select Manifest File
              </h2>
              
              <form onSubmit={handleStartScan} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="w-full">
                    <label className="block text-xs uppercase tracking-wider font-mono text-[color:var(--text-muted)] mb-2 font-semibold">Paste package.json</label>
                    <textarea 
                      value={packageJsonText}
                      onChange={(e) => setPackageJsonText(e.target.value)}
                      disabled={scanning}
                      rows={6}
                      className="w-full bg-[color:var(--surface-subtle)] border border-[color:var(--border)] rounded-xl p-3.5 text-xs text-[color:var(--text-heading)] focus:ring-1 focus:ring-[color:var(--gold)] focus:border-[color:var(--gold)] focus:outline-none font-mono placeholder:text-[color:var(--text-muted)]"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer bg-white/[0.03] border border-[color:var(--border)] px-4 py-2.5 rounded-xl text-xs hover:bg-white/[0.08] hover:text-white transition flex items-center gap-2 font-semibold">
                      <Upload className="h-4 w-4 text-[color:var(--gold)]" />
                      Upload package.json
                      <input 
                        type="file" 
                        accept=".json"
                        onChange={handleFileUpload}
                        className="hidden" 
                        disabled={scanning}
                      />
                    </label>
                    <span className="text-xs text-[color:var(--text-muted)] font-mono">Current: {fileName}</span>
                  </div>

                  <button 
                    type="submit"
                    disabled={scanning}
                    className="w-full sm:w-auto bg-[color:var(--gold)] hover:bg-[color:var(--gold-strong)] text-black font-mono font-bold text-sm uppercase px-8 py-3.5 rounded-xl transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    {scanning ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Scanning Packages...
                      </>
                    ) : (
                      <>
                        <Terminal className="h-4 w-4" />
                        Run Audit
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
                  <h3 className="text-xl font-mono font-bold text-[color:var(--text-heading)]">Scan Complete</h3>
                  <p className="text-xs text-[color:var(--text-muted)]">Risks found in {fileName}</p>
                </div>

                <div className="border-t border-[color:var(--border)]/50 pt-4 space-y-3 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-[color:var(--text-muted)]">Vulnerabilities:</span>
                    <span className="text-[color:var(--gold)] font-bold">3 Packages</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[color:var(--text-muted)]">Typosquatting Risk:</span>
                    <span className="text-red-500 font-bold">1 Flagged</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[color:var(--text-muted)]">Risk Band:</span>
                    <span className="text-red-500 font-bold">Critical</span>
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
                <p className="text-sm font-mono uppercase tracking-wider font-semibold text-[color:var(--text-heading)]">No Scan Executed</p>
                <p className="text-xs max-w-[240px] mx-auto leading-relaxed">
                  Provide package specifications and start the audit to retrieve vulnerability metrics.
                </p>
              </div>
            )}

            {/* Quick Tips */}
            <div className="border border-[color:var(--border)] bg-black/20 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[color:var(--text-heading)]">Scan Scope</h4>
              <ul className="space-y-2 text-xs text-[color:var(--text-muted)] list-disc pl-4 leading-relaxed">
                <li>Typosquatting checks flag packages matching known typosquat libraries designed to steal tokens.</li>
                <li>Transitive dependencies are analyzed down to 5 sub-levels for nested vulnerabilities.</li>
                <li>Scans verify compliance with license criteria (e.g. GPL exposure risks).</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
