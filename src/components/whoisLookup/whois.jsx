'use client';
import { useState } from 'react';

export default function WhoisLookup() {
  const [domain, setDomain] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLookup(e) {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!domain) {
      setError('Please enter a domain name.');
      return;
    } else if (domain.includes("https://") || domain.includes("http://")){
      setError('Enter domain name only');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('https://zypher-api.code4bharat.com/whois/whois-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: domain
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || 'Failed to fetch WHOIS data.');
      } else {
        setResult(json.data);
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    }

    setLoading(false);
  }

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">WHOIS Lookup</h1>

      <form onSubmit={handleLookup} className="mb-4">
        <input
          type="text"
          placeholder="Enter domain name (e.g., example.com)"
          value={domain}
          onChange={(e) => setDomain(e.target.value.trim())}       
          className="border rounded p-2 w-full"
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Looking up...' : 'Lookup'}
        </button>
      </form>

      {error && (
        <p className="text-red-600 mb-4">{error}</p>
      )}

      {result && (
        <div className="bg-gray-100 p-4 rounded shadow mt-4 space-y-2 text-base">
          <h2 className="text-lg font-semibold">WHOIS Information</h2>
          <textarea readOnly className='w-full h-50' name="whois-Information" value={result} />
        </div>
      )}
    </main>
  );
}

