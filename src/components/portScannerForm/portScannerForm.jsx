"use client";

import { useMemo, useState } from "react";
import { Globe, Search, Filter, Eye, EyeOff, Server } from "lucide-react";
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

  // Get status-specific styling
  const getStatusStyle = (status) => {
    if (status === "Open") return "text-red-400 font-semibold";
    return "text-gray-400";
  };

  const getRiskStyle = (risk) => {
    if (risk === "High") return "text-red-400 font-semibold";
    if (risk === "Medium") return "text-yellow-400 font-semibold";
    if (risk === "Low") return "text-green-400 font-semibold";
    return "text-gray-400";
  };

  return (
    <div className="tool-detail-page min-h-screen w-full bg-black text-white">
      {/* Header Section */}
      <div className="tool-detail-shell tool-detail-hero flex items-center justify-left pt-12 pb-8 lg:px-100">
        <div className="flex items-center">
          <img
            src="/RedTeam/port_scan.png"
            alt="Port Scanner"
            className="w-30 h-30 mr-4 object-contain rounded-full border-2 border-red-600"
          />
          <div>
            <h1 className="text-white text-3xl font-bold">
              Network Security Scanner
            </h1>
            <p className="text-gray-400 text-xl">
              Identify open ports and potential security
              <br />
              vulnerabilities on your network infrastructure
            </p>
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="max-w-4xl mx-auto px-2 py-8 ">
        <div className="bg-red-600 text-white p-4 rounded-t-lg border border-white">
          <h2 className="text-lg font-semibold text-center">
            Enhanced Port Scanner
          </h2>
          <p className="text-red-100 text-sm text-center mt-1">
            Advanced scanning with filtering and hostname resolution
          </p>
        </div>

        {/* Form */}
        <div className="bg-gray-900 p-6 rounded-b-lg border border-white border-t-0">
          <form onSubmit={handleSubmit}>
            {/* Host */}
            <div className="mb-4">
              <label className="block text-white text-sm mb-2">
                Hostname or IP Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Globe className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="example.com or 192.168.1.1"
                  required
                  className="w-full bg-gray-800 text-white border border-white rounded p-2 pl-10 text-sm focus:outline-none focus:border-red-400"
                />
              </div>
            </div>

            {/* Ports */}
            <div className="mb-4">
              <label className="block text-white text-sm mb-2">
                Port or Port Range
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={portInput}
                  onChange={(e) => setPortInput(e.target.value)}
                  placeholder="80, 80-10000, or 'common'"
                  required
                  className="w-full bg-gray-800 text-white border border-white rounded p-2 pl-10 text-sm focus:outline-none focus:border-red-400"
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Single port (80), range (80-10000), or 'common'
              </p>
            </div>

            {/* Filter Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Port Filter */}
              <div>
                <label className="block text-white text-sm mb-2">
                  Port Filter
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Filter className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full bg-gray-800 text-white border border-white rounded p-2 pl-10 text-sm focus:outline-none focus:border-red-400 appearance-none"
                  >
                    <option value="all">All Ports</option>
                    <option value="open">Open Ports Only</option>
                    <option value="closed">Closed Ports Only</option>
                  </select>
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Filter scan results by port status
                </p>
              </div>

              {/* Hostname Resolution */}
              <div>
                <label className="block text-white text-sm mb-2">
                  Additional Options
                </label>
                <div className="flex items-center space-x-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setIncludeHostnames(!includeHostnames)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded border transition-colors ${
                      includeHostnames
                        ? "bg-red-600 border-red-600 text-white"
                        : "bg-gray-800 border-white text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {includeHostnames ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                    <span className="text-sm">Include Hostnames</span>
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Resolve hostnames for open ports (slower scan)
                </p>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div 
                className="mb-4 p-3 border rounded text-sm font-medium"
                style={{ 
                  backgroundColor: "rgba(220, 38, 38, 0.15)", 
                  borderColor: "rgba(220, 38, 38, 0.4)", 
                  color: "#fc8181" 
                }}
              >
                {error}
              </div>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={submitDisabled}
              className={`w-full bg-red-600 text-white py-3 px-4 rounded hover:bg-red-700 transition flex items-center justify-center gap-2 font-semibold ${
                submitDisabled ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              <Search className="h-5 w-5" />
              {loading ? "Scanning..." : "Start Enhanced Scan"}
            </button>
          </form>

          {/* Loader */}
          {loading && (
            <div className="mt-6 flex flex-col items-center justify-center p-6 bg-gray-800 rounded border border-white">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-red-400 mb-3"></div>
              <p className="text-red-400 font-medium">Scanning ports...</p>
              <p className="text-gray-400 text-sm mt-1">
                {includeHostnames
                  ? "Resolving hostnames..."
                  : "Analyzing port status..."}
              </p>
            </div>
          )}

          {/* Results */}
          {!loading && result && (
            <div className="mt-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
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

              {/* Filter Info */}
              <div className="mb-4 p-3 bg-gray-800 border border-white rounded">
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="text-gray-400">Filter:</span>
                  <span className="text-white font-medium capitalize">
                    {result.filter || filter}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-400">Range:</span>
                  <span className="text-white font-medium">
                    {result.portRange || "Custom"}
                  </span>
                  {result.includeHostnames && (
                    <>
                      <span className="text-gray-400">•</span>
                      <div className="flex items-center gap-1">
                        <Server className="h-4 w-4 text-green-400" />
                        <span className="text-green-400 text-sm">
                          Hostnames Resolved
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Export Options */}
              <div className="mb-4">
                <ExportBar
                  baseName={`port-scan-${result.host}-${filter}`}
                  rows={rows}
                />
              </div>

              {/* Results Table */}
              {rows.length > 0 && (
                <div className="overflow-x-auto rounded border border-white">
                  <table className="min-w-full text-sm bg-gray-800">
                    <thead className="bg-red-600">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-white border-b border-white">
                          Port
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-white border-b border-white">
                          Status
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-white border-b border-white">
                          Service
                        </th>
                        {includeHostnames && (
                          <th className="px-3 py-2 text-left font-medium text-white border-b border-white">
                            Hostname
                          </th>
                        )}
                        <th className="px-3 py-2 text-left font-medium text-white border-b border-white">
                          Risk
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-white border-b border-white">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <tr
                          key={`${r.port}-${i}`}
                          className={i % 2 ? "bg-gray-800" : "bg-gray-900"}
                        >
                          <td className="px-3 py-2 text-white font-mono border-b border-gray-700">
                            {r.port}
                          </td>
                          <td
                            className={`px-3 py-2 border-b border-gray-700 ${getStatusStyle(
                              r.status
                            )}`}
                          >
                            {r.status}
                          </td>
                          <td className="px-3 py-2 text-gray-300 border-b border-gray-700">
                            {r.service}
                          </td>
                          {includeHostnames && (
                            <td className="px-3 py-2 text-blue-400 border-b border-gray-700 font-mono text-xs">
                              {r.hostname}
                            </td>
                          )}
                          <td
                            className={`px-3 py-2 border-b border-gray-700 ${getRiskStyle(
                              r.risk
                            )}`}
                          >
                            {r.risk}
                          </td>
                          <td className="px-3 py-2 text-gray-300 border-b border-gray-700 text-xs">
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
                <div className="p-6 bg-gray-800 border border-white rounded text-center">
                  <p className="text-gray-400">
                    No ports found matching the current filter criteria.
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Try changing the filter to "All Ports" to see complete
                    results.
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
    <div className="bg-gray-800 border border-white rounded p-3">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div
        className={`text-base font-semibold ${
          highlight ? "text-red-400" : "text-white"
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
    <div className="flex gap-2">
      <button
        onClick={downloadJSON}
        className="bg-red-600 text-white px-4 py-2 text-sm rounded hover:bg-red-700 transition"
      >
        Export JSON
      </button>
      <button
        onClick={downloadCSV}
        className="bg-red-600 text-white px-4 py-2 text-sm rounded hover:bg-red-700 transition"
      >
        Export CSV
      </button>
      <div className="text-gray-400 text-sm flex items-center ml-2">
        {rows.length} result{rows.length !== 1 ? "s" : ""}
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
