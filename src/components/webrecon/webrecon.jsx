"use client";
import { useMemo, useState } from 'react';

const dnsTypeMap = { 1: 'A', 28: 'AAAA', 15: 'MX', 16: 'TXT', 2: 'NS' };
const getTypeName = (n) => dnsTypeMap[n] || `Type ${n}`;
const RECORD_TYPES = ['A', 'AAAA', 'MX', 'TXT', 'NS'];

export default function Webrecon() {
  const [domain, setDomain] = useState('');
  const [recordType, setRecordType] = useState('A');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Deep scan state
  const [scan, setScan] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState('');

  const API_BASE = useMemo(() => {
    return (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_PROD_API_URL?.replace(/\/+$/, '')) || '';
  }, []);

  const normalizeDomain = (d) => String(d).trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '');

  const handleLookup = async () => {
    setError('');
    setResult(null);

    const target = normalizeDomain(domain);
    if (!target) {
      setError('Please enter a domain');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockResult = {
        Answer: [
          {
            name: target,
            type: recordType === 'A' ? 1 : recordType === 'AAAA' ? 28 : recordType === 'MX' ? 15 : recordType === 'TXT' ? 16 : 2,
            TTL: 300,
            data: recordType === 'A' ? '93.184.216.34' :
                  recordType === 'AAAA' ? '2606:2800:220:1:248:1893:25c8:1946' :
                  recordType === 'MX' ? '10 mail.example.com' :
                  recordType === 'TXT' ? 'v=spf1 include:_spf.example.com ~all' :
                  'ns1.example.com'
          }
        ]
      };
      setResult(mockResult);
    } catch (e) {
      setError(e?.message || 'Error fetching DNS data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeepScan = async () => {
    setScanError('');
    setScan(null);

    const target = normalizeDomain(domain);
    if (!target) {
      setScanError('Please enter a domain');
      return;
    }

    setScanLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      const mockScan = {
        urlUsed: `https://${target}`,
        whois: {
          registrar: 'Example Registrar Inc.',
          created: '1995-08-14',
          expires: '2025-08-13'
        },
        ssl: {
          issuer: 'DigiCert Inc',
          validTo: '2024-12-31',
          protocol: 'TLSv1.3'
        },
        technologies: {
          frontend: ['React', 'Next.js'],
          backend: ['Node.js', 'Express'],
          headers: {
            'Server': 'nginx/1.18.0',
            'X-Powered-By': 'Next.js',
            'Content-Type': 'text/html'
          }
        },
        geoip: {
          ip: '93.184.216.34',
          country: 'United States',
          region: 'Virginia',
          city: 'Ashburn',
          isp: 'Amazon Technologies Inc.'
        },
        dns: {
          A: { Answer: [{ name: target, type: 1, TTL: 300, data: '93.184.216.34' }] },
          AAAA: { Answer: [{ name: target, type: 28, TTL: 300, data: '2606:2800:220:1:248:1893:25c8:1946' }] },
          MX: { Answer: [{ name: target, type: 15, TTL: 3600, data: '10 mail.example.com' }] },
          TXT: { Answer: [{ name: target, type: 16, TTL: 300, data: 'v=spf1 include:_spf.example.com ~all' }] },
          NS: { Answer: [{ name: target, type: 2, TTL: 3600, data: 'ns1.example.com' }] }
        }
      };
      setScan(mockScan);
    } catch (e) {
      setScanError(e?.message || 'Error running deep scan');
    } finally {
      setScanLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!scan) return;
    const csvContent = [
      'Section,Key,Value',
      `WHOIS,Registrar,${scan.whois?.registrar || '-'}`,
      `WHOIS,Created,${scan.whois?.created || '-'}`,
      `WHOIS,Expires,${scan.whois?.expires || '-'}`,
      `SSL,Issuer,${scan.ssl?.issuer || '-'}`,
      `SSL,Valid Till,${scan.ssl?.validTo || '-'}`,
      `SSL,Protocol,${scan.ssl?.protocol || '-'}`,
      `GeoIP,IP,${scan.geoip?.ip || '-'}`,
      `GeoIP,Country,${scan.geoip?.country || '-'}`,
      `GeoIP,ISP,${scan.geoip?.isp || '-'}`
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'website_recon.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    alert('PDF download functionality would generate a comprehensive recon report');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 bg-gray-800 rounded-full border-4 border-red-500 flex items-center justify-center overflow-hidden">
            <img
              src="/RedTeam/web-recon.png"
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Website Recon Tool</h1>
            <p className="text-gray-400 text-lg">
              Perform an in-depth reconnaissance of a website to identify key metadata, technologies used.
            </p>
          </div>
        </div>

        {/* Main Container */}
        <div className="bg-gray-900 border border-white-700 rounded-lg p-6 mb-6">
          {/* Website Recon Tool Section */}
          <div className="mb-6">
            <h2 className="text-red-400 text-lg font-semibold mb-4">Website Recon Tool</h2>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Enter domain (e.g., example.com)"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="flex-1 bg-gray-800 text-white border border-white-600 rounded px-3 py-2"
              />
              <select
                value={recordType}
                onChange={(e) => setRecordType(e.target.value)}
                className="bg-gray-800 text-white border border-white-600 rounded px-3 py-2"
              >
                {RECORD_TYPES.map((rt) => (
                  <option key={rt} value={rt}>{rt}</option>
                ))}
              </select>
              <button
                onClick={handleLookup}
                disabled={loading}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded border border-white-600 disabled:opacity-50"
              >
                {loading ? 'Looking up...' : 'DNS Lookup'}
              </button>
            </div>

            {error && <p className="text-red-400 mb-4">{error}</p>}

            {/* DNS Results */}
            {result && (
              <div className="bg-gray-800 border border-white-600 rounded p-4 mb-4">
                <h3 className="text-white font-semibold mb-2">DNS Results</h3>
                {Array.isArray(result.Answer) && result.Answer.length > 0 && (
                  <ul className="space-y-2">
                    {result.Answer.map((rec, i) => (
                      <li key={i} className="text-gray-300 text-sm">
                        <div><span className="text-gray-400">Name:</span> {rec.name}</div>
                        <div><span className="text-gray-400">Type:</span> {getTypeName(rec.type)}</div>
                        <div><span className="text-gray-400">TTL:</span> {rec.TTL}s</div>
                        <div><span className="text-gray-400">Data:</span> {rec.data}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Deep Scan Section */}
          <div className="border-t border-white-700 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-gray-300 text-lg">Deep Scan (WHOIS, SSL, Tech, GeoIP, DNS)</h3>
              </div>
              <button
                onClick={handleDeepScan}
                disabled={scanLoading}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {scanLoading ? 'Scanning...' : 'Run Deep Scan'}
              </button>
            </div>

            {scanError && <p className="text-red-400 mb-4">{scanError}</p>}
          </div>
        </div>

        {/* Deep Scan Results */}
        {scan && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-white-700 rounded-lg p-6">
              <div className="text-sm text-gray-400 mb-4">Scanned URL: {scan.urlUsed || '-'}</div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-white font-semibold mb-3">WHOIS</h3>
                  <div className="space-y-1 text-gray-300">
                    <div>Registrar: <span className="font-mono text-gray-400">{scan.whois?.registrar || '-'}</span></div>
                    <div>Created: <span className="font-mono text-gray-400">{scan.whois?.created || '-'}</span></div>
                    <div>Expiry: <span className="font-mono text-gray-400">{scan.whois?.expires || '-'}</span></div>
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-3">SSL / TLS</h3>
                  <div className="space-y-1 text-gray-300">
                    <div>Issuer: <span className="font-mono text-gray-400">{scan.ssl?.issuer || '-'}</span></div>
                    <div>Valid Till: <span className="font-mono text-gray-400">{scan.ssl?.validTo || '-'}</span></div>
                    <div>TLS Version: <span className="font-mono text-gray-400">{scan.ssl?.protocol || '-'}</span></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-white-700 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-3">Technologies Detected</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-400 mb-2">Frontend</div>
                  <ul className="list-disc list-inside text-gray-300">
                    {(scan.technologies?.frontend || []).map((t, i) => <li key={i}>{t}</li>)}
                    {!(scan.technologies?.frontend || []).length && <li className="text-gray-500">-</li>}
                  </ul>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-2">Backend</div>
                  <ul className="list-disc list-inside text-gray-300">
                    {(scan.technologies?.backend || []).map((t, i) => <li key={i}>{t}</li>)}
                    {!(scan.technologies?.backend || []).length && <li className="text-gray-500">-</li>}
                  </ul>
                </div>
              </div>
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-300">Response Headers</summary>
                <pre className="text-xs mt-2 bg-gray-800 text-gray-300 p-3 border border-white-600 rounded overflow-x-auto">
                  {JSON.stringify(scan.technologies?.headers || {}, null, 2)}
                </pre>
              </details>
            </div>

            <div className="bg-gray-900 border border-white-700 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-3">Geo-IP</h3>
              <div className="space-y-1 text-gray-300">
                <div>IP: <span className="font-mono text-gray-400">{scan.geoip?.ip || '-'}</span></div>
                <div>Location: <span className="text-gray-400">{scan.geoip?.country || '-'}{scan.geoip?.region ? ` (${scan.geoip.region})` : ''}{scan.geoip?.city ? ` – ${scan.geoip.city}` : ''}</span></div>
                <div>ISP: <span className="text-gray-400">{scan.geoip?.isp || '-'}</span></div>
              </div>
            </div>

            <div className="bg-gray-900 border border-white-700 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4">DNS (A/AAAA/MX/TXT/NS)</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {['A','AAAA','MX','TXT','NS'].map((k) => (
                  <div key={k}>
                    <div className="text-gray-300 font-medium mb-1">{k}</div>
                    <ul className="list-disc list-inside text-sm">
                      {(scan.dns?.[k]?.Answer || []).map((rec, i) => (
                        <li key={i} className="text-gray-400">
                          {rec.name} • {getTypeName(rec.type)} • {rec.TTL}s • {rec.data}
                        </li>
                      ))}
                      {!((scan.dns?.[k]?.Answer || []).length) && <li className="text-gray-500">-</li>}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={downloadCSV} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
              >
                Download CSV
              </button>
              <button 
                onClick={downloadPDF} 
                className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded"
              >
                Download PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
