import { jsPDF } from "jspdf";
import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../utils/pdfFramework";

export const generateWhatsappPDF = async (score = 0, messages = [], settings = {}, imagesCount = 2) => {
  const { employeeName, employeeMail } = getAuditorInfo();
  
  // Format dates
  const now = new Date();
  const scanDate = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  const scanTime = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  try {
    const doc = new jsPDF("p", "mm", "a4");

    const totalEvaluated = Object.keys(settings).length;
    const assessmentStatus = totalEvaluated > 0 ? "Completed" : "Incomplete";
    const issuesCount = messages.length;
    const validationStatus = totalEvaluated > 0 ? (issuesCount > 0 ? "Failed (Issues Found)" : "Passed (No Issues Found)") : "Failed (Issues Found)";

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 1 — COVER PAGE
    // ════════════════════════════════════════════════════════════════════════
    // Top blue banner stripe
    doc.setFillColor(...C.bluePrimary);
    doc.rect(0, 0, 210, 3.5, "F");

    // Brand line
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – WhatsApp Privacy Inspector", 14, 12);

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

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...C.bluePrimary);
    doc.text("WHATSAPP PRIVACY INSPECTOR SECURITY ASSESSMENT", 105, 54, { align: "center" });
    doc.text("REPORT", 105, 60, { align: "center" });

    // Divider below title
    doc.line(14, 65, 196, 65);

    // Assessment Info table
    renderTable(doc, {
      startY: 72,
      head: [],
      body: [
        ["Assessment Performed by", employeeMail],
        ["Employee Name",           employeeName],
        ["Employee Mail ID",        employeeMail],
        ["Scanned Target",          "WhatsApp Account Settings"],
        ["Assessment Date",         scanDate],
        ["Assessment Time",         scanTime],
        ["Classification",          "Confidential"],
        ["Assessment Status",       assessmentStatus],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 },
      },
    });

    // Cover footer line
    doc.line(14, 260, 196, 260);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("www.nexcorealliance.com | ISO/IEC 27001 Certified | AICPA SOC Compliant", 105, 267, { align: "center" });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 2 — ASSESSMENT INFORMATION
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    let y = 25;

    y = drawSectionHeader(doc, "1. ASSESSMENT INFORMATION", y);

    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Tool Name",             "WhatsApp Privacy Inspector"],
        ["Tool Category",         "Privacy Configuration / Social Media Exposure Analyser"],
        ["Methodology Alignment", "OWASP WSTG – OTG-INFO / Privacy & Configuration Review"],
        ["Compliance Alignment",  "ISO/IEC 27001 | AICPA SOC Frameworks"],
        ["Scanned Target",        "WhatsApp Account Settings"],
        ["Assessment Mode",       "Non-Intrusive / Automated Screenshot-Based Analysis"],
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

    const overviewText =
      "The WhatsApp Privacy Inspector tool evaluates the privacy configuration of a WhatsApp account by analysing user-submitted screenshots or exported settings data. It assesses exposure-related controls such as last seen status, profile photo visibility, status visibility, read receipts, and group privacy settings, and produces an overall privacy score with associated messages and recommendations. Misconfigured privacy settings increase exposure to unsolicited contact, social engineering, profiling, and unauthorized group additions.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(overviewText, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 3 — SCAN SUMMARY & DETAILED FINDINGS
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    y = drawSectionHeader(doc, "2. SCAN SUMMARY", y);

    renderTable(doc, {
      startY: y,
      head: [["Settings Evaluated", "Privacy Score", "Issues Identified", "Assessment Status"]],
      body: [
        [
          String(totalEvaluated),
          `${score} / 100`,
          String(issuesCount),
          assessmentStatus
        ]
      ],
      headStyles: { fillColor: C.bgHeader, textColor: C.white, halign: "center" },
      columnStyles: {
        0: { halign: "center", cellWidth: 40 },
        1: { halign: "center", cellWidth: 35 },
        2: { halign: "center", cellWidth: 35 },
        3: { halign: "center", cellWidth: 72 },
      },
      didParseCell: (data) => {
        if (data.column.index === 3 && data.section === "body") {
          if (totalEvaluated === 0) {
            data.cell.styles.textColor = C.red;
            data.cell.styles.fontStyle = "bold";
          } else {
            data.cell.styles.textColor = [22, 163, 74];
            data.cell.styles.fontStyle = "bold";
          }
        }
      }
    });
    y = doc.lastAutoTable.finalY + 8;

    y = drawSectionHeader(doc, "3. DETAILED FINDINGS", y);

    // Format fields depending on whether data was successfully parsed
    const lastSeenVal = settings["last seen and online"] 
      ? String(settings["last seen and online"]) 
      : (totalEvaluated > 0 ? "My Contacts" : "Not Evaluated – No data extracted from submitted screenshot");

    const readReceiptsVal = settings["read receipts"] 
      ? String(settings["read receipts"]).toUpperCase() 
      : (totalEvaluated > 0 ? "ENABLED" : "Not Evaluated – No data extracted from submitted screenshot");

    const groupsVal = settings["groups"] 
      ? String(settings["groups"]) 
      : (totalEvaluated > 0 ? "My Contacts" : "Not Evaluated – No data extracted from submitted screenshot");

    const issueText = totalEvaluated === 0
      ? "The tool completed authentication and executed the analysis routine; however, no WhatsApp privacy settings or message data were extracted from the submitted screenshot. The Settings object returned empty, and no messages were processed."
      : `Exposure risks or configuration weaknesses identified in account visibility controls. ${messages.join(" ")}`;

    const impactText = totalEvaluated === 0
      ? "Without extracted setting values, the assessment cannot determine the account’s actual exposure to unsolicited contact, profiling, social engineering, or unauthorized group additions. A privacy score of 0 does not reflect a genuine security posture and may misinform remediation priorities."
      : "Exposed visibility settings increase the account's digital footprint. Public status updates, profile pictures, or group addition permissions expose the user to unsolicited contact, profile harvesting, targeted social engineering, and spam groups.";

    const recommendationText = totalEvaluated === 0
      ? "Verify that the input parser correctly handles the submitted screenshot format and extracts key-value pairs for Last Seen, Profile Photo, Status, Read Receipts, and Group Privacy settings prior to score calculation. Re-run the assessment using a clearer, higher-resolution screenshot of the WhatsApp privacy settings page. Until extraction is corrected, the resulting privacy score should not be relied upon for reporting or remediation decisions."
      : "Restrict visibility properties. Re-configure Last Seen & Online, Profile Picture, and Groups settings to 'My Contacts' or 'Nobody'. Disable Read Receipts if you do not wish others to trace read timestamps. Regularly check advanced configurations for IP protection in calls and disabled link previews.";

    const detailedBody = [
      ["Severity",                    totalEvaluated === 0 ? "High" : score >= 80 ? "Informational" : score >= 50 ? "Medium" : "High"],
      ["Status",                      totalEvaluated === 0 ? "Failed" : score >= 80 ? "Passed" : "Warning"],
      ["Setting / Parameter Evaluated", "WhatsApp Privacy Configuration (Last Seen, Profile Photo, Status, Read Receipts, Group Privacy)"],
      ["Validation Status",            validationStatus],
      ["Last Seen / Online Visibility", lastSeenVal],
      ["Read Receipts Status",         readReceiptsVal],
      ["Group Privacy Settings",       groupsVal],
      ["Privacy Score",                `${score} / 100`],
      ["Issue Detected",              issueText],
      ["Impact",                      impactText],
      ["Files / Patterns Scanned",    `${imagesCount} (Screenshot / Exported Settings File)`],
      ["Scan Result Summary",         totalEvaluated > 0 ? "Analysis Completed" : "Analysis Incomplete – No Privacy Configuration Data Extracted"],
      ["Recommendation",              recommendationText],
    ];

    renderTable(doc, {
      startY: y,
      head: [["Parameter", "Details"]],
      body: detailedBody,
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55 },
        1: { cellWidth: 127 },
      },
      didParseCell: (data) => {
        if (data.column.index === 1 && data.section === "body") {
          if (data.row.index === 0) { // Severity row
            const val = String(data.cell.raw || "");
            if (val === "High") data.cell.styles.textColor = C.red;
            if (val === "Medium") data.cell.styles.textColor = C.amber;
            if (val === "Informational") data.cell.styles.textColor = [22, 163, 74];
            data.cell.styles.fontStyle = "bold";
          }
          if (data.row.index === 1) { // Status row
            const val = String(data.cell.raw || "");
            if (val === "Failed") data.cell.styles.textColor = C.red;
            if (val === "Warning") data.cell.styles.textColor = C.amber;
            if (val === "Passed") data.cell.styles.textColor = [22, 163, 74];
            data.cell.styles.fontStyle = "bold";
          }
        }
      }
    });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 4 — CONCLUSION & RECOMMENDATIONS
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    y = drawSectionHeader(doc, "4. CONCLUSION & RECOMMENDATIONS", y);

    const conclusionText1 = totalEvaluated === 0
      ? "The WhatsApp Privacy Inspector assessment did not return a usable privacy configuration profile for the scanned account. The tool authenticated successfully and executed the analysis workflow, but the Settings and Messages fields returned empty, resulting in a Privacy Score of 0. This outcome indicates a data-extraction failure rather than a confirmed absence of privacy controls."
      : `The WhatsApp Privacy Inspector assessment successfully analyzed the visibility settings of the scanned account. With a Privacy Score of ${score}/100, the configuration exhibits ${score >= 80 ? "a hardened and private profile" : score >= 50 ? "moderate privacy exposures that require configuration tweaks" : "critical privacy exposures that allow public data harvesting"}.`;

    const conclusionText2 = totalEvaluated === 0
      ? "It is recommended that the extraction logic be reviewed to ensure WhatsApp privacy parameters — including Last Seen / Online Visibility, Read Receipts Status, and Group Privacy Settings — are correctly parsed from the submitted input. The assessment should be re-run with a valid, complete screenshot or export of the WhatsApp privacy settings page before the Privacy Score is used for risk reporting. Once extraction is functioning correctly, findings should be prioritised based on settings that increase direct exposure to unknown contacts, such as Last Seen, Profile Photo, and Group Privacy."
      : "It is recommended that privacy properties be systematically audited and restricted. Enforce 'My Contacts' as the global baseline for Last Seen, Profile Picture, Status, and Groups. Disable read receipts to prevent read-state tracking, and turn on App Lock to protect locally stored database conversations from device-access exposures. Regularly re-run this assessment to prevent updates from resetting settings values.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(conclusionText1, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });
    y += 18;

    doc.text(conclusionText2, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });
    y += 26;

    y = drawSectionHeader(doc, "5. APPENDIX", y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Column Reference Guide", 14, y);
    y += 5;

    const appendixPart1 = [
      ["Severity", "Risk level assigned to the privacy configuration issue: Critical / High / Medium / Low / Informational"],
      ["Status", "Validation result for the evaluated setting: Passed | Failed | Warning | Informational"],
      ["Setting / Parameter Evaluated", "The WhatsApp privacy setting or configuration item assessed during the scan"],
      ["Validation Status", "Overall validation result for the assessed settings: Passed / Failed (Issues Found)"],
      ["Last Seen / Online Visibility", "The configuration state of the Last Seen and Online status visibility control"],
      ["Read Receipts Status", "The configuration state of the Read Receipts privacy control"],
      ["Group Privacy Settings", "The configuration state governing who can add the user to groups"],
    ];

    renderTable(doc, {
      startY: y,
      head: [["Column", "Description"]],
      body: appendixPart1,
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55 },
        1: { cellWidth: 127 },
      }
    });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 5 — APPENDIX CONTINUED & ACKNOWLEDGEMENT
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    const appendixPart2 = [
      ["Privacy Score", "A composite score representing the overall privacy posture of the account based on evaluated settings"],
      ["Issue Detected", "The specific weakness or gap identified during the assessment (e.g. data not extracted, setting set to public)"],
      ["Impact", "The privacy or security risk introduced by the identified issue (e.g. unsolicited contact, profiling, unauthorized group additions)"],
      ["Files / Patterns Scanned", "The number of screenshots or exported configuration files submitted and analysed during the scan"],
      ["Scan Result Summary", "A concise summary of the overall outcome of the privacy configuration scan"],
      ["Recommendation", "Specific, actionable remediation guidance for the identified issue"],
    ];

    renderTable(doc, {
      startY: y,
      head: [["Column", "Description"]],
      body: appendixPart2,
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55 },
        1: { cellWidth: 127 },
      }
    });
    y = doc.lastAutoTable.finalY + 12;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Acknowledgement", 14, y);
    y += 6;

    const ackText =
      "The findings presented in this report are based on observations made during the assessment period and represent the WhatsApp privacy configuration status of the account at the time of scanning. This report contains confidential and proprietary information intended solely for the authorized recipient. Unauthorized disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(ackText, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });

    // Apply running headers/footers to all pages using the shared decorator
    applyHeaderFooterDecorator(doc, "WhatsApp Privacy Inspector");

    // Save PDF
    doc.save(`WhatsApp_Privacy_Assessment_Report_${scanDate}.pdf`);

  } catch (err) {
    console.error("Failed to generate WhatsApp Privacy PDF:", err);
  }
};
