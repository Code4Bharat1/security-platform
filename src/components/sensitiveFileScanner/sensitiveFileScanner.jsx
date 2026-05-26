"use client";

import React, { useState } from 'react';

export default function SensitiveFileScanner() {
  const [url, setUrl] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleScan = async () => {
    if (!url.startsWith('http')) {
      setError('Please enter a valid URL starting with http or https');
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_API_URL}/sensitive-files/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Scan failed');
      setResults(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tool-detail-page">
      <div className="tool-detail-shell">
        <div className="mx-auto max-w-5xl rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-card)] p-6 shadow-[var(--shadow-elevated)]">
          <h1 className="mb-4 text-xl font-bold text-[color:var(--text-heading)]">Sensitive File Detector</h1>

          <input
            type="text"
            placeholder="Enter target URL (e.g. https://example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value.trim())}
            className="mb-3 w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-subtle)] px-4 py-3 text-[color:var(--text-body)] placeholder:text-[color:var(--text-muted)]"
          />
          <button
            onClick={handleScan}
            disabled={loading}
            className="rounded-lg border border-[color:var(--gold)] bg-[color:var(--gold)] px-4 py-2 text-[color:var(--text-inverse)] hover:bg-[color:var(--gold-strong)] disabled:opacity-50"
          >
            {loading ? 'Scanning...' : 'Start Scan'}
          </button>

          {error && <p className="mt-4 text-[color:var(--danger)]">{error}</p>}

          {results.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-[color:var(--text-heading)]">Results</h2>
              <ul className="mt-2 space-y-3">
                {results.map((file, idx) => (
                  <li
                    key={idx}
                    className={`rounded-xl border p-4 ${
                      file.riskLevel === 'high'
                        ? 'border-red-500 bg-red-900/20'
                        : file.riskLevel === 'moderate'
                        ? 'border-yellow-500 bg-yellow-900/20'
                        : 'border-green-500 bg-green-900/20'
                    }`}
                  >
                    <p className="text-[color:var(--text-heading)]">
                      <strong className="font-mono">{file.path}</strong> - Status: <code>{file.status}</code> - {file.note}
                    </p>
                    <p className="mt-1 text-sm text-[color:var(--text-body)]">
                      Risk Level: <span className="font-semibold">{file.riskLevel}</span>
                      {file.expectedPublic === false && <span> - Should not be public</span>}
                    </p>
                    {file.note.includes('Exposed') && (
                      <p className="mt-1 text-sm text-[color:var(--danger)]">
                        Publicly accessible at: <a href={file.url} target="_blank" className="underline" rel="noreferrer">{file.url}</a>
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
