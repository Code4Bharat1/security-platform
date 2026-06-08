"use client";

import { useState } from "react";
import axios from "axios";
import GreenLayout from "../GreenTeam/layout";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  FileDown, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  FileText, 
  Zap, 
  Globe, 
  Database,
  Eye,
  EyeOff
} from "lucide-react";

export default function WebsiteOptimizationTool() {
  const [url, setUrl] = useState("");
  const [info, setInfo] = useState("");
  const [result, setResult] = useState(null);
  const [showRaw, setShowRaw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const protection = useProtectedAction();

  const downloadPDF = () => {
    if (!result) return;
    const doc = new jsPDF({ unit: "pt" });
    
    // Document Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Website Optimization Report", 40, 40);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Target URL: ${result.url}`, 40, 60);
    doc.text(`Scan Date:  ${new Date(result.timestamp).toLocaleString()}`, 40, 75);
    
    // Table 1: Score Summary
    const scoreSummary = [
      ["Performance Score", `${result.score} / 100`],
      ["Baseline SEO Score", `${result.seoScore} / 100`]
    ];
    
    autoTable(doc, {
      startY: 95,
      head: [["Metric Category", "Score / Details"]],
      body: scoreSummary,
      theme: "striped",
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [197, 160, 89] } // Gold accent
    });
    
    let currentY = doc.lastAutoTable.finalY + 20;
    
    // Table 2: Detailed Performance Metrics
    const performanceMetrics = [
      ["Page Load Time", `${result.loadTimeMs} ms`],
      ["HTML Page Size", `${result.pageSizeKB} KB`],
      ["Gzip/Brotli Compression", result.compression && result.compression !== 'None' ? result.compression : "Disabled"],
      ["Browser Caching", result.caching ? "Active" : "Missing"]
    ];
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Performance Metrics", 40, currentY);
    
    autoTable(doc, {
      startY: currentY + 10,
      head: [["Performance Item", "Measurement"]],
      body: performanceMetrics,
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 5 },
      headStyles: { fillColor: [40, 40, 40] }
    });
    
    currentY = doc.lastAutoTable.finalY + 20;
    
    // Table 3: Actionable Recommendations
    const cleanRecommendations = (result.recommendations || []).map((rec) => {
      const parsed = parseRec(rec);
      const priority = parsed.type === "error" ? "High" : parsed.type === "warning" ? "Medium" : "Info";
      return [priority, parsed.text];
    });
    
    if (cleanRecommendations.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Optimization Recommendations", 40, currentY);
      
      autoTable(doc, {
        startY: currentY + 10,
        head: [["Priority", "Recommendation Details"]],
        body: cleanRecommendations,
        theme: "striped",
        styles: { fontSize: 9, cellPadding: 6 },
        headStyles: { fillColor: [197, 160, 89] },
        columnStyles: {
          0: { cellWidth: 80, fontStyle: "bold" },
          1: { cellWidth: 400 }
        },
        didParseCell: (data) => {
          if (data.column.index === 0) {
            if (data.cell.raw === "High") {
              data.cell.styles.textColor = [220, 38, 38]; // Red
            } else if (data.cell.raw === "Medium") {
              data.cell.styles.textColor = [217, 119, 6]; // Orange
            } else {
              data.cell.styles.textColor = [3, 105, 161]; // Blue
            }
          }
        }
      });
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("No optimization recommendations! The website meets all baseline performance and SEO standards.", 40, currentY);
    }
    
    let filename = "website-optimization-report.pdf";
    try {
      const parsed = new URL(result.url);
      filename = `optimization-report-${parsed.hostname.replace(/[^a-z0-9]/gi, "_")}.pdf`;
    } catch (e) {
      // ignore
    }
    
    doc.save(filename);
  };

  const handleScan = async () => {
    const trimmedUrl = url.trim();

    if (!trimmedUrl || !trimmedUrl.startsWith("http")) {
      setError("❌ Please enter a valid URL that starts with http or https.");
      setInfo("");
      setResult(null);
      return;
    }

    await protection(async (userToken) => {
      try {
        setLoading(true);
        setError("");
        setInfo("");
        setResult(null);

        console.log("📡 Sending URL to backend:", trimmedUrl);
        
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/website-optimization`,
          {
            url: trimmedUrl,
          },
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );

        setInfo(response.data.message);
        setResult(response.data.data);
      } catch (err) {
        console.error("❌ Error during scan:", err);
        setError(
          err.response?.data?.error || "Something went wrong. Please try again."
        );
      } finally {
        setLoading(false);
      }
    });
  };

  const parseRec = (rec) => {
    let type = "info";
    let cleanText = rec;
    if (rec.startsWith("🔴")) {
      type = "error";
      cleanText = rec.replace(/^🔴\s*/, "");
    } else if (rec.startsWith("🟡")) {
      type = "warning";
      cleanText = rec.replace(/^🟡\s*/, "");
    } else if (rec.startsWith("🎉")) {
      type = "success";
      cleanText = rec.replace(/^🎉\s*/, "");
    }
    return { type, text: cleanText };
  };

  const getLoadTimeColorClass = (ms) => {
    if (ms < 500) return "text-emerald-500 border-emerald-500/20 bg-emerald-500/5";
    if (ms < 1500) return "text-amber-500 border-amber-500/20 bg-amber-500/5";
    return "text-rose-500 border-rose-500/20 bg-rose-500/5";
  };

  const getPageSizeColorClass = (kb) => {
    if (kb < 200) return "text-emerald-500 border-emerald-500/20 bg-emerald-500/5";
    if (kb < 512) return "text-amber-500 border-amber-500/20 bg-amber-500/5";
    return "text-rose-500 border-rose-500/20 bg-rose-500/5";
  };

  return (
    <div className="tool-detail-page flex min-h-screen flex-col items-center px-3 pt-10 pb-24">
      <GreenLayout
        heroData={{
          imgPath: "/GreenTeam/optimization.png",
          title: "Website Optimization Tool",
          desc: "Analyze and optimize your website for better performance and SEO.",
        }}
      />
      <div className={`mx-auto w-full transition-all duration-500 ${result ? 'max-w-2xl' : 'max-w-xl'} rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-card)] p-6 shadow-[var(--shadow-elevated)]`}>
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value.trim())}
            placeholder="Enter website URL (e.g. https://example.com)"
            className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-subtle)] p-3 text-[color:var(--text-body)] placeholder:text-[color:var(--text-muted)] focus:outline-none"
          />
        </div>
        <button
          onClick={handleScan}
          disabled={loading}
          className="w-full rounded-lg border border-[color:var(--gold)] bg-[color:var(--gold)] py-3 font-semibold text-[color:var(--text-inverse)] transition duration-300 hover:bg-[color:var(--gold-strong)] disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>

        {error && <p className="mt-4 text-center text-[color:var(--danger)]">{error}</p>}

        {result && (
          <div className="mt-8 space-y-6">
            
            {/* Visual Dashboard Scores */}
            <div className="flex flex-col sm:flex-row gap-4 justify-around items-center rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-subtle)] p-6">
              
              {/* Performance Score */}
              <div className="flex flex-col items-center">
                <span className="mb-2 text-sm font-semibold text-[color:var(--text-muted)]">Performance Score</span>
                <div className="relative h-28 w-28">
                  <svg className="h-28 w-28 transform -rotate-90">
                    <circle
                      className="text-[color:var(--border)]"
                      strokeWidth="8"
                      stroke="currentColor"
                      fill="transparent"
                      r="45"
                      cx="56"
                      cy="56"
                    />
                    <circle
                      className={result.score >= 80 ? "text-emerald-500" : result.score >= 50 ? "text-amber-500" : "text-rose-500"}
                      strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 45}
                      strokeDashoffset={2 * Math.PI * 45 - (result.score / 100) * (2 * Math.PI * 45)}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="45"
                      cx="56"
                      cy="56"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-[color:var(--text-heading)]">
                    {result.score}
                  </span>
                </div>
              </div>

              {/* SEO Score */}
              <div className="flex flex-col items-center">
                <span className="mb-2 text-sm font-semibold text-[color:var(--text-muted)]">Baseline SEO Score</span>
                <div className="relative h-28 w-28">
                  <svg className="h-28 w-28 transform -rotate-90">
                    <circle
                      className="text-[color:var(--border)]"
                      strokeWidth="8"
                      stroke="currentColor"
                      fill="transparent"
                      r="45"
                      cx="56"
                      cy="56"
                    />
                    <circle
                      className={result.seoScore >= 80 ? "text-emerald-500" : result.seoScore >= 50 ? "text-amber-500" : "text-rose-500"}
                      strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 45}
                      strokeDashoffset={2 * Math.PI * 45 - (result.seoScore / 100) * (2 * Math.PI * 45)}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="45"
                      cx="56"
                      cy="56"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-[color:var(--text-heading)]">
                    {result.seoScore}
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              
              {/* Load Time */}
              <div className={`flex flex-col p-4 rounded-xl border ${getLoadTimeColorClass(result.loadTimeMs)}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-medium opacity-85">Load Time</span>
                </div>
                <span className="text-lg font-bold">{result.loadTimeMs} ms</span>
              </div>

              {/* Page Size */}
              <div className={`flex flex-col p-4 rounded-xl border ${getPageSizeColorClass(result.pageSizeKB)}`}>
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-medium opacity-85">Page Size</span>
                </div>
                <span className="text-lg font-bold">{result.pageSizeKB} KB</span>
              </div>

              {/* Compression */}
              <div className={`flex flex-col p-4 rounded-xl border ${result.compression && result.compression !== 'None' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 'text-rose-500 border-rose-500/20 bg-rose-500/5'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-medium opacity-85">Compression</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold">
                  {result.compression && result.compression !== 'None' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>{result.compression}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-500" />
                      <span>Disabled</span>
                    </>
                  )}
                </div>
              </div>

              {/* Browser Caching */}
              <div className={`flex flex-col p-4 rounded-xl border ${result.caching ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 'text-rose-500 border-rose-500/20 bg-rose-500/5'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Database className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-medium opacity-85">Caching</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold">
                  {result.caching ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Active</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-500" />
                      <span>Missing</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Recommendations Checklist */}
            <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-subtle)] p-5">
              <h3 className="mb-4 text-md font-semibold text-[color:var(--text-heading)]">Recommendations</h3>
              {result.recommendations && result.recommendations.length > 0 ? (
                <div className="space-y-3">
                  {result.recommendations.map((rec, index) => {
                    const parsed = parseRec(rec);
                    return (
                      <div key={index} className="flex items-start gap-3 text-sm">
                        {parsed.type === "error" && (
                          <XCircle className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
                        )}
                        {parsed.type === "warning" && (
                          <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        )}
                        {parsed.type === "info" && (
                          <AlertCircle className="w-5 h-5 text-sky-500 mt-0.5 flex-shrink-0" />
                        )}
                        <span className="text-[color:var(--text-body)] leading-relaxed">{parsed.text}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center gap-3 text-emerald-500 text-sm">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span>🎉 Excellent! Your website meets all baseline performance and SEO standards.</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={downloadPDF}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-[color:var(--gold)] bg-[color:var(--gold)] py-3 font-semibold text-[color:var(--text-inverse)] transition duration-300 hover:bg-[color:var(--gold-strong)]"
              >
                <FileDown className="w-5 h-5" />
                <span>Download PDF Report</span>
              </button>
              <button
                onClick={() => setShowRaw(!showRaw)}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-[color:var(--border)] bg-transparent py-3 font-semibold text-[color:var(--text-body)] transition duration-300 hover:bg-[color:var(--surface-subtle)]"
              >
                {showRaw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                <span>{showRaw ? "Hide Raw Report" : "View Raw Report"}</span>
              </button>
            </div>

            {showRaw && info && (
              <pre className="whitespace-pre-wrap rounded-xl border border-[color:var(--border)] bg-black p-4 text-xs font-mono text-emerald-500 overflow-x-auto shadow-inner">
                {info}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
