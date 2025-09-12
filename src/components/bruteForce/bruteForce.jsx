'use client';
import { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function DirectoryBruteForcer() {
  const [target, setTarget] = useState('');
  const [recursive, setRecursive] = useState(true);
  const [results, setResults] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);

  const startScan = async () => {
    const cleanTarget = target.trim();
    if (!cleanTarget) return;
    setLoading(true);
    setResults([]);
    setMeta(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_API_URL}/bruteForce/brute-Force`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: cleanTarget, recursive }),
      });
      const data = await res.json();
      if (res.ok) {
        setResults(data.results || []);
        setMeta(data.meta || null);
      } else {
        setResults([{ path: '-', status: '-', result: data.error || 'Error' }]);
      }
    } catch (err) {
      setResults([{ path: '-', status: '-', result: '⚠️ Scan failed' }]);
    } finally {
      setLoading(false);
    }
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
    doc.text(`Directory Brute Force Scan for ${target}`, 10, 10);
    autoTable(doc, {
      head: [['Path', 'Status', 'Result']],
      body: results.map(({ path, status, result }) => [path, status, result]),
    });
    doc.save('directory-brute-force-results.pdf');
  };

  const viewFoundSite = (path) => {
    window.open(`${target}${path}`, '_blank');
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">

     <div className="flex items-center justify-left gap-10 mt-15 mb-8">
  {/* Image with circle border */}
  <div className="w-24 h-24 rounded-full border-4 border-red-600 flex items-center justify-center overflow-hidden">
    <img
      src="/RedTeam/brute-force.png"
      alt="verify"
      className="w-30 h-30 object-contain"
    />
  </div>

  {/* Big Heading */}
  <h2 className="text-4xl text-white font-extrabold">
    Directory/File Brute Forcer
  </h2>
</div>
      <div className="border border-white flex flex-col gap-15 px-5 py-5 mb-30">
        <input
          type="text"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="https://example.com"
          className="border text-white p-2 rounded w-full"
        />
        <div className="flex items-center gap-4">
          <label className="flex text-white items-center gap-2">
            <input
              type="checkbox"
              checked={recursive}
              onChange={(e) => setRecursive(e.target.checked)}
            />
            <span>Recursive</span>
          </label>
<div className="flex items-center">
          <button
            onClick={startScan}
            className="ml-auto bg-red-600 text-white px-4 py-2 rounded disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Scanning...' : 'Start Scan'}
          </button>
          </div>
        </div>
      </div>

      {meta && (
        <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3 text-white bg-black p-4 rounded border">
          <div>
            <p className="text-sm text-white">Recursive</p>
            <p className="font-semibold">{meta.recursive ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <p className="text-sm text-white">Requests sent</p>
            <p className="font-semibold">{meta.totalRequests ?? '-'}</p>
          </div>
          <div>
            <p className="text-sm text-white">Duration</p>
            <p className="font-semibold">{formatDuration(meta.durationMs)}</p>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div>
          <button
            onClick={downloadPDF}
            className="mt-5 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded"
          >
            Download PDF
          </button>

          <table className="min-w-full text-sm mt-4 border border-gray-200">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-2">Path</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Result</th>
                <th className="px-4 py-2">View Site</th>
              </tr>
            </thead>
            <tbody>
              {results.map((item, i) => (
                <tr key={i} className="border-t border-white">
                  <td className="px-4 py-2">{item.path}</td>
                  <td className="px-4 py-2">{item.status}</td>
                  <td className="px-4 py-2">{item.result}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => viewFoundSite(item.path)}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
