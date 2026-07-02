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

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const startScan = async () => {
    await protectedAction(async(token) =>{
    const cleanTarget = target.trim();
    if (!cleanTarget) return;
    setLoading(true);
    setResults([]);
    setMeta(null);
    setCurrentPage(1);

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

  // Pagination helper calculations
  const totalPages = Math.max(1, Math.ceil(results.length / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = results.slice(indexOfFirstItem, indexOfLastItem);

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
        <div className="mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <button
              onClick={downloadPDF}
              className="w-full sm:w-48 bg-red-600 hover:bg-red-700 text-white py-2 rounded font-medium transition-colors"
            >
              Download PDF
            </button>

            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span>Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-zinc-900 border border-white/10 rounded px-3 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
              >
                {[10, 15, 25, 50, 100].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
              <span>entries</span>
            </div>
          </div>

          <div className="overflow-x-auto mt-4 border border-white/10 rounded-lg">
            <table className="w-full text-sm divide-y divide-white/5 table-auto">
              <thead className="bg-zinc-900 text-gray-200">
                <tr>
                  <th className="w-5/12 px-4 py-3 text-left font-semibold">Path</th>
                  <th className="w-2/12 px-4 py-3 text-left font-semibold">Status</th>
                  <th className="w-3/12 px-4 py-3 text-left font-semibold">Result</th>
                  <th className="w-2/12 px-4 py-3 text-left font-semibold">View Site</th>
                </tr>
              </thead>
              <tbody className="bg-black/40 divide-y divide-white/5">
                {currentItems.map((item, i) => (
                  <tr
                    key={i}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3 text-white break-all font-mono">
                      {item.path ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-white font-mono">{item.status ?? '-'}</td>
                    <td className="px-4 py-3 text-white">
                      {typeof item.result === 'string' ? item.result : JSON.stringify(item.result)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => viewFoundSite(item.path)}
                        className="text-blue-400 hover:text-blue-300 hover:underline font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-1 py-3">
              <div className="text-sm text-gray-400">
                Showing <span className="font-semibold text-white">{indexOfFirstItem + 1}</span> to{' '}
                <span className="font-semibold text-white">
                  {Math.min(indexOfLastItem, results.length)}
                </span>{' '}
                of <span className="font-semibold text-white">{results.length}</span> results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:hover:bg-zinc-900 text-white px-3 py-1.5 rounded text-sm transition-colors border border-white/10 cursor-pointer disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                  let pageNum = idx + 1;
                  if (totalPages > 5) {
                    if (currentPage > 3) {
                      pageNum = currentPage - 3 + idx;
                      if (pageNum + (5 - idx - 1) > totalPages) {
                        pageNum = totalPages - 5 + idx + 1;
                      }
                    }
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1.5 rounded text-sm transition-colors border border-white/10 cursor-pointer ${
                        currentPage === pageNum
                          ? 'bg-red-600 border-red-600 text-white font-semibold'
                          : 'bg-zinc-900 hover:bg-zinc-800 text-gray-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:hover:bg-zinc-900 text-white px-3 py-1.5 rounded text-sm transition-colors border border-white/10 cursor-pointer disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6 text-gray-400">No results yet. Start a scan to see results here.</div>
      )}
      </div>
    </div>
  );
}
