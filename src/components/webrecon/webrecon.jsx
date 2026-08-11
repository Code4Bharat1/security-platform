"use client";

import { useMemo, useState } from "react";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";
import { generateWebsiteReconPDF } from "./generateWebsiteReconPDF";
import { generateDnsPDF } from "./generateDnsPDF";
import OwnershipVerificationWizard from "@/components/ownership/OwnershipVerificationWizard";
import {
  Globe,
  Search,
  Filter,
  ShieldAlert,
  Award,
  FileText,
  Loader2,
  Key,
  Info,
  Terminal,
  ChevronDown,
  CheckCircle2,
  Server,
  Download,
  FileSpreadsheet,
  MapPin,
  ShieldCheck,
  Activity,
  Layers,
  Database
} from "lucide-react";

const dnsTypeMap = { 1: "A", 28: "AAAA", 15: "MX", 16: "TXT", 2: "NS" };
const RECORD_TYPES = ["ALL", "A", "AAAA", "MX", "TXT", "NS"];
const TECH_GROUPS = [
  { key: "frontend", label: "Frontend" },
  { key: "backend", label: "Backend" },
  { key: "infrastructure", label: "Infrastructure" },
  { key: "analytics", label: "Analytics" },
  { key: "payments", label: "Payments" },
];

const getTypeName = (n) => dnsTypeMap[n] || `Type ${n}`;
const normalizeDomain = (value) =>
  String(value).trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "");

const flattenTechnologies = (tech = {}) =>
  TECH_GROUPS.flatMap(({ key, label }) =>
    (tech[key] || []).map((item) => ({ label, value: item }))
  );

const getPortTone = (state) => {
  if (state === "open") return "text-red-400 font-bold";
  if (state === "closed") return "text-zinc-600";
  if (state === "filtered") return "text-orange-400 font-medium";
  return "text-zinc-500";
};

export default function Webrecon() {
  const SKIP_DOMAIN_VERIFICATION_FOR_TESTING = true;

  const protectedAction = useProtectedAction();
  const [domain, setDomain] = useState("");
  const [recordType, setRecordType] = useState("ALL");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [scan, setScan] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState("");
  const [ownershipVerified, setOwnershipVerified] = useState(false);

  const API_BASE = useMemo(
    () => process.env.NEXT_PUBLIC_PROD_API_URL?.replace(/\/+$/, "") || "",
    []
  );

  const handleLookup = async () => {
    await protectedAction(async (token) => {
      setError("");
      setResult(null);

      const target = normalizeDomain(domain);
      if (!target) {
        setError("Please enter a domain");
        return;
      }

      setLoading(true);
      try {
        if (recordType === "ALL") {
          const types = ["A", "AAAA", "MX", "TXT", "NS"];
          const responses = await Promise.all(
            types.map(async (type) => {
              try {
                const res = await fetch(`${API_BASE}/dns/resolve`, {
                  method: "POST",
                  headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                  },
                  body: JSON.stringify({ domain: target, type }),
                });
                const data = await res.json();
                return { type, data: data.success ? data.data : null };
              } catch (_) {
                return { type, data: null };
              }
            })
          );

          const combinedAnswer = [];
          responses.forEach(({ data }) => {
            if (data && Array.isArray(data.Answer)) {
              combinedAnswer.push(...data.Answer);
            }
          });

          setResult({ Answer: combinedAnswer });
        } else {
          const res = await fetch(`${API_BASE}/dns/resolve`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ domain: target, type: recordType }),
          });
          const data = await res.json();
          if (!res.ok || !data?.success) {
            throw new Error(data?.error || `Request failed (${res.status})`);
          }
          setResult(data.data);
        }
      } catch (err) {
        setError(err?.message || "Error fetching DNS data");
      } finally {
        setLoading(false);
      }
    });
  };

  const handleDeepScan = async () => {
    await protectedAction(async (token) => {
      setScanError("");
      setScan(null);
      setScanLoading(true);

      const target = normalizeDomain(domain);
      if (!target) {
        setScanError("Please enter a domain");
        setScanLoading(false);
        return;
      }
      if (!ownershipVerified && !SKIP_DOMAIN_VERIFICATION_FOR_TESTING) {
        setScanError("Verify ownership of this domain before running the deep scan.");
        setScanLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/dns/recon-scan`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ domain: target }),
        });

        const data = await res.json();
        if (!res.ok || !data?.success) {
          throw new Error(data?.error || `Request failed (${res.status})`);
        }

        setScan(data);
      } catch (err) {
        setScanError(err?.message || "Deep scan failed");
      } finally {
        setScanLoading(false);
      }
    });
  };

  const downloadCSV = () => {
    if (!scan) return;

    const techRows = flattenTechnologies(scan.technologies).map(
      (item) => `Technology,${item.label},${item.value}`
    );
    const headerRows = (scan.securityHeaders?.missing || []).map(
      (item) => `Security Headers,Missing,${item}`
    );
    const portRows = (scan.ports?.results || []).map(
      (item) => `Ports,${item.port},${item.service} (${item.state})`
    );

    const csvContent = [
      "Section,Key,Value",
      `WHOIS,Registrar,${scan.whois?.registrar || "-"}`,
      `WHOIS,Created,${scan.whois?.created || "-"}`,
      `WHOIS,Expires,${scan.whois?.expires || "-"}`,
      `SSL,Issuer,${scan.ssl?.issuer || "-"}`,
      `SSL,Valid Till,${scan.ssl?.validTo || "-"}`,
      `SSL,Protocol,${scan.ssl?.protocol || "-"}`,
      `GeoIP,IP,${scan.geoip?.ip || "-"}`,
      `GeoIP,Country,${scan.geoip?.country || "-"}`,
      `GeoIP,ISP,${scan.geoip?.isp || "-"}`,
      `Persistence,Saved,${scan.persistence?.saved ? "Yes" : "No"}`,
      ...techRows,
      ...headerRows,
      ...portRows,
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "website_recon.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    if (!scan) return;
    generateWebsiteReconPDF(scan, null);
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
        {/* Navigation Top Badge */}
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
              WEBSITE RECON <span className="text-red-400">TOOL</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Perform in-depth active reconnaissance of targeted websites to inspect host metadata, active portfolios, running services, and technology footprints.
            </p>
          </div>
        </div>

        {/* 2-Column Split Layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          
          {/* Left Column (Inputs, Settings, Logs & Results) */}
          <div className="space-y-6">
            
            {/* Form Card 1: DNS Lookup */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-red-500/10 transition-all duration-300 space-y-4">
              <h2 className="text-lg font-mono font-medium text-zinc-100 mb-2 flex items-center gap-2">
                <Database className="h-5 w-5 text-red-400" />
                DNS Records Lookup
              </h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="webrecon-target-domain" className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                    Target Domain
                  </label>
                  <input
                    id="webrecon-target-domain"
                    type="text"
                    placeholder="Enter domain (e.g., example.com)"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 text-sm focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 focus:outline-none transition-all placeholder:text-zinc-600 font-mono"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {RECORD_TYPES.map((rt) => {
                    const isSelected = recordType === rt;
                    return (
                      <label
                        key={rt}
                        onClick={() => setRecordType(rt)}
                        className={`flex items-center gap-3 text-sm cursor-pointer group p-3.5 rounded-xl border transition-all ${
                          isSelected
                            ? "border-red-500/50 bg-red-500/5 text-white"
                            : "border-zinc-800/80 bg-white/[0.01] text-zinc-300 hover:bg-white/[0.03] hover:border-zinc-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name="recordType"
                          checked={isSelected}
                          onChange={() => setRecordType(rt)}
                          className="text-red-500 focus:ring-red-500 bg-transparent border-zinc-700"
                        />
                        <span className="font-mono font-medium">{rt} Type</span>
                      </label>
                    );
                  })}
                </div>

                <button
                  onClick={handleLookup}
                  disabled={loading || !domain}
                  className="w-full bg-red-500 hover:bg-red-600 text-black rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] focus:outline-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      Resolving DNS Records...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 text-black" />
                      Execute DNS Lookup
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message for DNS Lookup */}
            {error && (
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-955/10 text-red-400 text-xs font-mono flex items-start gap-2">
                <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" />
                <span>Lookup Failure: {error}</span>
              </div>
            )}

            {/* DNS lookup results display */}
            {result && (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-850 pb-2.5 mb-4">
                  <h3 className="text-sm font-mono font-bold text-zinc-200 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-red-400" />
                    Resolved DNS Results ({recordType})
                  </h3>
                  <button
                    onClick={() => generateDnsPDF(result, domain, recordType)}
                    className="px-3 py-1.5 bg-zinc-900/40 hover:bg-red-500/5 text-zinc-350 hover:text-red-400 border border-zinc-800/80 hover:border-red-500/30 rounded-xl font-mono font-bold text-xs uppercase transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download DNS PDF
                  </button>
                </div>
                {Array.isArray(result.Answer) && result.Answer.length > 0 ? (
                  <div className="space-y-4">
                    {result.Answer.map((rec, i) => (
                      <div key={i} className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl font-mono text-xs text-zinc-300 space-y-1">
                        <div>
                          <span className="text-zinc-500">Name:</span> {rec.name}
                        </div>
                        <div>
                          <span className="text-zinc-500">Record Type:</span> {getTypeName(rec.type)}
                        </div>
                        <div>
                          <span className="text-zinc-500">TTL Cache Time:</span> {rec.TTL} seconds
                        </div>
                        <div className="break-all font-semibold text-red-450 mt-1">
                          <span className="text-zinc-500 font-normal">Data Value:</span> {rec.data}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-mono text-zinc-550 italic text-center py-4">
                    No DNS answers returned for this record type.
                  </p>
                )}
              </div>
            )}

            {/* Form Card 2: Deep Security Recon */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-red-500/10 transition-all duration-300 space-y-4">
              <h2 className="text-lg font-mono font-medium text-zinc-100 mb-2 flex items-center gap-2">
                <Activity className="h-5 w-5 text-red-400" />
                Deep Scanning Suite
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                Retrieve WHOIS parameters, SSL/TLS handshake configurations, web server architectures, missing security headers, Geo-IP locations, and common port sweeps.
              </p>

              <div className="space-y-4">
                <button
                  onClick={handleDeepScan}
                  disabled={scanLoading || !domain}
                  className="w-full bg-red-500 hover:bg-red-600 text-black rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] focus:outline-none"
                >
                  {scanLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      Running Deep Scan Suite...
                    </>
                  ) : (
                    <>
                      <Activity className="w-4 h-4 text-black" />
                      Run Deep Recon Scan
                    </>
                  )}
                </button>

                <OwnershipVerificationWizard
                  targetValue={domain}
                  targetLabel="Domain"
                  onVerifiedChange={setOwnershipVerified}
                />
              </div>
            </div>

            {/* Deep Scan Errors */}
            {scanError && (
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-955/10 text-red-400 text-xs font-mono flex items-start gap-2">
                <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" />
                <span>Deep Scan Error: {scanError}</span>
              </div>
            )}

            {/* Warnings Block */}
            {scan && scan.warnings?.length > 0 && (
              <div className="border border-orange-500/20 bg-orange-950/10 rounded-2xl p-6 space-y-3 font-mono">
                <h3 className="text-orange-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  Partial Scan Warnings
                </h3>
                <ul className="list-none pl-0 space-y-2 text-xs text-orange-355">
                  {scan.warnings.map((warning, index) => (
                    <li key={`${warning}-${index}`} className="flex items-start gap-2">
                      <span className="inline-block w-1 h-1 rounded-full bg-orange-500/60 mt-1.5 flex-shrink-0" />
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* DEEP SCAN DETAILS RESULTS */}
            {scan && (
              <div className="space-y-6">
                
                {/* Telemetry info header */}
                <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl font-mono text-xs flex flex-wrap justify-between gap-4">
                  <div className="text-zinc-400">
                    Audit URL: <span className="text-zinc-200 font-bold">{scan.urlUsed || "-"}</span>
                  </div>
                  <div className="text-zinc-400">
                    Persistence Logged:{" "}
                    <span className={scan.persistence?.saved ? "text-red-400 font-bold" : "text-zinc-550"}>
                      {scan.persistence?.saved ? "Active Database Link" : "No"}
                    </span>
                  </div>
                </div>

                {/* WHOIS and SSL Blocks */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* WHOIS */}
                  <div className="bg-zinc-950/20 border border-zinc-800/80 rounded-2xl p-6 font-mono text-xs space-y-3">
                    <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2 border-b border-zinc-850 pb-2">
                      <FileText className="w-4 h-4 text-red-400" />
                      WHOIS Identity Registry
                    </h3>
                    <div className="space-y-2 text-zinc-450">
                      <div>Registrar: <span className="text-zinc-300 font-semibold">{scan.whois?.registrar || "-"}</span></div>
                      <div>Created: <span className="text-zinc-300">{scan.whois?.created || "-"}</span></div>
                      <div>Updated: <span className="text-zinc-300">{scan.whois?.updated || "-"}</span></div>
                      <div>Expiry Date: <span className="text-zinc-300">{scan.whois?.expires || "-"}</span></div>
                      <div>
                        Privacy Masked:{" "}
                        <span className={scan.whois?.privacyProtected ? "text-red-400" : "text-zinc-400"}>
                          {scan.whois?.privacyProtected ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className="pt-1.5">
                        <span className="text-[10px] text-zinc-650 block mb-1">Nameservers Log</span>
                        <div className="bg-zinc-900/40 p-2 rounded-lg border border-zinc-800/50 space-y-1">
                          {scan.whois?.nameservers?.length ? (
                            scan.whois.nameservers.map((item) => (
                              <div key={item} className="text-[11px] text-zinc-350">{item}</div>
                            ))
                          ) : (
                            <div className="text-zinc-600">-</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SSL / TLS */}
                  <div className="bg-zinc-950/20 border border-zinc-800/80 rounded-2xl p-6 font-mono text-xs space-y-3">
                    <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2 border-b border-zinc-850 pb-2">
                      <ShieldCheck className="w-4 h-4 text-red-400" />
                      SSL / TLS Handshake Cert
                    </h3>
                    <div className="space-y-2 text-zinc-450">
                      <div>Authority: <span className="text-zinc-300 font-semibold">{scan.ssl?.issuer || "-"}</span></div>
                      <div>Subject CN: <span className="text-zinc-300">{scan.ssl?.subjectCN || "-"}</span></div>
                      <div>Issued On: <span className="text-zinc-300">{scan.ssl?.validFrom || "-"}</span></div>
                      <div>Expires On: <span className="text-zinc-300">{scan.ssl?.validTo || "-"}</span></div>
                      <div>TLS Version: <span className="text-red-450 font-bold">{scan.ssl?.protocol || "-"}</span></div>
                    </div>
                  </div>
                </div>

                {/* Tech Detection */}
                <div className="bg-zinc-950/20 border border-zinc-800/80 rounded-2xl p-6 font-mono text-xs space-y-4">
                  <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2 border-b border-zinc-850 pb-2">
                    <Layers className="w-4 h-4 text-red-400" />
                    Stack Technology footprint
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {TECH_GROUPS.map(({ key, label }) => (
                      <div key={key} className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-850">
                        <div className="text-zinc-300 font-bold mb-2 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60" />
                          {label}
                        </div>
                        <ul className="list-none pl-0 space-y-1 text-zinc-400">
                          {scan.technologies?.[key]?.length ? (
                            scan.technologies[key].map((item) => (
                              <li key={`${key}-${item}`} className="text-zinc-250 font-semibold">{item}</li>
                            ))
                          ) : (
                            <li className="text-zinc-650 italic">None detected</li>
                          )}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Security Headers */}
                <div className="bg-zinc-950/20 border border-zinc-800/80 rounded-2xl p-6 font-mono text-xs space-y-4">
                  <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2 border-b border-zinc-850 pb-2">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    Headers Vulnerabilities
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-zinc-450">
                    <div className="space-y-2">
                      <div>
                        HTTPS Redirects:{" "}
                        <span className={scan.securityHeaders?.redirect?.redirectsToHttps ? "text-red-400 font-bold" : "text-zinc-600"}>
                          {scan.securityHeaders?.redirect?.redirectsToHttps ? "Enforced" : "Fail"}
                        </span>
                      </div>
                      <div>
                        HSTS Active:{" "}
                        <span className={scan.securityHeaders?.hsts?.enabled ? "text-red-400 font-bold" : "text-zinc-600"}>
                          {scan.securityHeaders?.hsts?.enabled ? "Yes" : "No"}
                        </span>
                      </div>
                      <div>HSTS Max-Age: <span className="text-zinc-300">{scan.securityHeaders?.hsts?.maxAge ?? "-"}</span></div>
                      <div>Server Signature: <span className="text-zinc-300 font-semibold">{scan.securityHeaders?.server || "-"}</span></div>
                      <div>X-Powered-By: <span className="text-zinc-300">{scan.securityHeaders?.xPoweredBy || "-"}</span></div>
                    </div>

                    <div>
                      <div className="text-[10px] text-zinc-650 font-bold uppercase tracking-wider mb-2">
                        Missing Critical Protection Headers
                      </div>
                      <div className="bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-850">
                        <ul className="list-none pl-0 space-y-2">
                          {scan.securityHeaders?.missing?.length ? (
                            scan.securityHeaders.missing.map((item) => (
                              <li key={item} className="flex items-center gap-2 text-red-400 font-medium">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 flex-shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-zinc-650 italic">None</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Geo-IP */}
                <div className="bg-zinc-950/20 border border-zinc-800/80 rounded-2xl p-6 font-mono text-xs space-y-3">
                  <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2 border-b border-zinc-850 pb-2">
                    <MapPin className="w-4 h-4 text-red-400" />
                    Target Network Geo-IP Location
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="bg-zinc-900/40 border border-zinc-850 p-3 rounded-xl">
                      <span className="text-[10px] text-zinc-600 block mb-1">Host IP</span>
                      <span className="text-zinc-200 font-bold">{scan.geoip?.ip || "-"}</span>
                    </div>
                    <div className="bg-zinc-900/40 border border-zinc-850 p-3 rounded-xl">
                      <span className="text-[10px] text-zinc-600 block mb-1">Location Coordinates</span>
                      <span className="text-zinc-200 font-medium">
                        {scan.geoip?.country || "-"}
                        {scan.geoip?.region ? `, ${scan.geoip.region}` : ""}
                        {scan.geoip?.city ? ` (${scan.geoip.city})` : ""}
                      </span>
                    </div>
                    <div className="bg-zinc-900/40 border border-zinc-850 p-3 rounded-xl">
                      <span className="text-[10px] text-zinc-600 block mb-1">ISP Provider</span>
                      <span className="text-zinc-200 font-medium">{scan.geoip?.isp || "-"}</span>
                    </div>
                  </div>
                </div>

                {/* DNS (A/AAAA/MX/TXT/NS) in scan */}
                <div className="bg-zinc-950/20 border border-zinc-800/80 rounded-2xl p-6 font-mono text-xs space-y-4">
                  <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2 border-b border-zinc-850 pb-2">
                    <Database className="w-4 h-4 text-red-400" />
                    Broad DNS Discovery Mapping
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {RECORD_TYPES.map((key) => (
                      <div key={key} className="bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-850">
                        <div className="text-zinc-300 font-bold mb-2 flex items-center gap-1.5 uppercase text-[10px] tracking-wider border-b border-zinc-800/50 pb-1">
                          {key} Records
                        </div>
                        <ul className="list-none pl-0 space-y-2">
                          {(scan.dns?.[key]?.Answer || []).map((rec, i) => (
                            <li key={i} className="text-zinc-400 break-all text-[11px] leading-relaxed">
                              {rec.name} <span className="text-zinc-600">→</span> {rec.data} <span className="text-red-400">({rec.TTL}s)</span>
                            </li>
                          ))}
                          {!scan.dns?.[key]?.Answer?.length && (
                            <li className="text-zinc-650 italic text-[11px]">-</li>
                          )}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Common Port Snapshot */}
                <div className="bg-zinc-950/20 border border-zinc-800/80 rounded-2xl p-6 font-mono text-xs space-y-4">
                  <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2 border-b border-zinc-850 pb-2">
                    <Server className="w-4 h-4 text-red-400" />
                    Target Port State Scan
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(scan.ports?.results || []).map((item) => (
                      <div
                        key={`${item.port}-${item.service}`}
                        className="bg-zinc-900/40 border border-zinc-800/80 p-3 rounded-xl text-[11px] flex justify-between items-center"
                      >
                        <div>
                          <span className="text-zinc-200 font-bold">{item.port}</span>
                          <span className="text-zinc-550 mx-1.5">/</span>
                          <span className="text-zinc-400 uppercase">{item.service}</span>
                        </div>
                        <div className="text-right">
                          <span className={getPortTone(item.state)}>{item.state.toUpperCase()}</span>
                          {item.error && (
                            <span className="text-[10px] text-zinc-600 block italic">{item.error}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Download Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <button
                    onClick={downloadCSV}
                    className="flex-1 px-4 py-3 bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-600 hover:border-red-500 rounded-xl font-mono font-bold text-xs uppercase transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-red-400" />
                    Download CSV Audit Log
                  </button>
                  <button
                    onClick={downloadPDF}
                    className="flex-1 px-4 py-3 bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-600 hover:border-red-500 rounded-xl font-mono font-bold text-xs uppercase transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Download className="w-4 h-4 text-red-400" />
                    Download PDF Report
                  </button>
                </div>

              </div>
            )}

          </div>

          {/* Right Column (Specs & Guidance) */}
          <div className="space-y-6">
            
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Info className="text-red-400 w-4 h-4" />
                Recon scope guidance
              </h2>
              <ul className="space-y-3.5 list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    DNS Lookup resolves target domains into root records maps for diagnostic audits.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    WHOIS databases yield registration timestamps, renewal data, and contact addresses.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    SSL handshake analyses review certification details and active security protocol layers.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Port audits scan system headers to identify exposed interfaces and active service protocols.
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
