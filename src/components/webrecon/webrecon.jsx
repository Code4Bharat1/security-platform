'use client';
import { useState } from 'react';
const dnsTypeMap = {
  1: 'A',
  28: 'AAAA',
  15: 'MX',
  16: 'TXT',
  2: 'NS',
};

function getTypeName(typeNum) {
  return dnsTypeMap[typeNum] || `Type ${typeNum}`;
}

export default function Webrecon() {
 const [domain, setDomain] = useState('');
  const [recordType, setRecordType] = useState('A');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLookup = async () => {
    setError('');
    setResult(null);

    if (!domain.trim()) {
      setError('Please enter a domain');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/dns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, type: recordType }),
      });

      const data = await res.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || 'Failed to fetch DNS data');
      }
    } catch (err) {
      setError(err.message || 'Error fetching DNS data');
    } finally {
      setLoading(false);
    }
  };
  
 return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">DNS Lookup Tool</h1>

      <input
        type="text"
        placeholder="Enter domain (e.g., example.com)"
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
        className="border px-3 py-2 w-full mb-4 rounded"
      />

      <select
        value={recordType}
        onChange={(e) => setRecordType(e.target.value)}
        className="border px-3 py-2 mb-4 rounded w-full"
      >
        <option value="A">A (IPv4 Address)</option>
        <option value="AAAA">AAAA (IPv6 Address)</option>
        <option value="MX">MX (Mail Servers)</option>
        <option value="TXT">TXT (Text Records)</option>
        <option value="NS">NS (Name Servers)</option>
      </select>

      <button
        onClick={handleLookup}
        disabled={loading}
        className={`w-full text-white px-4 py-2 rounded ${
          loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? 'Looking up...' : 'Lookup'}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {result?.Answer && (
        <div className="mt-6 bg-gray-100 p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">DNS {recordType} Records:</h2>
          <ul className="list-disc list-inside">
            {result.Answer.map((record, index) => (
              <li key={index} className="mb-3">
                <p><span className="font-semibold">Name:</span> {record.name}</p>
                <p><span className="font-semibold">Type:</span> {getTypeName(record.type)}</p>
                <p><span className="font-semibold">TTL:</span> {record.TTL} seconds</p>
                <p><span className="font-semibold">Data:</span> {record.data}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
