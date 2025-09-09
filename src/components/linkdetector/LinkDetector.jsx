"use client";

import { useMemo, useState } from "react";
import { Link2, RefreshCcw, Download, AlertTriangle, ShieldCheck } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import GreenLayout from "../GreenTeam/layout";

const prettyDate = (iso) => (iso ? new Date(iso).toLocaleString() : "-");

export default function LinkDetector() {
  const API_BASE = useMemo(
    () => (process.env.NEXT_PUBLIC_PROD_API_URL || "").replace(/\/+$/, ""),
    []
  );

  const [link, setLink] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [bulkResults, setBulkResults] = useState([]);
  const [error, setError] = useState("");

  const handleScan = async () => {
    if (!link.trim()) return;

    setScanning(true);
    setResult(null);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/link-detector/link-scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: link.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setError(data?.message || "❌ Link check failed.");
      }
    } catch (err) {
      console.error("Request error:", err);
      setError("❌ Failed to check the link.");
    } finally {
      setScanning(false);
    }
  };

  const handleBulk = async () => {
    const lines = bulkText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (!lines.length) return;

    setScanning(true);
    setBulkResults([]);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/link-detector/bulk-scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: lines }),
      });
      const data = await res.json();
      if (res.ok) {
        setBulkResults(data.results || []);
      } else {
        setError(data?.message || "❌ Bulk scan failed.");
      }
    } catch (e) {
      setError("❌ Failed to perform bulk scan.");
    } finally {
      setScanning(false);
    }
  };

  const statusBadge = (status) => {
    if (status === "safe")
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
          <ShieldCheck size={14} /> Safe
        </span>
      );
    if (status === "suspicious")
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
          <AlertTriangle size={14} /> Suspicious
        </span>
      );
    if (status === "malicious")
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
          <AlertTriangle size={14} /> Malicious
        </span>
      );
    if (status === "invalid")
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">
          Invalid
        </span>
      );
    return <span className="px-2 py-1 rounded-full text-xs bg-gray-100">Unknown</span>;
  };

  const downloadTxt = (payload, fileName = "link_report.txt") => {
    const blob = new Blob([payload], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const buildTxtReport = (r) => {
    const lines = [];
    lines.push(`URL: ${r.url}`);
    lines.push(`Final URL: ${r.finalUrl || "-"}`);
    lines.push(`Status: ${r.status} (Trust Index: ${r.trustIndex ?? "-"})`);
    lines.push(`Message: ${r.message || "-"}`);
    lines.push(`HTTPS: ${r.ssl?.isHttps ? "Yes" : "No"}`);
    lines.push(`Onion: ${r.onion ? "Yes" : "No"}`);
    lines.push(`Redirect Chain:`);
    (r.redirectChain || []).forEach((u, i) => lines.push(`  ${i + 1}. ${u}`));
    lines.push(`Suspicious Keywords: ${(r.suspicious?.keywordsFound || []).join(", ") || "-"}`);
    lines.push(`Typosquat of: ${r.suspicious?.typosquatOf || "-"}`);
    lines.push(`Shortener Expanded: ${r.suspicious?.shortenerExpanded ? "Yes" : "No"}`);
    lines.push(`Suspicious Domain: ${r.suspicious?.suspiciousDomain ? "Yes" : "No"}`);
    if (r.suspicious?.cnameChain?.length) {
      lines.push(`CNAME Chain: ${r.suspicious.cnameChain.join(" -> ")}`);
    }
    if (r.suspicious?.blacklistMatches?.length) {
      lines.push(`Blacklist Matches: ${r.suspicious.blacklistMatches.join(", ")}`);
    }
    if (r.contentFindings) {
      lines.push(`Content Findings:`);
      lines.push(
        `  CryptoMiner: ${r.contentFindings.hasCryptoMiner ? "Yes" : "No"}, Suspicious Eval: ${
          r.contentFindings.suspiciousInlineEval ? "Yes" : "No"
        }, External JS: ${r.contentFindings.externalJsCount ?? "-"}, Forms: ${
          r.contentFindings.formsCount ?? "-"
        }`
      );
    }
    if (r.geo) {
      lines.push(
        `Geo/IP: ${r.geo.ip || "-"} ${r.geo.country || ""} ${r.geo.region || ""} ${r.geo.city || ""}`
      );
    }
    lines.push(`Screenshot: ${r.screenshotPath || "-"}`);
    lines.push(`Scanned At: ${prettyDate(r.scannedAt)}`);
    return lines.join("\n");
  };

  const downloadPdf = (r, fileName = "link_report.pdf") => {
    const doc = new jsPDF({ unit: "pt" });
    doc.setFontSize(16);
    doc.text("Link Detector Report", 40, 40);
    doc.setFontSize(10);

    const summary = [
      ["URL", r.url],
      ["Final URL", r.finalUrl || "-"],
      ["Status", `${r.status} (Trust Index: ${r.trustIndex ?? "-"})`],
      ["Message", r.message || "-"],
      ["HTTPS", r.ssl?.isHttps ? "Yes" : "No"],
      ["Onion", r.onion ? "Yes" : "No"],
      ["IP / Country", `${r.geo?.ip || "-"} / ${r.geo?.country || "-"}`],
      ["Scanned At", prettyDate(r.scannedAt)],
    ];

    autoTable(doc, {
      startY: 60,
      head: [["Field", "Value"]],
      body: summary,
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [240, 240, 240] },
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 16,
      head: [["Redirect Chain"]],
      body: (r.redirectChain || []).map((u, i) => [`${i + 1}. ${u}`]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [240, 240, 240] },
    });

    const suspRows = [
      ["Keywords", (r.suspicious?.keywordsFound || []).join(", ") || "Not Found"],
      ["Typosquat of", r.suspicious?.typosquatOf || "-"],
      ["Shortener Expanded", r.suspicious?.shortenerExpanded ? "Yes" : "No"],
      ["Suspicious Domain", r.suspicious?.suspiciousDomain ? "Yes" : "No"],
      [
        "CNAME Chain",
        (r.suspicious?.cnameChain || []).length
          ? r.suspicious.cnameChain.join(" -> ")
          : "-",
      ],
      [
        "Blacklist Matches",
        (r.suspicious?.blacklistMatches || []).join(", ") || "-",
      ],
    ];
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 16,
      head: [["Suspicious Indicators", "Value"]],
      body: suspRows,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [240, 240, 240] },
    });

    const contentRows = r.contentFindings
      ? Object.entries(r.contentFindings).map(([k, v]) => [k, String(v)])
      : [["-", "-"]];
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 16,
      head: [["Content Findings", "Value"]],
      body: contentRows,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [240, 240, 240] },
    });

    doc.save(fileName);
  };

  const bulkToCsv = (items) => {
    const header = [
      "url",
      "finalUrl",
      "status",
      "trustIndex",
      "isHttps",
      "onion",
      "ip",
      "country",
      "keywords",
      "typosquatOf",
      "shortener",
      "suspiciousDomain",
      "blacklistMatches",
      "scannedAt",
    ].join(",");
    const rows = items.map((r) =>
      [
        JSON.stringify(r.url || ""),
        JSON.stringify(r.finalUrl || ""),
        r.status || "",
        r.trustIndex ?? "",
        r.ssl?.isHttps ? 1 : 0,
        r.onion ? 1 : 0,
        r.geo?.ip || "",
        r.geo?.country || "",
        (r.suspicious?.keywordsFound || []).join("|"),
        r.suspicious?.typosquatOf || "",
        r.suspicious?.shortenerExpanded ? 1 : 0,
        r.suspicious?.suspiciousDomain ? 1 : 0,
        (r.suspicious?.blacklistMatches || []).join("|"),
        prettyDate(r.scannedAt),
      ].join(",")
    );
    return [header, ...rows].join("\n");
  };

  const downloadCsv = (items) => {
    const csv = bulkToCsv(items);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bulk_link_scan.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-green-900 flex flex-col items-center pt-10 pb-24 px-4">
      <GreenLayout
        heroData={{
          imgPath: "/GreenTeam/link_dec.png",
          title: "Link Detector",
          desc: "Detect malicious, suspicious, or unsafe links. Includes redirects, SSL, typosquatting, blacklist & more."
        }}
      />

      <div className="bg-black shadow-lg rounded-xl p-6 w-full max-w-3xl">
        {/* Mode toggle */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Bulk Mode</label>
            <button
              onClick={() => {
                setBulkMode(!bulkMode);
                setResult(null);
                setBulkResults([]);
                setError("");
              }}
              className={`w-12 h-7 rounded-full transition relative ${
                bulkMode ? "bg-green-600" : "bg-gray-300"
              }`}
              aria-pressed={bulkMode}
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition ${
                  bulkMode ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>
          <button
            onClick={() => {
              setLink("");
              setBulkText("");
              setResult(null);
              setBulkResults([]);
              setError("");
            }}
            className="inline-flex items-center text-white bg-green-600 gap-2 text-sm px-3 py-2 rounded-md hover:bg-green-700"
          >
            <RefreshCcw size={16} /> Reset
          </button>
        </div>

        {!bulkMode ? (
          <>
            <input
              type="text"
              placeholder="🔗 Enter link to check..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full text-white px-4 py-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-800"
            />

            <button
              onClick={handleScan}
              disabled={scanning || !link.trim()}
              className={`w-full py-3 rounded-md text-white font-semibold transition ${
                scanning ? "bg-green-400 cursor-not-allowed" : "bg-green-700 hover:bg-green-800"
              }`}
            >
              {scanning ? "Scanning..." : "Check Link"}
            </button>

            {result && (
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <div className="text-green-900 font-semibold">
                    {statusBadge(result.status)}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadPdf(result, "link_report.pdf")}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-900 text-white hover:bg-black text-sm"
                    >
                      <Download size={16} /> PDF
                    </button>
                    <button
                      onClick={() => downloadTxt(buildTxtReport(result))}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-sm"
                    >
                      <Download size={16} /> TXT
                    </button>
                  </div>
                </div>

                <div className="mt-3 text-sm text-gray-700 space-y-1">
                  <p><span className="font-semibold">URL:</span> {result.url}</p>
                  <p><span className="font-semibold">Final:</span> {result.finalUrl || "-"}</p>
                  <p>
                    <span className="font-semibold">Trust Index:</span>{" "}
                    {result.trustIndex ?? "-"} / 100
                  </p>
                  <p><span className="font-semibold">HTTPS:</span> {result.ssl?.isHttps ? "Yes" : "No"}</p>
                  <p><span className="font-semibold">Onion:</span> {result.onion ? "Yes" : "No"}</p>
                  <p><span className="font-semibold">Message:</span> {result.message}</p>

                  <details className="mt-2">
                    <summary className="cursor-pointer font-semibold text-gray-800">Redirect Chain</summary>
                    <ul className="list-decimal ml-6">
                      {(result.redirectChain || []).map((u, i) => (
                        <li key={i} className="break-all">{u}</li>
                      ))}
                    </ul>
                  </details>

                  <details>
                    <summary className="cursor-pointer font-semibold text-gray-800">Suspicious Indicators</summary>
                    <div className="mt-2">
                      <p><span className="font-semibold">Keywords:</span> {(result.suspicious?.keywordsFound || []).join(", ") || "Not Found"}</p>
                      <p><span className="font-semibold">Typosquat of:</span> {result.suspicious?.typosquatOf || "-"}</p>
                      <p><span className="font-semibold">Shortener:</span> {result.suspicious?.shortenerExpanded ? "Yes" : "No"}</p>
                      <p><span className="font-semibold">Suspicious Domain:</span> {result.suspicious?.suspiciousDomain ? "Yes" : "No"}</p>
                      {result.suspicious?.cnameChain?.length ? (
                        <p><span className="font-semibold">CNAME Chain:</span> {result.suspicious.cnameChain.join(" → ")}</p>
                      ) : null}
                      {result.suspicious?.blacklistMatches?.length ? (
                        <p><span className="font-semibold">Blacklist:</span> {result.suspicious.blacklistMatches.join(", ")}</p>
                      ) : null}
                    </div>
                  </details>

                  <details>
                    <summary className="cursor-pointer font-semibold text-gray-800">Content Findings</summary>
                    <div className="mt-2">
                      <p>CryptoMiner: {result.contentFindings?.hasCryptoMiner ? "Yes" : "No"}</p>
                      <p>Suspicious Eval: {result.contentFindings?.suspiciousInlineEval ? "Yes" : "No"}</p>
                      <p>External JS Count: {result.contentFindings?.externalJsCount ?? "-"}</p>
                      <p>Forms Count: {result.contentFindings?.formsCount ?? "-"}</p>
                    </div>
                  </details>

                  <details>
                    <summary className="cursor-pointer font-semibold text-gray-800">Geo & Hosting</summary>
                    <div className="mt-2">
                      <p>IP: {result.geo?.ip || "-"}</p>
                      <p>Country/Region/City: {result.geo?.country || "-"} / {result.geo?.region || "-"} / {result.geo?.city || "-"}</p>
                      {result.screenshotPath ? (
                        <p className="text-xs text-gray-500">Screenshot saved at: {result.screenshotPath}</p>
                      ) : null}
                    </div>
                  </details>

                  <p className="text-xs text-gray-500 mt-2">Checked At: {prettyDate(result.scannedAt)}</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <textarea
              rows={8}
              placeholder="Paste 1 URL per line…"
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              className="w-full text-white px-4 py-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-800"
            />
            <div className="flex items-center gap-3">
              <button
                onClick={handleBulk}
                disabled={scanning || !bulkText.trim()}
                className={`flex-1 py-3 rounded-md text-white font-semibold transition ${
                  scanning ? "bg-green-400 cursor-not-allowed" : "bg-green-700 hover:bg-green-800"
                }`}
              >
                {scanning ? "Scanning..." : "Scan All"}
              </button>
              {bulkResults.length > 0 && (
                <button
                  onClick={() => downloadCsv(bulkResults)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-900 text-white hover:bg-black text-sm"
                >
                  <Download size={16} /> CSV
                </button>
              )}
            </div>

            {bulkResults.length > 0 && (
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left bg-gray-100">
                      <th className="p-2">Status</th>
                      <th className="p-2">URL</th>
                      <th className="p-2">Final</th>
                      <th className="p-2">Trust</th>
                      <th className="p-2">HTTPS</th>
                      <th className="p-2">IP</th>
                      <th className="p-2">Country</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkResults.map((r, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-2">{statusBadge(r.status)}</td>
                        <td className="p-2 break-all">{r.url}</td>
                        <td className="p-2 break-all">{r.finalUrl || "-"}</td>
                        <td className="p-2">{r.trustIndex ?? "-"}</td>
                        <td className="p-2">{r.ssl?.isHttps ? "Yes" : "No"}</td>
                        <td className="p-2">{r.geo?.ip || "-"}</td>
                        <td className="p-2">{r.geo?.country || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {error && <div className="mt-6 text-red-600 font-semibold">{error}</div>}
      </div>
    </div>
  );
}
