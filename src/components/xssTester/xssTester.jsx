"use client";
import { useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";

const PRESET_PAYLOADS = [
  `<script>alert(1)</script>`,
  `<img src=x onerror=alert(1)>`,
  `<svg/onload=alert(1)>`,
  `"><script>alert(1)</script>`,
  `javascript:alert(1)`,
  `";alert(1);//`,
  `%3Cscript%3Ealert(1)%3C/script%3E`,
  `<ScRiPt>alert(1)</sCriPt>`,
  `<a href=# onmouseover=alert(1)>hover</a>`,
];

export default function XssTester() {
  const [url, setUrl] = useState("");
  const [param, setParam] = useState("");
  const [customPayload, setCustomPayload] = useState(
    `<script>alert('XSS')</script>`
  );
  const [usePresetList, setUsePresetList] = useState(true);
  const [payloads, setPayloads] = useState(PRESET_PAYLOADS.join("\n"));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { runs, waf, rateLimit, summary, ... }

  const protectedAction = useProtectedAction();

  const apiBase = (process.env.NEXT_PUBLIC_PROD_API_URL || "").replace(
    /\/+$/,
    ""
  );

  const parsedPayloads = useMemo(() => {
    if (!usePresetList) return [customPayload];
    return payloads
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [usePresetList, customPayload, payloads]);

  const handleTest = async (e) => {
    e?.preventDefault?.();
    setResult(null);
    setLoading(true);

    await protectedAction(async (token) => {
      try {
        const res = await fetch(`${apiBase}/xssTester/xssTester-scan`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            url,
            param,
            payloads: parsedPayloads,
            domScan: true, // headless DOM checks
            takeScreenshots: true, // capture PoC if triggered
            autoBypass: true, // try common bypass variants automatically
          }),
        });

        const data = await res.json();
        setResult(data);
      } catch (err) {
        setResult({ error: String(err) });
      }
    });

    setLoading(false);
  };

  const makePdf = () => {
    if (!result) return;
    const doc = new jsPDF();

    // Title
    doc.setFontSize(16);
    doc.text("XSS Scan Report", 14, 16);
    doc.setFontSize(10);
    doc.text(`Target: ${url}`, 14, 24);
    doc.text(`Parameter: ${param}`, 14, 29);
    if (result.summary) {
      doc.text(
        `Total tests: ${result.summary.total} | Executed: ${result.summary.executed} | High: ${result.summary.high} | Medium: ${result.summary.medium} | Low: ${result.summary.low}`,
        14,
        34
      );
    }
    if (result.waf)
      doc.text(
        `WAF: ${
          result.waf.detected ? `Yes (${result.waf.vendor || "unknown"})` : "No"
        }`,
        14,
        39
      );
    if (result.rateLimit)
      doc.text(
        `Rate Limiting: ${
          result.rateLimit.detected ? `Yes (${result.rateLimit.reason})` : "No"
        }`,
        14,
        44
      );

    // Table of runs
    const rows = (result.runs || []).map((r, idx) => [
      idx + 1,
      r.payload,
      r.context || "—",
      r.reflected ? "Yes" : "No",
      r.domExecuted ? "Yes" : "No",
      r.risk || "—",
      r.status || "—",
    ]);

    autoTable(doc, {
      startY: 50,
      head: [
        ["#", "Payload", "Context", "Reflected", "DOM Exec", "Risk", "HTTP"],
      ],
      body: rows,
      styles: { fontSize: 7, cellWidth: "wrap" },
      columnStyles: { 1: { cellWidth: 80 } },
      didDrawPage: () => {}, // keeps types happy in some bundlers
    });

    // Evidence: add up to 3 screenshots
    let y = (doc.lastAutoTable && doc.lastAutoTable.finalY) || 50;
    const shots = (result.runs || []).flatMap((r) => r.screenshots || []);
    const limited = shots.slice(0, 3);
    for (let i = 0; i < limited.length; i++) {
      const img = limited[i];
      if (!img?.base64) continue;
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      doc.text(`PoC Screenshot ${i + 1}`, 14, y);
      y += 4;
      try {
        doc.addImage(
          `data:image/png;base64,${img.base64}`,
          "PNG",
          14,
          y,
          180,
          0
        );
        y += 90;
      } catch {
        doc.text("(screenshot could not be embedded)", 14, y);
        y += 10;
      }
    }

    doc.save("xss-report.pdf");
  };

  const downloadJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });
    const urlObj = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = urlObj;
    a.download = "xss-report.json";
    a.click();
    URL.revokeObjectURL(urlObj);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header with Logo */}
        <div className="flex items-center gap-4 mb-8 mt-15">
          <div className="w-30 h-30 sm:w-24 md:w-30 sm:h-24 md:h-30 bg-white rounded-full flex items-center justify-center border-4 border-red-600 overflow-hidden flex-shrink-0">
            <img
              src="/Redteam/xss.png" // <-- replace with your image path
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-white">
              Advanced XSS Scanner
            </h1>
            <p className="text-gray-400 text-sm">
              Identify Cross-Site Scripting (XSS) risks
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* URL Input */}
          <div className="bg-blue-900/20 rounded-lg p-6 border border-white">
            <label className="block text-sm font-medium mb-2 text-gray-200"></label>
            <label className="block text-white font-medium mb-2">
              URL to Test
            </label>
            <input
              type="url"
              placeholder="Target URL (e.g., https://site.com/search)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-white-600 rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:outline-none"
              required
            />
          </div>

          {/* Parameter Input */}
          <div>
            <label className="block text-white font-medium mb-2">
              Parameter Name
            </label>
            <input
              type="text"
              placeholder="Parameter name (e.g., q)"
              value={param}
              onChange={(e) => setParam(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-white-600 rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:outline-none"
              required
            />
          </div>

          {/* Payload Selection */}
          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center gap-2 text-white">
              <input
                type="checkbox"
                checked={usePresetList}
                onChange={(e) => setUsePresetList(e.target.checked)}
                className="w-4 h-4 text-red-600 bg-gray-800 border-white-600 rounded focus:ring-red-500 focus:ring-2"
              />
              Use multi‑payload list
            </label>
          </div>

          {/* Payload Input */}
          {usePresetList ? (
            <textarea
              className="w-full p-3 bg-gray-800 border border-white-600 rounded-lg font-mono text-sm text-white placeholder-gray-400 focus:border-red-500 focus:outline-none"
              rows={8}
              value={payloads}
              onChange={(e) => setPayloads(e.target.value)}
              placeholder="One payload per line"
            />
          ) : (
            <textarea
              className="w-full p-3 bg-gray-800 border border-white-600 rounded-lg font-mono text-sm text-white placeholder-gray-400 focus:border-red-500 focus:outline-none"
              rows={4}
              value={customPayload}
              onChange={(e) => setCustomPayload(e.target.value)}
              placeholder="Single payload"
            />
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={handleTest}
              disabled={loading}
              className={`px-6 py-3 text-white rounded-lg font-medium transition-all ${
                loading
                  ? "bg-red-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 hover:shadow-lg"
              }`}
            >
              {loading ? "Scanning…" : "Run Scan"}
            </button>

            {result && !result.error && (
              <>
                <button
                  type="button"
                  onClick={makePdf}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-all hover:shadow-lg"
                >
                  Download PDF Report
                </button>
                <button
                  type="button"
                  onClick={downloadJson}
                  className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 font-medium transition-all hover:shadow-lg"
                >
                  Download JSON
                </button>
              </>
            )}
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="bg-gray-900 border border-white-700 rounded-lg p-6">
            <h2 className="font-semibold text-xl mb-4 text-white">Summary</h2>
            {!result.error ? (
              <>
                <div className="text-sm text-gray-300 space-y-1 mb-6">
                  <div>
                    WAF:{" "}
                    {result.waf?.detected
                      ? `Yes (${result.waf?.vendor || "unknown"})`
                      : "No"}
                  </div>
                  <div>
                    Rate Limiting:{" "}
                    {result.rateLimit?.detected
                      ? `Yes (${result.rateLimit?.reason})`
                      : "No"}
                  </div>
                  <div>
                    Totals — Tests: {result.summary?.total} | Exec:{" "}
                    {result.summary?.executed} | High: {result.summary?.high} |
                    Med: {result.summary?.medium} | Low: {result.summary?.low}
                  </div>
                </div>

                <div className="overflow-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left border-b border-white-700">
                        <th className="py-3 pr-3 text-gray-300 font-medium">
                          #
                        </th>
                        <th className="py-3 pr-3 text-gray-300 font-medium">
                          Payload
                        </th>
                        <th className="py-3 pr-3 text-gray-300 font-medium">
                          Context
                        </th>
                        <th className="py-3 pr-3 text-gray-300 font-medium">
                          Reflected
                        </th>
                        <th className="py-3 pr-3 text-gray-300 font-medium">
                          DOM Exec
                        </th>
                        <th className="py-3 pr-3 text-gray-300 font-medium">
                          Risk
                        </th>
                        <th className="py-3 pr-3 text-gray-300 font-medium">
                          HTTP
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(result.runs || []).map((r, i) => (
                        <tr
                          key={i}
                          className="border-b border-white-800 align-top hover:bg-gray-800 transition-colors"
                        >
                          <td className="py-3 pr-3 text-gray-300">{i + 1}</td>
                          <td className="py-3 pr-3 font-mono break-all text-gray-100">
                            {r.payload}
                          </td>
                          <td className="py-3 pr-3 text-gray-300">
                            {r.context || "—"}
                          </td>
                          <td className="py-3 pr-3 text-gray-300">
                            {r.reflected ? "Yes" : "No"}
                          </td>
                          <td className="py-3 pr-3 text-gray-300">
                            {r.domExecuted ? "Yes" : "No"}
                          </td>
                          <td className="py-3 pr-3 text-gray-300">
                            {r.risk || "—"}
                          </td>
                          <td className="py-3 pr-3 text-gray-300">
                            {r.status || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Reflection highlight (first hit) */}
                {(result.runs || []).some((r) => r.reflection?.highlighted) && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-white mb-3">
                      Reflected Payload Highlight
                    </h3>
                    {(result.runs || [])
                      .filter((r) => r.reflection?.highlighted)
                      .slice(0, 1)
                      .map((r, idx) => (
                        <pre
                          key={idx}
                          className="bg-gray-800 border border-white-700 rounded-lg p-4 overflow-auto text-xs whitespace-pre-wrap text-gray-200"
                        >
                          {r.reflection?.highlighted}
                        </pre>
                      ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-red-400 bg-red-900/20 p-4 rounded-lg border border-red-800">
                {String(result.error)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
