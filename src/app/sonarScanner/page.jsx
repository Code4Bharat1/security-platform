'use client'
import Navbar from '@/components/layout/navbar';
import AnalysisResult from '@/components/sonarScanner/sonarScanner';
import { useState } from 'react';

export default function CodeForm() {
  const [code, setCode] = useState('');
  const [results, setResults] = useState([]);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!code.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/analyzeCode', {
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
        // optionally handle error display here
      }
    } catch (err) {
      setResults([]);
      setIsAnalyzed(true);
      // optionally handle error display here
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="p-6 max-w-3xl mx-auto">
        <textarea
          className="w-full border p-3 mb-4"
          rows={10}
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setIsAnalyzed(false);
            setResults([]);
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

        {isAnalyzed && <AnalysisResult results={results} code={code} />}
      </div>
    </div>
  );
}
