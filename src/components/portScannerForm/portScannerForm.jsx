"use client";

import { useMemo, useState } from "react";
import { Globe, Search } from "lucide-react";

// Set your API base
const API = (process.env.NEXT_PUBLIC_PROD_API_URL)?.replace(/\/+$/, "");

/** parse port input helper */
function parsePortInput(input) {
  const s = String(input || "").trim().toLowerCase();
  if (!s) return null;

  if (s === "common") {
    return { mode: "set", ports: [21,22,23,25,53,80,110,143,443,445,3306,3389,8080,8443] };
  }

  const range = s.match(/^(\d{1,5})\s*-\s*(\d{1,5})$/);
  if (range) {
    const start = parseInt(range[1], 10);
    const end = parseInt(range[2], 10);
    if (start >= 1 && end <= 65535 && start <= end) return { mode: "range", start, end };
    return null;
  }

  const single = parseInt(s, 10);
  if (!isNaN(single) && single >= 1 && single <= 65535) return { mode: "single", port: single };

  return null;
}

export default function PortScannerForm() {
  const [host, setHost] = useState("");
  const [portInput, setPortInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!host || !portInput || loading) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const parsed = parsePortInput(portInput);
      if (!parsed) throw new Error("Invalid port input. Use '80', '60-2000', or 'common'.");

      let qs = new URLSearchParams({ host });

      if (parsed.mode === "single") {
        qs.set("port", String(parsed.port));
      } else if (parsed.mode === "range") {
        qs.set("startPort", String(parsed.start));
        qs.set("endPort", String(parsed.end));
      } else if (parsed.mode === "set") {
        const gathered = [];
        for (const p of parsed.ports) {
          const q = new URLSearchParams({ host, port: String(p) }).toString();
          const r = await fetch(`${API}/port/port-scan?${q}`);
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          const d = await r.json();
          gathered.push(...Object.values(d.ports));
        }
        const byPort = {};
        for (const p of gathered) byPort[p.port] = p;
        const portsObj = Object.fromEntries(Object.values(byPort).map((p) => [p.port, p]));
        const total = Object.keys(portsObj).length;
        const openCount = Object.values(portsObj).filter((p) => p.open).length;
        setResult({
          host,
          ports: portsObj,
          openPorts: Object.values(portsObj).filter(p => p.open).map(p => p.port),
          suspicious: Object.values(portsObj).filter(p => p.open && p.risk === "High").map(p => p.port),
          summary: { total, open: openCount, riskAssessment: openCount > total * 0.3 ? "High" : (openCount > total * 0.1 ? "Medium" : "Low") },
          recommendations: [],
        });
        setLoading(false);
        return;
      }

      const res = await fetch(`${API}/port/port-scan?${qs.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err?.message || "Scan failed.");
    } finally {
      setLoading(false);
    }
  };

  const rows = useMemo(() => {
    if (!result?.ports) return [];
    return Object.values(result.ports).map((p) => ({
      port: p.port,
      status: p.open ? "Open" : "Closed",
      service: p.service,
      risk: p.risk,
      description: p.description,
    }));
  }, [result]);

  const submitDisabled = loading || !host.trim() || !portInput.trim();

  return (
    <div className="min-h-screen w-full bg-black">
      {/* Header Section */}
      <div className="flex items-center justify-left pt-12 pb-8 px-100">
        <div className="flex items-center">
          <img 
            src="/RedTeam/port_scan.png"
            alt="Port Scanner"
            className="w-30 h-30  mr-4 object-contain rounded-full border-2 border-red-600"
          />
          <div>
            <h1 className="text-white text-3xl font-bold">Network Security Scanner</h1>
            <p className="text-gray-400 text-xl">
              Identify open ports and potential security<br />
              vulnerabilities on your network infrastructure
            </p>
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-red-600 text-white p-4 rounded-t-lg border border-white">
          <h2 className="text-lg font-semibold text-center">Port Scanner</h2>
          <p className="text-red-100 text-sm text-center mt-1">
            Enter your target host and port range to begin scanning
          </p>
        </div>

        {/* Form */}
        <div className="bg-gray-900 p-6 rounded-b-lg border border-white border-t-0">
          <form onSubmit={handleSubmit}>
            {/* Host */}
            <div className="mb-4">
              <label className="block text-white text-sm mb-2">Hostname or IP Address</label>
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
            <div className="mb-6">
              <label className="block text-white text-sm mb-2">Port or Port Range</label>
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

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-red-900 border border-white rounded">
                <p className="text-red-200 text-sm">{error}</p>
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
              {loading ? "Scanning..." : "Start Port Scan"}
            </button>
          </form>

          {/* Loader */}
          {loading && (
            <div className="mt-6 flex flex-col items-center justify-center p-6 bg-gray-800 rounded border border-white">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-red-400 mb-3"></div>
              <p className="text-red-400 font-medium">Scanning ports...</p>
            </div>
          )}

          {/* Results */}
          {!loading && result && (
            <div className="mt-6">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <StatCard label="Target Host" value={result.host} />
                <StatCard label="Open Ports" value={`${result.summary.open} / ${result.summary.total}`} highlight />
                <StatCard label="Risk Level" value={result.summary.riskAssessment} highlight />
                <ExportBar baseName={`port-scan-${result.host}`} rows={rows} />
              </div>

              {/* Table */}
              {rows.length > 0 && (
                <div className="overflow-x-auto rounded border border-white">
                  <table className="min-w-full text-sm bg-gray-800">
                    <thead className="bg-red-600">
                      <tr>
                        {Object.keys(rows[0]).map((h) => (
                          <th key={h} className="px-3 py-2 text-left font-medium text-white border-b border-white">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <tr key={`${r.port}-${i}`} className={i % 2 ? "bg-gray-800" : "bg-gray-900"}>
                          {Object.keys(rows[0]).map((h) => (
                            <td key={h} className="px-3 py-2 text-gray-300 border-b border-gray-700">
                              {String(r[h])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
      <div className={`text-base font-semibold ${highlight ? "text-red-400" : "text-white"}`}>
        {value ?? "—"}
      </div>
    </div>
  );
}

/* JSON / CSV / PDF Export */
function ExportBar({ baseName, rows }) {
  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
    triggerDownload(blob, `${baseName}.json`);
  };
  const downloadCSV = () => {
    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: "text/csv" });
    triggerDownload(blob, `${baseName}.csv`);
  };
  return (
    <div className="bg-gray-800 border border-white rounded p-3 flex flex-col gap-2">
      <button onClick={downloadJSON} className="w-full bg-red-600 text-white px-3 py-2 text-sm rounded hover:bg-red-700">
        JSON
      </button>
      <button onClick={downloadCSV} className="w-full bg-red-600 text-white px-3 py-2 text-sm rounded hover:bg-red-700">
        CSV
      </button>
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
