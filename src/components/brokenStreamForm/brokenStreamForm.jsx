'use client';
import { useMemo, useRef, useState } from 'react';

export default function BrokenStreamPage() {
  const [url, setUrl] = useState('https://example.com');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [summary, setSummary] = useState(null);
  const eventSourceRef = useRef(null);

  const apiBase = useMemo(
    () => ('').replace(/\/+$/, ''),
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

    // Simulate API call with mock data
    setTimeout(() => {
      const mockItems = [
        {
          url: 'https://example.com/broken-page',
          finalUrl: null,
          status: 404,
          statusText: 'Not Found',
          anchorText: 'Broken Link',
          scope: 'Internal',
          location: 'Navigation',
          redirectHops: 0,
          priorityScore: 8,
          sourcePath: '/index.html',
          suggestion: 'Update or remove this link'
        },
        {
          url: 'https://example.com/redirect',
          finalUrl: 'https://example.com/new-page',
          status: 301,
          statusText: 'Moved Permanently',
          anchorText: 'Redirected Link',
          scope: 'Internal',
          location: 'Content',
          redirectHops: 1,
          priorityScore: 5,
          sourcePath: '/about.html',
          suggestion: 'Update to final URL'
        },
        {
          url: 'https://external-site.com/page',
          finalUrl: null,
          status: 200,
          statusText: 'OK',
          anchorText: 'Working External Link',
          scope: 'External',
          location: 'Footer',
          redirectHops: 0,
          priorityScore: 3,
          sourcePath: '/contact.html',
          suggestion: null
        }
      ];

      const mockSummary = {
        total: 3,
        working: 1,
        broken: 1,
        redirects: 1,
        diff: { broken: 0, fixed: 1 }
      };

      setItems(mockItems);
      setSummary(mockSummary);
      setProgress({ done: 3, total: 3 });
      setLoading(false);
    }, 2000);
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
    if (sev === 'critical') return `${base} bg-red-600 text-white`;
    if (sev === 'redirect') return `${base} bg-yellow-600 text-white`;
    return `${base} bg-green-600 text-white`; // ok/healthy
  }

  // Helper for status tinting
  function statusTint(sev) {
    if (sev === 'critical') return 'border-white-600 bg-red-900/20 text-red-200';
    if (sev === 'redirect') return 'border-yellow-600 bg-yellow-900/20 text-yellow-200';
    return 'border-green-600 bg-green-900/20 text-green-200'; // healthy
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
      computedSeverity(i),
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
      const severity = computedSeverity(i);
      lines.push(
        `${(severity || '').toUpperCase()} | ${i.status} ${i.statusText} | ${i.scope}`
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

  function downloadPDF() {
    // Mock PDF download
    const element = document.createElement('a');
    const file = new Blob(['Broken Links Report'], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'broken-links.pdf';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
  <img
    src="/RedTeam/brokenlink.png"  // apni image ka path yahaan daaliye
    alt="Broken Link Checker Logo"
    className="w-20 h-20 rounded-full border-2 border-red-600 object-cover"
  />
  <div>
    <h1 className="text-2xl font-bold text-white">
      Broken Link Checker (Streaming)
    </h1>
    <p className="text-gray-300 text-sm">
      Scans web pages for dead or broken links, helping<br />
      maintain SEO integrity
    </p>
  </div>
</div>


        {/* Features Box */}
        <div className="mb-6">
          <div className="px-4 py-2 border-2 border-white-600 text-white bg-transparent rounded text-sm inline-block">
            Redirect tracking / Anchor & location / Priority & fixes / Exports
          </div>
        </div>

        {/* Input Section */}
        <div className="mb-6 space-y-4">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full p-4 bg-black border-2 border-white-600 rounded-full text-white placeholder-gray-400 text-center"
            placeholder="https://example.com"
            disabled={loading}
          />
          
          <div className="flex justify-center">
           <button
  onClick={startCheck}
  className="px-6 py-2 border-2 border-white-600 text-white bg-red-600 rounded hover:bg-red-700 transition-colors disabled:opacity-60"
  disabled={loading || !url}
>
  {loading ? 'Checking…' : 'Check Links'}
</button>

          </div>
        </div>

        {/* Progress Bar */}
        {progress.total > 0 && (
          <div className="mb-6">
            <div className="text-sm text-gray-300 mb-2">
              Progress: {progress.done} / {progress.total} links
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2 border border-white-600">
              <div
                className="bg-red-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (progress.done / progress.total) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Summary */}
        {summary && (
          <div className="mb-6 p-4 border-2 border-white-600 rounded bg-black">
            <div className="font-semibold text-white mb-2">Scan Summary</div>
            <div className="text-sm text-gray-300">
              Total: <span className="text-white font-bold">{summary.total}</span> · 
              Working: <span className="text-green-400 font-bold">{summary.working}</span> · 
              Broken: <span className="text-red-400 font-bold">{summary.broken}</span> · 
              Redirects: <span className="text-yellow-400 font-bold">{summary.redirects}</span>
            </div>
            {summary.diff && (
              <div className="text-sm text-gray-300 mt-1">
                Change vs last: Broken{' '}
                <span className="text-white font-bold">
                  {summary.diff.broken >= 0 ? '+' : ''}
                  {summary.diff.broken}
                </span>{' '}
                · Fixed <span className="text-white font-bold">{summary.diff.fixed}</span>
              </div>
            )}
          </div>
        )}

        {/* Export Buttons */}
        {items.length > 0 && (
          <div className="mb-6 flex gap-3">
            <button
              onClick={downloadCSV}
              className="px-4 py-2 border-2 border-white-600 text-white bg-transparent rounded hover:bg-red-600 transition-colors"
            >
              Export CSV
            </button>
            <button
              onClick={downloadTXT}
              className="px-4 py-2 border-2 border-white-600 text-white bg-transparent rounded hover:bg-red-600 transition-colors"
            >
              Export TXT
            </button>
            <button
              onClick={downloadPDF}
              className="px-4 py-2 border-2 border-white-600 text-white bg-transparent rounded hover:bg-red-600 transition-colors"
            >
              Export PDF
            </button>
          </div>
        )}

        {/* Results */}
        <div className="grid md:grid-cols-1 gap-4">
          {items.map((i, idx) => {
            const sev = computedSeverity(i);
            return (
              <div
                key={`${i.url}-${idx}`}
                className={`p-4 border-2 rounded ${statusTint(sev)}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className={severityBadge(sev)}>
                    {sev.toUpperCase()}
                  </span>
                  <span className="text-sm font-medium text-white">
                    [{i.status} {i.statusText}]
                  </span>
                  <span className="ml-auto text-xs px-2 py-1 rounded border border-white-600 text-white">
                    {i.scope}
                  </span>
                  <span className="text-xs px-2 py-1 rounded border border-white-600 text-white">
                    {i.location}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="text-gray-300">
                    <span className="font-bold text-white">Anchor:</span> {i.anchorText || '-'}
                  </div>
                  
                  <div>
                    <a
                      href={i.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline break-all"
                    >
                      {i.url}
                    </a>
                  </div>
                  
                  {i.finalUrl && i.finalUrl !== i.url && (
                    <div className="text-gray-300">
                      <span className="font-bold text-white">Final:</span>{' '}
                      <a
                        className="text-blue-400 hover:text-blue-300 underline break-all"
                        href={i.finalUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {i.finalUrl}
                      </a>{' '}
                      ({i.redirectHops} hops)
                    </div>
                  )}
                  
                  <div className="text-gray-300">
                    <span className="font-bold text-white">Found on:</span> {i.sourcePath || '-'} | 
                    <span className="font-bold text-white"> Priority:</span> {i.priorityScore}
                  </div>
                  
                  {i.suggestion && (
                    <div className="text-gray-300">
                      <span className="font-bold text-white">Suggestion:</span> {i.suggestion}{' '}
                      <button
                        onClick={() => copyToClipboard(i.finalUrl || i.url)}
                        className="ml-2 text-xs text-blue-400 hover:text-blue-300 underline"
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
    </div>
  );
}