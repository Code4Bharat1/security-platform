'use client';

import { useMemo, useState } from 'react';
import useProtectedAction from '../UseProtectedAction/UseProtectedAction';
import OwnershipVerificationWizard from '@/components/ownership/OwnershipVerificationWizard';
import {
  Fingerprint,
  Globe,
  Search,
  Loader2,
  ShieldAlert,
  Info,
  Terminal,
  Activity,
  Layers,
  Cpu,
  Server,
  Calendar,
  Clock,
  ExternalLink
} from 'lucide-react';

export default function TechnologyFingerprinter() {
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
    });
  };

  // Quick categorization on the client by keyword
  const categorized = useMemo(() => {
    const buckets = {
      'Website Builder': [],
      'CMS': [],
      'Analytics / Tag Manager': [],
      'Hosting / CDN': [],
      'JavaScript Frameworks': [],
      'CSS Frameworks': [],
      'Payments Integration': [],
      'Other Libraries': [],
    };
    for (const t of results) {
      const s = t.toLowerCase();
      if (s.includes('website builder')) buckets['Website Builder'].push(t);
      else if (s.startsWith('📝 cms') || s.includes(' cms:') || s.includes('magento') || s.includes('opencart')) buckets['CMS'].push(t);
      else if (s.includes('analytics') || s.includes('tag manager') || s.includes('pixel')) buckets['Analytics / Tag Manager'].push(t);
      else if (s.includes('hosting') || s.includes('cdn') || s.includes('server') || s.includes('x-powered-by')) buckets['Hosting / CDN'].push(t);
      else if (s.includes('javascript') || s.includes('react') || s.includes('vue') || s.includes('angular') || s.includes('jquery')) buckets['JavaScript Frameworks'].push(t);
      else if (s.includes('css framework')) buckets['CSS Frameworks'].push(t);
      else if (s.includes('payment') || s.includes('razorpay') || s.includes('stripe') || s.includes('paypal')) buckets['Payments Integration'].push(t);
      else buckets['Other Libraries'].push(t);
    }
    return buckets;
  }, [results]);

  return (
    <div 
      className="tool-detail-page min-h-screen"
      style={{
        '--hero-ambient-a': 'rgba(239, 68, 68, 0.08)',
        '--hero-ambient-b': 'rgba(249, 115, 22, 0.03)',
        '--glow-primary': '0 0 34px rgba(239, 68, 68, 0.16)',
        '--gold': '#ef4444',
        '--gold-strong': '#f87171',
        '--gold-dark': '#b91c1c',
        '--ring': 'rgba(239, 68, 68, 0.34)',
        '--surface-glow': 'rgba(239, 68, 68, 0.14)',
      }}
    >
      <style>{`
        .tool-detail-page .tool-detail-shell {
          padding-top: 3.5rem !important;
        }
        .tool-detail-page ::-webkit-scrollbar-thumb {
          background: rgba(239, 68, 68, 0.35) !important;
        }
        .tool-detail-page ::-webkit-scrollbar-thumb:hover {
          background: rgba(239, 68, 68, 0.55) !important;
        }
        .tool-detail-page ::selection {
          background: rgba(239, 68, 68, 0.22) !important;
          color: #fef2f2 !important;
        }
        .tool-detail-page :is(button, [role="button"]):is([class*="bg-red-"], [class*="bg-rose-"]) {
          color: #000000 !important;
        }
        .tool-detail-page :is(button, [role="button"]):is([class*="bg-red-"], [class*="bg-rose-"]) * {
          color: #000000 !important;
        }
      `}</style>

      <div className="tool-detail-shell">
        {/* Navigation & Header */}
        <div className="flex justify-end mb-8">
          <span className="rounded-full border border-red-500/30 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-red-400">
            Red Team
          </span>
        </div>

        {/* Title Block */}
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl border border-red-500/30 overflow-hidden shadow-lg flex-shrink-0 flex items-center justify-center">
            <Fingerprint className="h-8 w-8 text-red-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              TECH <span className="text-red-400">FINGERPRINTER</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Perform dynamic framework detection to analyze front-end configurations, server headers, and third-party script integrations.
            </p>
          </div>
        </div>

        {/* 2-Column Split Layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* Form Card */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-red-500/10 transition-all duration-300 space-y-4">
              <h2 className="text-lg font-mono font-medium text-zinc-100 mb-2 flex items-center gap-2">
                <Globe className="h-5 w-5 text-red-400" />
                Target Environment Profile
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                    Website URL
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-650" />
                    <input
                      type="text"
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 pl-12 text-sm focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 focus:shadow-[0_0_12px_rgba(239,68,68,0.08)] focus:outline-none transition-all placeholder:text-zinc-600 font-mono"
                    />
                  </div>
                </div>

                <button
                  onClick={analyzeTech}
                  disabled={loading || !url}
                  className="w-full bg-red-500 hover:bg-red-600 text-black rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] focus:outline-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      Fingerprinting Stack...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 text-black" />
                      Run Tech Audit
                    </>
                  )}
                </button>

                <OwnershipVerificationWizard
                  targetValue={url}
                  targetLabel="Website URL"
                  onVerifiedChange={setOwnershipVerified}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-955/10 text-red-400 text-xs font-mono flex items-start gap-2">
                <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" />
                <span>Recon Failure: {error}</span>
              </div>
            )}

            {/* Telemetry Block */}
            {meta && (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
                <h3 className="text-sm font-mono font-bold text-zinc-200 flex items-center gap-2 border-b border-zinc-850 pb-2.5 mb-4">
                  <Terminal className="w-4 h-4 text-red-400" />
                  Audit Scan Telemetry
                </h3>
                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div className="bg-zinc-900/40 border border-zinc-800/80 p-3.5 rounded-xl">
                    <span className="text-[10px] text-zinc-550 block mb-1">HTTP status</span>
                    <span className="text-zinc-200 font-bold text-sm">{meta.status ?? '-'}</span>
                  </div>
                  <div className="bg-zinc-900/40 border border-zinc-800/80 p-3.5 rounded-xl">
                    <span className="text-[10px] text-zinc-550 block mb-1">Scan duration</span>
                    <span className="text-zinc-200 font-bold text-sm">{formatDuration(meta.durationMs)}</span>
                  </div>
                  <div className="bg-zinc-900/40 border border-zinc-800/80 p-3.5 rounded-xl col-span-2 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <div className="overflow-hidden">
                      <span className="text-[10px] text-zinc-550 block">Final resolved URL</span>
                      <span className="text-zinc-300 font-medium break-all block">{meta.finalUrl || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Categorized results listing */}
            {results.length > 0 && (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] space-y-6">
                <div>
                  <h3 className="text-lg font-mono font-bold text-zinc-100 uppercase tracking-wider">
                    Fingerprinted Technologies
                  </h3>
                  <p className="text-xs font-mono text-zinc-500 mt-0.5">
                    Stack categories resolved from host headers and scripts
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {Object.entries(categorized).map(([group, items]) =>
                    items.length ? (
                      <div key={group} className="bg-zinc-900/40 border border-zinc-850 p-4 rounded-xl space-y-3">
                        <div className="text-zinc-300 font-mono font-bold flex items-center gap-2 uppercase text-[10px] tracking-wider border-b border-zinc-800/50 pb-1.5">
                          <Layers className="w-3.5 h-3.5 text-red-400" />
                          {group}
                        </div>
                        <ul className="list-none pl-0 space-y-1.5 font-mono text-xs">
                          {items.map((tech, i) => (
                            <li key={`${group}-${i}`} className="flex items-center gap-2 text-zinc-400">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 flex-shrink-0" />
                              <span>{tech}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Guidance sidebar card */}
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Info className="text-red-400 w-4 h-4" />
                Audit Scope Info
              </h2>
              <ul className="space-y-3.5 list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Resolves frameworks footprints (React, Vue, jQuery) mapped in client headers.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Audits active content publishers (WordPress, Drupal, Shopify) configurations.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Flags hosting configurations (Cloudflare, AWS, Nginx) stack details.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Maps third-party payment gateways and tracking analytics pixels.
                  </span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
