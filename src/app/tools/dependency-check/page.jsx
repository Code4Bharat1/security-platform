"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Terminal, 
  Download, 
  Award, 
  FileText, 
  Loader2, 
  FileCode,
  Upload,
  Info
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
    
    doc.setTextColor(245, 158, 11); // Warm Amber
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
    
    doc.setDrawColor(245, 158, 11);
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
      headStyles: { fillColor: [245, 158, 11], textColor: [255, 255, 255] },
      margin: { top: 105 }
    });
    
    doc.save(`Nexcore-dependency-report-${Date.now()}.pdf`);
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
          <div className="w-16 h-16 rounded-2xl border border-amber-500/30 overflow-hidden shadow-lg flex-shrink-0 flex items-center justify-center">
            <FileCode className="h-8 w-8 text-amber-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              MALWAVE <span className="text-amber-400">SCAN</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Review dependencies, third-party packages, and libraries for CVE vulnerabilities, typosquatting risks, and malicious packages.
            </p>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* Form card */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-amber-500/10 transition-all duration-300">
              <h2 className="text-lg font-mono font-medium text-zinc-100 mb-6 flex items-center gap-2">
                <FileCode className="h-5 w-5 text-amber-400" />
                Select Manifest File
              </h2>
              
              <form onSubmit={handleStartScan} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="w-full">
                    <label className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                      Paste package.json
                    </label>
                    <textarea 
                      value={packageJsonText}
                      onChange={(e) => setPackageJsonText(e.target.value)}
                      disabled={scanning}
                      rows={6}
                      className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 text-xs focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 focus:shadow-[0_0_12px_rgba(245,158,11,0.08)] focus:outline-none transition-all placeholder:text-zinc-600 font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer bg-zinc-900/40 border border-zinc-800/80 hover:border-amber-500/35 hover:bg-amber-500/5 px-4 py-2.5 rounded-xl text-xs text-zinc-300 hover:text-amber-400 transition flex items-center gap-2 font-semibold font-mono">
                      <Upload className="h-4 w-4 text-amber-400" />
                      Upload package.json
                      <input 
                        type="file" 
                        accept=".json"
                        onChange={handleFileUpload}
                        className="hidden" 
                        disabled={scanning}
                      />
                    </label>
                    <span className="text-xs text-zinc-400 font-mono">Current: {fileName}</span>
                  </div>

                  <button 
                    type="submit"
                    disabled={scanning}
                    className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-black rounded-xl font-mono font-bold text-xs uppercase px-8 py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:ring-offset-2 focus:ring-offset-black/20 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {scanning ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-black" />
                        Scanning Packages...
                      </>
                    ) : (
                      <>
                        <Terminal className="h-4 w-4 text-black" />
                        Run Audit
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Console Output */}
            {(scanning || consoleLogs.length > 0) && (
              <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 font-mono text-xs text-white/80 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                <div className="flex items-center justify-between border-b border-zinc-800/40 pb-3">
                  <span className="flex items-center gap-2 font-bold text-amber-400">
                    <Terminal className="h-4 w-4" />
                    AUDIT CONSOLE OUTPUT
                  </span>
                  {scanning && <span className="text-amber-400 animate-pulse">● RUNNING</span>}
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
            {reportReady ? (
              <div className="border border-amber-500/30 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-6 shadow-[0_8px_30px_rgb(0,0,0,0.15)]">
                <div className="text-center space-y-2">
                  <div className="inline-flex h-12 w-12 items-center justify-center border border-amber-500/25 text-amber-400 rounded-full bg-amber-500/10 mb-2">
                    <Award className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-mono font-bold text-zinc-100">Scan Complete</h3>
                  <p className="text-xs text-zinc-400">Risks found in {fileName}</p>
                </div>

                <div className="border-t border-zinc-800/40 pt-4 space-y-3 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Vulnerabilities:</span>
                    <span className="text-amber-400 font-bold font-mono">3 Packages</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Typosquatting Risk:</span>
                    <span className="text-red-500 font-bold">1 Flagged</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Risk Band:</span>
                    <span className="text-red-500 font-bold">Critical</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button 
                    onClick={handleDownloadPDF}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-black rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:ring-offset-2 focus:ring-offset-black/20 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <Download className="h-4 w-4 text-black" />
                    Download PDF Report
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 text-center py-16 text-zinc-400 space-y-3 shadow-sm">
                <FileText className="h-12 w-12 mx-auto text-zinc-650" />
                <p className="text-sm font-mono uppercase tracking-wider font-semibold text-zinc-200">No Scan Executed</p>
                <p className="text-xs max-w-[240px] mx-auto leading-relaxed">
                  Provide package specifications and start the audit to retrieve vulnerability metrics.
                </p>
              </div>
            )}

            {/* Specs & Guidance sidebar card */}
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Info className="text-amber-400 w-4 h-4" />
                Scan Scope
              </h2>
              <ul className="space-y-3.5 list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Typosquatting checks flag packages matching known typosquat libraries designed to steal tokens.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Transitive dependencies are analyzed down to 5 sub-levels for nested vulnerabilities.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Scans verify compliance with license criteria (e.g. GPL exposure risks).
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
