'use client';
import { useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const dnsTypeMap = { 1: 'A', 28: 'AAAA', 15: 'MX', 16: 'TXT', 2: 'NS' };
const getTypeName = (n) => dnsTypeMap[n] || `Type ${n}`;
const RECORD_TYPES = ['A', 'AAAA', 'MX', 'TXT', 'NS'];

export default function Webrecon() {
  const [domain, setDomain] = useState('');
  const [recordType, setRecordType] = useState('A');
  const [result, setResult] = useState(null);       // For simple DNS lookup
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Deep scan state
  const [scan, setScan] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState('');

  const API_BASE = useMemo(() => {
    return process.env.NEXT_PUBLIC_PROD_API_URL?.replace(/\/+$/, '') || '';
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
      const res = await fetch(`${API_BASE}/dns/dns/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: target, type: recordType }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || `Request failed (${res.status})`);
      setResult(data.data);
    } catch (e) {
      setError(e?.message || 'Error fetching DNS data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Website Recon Tool</h1>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="Enter domain (e.g., example.com)"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="border px-3 py-2 w-full rounded"
        />
        <select
          value={recordType}
          onChange={(e) => setRecordType(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          {RECORD_TYPES.map((rt) => (
            <option key={rt} value={rt}>{rt}</option>
          ))}
        </select>
        <button
          onClick={handleLookup}
          disabled={loading}
          className={`min-w-[120px] text-white px-4 py-2 rounded ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? 'Looking up…' : 'DNS Lookup'}
        </button>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* Simple DNS result */}
      {result && (
        <div className="mt-4 bg-gray-50 p-4 rounded border">
          {Array.isArray(result.Answer) && result.Answer.length > 0 && (
            <ul className="list-disc list-inside">
              {result.Answer.map((rec, i) => (
                <li key={i} className="mb-2">
                  <div><span className="font-semibold">Name:</span> {rec.name}</div>
                  <div><span className="font-semibold">Type:</span> {getTypeName(rec.type)}</div>
                  <div><span className="font-semibold">TTL:</span> {rec.TTL}s</div>
                  <div><span className="font-semibold">Data:</span> {rec.data}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <hr className="my-6" />

      {/* Deep Scan */}
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-lg font-semibold">Deep Scan (WHOIS, SSL, Tech, GeoIP, DNS)</h2>
        <button
          onClick={handleDeepScan}
          disabled={scanLoading}
          className={`ml-auto min-w-[140px] text-white px-4 py-2 rounded ${scanLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {scanLoading ? 'Scanning…' : 'Run Deep Scan'}
        </button>
      </div>
      {scanError && <p className="text-red-600 mb-3">{scanError}</p>}

      {scan && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded border">
            <div className="text-sm text-gray-500 mb-2">Scanned URL: {scan.urlUsed || '-'}</div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-1">WHOIS</h3>
                <div>Registrar: <span className="font-mono">{scan.whois?.registrar || '-'}</span></div>
                <div>Created: <span className="font-mono">{scan.whois?.created || '-'}</span></div>
                <div>Expiry: <span className="font-mono">{scan.whois?.expires || '-'}</span></div>
              </div>
              <div>
                <h3 className="font-semibold mb-1">SSL / TLS</h3>
                <div>Issuer: <span className="font-mono">{scan.ssl?.issuer || '-'}</span></div>
                <div>Valid Till: <span className="font-mono">{scan.ssl?.validTo || '-'}</span></div>
                <div>TLS Version: <span className="font-mono">{scan.ssl?.protocol || '-'}</span></div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded border">
            <h3 className="font-semibold mb-1">Technologies Detected</h3>
            <div className="flex flex-wrap gap-6">
              <div>
                <div className="text-sm text-gray-600 mb-1">Frontend</div>
                <ul className="list-disc list-inside">
                  {(scan.technologies?.frontend || []).map((t, i) => <li key={i}>{t}</li>)}
                  {!(scan.technologies?.frontend || []).length && <li className="text-gray-500">-</li>}
                </ul>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Backend</div>
                <ul className="list-disc list-inside">
                  {(scan.technologies?.backend || []).map((t, i) => <li key={i}>{t}</li>)}
                  {!(scan.technologies?.backend || []).length && <li className="text-gray-500">-</li>}
                </ul>
              </div>
            </div>
            <details className="mt-2">
              <summary className="cursor-pointer text-sm text-gray-600">Response Headers</summary>
              <pre className="text-xs mt-2 bg-white p-2 border rounded overflow-x-auto">
                {JSON.stringify(scan.technologies?.headers || {}, null, 2)}
              </pre>
            </details>
          </div>

          <div className="bg-gray-50 p-4 rounded border">
            <h3 className="font-semibold mb-1">Geo-IP</h3>
            <div>IP: <span className="font-mono">{scan.geoip?.ip || '-'}</span></div>
            <div>Location: {scan.geoip?.country || '-'}{scan.geoip?.region ? ` (${scan.geoip.region})` : ''}{scan.geoip?.city ? ` – ${scan.geoip.city}` : ''}</div>
            <div>ISP: {scan.geoip?.isp || '-'}</div>
          </div>

          <div className="bg-gray-50 p-4 rounded border">
            <h3 className="font-semibold mb-2">DNS (A/AAAA/MX/TXT/NS)</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {['A','AAAA','MX','TXT','NS'].map((k) => (
                <div key={k}>
                  <div className="font-medium">{k}</div>
                  <ul className="list-disc list-inside">
                    {(scan.dns?.[k]?.Answer || []).map((rec, i) => (
                      <li key={i} className="text-sm">
                        {rec.name} • {getTypeName(rec.type)} • {rec.TTL}s • {rec.data}
                      </li>
                    ))}
                    {!((scan.dns?.[k]?.Answer || []).length) && <li className="text-sm text-gray-500">-</li>}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={downloadCSV} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Download CSV</button>
            <button onClick={downloadPDF} className="bg-rose-600 text-white px-4 py-2 rounded hover:bg-rose-700">Download PDF</button>
          </div>
        </div>
      )}
    </main>
  );
}
