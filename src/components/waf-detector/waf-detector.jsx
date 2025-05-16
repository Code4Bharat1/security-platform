'use client';

import { useState } from 'react';

export default function WAFDetectorPage() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const detectWAF = async () => {
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/detect-waf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      setResult(data.message || 'No result');
    } catch (err) {
      setResult('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

 return (
  <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <div className="bg-white p-8 rounded-2xl shadow-xl w-5xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        🔍 WAF Detector Tool
      </h1>
      
      <input
        type="text"
        placeholder="Enter website URL (e.g., https://example.com)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
      />

      <button
        onClick={detectWAF}
        disabled={loading}
        className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors duration-200 ${
          loading
            ? 'bg-gray-400 text-white cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {loading ? 'Detecting...' : 'Detect WAF'}
      </button>

      <div className="mt-6">
        <h2 className="text-md font-semibold text-gray-700 mb-2">Result:</h2>
        <p className="text-gray-800 whitespace-pre-wrap">{result}</p>
      </div>
    </div>
  </div>
);

}



