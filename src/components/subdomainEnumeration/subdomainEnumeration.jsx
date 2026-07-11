"use client";

import { useState } from "react";
import axios from "axios";
import { generateSubdomainPDF } from "./generateSubdomainPDF";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";
import OwnershipVerificationWizard from "@/components/ownership/OwnershipVerificationWizard";
import {
  Globe,
  Search,
  Loader2,
  AlertTriangle,
  Info,
  Terminal,
  FileDown,
  Download,
  Calendar,
  Clock
} from "lucide-react";

export default function SubdomainScanner() {
  const SKIP_DOMAIN_VERIFICATION_FOR_TESTING = true;

  const protectedAction = useProtectedAction();
  const [domain, setDomain] = useState("");
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ownershipVerified, setOwnershipVerified] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_PROD_API_URL;

  const formatDate = (iso) => {
    if (!iso) return "-";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  const formatDuration = (ms) => {
    if (ms === 0) return "0 ms";
    if (!ms && ms !== 0) return "-";
    if (ms < 1000) return `${ms} ms`;
    const sec = ms / 1000;
    if (sec < 60) return `${sec.toFixed(2)} s`;
    const m = Math.floor(sec / 60);
    const s = (sec % 60).toFixed(2);
    return `${m}m ${s}s`;
  };

  const handleSubmit = async () => {
    await protectedAction(async (token) => {
      setLoading(true);
      setError("");
      setResults([]);
      setStats(null);

      const cleanDomain = domain.trim().toLowerCase();
      if (!cleanDomain) {
        setError("Please enter a domain.");
        setLoading(false);
        return;
      }
      if (!ownershipVerified && !SKIP_DOMAIN_VERIFICATION_FOR_TESTING) {
        setError("Verify ownership of this domain before scanning subdomains.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.post(
          `${API_URL}/subdomain/subdomains-scan`,
          { domain: cleanDomain },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = response.data;

        setResults(data.results || []);
        setStats({
          total: data.total,
          startedAt: data.startedAt,
          finishedAt: data.finishedAt,
          durationMs: data.durationMs,
        });
      } catch (err) {
        console.error("Error fetching subdomains:", err);
        setError(
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to fetch subdomains from server."
        );
      } finally {
        setLoading(false);
      }
    });
  };

  const downloadPDF = async () => {
    if (!results || results.length === 0) return;
    const cleanDomain = domain.trim().toLowerCase();
    
    // Import toast if not already in context
    const { toast } = await import("react-hot-toast");
    toast.loading("Generating PDF Report...", { id: "pdf-gen" });

    try {
      await generateSubdomainPDF(
        results,
        stats,
        cleanDomain,
        (msg) => {
          if (msg) {
            toast.loading(msg, { id: "pdf-gen" });
          }
        }
      );
      toast.success("PDF report downloaded!", { id: "pdf-gen" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF report", { id: "pdf-gen" });
    }
  };

  const handleSubdomainClick = (subdomain) => {
    window.open(`https://${subdomain}`, "_blank");
  };

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
            <Search className="h-8 w-8 text-red-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              SUBDOMAIN <span className="text-red-400">SCANNER</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Perform broad reconnaissance across target domains to discover active subdomains and audit host security configurations.
            </p>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* Form Card */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-red-500/10 transition-all duration-300 space-y-5">
              <h2 className="text-lg font-mono font-medium text-zinc-100 mb-2 flex items-center gap-2">
                <Globe className="h-5 w-5 text-red-400" />
                Target Reconnaissance
              </h2>

              <div className="space-y-4">
                {/* Domain Input */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                    Target Domain
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-650" />
                    <input
                      type="text"
                      placeholder="Enter target domain (e.g. example.com)"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value.trim())}
                      className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 pl-12 text-sm focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 focus:shadow-[0_0_12px_rgba(239,68,68,0.08)] focus:outline-none transition-all placeholder:text-zinc-600 font-mono"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !domain}
                    className="w-full bg-red-500 hover:bg-red-600 text-black rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:ring-offset-2 focus:ring-offset-black/20 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        Enumerating Subdomains...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 text-black" />
                        Find Subdomains
                      </>
                    )}
                  </button>
                </div>

                {/* Ownership Verification */}
                <OwnershipVerificationWizard
                  targetValue={domain}
                  targetLabel="Domain"
                  onVerifiedChange={setOwnershipVerified}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-955/10 text-red-400 text-xs font-mono flex items-start gap-2">
                <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                <span>Reconnaissance Failure: {error}</span>
              </div>
            )}

            {/* Stats Block */}
            {stats && (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-red-500/10 transition-all duration-300">
                <h3 className="text-sm font-mono font-bold text-zinc-200 flex items-center gap-2 border-b border-zinc-850 pb-2.5 mb-4">
                  <Terminal className="w-4 h-4 text-red-400" />
                  Scan Telemetry Metrics
                </h3>
                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div className="bg-zinc-900/40 border border-zinc-800/80 p-3.5 rounded-xl">
                    <span className="text-[10px] text-zinc-550 block mb-1">Total Subdomains</span>
                    <span className="text-zinc-200 font-bold text-base">{stats.total ?? "-"}</span>
                  </div>
                  <div className="bg-zinc-900/40 border border-zinc-800/80 p-3.5 rounded-xl">
                    <span className="text-[10px] text-zinc-550 block mb-1">Scan Duration</span>
                    <span className="text-zinc-200 font-bold text-base">{formatDuration(stats.durationMs)}</span>
                  </div>
                  <div className="bg-zinc-900/40 border border-zinc-800/80 p-3.5 rounded-xl col-span-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-red-400" />
                    <div>
                      <span className="text-[10px] text-zinc-550 block">Start Time</span>
                      <span className="text-zinc-300 font-medium">{formatDate(stats.startedAt)}</span>
                    </div>
                  </div>
                  <div className="bg-zinc-900/40 border border-zinc-800/80 p-3.5 rounded-xl col-span-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-red-400" />
                    <div>
                      <span className="text-[10px] text-zinc-550 block">Finish Time</span>
                      <span className="text-zinc-300 font-medium">{formatDate(stats.finishedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Results Block */}
            {results.length > 0 && (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-red-500/10 transition-all duration-300 space-y-5">
                <div className="flex justify-between items-center gap-4 flex-wrap border-b border-zinc-800/40 pb-4">
                  <div>
                    <h3 className="text-lg font-mono font-bold text-zinc-100 uppercase tracking-wider">
                      Discovery Logs
                    </h3>
                    <p className="text-xs font-mono text-zinc-500 mt-0.5">
                      Subdomains mapping details
                    </p>
                  </div>

                  <button
                    onClick={downloadPDF}
                    className="px-4 py-2.5 bg-zinc-900/40 hover:bg-red-500/5 text-zinc-300 hover:text-red-400 border border-zinc-800/80 hover:border-red-500/30 rounded-xl font-mono font-bold text-xs uppercase transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PDF
                  </button>
                </div>

                <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl max-h-80 overflow-y-auto font-mono text-xs">
                  <ul className="space-y-3.5 list-none pl-0">
                    {results.map(({ subdomain }, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                        <button
                          onClick={() => handleSubdomainClick(subdomain)}
                          className="text-red-400 hover:text-red-300 hover:underline break-all text-left font-mono font-semibold"
                        >
                          {subdomain}
                        </button>
                      </li>
                    ))}
                  </ul>
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
                Scanner Scope
              </h2>
              <ul className="space-y-3.5 list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Resolves subdomains mapping matrices to locate unknown attack vectors.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Audits active ports, DNS values, and host headers records configurations.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Logs telemetry data to optimize penetration testing security posture.
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
