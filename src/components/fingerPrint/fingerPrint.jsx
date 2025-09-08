"use client";
import { useMemo, useState } from 'react';

export default function TechnologyFingerprinter() {
  const [url, setUrl] = useState('');
  const [results, setResults] = useState([]);    // array of strings
  const [meta, setMeta] = useState(null);        // { startedAt, finishedAt, durationMs, status, finalUrl, contentLength }
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const formatDate = (iso) => {
    if (!iso) return '-';
    try { return new Date(iso).toLocaleString(); } catch { return String(iso); }
  };
  const formatDuration = (ms) => {
    if (ms === 0) return '0 ms';
    if (!ms && ms !== 0) return '-';
    if (ms < 1000) return `${ms} ms`;
    const s = (ms / 1000);
    if (s < 60) return `${s.toFixed(2)} s`;
    const m = Math.floor(s / 60);
    const sec = (s % 60).toFixed(1);
    return `${m}m ${sec}s`;
  };

  const analyzeTech = async () => {
    setLoading(true);
    setError('');
    setResults([]);
    setMeta(null);

    const targetUrl = url.trim();
    if (!targetUrl) {
      setError('Please enter a URL');
      setLoading(false);
      return;
    }

    try {
      // Simulate API call for demo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock technology detection result
      const mockTechnologies = [
        'Website Builder: Custom HTML/CSS',
        'JavaScript: React 18.2.0',
        'CSS Framework: Tailwind CSS',
        'Analytics / Tag Manager: Google Analytics 4',
        'Hosting / CDN: Cloudflare',
        'Server: nginx/1.18.0',
        'CMS: Next.js 13.4',
        'Payment: Stripe Elements',
        'JavaScript: jQuery 3.6.0',
        'Other: Progressive Web App (PWA)'
      ];
      
      const mockMeta = {
        status: 200,
        durationMs: 1850,
        finalUrl: targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`,
        contentLength: 45678,
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString()
      };
      
      setResults(mockTechnologies);
      setMeta(mockMeta);
    } catch (err) {
      setError('Server error');
    } finally {
      setLoading(false);
    }
  };

  // Quick categorization on the client by keyword
  const categorized = useMemo(() => {
    const buckets = {
      'Website Builder': [],
      'CMS': [],
      'Analytics / Tag Manager': [],
      'Hosting / CDN': [],
      'JavaScript': [],
      'CSS': [],
      'Payments': [],
      'Other': [],
    };
    for (const t of results) {
      const s = t.toLowerCase();
      if (s.includes('website builder')) buckets['Website Builder'].push(t);
      else if (s.startsWith('📝 cms') || s.includes(' cms:') || s.includes('magento') || s.includes('opencart') || s.includes('next.js')) buckets['CMS'].push(t);
      else if (s.includes('analytics') || s.includes('tag manager') || s.includes('pixel')) buckets['Analytics / Tag Manager'].push(t);
      else if (s.includes('hosting') || s.includes('cdn') || s.includes('server') || s.includes('x-powered-by') || s.includes('cloudflare') || s.includes('nginx')) buckets['Hosting / CDN'].push(t);
      else if (s.includes('javascript') || s.includes('react') || s.includes('vue') || s.includes('angular') || s.includes('jquery')) buckets['JavaScript'].push(t);
      else if (s.includes('css framework') || s.includes('tailwind')) buckets['CSS'].push(t);
      else if (s.includes('payment') || s.includes('razorpay') || s.includes('stripe') || s.includes('paypal')) buckets['Payments'].push(t);
      else buckets['Other'].push(t);
    }
    return buckets;
  }, [results]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
  <img
    src="/RedTeam/fingerprint.png" // yahan apni image ka path daaliye
    alt="Technology Fingerprinter Logo"
    className="w-20 h-20 rounded-full border-4 border-red-500 object-cover"
  />
  <div>
    <h1 className="text-3xl font-bold text-white">Technology Fingerprinter</h1>
    <p className="text-gray-400 text-lg">
      Scan websites for analyzing subdomains and their security posture.
    </p>
  </div>
</div>


        {/* Main Form Container */}
        <div className="bg-gray-900 border border-white-700 rounded-lg p-6 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="https://example.com"
              className="flex-1 bg-white-800 text-white border border-white-600 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          
          <div className="flex justify-center mt-4">
            <button
              onClick={analyzeTech}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded border border-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-400 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Meta Information */}
        {meta && (
          <div className="bg-gray-900 border border-white-700 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">HTTP status</p>
                <p className="text-white font-semibold">{meta.status ?? '-'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Scan duration</p>
                <p className="text-white font-semibold">{formatDuration(meta.durationMs)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-400 text-sm mb-1">Final URL</p>
                <p className="text-white font-medium break-all">{meta.finalUrl || '-'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-6">
            {Object.entries(categorized).map(([group, items]) =>
              items.length ? (
                <div key={group} className="bg-gray-900 border border-white-700 rounded-lg p-6">
                  <h3 className="text-white font-semibold text-lg mb-4">{group}</h3>
                  <ul className="space-y-2">
                    {items.map((tech, i) => (
                      <li key={`${group}-${i}`} className="text-gray-300 flex items-start">
                        <span className="text-red-400 mr-2">•</span>
                        <span className="text-sm">{tech}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null
            )}
          </div>
        )}

        {/* No Results Message */}
        {!loading && !error && results.length === 0 && url && meta && (
          <div className="bg-gray-900 border border-white-700 rounded-lg p-6 text-center">
            <p className="text-gray-400">No technologies detected for this website.</p>
          </div>
        )}
      </div>
    </div>
  );
} 