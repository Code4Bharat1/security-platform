"use client";

import { useState } from "react";
import {
  FolderSearch,
  ChevronDown,
  ChevronUp,
  Upload,
  Info,
  ShieldCheck,
  ShieldAlert,
  XCircle,
  X,
  Loader2,
  FileText,
  Hash,
  Cpu,
  AlertTriangle,
  Download,
} from "lucide-react";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";
import { generateFileScanPDF } from "./generateFileScanPDF";

/* ── Sub-component: single file result card ─────────────────────────── */
function FileResult({ file }) {
  const [expanded, setExpanded] = useState(file.fileName === "test-handler.js");

  const statusConfig = {
    Clean:      { icon: ShieldCheck,  color: "text-emerald-400", border: "border-emerald-500/25", bg: "bg-emerald-950/20" },
    Suspicious: { icon: AlertTriangle, color: "text-orange-400",  border: "border-orange-500/25",  bg: "bg-orange-950/20"  },
    Malicious:  { icon: XCircle,      color: "text-rose-400",    border: "border-rose-500/25",    bg: "bg-rose-950/20"    },
    Unverified: { icon: Info,         color: "text-zinc-400",    border: "border-zinc-700/50",    bg: "bg-zinc-800/20"    },
  };
  const cfg = statusConfig[file.status] || { icon: ShieldCheck, color: "text-zinc-400", border: "border-zinc-700/50", bg: "bg-zinc-800/20" };
  const StatusIcon = cfg.icon;

  const scoreColor =
    file.threatScore > 70 ? "text-rose-400" :
    file.threatScore > 30 ? "text-orange-400" :
    "text-emerald-400";

  const isTestHandlerClean = file.fileName === "test-handler.js" && file.status === "Clean";
  const headerBg = isTestHandlerClean ? "bg-transparent" : cfg.bg;

  return (
    <div className={`border ${cfg.border} rounded-xl overflow-hidden transition-all duration-300`}>
      {/* Header row */}
      <div
        className={`flex items-center justify-between px-5 py-4 cursor-pointer ${headerBg} hover:brightness-110 transition-all`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <StatusIcon className={`h-4 w-4 flex-shrink-0 ${cfg.color}`} />
          <span className="text-sm font-mono text-zinc-200 truncate">{file.fileName}</span>
          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${cfg.border} ${cfg.color} flex-shrink-0`}>
            {file.status}
          </span>
        </div>
        <button className={`ml-3 flex-shrink-0 ${cfg.color} hover:brightness-125 transition-all`}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expanded detail grid */}
      {expanded && (
        <div className="px-5 py-4 bg-zinc-900/20 border-t border-zinc-800/50 space-y-4">
          {/* Core info tiles */}
          <div className="grid sm:grid-cols-2 gap-2.5">
            {[
              ["Size",          `${file.size} bytes`],
              ["Type",          file.type],
              ["Entropy",       file.entropy],
              ["Engines Flagged", `${file.engines} engines`],
              ["Malware Family", file.family || "N/A"],
            ].map(([label, val]) => (
              <div key={label} className="bg-zinc-900/40 rounded-xl p-3 border border-zinc-800/50">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-1">{label}</div>
                <div className="text-[11px] text-zinc-300 font-mono break-all">{val ?? "-"}</div>
              </div>
            ))}
            {/* Threat score tile */}
            <div className="bg-zinc-900/40 rounded-xl p-3 border border-zinc-800/50">
              <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-1">Threat Score</div>
              <div className={`text-sm font-mono font-bold ${scoreColor}`}>
                {file.threatScore} <span className="text-zinc-500 text-[11px] font-normal">/ 100</span>
              </div>
            </div>
          </div>

          {/* Hash block */}
          <div className="bg-zinc-900/40 rounded-xl p-4 border border-zinc-800/50 space-y-2">
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-2 flex items-center gap-1.5">
              <Hash className="h-3 w-3 text-emerald-400" /> File Hashes
            </div>
            {[
              ["MD5",    file.hashes?.md5],
              ["SHA-1",  file.hashes?.sha1],
              ["SHA-256", file.hashes?.sha256],
            ].map(([label, val]) => (
              <div key={label} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider w-16 flex-shrink-0">{label}</span>
                <code className="text-[11px] text-zinc-400 font-mono break-all">{val || "-"}</code>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────────────── */
export default function FileThreatScanner() {
  const [files, setFiles]     = useState([]);
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError]     = useState("");

  const protectedAction = useProtectedAction();

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
    setResults([]);
    setError("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length) {
      setFiles(dropped);
      setResults([]);
      setError("");
    }
  };

  const removeFile = (indexToRemove) => {
    setFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
    setResults([]);
    setError("");
  };

  const handleScan = async () => {
    if (files.length === 0) return;
    setScanning(true);
    setResults([]);
    setError("");

    const formData = new FormData();
    files.forEach((file) => formData.append("file", file));

    await protectedAction(async (userToken) => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_API_URL}/file/scan`, {
          method: "POST",
          body: formData,
          headers: { Authorization: `Bearer ${userToken}` },
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Scan failed");
        }
        const data = await res.json();
        setResults(data.files || []);
      } catch (err) {
        setError(err.message || "Failed to scan file.");
      } finally {
        setScanning(false);
      }
    });
  };

  const cleanCount      = results.filter((r) => r.status === "Clean").length;
  const suspiciousCount = results.filter((r) => r.status === "Suspicious").length;
  const maliciousCount  = results.filter((r) => r.status === "Malicious").length;

  return (
    <div
      className="tool-detail-page min-h-screen"
      style={{
        "--hero-ambient-a": "rgba(16, 185, 129, 0.08)",
        "--hero-ambient-b": "rgba(16, 185, 129, 0.03)",
        "--glow-primary":   "0 0 34px rgba(16, 185, 129, 0.16)",
        "--gold":           "#10b981",
        "--gold-strong":    "#34d399",
        "--gold-dark":      "#047857",
        "--ring":           "rgba(16, 185, 129, 0.34)",
        "--surface-glow":   "rgba(16, 185, 129, 0.14)",
      }}
    >
      <style>{`
        .tool-detail-page .tool-detail-shell {
          padding-top: 3.5rem !important;
        }
        .tool-detail-page ::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.35) !important;
        }
        .tool-detail-page ::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.55) !important;
        }
        .tool-detail-page ::selection {
          background: rgba(16, 185, 129, 0.22) !important;
          color: #e6fffa !important;
        }
        .tool-detail-page .tool-detail-panel,
        .tool-detail-page .bg-gray-900,
        .tool-detail-page .bg-zinc-900\/70,
        .tool-detail-page .bg-black\/60,
        .tool-detail-page .bg-gray-800,
        .tool-detail-page .bg-black\/30 {
          background:
            radial-gradient(circle at center, rgba(16, 185, 129, 0.04), transparent 55%),
            linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)) !important;
          box-shadow:
            inset 0 0 0 1px rgba(255,255,255,0.01),
            0 0 40px rgba(16, 185, 129, 0.04) !important;
          border-color: rgba(16, 185, 129, 0.12) !important;
        }
        .drop-zone-active {
          border-color: rgba(16, 185, 129, 0.5) !important;
          background: rgba(16, 185, 129, 0.04) !important;
        }
      `}</style>

      <div className="tool-detail-shell">
        {/* Top Badge */}
        <div className="flex justify-end mb-8">
          <span className="rounded-full border border-emerald-500/30 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-emerald-400">
            Green Team
          </span>
        </div>

        {/* Title Block */}
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl border border-emerald-500/30 overflow-hidden shadow-lg flex-shrink-0 flex items-center justify-center">
            <FolderSearch className="h-8 w-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              FILE THREAT <span className="text-emerald-400">SCANNER</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Upload files to scan for malware, suspicious entropy, and known threat signatures across multiple detection engines.
            </p>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">

          {/* ── Left Column ── */}
          <div className="space-y-6">

            {/* Upload Card */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-emerald-500/10 transition-all duration-300">
              <h2 className="text-lg font-mono font-medium text-zinc-100 mb-6 flex items-center gap-2">
                <Upload className="h-5 w-5 text-emerald-400" />
                File Upload
              </h2>

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("drop-zone-active"); }}
                onDragLeave={(e) => e.currentTarget.classList.remove("drop-zone-active")}
                onDrop={(e) => { e.currentTarget.classList.remove("drop-zone-active"); handleDrop(e); }}
                className="border-2 border-dashed border-zinc-700/60 rounded-xl p-8 text-center transition-all duration-200 mb-5"
              >
                <FolderSearch className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-400 text-sm font-mono mb-1">Drag & drop files here</p>
                <p className="text-zinc-600 text-xs font-mono mb-4">or click below to browse</p>
                <label
                  htmlFor="fileInput"
                  className="inline-flex items-center gap-2 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/50 rounded-xl font-mono font-bold text-xs uppercase px-5 py-2.5 transition-all duration-300 cursor-pointer hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                >
                  <FileText className="h-4 w-4" /> Choose Files
                </label>
                <input
                  type="file"
                  id="fileInput"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Selected files list */}
              {files.length > 0 && (
                <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-4 mb-5 max-h-40 overflow-y-auto">
                  <p className="text-[10px] uppercase tracking-widest font-mono text-zinc-500 mb-2">
                    Selected — {files.length} file{files.length > 1 ? "s" : ""}
                  </p>
                  <ul className="space-y-1.5">
                    {files.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 group">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/60 flex-shrink-0" />
                        <span className="text-xs text-zinc-300 font-mono truncate flex-1">{f.name}</span>
                        <span className="text-[10px] text-zinc-600 flex-shrink-0">{(f.size / 1024).toFixed(1)} KB</span>
                        <button
                          onClick={() => removeFile(i)}
                          title="Remove file"
                          className="ml-1 flex-shrink-0 text-zinc-600 hover:text-rose-400 transition-colors duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
                        >
                          <X size={13} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Scan button */}
              <button
                onClick={handleScan}
                disabled={scanning || files.length === 0}
                className="w-full bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/50 rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-2 focus:ring-offset-black/20 disabled:opacity-40 disabled:pointer-events-none"
              >
                {scanning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Scanning Files…
                  </>
                ) : (
                  <>
                    <FolderSearch className="h-4 w-4" />
                    Start Threat Scan
                  </>
                )}
              </button>
            </div>

            {/* Loading state */}
            {scanning && (
              <div className="flex flex-col items-center justify-center p-10 bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.15)] animate-pulse">
                <Loader2 className="h-8 w-8 text-emerald-400 animate-spin mb-4" />
                <p className="text-emerald-400 font-mono font-bold text-xs uppercase tracking-widest text-center">
                  Scanning {files.length} file{files.length > 1 ? "s" : ""}…
                </p>
                <span className="text-[10px] text-zinc-500 font-mono mt-2 text-center">
                  Checking entropy, hashes, and threat signatures
                </span>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="rounded-xl border border-rose-500/25 bg-rose-500/5 p-4">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-rose-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-rose-400 mb-1">Scan Error</div>
                    <div className="text-xs text-rose-300">{error}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            {results.length > 0 && !scanning && (
              <div className="space-y-4">
                {/* Summary stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Clean",      count: cleanCount,      color: "text-emerald-400", border: "border-emerald-500/20" },
                    { label: "Suspicious", count: suspiciousCount, color: "text-orange-400",  border: "border-orange-500/20"  },
                    { label: "Malicious",  count: maliciousCount,  color: "text-rose-400",    border: "border-rose-500/20"    },
                  ].map(({ label, count, color, border }) => (
                    <div key={label} className={`bg-zinc-950/20 backdrop-blur-md border ${border} rounded-xl p-4 text-center`}>
                      <div className={`text-2xl font-mono font-bold ${color}`}>{count}</div>
                      <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mt-1">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Per-file result cards */}
                <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.15)] space-y-3 hover:border-emerald-500/10 transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800/50 pb-4 mb-2">
                    <h3 className="text-sm font-mono font-semibold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-emerald-400" />
                      Scan Results — {results.length} file{results.length > 1 ? "s" : ""}
                    </h3>
                    <button
                      onClick={() => generateFileScanPDF(results)}
                      className="bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/50 px-3.5 py-1.5 rounded-xl transition-all duration-300 font-mono font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] focus:outline-none self-start sm:self-auto"
                    >
                      <Download size={14} /> PDF Report
                    </button>
                  </div>
                  {results.map((file, idx) => (
                    <FileResult key={idx} file={file} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right Column: Sidebar ── */}
          <div className="space-y-6">
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Info className="h-4 w-4 text-emerald-400" />
                Scanner Capabilities
              </h4>
              <ul className="space-y-3.5 list-none pl-0">
                {[
                  "Computes MD5, SHA-1, and SHA-256 hashes for each uploaded file.",
                  "Calculates file entropy to detect packed, encrypted, or obfuscated payloads.",
                  "Matches file hashes against known malware signature databases.",
                  "Reports which detection engines flagged the file and the malware family name.",
                  "Assigns a Threat Score from 0–100 based on cumulative risk signals.",
                  "Supports bulk uploads — scan multiple files simultaneously in one request.",
                  "File type detection is performed independently of the file extension.",
                  "Results are displayed inline — no data is retained after your session ends.",
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/60 mt-1.5 flex-shrink-0" />
                    <span className="text-xs text-zinc-400 leading-relaxed">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Status legend */}
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Status Legend
              </h4>
              <div className="space-y-2.5">
                {[
                  { label: "Clean",      cls: "text-emerald-400 border-emerald-500/25", desc: "No threats detected." },
                  { label: "Suspicious", cls: "text-orange-400 border-orange-500/25",   desc: "Anomalies or risk signals found." },
                  { label: "Malicious",  cls: "text-rose-400 border-rose-500/25",       desc: "Active malware confirmed." },
                ].map(({ label, cls, desc }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${cls}`}>
                      {label}
                    </span>
                    <span className="text-xs text-zinc-500">{desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Threat score guide */}
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-emerald-400" />
                Threat Score Guide
              </h4>
              <div className="space-y-2">
                {[
                  { range: "0 – 30",  label: "Low Risk",    color: "text-emerald-400" },
                  { range: "31 – 70", label: "Medium Risk", color: "text-orange-400"  },
                  { range: "71 – 100",label: "High Risk",   color: "text-rose-400"    },
                ].map(({ range, label, color }) => (
                  <div key={range} className="flex items-center justify-between py-1.5 border-b border-zinc-800/40 last:border-0">
                    <span className={`text-[11px] font-mono font-bold ${color}`}>{range}</span>
                    <span className="text-[11px] text-zinc-500 font-mono">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
