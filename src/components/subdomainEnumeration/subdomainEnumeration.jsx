'use client';

import { useState } from 'react';

export default function SubdomainEnumeration() {
  const [domain, setDomain] = useState('');
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState(null); // { total, startedAt, finishedAt, durationMs }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatDate = (iso) => {
    if (!iso) return '-';
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  const formatDuration = (ms) => {
    if (ms === 0) return '0 ms';
    if (!ms && ms !== 0) return '-';
    if (ms < 1000) return `${ms} ms`;
    const sec = ms / 1000;
    if (sec < 60) return `${sec.toFixed(2)} s`;
    const m = Math.floor(sec / 60);
    const s = (sec % 60).toFixed(2);
    return `${m}m ${s}s`;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setResults([]);
    setStats(null);

    const cleanDomain = domain.trim().toLowerCase();
    if (!cleanDomain) {
      setError('Please enter a domain.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/subdomain/subdomains-scan`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain: cleanDomain }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
      } else {
        const list = Array.isArray(data.results) ? data.results : [];
        setResults(list);

        setStats({
          total: typeof data.total === 'number' ? data.total : list.length,
          startedAt: data.startedAt,
          finishedAt: data.finishedAt,
          durationMs: data.durationMs,
        });

        if (list.length === 0) {
          setError('No subdomains found.');
        }
      }
    } catch (err) {
      setError('Failed to fetch subdomains.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 border rounded shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">Subdomain Enumeration</h2>

      <input
        type="text"
        placeholder="Enter domain (e.g., example.com)"
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
        className="w-full p-2 mb-3 border rounded"
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Searching...' : 'Find Subdomains'}
      </button>

      {error && <p className="mt-3 text-red-600">{error}</p>}

      {stats && (
        <div className="mt-5 grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded border">
          <div>
            <p className="text-sm text-gray-600">Total subdomains</p>
            <p className="text-lg font-semibold">{stats.total ?? '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Scan duration</p>
            <p className="text-lg font-semibold">{formatDuration(stats.durationMs)}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-600">Starting time</p>
            <p className="text-sm font-medium">{formatDate(stats.startedAt)}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-600">Finish time</p>
            <p className="text-sm font-medium">{formatDate(stats.finishedAt)}</p>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-5">
          <h3 className="text-xl font-semibold mb-2">Results</h3>
          <ul className="list-disc list-inside space-y-1 max-h-60 overflow-auto border p-3 rounded bg-gray-50">
            {results.map(({ subdomain }, idx) => (
              <li key={idx} className="break-all">
                <a
                  href={`https://${subdomain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {subdomain}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
