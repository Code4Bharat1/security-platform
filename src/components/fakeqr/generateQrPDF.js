import { jsPDF } from "jspdf";
import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../utils/pdfFramework";

export const generateQrPDF = async (result = {}, filename = "qr-code-image.jpg") => {
  const { employeeName, employeeMail } = getAuditorInfo();
  
  // Format dates
  const now = new Date();
  const scanDate = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  const scanTime = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const decodedData = result.data || "—";
  const status = result.status || "safe";
  const isSuspicious = status === "fake";
  const riskScore = isSuspicious ? 75 : 0;
  const rating = isSuspicious ? "High Risk" : "Safe";

  try {
    const doc = new jsPDF("p", "mm", "a4");

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
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – QR Code Scanner", 14, 12);

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
    doc.text("QR CODE SAFETY SCANNER SECURITY ASSESSMENT", 105, 54, { align: "center" });
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
        ["Scanned Filename",        filename],
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
        ["Tool Name",             "QR Code Safety Scanner"],
        ["Tool Category",         "Mobile Phishing / QR Threat Intelligence Analyzer"],
        ["Methodology Alignment", "OWASP WSTG – OTG-INFO / QR Code Safety Analysis"],
        ["Compliance Alignment",  "ISO/IEC 27001 | AICPA SOC Frameworks"],
        ["Scanned Filename",      filename],
        ["Assessment Mode",       "Non-Intrusive / Automated Metadata & Payload Review"],
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
      "The QR Code Safety Scanner tool analyzes QR codes to identify malicious destinations, phishing attempts, unsafe URLs, embedded payloads, suspicious metadata, and security risks. It decodes QR contents, inspects embedded links, and performs reputation analysis to prevent mobile social engineering, malware delivery channels, and credential harvesting sweeps.";

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
      head: [["Scanned Target / Image", "Risk Score", "Security Verdict", "Assessment Status"]],
      body: [
        [
          filename,
          `${riskScore} / 100`,
          rating,
          "Completed"
        ]
      ],
      headStyles: { fillColor: C.bgHeader, textColor: C.white, halign: "center" },
      columnStyles: {
        0: { halign: "center", cellWidth: 55 },
        1: { halign: "center", cellWidth: 35 },
        2: { halign: "center", cellWidth: 45 },
        3: { halign: "center", cellWidth: 47 },
      },
      didParseCell: (data) => {
        if (data.column.index === 2 && data.section === "body") {
          if (isSuspicious) {
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

    const severityText = isSuspicious ? "High" : "Informational";
    const statusText = isSuspicious ? "Warning" : "Passed";
    const classification = result.is_url ? "URL Link" : "Plain Text / Command";
    const verdictRaw = result.verdict || "SAFE";
    const displayVerdict = verdictRaw;
    const issueText = result.risk || "None. The QR code passes basic threat filter checks.";
    const impactText = isSuspicious 
      ? "Embedded link redirection or malicious downloads could result in network intrusions, credential harvesting, or browser hijacking."
      : "No security impact identified. The payload does not present an elevated risk.";
    const suggestion = result.suggestion || "Standard safe QR. Continue monitoring.";

    renderTable(doc, {
      startY: y,
      head: [["Parameter", "Details"]],
      body: [
        ["Severity",                    severityText],
        ["Status",                      statusText],
        ["Decoded Data / Content",      decodedData],
        ["Payload Classification",      classification],
        ["Verdict Status",              displayVerdict],
        ["Issue Detected",              issueText],
        ["Impact Analysis",             impactText],
        ["Remediation Action",          suggestion],
      ],
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55 },
        1: { cellWidth: 127 },
      },
      didParseCell: (data) => {
        if (data.column.index === 1 && data.section === "body") {
          if (data.row.index === 0) { // Severity row
            if (isSuspicious) data.cell.styles.textColor = C.red;
            else data.cell.styles.textColor = [22, 163, 74];
            data.cell.styles.fontStyle = "bold";
          }
          if (data.row.index === 1) { // Status row
            if (isSuspicious) data.cell.styles.textColor = C.red;
            else data.cell.styles.textColor = [22, 163, 74];
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

    const conclusionText1 = isSuspicious
      ? `The QR Code safety assessment for target image ${filename} detected suspicious redirect patterns or command executions. The payload was resolved to "${decodedData}". Due to the presence of flagged keywords or shorteners, the scan generated a risk score of ${riskScore}/100.`
      : `The QR Code safety assessment completed successfully for target image ${filename}. The extracted payload was resolved to "${decodedData}". No suspicious keywords, download patterns, or shortener sub-domains were flagged.`;

    const conclusionText2 = isSuspicious
      ? "It is strongly recommended that users do not open, execute, or click links embedded in this QR code. Restrict access to shorteners or suspicious file types on corporate routers and implement real-time URL scanning filters on endpoint browsers."
      : "The QR code presents a safe profile based on basic keyword signatures. Periodically re-audit QR codes linked to public credentials or external payment platforms to prevent homograph domain changes over time.";

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
      ["Severity", "Risk level assigned to the QR finding: Critical / High / Medium / Low / Informational"],
      ["Status", "Validation result for the target QR code: Passed | Warning | Failed"],
      ["Decoded Content", "The raw text string extracted from the QR code pattern structure"],
      ["Payload Classification", "Identifies the payload category: URL Link, plain text, credentials, vCard, etc."],
      ["Verdict Status", "The overall classification rating (Safe / Phishing Link / Command execution)"],
      ["Issue Detected", "Description of specific redirect shorteners, scripts, or threat matches flagged"],
      ["Impact Analysis", "The potential threat impact if clicked or executed by the user"],
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
      ["Remediation Action", "Specific actions recommended to contain exposure risk"],
      ["Risk Score", "Normalized risk rating out of 100 based on keyword checks"],
      ["Assessment Status", "Completion state of the automated decoder scan"],
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
      "The findings presented in this report are based on observations made during the assessment period and represent the QR code safety and threat intelligence status of the target at the time of scanning. This report contains confidential and proprietary information intended solely for the authorized recipient. Unauthorized disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(ackText, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });

    // Apply running headers/footers to all pages using the shared decorator
    applyHeaderFooterDecorator(doc, "QR Code Safety Scanner");

    // Save PDF
    doc.save(`QR_Safety_Report_${scanDate}.pdf`);

  } catch (err) {
    console.error("Failed to generate QR PDF:", err);
  }
};
