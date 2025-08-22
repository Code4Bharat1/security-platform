'use client';
import { useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const PRESET_PAYLOADS = [
  `<script>alert(1)</script>`,
  `<img src=x onerror=alert(1)>`,
  `<svg/onload=alert(1)>`,
  `"><script>alert(1)</script>`,
  `javascript:alert(1)`,
  `";alert(1);//`,
  `%3Cscript%3Ealert(1)%3C/script%3E`,
  `<ScRiPt>alert(1)</sCriPt>`,
  `<a href=# onmouseover=alert(1)>hover</a>`,
];

export default function XssTester() {
  const [url, setUrl] = useState('');
  const [param, setParam] = useState('');
  const [customPayload, setCustomPayload] = useState(`<script>alert('XSS')</script>`);
  const [usePresetList, setUsePresetList] = useState(true);
  const [payloads, setPayloads] = useState(PRESET_PAYLOADS.join('\n'));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { runs, waf, rateLimit, summary, ... }

  const apiBase = (process.env.NEXT_PUBLIC_PROD_API_URL || '').replace(/\/+$/, '');

  const parsedPayloads = useMemo(() => {
    if (!usePresetList) return [customPayload];
    return payloads
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
  }, [usePresetList, customPayload, payloads]);

  const handleTest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${apiBase}/xssTester/xssTester-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          param,
          payloads: parsedPayloads,
          domScan: true,          // headless DOM checks
          takeScreenshots: true,  // capture PoC if triggered
          autoBypass: true,       // try common bypass variants automatically
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  const makePdf = () => {
    if (!result) return;
    const doc = new jsPDF();

    // Title
    doc.setFontSize(16);
    doc.text('XSS Scan Report', 14, 16);
    doc.setFontSize(10);
    doc.text(`Target: ${url}`, 14, 24);
    doc.text(`Parameter: ${param}`, 14, 29);
    if (result.summary) {
      doc.text(
        `Total tests: ${result.summary.total} | Executed: ${result.summary.executed} | High: ${result.summary.high} | Medium: ${result.summary.medium} | Low: ${result.summary.low}`,
        14,
        34
      );
    }
    if (result.waf)
      doc.text(`WAF: ${result.waf.detected ? `Yes (${result.waf.vendor || 'unknown'})` : 'No'}`, 14, 39);
    if (result.rateLimit)
      doc.text(`Rate Limiting: ${result.rateLimit.detected ? `Yes (${result.rateLimit.reason})` : 'No'}`, 14, 44);

    // Table of runs
    const rows = (result.runs || []).map((r, idx) => [
      idx + 1,
      r.payload,
      r.context || '—',
      r.reflected ? 'Yes' : 'No',
      r.domExecuted ? 'Yes' : 'No',
      r.risk || '—',
      r.status || '—',
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['#', 'Payload', 'Context', 'Reflected', 'DOM Exec', 'Risk', 'HTTP']],
      body: rows,
      styles: { fontSize: 7, cellWidth: 'wrap' },
      columnStyles: { 1: { cellWidth: 80 } },
      didDrawPage: () => {} // keeps types happy in some bundlers
    });

    // Evidence: add up to 3 screenshots
    let y = (doc.lastAutoTable && doc.lastAutoTable.finalY) || 50;
    const shots = (result.runs || []).flatMap((r) => r.screenshots || []);
    const limited = shots.slice(0, 3);
    for (let i = 0; i < limited.length; i++) {
      const img = limited[i];
      if (!img?.base64) continue;
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      doc.text(`PoC Screenshot ${i + 1}`, 14, y);
      y += 4;
      try {
        doc.addImage(`data:image/png;base64,${img.base64}`, 'PNG', 14, y, 180, 0);
        y += 90;
      } catch {
        doc.text('(screenshot could not be embedded)', 14, y);
        y += 10;
      }
    }

    doc.save('xss-report.pdf');
  };

  const downloadJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const urlObj = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = urlObj;
    a.download = 'xss-report.json';
    a.click();
    URL.revokeObjectURL(urlObj);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">🧪 Advanced XSS Scanner</h1>

      <form onSubmit={handleTest} className="space-y-4">
        <input
          type="url"
          placeholder="Target URL (e.g., https://site.com/search)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="text"
          placeholder="Parameter name (e.g., q)"
          value={param}
          onChange={(e) => setParam(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={usePresetList}
              onChange={(e) => setUsePresetList(e.target.checked)}
            />
            Use multi‑payload list
          </label>
        </div>

        {usePresetList ? (
          <textarea
            className="w-full p-2 border rounded font-mono text-sm"
            rows={8}
            value={payloads}
            onChange={(e) => setPayloads(e.target.value)}
            placeholder="One payload per line"
          />
        ) : (
          <textarea
            className="w-full p-2 border rounded font-mono text-sm"
            rows={4}
            value={customPayload}
            onChange={(e) => setCustomPayload(e.target.value)}
            placeholder="Single payload"
          />
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 text-white rounded ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? 'Scanning…' : 'Run Scan'}
          </button>

          {result && !result.error && (
            <>
              <button
                type="button"
                onClick={makePdf}
                className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
              >
                Download PDF Report
              </button>
              <button
                type="button"
                onClick={downloadJson}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
              >
                Download JSON
              </button>
            </>
          )}
        </div>
      </form>

      {result && (
        <div className="bg-gray-50 border rounded p-4">
          <h2 className="font-semibold mb-2">Summary</h2>
          {!result.error ? (
            <>
              <div className="text-sm">
                <div>WAF: {result.waf?.detected ? `Yes (${result.waf?.vendor || 'unknown'})` : 'No'}</div>
                <div>Rate Limiting: {result.rateLimit?.detected ? `Yes (${result.rateLimit?.reason})` : 'No'}</div>
                <div>
                  Totals — Tests: {result.summary?.total} | Exec: {result.summary?.executed} | High: {result.summary?.high} | Med: {result.summary?.medium} | Low: {result.summary?.low}
                </div>
              </div>

              <div className="overflow-auto mt-4">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 pr-3">#</th>
                      <th className="py-2 pr-3">Payload</th>
                      <th className="py-2 pr-3">Context</th>
                      <th className="py-2 pr-3">Reflected</th>
                      <th className="py-2 pr-3">DOM Exec</th>
                      <th className="py-2 pr-3">Risk</th>
                      <th className="py-2 pr-3">HTTP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(result.runs || []).map((r, i) => (
                      <tr key={i} className="border-b align-top">
                        <td className="py-2 pr-3">{i + 1}</td>
                        <td className="py-2 pr-3 font-mono break-all">{r.payload}</td>
                        <td className="py-2 pr-3">{r.context || '—'}</td>
                        <td className="py-2 pr-3">{r.reflected ? 'Yes' : 'No'}</td>
                        <td className="py-2 pr-3">{r.domExecuted ? 'Yes' : 'No'}</td>
                        <td className="py-2 pr-3">{r.risk || '—'}</td>
                        <td className="py-2 pr-3">{r.status || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Reflection highlight (first hit) */}
              {(result.runs || []).some((r) => r.reflection?.highlighted) && (
                <div className="mt-4">
                  <h3 className="font-semibold">Reflected Payload Highlight</h3>
                  {(result.runs || [])
                    .filter((r) => r.reflection?.highlighted)
                    .slice(0, 1)
                    .map((r, idx) => (
                      <pre
                        key={idx}
                        className="bg-white border rounded p-3 overflow-auto text-xs whitespace-pre-wrap"
                      >
                        {r.reflection?.highlighted}
                      </pre>
                    ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-red-600">{String(result.error)}</div>
          )}
        </div>
      )}
    </div>
  );
}
