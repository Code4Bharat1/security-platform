'use client';
import { useState } from 'react';

export default function DirectoryBruteForcer() {
  const [target, setTarget] = useState('');
  const [recursive, setRecursive] = useState(true);
  const [maxDepth, setMaxDepth] = useState(2);
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
        body: JSON.stringify({ target: cleanTarget, recursive, maxDepth }),
      });
      const data = await res.json();
      if (res.ok) {
        setResults(data.results || []);
        setMeta(data.meta || null);
      } else {
        setResults([{ path: '-', status: '-', result: data.error || 'Error', depth: '-' }]);
      }
    } catch (err) {
      setResults([{ path: '-', status: '-', result: '⚠️ Scan failed', depth: '-' }]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (v) => (v ? new Date(v).toLocaleString() : '-');
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

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <img src="/brute-force.png" alt="verify" className="w-16 h-20 mb-4 mt-7" />
      <h2 className="text-xl font-bold mb-4">🔍 Directory/File Brute Forcer</h2>

      <div className="flex flex-col gap-2 mb-3">
        <input
          type="text"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="https://example.com"
          className="border p-2 rounded w-full"
        />
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={recursive}
              onChange={(e) => setRecursive(e.target.checked)}
            />
            <span>Recursive</span>
          </label>

          <label className="flex items-center gap-2">
            <span>Max depth</span>
            <select
              value={maxDepth}
              onChange={(e) => setMaxDepth(Number(e.target.value))}
              className="border rounded p-1"
            >
              <option value={0}>0 (seed only)</option>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </label>

          <button
            onClick={startScan}
            className="ml-auto bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Scanning...' : 'Start Scan'}
          </button>
        </div>
      </div>

      {meta && (
        <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3 bg-gray-50 p-4 rounded border">
          <div>
            <p className="text-sm text-gray-600">Recursive</p>
            <p className="font-semibold">{meta.recursive ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Max depth (selected)</p>
            <p className="font-semibold">{meta.maxDepth}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Max depth reached</p>
            <p className="font-semibold">{meta.maxDepthReached ?? '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Requests sent</p>
            <p className="font-semibold">{meta.totalRequests ?? '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Skipped due to depth</p>
            <p className="font-semibold">{meta.skippedDueToDepth ?? 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Duration</p>
            <p className="font-semibold">{formatDuration(meta.durationMs)}</p>
          </div>
          {/* <div className="col-span-2">
            <p className="text-sm text-gray-600">Started</p>
            <p className="font-medium">{formatDate(meta.startedAt)}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-600">Finished</p>
            <p className="font-medium">{formatDate(meta.finishedAt)}</p>
          </div> */}
        </div>
      )}

      {results.length > 0 && (
        <table className="min-w-full text-sm mt-4 border border-gray-200">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-2">Path</th>
              <th className="px-4 py-2">Depth</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Result</th>
            </tr>
          </thead>
          <tbody>
            {results.map((item, i) => (
              <tr key={i} className="border-t border-gray-200">
                {/* Optional visual indent based on depth */}
                <td className="px-4 py-2">
                  <span style={{ paddingLeft: `${Math.min(item.depth || 0, 6) * 12}px` }}>
                    {item.path}
                  </span>
                </td>
                <td className="px-4 py-2">{item.depth ?? '-'}</td>
                <td className="px-4 py-2">{item.status}</td>
                <td className="px-4 py-2">{item.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
