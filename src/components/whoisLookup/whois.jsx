"use client";

import { useRef, useState } from "react";
import {
  Shield,
  Globe,
  CheckCircle2,
  Clock,
  Server,
  FileDown,
  Download,
  Database,
  Lock,
  Info,
  Terminal,
  Activity,
  Layers,
  Cpu,
  ShieldAlert
} from "lucide-react";
import { toPng } from "html-to-image";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";
import OwnershipVerificationWizard from "@/components/ownership/OwnershipVerificationWizard";
import { generateWhoisPDF } from "./generateWhoisPDF";

const ccToFlag = (cc) => {
  if (!cc) return "";
  return cc
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
};

const formatDate = (iso) => (iso ? new Date(iso).toLocaleString() : "—");

export default function WhoisLookup() {
  const SKIP_DOMAIN_VERIFICATION_FOR_TESTING = true;

  const [domain, setDomain] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ownershipVerified, setOwnershipVerified] = useState(false);
  const cardRef = useRef(null);

  const protectedAction = useProtectedAction();

  const handleLookup = async (e) => {
    e?.preventDefault?.();
    setError("");
    setResult(null);

    let v = domain.trim();
    if (!v) return setError("Please enter a domain name.");

    // Automatically clean up the domain input if they input http/https, www, or path elements
    if (v.includes("http://") || v.includes("https://") || v.includes("/") || v.startsWith("www.")) {
      try {
        const temp = v.includes("://") ? v : `https://${v}`;
        const urlObj = new URL(temp);
        v = urlObj.hostname.toLowerCase();
        if (v.startsWith("www.")) {
          v = v.substring(4);
        }
      } catch (err) {
        // Fallback cleanup
        v = v.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0].split(":")[0];
      }
      setDomain(v);
    }

    if (!ownershipVerified && !SKIP_DOMAIN_VERIFICATION_FOR_TESTING) {
      return setError("Verify ownership of this domain before running a WHOIS scan.");
    }

    setLoading(true);

    await protectedAction(async (token) => {
      try {
        const apiBase = (process.env.NEXT_PUBLIC_PROD_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");
        const res = await fetch(`${apiBase}/whois/whois-scan`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ domain: v }),
        });

        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          setError(json.error || `Request failed: ${res.status}`);
        } else {
          setResult(json);
        }
      } catch (err) {
        console.error("Lookup error", err);
        setError("Network error: " + (err?.message || err));
      } finally {
        setLoading(false);
      }
    });
  };

  const downloadPDF = () => {
    if (!result) return;
    generateWhoisPDF(result);
  };

  const downloadPNG = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current);
      const link = document.createElement("a");
      link.download = "whois-report.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("PNG export error", err);
      setError("Could not export PNG: " + (err?.message || err));
    }
  };

  const summary = result?.summary;

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
            <Globe className="h-8 w-8 text-red-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              WHOIS DOMAIN <span className="text-red-400">LOOKUP</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Query global WHOIS registries to compile domain registration timestamps, registrar nodes, contact identities, and nameserver delegation parameters.
            </p>
          </div>
        </div>

        {/* 2-Column Split Layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* Input Form Card */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-red-500/10 transition-all duration-300 space-y-4">
              <h2 className="text-lg font-mono font-medium text-zinc-100 mb-2 flex items-center gap-2">
                <Globe className="h-5 w-5 text-red-400" />
                WHOIS Registry Queries
              </h2>

              <form onSubmit={handleLookup} className="space-y-4">
                <div>
                  <label htmlFor="whois-domain-input" className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                    Domain Name
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-650" />
                    <input
                      id="whois-domain-input"
                      type="text"
                      placeholder="example.com"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 pl-12 text-sm focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 focus:shadow-[0_0_12px_rgba(239,68,68,0.08)] focus:outline-none transition-all placeholder:text-zinc-600 font-mono"
                    />
                  </div>
                  <p className="mt-1.5 text-[10px] font-mono text-zinc-550">
                    Input domain name only without http/https schema labels.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !domain.trim()}
                  className="w-full bg-red-500 hover:bg-red-600 text-black rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] focus:outline-none disabled:opacity-40"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Looking up registry...
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4 text-black" />
                      Lookup WHOIS Record
                    </>
                  )}
                </button>
              </form>

              <OwnershipVerificationWizard
                targetValue={domain}
                targetLabel="Domain"
                onVerifiedChange={setOwnershipVerified}
                className="mt-4"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-955/10 text-red-400 text-xs font-mono flex items-start gap-2">
                <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" />
                <span>Lookup Error: {error}</span>
              </div>
            )}

            {/* Loading Indicator */}
            {loading && (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.2)] text-center space-y-4 font-mono text-xs text-zinc-400">
                <div className="w-8 h-8 border-2 border-red-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p>Querying IANA databases and parsing registrar response signatures...</p>
              </div>
            )}

            {/* Results Details */}
            {result?.ok && (
              <div className="space-y-6">
                
                {/* Stats details card */}
                <section
                  ref={cardRef}
                  className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] space-y-4"
                >
                  <h3 className="text-sm font-mono font-bold text-zinc-200 flex items-center gap-2 border-b border-zinc-850 pb-2.5">
                    <Activity className="w-4 h-4 text-red-400" />
                    Domain Registry Summary
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs text-zinc-350">
                    <div className="flex items-center gap-2.5 bg-zinc-900/40 border border-zinc-850 p-3 rounded-xl">
                      <Globe className="w-4.5 h-4.5 text-red-400 flex-shrink-0" />
                      <div>
                        <span className="text-zinc-550 block font-semibold">Domain:</span>
                        <span className="text-zinc-200 font-bold break-all">{summary?.domainName || "—"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 bg-zinc-900/40 border border-zinc-850 p-3 rounded-xl">
                      <Server className="w-4.5 h-4.5 text-red-400 flex-shrink-0" />
                      <div>
                        <span className="text-zinc-550 block font-semibold">Registrar:</span>
                        <span className="text-zinc-200 font-bold break-all">{summary?.registrar || "—"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 bg-zinc-900/40 border border-zinc-850 p-3 rounded-xl">
                      <Clock className="w-4.5 h-4.5 text-red-400 flex-shrink-0" />
                      <div>
                        <span className="text-zinc-550 block font-semibold">Created:</span>
                        <span className="text-zinc-200 font-bold">{formatDate(summary?.creationDate)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 bg-zinc-900/40 border border-zinc-850 p-3 rounded-xl">
                      <Lock className="w-4.5 h-4.5 text-red-400 flex-shrink-0" />
                      <div>
                        <span className="text-zinc-550 block font-semibold">Expires:</span>
                        <span className="text-zinc-200 font-bold">{formatDate(summary?.registryExpiryDate)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 bg-zinc-900/40 border border-zinc-850 p-3 rounded-xl">
                      <Database className="w-4.5 h-4.5 text-red-400 flex-shrink-0" />
                      <div>
                        <span className="text-zinc-550 block font-semibold">Country:</span>
                        <span className="text-zinc-200 font-bold">
                          {ccToFlag(summary?.country)} {summary?.country || "—"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 bg-zinc-900/40 border border-zinc-850 p-3 rounded-xl">
                      <Shield className="w-4.5 h-4.5 text-red-400 flex-shrink-0" />
                      <div>
                        <span className="text-zinc-550 block font-semibold">DNSSEC:</span>
                        <span className="text-zinc-200 font-bold">{summary?.dnssecSigned ? "Enabled" : "Disabled"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 bg-zinc-900/40 border border-zinc-850 p-3 rounded-xl">
                      <Activity className="w-4.5 h-4.5 text-red-400 flex-shrink-0" />
                      <div>
                        <span className="text-zinc-550 block font-semibold">IP Address:</span>
                        <span className="text-zinc-200 font-bold break-all">{summary?.ip || "—"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 bg-zinc-900/40 border border-zinc-850 p-3 rounded-xl">
                      <Layers className="w-4.5 h-4.5 text-red-400 flex-shrink-0" />
                      <div>
                        <span className="text-zinc-550 block font-semibold">IP Provider:</span>
                        <span className="text-zinc-200 font-bold break-all">{summary?.ipProvider || "—"}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 bg-zinc-900/40 border border-zinc-850 p-3 rounded-xl sm:col-span-2 lg:col-span-3">
                      <Shield className="w-4.5 h-4.5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-zinc-550 block font-semibold mb-1">Status:</span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {summary?.status?.length ? (
                            summary.status.map((s, i) => (
                              <span
                                key={i}
                                className="inline-block px-2 py-0.5 text-[9px] rounded-lg border border-red-500/30 bg-red-500/5 text-red-400 font-semibold uppercase font-mono"
                              >
                                {s.split(/\s+/)[0]}
                              </span>
                            ))
                          ) : (
                            <span className="text-zinc-500">—</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Export Options */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={downloadPDF}
                    className="px-4 py-2.5 bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-600 hover:border-red-500 rounded-xl font-mono font-bold text-xs uppercase transition-all duration-300 flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <FileDown className="w-3.5 h-3.5 text-red-400" /> PDF Report
                  </button>
                  <button
                    onClick={downloadPNG}
                    className="px-4 py-2.5 bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-600 hover:border-red-500 rounded-xl font-mono font-bold text-xs uppercase transition-all duration-300 flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Download className="w-3.5 h-3.5 text-red-400" /> PNG Image
                  </button>
                </div>

                {/* Raw response */}
                <section className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] space-y-3 font-mono text-xs">
                  <h3 className="text-sm font-mono font-bold text-zinc-200 flex items-center gap-2 border-b border-zinc-900 pb-2.5">
                    <Terminal className="w-4 h-4 text-red-400" />
                    WHOIS Raw Response
                  </h3>
                  <pre className="whitespace-pre-wrap text-[13px] text-zinc-450 bg-zinc-950/65 border border-zinc-900 rounded-xl p-4 overflow-auto max-h-[500px] leading-relaxed">
                    {result.raw || "No raw registry records found."}
                  </pre>
                </section>
              </div>
            )}

          </div>

          {/* Right Column (Guidance) */}
          <div className="space-y-6">
            
            {/* Guidance sidebar card */}
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Info className="text-red-400 w-4 h-4" />
                Lookup Guidance
              </h2>
              <ul className="space-y-3.5 list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Queries registry networks globally to retrieve registration age, status, and domain expiration updates.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Identifies registry lock indicators (ClientTransferProhibited, ClientDeleteProhibited flags).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Logs active nameservers delegation mapping configurations.
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
