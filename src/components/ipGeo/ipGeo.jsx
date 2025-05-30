'use client';
import { useState } from 'react';

export default function IPGeoPage() {
  const [domain, setDomain] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleLookup = async () => {
    setError('');
    setResult(null);
    if (!domain) return;

    try {
      const res = await fetch('/api/ip-geo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Lookup failed.');
        return;
      }

      setResult(data);
    } catch (err) {
      setError('Failed to fetch geolocation data.');
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">IP & Geolocation Lookup</h1>

      <input
        type="text"
        placeholder="Enter domain (e.g., openai.com)"
        className="border p-2 w-full rounded"
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
      />

      <button
        onClick={handleLookup}
        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Lookup
      </button>

      {error && <p className="mt-4 text-red-500">{error}</p>}

      {result && (
        <div className="mt-6 bg-gray-100 p-4 rounded">
          <p><strong>Domain:</strong> {result.domain}</p>
          <p><strong>IP:</strong> {result.ip}</p>
          <p><strong>Country:</strong> {result.geo.country}</p>
          <p><strong>Region:</strong> {result.geo.regionName}</p>
          <p><strong>City:</strong> {result.geo.city}</p>
          <p><strong>ISP:</strong> {result.geo.isp}</p>
          <p><strong>Org:</strong> {result.geo.org}</p>
          <p><strong>ASN:</strong> {result.geo.as}</p>
        </div>
      )}
    </div>
  );
}
