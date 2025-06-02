'use client';
import { useState } from 'react';

export default function ClickjackingTester() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [iframeVisible, setIframeVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    setIframeVisible(false);
    setResult(null);
    try {
      const res = await fetch('/api/clickjacking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      setResult(data);
      setIframeVisible(!data.isProtected);
    } catch (err) {
      setResult({ error: 'Something went wrong.' });
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Clickjacking Tester</h1>

      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter target URL (e.g. https://example.com)"
        className="w-full border px-4 py-2 rounded"
      />

      <button
        onClick={handleTest}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? 'Testing...' : 'Test'}
      </button>

      {result && (
        <div className="border rounded p-4 bg-gray-50">
          {result.error ? (
            <p className="text-red-500">{result.error}</p>
          ) : (
            <>
              <p>
                <strong>Clickjacking Protection:</strong>{' '}
                {result.isProtected ? (
                  <span className="text-green-600">✅ Protected</span>
                ) : (
                  <span className="text-red-600">❌ Not Protected</span>
                )}
              </p>

              {result.protectedBy.length > 0 && (
                <ul className="list-disc list-inside mt-2 text-sm">
                  {result.protectedBy.map((line, idx) => (
                    <li key={idx}>{line}</li>
                  ))}
                </ul>
              )}

              {iframeVisible && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-1">This site allowed itself to be embedded:</p>
                  <iframe
                    src={url}
                    width="100%"
                    height="300"
                    className="border"
                    sandbox=""
                    title="Clickjacking Test"
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

