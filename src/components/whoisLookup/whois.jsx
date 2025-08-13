'use client';

import { useMemo, useRef, useState } from 'react';
import { Shield, Globe, AlertTriangle, CheckCircle, XCircle, Clock, Server, FileDown, Download, Database, Building, Lock } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';

import html2canvas from 'html2canvas';

const hostingerLogo = 'https://logo.clearbit.com/hostinger.com'; // optional (or store locally)

const ccToFlag = (cc) => {
  if (!cc) return '';
  // emoji flag from country code
  return cc
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt()));
};

const formatDate = (iso) => (iso ? new Date(iso).toLocaleString() : '—');

const daysToHumanAge = (days) => {
  if (days == null) return '—';
  if (days < 31) return `${days} days`;
  const months = Math.floor(days / 30.44);
  if (months < 24) return `${months} month${months === 1 ? '' : 's'}`;
  const years = Math.floor(days / 365.25);
  return `${years} year${years === 1 ? '' : 's'}`;
};

const badge = (text, color) => (
  <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-semibold ${color}`}>
    {text}
  </span>
);

export default function WhoisLookup() {
  const [domain, setDomain] = useState('');
  const [result, setResult] = useState(null); // { ok, summary, raw }
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const cardRef = useRef(null);

  const handleLookup = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    const v = domain.trim();
    if (!v) return setError('Please enter a domain name.');
    if (v.includes('http://') || v.includes('https://')) return setError('Enter domain name only (no http/https).');

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_API_URL}/whois/whois-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: v }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error || 'Failed to fetch WHOIS data.');
      else setResult(json);
    } catch (err) {
      setError('Network error: ' + err.message);
    }
    setLoading(false);
  };

  const summary = result?.summary;
  const statusBadges = useMemo(() => {
    if (!summary?.statuses?.length) return null;
    return summary.statuses.map((s, i) => {
      const lower = s.toLowerCase();
      if (lower.includes('clienttransferprohibited') || lower.includes('servertransferprohibited')) {
        return <span key={i} className="inline-block mr-2">{badge(`${s} 🔒`, 'bg-orange-100 text-orange-700')}</span>;
      }
      if (lower.includes('ok')) return <span key={i} className="inline-block mr-2">{badge(s, 'bg-green-100 text-green-700')}</span>;
      return <span key={i} className="inline-block mr-2">{badge(s, 'bg-gray-100 text-gray-700')}</span>;
    });
  }, [summary]);

  const expiryBadge = useMemo(() => {
    if (summary?.daysUntilExpiry == null) return null;
    const d = summary.daysUntilExpiry;
    if (d < 0) return badge(`Expired ${Math.abs(d)} days ago`, 'bg-red-100 text-red-700');
    if (d < 30) return badge(`Expires in ${d} days`, 'bg-red-100 text-red-700');
    if (d < 90) return badge(`Expires in ${d} days`, 'bg-yellow-100 text-yellow-700');
    return badge(`Expires in ${d} days`, 'bg-green-100 text-green-700');
  }, [summary]);

  const dnssecBadge = summary?.dnssecSigned
    ? <span className="inline-flex items-center gap-1 text-sm">{badge('DNSSEC: Signed', 'bg-green-100 text-green-700')} <Shield className="h-4 w-4" /></span>
    : <span className="inline-flex items-center gap-1 text-sm">{badge('DNSSEC: Unsigned', 'bg-red-100 text-red-700')} <Shield className="h-4 w-4" /></span>;

  const blacklistBadge = (() => {
    const vt = summary?.threatIntel?.virusTotal;
    const gsb = summary?.threatIntel?.googleSafeBrowsing;
    const vtOk = vt?.available ? vt?.clean === true : null;
    const gsbOk = gsb?.available ? gsb?.clean === true : null;
    // Prefer worst-case
    const anyBad = (vtOk === false) || (gsbOk === false);
    if (anyBad) return <span className="inline-flex items-center gap-1">{badge('Blacklist: Issues found', 'bg-red-100 text-red-700')} <AlertTriangle className="h-4 w-4" /></span>;
    if (vtOk === null && gsbOk === null) return <span className="inline-flex items-center gap-1">{badge('Blacklist: Not checked', 'bg-gray-100 text-gray-700')} <Database className="h-4 w-4" /></span>;
    return <span className="inline-flex items-center gap-1">{badge('Blacklist: Clean', 'bg-green-100 text-green-700')} <CheckCircle className="h-4 w-4" /></span>;
  })();

  const registrarChip = (() => {
    const r = summary?.registrar || '—';
    const geo = summary?.registrarGeo;
    const flag = geo?.cc ? ccToFlag(geo.cc) : '';
    const showHostingerIcon = /hostinger/i.test(r);
    return (
      <div className="flex items-center gap-2">
        {showHostingerIcon && <img src={hostingerLogo} alt="Hostinger" className="h-5 w-5 rounded-sm" />}
        <span className="font-medium">{r}</span>
        {geo && <span className="text-sm text-gray-600">({flag} {geo.country})</span>}
      </div>
    );
  })();

  const downloadJSON = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${summary?.domain || 'whois'}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const downloadCSV = () => {
    if (!summary) return;
    const row = {
      domain: summary.domain,
      registrar: summary.registrar || '',
      registrarCountry: summary.registrarGeo?.country || '',
      createdAt: summary.createdAt || '',
      updatedAt: summary.updatedAt || '',
      expiresAt: summary.expiresAt || '',
      domainAgeDays: summary.domainAgeDays ?? '',
      daysUntilExpiry: summary.daysUntilExpiry ?? '',
      privacyProtected: summary.privacyProtected ? 'yes' : 'no',
      dnssecSigned: summary.dnssecSigned ? 'yes' : 'no',
      nameservers: (summary.nameservers || []).join(';'),
      ip: summary.ip || '',
      rDns: summary.rDns || '',
      ipProvider: summary.ipProvider || '',
      statuses: (summary.statuses || []).join(';'),
      vtClean: summary.threatIntel?.virusTotal?.clean ?? '',
      gsbClean: summary.threatIntel?.googleSafeBrowsing?.clean ?? '',
    };
    const headers = Object.keys(row);
    const csv =
      headers.join(',') + '\n' +
      headers.map((k) => String(row[k]).replace(/"/g, '""')).map((v) => `"${v}"`).join(',');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${summary?.domain || 'whois'}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const downloadPDF = async () => {
  if (!cardRef.current) return;

  const node = cardRef.current;

  // Optional: temporarily add a class to simplify styles during capture
  node.classList.add('capture-safe');

  try {
    const dataUrl = await toPng(node, {
      cacheBust: true,
      pixelRatio: 2,
      style: { background: '#ffffff' }, // solid background
      filter: (n) => {
        // Hide cross‑origin images to avoid tainting; show others
        if (n.tagName === 'IMG') {
          try {
            const u = new URL(n.src, window.location.href);
            if (u.origin !== window.location.origin && !n.crossOrigin) return false;
          } catch {
            return false;
          }
        }
        return true;
      },
    });

    const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
    const img = new Image();
    img.src = dataUrl;
    await new Promise((r) => (img.onload = r));

    const pageWidth = pdf.internal.pageSize.getWidth();
    const ratio = pageWidth / img.width;
    const imgHeight = img.height * ratio;

    pdf.text(`WHOIS Report • ${summary?.domain || ''}`, 40, 30);
    pdf.addImage(dataUrl, 'PNG', 40, 50, pageWidth - 80, imgHeight);
    pdf.save(`${summary?.domain || 'whois'}.pdf`);
  } finally {
    node.classList.remove('capture-safe');
  }
};

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <Globe className="h-6 w-6" /> WHOIS Lookup (Enhanced)
      </h1>

      <form onSubmit={handleLookup} className="mb-5 flex gap-2">
        <input
          type="text"
          placeholder="example.com"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Looking up…' : 'Lookup'}
        </button>
      </form>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {result?.ok && (
        <>
          {/* Summary Card */}
          <section ref={cardRef} className="bg-white border rounded-xl shadow p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Domain</div>
                <div className="text-xl font-bold">{summary.domain}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={downloadJSON} className="flex items-center gap-1 text-sm px-3 py-1.5 border rounded">
                  <Download className="h-4 w-4" /> JSON
                </button>
                <button onClick={downloadCSV} className="flex items-center gap-1 text-sm px-3 py-1.5 border rounded">
                  <FileDown className="h-4 w-4" /> CSV
                </button>
                <button onClick={downloadPDF} className="flex items-center gap-1 text-sm px-3 py-1.5 border rounded">
                  <FileDown className="h-4 w-4" /> PDF
                </button>
              </div>
            </div>

            {/* Domain Summary */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-lg border p-4">
                <div className="text-sm text-gray-500 mb-1">Registrar</div>
                <div className="flex items-center gap-2">{registrarChip}</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm text-gray-500 mb-1">Status</div>
                <div>{statusBadges || '—'}</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm text-gray-500 mb-1">Creation Date</div>
                <div className="font-medium">{formatDate(summary.createdAt)}</div>
                <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                  <Clock className="h-4 w-4" />
                  Domain age: {daysToHumanAge(summary.domainAgeDays)}
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm text-gray-500 mb-1">Expiry</div>
                <div className="font-medium">{formatDate(summary.expiresAt)}</div>
                <div className="mt-1">{expiryBadge}</div>
              </div>
            </div>

            {/* Contact/Privacy + DNSSEC */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-lg border p-4">
                <div className="text-sm text-gray-500 mb-1">Privacy Protection</div>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  {summary.privacyProtected ? 'Enabled (masked)' : 'Not detected'}
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm text-gray-500 mb-1">DNSSEC</div>
                <div className="flex items-center gap-2">{dnssecBadge}</div>
                {!summary.dnssecSigned && (
                  <div className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" /> Security Risk: DNSSEC unsigned
                  </div>
                )}
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm text-gray-500 mb-1">Nameservers</div>
                <div className="text-sm">
                  {(summary.nameservers || []).length ? summary.nameservers.join(', ') : '—'}
                </div>
              </div>
            </div>

            {/* IP & Hosting */}
            <div className="rounded-lg border p-4">
              <div className="text-sm text-gray-500 mb-1">IP & Hosting</div>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-1"><Server className="h-4 w-4" /> IP: <strong>{summary.ip || '—'}</strong></span>
                <span>rDNS: <strong>{summary.rDns || '—'}</strong></span>
                <span>Provider: <strong>{summary.ipProvider || '—'}</strong></span>
              </div>
            </div>

            {/* Threat Intel */}
            <div className="rounded-lg border p-4">
              <div className="text-sm text-gray-500 mb-1">Threat Intelligence</div>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="inline-flex items-center gap-1">
                  VT: {summary?.threatIntel?.virusTotal?.available ? (
                    summary?.threatIntel?.virusTotal?.clean
                      ? <><CheckCircle className="h-4 w-4" /> Clean</>
                      : <><XCircle className="h-4 w-4" /> Issues: {summary?.threatIntel?.virusTotal?.maliciousCount ?? '?'}</>
                  ) : 'Not checked'}
                </span>
                <span className="inline-flex items-center gap-1">
                  GSB: {summary?.threatIntel?.googleSafeBrowsing?.available ? (
                    summary?.threatIntel?.googleSafeBrowsing?.clean
                      ? <><CheckCircle className="h-4 w-4" /> Clean</>
                      : <><XCircle className="h-4 w-4" /> Flagged</>
                  ) : 'Not checked'}
                </span>
              </div>
            </div>

            {/* Reverse WHOIS + Historical */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-lg border p-4">
                <div className="text-sm text-gray-500 mb-1">Reverse WHOIS</div>
                {summary?.reverseWhois?.available ? (
                  (summary?.reverseWhois?.domains || []).length
                    ? <ul className="list-disc ml-5 text-sm max-h-40 overflow-auto">
                        {summary.reverseWhois.domains.slice(0, 50).map((d, i) => <li key={i}>{d}</li>)}
                      </ul>
                    : <div className="text-sm text-gray-600">No linked domains (or privacy-protected).</div>
                ) : <div className="text-sm text-gray-600">Not enabled.</div>}
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm text-gray-500 mb-1">Historical WHOIS</div>
                {summary?.history?.available ? (
                  (summary?.history?.history || []).length
                    ? <ul className="list-disc ml-5 text-sm max-h-40 overflow-auto">
                        {summary.history.history.slice(0, 50).map((h, i) => <li key={i}>
                          {h?.auditUpdatedDate || h?.createdDate || '—'} — {h?.registrarName || 'Registrar change'}
                        </li>)}
                      </ul>
                    : <div className="text-sm text-gray-600">No history records.</div>
                ) : <div className="text-sm text-gray-600">Not enabled.</div>}
              </div>
            </div>
          </section>

          {/* Full WHOIS Data */}
          <section className="mt-6">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Database className="h-5 w-5" /> Full WHOIS Data
            </h2>
            <textarea
              readOnly
              className="w-full h-80 border rounded p-3 font-mono text-sm"
              value={result.raw || ''}
            />
          </section>
        </>
      )}
    </main>
  );
}
