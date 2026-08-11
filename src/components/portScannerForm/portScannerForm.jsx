"use client";

import { useMemo, useState } from "react";
import {
  Globe,
  Search,
  Filter,
  Eye,
  EyeOff,
  Server,
  ChevronDown,
  CheckCircle2,
  ShieldAlert,
  Info,
  Terminal,
  Activity,
  Layers,
  Download,
  FileSpreadsheet,
  FileJson,
  Loader2
} from "lucide-react";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";
import { generatePortScannerPDF } from "./generatePortScannerPDF";

const API = process.env.NEXT_PUBLIC_PROD_API_URL?.replace(/\/+$/, "");

function parsePortInput(input) {
  const s = String(input || "")
    .trim()
    .toLowerCase();
  if (!s) return null;

  if (s === "common") {
    return {
      mode: "set",
      ports: [
        21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 3306, 3389, 8080, 8443,
      ],
    };
  }

  const range = s.match(/^(\d{1,5})\s*-\s*(\d{1,5})$/);
  if (range) {
    const start = parseInt(range[1], 10);
    const end = parseInt(range[2], 10);
    if (start >= 1 && end <= 65535 && start <= end)
      return { mode: "range", start, end };
    return null;
  }

  const single = parseInt(s, 10);
  if (!isNaN(single) && single >= 1 && single <= 65535)
    return { mode: "single", port: single };

  return null;
}

export default function PortScannerForm() {
  const [host, setHost] = useState("");
  const [portInput, setPortInput] = useState("");
  const [filter, setFilter] = useState("all");
  const [includeHostnames, setIncludeHostnames] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const protectedAction = useProtectedAction();

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!host || !portInput || loading) return;

    setLoading(true);
    setError("");
    setResult(null);

    let cleanHost = host.trim();
    if (cleanHost.includes("http://") || cleanHost.includes("https://") || cleanHost.includes("/") || cleanHost.startsWith("www.")) {
      try {
        const temp = cleanHost.includes("://") ? cleanHost : `https://${cleanHost}`;
        const urlObj = new URL(temp);
        cleanHost = urlObj.hostname;
        if (cleanHost.startsWith("www.")) {
          cleanHost = cleanHost.substring(4);
        }
      } catch (err) {
        cleanHost = cleanHost.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0].split(":")[0];
      }
      setHost(cleanHost);
    }

    await protectedAction(async (token) => {
      try {
        const parsed = parsePortInput(portInput);
        if (!parsed)
          throw new Error(
            "Invalid port input. Use '80', '60-2000', or 'common'."
          );

        let qs = new URLSearchParams({
          host: cleanHost,
          filter,
          includeHostnames: includeHostnames.toString(),
        });

        if (parsed.mode === "single") {
          qs.set("port", String(parsed.port));
        } else if (parsed.mode === "range") {
          qs.set("startPort", String(parsed.start));
          qs.set("endPort", String(parsed.end));
        } else if (parsed.mode === "set") {
          const gathered = [];
          for (const p of parsed.ports) {
            const q = new URLSearchParams({
              host: cleanHost,
              port: String(p),
              filter,
              includeHostnames: includeHostnames.toString(),
            }).toString();
            const r = await fetch(`${API}/port-scanner/port-scan?${q}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!r.ok) {
              const errData = await r.json().catch(() => ({}));
              throw new Error(errData.message || errData.error || `HTTP ${r.status}`);
            }
            const d = await r.json();
            if (d.portList && d.portList.length > 0) {
              gathered.push(...d.portList);
            } else if (d.ports) {
              gathered.push(...Object.values(d.ports));
            }
          }
          setResult({
            host: cleanHost,
            filter,
            includeHostnames,
            portRange: portInput,
            portList: gathered,
            summary: {
              total: gathered.length,
              filtered: gathered.length,
              open: gathered.filter((p) => p.open).length,
              riskAssessment: gathered.some((p) => p.open && p.risk === "High")
                ? "High"
                : gathered.some((p) => p.open && p.risk === "Medium")
                ? "Medium"
                : "Low",
            },
          });
          return;
        }

        const res = await fetch(`${API}/port-scanner/port-scan?${qs.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || errData.error || `HTTP ${res.status}`);
        }

        const data = await res.json();
        setResult(data);
      } catch (err) {
        setError(err?.message || "Scan failed.");
      } finally {
        setLoading(false);
      }
    });
  };

  const rows = useMemo(() => {
    if (!result?.portList && !result?.ports) return [];
    const portData = result.portList || Object.values(result.ports || {});

    return portData.map((p) => ({
      port: p.port,
      status: p.open ? "Open" : "Closed",
      service: p.service,
      hostname: p.hostname || "N/A",
      risk: p.risk,
      description: p.description,
    }));
  }, [result]);

  const submitDisabled = loading || !host.trim() || !portInput.trim();

  const getRiskBadge = (risk) => {
    const base = "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border font-mono uppercase tracking-wider";
    if (risk === "High") {
      return (
        <span className={`${base} border-red-500/40 bg-red-500/5 text-red-400`}>
          High
        </span>
      );
    }
    if (risk === "Medium") {
      return (
        <span className={`${base} border-orange-500/40 bg-orange-500/5 text-orange-400`}>
          Medium
        </span>
      );
    }
    if (risk === "Low") {
      return (
        <span className={`${base} border-zinc-800/80 bg-zinc-900/40 text-zinc-400`}>
          Low
        </span>
      );
    }
    return (
      <span className={`${base} border-zinc-800/80 bg-zinc-900/40 text-zinc-500`}>
        N/A
      </span>
    );
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
            <Server className="h-8 w-8 text-red-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              PORT <span className="text-red-400">SCANNER</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Validate public-facing infrastructure endpoint nodes. Trace open port statuses, resolve hostnames, and audit service identification details.
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
                Network Scan Parameters
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Host */}
                <div>
                  <label htmlFor="portscan-host-input" className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                    Hostname or IP Address
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-650" />
                    <input
                      id="portscan-host-input"
                      type="text"
                      value={host}
                      onChange={(e) => setHost(e.target.value)}
                      placeholder="example.com or 192.168.1.1"
                      required
                      className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 pl-12 text-sm focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 focus:shadow-[0_0_12px_rgba(239,68,68,0.08)] focus:outline-none transition-all placeholder:text-zinc-600 font-mono"
                    />
                  </div>
                </div>

                {/* Ports */}
                <div>
                  <label htmlFor="portscan-ports-input" className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                    Port or Port Range
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-650" />
                    <input
                      id="portscan-ports-input"
                      type="text"
                      value={portInput}
                      onChange={(e) => setPortInput(e.target.value)}
                      placeholder="80, 80-1000, or 'common'"
                      required
                      className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 pl-12 text-sm focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 focus:shadow-[0_0_12px_rgba(239,68,68,0.08)] focus:outline-none transition-all placeholder:text-zinc-600 font-mono"
                    />
                  </div>
                  <p className="mt-1.5 text-[10px] font-mono text-zinc-550">
                    Formatting formats: Single port (<code className="text-red-400">80</code>), range (<code className="text-red-400">80-1000</code>), or select predefined <code className="text-red-400">'common'</code>.
                  </p>
                </div>

                {/* Filter and Hostname options */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="portscan-filter-select" className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                      Port Status Filter
                    </label>
                    <div className="relative">
                      <select
                        id="portscan-filter-select"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 text-sm focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 focus:outline-none transition-all font-mono appearance-none"
                      >
                        <option value="all">All Ports</option>
                        <option value="open">Open Ports Only</option>
                        <option value="closed">Closed Ports Only</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-550 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                      Hostname Resolution
                    </label>
                    <button
                      type="button"
                      onClick={() => setIncludeHostnames(!includeHostnames)}
                      className={`w-full flex items-center justify-center gap-2 p-3.5 rounded-xl border text-xs font-mono font-bold uppercase transition-all duration-200 cursor-pointer ${
                        includeHostnames
                          ? "bg-red-500/10 border-red-500/35 text-red-400"
                          : "bg-zinc-900/40 border-zinc-800/80 text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {includeHostnames ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      <span>Include DNS Names</span>
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitDisabled}
                  className="w-full bg-red-500 hover:bg-red-600 text-black rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] focus:outline-none disabled:opacity-40"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      Scanning Network Infrastructure...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 text-black" />
                      Start Enhanced Scan
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-955/10 text-red-400 text-xs font-mono flex items-start gap-2">
                <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" />
                <span>Scan Error: {error}</span>
              </div>
            )}

            {/* Loading placeholder */}
            {loading && (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.2)] text-center space-y-4 font-mono text-xs text-zinc-400">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-red-400" />
                <p>
                  {includeHostnames
                    ? "Querying PTR records and mapping host identities..."
                    : "Connecting to remote sockets to verify response banner handshakes..."}
                </p>
              </div>
            )}

            {/* Results Block */}
            {!loading && result && (
              <div className="space-y-6">
                
                {/* Stats cards grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                  <div className="bg-zinc-900/40 border border-zinc-850 p-3.5 rounded-xl">
                    <span className="text-[10px] text-zinc-550 block mb-0.5">Target Host</span>
                    <span className="text-zinc-200 font-bold break-all block">{result.host}</span>
                  </div>
                  <div className="bg-zinc-900/40 border border-zinc-850 p-3.5 rounded-xl">
                    <span className="text-[10px] text-zinc-550 block mb-0.5">Filtered Results</span>
                    <span className="text-red-400 font-bold block">{result.summary?.filtered || 0} / {result.summary?.total || 0}</span>
                  </div>
                  <div className="bg-zinc-900/40 border border-zinc-850 p-3.5 rounded-xl">
                    <span className="text-[10px] text-zinc-550 block mb-0.5">Open Ports</span>
                    <span className="text-red-400 font-bold block">{result.summary?.open || 0}</span>
                  </div>
                  <div className="bg-zinc-900/40 border border-zinc-850 p-3.5 rounded-xl">
                    <span className="text-[10px] text-zinc-550 block mb-0.5">Risk Level</span>
                    <span className="text-red-450 font-extrabold uppercase tracking-wide block">{result.summary?.riskAssessment || "Low"}</span>
                  </div>
                </div>

                {/* Filter info header tag */}
                <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-xl">
                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                    <span className="text-zinc-550">FILTER:</span>
                    <span className="text-zinc-200 font-bold capitalize">{result.filter || filter}</span>
                    <span className="text-zinc-800">|</span>
                    <span className="text-zinc-550">PORT SCOPE:</span>
                    <span className="text-zinc-200 font-bold">{result.portRange || "Custom Scope"}</span>
                    {result.includeHostnames && (
                      <>
                        <span className="text-zinc-800">|</span>
                        <div className="flex items-center gap-1.5 text-red-400 font-semibold">
                          <Server className="h-3.5 w-3.5" />
                          <span>DNS RESOLVED</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Export bar options */}
                {rows.length > 0 && (
                  <div className="mb-6">
                    <ExportBar
                      baseName={`port-scan-${result.host}-${filter}`}
                      rows={rows}
                      result={result}
                      host={host}
                    />
                  </div>
                )}

                {/* Results Table */}
                {rows.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md">
                    <table className="min-w-full text-xs font-mono">
                      <thead className="bg-zinc-900/60 border-b border-zinc-850 text-zinc-400">
                        <tr>
                          <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">Port</th>
                          <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">Service</th>
                          {includeHostnames && (
                            <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">Hostname</th>
                          )}
                          <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">Risk</th>
                          <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900 text-zinc-300">
                        {rows.map((r, i) => (
                          <tr
                            key={`${r.port}-${i}`}
                            className="hover:bg-zinc-900/20 transition-colors"
                          >
                            <td className="px-4 py-3 font-bold text-zinc-100">{r.port}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold border font-mono uppercase tracking-wider ${
                                r.status === "Open" ? "border-red-500/40 bg-red-500/5 text-red-400" : "border-zinc-800/80 bg-zinc-900/40 text-zinc-500"
                              }`}>
                                {r.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-zinc-200">{r.service}</td>
                            {includeHostnames && (
                              <td className="px-4 py-3 text-red-400 font-bold">{r.hostname}</td>
                            )}
                            <td className="px-4 py-3">{getRiskBadge(r.risk)}</td>
                            <td className="px-4 py-3 text-zinc-450 leading-relaxed max-w-xs break-words">{r.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 bg-zinc-900/40 border border-zinc-850 rounded-xl text-center font-mono text-xs text-zinc-400">
                    <p className="font-semibold text-zinc-300">No ports matched your filter criteria.</p>
                    <p className="text-zinc-550 mt-1">Try changing the filter option to "All Ports" or check another host.</p>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Right Column (Guidance) */}
          <div className="space-y-6">
            
            {/* Guidance sidebar card */}
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Info className="text-red-400 w-4 h-4" />
                Scanner Guidance
              </h2>
              <ul className="space-y-3.5 list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Audits target sockets configuration using multi-thread asynchronous validation logic.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Traces open and closed TCP connection statuses across customizable ports or ranges.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Identifies service protocols and flags exposure risks (SSH, Telnet, Database interfaces).
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

/* JSON / CSV Export */
function ExportBar({ baseName, rows, result, host }) {
  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(rows, null, 2)], {
      type: "application/json",
    });
    triggerDownload(blob, `${baseName}.json`);
  };

  const downloadCSV = () => {
    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: "text/csv" });
    triggerDownload(blob, `${baseName}.csv`);
  };

  const downloadPDF = () => {
    generatePortScannerPDF(result, host);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={downloadJSON}
        className="px-4 py-2.5 bg-zinc-900/40 hover:bg-red-500/5 text-zinc-350 hover:text-red-400 border border-zinc-800/80 hover:border-red-500/30 rounded-xl font-mono font-bold text-xs uppercase transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
      >
        <FileJson className="w-3.5 h-3.5" />
        JSON Export
      </button>
      <button
        onClick={downloadCSV}
        className="px-4 py-2.5 bg-zinc-900/40 hover:bg-red-500/5 text-zinc-350 hover:text-red-400 border border-zinc-800/80 hover:border-red-500/30 rounded-xl font-mono font-bold text-xs uppercase transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
      >
        <FileSpreadsheet className="w-3.5 h-3.5" />
        CSV Export
      </button>
      <button
        onClick={downloadPDF}
        className="px-4 py-2.5 bg-zinc-900/40 hover:bg-red-500/5 text-zinc-350 hover:text-red-400 border border-zinc-800/80 hover:border-red-500/30 rounded-xl font-mono font-bold text-xs uppercase transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
      >
        <Download className="w-3.5 h-3.5" />
        Download PDF Report
      </button>
      <div className="text-zinc-500 text-xs font-mono ml-auto">
        {rows.length} result{rows.length !== 1 ? "s" : ""} found
      </div>
    </div>
  );
}

function toCsv(rows) {
  if (!rows?.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v) => JSON.stringify(v ?? "");
  const lines = [headers.join(",")];
  for (const r of rows) lines.push(headers.map((h) => esc(r[h])).join(","));
  return lines.join("\n");
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
