"use client";

import { useMemo, useRef, useState } from "react";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  FileDown,
  ScanLine,
  Loader2,
  Globe,
  Info,
  Terminal,
  Activity,
  Layers,
  Cpu,
  ChevronDown
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";

const DEFAULT_PARAMS = [
  "redirect",
  "url",
  "next",
  "dest",
  "destination",
  "continue",
  "return",
  "to",
  "goto",
  "r",
  "u",
];

const SEV_BADGE = {
  Critical: "border-red-500/40 bg-red-500/5 text-red-400",
  High: "border-red-500/40 bg-red-500/5 text-red-400",
  Medium: "border-orange-500/40 bg-orange-500/5 text-orange-400",
  Low: "border-zinc-800 bg-zinc-900/40 text-zinc-350",
  Informational: "border-zinc-800 bg-zinc-900/40 text-zinc-450",
  Safe: "border-zinc-800 bg-zinc-900/40 text-zinc-300",
};

export default function DarkThemeOpenRedirectTester() {
  const [inputUrl, setInputUrl] = useState("");
  const [manualParam, setManualParam] = useState("redirect");
  const [autoScan, setAutoScan] = useState(true);
  const [customParams, setCustomParams] = useState(DEFAULT_PARAMS.join(","));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState(null);
  const reportRef = useRef(null);

  const protectedAction = useProtectedAction();

  const paramsToTest = useMemo(() => {
    if (!autoScan) return [manualParam.trim()].filter(Boolean);
    const items = (customParams || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return Array.from(new Set(items));
  }, [autoScan, manualParam, customParams]);

  async function handleTest(e) {
    e?.preventDefault?.();
    setError("");
    setReport(null);

    if (!inputUrl) {
      setError("Please enter a URL.");
      return;
    }

    setLoading(true);

    await protectedAction(async (token) => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/openRedirectTester/openRedirect-tester-advanced`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              url: inputUrl.trim(),
              mode: autoScan ? "auto" : "manual",
              paramName: manualParam.trim() || "redirect",
              params: paramsToTest,
            }),
          }
        );

        const data = await res.json();

        if (!res.ok) throw new Error(data?.error || "Failed to test URL");

        setReport(data);
      } catch (err) {
        setError(err.message || "Unexpected error");
      } finally {
        setLoading(false);
      }
    });
  }

  function badgeClass(sev) {
    return `inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold font-mono border uppercase tracking-wider ${
      SEV_BADGE[sev] || "border-zinc-800 bg-zinc-900/40 text-zinc-400"
    }`;
  }

  function exportPDF() {
    if (!report) return;
    const doc = new jsPDF();
    const pad = 12;

    // Header Red Team
    doc.setFillColor(18, 18, 18);
    doc.rect(0, 0, 210, 55, "F");

    doc.setTextColor(239, 68, 68);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("OPEN REDIRECT TEST REPORT", pad, 25);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text(`Target: ${report.originalUrl}`, pad, 40);

    doc.setTextColor(50, 50, 50);
    doc.setFontSize(9);
    doc.text(`Original Domain: ${report.originalDomain}`, pad, 70);
    doc.text(
      `Overall Verdict: ${
        report.summary?.vulnerable ? "VULNERABLE" : "NOT VULNERABLE"
      }`,
      pad,
      82
    );
    doc.text(`Severity: ${report.summary?.severity}`, pad, 94);

    autoTable(doc, {
      startY: 110,
      head: [
        [
          "Param",
          "Payload",
          "Final URL",
          "Final Domain",
          "Changed eTLD+1",
          "Status Codes",
          "Vuln?",
        ],
      ],
      body: (report.tests || []).map((t) => [
        t.param,
        t.payloadName,
        t.finalUrl,
        t.finalDomain,
        t.changedETLD ? "Yes" : "No",
        (t.chain || []).map((h) => h.status).join(" → "),
        t.vulnerable ? "Yes" : "No",
      ]),
      theme: "grid",
      styles: { fontSize: 8, cellWidth: "wrap" },
      columnStyles: { 2: { cellWidth: 80 } },
      headStyles: { fillColor: [239, 68, 68] },
    });

    if (report.summary?.reasons?.length) {
      const y = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 12 : 110;
      doc.setFontSize(10);
      doc.text("Verdict Notes:", pad, y);
      let yy = y + 12;
      report.summary.reasons.forEach((r) => {
        doc.text(`• ${r}`, pad, yy);
        yy += 10;
      });
    }

    const fname = `open-redirect-report-${Date.now()}.pdf`;
    doc.save(fname);
  }

  return (
    <div 
      className="tool-detail-page min-h-screen"
      style={{
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
          background: rgba(239, 68, 68, 0.35) !important;
        }
        .tool-detail-page ::-webkit-scrollbar-thumb:hover {
          background: rgba(239, 68, 68, 0.55) !important;
        }
        .tool-detail-page ::selection {
          background: rgba(239, 68, 68, 0.22) !important;
          color: #fef2f2 !important;
        }
        .tool-detail-page :is(button, [role="button"]):is([class*="bg-red-"], [class*="bg-rose-"]) {
          color: #000000 !important;
        }
        .tool-detail-page :is(button, [role="button"]):is([class*="bg-red-"], [class*="bg-rose-"]) * {
          color: #000000 !important;
        }
      `}</style>

      <div className="tool-detail-shell" ref={reportRef}>
        {/* Navigation & Header */}
        <div className="flex justify-end mb-8">
          <span className="rounded-full border border-red-500/30 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-red-400">
            Red Team
          </span>
        </div>

        {/* Title Block */}
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl border border-red-500/30 overflow-hidden shadow-lg flex-shrink-0 flex items-center justify-center">
            <ScanLine className="h-8 w-8 text-red-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              OPEN REDIRECT <span className="text-red-400">TESTER</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Validate target URL parameters against unsafe redirection endpoints. Trace redirect chains and identify whitelist bypass vectors.
            </p>
          </div>
        </div>

        {/* 2-Column Split Layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* Input Form Card */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-red-500/10 transition-all duration-300 space-y-4">
              <h2 className="text-lg font-mono font-medium text-zinc-100 mb-2 flex items-center gap-2">
                <Globe className="h-5 w-5 text-red-400" />
                Redirect Scan Parameters
              </h2>

              <form onSubmit={handleTest} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                    Target URL to Test
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-650" />
                    <input
                      type="url"
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                      placeholder="https://example.com/login"
                      required
                      className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 pl-12 text-sm focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 focus:shadow-[0_0_12px_rgba(239,68,68,0.08)] focus:outline-none transition-all placeholder:text-zinc-600 font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 py-1">
                  <label className="flex items-center gap-2 text-xs font-mono text-zinc-350 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoScan}
                      onChange={() => setAutoScan((v) => !v)}
                      className="w-4.5 h-4.5 text-red-500 focus:ring-red-500 bg-transparent border-zinc-700 rounded"
                    />
                    <span>Auto-scan common parameter lists</span>
                  </label>
                </div>

                {!autoScan ? (
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                      Redirect Parameter Name
                    </label>
                    <input
                      type="text"
                      value={manualParam}
                      onChange={(e) => setManualParam(e.target.value)}
                      className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 text-sm focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 focus:outline-none transition-all font-mono"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                      Parameter Names to Scan
                    </label>
                    <input
                      type="text"
                      value={customParams}
                      onChange={(e) => setCustomParams(e.target.value)}
                      className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 text-sm focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 focus:outline-none transition-all font-mono"
                    />
                    <small className="text-[10px] text-zinc-550 mt-1.5 block font-mono">
                      Comma-separated keys lists. Red Team defaults predefined.
                    </small>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-black rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] focus:outline-none disabled:opacity-40"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        Testing URL Nodes...
                      </>
                    ) : (
                      <>
                        <ScanLine className="w-4 h-4 text-black" />
                        Start Test scan
                      </>
                    )}
                  </button>

                  {report && (
                    <button
                      type="button"
                      onClick={exportPDF}
                      className="px-6 py-4 rounded-xl bg-zinc-900/40 hover:bg-red-500/5 text-zinc-350 hover:text-red-400 border border-zinc-800/80 hover:border-red-500/30 font-mono font-bold text-xs uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FileDown className="w-4 h-4" />
                      PDF Report
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-955/10 text-red-400 text-xs font-mono flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>Error outcome: {error}</span>
              </div>
            )}

            {/* Report results container */}
            {report && (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] space-y-6">
                
                {/* Header score rating banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
                  <div className="space-y-1.5 font-mono text-xs max-w-sm sm:max-w-md overflow-hidden">
                    <span className="text-[10px] text-zinc-550 block font-bold uppercase tracking-wider">Target Domain</span>
                    <div className="font-bold text-zinc-300 break-all bg-zinc-900/40 border border-zinc-850 p-2.5 rounded-xl">
                      {report.originalUrl}
                    </div>
                    <div className="text-[10px] text-zinc-500 pt-1">
                      Origin Domain: <span className="text-zinc-350 font-semibold">{report.originalDomain}</span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right font-mono flex-shrink-0">
                    <div className="mb-2.5">
                      {badgeClass(
                        report.summary?.severity ||
                          (report.summary?.vulnerable ? "High" : "Safe")
                      )}
                    </div>
                    <div
                      className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                        report.summary?.vulnerable ? "text-red-450" : "text-zinc-300"
                      }`}
                    >
                      {report.summary?.vulnerable ? (
                        <>
                          <AlertTriangle className="w-4 h-4" />
                          Vulnerable
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 text-red-450" />
                          Validated Safe
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Specific redirect params checks lists */}
                <div className="space-y-3 font-mono text-xs">
                  <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Redirection Parameter Tests</h4>
                  <div className="space-y-3">
                    {(report.tests || []).map((t, idx) => (
                      <details key={idx} className="rounded-xl border border-zinc-850 overflow-hidden bg-zinc-900/10">
                        <summary className="cursor-pointer p-4 flex items-center justify-between gap-3 bg-zinc-900/40 hover:bg-zinc-900/60 select-none">
                          <div className="flex items-center gap-2">
                            {t.vulnerable ? (
                              <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-red-450 flex-shrink-0" />
                            )}
                            <span className="font-bold text-zinc-200">{t.param}</span>
                            <span className="text-zinc-700">•</span>
                            <span className="text-zinc-450">{t.payloadName}</span>
                          </div>
                          <div className="text-[10px] uppercase font-bold tracking-wider">
                            {t.vulnerable ? (
                              <span className="text-red-400">Vulnerable</span>
                            ) : (
                              <span className="text-zinc-500">Safe</span>
                            )}
                          </div>
                        </summary>
                        
                        <div className="p-4 border-t border-zinc-900 space-y-2 text-zinc-400 leading-relaxed">
                          <div>
                            <span className="text-zinc-600 font-bold">Tested Node URL:</span>{" "}
                            <span className="break-all font-semibold block text-zinc-350">{t.testedUrl}</span>
                          </div>
                          <div>
                            <span className="text-zinc-600 font-bold">Resolved Final URL:</span>{" "}
                            <span className="break-all font-semibold block text-zinc-350">{t.finalUrl}</span>
                          </div>
                          <div className="text-[10px] text-zinc-500">
                            Final Domain: <span className="text-zinc-300 font-bold">{t.finalDomain}</span>
                            <span className="mx-2">•</span>
                            Changed eTLD+1: <span className="text-zinc-300 font-bold">{t.changedETLD ? "Yes" : "No"}</span>
                          </div>
                          
                          <div className="border-t border-zinc-900/50 pt-2.5 mt-2.5">
                            <div className="text-zinc-600 font-bold text-[10px] uppercase tracking-wider mb-1.5">
                              Redirect Pathway chain:
                            </div>
                            <ol className="list-decimal ml-5 space-y-1.5 pl-0">
                              {(t.chain || []).map((hop, hopIdx) => (
                                <li key={hopIdx} className="break-all font-mono text-[11px] text-zinc-350 leading-normal">
                                  <span className="font-bold text-zinc-100">[{hop.status}]</span>{" "}
                                  {hop.location ? `→ ${hop.location}` : ""}
                                  <div className="text-[9px] text-zinc-550">
                                    Resolved destination: {hop.url}
                                  </div>
                                </li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      </details>
                    ))}
                  </div>
                </div>

                {/* Verdict notes reasons */}
                {report.summary?.reasons?.length ? (
                  <div className="space-y-3 font-mono text-xs border-t border-zinc-900 pt-4">
                    <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Verdict Audit Notes</h4>
                    <ul className="list-none pl-0 space-y-2">
                      {report.summary.reasons.map((r, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-zinc-400">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                          <span className="leading-relaxed">{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

              </div>
            )}

          </div>

          {/* Right Column (Guidance) */}
          <div className="space-y-6">
            
            {/* Guidance sidebar card */}
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Info className="text-red-400 w-4 h-4" />
                Tester Guidance
              </h2>
              <ul className="space-y-3.5 list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Scans URL query parameters for dynamic redirect parameters.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Audits redirections against common bypass payloads (double encoding, protocol swaps).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Verifies eTLD+1 mappings to identify whitelist escapes.
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
