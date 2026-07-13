"use client";

import { useState } from "react";
import axios from "axios";
import {
  Shield,
  Globe,
  Search,
  Loader2,
  ShieldAlert,
  Info,
  Terminal,
  Activity,
  Layers,
  Settings,
  Cpu,
  ChevronRight,
  HelpCircle,
  Award,
  CheckCircle2
} from "lucide-react";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";
import OwnershipVerificationWizard from "@/components/ownership/OwnershipVerificationWizard";
import { toast } from "react-hot-toast";

const WordPressScanner = () => {
  const SKIP_DOMAIN_VERIFICATION_FOR_TESTING = true;

  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [scanData, setScanData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ownershipVerified, setOwnershipVerified] = useState(false);

  const protectedAction = useProtectedAction();
  const API_URL = process.env.NEXT_PUBLIC_PROD_API_URL;

  const validateUrl = (inputUrl) => {
    const urlPattern = new RegExp(
      "^(https?:\\/\\/)?(([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}(:\\d+)?(\\/.*)?$",
      "i"
    );
    return !!urlPattern.test(inputUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateUrl(url)) {
      setError("Please enter a valid website URL.");
      return;
    }
    if (!ownershipVerified && !SKIP_DOMAIN_VERIFICATION_FOR_TESTING) {
      setError("Verify ownership of this website before running the WordPress scan.");
      return;
    }

    setError("");
    setLoading(true);
    setScanData(null);

    await protectedAction(async (token) => {
      try {
        const response = await axios.post(
          `${API_URL}/wordpress/wordpress-scan`,
          { url },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.error) {
          setError(response.data.error);
        } else {
          setScanData(response.data);
        }
      } catch (error) {
        console.error("Error:", error);
        setError(error.response?.data?.error || "Failed to scan WordPress site.");
      } finally {
        setLoading(false);
      }
    });
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
            <Shield className="h-8 w-8 text-red-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              SECURE YOUR <span className="text-red-400">WORDPRESS</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Scan target sites for obsolete CMS core versions, vulnerable plugins database references, active theme disclosures, and critical misconfigurations.
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
                WordPress Audit Configuration
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                    Website URL
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-650" />
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value.trim())}
                      placeholder="https://example.com"
                      required
                      className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 pl-12 text-sm focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 focus:shadow-[0_0_12px_rgba(239,68,68,0.08)] focus:outline-none transition-all placeholder:text-zinc-600 font-mono"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading || !url}
                  className="w-full bg-red-500 hover:bg-red-600 text-black rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] focus:outline-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      Scanning Target Configs...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 text-black" />
                      Scan WordPress Site
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
                <span>Scan Failure: {error}</span>
              </div>
            )}

            {/* Loading Indicator */}
            {loading && (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.2)] text-center space-y-4 font-mono text-xs text-zinc-400">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-red-400" />
                <p>Auditing plugins directory index listings and core config maps...</p>
              </div>
            )}

            {/* Results Report Card */}
            {!loading && scanData && (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] space-y-6">
                
                <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                  <div>
                    <h3 className="text-lg font-mono font-bold text-zinc-100 uppercase tracking-wider">
                      WordPress Security Scorecard
                    </h3>
                    <p className="text-xs font-mono text-zinc-550 mt-0.5">
                      Vulnerability telemetry outcome report
                    </p>
                  </div>
                  <div className="bg-zinc-900/40 border border-zinc-800/80 px-4 py-2.5 rounded-xl text-center font-mono">
                    <span className="text-[9px] text-zinc-500 block uppercase font-bold tracking-wider">Security Score</span>
                    <span className="text-red-400 font-extrabold text-lg">{scanData.securityScore} / 100</span>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 text-xs font-mono">
                  <div className="bg-zinc-900/40 border border-zinc-850 p-3.5 rounded-xl">
                    <span className="text-[10px] text-zinc-550 block mb-1">WordPress Core Version</span>
                    <span className="text-zinc-200 font-bold">{scanData.version || "Unknown"}</span>
                  </div>
                  <div className="bg-zinc-900/40 border border-zinc-850 p-3.5 rounded-xl">
                    <span className="text-[10px] text-zinc-550 block mb-1">Active Theme Identity</span>
                    <span className="text-zinc-200 font-bold">{scanData.theme?.name || "N/A"}</span>
                  </div>
                  <div className="bg-zinc-900/40 border border-zinc-850 p-3.5 rounded-xl">
                    <span className="text-[10px] text-zinc-550 block mb-1">Vulnerable Plugins</span>
                    <span className="text-zinc-200 font-bold break-words">{scanData.vulnerablePlugins || "None detected"}</span>
                  </div>
                  <div className="bg-zinc-900/40 border border-zinc-850 p-3.5 rounded-xl">
                    <span className="text-[10px] text-zinc-550 block mb-1">Outdated Plugins</span>
                    <span className="text-zinc-200 font-bold break-words">{scanData.outdatedPlugins || "None"}</span>
                  </div>
                </div>

                {/* Specific issues list */}
                <div className="bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-xl font-mono text-xs space-y-3">
                  <h4 className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider mb-2">
                    Identified Vulnerability Flags
                  </h4>
                  <ul className="list-none pl-0 space-y-3">
                    {scanData.issues?.length > 0 ? (
                      scanData.issues.map((issue, index) => (
                        <li key={index} className="flex items-start gap-2.5 text-red-400">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                          <span className="leading-relaxed font-semibold">{issue}</span>
                        </li>
                      ))
                    ) : (
                      <li className="flex items-center gap-2 text-zinc-400 italic">
                        <CheckCircle2 className="w-4 h-4 text-red-400" />
                        No critical misconfiguration issues identified.
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}

          </div>

          {/* Right Column (Specs & Guidance) */}
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
                    Resolves version headers to cross-reference against known WordPress core vulnerabilities.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Fingerprints active plugins directories to audit outdated or exploit-susceptible code.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Audits common file exposures (wp-config.php backup files, readme.html disclosures).
                  </span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default WordPressScanner;
