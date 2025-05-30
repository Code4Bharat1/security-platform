'use client';

import { useState } from 'react';

export default function SubdomainEnumeration() {
  const [domain, setDomain] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setResults([]);

    if (!domain.trim()) {
      setError('Please enter a domain.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/subdomains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
      } else if (data.results.length === 0) {
        setError('No subdomains found.');
      } else {
        setResults(data.results);
      }
    } catch (err) {
      setError('Failed to fetch subdomains.');
    }

    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto p-6 border rounded shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">🔍 Subdomain Enumeration</h2>

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

      {results.length > 0 && (
        <div className="mt-5">
          <h3 className="text-xl font-semibold mb-2">Results:</h3>
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

