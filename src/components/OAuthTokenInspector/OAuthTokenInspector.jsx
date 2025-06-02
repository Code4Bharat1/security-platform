'use client';

import { useState } from 'react';

export default function OAuthTokenInspector() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const analyzeToken = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/oauthTokenInspector', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10 bg-white shadow-2xl rounded-2xl">
      <h1 className="text-3xl font-bold text-blue-700 text-center mb-6">
        OAuth Token Inspector 
      </h1>

      <textarea
        rows={8}
        className="w-full border border-blue-300 focus:ring-2 focus:ring-blue-500 rounded-xl p-4 text-sm font-mono resize-none"
        placeholder="Paste your OAuth access token (JWT)..."
        value={token}
        onChange={(e) => setToken(e.target.value)}
      />

      <button
        onClick={analyzeToken}
        disabled={!token.trim() || loading}
        className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition"
      >
        {loading ? 'Analyzing...' : 'Inspect Token'}
      </button>

      {result && (
        <div className="mt-6 space-y-4">
          {result.error ? (
            <div className="bg-red-100 text-red-800 border border-red-400 p-4 rounded-lg">
              ❌ <strong>Error:</strong> {result.error}
            </div>
          ) : (
            <>
              <div className="bg-green-100 text-green-900 border border-green-400 p-4 rounded-lg">
                <h2 className="font-bold mb-2">📦 Decoded Payload:</h2>
                <pre className="overflow-x-auto text-sm">{JSON.stringify(result.payload, null, 2)}</pre>
              </div>

              {result.issues.length > 0 ? (
                <div className="bg-yellow-100 text-yellow-900 border border-yellow-400 p-4 rounded-lg">
                  <h2 className="font-bold mb-2">⚠️ Security Issues:</h2>
                  <ul className="list-disc pl-5 space-y-1">
                    {result.issues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="bg-blue-100 text-blue-900 border border-blue-300 p-4 rounded-lg">
                  ✅ No major issues found in this token.
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
