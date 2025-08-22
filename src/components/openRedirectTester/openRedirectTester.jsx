'use client';

import { useMemo, useRef, useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, FileDown, ScanLine, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const DEFAULT_PARAMS = ['redirect','url','next','dest','destination','continue','return','to','goto','r','u'];

const SEV_BADGE = {
  Critical: 'bg-red-600 text-white',
  High: 'bg-red-500 text-white',
  Medium: 'bg-yellow-500 text-black',
  Low: 'bg-blue-500 text-white',
  Informational: 'bg-gray-500 text-white',
  Safe: 'bg-emerald-600 text-white',
};

export default function OpenRedirectTester() {
  const [inputUrl, setInputUrl] = useState('');
  const [manualParam, setManualParam] = useState('redirect');
  const [autoScan, setAutoScan] = useState(true);
  const [customParams, setCustomParams] = useState(DEFAULT_PARAMS.join(','));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null); // full structured result
  const reportRef = useRef(null);

  const paramsToTest = useMemo(() => {
    if (!autoScan) return [manualParam.trim()].filter(Boolean);
    const items = (customParams || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    return Array.from(new Set(items));
  }, [autoScan, manualParam, customParams]);

  async function handleTest(e) {
    e?.preventDefault?.();
    setError('');
    setReport(null);
    if (!inputUrl) {
      setError('Please enter a URL.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/openRedirectTester/openRedirect-tester-advanced`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: inputUrl.trim(),
            mode: autoScan ? 'auto' : 'manual',
            paramName: manualParam.trim() || 'redirect',
            params: paramsToTest,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to test URL');
      setReport(data);
    } catch (err) {
      setError(err.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  }

  function badgeClass(sev) {
    return `inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${SEV_BADGE[sev] || 'bg-gray-500 text-white'}`;
  }

  function exportPDF() {
    if (!report) return;
    const doc = new jsPDF();
    const pad = 12;

    doc.setFontSize(16);
    doc.text('Open Redirect Test Report', pad, 16);

    doc.setFontSize(10);
    doc.text(`Original URL: ${report.originalUrl}`, pad, 24);
    doc.text(`Original Domain: ${report.originalDomain}`, pad, 30);
    doc.text(`Overall Verdict: ${report.summary?.vulnerable ? 'VULNERABLE' : 'NOT VULNERABLE'}`, pad, 36);
    doc.text(`Severity: ${report.summary?.severity}`, pad, 42);
    if (report.summary?.whitelistBypass) {
      doc.text(`Whitelist Bypass Detected: YES`, pad, 48);
    }

    // Per test table
    autoTable(doc, {
      startY: 56,
      head: [['Param', 'Payload', 'Final URL', 'Final Domain', 'Changed eTLD+1', 'Status Codes', 'Vuln?']],
      body: (report.tests || []).map(t => [
        t.param,
        t.payloadName,
        t.finalUrl,
        t.finalDomain,
        t.changedETLD ? 'Yes' : 'No',
        (t.chain || []).map(h => h.status).join(' → '),
        t.vulnerable ? 'Yes' : 'No',
      ]),
      styles: { fontSize: 8, cellWidth: 'wrap' },
      columnStyles: { 2: { cellWidth: 80 } },
      headStyles: { fillColor: [33, 37, 41] },
    });

    // Reasons
    if (report.summary?.reasons?.length) {
      const y = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 8 : 56;
      doc.setFontSize(11);
      doc.text('Reasons:', pad, y);
      doc.setFontSize(10);
      let yy = y + 6;
      report.summary.reasons.forEach((r, i) => {
        doc.text(`• ${r}`, pad, yy);
        yy += 5;
      });
    }

    const fname = `open-redirect-report-${Date.now()}.pdf`;
    doc.save(fname);
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-1">Open Redirect Tester</h1>
      <p className="text-sm text-gray-500 mb-4">Auto-scan params, multi-payloads, redirect chain & PDF export.</p>

      <form onSubmit={handleTest} className="space-y-4" ref={reportRef}>
        <div>
          <label className="block mb-1 font-semibold" htmlFor="url">URL to Test</label>
          <input
            id="url"
            type="url"
            placeholder="https://victim.com/login?redirect=https://example.com"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoScan}
              onChange={() => setAutoScan(v => !v)}
              className="h-4 w-4"
            />
            <span className="font-medium">Auto-scan common parameters</span>
          </label>
        </div>

        {!autoScan ? (
          <div>
            <label className="block mb-1 font-semibold" htmlFor="paramName">Redirect Parameter Name</label>
            <input
              id="paramName"
              type="text"
              placeholder="redirect"
              value={manualParam}
              onChange={(e) => setManualParam(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            <small className="text-gray-500">Common: redirect, url, next, dest, return, continue</small>
          </div>
        ) : (
          <div>
            <label className="block mb-1 font-semibold" htmlFor="params">Parameter Names to Scan</label>
            <input
              id="params"
              type="text"
              value={customParams}
              onChange={(e) => setCustomParams(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            <small className="text-gray-500">Comma-separated. Defaults provided.</small>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (<><Loader2 className="h-4 w-4 animate-spin" /> Testing…</>) : (<><ScanLine className="h-4 w-4" /> Test</>)}
          </button>

          {report && (
            <button
              type="button"
              onClick={exportPDF}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
            >
              <FileDown className="h-4 w-4" /> Export PDF
            </button>
          )}
        </div>
      </form>

      {error && <p className="mt-4 text-red-600">{error}</p>}

      {report && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm text-gray-600">Original URL</div>
              <div className="font-mono text-sm break-all">{report.originalUrl}</div>
              <div className="text-sm text-gray-600 mt-1">Original Domain: <span className="font-semibold">{report.originalDomain}</span></div>
            </div>
            <div className="text-right">
              <span className={badgeClass(report.summary?.severity || (report.summary?.vulnerable ? 'High' : 'Safe'))}>
                {report.summary?.severity || (report.summary?.vulnerable ? 'High' : 'Safe')}
              </span>
              <div className={`mt-2 text-sm font-semibold ${report.summary?.vulnerable ? 'text-red-600' : 'text-green-700'}`}>
                {report.summary?.vulnerable ? '⚠️ Vulnerable to Open Redirect' : '✅ Not Vulnerable'}
              </div>
              {report.summary?.whitelistBypass && (
                <div className="mt-1 text-xs font-medium text-red-700">Whitelist bypass detected</div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {(report.tests || []).map((t, i) => (
              <details key={i} className="rounded border bg-white">
                <summary className="cursor-pointer p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {t.vulnerable ? <AlertTriangle className="h-4 w-4 text-red-600" /> : <CheckCircle className="h-4 w-4 text-emerald-600" />}
                    <span className="font-semibold">{t.param}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-sm text-gray-600">{t.payloadName}</span>
                  </div>
                  <div className="text-sm">
                    {t.vulnerable ? <span className="text-red-600">Vulnerable</span> : <span className="text-emerald-600">Not Vulnerable</span>}
                  </div>
                </summary>
                <div className="px-3 pb-3 text-sm">
                  <div className="mb-2"><span className="text-gray-600">Tested URL:</span> <span className="font-mono break-all">{t.testedUrl}</span></div>
                  <div className="mb-2"><span className="text-gray-600">Final URL:</span> <span className="font-mono break-all">{t.finalUrl}</span></div>
                  <div className="mb-2">
                    <span className="text-gray-600">Final Domain:</span> <span className="font-medium">{t.finalDomain}</span>
                    <span className="mx-2">•</span>
                    <span className="text-gray-600">Changed eTLD+1:</span> <span className="font-medium">{t.changedETLD ? 'Yes' : 'No'}</span>
                    {t.whitelistBypass && <span className="ml-2 text-red-700 font-semibold">(Whitelist bypass)</span>}
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1">Redirect Chain (status → location):</div>
                    <ol className="list-decimal ml-5 space-y-1">
                      {(t.chain || []).map((hop, idx) => (
                        <li key={idx} className="font-mono break-all">
                          <span className="font-semibold">{hop.status}</span>{' '}
                          {hop.location ? `→ ${hop.location}` : ''}
                          <div className="text-xs text-gray-500">resolved: {hop.url}</div>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </details>
            ))}
          </div>

          {report.summary?.reasons?.length ? (
            <div className="mt-4">
              <div className="font-semibold mb-1">Verdict Notes</div>
              <ul className="list-disc ml-5 text-sm">
                {report.summary.reasons.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
