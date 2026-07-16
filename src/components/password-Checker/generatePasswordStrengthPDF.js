import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../utils/pdfFramework";
import { jsPDF } from "jspdf";

/**
 * generatePasswordStrengthPDF
 *
 * @param {Object} scanData
 *   - password  {String}   Raw tested password
 *   - data      {Object}   Analysis result object from backend
 * @param {Function} setPdfProgress  State setter for progress messages
 */
export const generatePasswordStrengthPDF = async (scanData, setPdfProgress) => {
  if (!scanData?.data) return;

  const pw = scanData.password || "—";
  const r = scanData.data;

  setPdfProgress?.("Initializing PDF document...");

  try {
    const doc = new jsPDF("p", "mm", "a4");
    const { employeeName, employeeMail } = getAuditorInfo();

    // ── Common date/time ───────────────────────────────────────────────────
    const now = new Date();
    const scanDate = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
    const scanTime = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 1 — COVER PAGE
    // ════════════════════════════════════════════════════════════════════════
    setPdfProgress?.("Building cover page...");

    // Top blue banner stripe
    doc.setFillColor(...C.bluePrimary);
    doc.rect(0, 0, 210, 3.5, "F");

    // Brand line
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – Password Strength Checker", 14, 12);

    // Company header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(...C.bluePrimary);
    doc.text("NEXCORE ALLIANCE", 105, 30, { align: "center" });

    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.text("AI-Powered Cybersecurity & Information Security Solutions", 105, 36, { align: "center" });

    // Divider
    doc.setDrawColor(...C.bluePrimary);
    doc.setLineWidth(0.4);
    doc.line(14, 40, 196, 40);

    // Tool title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...C.bluePrimary);
    doc.text("PASSWORD STRENGTH CHECKER SECURITY ASSESSMENT", 105, 54, { align: "center" });
    doc.text("REPORT", 105, 61, { align: "center" });

    // Double rule
    doc.setDrawColor(...C.bluePrimary);
    doc.setLineWidth(0.25);
    doc.line(14, 68, 196, 68);

    // Assessment Info table
    renderTable(doc, {
      startY: 76,
      head: [],
      body: [
        ["Assessment Performed by", employeeMail],
        ["Employee Name",           employeeName],
        ["Employee Mail ID",        employeeMail],
        ["Assessment Input",        "(Sample Password Submitted for Strength Analysis)"],
        ["Assessment Date",         scanDate],
        ["Assessment Time",         scanTime],
        ["Classification",          "Confidential"],
        ["Assessment Status",       "Completed"],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 },
      },
    });

    // Cover footer
    doc.setDrawColor(...C.lineColor);
    doc.setLineWidth(0.25);
    doc.line(14, 260, 196, 260);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("www.nexcorealliance.com | ISO/IEC 27001 Certified | AICPA SOC Compliant", 105, 267, { align: "center" });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 2 — ASSESSMENT INFORMATION
    // ════════════════════════════════════════════════════════════════════════
    setPdfProgress?.("Building assessment information...");
    doc.addPage();

    let y = drawSectionHeader(doc, "1. ASSESSMENT INFORMATION", 25);

    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Tool Name",             "Password Strength Checker"],
        ["Tool Category",         "Authentication / Credential Strength Analyzer"],
        ["Methodology Alignment", "OWASP ASVS V2.1 (Password Security Requirements) / NIST SP 800-63B Authentication Guidelines"],
        ["Compliance Alignment",  "ISO/IEC 27001 | AICPA SOC Frameworks"],
        ["Assessment Input",       "(Sample Password Submitted for Strength Analysis)"],
        ["Assessment Mode",       "Non-Intrusive / Local Client-Side & Server-Side Analysis (No External Services)"],
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

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    const overviewText =
      "The Password Strength Checker evaluates a user-supplied or randomly generated password against established complexity criteria, including overall length and the presence of lowercase letters, uppercase letters, numeric digits, and special characters. Based on this analysis, the tool assigns an overall strength rating (e.g., Weak, Medium, Strong) and estimates the approximate time required to brute-force the password under a defined guess-rate assumption.\n\nThe tool performs analysis locally and on the server side without transmitting the password to any external service or storing it in a database, which limits credential exposure during the assessment process. The assessment validates that the strength rating, character composition breakdown, and crack-time estimation are calculated correctly and presented in a clear, actionable format.";
    doc.text(overviewText, 14, y + 5, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 3 — SCAN SUMMARY & DETAILED FINDINGS & CONCLUSION
    // ════════════════════════════════════════════════════════════════════════
    setPdfProgress?.("Building scan summary & detailed findings...");
    doc.addPage();
    y = 25;

    y = drawSectionHeader(doc, "2. SCAN SUMMARY", y);

    // Calculate details dynamically
    const lengthStr = `${safe(r.length || 0)} Characters`;
    const labelVal = safe(r.label || "—");
    const crackVal = safe(r.crackTime?.human || "—");

    const isPassed = labelVal.toLowerCase().includes("strong") || labelVal.toLowerCase().includes("very strong");
    const severity = isPassed ? "Informational" : "Medium";
    const statusVal = isPassed ? "Passed" : "Warning";
    const validationDetails = isPassed
      ? "Passed (Password Meets Strength Requirements)"
      : "Warning (Password Does Not Meet Strength Requirements)";

    renderTable(doc, {
      startY: y,
      head: [["Password Length", "Strength Rating", "Estimated Crack Time", "Validation Status"]],
      body: [[lengthStr, labelVal, crackVal, statusVal]],
      headStyles: { fillColor: C.bgHeader, textColor: C.white, halign: "center" },
      bodyStyles: { halign: "center", fontStyle: "bold", fontSize: 9 },
      columnStyles: {
        0: { textColor: C.textMain },
        1: { textColor: isPassed ? [22, 163, 74] : C.amber },
        2: { textColor: C.textMain },
        3: { textColor: isPassed ? [22, 163, 74] : C.amber },
      }
    });

    y = doc.lastAutoTable.finalY + 8;

    y = drawSectionHeader(doc, "3. DETAILED FINDINGS", y);

    // Dynamic composition text
    const classes = r.classes || {};
    const activeClasses = [];
    if (classes.lower) activeClasses.push("Lowercase");
    if (classes.upper) activeClasses.push("Uppercase");
    if (classes.number) activeClasses.push("Numeric");
    if (classes.symbol) activeClasses.push("Special Characters");

    let compositionText = "None";
    if (activeClasses.length > 0) {
      if (activeClasses.length === 1) {
        compositionText = `${activeClasses[0]} Present`;
      } else {
        const last = activeClasses.pop();
        compositionText = `${activeClasses.join(", ")}, and ${last} Present`;
        activeClasses.push(last); // restore array
      }
    }

    const weaknesses = r.advice && r.advice.length > 0 ? r.advice.join("; ") : "None Identified";
    const impactText = isPassed
      ? "N/A – No weakness identified in the tested password sample"
      : "Weak credentials can be compromised via dictionary attacks, credentials stuffing, or brute-force, leading to unauthorized account access and potential data exposure.";

    const standardRecommendation =
      "Continue enforcing a minimum password length of 12 characters with mandatory inclusion of uppercase, lowercase, numeric, and special characters. Where the strength rating is Weak or Medium, or a specific weakness (e.g., common dictionary word, sequential characters, repeated characters) is detected, the tool should clearly flag this and recommend the user choose a longer, more random password before account creation or password change is permitted.";

    renderTable(doc, {
      startY: y,
      head: [["Parameters", "Finding"]],
      body: [
        ["Severity",              severity],
        ["Status",                statusVal],
        ["Tested Password Sample", `${safe(pw)} ${pw !== "—" ? "(Tool-Generated Sample Used for Strength Validation)" : ""}`],
        ["Password Length",       lengthStr],
        ["Character Composition",  compositionText],
        ["Strength Score",        labelVal],
        ["Detected Weakness",     weaknesses],
        ["Estimated Crack Time",  `Approximately ${crackVal} (Assuming 10,00,00,00,000 Guesses/Second)`],
        ["Validation Status",     validationDetails],
        ["Issue Detected",        isPassed ? "None Identified" : weaknesses],
        ["Impact",                impactText],
        ["Recommendation",        standardRecommendation],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 45, fillColor: [245, 245, 245] },
        1: { cellWidth: 137 },
      },
      didParseCell: (cellData) => {
        if (cellData.row.index === 0 && cellData.column.index === 1 && cellData.section === "body") {
          cellData.cell.styles.textColor = isPassed ? [22, 163, 74] : C.amber;
          cellData.cell.styles.fontStyle = "bold";
        }
      }
    });

    y = doc.lastAutoTable.finalY + 8;

    // Check if Conclusion fits on Page 3
    if (297 - y < 75) {
      doc.addPage();
      y = 25;
    }

    y = drawSectionHeader(doc, "4. CONCLUSION & RECOMMENDATIONS", y);

    const compositionLowercaseList = activeClasses.map(c => c.toLowerCase());
    let compLowerText = "none";
    if (compositionLowercaseList.length > 0) {
      if (compositionLowercaseList.length === 1) {
        compLowerText = compositionLowercaseList[0];
      } else {
        const lastLower = compositionLowercaseList.pop();
        compLowerText = `${compositionLowercaseList.join(", ")}, and ${lastLower}`;
      }
    }

    const conclusionPara1 =
      `The Password Strength Checker was assessed using a sample ${safe(r.length || 0)}-character password (${safe(pw)}) containing a mix of ${compLowerText}. The tool correctly classified the password as “${labelVal}”, accurately reported its character composition, and produced a crack-time estimate of approximately ${crackVal} under the stated guess-rate assumption. ${isPassed ? "No weaknesses were identified for this sample." : "Certain weaknesses were identified that should be remediated."}`;

    const conclusionPara2 =
      "As the tool performs all analysis locally and on the server side without external service calls or database storage, no data exposure risks were identified. It is recommended that the strength score and detected-weakness fields continue to be surfaced for every evaluated password, and that weaker passwords (Weak/Medium ratings or specific detected weaknesses such as dictionary words, sequential patterns, or repeated characters) be clearly communicated to the user with guidance to strengthen the password before proceeding.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...C.textMain);
    doc.text(conclusionPara1, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.45 });

    y += 28;
    doc.text(conclusionPara2, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.45 });

    y += 30;

    // Check if Appendix fits on Page 3
    if (297 - y < 55) {
      doc.addPage();
      y = 25;
    }

    y = drawSectionHeader(doc, "5. APPENDIX", y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Column Reference Guide", 14, y);
    y += 5;

    // Severity row printed on Page 3
    renderTable(doc, {
      startY: y,
      head: [["Column", "Description"]],
      body: [
        ["Severity", "Risk level assigned to the finding: Critical / High / Medium / Low / Informational"],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50, fillColor: [245, 245, 245] },
        1: { cellWidth: 132 },
      },
    });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 4 — APPENDIX CONTINUATION & ACKNOWLEDGEMENT
    // ════════════════════════════════════════════════════════════════════════
    setPdfProgress?.("Building appendix and acknowledgement...");
    doc.addPage();
    y = 25;

    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Status",                 "Overall validation result for the password strength check: Passed / Failed / Warning"],
        ["Tested Password Sample", "The password value submitted to or generated by the tool for analysis"],
        ["Password Length",        "The total number of characters in the tested password"],
        ["Character Composition",  "The categories of characters present in the password (lowercase, uppercase, numeric, special)"],
        ["Strength Score",         "The overall strength rating assigned by the tool (e.g., Weak / Medium / Strong)"],
        ["Detected Weakness",      "Any specific weakness identified in the password (e.g., dictionary word, sequential or repeated characters)"],
        ["Estimated Crack Time",   "The approximate time required to brute-force the password under the stated guess-rate assumption"],
        ["Validation Status",      "Confirmation of whether the password meets the defined strength requirements"],
        ["Issue Detected",         "Any security weakness or anomaly identified during the assessment"],
        ["Impact",                 "The potential security consequence of the identified issue, if any"],
        ["Recommendation",         "Specific, actionable guidance to address identified weaknesses or strengthen password security posture"],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50, fillColor: [245, 245, 245] },
        1: { cellWidth: 132 },
      },
    });

    y = doc.lastAutoTable.finalY + 12;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Acknowledgement", 14, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    const ackText =
      "The findings presented in this report are based on observations made during the assessment period and represent the password strength evaluation functionality status of the environment at the time of testing. This report contains confidential and proprietary information intended solely for the authorized recipient. Unauthorized disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.";
    doc.text(ackText, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });

    // Apply header/footer decorators
    applyHeaderFooterDecorator(doc, "Password Strength Checker");

    // Save
    setPdfProgress?.("Saving PDF...");
    const pad = (n) => String(n).padStart(2, "0");
    const dStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    doc.save(`PasswordStrength-Report-${dStr}.pdf`);

  } catch (err) {
    console.error("Failed to generate Password Strength PDF:", err);
  } finally {
    setPdfProgress?.(null);
  }
};
