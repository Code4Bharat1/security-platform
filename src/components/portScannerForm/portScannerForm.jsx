"use client";

import { useMemo, useState } from "react";
import { Globe, Search, ShieldCheck } from 'lucide-react';

// Set your API base
const API = 'http://localhost:4180';

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

      // Simulate API call with mock data
      setTimeout(() => {
        const mockPorts = {};
        const portList = parsed.mode === "single" ? [parsed.port] : 
                        parsed.mode === "range" ? Array.from({length: Math.min(10, parsed.end - parsed.start + 1)}, (_, i) => parsed.start + i) :
                        parsed.ports.slice(0, 10);

        portList.forEach(port => {
          const isOpen = Math.random() > 0.7;
          mockPorts[port] = {
            port,
            open: isOpen,
            service: isOpen ? (port === 80 ? "HTTP" : port === 443 ? "HTTPS" : port === 22 ? "SSH" : "Unknown") : null,
            risk: isOpen ? (port === 22 ? "High" : port === 80 || port === 443 ? "Medium" : "Low") : null,
            description: isOpen ? `Service running on port ${port}` : `Port ${port} is closed`
          };
        });

        const openCount = Object.values(mockPorts).filter(p => p.open).length;
        const total = Object.keys(mockPorts).length;

        setResult({
          host,
          ports: mockPorts,
          openPorts: Object.values(mockPorts).filter(p => p.open).map(p => p.port),
          suspicious: Object.values(mockPorts).filter(p => p.open && p.risk === "High").map(p => p.port),
          summary: {
            total,
            open: openCount,
            riskAssessment: openCount > total * 0.3 ? "High" : (openCount > total * 0.1 ? "Medium" : "Low")
          },
          recommendations: openCount > 0 ? ["Review open ports", "Implement firewall rules"] : []
        });
        setLoading(false);
      }, 2000);

    } catch (err) {
      setError(err?.message || "Scan failed.");
      setLoading(false);
    }
  };

  const rows = useMemo(() => {
    if (!result?.ports) return [];
    return Object.values(result.ports).map((p) => ({
      port: p.port,
      status: p.open ? "Open" : "Closed",
      service: p.service || "N/A",
      risk: p.risk || "N/A",
      description: p.description || "N/A",
    }));
  }, [result]);

  const downloadPDF = async () => {
    if (!result) return;
    console.log("PDF download functionality would be implemented here");
  };

  const submitDisabled = loading || !host.trim() || !portInput.trim();

  return (
    <div className="min-h-screen w-full" style={{backgroundColor: '#1a1a1a'}}>
      {/* Header Section */}
<div className="flex items-center justify-center pt-12 pb-8">
  <div className="flex items-center">
    <img 
      src="/RedTeam/port_scan.png" 
      alt="Security Scanner" 
      className="w-22 h-22 mr-4 object-contain" 
    />
    <div>
      <h1 className="text-white text-2xl font-bold">Network Security Scanner</h1>
      <p className="text-gray-400 text-sm">
        Identify open ports and potential security<br />
        vulnerabilities on your network infrastructure
      </p>
    </div>
  </div>
</div>


      {/* Main Container */}
      <div className="max-w-md mx-auto px-4">
        {/* Card Header */}
        <div className="bg-red-600 text-white p-4 rounded-t-lg border border-white-600">
          <h2 className="text-lg font-semibold text-center">Port Scanner</h2>
          <p className="text-red-100 text-sm text-center mt-1">
            Enter your target host and port range to begin scanning
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-gray-900 p-6 rounded-b-lg border border-white-600 border-t-0">
          <div>
            {/* Host Input */}
            <div className="mb-4">
              <label className="block text-white text-sm mb-2">
                Hostname or IP Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Globe className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="text"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="example.com or 192.168.1.1"
                  required
                  className="w-full bg-gray-800 text-white border border-white-600 rounded p-2 pl-10 text-sm focus:outline-none focus:border-white-400"
                />
              </div>
            </div>

            {/* Port Input */}
            <div className="mb-6">
              <label className="block text-white text-sm mb-2">
                Port or Port Range
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="text"
                  value={portInput}
                  onChange={(e) => setPortInput(e.target.value)}
                  placeholder="80, 80-10000, or 'common'"
                  required
                  className="w-full bg-gray-800 text-white border border-white-600 rounded p-2 pl-10 text-sm focus:outline-none focus:border-white-400"
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Single port (80), range (80-10000), or 'common' for well-known ports
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-3 bg-red-900 border border-white-700 rounded">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={submitDisabled}
              className={`w-full bg-red-600 text-white py-3 px-4 rounded hover:bg-red-700 transition-colors duration-300 flex items-center justify-center gap-2 font-semibold ${
                submitDisabled ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              <Search className="h-5 w-5" />
              {loading ? "Scanning..." : "Start Port Scan"}
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="mt-6 flex flex-col items-center justify-center p-6 bg-gray-800 rounded border border-white-600">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-white-500 mb-3"></div>
              <p className="text-red-400 font-medium">Scanning ports...</p>
            </div>
          )}

          {/* Results Section */}
          {!loading && result && (
            <div className="mt-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <StatCard label="Target Host" value={result.host} />
                <StatCard label="Open Ports" value={`${result.summary.open} / ${result.summary.total}`} highlight />
                <StatCard label="Risk Level" value={result.summary.riskAssessment} highlight />
                <div className="bg-gray-800 border border-white-600 rounded p-3">
                  <button
                    onClick={downloadPDF}
                    className="w-full bg-red-600 text-white px-3 py-2 text-sm rounded hover:bg-red-700 transition-colors"
                  >
                    PDF Report
                  </button>
                </div>
              </div>

              {/* Results Table */}
              {rows.length > 0 && (
                <div className="overflow-x-auto rounded border border-white-600">
                  <table className="min-w-full text-sm bg-gray-800">
                    <thead className="bg-red-600">
                      <tr>
                        {Object.keys(rows[0]).map((h) => (
                          <th key={h} className="px-3 py-2 text-left font-medium text-white border-b border-white-500">
                            {h.charAt(0).toUpperCase() + h.slice(1)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <tr key={`${r.port}-${i}`} className={i % 2 ? "bg-gray-800" : "bg-gray-900"}>
                          {Object.keys(rows[0]).map((h) => (
                            <td key={h} className="px-3 py-2 text-gray-300 border-b border-gray-700">
                              <span className={
                                h === 'status' && r[h] === 'Open' ? 'text-red-400' :
                                h === 'status' && r[h] === 'Closed' ? 'text-green-400' :
                                h === 'risk' && r[h] === 'High' ? 'text-red-400' :
                                h === 'risk' && r[h] === 'Medium' ? 'text-yellow-400' :
                                h === 'risk' && r[h] === 'Low' ? 'text-green-400' :
                                'text-gray-300'
                              }>
                                {String(r[h])}
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations && result.recommendations.length > 0 && (
                <div className="mt-4 bg-gray-800 border border-white-600 rounded p-4">
                  <h4 className="font-semibold text-white mb-2">Recommendations</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {result.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-300">{rec}</li>
                    ))}
                  </ul>
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
    <div className="bg-gray-800 border border-white-600 rounded p-3">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className={`text-base font-semibold ${highlight ? "text-red-400" : "text-white"}`}>
        {value ?? "—"}
      </div>
    </div>
  );
}