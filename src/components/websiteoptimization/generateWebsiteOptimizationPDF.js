import { jsPDF } from "jspdf";
import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../utils/pdfFramework";

/**
 * Helper to convert small numbers to English words
 */
const numberToWord = (n) => {
  const words = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
  return words[n] || String(n);
};

/**
 * Parse recommendation emoji prefix into a priority/severity
 */
const parseRecommendation = (rec) => {
  if (!rec) return { priority: "Low", text: "" };
  if (rec.startsWith("🔴")) {
    return { priority: "High", text: rec.replace(/^🔴\s*/, "") };
  }
  if (rec.startsWith("🟡")) {
    return { priority: "Medium", text: rec.replace(/^🟡\s*/, "") };
  }
  if (rec.startsWith("🎉")) {
    return { priority: "Low", text: rec.replace(/^🎉\s*/, "") };
  }
  if (rec.startsWith("ℹ️")) {
    return { priority: "Low", text: rec.replace(/^ℹ️\s*/, "") };
  }
  return { priority: "Low", text: rec };
};

/**
 * generateWebsiteOptimizationPDF
 *
 * @param {Object} result - Scan result data from website optimization
 * @param {Function} setPdfProgress - Progress indicator setter
 */
export const generateWebsiteOptimizationPDF = async (result, setPdfProgress) => {
  if (!result) return;
  setPdfProgress?.("Initializing PDF report...");

  const { employeeName, employeeMail } = getAuditorInfo();
  
  try {
    const doc = new jsPDF("p", "mm", "a4");

    // Compute dates
    const now = result.timestamp ? new Date(result.timestamp) : new Date();
    const scanDate = now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }); // e.g. 10 Jun 2026
    const scanTime = now.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }); // e.g. 9:51:46 AM

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 1 — COVER PAGE & ASSESSMENT INFORMATION
    // ════════════════════════════════════════════════════════════════════════
    setPdfProgress?.("Generating Page 1 (Cover Page & Assessment Info)...");

    // Company Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(...C.bluePrimary);
    doc.text("NEXCORE ALLIANCE", 105, 28, { align: "center" });

    doc.setFont("helvetica", "oblique");
    doc.setFontSize(9);
    doc.text("AI-Powered Cybersecurity & Information Security Solutions", 105, 34, { align: "center" });

    // Divider line below company header
    doc.setDrawColor(...C.bluePrimary);
    doc.setLineWidth(0.4);
    doc.line(14, 38, 196, 38);

    // Title Section
    doc.line(14, 44, 196, 44);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("WEBSITE OPTIMIZATION TOOL SECURITY ASSESSMENT REPORT", 105, 52, { align: "center" });
    doc.line(14, 58, 196, 58);

    // Assessment Info Table (Table 1)
    renderTable(doc, {
      startY: 64,
      head: [],
      body: [
        ["Assessment Performed by", employeeMail],
        ["Employee Name", employeeName],
        ["Employee Mail ID", employeeMail],
        ["Target URL", safe(result.url)],
        ["Assessment Date", scanDate],
        ["Assessment Time", scanTime],
        ["Classification", "Confidential"],
        ["Assessment Status", "Completed"],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 },
      },
    });

    // Centered Footnote below Table 1
    const table1FinalY = doc.lastAutoTable.finalY;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("www.nexcorealliance.com | ISO/IEC 27001 Certified | AICPA SOC Compliant", 105, table1FinalY + 5, { align: "center" });

    // Section 1: ASSESSMENT INFORMATION
    let y = drawSectionHeader(doc, "1. ASSESSMENT INFORMATION", table1FinalY + 11);

    // Tool Details subtitle
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Tool Details", 14, y);
    y += 4;

    // Tool Details Table (Table 2)
    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Tool Name", "Website Optimization Tool"],
        ["Tool Category", "Web Performance & SEO Optimization Analyzer"],
        ["Methodology Alignment", "OWASP WSTG – OTG-CONFIG / Configuration & Deployment Management Testing"],
        ["Compliance Alignment", "ISO/IEC 27001 │ AICPA SOC Frameworks"],
        ["Target URL", safe(result.url)],
        ["Assessment Mode", "Non-Intrusive / Automated Performance & SEO Analysis"],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 },
      },
    });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 2 — TOOL OVERVIEW & DETAILED FINDINGS & CONCLUSION (PARAGRAPH 1)
    // ════════════════════════════════════════════════════════════════════════
    setPdfProgress?.("Generating Page 2 (Detailed Findings)...");
    doc.addPage();

    // Tool Overview subtitle at the top
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Tool Overview", 14, 22);

    // Tool Overview Text Paragraph
    const toolOverviewText = 
      "The Website Optimization Tool performs automated performance and SEO analysis against a target web application. " +
      "The tool measures key performance indicators including page load time, HTML page size, compression status, and " +
      "browser caching configuration. It computes a composite Performance Score and Baseline SEO Score, and generates " +
      "prioritised optimisation recommendations based on identified deficiencies. From a security and operational " +
      "perspective, suboptimal performance configurations can expose availability risks, degrade user experience, and " +
      "indicate misconfigured server directives that may affect both performance and security posture.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMain);
    doc.text(toolOverviewText, 14, 27, { maxWidth: 182, align: "justify", lineHeightFactor: 1.45 });

    // Section 3: DETAILED FINDINGS
    y = drawSectionHeader(doc, "3. DETAILED FINDINGS", 62);

    // Dynamic Validation Status determination
    const highCount = (result.recommendations || []).filter(rec => rec.startsWith("🔴")).length;
    const warningCount = (result.recommendations || []).filter(rec => rec.startsWith("🟡")).length;
    let validationStatus = "Passed – Meets Baseline Standards";
    let statusColor = [16, 185, 129]; // Emerald Green
    if (highCount > 0) {
      validationStatus = `Failed – ${highCount} Critical Action(s) Pending`;
      statusColor = C.red;
    } else if (warningCount > 0) {
      validationStatus = `Warning – ${warningCount} Optimization Action(s) Recommended`;
      statusColor = C.amber;
    }

    // Table 1 (Metric Category | Score / Details)
    renderTable(doc, {
      startY: y,
      head: [["Metric Category", "Score / Details"]],
      body: [
        ["Performance Item", "Total HTTP Requests"],
        ["Performance Score", `${result.score} / 100`],
        ["Baseline SEO Score", `${result.seoScore} / 100`],
        ["Total HTTP Requests", `${result.totalResources}`],
        ["Validation Status", validationStatus],
      ],
      headStyles: { fillColor: C.bgHeader, textColor: C.white, fontStyle: "bold" },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55 },
        1: { cellWidth: 127 },
      },
      didParseCell: (cellData) => {
        if (cellData.section === "body" && cellData.row.index === 4 && cellData.column.index === 1) {
          cellData.cell.styles.textColor = statusColor;
          cellData.cell.styles.fontStyle = "bold";
        }
      }
    });

    y = doc.lastAutoTable.finalY + 8;

    // Table 2 (Performance Score | Measurement)
    const compressionVal = result.compression && result.compression !== "None" ? "Active" : "Disabled";
    const cachingVal = result.caching ? "Enabled" : "Disabled";
    renderTable(doc, {
      startY: y,
      head: [["Performance Score", "Measurement"]],
      body: [
        ["Page Load Time", `${result.loadTimeMs} ms`],
        ["HTML Page Size", `${result.pageSizeKB} KB`],
        ["Gzip/Brotli Compression", compressionVal],
        ["Browser Caching", cachingVal],
      ],
      headStyles: { fillColor: C.bgHeader, textColor: C.white, fontStyle: "bold" },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55 },
        1: { cellWidth: 127 },
      },
      didParseCell: (cellData) => {
        if (cellData.section === "body" && cellData.column.index === 1) {
          const v = cellData.cell.raw;
          if (v === "Disabled") {
            cellData.cell.styles.textColor = C.red;
          } else if (v === "Active" || v === "Enabled") {
            cellData.cell.styles.textColor = [16, 185, 129];
          }
        }
      }
    });

    y = doc.lastAutoTable.finalY + 8;

    // Categorize recommendations into High priority and Low priority
    const highRecs = [];
    const lowRecs = [];
    (result.recommendations || []).forEach(rec => {
      const parsed = parseRecommendation(rec);
      if (parsed.text) {
        if (parsed.priority === "High") {
          highRecs.push(parsed.text);
        } else {
          lowRecs.push(parsed.text);
        }
      }
    });

    const highRecText = highRecs.length > 0 ? highRecs.map(r => `• ${r}`).join("\n") : "No high-priority deficiencies identified.";
    const lowRecText = lowRecs.length > 0 ? lowRecs.map(r => `• ${r}`).join("\n") : "No low-priority deficiencies identified.";

    // Table 3 (Optimization Recommendation: Priority / Details)
    renderTable(doc, {
      startY: y,
      head: [["Priority", "Recommendation Details"]],
      body: [
        ["High", highRecText],
        ["Low", lowRecText],
      ],
      headStyles: { fillColor: C.bgHeader, textColor: C.white, fontStyle: "bold" },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 30, textColor: C.white },
        1: { cellWidth: 152 },
      },
      didParseCell: (cellData) => {
        if (cellData.section === "body" && cellData.column.index === 0) {
          const rawVal = cellData.cell.raw;
          if (rawVal === "High") {
            cellData.cell.styles.fillColor = C.red;
          } else {
            cellData.cell.styles.fillColor = C.blue;
          }
        }
      }
    });

    y = doc.lastAutoTable.finalY + 8;

    // Section 4: CONCLUSION & RECOMMENDATIONS (Paragraph 1)
    y = drawSectionHeader(doc, "4. CONCLUSION & RECOMMENDATIONS", y);

    const totalFindingsWord = numberToWord(result.recommendations?.length || 0).toLowerCase();
    const compressionState = result.compression && result.compression !== "None" ? "active" : "disabled";
    const cachingState = result.caching ? "enabled" : "disabled";

    const conclusionParagraph1 = 
      `The Website Optimization Tool assessment of ${safe(result.url)} returned a Performance Score of ` +
      `${result.score}/100 and a Baseline SEO Score of ${result.seoScore}/100. ${totalFindingsWord} findings ` +
      `were identified across performance, security headers, technical SEO, and accessibility configuration. ` +
      `The target site demonstrates ${result.score >= 80 ? "strong" : result.score >= 50 ? "moderate" : "poor"} ` +
      `baseline performance with gzip compression ${compressionState}, browser caching ${cachingState}, ` +
      `a page load time of ${result.loadTimeMs} ms, and an HTML page size of ${result.pageSizeKB} KB. ` +
      `However, missing metrics and SEO configuration deficiencies reduce the completeness and reliability ` +
      `of the overall assessment.`;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMain);
    doc.text(conclusionParagraph1, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.45 });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 3 — CONCLUSION & RECOMMENDATIONS (PARAGRAPH 2)
    // ════════════════════════════════════════════════════════════════════════
    setPdfProgress?.("Generating Page 3 (Recommendations)...");
    doc.addPage();

    // Continuation of Section 4
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMain);

    const conclusionParagraph2 = 
      "It is recommended that Total HTTP Request count and Core Web Vitals (LCP, CLS, INP) be added as " +
      "mandatory captured parameters to ensure the Performance Score accurately reflects the full page " +
      "experience. Title tag and meta description lengths should be corrected to fall within industry-standard " +
      "ranges to improve organic search visibility and click-through rates. Optimisation recommendations " +
      "should be dynamically generated based on captured metric values and validated against current " +
      "Google Search Central and Web.dev performance benchmarks. Assessments should be conducted on a " +
      "scheduled basis to track performance regression as site content evolves.";

    doc.text(conclusionParagraph2, 14, 25, { maxWidth: 182, align: "justify", lineHeightFactor: 1.45 });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 4 — APPENDIX (COLUMN REFERENCE GUIDE)
    // ════════════════════════════════════════════════════════════════════════
    setPdfProgress?.("Generating Page 4 (Appendix)...");
    doc.addPage();

    y = drawSectionHeader(doc, "5. APPENDIX", 25);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Column Reference Guide", 14, y);
    y += 5;

    renderTable(doc, {
      startY: y,
      head: [["Parameters", "Description"]],
      body: [
        ["Metric Category", "Classification of the performance or SEO area assessed: Performance / SEO Configuration / Availability"],
        ["Performance Item", "The specific metric or configuration item evaluated during the assessment"],
        ["Measurement", "The recorded value or status of the metric at the time of assessment"],
        ["Performance Score", "Composite score (0–100) reflecting overall page performance at time of scan"],
        ["Baseline SEO Score", "Composite score (0–100) reflecting baseline on-page SEO configuration quality"],
        ["Total HTTP Requests", "Total number of HTTP requests issued during full page load, disaggregated by resource type"],
        ["Page Load Time", "Total time in milliseconds for the page to fully load in the test environment"],
        ["HTML Page Size", "Uncompressed HTML document size in kilobytes"],
        ["Gzip/Brotli Compression", "Server-side compression method active for response delivery: gzip / brotli / none"],
        ["Validation Status", "Outcome of metric validation: Passed / Failed / Warning / Informational"],
        ["Priority", "Urgency level of the optimisation recommendation: High / Medium / Low"],
        ["Recommendation", "Specific, actionable remediation guidance for the identified finding"],
      ],
      headStyles: { fillColor: C.bgHeader, textColor: C.white, fontStyle: "bold" },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50, fillColor: [245, 245, 245] },
        1: { cellWidth: 132 },
      },
    });

    y = doc.lastAutoTable.finalY + 10;

    // Acknowledgement Subtitle
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Acknowledgement", 14, y);
    y += 6;

    // Acknowledgement Text
    const acknowledgementText = 
      "The findings presented in this report are based on observations made during the assessment period and " +
      "represent the web performance and SEO optimisation posture of the target environment at the time of scanning. " +
      "This report contains confidential and proprietary information intended solely for the authorised recipient. " +
      "Unauthorised disclosure, distribution, or reproduction of this report is prohibited without prior written " +
      "consent from Nexcore Alliance.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMain);
    doc.text(acknowledgementText, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });

    // ── Apply running headers and footers ────────────────────────────────────
    applyHeaderFooterDecorator(doc, "Website Optimization Tool");

    // ── Save PDF Report ──────────────────────────────────────────────────────
    setPdfProgress?.("Saving PDF report...");
    let filename = "website-optimization-report.pdf";
    try {
      const parsed = new URL(result.url);
      filename = `optimization-${parsed.hostname.replace(/[^a-z0-9]/gi, "_")}.pdf`;
    } catch (_) {}
    doc.save(filename);

  } catch (err) {
    console.error("Failed to generate Website Optimization PDF:", err);
  } finally {
    setPdfProgress?.(null);
  }
};
