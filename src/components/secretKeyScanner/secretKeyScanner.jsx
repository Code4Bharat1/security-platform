'use client';
import { useState } from 'react';

export default function SecretKeyScanner() {
  const [code, setCode] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const scanSecrets = async () => {
    setLoading(true);
    const res = await fetch('http://localhost:4180/api/secretKeyScanner/secret-scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    setResults(data.secrets || []);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold"> Secret Key Exposure Scanner</h1>

      <input
        type="file"
        accept=".js,.env,.txt,.json"
        className="hidden"
        id="fileInput"
        onChange={(e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (e) => setCode(e.target.result);
          reader.readAsText(file);
        }}
      />
      <label
        htmlFor="fileInput"
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700"
      >
         Choose File
      </label>

      <textarea
        rows={10}
        className="w-full p-3 rounded border font-mono border-gray-300"
        placeholder="Paste your code or upload a file..."
        value={code}
        onChange={(e) => setCode(e.target.value.trim)}      />

      <button
        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        onClick={scanSecrets}
        disabled={loading}
      >
        {loading ? 'Scanning...' : '🔍 Scan for Secrets'}
      </button>

      {results.length > 0 && (
        <div className="mt-6 space-y-4">
          <h2 className="text-xl font-semibold"> Secrets Detected: {results.length}</h2>
    
    {results.length > 0 && (
  <div className="mt-6 space-y-4">
    <h2 className="text-xl font-semibold">🛡️ Secrets Detected: {results.length}</h2>
    {results.map((r, idx) => (
      <div
        key={idx}
        className={`border-l-4 p-4 rounded shadow ${
          r.severity === 'Critical'
            ? 'bg-red-200 border-red-600'
            : r.severity === 'High'
            ? 'bg-red-100 border-red-500'
            : r.severity === 'Medium'
            ? 'bg-yellow-100 border-yellow-500'
            : 'bg-gray-100 border-gray-400'
        }`}
      >
        <p><strong>Type:</strong> {r.type}</p>
        <p><strong>Line {r.line}:</strong> <code className="bg-white px-1 py-0.5 rounded">{r.secret}</code></p>
        <p><strong>Severity:</strong> <span className="font-medium">{r.severity}</span></p>
        <p className="text-sm text-gray-700 mt-1"><strong>Suggestion:</strong> {r.suggestion}</p>
      </div>
    ))}
  </div>
)}


        </div>
      )}

      {!loading && results.length === 0 && code && (
        <p className="text-gray-500 mt-4"> No exposed secrets found.</p>
      )}
    </div>
  );
}
