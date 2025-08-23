"use client";
import { useState } from "react";
import {
  Search,
  BarChart3,
  Globe,
  AlertCircle,
  CheckCircle,
  Loader2,
  FileText,
  FileDown,
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function KeywordPage() {
  const [url, setUrl] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setReport(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/keyword/analyze`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Server error");
      }

      const data = await response.json();
      setReport(data);
    } catch (err) {
      console.error("Keyword analysis failed:", err);
      if (err.name === "AbortError") setError("Request timeout");
      else setError(err.message || "Network error or request failed");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Exports ----------
  const exportPDF = () => {
    if (!report) return;

    const doc = new jsPDF({ unit: "pt", format: "a4" });

    // Header
    doc.setFontSize(16);
    doc.text("Keyword Density Report", 40, 40);
    doc.setFontSize(10);
    doc.text(`Target: ${url}`, 40, 58);
    if (report.title) doc.text(`Title: ${report.title}`, 40, 72);
    if (report.metaDescription)
      doc.text(`Meta Description: ${trim(report.metaDescription, 120)}`, 40, 86);
    doc.text(`Timestamp: ${new Date().toISOString()}`, 40, 100);

    // Summary
    doc.setFontSize(12);
    doc.text("Summary", 40, 122);
    autoTable(doc, {
      startY: 130,
      head: [["Metric", "Value"]],
      body: [
        ["Total Words", String(report.totalWords ?? 0)],
        ["Top Keywords (count)", String(report.singleWords?.length ?? 0)],
        ["Top Phrases (count)", String(report.phrases?.length ?? 0)],
      ],
      styles: { fontSize: 9 },
      columnStyles: { 0: { cellWidth: 180 }, 1: { cellWidth: 340 } },
      theme: "grid",
    });

    // Top Single Keywords
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 18,
      head: [["Keyword", "Count", "Density (%)"]],
      body: (report.singleWords || []).map((k) => [
        k.phrase,
        String(k.count),
        String(k.percentage),
      ]),
      styles: { fontSize: 9 },
      columnStyles: { 0: { cellWidth: 280 }, 1: { cellWidth: 100 }, 2: { cellWidth: 140 } },
      headStyles: { fillColor: [34, 197, 94] },
      theme: "striped",
    });

    // Top Two-word Phrases
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 18,
      head: [["Two-word Phrase", "Count", "Density (%)"]],
      body: (report.phrases || []).map((k) => [
        k.phrase,
        String(k.count),
        String(k.percentage),
      ]),
      styles: { fontSize: 9 },
      columnStyles: { 0: { cellWidth: 280 }, 1: { cellWidth: 100 }, 2: { cellWidth: 140 } },
      headStyles: { fillColor: [16, 185, 129] },
      theme: "striped",
    });

    doc.save(`keyword-report-${safeHostname(url)}.pdf`);
  };

  const exportTXT = () => {
    if (!report) return;

    const lines = [];
    lines.push("Keyword Density Report");
    lines.push(`Target: ${url}`);
    if (report.title) lines.push(`Title: ${report.title}`);
    if (report.metaDescription) lines.push(`Meta Description: ${report.metaDescription}`);
    lines.push(`Timestamp: ${new Date().toISOString()}`);
    lines.push("");

    // Summary
    lines.push("Summary");
    lines.push(`- Total Words: ${report.totalWords ?? 0}`);
    lines.push(`- Top Keywords (count): ${report.singleWords?.length ?? 0}`);
    lines.push(`- Top Phrases (count): ${report.phrases?.length ?? 0}`);
    lines.push("");

    // Top Single Keywords
    lines.push("Top Single Keywords:");
    lines.push("Keyword\tCount\tDensity(%)");
    (report.singleWords || []).forEach((k) => {
      lines.push(`${k.phrase}\t${k.count}\t${k.percentage}`);
    });
    lines.push("");

    // Top Two-word Phrases
    lines.push("Top Two-word Phrases:");
    lines.push("Phrase\tCount\tDensity(%)");
    (report.phrases || []).forEach((k) => {
      lines.push(`${k.phrase}\t${k.count}\t${k.percentage}`);
    });

    downloadText(lines.join("\n"), `keyword-report-${safeHostname(url)}.txt`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <img src="/keyword_checker.png" alt="verify" className="w-16 h-20 mb-4 mt-7" />
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex  justify-center items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Keyword Density Analyzer
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Analyze Your Website's Keywords
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get detailed insights into keyword density and phrase frequency to
            optimize your content for better SEO performance.
          </p>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8">
          <div className="space-y-6">
            <div className="relative">
              <label htmlFor="url" className="block text-sm font-semibold text-gray-700 mb-2">
                Website URL
              </label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="url"
                  type="text"
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-200 text-lg"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value.trim())}
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !loading && url.trim()) handleSubmit(e);
                  }}
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
              disabled={loading || !url.trim()}
            >
              <div className="flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Analyze Keyword Density
                  </>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-4">
              <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
              <div>
                <h3 className="text-lg font-semibold text-green-800">
                  Analyzing keyword density...
                </h3>
                <p className="text-green-600">
                  This may take a few moments while we process your website.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-red-800 mb-1">
                  Analysis Failed
                </h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Report Display */}
        {report && !loading && !error && (
          <div className="space-y-8">
            {/* Success Header + Export */}
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold text-green-800">
                    Analysis Complete!
                  </h3>
                  <p className="text-green-700">
                    Found <span className="font-semibold">{report.totalWords}</span> total words to analyze.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={exportPDF}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded border border-green-300 text-green-800 hover:bg-green-50"
                >
                  <FileText className="w-4 h-4" />
                  Export PDF
                </button>
                <button
                  onClick={exportTXT}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded border border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                >
                  <FileDown className="w-4 h-4" />
                  Export TXT
                </button>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {report.totalWords}
                  </div>
                  <div className="text-gray-600 font-medium">Total Words</div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">
                    {report.singleWords?.length || 0}
                  </div>
                  <div className="text-gray-600 font-medium">Top Keywords</div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-teal-600 mb-2">
                    {report.phrases?.length || 0}
                  </div>
                  <div className="text-gray-600 font-medium">Key Phrases</div>
                </div>
              </div>
            </div>

            {/* Single Keywords Table */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white">Top Single Keywords</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b">Keyword</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 border-b">Count</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 border-b">Density (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {report.singleWords?.map(({ phrase, count, percentage }) => (
                      <tr key={phrase} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{phrase}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            {count}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(Number(percentage) * 4, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-700">{percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Two-word Phrases Table */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white">Top Two-word Phrases</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b">Phrase</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 border-b">Count</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 border-b">Density (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {report.phrases?.map(({ phrase, count, percentage }) => (
                      <tr key={phrase} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{phrase}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                            {count}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(Number(percentage) * 4, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-700">{percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */
function safeHostname(u) {
  try {
    return new URL(u.startsWith("http") ? u : `https://${u}`).hostname || "site";
  } catch {
    return "site";
  }
}
function trim(s, n) {
  const x = String(s || "");
  return x.length > n ? x.slice(0, n - 1) + "…" : x;
}
function downloadText(content, filename) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
