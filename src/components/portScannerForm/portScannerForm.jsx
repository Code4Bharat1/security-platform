"use client";

import { useMemo, useState } from "react";
import { Globe, Search, Filter, Eye, EyeOff, Server, ChevronDown, CheckCircle2, ShieldAlert } from "lucide-react";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";

// Set your API base
const API = process.env.NEXT_PUBLIC_PROD_API_URL?.replace(/\/+$/, "");

/** parse port input helper */
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

    await protectedAction(async (token) => {
      try {
        const parsed = parsePortInput(portInput);
        if (!parsed)
          throw new Error(
            "Invalid port input. Use '80', '60-2000', or 'common'."
          );

        let qs = new URLSearchParams({
          host,
          filter,
          includeHostnames: includeHostnames.toString(),
        });

        if (parsed.mode === "single") {
          qs.set("port", String(parsed.port));
        } else if (parsed.mode === "range") {
          qs.set("startPort", String(parsed.start));
          qs.set("endPort", String(parsed.end));
        } else if (parsed.mode === "set") {
          // For "common" ports, we'll make individual requests and combine
          const gathered = [];
          for (const p of parsed.ports) {
            const q = new URLSearchParams({
              host,
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

          // Remove duplicates and create result object
          const byPort = {};
          for (const p of gathered) byPort[p.port] = p;
          const portsArray = Object.values(byPort);
          const portsObj = Object.fromEntries(
            portsArray.map((p) => [p.port, p])
          );
          const total = portsArray.length;
          const openCount = portsArray.filter((p) => p.open).length;

          setResult({
            host,
            filter,
            includeHostnames,
            portRange: "common",
            ports: portsObj,
            portList: portsArray,
            openPorts: portsArray.filter((p) => p.open).map((p) => p.port),
            suspicious: portsArray
              .filter((p) => p.open && p.risk === "High")
              .map((p) => p.port),
            summary: {
              total,
              open: openCount,
              filtered: portsArray.length,
              riskAssessment:
                openCount > total * 0.3
                  ? "High"
                  : openCount > total * 0.1
                  ? "Medium"
                  : "Low",
            },
            recommendations: [],
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

    // Use portList if available (new format), otherwise fall back to ports object
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
    if (risk === "High") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-500/10 text-red-400">
          High
        </span>
      );
    }
    if (risk === "Medium") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-yellow-500/10 text-yellow-400">
          Medium
        </span>
      );
    }
    if (risk === "Low") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-500/10 text-green-400">
          Low
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-500/10 text-[color:var(--text-muted)]">
        N/A
      </span>
    );
  };

  return (
    <div className="tool-detail-page flex min-h-screen flex-col">
      <div className="tool-detail-shell">
        {/* Header Section */}
        <div className="tool-detail-hero">
          <div className="tool-detail-icon">
            <img
              src="/RedTeam/port_scan.png"
              alt="Port Scanner"
              className="w-full h-full object-cover rounded-full border-2 border-red-500/25"
            />
          </div>
          <div className="tool-detail-copy">
            <h1 className="text-white text-3xl font-bold">
              Network Security Scanner
            </h1>
            <p className="text-[color:var(--text-muted)] text-base mt-1.5 max-w-xl leading-relaxed">
              Identify open ports, resolve remote hostnames, and evaluate potential security
              vulnerabilities on your public network infrastructure.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-[color:var(--surface-card)] border border-[color:var(--border)] rounded-2xl p-6 md:p-8 shadow-[var(--shadow-elevated)] backdrop-blur-xl relative overflow-hidden mb-8">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-[color:var(--gold)] to-red-500"></div>
          
          <div className="mb-6 pb-4 border-b border-[color:var(--border)]">
            <h2 className="text-lg font-bold text-[color:var(--text-heading)]">
              Enhanced Port Scanner
            </h2>
            <p className="text-[color:var(--text-muted)] text-sm mt-1">
              Advanced network diagnostic utilities with optional DNS resolution parameters.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Host */}
            <div className="mb-5">
              <label htmlFor="host-address" className="block text-[color:var(--text-heading)] font-semibold text-sm mb-2">
                Hostname or IP Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Globe className="h-4 w-4 text-[color:var(--text-muted)]" />
                </div>
                <input
                  id="host-address"
                  type="text"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="example.com or 192.168.1.1"
                  required
                  className="w-full bg-[color:var(--surface-subtle)] text-[color:var(--text-heading)] border border-[color:var(--border)] rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--gold)] focus:border-[color:var(--gold)] transition-all placeholder:text-[color:var(--text-muted)]"
                />
              </div>
            </div>

            {/* Ports */}
            <div className="mb-5">
              <label htmlFor="ports-range" className="block text-[color:var(--text-heading)] font-semibold text-sm mb-2">
                Port or Port Range
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-[color:var(--text-muted)]" />
                </div>
                <input
                  id="ports-range"
                  type="text"
                  value={portInput}
                  onChange={(e) => setPortInput(e.target.value)}
                  placeholder="80, 80-10000, or 'common'"
                  required
                  className="w-full bg-[color:var(--surface-subtle)] text-[color:var(--text-heading)] border border-[color:var(--border)] rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--gold)] focus:border-[color:var(--gold)] transition-all placeholder:text-[color:var(--text-muted)]"
                />
              </div>
              <p className="mt-1.5 text-xs text-[color:var(--text-muted)]">
                Input formatting: Single port (e.g., <code className="text-red-400">80</code>), range (e.g., <code className="text-red-400">80-10000</code>), or type <code className="text-red-400">'common'</code>.
              </p>
            </div>

            {/* Filter & Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              {/* Port Filter */}
              <div>
                <label htmlFor="port-filter" className="block text-[color:var(--text-heading)] font-semibold text-sm mb-2">
                  Port Filter
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Filter className="h-4 w-4 text-[color:var(--text-muted)]" />
                  </div>
                  <select
                    id="port-filter"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full bg-[color:var(--surface-subtle)] text-[color:var(--text-heading)] border border-[color:var(--border)] rounded-xl py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--gold)] focus:border-[color:var(--gold)] appearance-none transition-all cursor-pointer"
                  >
                    <option value="all">All Ports</option>
                    <option value="open">Open Ports Only</option>
                    <option value="closed">Closed Ports Only</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-[color:var(--text-muted)]" />
                  </div>
                </div>
                <p className="mt-1.5 text-xs text-[color:var(--text-muted)]">
                  Filter scan results based on current status.
                </p>
              </div>

              {/* Hostname Resolution */}
              <div>
                <label className="block text-[color:var(--text-heading)] font-semibold text-sm mb-2">
                  Additional Options
                </label>
                <div className="flex items-center space-x-3 mt-1">
                  <button
                    type="button"
                    onClick={() => setIncludeHostnames(!includeHostnames)}
                    aria-pressed={includeHostnames}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      includeHostnames
                        ? "bg-red-500/10 border-red-500/35 text-red-400"
                        : "bg-[color:var(--surface-subtle)] border-[color:var(--border)] text-[color:var(--text-muted)] hover:text-[color:var(--text-heading)]"
                    }`}
                  >
                    {includeHostnames ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                    <span>Include Hostnames</span>
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-[color:var(--text-muted)]">
                  Resolve hostnames for open ports (slower scan).
                </p>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-5 p-4 bg-red-950/20 border border-red-500/30 rounded-xl text-sm text-red-400 flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitDisabled}
              className={`w-full text-white py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-bold cursor-pointer shadow-lg ${
                submitDisabled
                  ? "bg-red-900/40 text-white/40 cursor-not-allowed border border-white/5"
                  : "bg-red-600 hover:bg-red-700 hover:scale-[1.01] active:scale-[0.99]"
              }`}
            >
              <Search className="h-5 w-5" />
              <span>{loading ? "Scanning Network..." : "Start Enhanced Scan"}</span>
            </button>
          </form>

          {/* Loader */}
          {loading && (
            <div className="mt-6 flex flex-col items-center justify-center p-8 bg-[color:var(--surface-subtle)] border border-[color:var(--border)] rounded-2xl animate-pulse">
              <div className="w-10 h-10 border-2 border-[color:var(--gold)] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-[color:var(--gold)] font-medium">Scanning network target...</p>
              <p className="text-[color:var(--text-muted)] text-sm mt-1">
                {includeHostnames
                  ? "Querying DNS hostname records..."
                  : "Analyzing port connection headers..."}
              </p>
            </div>
          )}

          {/* Results Block */}
          {!loading && result && (
            <div className="mt-8 border-t border-[color:var(--border)] pt-8">
              
              {/* Summary Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard label="Target Host" value={result.host} />
                <StatCard
                  label="Filtered Results"
                  value={`${result.summary?.filtered || 0} / ${
                    result.summary?.total || 0
                  }`}
                  highlight
                />
                <StatCard
                  label="Open Ports"
                  value={result.summary?.open || 0}
                  highlight={result.summary?.open > 0}
                />
                <StatCard
                  label="Risk Level"
                  value={result.summary?.riskAssessment || "Low"}
                  highlight
                />
              </div>

              {/* Filter Info Header Tag */}
              <div className="mb-6 p-4 bg-black/35 border border-[color:var(--border)] rounded-xl">
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                  <span className="text-[color:var(--text-muted)]">FILTER:</span>
                  <span className="text-[color:var(--text-heading)] font-semibold capitalize">
                    {result.filter || filter}
                  </span>
                  <span className="text-[color:var(--border)]">|</span>
                  <span className="text-[color:var(--text-muted)]">RANGE:</span>
                  <span className="text-[color:var(--text-heading)] font-semibold">
                    {result.portRange || "Custom Input"}
                  </span>
                  {result.includeHostnames && (
                    <>
                      <span className="text-[color:var(--border)]">|</span>
                      <div className="flex items-center gap-1 text-green-400">
                        <Server className="h-3.5 w-3.5" />
                        <span>DNS HOSTNAMES RESOLVED</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Export Options Panel */}
              <div className="mb-6">
                <ExportBar
                  baseName={`port-scan-${result.host}-${filter}`}
                  rows={rows}
                />
              </div>

              {/* Results Table */}
              {rows.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-[color:var(--border)] bg-black/10">
                  <table className="min-w-full text-sm">
                    <thead className="bg-black/45 border-b border-[color:var(--border)]">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-[color:var(--text-heading)]">
                          Port
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-[color:var(--text-heading)]">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-[color:var(--text-heading)]">
                          Service
                        </th>
                        {includeHostnames && (
                          <th className="px-4 py-3 text-left font-semibold text-[color:var(--text-heading)]">
                            Hostname
                          </th>
                        )}
                        <th className="px-4 py-3 text-left font-semibold text-[color:var(--text-heading)]">
                          Risk
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-[color:var(--text-heading)]">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[color:var(--border)]/30">
                      {rows.map((r, i) => (
                        <tr
                          key={`${r.port}-${i}`}
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td className="px-4 py-3 text-[color:var(--text-heading)] font-mono font-medium">
                            {r.port}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                              r.status === "Open" ? "bg-red-500/10 text-red-400" : "bg-gray-500/10 text-gray-400"
                            }`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[color:var(--text-body)]">
                            {r.service}
                          </td>
                          {includeHostnames && (
                            <td className="px-4 py-3 text-blue-400 font-mono text-xs">
                              {r.hostname}
                            </td>
                          )}
                          <td className="px-4 py-3">
                            {getRiskBadge(r.risk)}
                          </td>
                          <td className="px-4 py-3 text-[color:var(--text-muted)] text-xs">
                            {r.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* No Results Message */}
              {rows.length === 0 && (
                <div className="p-8 bg-[color:var(--surface-subtle)] border border-[color:var(--border)] rounded-2xl text-center">
                  <p className="text-[color:var(--text-body)] font-semibold">
                    No ports matched your filter criteria.
                  </p>
                  <p className="text-[color:var(--text-muted)] text-sm mt-1">
                    Try changing the filter option to "All Ports" or check another IP address.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }) {
  return (
    <div className="bg-black/30 border border-[color:var(--border)] rounded-xl p-4 transition hover:border-[color:var(--gold)]/30">
      <div className="text-xs text-[color:var(--text-muted)] uppercase tracking-wider mb-1">
        {label}
      </div>
      <div
        className={`text-lg font-bold tracking-tight ${
          highlight ? "text-[color:var(--gold)]" : "text-[color:var(--text-heading)]"
        }`}
      >
        {value ?? "—"}
      </div>
    </div>
  );
}

/* JSON / CSV Export */
function ExportBar({ baseName, rows }) {
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

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={downloadJSON}
        className="px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-black bg-[color:var(--gold)] hover:bg-[color:var(--gold-strong)] rounded-lg transition duration-200 cursor-pointer"
      >
        Export JSON
      </button>
      <button
        onClick={downloadCSV}
        className="px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-[color:var(--text-heading)] bg-transparent border border-[color:var(--border)] hover:bg-white/5 rounded-lg transition duration-200 cursor-pointer"
      >
        Export CSV
      </button>
      <div className="text-[color:var(--text-muted)] text-xs font-mono ml-auto">
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

