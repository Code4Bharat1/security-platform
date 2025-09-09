'use client';
import { useState } from 'react';
import { Loader2, Search as SearchIcon, FileText, Eye, X } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import GreenLayout from '../GreenTeam/layout';

const classNames = (...xs) => xs.filter(Boolean).join(' ');

export default function SitemapForm() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [sitemapData, setSitemapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [depth, setDepth] = useState(3);

  // Hero data
  const Hero=
  {
      title: "Optimize Your Website",
      desc: "Our sitemap generator helps search engines find and index all pages on your website.",
      imgPath: "/GreenTeam/sitemap1.png"
  }
  // XML preview modal
  const [showXml, setShowXml] = useState(false);

  const validateUrl = (u) => {
    const pattern = new RegExp(
      '^(https?:\\/\\/)?(([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}(:\\d+)?(\\/.*)?$',
      'i'
    );
    return !!pattern.test(u);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateUrl(url)) {
      setError('Please enter a valid website URL.');
      return;
    }

    setError('');
    setLoading(true);
    setSitemapData(null);

    try {
      const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/sitemap/sitemap-scanner`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: normalizedUrl, depth }),
        }
      );

      const result = await response.json();

      if (result.error) {
        setError(result.message || 'Failed to generate sitemap.');
        setLoading(false);
        return;
      }

      setSitemapData(result);
    } catch (err) {
      console.error('Error:', err);
      setError('Something went wrong with the request.');
    } finally {
      setLoading(false);
    }
  };

  // ----------- Downloads -----------
  const downloadXML = () => {
    if (!sitemapData?.xml) return;
    const blob = new Blob([sitemapData.xml], { type: 'application/xml' });
    triggerDownload(blob, `sitemap-${extractHostname(url)}.xml`);
  };

  const downloadTXT = () => {
    const content = (sitemapData?.urls || []).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    triggerDownload(blob, `sitemap-${extractHostname(url)}.txt`);
  };

  const downloadPDF = async () => {
    if (!sitemapData) return;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });

    // Header
    doc.setFontSize(16);
    doc.text('Sitemap Report', 40, 40);
    doc.setFontSize(10);
    doc.text(`Domain: ${extractHostname(url)}`, 40, 58);
    doc.text(`Crawl Depth: ${sitemapData.summary?.crawlDepth ?? depth}`, 40, 72);

    // Summary block
    const s = sitemapData.summary || {};
    const summaryLines = [
      `Total Pages: ${s.totalPages ?? sitemapData.pagesFound ?? 0}`,
      `Redirected URLs: ${s.redirected ?? 0}`,
      `Broken URLs: ${s.broken ?? 0}`,
      `Average URL Length: ${s.avgUrlLength ?? 0} chars`,
    ];
    doc.text(summaryLines, 40, 90);

    if ((s.broken ?? 0) > 0) {
      doc.setTextColor(200, 40, 40);
      doc.text('⚠ Some URLs in the sitemap return 404/4xx.', 40, 110);
      doc.setTextColor(0, 0, 0);
    }

    // Table
    const rows = (sitemapData.urlDetails || []).map((u) => [
      trim(u.url, 120),
      u.status,
      u.statusText || '',
      u.redirectHops || 0,
      u.finalUrl && u.finalUrl !== u.url ? trim(u.finalUrl, 120) : '-',
    ]);

    autoTable(doc, {
      startY: 130,
      head: [['URL', 'Status', 'Text', 'Hops', 'Final URL']],
      body: rows,
      styles: { fontSize: 8, cellWidth: 'wrap' },
      columnStyles: {
        0: { cellWidth: 220 },
        4: { cellWidth: 220 },
      },
    });

    doc.save(`sitemap-${extractHostname(url)}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-green-900 flex flex-col items-center pt-10 pb-24 px-4">

      <GreenLayout
        heroData={Hero}
      ></GreenLayout>

      <div className="bg-black p-6 border border-white rounded-lg shadow-lg w-full max-w-4xl mt-8">
        <h1 className="text-2xl font-bold text-center mb-5 mt-2 text-green-800">
          Website Sitemap Generator
        </h1>

        <form onSubmit={handleSubmit}>
          <input
            type="url"
            id="websiteUrl"
            name="websiteUrl"
            value={url}
            onChange={(e) => setUrl(e.target.value.trim())}
            placeholder="https://example.com"
            required
            className="w-full border text-white border-gray-300 rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-green-800"
          />

          <div className="mb-4">
            <label htmlFor="depth" className="block text-sm font-medium text-gray-700 mb-1">
              Crawl Depth (1–5):
            </label>
            <input
              type="number"
              id="depth"
              name="depth"
              min="1"
              max="5"
              value={depth}
              onChange={(e) => setDepth(parseInt(e.target.value || '1', 10))}
              className="w-full text-white border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-green-800"
            />
          </div>

          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
          <div className="flex justify-center">
          <button
            type="submit"
            className="w-50 bg-green-800 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <SearchIcon className="h-5 w-5" />}
            {loading ? 'Generating...' : 'Generate Sitemap'}
          </button>
          </div>
        </form>

        {/* Results */}
        <div className="mt-6">
          {loading && (
            <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-green-800 border-opacity-50 mb-3"></div>
              <p className="text-green-800 font-medium">Generating sitemap, please wait...</p>
            </div>
          )}

          {!loading && sitemapData && (
            <div className="border rounded-lg p-4 bg-gray-200">
              <h2 className="text-xl font-bold text-green-800 mb-2">Sitemap Report</h2>

              {/* Warning if broken urls */}
              {(sitemapData.summary?.broken ?? 0) > 0 && (
                <div className="mb-3 p-3 rounded border border-yellow-300 bg-yellow-50 text-yellow-800">
                  ⚠ Some URLs in sitemap are <b>4xx</b>. Please review broken links below.
                </div>
              )}

              {/* Summary */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                <Stat label="Total Pages" value={sitemapData.summary?.totalPages ?? sitemapData.pagesFound ?? 0} />
                <Stat label="Crawl Depth" value={sitemapData.summary?.crawlDepth ?? depth} />
                <Stat label="Redirected URLs" value={sitemapData.summary?.redirected ?? 0} tone="amber" />
                <Stat label="Broken URLs" value={sitemapData.summary?.broken ?? 0} tone="red" />
                <Stat
                  label="Average URL Length"
                  value={`${sitemapData.summary?.avgUrlLength ?? 0} chars`}
                />
              </div>

              {/* URL list */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">URL List:</h3>
                  <span className="text-sm text-gray-500">
                    {(sitemapData.pagesFound ?? 0)} pages
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto bg-black p-3 border border-gray-200 rounded">
                  {sitemapData.urlDetails?.length ? (
                    <ul className="space-y-2">
                      {sitemapData.urlDetails.map((u, i) => (
                        <li key={i} className="text-sm">
                          <div className="flex items-center gap-2">
                            <span
                              className={classNames(
                                'text-xs px-1.5 py-0.5 rounded border',
                                u.status >= 400 || u.status === 'ERROR'
                                  ? 'border-red-300 bg-red-50 text-red-700'
                                  : u.redirectHops > 0
                                  ? 'border-yellow-300 bg-yellow-50 text-yellow-700'
                                  : 'border-green-300 bg-green-50 text-green-700'
                              )}
                            >
                              {u.status} {u.statusText || ''}
                            </span>
                            <a
                              href={u.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:underline truncate"
                              title={u.url}
                            >
                              {u.url}
                            </a>
                          </div>
                          {u.finalUrl && u.finalUrl !== u.url && (
                            <div className="text-xs text-gray-600 ml-1">
                              → {u.finalUrl} ({u.redirectHops} hops)
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">No URLs found</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button
                  onClick={() => setShowXml(true)}
                  className="flex-1 bg-green-800 text-white py-2 px-4 rounded hover:bg-green-700 cursor-pointer transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  <Eye className="h-5 w-5" />
                  Preview XML
                </button>
                <button
                  onClick={downloadXML}
                  className="flex-1 bg-green-800 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  <FileText className="h-5 w-5" />
                  Download XML
                </button>
                <button
                  onClick={downloadTXT}
                  className="flex-1 bg-green-800 text-white py-2 px-4 rounded hover:bg-green-700 cursor-pointer transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  <FileText className="h-5 w-5" />
                  Download TXT
                </button>
                <button
                  onClick={downloadPDF}
                  className="flex-1 bg-green-800 text-white py-2 px-4 rounded hover:bg-green-700 cursor-pointer transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  <FileText className="h-5 w-5" />
                  Download PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* XML Modal */}
      {showXml && sitemapData?.xml && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-black w-full max-w-4xl rounded shadow-lg">
            <div className="flex items-center justify-between p-3 border-b">
              <div className="font-semibold">Sitemap XML Preview</div>
              <button
                onClick={() => setShowXml(false)}
                className="p-1 rounded hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <pre className="p-4 max-h-[70vh] overflow-auto text-sm bg-gray-50">
{prettyXml(sitemapData.xml)}
            </pre>
            <div className="p-3 border-t text-right">
              <button
                onClick={() => setShowXml(false)}
                className="inline-flex items-center px-4 py-2 rounded bg-green-600 text-white hover:bg-green-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- helpers ---------- */
function extractHostname(u) {
  try {
    const v = u.startsWith('http') ? u : `https://${u}`;
    return new URL(v).hostname || 'website';
  } catch {
    return 'website';
  }
}
function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function trim(s, n) {
  const x = String(s || '');
  return x.length > n ? x.slice(0, n - 1) + '…' : x;
}
function prettyXml(xml) {
  try {
    // very tiny pretty-printer
    let formatted = '';
    const reg = /(>)(<)(\/*)/g;
    xml = xml.replace(reg, '$1\r\n$2$3');
    let pad = 0;
    xml.split('\r\n').forEach((node) => {
      let indent = 0;
      if (node.match(/.+<\/\w[^>]*>$/)) {
        indent = 0;
      } else if (node.match(/^<\/\w/)) {
        if (pad) pad -= 2;
      } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
        indent = 2;
      } else {
        indent = 0;
      }
      formatted += ' '.repeat(pad) + node + '\r\n';
      pad += indent;
    });
    return formatted;
  } catch {
    return xml || '';
  }
}
function Stat({ label, value, tone }) {
  const toneMap =
    tone === 'red'
      ? 'bg-red-50 border-red-200 text-red-700'
      : tone === 'amber'
      ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
      : 'bg-green-50 border-green-200 text-green-800';
  return (
    <div className={classNames('p-3 rounded border', toneMap)}>
      <div className="text-sm opacity-80">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}
