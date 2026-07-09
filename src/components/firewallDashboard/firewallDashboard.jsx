"use client";

import React, { useState } from "react";
import { 
  FileText, 
  FileDown, 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Link2,
  Terminal,
  Download,
  Loader2
} from "lucide-react";
import { generateWafPDF } from "../waf_form/generateWafPDF";

export default function FirewallDashboard({ data }) {
  const [pdfProgress, setPdfProgress] = useState(null);
  const matchedHeaders = data?.matchedHeaders ?? [];
  const securityHeadersDetected = data?.securityHeadersDetected ?? [];

  const protectionColors = {
    None: "bg-zinc-800 text-zinc-400 border border-zinc-700",
    Moderate: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    High: "bg-red-500/10 text-red-400 border border-red-500/20",
  };

  const ProtectionPill = ({ level }) => (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider
        ${protectionColors[level] ?? protectionColors.None}`}
    >
      {level === "High" ? <AlertTriangle className="h-3 w-3" /> :
       level === "Moderate" ? <Shield className="h-3 w-3" /> :
       <CheckCircle2 className="h-3 w-3" />}
      {level || "None"}
    </span>
  );

  const safeNameFromUrl = (u) => {
    try { return new URL(u).hostname; }
    catch { return String(u || "site").replace(/[^a-z0-9.-]/gi, "_"); }
  };

  const handleDownloadPdf = () => {
    if (!data) return;
    generateWafPDF(data, setPdfProgress);
  };

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
    lines.push("WAF Security Detection Report");
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

  if (!data) {
    return (
      <div className="bg-zinc-900/40 border border-zinc-850 p-6 rounded-2xl font-mono text-zinc-550 text-xs text-center">
        No active telemetry data to display. Execute WAF detection check above.
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
    <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-blue-500/10 transition-all duration-300 space-y-6">
      
      {/* Header bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-zinc-800/40 pb-4">
        <div>
          <h3 className="text-lg font-mono font-bold text-zinc-100 uppercase tracking-wider">
            Detection Telemetry Results
          </h3>
          <p className="text-xs font-mono text-zinc-500 mt-0.5">
            Real-time security analytics log
          </p>
        </div>
        
        <div className="flex gap-2 items-center">
          {pdfProgress && (
            <span className="text-[10px] font-mono text-blue-400 animate-pulse hidden sm:inline">
              {pdfProgress}
            </span>
          )}
          <button
            onClick={handleDownloadPdf}
            disabled={pdfProgress !== null}
            className="px-4 py-2.5 bg-zinc-900/40 hover:bg-blue-500/5 text-zinc-300 hover:text-blue-400 border border-zinc-800/80 hover:border-blue-500/30 rounded-xl font-mono font-bold text-xs uppercase transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none"
          >
            {pdfProgress ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                PDF Report
              </>
            )}
          </button>
          <button
            onClick={handleDownloadTxt}
            className="px-4 py-2.5 bg-zinc-900/40 hover:bg-blue-500/5 text-zinc-300 hover:text-blue-400 border border-zinc-800/80 hover:border-blue-500/30 rounded-xl font-mono font-bold text-xs uppercase transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5"
          >
            <FileDown className="w-3.5 h-3.5" />
            TXT Report
          </button>
        </div>
      </div>

      {/* Metrics summary cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl font-mono text-xs">
          <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-semibold mb-1 block">
            Target Host Scanned
          </span>
          <div className="flex items-center gap-2">
            <Link2 className="h-3.5 w-3.5 text-blue-400" />
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-blue-450 break-all hover:underline truncate max-w-[200px]"
              title={url}
            >
              {url}
            </a>
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl font-mono text-xs">
          <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-semibold mb-1 block">
            HTTP Status Response
          </span>
          <span className="font-semibold text-zinc-200">{statusCode}</span>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl font-mono text-xs">
          <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-semibold mb-1 block">
            WAF Protection Intensity
          </span>
          <ProtectionPill level={protectionLevel} />
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl font-mono text-xs">
          <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-semibold mb-1 block">
            Firewall Active Shield
          </span>
          {detected ? (
            <span className="inline-flex items-center gap-1.5 text-blue-450 font-bold">
              <Shield className="h-3.5 w-3.5 text-blue-400" />
              {firewallName}
            </span>
          ) : (
            <span className="text-zinc-550 italic">None Detected</span>
          )}
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl font-mono text-xs">
          <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-semibold mb-1 block">
            WAF Detected
          </span>
          <span className={`font-bold ${detected ? "text-emerald-400" : "text-red-400"}`}>
            {detected ? "YES" : "NO"}
          </span>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl font-mono text-xs">
          <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-semibold mb-1 block">
            WAF Verdict
          </span>
          <span className="font-semibold text-zinc-200">
            {detected ? "WAF Present" : (firewallName === "Protected or Obfuscated" ? "Protected or Obfuscated" : "WAF Not Detected")}
          </span>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl font-mono text-xs sm:col-span-2">
          <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-semibold mb-1 block">
            WAF Detection Method
          </span>
          <span className="font-semibold text-zinc-200">
            {detected ? "Header Inspection / Cookie Analysis" : "Passive Header Inspection"}
          </span>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl font-mono text-xs sm:col-span-2">
          <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-semibold mb-1 block">
            Server Response Header Signature
          </span>
          <code className="text-zinc-300 break-all font-mono">{serverHeader || "N/A"}</code>
        </div>
      </div>

      {/* Details grids */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 font-mono text-xs">
          <h4 className="text-xs font-mono font-bold text-blue-400 mb-3 border-b border-zinc-850 pb-2 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5" />
            Matched Headers
          </h4>
          {matchedHeaders.length > 0 ? (
            <ul className="space-y-2.5 list-none pl-0">
              {matchedHeaders.map(({ header, value }, idx) => (
                <li key={`${header}-${idx}`} className="text-xs flex items-start gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-blue-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-zinc-400 font-mono">
                    <code className="bg-zinc-950/45 px-1 py-0.5 rounded text-blue-400">{header}</code>: {String(value ?? "")}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-zinc-550 italic font-mono text-xs">No signatures detected.</div>
          )}
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 font-mono text-xs">
          <h4 className="text-xs font-mono font-bold text-blue-400 mb-3 border-b border-zinc-850 pb-2 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5" />
            Security Headers Detected
          </h4>
          {securityHeadersDetected.length > 0 ? (
            <ul className="space-y-2.5 list-none pl-0">
              {securityHeadersDetected.map((header, idx) => (
                <li key={`${header}-${idx}`} className="text-xs flex items-start gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-blue-500/60 mt-1.5 flex-shrink-0" />
                  <code className="bg-zinc-950/45 px-1 py-0.5 rounded text-zinc-300 font-mono">{header}</code>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-zinc-550 italic font-mono text-xs">No security headers detected.</div>
          )}
        </div>
      </div>

    </div>
  );
}
