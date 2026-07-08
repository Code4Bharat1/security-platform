"use client";

import React, { useState } from "react";
import FirewallDashboard from "@/components/firewallDashboard/firewallDashboard";
import useProtectedAction from "@/components/UseProtectedAction/UseProtectedAction";
import OwnershipVerificationWizard from "@/components/ownership/OwnershipVerificationWizard";
import { 
  Shield, 
  Globe, 
  Terminal, 
  Info, 
  AlertTriangle,
  Loader2
} from "lucide-react";

export default function DashboardPage() {
  const SKIP_DOMAIN_VERIFICATION_FOR_TESTING = true;

  const [url, setUrl] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ownershipVerified, setOwnershipVerified] = useState(false);

  const protectedAction = useProtectedAction();

  async function handleScan(e) {
    e.preventDefault();
    if (!ownershipVerified && !SKIP_DOMAIN_VERIFICATION_FOR_TESTING) {
      setError("Verify ownership of this website before running the WAF scan.");
      return;
    }
    setLoading(true);
    setError(null);
    setData(null);

    await protectedAction(async (token) => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/waf/waf-scan`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ url }),
          }
        );

        const json = await res.json();

        if (res.ok) {
          setData(json.dashboard || { message: json.message });
        } else {
          setError(json.message || "Something went wrong");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });
  }

  return (
    <div 
      className="tool-detail-page min-h-screen"
      style={{
        '--hero-ambient-a': 'rgba(59, 130, 246, 0.08)',
        '--hero-ambient-b': 'rgba(6, 182, 212, 0.03)',
        '--glow-primary': '0 0 34px rgba(59, 130, 246, 0.16)',
        '--gold': '#3b82f6',
        '--gold-strong': '#60a5fa',
        '--gold-dark': '#1d4ed8',
        '--ring': 'rgba(59, 130, 246, 0.34)',
        '--surface-glow': 'rgba(59, 130, 246, 0.14)',
      }}
    >
      <style>{`
        .tool-detail-page .tool-detail-shell {
          padding-top: 3.5rem !important;
        }
        .tool-detail-page ::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.35) !important;
        }
        .tool-detail-page ::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.55) !important;
        }
        .tool-detail-page ::selection {
          background: rgba(59, 130, 246, 0.22) !important;
          color: #eff6ff !important;
        }
        .tool-detail-page :is(button, [role="button"]):is([class*="bg-blue-"], [class*="bg-sky-"]) {
          color: #000000 !important;
        }
        .tool-detail-page :is(button, [role="button"]):is([class*="bg-blue-"], [class*="bg-sky-"]) * {
          color: #000000 !important;
        }
      `}</style>

      <div className="tool-detail-shell">
        {/* Navigation & Header */}
        <div className="flex justify-end mb-8">
          <span className="rounded-full border border-blue-500/30 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-blue-400">
            Blue Team
          </span>
        </div>

        {/* Title Block */}
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl border border-blue-500/30 overflow-hidden shadow-lg flex-shrink-0 flex items-center justify-center">
            <Shield className="h-8 w-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              WAF DETECTION <span className="text-blue-400">DASHBOARD</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Analyze remote host web traffic headers to verify WAF firewall protection status, calculate intensity ratings, and check active shield details.
            </p>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* Form Card */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-blue-500/10 transition-all duration-300 space-y-5">
              <h2 className="text-lg font-mono font-medium text-zinc-100 mb-2 flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-400" />
                Target Website Details
              </h2>

              <form onSubmit={handleScan} className="space-y-4">
                {/* Website input */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                    Target URL to Scan
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-650" />
                    <input
                      type="url"
                      placeholder="e.g. https://example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value.trim())}
                      required
                      className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 pl-12 text-sm focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 focus:shadow-[0_0_12px_rgba(59,130,246,0.08)] focus:outline-none transition-all placeholder:text-zinc-600 font-mono"
                    />
                  </div>
                </div>

                {/* Scan Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || !url}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-black rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2 focus:ring-offset-black/20 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        Scanning for WAF Protection...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 text-black" />
                        Scan Website WAF
                      </>
                    )}
                  </button>
                </div>

                {/* Ownership Verification */}
                <OwnershipVerificationWizard
                  targetValue={url}
                  targetLabel="Website URL"
                  onVerifiedChange={setOwnershipVerified}
                  className="mt-4"
                />
              </form>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-950/10 text-red-400 text-xs font-mono flex items-start gap-2">
                <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                <span>Detection Failure: {error}</span>
              </div>
            )}

            {/* Dashboard Results Component */}
            <FirewallDashboard data={data} />

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Guidance sidebar card */}
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Info className="text-blue-400 w-4 h-4" />
                Dashboard Scope
              </h2>
              <ul className="space-y-3.5 list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Detects active Web Application Firewall (WAF) products (e.g. Cloudflare, AWS WAF).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Audits custom server-side signature cookies and matched response headers.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Validates presence of security headers (CSP, HSTS) to compute protection levels.
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
