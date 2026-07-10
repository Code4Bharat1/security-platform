"use client";

import React, { useCallback, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  Shield, 
  Download, 
  Terminal, 
  Info, 
  Key, 
  FileText,
  AlertTriangle,
  Upload,
  RefreshCw,
  Code,
  Loader2
} from "lucide-react";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";

const apiBase = (process.env.NEXT_PUBLIC_PROD_API_URL || "").replace(/\/$/, "");
const useApiPrefix = !/\/api$/i.test(apiBase);
const ENDPOINT = `${apiBase}${useApiPrefix ? "/api" : ""}/code/code-obfuscation`;

const SEV_BADGE_CLASSES = {
  Low: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  Medium: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  High: "bg-red-500/10 text-red-400 border border-red-500/20",
  Unknown: "bg-zinc-800 text-zinc-400 border border-zinc-700",
};

const HEAT_CLASSES = {
  high: "bg-red-950/25 text-red-300 border-l-2 border-red-500",
  medium: "bg-orange-950/25 text-orange-300 border-l-2 border-orange-500",
  low: "bg-blue-950/25 text-blue-300 border-l-2 border-blue-500",
  none: "border-l-2 border-transparent",
};

function safeName(s) {
  return String(s || "file")
    .toLowerCase()
    .replace(/[^a-z0-9._-]/gi, "_")
    .slice(0, 60);
}

export default function CodeObfuscationChecker() {
  const [code, setCode] = useState("");
  const [files, setFiles] = useState([]); // [{name, content}]
  const [result, setResult] = useState(null); // {results: [...]}
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const protectedAction = useProtectedAction();

  const addFiles = async (fileList) => {
    const arr = Array.from(fileList || []);
    const reads = await Promise.all(
      arr.map(
        (f) =>
          new Promise((res, rej) => {
            const r = new FileReader();
            r.onload = () =>
              res({ name: f.name, content: String(r.result || "") });
            r.onerror = rej;
            r.readAsText(f);
          })
      )
    );
    setFiles((prev) => [...prev, ...reads]);
  };

  const handleFileChange = (e) => addFiles(e.target.files);

  const payload = useMemo(() => {
    const list = [...files];
    if (code.trim()) list.push({ name: "pasted-code.js", content: code });
    return list;
  }, [files, code]);

  const analyze = async () => {
    setErr("");
    if (!payload.length) {
      setErr("Provide code via paste or upload one or more files.");
      return;
    }
    setLoading(true);

    await protectedAction(async (userToken) => {
      try {
        const body =
          payload.length === 1 && !files.length
            ? { code: payload[0].content }
            : { files: payload };

        const res = await fetch(ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data?.error)
          throw new Error(data?.error || `HTTP ${res.status}`);
        setResult(data);
      } catch (e) {
        setErr(e.message || "Failed to analyze code");
      } finally {
        setLoading(false);
      }
    });
  };

  const clearAll = () => {
    setCode("");
    setFiles([]);
    setResult(null);
    setErr("");
  };

  const exportTxtAll = () => {
    if (!result?.results?.length) return;
    const sections = result.results.map((r) => {
      const topLines =
        r.highlights
          ?.filter((h) => h.level !== "none")
          .map(
            (h) => `  - Line ${h.line}: [${h.level}] ${h.reasons.join("; ")}`
          ) || [];
      const metrics = Object.entries(r.metrics || {})
        .map(([k, v]) => `  ${k}: ${v}`)
        .join("\n");

      const preview = [];
      (r.deobfuscationPreview?.base64Decoded || []).forEach((d) =>
        preview.push(`  base64@L${d.line}: ${d.original} -> ${d.decoded}`)
      );
      (r.deobfuscationPreview?.unicodeDecoded || []).forEach((d) =>
        preview.push(`  unicode@L${d.line}: ${d.original} -> ${d.decoded}`)
      );
      (r.deobfuscationPreview?.collapsedStrings || []).forEach((d) =>
        preview.push(`  concat@L${d.line}: ${d.original} -> ${d.collapsed}`)
      );

      return [
        `=== ${r.name} ===`,
        `Score: ${r.score}/100  Severity: ${r.severity}`,
        "",
        "Metrics:",
        metrics,
        "",
        "Top Highlights:",
        ...(topLines.length ? topLines : ["  (none)"]),
        "",
        "Issues:",
        ...(r.issues?.length ? r.issues.map((i) => `  - ${i}`) : ["  (none)"]),
        "",
        "Deobfuscation Preview:",
        ...(preview.length ? preview : ["  (none)"]),
        "",
      ].join("\n");
    });

    const blob = new Blob([sections.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `obfuscation_report_${Date.now()}.txt`;
    a.click();
    a.remove();
  };

  const exportPdfAll = () => {
    if (!result?.results?.length) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const M = 40;
    const newPage = () => {
      doc.addPage();
      y = 56;
      doc.setFont("helvetica", "normal");
    };
    let y = 56;

    result.results.forEach((r, idx) => {
      if (idx !== 0) newPage();
      
      // Header Banner
      doc.setFillColor(18, 18, 18);
      doc.rect(0, y - 56, doc.internal.pageSize.width, 80, "F");
      
      doc.setTextColor(59, 130, 246); // Blue Accent
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("NEXCORE SECURITY PLATFORM", M, y - 20);
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.text(`OBFUSCATION DETECTION REPORT - ${r.name.toUpperCase()}`, M, y);
      
      y += 50;

      doc.setTextColor(50, 50, 50);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Score: ${r.score}/100  Severity: ${r.severity}`, M, y);
      y += 18;

      autoTable(doc, {
        startY: y,
        head: [["Metric", "Value"]],
        body: Object.entries(r.metrics || {}).map(([k, v]) => [k, String(v)]),
        styles: { fontSize: 10 },
        headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
        margin: { left: M, right: M },
      });
      y = doc.lastAutoTable.finalY + 16;

      const highlightsTbl = (r.highlights || [])
        .filter((h) => h.level !== "none")
        .slice(0, 25)
        .map((h) => [String(h.line), h.level, h.reasons.join("; ")]);
      autoTable(doc, {
        startY: y,
        head: [["Line", "Level", "Reason"]],
        body: highlightsTbl.length ? highlightsTbl : [["—", "—", "(no highlights)"]],
        styles: { fontSize: 10 },
        headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
        margin: { left: M, right: M },
      });
      y = doc.lastAutoTable.finalY + 16;

      const prev = [];
      (r.deobfuscationPreview?.base64Decoded || [])
        .slice(0, 10)
        .forEach((d) =>
          prev.push([`L${d.line}`, "base64", `${d.original} -> ${d.decoded}`])
        );
      (r.deobfuscationPreview?.unicodeDecoded || [])
        .slice(0, 10)
        .forEach((d) =>
          prev.push([`L${d.line}`, "unicode", `${d.original} -> ${d.decoded}`])
        );
      (r.deobfuscationPreview?.collapsedStrings || [])
        .slice(0, 10)
        .forEach((d) =>
          prev.push([`L${d.line}`, "concat", `${d.original} -> ${d.collapsed}`])
        );
      autoTable(doc, {
        startY: y,
        head: [["Line", "Type", "Preview"]],
        body: prev.length ? prev : [["—", "—", "(none)"]],
        styles: { fontSize: 9 },
        headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
        margin: { left: M, right: M },
      });
      y = doc.lastAutoTable.finalY + 16;
    });

    doc.save(`obfuscation_report_${Date.now()}.pdf`);
  };

  return (
    <div 
      className="tool-detail-page min-h-screen"
      style={{
        '--hero-ambient-a': 'rgba(59, 130, 246, 0.08)',
        '--hero-ambient-b': 'rgba(6, 182, 212, 0.03)',
        '--glow-primary': '0 0 34px rgba(59, 130, 246, 0.16)',
        '--gold': '#3b82f6',
        '--gold-strong': '#60a5fa',
        '--gold-dark': '#1d4ed8',
        '--ring': 'rgba(59, 130, 246, 0.34)',
        '--surface-glow': 'rgba(59, 130, 246, 0.14)',
      }}
    >
      <style>{`
        .tool-detail-page .tool-detail-shell {
          padding-top: 3.5rem !important;
        }
        .tool-detail-page ::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.35) !important;
        }
        .tool-detail-page ::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.55) !important;
        }
        .tool-detail-page ::selection {
          background: rgba(59, 130, 246, 0.22) !important;
          color: #eff6ff !important;
        }
        .tool-detail-page :is(button, [role="button"]):is([class*="bg-blue-"], [class*="bg-sky-"]) {
          color: #000000 !important;
        }
        .tool-detail-page :is(button, [role="button"]):is([class*="bg-blue-"], [class*="bg-sky-"]) * {
          color: #000000 !important;
        }
      `}</style>

      <div className="tool-detail-shell">
        {/* Navigation & Header */}
        <div className="flex justify-end mb-8">
          <span className="rounded-full border border-blue-500/30 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-blue-400">
            Blue Team
          </span>
        </div>

        {/* Title Block */}
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl border border-blue-500/30 overflow-hidden shadow-lg flex-shrink-0 flex items-center justify-center">
            <FileText className="h-8 w-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              CODE OBFUSCATION <span className="text-blue-400">CHECKER</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Inspect application source code or upload files to score obfuscation intensity, highlight suspicious lines, and generate deobfuscated previews.
            </p>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* Paste Code Card */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-blue-500/10 transition-all duration-300">
              <h2 className="text-lg font-mono font-medium text-zinc-100 mb-6 flex items-center gap-2">
                <Code className="text-blue-400 w-5 h-5" />
                Paste Code
              </h2>
              <textarea
                className="w-full h-48 bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 text-xs focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 focus:shadow-[0_0_12px_rgba(59,130,246,0.08)] focus:outline-none transition-all placeholder:text-zinc-650 font-mono resize-none"
                placeholder="Paste code snippet here to analyze..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>

            {/* Files Section Card */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-blue-500/10 transition-all duration-300 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-mono font-medium text-zinc-100 flex items-center gap-2">
                    <Upload className="text-blue-400 w-5 h-5" />
                    Files
                  </h2>
                  <p className="text-xs font-mono text-zinc-400 mt-1">Upload one or more source files</p>
                </div>
                <button
                  onClick={clearAll}
                  className="px-5 py-2.5 bg-zinc-900/40 hover:bg-blue-500/5 text-zinc-300 hover:text-blue-400 border border-zinc-800/80 hover:border-blue-500/30 rounded-xl font-mono font-bold text-xs uppercase transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Clear
                </button>
              </div>

              <div>
                <label className="block">
                  <input
                    type="file"
                    accept=".js,.jsx,.ts,.tsx,.mjs,.cjs,.py,.rb,.php,.java,.go,.cs,.txt"
                    onChange={handleFileChange}
                    multiple
                    className="block w-full text-zinc-450 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border file:border-zinc-850 file:bg-zinc-900/60 file:text-zinc-300 file:font-mono file:text-xs file:font-bold hover:file:bg-blue-500/5 hover:file:text-blue-400 hover:file:border-blue-500/30 file:cursor-pointer cursor-pointer transition-all"
                  />
                </label>
              </div>

              <div className="text-xs text-zinc-450 font-mono space-y-1">
                {files.length > 0 ? (
                  <ul className="space-y-1 pl-0 list-none">
                    {files.map((f, i) => (
                      <li key={i} className="truncate flex items-center gap-2">
                        <span className="inline-block w-1 h-1 rounded-full bg-blue-500/60" />
                        {f.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="flex items-center gap-2">
                    <span className="inline-block w-1 h-1 rounded-full bg-zinc-500" />
                    No files added
                  </p>
                )}
              </div>
            </div>

            {/* Action buttons wrapper */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={analyze}
                disabled={loading}
                className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-black rounded-xl font-mono font-bold text-xs uppercase transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2 focus:ring-offset-black/20 disabled:opacity-40 disabled:pointer-events-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-black" />
                    Analyzing Code...
                  </>
                ) : (
                  <>
                    <Terminal className="h-4 w-4 text-black" />
                    Analyze Code
                  </>
                )}
              </button>

              <button
                onClick={exportPdfAll}
                disabled={!result?.results?.length}
                className="px-6 py-4 bg-zinc-900/40 hover:bg-blue-500/5 text-zinc-300 hover:text-blue-400 border border-zinc-800/80 hover:border-blue-500/30 rounded-xl font-mono font-bold text-xs uppercase py-3.5 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
              >
                <Download className="w-4 h-4" />
                Download PDF (ALL)
              </button>

              <button
                onClick={exportTxtAll}
                disabled={!result?.results?.length}
                className="px-6 py-4 bg-zinc-900/40 hover:bg-blue-500/5 text-zinc-300 hover:text-blue-400 border border-zinc-800/80 hover:border-blue-500/30 rounded-xl font-mono font-bold text-xs uppercase py-3.5 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
              >
                <FileText className="w-4 h-4" />
                Download TXT (ALL)
              </button>
            </div>

            {/* Error Message */}
            {err && (
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-950/10 text-red-400 text-xs font-mono flex items-start gap-2">
                <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                <span>Error: {err}</span>
              </div>
            )}

            {/* Results Mapping */}
            {result?.results?.map((fileRes, idx) => (
              <FileResult key={idx} {...fileRes} />
            ))}

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Guidance sidebar card */}
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Info className="text-blue-400 w-4 h-4" />
                Scanner Scope
              </h2>
              <ul className="space-y-3.5 list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Detects base64, hex, unicode, and escaped string obfuscations.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Scores entropy indices to flag compressed, packed, or encrypted payload structures.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Renders a heatmap highlighting suspicious evaluations and function calls.
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

function FileResult({
  name,
  code,
  severity = "Unknown",
  score = 0,
  metrics = {},
  highlights = [],
  issues = [],
  deobfuscationPreview = {},
}) {
  const lines = useMemo(() => (code || "").split(/\r?\n/), [code]);

  const lineMap = useMemo(() => {
    const m = new Map();
    highlights.forEach((h) => m.set(h.line, h));
    return m;
  }, [highlights]);

  const exportTxt = () => {
    const parts = [
      `=== ${name} ===`,
      `Score: ${score}/100  Severity: ${severity}`,
      "",
      "Metrics:",
      ...Object.entries(metrics).map(([k, v]) => `  ${k}: ${v}`),
      "",
      "Issues:",
      ...(issues.length ? issues.map((i) => `  - ${i}`) : ["  (none)"]),
      "",
      "Highlights (by line):",
      ...(highlights.length
        ? highlights.map(
            (h) => `  L${h.line} [${h.level}] ${h.reasons.join("; ")}`
          )
        : ["  (none)"]),
      "",
      "Deobfuscation Preview:",
      ...[
        ...(deobfuscationPreview.base64Decoded || []).map(
          (d) => `  base64 L${d.line}: ${d.original} -> ${d.decoded}`
        ),
        ...(deobfuscationPreview.unicodeDecoded || []).map(
          (d) => `  unicode L${d.line}: ${d.original} -> ${d.decoded}`
        ),
        ...(deobfuscationPreview.collapsedStrings || []).map(
          (d) => `  concat L${d.line}: ${d.original} -> ${d.collapsed}`
        ),
      ],
      "",
    ].join("\n");

    const blob = new Blob([parts], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `obfuscation_${safeName(name)}.txt`;
    a.click();
    a.remove();
  };

  const exportPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const M = 40;
    let y = 56;

    // Header Banner
    doc.setFillColor(18, 18, 18);
    doc.rect(0, 0, doc.internal.pageSize.width, 80, "F");
    
    doc.setTextColor(59, 130, 246);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("NEXCORE SECURITY PLATFORM", M, 35);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text(`OBFUSCATION REPORT - ${name.toUpperCase()}`, M, 55);
    y = 110;

    doc.setTextColor(50, 50, 50);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Score: ${score}/100  Severity: ${severity}`, M, y);
    y += 18;

    autoTable(doc, {
      startY: y,
      head: [["Metric", "Value"]],
      body: Object.entries(metrics).map(([k, v]) => [k, String(v)]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
      margin: { left: M, right: M },
    });
    y = doc.lastAutoTable.finalY + 16;

    const linesTbl = highlights
      .filter((h) => h.level !== "none")
      .slice(0, 30)
      .map((h) => [String(h.line), h.level, h.reasons.join("; ")]);
    autoTable(doc, {
      startY: y,
      head: [["Line", "Level", "Reason"]],
      body: linesTbl.length ? linesTbl : [["—", "—", "(no highlights)"]],
      styles: { fontSize: 10 },
      headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
      margin: { left: M, right: M },
    });

    doc.save(`obfuscation_${safeName(name)}.pdf`);
  };

  return (
    <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-blue-500/10 transition-all duration-300 space-y-6">
      
      {/* Result Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/40 pb-4">
        <div>
          <h2 className="text-xl font-mono font-semibold text-zinc-100 truncate max-w-[280px] sm:max-w-md">{name}</h2>
          <div className="text-xs font-mono text-zinc-400 mt-1 flex items-center gap-2">
            Score: <span className="font-semibold text-zinc-200">{score}</span>/100
            <span
              className={`px-2.5 py-0.5 rounded-full font-semibold text-[10px] uppercase tracking-wider ${
                SEV_BADGE_CLASSES[severity] || SEV_BADGE_CLASSES.Unknown
              }`}
            >
              {severity}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportPdf}
            className="px-4 py-2 bg-zinc-900/40 hover:bg-blue-500/5 text-zinc-300 hover:text-blue-400 border border-zinc-800/80 hover:border-blue-500/30 rounded-xl font-mono font-bold text-xs uppercase transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
          >
            PDF
          </button>
          <button
            onClick={exportTxt}
            className="px-4 py-2 bg-zinc-900/40 hover:bg-blue-500/5 text-zinc-300 hover:text-blue-400 border border-zinc-800/80 hover:border-blue-500/30 rounded-xl font-mono font-bold text-xs uppercase transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
          >
            TXT
          </button>
        </div>
      </div>

      {/* Grid Specs */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl font-mono text-xs">
          <h3 className="text-xs font-mono font-bold text-zinc-200 mb-3 flex items-center gap-1.5 border-b border-zinc-800/40 pb-2">
            <Terminal className="w-4 h-4 text-blue-400" />
            Metrics
          </h3>
          <ul className="text-xs space-y-2 pl-0 list-none">
            {Object.entries(metrics).map(([k, v]) => (
              <li key={k} className="flex justify-between gap-2 border-b border-zinc-800/20 last:border-b-0 py-1">
                <span className="text-zinc-400">{k}</span>
                <span className="font-mono text-zinc-200 font-semibold">{String(v)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl font-mono text-xs">
          <h3 className="text-xs font-mono font-bold text-zinc-200 mb-3 flex items-center gap-1.5 border-b border-zinc-800/40 pb-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            Issues
          </h3>
          {issues?.length ? (
            <ul className="space-y-2 list-none pl-0">
              {issues.map((i, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-300 leading-relaxed font-mono">{i}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-xs text-zinc-500 font-mono">No issues flagged.</div>
          )}
        </div>
      </div>

      {/* Heatmap */}
      <div>
        <h3 className="text-xs font-mono font-bold text-zinc-200 mb-3 flex items-center gap-1.5">
          <Terminal className="w-4 h-4 text-blue-400" />
          Obfuscation Heatmap
        </h3>
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl overflow-hidden">
          <div className="max-h-[420px] overflow-auto font-mono text-xs divide-y divide-zinc-800/40">
            {lines.map((ln, i) => {
              const n = i + 1;
              const h = lineMap.get(n);
              const cls = HEAT_CLASSES[h?.level || "none"];
              return (
                <div
                  key={i}
                  className={`grid grid-cols-[64px_1fr] px-3 py-2 ${cls}`}
                >
                  <div className="text-right pr-4 text-zinc-500 select-none border-r border-zinc-800/40 font-mono">
                    {n}
                  </div>
                  <div className="whitespace-pre overflow-x-auto pl-4 font-mono">
                    <span className="break-all text-zinc-200">{ln || " "}</span>
                    {h?.reasons?.length ? (
                      <div className="mt-1 text-[10px] text-orange-450 font-bold font-mono">
                        ⚠ {h.reasons.join("; ")}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Deobfuscation preview */}
      {(deobfuscationPreview?.base64Decoded?.length ||
        deobfuscationPreview?.unicodeDecoded?.length ||
        deobfuscationPreview?.collapsedStrings?.length) ? (
        <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl font-mono text-xs">
          <h3 className="text-xs font-mono font-bold text-zinc-200 mb-3 flex items-center gap-1.5 border-b border-zinc-800/40 pb-2">
            <Shield className="w-4 h-4 text-blue-400" />
            De-obfuscation Preview
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <PreviewList
              title="Base64 Decode"
              items={deobfuscationPreview.base64Decoded}
              kFrom="decoded"
            />
            <PreviewList
              title="Unicode Decode"
              items={deobfuscationPreview.unicodeDecoded}
              kFrom="decoded"
            />
            <PreviewList
              title="String Concats"
              items={deobfuscationPreview.collapsedStrings}
              kFrom="collapsed"
            />
          </div>
        </div>
      ) : null}

    </div>
  );
}

function PreviewList({ title, items = [], kFrom }) {
  if (!items.length) {
    return (
      <div className="font-mono text-xs">
        <div className="font-bold text-zinc-400 mb-2">{title}</div>
        <div className="text-zinc-500 font-mono">None</div>
      </div>
    );
  }
  return (
    <div className="font-mono text-xs">
      <div className="font-bold text-zinc-300 mb-2">{title}</div>
      <ul className="space-y-1.5 list-none pl-0">
        {items.slice(0, 8).map((d, i) => (
          <li key={i} className="truncate flex items-start gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-blue-500/60 mt-1.5 flex-shrink-0" />
            <span className="text-zinc-400">
              L{d.line}: <span className="text-blue-400 font-bold">{d[kFrom]}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
