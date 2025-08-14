"use client";

import { useMemo, useState } from "react";
// Optional icons (install: npm i lucide-react). Safe to remove if not used.
let Globe, Search, ShieldCheck;
try {
  ({ Globe, Search, ShieldCheck } = require("lucide-react"));
} catch { /* fallback */ }

// Set your API base (must include /api if your server mounts there)
const API = (process.env.NEXT_PUBLIC_PROD_API_URL ).replace(/\/+$/, "");

/** "20" -> {mode:"single",port:20}
 *  "60-2000" -> {mode:"range",start:60,end:2000}
 *  "common" -> {mode:"set",ports:[...]}
 */
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
  const [portInput, setPortInput] = useState(""); // "20", "60-2000", "common"
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
        // “common”: union of individual singles
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

      // single/range call
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

  const downloadPDF = async () => {
    if (!result) return;
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF({ unit: "pt", format: "a4" });

    doc.setFontSize(14);
    doc.text("Port Scan Report", 40, 40);

    const s = result.summary || {};
    const lines = [
      `Target Host: ${result.host || "-"}`,
      `Open Ports: ${s.open ?? "-"} / ${s.total ?? "-"}`,
      `Risk Level: ${s.riskAssessment || "-"}`,
      ...(result.recommendations?.length ? [`Recommendations: ${result.recommendations.join(" ")}`] : []),
    ];
    doc.setFontSize(10);
    lines.forEach((ln, i) => doc.text(ln, 40, 60 + i * 14));

    const columns = rows[0] ? Object.keys(rows[0]) : ["port","status","service","risk","description"];
    const body = (rows.length ? rows : Object.values(result.ports || {}).map(p => ({
      port: p.port, status: p.open ? "Open" : "Closed", service: p.service, risk: p.risk, description: p.description
    }))).map(r => columns.map(c => String(r[c] ?? "")));

    autoTable(doc, {
      startY: 60 + lines.length * 14 + 12,
      head: [columns],
      body,
      styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
    });

    doc.save(`port-scan-${result.host || "target"}.pdf`);
  };

  const submitDisabled = loading || !host.trim() || !portInput.trim();

  return (
    <div className="min-h-screen w-full bg-emerald-50/60">
      {/* Hero */}
      <header className="mx-auto max-w-5xl px-4 pt-12 pb-6 text-center">
        <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 ring-1 ring-emerald-200">
          {ShieldCheck ? <ShieldCheck className="h-6 w-6 text-emerald-600" /> : <span className="text-emerald-600">🛡️</span>}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-700 tracking-tight">
          Network Security Scanner
        </h1>
        <p className="mt-2 text-sm sm:text-base text-emerald-900/70">
          Identify open ports and potential security vulnerabilities on your network infrastructure
        </p>
      </header>

      {/* Card */}
      <div className="mx-auto max-w-5xl px-4 pb-10">
        <div className="rounded-2xl bg-white shadow-xl ring-1 ring-emerald-100/60">
          {/* Card header */}
          <div className="border-b border-emerald-100 px-6 py-4 text-center">
            <div className="mx-auto inline-flex items-center gap-2 text-emerald-700 font-semibold">
              {Search ? <Search className="h-5 w-5" /> : <span>🔎</span>}
              <span>Port Scanner</span>
            </div>
            <p className="mt-1 text-xs text-emerald-900/70">Enter your target host and port range to begin scanning</p>
          </div>

          {/* Form */}
          <div className="px-6 py-6">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-6">
              {/* Host */}
              <div className="sm:col-span-3">
                <label className="mb-1 block text-xs font-medium text-emerald-900/80">
                  Hostname or IP Address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    {Globe ? <Globe className="h-4 w-4 text-emerald-500" /> : <span className="text-emerald-500">🌐</span>}
                  </div>
                  <input
                    className="w-full rounded-lg border border-emerald-200 bg-white pl-9 pr-3 py-2 text-sm outline-none ring-0 placeholder:text-emerald-900/40 focus:border-emerald-400 focus:ring focus:ring-emerald-200"
                    placeholder="example.com or 192.168.1.1"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    required
                    aria-label="Hostname or IP"
                  />
                </div>
              </div>

              {/* Port / Range */}
              <div className="sm:col-span-3">
                <label className="mb-1 block text-xs font-medium text-emerald-900/80">
                  Port or Port Range
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    {Search ? <Search className="h-4 w-4 text-emerald-500" /> : <span className="text-emerald-500">🔍</span>}
                  </div>
                  <input
                    className="w-full rounded-lg border border-emerald-200 bg-white pl-9 pr-3 py-2 text-sm outline-none ring-0 placeholder:text-emerald-900/40 focus:border-emerald-400 focus:ring focus:ring-emerald-200"
                    placeholder="80, 80-10000, or 'common'"
                    value={portInput}
                    onChange={(e) => setPortInput(e.target.value)}
                    required
                    aria-label="Port input"
                  />
                </div>
                <p className="mt-1 text-[11px] text-emerald-900/60">
                  Single port (80), range (80-10000), or <span className="font-mono">'common'</span> for well‑known ports
                </p>
              </div>

              {/* CTA */}
              <div className="sm:col-span-6">
                <button
                  type="submit"
                  disabled={submitDisabled}
                  className={`group w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition
                    hover:bg-emerald-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-300
                    ${submitDisabled ? "opacity-70 cursor-not-allowed" : ""}`}
                  aria-busy={loading}
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    {Search ? <Search className="h-4 w-4" /> : <span>🔎</span>}
                    {loading ? "Scanning..." : "Start Port Scan"}
                  </span>
                </button>
              </div>
            </form>

            {/* Error */}
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </div>
        </div>

        {/* Summary cards (keep older stat layout) */}
        {result?.summary && (
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-4">
            <StatCard label="Target Host" value={result.host} />
            <div className="flex items-center rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <button
                onClick={downloadPDF}
                className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm text-white hover:bg-black"
              >
                Download PDF Report
              </button>
            </div>
            <StatCard label="Open Ports" value={`${result.summary.open} / ${result.summary.total}`} highlight />
            <StatCard label="Risk Level" value={result.summary.riskAssessment} highlight />
          </div>
        )}

        {/* Export + PDF */}
        {result && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button onClick={downloadPDF} className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white hover:bg-black">
              Download PDF Report
            </button>
            <ExportBar baseName={`port-scan-${result?.host || "target"}`} rows={rows} />
          </div>
        )}

        {/* Results table */}
        {rows.length > 0 && (
          <div className="mt-4 overflow-x-auto rounded-md border border-emerald-100">
            <table className="min-w-full text-sm">
              <thead className="bg-emerald-50">
                <tr>
                  {Object.keys(rows[0]).map((h) => (
                    <th key={h} className="border-b border-emerald-100 px-3 py-2 text-left font-medium text-emerald-900/80">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={`${r.port}-${i}`} className={i % 2 ? "bg-white" : "bg-emerald-50/40"}>
                    {Object.keys(rows[0]).map((h) => (
                      <td key={h} className="border-b border-emerald-100 px-3 py-2 align-top">
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
    </div>
  );
}

function StatCard({ label, value, highlight }) {
  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
      <div className="text-[11px] text-emerald-900/70">{label}</div>
      <div className={`text-base font-semibold ${highlight ? "text-amber-700" : "text-emerald-900"}`}>
        {value ?? "—"}
      </div>
    </div>
  );
}

/* ---------- Small export bar with JSON/CSV/PDF ---------- */
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
  const downloadPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    doc.text(baseName, 40, 40);
    const columns = rows[0] ? Object.keys(rows[0]) : [];
    const body = rows.map((r) => columns.map((c) => String(r[c] ?? "")));
    autoTable(doc, {
      startY: 60,
      head: [columns],
      body,
      styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
    });
    doc.save(`${baseName}.pdf`);
  };
  return (
    <div className="flex items-center gap-2">
      <button onClick={downloadJSON} className="rounded-md bg-gray-900 px-3 py-2 text-sm text-white hover:bg-black">
        JSON
      </button>
      <button onClick={downloadCSV} className="rounded-md bg-gray-900 px-3 py-2 text-sm text-white hover:bg-black">
        CSV
      </button>
      <button onClick={downloadPDF} className="rounded-md bg-gray-900 px-3 py-2 text-sm text-white hover:bg-black">
        PDF
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
