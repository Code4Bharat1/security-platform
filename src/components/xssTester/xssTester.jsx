'use client';
import { useState } from 'react';

export default function XssTester() {
  const [url, setUrl] = useState('');
  const [param, setParam] = useState('');
  const [payload, setPayload] = useState(`<script>alert('XSS')</script>`);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_API_URL}/xssTester/xssTester-scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, param, payload }),
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <img src="/xss.png" alt="XSS Tester" className="w-16 h-20 mb-4 mt-7" />

      <h1 className="text-2xl font-bold">🧪 XSS Payload Tester</h1>
      <form onSubmit={handleTest} className="space-y-4 max-w-3xl">
        <input
          type="text"
          placeholder="Target URL (e.g., https://site.com/search)"
          value={url}
          onChange={(e) => setUrl(e.target.value.trim())}         className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Parameter name (e.g., q)"
          value={param}
          onChange={(e) => setParam(e.target.value.trim())}         className="w-full p-2 border rounded"
          required
        />
        <textarea
          placeholder="XSS Payload"
          value={payload}
          onChange={(e) => setPayload(e.target.value.trim())}         className="w-full p-2 border rounded"
          rows={4}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? 'Testing...' : 'Test Payload'}
        </button>
      </form>

      {result && (
        <div className="bg-gray-100 p-4 rounded mt-4 max-w-7xl">
          <h2 className="font-semibold">Test Result</h2>
          <pre className=" mt-2 text-sm max-w-2xl whitespace-pre-wrap break-words">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

