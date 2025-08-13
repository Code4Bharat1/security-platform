'use client';
import { useMemo, useState } from 'react';

const dnsTypeMap = { 1: 'A', 28: 'AAAA', 15: 'MX', 16: 'TXT', 2: 'NS' };
const getTypeName = (n) => dnsTypeMap[n] || `Type ${n}`;

const RECORD_TYPES = ['A', 'AAAA', 'MX', 'TXT', 'NS'];

export default function Webrecon() {
  const [domain, setDomain] = useState('');
  const [recordType, setRecordType] = useState('A');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE = useMemo(() => {
    return process.env.NEXT_PUBLIC_PROD_API_URL?.replace(/\/+$/, '') || '';
  }, []);

  const handleLookup = async () => {
    setError('');
    setResult(null);

    const target = domain.trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
    if (!target) {
      setError('Please enter a domain');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/dns/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: target, type: recordType }),
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || `Request failed (${res.status})`);
      }
      setResult(data.data);
    } catch (e) {
      setError(e?.message || 'Error fetching DNS data');
    } finally {
      setLoading(false);
    }
  };
  
 return (
    <main className="p-6 max-w-xl mx-auto">
      <img src="/web-recon.png" alt="web-recon image" className="w-16 h-20 mb-4 mt-7" />
      <h1 className="text-2xl font-bold mb-4">Website Recon</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Enter domain (e.g., example.com)"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="border px-3 py-2 w-full rounded"
        />
        <select
          value={recordType}
          onChange={(e) => setRecordType(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          {RECORD_TYPES.map((rt) => (
            <option key={rt} value={rt}>
              {rt}
            </option>
          ))}
        </select>
        <button
          onClick={handleLookup}
          disabled={loading}
          className={`min-w-[120px] text-white px-4 py-2 rounded ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Looking up…' : 'Lookup'}
        </button>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {result && (
        <div className="mt-4 bg-gray-50 p-4 rounded border">
          {Array.isArray(result.Answer) && result.Answer.length > 0 && (
            <ul className="list-disc list-inside">
              {result.Answer.map((rec, i) => (
                <li key={i} className="mb-2">
                  <div><span className="font-semibold">Name:</span> {rec.name}</div>
                  <div><span className="font-semibold">Type:</span> {getTypeName(rec.type)}</div>
                  <div><span className="font-semibold">TTL:</span> {rec.TTL}s</div>
                  <div><span className="font-semibold">Data:</span> {rec.data}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </main>
  );
}
