"use client";

import { useState, useCallback } from "react";
import {
  LocateFixed,
  Globe,
  Network,
  ShieldAlert,
  Search,
  Info,
  Loader2,
  XCircle,
  ShieldCheck,
  MapPin,
  Clock,
  Download,
} from "lucide-react";
import axios from "axios";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";
import { generateIpPDF } from "./generateIpPDF";

export default function IPInfoFinder() {
  const [ip, setIp] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState(null);
  const [error, setError] = useState("");
  const protectedAction = useProtectedAction();

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!ip.trim()) return;

      setLoading(true);
      setError(null);
      setInfo(null);
      await protectedAction(async (userToken) => {
        try {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_PROD_API_URL}/ipinfo/`,
            { ip },
            { headers: { Authorization: `Bearer ${userToken}` } }
          );
          setInfo(res.data);
        } catch (err) {
          setError(err.response?.data?.error || "Failed to fetch IP information.");
        } finally {
          setLoading(false);
        }
      });
    },
    [ip, protectedAction]
  );



  function exportTXT() {
    if (!info) return;
    const lines = [
      "==================================================",
      `🛡️ ASSESSMENT REPORT: IP INTELLIGENCE LOOKUP 🛡️`,
      "==================================================",
      `IP Address:           ${info.basicInformation?.ipAddress}`,
      `Classification:       ${info.basicInformation?.ipClass}`,
      `Scan Date:            ${info.reportGeneratedAt || new Date().toLocaleString()}`,
      `Overall Rating:       ${info.overallSecurityRating?.toUpperCase()}`,
      "--------------------------------------------------",
      "",
      "[1. BASIC INFORMATION]",
      `• IP Address:         ${info.basicInformation?.ipAddress}`,
      `• IP Version:         ${info.basicInformation?.version}`,
      `• Reverse DNS:        ${info.dnsInformation?.reverseDNS}`,
      `• Hostname:           ${info.basicInformation?.hostname}`,
      `• Classification:     ${info.basicInformation?.ipClass}`,
      "",
      "[2. LOCATION DATA]",
      `• Country:            ${info.locationData?.country}`,
      `• Region:             ${info.locationData?.region}`,
      `• City:               ${info.locationData?.city}`,
      `• Timezone:           ${info.locationData?.timezone}`,
      `• Latitude:           ${info.locationData?.latitude}`,
      `• Longitude:          ${info.locationData?.longitude}`,
      "",
      "[3. NETWORK DETAILS]",
      `• ISP:                ${info.networkDetails?.isp}`,
      `• Organization:       ${info.networkDetails?.organization}`,
      `• ASN:                ${info.networkDetails?.asn}`,
      "",
      "[4. SECURITY & THREAT INTELLIGENCE]",
      `• Overall Rating:     ${info.overallSecurityRating}`,
      `• Risk Score (0-100): ${info.securityThreatIntel?.riskScore}`,
      `• Proxy/VPN:          ${info.securityThreatIntel?.proxyOrVpn}`,
      `• Tor Exit Node:      ${info.securityThreatIntel?.torExitNode}`,
      `• Blacklist Status:   ${info.securityThreatIntel?.blacklistStatus}`,
      `• Malware Detection:  ${info.securityThreatIntel?.malwareHostingHistory}`,
      `• Spam Reports:       ${info.securityThreatIntel?.spamReports || 0}`,
      "",
      "[5. RECOMMENDATIONS]",
      ...(info.recommendations || []).map((r, idx) => `${idx + 1}. ${r}`),
      "",
      "=================================================="
    ];

    const blob = new Blob([lines.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ip-intelligence-report-${info.basicInformation?.ipAddress}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function exportPDF() {
    generateIpPDF(info);
  }

  return (
    <div
      className="tool-detail-page min-h-screen"
      style={{
        "--hero-ambient-a": "rgba(16, 185, 129, 0.08)",
        "--hero-ambient-b": "rgba(16, 185, 129, 0.03)",
        "--glow-primary": "0 0 34px rgba(16, 185, 129, 0.16)",
        "--gold": "#10b981",
        "--gold-strong": "#34d399",
        "--gold-dark": "#047857",
        "--ring": "rgba(16, 185, 129, 0.34)",
        "--surface-glow": "rgba(16, 185, 129, 0.14)",
      }}
    >
      <style>{`
        .tool-detail-page table {
          display: table !important;
          width: 100% !important;
        }
        .tool-detail-page .tool-detail-shell {
          padding-top: 3.5rem !important;
        }
        .tool-detail-page ::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.35) !important;
        }
        .tool-detail-page ::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.55) !important;
        }
        .tool-detail-page ::selection {
          background: rgba(16, 185, 129, 0.22) !important;
          color: #e6fffa !important;
        }
        .tool-detail-page .tool-detail-panel,
        .tool-detail-page .bg-gray-900,
        .tool-detail-page .bg-zinc-900\/70,
        .tool-detail-page .bg-black\/60,
        .tool-detail-page .bg-gray-800,
        .tool-detail-page .bg-black\/30 {
          background:
            radial-gradient(circle at center, rgba(16, 185, 129, 0.04), transparent 55%),
            linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)) !important;
          box-shadow:
            inset 0 0 0 1px rgba(255,255,255,0.01),
            0 0 40px rgba(16, 185, 129, 0.04) !important;
          border-color: rgba(16, 185, 129, 0.12) !important;
        }
      `}</style>

      <div className="tool-detail-shell">
        {/* Top Badge */}
        <div className="flex justify-end mb-8">
          <span className="rounded-full border border-emerald-500/30 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-emerald-400">
            Green Team
          </span>
        </div>

        {/* Title Block */}
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl border border-emerald-500/30 overflow-hidden shadow-lg flex-shrink-0 flex items-center justify-center">
            <LocateFixed className="h-8 w-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              IP ADDRESS <span className="text-emerald-400">INFO FINDER</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Retrieve real-time location details, routing blocks, autonomous systems, and threat intelligence scores for any IP address.
            </p>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Input Form Card */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-emerald-500/10 transition-all duration-300">
              <h2 className="text-lg font-mono font-medium text-zinc-100 mb-6 flex items-center gap-2">
                <Search className="h-5 w-5 text-emerald-400" />
                IP Intelligence Lookup
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-mono text-zinc-400 mb-2 font-semibold">
                    IP Address or Domain
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="e.g. 8.8.8.8, google.com, or https://web.whatsapp.com/"
                      value={ip}
                      onChange={(e) => setIp(e.target.value)}
                      disabled={loading}
                      className="w-full pl-10 bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 focus:shadow-[0_0_12px_rgba(16,185,129,0.08)] focus:outline-none transition-all placeholder:text-zinc-600 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={loading || !ip.trim()}
                    className="w-full bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/50 rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-2 focus:ring-offset-black/20 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Fetching IP Data...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4" />
                        Get IP Info
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Loading Indicator */}
            {loading && (
              <div className="flex flex-col items-center justify-center p-10 bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.15)] animate-pulse">
                <Loader2 className="h-8 w-8 text-emerald-400 animate-spin mb-4" />
                <p className="text-emerald-400 font-mono font-bold text-xs uppercase tracking-widest text-center">
                  Retrieving Target IP details...
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="rounded-xl border border-rose-500/25 bg-rose-500/5 p-4 text-rose-400">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider mb-1">Lookup Error</div>
                    <div className="text-xs text-rose-300">{error}</div>
                  </div>
                </div>
              </div>
            )}

            {/* IP Intelligence Report Output */}
            {info && !loading && (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_12px_40px_rgb(0,0,0,0.2)] space-y-6 hover:border-emerald-500/10 transition-all duration-300">
                {/* Report Header */}
                <div className="border-b border-zinc-800/50 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                    <span className="font-mono font-bold text-sm uppercase tracking-wider text-emerald-400">
                      IP Intelligence Report
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {info.reportGeneratedAt && (
                      <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-[11px]">
                        <Clock size={12} />
                        {info.reportGeneratedAt}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={exportTXT}
                        className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-300 hover:text-emerald-400 hover:border-emerald-500/30 transition flex items-center gap-1 cursor-pointer"
                      >
                        TXT
                      </button>
                      <button
                        onClick={exportPDF}
                        className="bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/50 px-3.5 py-1.5 rounded-xl transition-all duration-300 font-mono font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] focus:outline-none"
                      >
                        <Download size={14} /> PDF Report
                      </button>
                    </div>
                  </div>
                </div>

                {/* Overall Security Rating Gauge */}
                <div className="bg-zinc-900/40 rounded-xl p-4 border border-zinc-800/60 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-1">Overall Security Rating</div>
                    <div className="text-xs font-mono font-bold text-zinc-200">
                      IP Status: <span className={
                        info.overallSecurityRating === "Safe" ? "text-emerald-400" :
                        info.overallSecurityRating === "Low Risk" ? "text-emerald-300" :
                        info.overallSecurityRating === "Medium Risk" ? "text-amber-400" : "text-rose-400"
                      }>{info.overallSecurityRating}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-1">Risk Score</div>
                    <div className={`text-sm font-mono font-bold ${
                      info.securityThreatIntel?.riskScore > 75 ? "text-rose-400" :
                      info.securityThreatIntel?.riskScore > 45 ? "text-amber-400" : "text-emerald-400"
                    }`}>
                      {info.securityThreatIntel?.riskScore}/100
                    </div>
                  </div>
                </div>

                {/* Section 1: Basic Information */}
                <div className="space-y-3">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 text-emerald-400" />
                    Basic Information
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      ["IP Address", info.basicInformation?.ipAddress],
                      ["IP Version", info.basicInformation?.version],
                      ["Reverse DNS", info.basicInformation?.reverseDNS],
                      ["Hostname", info.basicInformation?.hostname],
                      ["Classification", info.basicInformation?.ipClass],
                    ].map(([label, val]) => (
                      <div key={label} className="bg-zinc-900/30 rounded-xl p-3.5 border border-zinc-800/50">
                        <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-1">{label}</div>
                        <div className="text-xs text-zinc-300 font-mono break-all">{val || "Not Available"}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 2: Location Data */}
                <div className="space-y-3">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                    Location Data
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      ["Country", info.locationData?.country],
                      ["Region", info.locationData?.region],
                      ["City", info.locationData?.city],
                      ["Timezone", info.locationData?.timezone],
                      ["Latitude", info.locationData?.latitude],
                      ["Longitude", info.locationData?.longitude],
                    ].map(([label, val]) => (
                      <div key={label} className="bg-zinc-900/30 rounded-xl p-3.5 border border-zinc-800/50">
                        <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-1">{label}</div>
                        <div className="text-xs text-zinc-300 font-mono break-all">{val === undefined || val === null ? "Not Available" : String(val)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 3: Network Details */}
                <div className="space-y-3">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                    <Network className="h-3.5 w-3.5 text-emerald-400" />
                    Network Details
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      ["ISP", info.networkDetails?.isp],
                      ["Organization", info.networkDetails?.organization],
                      ["ASN", info.networkDetails?.asn],
                    ].map(([label, val]) => (
                      <div key={label} className="bg-zinc-900/30 rounded-xl p-3.5 border border-zinc-800/50">
                        <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-1">{label}</div>
                        <div className="text-xs text-zinc-300 font-mono break-all">{val || "Not Available"}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 4: Security & Threat Intelligence */}
                {info.securityThreatIntel && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                      <ShieldAlert className="h-3.5 w-3.5 text-emerald-400" />
                      Security & Threat Intelligence
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="bg-zinc-900/30 rounded-xl p-3.5 border border-zinc-800/50">
                        <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-1.5">Proxy/VPN</div>
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${
                          info.securityThreatIntel.proxyOrVpn === "Yes"
                            ? "bg-rose-950/20 text-rose-400 border-rose-500/25"
                            : "bg-emerald-950/20 text-emerald-400 border-emerald-500/25"
                        }`}>
                          {info.securityThreatIntel.proxyOrVpn || "No"}
                        </span>
                      </div>

                      <div className="bg-zinc-900/30 rounded-xl p-3.5 border border-zinc-800/50">
                        <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-1.5">Tor Exit Node</div>
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${
                          info.securityThreatIntel.torExitNode === "Yes"
                            ? "bg-rose-950/20 text-rose-400 border-rose-500/25"
                            : "bg-emerald-950/20 text-emerald-400 border-emerald-500/25"
                        }`}>
                          {info.securityThreatIntel.torExitNode || "No"}
                        </span>
                      </div>

                      <div className="bg-zinc-900/30 rounded-xl p-3.5 border border-zinc-800/50">
                        <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-1.5">Blacklist Status</div>
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${
                          info.securityThreatIntel.blacklistStatus === "Listed"
                            ? "bg-rose-950/20 text-rose-400 border-rose-500/25"
                            : "bg-emerald-950/20 text-emerald-400 border-emerald-500/25"
                        }`}>
                          {info.securityThreatIntel.blacklistStatus || "Not Listed"}
                        </span>
                      </div>

                      <div className="bg-zinc-900/30 rounded-xl p-3.5 border border-zinc-800/50">
                        <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-1.5">Malware Detection</div>
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${
                          info.securityThreatIntel.malwareHostingHistory === "Detected"
                            ? "bg-rose-950/20 text-rose-400 border-rose-500/25"
                            : "bg-emerald-950/20 text-emerald-400 border-emerald-500/25"
                        }`}>
                          {info.securityThreatIntel.malwareHostingHistory || "None Detected"}
                        </span>
                      </div>

                      {[
                        ["Spam Reports", info.securityThreatIntel.spamReports],
                      ].map(([label, val]) => (
                        <div key={label} className="bg-zinc-900/30 rounded-xl p-3.5 border border-zinc-800/50">
                          <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-1">{label}</div>
                          <div className="text-xs text-zinc-300 font-mono break-all">{val ?? "0"}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section 5: Recommendations */}
                {info.recommendations && info.recommendations.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                      Recommendations
                    </h3>
                    <div className="bg-zinc-900/30 rounded-xl p-4 border border-zinc-800/50 space-y-2.5">
                      {info.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-zinc-300 font-mono leading-relaxed">
                          <span className="text-emerald-400 font-bold mt-0.5">•</span>
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Guidance Card */}
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Info className="h-4 w-4 text-emerald-400" />
                IP Finder Scope
              </h4>
              <ul className="space-y-3.5 list-none pl-0">
                {[
                  "Resolves hostname configurations and checks reverse DNS mappings.",
                  "Pinpoints latitude, longitude, region, and country parameters.",
                  "Identifies autonomous system paths (ASN) and routing configurations.",
                  "Details ISP allocation blocks and CIDR block metrics.",
                  "Inspects node headers to verify proxy or VPN active indicators.",
                  "Queries live indexes to flag Tor entry or exit nodes.",
                  "Cross-checks threat databases for spam reports and malware logs.",
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/60 mt-1.5 flex-shrink-0" />
                    <span className="text-xs text-zinc-400 leading-relaxed">{text}</span>
                  </li>
                ))}
              </ul>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}
