'use client';
import { useState } from 'react';

export default function TechDetectPage() {
  const [domain, setDomain] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const detectTech = async () => {
    setError('');
    setResult(null);
    if (!domain) return;

    try {
      const res = await fetch('/api/tech-detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Detection failed.');
        return;
      }
      
      setResult(data);
    } catch (err) {
      setError('Could not reach API.');
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Technology Detection</h1>

      <input
        type="text"
        placeholder="Enter domain (e.g., vercel.com)"
        className="border p-2 w-full rounded"
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
      />

      <button
        onClick={detectTech}
        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Detect
      </button>

      {error && <p className="mt-4 text-red-500">{error}</p>}

{result && result.technologies && (
  <div className="mt-4">
    <h2 className="text-lg font-semibold mb-2">Detected Technologies:</h2>
    <ul className="list-disc ml-6 space-y-1">
      {result.technologies.map((tech, i) => (
        <li key={i}>{tech}</li>
      ))}
    </ul>
  </div>
)}


    </div>
  );
}

