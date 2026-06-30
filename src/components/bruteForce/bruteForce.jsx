'use client';
import { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import useProtectedAction from '../UseProtectedAction/UseProtectedAction';

/**
 * DirectoryBruteForcer.jsx
 *
 * Usage:
 * - Ensure Tailwind CSS is configured in your Next.js app.
 * - Ensure NEXT_PUBLIC_PROD_API_URL is set in your environment for the API call.
 * - Place this component on a page or render inside your app.
 */

export default function DirectoryBruteForcer() {
  const protectedAction = useProtectedAction();
  const [target, setTarget] = useState('');
  const [recursive, setRecursive] = useState(true);
  const [results, setResults] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);

  const startScan = async () => {
    await protectedAction(async(token) =>{
    const cleanTarget = target.trim();
    if (!cleanTarget) return;
    setLoading(true);
    setResults([]);
    setMeta(null);

    try {
      const res = await fetch(        
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/bruteForce/brute-Force`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization':`Bearer ${token}` },
          body: JSON.stringify({ target: cleanTarget, recursive }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setResults(Array.isArray(data.results) ? data.results : []);
        setMeta(data.meta || null);
      } else {
        setResults([{ path: '-', status: '-', result: data.error || 'Error' }]);
      }
    } catch (err) {
      console.error('Scan error:', err);
      setResults([{ path: '-', status: '-', result: '⚠️ Scan failed' }]);
    } finally {
      setLoading(false);
    }
  });
  };

  const formatDuration = (ms) => {
    if (ms === 0) return '0 ms';
    if (!ms && ms !== 0) return '-';
    if (ms < 1000) return `${ms} ms`;
    const s = ms / 1000;
    if (s < 60) return `${s.toFixed(2)} s`;
    const m = Math.floor(s / 60);
    const r = (s % 60).toFixed(1);
    return `${m}m ${r}s`;
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text(`Directory Brute Force Scan for ${target || '-'}`, 10, 10);
    autoTable(doc, {
      head: [['Path', 'Status', 'Result']],
      body: results.map(({ path, status, result }) => [
        path ?? '-',
        status ?? '-',
        typeof result === 'string' ? result : JSON.stringify(result),
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [30, 30, 30] },
    });
    doc.save('directory-brute-force-results.pdf');
  };

  const viewFoundSite = (path) => {
    if (!path) return;
    // Build URL carefully, prefer absolute paths if provided
    try {
      const isAbsolute = /^https?:\/\//i.test(path);
      let url;
      if (isAbsolute) {
        url = path;
      } else {
        const base = target.trim().replace(/\/+$/, '');
        const p = path.startsWith('/') ? path : `/${path}`;
        url = base ? `${base}${p}` : p;
      }
      window.open(url, '_blank');
    } catch (e) {
      console.error('Failed to open URL', e);
    }
  };

  return (
    <div className="tool-detail-page">
      <div className="tool-detail-shell">
    {/* Header */}
    <div className="tool-detail-hero">
      <div className="tool-detail-icon">
        <img
          src="/RedTeam/brute-force.png"
          alt="brute-force"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="tool-detail-copy">
        <h1>Directory / File Brute Forcer</h1>
        <p>Scan a target host for common files and directories.</p>
      </div>
    </div>


      {/* Control box */}
      <div className="border border-white rounded-md p-4 mb-6 bg-black/60">
        <label className="block mb-2 text-xl text-white text-center">Target URL</label>
        <input
          type="text"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="https://example.com"
          className="w-full bg-transparent text-white placeholder-gray-400 border border-white p-2 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-red-600"
        />

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-white">
            <input
              type="checkbox"
              checked={recursive}
              onChange={(e) => setRecursive(e.target.checked)}
              className="accent-red-600"
            />
            <span>Recursive</span>
          </label>

          <div className="ml-auto">
            <button
              onClick={startScan}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded disabled:opacity-60"
              disabled={loading}
            >
              {loading ? 'Scanning...' : 'Start Scan'}
            </button>
          </div>
        </div>
      </div>

      {/* Meta */}
      {meta && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-900/70 p-4 rounded border border-white/10 mb-6">
          <div>
            <p className="text-sm text-gray-400">Recursive</p>
            <p className="font-semibold text-white">{meta.recursive ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Requests sent</p>
            <p className="font-semibold text-white">{meta.totalRequests ?? '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Duration</p>
            <p className="font-semibold text-white">{formatDuration(meta.durationMs)}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 ? (
        <div>
          <button
            onClick={downloadPDF}
            className="mt-2 w-full sm:w-48 bg-red-600 hover:bg-red-700 text-white py-2 rounded"
          >
            Download PDF
          </button>

          <div className="overflow-x-auto mt-4">
            <table className="min-w-full text-sm mt-4 border border-white/10 divide-y divide-white/5">
              <thead className="bg-zinc-800">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-200">Path</th>
                  <th className="px-4 py-2 text-left text-gray-200">Status</th>
                  <th className="px-4 py-2 text-left text-gray-200">Result</th>
                  <th className="px-4 py-2 text-left text-gray-200">View Site</th>
                </tr>
              </thead>
              <tbody className="bg-black/60">
                {results.map((item, i) => (
                  <tr
                    key={i}
                    className={i % 2 === 0 ? 'bg-white/2' : 'bg-white/4'}
                  >
                    <td className="px-4 py-3 text-white break-all">
                      {item.path ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-white">{item.status ?? '-'}</td>
                    <td className="px-4 py-3 text-white">
                      {typeof item.result === 'string' ? item.result : JSON.stringify(item.result)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => viewFoundSite(item.path)}
                        className="text-blue-400 hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="mt-6 text-gray-400">No results yet. Start a scan to see results here.</div>
      )}
      </div>
    </div>
  );
}
