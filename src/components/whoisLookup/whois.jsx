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
    }

    setLoading(true);

    try {
      const res = await fetch('/api/whois', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
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
          onChange={(e) => setDomain(e.target.value)}
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
  <div className="bg-gray-100 p-4 rounded shadow mt-4 space-y-2 text-sm">
    <h2 className="text-lg font-semibold">WHOIS Information</h2>

    <p><strong>Domain:</strong> {result.name}</p>
    <p><strong>Status:</strong> {result.status}</p>
    <p><strong>Created:</strong> {result.created}</p>
    <p><strong>Expires:</strong> {result.expires}</p>

    {result.registrar && (
      <>
        <h3 className="font-medium mt-3">Registrar Info:</h3>
        <p><strong>Name:</strong> {result.registrar.name}</p>
        <p><strong>URL:</strong> <a href={result.registrar.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{result.registrar.url}</a></p>
      </>
    )}

    {result.contacts?.owner?.length > 0 && (
      <>
        <h3 className="font-medium mt-3">Owner Info:</h3>
        <p><strong>Organization:</strong> {result.contacts.owner[0].organization || 'N/A'}</p>
        <p><strong>Country:</strong> {result.contacts.owner[0].country || 'N/A'}</p>
      </>
    )}

    {result.nameservers?.length > 0 && (
      <>
        <h3 className="font-medium mt-3">Name Servers:</h3>
        <ul className="list-disc ml-6">
          {result.nameservers.map((ns, idx) => (
            <li key={idx}>{ns}</li>
          ))}
        </ul>
      </>
    )}
  </div>
)}

    </main>
  );
}

