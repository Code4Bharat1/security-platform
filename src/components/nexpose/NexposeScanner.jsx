"use client";
import { useMemo, useState } from "react";
import { Radar, ChevronDown, ChevronUp, ExternalLink, Clipboard } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/** Safe API base with fallback */
const API_BASE = (process.env.NEXT_PUBLIC_PROD_API_URL)
// .replace(/\/+$/, "");

/** Strict http(s) URL validation */
function isValidHttpUrl(value) {
  try {
    const u = new URL(String(value).trim());
    return (u.protocol === "http:" || u.protocol === "https:") && !!u.hostname;
  } catch {
    return false;
  }
}

export default function NexposeScanner() {
  const [url, setUrl] = useState("");
  const [paramName] = useState("test");        // using defaults (inputs hidden)
  const [method] = useState("GET");
  const [postEncoder] = useState("form");
  const [customHeaders] = useState("");        // inputs hidden; keep API shape
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [urlError, setUrlError] = useState(""); // <-- inline URL error
  const [openIdx, setOpenIdx] = useState(null);
  const [showPositivesOnly, setShowPositivesOnly] = useState(false);

  const urlIsValid = isValidHttpUrl(url);
  const typesList = useMemo(() => (result?.coverage?.typesAttempted || []), [result]);

  function onUrlChange(v) {
    const val = v.replace(/\s+/g, " ").trim();
    setUrl(val);
    if (!val) {
      setUrlError("");
      return;
    }
    setUrlError(isValidHttpUrl(val) ? "" : "Invalid URL. Use http(s)://host[/path]");
  }

  async function handleScan() {
    setError("");
    setResult(null);

    if (!url.trim()) {
      setUrlError("URL is required");
      return;
    }
    if (!urlIsValid) {
      setUrlError("Invalid URL. Use http(s)://host[/path]");
      return;
    }

    setScanning(true);

    // We keep the shape for future use; currently headers input is hidden
    let headers = {};
    if (customHeaders.trim()) {
      try {
        headers = JSON.parse(customHeaders);
      } catch {
        setScanning(false);
        setError("Custom headers must be valid JSON.");
        return;
      }
    }

    try {
      const res = await fetch(`${API_BASE}/nexpose/sql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, method, paramName, headers, postEncoder }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        // propagate backend message precisely if present
        throw new Error(data?.message || `HTTP ${res.status}`);
      }
      setResult(data);
    } catch (e) {
      setError(e.message || "Failed to scan.");
    } finally {
      setScanning(false);
    }
  }

  function copy(text) {
    navigator.clipboard.writeText(text).catch(() => {});
  }

  function exportPDF() {
    if (!result) return;
    const doc = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });

    doc.setFontSize(14);
    doc.text("SQL Injection Scan Report", 40, 40);
    doc.setFontSize(10);
    doc.text(`Target: ${result.url}`, 40, 58);
    doc.text(`Method: ${result.method} (param: ${result.paramName})`, 40, 72);
    doc.text(`Risk: ${result.riskScore}/100 (${result.riskLevel})`, 40, 86);
    doc.text(`Coverage: ${result.payloadsTested} payloads`, 40, 100);
    doc.text(`Types: ${(result.typesAttempted || []).join(", ")}`, 40, 114);
    doc.text(`OWASP: ${result.owasp}`, 40, 128);

    const head = [["#", "Type", "Payload/Pair", "Evidence", "Status", "Time(ms)"]];
    const rows = (result.tests || []).map((f, i) => [
      String(i + 1),
      f.type,
      (f.payload || "").slice(0, 96),
      (f.evidence || "—").slice(0, 96),
      String(f.status),
      String(f.timeMs),
    ]);

    autoTable(doc, {
      startY: 150,
      head,
      body: rows,
      styles: { fontSize: 8, cellPadding: 3, overflow: "linebreak" },
      headStyles: { fillColor: [240, 240, 240] },
      margin: { left: 40, right: 40 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 100 },
        2: { cellWidth: 150 },
        3: { cellWidth: 120 },
        4: { cellWidth: 50 },
        5: { cellWidth: 50 },
      },
    });

    doc.save("sqli_scan_report.pdf");
  }

  function exportJSON() {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = "sqli_scan_result.json";
    a.click();
    URL.revokeObjectURL(href);
  }

  const rows = useMemo(() => {
    if (!result) return [];
    return showPositivesOnly ? (result.findings || []) : (result.tests || []);
  }, [result, showPositivesOnly]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center pt-10 px-4">
      {/* Header with logo and title */}
{/* Header with logo and title */}
<div className="text-center mb-4">
  <div className="flex items-center justify-center mb-4">
    <div className="w-20 h-20 rounded-full overflow-hidden mr-4 border-4 border-red-500">
      <img
        src="/Redteam/sql_injection.png" // <-- apni image path
        alt="Logo"
        className="w-full h-full object-cover"
      />
    </div>
    <div className="text-left">
      <h1 className="text-2xl font-bold text-white">SQLi Scanner</h1>
      <p className="text-gray-400 text-sm">
        Detect error-based, union-based, boolean/time-based blind SQLi.
      </p>
    </div>
  </div>
</div>



      {/* Main scanner box */}
      <div className="bg-black border-2 border-white-600 rounded-lg p-6 w-full max-w-md">
        {/* URL input with validation */}
        <label className="block text-white font-medium mb-2">Target URL</label>
        <input
          className={`w-full px-4 py-3 bg-black border-2 rounded-lg text-white placeholder-gray-500 focus:outline-none ${
            urlError ? "border-red-500" : "border-white-600 focus:border-red-600"
          }`}
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://example.com"
          aria-invalid={!!urlError}
          aria-describedby="url-error"
        />
        {urlError && (
          <div id="url-error" className="mt-2 text-sm text-red-400">
            {urlError}
          </div>
        )}

        <button
          onClick={handleScan}
          disabled={scanning || !urlIsValid}
          className={`mt-6 w-full py-3 rounded-lg text-white font-semibold border-2 transition-colors ${
            scanning || !urlIsValid 
              ? "bg-red-800 border-white-600 cursor-not-allowed" 
              : "bg-red-700 border-red-600 hover:bg-red-800 hover:border-red-700"
          }`}
        >
          {scanning ? "Scanning..." : "Start SQLi Scan"}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-900 border border-red-600 text-red-300 rounded">
            {error}
          </div>
        )}
      </div>

      {/* Results section */}
      {result && (
        <div className="mt-8 w-full max-w-6xl space-y-6">
          {/* Summary */}
          <div className="bg-gray-900 border border-white-700 rounded-lg p-6">
            {/* Status banners */}
            {result.scanStatus !== "ok" && (
              <div className={
                result.scanStatus === "unreachable"
                  ? "p-4 mb-4 rounded border bg-red-900 border-red-600 text-red-300"
                  : result.scanStatus === "inconclusive"
                  ? "p-4 mb-4 rounded border bg-yellow-900 border-yellow-600 text-yellow-300"
                  : "p-4 mb-4 rounded border bg-blue-900 border-blue-600 text-blue-300"
              }>
                <div className="font-semibold capitalize">{result.scanStatus}</div>
                <div className="text-sm">{result.message}</div>
                <div className="text-xs mt-1">
                  Attempted: <span className="font-semibold">{result.payloadsAttempted}</span> · 
                  Succeeded: <span className="font-semibold">{result.payloadsSucceeded}</span> · 
                  Success rate: <span className="font-semibold">{Math.round((result.successRate||0)*100)}%</span>
                </div>
                {result.diagnostics?.baseline?.error && (
                  <div className="text-xs mt-1">Baseline error: {result.diagnostics.baseline.error}</div>
                )}
              </div>
            )}

            {/* Normal summary */}
            {(result.scanStatus === "ok" || result.scanStatus === "degraded") && (
              <>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="text-sm text-gray-300">
                    <div className="font-semibold text-white">
                      Scan Completed {result.scanStatus === "degraded" && "(degraded confidence)"}
                    </div>
                    <div>{result.payloadsAttempted} payloads attempted · {result.payloadsSucceeded} succeeded</div>
                    <div>Types: {(result.coverage?.typesAttempted || []).join(", ")}</div>
                    <div>OWASP: {result.owasp}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Risk Score</div>
                    <div className="text-2xl font-bold text-white">{result.riskScore}/100</div>
                    <div className="text-sm text-gray-400">{result.riskLevel}</div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-400">
                  Method: <span className="font-semibold text-white">{result.method}</span> &nbsp;|&nbsp;
                  Parameter: <span className="font-semibold text-white">{result.paramName}</span>
                </div>
                {result.pocUrl && (
                  <div className="mt-4 flex items-center gap-2">
                    <ExternalLink size={16} className="text-gray-400" />
                    <a href={result.pocUrl} target="_blank" rel="noreferrer" className="text-red-400 underline break-all">
                      Proof of Concept URL
                    </a>
                    <button 
                      onClick={() => navigator.clipboard.writeText(result.pocUrl)}
                      className="ml-2 px-2 py-1 text-xs bg-red-700 text-white rounded inline-flex items-center gap-1 hover:bg-red-800"
                    >
                      <Clipboard size={14} /> Copy
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Toggle controls */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-300">
              Showing: <span className="font-semibold text-white">{showPositivesOnly ? (result.findingsCount || 0) : (result.payloadsTested || 0)}</span>{" "}
              {showPositivesOnly ? "positive finding(s)" : "test(s)"}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPositivesOnly(false)}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  !showPositivesOnly ? "bg-red-700 text-white border border-red-600" : "bg-gray-800 text-gray-300 border border-white-700 hover:bg-gray-700"
                }`}
              >
                All tests
              </button>
              <button
                onClick={() => setShowPositivesOnly(true)}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  showPositivesOnly ? "bg-red-700 text-white border border-red-600" : "bg-gray-800 text-gray-300 border border-white-700 hover:bg-gray-700"
                }`}
              >
                Positive only
              </button>
            </div>
          </div>

          {/* Vulnerability Details */}
          {result?.vulnerable && result?.vulnerabilityDetails?.length > 0 && (
            <div className="bg-gray-900 border border-white-700 rounded-lg p-6">
              <div className="font-semibold text-white mb-4">Vulnerability Details</div>
              <div className="space-y-4">
                {result.vulnerabilityDetails.map((v, i) => (
                  <div key={i} className="p-4 rounded-lg bg-gray-800 border border-white-700">
                    <div className="flex flex-wrap items-center gap-3 text-sm mb-3">
                      <span className="px-2 py-1 rounded bg-white text-black font-medium">Method: {v.method}</span>
                      <span className="px-2 py-1 rounded bg-gray-700 text-gray-300">Parameter: {v.parameter}</span>
                      <span
                        className={`px-2 py-1 rounded font-medium ${
                          v.risk === "High"
                            ? "bg-red-700 text-white"
                            : v.risk === "Medium"
                            ? "bg-yellow-700 text-white"
                            : "bg-green-700 text-white"
                        }`}
                      >
                        Risk: {v.risk}
                      </span>
                      <span className="px-2 py-1 rounded bg-blue-700 text-white">{v.owasp}</span>
                    </div>
                    <div className="text-sm">
                      <div className="font-semibold text-white mb-2">Payload that worked</div>
                      <div className="flex items-center gap-2">
                        <code className="break-all bg-black border border-white-600 px-3 py-2 rounded text-gray-300 flex-1">
                          {v.payload}
                        </code>
                        <button
                          onClick={() => navigator.clipboard.writeText(v.payload)}
                          className="px-3 py-2 text-sm bg-red-700 text-white rounded hover:bg-red-800 whitespace-nowrap"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results table */}
          <div className="bg-gray-900 border border-white-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-white font-medium">#</th>
                    <th className="px-4 py-3 text-left text-white font-medium">Type</th>
                    <th className="px-4 py-3 text-left text-white font-medium">Evidence</th>
                    <th className="px-4 py-3 text-left text-white font-medium">Status</th>
                    <th className="px-4 py-3 text-left text-white font-medium">Time (ms)</th>
                    <th className="px-4 py-3 text-left text-white font-medium">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((f, idx) => {
                    const open = openIdx === idx;
                    return (
                      <tr key={idx} className="border-t border-white-700">
                        <td className="px-4 py-3 text-gray-300">{idx + 1}</td>
                        <td className="px-4 py-3 text-gray-300">{f.type}</td>
                        <td className="px-4 py-3 text-gray-300">{f.evidence || (f.error ? "Request error" : "—")}</td>
                        <td className="px-4 py-3 text-gray-300">{String(f.status)}</td>
                        <td className="px-4 py-3 text-gray-300">{String(f.timeMs)}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setOpenIdx(open ? null : idx)}
                            className="px-3 py-1 text-xs bg-red-700 text-white rounded inline-flex items-center gap-1 hover:bg-red-800"
                          >
                            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />} 
                            {open ? "Hide" : "View"}
                          </button>
                          {open && (
                            <div className="mt-3 p-3 bg-gray-800 rounded text-xs border border-white-600">
                              <div className="text-gray-300 mb-1">
                                <span className="font-semibold text-white">Parameter:</span> {f.param}
                              </div>
                              <div className="text-gray-300 mb-1">
                                <span className="font-semibold text-white">Method:</span> {f.method}
                              </div>
                              <div className="break-words text-gray-300 mb-1">
                                <span className="font-semibold text-white">Payload:</span> {f.payload}
                              </div>
                              {f.pocUrl && (
                                <div className="break-words text-gray-300 mb-1">
                                  <span className="font-semibold text-white">PoC URL:</span> {f.pocUrl}
                                </div>
                              )}
                              <div className="text-gray-300 mb-1">
                                <span className="font-semibold text-white">OWASP:</span> A03:2021 Injection
                              </div>
                              <div className="text-gray-300 mb-1">
                                <span className="font-semibold text-white">Risk:</span> {f.risk}
                              </div>
                              {f.error && (
                                <div className="text-red-400">
                                  <span className="font-semibold">Request error:</span> {f.error}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {!rows.length && (
                    <tr>
                      <td className="px-4 py-8 text-center text-gray-500" colSpan={6}>
                        No rows.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Export buttons */}
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={exportJSON} 
              className="bg-green-700 text-white px-4 py-2 rounded border border-green-600 hover:bg-green-800 transition-colors"
            >
              Export JSON
            </button>
            <button 
              onClick={exportPDF} 
              className="bg-red-700 text-white px-4 py-2 rounded border border-red-600 hover:bg-red-800 transition-colors"
            >
              Export PDF
            </button>
          </div>
        </div>
      )}

      <p className="text-gray-500 text-xs mt-8 text-center">Use only on systems you are authorized to test.</p>
    </div>
  );
}