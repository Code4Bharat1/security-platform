"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  CheckCircle,
  AlertCircle,
  Loader2,
  Globe,
  MapPin,
  Shield,
  CircleSlash,
  Check,
  Download,
  FileText,
  RefreshCw,
  Info,
  Terminal,
  Database
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";
import { generateReverseDnsPDF } from "./generateReverseDnsPDF";

function isValidIP(ip) {
  const ipv4 =
    /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
  const ipv6 =
    /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(([0-9a-fA-F]{1,4}:){1,7}:)|(([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4})|(([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2})|(([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3})|(([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4})|(([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5})|(([0-9a-fA-F]{1,4}:){1}(:[0-9a-fA-F]{1,4}){1,6})|(:((:[0-9a-fA-F]{1,4}){1,7}|:)))$/;
  return ipv4.test(ip) || ipv6.test(ip);
}

const apiBase = (process.env.NEXT_PUBLIC_PROD_API_URL || "").replace(/\/$/, "");

export default function ReverseDNSLookup() {
  const [ip, setIp] = useState("");
  const [valid, setValid] = useState(false);
  const [validationMsg, setValidationMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null); // full enriched response
  const [err, setErr] = useState("");

  const protectedAction = useProtectedAction();

  useEffect(() => {
    if (!ip) {
      setValid(false);
      setValidationMsg("");
      return;
    }
    if (isValidIP(ip.trim())) {
      setValid(true);
      setValidationMsg("");
    } else {
      setValid(false);
      setValidationMsg("Please enter a valid IPv4 or IPv6 address.");
    }
  }, [ip]);

  const blacklistSummary = useMemo(() => {
    if (data?.blacklistSummary) return data.blacklistSummary;
    const zones = data?.blacklist?.results || [];
    const listed = zones.filter((z) => z.listed).length;
    const checked = zones.length;
    let score = listed * 20; // fallback calculation
    let risk = "Clean";
    let action = "No action required. IP appears reputable.";
    if (score >= 80) {
      risk = "Critical";
      action = "Block IP immediately; execute standard incident response procedures.";
    } else if (score >= 40) {
      risk = "High";
      action = "Restrict traffic from this IP address; initiate active security monitoring.";
    } else if (score >= 20) {
      risk = "Medium";
      action = "Investigate for potential false positive or temporary SMTP/network issue.";
    }
    return {
      flagged: listed,
      checked,
      reputationScore: score,
      riskLevel: risk,
      recommendedAction: action
    };
  }, [data]);

  const blacklists = useMemo(() => {
    if (data?.blacklists) return data.blacklists;
    const zones = data?.blacklist?.results || [];
    return zones.map((z) => {
      const namePart = z.zone.split(".")[0];
      const displayName = namePart === "zen" ? "Spamhaus Zen" : namePart === "bl" ? "SpamCop" : namePart === "bl" ? "Barracuda BRBL" : namePart === "dnsbl" ? "SORBS" : namePart === "cbl" ? "CBL" : z.zone;
      return {
        name: displayName,
        status: z.listed ? "Listed" : "Clear",
        severity: z.listed ? "High" : "Low",
        reason: z.listed ? `IP listed on zone ${z.zone}` : "No active listing found.",
        confidence: "High",
        sourceType: "DNSBL",
        lastSeen: z.listed ? new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"
      };
    });
  }, [data]);

  const forwardVerdict = useMemo(() => {
    const arr = data?.forwardValidation || [];
    if (!arr.length) return { verified: false, suspicious: false };
    const anySuspicious = arr.some((v) => v.matches === false);
    const allMissing = arr.every((v) => v.matches === false);
    return {
      verified: !anySuspicious && arr.length > 0,
      suspicious: anySuspicious || allMissing,
    };
  }, [data]);

  async function lookup() {
    setLoading(true);
    setErr("");
    setData(null);
    await protectedAction(async (userToken) => {
      try {
        const res = await fetch(`${apiBase}/reverse/reverse-dns`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({ ip: ip.trim() }),
        });
        const j = await res.json();
        if (!res.ok) throw new Error(j.error || res.statusText);
        
        if (!j.type && j.domains && !j.ptr) {
          setData({
            type: "PTR",
            ip: ip.trim(),
            ptr: j.domains,
            reverseName: "",
            ttl: null,
            ttlHuman: null,
            result: j.domains.length ? "dns lookup found" : "no ptr record",
            test: "public",
            blacklist: { supported: false, listed: false, results: [] },
            geo: null,
            asn: null,
            displayName: null,
            forwardValidation: [],
            timespan: null,
          });
        } else {
          setData(j);
        }
      } catch (e) {
        setErr(e.message || "Lookup failed");
      } finally {
        setLoading(false);
      }
    });
  }

  function human(val, empty = "—") {
    if (val === null || val === undefined || val === "") return empty;
    if (Array.isArray(val) && !val.length) return empty;
    return String(val);
  }

  function downloadTXT() {
    if (!data) return;
    const forward = data.forwardValidation || [];

    const lines = [
      "=== Reverse DNS Report ===",
      "",
      `Type: ${human(data.type, "PTR")}`,
      `IP: ${data.ip}${data.displayName ? " " + data.displayName : ""}`,
      `PTR: ${data.ptr?.join(", ") || "(none)"}`,
      `Reverse name: ${human(data.reverseName)}`,
      `TTL: ${human(data.ttlHuman)}`,
      `Result: ${human(data.result)}`,
      `Test: ${human(data.test, "public")}`,
      "",
      "--- IP Reputation Assessment ---",
      `Reputation Score: ${blacklistSummary.reputationScore} / 100`,
      `Blacklist Detection Rate: ${blacklistSummary.flagged} / ${blacklistSummary.checked} Blacklists Flagged`,
      `Risk Level: ${blacklistSummary.riskLevel}`,
      `Recommended Action: ${blacklistSummary.recommendedAction}`,
      "",
      "--- Geolocation ---",
      data.geo
        ? `Country: ${human(data.geo.country)}  Region: ${human(
            data.geo.region
          )}  City: ${human(data.geo.city)}  TZ: ${human(
            data.geo.timezone
          )}  Lat/Lon: ${human(data.geo.ll?.join(", "))}`
        : "(not available)",
      "",
      "--- ASN / WHOIS ---",
      data.asn
        ? `ASN: ${human(data.asn.asn)}  ORG: ${human(
            data.asn.org
          )}  ISP: ${human(data.asn.isp)}  CIDR: ${human(data.asn.cidr)}`
        : "(not available)",
      "",
      "--- Blacklists Checked ---",
      ...blacklists.map(
        (bl) =>
          `  - ${bl.name}: ${bl.status} [Severity: ${bl.severity}, Confidence: ${bl.confidence}]` + 
          `    Details: ${bl.reason} (Last Seen: ${bl.lastSeen})`
      ),
      "",
      "--- Forward Validation ---",
      ...forward.map(
        (f) =>
          `  - ${f.domain}: ${f.matches ? "VERIFIED" : "SUSPICIOUS"}  A=[${(
            f.resolved?.A || []
          ).join(", ")}] AAAA=[${(f.resolved?.AAAA || []).join(", ")}]`
      ),
      "",
      `Lookup time: ${human(data.timespan, "—")} ms`,
      "",
    ];

    const blob = new Blob([lines.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `reverse_dns_${data.ip}.txt`;
    a.click();
    a.remove();
  }

  function downloadPDF() {
    if (!data) return;
    generateReverseDnsPDF(data, blacklistSummary, blacklists);
  };

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
            <Globe className="h-8 w-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              REVERSE DNS <span className="text-blue-400">RESOLVER</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Perform IP-to-Domain lookup checks, fetch autonomous system registration (ASN/WHOIS), locate geographic scopes, and check global spam/threat feeds.
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
                IP Target Parameters
              </h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="rdns-ip-input" className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                    IP Address
                  </label>
                  <div className="relative">
                    <input
                      id="rdns-ip-input"
                      type="text"
                      placeholder="e.g. 8.8.8.8 or 2001:4860:4860::8888"
                      value={ip}
                      onChange={(e) => setIp(e.target.value)}
                      className={`w-full bg-zinc-900/40 text-zinc-100 border p-3.5 pl-12 rounded-xl text-sm focus:outline-none transition-all font-mono ${
                        validationMsg
                          ? "border-red-500/40 focus:border-red-500/70 focus:ring-1 focus:ring-red-500/30"
                          : valid
                          ? "border-blue-500/40 focus:border-blue-500/70 focus:ring-1 focus:ring-blue-500/30 focus:shadow-[0_0_12px_rgba(59,130,246,0.08)]"
                          : "border-zinc-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
                      }`}
                    />
                    <Globe
                      className={`absolute left-4 top-[24px] -translate-y-1/2 w-5 h-5 transition-colors ${
                        validationMsg
                          ? "text-red-400"
                          : valid
                          ? "text-blue-400"
                          : "text-zinc-600"
                      }`}
                    />
                    {valid && (
                      <CheckCircle className="absolute right-4 top-[24px] -translate-y-1/2 w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                  {validationMsg && (
                    <div className="flex items-center gap-2 mt-2 text-red-400 text-xs font-mono">
                      <AlertCircle className="w-3.5 h-3.5" /> {validationMsg}
                    </div>
                  )}
                </div>

                {/* Buttons Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={lookup}
                    disabled={!valid || loading}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-black rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2 focus:ring-offset-black/20 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" /> Looking up...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 text-black" /> Perform Lookup
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setIp("");
                      setData(null);
                      setErr("");
                    }}
                    className="px-5 py-4 bg-zinc-900/40 hover:bg-blue-500/5 text-zinc-300 hover:text-blue-400 border border-zinc-800/80 hover:border-blue-500/30 rounded-xl font-mono font-bold text-xs uppercase transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                    title="Reset"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Error output */}
            {err && (
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-950/10 text-red-400 text-xs font-mono flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>Error: {err}</span>
              </div>
            )}

            {/* Results block */}
            {data && (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-blue-500/10 transition-all duration-300 space-y-6">
                
                {/* Header title and exporters */}
                <div className="flex items-center justify-between gap-4 flex-wrap border-b border-zinc-800/40 pb-4">
                  <div>
                    <h3 className="text-lg font-mono font-bold text-zinc-100 uppercase tracking-wider">
                      Lookup Resolution Summary
                    </h3>
                    <p className="text-xs font-mono text-zinc-500 mt-0.5">
                      Target IP: {data.ip}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={downloadPDF}
                      className="px-4 py-2.5 bg-zinc-900/40 hover:bg-blue-500/5 text-zinc-300 hover:text-blue-400 border border-zinc-800/80 hover:border-blue-500/30 rounded-xl font-mono font-bold text-xs uppercase transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      PDF Report
                    </button>
                    <button
                      onClick={downloadTXT}
                      className="px-4 py-2.5 bg-zinc-900/40 hover:bg-blue-500/5 text-zinc-300 hover:text-blue-400 border border-zinc-800/80 hover:border-blue-500/30 rounded-xl font-mono font-bold text-xs uppercase transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      TXT Report
                    </button>
                  </div>
                </div>



                {/* Grid details cards */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl font-mono text-xs">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-semibold mb-1 block">
                      Record Type
                    </span>
                    <span className="font-semibold text-zinc-200">
                      {data.type || "PTR"}
                    </span>
                  </div>

                  <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl font-mono text-xs">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-semibold mb-1 block">
                      IP Scope
                    </span>
                    <span className="font-semibold text-zinc-250 truncate block">
                      {data.ip}{data.displayName ? ` ${data.displayName}` : ""}
                    </span>
                  </div>

                  <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl font-mono text-xs">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-semibold mb-1 block">
                      TTL Record
                    </span>
                    <span className="font-semibold text-zinc-200">
                      {human(data.ttlHuman) || human(data.ttl ? `${data.ttl}s` : null)}
                    </span>
                  </div>

                  <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl font-mono text-xs">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-semibold mb-1 block">
                      Result Msg
                    </span>
                    <span className="font-semibold text-zinc-250 truncate block">
                      {human(data.result, "dns lookup found")}
                    </span>
                  </div>

                  <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl font-mono text-xs">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-semibold mb-1 block">
                      Test Class
                    </span>
                    <span className="font-semibold text-zinc-200">
                      {human(data.test, "public")}
                    </span>
                  </div>

                  <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl font-mono text-xs">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-semibold mb-1 block">
                      Reverse Hostname
                    </span>
                    <span className="font-semibold text-zinc-250 truncate block" title={data.reverseName}>
                      {human(data.reverseName)}
                    </span>
                  </div>
                </div>

                {/* PTR domains list */}
                <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl font-mono text-xs">
                  <h3 className="text-sm font-mono font-bold text-blue-400 mb-2 border-b border-zinc-800/40 pb-2 flex items-center gap-1.5">
                    <Database className="w-4 h-4" />
                    PTR Domains List
                  </h3>
                  {data.ptr?.length ? (
                    <ul className="space-y-1.5 list-none pl-0">
                      {data.ptr.map((d) => (
                        <li key={d} className="flex items-center gap-2">
                          <span className="inline-block w-1 h-1 rounded-full bg-blue-500/60" />
                          <code className="text-zinc-300 font-mono">{d}</code>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-zinc-550">No PTR records returned.</div>
                  )}
                </div>

                {/* Geolocation + ASN WHOIS */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl font-mono text-xs">
                    <h3 className="text-sm font-mono font-bold text-zinc-100 mb-3 border-b border-zinc-800/40 pb-2 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      Geolocation
                    </h3>
                    {data.geo ? (
                      <div className="text-zinc-300 space-y-2">
                        <div className="flex justify-between border-b border-zinc-800/20 py-0.5">
                          <span className="text-zinc-450">Country:</span>
                          <span className="font-medium text-zinc-100">{human(data.geo.country)}</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-800/20 py-0.5">
                          <span className="text-zinc-450">Region / City:</span>
                          <span className="font-medium text-zinc-100">{human(data.geo.region)} / {human(data.geo.city)}</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-800/20 py-0.5">
                          <span className="text-zinc-450">Timezone:</span>
                          <span className="text-zinc-100">{human(data.geo.timezone)}</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-800/20 py-0.5">
                          <span className="text-zinc-450">Lat/Lon:</span>
                          <span className="text-zinc-100">{human(data.geo.ll?.join(", "))}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-zinc-550 font-mono">Not available.</div>
                    )}
                  </div>

                  <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl font-mono text-xs">
                    <h3 className="text-sm font-mono font-bold text-zinc-100 mb-3 border-b border-zinc-800/40 pb-2 flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-blue-400" />
                      ASN / WHOIS Metadata
                    </h3>
                    {data.asn ? (
                      <div className="text-zinc-300 space-y-2">
                        <div className="flex justify-between border-b border-zinc-800/20 py-0.5">
                          <span className="text-zinc-450">ASN:</span>
                          <span className="font-medium text-zinc-100">{human(data.asn.asn)}</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-800/20 py-0.5">
                          <span className="text-zinc-450">Org:</span>
                          <span className="text-zinc-100 max-w-[150px] truncate" title={data.asn.org}>{human(data.asn.org)}</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-800/20 py-0.5">
                          <span className="text-zinc-450">ISP:</span>
                          <span className="text-zinc-100 max-w-[150px] truncate" title={data.asn.isp}>{human(data.asn.isp)}</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-800/20 py-0.5">
                          <span className="text-zinc-450">CIDR:</span>
                          <span className="text-zinc-100">{human(data.asn.cidr)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-zinc-550 font-mono">Not available.</div>
                    )}
                  </div>
                </div>

                {/* Table reputation details */}
                <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-5 shadow-lg space-y-4">
                  <div className="font-semibold text-sm text-zinc-200 flex items-center gap-2 border-b border-zinc-800/40 pb-3">
                    <Globe className="w-4 h-4 text-blue-400" />
                    IP Reputation & Blacklist Database Details
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-800/80 text-zinc-400 text-[10px] font-bold uppercase tracking-wider py-2.5 px-3 font-mono">
                          <th className="py-2.5 px-3">Blacklist Feed</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Severity</th>
                          <th className="py-2.5 px-3">Confidence</th>
                          <th className="py-2.5 px-3">Observed Threat Intel</th>
                          <th className="py-2.5 px-3">Last Seen</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-850 text-xs font-mono text-zinc-300">
                        {blacklists.map((bl) => (
                          <tr key={bl.name} className="hover:bg-blue-500/5 transition-colors">
                            <td className="py-3 px-3 font-semibold text-zinc-100">{bl.name}</td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full font-mono uppercase tracking-wider ${
                                bl.status === "Listed"
                                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                  : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              }`}>
                                {bl.status}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`font-semibold ${
                                bl.severity === "High"
                                  ? "text-red-400"
                                  : bl.severity === "Medium"
                                  ? "text-orange-400"
                                  : bl.severity === "Low"
                                  ? "text-blue-400"
                                  : "text-zinc-550"
                              }`}>
                                {bl.severity}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-zinc-400">{bl.confidence}</td>
                            <td className="py-3 px-3 text-[11px] text-zinc-450 max-w-[200px] truncate" title={bl.reason}>
                              {bl.reason}
                            </td>
                            <td className="py-3 px-3 text-[11px] text-zinc-550">{bl.lastSeen}</td>
                          </tr>
                        ))}
                        {!blacklists.length && (
                          <tr>
                            <td colSpan="6" className="py-4 text-center text-zinc-550 font-mono">
                              No blacklists checked.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Forward DNS Validation */}
                <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl font-mono text-xs space-y-4">
                  <h3 className="text-sm font-mono font-bold text-zinc-100 border-b border-zinc-800/40 pb-2 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-blue-400" />
                    Forward DNS Validation Checks
                  </h3>

                  <div className="text-xs">
                    {forwardVerdict.verified ? (
                      <span className="inline-flex items-center gap-1.5 text-blue-400 bg-blue-500/10 border border-blue-500/30 rounded-xl p-3.5 w-full">
                        <Check className="w-4 h-4 text-blue-400" /> 
                        All reverse → forward mappings verified back to {data.ip}
                      </span>
                    ) : forwardVerdict.suspicious ? (
                      <span className="inline-flex items-center gap-1.5 text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl p-3.5 w-full">
                        <AlertCircle className="w-4 h-4 text-red-400" /> 
                        Suspicious: at least one reverse → forward mapping did not point back to {data.ip}
                      </span>
                    ) : (
                      <span className="text-zinc-550">
                        No forward resolution logs found.
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {(data.forwardValidation || []).map((f) => (
                      <div
                        key={f.domain}
                        className={`p-3.5 rounded-xl border text-xs font-mono ${
                          f.matches
                            ? "bg-zinc-900/40 border-zinc-800/80 text-zinc-200"
                            : "bg-red-950/20 border-red-500/20 text-red-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <code className="font-mono">{f.domain}</code>
                          {f.matches ? (
                            <Check className="w-4 h-4 text-blue-450" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-405" />
                          )}
                        </div>
                        <div className="mt-1.5 text-[10px] text-zinc-500">
                          A=[{(f.resolved?.A || []).join(", ")}] AAAA=[
                          {(f.resolved?.AAAA || []).join(", ")}]
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Guidance sidebar card */}
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Info className="text-blue-400 w-4 h-4" />
                Resolution Scope
              </h2>
              <ul className="space-y-3.5 list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Performs standard Pointer (PTR) record queries on target network IP interfaces.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Executes dynamic forward mapping matching to verify hosting provider authenticity.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Audits global IP databases for blacklist status, location origins, and network ASNs.
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
