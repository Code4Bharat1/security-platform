'use client';
import { useState } from 'react';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function BrokenAccessControlPage() {
  const [targetUrl, setTargetUrl] = useState('');
  const [authHeader, setAuthHeader] = useState('');
  const [customPaths, setCustomPaths] = useState([]); // start empty
  const [newPath, setNewPath] = useState('');
  const [results, setResults] = useState([]);
const [scanHistory, setScanHistory] = useState([]);

useEffect( () =>{
  const fetchHistory = async () => {
   try{
   const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_API_URL}/broken-access-control/reports`);
   const data = await res.json();
   setScanHistory(data.reports || []);
   }

   catch(err){
    console.error('Failed to load history:', err);
   }
  };

  fetchHistory();
}, []);


  const handleAddPath = () => {
    if (newPath.trim()) {
      setCustomPaths([...customPaths, newPath.trim()]);
      setNewPath('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResults([]);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_API_URL}/broken-access-control/broken-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUrl,
          authHeader,
          customPaths, // send the correct state array
        }),
      });

      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error('Error:', err);
    }
  };

const handleDelete = async (id) => {
  if (!confirm("Are you sure you want to delete this scan report?")) return;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_API_URL}/broken-access-control/delete/${id}`, {
      method: 'DELETE',
    });

    const contentType = res.headers.get('content-type');

    if (!contentType || !contentType.includes('application/json')) {
      const text = await res.text();
      console.error('Expected JSON but got:', text);
      toast.error('Unexpected response from server');
      return;
    }

    const data = await res.json();

    if (res.ok) {
      toast.success('Scan deleted successfully');
      setScanHistory((prev) => prev.filter((scan) => scan._id !== id));
    } else {
      toast.error(data.error || 'Failed to delete scan');
    }
  } catch (err) {
    console.error('Error deleting scan:', err);
    toast.error('Something went wrong while deleting');
  }
};


  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Broken Access Control Tester</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Target URL (e.g., https://example.com)"
          className="w-full p-2 border rounded"
          value={targetUrl}
          onChange={(e) => setTargetUrl(e.target.value.trim())}         required
        />

        <input
          type="text"
          placeholder="Authorization header (optional)"
          className="w-full p-2 border rounded"
          value={authHeader}
          onChange={(e) => setAuthHeader(e.target.value.trim())}       />

        <div>
          <label className="block mb-1">Custom Paths</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="/admin"
              className="p-2 border rounded w-full"
              value={newPath}
              onChange={(e) => setNewPath(e.target.value.trim())}           />
            <button
              type="button"
              onClick={handleAddPath}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Add
            </button>
          </div>
          <ul className="mt-2 list-disc list-inside text-sm text-gray-700">
            {customPaths.map((path, i) => (
              <li key={i}>{path}</li>
            ))}
          </ul>
        </div>

        <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded">
          Run Scan
        </button>
      </form>

      {results.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Scan Results</h2>
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Test</th>
                <th className="border p-2">Status Code</th>
                <th className="border p-2">Sensitive Info</th>
                <th className="border p-2">Result</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className="text-sm">
                  <td className="border p-2">{r.test}</td>
                  <td className="border p-2">{r.statusCode}</td>
                  <td className="border p-2">
                    {r.containsSensitiveInfo ? 'Yes' : 'No'}
                  </td>
                  <td
                    className={`border p-2 font-bold ${
                      r.result.includes('VULNERABLE')
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}
                  >
                    {r.result}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

 {scanHistory.length > 0 && (
  <div className="mt-10">
    <h2 className="text-xl font-semibold mb-4">Scan History (Last 20)</h2>
    <div className="space-y-4">
      {scanHistory.map((scan, i) => (
        <div key={i} className="border p-4 rounded shadow-sm relative">
          <div className="flex justify-between items-center">
            <div>
              <p><strong>Target:</strong> {scan.targetUrl}</p>
              <p><strong>Scanned On:</strong> {new Date(scan.createdAt).toLocaleString()}</p>
            </div>
            <button
              onClick={() => handleDelete(scan._id)}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
            >
              Delete Report
            </button>
          </div>

          <table className="w-full mt-2 border">
            <thead>
              <tr className="bg-gray-200 text-sm">
                <th className="border p-1">Test</th>
                <th className="border p-1">Code</th>
                <th className="border p-1">Sensitive Info</th>
                <th className="border p-1">Result</th>
              </tr>
            </thead>
            <tbody>
              {scan.results.map((r, j) => (
                <tr key={j} className="text-xs">
                  <td className="border p-1">{r.test}</td>
                  <td className="border p-1">{r.statusCode}</td>
                  <td className="border p-1">{r.containsSensitiveInfo ? 'Yes' : 'No'}</td>
                  <td
                    className={`border p-1 font-bold ${
                      r.result.includes('VULNERABLE') ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {r.result}
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
