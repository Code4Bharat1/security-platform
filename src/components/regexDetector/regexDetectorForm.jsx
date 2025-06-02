'use client';
import { useState } from 'react';

export default function RegexDetector() {
  const [code, setCode] = useState(`const userInput = getInput();
const regex = new RegExp(userInput); // ⚠️ Unescaped input`);
  const [results, setResults] = useState([]);
  const [fixes, setFixes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('results'); // 'results' or 'fixes'

  const getSeverity = (risk) => {
    if (risk.includes('ReDoS')) return 'high';
    if (risk.includes('Unescaped') || risk.includes('Template')) return 'medium';
    return 'low';
  };

  const severityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-blue-100 text-blue-800',
  };

  const scanCode = async () => {
    setLoading(true);
    setActiveTab('results'); // Switch to results tab on scan
    try {
      const res = await fetch('/api/regexInjectionDetector', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      setResults(data.issues || []);
      setFixes(data.fixes || []);
    } catch (error) {
      console.error('Error scanning code:', error);
      setResults([]);
      setFixes([]);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold"> Regex Injection Detector</h1>

      {/* File Upload */}
     <>
  <input
    type="file"
    accept=".js,.txt"
    id="file-upload"
    className="hidden"
    onChange={(e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => setCode(e.target.result);
      reader.readAsText(file);
    }}
  />
  <label
    htmlFor="file-upload"
    className="inline-block cursor-pointer bg-black text-white px-4 py-2 rounded hover:bg-gray-800 mb-4 select-none"
  >
     Choose File
  </label>
</>


      {/* Code Textarea */}
      <textarea
        rows={10}
        className="w-full p-3 rounded-lg border border-gray-300 font-mono"
        placeholder="Paste your JavaScript code here..."
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      {/* Scan Button */}
      <button
        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={scanCode}
        disabled={loading}
      >
        {loading ? 'Scanning...' : '🔍 Scan Code'}
      </button>

      {/* Tabs */}
      <div className="flex space-x-2 mt-4">
        <button
          className={`px-3 py-1 rounded ${
            activeTab === 'results' ? 'bg-black text-white' : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('results')}
        >
           Issues
        </button>
        <button
          className={`px-3 py-1 rounded ${
            activeTab === 'fixes' ? 'bg-black text-white' : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('fixes')}
        >
           Auto-fix Preview
        </button>
      </div>

      {/* Results Tab */}
      {activeTab === 'results' && results.length > 0 && (
        <div className="mt-6 space-y-4">
          <h2 className="text-xl font-semibold"> Issues Found: {results.length}</h2>
          {results.map((issue, idx) => {
            const severity = getSeverity(issue.risk);
            return (
              <div
                key={idx}
                className={`p-4 rounded-lg shadow border-l-4 ${
                  severity === 'high'
                    ? 'border-red-500'
                    : severity === 'medium'
                    ? 'border-yellow-500'
                    : 'border-blue-500'
                }`}
              >
                <div
                  className={`inline-block px-2 py-1 rounded text-sm mb-2 ${
                    severityColors[severity]
                  }`}
                >
                  {severity.toUpperCase()}
                </div>
                <p>
                  <strong> Line {issue.line}:</strong>{' '}
                  <code className="bg-gray-100 px-1 py-0.5 rounded">{issue.pattern}</code>
                </p>
                <p>
                  <strong> Risk:</strong> {issue.risk}
                </p>
               {issue.risk.includes('Unescaped') && (
  <p className="text-sm text-gray-600 mt-2">
     Suggestion: Escape user input using:
    <br />
    <code className="bg-gray-200 px-1 py-0.5 rounded">
      {'input.replace(/[.*+?^${}()|[\\]\\\\]/g, \'\\\\$&\')'}
    </code>
  </p>
)}

              </div>
            );
          })}
        </div>
      )}

      {/* Auto-fix Preview Tab */}
      {activeTab === 'fixes' && fixes.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold"> Suggested Fixes</h2>
          <pre className="mt-2 bg-gray-100 p-4 rounded overflow-x-auto text-sm whitespace-pre-wrap">
            {fixes.join('\n')}
          </pre>
        </div>
      )}

      {/* Show message if no results/fixes */}
      {activeTab === 'results' && !loading && results.length === 0 && (
        <p className="mt-4 text-gray-500">No issues found or scan not performed yet.</p>
      )}
      {activeTab === 'fixes' && !loading && fixes.length === 0 && (
        <p className="mt-4 text-gray-500">No auto-fixes available.</p>
      )}
    </div>
  );
}
