"use client";

import { useCallback, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";

const apiBase = (process.env.NEXT_PUBLIC_PROD_API_URL || "").replace(/\/$/, "");
const useApiPrefix = !/\/api$/i.test(apiBase);
const ENDPOINT = `${apiBase}${
  useApiPrefix ? "/api" : ""
}/code/code-obfuscation`;

const SEV_COLORS = {
  Low: "bg-emerald-500",
  Medium: "bg-amber-500",
  High: "bg-red-500",
  Unknown: "bg-gray-400",
};
const HEAT_COLORS = {
  high: "bg-red-900/30 ring-1 ring-red-500/30",
  medium: "bg-amber-900/30 ring-1 ring-amber-500/30",
  low: "bg-emerald-900/30 ring-1 ring-emerald-500/30",
  none: "",
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
            ? { code: payload[0].content } // keep compatibility with single-code API
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
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(`Obfuscation Report — ${r.name}`, M, y);
      y += 24;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text(`Score: ${r.score}/100  Severity: ${r.severity}`, M, y);
      y += 18;

      autoTable(doc, {
        startY: y,
        head: [["Metric", "Value"]],
        body: Object.entries(r.metrics || {}).map(([k, v]) => [k, String(v)]),
        styles: { fontSize: 10 },
        headStyles: { fillColor: [16, 185, 129] },
        margin: { left: M, right: M },
      });
      y = doc.lastAutoTable.finalY + 16;

      const lines = (r.highlights || [])
        .filter((h) => h.level !== "none")
        .slice(0, 25)
        .map((h) => [String(h.line), h.level, h.reasons.join("; ")]);
      autoTable(doc, {
        startY: y,
        head: [["Line", "Level", "Reason"]],
        body: lines.length ? lines : [["—", "—", "(no highlights)"]],
        styles: { fontSize: 10 },
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
        margin: { left: M, right: M },
      });
      y = doc.lastAutoTable.finalY + 16;
    });

    doc.save(`obfuscation_report_${Date.now()}.pdf`);
  };

  return (
    <div className="tool-detail-page">
      <div className="tool-detail-shell">
        {/* Header */}
        <div className="tool-detail-hero">
          <div className="tool-detail-icon">
            <img
              src="/BlueTeam/Obfuscation Detector.png"
              alt="Obfuscation Icon"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="tool-detail-copy">
            <h1>Code Obfuscation Checker</h1>
            <p>
              Paste code, or upload multiple files to scan. Heatmap highlights
              suspicious lines.
            </p>
          </div>
        </div>

        {/* Code Input Section */}
        <div className="bg-gray-800/50 rounded-2xl p-6 mb-6 border border-blue-600">
          <h2 className="text-blue-400 text-lg font-semibold mb-4">
            Paste Your Code
          </h2>
          <textarea
            className="w-full h-48 p-4 bg-gray-700/50 border border-blue-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-white placeholder-gray-400"
            placeholder="gsvdahcdswdmjsnxzcvb mjanhbvcxb mjkvcbcmjvnv ncgbmn"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>

        {/* Files Section */}
        <div className="bg-gray-800/50 rounded-2xl p-6 mb-6 border border-blue-600">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-white text-lg font-semibold">Files</h2>
              <p className="text-gray-400 text-sm">Upload one or more files</p>
            </div>
            <button
              onClick={clearAll}
              className="px-6 py-2 border border-blue-500 rounded-full text-white hover:bg-gray-700/50 transition-colors"
            >
              Clear
            </button>
          </div>

          <div className="mb-4">
            <label className="block">
              <input
                type="file"
                accept=".js,.jsx,.ts,.tsx,.mjs,.cjs,.py,.rb,.php,.java,.go,.cs,.txt"
                onChange={handleFileChange}
                multiple
                className="block w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer cursor-pointer"
              />
            </label>
          </div>

          <div className="text-sm text-gray-400">
            {files.length > 0 ? (
              <ul className="space-y-1">
                {files.map((f, i) => (
                  <li key={i} className="truncate">
                    • {f.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p>• No files added</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={analyze}
            disabled={loading}
            className={`px-8 py-3 rounded-full font-semibold transition-colors ${
              loading
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {loading ? "ANALYZING..." : "ANALYZE"}
          </button>

          <button
            onClick={exportPdfAll}
            disabled={!result?.results?.length}
            className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Download PDF (ALL)
          </button>

          <button
            onClick={exportTxtAll}
            disabled={!result?.results?.length}
            className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Download TXT (ALL)
          </button>
        </div>

        {/* Error Message */}
        {err && (
          <div className="mb-6 p-4 rounded-lg bg-red-900/30 border border-red-500/30 text-red-400">
            {err}
          </div>
        )}

        {/* Results */}
        {result?.results?.map((fileRes, idx) => (
          <FileResult key={idx} {...fileRes} />
        ))}
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

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`Obfuscation Report — ${name}`, M, y);
    y += 24;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Score: ${score}/100  Severity: ${severity}`, M, y);
    y += 18;

    autoTable(doc, {
      startY: y,
      head: [["Metric", "Value"]],
      body: Object.entries(metrics).map(([k, v]) => [k, String(v)]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [16, 185, 129] },
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
      margin: { left: M, right: M },
    });

    doc.save(`obfuscation_${safeName(name)}.pdf`);
  };

  return (
    <div className="bg-gray-800/50 rounded-2xl p-6 mb-8">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">{name}</h2>
          <div className="text-sm text-gray-400 mt-1">
            Score: <span className="font-semibold text-white">{score}</span>/100
            <span
              className={`ml-3 inline-block align-middle text-white px-3 py-1 rounded-full text-sm ${
                SEV_COLORS[severity] || SEV_COLORS.Unknown
              }`}
            >
              {severity}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportPdf}
            className="px-4 py-2 text-blue-400 border border-blue-400 rounded-full hover:bg-blue-400/10 transition-colors"
          >
            PDF
          </button>
          <button
            onClick={exportTxt}
            className="px-4 py-2 text-blue-400 border border-blue-400 rounded-full hover:bg-blue-400/10 transition-colors"
          >
            TXT
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-700/50 rounded-lg border border-blue-600 p-4">
          <h3 className="font-semibold mb-3 text-white">Metrics</h3>
          <ul className="text-sm grid grid-cols-2 gap-2">
            {Object.entries(metrics).map(([k, v]) => (
              <li key={k} className="flex justify-between gap-2">
                <span className="text-gray-400">{k}</span>
                <span className="font-mono text-white">{String(v)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gray-700/50 rounded-lg border border-blue-600 p-4">
          <h3 className="font-semibold mb-3 text-white">Issues</h3>
          {issues?.length ? (
            <ul className="list-disc list-inside text-sm space-y-1">
              {issues.map((i, idx) => (
                <li key={idx} className="text-gray-300">
                  {i}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-400">None</div>
          )}
        </div>
      </div>

      {/* Heatmap */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3 text-white">Obfuscation Heatmap</h3>
        <div className="bg-gray-900/50 border border-blue-600 rounded-lg overflow-hidden">
          <div className="max-h-[420px] overflow-auto font-mono text-sm">
            {lines.map((ln, i) => {
              const n = i + 1;
              const h = lineMap.get(n);
              const cls = HEAT_COLORS[h?.level || "none"];
              return (
                <div
                  key={i}
                  className={`grid grid-cols-[64px_1fr] px-3 py-2 ${cls} border-b border-blue-700/50 last:border-b-0`}
                >
                  <div className="text-right pr-3 text-gray-500 select-none">
                    {n}
                  </div>
                  <div className="whitespace-pre overflow-x-auto">
                    <span className="break-all text-gray-300">{ln || " "}</span>
                    {h?.reasons?.length ? (
                      <div className="mt-1 text-xs text-yellow-400">
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
        deobfuscationPreview?.collapsedStrings?.length) && (
        <div className="bg-gray-700/50 rounded-lg border border-blue-600 p-4">
          <h3 className="font-semibold mb-3 text-white">
            De-obfuscation Preview
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <PreviewList
              title="Base64"
              items={deobfuscationPreview.base64Decoded}
              kFrom="decoded"
            />
            <PreviewList
              title="Unicode"
              items={deobfuscationPreview.unicodeDecoded}
              kFrom="decoded"
            />
            <PreviewList
              title="Concats"
              items={deobfuscationPreview.collapsedStrings}
              kFrom="collapsed"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function PreviewList({ title, items = [], kFrom }) {
  if (!items.length) {
    return (
      <div>
        <div className="font-semibold text-white mb-2">{title}</div>
        <div className="text-gray-400 text-sm">None</div>
      </div>
    );
  }
  return (
    <div>
      <div className="font-semibold text-white mb-2">{title}</div>
      <ul className="text-sm space-y-1">
        {items.slice(0, 8).map((d, i) => (
          <li key={i} className="truncate text-gray-300">
            L{d.line}:{" "}
            <span className="font-mono text-blue-400">{d[kFrom]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
