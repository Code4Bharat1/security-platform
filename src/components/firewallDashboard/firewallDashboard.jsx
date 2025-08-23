"use client";

import React from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { FileText, FileDown, Shield, AlertTriangle, CheckCircle2, Link2 } from "lucide-react";

export default function FirewallDashboard({ data }) {
  const matchedHeaders = data?.matchedHeaders ?? [];
  const securityHeadersDetected = data?.securityHeadersDetected ?? [];

  const protectionColors = {
    None: "text-gray-700 bg-gray-100 ring-1 ring-gray-200",
    Moderate: "text-amber-800 bg-amber-100 ring-1 ring-amber-200",
    High: "text-red-800 bg-red-100 ring-1 ring-red-200",
  };

  const ProtectionPill = ({ level }) => (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium
        ${protectionColors[level] ?? protectionColors.None}`}
    >
      {level === "High" ? <AlertTriangle className="h-4 w-4" /> :
       level === "Moderate" ? <Shield className="h-4 w-4" /> :
       <CheckCircle2 className="h-4 w-4" />}
      {level || "None"}
    </span>
  );

  const safeNameFromUrl = (u) => {
    try { return new URL(u).hostname; }
    catch { return String(u || "site").replace(/[^a-z0-9.-]/gi, "_"); }
  };

  const handleDownloadPdf = () => {
    if (!data) return;
    const {
      url = "-",
      statusCode = "-",
      protectionLevel = "None",
      detected = false,
      firewallName = "None",
      serverHeader = "N/A",
    } = data;

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const M = 40;
    let y = 56;

    const line = (t, size = 12, style = "normal") => {
      doc.setFont("helvetica", style);
      doc.setFontSize(size);
      doc.text(String(t), M, y);
      y += 18;
    };

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Firewall Detection Report", M, y);
    y += 26;

    // Meta
    line(`Generated: ${new Date().toLocaleString()}`);
    line(`URL: ${url}`);
    line(`HTTP Status: ${statusCode}`);
    line(`Protection Level: ${protectionLevel}`);
    line(`Firewall Detected: ${detected ? firewallName : "None"}`);
    line(`Server Header: ${serverHeader}`);

    // Summary table
    y += 6;
    autoTable(doc, {
      startY: y,
      head: [["Field", "Value"]],
      body: [
        ["URL", url],
        ["HTTP Status", String(statusCode)],
        ["Protection Level", protectionLevel],
        ["Firewall Detected", detected ? firewallName : "None"],
        ["Server Header", serverHeader || "N/A"],
      ],
      styles: { font: "helvetica", fontSize: 10 },
      headStyles: { fillColor: [34, 197, 94] },
      margin: { left: M, right: M },
    });
    y = doc.lastAutoTable.finalY + 20;

    // Matched headers
    if (matchedHeaders.length) {
      line("Matched Headers", 13, "bold");
      autoTable(doc, {
        startY: y,
        head: [["Header", "Value"]],
        body: matchedHeaders.map((h) => [h.header ?? "-", String(h.value ?? "")]),
        styles: { fontSize: 9, cellWidth: "wrap" },
        columnStyles: { 0: { cellWidth: 180 }, 1: { cellWidth: 320 } },
        margin: { left: M, right: M },
      });
      y = doc.lastAutoTable.finalY + 20;
    }

    // Security headers
    line("Security Headers Detected", 13, "bold");
    autoTable(doc, {
      startY: y,
      head: [["Header"]],
      body: securityHeadersDetected.length
        ? securityHeadersDetected.map((h) => [h])
        : [["None"]],
      styles: { fontSize: 10 },
    });

    doc.save(`Firewall_Report_${safeNameFromUrl(url)}.pdf`);
  };

  // NEW: plain-text export
  const handleDownloadTxt = () => {
    if (!data) return;

    const {
      url = "-",
      statusCode = "-",
      protectionLevel = "None",
      detected = false,
      firewallName = "None",
      serverHeader = "N/A",
    } = data;

    const allHeaders = data.headers || data.rawHeaders || null;

    const lines = [];
    lines.push("Firewall Detection Report");
    lines.push("====================================");
    lines.push(`Generated:        ${new Date().toLocaleString()}`);
    lines.push(`URL:              ${url}`);
    lines.push(`HTTP Status:      ${statusCode}`);
    lines.push(`Protection Level: ${protectionLevel}`);
    lines.push(`Firewall Detected:${detected ? " " + firewallName : " None"}`);
    lines.push(`Server Header:    ${serverHeader || "N/A"}`);
    lines.push("");

    lines.push("Matched Headers");
    lines.push("------------------------------------");
    if (matchedHeaders.length) {
      matchedHeaders.forEach(({ header, value }) => {
        lines.push(`${header}: ${String(value ?? "")}`);
      });
    } else {
      lines.push("None");
    }
    lines.push("");

    lines.push("Security Headers Detected");
    lines.push("------------------------------------");
    if (securityHeadersDetected.length) {
      securityHeadersDetected.forEach((h) => lines.push(h));
    } else {
      lines.push("None");
    }
    lines.push("");

    if (allHeaders && Object.keys(allHeaders).length) {
      lines.push("All Response Headers");
      lines.push("------------------------------------");
      Object.entries(allHeaders).forEach(([k, v]) => {
        lines.push(`${k}: ${String(v)}`);
      });
      lines.push("");
    }

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Firewall_Report_${safeNameFromUrl(url)}.txt`;
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(link.href);
    link.remove();
  };

  // Empty state
  if (!data) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="rounded-2xl bg-white shadow-md border border-gray-100 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/waf1.png" alt="verify" className="w-12 h-14" />
              <div>
                <h2 className="text-2xl font-bold">Firewall Detection Report</h2>
                <p className="text-sm text-gray-500">Run a scan to see details here.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                disabled
                className="h-10 px-4 rounded-lg border border-gray-200 text-gray-400 cursor-not-allowed"
                title="Run a scan first"
              >
                <div className="inline-flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Download PDF
                </div>
              </button>
              <button
                disabled
                className="h-10 px-4 rounded-lg border border-gray-200 text-gray-400 cursor-not-allowed"
                title="Run a scan first"
              >
                <div className="inline-flex items-center gap-2">
                  <FileDown className="h-4 w-4" /> Download TXT
                </div>
              </button>
            </div>
          </div>
          <div className="mt-6 rounded-lg bg-gray-50 p-6 text-gray-600">
            No data to display.
          </div>
        </div>
      </div>
    );
  }

  const {
    url,
    statusCode,
    detected,
    firewallName,
    serverHeader,
    protectionLevel,
  } = data;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="rounded-2xl bg-white shadow-md border border-gray-100 p-8">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/waf1.png" alt="verify" className="w-12 h-14" />
            <div>
              <h2 className="text-2xl font-bold">Firewall Detection Report</h2>
              <p className="text-sm text-gray-500">Results for your latest scan.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadPdf}
              className="h-10 px-4 rounded-lg border border-green-700 text-green-700 hover:bg-green-50 transition"
              title="Download PDF"
            >
              <div className="inline-flex items-center gap-2">
                <FileText className="h-4 w-4" /> Download PDF
              </div>
            </button>
            <button
              onClick={handleDownloadTxt}
              className="h-10 px-4 rounded-lg border border-green-700 text-green-700 hover:bg-green-50 transition"
              title="Download TXT"
            >
              <div className="inline-flex items-center gap-2">
                <FileDown className="h-4 w-4" /> Download TXT
              </div>
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <div className="text-sm text-gray-500 mb-1">URL Scanned</div>
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-blue-600" />
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 break-all hover:underline"
                title={url}
              >
                {url}
              </a>
            </div>
          </div>

          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <div className="text-sm text-gray-500 mb-1">HTTP Status Code</div>
            <div className="text-gray-800 font-semibold">{statusCode}</div>
          </div>

          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <div className="text-sm text-gray-500 mb-1">Protection Level</div>
            <ProtectionPill level={protectionLevel} />
          </div>

          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <div className="text-sm text-gray-500 mb-1">Firewall Detected</div>
            {detected ? (
              <div className="inline-flex items-center gap-2 text-green-700 font-semibold">
                <Shield className="h-4 w-4" />
                {firewallName}
              </div>
            ) : (
              <span className="text-gray-500 italic">None</span>
            )}
          </div>

          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 md:col-span-2">
            <div className="text-sm text-gray-500 mb-1">Server Header</div>
            <div className="text-gray-800 break-all">{serverHeader || "N/A"}</div>
          </div>
        </div>

        {/* Details */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-lg border border-gray-100">
            <div className="px-4 py-3 border-b bg-gray-50 font-semibold">
              Matched Headers
            </div>
            <div className="p-4">
              {matchedHeaders.length > 0 ? (
                <ul className="space-y-2">
                  {matchedHeaders.map(({ header, value }, idx) => (
                    <li key={`${header}-${idx}`} className="text-sm">
                      <code className="bg-gray-100 px-1 py-0.5 rounded">{header}</code>
                      <span className="text-gray-600">: {String(value ?? "")}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-500 text-sm">None</div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-gray-100">
            <div className="px-4 py-3 border-b bg-gray-50 font-semibold">
              Security Headers Detected
            </div>
            <div className="p-4">
              {securityHeadersDetected.length > 0 ? (
                <ul className="space-y-2">
                  {securityHeadersDetected.map((header, idx) => (
                    <li key={`${header}-${idx}`} className="text-sm">
                      <code className="bg-gray-100 px-1 py-0.5 rounded">{header}</code>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-500 text-sm">None</div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
