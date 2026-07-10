"use client";

import React, { useMemo, useState } from "react";
import { 
  Shield, 
  Download, 
  Terminal, 
  Info, 
  Key, 
  FileText,
  AlertTriangle,
  Upload,
  Zap,
  Beaker,
  CheckCircle,
  X,
  Search,
  Loader2
} from "lucide-react";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";
import { generateRegexPDF } from "./generateRegexPDF";

// --------- small helpers ----------
const apiBase = (process.env.NEXT_PUBLIC_PROD_API_URL || "").replace(/\/$/, "");
const ENDPOINT = `${apiBase}/regex/regexInjectionDetector`;

const escapeForRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function tokenizeRegex(source = "") {
  const tokens = [];
  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    if (ch === "\\") {
      const nxt = source[i + 1] || "";
      tokens.push({ kind: "escape", val: "\\" + nxt });
      i++;
    } else if ("^$.*+?()[]{}".includes(ch)) {
      tokens.push({ kind: "meta", val: ch });
    } else if (ch === "|") {
      tokens.push({ kind: "alt", val: "|" });
    } else {
      tokens.push({ kind: "lit", val: ch });
    }
  }
  return tokens;
}

export default function RegexDetector() {
  const [code, setCode] = useState(
    `const userInput = getInput();
const regex = new RegExp(userInput); // Unescaped input`
  );
  const [results, setResults] = useState([]);
  const [fixes, setFixes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("Static Source Code Scan");
  const [activeTab, setActiveTab] = useState("results");
  const [toasts, setToasts] = useState([]);
  const [vizInput, setVizInput] = useState("a.*(test)?[abc]{2,3}");
  const [vizEscaped, setVizEscaped] = useState(
    escapeForRegex("a.*(test)?[abc]{2,3}")
  );
  const [scanPerformed, setScanPerformed] = useState(false);
  const protectedAction = useProtectedAction();

  const addToast = (message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 5000);
  };
  const removeToast = (id) => setToasts((p) => p.filter((t) => t.id !== id));

  const getSeverity = (risk) => {
    if (/ReDoS/i.test(risk)) return "high";
    if (/Unescaped|Template/i.test(risk)) return "medium";
    return "low";
  };

  const severityColors = {
    high: "bg-red-950/20 text-red-400 border border-red-500/30",
    medium: "bg-amber-950/20 text-amber-400 border border-amber-500/30",
    low: "bg-blue-950/20 text-blue-400 border border-blue-500/30",
  };

  const severityBadges = {
    high: "bg-red-500/10 text-red-400 border border-red-500/20",
    medium: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    low: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  };

  const getSeverityIcon = (s) =>
    s === "high" ? (
      <AlertTriangle className="w-4 h-4 text-red-400" />
    ) : s === "medium" ? (
      <AlertTriangle className="w-4 h-4 text-amber-450" />
    ) : (
      <Shield className="w-4 h-4 text-blue-450" />
    );

  const scanCode = async () => {
    if (!code.trim()) {
      addToast("Please enter some code to scan", "error");
      return;
    }
    setLoading(true);
    setActiveTab("results");
    setResults([]);
    setFixes([]);
    await protectedAction(async (userToken) => {
      try {
        const res = await fetch(ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({ code }),
        });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(
            e.error || `Server error: ${res.status} ${res.statusText}`
          );
        }
        const data = await res.json();
        const issues = data.issues || [];
        const fixSuggestions = data.fixes || [];
        setResults(issues);
        setFixes(fixSuggestions);
        setScanPerformed(true);

        if (!issues.length) {
          addToast(
            "Great! No regex injection vulnerabilities found",
            "success"
          );
        } else {
          const high = issues.filter(
            (i) => getSeverity(i.risk) === "high"
          ).length;
          const med = issues.filter(
            (i) => getSeverity(i.risk) === "medium"
          ).length;
          if (high)
            addToast(
              `Found ${issues.length} issues incl. ${high} high-risk`,
              "error"
            );
          else if (med)
            addToast(
              `Found ${issues.length} issues incl. ${med} medium-risk`,
              "warning"
            );
          else addToast(`Found ${issues.length} low-risk issues`, "warning");
        }
      } catch (e) {
        addToast(`Scan failed: ${e.message}`, "error");
      } finally {
        setLoading(false);
      }
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const r = new FileReader();
    r.onload = (evt) => {
      setCode(String(evt.target.result || ""));
      addToast(`Loaded ${file.name} successfully`, "success");
    };
    r.readAsText(file);
  };

  const downloadPDF = () => {
    generateRegexPDF(results, code, fileName);
  };

  const downloadTXT = () => {
    const lines = [];
    lines.push("=== Regex Injection Detector Report ===");
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push("");
    lines.push(`Issues Found: ${results.length}`);
    lines.push("");
    results.forEach((issue) => {
      lines.push(`[Line ${issue.line}] Pattern: ${issue.pattern}`);
      lines.push(`Risk: ${issue.risk}`);
      lines.push("------------------------------------");
    });
    if (fixes.length) {
      lines.push("");
      lines.push("Auto-Fix Preview:");
      lines.push(fixes.join("\n"));
    }

    const blob = new Blob([lines.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `regex_injection_report_${Date.now()}.txt`;
    a.click();
    a.remove();
  };

  const codeLines = useMemo(() => code.split(/\n/), [code]);

  const renderHighlighted = (lnText) => {
    const re = /new\s+RegExp\s*\(([^)]*)\)/g;
    const parts = [];
    let lastIdx = 0;
    let match;
    while ((match = re.exec(lnText)) !== null) {
      const start = match.index;
      if (start > lastIdx) {
        parts.push(lnText.substring(lastIdx, start));
      }
      parts.push(
        <span
          key={start}
          className="text-red-400 font-bold bg-red-950/20 px-1 py-0.5 rounded border border-red-500/20"
          title="Potentially unsafe — user input passed to RegExp"
        >
          {match[0]}
        </span>
      );
      lastIdx = re.lastIndex;
    }
    if (lastIdx < lnText.length) {
      parts.push(lnText.substring(lastIdx));
    }
    return parts.length ? parts : lnText;
  };

  const getToastBg = (type) =>
    type === "success"
      ? "bg-blue-950/90 border-blue-500/30 text-blue-400"
      : type === "error"
        ? "bg-red-950/90 border-red-500/30 text-red-400"
        : "bg-orange-950/90 border-orange-500/30 text-orange-400";

  const getToastIcon = (type) =>
    type === "success" ? (
      <CheckCircle className="w-5 h-5 text-blue-400" />
    ) : (
      <AlertTriangle className="w-5 h-5 text-red-450" />
    );

  const vizTokens = useMemo(() => tokenizeRegex(vizEscaped), [vizEscaped]);

  return (
    <div 
      className="tool-detail-page min-h-screen"
      style={{
        '--hero-ambient-a': 'rgba(59, 130, 246, 0.08)',
        '--hero-ambient-b': 'rgba(6, 182, 212, 0.03)',
        '--glow-primary': '0 0 34px rgba(59, 130, 246, 0.16)',
        '--gold': '#3b82f6',
        '--gold-strong': '#60a5fa',
        '--gold-dark': '#1d4ed8',
        '--ring': 'rgba(59, 130, 246, 0.34)',
        '--surface-glow': 'rgba(59, 130, 246, 0.14)',
      }}
    >
      <style>{`
        .tool-detail-page .tool-detail-shell {
          padding-top: 3.5rem !important;
        }
        .tool-detail-page ::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.35) !important;
        }
        .tool-detail-page ::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.55) !important;
        }
        .tool-detail-page ::selection {
          background: rgba(59, 130, 246, 0.22) !important;
          color: #eff6ff !important;
        }
        .tool-detail-page :is(button, [role="button"]):is([class*="bg-blue-"], [class*="bg-sky-"]) {
          color: #000000 !important;
        }
        .tool-detail-page :is(button, [role="button"]):is([class*="bg-blue-"], [class*="bg-sky-"]) * {
          color: #000000 !important;
        }
      `}</style>

      {/* Toasts list */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`${getToastBg(t.type)} border rounded-xl p-4 shadow-2xl backdrop-blur-md max-w-sm animate-in slide-in-from-right duration-300 pointer-events-auto flex items-start gap-3`}
          >
            {getToastIcon(t.type)}
            <p className="text-xs font-mono uppercase tracking-wider flex-1 mt-0.5">{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              className="text-zinc-500 hover:text-zinc-200 transition-colors mt-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="tool-detail-shell">
        {/* Navigation & Header */}
        <div className="flex justify-end mb-8">
          <span className="rounded-full border border-blue-500/30 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-blue-400">
            Blue Team
          </span>
        </div>

        {/* Title Block */}
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl border border-blue-500/30 overflow-hidden shadow-lg flex-shrink-0 flex items-center justify-center">
            <Search className="h-8 w-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              REGEX INJECTION <span className="text-blue-400">DETECTOR</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Scan dynamic RegExp constructors, evaluate ReDoS threats, preview auto-fixes, and test user input sanitization filters.
            </p>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* Form Card */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-blue-500/10 transition-all duration-300 space-y-6">
              
              {/* File upload */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800/40 pb-4">
                <div className="flex items-center gap-4">
                  <label htmlFor="file-upload" className="inline-flex items-center gap-2 cursor-pointer bg-zinc-900/40 border border-zinc-800/80 hover:border-blue-500/30 hover:bg-blue-500/5 text-zinc-300 hover:text-blue-400 px-5 py-2.5 rounded-xl transition-all text-xs font-bold font-mono uppercase tracking-wider">
                    <Upload className="w-4 h-4" />
                    Choose File
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".js,.jsx,.ts,.tsx,.txt"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <p className="text-xs font-mono text-zinc-500">
                    Supported: JS, JSX, TS, TSX, TXT
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={downloadPDF}
                    className="px-4 py-2.5 bg-zinc-900/40 hover:bg-blue-500/5 text-zinc-300 hover:text-blue-400 border border-zinc-800/80 hover:border-blue-500/30 rounded-xl font-mono font-bold text-xs uppercase transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    PDF
                  </button>
                  <button
                    onClick={downloadTXT}
                    className="px-4 py-2.5 bg-zinc-900/40 hover:bg-blue-500/5 text-zinc-300 hover:text-blue-400 border border-zinc-800/80 hover:border-blue-500/30 rounded-xl font-mono font-bold text-xs uppercase transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    TXT
                  </button>
                </div>
              </div>

              {/* Code to analyze */}
              <div>
                <h3 className="text-zinc-300 font-mono text-xs uppercase tracking-wider font-bold mb-3">
                  Code to Analyze
                </h3>
                <textarea
                  rows={8}
                  className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 text-xs focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 focus:shadow-[0_0_12px_rgba(59,130,246,0.08)] focus:outline-none transition-all placeholder:text-zinc-650 font-mono resize-none"
                  placeholder="Paste your JavaScript code here..."
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>



              {/* Submit Action */}
              <div className="text-center">
                <button
                  className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-black rounded-xl font-mono font-bold text-xs uppercase px-8 py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2 focus:ring-offset-black/20 disabled:opacity-40 disabled:pointer-events-none"
                  onClick={scanCode}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      Scanning Code...
                    </>
                  ) : (
                    <>
                      <Terminal className="w-4 h-4 text-black" />
                      Scan Code
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Scan Results Card */}
            {scanPerformed && (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-blue-500/10 transition-all duration-300 space-y-8 mt-6">
                {/* Results / Issues Found */}
                <div className="min-h-32">
                  <div className="space-y-6">
                    {results.length ? (
                      <div className="space-y-6">
                        <h2 className="text-xl font-mono font-bold text-zinc-100 flex items-center gap-3 border-b border-zinc-800/40 pb-3 mb-2">
                          <AlertTriangle className="w-6 h-6 text-red-400" />
                          Issues Found: {results.length}
                        </h2>
                        {results.map((issue, idx) => {
                          const severity = getSeverity(issue.risk);
                          return (
                            <div
                              key={idx}
                              className={`rounded-2xl border p-6 font-mono text-sm space-y-4 min-h-[220px] ${severityColors[severity]}`}
                            >
                              <div className="flex items-start justify-between border-b border-zinc-850 pb-2">
                                <div className="flex items-center gap-3">
                                  {getSeverityIcon(severity)}
                                  <span
                                    className={`inline-block px-3 py-1 rounded-full font-semibold text-xs uppercase tracking-wider ${severityBadges[severity]}`}
                                  >
                                    {severity.toUpperCase()} RISK
                                  </span>
                                </div>
                                <span className="text-zinc-500 text-xs">
                                  Line {issue.line}
                                </span>
                              </div>

                              <div className="space-y-3">
                                <div>
                                  <p className="font-semibold text-zinc-300 mb-1.5 text-xs uppercase tracking-wider">
                                    Pattern:
                                  </p>
                                  <code className="bg-zinc-900/40 text-blue-450 px-4 py-3 rounded-xl text-sm block overflow-x-auto border border-zinc-800/80 font-mono leading-relaxed">
                                    {issue.pattern}
                                  </code>
                                </div>

                                <div>
                                  <p className="font-semibold text-zinc-300 mb-1.5 text-xs uppercase tracking-wider">
                                    Risk:
                                  </p>
                                  <p className="text-zinc-350 text-sm leading-relaxed">
                                    {issue.risk}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-zinc-550 border border-zinc-850 bg-zinc-950/20 rounded-2xl">
                        <Shield className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
                        <p className="text-md font-mono text-blue-400 mb-2 uppercase tracking-wider font-semibold">
                          No issues found
                        </p>
                        <p className="text-xs max-w-sm mx-auto leading-relaxed px-4">
                          No vulnerable regular expression patterns detected in this code segment.
                        </p>
                      </div>
                    )}
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
                <Info className="text-blue-400 w-4 h-4" />
                Detector Scope
              </h2>
              <ul className="space-y-3.5 list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Audits javascript RegExp expressions for dynamic user injection variables.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Identifies vulnerable ReDoS patterns (catastrophic backtracking risks).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Generates automated Jest test specs to verify local input escaping mechanisms.
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
