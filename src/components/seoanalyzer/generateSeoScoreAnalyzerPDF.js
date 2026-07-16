import { jsPDF } from "jspdf";
import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../utils/pdfFramework";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Format a score/100 value with a qualitative label. */
const scoreLabel = (score) => {
  const s = Number(score) || 0;
  if (s >= 80) return `${s}/100 — Excellent SEO Health`;
  if (s >= 50) return `${s}/100 — Needs Improvements`;
  return `${s}/100 — Poor Crawl Potential`;
};

/** Derive overall validation status from issues array. */
const getValidationStatus = (issues = []) => {
  if (!issues || issues.length === 0) return "Passed – All Checks Satisfied";
  const critical = issues.filter((i) =>
    /missing.*title|missing.*description/i.test(i)
  ).length;
  if (critical > 0) return `Failed – ${critical} Critical Tag(s) Missing`;
  return `Warning – ${issues.length} Issue(s) Identified`;
};

/** Convert boolean to readable string. */
const boolStr = (v) => (v ? "Yes" : "No");

/** Truncate a string to a max char count with ellipsis. */
const truncate = (str, maxLen = 90) => {
  if (!str || str === "N/A") return "N/A";
  return str.length > maxLen ? str.slice(0, maxLen - 1) + "…" : str;
};

// ─────────────────────────────────────────────────────────────────────────────
// Main generator
// ─────────────────────────────────────────────────────────────────────────────

/**
 * generateSeoScoreAnalyzerPDF
 *
 * Generates a professional 4-page client-side PDF report for the SEO Score
 * Analyzer tool. Reuses all shared design tokens and layout utilities from
 * pdfFramework.js.
 *
 * @param {Object}   result         - Scan result data from the SEO analyzer API
 * @param {Function} setPdfProgress - Progress indicator setter (nullable)
 */
export const generateSeoScoreAnalyzerPDF = async (result, setPdfProgress) => {
  if (!result) return;
  setPdfProgress?.("Initializing PDF report...");

  const { employeeName, employeeMail } = getAuditorInfo();

  try {
    const doc = new jsPDF("p", "mm", "a4");

    // Derive date / time from scan timestamp or now
    const now = result.timestamp ? new Date(result.timestamp) : new Date();
    const scanDate = now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const scanTime = now.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    // Pre-compute derived fields used across multiple pages
    const score         = Number(result.score) || 0;
    const issues        = result.issues || result.summary?.weaknesses || [];
    const strengths     = result.strengths || result.summary?.strengths || [];
    const pageSizeKB    = safe(result.pageSizeKB, "N/A");
    const transferKB    = safe(result.transferSizeKB, pageSizeKB);
    const compressed    = result.isCompressed ?? false;
    const compType      = safe(result.compressionType, "None");
    const mobileFriendly = result.mobileFriendly ?? false;
    const imagesNoAlt   = Number(result.imagesWithoutAlt) ?? 0;

    const validationStatus = getValidationStatus(issues);
    const statusColor = issues.length === 0
      ? [16, 185, 129]
      : issues.some((i) => /missing.*title|missing.*description/i.test(i))
        ? C.red
        : C.amber;

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 1 — COVER PAGE & ASSESSMENT INFORMATION
    // ══════════════════════════════════════════════════════════════════════════
    setPdfProgress?.("Generating Page 1 (Cover Page & Assessment Info)...");

    // Company Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(...C.bluePrimary);
    doc.text("NEXCORE ALLIANCE", 105, 28, { align: "center" });

    doc.setFont("helvetica", "oblique");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMuted);
    doc.text("AI-Powered Cybersecurity & Information Security Solutions", 105, 34, { align: "center" });

    // Divider lines
    doc.setDrawColor(...C.bluePrimary);
    doc.setLineWidth(0.4);
    doc.line(14, 38, 196, 38);
    doc.line(14, 44, 196, 44);

    // Report Title Band
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...C.textMain);
    doc.text("SEO SCORE ANALYZER – ASSESSMENT REPORT", 105, 52, { align: "center" });
    doc.line(14, 58, 196, 58);

    // Assessment Meta Table (Table 0)
    renderTable(doc, {
      startY: 64,
      head: [],
      body: [
        ["Assessment Performed by", employeeMail],
        ["Employee Name",           employeeName],
        ["Employee Mail ID",         employeeMail],
        ["Target URL",               safe(result.url)],
        ["Assessment Date",          scanDate],
        ["Assessment Time",          scanTime],
        ["Classification",           "Confidential"],
        ["Assessment Status",        "Completed"],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 },
      },
    });

    // Footnote below meta table
    const metaFinalY = doc.lastAutoTable.finalY;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text(
      "www.nexcorealliance.com | ISO/IEC 27001 Certified | AICPA SOC Compliant",
      105,
      metaFinalY + 5,
      { align: "center" }
    );

    // Section 1: ASSESSMENT INFORMATION
    let y = drawSectionHeader(doc, "1. ASSESSMENT INFORMATION", metaFinalY + 11);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Tool Details", 14, y);
    y += 4;

    // Tool Details Table (Table 1)
    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Tool Name",              "SEO Score Analyzer"],
        ["Tool Category",          "On-Page SEO & Metadata Audit"],
        ["Methodology Alignment",  "OWASP WSTG – OTG-CONFIG / Information Gathering"],
        ["Compliance Alignment",   "ISO/IEC 27001 │ AICPA SOC Frameworks"],
        ["Target URL",             safe(result.url)],
        ["Assessment Mode",        "Non-Intrusive / Automated SEO Tag & Crawl Analysis"],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 },
      },
    });

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 2 — TOOL OVERVIEW & DETAILED FINDINGS
    // ══════════════════════════════════════════════════════════════════════════
    setPdfProgress?.("Generating Page 2 (Detailed Findings)...");
    doc.addPage();

    // Tool Overview
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Tool Overview", 14, 22);

    const toolOverviewText =
      "The SEO Score Analyzer performs automated on-page SEO and metadata auditing against a target web " +
      "application. The tool evaluates the presence and length conformance of critical HTML tags (title, " +
      "meta description, H1 headings, canonical links, and robots directives), validates viewport " +
      "configuration for mobile readiness, measures HTML document size and compression status, and " +
      "identifies images with missing ALT attributes. A composite SEO score (0–100) is computed from " +
      "weighted penalties applied to each identified deficiency. From a security and operational " +
      "perspective, weak SEO configuration can reduce indexability, mask content structure vulnerabilities, " +
      "and indicate misconfigured server responses that may impact both discoverability and performance posture.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMain);
    doc.text(toolOverviewText, 14, 27, { maxWidth: 182, align: "justify", lineHeightFactor: 1.45 });

    // Section 3: DETAILED FINDINGS
    y = drawSectionHeader(doc, "3. DETAILED FINDINGS", 68);

    // Table 1 — Top-level summary metrics
    renderTable(doc, {
      startY: y,
      head: [["Metric Category", "Score / Details"]],
      body: [
        ["Overall SEO Score",    scoreLabel(score)],
        ["HTML Page Size",       `${pageSizeKB} KB (uncompressed)`],
        ["Transfer Size",        `${transferKB} KB`],
        ["Compression Status",   compressed ? `Active (${compType})` : "Disabled"],
        ["Validation Status",    validationStatus],
      ],
      headStyles: { fillColor: C.bgHeader, textColor: C.white, fontStyle: "bold" },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55 },
        1: { cellWidth: 127 },
      },
      didParseCell: (cellData) => {
        // Colour the Validation Status cell
        if (cellData.section === "body" && cellData.row.index === 4 && cellData.column.index === 1) {
          cellData.cell.styles.textColor = statusColor;
          cellData.cell.styles.fontStyle = "bold";
        }
        // Colour compression status
        if (cellData.section === "body" && cellData.row.index === 3 && cellData.column.index === 1) {
          cellData.cell.styles.textColor = compressed ? [16, 185, 129] : C.red;
        }
        // Colour score cell
        if (cellData.section === "body" && cellData.row.index === 0 && cellData.column.index === 1) {
          cellData.cell.styles.textColor =
            score >= 80 ? [16, 185, 129] : score >= 50 ? C.amber : C.red;
          cellData.cell.styles.fontStyle = "bold";
        }
      },
    });

    y = doc.lastAutoTable.finalY + 8;

    // Table 2 — SEO Tag Key-Value pairs
    renderTable(doc, {
      startY: y,
      head: [["SEO Parameter", "Detected Value"]],
      body: [
        ["Page Title",           truncate(safe(result.title), 80)],
        ["Meta Description",     truncate(safe(result.description || result.metaDescription), 80)],
        ["H1 Heading",           truncate(safe(result.h1), 80)],
        ["Canonical Tag",        truncate(safe(result.canonical), 80)],
        ["Robots Directive",     safe(result.robots)],
        ["Mobile Friendly",      mobileFriendly ? "Yes – viewport=device-width detected" : "No – viewport not configured"],
        ["Images Missing ALT",   imagesNoAlt > 0 ? `${imagesNoAlt} image(s) without alt attributes` : "All images have ALT attributes"],
      ],
      headStyles: { fillColor: C.bgHeader, textColor: C.white, fontStyle: "bold" },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 },
      },
      didParseCell: (cellData) => {
        if (cellData.section !== "body" || cellData.column.index !== 1) return;
        const raw = String(cellData.cell.raw || "");
        // Mobile friendly
        if (cellData.row.index === 5) {
          cellData.cell.styles.textColor = mobileFriendly ? [16, 185, 129] : C.red;
        }
        // Images ALT
        if (cellData.row.index === 6) {
          cellData.cell.styles.textColor = imagesNoAlt > 0 ? C.amber : [16, 185, 129];
        }
        // Missing values shown in red
        if (raw === "N/A") {
          cellData.cell.styles.textColor = C.red;
        }
      },
    });

    y = doc.lastAutoTable.finalY + 8;

    // Section 4: CONCLUSION & RECOMMENDATIONS (Paragraph 1)
    y = drawSectionHeader(doc, "4. CONCLUSION & RECOMMENDATIONS", y);

    const strengthCount = strengths.length;
    const issueCount    = issues.length;

    const conclusionParagraph1 =
      `The SEO Score Analyzer assessment of ${safe(result.url)} returned an overall SEO Score of ` +
      `${score}/100 (${score >= 80 ? "Excellent" : score >= 50 ? "Needs Improvements" : "Poor"}). ` +
      `${strengthCount} SEO parameter(s) met the required standards, while ${issueCount} issue(s) were ` +
      `identified that require remediation. HTML page size was recorded at ${pageSizeKB} KB with ` +
      `compression ${compressed ? `active via ${compType}` : "disabled"}. Mobile readiness was ` +
      `${mobileFriendly ? "confirmed (viewport=device-width detected)" : "not confirmed (viewport meta tag misconfigured or absent)"}. ` +
      `${imagesNoAlt > 0
        ? `${imagesNoAlt} image(s) were detected without descriptive ALT attributes, reducing accessibility and image indexability.`
        : "All detected images were found to carry descriptive ALT attributes."
      }`;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMain);
    doc.text(conclusionParagraph1, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.45 });

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 3 — RECOMMENDATIONS TABLE & CONCLUSION PARAGRAPH 2
    // ══════════════════════════════════════════════════════════════════════════
    setPdfProgress?.("Generating Page 3 (Recommendations)...");
    doc.addPage();

    // Continuation of Section 4
    const conclusionParagraph2 =
      "It is recommended that all missing critical SEO tags (title, meta description, canonical, and robots " +
      "directive) be addressed as an immediate priority, as their absence directly impacts search engine " +
      "indexability and click-through rate. Page title and meta description lengths should be corrected to " +
      "fall within industry-standard character bounds (50–60 characters for titles; 120–158 characters for " +
      "descriptions). All images lacking ALT attributes should be annotated with descriptive, keyword-rich " +
      "text to satisfy both accessibility standards and search engine image indexing requirements. " +
      "Server-side compression (gzip or Brotli) should be enabled where absent to reduce transfer size and " +
      "improve page delivery performance. Assessments should be scheduled on a recurring basis to track " +
      "SEO posture regression as site content, structure, and server configuration evolve over time.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMain);
    doc.text(conclusionParagraph2, 14, 22, { maxWidth: 182, align: "justify", lineHeightFactor: 1.45 });

    // Build recommendations table rows from strengths and issues
    const strengthRows = strengths.map((s) => ["Passed", s]);
    const issueRows    = issues.map((i) => ["Action Required", i]);
    const recRows      = [...issueRows, ...strengthRows];

    if (recRows.length === 0) {
      recRows.push(["Info", "No findings to report."]);
    }

    const p3StartY = 22 + (conclusionParagraph2.length / 90) * 4.5 + 14;

    renderTable(doc, {
      startY: p3StartY,
      head: [["Status", "Finding / Recommendation"]],
      body: recRows,
      headStyles: { fillColor: C.bgHeader, textColor: C.white, fontStyle: "bold" },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 40 },
        1: { cellWidth: 142 },
      },
      didParseCell: (cellData) => {
        if (cellData.section === "body" && cellData.column.index === 0) {
          const val = String(cellData.cell.raw || "");
          if (val === "Action Required") {
            cellData.cell.styles.fillColor  = C.red;
            cellData.cell.styles.textColor  = C.white;
          } else if (val === "Passed") {
            cellData.cell.styles.fillColor  = [16, 185, 129];
            cellData.cell.styles.textColor  = C.white;
          } else {
            cellData.cell.styles.fillColor  = C.blue;
            cellData.cell.styles.textColor  = C.white;
          }
        }
      },
    });

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 4 — APPENDIX & ACKNOWLEDGEMENT
    // ══════════════════════════════════════════════════════════════════════════
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
      head: [["Parameter", "Description"]],
      body: [
        ["Overall SEO Score",       "Composite score (0–100) reflecting the on-page SEO configuration quality at time of scan"],
        ["HTML Page Size",          "Uncompressed HTML document size in kilobytes as received by the scanner"],
        ["Transfer Size",           "Estimated compressed transfer size in KB; equals page size when compression is disabled"],
        ["Compression Status",      "Server-side compression method active for response delivery: gzip / brotli / deflate / None"],
        ["Validation Status",       "Outcome of overall scan validation: Passed / Warning / Failed"],
        ["Page Title",              "Content of the HTML <title> element; should be 50–60 characters for optimal indexing"],
        ["Meta Description",        "Content of the <meta name='description'> tag; should be 120–158 characters"],
        ["H1 Heading",              "Text of the first H1 element; only one H1 per page is recommended"],
        ["Canonical Tag",           "Value of the <link rel='canonical'> href; must match the preferred page URL"],
        ["Robots Directive",        "Content of the <meta name='robots'> tag; controls crawler indexing behaviour"],
        ["Mobile Friendly",         "Whether viewport is configured with width=device-width for responsive rendering"],
        ["Images Missing ALT",      "Count of <img> elements without a non-empty alt attribute"],
        ["Status",                  "Per-finding outcome: Passed (strength detected) / Action Required (issue identified)"],
        ["Finding / Recommendation","Specific SEO parameter finding or actionable remediation guidance"],
      ],
      headStyles: { fillColor: C.bgHeader, textColor: C.white, fontStyle: "bold" },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50, fillColor: [245, 245, 245] },
        1: { cellWidth: 132 },
      },
    });

    y = doc.lastAutoTable.finalY + 10;

    // Acknowledgement
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Acknowledgement", 14, y);
    y += 6;

    const acknowledgementText =
      "The findings presented in this report are based on observations made during the assessment period and " +
      "represent the on-page SEO and metadata configuration posture of the target environment at the time of " +
      "scanning. This report contains confidential and proprietary information intended solely for the " +
      "authorised recipient. Unauthorised disclosure, distribution, or reproduction of this report is " +
      "prohibited without prior written consent from Nexcore Alliance.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMain);
    doc.text(acknowledgementText, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });

    // ── Apply running headers and footers across all pages ───────────────────
    applyHeaderFooterDecorator(doc, "SEO Score Analyzer");

    // ── Save PDF ─────────────────────────────────────────────────────────────
    setPdfProgress?.("Saving PDF report...");
    let filename = "seo-score-analyzer-report.pdf";
    try {
      const parsed = new URL(result.url);
      filename = `seo-report-${parsed.hostname.replace(/[^a-z0-9]/gi, "_")}.pdf`;
    } catch (_) {}
    doc.save(filename);

  } catch (err) {
    console.error("Failed to generate SEO Score Analyzer PDF:", err);
  } finally {
    setPdfProgress?.(null);
  }
};
