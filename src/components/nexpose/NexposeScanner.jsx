"use client";
import { useMemo, useState } from "react";
import { Radar, ChevronDown, ChevronUp, Link as LinkIcon, Clipboard } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/** Safe API base with fallback */
const API_BASE = (process.env.NEXT_PUBLIC_PROD_API_URL).replace(/\/+$/, "");

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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-10 px-4">
      <div className="text-center mb-8">
        <Radar className="mx-auto mb-3 text-green-700" size={44} />
        <h1 className="text-2xl font-semibold text-green-800">SQLi Scanner</h1>
        <p className="text-gray-600 mt-1">Detect error-based, union-based, boolean/time-based blind SQLi.</p>
      </div>

      <div className="bg-white shadow rounded-xl p-6 w-full max-w-3xl">
        {/* URL input with validation */}
        <label className="block text-sm font-medium mb-1">Target URL</label>
        <input
          className={`w-full px-3 py-2 border rounded ${urlError ? "border-rose-500" : "border-gray-300"}`}
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://example.com/search"
          aria-invalid={!!urlError}
          aria-describedby="url-error"
        />
        {urlError && (
          <div id="url-error" className="mt-1 text-xs text-rose-700">
            {urlError}
          </div>
        )}

        <button
          onClick={handleScan}
          disabled={scanning || !urlIsValid}
          className={`mt-4 w-full py-3 rounded-md text-white font-semibold ${
            scanning || !urlIsValid ? "bg-green-400 cursor-not-allowed" : "bg-green-700 hover:bg-green-800"
          }`}
        >
          {scanning ? "Scanning..." : "Start SQLi Scan"}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-6 space-y-4">
            {/* Summary */}
{result && (
  <div className="p-4 border rounded bg-gray-50">
    {/* Unreachable / Inconclusive / Degraded banners */}
    {result.scanStatus !== "ok" && (
      <div className={
        result.scanStatus === "unreachable"
          ? "p-3 mb-3 rounded bg-rose-50 border border-rose-200 text-rose-800"
          : result.scanStatus === "inconclusive"
          ? "p-3 mb-3 rounded bg-amber-50 border border-amber-200 text-amber-800"
          : "p-3 mb-3 rounded bg-blue-50 border border-blue-200 text-blue-800"
      }>
        <div className="font-semibold capitalize">{result.scanStatus}</div>
        <div className="text-sm">{result.message}</div>
        <div className="text-xs mt-1">
          Attempted: <b>{result.payloadsAttempted}</b> · Succeeded: <b>{result.payloadsSucceeded}</b> · Success rate: <b>{Math.round((result.successRate||0)*100)}%</b>
        </div>
        {result.diagnostics?.baseline?.error && (
          <div className="text-xs mt-1">Baseline error: {result.diagnostics.baseline.error}</div>
        )}
      </div>
    )}

    {/* Normal trusted summary only when ok OR degraded */}
    {(result.scanStatus === "ok" || result.scanStatus === "degraded") && (
      <>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm">
            <div className="font-semibold">Scan Completed {result.scanStatus === "degraded" && "(degraded confidence)"}</div>
            <div>{result.payloadsAttempted} payloads attempted · {result.payloadsSucceeded} succeeded</div>
            <div>Types: {(result.coverage?.typesAttempted || []).join(", ")}</div>
            <div>OWASP: {result.owasp}</div>
          </div>
          <div className="text-right">
            <div className="text-sm">Risk Score</div>
            <div className="text-lg font-bold">{result.riskScore}/100</div>
            <div className="text-xs text-gray-600">{result.riskLevel}</div>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-600">
          Method: <span className="font-semibold">{result.method}</span> &nbsp;|&nbsp;
          Parameter: <span className="font-semibold">{result.paramName}</span>
        </div>
        {result.pocUrl && (
          <div className="mt-3 flex items-center gap-2">
            <LinkIcon size={16} />
            <a href={result.pocUrl} target="_blank" rel="noreferrer" className="text-blue-700 underline break-all">
              Proof of Concept URL
            </a>
            <button onClick={() => navigator.clipboard.writeText(result.pocUrl)}
                    className="ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded inline-flex items-center gap-1">
              <Clipboard size={14} /> Copy
            </button>
          </div>
        )}
      </>
    )}
  </div>
)}


            {/* Toggle + counts */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing: <b>{showPositivesOnly ? (result.findingsCount || 0) : (result.payloadsTested || 0)}</b>{" "}
                {showPositivesOnly ? "positive finding(s)" : "test(s)"}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPositivesOnly(false)}
                  className={`px-3 py-1 rounded text-sm ${!showPositivesOnly ? "bg-gray-900 text-white" : "bg-gray-200"}`}
                >
                  All tests
                </button>
                <button
                  onClick={() => setShowPositivesOnly(true)}
                  className={`px-3 py-1 rounded text-sm ${showPositivesOnly ? "bg-gray-900 text-white" : "bg-gray-200"}`}
                >
                  Positive only
                </button>
              </div>
            </div>

            {/* Vulnerability Details */}
            {result?.vulnerable && result?.vulnerabilityDetails?.length > 0 && (
              <div className="p-4 border rounded bg-white">
                <div className="font-semibold mb-2">Vulnerability Details</div>
                <div className="space-y-3">
                  {result.vulnerabilityDetails.map((v, i) => (
                    <div key={i} className="p-3 rounded bg-gray-50">
                      <div className="flex flex-wrap items-center gap-3 text-sm mb-2">
                        <span className="px-2 py-0.5 rounded bg-gray-800 text-white">Method: {v.method}</span>
                        <span className="px-2 py-0.5 rounded bg-gray-200">Parameter: {v.parameter}</span>
                        <span
                          className={`px-2 py-0.5 rounded ${
                            v.risk === "High"
                              ? "bg-rose-100 text-rose-800"
                              : v.risk === "Medium"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          Risk: {v.risk}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800">{v.owasp}</span>
                      </div>
                      <div className="text-xs">
                        <div className="font-semibold mb-1">Payload that worked</div>
                        <div className="flex items-center gap-2">
                          <code className="break-all bg-white border px-2 py-1 rounded">{v.payload}</code>
                          <button
                            onClick={() => navigator.clipboard.writeText(v.payload)}
                            className="px-2 py-1 text-xs bg-blue-600 text-white rounded"
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

            {/* Table (all rows or positives) */}
            <div className="overflow-x-auto border rounded">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">#</th>
                    <th className="px-3 py-2 text-left">Type</th>
                    <th className="px-3 py-2 text-left">Evidence</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">Time (ms)</th>
                    <th className="px-3 py-2 text-left">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((f, idx) => {
                    const open = openIdx === idx;
                    return (
                      <tr key={idx} className="border-t">
                        <td className="px-3 py-2">{idx + 1}</td>
                        <td className="px-3 py-2">{f.type}</td>
                        <td className="px-3 py-2">{f.evidence || (f.error ? "Request error" : "—")}</td>
                        <td className="px-3 py-2">{String(f.status)}</td>
                        <td className="px-3 py-2">{String(f.timeMs)}</td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => setOpenIdx(open ? null : idx)}
                            className="px-2 py-1 text-xs bg-gray-800 text-white rounded inline-flex items-center gap-1"
                          >
                            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />} {open ? "Hide" : "View"}
                          </button>
                          {open && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                              <div>
                                <span className="font-semibold">Parameter:</span> {f.param}
                              </div>
                              <div>
                                <span className="font-semibold">Method:</span> {f.method}
                              </div>
                              <div className="break-words">
                                <span className="font-semibold">Payload:</span> {f.payload}
                              </div>
                              {f.pocUrl && (
                                <div className="break-words">
                                  <span className="font-semibold">PoC URL:</span> {f.pocUrl}
                                </div>
                              )}
                              <div>
                                <span className="font-semibold">OWASP:</span> A03:2021 Injection
                              </div>
                              <div>
                                <span className="font-semibold">Risk:</span> {f.risk}
                              </div>
                              {f.error && (
                                <div className="text-rose-700">
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
                      <td className="px-3 py-6 text-center text-gray-600" colSpan={6}>
                        No rows.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Exports */}
            <div className="flex flex-wrap gap-2">
              <button onClick={exportJSON} className="bg-green-700 text-white px-3 py-2 rounded">
                Export JSON
              </button>
              <button onClick={exportPDF} className="bg-rose-600 text-white px-3 py-2 rounded">
                Export PDF
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-4">Use only on systems you are authorized to test.</p>
    </div>
  );
}
