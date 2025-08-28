'use client';

import { useMemo, useState } from 'react';
import {
  Search as SearchIcon,
  Shield,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  FileText,
  FileJson,
  Download,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const badge = (tone) =>
  ({
    good: 'bg-green-50 border-green-300 text-green-700',
    warn: 'bg-yellow-50 border-yellow-300 text-yellow-700',
    bad: 'bg-red-50 border-red-300 text-red-700',
    info: 'bg-blue-50 border-blue-300 text-blue-700',
  }[tone] || 'bg-gray-50 border-gray-300 text-gray-700');

const chip = (tone) =>
  ({
    good: 'text-green-700 bg-green-100',
    warn: 'text-yellow-700 bg-yellow-100',
    bad: 'text-red-700 bg-red-100',
    info: 'text-blue-700 bg-blue-100',
  }[tone] || 'text-gray-700 bg-gray-100');

export default function MetaForm() {
  const [url, setUrl] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const apiBase = useMemo(
    () => (process.env.NEXT_PUBLIC_PROD_API_URL || '').replace(/\/+$/, ''),
    []
  );

  async function analyze(e) {
    e?.preventDefault?.();
    if (!url) return;
    setLoading(true);
    setReport(null);
    try {
      const normalized = url.startsWith('http') ? url : `https://${url}`;
      const res = await fetch(`${apiBase}/meta/meta-analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalized }),
      });
      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.error(err);
      setReport({ error: 'Failed to analyze' });
    } finally {
      setLoading(false);
    }
  }

  // ---------- Exports ----------
  function dlBlob(blob, name) {
    const u = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = u;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(u);
  }
  function downloadJSON() {
    if (!report) return;
    dlBlob(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }), `meta-report.json`);
  }
  function downloadTXT() {
    if (!report) return;
    const lines = [];
    lines.push(`Target: ${report.targetUrl}`);
    lines.push(`Fetched: ${report.fetchedUrl || '-'}`);
    lines.push(`Timestamp: ${report.timestamp}`);
    lines.push('');
    lines.push(`SEO Score: ${report.scores?.seo}/10`);
    lines.push(`Security Score: ${report.scores?.security}/10`);
    lines.push(`Total Score: ${report.scores?.total}/10`);
    lines.push('');
    lines.push('Security Checks:');
    (report.security?.checks || []).forEach((c) =>
      lines.push(
        ` - ${c.key}: ${c.exists ? 'FOUND' : 'MISSING'}${c.value ? ` → ${c.value}` : ''} (${c.severity}) ${c.note ? `| ${c.note}` : ''}`
      )
    );
    lines.push('');
    lines.push('SEO Checks:');
    (report.seo?.checks || []).forEach((c) =>
      lines.push(` - ${c.key}: ${c.status}${c.detail ? ` | ${c.detail}` : ''}`)
    );
    lines.push('');
    lines.push('CORS:');
    if (report.cors?.error) {
      lines.push(` - Error: ${report.cors.error}`);
    } else {
      lines.push(` - Allow-Origin: ${report.cors?.headers?.allow_origin || 'Not Present'}`);
      lines.push(` - Allow-Credentials: ${report.cors?.headers?.allow_credentials || 'Not Present'}`);
      lines.push(` - Allow-Methods: ${report.cors?.headers?.allow_methods || 'Not Present'}`);
      lines.push(` - Allow-Headers: ${report.cors?.headers?.allow_headers || 'Not Present'}`);
      lines.push(` - Expose-Headers: ${report.cors?.headers?.expose_headers || 'Not Present'}`);
      lines.push(` - Verdict: ${report.cors?.verdict || '-'}`);
      (report.cors?.recommendations || []).forEach((r) => lines.push(`   * ${r}`));
    }
    dlBlob(new Blob([lines.join('\n')], { type: 'text/plain' }), `meta-report.txt`);
  }
  function downloadHTML() {
    if (!report) return;
    const html = `
<!doctype html><html><head><meta charset="utf-8"><title>Meta Report</title>
<style>
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Arial,sans-serif;padding:24px;}
h1{margin:0 0 6px} .muted{color:#666} .badge{display:inline-block;padding:2px 8px;border-radius:999px;border:1px solid #ddd;font-size:12px}
table{border-collapse:collapse;width:100%;font-size:13px} td,th{border:1px solid #ddd;padding:6px 8px;text-align:left}
.section{margin:18px 0}
</style></head><body>
<h1>Meta Tag & CORS Report</h1>
<div class="muted">Target: ${escapeHtml(report.targetUrl)} | Fetched: ${escapeHtml(
      report.fetchedUrl || ''
    )} | ${escapeHtml(report.timestamp || '')}</div>

<div class="section">
  <h3>Scores</h3>
  <div class="badge">SEO: ${report.scores?.seo}/10</div>
  <div class="badge">Security: ${report.scores?.security}/10</div>
  <div class="badge">Total: ${report.scores?.total}/10</div>
</div>

<div class="section">
  <h3>Security Checks</h3>
  <table><thead><tr><th>Header/Meta</th><th>Status/Value</th><th>Severity</th><th>Note</th></tr></thead><tbody>
  ${(report.security?.checks || [])
    .map(
      (c) =>
        `<tr><td>${escapeHtml(c.key)}</td><td>${escapeHtml(
          c.exists ? (c.value || 'Present') : 'Missing'
        )}</td><td>${escapeHtml(c.severity)}</td><td>${escapeHtml(c.note || '')}</td></tr>`
    )
    .join('')}
  </tbody></table>
</div>

<div class="section">
  <h3>SEO Checks</h3>
  <table><thead><tr><th>Item</th><th>Status</th><th>Detail</th></tr></thead><tbody>
  ${(report.seo?.checks || [])
    .map((c) => `<tr><td>${escapeHtml(c.key)}</td><td>${escapeHtml(c.status)}</td><td>${escapeHtml(c.detail || '')}</td></tr>`)
    .join('')}
  </tbody></table>
</div>

<div class="section">
  <h3>CORS</h3>
  ${
    report.cors?.error
      ? `<div class="badge">Error: ${escapeHtml(report.cors.error)}</div>`
      : `<table><thead><tr><th>Header</th><th>Value</th></tr></thead><tbody>
    <tr><td>Access-Control-Allow-Origin</td><td>${escapeHtml(report.cors?.headers?.allow_origin || 'Not Present')}</td></tr>
    <tr><td>Access-Control-Allow-Credentials</td><td>${escapeHtml(report.cors?.headers?.allow_credentials || 'Not Present')}</td></tr>
    <tr><td>Access-Control-Allow-Methods</td><td>${escapeHtml(report.cors?.headers?.allow_methods || 'Not Present')}</td></tr>
    <tr><td>Access-Control-Allow-Headers</td><td>${escapeHtml(report.cors?.headers?.allow_headers || 'Not Present')}</td></tr>
    <tr><td>Access-Control-Expose-Headers</td><td>${escapeHtml(report.cors?.headers?.expose_headers || 'Not Present')}</td></tr>
  </tbody></table>
  <p><b>Verdict:</b> ${escapeHtml(report.cors?.verdict || '-')}</p>
  <ul>${(report.cors?.recommendations || []).map((r) => `<li>${escapeHtml(r)}</li>`).join('')}</ul>`
  }
</div>
</body></html>`;
    dlBlob(new Blob([html], { type: 'text/html' }), `meta-report.html`);
  }
  async function downloadPDF() {
    if (!report) return;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    doc.setFontSize(16);
    doc.text('Meta Tag & CORS Report', 40, 40);
    doc.setFontSize(10);
    doc.text(`Target: ${report.targetUrl}`, 40, 58);
    if (report.fetchedUrl) doc.text(`Fetched: ${report.fetchedUrl}`, 40, 72);
    if (report.timestamp) doc.text(`Timestamp: ${report.timestamp}`, 40, 86);

    // Scores
    doc.text(`SEO: ${report.scores?.seo}/10`, 40, 106);
    doc.text(`Security: ${report.scores?.security}/10`, 120, 106);
    doc.text(`Total: ${report.scores?.total}/10`, 220, 106);

    // Security table
    autoTable(doc, {
      startY: 120,
      head: [['Header/Meta', 'Status/Value', 'Severity', 'Note']],
      body: (report.security?.checks || []).map((c) => [
        c.key,
        c.exists ? c.value || 'Present' : 'Missing',
        c.severity || '',
        c.note || '',
      ]),
      styles: { fontSize: 8, cellWidth: 'wrap' },
      columnStyles: { 1: { cellWidth: 180 }, 3: { cellWidth: 160 } },
    });

    // SEO table
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 16,
      head: [['Item', 'Status', 'Detail']],
      body: (report.seo?.checks || []).map((c) => [c.key, c.status, c.detail || '']),
      styles: { fontSize: 8, cellWidth: 'wrap' },
      columnStyles: { 2: { cellWidth: 260 } },
    });

    // CORS section
    const corsStart = doc.lastAutoTable.finalY + 16;
    doc.setFontSize(12);
    doc.text('CORS', 40, corsStart);
    doc.setFontSize(9);
    if (report.cors?.error) {
      doc.text(`Error: ${report.cors.error}`, 40, corsStart + 16);
    } else {
      autoTable(doc, {
        startY: corsStart + 10,
        head: [['Header', 'Value']],
        body: [
          ['Allow-Origin', report.cors?.headers?.allow_origin || 'Not Present'],
          ['Allow-Credentials', report.cors?.headers?.allow_credentials || 'Not Present'],
          ['Allow-Methods', report.cors?.headers?.allow_methods || 'Not Present'],
          ['Allow-Headers', report.cors?.headers?.allow_headers || 'Not Present'],
          ['Expose-Headers', report.cors?.headers?.expose_headers || 'Not Present'],
          ['Verdict', report.cors?.verdict || '-'],
        ],
        styles: { fontSize: 8, cellWidth: 'wrap' },
        columnStyles: { 1: { cellWidth: 360 } },
      });
      const recs = (report.cors?.recommendations || []).join('; ');
      if (recs) doc.text(`Recommendations: ${recs}`, 40, doc.lastAutoTable.finalY + 14);
    }
    doc.save('meta-report.pdf');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-5">
            <div className="bg-white p-4 rounded-full shadow-lg">
              <img src="/meta_tag.png" alt="verify" className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Protect Your Website</h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Analyze security/SEO meta tags & headers, detect duplicates, preview Open Graph, and audit CORS.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Card header */}
          <div className="bg-gradient-to-r from-green-800 to-emerald-700 p-8 text-white text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Shield className="h-8 w-8" />
              <h2 className="text-3xl font-bold">Meta Tag & CORS Analyzer</h2>
            </div>
            <p className="text-green-100">Security meta, SEO best-practices, OG preview, and CORS verdict</p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={analyze} className="mb-6">
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Enter website URL (e.g., https://example.com)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value.trim())}
                  className="w-full border-2 border-gray-200 rounded-xl p-4 text-lg focus:outline-none focus:ring-4 focus:ring-green-200 focus:border-green-600 pr-12"
                />
                <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
              </div>
              <button
                type="submit"
                disabled={loading || !url}
                className="w-full bg-gradient-to-r from-green-800 to-emerald-700 text-white py-3 rounded-xl hover:from-green-700 hover:to-emerald-600 disabled:opacity-60 flex items-center justify-center gap-3 text-lg font-semibold"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <SearchIcon className="h-6 w-6" />
                    Start Security Analysis
                  </>
                )}
              </button>
            </form>

            {/* Report */}
            {loading && (
              <div className="text-center py-10">
                <div className="animate-pulse">
                  <div className="bg-green-100 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                    <Shield className="h-12 w-12 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-700 mb-2">Scanning…</h3>
                  <p className="text-gray-500">Fetching meta tags, headers & CORS policy</p>
                </div>
              </div>
            )}

            {!loading && report && (
              <div className="space-y-8">
                {/* Top summary + export */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm text-gray-500">
                      Target: <span className="font-mono">{report.targetUrl}</span>
                    </div>
                    {report.fetchedUrl && (
                      <div className="text-sm text-gray-500">
                        Final URL: <span className="font-mono">{report.fetchedUrl}</span>
                      </div>
                    )}
                    <div className="text-sm text-gray-500">{report.timestamp}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={downloadPDF} className="px-3 py-2 rounded border flex items-center gap-2">
                      <FileText className="h-4 w-4" /> PDF
                    </button>
                    <button onClick={downloadHTML} className="px-3 py-2 rounded border flex items-center gap-2">
                      <Download className="h-4 w-4" /> HTML
                    </button>
                    <button onClick={downloadJSON} className="px-3 py-2 rounded border flex items-center gap-2">
                      <FileJson className="h-4 w-4" /> JSON
                    </button>
                    <button onClick={downloadTXT} className="px-3 py-2 rounded border flex items-center gap-2">
                      <FileText className="h-4 w-4" /> TXT
                    </button>
                  </div>
                </div>

                {/* Scores */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <ScoreCard label="SEO Score" value={`${report.scores?.seo}/10`} tone="info" />
                  <ScoreCard label="Security Score" value={`${report.scores?.security}/10`} tone="info" />
                  <ScoreCard label="Total Score" value={`${report.scores?.total}/10`} tone="info" />
                </div>

                {/* Security meta/header checks */}
                <Section title="Security Meta Tag Checks">
                  <div className="grid gap-3">
                    {(report.security?.checks || []).map((c, i) => (
                      <div key={i} className={`p-3 border rounded ${badge(toneFromSeverity(c))}`}>
                        <div className="flex items-center gap-2">
                          {c.exists ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : c.severity === 'HIGH' ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <AlertTriangle className="h-4 w-4" />
                          )}
                          <div className="font-medium">{c.key}</div>
                          <div className={`ml-auto text-xs px-2 py-0.5 rounded ${chip(toneFromSeverity(c))}`}>
                            {c.severity}
                          </div>
                        </div>
                        <div className="text-sm mt-1">
                          <b>Status:</b> {c.exists ? 'Exists' : 'Missing'} {c.value ? `→ ${c.value}` : ''}
                          {c.note ? <span className="ml-2 text-gray-700">{c.note}</span> : null}
                        </div>
                        {c.suggestion ? (
                          <div className="text-sm mt-1">
                            <b>Suggestion:</b> {c.suggestion}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </Section>

                {/* SEO evaluation */}
                <Section title="SEO Meta Tag Evaluation">
                  <div className="grid gap-3">
                    {(report.seo?.checks || []).map((c, i) => (
                      <div
                        key={i}
                        className={`p-3 border rounded ${
                          c.status?.toLowerCase().includes('missing') || c.status?.toLowerCase().includes('deprecated')
                            ? badge('bad')
                            : c.status?.toLowerCase().includes('warning')
                            ? badge('warn')
                            : badge('good')
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {c.status?.toLowerCase().includes('missing') ? (
                            <XCircle className="h-4 w-4" />
                          ) : c.status?.toLowerCase().includes('deprecated') ||
                            c.status?.toLowerCase().includes('warning') ? (
                            <AlertTriangle className="h-4 w-4" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                          <div className="font-medium">{c.key}</div>
                        </div>
                        <div className="text-sm mt-1">
                          <b>Status:</b> {c.status} {c.detail ? ` — ${c.detail}` : ''}
                        </div>
                        {c.suggestion ? (
                          <div className="text-sm mt-1">
                            <b>Suggestion:</b> {c.suggestion}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </Section>

                {/* Duplicates & conflicts */}
                <Section title="Duplicate / Conflicting Tags">
                  <div className="grid gap-2">
                    {(report.duplicates || []).map((d, i) => (
                      <div key={i} className={`p-3 border rounded ${badge('warn')}`}>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          <div className="font-medium">{d.issue}</div>
                        </div>
                        {d.detail ? <div className="text-sm mt-1">{d.detail}</div> : null}
                      </div>
                    ))}
                    {(!report.duplicates || report.duplicates.length === 0) && (
                      <div className={`p-3 border rounded ${badge('good')}`}>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          <div className="font-medium">No duplicate/conflicting tags detected</div>
                        </div>
                      </div>
                    )}
                  </div>
                </Section>

                {/* Social preview */}
                <Section title="Social Media Preview (Open Graph)">
                  <div className="border rounded p-3 bg-white">
                    <div className="border rounded p-4 bg-gray-50">
                      <div className="font-semibold text-lg">{report.og?.title || '—'}</div>
                      <div className="text-sm text-gray-700 mt-1 line-clamp-3">
                        {report.og?.description || '—'}
                      </div>
                      <div className="mt-3">
                        {report.og?.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={report.og.image}
                            alt="og image"
                            className="max-h-48 rounded border object-contain"
                          />
                        ) : (
                          <div className="text-xs text-gray-500">No og:image</div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Using og:title / og:description / og:image
                    </div>
                  </div>
                </Section>

                {/* CORS */}
                <Section title="CORS Header Analysis">
                  {report.cors?.error ? (
                    <div className={`p-3 border rounded ${badge('warn')}`}>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        <div>Could not analyze CORS: {report.cors.error}</div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-auto">
                        <table className="min-w-full text-sm bg-white border">
                          <tbody>
                            {[
                              ['Access-Control-Allow-Origin', report.cors?.headers?.allow_origin || 'Not Present'],
                              ['Access-Control-Allow-Credentials', report.cors?.headers?.allow_credentials || 'Not Present'],
                              ['Access-Control-Allow-Methods', report.cors?.headers?.allow_methods || 'Not Present'],
                              ['Access-Control-Allow-Headers', report.cors?.headers?.allow_headers || 'Not Present'],
                              ['Access-Control-Expose-Headers', report.cors?.headers?.expose_headers || 'Not Present'],
                            ].map(([k, v]) => (
                              <tr key={k}>
                                <td className="border px-3 py-2 font-medium bg-gray-50">{k}</td>
                                <td className="border px-3 py-2">{v}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div
                        className={`mt-3 p-3 border rounded ${
                          report.cors?.verdict?.toLowerCase().includes('vulnerable') ||
                          report.cors?.verdict?.toLowerCase().includes('weak')
                            ? badge('bad')
                            : badge('good')
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {report.cors?.verdict?.toLowerCase().includes('vulnerable') ||
                          report.cors?.verdict?.toLowerCase().includes('weak') ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                          <div className="font-semibold">Verdict: {report.cors?.verdict || '—'}</div>
                        </div>
                        {report.cors?.recommendations?.length ? (
                          <ul className="list-disc ml-6 text-sm mt-1">
                            {report.cors.recommendations.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    </>
                  )}
                </Section>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- helpers & tiny components ---------- */

function ScoreCard({ label, value }) {
  return (
    <div className="p-4 rounded border bg-blue-50 border-blue-200 text-blue-800">
      <div className="text-sm opacity-80">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Eye className="h-5 w-5 text-emerald-700" />
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function toneFromSeverity(c) {
  if (!c?.exists) return 'bad';
  if (c.severity === 'HIGH') return 'bad';
  if (c.severity === 'MEDIUM') return 'warn';
  return 'good';
}

function escapeHtml(s = '') {
  return String(s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}
