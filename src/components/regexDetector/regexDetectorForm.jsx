"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Upload,
  AlertTriangle,
  CheckCircle,
  Shield,
  X,
  FileText,
  Zap,
  Download,
  Beaker,
  Network
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// --------- small helpers ----------
const apiBase = (process.env.NEXT_PUBLIC_PROD_API_URL || "").replace(/\/$/, "");
const ENDPOINT = `${apiBase}/regex/regexInjectionDetector`;

// very safe escaping for user input → regex source
const escapeForRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function tokenizeRegex(source = "") {
  // simple tokenizer for a visual summary (not a full parser)
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
const regex = new RegExp(userInput); // ⚠️ Unescaped input`
  );
  const [results, setResults] = useState([]); // [{line, pattern, risk}]
  const [fixes, setFixes] = useState([]);     // [fixed lines...]
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("results");
  const [toasts, setToasts] = useState([]);
  const [vizInput, setVizInput] = useState("a.*(test)?[abc]{2,3}");
  const [vizEscaped, setVizEscaped] = useState(escapeForRegex("a.*(test)?[abc]{2,3}"));

  // ---------- toast ----------
  const addToast = (message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 5000);
  };
  const removeToast = (id) => setToasts((p) => p.filter((t) => t.id !== id));

  // ---------- severity ----------
  const getSeverity = (risk) => {
    if (/ReDoS/i.test(risk)) return "high";
    if (/Unescaped|Template/i.test(risk)) return "medium";
    return "low";
  };
  const severityColors = {
    high: "bg-red-50 text-red-700 border-red-200",
    medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
    low: "bg-blue-50 text-blue-700 border-blue-200",
  };
  const severityBadges = {
    high: "bg-red-100 text-red-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-blue-100 text-blue-800",
  };
  const getSeverityIcon = (s) =>
    s === "high" ? (
      <AlertTriangle className="w-5 h-5 text-red-600" />
    ) : s === "medium" ? (
      <AlertTriangle className="w-5 h-5 text-yellow-600" />
    ) : (
      <Shield className="w-5 h-5 text-blue-600" />
    );

  // ---------- scanning ----------
  const scanCode = async () => {
    if (!code.trim()) {
      addToast("Please enter some code to scan", "error");
      return;
    }
    setLoading(true);
    setActiveTab("results");
    setResults([]);
    setFixes([]);
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || `Server error: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      const issues = data.issues || [];
      const fixSuggestions = data.fixes || [];
      setResults(issues);
      setFixes(fixSuggestions);

      if (!issues.length) {
        addToast("✅ Great! No regex injection vulnerabilities found", "success");
      } else {
        const high = issues.filter((i) => getSeverity(i.risk) === "high").length;
        const med = issues.filter((i) => getSeverity(i.risk) === "medium").length;
        if (high) addToast(`⚠️ Found ${issues.length} issues incl. ${high} high-risk`, "error");
        else if (med) addToast(`⚠️ Found ${issues.length} issues incl. ${med} medium-risk`, "warning");
        else addToast(`Found ${issues.length} low-risk issues`, "warning");
      }
    } catch (e) {
      addToast(`Scan failed: ${e.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // ---------- file upload ----------
  const handleFileUpload = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/\.(js|jsx|ts|tsx|txt)$/i.test(f.name)) {
      addToast("Please upload a valid code file (.js, .jsx, .ts, .tsx, .txt)", "error");
      return;
    }
    const r = new FileReader();
    r.onload = () => {
      setCode(String(r.result || ""));
      addToast(`File "${f.name}" loaded successfully`, "success");
    };
    r.onerror = () => addToast("Failed to read file", "error");
    r.readAsText(f);
  };

  // ---------- highlighting (dangerous argument inside new RegExp(...)) ----------
  const codeLines = useMemo(() => code.split(/\r?\n/), [code]);

  function computeHighlights(line) {
    const ranges = []; // [{start,end}]
    const re = /new\s+RegExp\s*\(([^)]*)\)/g;
    let m;
    while ((m = re.exec(line))) {
      const full = m[0];
      const inner = m[1] ?? "";
      const innerStartInFull = full.indexOf(inner);
      if (innerStartInFull >= 0) {
        const start = m.index + innerStartInFull;
        const end = start + inner.length;
        ranges.push({ start, end });
      }
    }
    return ranges;
  }

  function renderHighlighted(line) {
    const ranges = computeHighlights(line);
    if (!ranges.length) return <span>{line || " "}</span>;
    const parts = [];
    let cursor = 0;
    ranges.sort((a, b) => a.start - b.start);
    for (const r of ranges) {
      if (r.start > cursor) parts.push(<span key={cursor + "a"}>{line.slice(cursor, r.start)}</span>);
      parts.push(
        <span
          key={r.start + "b"}
          className="bg-red-100 text-red-700 rounded px-1 ring-1 ring-red-200"
          title="Potentially unsafe — user input passed to RegExp"
        >
          {line.slice(r.start, r.end)}
        </span>
      );
      cursor = r.end;
    }
    if (cursor < line.length) parts.push(<span key={cursor + "c"}>{line.slice(cursor)}</span>);
    if (!line) parts.push(<span key="sp">&nbsp;</span>);
    return parts;
  }

  // ---------- exports ----------
  const downloadTXT = () => {
    const body = [
      "=== Regex Injection Detector Report ===",
      "",
      `Total issues: ${results.length}`,
      "",
      "Issues:",
      ...(results.length
        ? results.map(
            (i, idx) =>
              `${idx + 1}. Line ${i.line} — ${i.risk}\n   Pattern: ${i.pattern}`
          )
        : ["(none)"]),
      "",
      "Suggested Fixes:",
      ...(fixes.length ? fixes.map((l) => `- ${l}`) : ["(none)"]),
      "",
      "Code Snapshot:",
      "--------------------",
      code,
      "--------------------",
      "",
    ].join("\n");
    const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `regex_injection_report_${Date.now()}.txt`;
    a.click();
    a.remove();
  };

  const downloadPDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const M = 40;
    let y = 56;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Regex Injection Detector Report", M, y);
    y += 20;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Total issues: ${results.length}`, M, y);
    y += 10;

    autoTable(doc, {
      startY: y + 10,
      head: [["#", "Line", "Risk", "Pattern"]],
      body: results.length
        ? results.map((i, idx) => [String(idx + 1), String(i.line), i.risk, i.pattern])
        : [["—", "—", "—", "(no issues)"]],
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 9, cellWidth: "wrap" },
      columnStyles: { 3: { cellWidth: 340 } },
      margin: { left: M, right: M },
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 16,
      head: [["Suggested Fixes"]],
      body: fixes.length ? fixes.map((l) => [l]) : [["(none)"]],
      styles: { fontSize: 9 },
      margin: { left: M, right: M },
    });

    // small code excerpt
    const excerpt = code.split(/\r?\n/).slice(0, 40).join("\n");
    const lines = doc.splitTextToSize(excerpt, 515);
    doc.setFont("helvetica", "bold");
    doc.text("Code (first 40 lines):", M, doc.lastAutoTable.finalY + 24);
    doc.setFont("courier", "normal");
    doc.text(lines, M, doc.lastAutoTable.finalY + 40);

    doc.save(`regex_injection_report_${Date.now()}.pdf`);
  };

  // ---------- visualizer ----------
  const vizTokens = useMemo(() => tokenizeRegex(vizEscaped), [vizEscaped]);

  const getToastIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "error":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Shield className="w-5 h-5 text-blue-600" />;
    }
  };
  const getToastBg = (type) =>
    type === "success"
      ? "bg-green-50 border-green-200"
      : type === "error"
      ? "bg-red-50 border-red-200"
      : type === "warning"
      ? "bg-yellow-50 border-yellow-200"
      : "bg-blue-50 border-blue-200";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`${getToastBg(
              t.type
            )} border rounded-lg p-4 shadow-lg backdrop-blur-sm max-w-sm animate-in slide-in-from-right duration-300`}
          >
            <div className="flex items-start gap-3">
              {getToastIcon(t.type)}
              <p className="text-sm text-gray-700 flex-1">{t.message}</p>
              <button
                onClick={() => removeToast(t.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          {/* centered image */}
          <img
            src="/tools/card-images/regex.png"
            alt="regex"
            className="w h-20 mx-auto mb-4 mt-10 block"
          />
          <div className="flex items-center justify-center gap-3 mb-4">
            <Search className="w-8 h-8 text-green-600" />
            <h1 className="text-4xl font-bold text-gray-800">
              Regex Injection Detector
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Identify and prevent regex injection vulnerabilities in your JavaScript code
          </p>

          {/* export buttons */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={downloadPDF}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-700 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button
              onClick={downloadTXT}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-700 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              Download TXT
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          {/* File Upload */}
          <div className="mb-6">
            <label className="flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl w-fit">
              <Upload className="w-5 h-5" />
              <span className="font-medium">Choose File</span>
              <input
                type="file"
                accept=".js,.jsx,.ts,.tsx,.txt"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
            <p className="text-sm text-gray-500 mt-2">
              Supported formats: JS, JSX, TS, TSX, TXT
            </p>
          </div>

          {/* Code Input w/ highlighting preview */}
          <div className="mb-6 grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-3">
                <FileText className="w-5 h-5 inline mr-2 text-green-600" />
                Code to Analyze
              </label>
              <textarea
                rows={12}
                className="w-full p-4 rounded-xl border-2 border-gray-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Paste your JavaScript code here..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>

            {/* live highlighted view */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Network className="w-5 h-5 text-green-600" />
                <div className="text-lg font-semibold text-gray-800">
                  Dangerous Parts (preview)
                </div>
              </div>
              <div className="border rounded-xl bg-gray-50 max-h-[292px] overflow-auto font-mono text-sm">
                {codeLines.map((ln, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[56px_1fr] px-3 py-1 border-b last:border-b-0 border-gray-100"
                  >
                    <div className="text-right pr-3 text-gray-400 select-none">
                      {i + 1}
                    </div>
                    <div className="whitespace-pre">{renderHighlighted(ln)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scan Button */}
          <button
            className={`px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 flex items-center gap-2 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl"
            }`}
            onClick={scanCode}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Scanning...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Scan Code
              </>
            )}
          </button>

          {/* Tabs */}
          <div className="flex space-x-2 mt-8 border-b border-gray-200">
            <button
              className={`px-4 py-2 font-medium rounded-t-lg transition-all duration-200 flex items-center gap-2 ${
                activeTab === "results"
                  ? "bg-green-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-green-600 hover:bg-green-50"
              }`}
              onClick={() => setActiveTab("results")}
            >
              <AlertTriangle className="w-4 h-4" />
              Issues ({results.length})
            </button>
            <button
              className={`px-4 py-2 font-medium rounded-t-lg transition-all duration-200 flex items-center gap-2 ${
                activeTab === "fixes"
                  ? "bg-green-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-green-600 hover:bg-green-50"
              }`}
              onClick={() => setActiveTab("fixes")}
            >
              <Zap className="w-4 h-4" />
              Auto-fix Preview ({fixes.length})
            </button>
            <button
              className={`px-4 py-2 font-medium rounded-t-lg transition-all duration-200 flex items-center gap-2 ${
                activeTab === "visualizer"
                  ? "bg-green-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-green-600 hover:bg-green-50"
              }`}
              onClick={() => setActiveTab("visualizer")}
            >
              <Beaker className="w-4 h-4" />
              Visualizer
            </button>
            <button
              className={`px-4 py-2 font-medium rounded-t-lg transition-all duration-200 flex items-center gap-2 ${
                activeTab === "tests"
                  ? "bg-green-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-green-600 hover:bg-green-50"
              }`}
              onClick={() => setActiveTab("tests")}
            >
              <FileText className="w-4 h-4" />
              Unit Tests
            </button>
          </div>

          {/* Results Tab */}
          {activeTab === "results" && (
            <div className="mt-6">
              {results.length ? (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    Issues Found: {results.length}
                  </h2>
                  {results.map((issue, idx) => {
                    const severity = getSeverity(issue.risk);
                    return (
                      <div
                        key={idx}
                        className={`rounded-xl shadow-lg border-2 p-6 ${severityColors[severity]}`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {getSeverityIcon(severity)}
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${severityBadges[severity]}`}
                            >
                              {severity.toUpperCase()} RISK
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-600">
                            Line {issue.line}
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="font-semibold text-gray-800 mb-1">
                              Pattern:
                            </p>
                            <code className="bg-gray-800 text-green-400 px-3 py-2 rounded-lg text-sm block overflow-x-auto">
                              {issue.pattern}
                            </code>
                          </div>

                          <div>
                            <p className="font-semibold text-gray-800 mb-1">
                              Risk:
                            </p>
                            <p className="text-gray-700">{issue.risk}</p>
                          </div>

                          {issue.risk.includes("Unescaped") && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                              <p className="font-semibold text-green-800 mb-2">
                                💡 Suggested Fix:
                              </p>
                              <p className="text-sm text-green-700 mb-2">
                                Escape user input before passing to{" "}
                                <code>RegExp</code>:
                              </p>
                              <code className="bg-green-800 text-green-300 px-3 py-2 rounded-lg text-sm block overflow-x-auto">
                                input.replace(/[.*+?^${"{}"}()|[\\]\\\\]/g, '\\\\$&')
                              </code>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <Shield className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">
                    {loading ? "Analyzing code..." : "No issues found or scan not performed yet"}
                  </p>
                  <p className="text-sm mt-2">
                    Upload your code and click "Scan Code" to begin analysis
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Auto-fix Preview Tab */}
          {activeTab === "fixes" && (
            <div className="mt-6">
              {fixes.length ? (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
                    <Zap className="w-6 h-6 text-green-600" />
                    Suggested Fixes
                  </h2>
                  <div className="bg-gray-900 rounded-xl p-6 overflow-hidden">
                    <pre className="text-green-400 text-sm overflow-x-auto whitespace-pre-wrap leading-relaxed">
                      {fixes.join("\n")}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <Zap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">
                    {loading ? "Generating fixes..." : "No auto-fixes available"}
                  </p>
                  <p className="text-sm mt-2">
                    Fixes will appear here after scanning code with issues
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Visualizer Tab */}
          {activeTab === "visualizer" && (
            <div className="mt-6 grid md:grid-cols-2 gap-6">
              <div className="rounded-xl border p-4 bg-gray-50">
                <h3 className="font-semibold mb-2">Try a sample user input</h3>
                <input
                  className="w-full border rounded-lg px-3 py-2 mb-3"
                  value={vizInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setVizInput(val);
                    setVizEscaped(escapeForRegex(val));
                  }}
                  placeholder="Type user input to be escaped…"
                />
                <div className="text-sm text-gray-600 mb-1">Escaped for RegExp:</div>
                <div className="font-mono text-sm bg-white border rounded p-2 overflow-auto">
                  {vizEscaped}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This is what your code should pass to <code>new RegExp()</code>.
                </p>
              </div>

              <div className="rounded-xl border p-4 bg-white">
                <h3 className="font-semibold mb-3">Regex Structure (escaped)</h3>
                <div className="flex flex-wrap gap-2">
                  {vizTokens.map((t, i) => (
                    <span
                      key={i}
                      className={`px-2 py-1 rounded text-xs font-mono ${
                        t.kind === "meta"
                          ? "bg-purple-100 text-purple-800"
                          : t.kind === "escape"
                          ? "bg-amber-100 text-amber-800"
                          : t.kind === "alt"
                          ? "bg-sky-100 text-sky-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                      title={t.kind}
                    >
                      {t.val}
                    </span>
                  ))}
                </div>
                {!vizTokens.length && (
                  <div className="text-sm text-gray-500">Nothing to visualize</div>
                )}
              </div>
            </div>
          )}

          {/* Unit Tests Tab */}
          {activeTab === "tests" && (
            <div className="mt-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                Unit Test Generator (Jest)
              </h2>
              <div className="rounded-xl bg-gray-900 p-6">
                <pre className="text-green-300 text-sm whitespace-pre-wrap overflow-x-auto leading-relaxed">{`function escapeForRegex(s){return s.replace(/[.*+?^${'{}'}()|[\\]\\\\]/g,'\\\\$&');}

describe('user input → RegExp safety', () => {
  const raw = ${JSON.stringify(vizInput)};
  const escaped = escapeForRegex(raw);

  test('escaped matches the literal input only', () => {
    const rx = new RegExp(escaped);
    expect(rx.test(raw)).toBe(true);            // literal
    expect(rx.test('xxx' + raw + 'yyy')).toBe(true); // substring ok
  });

  test('meta characters are treated literally', () => {
    const tricky = 'abc.*(test)?[123]{2,3}';
    const e = escapeForRegex(tricky);
    const rx = new RegExp(e);
    expect(rx.test('abcZZZ')).toBe(false);
    expect(rx.test(tricky)).toBe(true);
  });

  test('no catastrophic backtracking from raw meta', () => {
    const rawMeta = '.*(a+)+$';
    const e = escapeForRegex(rawMeta);
    const rx = new RegExp(e);
    expect(rx.test('aaaaa')).toBe(false); // escaped means literal ".*(a+)+$"
  });
});`}</pre>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Copy this into a <code>.test.js</code> file to validate escaping behavior.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 text-sm">
          <p>🔒 Your code is analyzed securely and locally</p>
        </div>
      </div>
    </div>
  );
}
