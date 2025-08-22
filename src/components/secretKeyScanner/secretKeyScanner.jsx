'use client';
import { useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function SecretKeyScanner() {
  const [code, setCode] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validateOnline, setValidateOnline] = useState(false); // ⬅️ NEW

  const apiBase = (process.env.NEXT_PUBLIC_PROD_API_URL || '').replace(/\/+$/, '');

  const scanSecrets = async () => {
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch(`${apiBase}/secretKeyScanner/secret-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, validateOnline }), // ⬅️ pass flag
      });
      const data = await res.json();
      setResults(data.secrets || []);
    } catch (e) {
      setResults([{ type: 'Error', severity: 'Low', line: 0, secret: String(e), suggestion: 'Check network/endpoint.' }]);
    } finally {
      setLoading(false);
    }
  };

  const makePdf = () => {
    if (!results?.length) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Secret Key Exposure Report', 14, 16);
    doc.setFontSize(10);
    doc.text(`Validated Online: ${validateOnline ? 'Yes' : 'No'}`, 14, 24);
    doc.text(`Findings: ${results.length}`, 14, 29);

    const rows = results.map((r, i) => [
      i + 1,
      r.type || '—',
      r.severity || '—',
      `L${r.line || '—'}`,
      r.redacted || '—',
      r.validation?.status || 'unknown',
      r.validation?.evidence?.status || '—',
    ]);

    autoTable(doc, {
      startY: 38,
      head: [['#', 'Type', 'Severity', 'Line', 'Secret (redacted)', 'Validation', 'HTTP']],
      body: rows,
      styles: { fontSize: 8, cellWidth: 'wrap' },
      columnStyles: { 4: { cellWidth: 70 } },
    });

    // Suggestions page
    let y = (doc.lastAutoTable && doc.lastAutoTable.finalY) || 38;
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFontSize(12);
    doc.text('Suggestions', 14, y + 10);
    doc.setFontSize(9);
    let cur = y + 16;
    results.slice(0, 10).forEach((r, idx) => {
      const line = `${idx + 1}. [${r.type}] ${r.suggestion || '—'}`;
      if (cur > 270) { doc.addPage(); cur = 20; }
      doc.text(line, 14, cur);
      cur += 6;
    });

    doc.save('secret-scan-report.pdf');
  };

  const downloadTxt = () => {
    if (!results?.length) return;
    const lines = [
      `Secret Key Exposure Report`,
      `Validated Online: ${validateOnline ? 'Yes' : 'No'}`,
      `Findings: ${results.length}`,
      ``,
      ...results.map((r, i) =>
        [
          `#${i + 1}`,
          `Type: ${r.type}`,
          `Severity: ${r.severity}`,
          `Line: ${r.line}`,
          `Secret (redacted): ${r.redacted}`,
          `Validation: ${r.validation?.status || 'unknown'}`,
          `Evidence: ${r.validation?.evidence?.status || ''} ${r.validation?.evidence?.note || ''}`,
          `Suggestion: ${r.suggestion}`,
          ``,
        ].join('\n')
      ),
    ].join('\n');
    const blob = new Blob([lines], { type: 'text/plain' });
    const urlObj = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = urlObj;
    a.download = 'secret-scan-report.txt';
    a.click();
    URL.revokeObjectURL(urlObj);
  };

  const badge = (sev) =>
    sev === 'Critical' ? 'bg-red-200 border-red-600'
      : sev === 'High' ? 'bg-red-100 border-red-500'
      : sev === 'Medium' ? 'bg-yellow-100 border-yellow-500'
      : 'bg-gray-100 border-gray-400';

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Secret Key Exposure Scanner</h1>

      <div className="flex items-center gap-3">
        <input
          type="file"
          accept=".js,.env,.txt,.json"
          id="fileInput"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => setCode(String(e.target?.result || ''));
            reader.readAsText(file);
          }}
        />
        <label htmlFor="fileInput" className="inline-block bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700">
          Choose File
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={validateOnline}
            onChange={(e) => setValidateOnline(e.target.checked)}
          />
          Validate keys online (sends keys to provider APIs) — use only on your own keys
        </label>
      </div>

      <textarea
        rows={10}
        className="w-full p-3 rounded border font-mono border-gray-300"
        placeholder="Paste your code or upload a file..."
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <div className="flex gap-3">
        <button
          className={`px-4 py-2 rounded text-white ${loading ? 'bg-black/60' : 'bg-black hover:bg-gray-800'}`}
          onClick={scanSecrets}
          disabled={loading}
        >
          {loading ? 'Scanning...' : '🔍 Scan for Secrets'}
        </button>

        {!!results.length && (
          <>
            <button className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700" onClick={makePdf}>
              Download PDF
            </button>
            <button className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-800" onClick={downloadTxt}>
              Download TXT
            </button>
          </>
        )}
      </div>

      {!!results.length && (
        <div className="mt-6 space-y-4">
          <h2 className="text-xl font-semibold">🛡️ Secrets Detected: {results.length}</h2>
          {results.map((r, idx) => (
            <div key={idx} className={`border-l-4 p-4 rounded shadow ${badge(r.severity)}`}>
              <p><strong>Type:</strong> {r.type}</p>
              <p><strong>Line {r.line}:</strong> <code className="bg-white px-1 py-0.5 rounded break-all">{r.redacted || r.secret}</code></p>
              <p><strong>Severity:</strong> <span className="font-medium">{r.severity}</span></p>
              <p className="text-sm text-gray-700 mt-1"><strong>Suggestion:</strong> {r.suggestion}</p>
              <div className="mt-1 text-sm">
                <strong>Validation:</strong>{' '}
                <span className="font-medium">
                  {r.validation?.status || 'unknown'}
                </span>
                {r.validation?.evidence?.status && (
                  <span className="text-gray-600"> (HTTP {r.validation.evidence.status}{r.validation.evidence.note ? `, ${r.validation.evidence.note}` : ''})</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !results.length && code && (
        <p className="text-gray-500 mt-4">No exposed secrets found.</p>
      )}
    </div>
  );
}
