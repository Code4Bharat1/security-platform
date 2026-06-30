'use client';
import { useMemo, useState } from 'react';
import useProtectedAction from '../UseProtectedAction/UseProtectedAction';
import OwnershipVerificationWizard from '@/components/ownership/OwnershipVerificationWizard';

export default function TechnologyFingerprinter() {
  // ====================================================
  // TEMPORARILY DISABLED FOR LOCAL TESTING
  // Purpose: Skip domain ownership verification.
  // Re-enable before production deployment.
  // ====================================================
  const SKIP_DOMAIN_VERIFICATION_FOR_TESTING = true;

  const protectedAction = useProtectedAction();
  const [url, setUrl] = useState('');
  const [results, setResults] = useState([]);    // array of strings
  const [meta, setMeta] = useState(null);        // { startedAt, finishedAt, durationMs, status, finalUrl, contentLength }
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ownershipVerified, setOwnershipVerified] = useState(false);

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
    await protectedAction(async (token) => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError('Please enter a website URL.');
      return;
    }
    if (!ownershipVerified && !SKIP_DOMAIN_VERIFICATION_FOR_TESTING) {
      setError('Verify ownership of this website before fingerprinting it.');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);
    setMeta(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_API_URL}/fingerprint/fingerprint-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}`},
        body: JSON.stringify({ url: trimmedUrl }),
      });

      const data = await res.json();
      if (res.ok) {
        setResults(Array.isArray(data.technologies) ? data.technologies : []);
        setMeta(data.meta || null);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Server error');
    } finally {
      setLoading(false);
    }
   })
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
      else if (s.startsWith('📝 cms') || s.includes(' cms:') || s.includes('magento') || s.includes('opencart')) buckets['CMS'].push(t);
      else if (s.includes('analytics') || s.includes('tag manager') || s.includes('pixel')) buckets['Analytics / Tag Manager'].push(t);
      else if (s.includes('hosting') || s.includes('cdn') || s.includes('server') || s.includes('x-powered-by')) buckets['Hosting / CDN'].push(t);
      else if (s.includes('javascript') || s.includes('react') || s.includes('vue') || s.includes('angular') || s.includes('jquery')) buckets['JavaScript'].push(t);
      else if (s.includes('css framework')) buckets['CSS'].push(t);
      else if (s.includes('payment') || s.includes('razorpay') || s.includes('stripe') || s.includes('paypal')) buckets['Payments'].push(t);
      else buckets['Other'].push(t);
    }
    return buckets;
  }, [results]);

  return (
    <div className="tool-detail-page">
      <div className="tool-detail-shell p-4 max-w-4xl mx-auto text-white">
     <div className="tool-detail-hero flex items-center justify-left gap-10 mb-10">
  {/* Image with circle border */}
 <div className="flex flex-row items-center gap-4 flex-wrap">
  {/* Image always on left */}
  <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-red-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
    <img
      src="/RedTeam/fingerprint.png"
      alt="verify"
      className="w-30 h-30 sm:w-24 sm:h-24 object-contain"
    />
  </div>

  {/* Heading always on right */}
  <h2 className="text-xl sm:text-3xl md:text-4xl text-white font-extrabold">
  Technology Fingerprinter
</h2>
<p className="text-white text-sm sm:text-base md:text-lg mt-2">
  Identify the tech stack, CMS, frameworks, and third-party scripts used on any website.
</p>

</div>

</div>

<div className="border border-white p-20 mb-40 rounded">
  <div className="flex items-center gap-2">
    <input
      type="text"
      placeholder="https://example.com"
      className="flex-1 text-white border border-red-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
      value={url}
      onChange={(e) => setUrl(e.target.value)}
    />
    <button
      onClick={analyzeTech}
      disabled={loading}
      className="bg-red-900 text-white px-2 py-2 rounded hover:bg-red-700 disabled:opacity-60 transition"
    >
      {loading ? 'Analyzing...' : 'Analyze'}
    </button>
  </div>
  <OwnershipVerificationWizard
    targetValue={url}
    targetLabel="Website URL"
    onVerifiedChange={setOwnershipVerified}
    className="mt-4"
  />
</div>

      {error && <p className="text-red-500">{error}</p>}

      {meta && (
        <div className="mt-4 grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded border">
          <div>
            <p className="text-sm text-gray-600">HTTP status</p>
            <p className="font-semibold">{meta.status ?? '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Scan duration</p>
            <p className="font-semibold">{formatDuration(meta.durationMs)}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-600">Final URL</p>
            <p className="font-medium break-all">{meta.finalUrl || '-'}</p>
          </div>
          {/* <div>
            <p className="text-sm text-gray-600">Started</p>
            <p className="font-medium">{formatDate(meta.startedAt)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Finished</p>
            <p className="font-medium">{formatDate(meta.finishedAt)}</p>
          </div> */}
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-6 space-y-6">
          {Object.entries(categorized).map(([group, items]) =>
            items.length ? (
              <div key={group}>
                <h3 className="font-semibold text-lg mb-2">{group}</h3>
                <ul className="list-disc list-inside bg-gray-50 border rounded p-3">
                  {items.map((tech, i) => (
                    <li key={`${group}-${i}`} className="text-sm">{tech}</li>
                  ))}
                </ul>
              </div>
            ) : null
          )}
        </div>
      )}
      </div>
    </div>
  );
}
