import { jsPDF } from "jspdf";
import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../utils/pdfFramework";

// Static lookup maps for Obfuscation Severity and Recommendations
const staticObfuscationMap = {
  Low: {
    impact: "No malicious obfuscation or code hiding techniques detected. Code readability and structural patterns conform to standard development baselines.",
    remediation: "No immediate remediation is required for the analyzed file. Continue to submit files for routine obfuscation checks as part of the secure code review lifecycle. Ensure that any future modifications to the file are scanned prior to deployment."
  },
  Medium: {
    impact: "Moderate obfuscation indicators detected (e.g. minor encoding or excessive short variable names). May slightly hinder code reviews and audits.",
    remediation: "Refactor short variable names to be descriptive. Review any base64/hex/unicode encoded strings and document or extract them to config files."
  },
  High: {
    impact: "High level of code obfuscation detected (e.g. eval/Function constructors, deep string splits, or complex encoding). Hides logical execution path and exposes code to supply chain threats.",
    remediation: "Immediately inspect the source file. Replace dynamic evaluation (eval, Function) with safe alternatives. Deobfuscate all encoded strings and perform a thorough security review of the code logic."
  },
  Critical: {
    impact: "Severe code obfuscation. Multiple critical indicators (eval, base64 payloads, dynamic properties, timeouts) are present. Likely indicates intentional attempt to hide malicious behavior or malware.",
    remediation: "Quarantine the file and prevent deployment. Decode all base64 and dynamic payloads. Audit file origin and verify integrity against clean repositories."
  }
};

export const generateObfuscationPDF = async (result, setPdfProgress) => {
  if (!result?.results?.length) return;
  if (setPdfProgress) setPdfProgress("Initializing PDF document...");

  const { employeeName, employeeMail } = getAuditorInfo();

  try {
    const doc = new jsPDF("p", "mm", "a4");
    
    // Dates
    const scanDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
    const scanTime = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    // Loop through each file result and generate 4 pages for each
    for (let idx = 0; idx < result.results.length; idx++) {
      const r = result.results[idx];
      if (idx > 0) {
        doc.addPage();
      }

      let y = 0;
      const fileName = r.name || "pasted-code.js";
      const fileType = fileName.split(".").pop().toUpperCase() || "JS";
      const score = r.score || 0;
      const severity = r.severity || "Low";
      const metrics = r.metrics || {};
      
      // Calculate suspicious indicators detected
      const totalSuspicious = Object.values(metrics).reduce((a, b) => a + (Number(b) || 0), 0);
      const overallAssessment = score > 60 ? "High Obfuscation" : score > 30 ? "Medium Obfuscation" : score > 10 ? "Low Obfuscation" : "Clean";

      // ══════════════════════════════════════════════════════════════════════
      // PAGE 1 — COVER PAGE
      // ══════════════════════════════════════════════════════════════════════
      if (setPdfProgress) setPdfProgress(`Building cover page for ${fileName}...`);

      // Top blue banner stripe
      doc.setFillColor(...C.bluePrimary);
      doc.rect(0, 0, 210, 3.5, "F");

      // Brand line
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...C.textMuted);
      doc.text("NEXCORE ALLIANCE | Individual Tool Report – Obfuscation Detector", 105, 12, { align: "center" });

      // Company header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor(...C.bluePrimary);
      doc.text("NEXCORE ALLIANCE", 105, 30, { align: "center" });

      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.text("AI-Powered Cybersecurity & Information Security Solutions", 105, 36, { align: "center" });

      // Divider line
      doc.setDrawColor(...C.bluePrimary);
      doc.setLineWidth(0.4);
      doc.line(14, 40, 196, 40);

      // Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(...C.bluePrimary);
      doc.text("OBFUSCATION DETECTOR SECURITY ASSESSMENT REPORT", 105, 58, { align: "center" });

      // Double divider under title
      doc.setDrawColor(...C.bluePrimary);
      doc.setLineWidth(0.25);
      doc.line(14, 70, 196, 70);
      doc.line(14, 71, 196, 71);

      // Assessment Info Table
      renderTable(doc, {
        startY: 78,
        head: [],
        body: [
          ["Assessment Performed by", employeeMail],
          ["Employee Name",           employeeName],
          ["Employee Mail ID",        employeeMail],
          ["Target Input",           fileName],
          ["Assessment Date",        scanDate],
          ["Assessment Time",        scanTime],
          ["Classification",         "Confidential"],
          ["Assessment Status",       "Completed"]
        ],
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
          1: { cellWidth: 127 }
        },
      });

      // Cover Page Footer info
      doc.setDrawColor(...C.lineColor);
      doc.setLineWidth(0.25);
      doc.line(14, 260, 196, 260);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...C.textMuted);
      doc.text("www.nexcorealliance.com | ISO/IEC 27001 Certified | AICPA SOC Compliant", 105, 267, { align: "center" });

      // ══════════════════════════════════════════════════════════════════════
      // PAGE 2 — ASSESSMENT INFORMATION
      // ══════════════════════════════════════════════════════════════════════
      if (setPdfProgress) setPdfProgress(`Building assessment info for ${fileName}...`);
      doc.addPage();

      y = drawSectionHeader(doc, "1. ASSESSMENT INFORMATION", 25);

      // Tool details grid header label
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...C.bluePrimary);
      doc.text("Tool Details", 14, y);
      y += 5;

      // Tool details grid
      renderTable(doc, {
        startY: y,
        head: [],
        body: [
          ["Tool Name",             "Obfuscation Detector"],
          ["Tool Category",         "Code Security / Obfuscation Analysis"],
          ["Methodology Alignment", "OWASP Code Review Guide / Static Analysis"],
          ["Compliance Alignment",  "ISO/IEC 27001 | AICPA SOC Frameworks"],
          ["Target Input",           fileName],
          ["Assessment Mode",       "Non-Intrusive / Automated Static Code Analysis"]
        ],
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
          1: { cellWidth: 127 }
        }
      });

      y = doc.lastAutoTable.finalY + 10;

      // Tool Overview Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...C.bluePrimary);
      doc.text("Tool Overview", 14, y);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...C.textMain);
      const overviewText = "The Obfuscation Detector tool performs static analysis on submitted source files to identify indicators of code obfuscation. The tool evaluates multiple obfuscation metrics including short variable names, encoded strings, eval usage, function constructor calls, immediately invoked function expressions, unicode escapes, dynamic property access, string splits, dead code, and setTimeout string usage. A composite obfuscation score is computed based on the presence and frequency of these indicators, and a severity level is assigned reflecting the overall obfuscation risk of the analyzed file.";

      doc.text(overviewText, 14, y + 6, { maxWidth: 182, align: "justify", lineHeightFactor: 1.45 });

      // ══════════════════════════════════════════════════════════════════════
      // PAGE 3 — SCAN SUMMARY, DETAILED FINDINGS & CONCLUSION
      // ══════════════════════════════════════════════════════════════════════
      if (setPdfProgress) setPdfProgress(`Building findings & conclusion for ${fileName}...`);
      doc.addPage();
      y = 25;

      // Section 2: Scan Summary
      y = drawSectionHeader(doc, "2. SCAN SUMMARY", y);

      // Render Scan Summary table
      renderTable(doc, {
        startY: y,
        head: [["Files Analyzed", "Obfuscation Score", "Suspicious Indicators Detected", "Overall Assessment"]],
        body: [[
          "1",
          `${score} / 100`,
          String(totalSuspicious),
          overallAssessment
        ]],
        headStyles: {
          fillColor: C.bgHeader,
          textColor: C.white,
          halign: "center",
        },
        bodyStyles: {
          halign: "center",
          fontStyle: "bold",
          fontSize: 9,
        },
        columnStyles: {
          0: { textColor: C.textMain },
          1: { textColor: score > 30 ? C.red : C.blue },
          2: { textColor: totalSuspicious > 0 ? C.red : C.blue },
          3: { textColor: overallAssessment === "Clean" ? [16, 185, 129] : C.red }
        }
      });

      y = doc.lastAutoTable.finalY + 10;

      // Section 3: Detailed findings
      y = drawSectionHeader(doc, "3. DETAILED FINDINGS", y);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...C.bluePrimary);
      doc.text("Findings", 14, y);
      y += 5;

      const metricPairs = Object.entries(metrics).map(([k, v]) => `${k}=${v}`).join(", ");
      const detectionSummaryText = totalSuspicious > 0
        ? `Obfuscation indicators were detected: ${r.issues?.join("; ") || "various encoding patterns found."}`
        : "No obfuscation indicators were detected across all evaluated metrics. All metric values returned zero, and no code highlights or suspicious token patterns were identified in the submitted file.";

      const repInfo = staticObfuscationMap[severity] || staticObfuscationMap.Low;
      const recommendationText = repInfo.remediation;

      // Render Detailed Findings table
      renderTable(doc, {
        startY: y,
        head: [["Metric", "Value"]],
        body: [
          ["File Name",          fileName],
          ["File Type",          fileType],
          ["Obfuscation Score",  `${score} / 100`],
          ["Severity",           severity.toUpperCase()],
          ["Obfuscation Metrics", metricPairs],
          ["Detection Findings",  detectionSummaryText],
          ["Recommendation",     recommendationText]
        ],
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 45, fillColor: [245, 245, 245] },
          1: { cellWidth: 137 }
        },
        styles: {
          font: "helvetica",
          fontSize: 8,
        },
        didParseCell: (parsedCell) => {
          if (parsedCell.column.index === 1 && parsedCell.row.index === 3) {
            parsedCell.cell.styles.textColor = severity === "Low" ? [16, 185, 129] : C.red;
            parsedCell.cell.styles.fontStyle = "bold";
          }
        }
      });

      y = doc.lastAutoTable.finalY + 12;

      // Draw Section 4: Conclusion & recommendations
      y = drawSectionHeader(doc, "4. CONCLUSION & RECOMMENDATIONS", y);

      const conclusionText = `The Obfuscation Detector assessment of ${fileName} returned an obfuscation score of ${score}/100 with a severity rating of ${severity}. ` +
        (totalSuspicious > 0
          ? `Analysis of the file identified metrics of: ${metricPairs}. Specifically, ${r.issues?.join(", ") || "suspicious encoding patterns"} were flagged.`
          : `All ten obfuscation metrics — shortVarsCount, encodedStringsCount, evalCount, functionCtorCount, iifeCount, unicodeEscapesCount, dynamicPropsCount, stringSplitsCount, deadCodeCount, and setTimeoutStringCount — returned a value of zero. No code highlights or suspicious token patterns were identified in the file.`);

      const actionText = repInfo.remediation;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...C.textMain);
      doc.text(conclusionText, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.45 });
      y += doc.splitTextToSize(conclusionText, 182).length * 4.5 + 8;

      doc.setFont("helvetica", "bold");
      doc.text("Security Recommendation:", 14, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.text(actionText, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.45 });

      // ══════════════════════════════════════════════════════════════════════
      // PAGE 4 — APPENDIX & ACKNOWLEDGEMENT
      // ══════════════════════════════════════════════════════════════════════
      if (setPdfProgress) setPdfProgress(`Building appendix for ${fileName}...`);
      doc.addPage();
      y = 25;

      // Draw Section 5: Appendix Start
      y = drawSectionHeader(doc, "5. APPENDIX", y);

      // Column Reference Guide Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...C.bluePrimary);
      doc.text("Column Reference Guide", 14, y);

      // Render reference guide table
      renderTable(doc, {
        startY: y + 5,
        head: [["Column", "Description"]],
        body: [
          ["Files Analyzed", "Total number of source files analyzed during the assessment."],
          ["Obfuscation Score", "Composite score (0–100) representing the overall level of code obfuscation detected in the analyzed file(s)."],
          ["Suspicious Indicators Detected", "Total number of obfuscation indicators identified during the scan, such as eval() usage, encoded strings, or dynamic property access."],
          ["Overall Assessment", "Overall security assessment of the analyzed code based on the computed obfuscation score (Clean, Low, Medium, or High Obfuscation)."],
          ["File Name", "Name of the source file submitted for obfuscation analysis."],
          ["File Type", "Programming language or file format of the analyzed file (e.g., JavaScript, TypeScript, CSS)."],
          ["Severity", "Risk level assigned based on the obfuscation score (Low, Medium, High, or Critical)."],
          ["Obfuscation Metrics", "Individual metric values recorded during analysis, including indicators such as evalCount, functionCtorCount, encodedStringsCount, dynamicPropsCount, iifeCount, unicodeEscapesCount, stringSplitsCount, deadCodeCount, and setTimeoutStringCount."],
          ["Detection Findings", "Summary of suspicious obfuscation techniques or unsafe coding constructs identified during the assessment."],
          ["Recommendation", "Actionable guidance to remediate identified issues and improve code readability, maintainability, and security."]
        ],
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 45, fillColor: [245, 245, 245] },
          1: { cellWidth: 137 }
        }
      });

      y = doc.lastAutoTable.finalY + 12;

      // Acknowledgement Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...C.bluePrimary);
      doc.text("Acknowledgement", 14, y);

      const ackText = "The findings presented in this report are based on observations made during the assessment period and represent the obfuscation security posture of the submitted file at the time of scanning. This report contains confidential and proprietary information intended solely for the authorized recipient. Unauthorized disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.";

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...C.textMain);
      doc.text(ackText, 14, y + 6, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });
    }

    // Apply header & footer decorator to all pages
    applyHeaderFooterDecorator(doc, "Obfuscation Detector");

    if (setPdfProgress) setPdfProgress("Saving PDF...");
    doc.save(`Obfuscation-Detector-Report-${Date.now()}.pdf`);
  } catch (err) {
    console.error("Failed to generate Obfuscation PDF report:", err);
  } finally {
    if (setPdfProgress) setPdfProgress(null);
  }
};
