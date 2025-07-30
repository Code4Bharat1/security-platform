'use client';

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
 // Keep your Navbar separately

export default function SonarScanner() {
  const [code, setCode] = useState('');
  const [results, setResults] = useState([]);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedLine, setSelectedLine] = useState(null);

  const handleSubmit = async () => {
    if (!code.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_API_URL}/analyzeCode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (res.ok) {
        const data = await res.json();
        setResults(data.issues || []);
        setIsAnalyzed(true);
      } else {
        setResults([]);
        setIsAnalyzed(true);
      }
    } catch (err) {
      setResults([]);
      setIsAnalyzed(true);
    } finally {
      setLoading(false);
    }
  };

  const previewLine = (lineNumber) => {
    setSelectedLine(lineNumber === selectedLine ? null : lineNumber);
  };

  return (
    <div>
  
      <div className="p-6 max-w-3xl mx-auto">
        <textarea
          className="w-full border p-3 mb-4"
          rows={10}
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setIsAnalyzed(false);
            setResults([]);
            setSelectedLine(null);
          }}
          placeholder="Paste your code here..."
        />
        <button
          disabled={loading || !code.trim()}
          className={`px-4 py-2 rounded text-white ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600'
          }`}
          onClick={handleSubmit}
        >
          {loading ? 'Analyzing...' : 'Analyze Code'}
        </button>

        {isAnalyzed && (
          <div className="mt-6">
            <div className="mb-4 text-sm text-gray-800">
              <p><strong>Total Issues:</strong> {results.length}</p>
              <p><strong>Errors:</strong> {results.filter(i => i.severity === 'error').length}</p>
              <p><strong>Warnings:</strong> {results.filter(i => i.severity === 'warning').length}</p>
            </div>

            {results.length === 0 ? (
              <p className="text-green-600 font-semibold">No issues found! Your code looks clean.</p>
            ) : (
              <>
                <table className="w-full border-collapse border border-gray-700" aria-label="Static code analysis results">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-700 px-4 py-2">Line</th>
                      <th className="border border-gray-700 px-4 py-2">Issue</th>
                      <th className="border border-gray-700 px-4 py-2">Rule</th>
                      <th className="border border-gray-700 px-4 py-2">Severity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((issue, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td
                          className="border border-gray-700 px-4 py-2 cursor-pointer text-blue-600 hover:underline"
                          onClick={() => previewLine(issue.line)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={e => e.key === "Enter" && previewLine(issue.line)}
                        >
                          {issue.line}
                        </td>
                        <td className="border border-gray-700 px-4 py-2">{issue.message}</td>
                        <td className="border border-gray-700 px-4 py-2">{issue.ruleId || 'N/A'}</td>
                        <td
                          className={`border px-4 py-2 ${
                            issue.severity === 'error'
                              ? 'text-red-600'
                              : issue.severity === 'warning'
                              ? 'text-yellow-600'
                              : 'text-gray-600'
                          }`}
                        >
                          {issue.severity || 'info'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {selectedLine && (
                  <div className="mt-6">
                    <h4 className="text-md font-semibold mb-2">Code Preview (Line {selectedLine}):</h4>
                    <div className="rounded-md overflow-auto text-sm border border-gray-300">
                      <SyntaxHighlighter
                        language="javascript"
                        style={oneDark}
                        showLineNumbers
                        wrapLines
                        lineProps={(lineNumber) =>
                          lineNumber === selectedLine
                            ? { style: { backgroundColor: 'rgba(255, 255, 0, 0.2)' } }
                            : {}
                        }
                      >
                        {code}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
