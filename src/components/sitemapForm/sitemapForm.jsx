"use client";
import { useState } from "react";
import { Loader2, Search as SearchIcon, FileText, Eye, X, Award, Info } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";

const classNames = (...xs) => xs.filter(Boolean).join(" ");

export default function SitemapForm() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [sitemapData, setSitemapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [depth, setDepth] = useState(3);
  const protectedAction = useProtectedAction();

  // XML preview modal
  const [showXml, setShowXml] = useState(false);

  const validateUrl = (u) => {
    const pattern = new RegExp(
      "^(https?:\\/\\/)?(([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}(:\\d+)?(\\/.*)?$",
      "i"
    );
    return !!pattern.test(u);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateUrl(url)) {
      setError("Please enter a valid website URL.");
      return;
    }

    const finalDepth = parseInt(depth, 10);
    if (isNaN(finalDepth) || finalDepth < 1 || finalDepth > 5) {
      setError("Please enter a crawl depth between 1 and 5.");
      return;
    }

    setError("");
    setLoading(true);
    setSitemapData(null);

    await protectedAction(async (userToken) => {
      try {
        const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/sitemap/sitemap-scanner`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userToken}`,
            },
            body: JSON.stringify({ url: normalizedUrl, depth }),
          }
        );

        const result = await response.json();

        if (result.error) {
          setError(result.message || "Failed to generate sitemap.");
          setLoading(false);
          return;
        }

        setSitemapData(result);
      } catch (err) {
        console.error("Error:", err);
        setError("Something went wrong with the request.");
      } finally {
        setLoading(false);
      }
    });
  };

  // ----------- Downloads -----------
  const downloadXML = () => {
    if (!sitemapData?.xml) return;
    const blob = new Blob([sitemapData.xml], { type: "application/xml" });
    triggerDownload(blob, `sitemap-${extractHostname(url)}.xml`);
  };

  const downloadTXT = () => {
    const content = (sitemapData?.urls || []).join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    triggerDownload(blob, `sitemap-${extractHostname(url)}.txt`);
  };

  const downloadPDF = async () => {
    if (!sitemapData) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    // Header Banner
    doc.setFillColor(18, 18, 18);
    doc.rect(0, 0, doc.internal.pageSize.width, 40, "F");

    doc.setTextColor(16, 185, 129); // Emerald Green
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(20);
    doc.text("NEXCORE SECURITY PLATFORM", 15, 20);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text("WEBSITE SITEMAP AUDIT REPORT", 15, 30);

    // Scan Meta Info
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    doc.text(`Domain: ${extractHostname(url)}`, 15, 52);
    doc.text(`Crawl Depth: ${sitemapData.summary?.crawlDepth ?? depth}`, 15, 62);
    doc.text(`Date: ${new Date().toLocaleString()}`, 15, 72);

    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.5);
    doc.line(15, 80, doc.internal.pageSize.width - 15, 80);

    // Summary Block
    doc.setFontSize(12);
    doc.text("Executive Summary", 15, 95);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);

    const s = sitemapData.summary || {};
    const summaryText = `This crawl evaluated the host domain '${extractHostname(url)}' up to depth ${s.crawlDepth ?? depth}. Total pages mapped: ${s.totalPages ?? sitemapData.pagesFound ?? 0}. Redirections found: ${s.redirected ?? 0}. Broken URLs found: ${s.broken ?? 0}.`;
    const splitSummary = doc.splitTextToSize(summaryText, doc.internal.pageSize.width - 30);
    doc.text(splitSummary, 15, 108);

    // Table
    const rows = (sitemapData.urlDetails || []).map((u) => [
      trim(u.url, 120),
      u.status,
      u.statusText || "",
      u.redirectHops || 0,
      u.finalUrl && u.finalUrl !== u.url ? trim(u.finalUrl, 120) : "-",
    ]);

    autoTable(doc, {
      startY: 135,
      head: [["URL", "Status", "Text", "Hops", "Final URL"]],
      body: rows,
      styles: { fontSize: 8, cellWidth: "wrap" },
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
      columnStyles: {
        0: { cellWidth: 220 },
        4: { cellWidth: 220 },
      },
    });

    doc.save(`sitemap-${extractHostname(url)}.pdf`);
  };

  return (
    <div className="tool-detail-page min-h-screen" style={{
      '--hero-ambient-a': 'rgba(16, 185, 129, 0.08)',
      '--hero-ambient-b': 'rgba(16, 185, 129, 0.03)',
      '--glow-primary': '0 0 34px rgba(16, 185, 129, 0.16)',
      '--gold': '#10b981',
      '--gold-strong': '#34d399',
      '--gold-dark': '#047857',
      '--ring': 'rgba(16, 185, 129, 0.34)',
      '--surface-glow': 'rgba(16, 185, 129, 0.14)',
    }}>
      <style>{`
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
        .tool-detail-page .bg-gray-800\/60,
        .tool-detail-page .bg-black\/50,
        .tool-detail-page .bg-black\/30,
        .tool-detail-page .bg-gray-50,
        .tool-detail-page .bg-white {
          background:
            radial-gradient(circle at center, rgba(16, 185, 129, 0.04), transparent 55%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.01)) !important;
          box-shadow:
            inset 0 0 0 1px rgba(255, 255, 255, 0.01),
            0 0 40px rgba(16, 185, 129, 0.04) !important;
          border-color: rgba(16, 185, 129, 0.12) !important;
        }
      `}</style>
      <div className="tool-detail-shell">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-4 mb-8">
          <span className="rounded-full border border-emerald-500/30 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-emerald-400">
            Green Team
          </span>
        </div>

        {/* Title Section */}
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl border border-emerald-500/30 overflow-hidden shadow-lg flex-shrink-0 flex items-center justify-center">
            <FileText className="h-8 w-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              SITEMAP <span className="text-emerald-400">GENERATOR</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Generate search-engine-ready XML, TXT, and PDF sitemaps to optimize website indexation and discover crawl anomalies.
            </p>
          </div>
        </div>

        {/* 2-Column Grid Layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Left Column: Input Form & Progress */}
          <div className="space-y-6">
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-emerald-500/10 transition-all duration-300">
              <h2 className="text-lg font-mono font-medium text-zinc-100 mb-6 flex items-center gap-2">
                <SearchIcon className="h-5 w-5 text-emerald-400" />
                Generator Settings
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-mono text-zinc-400 mb-2 font-semibold">Target Website URL</label>
                  <input
                    type="url"
                    id="websiteUrl"
                    name="websiteUrl"
                    value={url}
                    onChange={(e) => setUrl(e.target.value.trim())}
                    placeholder="https://example.com"
                    required
                    className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3 text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 focus:shadow-[0_0_12px_rgba(16,185,129,0.08)] focus:outline-none transition-all placeholder:text-zinc-600 font-mono"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="depth" className="block text-xs uppercase tracking-widest font-mono text-zinc-400 mb-2 font-semibold">Crawl Depth (1–5)</label>
                  <input
                    type="number"
                    id="depth"
                    name="depth"
                    min="1"
                    max="5"
                    value={isNaN(depth) ? "" : depth}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setDepth(isNaN(val) ? "" : val);
                    }}
                    className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3 text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 focus:shadow-[0_0_12px_rgba(16,185,129,0.08)] focus:outline-none transition-all font-mono"
                    disabled={loading}
                  />
                </div>

                {error && <p className="text-rose-500 text-xs font-mono font-semibold">{error}</p>}

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/50 rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-2 focus:ring-offset-black/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none disabled:transform-none disabled:shadow-none"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                        Generating Sitemap...
                      </>
                    ) : (
                      <>
                        <SearchIcon className="h-4 w-4" />
                        Generate Sitemap
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {loading && (
              <div className="flex flex-col items-center justify-center p-10 bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.15)] animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-400 mb-4" />
                <p className="text-emerald-400 font-mono font-bold text-xs uppercase tracking-widest text-center">
                  Analyzing Target Routes. Please Wait...
                </p>
                <span className="text-[10px] text-zinc-500 font-mono mt-2">
                  Building mapping structure and scanning links
                </span>
              </div>
            )}
          </div>          {/* Right Column: Specs & Guide */}
          <div className="space-y-6">
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Info className="h-4 w-4 text-emerald-400" />
                Sitemap Specs & Guidance
              </h4>
              <ul className="space-y-3.5 text-xs text-zinc-400 list-none pl-0 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/60 mt-1.5 flex-shrink-0" />
                  <span>Crawl depth limits nested page scan branches to control scope.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/60 mt-1.5 flex-shrink-0" />
                  <span>Generates standardized XML mapping in accordance with sitemaps.org guidelines.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/60 mt-1.5 flex-shrink-0" />
                  <span>Highlights dead ends and redirected endpoints with color-coded HTTP status tags.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/60 mt-1.5 flex-shrink-0" />
                  <span>Supports text-list format outputs and printable PDF audit summary.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Results Block */}
        {!loading && sitemapData && (
          <div className="mt-8 bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_12px_40px_rgb(0,0,0,0.2)] space-y-6 hover:border-emerald-500/10 transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/50 pb-4">
              <h2 className="text-xl font-mono font-bold text-zinc-100 flex items-center gap-2">
                <Award className="h-6 w-6 text-emerald-400" />
                Sitemap Report
              </h2>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/5 border border-emerald-500/25 px-3 py-1 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.05)]">
                Target: {extractHostname(url)}
              </span>
            </div>

            {/* Warning if broken urls */}
            {(sitemapData.summary?.broken ?? 0) > 0 && (
              <div className="p-4 rounded-xl border border-amber-500/25 bg-amber-500/5 text-amber-300 text-xs leading-relaxed font-semibold flex items-center gap-3">
                <span className="text-base">⚠️</span>
                <span>Some URLs in sitemap are <b>4xx/5xx</b>. Please review broken links below.</span>
              </div>
            )}

            {/* Summary Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Stat
                label="Total Pages"
                value={sitemapData.summary?.totalPages ?? sitemapData.pagesFound ?? 0}
              />
              <Stat
                label="Crawl Depth"
                value={sitemapData.summary?.crawlDepth ?? depth}
              />
              <Stat
                label="Redirected URLs"
                value={sitemapData.summary?.redirected ?? 0}
                tone="amber"
              />
              <Stat
                label="Broken URLs"
                value={sitemapData.summary?.broken ?? 0}
                tone="red"
              />
              <Stat
                label="Average URL Length"
                value={`${sitemapData.summary?.avgUrlLength ?? 0} chars`}
              />
            </div>

            {/* URL list */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-mono font-bold text-zinc-300">
                <span>URL List</span>
                <span className="text-zinc-500">
                  {sitemapData.pagesFound ?? 0} pages mapped
                </span>
              </div>
              
              <div className="max-h-80 overflow-y-auto bg-zinc-950/40 p-4.5 border border-zinc-800/80 rounded-xl font-mono custom-scrollbar text-xs">
                {sitemapData.urlDetails?.length ? (
                  <ul className="space-y-2">
                    {sitemapData.urlDetails.map((u, i) => {
                      const badgeStyle =
                        u.status >= 400 || u.status === "ERROR"
                          ? "border-rose-500/20 bg-rose-500/5 text-rose-400"
                          : u.redirectHops > 0
                          ? "border-amber-500/20 bg-amber-500/5 text-amber-400"
                          : "border-emerald-500/20 bg-emerald-500/5 text-emerald-400";
                      return (
                        <li key={i} className="leading-relaxed">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={classNames("text-[10px] px-2 py-0.5 rounded-md border font-semibold", badgeStyle)}>
                              {u.status} {u.statusText || ""}
                            </span>
                            <a
                              href={u.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-400 hover:text-emerald-300 hover:underline transition-all truncate select-all"
                              title={u.url}
                            >
                              {u.url}
                            </a>
                          </div>
                          {u.finalUrl && u.finalUrl !== u.url && (
                            <div className="text-[10px] text-zinc-500 ml-2 mt-1 flex items-center gap-1.5">
                              <span>→</span>
                              <span className="text-zinc-400 truncate max-w-md" title={u.finalUrl}>{u.finalUrl}</span>
                              <span className="text-zinc-650 font-semibold">(Hops: {u.redirectHops})</span>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-zinc-500 italic">No URLs found</p>
                )}
              </div>
            </div>

            {/* Actions Panel */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <button
                onClick={() => setShowXml(true)}
                className="bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 py-3.5 px-4 rounded-xl transition-all duration-300 font-mono font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-2 focus:ring-offset-black/20"
              >
                <Eye className="h-4 w-4 text-emerald-400" />
                Preview XML
              </button>
              <button
                onClick={downloadXML}
                className="bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/50 py-3.5 px-4 rounded-xl transition-all duration-300 font-mono font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-2 focus:ring-offset-black/20"
              >
                <FileText className="h-4 w-4 text-emerald-400" />
                Download XML
              </button>
              <button
                onClick={downloadTXT}
                className="bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/50 py-3.5 px-4 rounded-xl transition-all duration-300 font-mono font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-2 focus:ring-offset-black/20"
              >
                <FileText className="h-4 w-4 text-emerald-400" />
                Download TXT
              </button>
              <button
                onClick={downloadPDF}
                className="bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/50 py-3.5 px-4 rounded-xl transition-all duration-300 font-mono font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-2 focus:ring-offset-black/20"
              >
                <FileText className="h-4 w-4 text-emerald-400" />
                Download PDF
              </button>
            </div>
          </div>
        )}
      </div>

      {/* XML Modal */}
      {showXml && sitemapData?.xml && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-4xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <div className="font-mono font-bold text-sm text-zinc-100">Sitemap XML Preview</div>
              <button
                onClick={() => setShowXml(false)}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all focus:outline-none"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <pre className="p-5 max-h-[60vh] overflow-auto text-xs bg-zinc-950 text-emerald-400/90 font-mono leading-relaxed custom-scrollbar border-b border-zinc-800">
              {prettyXml(sitemapData.xml)}
            </pre>
            <div className="p-4 bg-zinc-900/50 text-right">
              <button
                onClick={() => setShowXml(false)}
                className="inline-flex items-center px-5 py-2.5 rounded-xl bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/50 font-mono font-bold text-xs uppercase cursor-pointer transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] shadow-md hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] focus:outline-none"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- helpers ---------- */
function extractHostname(u) {
  try {
    const v = u.startsWith("http") ? u : `https://${u}`;
    return new URL(v).hostname || "website";
  } catch {
    return "website";
  }
}

// download triggering
function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function trim(s, n) {
  const x = String(s || "");
  return x.length > n ? x.slice(0, n - 1) + "…" : x;
}

function prettyXml(xml) {
  try {
    let formatted = "";
    const reg = /(>)(<)(\/*)/g;
    xml = xml.replace(reg, "$1\r\n$2$3");
    let pad = 0;
    xml.split("\r\n").forEach((node) => {
      let indent = 0;
      if (node.match(/.+<\/\w[^>]*>$/)) {
        indent = 0;
      } else if (node.match(/^<\/\w/)) {
        if (pad) pad -= 2;
      } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
        indent = 2;
      } else {
        indent = 0;
      }
      formatted += " ".repeat(pad) + node + "\r\n";
      pad += indent;
    });
    return formatted;
  } catch {
    return xml || "";
  }
}

function Stat({ label, value, tone }) {
  const borderTheme =
    tone === "red"
      ? "border-rose-500/20 bg-rose-950/10 text-rose-400 shadow-[inset_0_0_12px_rgba(244,63,94,0.02)]"
      : tone === "amber"
      ? "border-amber-500/20 bg-amber-950/10 text-amber-400 shadow-[inset_0_0_12px_rgba(245,158,11,0.02)]"
      : "border-emerald-500/20 bg-emerald-950/10 text-emerald-400 shadow-[inset_0_0_12px_rgba(16,185,129,0.02)]";
  return (
    <div className={`p-4.5 rounded-xl border ${borderTheme} font-mono transition-all duration-300 hover:scale-[1.01]`}>
      <div className="text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5 font-medium">{label}</div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
    </div>
  );
}
