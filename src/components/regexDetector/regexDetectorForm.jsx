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
    high: "bg-red-900/20 text-red-400 border-red-800",
    medium: "bg-yellow-900/20 text-yellow-400 border-yellow-800",
    low: "bg-blue-900/20 text-blue-400 border-blue-800",
  };
  const severityBadges = {
    high: "bg-red-900/30 text-red-400 border border-red-800",
    medium: "bg-yellow-900/30 text-yellow-400 border border-yellow-800",
    low: "bg-blue-900/30 text-blue-400 border border-blue-800",
  };
  const getSeverityIcon = (s) =>
    s === "high" ? (
      <AlertTriangle className="w-5 h-5 text-red-400" />
    ) : s === "medium" ? (
      <AlertTriangle className="w-5 h-5 text-yellow-400" />
    ) : (
      <Shield className="w-5 h-5 text-blue-400" />
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
    if (!ranges.length) return <span className="text-gray-400">{line || " "}</span>;
    const parts = [];
    let cursor = 0;
    ranges.sort((a, b) => a.start - b.start);
    for (const r of ranges) {
      if (r.start > cursor) parts.push(<span key={cursor + "a"} className="text-gray-400">{line.slice(cursor, r.start)}</span>);
      parts.push(
        <span
          key={r.start + "b"}
          className="bg-red-500/20 text-red-300 rounded px-1"
          title="Potentially unsafe — user input passed to RegExp"
        >
          {line.slice(r.start, r.end)}
        </span>
      );
      cursor = r.end;
    }
    if (cursor < line.length) parts.push(<span key={cursor + "c"} className="text-gray-400">{line.slice(cursor)}</span>);
    if (!line) parts.push(<span key="sp" className="text-gray-400">&nbsp;</span>);
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
    // PDF functionality would need jsPDF library
    addToast("PDF download feature requires jsPDF library", "info");
  };

  // ---------- visualizer ----------
  const vizTokens = useMemo(() => tokenizeRegex(vizEscaped), [vizEscaped]);

  const getToastIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "error":
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default:
        return <Shield className="w-5 h-5 text-blue-400" />;
    }
  };
  const getToastBg = (type) =>
    type === "success"
      ? "bg-green-900/20 border-green-800"
      : type === "error"
      ? "bg-red-900/20 border-red-800"
      : type === "warning"
      ? "bg-yellow-900/20 border-yellow-800"
      : "bg-blue-900/20 border-blue-800";

  return (
    <div className="min-h-screen bg-black text-white">
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
              <p className="text-sm text-gray-300 flex-1">{t.message}</p>
              <button
                onClick={() => removeToast(t.id)}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Header */}
<div className="text-center mb-8">
  {/* Row with image + text */}
  <div className="flex items-center justify-left gap-4 mb-6">
    {/* Logo circle */}
    <div className="w-30 h-30 sm:w-24 sm:h-24 md:w-30 md:h-30 rounded-full overflow-hidden border-2 border-blue-400 flex-shrink-0">
  <img 
    src="/BlueTeam/regex.png"  // <-- apna image path daalna
    alt="Logo"
    className="w-full h-full object-cover"
  />
</div>

    {/* Text */}
    <div className="text-left">
      <h1 className="text-3xl font-bold text-white mb-2">
        Regex Injection Detector
      </h1>
      <p className="text-gray-400 text-base">
        Identify and prevent regex injection vulnerabilities<br />in your JavaScript code
      </p>
    </div>
  </div>

  {/* Buttons - jaha the wahi rakhe */}
  <div className="mt-4 flex items-center justify-left gap-3">
    <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
      Download PDF (ALL)
    </button>
    <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
      Download TXT (ALL)
    </button>
  </div>
</div>

        {/* Main Card - single rounded container like image */}
        <div className="bg-gray-900 rounded-3xl border border-blue-700 p-6 mb-6">
          {/* File Upload - exactly like image */}
          <div className="mb-6 text-left">
            <div className="flex items-center gap-4">
  <label className="inline-flex items-center gap-2 cursor-pointer bg-blue-700 text-white px-6 py-3 rounded-full hover:bg-gray-600 transition-colors text-sm font-medium">
    Choose File
    <input
      type="file"
      accept=".js,.jsx,.ts,.tsx,.txt"
      className="hidden"
      onChange={handleFileUpload}
    />
  </label>

  <p className="text-sm text-blue-400">
    Supported formats: JS, JSX, TS, TSX, TXT
  </p>
</div>

          </div>

          {/* Code to Analyze - exactly like image */}
          <div className="mb-6">
            <h3 className="text-white font-medium mb-3 text-left">Code to Analyze</h3>
            <textarea
              rows={8}
              className="w-full p-4 rounded-xl bg-gray-800 border border-blue-600 text-gray-300 font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
              placeholder="Paste your JavaScript code here..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>

          {/* Dangerous Parts - exactly like image */}
          <div className="mb-6">
            <h3 className="text-blue-400 font-medium mb-3 text-left">Dangerous Parts (preview)</h3>
            <div className="bg-black rounded-xl border border-blue-700 max-h-32 overflow-auto font-mono text-sm">
              {codeLines.map((ln, i) => (
                <div
                  key={i}
                  className="flex px-3 py-1"
                >
                  <div className="text-gray-500 w-8 text-right pr-3 select-none text-xs">
                    {i + 1}
                  </div>
                  <div className="flex-1 whitespace-pre text-xs">{renderHighlighted(ln)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Scan Button - exactly like image */}
          <div className="text-center mb-6">
            <button
              className={`px-8 py-3 rounded-full font-medium text-white transition-colors ${
                loading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              onClick={scanCode}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Scanning...
                </div>
              ) : (
                "Scan Code"
              )}
            </button>
          </div>

          {/* Tabs - exactly like image */}
          <div className="flex space-x-1 mb-6 bg-gray-800 rounded-lg p-1">
            <button
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "results"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
              onClick={() => setActiveTab("results")}
            >
              Issues ({results.length})
            </button>
            <button
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "fixes"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
              onClick={() => setActiveTab("fixes")}
            >
              Auto-fix Preview ({fixes.length})
            </button>
            <button
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "visualizer"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
              onClick={() => setActiveTab("visualizer")}
            >
              Visualizer
            </button>
            <button
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "tests"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
              onClick={() => setActiveTab("tests")}
            >
              Unit Tests
            </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-32">
            {/* Results Tab */}
            {activeTab === "results" && (
              <div>
                {results.length ? (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      Issues Found: {results.length}
                    </h2>
                    {results.map((issue, idx) => {
                      const severity = getSeverity(issue.risk);
                      return (
                        <div
                          key={idx}
                          className={`rounded-lg border p-4 ${severityColors[severity]}`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {getSeverityIcon(severity)}
                              <span
                                className={`inline-block px-2 py-1 rounded text-xs font-semibold ${severityBadges[severity]}`}
                              >
                                {severity.toUpperCase()} RISK
                              </span>
                            </div>
                            <span className="text-xs text-gray-400">
                              Line {issue.line}
                            </span>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <p className="font-semibold text-white mb-1 text-sm">
                                Pattern:
                              </p>
                              <code className="bg-black text-green-400 px-3 py-2 rounded text-xs block overflow-x-auto border border-blue-700">
                                {issue.pattern}
                              </code>
                            </div>

                            <div>
                              <p className="font-semibold text-white mb-1 text-sm">
                                Risk:
                              </p>
                              <p className="text-gray-300 text-sm">{issue.risk}</p>
                            </div>

                            {issue.risk.includes("Unescaped") && (
                              <div className="bg-green-900/20 border border-green-800 rounded p-3 mt-3">
                                <p className="font-semibold text-green-400 mb-2 text-sm">
                                  💡 Suggested Fix:
                                </p>
                                <p className="text-xs text-green-300 mb-2">
                                  Escape user input before passing to{" "}
                                  <code>RegExp</code>:
                                </p>
                                <code className="bg-black text-green-400 px-2 py-1 rounded text-xs block overflow-x-auto border border-blue-700">
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
                  <div className="text-center py-12 text-gray-400">
                    <Shield className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                    <p className="text-lg text-blue-400 mb-2">
                      {loading ? "Analyzing code..." : "No issues found or scan not performed yet"}
                    </p>
                    <p className="text-sm">
                      Upload your code and click "Scan Code" to begin analysis
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Auto-fix Preview Tab */}
            {activeTab === "fixes" && (
              <div>
                {fixes.length ? (
                  <div>
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
                      <Zap className="w-5 h-5 text-blue-400" />
                      Suggested Fixes
                    </h2>
                    <div className="bg-black border border-blue-700 rounded-lg p-4 overflow-hidden">
                      <pre className="text-green-400 text-sm overflow-x-auto whitespace-pre-wrap leading-relaxed">
                        {fixes.join("\n")}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Zap className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                    <p className="text-lg">
                      {loading ? "Generating fixes..." : "No auto-fixes available"}
                    </p>
                    <p className="text-sm">
                      Fixes will appear here after scanning code with issues
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Visualizer Tab */}
            {activeTab === "visualizer" && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="rounded-lg border border-blue-600 p-4 bg-gray-800">
                  <h3 className="font-semibold mb-2 text-white">Try a sample user input</h3>
                  <input
                    className="w-full border border-blue-600 bg-gray-700 text-gray-300 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:border-blue-500 text-sm"
                    value={vizInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setVizInput(val);
                      setVizEscaped(escapeForRegex(val));
                    }}
                    placeholder="Type user input to be escaped…"
                  />
                  <div className="text-sm text-gray-400 mb-1">Escaped for RegExp:</div>
                  <div className="font-mono text-sm bg-gray-700 border border-blue-600 rounded p-2 overflow-auto text-gray-300">
                    {vizEscaped}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    This is what your code should pass to <code>new RegExp()</code>.
                  </p>
                </div>

                <div className="rounded-lg border border-blue-600 p-4 bg-gray-800">
                  <h3 className="font-semibold mb-3 text-white">Regex Structure (escaped)</h3>
                  <div className="flex flex-wrap gap-2">
                    {vizTokens.map((t, i) => (
                      <span
                        key={i}
                        className={`px-2 py-1 rounded text-xs font-mono ${
                          t.kind === "meta"
                            ? "bg-purple-900/30 text-purple-400 border border-purple-800"
                            : t.kind === "escape"
                            ? "bg-amber-900/30 text-amber-400 border border-amber-800"
                            : t.kind === "alt"
                            ? "bg-sky-900/30 text-sky-400 border border-sky-800"
                            : "bg-gray-700 text-gray-300"
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
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">
                  Unit Test Generator (Jest)
                </h2>
                <div className="rounded-lg bg-black border border-blue-700 p-4">
                  <pre className="text-green-400 text-sm whitespace-pre-wrap overflow-x-auto leading-relaxed">{`function escapeForRegex(s){return s.replace(/[.*+?^${'{}'}()|[\\]\\\\]/g,'\\\\$&');}

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
                <p className="text-sm text-gray-400 mt-2">
                  Copy this into a <code>.test.js</code> file to validate escaping behavior.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-blue-500 text-sm">
          <p>🔒 Your code is analyzed securely and locally</p>
        </div>
      </div>
    </div>
  );
}