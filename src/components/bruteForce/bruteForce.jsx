'use client';
import { useState } from 'react';

export default function DirectoryBruteForcer() {
  const [target, setTarget] = useState('https://example.com');
  const [recursive, setRecursive] = useState(true);
  const [results, setResults] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);

  const startScan = async () => {
    const cleanTarget = target.trim();
    if (!cleanTarget) return;
    setLoading(true);
    setResults([]);
    setMeta(null);

    try {
      // Simulating API call since we can't make actual requests
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock response
      const mockResults = [
        { path: '/admin', status: '200', result: 'Found' },
        { path: '/login', status: '200', result: 'Found' },
        { path: '/backup', status: '404', result: 'Not Found' },
        { path: '/config', status: '403', result: 'Forbidden' },
        { path: '/uploads', status: '200', result: 'Found' }
      ];
      
      const mockMeta = {
        recursive: recursive,
        totalRequests: 150,
        durationMs: 2340
      };
      
      setResults(mockResults);
      setMeta(mockMeta);
    } catch (err) {
      setResults([{ path: '-', status: '-', result: '⚠️ Scan failed' }]);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (ms) => {
    if (ms === 0) return '0 ms';
    if (!ms && ms !== 0) return '-';
    if (ms < 1000) return `${ms} ms`;
    const s = ms / 1000;
    if (s < 60) return `${s.toFixed(2)} s`;
    const m = Math.floor(s / 60);
    const r = (s % 60).toFixed(1);
    return `${m}m ${r}s`;
  };

  const downloadPDF = () => {
    // Mock PDF download
    const element = document.createElement('a');
    const file = new Blob(['Directory Brute Force Results'], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'directory-brute-force-results.pdf';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const viewFoundSite = (path) => {
    window.open(`${target}${path}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
       {/* Header */}
<div className="flex items-center gap-4 mb-8">
  <img
    src="/RedTeam/brute-force.png" // apni image ka path yahan daaliye
    alt="Brute Force Scanner Logo"
    className="w-20 h-20 rounded-full border-2 border-red-600 object-cover"
  />
  <div>
    <h1 className="text-2xl font-bold text-white">Brute Force Scanner</h1>
    <p className="text-gray-300 text-sm">
      Run an OWASP ZAP-powered automated security<br />
      scan to detect vulnerabilities.
    </p>
  </div>
</div>


        {/* Tool Selection */}
        <div className="mb-6">
          <button className="px-4 py-2 border-2 border-white text-white bg-transparent rounded text-sm">
            Directory / File Brute Forcer
          </button>
        </div>

        {/* Input Section */}
        <div className="mb-6 space-y-4">
          <input
            type="text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full p-4 bg-black border-2 border-white rounded-full text-white placeholder-gray-400 text-center"
            placeholder="https://example.com"
          />
          
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-white">
              <input
                type="checkbox"
                checked={recursive}
                onChange={(e) => setRecursive(e.target.checked)}
                className="w-4 h-4 accent-white"
              />
              <span>Recursive</span>
            </label>

            <button
  onClick={startScan}
  className="px-6 py-2 border-2 border-red-600 text-white bg-red-600 rounded hover:bg-red-700 hover:border-red-700 transition-colors disabled:opacity-60"
  disabled={loading}
>
  {loading ? 'Scanning...' : 'Start Scan'}
</button>

          </div>
        </div>

        {/* Meta Information */}
        {meta && (
          <div className="mb-6 border-2 border-white rounded p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-gray-400 text-sm">Recursive</p>
                <p className="font-semibold text-white">{meta.recursive ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Requests sent</p>
                <p className="font-semibold text-white">{meta.totalRequests ?? '-'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Duration</p>
                <p className="font-semibold text-white">{formatDuration(meta.durationMs)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div>
            <button
              onClick={downloadPDF}
              className="w-full mb-4 px-6 py-3 border-2 border-white text-white bg-transparent rounded hover:bg-white hover:text-black transition-colors"
            >
              Download PDF
            </button>

            <div className="border-2 border-white rounded overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left border-b border-white">Path</th>
                    <th className="px-4 py-3 text-left border-b border-white">Status</th>
                    <th className="px-4 py-3 text-left border-b border-white">Result</th>
                    <th className="px-4 py-3 text-left border-b border-white">View Site</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((item, i) => (
                    <tr key={i} className={`${i !== results.length - 1 ? 'border-b border-white' : ''}`}>
                      <td className="px-4 py-3">{item.path}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          item.status === '200' ? 'bg-green-600 text-white' :
                          item.status === '403' ? 'bg-yellow-600 text-white' :
                          item.status === '404' ? 'bg-red-600 text-white' :
                          'bg-gray-600 text-white'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">{item.result}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => viewFoundSite(item.path)}
                          className="text-blue-400 hover:text-blue-300 hover:underline"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}