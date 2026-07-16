// generateDataBreachPDF.js
// Unified PDF exporter for the Data Breach / Data Leak Detector tool.
// Reuses shared design system from src/utils/pdfFramework.js — no duplicate styling.

import { jsPDF } from "jspdf";
import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../utils/pdfFramework";

// ── ASCII-safe helper (strips Unicode that Helvetica can't render) ─────────────
const pdfSafe = (str) =>
  safe(str)
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/\s+/g, " ")
    .trim();

// ── Derive match-type label and severity from a redacted match string ──────────
// Match strings from the controller look like: "[API Key] sk-****abcd"
function parseMatch(matchStr) {
  const labelMatch = matchStr.match(/^\[([^\]]+)\]/);
  const label = labelMatch ? labelMatch[1] : "Unknown";
  const redacted = matchStr.replace(/^\[[^\]]+\]\s*/, "");

  const severityMap = {
    "API Key":      "High",
    "Bearer Token": "High",
    "Credit Card":  "Critical",
    "Email":        "Medium",
    "Password":     "Critical",
  };
  const severity = severityMap[label] || "Medium";
  return { label, redacted, severity };
}

// ── Color by severity ─────────────────────────────────────────────────────────
function severityColor(sev) {
  switch ((sev || "").toLowerCase()) {
    case "critical": return C.purple;
    case "high":     return C.red;
    case "medium":   return C.amber;
    case "low":      return C.blue;
    default:         return C.gray;
  }
}

// ── Main export function ──────────────────────────────────────────────────────
// Parameters (from the tool's API response):
//   message            {string}   — Overall result message
//   totalLinesScanned  {number}   — Total lines scanned across all files
//   sensitiveMatches   {string[]} — Array of redacted match strings, e.g. "[API Key] sk-****abcd"
//   fileNames          {string[]} — List of uploaded file names
//   generatedFiles     {any[]}    — (optional) report metadata from backend
export const generateDataBreachPDF = async ({
  message         = "",
  totalLinesScanned = 0,
  sensitiveMatches = [],
  fileNames        = [],
  generatedFiles   = [],
} = {}) => {
  const { employeeName, employeeMail } = getAuditorInfo();

  const now = new Date();
  const scanDate = now
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase();
  const scanTime = now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // Parse and categorise matches
  const parsed = sensitiveMatches.map(parseMatch);

  const criticalCount = parsed.filter((m) => m.severity === "Critical").length;
  const highCount     = parsed.filter((m) => m.severity === "High").length;
  const mediumCount   = parsed.filter((m) => m.severity === "Medium").length;
  const totalMatches  = parsed.length;

  const riskBand =
    criticalCount > 0 ? "Critical Risk" :
    highCount     > 0 ? "High Risk"     :
    mediumCount   > 0 ? "Medium Risk"   :
    totalMatches  > 0 ? "Low Risk"      : "Clean";

  const riskColor =
    criticalCount > 0 ? C.purple :
    highCount     > 0 ? C.red    :
    mediumCount   > 0 ? C.amber  :
    totalMatches  > 0 ? C.blue   : [22, 163, 74];

  const fileListStr = fileNames.length > 0 ? fileNames.join(", ") : "N/A";

  try {
    const doc = new jsPDF("p", "mm", "a4");

    // ═══════════════════════════════════════════════════════════════════════
    // PAGE 1 — COVER PAGE
    // ═══════════════════════════════════════════════════════════════════════
    doc.setFillColor(...C.bluePrimary);
    doc.rect(0, 0, 210, 3.5, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – Data Breach Detector", 14, 12);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(...C.bluePrimary);
    doc.text("NEXCORE ALLIANCE", 105, 30, { align: "center" });

    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(...C.textMuted);
    doc.text("AI-Powered Cybersecurity & Information Security Solutions", 105, 36, { align: "center" });

    doc.setDrawColor(...C.bluePrimary);
    doc.setLineWidth(0.4);
    doc.line(14, 40, 196, 40);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...C.bluePrimary);
    doc.text("DATA BREACH & SENSITIVE DATA", 105, 54, { align: "center" });
    doc.text("EXPOSURE ASSESSMENT REPORT", 105, 60, { align: "center" });

    doc.line(14, 65, 196, 65);

    renderTable(doc, {
      startY: 72,
      head: [],
      body: [
        ["Assessment Performed by", employeeMail],
        ["Auditor Name",           employeeName],
        ["Auditor Mail ID",        employeeMail],
        ["Files Analyzed",         pdfSafe(fileListStr)],
        ["Total Lines Scanned",    String(totalLinesScanned)],
        ["Assessment Date",        scanDate],
        ["Assessment Time",        scanTime],
        ["Classification",         "Confidential"],
        ["Assessment Status",      "Completed"],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 },
      },
    });

    doc.line(14, 265, 196, 265);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text(
      "www.nexcorealliance.com | ISO/IEC 27001 Certified | AICPA SOC Compliant",
      105, 272, { align: "center" }
    );

    // ═══════════════════════════════════════════════════════════════════════
    // PAGE 2 — ASSESSMENT INFORMATION
    // ═══════════════════════════════════════════════════════════════════════
    doc.addPage();
    let y = 25;

    y = drawSectionHeader(doc, "1. ASSESSMENT INFORMATION", y);

    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Tool Name",             "Data Breach & Sensitive Data Exposure Detector"],
        ["Tool Category",         "Data Security / PII Detection / Secrets Exposure / Compliance Scanning"],
        ["Methodology Alignment", "OWASP A02 Cryptographic Failures | OWASP A09 Security Logging Failures | PCI-DSS | GDPR | HIPAA"],
        ["Compliance Alignment",  "ISO/IEC 27001 | GDPR Article 32 | PCI-DSS Requirement 3 | HIPAA Security Rule"],
        ["Files Analyzed",        pdfSafe(fileListStr)],
        ["Total Lines Scanned",   String(totalLinesScanned)],
        ["Scan Mode",             "Static Content Analysis — Regex-based sensitive pattern detection with Luhn validation"],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 },
      },
    });
    y = doc.lastAutoTable.finalY + 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Tool Overview", 14, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(
      "The Data Breach & Sensitive Data Exposure Detector performs static content analysis across uploaded files to identify hardcoded secrets, leaked credentials, exposed PII, and payment card data. Each uploaded file is scanned independently line-by-line against five pattern categories: API keys (16+ char alphanumeric sequences following api_key/apikey patterns), Bearer tokens (OAuth/JWT authorization headers), email addresses (RFC-compliant pattern), credit card numbers (4-4-4-4 grouping with Luhn checksum validation), and hardcoded password fields. All detected values are redacted before storage or display. Binary files are automatically skipped to prevent false positives from non-text content.",
      14, y,
      { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 }
    );

    // ═══════════════════════════════════════════════════════════════════════
    // PAGE 3 — SCAN SUMMARY
    // ═══════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    y = drawSectionHeader(doc, "2. SCAN SUMMARY", y);

    renderTable(doc, {
      startY: y,
      head: [["Files Analyzed", "Lines Scanned", "Total Matches", "Critical", "High", "Medium", "Risk Level"]],
      body: [[
        String(fileNames.length || 0),
        String(totalLinesScanned),
        String(totalMatches),
        String(criticalCount),
        String(highCount),
        String(mediumCount),
        riskBand,
      ]],
      headStyles: { fillColor: C.bgHeader, textColor: C.white, halign: "center" },
      columnStyles: {
        0: { halign: "center", cellWidth: 28 },
        1: { halign: "center", cellWidth: 28 },
        2: { halign: "center", cellWidth: 26 },
        3: { halign: "center", cellWidth: 22 },
        4: { halign: "center", cellWidth: 22 },
        5: { halign: "center", cellWidth: 22 },
        6: { halign: "center", cellWidth: 34 },
      },
      didParseCell: (data) => {
        if (data.column.index === 6 && data.section === "body") {
          data.cell.styles.textColor = riskColor;
          data.cell.styles.fontStyle = "bold";
        }
        if (data.column.index === 3 && data.section === "body" && criticalCount > 0) {
          data.cell.styles.textColor = C.purple;
          data.cell.styles.fontStyle = "bold";
        }
        if (data.column.index === 4 && data.section === "body" && highCount > 0) {
          data.cell.styles.textColor = C.red;
          data.cell.styles.fontStyle = "bold";
        }
      },
    });
    y = doc.lastAutoTable.finalY + 10;

    // ── Severity Breakdown ────────────────────────────────────────────────
    y = drawSectionHeader(doc, "DETECTION CATEGORY BREAKDOWN", y);

    const categoryMap = {};
    for (const m of parsed) {
      if (!categoryMap[m.label]) categoryMap[m.label] = { count: 0, severity: m.severity };
      categoryMap[m.label].count++;
    }

    if (Object.keys(categoryMap).length > 0) {
      const categoryRows = Object.entries(categoryMap).map(([label, { count, severity }]) => [
        label,
        severity,
        String(count),
        count > 0
          ? severity === "Critical" ? "Immediate remediation required — data exposure risk"
          : severity === "High"     ? "High priority — review and rotate exposed credentials"
          : severity === "Medium"   ? "Moderate — audit and redact where possible"
          : "Review recommended"
          : "None detected",
      ]);

      renderTable(doc, {
        startY: y,
        head: [["Pattern Category", "Severity", "Count", "Action Required"]],
        body: categoryRows,
        headStyles: { fillColor: C.bgHeader, textColor: C.white },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 40 },
          1: { cellWidth: 22, halign: "center" },
          2: { cellWidth: 16, halign: "center" },
          3: { cellWidth: 104 },
        },
        didParseCell: (data) => {
          if (data.column.index === 1 && data.section === "body") {
            const sev = String(data.cell.raw || "");
            data.cell.styles.textColor = severityColor(sev);
            data.cell.styles.fontStyle = "bold";
          }
        },
      });
      y = doc.lastAutoTable.finalY + 10;
    } else {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      doc.setTextColor(...C.textMuted);
      doc.text("No sensitive patterns detected in scanned files.", 14, y + 5);
      y += 16;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PAGE 4 — DETAILED FINDINGS TABLE
    // ═══════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    y = drawSectionHeader(doc, "3. DETAILED FINDINGS — SENSITIVE DATA MATCHES", y);

    if (parsed.length > 0) {
      const findingRows = parsed.map((m, i) => [
        String(i + 1),
        pdfSafe(m.label),
        m.severity,
        pdfSafe(m.redacted),
        m.severity === "Critical"
          ? "Immediately remove and revoke. Treat as compromised."
          : m.severity === "High"
          ? "Rotate credentials. Move to environment variable or secrets manager."
          : m.severity === "Medium"
          ? "Redact from codebase and audit downstream exposure."
          : "Review for compliance and data minimisation requirements.",
      ]);

      renderTable(doc, {
        startY: y,
        head: [["#", "Match Type", "Severity", "Redacted Value", "Recommended Action"]],
        body: findingRows,
        headStyles: { fillColor: C.bgHeader, textColor: C.white },
        columnStyles: {
          0: { cellWidth: 10, halign: "center" },
          1: { cellWidth: 30, fontStyle: "bold" },
          2: { cellWidth: 22, halign: "center" },
          3: { cellWidth: 48 },
          4: { cellWidth: 72 },
        },
        didParseCell: (data) => {
          if (data.column.index === 2 && data.section === "body") {
            data.cell.styles.textColor = severityColor(String(data.cell.raw || ""));
            data.cell.styles.fontStyle = "bold";
          }
        },
      });
      y = doc.lastAutoTable.finalY + 10;
    } else {
      // Clean scan result box
      doc.setFillColor(240, 253, 244);
      doc.setDrawColor(22, 163, 74);
      doc.setLineWidth(0.4);
      doc.roundedRect(14, y, 182, 22, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(22, 163, 74);
      doc.text("[OK]  No sensitive data patterns detected in scanned content.", 20, y + 8);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(22, 100, 50);
      doc.text("All " + String(totalLinesScanned) + " lines passed pattern screening. No API keys, tokens, credit card numbers, emails, or passwords identified.", 20, y + 15);
      y += 30;
    }

    // ── Files Analyzed Reference Table ────────────────────────────────────
    if (fileNames.length > 0) {
      y = drawSectionHeader(doc, "FILES ANALYZED IN THIS SCAN", y);

      renderTable(doc, {
        startY: y,
        head: [["#", "Filename", "Scan Status"]],
        body: fileNames.map((fn, i) => [
          String(i + 1),
          pdfSafe(fn),
          totalMatches > 0 ? "Findings Present" : "Clean",
        ]),
        headStyles: { fillColor: C.bgHeader, textColor: C.white },
        columnStyles: {
          0: { cellWidth: 12, halign: "center" },
          1: { cellWidth: 120, fontStyle: "bold" },
          2: { cellWidth: 50, halign: "center" },
        },
        didParseCell: (data) => {
          if (data.column.index === 2 && data.section === "body") {
            const v = String(data.cell.raw || "");
            if (v === "Findings Present") {
              data.cell.styles.textColor = C.red;
              data.cell.styles.fontStyle = "bold";
            } else {
              data.cell.styles.textColor = [22, 163, 74];
              data.cell.styles.fontStyle = "bold";
            }
          }
        },
      });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PAGE 5 — CONCLUSION & APPENDIX
    // ═══════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    y = drawSectionHeader(doc, "4. CONCLUSION & RECOMMENDATIONS", y);

    const conclusionText =
      totalMatches > 0
        ? `The Data Breach & Sensitive Data Exposure scan of ${fileNames.length} file(s) (${totalLinesScanned.toLocaleString()} lines) identified ${totalMatches} sensitive pattern match(es). ${criticalCount > 0 ? `${criticalCount} CRITICAL finding(s) include probable credit card numbers or hardcoded passwords that should be treated as immediately compromised. ` : ""}${highCount > 0 ? `${highCount} HIGH finding(s) indicate exposed API keys or bearer tokens requiring immediate credential rotation. ` : ""}${mediumCount > 0 ? `${mediumCount} MEDIUM finding(s) include email addresses that may constitute PII under GDPR. ` : ""}The overall risk posture is rated ${riskBand}.`
        : `The Data Breach & Sensitive Data Exposure scan of ${fileNames.length} file(s) (${totalLinesScanned.toLocaleString()} lines) returned no sensitive pattern matches. No API keys, bearer tokens, email addresses, credit card numbers, or hardcoded passwords were detected. The files appear clean of common data exposure patterns.`;

    const recommendationText =
      "It is recommended to: (1) Never hardcode secrets, credentials, or PII in source files — use environment variables or a secrets manager (e.g. AWS Secrets Manager, HashiCorp Vault). (2) Implement a pre-commit hook (e.g. git-secrets, truffleHog) to block accidental credential commits. (3) Rotate any exposed API keys or tokens immediately — treat all detected values as compromised regardless of current validity. (4) Classify and minimise PII storage — email addresses in code files may violate GDPR Article 5(1)(c) data minimisation principles. (5) Audit credit card data handling for PCI-DSS Requirement 3 compliance — card numbers must never appear in source code or logs.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(conclusionText, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });
    y += 34;
    doc.text(recommendationText, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });
    y += 44;

    y = drawSectionHeader(doc, "5. APPENDIX — COLUMN REFERENCE", y);

    renderTable(doc, {
      startY: y,
      head: [["Column / Field", "Description"]],
      body: [
        ["Match Type",       "The category of sensitive pattern detected (API Key, Bearer Token, Email, Credit Card, Password)"],
        ["Severity",         "Risk classification: Critical (payment data / passwords) / High (API keys / tokens) / Medium (PII like email)"],
        ["Redacted Value",   "The matched string with middle characters masked — first 4 and last 4 chars visible only"],
        ["Lines Scanned",    "Total number of lines processed across all uploaded files in the scan"],
        ["Risk Level",       "Overall scan risk band: Critical / High / Medium / Low / Clean based on highest severity finding"],
        ["Luhn Validation",  "Credit card candidates are validated against the Luhn checksum algorithm before flagging"],
        ["Binary Skip",      "Files containing null bytes are skipped — regex scanning on binary content produces garbage matches"],
      ],
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 40 },
        1: { cellWidth: 142 },
      },
    });
    y = doc.lastAutoTable.finalY + 12;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Disclaimer", 14, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(
      "This report is generated from static content analysis using regex-based heuristics and Luhn checksum validation. It does not constitute a full security audit and may not detect obfuscated, encrypted, or format-transformed secrets. All matched values are automatically redacted prior to storage or display — no plaintext sensitive data is retained in this report. This report contains confidential information intended solely for the authorized recipient. Unauthorized disclosure is prohibited without prior written consent from Nexcore Alliance.",
      14, y,
      { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 }
    );

    applyHeaderFooterDecorator(doc, "Data Breach Detector");
    doc.save(`Data_Breach_Detector_Report_${scanDate}.pdf`);
  } catch (err) {
    console.error("Failed to generate Data Breach PDF:", err);
  }
};
