'use client';
import { useState, useEffect } from 'react';

export default function SSRFScanner() {
  const [targetUrl, setTargetUrl] = useState('');
  const [results, setResults] = useState([]);
   const [scanHistory, setScanHistory] = useState([]);
   const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch history on load
useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/ssrf-checker/history');
        const data = await res.json();
        setHistory(data.scans || []);
      } catch (err) {
        console.error('Failed to load SSRF scan history', err);
      }
    };

    fetchHistory();
  }, []);
  const fetchHistory = async () => {
    const res = await fetch('http://localhost:5000/api/ssrf-checker/history');
    const data = await res.json();
    setHistory(data.scans || []);
  };

const handleScan = async (e) => {
  e.preventDefault(); // prevent form reload

  try {
    const res = await fetch('http://localhost:5000/api/ssrf-checker/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUrl }),
    });

    const data = await res.json();
    setScanResults(data.results || []);
  } catch (error) {
    console.error('Scan failed:', error.message);
  }
};

const handleDelete = async (id) => {
  try {
    const res = await fetch(`http://localhost:5000/api/ssrf-checker/delete/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      console.log('Deleted successfully');
      setScanHistory(prev => prev.filter(scan => scan._id !== id));
    } else {
      console.error('Failed to delete scan report');
    }
  } catch (err) {
    console.error('Delete request failed:', err.message);
  }
};

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">SSRF Vulnerability Tester</h1>

      <form onSubmit={handleScan} className="space-y-4">
        <input
          type="text"
          placeholder="Enter target URL (e.g., http://example.com)"
          value={targetUrl}
          onChange={(e) => setTargetUrl(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded"
          disabled={loading}
        >
          {loading ? 'Scanning...' : 'Run SSRF Scan'}
        </button>
      </form>

      {results.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Scan Results</h2>
          <table className="w-full border text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-2">Payload</th>
                <th className="border p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i}>
                  <td className="border p-2">{r.payload}</td>
                  <td className={`border p-2 ${r.vulnerable ? 'text-red-600' : 'text-green-600'}`}>
  {r.vulnerable ? 'VULNERABLE' : 'SAFE'}
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
{scanHistory.length > 0 && (
  <div className="mt-10">
    <h2 className="text-xl font-semibold mb-4">SSRF Scan History (Last 20)</h2>
    <div className="space-y-4">
      {scanHistory.map((scan, i) => (
        <div key={i} className="border p-4 rounded shadow-sm relative">
          <p><strong>Target:</strong> {scan.targetUrl}</p>
          <p><strong>Scanned On:</strong> {new Date(scan.createdAt).toLocaleString()}</p>
      <button onClick={() => handleDelete(scan._id)} className="text-red-600 hover:underline text-sm mt-2">
  Delete
</button>

          <table className="w-full mt-2 border">
            <thead>
              <tr className="bg-gray-200 text-sm">
                <th className="border p-1">Payload</th>
                <th className="border p-1">Status</th>
                <th className="border p-1">Body Snippet</th>
                <th className="border p-1">Vulnerability</th>
              </tr>
            </thead>
            <tbody>
              {scan.results.map((r, j) => (
                <tr key={j} className="text-xs">
                  <td className="border p-1">{r.payload}</td>
                  <td className={`border p-1 ${r.statusCode === 200 || r.vulnerable ? 'text-red-600' : 'text-green-600'}`}>
                    {r.statusCode || 'N/A'}
                  </td>
                  <td className="border p-1">{r.bodySnippet?.slice(0, 100) || 'No content'}</td>
                  <td className={`border p-1 font-bold ${r.vulnerable ? 'text-red-600' : 'text-green-600'}`}>
                    {r.vulnerable ? 'VULNERABLE' : 'SAFE'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  </div>
)}
</div>
  );
}
