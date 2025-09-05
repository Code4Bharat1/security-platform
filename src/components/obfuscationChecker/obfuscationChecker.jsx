"use client";

import { useCallback, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const apiBase = (process.env.NEXT_PUBLIC_PROD_API_URL || "").replace(/\/$/, "");
const useApiPrefix = !/\/api$/i.test(apiBase);
const ENDPOINT = `${apiBase}${useApiPrefix ? "/api" : ""}/code/code-obfuscation`;

const SEV_COLORS = {
  Low: "bg-emerald-500",
  Medium: "bg-amber-500",
  High: "bg-red-500",
  Unknown: "bg-gray-400",
};
const HEAT_COLORS = {
  high: "bg-red-50 ring-1 ring-red-200",
  medium: "bg-amber-50 ring-1 ring-amber-200",
  low: "bg-emerald-50 ring-1 ring-emerald-200",
  none: "",
};

function safeName(s) {
  return String(s || "file").toLowerCase().replace(/[^a-z0-9._-]/gi, "_").slice(0, 60);
}

export default function CodeObfuscationChecker() {
  const [code, setCode] = useState("");
  const [files, setFiles] = useState([]); // [{name, content}]
  const [result, setResult] = useState(null); // {results: [...]}
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const addFiles = async (fileList) => {
    const arr = Array.from(fileList || []);
    const reads = await Promise.all(
      arr.map(
        (f) =>
          new Promise((res, rej) => {
            const r = new FileReader();
            r.onload = () => res({ name: f.name, content: String(r.result || "") });
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
    try {
      const body =
        payload.length === 1 && !files.length
          ? { code: payload[0].content } // keep compatibility with single-code API
          : { files: payload };

      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.error) throw new Error(data?.error || `HTTP ${res.status}`);
      setResult(data);
    } catch (e) {
      setErr(e.message || "Failed to analyze code");
    } finally {
      setLoading(false);
    }
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
      const topLines = r.highlights
        ?.filter((h) => h.level !== "none")
        .map(
          (h) =>
            `  - Line ${h.line}: [${h.level}] ${h.reasons.join("; ")}`
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

    const blob = new Blob([sections.join("\n")], { type: "text/plain;charset=utf-8" });
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
      doc.addPage(); y = 56;
      doc.setFont("helvetica", "normal");
    };
    let y = 56;

    result.results.forEach((r, idx) => {
      if (idx !== 0) newPage();
      doc.setFont("helvetica", "bold"); doc.setFontSize(16);
      doc.text(`Obfuscation Report — ${r.name}`, M, y); y += 24;
      doc.setFont("helvetica", "normal"); doc.setFontSize(12);
      doc.text(`Score: ${r.score}/100  Severity: ${r.severity}`, M, y); y += 18;

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
      (r.deobfuscationPreview?.base64Decoded || []).slice(0, 10).forEach((d) =>
        prev.push([`L${d.line}`, "base64", `${d.original} -> ${d.decoded}`])
      );
      (r.deobfuscationPreview?.unicodeDecoded || []).slice(0, 10).forEach((d) =>
        prev.push([`L${d.line}`, "unicode", `${d.original} -> ${d.decoded}`])
      );
      (r.deobfuscationPreview?.collapsedStrings || []).slice(0, 10).forEach((d) =>
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
    <div className="p-6 max-w-6xl mx-auto">
      <img src="/tools/card-images/obfuscation.png" alt="verify" className="w-16 h-20 mb-4 mt-7" />
      <h1 className="text-3xl font-bold mb-2">Code Obfuscation Checker</h1>
      <p className="text-gray-600 mb-6">
        Paste code, or upload multiple files to scan. Heatmap highlights suspicious lines.
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-5">
        <textarea
          className="w-full h-48 p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
          placeholder="Paste your code here…"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <div className="rounded-lg border p-4 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-semibold">Files</div>
              <div className="text-sm text-gray-500">Upload one or more files</div>
            </div>
            <button
              className="text-sm text-emerald-700 border border-emerald-700 rounded-md px-3 py-1 hover:bg-emerald-50"
              onClick={clearAll}
            >
              Clear
            </button>
          </div>
          <input
            type="file"
            accept=".js,.jsx,.ts,.tsx,.mjs,.cjs,.py,.rb,.php,.java,.go,.cs,.txt"
            onChange={handleFileChange}
            multiple
            className="block mb-3"
          />
          <ul className="text-sm space-y-1 max-h-32 overflow-auto">
            {files.map((f, i) => (
              <li key={i} className="truncate">{f.name}</li>
            ))}
            {!files.length && <li className="text-gray-400">No files added</li>}
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={analyze}
          disabled={loading}
          className={`px-6 py-2 rounded-md text-white font-semibold ${
            loading ? "bg-gray-400" : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >
          {loading ? "Analyzing…" : "Analyze"}
        </button>

        <button
          onClick={exportPdfAll}
          disabled={!result?.results?.length}
          className="px-4 py-2 rounded-md border text-emerald-700 border-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
        >
          Download PDF (All)
        </button>
        <button
          onClick={exportTxtAll}
          disabled={!result?.results?.length}
          className="px-4 py-2 rounded-md border text-emerald-700 border-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
        >
          Download TXT (All)
        </button>
      </div>

      {err && (
        <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200 text-red-800">
          {err}
        </div>
      )}

      {/* Results */}
      {result?.results?.map((fileRes, idx) => (
        <FileResult key={idx} {...fileRes} />
      ))}
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
        ? highlights.map((h) => `  L${h.line} [${h.level}] ${h.reasons.join("; ")}`)
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
    <div className="border rounded-lg p-6 shadow-md bg-white space-y-4 mb-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{name}</h2>
          <div className="text-sm text-gray-600">
            Score: <span className="font-semibold">{score}</span>/100
            <span className={`ml-3 inline-block align-middle text-white px-2 py-0.5 rounded ${SEV_COLORS[severity] || SEV_COLORS.Unknown}`}>
              {severity}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportPdf}
            className="px-3 py-1.5 text-emerald-700 border border-emerald-700 rounded hover:bg-emerald-50"
          >
            PDF
          </button>
          <button
            onClick={exportTxt}
            className="px-3 py-1.5 text-emerald-700 border border-emerald-700 rounded hover:bg-emerald-50"
          >
            TXT
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-md bg-emerald-50/40 border p-4">
          <h3 className="font-semibold mb-2">Metrics</h3>
          <ul className="text-sm grid grid-cols-2 gap-1">
            {Object.entries(metrics).map(([k, v]) => (
              <li key={k} className="flex justify-between gap-2">
                <span className="text-gray-600">{k}</span>
                <span className="font-mono">{String(v)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-md bg-amber-50/40 border p-4">
          <h3 className="font-semibold mb-2">Issues</h3>
          {issues?.length ? (
            <ul className="list-disc list-inside text-sm space-y-1">
              {issues.map((i, idx) => (
                <li key={idx}>{i}</li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-500">None</div>
          )}
        </div>
      </div>

      {/* Heatmap */}
      <div>
        <h3 className="font-semibold mb-2">Obfuscation Heatmap</h3>
        <div className="border rounded overflow-hidden">
          <div className="max-h-[420px] overflow-auto font-mono text-sm">
            {lines.map((ln, i) => {
              const n = i + 1;
              const h = lineMap.get(n);
              const cls = HEAT_COLORS[h?.level || "none"];
              return (
                <div key={i} className={`grid grid-cols-[64px_1fr] px-2 py-1 ${cls}`}>
                  <div className="text-right pr-3 text-gray-400 select-none">{n}</div>
                  <div className="whitespace-pre overflow-x-auto">
                    <span className="break-all">{ln || " "}</span>
                    {h?.reasons?.length ? (
                      <div className="mt-1 text-xs text-gray-600">
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
        <div className="rounded-md bg-sky-50/60 border p-4">
          <h3 className="font-semibold mb-2">De-obfuscation Preview</h3>
          <div className="grid md:grid-cols-3 gap-3 text-sm">
            <PreviewList title="Base64" items={deobfuscationPreview.base64Decoded} kFrom="decoded" />
            <PreviewList title="Unicode" items={deobfuscationPreview.unicodeDecoded} kFrom="decoded" />
            <PreviewList title="Concats" items={deobfuscationPreview.collapsedStrings} kFrom="collapsed" />
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
        <div className="font-semibold">{title}</div>
        <div className="text-gray-500 text-sm">None</div>
      </div>
    );
  }
  return (
    <div>
      <div className="font-semibold">{title}</div>
      <ul className="text-sm space-y-1">
        {items.slice(0, 8).map((d, i) => (
          <li key={i} className="truncate">
            L{d.line}: <span className="font-mono">{d[kFrom]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
