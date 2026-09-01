"use client";

import { useState, useMemo } from "react";
import {
  Network,
  Search,
  Activity,
  Server,
  Shield,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Terminal,
  ChevronDown,
  Loader2,
  Info,
  Globe,
  Cpu,
  Radio,
  Wifi,
  Filter,
  Download,
} from "lucide-react";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";
import { generateBasicNetworkScanPDF } from "./generateBasicNetworkScanPDF";

const API = process.env.NEXT_PUBLIC_PROD_API_URL?.replace(/\/+$/, "");

/* ─────────────── Port Presets ─────────────── */
const PORT_PRESETS = {
  common: {
    label: "Top 23 Common",
    description: "Most critical attack surface ports (TCP + UDP)",
    mode: "set",
  },
  top100: {
    label: "Well-Known (1–1024)",
    description: "Standard system and admin ports (TCP + UDP)",
    mode: "range",
    start: 1,
    end: 1024,
  },
  custom: {
    label: "Custom Range",
    description: "Specify start and end port numbers (TCP)",
    mode: "custom",
  },
  single: {
    label: "Single Port",
    description: "Target a specific port number (TCP)",
    mode: "single",
  },
};

/* ─────────────── Service Map (Fallback) ─────────────── */
const SERVICE_MAP = {
  21: { name: "FTP", risk: "High", note: "Cleartext file transfer" },
  22: { name: "SSH", risk: "Medium", note: "Secure remote shell" },
  23: { name: "Telnet", risk: "Critical", note: "Cleartext protocol — should be disabled" },
  25: { name: "SMTP", risk: "Medium", note: "Email relay — check auth requirements" },
  53: { name: "DNS", risk: "Medium", note: "Name resolution service" },
  80: { name: "HTTP", risk: "Medium", note: "Unencrypted web traffic" },
  110: { name: "POP3", risk: "High", note: "Cleartext email retrieval" },
  123: { name: "NTP", risk: "Low", note: "Network Time Protocol" },
  143: { name: "IMAP", risk: "Medium", note: "Email access — verify TLS enforced" },
  161: { name: "SNMP", risk: "High", note: "Simple Network Management Protocol" },
  443: { name: "HTTPS", risk: "Low", note: "Encrypted web traffic" },
  445: { name: "SMB", risk: "Critical", note: "File sharing — high attack surface" },
  587: { name: "SMTP/TLS", risk: "Low", note: "Authenticated submission port" },
  993: { name: "IMAPS", risk: "Low", note: "Encrypted IMAP" },
  995: { name: "POP3S", risk: "Low", note: "Encrypted POP3" },
  1433: { name: "MSSQL", risk: "Critical", note: "SQL Server — should not be internet-facing" },
  1521: { name: "Oracle DB", risk: "Critical", note: "Oracle DB — should not be internet-facing" },
  3306: { name: "MySQL", risk: "Critical", note: "MySQL — should not be internet-facing" },
  3389: { name: "RDP", risk: "Critical", note: "Remote Desktop — high brute-force target" },
  5432: { name: "PostgreSQL", risk: "Critical", note: "PostgreSQL — should not be internet-facing" },
  5900: { name: "VNC", risk: "Critical", note: "VNC — cleartext remote desktop" },
  6379: { name: "Redis", risk: "Critical", note: "Redis — often unauthenticated by default" },
  8080: { name: "HTTP-Alt", risk: "Medium", note: "Alternative HTTP — may expose dev services" },
  8443: { name: "HTTPS-Alt", risk: "Low", note: "Alternative HTTPS" },
  27017: { name: "MongoDB", risk: "Critical", note: "MongoDB — often exposed without auth" },
};

const getServiceInfo = (port) =>
  SERVICE_MAP[port] || { name: `Service:${port}`, risk: "Medium", note: "Unknown service" };

/* ─────────────── Risk Badge ─────────────── */
const RISK_STYLES = {
  Critical: "bg-red-500/15 text-red-400 border-red-500/30",
  High: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  Medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Low: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  None: "bg-zinc-800/60 text-zinc-500 border-zinc-700/30",
};

function RiskBadge({ risk }) {
  const normalized = risk ? risk.charAt(0).toUpperCase() + risk.slice(1).toLowerCase() : "None";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[0.65rem] font-mono font-bold uppercase tracking-wider ${RISK_STYLES[normalized] || RISK_STYLES.None}`}>
      {normalized}
    </span>
  );
}

/* ─────────────── State Badge ─────────────── */
function StateBadge({ state }) {
  if (state === "open" || state === "open|filtered") {
    return (
      <span className="inline-flex items-center gap-1.5 text-emerald-400 font-mono text-xs font-semibold">
        <CheckCircle2 className="h-3.5 w-3.5" />
        OPEN
      </span>
    );
  }
  if (state === "filtered") {
    return (
      <span className="inline-flex items-center gap-1.5 text-amber-500 font-mono text-xs font-semibold">
        <AlertTriangle className="h-3.5 w-3.5" />
        FILTERED
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-zinc-650 font-mono text-xs font-semibold">
      <XCircle className="h-3.5 w-3.5" />
      CLOSED
    </span>
  );
}

/* ─────────────── Main Component ─────────────── */
export default function BasicNetworkScan() {
  const [target, setTarget] = useState("");
  const [preset, setPreset] = useState("common");
  const [customStart, setCustomStart] = useState("1");
  const [customEnd, setCustomEnd] = useState("1024");
  const [singlePort, setSinglePort] = useState("80");
  const [showOnlyOpen, setShowOnlyOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [scanMeta, setScanMeta] = useState(null);
  const [selectedHostIdx, setSelectedHostIdx] = useState(0);

  const protectedAction = useProtectedAction();

  /* ── Input validation ── */
  const isValidTarget = useMemo(() => {
    const v = (target || "").trim();
    if (!v) return false;
    // Accept letters, numbers, dots, commas, dashes, slashes, and spaces
    return /^[a-zA-Z0-9\.\,\-\/\s]+$/.test(v);
  }, [target]);

  /* ── Run scan ── */
  const handleScan = async (e) => {
    e?.preventDefault();
    if (!isValidTarget || loading) return;
    setLoading(true);
    setError("");
    setResult(null);
    setScanMeta(null);
    setSelectedHostIdx(0);

    const start = Date.now();

    await protectedAction(async (token) => {
      try {
        const body = { target: target.trim(), preset };

        if (preset === "custom") {
          const s = parseInt(customStart, 10);
          const en = parseInt(customEnd, 10);
          if (isNaN(s) || isNaN(en) || s < 1 || en > 65535 || s > en) {
            throw new Error("Invalid custom port range. Start must be ≥ 1, End ≤ 65535, Start ≤ End.");
          }
          if (en - s + 1 > 10000) {
            throw new Error("Range too large. Maximum 10,000 ports per scan.");
          }
          body.startPort = s;
          body.endPort = en;
        } else if (preset === "single") {
          const p = parseInt(singlePort, 10);
          if (isNaN(p) || p < 1 || p > 65535) {
            throw new Error("Invalid port number. Must be between 1 and 65535.");
          }
          body.singlePort = p;
        }

        const res = await fetch(`${API}/basic-network-scan/scan`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || err.message || `Server error: HTTP ${res.status}`);
        }

        const data = await res.json();
        const elapsed = Date.now() - start;

        setResult(data);
        setScanMeta({
          elapsed,
          preset: PORT_PRESETS[preset]?.label || preset,
        });
      } catch (err) {
        setError(err.message || "Scan failed. Check the target and try again.");
      }
    });

    setLoading(false);
  };

  /* ── Current Host Result Selector ── */
  const activeHostResult = useMemo(() => {
    if (!result?.hostResults?.length) return null;
    return result.hostResults[selectedHostIdx] || result.hostResults[0];
  }, [result, selectedHostIdx]);

  /* ── Filtered display ports for current active host ── */
  const displayPorts = useMemo(() => {
    if (!activeHostResult) return [];
    const list = showOnlyOpen ? activeHostResult.openPorts : activeHostResult.ports;
    return list.slice().sort((a, b) => {
      const aOpen = a.state === "open" || a.state === "open|filtered";
      const bOpen = b.state === "open" || b.state === "open|filtered";
      if (aOpen !== bOpen) return aOpen ? -1 : 1;
      return a.port - b.port;
    });
  }, [activeHostResult, showOnlyOpen]);

  /* ── Host-specific Risk level ── */
  const activeHostRisk = useMemo(() => {
    if (!activeHostResult) return null;
    const criticals = activeHostResult.openPorts.filter((p) => p.risk === "critical").length;
    const highs = activeHostResult.openPorts.filter((p) => p.risk === "high").length;
    if (criticals > 0) return { level: "Critical", color: "text-red-400", border: "border-red-500/40", bg: "bg-red-500/10" };
    if (highs > 0) return { level: "High", color: "text-orange-400", border: "border-orange-500/40", bg: "bg-orange-500/10" };
    if (activeHostResult.openPorts.length > 5) return { level: "Medium", color: "text-amber-400", border: "border-amber-500/40", bg: "bg-amber-500/10" };
    if (activeHostResult.openPorts.length > 0) return { level: "Low", color: "text-emerald-400", border: "border-emerald-500/40", bg: "bg-emerald-500/10" };
    return { level: "Clean", color: "text-zinc-400", border: "border-zinc-700/40", bg: "bg-zinc-800/20" };
  }, [activeHostResult]);

  return (
    <div
      className="tool-detail-page min-h-screen"
      style={{
        "--hero-ambient-a": "rgba(245, 158, 11, 0.08)",
        "--hero-ambient-b": "rgba(249, 115, 22, 0.03)",
        "--glow-primary": "0 0 34px rgba(245, 158, 11, 0.16)",
        "--gold": "#f59e0b",
        "--gold-strong": "#fbbf24",
        "--gold-dark": "#b45309",
        "--ring": "rgba(245, 158, 11, 0.34)",
        "--surface-glow": "rgba(245, 158, 11, 0.14)",
      }}
    >
      <style>{`
        .tool-detail-page .tool-detail-shell {
          padding-top: 3.5rem !important;
        }
        .tool-detail-page ::-webkit-scrollbar-thumb {
          background: rgba(245, 158, 11, 0.35) !important;
        }
        .tool-detail-page ::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 158, 11, 0.55) !important;
        }
        .tool-detail-page ::selection {
          background: rgba(245, 158, 11, 0.22) !important;
          color: #fffbeb !important;
        }
        .bns-preset-btn {
          transition: all 0.18s ease;
        }
        .bns-preset-btn:hover {
          border-color: rgba(245, 158, 11, 0.4);
        }
        .bns-preset-btn.active {
          border-color: rgba(245, 158, 11, 0.6) !important;
          background: rgba(245, 158, 11, 0.08) !important;
          color: #f4f4f5 !important;
        }
        .bns-preset-btn.active * {
          color: inherit !important;
        }
        .bns-submit-btn {
          background-color: #f59e0b !important;
          color: #111111 !important;
          border: none !important;
        }
        .bns-submit-btn:hover:not(:disabled) {
          background-color: #fbbf24 !important;
          box-shadow: 0 0 28px rgba(245, 158, 11, 0.45) !important;
          transform: scale(1.01);
        }
        .bns-submit-btn * {
          color: #111111 !important;
        }
        .bns-port-row {
          transition: background 0.15s ease;
        }
        .bns-port-row:hover {
          background: rgba(245, 158, 11, 0.04);
        }
        @keyframes bns-pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .bns-scanning-dot {
          animation: bns-pulse-dot 1.2s ease-in-out infinite;
        }
      `}</style>

      <div className="tool-detail-shell">
        {/* Header badge */}
        <div className="flex justify-end mb-8">
          <span className="rounded-full border border-amber-500/30 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-amber-400">
            Vulnerability Assessment
          </span>
        </div>

        {/* Title */}
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center bg-zinc-950/20" style={{ border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <Network className="h-8 w-8 text-amber-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              BASIC NETWORK <span className="text-amber-400">SCANNING</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Probe target surfaces for foundational exposure. Supports IP lists, ranges, CIDR subnets, and host pings to audit your perimeter configuration.
            </p>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] items-start min-w-0">

          {/* ─── Left: scan form + results ─── */}
          <div className="space-y-6 min-w-0">

            {/* Scan form card */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-amber-500/10 transition-all duration-300">
              <h2 className="text-lg font-mono font-medium text-zinc-100 mb-6 flex items-center gap-2">
                <Terminal className="h-5 w-5 text-amber-400" />
                Target & Port Configuration
              </h2>

              <form onSubmit={handleScan} className="space-y-5">
                {/* Target input */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                    Target Hosts, Ranges or CIDR blocks
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                    <input
                      type="text"
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      disabled={loading}
                      placeholder="e.g. 192.168.1.0/28, 10.0.0.1-5, example.com"
                      className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl pl-9 pr-4 py-3 text-sm focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 focus:outline-none transition-all placeholder:text-zinc-650 font-mono disabled:opacity-50"
                      required
                    />
                    {target && (
                      <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[0.6rem] font-mono font-bold uppercase ${isValidTarget ? "text-emerald-400" : "text-red-400"}`}>
                        {isValidTarget ? "✓ Format OK" : "✗ Invalid"}
                      </span>
                    )}
                  </div>
                  <p className="text-[0.65rem] text-zinc-600 mt-1.5 font-mono leading-relaxed">
                    Accepts hosts, IP list (comma/space), range (e.g. 192.168.1.1-15), or CIDR subnets (e.g. 192.168.1.0/28). Max 32 hosts.
                  </p>
                </div>

                {/* Port preset selector */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-3 font-semibold">
                    Port Scan Preset
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(PORT_PRESETS).map(([key, p]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setPreset(key)}
                        disabled={loading}
                        className={`bns-preset-btn text-left p-3 rounded-xl border transition-all disabled:opacity-40 ${
                          preset === key
                            ? "active"
                            : "border-zinc-800/60 bg-zinc-900/20"
                        }`}
                      >
                        <div className="text-xs font-mono font-bold text-zinc-100 mb-0.5">{p.label}</div>
                        <div className="text-[0.6rem] text-zinc-500 leading-tight">{p.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom range inputs */}
                {preset === "custom" && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">Start Port</label>
                      <input
                        type="number"
                        min="1"
                        max="65534"
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                        disabled={loading}
                        className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl px-3 py-2.5 text-sm font-mono focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 focus:outline-none disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">End Port</label>
                      <input
                        type="number"
                        min="2"
                        max="65535"
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e.target.value)}
                        disabled={loading}
                        className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl px-3 py-2.5 text-sm font-mono focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 focus:outline-none disabled:opacity-50"
                      />
                    </div>
                  </div>
                )}

                {/* Single port input */}
                {preset === "single" && (
                  <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">Port Number</label>
                    <input
                      type="number"
                      min="1"
                      max="65535"
                      value={singlePort}
                      onChange={(e) => setSinglePort(e.target.value)}
                      disabled={loading}
                      placeholder="e.g. 443"
                      className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl px-3 py-2.5 text-sm font-mono focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 focus:outline-none disabled:opacity-50"
                    />
                  </div>
                )}
                
                {/* Specific port list */}
                {preset === "specific" && (
                  <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">Port List (comma separated)</label>
                    <input
                      type="text"
                      value={customList}
                      onChange={(e) => setCustomList(e.target.value)}
                      disabled={loading}
                      placeholder="e.g. 80, 443, 8080"
                      className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl px-3 py-2.5 text-sm font-mono focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 focus:outline-none disabled:opacity-50"
                    />
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || !isValidTarget}
                  className="w-full bns-submit-btn rounded-xl font-mono font-bold text-sm uppercase py-4 transition-all duration-300 active:scale-[0.99] flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:pointer-events-none focus:outline-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Scanning Subnets...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Run Network Scan
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Error state */}
            {error && (
              <div className="border border-red-500/30 bg-red-500/10 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-mono font-semibold text-red-400">Scan Error</p>
                  <p className="text-xs text-red-300/70 mt-1 leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="border border-amber-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bns-scanning-dot h-2.5 w-2.5 rounded-full bg-amber-400 inline-block animate-pulse" />
                  <span className="text-sm font-mono font-bold text-amber-400">SCANNING IN PROGRESS</span>
                </div>
                <div className="space-y-2 font-mono text-xs text-zinc-400">
                  <p>▶ Parsing targets & resolving DNS hosts...</p>
                  <p>▶ Running TCP host alive ping sweeps...</p>
                  <p>▶ Probing open ports in concurrency-limited socket batches...</p>
                  <p>▶ Conducting DNS / NTP UDP service validation...</p>
                </div>
              </div>
            )}

            {/* Scan results summary */}
            {result?.hostResults && !loading && (
              <div className="space-y-6 min-w-0">
                {/* Aggregated statistics bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-950/10 border border-zinc-800/60 rounded-2xl p-4">
                  <div className="text-center">
                    <div className="text-2xl font-mono font-bold text-zinc-100">{result.summary?.totalHosts}</div>
                    <div className="text-[0.55rem] uppercase font-mono tracking-wider text-zinc-500 mt-0.5">Total Hosts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-mono font-bold text-emerald-400">{result.summary?.aliveHosts}</div>
                    <div className="text-[0.55rem] uppercase font-mono tracking-wider text-zinc-500 mt-0.5">Hosts Up</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-mono font-bold text-amber-400">{result.summary?.openCount}</div>
                    <div className="text-[0.55rem] uppercase font-mono tracking-wider text-zinc-500 mt-0.5">Open Ports</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-mono font-bold text-zinc-100">{result.summary?.totalScanned}</div>
                    <div className="text-[0.55rem] uppercase font-mono tracking-wider text-zinc-500 mt-0.5">Ports Tested</div>
                  </div>
                </div>

                {/* Host list selection tabs */}
                {result.hostResults.length > 1 && (
                  <div className="space-y-2">
                    <label className="block text-[0.65rem] uppercase tracking-wider font-mono text-zinc-500 font-bold px-1">
                      Select Host View ({result.hostResults.length} targets)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {result.hostResults.map((hr, idx) => {
                        const hostRisk = hr.openPorts.filter(p => p.risk === 'critical').length > 0 ? 'text-red-400 border-red-500/25 bg-red-500/5' :
                                         hr.openPorts.filter(p => p.risk === 'high').length > 0 ? 'text-orange-400 border-orange-500/25 bg-orange-500/5' :
                                         hr.openPorts.length > 0 ? 'text-amber-400 border-amber-500/25 bg-amber-500/5' : 'text-zinc-500 border-zinc-800/80 bg-zinc-900/10';
                        return (
                          <button
                            key={hr.target}
                            type="button"
                            onClick={() => setSelectedHostIdx(idx)}
                            className={`px-3 py-2 rounded-xl border text-xs font-mono transition-all flex items-center gap-2 ${
                              selectedHostIdx === idx
                                ? "border-amber-500/60 bg-amber-500/10 text-amber-400 font-bold"
                                : `${hostRisk} hover:border-zinc-700/60`
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${hr.alive ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                            {hr.target}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Active Host Details */}
                {activeHostResult && (
                  <div className="space-y-4 min-w-0">
                    {/* Host Header Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800/60 pb-3 gap-2 px-1">
                      <div className="min-w-0">
                        <div className="text-lg font-mono font-bold text-zinc-100 flex items-center gap-2 break-all">
                          <Globe className="h-4 w-4 text-amber-400 flex-shrink-0" />
                          <span>{activeHostResult.target}</span>
                        </div>
                        <div className="text-[0.65rem] text-zinc-400 font-mono mt-0.5 break-all">
                          IP: {activeHostResult.resolvedIp || "DNS lookup failed"} · Status: <span className={activeHostResult.alive ? "text-emerald-400 font-bold" : "text-zinc-500"}>{activeHostResult.alive ? "ONLINE" : "OFFLINE"}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => generateBasicNetworkScanPDF(result, target)}
                          className="flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-lg border border-yellow-300 text-black bg-yellow-400 hover:bg-yellow-300 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-[0_0_15px_rgba(250,204,21,0.35)]"
                        >
                          <Download className="h-3.5 w-3.5 text-black stroke-[2.5]" />
                          PDF Report
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowOnlyOpen((v) => !v)}
                          className={`flex items-center gap-1.5 text-[0.65rem] font-mono px-2.5 py-1 rounded-lg border transition-all ${
                            showOnlyOpen
                              ? "border-amber-500/40 text-amber-400 bg-amber-500/10"
                              : "border-zinc-700/60 text-zinc-500 hover:border-zinc-600/60"
                          }`}
                        >
                          <Filter className="h-3 w-3" />
                          {showOnlyOpen ? "Showing Open Only" : "Show Open Only"}
                        </button>
                      </div>
                    </div>

                    {/* Offline Warning */}
                    {!activeHostResult.alive && (
                      <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-8 text-center text-zinc-400 space-y-2">
                        <XCircle className="h-10 w-10 text-zinc-600 mx-auto mb-2" />
                        <h4 className="text-sm font-mono font-bold text-zinc-300 uppercase">Host Appears Down</h4>
                        <p className="text-xs max-w-[280px] mx-auto leading-relaxed">
                          All TCP discovery ping sweeps timed out or were refused. This target may be offline or configured to drop traffic.
                        </p>
                      </div>
                    )}

                    {/* Online Results */}
                    {activeHostResult.alive && (
                      <>
                        {/* Port table with horizontal overflow protection */}
                        <div className="border border-zinc-800/80 rounded-2xl overflow-hidden min-w-0 bg-zinc-950/20">
                          <div className="bg-zinc-950/40 border-b border-zinc-800/60 px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Activity className="h-4 w-4 text-amber-400" />
                              <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
                                Port Table — {displayPorts.length} services tested
                              </span>
                            </div>
                          </div>

                          <div className="overflow-x-auto min-w-0">
                            <div className="min-w-[560px]">
                              {/* Table header (sticky top) */}
                              <div className="bg-zinc-950/60 border-b border-zinc-800/60 px-4 py-2.5 grid grid-cols-[60px_70px_80px_110px_90px_1fr] gap-2">
                                {["Port", "Proto", "State", "Service", "Risk", "Notes"].map((h) => (
                                  <span key={h} className="text-[0.65rem] uppercase font-mono tracking-widest text-zinc-400 font-bold">{h}</span>
                                ))}
                              </div>

                              <div className="divide-y divide-zinc-800/40 max-h-[520px] overflow-y-auto">
                                {displayPorts.length === 0 ? (
                                  <div className="p-8 text-center">
                                    <CheckCircle2 className="h-10 w-10 text-emerald-500/40 mx-auto mb-3" />
                                    <p className="text-sm font-mono text-zinc-400">All scanned ports closed</p>
                                    <p className="text-xs text-zinc-600 mt-1">No open services detected on the scanned ports.</p>
                                  </div>
                                ) : (
                                  displayPorts.map((portInfo) => {
                                    const isOpen = portInfo.state === 'open' || portInfo.state === 'open|filtered';
                                    const svc = getServiceInfo(portInfo.port);
                                    const serviceName = portInfo.service || svc.name;
                                    const displayRisk = isOpen ? (portInfo.risk || svc.risk) : 'none';
                                    return (
                                      <div
                                        key={`${portInfo.port}-${portInfo.protocol}`}
                                        className="bns-port-row grid grid-cols-[60px_70px_80px_110px_90px_1fr] items-center gap-2 px-4 py-3"
                                      >
                                        {/* Port */}
                                        <span className="font-mono text-sm font-bold text-zinc-200">{portInfo.port}</span>
                                        {/* Protocol */}
                                        <span className="font-mono text-[10px] uppercase font-bold text-zinc-500">{portInfo.protocol}</span>
                                        {/* State */}
                                        <StateBadge state={portInfo.state} />
                                        {/* Service */}
                                        <span className="font-mono text-xs text-zinc-300 truncate">{isOpen ? serviceName : '—'}</span>
                                        {/* Risk */}
                                        <RiskBadge risk={displayRisk} />
                                        {/* Note */}
                                        <span className="text-[0.65rem] text-zinc-400 truncate leading-tight">
                                          {isOpen ? (portInfo.impact || svc.note) : 'Port is closed'}
                                        </span>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Open port detail cards (only if open ports exist) */}
                        {activeHostResult.openPorts.length > 0 && (
                          <div className="border border-zinc-800/80 rounded-2xl overflow-hidden min-w-0">
                            <div className="bg-zinc-950/40 border-b border-zinc-800/60 px-4 py-3 flex items-center gap-2">
                              <ShieldAlert className="h-4 w-4 text-amber-400" />
                              <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
                                Open Services Risk Summary
                              </span>
                            </div>
                            <div className="p-4 space-y-3">
                              {activeHostResult.openPorts.map((portInfo) => {
                                const svc = getServiceInfo(portInfo.port);
                                const serviceName = portInfo.service || svc.name;
                                const isCriticalOrHigh = portInfo.risk === 'critical' || portInfo.risk === 'high';
                                return (
                                  <div key={`${portInfo.port}-${portInfo.protocol}`} className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-0.5">
                                      {isCriticalOrHigh ? (
                                        <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                                      ) : (
                                        <Info className="h-3.5 w-3.5 text-amber-400" />
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-mono text-xs font-bold text-zinc-200">Port {portInfo.port}/{portInfo.protocol} — {serviceName}</span>
                                        <RiskBadge risk={portInfo.risk} />
                                      </div>
                                      <p className="text-[0.65rem] text-zinc-400 mt-0.5 leading-relaxed break-words">
                                        {portInfo.impact || svc.note}
                                      </p>
                                      {portInfo.banner && (
                                        <p className="text-[0.6rem] text-zinc-400 mt-1 font-mono bg-zinc-950/40 border border-zinc-900/60 px-2 py-1 rounded-lg break-all">
                                          Banner: {portInfo.banner}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ─── Right: info sidebar ─── */}
          <div className="space-y-6 min-w-0">

            {/* Scan status card */}
            {!result && !loading && (
              <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 text-center py-16 text-zinc-400 space-y-3 shadow-sm">
                <Network className="h-12 w-12 mx-auto text-zinc-700" />
                <p className="text-sm font-mono uppercase tracking-wider font-semibold text-zinc-200">No Scan Running</p>
                <p className="text-xs max-w-[220px] mx-auto leading-relaxed">
                  Enter target hosts, subnets, or IP ranges and select a port preset to begin scanning.
                </p>
              </div>
            )}

            {/* Real-time result mini card */}
            {activeHostResult && scanMeta && (
              <div className="border border-amber-500/30 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 min-w-0">
                <div className="text-center space-y-2">
                  <div className="inline-flex h-12 w-12 items-center justify-center border border-amber-500/25 text-amber-400 rounded-full bg-amber-500/10 mb-2">
                    {activeHostResult.openPorts.length > 0 ? (
                      <ShieldAlert className="h-6 w-6" />
                    ) : (
                      <Shield className="h-6 w-6" />
                    )}
                  </div>
                  <h3 className="text-xl font-mono font-bold text-zinc-100">Scan Complete</h3>
                  <p className="text-xs text-zinc-400 break-all">{activeHostResult.target}</p>
                  {activeHostResult.resolvedIp && activeHostResult.resolvedIp !== activeHostResult.target && (
                    <p className="text-[0.65rem] text-zinc-400 font-mono break-all">Resolved IP → {activeHostResult.resolvedIp}</p>
                  )}
                </div>
                <div className="border-t border-zinc-800/40 pt-4 space-y-2 font-mono text-xs">
                  <div className="flex justify-between gap-2">
                    <span className="text-zinc-400">Scan Mode:</span>
                    <span className="text-zinc-300 text-right">TCP Connect + UDP</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-zinc-400">Target Status:</span>
                    <span className={`font-bold ${activeHostResult.alive ? "text-emerald-400" : "text-zinc-500"}`}>{activeHostResult.alive ? "ONLINE" : "OFFLINE"}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-zinc-400">Ports Checked:</span>
                    <span className="text-zinc-200 font-bold">{activeHostResult.ports.length}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-zinc-400">Open Ports:</span>
                    <span className={`font-bold ${activeHostResult.openPorts.length > 0 ? "text-amber-400" : "text-emerald-400"}`}>{activeHostResult.openPorts.length}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-zinc-400">Closed Ports:</span>
                    <span className="text-zinc-300 font-bold">{activeHostResult.closedPorts.length}</span>
                  </div>
                  {activeHostResult.filteredPorts?.length > 0 && (
                    <div className="flex justify-between gap-2">
                      <span className="text-zinc-400">Filtered:</span>
                      <span className="text-amber-500 font-bold">{activeHostResult.filteredPorts.length}</span>
                    </div>
                  )}
                  <div className="flex justify-between gap-2">
                    <span className="text-zinc-400">Host Risk:</span>
                    <span className={`font-bold ${activeHostRisk?.color}`}>{activeHostRisk?.level}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Audit Specs sidebar */}
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Info className="text-amber-400 w-4 h-4" />
                Auditor Capabilities
              </h2>
              <ul className="space-y-3.5 list-none pl-0">
                {[
                  { icon: <Radio className="h-3.5 w-3.5 text-amber-400 flex-shrink-0 mt-0.5" />, text: "Subnet scanning — expands standard CIDR prefixes (up to /24)" },
                  { icon: <Globe className="h-3.5 w-3.5 text-amber-400 flex-shrink-0 mt-0.5" />, text: "TCP Ping sweeps — checks target responsiveness to optimize sweeps" },
                  { icon: <Wifi className="h-3.5 w-3.5 text-amber-400 flex-shrink-0 mt-0.5" />, text: "UDP Service probing — audits connectionless UDP DNS and NTP response" },
                  { icon: <Server className="h-3.5 w-3.5 text-amber-400 flex-shrink-0 mt-0.5" />, text: "Live Banner grabbing — pulls interactive SSH/SMTP server details" },
                  { icon: <Cpu className="h-3.5 w-3.5 text-amber-400 flex-shrink-0 mt-0.5" />, text: "Rate batching — maintains safe server event loop usage" },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    {item.icon}
                    <span className="text-xs text-zinc-400 leading-relaxed">{item.text}</span>
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
