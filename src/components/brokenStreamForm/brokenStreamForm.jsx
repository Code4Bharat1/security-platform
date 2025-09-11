'use client';
import { useMemo, useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function BrokenStreamPage() {
  const [url, setUrl] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [summary, setSummary] = useState(null);
  const eventSourceRef = useRef(null);

  const apiBase = useMemo(
    () => (process.env.NEXT_PUBLIC_PROD_API_URL || '').replace(/\/+$/, ''),
    []
  );

  // Helper to handle URL copying
  async function copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for non-HTTPS contexts
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
    } catch (e) {
      alert('Copy failed. You can copy manually.');
    }
  }

  function startCheck() {
    if (!url) return;

    setLoading(true);
    setItems([]);
    setSummary(null);
    setProgress({ done: 0, total: 0 });

    if (eventSourceRef.current) eventSourceRef.current.close();

    const es = new EventSource(
      `${apiBase}/brokenlink/brokenlink-stream?url=${encodeURIComponent(url)}`
    );
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      const data = JSON.parse(event.data || '{}');

      if (data.type === 'total') {
        setProgress((prev) => ({ ...prev, total: data.total || 0 }));
      } else if (data.type === 'link') {
        setItems((prev) => {
          const k = `${data.url}::${data.sourcePath}`;
          if (prev.some((r) => `${r.url}::${r.sourcePath}` === k)) return prev;
          return [...prev, data];
        });
        setProgress((prev) => ({ ...prev, done: prev.done + 1 }));
      } else if (data.type === 'summary') {
        setSummary(data.payload);
      } else if (data.type === 'done') {
        setLoading(false);
        es.close();
      } else if (data.type === 'error') {
        alert(data.message || 'Error occurred');
        setLoading(false);
        es.close();
      }
    };

    es.onerror = () => {
      alert('Connection error.');
      setLoading(false);
      es.close();
    };
  }

  // Function to compute severity (Critical, Warning, OK, Redirect)
  function computedSeverity(item) {
    if (item.finalUrl && item.finalUrl !== item.url) return 'redirect';
    if (Number(item.status) >= 400) return 'critical';
    return 'ok'; // healthy links
  }

  // Helper for status badge styling
  function severityBadge(sev) {
    const base = 'px-2 py-0.5 rounded text-xs font-semibold';
    if (sev === 'critical') return `${base} bg-red-100 text-red-700 border border-red-300`;
    if (sev === 'redirect') return `${base} bg-yellow-100 text-yellow-700 border border-yellow-300`;
    return `${base} bg-green-100 text-green-700 border border-green-300`; // ok/healthy
  }

  // Helper for status tinting
  function statusTint(sev) {
    if (sev === 'critical') return 'border-red-700 bg-red-950/40 text-red-200';
    if (sev === 'redirect')
      return 'border-yellow-700 bg-yellow-950/40 text-yellow-200';
    return 'border-green-700 bg-green-950/40 text-green-200'; // healthy
  }

  // ---------- Export Functions ----------

  function csvEscape(v) {
    const s = `${v ?? ''}`;
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }

  function downloadBlob(content, name, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadCSV() {
    const headers = [
      'Anchor',
      'URL',
      'Final URL',
      'Status',
      'Status Text',
      'Severity',
      'Internal/External',
      'Location',
      'Redirect Hops',
      'Priority',
      'Found On (path)',
      'Suggestion',
    ];
    const rows = items.map((i) => [
      i.anchorText,
      i.url,
      i.finalUrl || '',
      i.status,
      i.statusText,
      i.severity,
      i.scope,
      i.location,
      i.redirectHops,
      i.priorityScore,
      i.sourcePath || '',
      i.suggestion || '',
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map(csvEscape).join(','))
      .join('\n');
    downloadBlob(csv, 'broken-links.csv', 'text/csv;charset=utf-8');
  }

  function downloadTXT() {
    const lines = [];
    items.forEach((i) => {
      lines.push(
        `${(i.severity || '').toUpperCase()} | ${i.status} ${i.statusText} | ${i.scope}`
      );
      lines.push(`Anchor: ${i.anchorText || '-'}`);
      lines.push(`URL: ${i.url}`);
      if (i.finalUrl && i.finalUrl !== i.url)
        lines.push(`Final: ${i.finalUrl} (hops: ${i.redirectHops})`);
      lines.push(`Location: ${i.location} | Found on: ${i.sourcePath || '-'}`);
      if (i.suggestion) lines.push(`Suggestion: ${i.suggestion}`);
      lines.push('---');
    });
    downloadBlob(lines.join('\n'), 'broken-links.txt', 'text/plain;charset=utf-8');
  }

  async function toDataURL(path) {
    const res = await fetch(path);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  async function downloadPDF() {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });

    try {
      const dataUrl = await toDataURL('/brokenlink1.png');
      doc.addImage(dataUrl, 'PNG', 40, 28, 40, 50);
    } catch {}

    doc.setFontSize(16);
    doc.text('Broken Link Scan Report', 90, 50);
    doc.setFontSize(10);
    doc.text(`Scanned URL: ${url}`, 90, 66);
    if (summary) {
      doc.text(
        `Summary: Total ${summary.total} | Working ${summary.working} | Broken ${summary.broken} | Redirects ${summary.redirects}`,
        90,
        82
      );
      if (summary.diff) {
        doc.text(
          `Change vs last scan: broken ${summary.diff.broken >= 0 ? '+' : ''}${
            summary.diff.broken
          } | fixed ${summary.diff.fixed}`,
          90,
          98
        );
      }
    }

    const body = items.map((i) => [
      i.severity,
      `${i.status} ${i.statusText}`,
      i.anchorText || '-',
      i.url,
      i.finalUrl && i.finalUrl !== i.url ? `${i.finalUrl} (${i.redirectHops})` : '-',
      i.scope,
      i.location,
      i.priorityScore,
      i.suggestion || '-',
    ]);

    autoTable(doc, {
      startY: 120,
      head: [
        [
          'Severity',
          'Status',
          'Anchor',
          'URL',
          'Final URL (hops)',
          'Scope',
          'Location',
          'Priority',
          'Suggestion',
        ],
      ],
      body,
      styles: { fontSize: 8, cellWidth: 'wrap' },
      columnStyles: {
        3: { cellWidth: 180 },
        4: { cellWidth: 180 },
        8: { cellWidth: 160 },
      },
    });

    doc.save('broken-links.pdf');
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-slate-100 px-4">
      <div className="max-w-4xl mx-auto pt-16 ">
        <div className="flex items-center gap-4 mb-4">
          <img 
  src="/RedTeam/brokenlink.png" 
  alt="verify" 
  className="w-30 h-30 mt-2 border-4 border-red-600 rounded-full" 
/>

          <div>
            <h1 className="text-3xl font-bold">Broken Link Checker (Streaming)</h1>
            <p className="text-sm text-slate-400">
              Redirect tracking • Anchor & location • Priority & fixes • Exports
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 border border-white px-20 py-20">
          <input
            className="w-full bg-neutral-900 border border-red-600 text-slate-100 placeholder-slate-500 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
          <button
            onClick={startCheck}
            className="shrink-0 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-60"
            disabled={loading || !url}
          >
            {loading ? 'Checking…' : 'Check Links'}
          </button>
        </div>

        {progress.total > 0 && (
          <div className="mt-4">
            <div className="text-sm text-slate-300 mb-1">
              Progress: {progress.done} / {progress.total} links
            </div>
            <div className="w-full bg-neutral-800 rounded h-2">
              <div
                className="bg-blue-600 h-2 rounded"
                style={{
                  width: `${Math.min(100, (progress.done / progress.total) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        {summary && (
          <div className="mt-4 p-3 border rounded bg-neutral-900/60 border-neutral-700">
            <div className="font-semibold">Scan Summary</div>
            <div className="text-sm">
              Total: <b>{summary.total}</b> · Working:{' '}
              <b className="text-green-400">{summary.working}</b> · Broken:{' '}
              <b className="text-red-400">{summary.broken}</b> · Redirects:{' '}
              <b className="text-yellow-400">{summary.redirects}</b>
            </div>
            {summary.diff && (
              <div className="text-sm mt-1">
                Change vs last: Broken{' '}
                <b>
                  {summary.diff.broken >= 0 ? '+' : ''}
                  {summary.diff.broken}
                </b>{' '}
                · Fixed <b>{summary.diff.fixed}</b>
              </div>
            )}
          </div>
        )}

        {items.length > 0 && (
          <div className="mt-4 flex gap-2">
            <button
              onClick={downloadCSV}
              className="px-3 py-2 rounded border border-neutral-700 hover:bg-neutral-900"
            >
              Export CSV
            </button>
            <button
              onClick={downloadTXT}
              className="px-3 py-2 rounded border border-neutral-700 hover:bg-neutral-900"
            >
              Export TXT
            </button>
            <button
              onClick={downloadPDF}
              className="px-3 py-2 rounded border border-neutral-700 hover:bg-neutral-900"
            >
              Export PDF
            </button>
          </div>
        )}

        <div className="mt-6 grid md:grid-cols-2 gap-3">
          {items.map((i, idx) => {
            const sev = computedSeverity(i);
            return (
              <div
                key={`${i.url}-${idx}`}
                className={`p-3 border rounded ${statusTint(sev)}`}
              >
                <div className="flex items-center gap-2">
                  <span className={severityBadge(sev)}>{sev}</span>
                  <span className="text-sm font-medium">
                    [{i.status} {i.statusText}]
                  </span>
                  <span className="ml-auto text-xs px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700">
                    {i.scope}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700">
                    {i.location}
                  </span>
                </div>
                <div className="mt-2 text-sm">
                  <div className="text-slate-300">
                    <b>Anchor:</b> {i.anchorText || '-'}
                  </div>
                  <a
                    href={i.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline break-words text-blue-300 hover:text-blue-200"
                  >
                    {i.url}
                  </a>
                  {i.finalUrl && i.finalUrl !== i.url && (
                    <div className="mt-1">
                      <b>Final:</b>{' '}
                      <a
                        className="underline break-words"
                        href={i.finalUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {i.finalUrl}
                      </a>{' '}
                      ({i.redirectHops} hops)
                    </div>
                  )}
                  <div className="text-slate-300 mt-1">
                    <b>Found on:</b> {i.sourcePath || '-'} | <b>Priority:</b> {i.priorityScore}
                  </div>
                  {i.suggestion && (
                    <div className="mt-1">
                      <b>Suggestion:</b> {i.suggestion}{' '}
                      <button
                        onClick={() => copyToClipboard(i.finalUrl || i.url)}
                        className="ml-2 text-xs underline"
                      >
                        Copy URL
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}