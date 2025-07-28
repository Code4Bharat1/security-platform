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
      const res = await fetch("https://zypher-api.code4bharat.com/sensitive-files/check", {
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
    <div className="max-w-6xl mx-auto p-4 bg-white shadow-md rounded">
      <h1 className="text-xl font-bold mb-4"> Sensitive File Detector</h1>

      <input
        type="text"
        placeholder="Enter target URL (e.g. https://example.com)"
        value={url}
        onChange={(e) => setUrl(e.target.value.trim())}       className="w-full px-3 py-2 border rounded mb-3"
      />
      <button
        onClick={handleScan}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? 'Scanning...' : 'Start Scan'}
      </button>

      {error && <p className="text-red-500 mt-4"> {error}</p>}

      {results.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Results</h2>
          <ul className="mt-2 space-y-2">
          {results.map((file, idx) => (
  <li key={idx} className={`p-2 rounded ${
    file.riskLevel === 'high' ? 'bg-red-100' :
    file.riskLevel === 'moderate' ? 'bg-yellow-100' : 'bg-green-100'
  }`}>
    <p><strong>{file.path}</strong> — Status: <code>{file.status}</code> — {file.note}</p>
    <p className="text-sm text-gray-700">
      Risk Level: <span className="font-semibold">{file.riskLevel}</span>
      {file.expectedPublic === false && <span> — 🚫 Should not be public</span>}
    </p>
    {file.note.includes('Exposed') && (
      <p className="text-red-700 text-sm">⚠️ Publicly accessible at: <a href={file.url} target="_blank" className="underline">{file.url}</a></p>
    )}
  </li>
))}

</ul>
        </div>
      )}
    </div>
  );
}
