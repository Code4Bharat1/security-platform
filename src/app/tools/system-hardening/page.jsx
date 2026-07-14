"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Terminal, 
  Download, 
  ShieldCheck, 
  ShieldAlert, 
  Award, 
  FileText, 
  Loader2, 
  Server,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Info
} from "lucide-react";
import { generateSystemHardeningPDF } from "@/components/systemHardening/generateSystemHardeningPDF";
import useProtectedAction from "@/components/UseProtectedAction/UseProtectedAction";

export default function SystemHardeningPage() {
  const router = useRouter();
  const protectedAction = useProtectedAction();
  const [target, setTarget] = useState("127.0.0.1");
  const [scanning, setScanning] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [reportReady, setReportReady] = useState(false);
  const [results, setResults] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [expandedRow, setExpandedRow] = useState(null);
  const logContainerRef = useRef(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [consoleLogs]);

  const handleStartScan = async (e) => {
    e.preventDefault();
    if (!target.trim()) return;

    setScanning(true);
    setReportReady(false);
    setConsoleLogs([]);
    setResults([]);
    setExpandedRow(null);

    const API_BASE = (process.env.NEXT_PUBLIC_PROD_API_URL || "").replace(/\/+$/, "");
    
    await protectedAction(async (token) => {
      try {
        const streamUrl = `${API_BASE}/system-hardening/audit-stream?target=${encodeURIComponent(target)}&token=${encodeURIComponent(token)}`;
        const es = new EventSource(streamUrl);

        es.onmessage = (event) => {
          const data = JSON.parse(event.data || "{}");

          if (data.type === "log") {
            setConsoleLogs((prev) => [...prev, data.message]);
          } else if (data.type === "results") {
            setResults(data.findings || []);
          } else if (data.type === "summary") {
            setScanning(false);
            setReportReady(true);
            es.close();
          } else if (data.type === "done") {
            setScanning(false);
            setReportReady(true);
            es.close();
          } else if (data.type === "error") {
            setConsoleLogs((prev) => [...prev, `[ALERT] Scan failed: ${data.message}`]);
            setScanning(false);
            es.close();
          }
        };

        es.onerror = () => {
          console.error("SSE stream connection error.");
          setConsoleLogs((prev) => [...prev, "[ALERT] Connection to backend scanning queue was lost."]);
          setScanning(false);
          es.close();
        };
      } catch (err) {
        console.error("Failed to establish scan stream:", err);
        setConsoleLogs((prev) => [...prev, `[ALERT] Failed to initialize scan: ${err.message}`]);
        setScanning(false);
      }
    });
  };

  const handleDownloadPDF = () => {
    generateSystemHardeningPDF(results, target);
  };

  const checksFailed = results.filter(r => r.status === 'Fail').length;
  const checksPassed = results.filter(r => r.status === 'Pass').length;
  const highRisks = results.filter(r => r.status === 'Fail' && r.severity === 'High').length;
  const mediumRisks = results.filter(r => r.status === 'Fail' && r.severity === 'Medium').length;

  let riskBand = "Low Risk";
  let riskColor = "text-emerald-450";
  if (highRisks > 0) {
    riskBand = "High Risk";
    riskColor = "text-red-500";
  } else if (mediumRisks > 0) {
    riskBand = "Medium Risk";
    riskColor = "text-orange-400";
  } else if (results.length > 0) {
    riskBand = "Secure";
    riskColor = "text-emerald-400";
  }

  const filteredResults = results.filter(r => {
    if (statusFilter !== "All" && r.status !== statusFilter) return false;
    if (severityFilter !== "All" && r.severity !== severityFilter) return false;
    return true;
  });

  return (
    <div 
      className="tool-detail-page min-h-screen"
      style={{
        '--hero-ambient-a': 'rgba(245, 158, 11, 0.08)',
        '--hero-ambient-b': 'rgba(249, 115, 22, 0.03)',
        '--glow-primary': '0 0 34px rgba(245, 158, 11, 0.16)',
        '--gold': '#f59e0b',
        '--gold-strong': '#fbbf24',
        '--gold-dark': '#b45309',
        '--ring': 'rgba(245, 158, 11, 0.34)',
        '--surface-glow': 'rgba(245, 158, 11, 0.14)',
      }}
    >
      <style>{`
        .tool-detail-page .tool-detail-shell {
          padding-top: 3.5rem !important;
        }
        .tool-detail-page ::-webkit-scrollbar-thumb {
          background: rgba(245, 158, 11, 0.35) !important;
        }
        .tool-detail-page ::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 158, 11, 0.55) !important;
        }
        .tool-detail-page ::selection {
          background: rgba(245, 158, 11, 0.22) !important;
          color: #fffbeb !important;
        }
        .tool-detail-page :is(button, [role="button"]):is([class*="bg-amber-"], [class*="bg-orange-"]) {
          color: #000000 !important;
        }
        .tool-detail-page :is(button, [role="button"]):is([class*="bg-amber-"], [class*="bg-orange-"]) * {
          color: #000000 !important;
        }
      `}</style>

      <div className="tool-detail-shell">
        {/* Navigation & Header */}
        <div className="flex justify-end mb-8">
          <span className="rounded-full border border-amber-500/30 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-amber-400">
            Vulnerability Assessment
          </span>
        </div>

        {/* Title Block */}
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl border border-amber-500/30 overflow-hidden shadow-lg flex-shrink-0 flex items-center justify-center">
            <Server className="h-8 w-8 text-amber-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              SYSTEM <span className="text-amber-400">HARDENING</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Analyze servers, network nodes, and host operating systems for security policy compliance and system hardening settings.
            </p>
          </div>
        </div>

        {/* 2-Column Split Layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* Input Form Card */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-amber-500/10 transition-all duration-300 space-y-4">
              <h2 className="text-lg font-mono font-medium text-zinc-100 mb-2 flex items-center gap-2">
                <Terminal className="h-5 w-5 text-amber-400" />
                Target Host Parameters
              </h2>

              <form onSubmit={handleStartScan} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                    Target IP Address or Hostname
                  </label>
                  <input
                    type="text"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    disabled={scanning}
                    placeholder="e.g. 127.0.0.1"
                    className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 text-sm focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 focus:outline-none transition-all placeholder:text-zinc-600 font-mono"
                    required
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={scanning}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-black rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] focus:outline-none disabled:opacity-40"
                  >
                    {scanning ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-black" />
                        Auditing Host Controls...
                      </>
                    ) : (
                      <>
                        <Activity className="h-4 w-4 text-black" />
                        Execute Configuration Audit
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Console Output */}
            {(scanning || consoleLogs.length > 0) && (
              <div className="border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-md rounded-2xl p-6 font-mono text-xs text-zinc-300 space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                  <span className="flex items-center gap-2 font-bold text-amber-400">
                    <Terminal className="h-4 w-4" />
                    AUDIT CONSOLE OUTPUT
                  </span>
                  {scanning && <span className="text-amber-450 animate-pulse">● RUNNING</span>}
                </div>
                
                <div 
                  ref={logContainerRef}
                  className="h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar text-zinc-400"
                >
                  {consoleLogs.map((log, index) => {
                    let color = "text-zinc-400";
                    if (log.includes("[SUCCESS]")) color = "text-amber-400";
                    if (log.includes("[WARNING]")) color = "text-orange-400";
                    if (log.includes("[ALERT]")) color = "text-red-500 font-bold";
                    
                    return (
                      <div key={index} className={`leading-relaxed ${color}`}>
                        {log}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Interactive Findings Table */}
            {reportReady && results.length > 0 && (
              <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900 pb-4 gap-4">
                  <div>
                    <h2 className="text-lg font-mono font-medium text-zinc-100 flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-amber-400" />
                      Policy Compliance Audit Findings
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1 font-mono">
                      Showing {filteredResults.length} of {results.length} checks resolved.
                    </p>
                  </div>
                  
                  {/* Filters */}
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setExpandedRow(null);
                      }}
                      className="bg-zinc-900/60 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 font-mono cursor-pointer"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Pass">Pass</option>
                      <option value="Fail">Fail</option>
                    </select>
                    <select
                      value={severityFilter}
                      onChange={(e) => {
                        setSeverityFilter(e.target.value);
                        setExpandedRow(null);
                      }}
                      className="bg-zinc-900/60 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 font-mono cursor-pointer"
                    >
                      <option value="All">All Severities</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-full table-fixed text-left font-mono text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-900 text-zinc-400 uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-2 w-[45%]">Control Policy Check</th>
                        <th className="py-3 px-2 w-[15%] text-center">Status</th>
                        <th className="py-3 px-2 w-[20%] text-center">Severity</th>
                        <th className="py-3 px-2 w-[20%] text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredResults.map((finding, idx) => {
                        const isExpanded = expandedRow === idx;
                        const statusColor = finding.status === 'Pass' 
                          ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' 
                          : 'text-red-450 border-red-500/20 bg-red-500/5';
                        const severityColor = finding.severity === 'High' 
                          ? 'text-red-400 font-bold' 
                          : finding.severity === 'Medium' 
                            ? 'text-orange-400' 
                            : 'text-zinc-500';
                        return (
                          <React.Fragment key={idx}>
                            <tr 
                              onClick={() => setExpandedRow(isExpanded ? null : idx)}
                              className="border-b border-zinc-900 hover:bg-zinc-900/10 cursor-pointer transition-colors"
                            >
                              <td className="py-4 px-2 text-zinc-200 font-semibold">{finding.control}</td>
                              <td className="py-4 px-2 text-center">
                                <span className={`inline-block px-2.5 py-0.5 rounded-lg border text-[10px] uppercase font-bold tracking-wider ${statusColor}`}>
                                  {finding.status}
                                </span>
                              </td>
                              <td className={`py-4 px-2 text-center font-bold uppercase ${severityColor}`}>{finding.severity}</td>
                              <td className="py-4 px-2 text-right text-amber-400 text-[10px] hover:underline select-none">
                                {isExpanded ? 'Collapse ▲' : 'Inspect ▼'}
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr>
                                <td colSpan="4" className="bg-zinc-900/20 px-4 py-4 border-b border-zinc-900 space-y-3.5 leading-relaxed text-zinc-350">
                                  <div>
                                    <h4 className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1.5">Detailed Discovery Evidence:</h4>
                                    <p className="text-xs font-mono bg-zinc-950/40 border border-zinc-900 rounded-xl p-3 text-zinc-300">
                                      {finding.details}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1.5">Actionable Remediation Guidance:</h4>
                                    <div className={`flex gap-2 items-start text-xs font-mono border rounded-xl p-3 text-zinc-300 bg-transparent ${
                                      finding.status === 'Pass'
                                        ? 'border-zinc-800/80'
                                        : 'border-amber-500/10'
                                    }`}>
                                      <ShieldCheck className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                                      <div>{finding.remediation}</div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Sidebar Results Summary Card */}
            {reportReady ? (
              <div className="border border-zinc-800/80 bg-transparent rounded-2xl p-6 space-y-6 shadow-lg">
                <div className="text-center space-y-2">
                  <div className="inline-flex h-12 w-12 items-center justify-center border border-amber-500/30 text-amber-400 rounded-full bg-amber-500/10 mb-2">
                    <Award className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-mono font-bold text-zinc-100">Audit Complete</h3>
                  <p className="text-xs text-zinc-550">Findings compiled for {target}</p>
                </div>

                <div className="border-t border-zinc-900 pt-4 space-y-3 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-450">Checks Failed:</span>
                    <span className="text-red-400 font-bold">{checksFailed} {checksFailed === 1 ? 'Policy' : 'Policies'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-450">Checks Passed:</span>
                    <span className="text-emerald-400 font-bold">{checksPassed} {checksPassed === 1 ? 'Policy' : 'Policies'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-450">Risk Band:</span>
                    <span className={`${riskColor} font-bold`}>{riskBand}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button 
                    onClick={handleDownloadPDF}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-black font-mono font-bold text-xs uppercase py-3.5 rounded-xl transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md border-none"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF Report
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 text-center py-16 text-zinc-500 space-y-3 shadow-sm">
                <FileText className="h-12 w-12 mx-auto text-zinc-850" />
                <p className="text-sm font-mono uppercase tracking-wider font-semibold text-zinc-300">No Audit Executed</p>
                <p className="text-xs max-w-[240px] mx-auto leading-relaxed">
                  Specify target host and run the audit to generate consolidated hardening metrics.
                </p>
              </div>
            )}

            {/* Audit Specs Guidance */}
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Info className="text-amber-400 w-4 h-4" />
                Audit Specs
              </h2>
              <ul className="space-y-3.5 list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono font-semibold">
                    Host-level tests audit active services against known secure configuration baselines.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono font-semibold">
                    SSH parameters verify authentication protocols and disable legacy weak algorithms.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono font-semibold">
                    Firewall reviews verify inbound connection filtering and default drop rules.
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
