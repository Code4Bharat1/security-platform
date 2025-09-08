"use client";
import { useState } from 'react';

export default function SubdomainScanner() {
  const [domain, setDomain] = useState('');
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatDate = (iso) => {
    if (!iso) return '-';
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  const formatDuration = (ms) => {
    if (ms === 0) return '0 ms';
    if (!ms && ms !== 0) return '-';
    if (ms < 1000) return `${ms} ms`;
    const sec = ms / 1000;
    if (sec < 60) return `${sec.toFixed(2)} s`;
    const m = Math.floor(sec / 60);
    const s = (sec % 60).toFixed(2);
    return `${m}m ${s}s`;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setResults([]);
    setStats(null);

    const cleanDomain = domain.trim().toLowerCase();
    if (!cleanDomain) {
      setError('Please enter a domain.');
      setLoading(false);
      return;
    }

    // Simulated API call for demo purposes
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResults = [
        { subdomain: `www.${cleanDomain}` },
        { subdomain: `mail.${cleanDomain}` },
        { subdomain: `ftp.${cleanDomain}` },
        { subdomain: `admin.${cleanDomain}` },
        { subdomain: `api.${cleanDomain}` }
      ];
      
      setResults(mockResults);
      setStats({
        total: mockResults.length,
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        durationMs: 2000,
      });
    } catch (err) {
      setError('Failed to fetch subdomains.');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    alert('PDF download functionality would be implemented here');
  };

  const handleSubdomainClick = (subdomain) => {
    window.open(`https://${subdomain}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 rounded-full border-4 border-red-500 overflow-hidden flex items-center justify-center bg-gray-800">
            {/* Replace this src with your logo path */}
            <img
              src="/RedTeam/subdomain.png"
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Subdomain Scanner</h1>
            <p className="text-gray-400 text-lg">
              Scan websites for analyzing subdomains and their security posture.
            </p>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-gray-900 border border-white-700 rounded-lg p-6">
          <div className="mb-6">
            <label className="block text-red-400 text-lg font-semibold mb-4">
              Subdomain
            </label>
            <input
              type="text"
              placeholder="Enter domain (e.g., example.com)"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full p-4 bg-white text-black rounded-lg text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-lg text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Scanning...' : 'Find Subdomains'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-900/50 border border-red-500 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="mt-6 bg-gray-900 border border-white-700 rounded-lg p-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total subdomains</p>
                <p className="text-white text-2xl font-bold">{stats.total ?? '-'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Scan duration</p>
                <p className="text-white text-2xl font-bold">{formatDuration(stats.durationMs)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-400 text-sm mb-1">Starting time</p>
                <p className="text-white font-medium">{formatDate(stats.startedAt)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-400 text-sm mb-1">Finish time</p>
                <p className="text-white font-medium">{formatDate(stats.finishedAt)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4 text-white">Results</h3>
            <div className="bg-gray-900 border border-white-700 rounded-lg p-4 max-h-80 overflow-auto">
              <ul className="space-y-2">
                {results.map(({ subdomain }, idx) => (
                  <li key={idx}>
                    <button
                      onClick={() => handleSubdomainClick(subdomain)}
                      className="text-blue-400 hover:text-blue-300 hover:underline break-all text-left"
                    >
                      {subdomain}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={downloadPDF}
              className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Download PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
