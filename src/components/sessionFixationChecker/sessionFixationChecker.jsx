'use client';

import { useState } from 'react';

export default function SessionFixationChecker() {
  const [code, setCode] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setReport(null);

    try {
      const res = await fetch('/api/sessionFixationChecker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (res.ok) {
        setReport(data.report);
      } else {
        alert(data.error || 'Error analyzing code');
      }
    } catch (e) {
      alert('Network or server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white shadow-md rounded-xl p-8">
      <h1 className="text-3xl font-bold text-center text-teal-700 mb-6 uppercase tracking-wide">
        Session Fixation Checker
      </h1>

      <textarea
        rows={12}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Paste your server-side login/session code here..."
        className="w-full border border-teal-300 rounded-lg p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
      />

      <button
        onClick={handleAnalyze}
        disabled={loading || !code.trim()}
        className={`mt-4 w-full py-3 rounded-lg font-semibold text-white text-lg transition ${
          loading || !code.trim()
            ? 'bg-teal-300 cursor-not-allowed'
            : 'bg-teal-600 hover:bg-teal-700'
        }`}
      >
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>

      {report && (
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold text-teal-700 border-b pb-2">Report:</h2>
          {report.map((item, idx) => {
            const severityColors = {
              high: 'border-red-600 bg-red-50 text-red-800',
              medium: 'border-yellow-500 bg-yellow-50 text-yellow-800',
              low: 'border-green-600 bg-green-50 text-green-800',
            };

            return (
              <div
                key={idx}
                className={`border-l-4 p-4 rounded-md shadow-sm ${severityColors[item.severity.toLowerCase()] || 'border-gray-400 bg-gray-50 text-gray-800'}`}
              >
                <p className="font-semibold mb-1">Severity: {item.severity.toUpperCase()}</p>
                <p className="mb-1">{item.message}</p>
                <p className="italic text-sm text-gray-700">Suggestion: {item.suggestion}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
