"use client";

import { useState, useMemo, useRef } from "react";
import useProtectedAction from "@/components/UseProtectedAction/UseProtectedAction";
import { toast } from "react-hot-toast";
import { generateSourceCodePDF } from "@/components/codeAnalysis/generateSourceCodePDF";
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
  ClipboardCopy,
  Wrench,
  BookOpen,
  Info,
  Terminal,
  FileDown,
  Loader2
} from "lucide-react";

export default function SourceCodeAnalyzer() {
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
    Low: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    Medium: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    High: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
    Critical: 'bg-red-500/10 text-red-400 border border-red-500/20',
  };

  const riskColor = useMemo(() => {
    if (riskScore >= 90) return 'from-red-650 to-red-950 shadow-red-500/10';
    if (riskScore >= 70) return 'from-orange-650 to-orange-950 shadow-orange-500/10';
    if (riskScore >= 40) return 'from-amber-650 to-amber-950 shadow-amber-500/10';
    if (riskScore > 0) return 'from-blue-650 to-blue-950 shadow-blue-500/10';
    return 'from-zinc-900 to-zinc-950';
  }, [riskScore]);

  // Load sample snippets
  const loadSample = (kind) => {
    const samples = {
      jsxss: `function displayUserInput() {\n  const userInput = document.getElementById('userInput').value;\n  document.getElementById('out').innerHTML = userInput; // ❌ Vulnerable to DOM XSS\n}`,
      react: `export default function Post({ html }) {\n  // Danger: raw rendering\n  return <div dangerouslySetInnerHTML={{ __html: html }} />;\n}`,
      vue: `<template>\n  <div v-html="rawHtml"></div> <!-- Unsanitized Vue output -->\n</template>`,
      php: `<?php\n$userId = $_GET['id'];\n// SQLi concatenation pattern\n$query = "SELECT * FROM users WHERE id = " . $userId;\n$result = mysqli_query($conn, $query);\n?>`,
      evaldanger: `const code = prompt('Enter mathematical formula:');\neval(code); // ❌ Dangerous eval runtime injection`,
      domclobber: `const config = {};\nwindow.config = config; // Variable declaration can clobber globals`,
      prototype: `const obj = {};\nobj.__proto__.malicious = true; // Unrestricted prototype assignments`,
      safe: `const el = document.getElementById('out');\n// Secure text nodes usage\nel.textContent = userInput;\n\n// ✅ Parameterized statement placeholder query\n$stmt = $conn->prepare("SELECT * FROM users WHERE id = ?");\n$stmt->bind_param("i", $userId);`,
    };
    setCode(samples[kind] || "");
    setFile(null);
    setSelectedTemplate(kind);
    toast.success("Sample template loaded!");
  };

  const getTemplateBtnClass = (kind) => {
    const isSelected = selectedTemplate === kind;
    if (isSelected) {
      return "p-3 rounded-xl border border-red-500/50 bg-red-500/5 text-white font-mono text-xs font-bold transition cursor-pointer text-center flex items-center justify-center";
    }
    return "p-3 rounded-xl border border-zinc-800 bg-white/[0.01] text-zinc-300 hover:bg-white/[0.03] hover:border-zinc-700 font-mono text-xs font-medium transition cursor-pointer text-center flex items-center justify-center";
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
    setCode("");
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
          throw new Error(errorData.error || errorData.message || `API error: ${res.statusText}`);
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
  const exportPDF = async () => {
    if (!result) {
      toast.error("Please run a scan first to generate a report.");
      return;
    }
    toast.loading("Generating PDF Report...", { id: "pdf-gen" });
    try {
      let finalCode = code;
      if (file) {
        finalCode = await readFileAsText(file);
      }
      await generateSourceCodePDF(
        result,
        { code: finalCode, fileName: file ? file.name : "Code Snippet" },
        (msg) => {
          if (msg) {
            toast.loading(msg, { id: "pdf-gen" });
          }
        }
      );
      toast.success("PDF report downloaded!", { id: "pdf-gen" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF report", { id: "pdf-gen" });
    }
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
    <div 
      className="tool-detail-page min-h-screen"
      style={{
        '--hero-ambient-a': 'rgba(239, 68, 68, 0.08)',
        '--hero-ambient-b': 'rgba(249, 115, 22, 0.03)',
        '--glow-primary': '0 0 34px rgba(239, 68, 68, 0.16)',
        '--gold': '#ef4444',
        '--gold-strong': '#f87171',
        '--gold-dark': '#b91c1c',
        '--ring': 'rgba(239, 68, 68, 0.34)',
        '--surface-glow': 'rgba(239, 68, 68, 0.14)',
      }}
    >
      <style>{`
        .tool-detail-page .tool-detail-shell {
          padding-top: 3.5rem !important;
        }
        .tool-detail-page ::-webkit-scrollbar-thumb {
          background: rgba(239, 68, 68, 0.35) !important;
        }
        .tool-detail-page ::-webkit-scrollbar-thumb:hover {
          background: rgba(239, 68, 68, 0.55) !important;
        }
        .tool-detail-page ::selection {
          background: rgba(239, 68, 68, 0.22) !important;
          color: #fef2f2 !important;
        }
        .tool-detail-page :is(button, [role="button"]):is([class*="bg-red-"], [class*="bg-rose-"]) {
          color: #000000 !important;
        }
        .tool-detail-page :is(button, [role="button"]):is([class*="bg-red-"], [class*="bg-rose-"]) * {
          color: #000000 !important;
        }
      `}</style>

      <div className="tool-detail-shell">
        {/* Navigation & Header */}
        <div className="flex justify-end mb-8">
          <span className="rounded-full border border-red-500/30 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-red-400">
            Red Team
          </span>
        </div>

        {/* Title Block */}
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl border border-red-500/30 overflow-hidden shadow-lg flex-shrink-0 flex items-center justify-center">
            <Code2 className="h-8 w-8 text-red-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              SOURCE CODE <span className="text-red-400">ANALYZER</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Inspect scripts, templates, and raw server-side controllers to scan for SQL Injection, XSS, prototype pollution, and dangerous evaluations.
            </p>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* Form Card */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-red-500/10 transition-all duration-300 space-y-5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-mono font-medium text-zinc-100 flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-red-400" />
                  Target Code Script
                </h2>
                {code && (
                  <button 
                    onClick={() => setCode("")} 
                    className="text-xs text-red-400 hover:text-red-300 font-mono transition"
                  >
                    [Clear Editor]
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* Textarea Editor */}
                <textarea
                  className="w-full h-64 resize-none bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-4 font-mono text-xs focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 focus:shadow-[0_0_12px_rgba(239,68,68,0.08)] focus:outline-none transition-all placeholder:text-zinc-650"
                  placeholder="Paste your HTML, JS, PHP, or Vue code here..."
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    if (file) setFile(null);
                    setSelectedTemplate(null);
                  }}
                />

                {/* Upload and Reset row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-zinc-800/40 pt-4">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/80 cursor-pointer text-xs font-semibold text-zinc-300 hover:text-white transition">
                      <Upload size={14} className="text-red-400" />
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
                      <span className="text-xs text-zinc-400 font-mono max-w-[200px] truncate">
                        {file.name}
                      </span>
                    )}
                  </div>

                  {(code || file) && (
                    <button
                      onClick={clearInputs}
                      className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition px-3.5 py-2.5 border border-zinc-800/80 rounded-xl bg-zinc-900/40"
                    >
                      <Trash2 size={13} />
                      Reset Form
                    </button>
                  )}
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    onClick={handleSubmit}
                    disabled={loading || (!code.trim() && !file)}
                    className="w-full bg-red-500 hover:bg-red-600 text-black rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:ring-offset-2 focus:ring-offset-black/20 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        Analyzing Vulnerability Matrices...
                      </>
                    ) : (
                      <>
                        <Play size={13} className="text-black" fill="black" />
                        Run Inspection
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Vulnerability Templates */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-red-500/10 transition-all duration-300 space-y-4">
              <h3 className="text-sm font-mono font-bold text-zinc-200 flex items-center gap-2 border-b border-zinc-850 pb-2.5">
                <BookOpen size={16} className="text-red-400" />
                Vulnerability Templates
              </h3>
              <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                Load sample snippets containing security exploits to test scanner heuristics:
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
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
                  React innerHTML
                </button>
                <button
                  onClick={() => loadSample("vue")}
                  className={getTemplateBtnClass("vue")}
                >
                  Vue v-html
                </button>
                <button
                  onClick={() => loadSample("php")}
                  className={getTemplateBtnClass("php")}
                >
                  PHP SQLi
                </button>
                <button
                  onClick={() => loadSample("evaldanger")}
                  className={getTemplateBtnClass("evaldanger")}
                >
                  Dangerous Eval
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

            {/* Results block */}
            {result && (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-red-500/10 transition-all duration-300 space-y-6">
                
                <h3 className="text-base font-mono font-bold text-zinc-100 uppercase tracking-wider border-b border-zinc-800/40 pb-2">
                  Security Dashboard
                </h3>

                <div className="grid gap-4 sm:grid-cols-3">
                  {/* Score gauge */}
                  <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl flex items-center justify-between font-mono text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-semibold mb-1 block">
                        Assessed Risk
                      </span>
                      <div className="text-lg font-bold text-zinc-150">
                        {riskBand}
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        Lang: {detectedLanguage}
                      </div>
                    </div>
                    
                    <div className={`w-14 h-14 rounded-full flex flex-col items-center justify-center bg-gradient-to-br ${riskColor} text-white border border-white/5`}>
                      <span className="text-base font-extrabold">{riskScore}</span>
                      <span className="text-[6px] uppercase font-mono tracking-wider opacity-60">Score</span>
                    </div>
                  </div>

                  {/* Types breakdown */}
                  <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl font-mono text-xs">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-semibold mb-2 block">
                      Flaws By Type
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      {Object.entries(analytics.byType).map(([type, val]) => {
                        const displayName = type === "PrototypePollution" ? "Prototype" : type === "DOMClobber" ? "DOMClobber" : type;
                        return (
                          <div key={type} className="flex justify-between items-center text-zinc-300">
                            <span>{displayName}:</span>
                            <span className={`font-bold ${val > 0 ? "text-red-400" : "text-zinc-650"}`}>
                              {val}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Severities breakdown */}
                  <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl font-mono text-xs">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-semibold mb-2 block">
                      Flaws By Severity
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      {Object.entries(analytics.bySeverity).map(([severity, val]) => (
                        <div key={severity} className="flex justify-between items-center text-zinc-300">
                          <span className="flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              severity === "Critical" ? "bg-red-500" :
                              severity === "High" ? "bg-orange-500" :
                              severity === "Medium" ? "bg-amber-500" : "bg-blue-500"
                            }`}></span>
                            {severity}:
                          </span>
                          <span className={`font-bold ${val > 0 ? "text-zinc-155" : "text-zinc-650"}`}>
                            {val}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Filter and export toolbar */}
                <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
                  
                  {/* Search */}
                  <div className="relative flex-1 min-w-[200px]">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-550" />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Search findings..."
                      className="w-full bg-zinc-900/40 text-xs text-zinc-100 border border-zinc-800/80 rounded-xl py-3.5 pl-10 pr-4 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 focus:outline-none transition-all placeholder:text-zinc-650 font-mono"
                    />
                  </div>

                  {/* Severity Checkboxes */}
                  <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl px-4 py-3 flex items-center justify-between font-mono text-xs flex-shrink-0">
                    <span className="text-[9px] uppercase font-bold text-zinc-400 flex items-center gap-1 mr-3">
                      <Filter size={11} className="text-red-400" />
                      Filter:
                    </span>
                    <div className="flex gap-3 text-[9px] font-bold">
                      {['Low', 'Medium', 'High', 'Critical'].map((sev) => (
                        <label key={sev} className="flex items-center gap-1.5 cursor-pointer text-zinc-400 hover:text-white transition">
                          <input
                            type="checkbox"
                            checked={sevFilter[sev]}
                            onChange={() => setSevFilter((p) => ({ ...p, [sev]: !p[sev] }))}
                            className="rounded border-zinc-800 bg-black text-red-500 focus:ring-0 focus:ring-offset-0 w-3 h-3 cursor-pointer"
                          />
                          {sev}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Exporter triggers */}
                  <div className="flex gap-2 items-center justify-end flex-shrink-0">
                    <button
                      onClick={exportTXT}
                      className="px-4 py-3 bg-zinc-900/40 hover:bg-red-500/5 text-zinc-300 hover:text-red-400 border border-zinc-800/80 hover:border-red-500/30 rounded-xl font-mono font-bold text-xs uppercase transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                      title="TXT Export"
                    >
                      <Download size={12} />
                      TXT
                    </button>
                    <button
                      onClick={exportJSON}
                      className="px-4 py-3 bg-zinc-900/40 hover:bg-red-500/5 text-zinc-300 hover:text-red-400 border border-zinc-800/80 hover:border-red-500/30 rounded-xl font-mono font-bold text-xs uppercase transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                      title="JSON Export"
                    >
                      <Download size={12} />
                      JSON
                    </button>
                    <button
                      onClick={exportPDF}
                      className="px-4 py-3 bg-zinc-900/40 hover:bg-red-500/5 text-zinc-300 hover:text-red-400 border border-zinc-800/80 hover:border-red-500/30 rounded-xl font-mono font-bold text-xs uppercase transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                      title="PDF Download Report"
                    >
                      <FileDown size={12} />
                      PDF
                    </button>
                  </div>

                </div>

                {/* Table details */}
                <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl overflow-hidden font-mono text-xs">
                  <div className="p-4 border-b border-zinc-850 bg-white/[0.01]">
                    <h4 className="text-xs font-mono font-bold text-zinc-300 uppercase">
                      Scanner Findings ({filteredIssues.length} Matches)
                    </h4>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-850 bg-zinc-950/20 text-zinc-500 font-mono uppercase text-[9px] tracking-wider">
                          <th className="p-4 w-12 text-center">#</th>
                          <th className="p-4 w-16 text-center">Line</th>
                          <th className="p-4 w-28">Severity</th>
                          <th className="p-4 w-28">Type</th>
                          <th className="p-4">Message</th>
                          <th className="p-4 w-72 md:w-80">Trigger Snippet</th>
                          <th className="p-4 w-32 text-center">Remediation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-850">
                        {filteredIssues.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-zinc-550">
                              No vulnerabilities detected matching search criteria.
                            </td>
                          </tr>
                        ) : (
                          filteredIssues.map((it, idx) => (
                            <tr key={idx} className="hover:bg-white/[0.01] transition-colors">
                              <td className="p-4 text-center text-zinc-550 font-mono">
                                {idx + 1}
                              </td>
                              <td className="p-4 text-center font-bold text-zinc-200">
                                {it.line}
                              </td>
                              <td className="p-4">
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${severityColors[it.severity]}`}>
                                  {it.severity}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="relative group">
                                  <span className="px-2 py-0.5 rounded-lg bg-zinc-950 border border-zinc-850 text-[9px] uppercase font-bold tracking-wider text-zinc-400 cursor-help inline-block">
                                    {it.type}
                                  </span>
                                  <div className="absolute hidden group-hover:block z-20 w-56 p-3 bg-zinc-900 text-zinc-300 text-[10px] rounded-xl shadow-2xl left-0 top-full mt-1.5 border border-zinc-800">
                                    {issueDescriptions[it.type] || "Security warning."}
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-zinc-300 leading-relaxed max-w-[240px]">
                                {it.message}
                              </td>
                              <td className="p-4 w-72 md:w-80">
                                <div className="relative group">
                                  <div className="font-mono text-[10px] bg-black/60 p-2.5 rounded-lg border border-zinc-850 w-64 md:w-72 whitespace-pre overflow-x-auto max-h-24 text-zinc-400">
                                    {it.snippet}
                                  </div>
                                  <button
                                    onClick={() => copyText(it.snippet, "Snippet")}
                                    className="absolute right-2 top-2 p-1 bg-zinc-900/40 hover:bg-zinc-800 rounded border border-zinc-850 opacity-0 group-hover:opacity-100 transition"
                                    title="Copy Snippet"
                                  >
                                    <ClipboardCopy size={11} className="text-zinc-500" />
                                  </button>
                                </div>
                              </td>
                              <td className="p-4 text-center">
                                <div className="flex flex-col gap-1.5 max-w-[120px] mx-auto">
                                  <button
                                    onClick={() => applyFix(it.fix, it.snippet)}
                                    className="px-2.5 py-1.5 bg-red-500 hover:bg-red-600 text-black font-bold rounded-lg text-[9px] transition uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    <Wrench size={10} className="text-black" />
                                    Auto-Fix
                                  </button>
                                  <button
                                    onClick={() => copyText(it.fix, "Remediation Strategy")}
                                    className="px-2.5 py-1 text-zinc-450 hover:text-white transition text-[9px] underline decoration-red-500/20"
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

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Guidance sidebar card */}
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Info className="text-red-400 w-4 h-4" />
                Analyzer Scope
              </h2>
              <ul className="space-y-3.5 list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Audits static codebase scripts for client-side and DOM-based Cross-Site Scripting (XSS) weaknesses.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Detects server-side SQL Injection (SQLi) query concatenation patterns and unsafe binding configurations.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Flags execution of dangerous eval blocks, insecure window global structures, and prototype overrides.
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
