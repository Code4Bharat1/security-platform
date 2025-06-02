'use client';

import { useState } from 'react';

export default function HttpsCheckerPage() {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleCheck = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/https-enforcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: domain }),
      });

      const data = await res.json();
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Unknown error');
      }
    } catch (err) {
      setError('Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  const renderRecommendations = () => {
    if (!result) return null;

    const recs = [];

    if (!result.httpRedirectsToHttps) {
      recs.push(
        ' The site does NOT redirect HTTP traffic to HTTPS. This can expose users to insecure connections and attacks like man-in-the-middle.'
      );
    }

    if (!result.hstsEnabled) {
      recs.push(
        'The site does NOT have the Strict-Transport-Security (HSTS) header enabled. Without HSTS, browsers won’t remember to always use HTTPS, leaving users vulnerable on their first visit.'
      );
    } else if (result.hstsMaxAge && result.hstsMaxAge < 15768000) {
      // less than 6 months
      recs.push(
        ` The HSTS max-age is set to ${result.hstsMaxAge} seconds, which is less than the recommended 6 months. Consider increasing it for stronger HTTPS enforcement.`
      );
    }

    if (recs.length === 0) {
      recs.push(' HTTPS enforcement looks good! The site redirects HTTP to HTTPS and has HSTS enabled.');
    }

    return (
      <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg border border-yellow-300 dark:border-yellow-700 text-yellow-900 dark:text-yellow-300">
        <h3 className="font-semibold mb-2">Recommendations:</h3>
        <ul className="list-disc list-inside space-y-1">{recs.map((rec, i) => <li key={i}>{rec}</li>)}</ul>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 rounded-2xl shadow-lg bg-white dark:bg-zinc-900 text-gray-800 dark:text-white">
      <h1 className="text-2xl font-bold mb-4">HTTPS Enforcement Checker</h1>

      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Enter domain (e.g., example.com)"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="p-2 rounded-md border dark:border-zinc-700"
        />
        <button
          onClick={handleCheck}
          disabled={loading || !domain}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md"
        >
          {loading ? 'Checking...' : 'Check HTTPS Enforcement'}
        </button>
      </div>

      {error && (
        <div className="mt-4 text-red-500 font-medium">{error}</div>
      )}

      {result && (
        <div className="mt-6 bg-zinc-100 dark:bg-zinc-800 p-4 rounded-xl">
          <h2 className="text-xl font-semibold mb-2">Result for {result.target}</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <span className="font-medium">HTTP redirects to HTTPS:</span>{' '}
              <span className={result.httpRedirectsToHttps ? 'text-green-500' : 'text-red-500'}>
                {result.httpRedirectsToHttps ? 'Yes ' : 'No '}
              </span>
            </li>
            <li>
              <span className="font-medium">HSTS Enabled:</span>{' '}
              <span className={result.hstsEnabled ? 'text-green-500' : 'text-yellow-600'}>
                {result.hstsEnabled ? 'Yes' : 'No '}
              </span>
            </li>
            <li>
              <span className="font-medium">HSTS Max-Age:</span>{' '}
              {result.hstsMaxAge ? `${result.hstsMaxAge} seconds` : 'N/A'}
            </li>
          </ul>

          {renderRecommendations()}
        </div>
      )}
    </div>
  );
}
