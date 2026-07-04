"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import useProtectedAction from "@/components/UseProtectedAction/UseProtectedAction";
import { toast } from "react-hot-toast";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  Code2, 
  Upload, 
  Play, 
  Trash2, 
  Download, 
  AlertTriangle, 
  ShieldCheck, 
  Search, 
  Filter, 
  ArrowRight,
  ClipboardCopy,
  Wrench,
  BookOpen
} from "lucide-react";

export default function SourceCodeAnalyzer() {
  const router = useRouter();
  const protectedAction = useProtectedAction();

  const [code, setCode] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const fileInputRef = useRef(null);
  
  // Scanned results
  const [result, setResult] = useState(null);
  const [issues, setIssues] = useState([]);
  const [riskScore, setRiskScore] = useState(0);
  const [riskBand, setRiskBand] = useState("Safe");
  const [detectedLanguage, setDetectedLanguage] = useState("JavaScript");
  
  // Analytics
  const [analytics, setAnalytics] = useState({
    totalIssues: 0,
    byType: { XSS: 0, SQLi: 0, Eval: 0, DOMClobber: 0, PrototypePollution: 0 },
    bySeverity: { Low: 0, Medium: 0, High: 0, Critical: 0 }
  });

  // Filters
  const [q, setQ] = useState("");
  const [sevFilter, setSevFilter] = useState({ Low: true, Medium: true, High: true, Critical: true });
  const [typeFilter, setTypeFilter] = useState({ 
    XSS: true, 
    SQLi: true, 
    Eval: true,
    DOMClobber: true,
    PrototypePollution: true
  });

  const severityColors = {
    Low: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    Medium: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    High: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    Critical: 'bg-red-500/20 text-red-400 border border-red-500/30',
  };

  const riskColor = useMemo(() => {
    if (riskScore >= 90) return 'from-red-600 to-red-900 shadow-red-500/20';
    if (riskScore >= 70) return 'from-orange-500 to-orange-800 shadow-orange-500/20';
    if (riskScore >= 40) return 'from-amber-500 to-amber-800 shadow-amber-500/20';
    if (riskScore > 0) return 'from-emerald-500 to-emerald-800 shadow-emerald-500/20';
    return 'from-gray-700 to-gray-900 shadow-gray-500/20';
  }, [riskScore]);

  // Load sample snippets
  const loadSample = (kind) => {
    const samples = {
      jsxss: `function displayUserInput() {\n  const userInput = document.getElementById('userInput').value;\n  document.getElementById('out').innerHTML = userInput; // ❌ Vulnerable to DOM XSS\n}`,
      react: `export default function Post({ html }) {\n  // ❌ Danger: raw rendering\n  return <div dangerouslySetInnerHTML={{ __html: html }} />;\n}`,
      vue: `<template>\n  <div v-html="rawHtml"></div> <!-- ❌ Unsanitized Vue output -->\n</template>`,
      php: `<?php\n$userId = $_GET['id'];\n// ❌ SQLi concatenation pattern\n$query = "SELECT * FROM users WHERE id = " . $userId;\n$result = mysqli_query($conn, $query);\n?>`,
      evaldanger: `const code = prompt('Enter mathematical formula:');\neval(code); // ❌ Dangerous eval runtime injection`,
      domclobber: `const config = {};\nwindow.config = config; // ⚠️ Variable declaration can clobber globals`,
      prototype: `const obj = {};\nobj.__proto__.malicious = true; // ⚠️ Unrestricted prototype assignments`,
      safe: `const el = document.getElementById('out');\n// ✅ Secure text nodes usage\nel.textContent = userInput;\n\n// ✅ Parameterized statement placeholder query\n$stmt = $conn->prepare("SELECT * FROM users WHERE id = ?");\n$stmt->bind_param("i", $userId);`,
    };
    setCode(samples[kind] || "");
    setFile(null);
    setSelectedTemplate(kind);
    toast.success("Sample template loaded!");
  };

  const getTemplateBtnClass = (kind) => {
    const isSelected = selectedTemplate === kind;
    if (isSelected) {
      return "px-3 py-2 bg-[#E2B85C] text-black font-semibold rounded-lg text-left text-xs transition border border-[#E2B85C] shadow-[0_0_12px_rgba(226,184,92,0.3)]";
    }
    return "px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-left text-xs text-gray-300 transition border border-white/5";
  };

  // Utility: read file as text
  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setCode(""); // Clear text code when file is chosen
      toast.success(`Attached file: ${selectedFile.name}`);
    }
  };

  const clearInputs = () => {
    // Reset editor and file states
    setCode("");
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.dispatchEvent(new Event("change", { bubbles: true }));
    }
    const textarea = document.querySelector(".tool-detail-page textarea");
    if (textarea) {
      textarea.dispatchEvent(new Event("change", { bubbles: true }));
    }

    // Clear guidance framework inline validation messages from screen
    const inlineMessages = document.querySelectorAll(".tool-guidance-inline-message");
    inlineMessages.forEach((msg) => {
      msg.innerHTML = "";
      msg.dataset.status = "idle";
    });

    setSelectedTemplate(null);
    
    // Reset scan results and analytics
    setResult(null);
    setIssues([]);
    setRiskScore(0);
    setRiskBand("Safe");
    setDetectedLanguage("JavaScript");
    setAnalytics({
      totalIssues: 0,
      byType: { XSS: 0, SQLi: 0, Eval: 0, DOMClobber: 0, PrototypePollution: 0 },
      bySeverity: { Low: 0, Medium: 0, High: 0, Critical: 0 }
    });

    // Reset filters
    setQ("");
    setSevFilter({ Low: true, Medium: true, High: true, Critical: true });
    setTypeFilter({ 
      XSS: true, 
      SQLi: true, 
      Eval: true,
      DOMClobber: true,
      PrototypePollution: true
    });

    toast.success("Inputs and metrics successfully reset");
  };

  // Submit scan to backend
  const handleSubmit = async () => {
    setResult(null);
    setIssues([]);
    setLoading(true);

    await protectedAction(async (token) => {
      try {
        let finalCode = code;
        if (file) {
          finalCode = await readFileAsText(file);
        }

        if (!finalCode || finalCode.trim() === "") {
          toast.error("Please paste code or upload a file.");
          setLoading(false);
          return;
        }

        // Call analyzeCode endpoint which returns detailed line-by-line findings
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/analyze/analyzeCode`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ code: finalCode }),
          }
        );

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `API error: ${res.statusText}`);
        }

        const data = await res.json();
        console.log("Analysis API Response:", data);
        
        setResult(data);
        const issuesList = data.issues || [];
        setIssues(issuesList);
        setRiskScore(data.riskScore || 0);
        setRiskBand(data.riskBand || "Safe");
        setDetectedLanguage(data.language || "JavaScript");

        // Calculate analytics breakdown
        const newAnalytics = {
          totalIssues: issuesList.length,
          byType: { XSS: 0, SQLi: 0, Eval: 0, DOMClobber: 0, PrototypePollution: 0 },
          bySeverity: { Low: 0, Medium: 0, High: 0, Critical: 0 }
        };

        issuesList.forEach(issue => {
          if (newAnalytics.byType.hasOwnProperty(issue.type)) {
            newAnalytics.byType[issue.type]++;
          } else {
            newAnalytics.byType[issue.type] = (newAnalytics.byType[issue.type] || 0) + 1;
          }
          if (newAnalytics.bySeverity.hasOwnProperty(issue.severity)) {
            newAnalytics.bySeverity[issue.severity]++;
          }
        });

        setAnalytics(newAnalytics);
        toast.success("Code scan completed successfully!");
      } catch (err) {
        console.error("Scan error:", err);
        toast.error(err.message || "An error occurred while analyzing the code.");
        setResult({
          passed: 0,
          failed: 1,
          riskBand: "Error",
          results: ["❌ An error occurred while analyzing the code."]
        });
      } finally {
        setLoading(false);
      }
    });
  };

  // Filter issues based on criteria
  const filteredIssues = useMemo(() => {
    return issues.filter((it) => {
      if (!sevFilter[it.severity]) return false;
      if (typeFilter[it.type] !== undefined && !typeFilter[it.type]) return false;
      if (!q.trim()) return true;
      const s = q.toLowerCase();
      return (
        String(it.line).toLowerCase().includes(s) ||
        String(it.type).toLowerCase().includes(s) ||
        String(it.severity).toLowerCase().includes(s) ||
        String(it.message).toLowerCase().includes(s) ||
        String(it.snippet).toLowerCase().includes(s)
      );
    });
  }, [issues, sevFilter, typeFilter, q]);

  // Apply code fix suggestion dynamically
  const applyFix = (fix, snippet) => {
    if (!code) {
      toast.error("Cannot apply fixes to uploaded files. Paste code in the editor instead.");
      return;
    }
    const fixedCode = code.replace(new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fix);
    setCode(fixedCode);
    toast.success("Code correction applied to editor!");
  };

  // Copy helpers
  const copyText = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error("Copy operation failed");
    }
  };

  // Report Exporters
  const exportPDF = () => {
    const doc = new jsPDF("l", "mm", "a4");
    
    // Cover banner decor
    doc.setFillColor(31, 41, 55);
    doc.rect(0, 0, 297, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("Source Code Security Scan Report", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 32);
    doc.text(`Overall Risk Rating: ${riskBand} (Score: ${riskScore}/100) | Language: ${detectedLanguage}`, 14, 37);

    // Summary tables
    let yPos = 50;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text("Executive Summary Statistics", 14, yPos);
    yPos += 8;

    const statsData = [
      ["Parameter", "Count / Value", "Breakdown Details"],
      ["Total Flaws Found", analytics.totalIssues, `Critical: ${analytics.bySeverity.Critical} | High: ${analytics.bySeverity.High} | Medium: ${analytics.bySeverity.Medium} | Low: ${analytics.bySeverity.Low}`],
      ["Scan Language", detectedLanguage, "Automated parser heuristics mapping"],
      ["Vulnerabilities Types", "", `XSS: ${analytics.byType.XSS || 0} | SQLi: ${analytics.byType.SQLi || 0} | Eval: ${analytics.byType.Eval || 0}`]
    ];

    autoTable(doc, {
      startY: yPos,
      head: [statsData[0]],
      body: statsData.slice(1),
      theme: "grid",
      styles: { fontSize: 9 }
    });

    // Detailed Findings
    yPos = doc.lastAutoTable.finalY + 12;
    doc.setFontSize(14);
    doc.text("Detailed Security Observations", 14, yPos);

    const findingsRows = filteredIssues.map((it, i) => [
      i + 1,
      it.line,
      it.severity,
      it.type,
      it.message,
      it.snippet,
      it.fix
    ]);

    autoTable(doc, {
      startY: yPos + 4,
      head: [["#", "Line", "Severity", "Type", "Finding Description", "Trigger Code", "Remediation Strategy"]],
      body: findingsRows,
      theme: "striped",
      headStyles: { fillColor: [180, 140, 50] },
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        4: { cellWidth: 45 },
        5: { cellWidth: 55 },
        6: { cellWidth: 65 }
      }
    });

    doc.save("source_code_analysis_report.pdf");
    toast.success("PDF report downloaded!");
  };

  const exportTXT = () => {
    const header = `==================================================\n🔍 NEXCORE SOURCE CODE SECURITY REPORT 🔍\n==================================================\nGenerated: ${new Date().toLocaleString()}\nLanguage:  ${detectedLanguage}\nRisk Score: ${riskScore}/100\nRisk Band:  ${riskBand}\n--------------------------------------------------\n\n`;
    const body = filteredIssues.length
      ? filteredIssues.map((it, i) => `#${i + 1}\nLine: ${it.line}\nSeverity: ${it.severity}\nType: ${it.type}\nIssue: ${it.message}\nSnippet: ${it.snippet}\nRemediation: ${it.fix}\n--------------------------------------------------\n`).join("\n")
      : "🎉 No security issues detected in this code.";
    
    const blob = new Blob([header + body], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "source_code_security_report.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("TXT report downloaded!");
  };

  const exportJSON = () => {
    const payload = {
      scanDate: new Date().toISOString(),
      language: detectedLanguage,
      riskScore,
      riskBand,
      totalIssues: issues.length,
      findings: filteredIssues
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "source_code_security_report.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("JSON report downloaded!");
  };

  const issueDescriptions = {
    XSS: "Cross-Site Scripting: Injecting malicious scripts into web pages viewed by other users.",
    SQLi: "SQL Injection: Inserting malicious SQL statements into queries via parameter fields.",
    Eval: "Eval Code Execution: Running direct evaluations of strings, bypassing script isolation.",
    DOMClobber: "DOM Clobbering: Overwriting system global variables using DOM elements.",
    PrototypePollution: "Prototype Pollution: Modifying object structures globally, affecting all scopes."
  };

  return (
    <div className="tool-detail-page flex min-h-screen flex-col">
      <div className="tool-detail-shell">
        {/* Hero Header */}
        <div className="tool-detail-hero">
          <div className="tool-detail-icon">
            <img
              src="/RedTeam/code.png"
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="tool-detail-copy">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[color:var(--text-heading)] mb-1 sm:mb-2 leading-tight">
              Source Code Analyzer
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-[color:var(--text-muted)] leading-normal sm:leading-relaxed">
              Inspect scripts, templates, and raw server-side controllers to scan for SQL Injection, XSS, and dangerous runtimes.
            </p>
          </div>
        </div>

        {/* Inputs Layout Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Form Fields */}
          <div className="lg:col-span-2 tool-detail-panel p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold tracking-wider text-[color:var(--text-heading)] uppercase flex items-center gap-2">
                  <Code2 size={16} className="text-[color:var(--gold)]" />
                  Code Editor
                </label>
                {code && (
                  <button 
                    onClick={() => setCode("")} 
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition"
                  >
                    Clear Text
                  </button>
                )}
              </div>
              <textarea
                className="w-full h-64 resize-none rounded-xl border border-[color:var(--border)] bg-black/40 p-4 font-mono text-xs text-[color:var(--text-heading)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[color:var(--gold)] transition mb-4"
                placeholder="Paste your HTML, JS, PHP code here..."
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (file) setFile(null); // Clear file attachment
                  setSelectedTemplate(null); // Reset active template selection
                }}
              />

              {/* Upload Handler */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[color:var(--border)] pt-4 mb-4">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[color:var(--border)] bg-black/20 hover:bg-black/40 cursor-pointer text-xs font-semibold text-[color:var(--text-heading)] transition">
                    <Upload size={14} className="text-[color:var(--gold)]" />
                    Attach File
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".js,.jsx,.ts,.tsx,.html,.php,.txt"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {file && (
                    <span className="text-xs text-[color:var(--text-muted)] max-w-[200px] truncate">
                      {file.name}
                    </span>
                  )}
                </div>

                {(code || file) && (
                  <button
                    onClick={clearInputs}
                    className="text-xs text-gray-400 hover:text-gray-200 flex items-center gap-1.5 transition px-3 py-1.5 border border-white/5 rounded-lg bg-white/5"
                  >
                    <Trash2 size={13} />
                    Reset Form
                  </button>
                )}
              </div>
            </div>

            {/* Action Trigger Buttons */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSubmit}
                disabled={loading || (!code.trim() && !file)}
                className="flex items-center gap-2 rounded-xl bg-[color:var(--gold)] px-6 py-2.5 text-xs font-bold text-black transition hover:bg-[color:var(--gold-strong)] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(212,166,74,0.15)]"
              >
                {loading ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    Scanning Codebase...
                  </>
                ) : (
                  <>
                    <Play size={13} fill="black" />
                    Run Inspection
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Loading Snippets Panel */}
          <div className="tool-detail-panel p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold tracking-wider text-[color:var(--text-heading)] uppercase mb-4 flex items-center gap-2 border-b border-[color:var(--border)] pb-2">
                <BookOpen size={16} className="text-[color:var(--gold)]" />
                Vulnerability Templates
              </h3>
              <p className="text-xs text-[color:var(--text-muted)] mb-4">
                Load sample code containing common security weaknesses to evaluate the scanner's detection accuracy:
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => loadSample("jsxss")}
                  className={getTemplateBtnClass("jsxss")}
                >
                  DOM XSS
                </button>
                <button
                  onClick={() => loadSample("react")}
                  className={getTemplateBtnClass("react")}
                >
                  React raw innerHTML
                </button>
                <button
                  onClick={() => loadSample("vue")}
                  className={getTemplateBtnClass("vue")}
                >
                  Vue v-html XSS
                </button>
                <button
                  onClick={() => loadSample("php")}
                  className={getTemplateBtnClass("php")}
                >
                  PHP SQL Injection
                </button>
                <button
                  onClick={() => loadSample("evaldanger")}
                  className={getTemplateBtnClass("evaldanger")}
                >
                  Dangerous Eval()
                </button>
                <button
                  onClick={() => loadSample("domclobber")}
                  className={getTemplateBtnClass("domclobber")}
                >
                  DOM Clobbering
                </button>
                <button
                  onClick={() => loadSample("prototype")}
                  className={getTemplateBtnClass("prototype")}
                >
                  Proto Pollution
                </button>
                <button
                  onClick={() => loadSample("safe")}
                  className={getTemplateBtnClass("safe")}
                >
                  Secure Standard
                </button>
              </div>
            </div>
            
            <div className="mt-6 border-t border-white/5 pt-4 text-[10px] text-[color:var(--text-muted)] flex items-center gap-1.5 justify-center">
              <ShieldCheck size={12} className="text-green-500" />
              100% Client-Side Scan Pipeline Secure
            </div>
          </div>
        </div>

        {/* Results Block */}
        {result && (
          <div className="space-y-6">
            {/* Visual Dashboard Panel */}
            <div className="tool-detail-panel p-6 rounded-2xl">
              <h2 className="text-base font-semibold tracking-wider text-[color:var(--text-heading)] uppercase mb-5">
                Security Dashboard
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Risk Gauge */}
                <div className="bg-black/30 border border-white/5 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex-1">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[color:var(--text-muted)]">
                      Overall Assessment
                    </span>
                    <div className="text-xl font-bold text-[color:var(--text-heading)] mt-1">
                      {riskBand}
                    </div>
                    <div className="text-xs text-[color:var(--text-muted)] mt-0.5">
                      Language: {detectedLanguage}
                    </div>
                  </div>
                  <div className={`w-16 h-16 rounded-full flex flex-col items-center justify-center bg-gradient-to-br ${riskColor} shadow-lg text-white border border-white/10`}>
                    <span className="text-lg font-extrabold">{riskScore}</span>
                    <span className="text-[7px] uppercase font-mono tracking-wider opacity-60">Score</span>
                  </div>
                </div>

                {/* Categorization */}
                <div className="bg-black/30 border border-white/5 p-4 rounded-xl">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[color:var(--text-muted)] block mb-2">
                    Flaws By Type
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(analytics.byType).map(([type, val]) => (
                      <div key={type} className="flex justify-between items-center text-gray-300">
                        <span>{type}:</span>
                        <span className={`font-semibold ${val > 0 ? "text-red-400" : "text-gray-500"}`}>
                          {val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Severities counts */}
                <div className="bg-black/30 border border-white/5 p-4 rounded-xl">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[color:var(--text-muted)] block mb-2">
                    Flaws By Severity
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(analytics.bySeverity).map(([severity, val]) => (
                      <div key={severity} className="flex justify-between items-center text-gray-300">
                        <span className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            severity === "Critical" ? "bg-red-500" :
                            severity === "High" ? "bg-orange-500" :
                            severity === "Medium" ? "bg-amber-500" : "bg-emerald-500"
                          }`}></span>
                          {severity}:
                        </span>
                        <span className={`font-semibold ${val > 0 ? "text-[color:var(--text-heading)]" : "text-gray-500"}`}>
                          {val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Filter controls row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search input */}
              <div className="relative flex items-center">
                <Search size={14} className="absolute left-3 text-[color:var(--text-muted)]" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Filter findings by line, type, severity, text..."
                  className="w-full bg-black/45 text-xs text-[color:var(--text-heading)] border border-white/5 rounded-xl py-2.5 pl-9 pr-4 focus:outline-none focus:border-[color:var(--gold)] transition"
                />
              </div>

              {/* Severity Checkbox array */}
              <div className="bg-black/45 border border-white/5 rounded-xl px-4 py-2 flex items-center gap-4 justify-between">
                <span className="text-[10px] uppercase font-mono text-[color:var(--text-muted)] flex items-center gap-1">
                  <Filter size={11} />
                  Severity:
                </span>
                <div className="flex gap-3 text-[10px] font-semibold">
                  {['Low', 'Medium', 'High', 'Critical'].map((sev) => (
                    <label key={sev} className="flex items-center gap-1 cursor-pointer text-gray-300 hover:text-white transition">
                      <input
                        type="checkbox"
                        checked={sevFilter[sev]}
                        onChange={() => setSevFilter((p) => ({ ...p, [sev]: !p[sev] }))}
                        className="rounded border-white/10 bg-black text-[color:var(--gold)] focus:ring-0 w-3 h-3"
                      />
                      {sev}
                    </label>
                  ))}
                </div>
              </div>

              {/* Exporters tools panel */}
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={exportTXT}
                  className="flex items-center gap-1 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs font-semibold text-gray-300 transition"
                  title="TXT Export"
                >
                  <Download size={12} />
                  TXT
                </button>
                <button
                  onClick={exportJSON}
                  className="flex items-center gap-1 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs font-semibold text-gray-300 transition"
                  title="JSON Export"
                >
                  <Download size={12} />
                  JSON
                </button>
                <button
                  onClick={exportPDF}
                  className="flex items-center gap-1 px-3 py-2 bg-[color:var(--gold)]/10 hover:bg-[color:var(--gold)]/20 border border-[color:var(--gold)]/20 rounded-xl text-xs font-bold text-[color:var(--gold)] transition"
                  title="PDF Download Report"
                >
                  <Download size={12} />
                  PDF Report
                </button>
              </div>
            </div>

            {/* Findings Table Details */}
            <div className="tool-detail-panel rounded-2xl overflow-hidden border border-[color:var(--border)] bg-black/40">
              <div className="p-4 border-b border-[color:var(--border)] bg-white/[0.02]">
                <h3 className="text-xs font-semibold tracking-wider text-[color:var(--text-heading)] uppercase">
                  Scanner Findings ({filteredIssues.length} matches)
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[color:var(--border)] bg-white/[0.01] text-[color:var(--text-muted)] font-mono uppercase text-[10px] tracking-wider">
                      <th className="p-4 w-12 text-center">#</th>
                      <th className="p-4 w-16 text-center">Line</th>
                      <th className="p-4 w-28">Severity</th>
                      <th className="p-4 w-28">Type</th>
                      <th className="p-4">Message / Observation</th>
                      <th className="p-4">Code Context</th>
                      <th className="p-4 w-32 text-center">Remediation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[color:var(--border)]">
                    {filteredIssues.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-[color:var(--text-muted)]">
                          No vulnerabilities found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredIssues.map((it, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.01] transition-colors items-start">
                          <td className="p-4 text-center font-mono text-[color:var(--text-muted)]">
                            {idx + 1}
                          </td>
                          <td className="p-4 text-center font-mono font-bold text-[color:var(--text-heading)]">
                            {it.line}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${severityColors[it.severity]}`}>
                              {it.severity}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="relative group">
                              <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[9px] uppercase font-bold tracking-wider text-gray-300 cursor-help flex items-center gap-1 w-max">
                                {it.type}
                              </span>
                              <div className="absolute hidden group-hover:block z-20 w-56 p-3 bg-gray-800 text-white text-[10px] rounded-xl shadow-2xl left-0 top-full mt-1.5 border border-white/10">
                                {issueDescriptions[it.type] || "Security warning."}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-gray-300 leading-relaxed max-w-[280px]">
                            {it.message}
                          </td>
                          <td className="p-4">
                            <div className="relative group">
                              <div className="font-mono text-[10px] bg-black/60 p-2.5 rounded-lg border border-white/5 max-w-[320px] whitespace-pre-wrap break-all overflow-x-auto max-h-24">
                                {it.snippet}
                              </div>
                              <button
                                onClick={() => copyText(it.snippet, "Snippet")}
                                className="absolute right-2 top-2 p-1 bg-white/5 hover:bg-white/10 rounded border border-white/5 opacity-0 group-hover:opacity-100 transition"
                                title="Copy Snippet"
                              >
                                <ClipboardCopy size={11} className="text-gray-400" />
                              </button>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex flex-col gap-1.5 max-w-[120px] mx-auto">
                              <button
                                onClick={() => applyFix(it.fix, it.snippet)}
                                className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-black font-bold rounded-lg text-[9px] transition uppercase tracking-wider"
                              >
                                <Wrench size={10} />
                                Auto-Fix
                              </button>
                              <button
                                onClick={() => copyText(it.fix, "Remediation Strategy")}
                                className="px-2.5 py-1 text-gray-400 hover:text-white transition text-[9px] underline decoration-amber-500/40"
                              >
                                Copy strategy
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
