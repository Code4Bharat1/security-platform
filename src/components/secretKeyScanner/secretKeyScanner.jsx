"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Key,
  Upload,
  CheckCircle2,
  ShieldAlert,
  Info,
  Terminal,
  Activity,
  Download,
  FileText
} from "lucide-react";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";

export default function SecretKeyScanner() {
  const pathname = usePathname() || "";
  const isVaTeam = pathname.includes("secret-key-scanner") || pathname.includes("/va/") || pathname.includes("-scan");

  const [code, setCode] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validateOnline, setValidateOnline] = useState(false);

  const protectedAction = useProtectedAction();

  const apiBase = (process.env.NEXT_PUBLIC_PROD_API_URL || "").replace(
    /\/+$/,
    ""
  );

  const scanSecrets = async () => {
    setLoading(true);
    setResults([]);

    await protectedAction(async (token) => {
      try {
        const res = await fetch(`${apiBase}/secretKeyScanner/secret-scan`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ code, validateOnline }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Failed to scan secrets");
        }

        setResults(data.secrets || []);
      } catch (e) {
        setResults([
          {
            type: "Error",
            severity: "Low",
            line: 0,
            secret: String(e),
            suggestion: "Check network/endpoint connection configuration.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    });
  };

  const makePdf = () => {
    if (!results?.length) return;
    const doc = new jsPDF();
    const pad = 12;

    // Header Color
    doc.setFillColor(18, 18, 18);
    doc.rect(0, 0, 210, 55, "F");

    doc.setTextColor(isVaTeam ? 245 : 239, isVaTeam ? 158 : 68, isVaTeam ? 11 : 68);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(isVaTeam ? "ADVANCED DYNAMIC SCAN REPORT" : "SECRET KEY EXPOSURE REPORT", pad, 25);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text(`Validated Online: ${validateOnline ? "Yes" : "No"} | Findings: ${results.length}`, pad, 40);

    const rows = results.map((r, i) => [
      i + 1,
      r.type || "—",
      r.severity || "—",
      `L${r.line || "—"}`,
      r.redacted || "—",
      r.validation?.status || "unknown",
      r.validation?.evidence?.status || "—",
    ]);

    autoTable(doc, {
      startY: 70,
      head: [
        [
          "#",
          "Type",
          "Severity",
          "Line",
          "Secret (redacted)",
          "Validation",
          "HTTP Status",
        ],
      ],
      body: rows,
      theme: "grid",
      styles: { fontSize: 8, cellWidth: "wrap" },
      columnStyles: { 4: { cellWidth: 70 } },
      headStyles: { 
        fillColor: isVaTeam ? [245, 158, 11] : [239, 68, 68],
        textColor: isVaTeam ? [0, 0, 0] : [255, 255, 255]
      },
    });

    doc.save(isVaTeam ? "advanced_dynamic_scan_report.pdf" : "secret_scan_report.pdf");
  };

  const downloadTxt = () => {
    if (!results?.length) return;
    const lines = [
      isVaTeam ? `Advanced Dynamic Scan Report` : `Secret Key Exposure Report`,
      `Validated Online: ${validateOnline ? "Yes" : "No"}`,
      `Findings: ${results.length}`,
      ``,
      ...results.map((r, i) =>
        [
          `#${i + 1}`,
          `Type: ${r.type}`,
          `Severity: ${r.severity}`,
          `Line: ${r.line}`,
          `Secret (redacted): ${r.redacted}`,
          `Validation: ${r.validation?.status || "unknown"}`,
          `Evidence: ${r.validation?.evidence?.status || ""} ${
            r.validation?.evidence?.note || ""
          }`,
          `Suggestion: ${r.suggestion}`,
          ``,
        ].join("\n")
      ),
    ].join("\n");
    const blob = new Blob([lines], { type: "text/plain" });
    const urlObj = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = urlObj;
    a.download = isVaTeam ? "advanced-dynamic-scan-report.txt" : "secret-scan-report.txt";
    a.click();
    URL.revokeObjectURL(urlObj);
  };

  const badge = (sev) => {
    const base = "border-l-4 p-4 rounded-xl font-mono text-xs shadow-md space-y-2 ";
    if (sev === "Critical" || sev === "High") {
      return `${base} border-red-500/40 bg-transparent text-zinc-200`;
    }
    if (sev === "Medium") {
      return `${base} border-orange-500/40 bg-transparent text-zinc-200`;
    }
    return `${base} border-zinc-800 bg-transparent text-zinc-350`;
  };

  const getSeverityBadge = (sev) => {
    const base = "inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold font-mono border uppercase tracking-wider";
    if (sev === "Critical" || sev === "High") {
      return (
        <span className={`${base} border-red-500/40 bg-transparent text-red-400`}>
          {sev}
        </span>
      );
    }
    if (sev === "Medium") {
      return (
        <span className={`${base} border-orange-500/40 bg-transparent text-orange-400`}>
          {sev}
        </span>
      );
    }
    return (
      <span className={`${base} border-zinc-800 bg-transparent text-zinc-400`}>
        {sev}
      </span>
    );
  };

  return (
    <div 
      className="tool-detail-page min-h-screen"
      style={isVaTeam ? {
        '--hero-ambient-a': 'rgba(245, 158, 11, 0.08)',
        '--hero-ambient-b': 'rgba(249, 115, 22, 0.03)',
        '--glow-primary': '0 0 34px rgba(245, 158, 11, 0.16)',
        '--gold': '#f59e0b',
        '--gold-strong': '#fbbf24',
        '--gold-dark': '#b45309',
        '--ring': 'rgba(245, 158, 11, 0.34)',
        '--surface-glow': 'rgba(245, 158, 11, 0.14)',
      } : {
        '--hero-ambient-a': 'rgba(239, 68, 68, 0.08)',
        '--hero-ambient-b': 'rgba(249, 115, 22, 0.03)',
        '--glow-primary': '0 0 34px rgba(239, 68, 68, 0.16)',
        '--gold': '#ef4444',
        '--gold-strong': '#f87171',
        '--gold-dark': '#b91c1c',
        '--ring': 'rgba(239, 68, 68, 0.34)',
        '--surface-glow': 'rgba(239, 68, 68, 0.14)',
      }}
    >
      <style>{`
        .tool-detail-page .tool-detail-shell {
          padding-top: 3.5rem !important;
        }
        .tool-detail-page ::-webkit-scrollbar-thumb {
          background: ${isVaTeam ? 'rgba(245, 158, 11, 0.35)' : 'rgba(239, 68, 68, 0.35)'} !important;
        }
        .tool-detail-page ::-webkit-scrollbar-thumb:hover {
          background: ${isVaTeam ? 'rgba(245, 158, 11, 0.55)' : 'rgba(239, 68, 68, 0.55)'} !important;
        }
        .tool-detail-page ::selection {
          background: ${isVaTeam ? 'rgba(245, 158, 11, 0.22)' : 'rgba(239, 68, 68, 0.22)'} !important;
          color: ${isVaTeam ? '#fffbeb' : '#fef2f2'} !important;
        }
        .tool-detail-page :is(button, [role="button"]):is([class*="bg-red-"], [class*="bg-rose-"], [class*="bg-amber-"], [class*="bg-orange-"]) {
          color: #000000 !important;
        }
        .tool-detail-page :is(button, [role="button"]):is([class*="bg-red-"], [class*="bg-rose-"], [class*="bg-amber-"], [class*="bg-orange-"]) * {
          color: #000000 !important;
        }
      `}</style>

      <div className="tool-detail-shell">
        {/* Navigation & Header */}
        <div className="flex justify-end mb-8">
          <span className={`rounded-full border px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] ${
            isVaTeam ? "border-amber-500/30 text-amber-400" : "border-red-500/30 text-red-400"
          }`}>
            {isVaTeam ? "Vulnerability Assessment" : "Red Team"}
          </span>
        </div>

        {/* Title Block */}
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className={`w-16 h-16 rounded-2xl border overflow-hidden shadow-lg flex-shrink-0 flex items-center justify-center ${
            isVaTeam ? "border-amber-500/30" : "border-red-500/30"
          }`}>
            <Key className={`h-8 w-8 ${isVaTeam ? "text-amber-400" : "text-red-400"}`} />
          </div>
          <div>
            {isVaTeam ? (
              <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
                ADVANCED DYNAMIC <span className="text-amber-400">SCAN</span>
              </h1>
            ) : (
              <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
                SECRET KEY <span className="text-red-400">SCANNER</span>
              </h1>
            )}
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Scan configurations, repositories, and environment files for exposed API credentials, private certificates, and authentication tokens.
            </p>
          </div>
        </div>

        {/* 2-Column Split Layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* Input Form Card */}
            <div className={`bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-300 space-y-4 ${
              isVaTeam ? "hover:border-amber-500/10" : "hover:border-red-500/10"
            }`}>
              <h2 className="text-lg font-mono font-medium text-zinc-100 mb-2 flex items-center gap-2">
                <Terminal className={`h-5 w-5 ${isVaTeam ? "text-amber-400" : "text-red-400"}`} />
                {isVaTeam ? "Dynamic Code Auditing" : "Source Credentials Audit"}
              </h2>

              <div className="space-y-4">
                <textarea
                  rows={10}
                  className={`w-full p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-xl resize-none focus:outline-none focus:ring-1 transition-all duration-200 font-mono text-xs text-zinc-350 placeholder:text-zinc-650 ${
                    isVaTeam ? "focus:ring-amber-500/50 focus:border-amber-500/50" : "focus:ring-red-500/50 focus:border-red-500/50"
                  }`}
                  placeholder="Paste configuration variables, source code patterns, or upload keys files..."
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-mono text-zinc-350 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={validateOnline}
                      onChange={(e) => setValidateOnline(e.target.checked)}
                      className={`w-4.5 h-4.5 bg-transparent border-zinc-700 rounded ${
                        isVaTeam ? "text-amber-500 focus:ring-amber-500" : "text-red-500 focus:ring-red-500"
                      }`}
                    />
                    <span>Verify credentials validity online (sends requests to provider APIs)</span>
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="file"
                    accept=".js,.env,.txt,.json"
                    id="fileInput"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => setCode(String(ev.target?.result || ""));
                      reader.readAsText(file);
                    }}
                  />
                  <label
                    htmlFor="fileInput"
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 bg-zinc-900/40 border border-zinc-800/80 rounded-xl font-mono font-bold text-xs uppercase transition-all duration-350 cursor-pointer text-center ${
                      isVaTeam 
                        ? "hover:bg-amber-50/5 text-zinc-350 hover:text-amber-400 hover:border-amber-500/30" 
                        : "hover:bg-red-50/5 text-zinc-350 hover:text-red-450 hover:border-red-500/30"
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    Choose Config File
                  </label>

                  <button
                    onClick={scanSecrets}
                    disabled={loading || !code.trim()}
                    className={`flex-1 text-black rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer focus:outline-none disabled:opacity-40 ${
                      isVaTeam 
                        ? "bg-amber-500 hover:bg-amber-600 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]" 
                        : "bg-red-500 hover:bg-red-600 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Scanning for credentials...
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4 text-black" />
                        {isVaTeam ? "Run Dynamic Scan" : "Scan for Secrets"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Results Actions */}
            {!!results.length && (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={makePdf}
                  className={`px-4 py-2.5 bg-zinc-900/40 text-zinc-350 border border-zinc-800/80 rounded-xl font-mono font-bold text-xs uppercase transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                    isVaTeam 
                      ? "hover:bg-amber-500/5 hover:text-amber-400 hover:border-amber-500/30" 
                      : "hover:bg-red-500/5 hover:text-red-400 hover:border-red-500/30"
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  PDF Report
                </button>
                <button
                  onClick={downloadTxt}
                  className={`px-4 py-2.5 bg-zinc-900/40 text-zinc-350 border border-zinc-800/80 rounded-xl font-mono font-bold text-xs uppercase transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                    isVaTeam 
                      ? "hover:bg-amber-500/5 hover:text-amber-400 hover:border-amber-500/30" 
                      : "hover:bg-red-500/5 hover:text-red-400 hover:border-red-500/30"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  TXT Report
                </button>
              </div>
            )}

            {/* Results Logs details list */}
            {!!results.length && (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] space-y-6">
                
                <h3 className="text-sm font-mono font-bold text-zinc-200 flex items-center gap-2 border-b border-zinc-850 pb-2.5">
                  <Activity className={`w-4 h-4 ${isVaTeam ? "text-amber-400" : "text-red-400"}`} />
                  Secrets Exposed: {results.length}
                </h3>

                <div className="space-y-4">
                  {results.map((r, idx) => (
                    <div key={idx} className={badge(r.severity)}>
                      <div className="flex items-center gap-2 flex-wrap">
                        {getSeverityBadge(r.severity)}
                        <span className="font-bold text-zinc-300">Identity: {r.type}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900/80 border border-zinc-800/60 text-zinc-550">
                          Line {r.line}
                        </span>
                      </div>

                      <div className="mt-2.5 space-y-2">
                        <div className="bg-zinc-900/60 border border-zinc-850 p-3 rounded-lg overflow-x-auto">
                          <code className={`text-xs break-all block font-semibold leading-normal font-mono ${
                            isVaTeam ? "text-amber-400" : "text-red-400"
                          }`}>
                            {r.redacted || r.secret}
                          </code>
                        </div>

                        <div className="text-zinc-400 space-y-1 mt-1 leading-relaxed">
                          <div>
                            <span className="text-zinc-650 font-bold">Fix Suggestion:</span> {r.suggestion}
                          </div>
                          <div className="text-[11px] text-zinc-500">
                            Validation Status: <span className="font-bold text-zinc-350">{r.validation?.status || "unknown"}</span>
                            {r.validation?.evidence?.status && (
                              <span className="text-zinc-550">
                                {" "}
                                (HTTP code: {r.validation.evidence.status}
                                {r.validation.evidence.note ? `, ${r.validation.evidence.note}` : ""})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty results message */}
            {!loading && !results.length && code && (
              <div className="p-8 bg-zinc-900/40 border border-zinc-850 rounded-xl text-center font-mono text-xs text-zinc-550">
                No credentials anomalies detected in inputs.
              </div>
            )}

          </div>

          {/* Right Column (Guidance) */}
          <div className="space-y-6">
            
            {/* Guidance sidebar card */}
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Info className={`w-4 h-4 ${isVaTeam ? "text-amber-400" : "text-red-400"}`} />
                {isVaTeam ? "Scan Specs" : "Scanner Guidance"}
              </h2>
              <ul className="space-y-3.5 list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                    isVaTeam ? "bg-amber-500/60" : "bg-red-500/60"
                  }`} />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Scans code for entropy checks and credential signatures (AWS keys, Stripe, database links).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                    isVaTeam ? "bg-amber-500/60" : "bg-red-500/60"
                  }`} />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Offers optional online verification validations to check active/inactive credential keys status.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                    isVaTeam ? "bg-amber-500/60" : "bg-red-500/60"
                  }`} />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Ensures redacted reporting logs output structures for audits exports formats.
                  </span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
