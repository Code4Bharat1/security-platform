'use client';
import { useState } from 'react';

export default function DirectoryBruteForcer() {
  const [target, setTarget] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const startScan = async () => {
    setLoading(true);
    setResults([]);
    const res = await fetch('http://localhost:4180/api/bruteForce/brute-Force', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target })
    });

    const data = await res.json();
    setResults(data.results);
    setLoading(false);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">🔍 Directory/File Brute Forcer</h2>
      <input
        type="text"
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        placeholder="https://example.com"
        className="border p-2 rounded w-full mb-2"
      />
      <button
        onClick={startScan}
        className="bg-blue-600 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Scanning..." : "Start Scan"}
      </button>

      {results.length > 0 && (
        <table className="min-w-full text-sm mt-4 border border-gray-200">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-2">Path</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Result</th>
            </tr>
          </thead>
          <tbody>
            {results.map((item, i) => (
              <tr key={i} className="border-t border-gray-200">
                <td className="px-4 py-2">{item.path}</td>
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
