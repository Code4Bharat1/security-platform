'use client';
import { useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  // Filters
  const [q, setQ] = useState('');
  const [sevFilter, setSevFilter] = useState({ Low: true, Medium: true, High: true, Critical: true });
  const [typeFilter, setTypeFilter] = useState({ XSS: true, SQLi: true, Eval: true });

  const severityColors = {
    Low: 'bg-emerald-100 text-emerald-800',
    Medium: 'bg-amber-100 text-amber-800',
    High: 'bg-orange-100 text-orange-800',
    Critical: 'bg-rose-100 text-rose-800',
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
    if (riskScore >= 90) return 'bg-rose-600';
    if (riskScore >= 70) return 'bg-orange-600';
    if (riskScore >= 40) return 'bg-amber-500';
    if (riskScore > 0) return 'bg-emerald-500';
    return 'bg-gray-300';
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
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_API_URL}/analysis/analyze-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      });
      const text = await res.text();
      setRawResponse(text);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = JSON.parse(text);
      setIssues(Array.isArray(data.issues) ? data.issues : []);
      setRiskScore(Number(data.riskScore) || 0);
      setRiskBand(String(data.riskBand || 'Safe'));
    } catch (e) {
      setError(e.message || 'Analyze failed');
      setIssues([]);
      setRiskScore(0);
      setRiskBand('Safe');
    } finally {
      setIsLoading(false);
    }
  }

  // ---- Exports ----
  const exportCSV = () => {
    const headers = ['#', 'Line', 'Severity', 'Type', 'Issue', 'Snippet'];
    const rows = filtered.length
      ? filtered
      : [{ line: '', severity: '', type: '', message: 'No security issues found!', snippet: '' }];

    const escapeCSV = (v) => {
      const s = String(v ?? '');
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };

    const csv =
      [headers.join(','), ...rows.map((it, i) => [i + 1, it.line, it.severity, it.type, it.message, it.snippet].map(escapeCSV).join(','))].join('\n') +
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
    const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
    doc.setFontSize(14);
    doc.text('Security Analyzer Report', 40, 40);
    doc.setFontSize(10);
    doc.text(`Language: ${language}`, 40, 58);
    doc.text(`Risk: ${riskScore}/100 (${riskBand})`, 40, 74);

    if (!filtered.length) {
      doc.text('No security issues found.', 40, 100);
      doc.save('security_report.pdf');
      return;
    }

    const head = [['#', 'Line', 'Severity', 'Type', 'Issue', 'Snippet']];
    const body = filtered.map((it, i) => [
      String(i + 1),
      String(it.line),
      it.severity,
      it.type,
      it.message,
      it.snippet,
    ]);

    autoTable(doc, {
      startY: 90,
      head,
      body,
      styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
      headStyles: { fillColor: [240, 240, 240] },
      margin: { left: 40, right: 40 },
      columnStyles: {
        0: { cellWidth: 24 },
        1: { cellWidth: 36 },
        2: { cellWidth: 64 },
        3: { cellWidth: 48 },
        4: { cellWidth: 180 },
        5: { cellWidth: 208 },
      },
    });

    doc.save('security_report.pdf');
  };

  const exportTXT = () => {
    const text = filtered.length
      ? filtered
          .map(
            (it, i) =>
              `#${i + 1}\nLine: ${it.line}\nSeverity: ${it.severity}\nType: ${it.type}\nIssue: ${it.message}\nSnippet: ${it.snippet}\n`
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
    const payload = { language, riskScore, riskBand, issues: filtered };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'security_report.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copySnippet = async (snippet) => {
    try {
      await navigator.clipboard.writeText(snippet);
      alert('Snippet copied');
    } catch {
      alert('Copy failed');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">JavaScript Security Analyzer</h1>
      <p className="text-sm text-gray-600 mb-6">
        Rule-based static checks with severity, fixes, risk score, filters, and exports.
      </p>

      {/* Config */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="mt-1 w-full border rounded p-2"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="react">React (JSX)</option>
            <option value="vue">Vue</option>
            <option value="php">PHP (SQL heuristics)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Quick Samples</label>
          <div className="mt-1 flex flex-wrap gap-2">
            <button onClick={() => loadSample('jsxss')} className="px-2 py-1 text-sm bg-yellow-500 text-white rounded">JS XSS</button>
            <button onClick={() => loadSample('react')} className="px-2 py-1 text-sm bg-yellow-500 text-white rounded">React</button>
            <button onClick={() => loadSample('vue')} className="px-2 py-1 text-sm bg-yellow-500 text-white rounded">Vue</button>
            <button onClick={() => loadSample('php')} className="px-2 py-1 text-sm bg-yellow-500 text-white rounded">PHP</button>
            <button onClick={() => loadSample('evaldanger')} className="px-2 py-1 text-sm bg-yellow-500 text-white rounded">Eval</button>
            <button onClick={() => loadSample('safe')} className="px-2 py-1 text-sm bg-blue-500 text-white rounded">Safe</button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <label className="block text-sm font-medium mb-1">Code to Analyze</label>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Paste code here..."
        className="w-full h-48 border rounded p-3 font-mono text-sm"
      />

      <div className="mt-3 flex items-center gap-3">
        <button onClick={analyze} disabled={isLoading} className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400">
          {isLoading ? 'Analyzing…' : 'Analyze'}
        </button>
        <label className="text-sm">
          <input type="checkbox" checked={debug} onChange={() => setDebug(!debug)} className="mr-2" />
          Debug
        </label>
      </div>

      {/* Risk */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">Overall Risk</span>
          <span className="text-sm">{riskScore}/100 ({riskBand})</span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded">
          <div className={`h-3 rounded ${riskColor}`} style={{ width: `${riskScore}%` }} />
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium">Search</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="line/type/severity/text"
            className="mt-1 w-full border rounded p-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Severity</label>
          <div className="mt-1 flex gap-3 text-sm flex-wrap">
            {['Low', 'Medium', 'High', 'Critical'].map((s) => (
              <label key={s}>
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
        <div>
          <label className="block text-sm font-medium">Type</label>
          <div className="mt-1 flex gap-3 text-sm flex-wrap">
            {['XSS', 'SQLi', 'Eval'].map((t) => (
              <label key={t}>
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

      {/* Table */}
      <div className="mt-4 overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Line</th>
              <th className="px-3 py-2 text-left">Severity</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">Issue</th>
              <th className="px-3 py-2 text-left">Snippet</th>
              <th className="px-3 py-2 text-left">Fix</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((it, idx) => (
              <tr key={idx} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2">{idx + 1}</td>
                <td className="px-3 py-2">{it.line}</td>
                <td className="px-3 py-2">
                  <span title={`Severity: ${it.severity}`} className={`px-2 py-0.5 rounded text-xs ${severityColors[it.severity]}`}>
                    {it.severity}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span title={`Type: ${it.type}`} className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 text-xs">
                    {it.type}
                  </span>
                </td>
                <td className="px-3 py-2">{it.message}</td>
                <td className="px-3 py-2 font-mono text-xs whitespace-pre-wrap">{it.snippet}</td>
                <td className="px-3 py-2 text-xs whitespace-pre-wrap">{it.fix}</td>
                <td className="px-3 py-2">
                  <button onClick={() => copySnippet(it.snippet)} className="px-2 py-1 text-xs bg-blue-600 text-white rounded">
                    Copy
                  </button>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-gray-600">
                  No security issues found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Exports */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={exportTXT} className="bg-blue-600 text-white px-3 py-2 rounded">Export TXT</button>
        <button onClick={exportJSON} className="bg-green-600 text-white px-3 py-2 rounded">Export JSON</button>
        <button onClick={exportCSV} className="bg-indigo-600 text-white px-3 py-2 rounded">Export CSV</button>
        <button onClick={exportPDF} className="bg-rose-600 text-white px-3 py-2 rounded">Export PDF</button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {debug && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h4 className="font-semibold mb-2">Debug</h4>
          <pre className="text-xs overflow-x-auto">{rawResponse || '—'}</pre>
        </div>
      )}
    </div>
  );
}
