"use client";
import { useMemo, useState } from 'react';
import axios from 'axios';

// Build a sane API base: prefer env, else /api, trim trailing slashes
const API_BASE = (process.env.NEXT_PUBLIC_PROD_API_URL || 'http://localhost:4180/api').replace(/\/+$/, '');

export default function AnalyzerPage() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript'); // 'javascript'|'typescript'|'react'|'vue'|'php'
  const [issues, setIssues] = useState([]);
  const [riskScore, setRiskScore] = useState(0);
  const [riskBand, setRiskBand] = useState('Safe');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [debug, setDebug] = useState(false);
  const [rawResponse, setRawResponse] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  
  // Dashboard analytics
  const [analytics, setAnalytics] = useState({
    totalIssues: 0,
    byType: { XSS: 0, SQLi: 0, Eval: 0, DOMClobber: 0, PrototypePollution: 0 },
    bySeverity: { Low: 0, Medium: 0, High: 0, Critical: 0 }
  });

  // Filters
  const [q, setQ] = useState('');
  const [sevFilter, setSevFilter] = useState({ Low: true, Medium: true, High: true, Critical: true });
  const [typeFilter, setTypeFilter] = useState({ 
    XSS: true, 
    SQLi: true, 
    Eval: true,
    DOMClobber: true,
    PrototypePollution: true
  });

  const severityColors = {
    Low: 'bg-emerald-500 text-white',
    Medium: 'bg-amber-500 text-white',
    High: 'bg-orange-500 text-white',
    Critical: 'bg-red-500 text-white',
  };

  const filtered = useMemo(() => {
    return issues.filter((it) => {
      if (!sevFilter[it.severity]) return false;
      if (!typeFilter[it.type]) return false;
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

  const riskColor = useMemo(() => {
    if (riskScore >= 90) return 'bg-red-600';
    if (riskScore >= 70) return 'bg-orange-600';
    if (riskScore >= 40) return 'bg-amber-500';
    if (riskScore > 0) return 'bg-emerald-500';
    return 'bg-gray-600';
  }, [riskScore]);

  const loadSample = (kind) => {
    const samples = {
      jsxss: `function displayUserInput(){
  const userInput = document.getElementById('userInput').value;
  document.getElementById('out').innerHTML = userInput;
}`,
      react: `export default function Post({ html }){
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}`,
      vue: `<template><div v-html="rawHtml"></div></template>`,
      php: `<?php
$userId = $_GET['id'];
$query = "SELECT * FROM users WHERE id = " . $userId;
$result = mysqli_query($conn, $query);
?>`,
      evaldanger: `const code = prompt('code');
eval(code);`,
      domclobber: `const config = {};
window.config = config; // Vulnerable to DOM clobbering`,
      prototype: `const obj = {};
obj.__proto__.malicious = true; // Prototype pollution`,
      safe: `const el = document.getElementById('out');
el.textContent = someUserInput; // safe
// parameterized queries on server recommended`,
    };
    setCode(samples[kind] || '');
  };

  async function analyze() {
    setIsLoading(true);
    setError('');
    setRawResponse('');
    setIssues([]);
    
    try {
      const response = await axios.post(`${API_BASE}/analyze/analyzeCode`, {
        code,
        language
      });
      
      const data = response.data;
      setRawResponse(JSON.stringify(data, null, 2));
      setIssues(data.issues || []);
      
      // Calculate risk score
      const calculatedRisk = data.issues.length > 0 
        ? Math.min(data.issues.reduce((sum, issue) => {
            const severityWeight = {
              Low: 10,
              Medium: 20,
              High: 30,
              Critical: 40
            };
            return sum + (severityWeight[issue.severity] || 10);
          }, 0), 100)
        : 0;
      
      setRiskScore(calculatedRisk);
      setRiskBand(calculatedRisk >= 70 ? 'Critical' : calculatedRisk >= 40 ? 'High' : calculatedRisk > 0 ? 'Medium' : 'Safe');
      
      // Update analytics
      const newAnalytics = {
        totalIssues: data.issues.length,
        byType: { XSS: 0, SQLi: 0, Eval: 0, DOMClobber: 0, PrototypePollution: 0 },
        bySeverity: { Low: 0, Medium: 0, High: 0, Critical: 0 }
      };
      
      data.issues.forEach(issue => {
        if (newAnalytics.byType.hasOwnProperty(issue.type)) {
          newAnalytics.byType[issue.type]++;
        }
        if (newAnalytics.bySeverity.hasOwnProperty(issue.severity)) {
          newAnalytics.bySeverity[issue.severity]++;
        }
      });
      
      setAnalytics(newAnalytics);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Analyze failed');
      setIssues([]);
      setRiskScore(0);
      setRiskBand('Safe');
    } finally {
      setIsLoading(false);
    }
  }

  const applyFix = (fix, snippet) => {
    const fixedCode = code.replace(new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fix);
    setCode(fixedCode);
  };

  const exportCSV = () => {
    const headers = ['#', 'Line', 'Severity', 'Type', 'Issue', 'Snippet', 'Fix'];
    const rows = filtered.length
      ? filtered
      : [{ line: '', severity: '', type: '', message: 'No security issues found!', snippet: '', fix: '' }];
    const escapeCSV = (v) => {
      const s = String(v ?? '');
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv =
      [headers.join(','), ...rows.map((it, i) => [i + 1, it.line, it.severity, it.type, it.message, it.snippet, it.fix].map(escapeCSV).join(','))].join('\n') +
      '\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'security_report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    alert('PDF export functionality would create a detailed security report');
  };

  const exportTXT = () => {
    const text = filtered.length
      ? filtered
          .map(
            (it, i) =>
              `#${i + 1}\nLine: ${it.line}\nSeverity: ${it.severity}\nType: ${it.type}\nIssue: ${it.message}\nSnippet: ${it.snippet}\nFix: ${it.fix}\n`
          )
          .join('\n')
      : 'No security issues found!';
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'security_report.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const payload = { language, riskScore, riskBand, issues: filtered, analytics };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'security_report.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copySnippet = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard');
    } catch {
      alert('Copy failed');
    }
  };

  const submitFeedback = async () => {
    if (!feedback.trim()) return;
    
    try {
      await axios.post(`${API_BASE}/feedback`, {
        feedback,
        report: { issues, riskScore, language }
      });
      setFeedbackSubmitted(true);
      setFeedback('');
      setTimeout(() => setFeedbackSubmitted(false), 3000);
    } catch (e) {
      alert('Failed to submit feedback');
    }
  };

  // Tooltip descriptions
  const issueDescriptions = {
    XSS: "Cross-Site Scripting: Injecting malicious scripts into web pages viewed by other users.",
    SQLi: "SQL Injection: Inserting malicious SQL statements into an entry field for execution.",
    Eval: "Eval Injection: Using eval() with user input can lead to code injection attacks.",
    DOMClobber: "DOM Clobbering: Overwriting JavaScript variables via DOM properties like form IDs.",
    PrototypePollution: "Prototype Pollution: Modifying object prototypes to affect all objects."
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-gray-800 rounded-full border-4 border-red-500 flex items-center justify-center overflow-hidden">
            <img src="/RedTeam/heckmarx.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">JavaScript Security Analyzer</h1>
            <p className="text-gray-400 text-lg">
              Rule-based static checks with severity, fixes, risk score, filters, and exports.
            </p>
          </div>
        </div>

        {/* Dashboard Analytics */}
        <div className="bg-gray-900 border border-white-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Security Dashboard</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Risk Score Card */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-gray-400 text-sm font-medium mb-2">Risk Score</h3>
              <div className="flex items-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${riskColor}`}>
                  <span className="text-xl font-bold">{riskScore}</span>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold">{riskBand}</div>
                  <div className="text-sm text-gray-400">Overall Risk</div>
                </div>
              </div>
            </div>
            
            {/* Issues by Type */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-gray-400 text-sm font-medium mb-2">Issues by Type</h3>
              <div className="space-y-2">
                {Object.entries(analytics.byType).map(([type, count]) => (
                  <div key={type} className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <div className="flex-1 text-sm">{type}</div>
                    <div className="text-sm font-medium">{count}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Issues by Severity */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-gray-400 text-sm font-medium mb-2">Issues by Severity</h3>
              <div className="space-y-2">
                {Object.entries(analytics.bySeverity).map(([severity, count]) => (
                  <div key={severity} className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${severityColors[severity]}`}></div>
                    <div className="flex-1 text-sm">{severity}</div>
                    <div className="text-sm font-medium">{count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-gray-900 border border-white-700 rounded-lg p-6 mb-6">
          {/* Language and Sample Buttons */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-gray-800 text-white border border-white-600 rounded p-2"
              >
                <option value="javascript">JS/JSX</option>
                <option value="typescript">TypeScript</option>
                <option value="react">React</option>
                <option value="vue">Vue</option>
                <option value="php">PHP</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Quick Samples</label>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => loadSample('jsxss')} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm">JS XSS</button>
                <button onClick={() => loadSample('react')} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm">React</button>
                <button onClick={() => loadSample('vue')} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm">Vue</button>
                <button onClick={() => loadSample('php')} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm">PHP</button>
                <button onClick={() => loadSample('evaldanger')} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm">EVAL</button>
                <button onClick={() => loadSample('domclobber')} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm">DOM Clobber</button>
                <button onClick={() => loadSample('prototype')} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm">Prototype</button>
                <button onClick={() => loadSample('safe')} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm">SAFE</button>
              </div>
            </div>
          </div>
          
          {/* Code Editor */}
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-2">Code to Analyze</label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste/Examples/text......"
              className="w-full h-32 bg-gray-800 text-white border border-white-600 rounded p-3 font-mono text-sm resize-none"
            />
          </div>
          
          {/* Analyze Button and Debug */}
          <div className="flex items-center gap-4">
            <button
              onClick={analyze}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-medium disabled:opacity-50"
            >
              {isLoading ? 'Analyzing...' : 'Analyze'}
            </button>
            <label className="flex items-center text-gray-300">
              <input
                type="checkbox"
                checked={debug}
                onChange={() => setDebug(!debug)}
                className="mr-2 bg-gray-800 border-white-600"
              />
              Debug
            </label>
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {/* Search */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Search</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="line/type/severity/text"
              className="w-full bg-gray-800 text-white border border-white-600 rounded p-2 text-sm"
            />
          </div>
          
          {/* Security Filter */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Security</label>
            <div className="flex flex-wrap gap-3 text-sm">
              {['Low', 'Medium', 'High', 'Critical'].map((s) => (
                <label key={s} className="flex items-center text-gray-300">
                  <input
                    type="checkbox"
                    checked={sevFilter[s]}
                    onChange={() => setSevFilter((p) => ({ ...p, [s]: !p[s] }))}
                    className="mr-1"
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>
          
          {/* Type Filter */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Type</label>
            <div className="flex flex-wrap gap-3 text-sm">
              {Object.keys(typeFilter).map((t) => (
                <label key={t} className="flex items-center text-gray-300">
                  <input
                    type="checkbox"
                    checked={typeFilter[t]}
                    onChange={() => setTypeFilter((p) => ({ ...p, [t]: !p[t] }))}
                    className="mr-1"
                  />
                  {t}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-gray-900 border border-white-700 rounded-lg mb-6">
          {/* Table Header */}
          <div className="bg-red-600 text-white p-3 rounded-t-lg">
            <div className="grid grid-cols-9 gap-2 text-sm font-medium">
              <div>#</div>
              <div>Line</div>
              <div>Severity</div>
              <div>Type</div>
              <div>Issue</div>
              <div>Snippet</div>
              <div>Fix</div>
              <div>Auto-Fix</div>
              <div>Actions</div>
            </div>
          </div>
          
          {/* Table Body */}
          <div className="p-4">
            {filtered.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                No Security Issues Found......
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((it, idx) => (
                  <div key={idx} className="grid grid-cols-9 gap-2 text-sm py-2 border-b border-white-700 last:border-b-0">
                    <div className="text-gray-300">{idx + 1}</div>
                    <div className="text-gray-300">{it.line}</div>
                    <div>
                      <span className={`px-2 py-1 rounded text-xs ${severityColors[it.severity]}`}>
                        {it.severity}
                      </span>
                    </div>
                    <div className="relative group">
                      <span className="px-2 py-1 rounded bg-gray-700 text-gray-300 text-xs cursor-help">
                        {it.type}
                      </span>
                      <div className="absolute hidden group-hover:block z-10 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg left-0 top-full mt-1">
                        {issueDescriptions[it.type] || "No description available"}
                      </div>
                    </div>
                    <div className="text-gray-300">{it.message}</div>
                    <div className="text-gray-400 font-mono text-xs">{it.snippet}</div>
                    <div className="text-gray-400 text-xs">{it.fix}</div>
                    <div>
                      <button 
                        onClick={() => applyFix(it.fix, it.snippet)}
                        className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded mr-1"
                      >
                        Apply
                      </button>
                    </div>
                    <div>
                      <button 
                        onClick={() => copySnippet(it.snippet)} 
                        className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded mr-1"
                        title="Copy snippet"
                      >
                        Copy
                      </button>
                      <button 
                        onClick={() => copySnippet(it.fix)} 
                        className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded"
                        title="Copy fix"
                      >
                        Fix
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={exportTXT} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
            Export TXT
          </button>
          <button onClick={exportJSON} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
            Export JSON
          </button>
          <button onClick={exportCSV} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
            Export CSV
          </button>
          <button onClick={exportPDF} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
            Export PDF
          </button>
        </div>

        {/* User Feedback */}
        <div className="bg-gray-900 border border-white-700 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-white mb-3">Feedback</h3>
          <div className="flex gap-3">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your feedback about this security report..."
              className="flex-1 bg-gray-800 text-white border border-white-600 rounded p-3 text-sm resize-none"
              rows={3}
            />
            <div className="flex flex-col gap-2">
              <button
                onClick={submitFeedback}
                disabled={!feedback.trim() || feedbackSubmitted}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium disabled:opacity-50"
              >
                {feedbackSubmitted ? 'Submitted!' : 'Submit'}
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-400 p-4 rounded-lg mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Debug Panel */}
        {debug && (
          <div className="bg-gray-900 border border-white-700 rounded-lg p-4">
            <h4 className="text-gray-300 font-semibold mb-2">Debug</h4>
            <pre className="text-gray-400 text-xs overflow-x-auto bg-gray-800 p-3 rounded">
              {rawResponse || 'No debug information available'}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}