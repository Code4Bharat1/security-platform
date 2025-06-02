'use client';

import { useState } from 'react';

export default function OpenRedirectTester() {
  const [inputUrl, setInputUrl] = useState('');
  const [paramName, setParamName] = useState('redirect');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleTest(e) {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!inputUrl) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/openRedirectTester', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inputUrl, paramName }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Error testing URL');
      }
    } catch (err) {
      setError(err.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Open Redirect Tester</h1>
      <form onSubmit={handleTest} className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold" htmlFor="url">
            URL to Test
          </label>
          <input
            id="url"
            type="url"
            placeholder="https://victim.com/login?redirect=https://evil.com"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold" htmlFor="paramName">
            Redirect Parameter Name
          </label>
          <input
            id="paramName"
            type="text"
            placeholder="redirect"
            value={paramName}
            onChange={(e) => setParamName(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          <small className="text-gray-500">Common names: redirect, url, next, dest</small>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Open Redirect'}
        </button>
      </form>

      {error && <p className="mt-4 text-red-600">{error}</p>}

      {result && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <p>
            <strong>Original URL:</strong> {result.originalUrl}
          </p>
          <p>
            <strong>Tested URL:</strong> {result.testedUrl}
          </p>
          <p>
            <strong>Final URL after redirects:</strong> {result.finalUrl}
          </p>
          <p>
            <strong>Original Domain:</strong> {result.originalDomain}
          </p>
          <p>
            <strong>Final Domain:</strong> {result.finalDomain}
          </p>
          <p className={`font-semibold mt-2 ${result.vulnerable ? 'text-red-600' : 'text-green-600'}`}>
            {result.vulnerable ? '⚠️ Vulnerable to Open Redirect!' : '✅ Not Vulnerable'}
          </p>
        </div>
      )}
    </div>
  );
}

