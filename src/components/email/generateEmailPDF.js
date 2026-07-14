import { jsPDF } from "jspdf";
import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../utils/pdfFramework";

export const generateEmailPDF = async (result = {}, filename = "email-message.eml") => {
  const { employeeName, employeeMail } = getAuditorInfo();
  
  // Format dates
  const now = new Date();
  const scanDate = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  const scanTime = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const isEml = result.isEml ?? true;

  if (isEml) {
    // EML Dynamic 4-Page PDF Report
    const score = result.overallScore ?? 100;
    const isSuspicious = score < 80;
    const rating = isSuspicious ? "High Risk" : "Safe";

    try {
      const doc = new jsPDF("p", "mm", "a4");

      // PAGE 1 — COVER PAGE
      doc.setFillColor(...C.bluePrimary);
      doc.rect(0, 0, 210, 3.5, "F");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...C.textMuted);
      doc.text("NEXCORE ALLIANCE | Individual Tool Report – Email Phishing Analyzer", 14, 12);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor(...C.bluePrimary);
      doc.text("NEXCORE ALLIANCE", 105, 30, { align: "center" });

      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.text("AI-Powered Cybersecurity & Information Security Solutions", 105, 36, { align: "center" });

      doc.setDrawColor(...C.bluePrimary);
      doc.setLineWidth(0.4);
      doc.line(14, 40, 196, 40);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(...C.bluePrimary);
      doc.text("EMAIL PHISHING & THREAT ASSESSMENT", 105, 54, { align: "center" });
      doc.text("REPORT", 105, 60, { align: "center" });

      doc.line(14, 65, 196, 65);

      renderTable(doc, {
        startY: 72,
        head: [],
        body: [
          ["Assessment Performed by", employeeMail],
          ["Employee Name",           employeeName],
          ["Employee Mail ID",        employeeMail],
          ["Scanned URL / File",      filename],
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

      doc.line(14, 260, 196, 260);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...C.textMuted);
      doc.text("www.nexcorealliance.com | ISO/IEC 27001 Certified | AICPA SOC Compliant", 105, 267, { align: "center" });

      // PAGE 2 — ASSESSMENT & SCAN SUMMARY
      doc.addPage();
      let y = 25;

      y = drawSectionHeader(doc, "1. ASSESSMENT INFORMATION", y);

      renderTable(doc, {
        startY: y,
        head: [],
        body: [
          ["Tool Name",             "Email Phishing & Threat Analyzer"],
          ["Tool Category",         "Email Security / Phishing Risk Auditor"],
          ["Methodology Alignment", "OWASP WSTG – OTG-INFO / Email Spoofing Checks"],
          ["Compliance Alignment",  "ISO/IEC 27001 | AICPA SOC Frameworks"],
          ["Scanned URL / File",    filename],
          ["Assessment Mode",       "Non-Intrusive / Automated Mail Header & Payload Review"],
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
        "The Email Phishing & Threat Analyzer parses complete email messages to audit security headers (SPF, DKIM, and DMARC alignments), extract embedded URLs to check them for reputation threat flags, and verify attachment integrity. By mapping autonomous signatures and computing MD5 hashes for all embedded attachments, it helps isolate spam, spear-phishing campaigns, display-name spoofing, and malicious scripts.";

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...C.textMain);
      doc.text(overviewText, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });
      y += 24;

      y = drawSectionHeader(doc, "2. SCAN SUMMARY", y);

      const linksCount = result.extractedLinks?.length ?? 0;
      const suspiciousLinksCount = result.extractedLinks?.filter(l => l.isSuspicious).length ?? 0;
      const attachmentsCount = result.attachments?.length ?? 0;
      const dangerousAttachmentsCount = result.attachments?.filter(a => a.isDangerous).length ?? 0;

      renderTable(doc, {
        startY: y,
        head: [["Attachments Analysed", "Files Scanned", "Malicious", "Clean", "Scan Status"]],
        body: [
          [
            String(attachmentsCount),
            String(attachmentsCount + 1),
            String(dangerousAttachmentsCount + suspiciousLinksCount),
            String((attachmentsCount - dangerousAttachmentsCount) + (linksCount - suspiciousLinksCount)),
            "Completed"
          ]
        ],
        headStyles: { fillColor: C.bgHeader, textColor: C.white, halign: "center" },
        columnStyles: {
          0: { halign: "center", cellWidth: 40 },
          1: { halign: "center", cellWidth: 35 },
          2: { halign: "center", cellWidth: 35 },
          3: { halign: "center", cellWidth: 35 },
          4: { halign: "center", cellWidth: 37 },
        }
      });
      y = doc.lastAutoTable.finalY + 8;

      y = drawSectionHeader(doc, "3. DETAILED FINDINGS", y);

      renderTable(doc, {
        startY: y,
        head: [["Parameter", "Details"]],
        body: [
          ["Subject Line",                 result.subject],
          ["From Sender",                  result.from],
          ["To Recipient",                 result.to],
          ["SPF Authentication",           result.spfStatus.toUpperCase()],
          ["DKIM Authentication",          result.dkimStatus.toUpperCase()],
          ["Hyperlinks Extracted",         String(linksCount)],
          ["Attachments Extracted",        String(attachmentsCount)],
        ],
        headStyles: { fillColor: C.bgHeader, textColor: C.white },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 55 },
          1: { cellWidth: 127 },
        }
      });

      // PAGE 3 — CONCLUSION
      doc.addPage();
      y = 25;

      y = drawSectionHeader(doc, "4. CONCLUSION & RECOMMENDATIONS", y);

      const conclusionText1 = isSuspicious
        ? `The Email Phishing audit resolved a high exposure risk score of ${score}/100 for EML file ${filename}. SPF/DKIM checks returned fail/none indicators, display-name spoofing warning values, or suspicious links. Danger payloads are listed in the detailed dashboard.`
        : `The Email Phishing audit resolved a secure trust profile score of ${score}/100 for EML file ${filename}. SPF/DKIM verification passed correctly, display alignments were verified, and no suspicious links or attachments were flagged.`;

      const conclusionText2 = "It is recommended that all email attachments be submitted for automated analysis prior to being opened or forwarded within the organisation. File-type allowlisting policies should be enforced at the email gateway level to restrict the delivery of high-risk attachment types such as executable files, macro-enabled Office documents, and script files. Attachments originating from unverified or external senders should be treated with elevated scrutiny regardless of file type. Periodic review of the scanning engine's threat signature database should be conducted to ensure detection coverage remains current against emerging threats.";

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...C.textMain);
      doc.text(conclusionText1, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });
      y += 18;

      doc.text(conclusionText2, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });

      // PAGE 4 — APPENDIX
      doc.addPage();
      y = 25;

      y = drawSectionHeader(doc, "5. APPENDIX", y);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...C.bluePrimary);
      doc.text("Column Reference Guide", 14, y);
      y += 5;

      renderTable(doc, {
        startY: y,
        head: [["Column", "Description"]],
        body: [
          ["Subject Line", "The subject header parsed from the email envelope"],
          ["From Sender", "The display name and routing mail ID of the sender"],
          ["SPF Status", "Sender Policy Framework status checking domain IP authorization"],
          ["DKIM Status", "DomainKeys Identified Mail status checking cryptographic headers"],
        ],
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

      const ackText = "The findings presented in this report are based on observations made during the assessment period and represent the email authentication, link reputation, and attachment safety status of the target at the time of scanning. This report contains confidential and proprietary information intended solely for the authorized recipient. Unauthorized disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.";

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...C.textMain);
      doc.text(ackText, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });

      applyHeaderFooterDecorator(doc, "Email Phishing Analyzer");
      doc.save(`Email_Phishing_Report_${scanDate}.pdf`);

    } catch (err) {
      console.error("Failed to generate EML PDF:", err);
    }
  } else {
    // ════════════════════════════════════════════════════════════════════════
    // Direct Single File Upload Assessment Report (Exact matches to screenshots!)
    // ════════════════════════════════════════════════════════════════════════
    const severity = result.severity || "Informational";
    const status = result.status || "Passed";
    const isSuspicious = result.overallScore < 80;

    try {
      const doc = new jsPDF("p", "mm", "a4");

      // ----------------------------------------------------------------------
      // PAGE 1 — COVER PAGE
      // ----------------------------------------------------------------------
      doc.setFillColor(...C.bluePrimary);
      doc.rect(0, 0, 210, 3.5, "F");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...C.textMuted);
      doc.text("NEXCORE ALLIANCE | Individual Tool Report – Email Attachment Analyzer", 14, 12);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor(...C.bluePrimary);
      doc.text("NEXCORE ALLIANCE", 105, 30, { align: "center" });

      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.text("AI-Powered Cybersecurity & Information Security Solutions", 105, 36, { align: "center" });

      doc.setDrawColor(...C.bluePrimary);
      doc.setLineWidth(0.4);
      doc.line(14, 40, 196, 40);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(...C.bluePrimary);
      doc.text("EMAIL ATTACHMENT ANALYZER SECURITY ASSESSMENT", 105, 54, { align: "center" });
      doc.text("REPORT", 105, 60, { align: "center" });

      doc.line(14, 65, 196, 65);

      renderTable(doc, {
        startY: 72,
        head: [],
        body: [
          ["Assessment Performed by", employeeMail],
          ["Employee Name",           employeeName],
          ["Employee Mail ID",        employeeMail],
          ["Scanned URL / File",      filename],
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

      doc.line(14, 260, 196, 260);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...C.textMuted);
      doc.text("www.nexcorealliance.com | ISO/IEC 27001 Certified | AICPA SOC Compliant", 105, 267, { align: "center" });

      // ----------------------------------------------------------------------
      // PAGE 2 — ASSESSMENT INFORMATION, SCAN SUMMARY & FINDINGS (PART 1)
      // ----------------------------------------------------------------------
      doc.addPage();
      y = 25;

      y = drawSectionHeader(doc, "1. ASSESSMENT INFORMATION", y);

      renderTable(doc, {
        startY: y,
        head: [],
        body: [
          ["Tool Name",             "Email Attachment Analyzer"],
          ["Tool Category",         "Email Security / File Threat Analysis"],
          ["Methodology Alignment", "OWASP WSTG – OTG-BUSLOGIC / File Upload Security Testing"],
          ["Compliance Alignment",  "ISO/IEC 27001 | AICPA SOC Frameworks"],
          ["Scanned URL / File",    filename],
          ["Assessment Mode",       "Non-Intrusive / Automated File Analysis"],
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
        "The Email Attachment Analyzer tool accepts email attachments submitted by the user and performs automated security analysis to identify malware signatures, embedded scripts, macros, obfuscated content, and suspicious indicators. The tool evaluates each file against known threat patterns and generates a structured security report detailing the attachment name, file type, detected threats, risk level, and actionable recommendations. It is designed to support security analysts and end-users in making informed decisions about the safety of email-borne files prior to opening or execution.";

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...C.textMain);
      doc.text(overviewText, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });
      y += 24;

      y = drawSectionHeader(doc, "2. SCAN SUMMARY", y);

      renderTable(doc, {
        startY: y,
        head: [["Attachments Analysed", "Files Scanned", "Malicious", "Clean", "Scan Status"]],
        body: [
          [
            "1",
            "1",
            isSuspicious ? "1" : "0",
            isSuspicious ? "0" : "1",
            "Completed"
          ]
        ],
        headStyles: { fillColor: C.bgHeader, textColor: C.white, halign: "center" },
        columnStyles: {
          0: { halign: "center", cellWidth: 40 },
          1: { halign: "center", cellWidth: 35 },
          2: { halign: "center", cellWidth: 35 },
          3: { halign: "center", cellWidth: 35 },
          4: { halign: "center", cellWidth: 37 },
        }
      });
      y = doc.lastAutoTable.finalY + 8;

      y = drawSectionHeader(doc, "3. DETAILED FINDINGS", y);

      renderTable(doc, {
        startY: y,
        head: [[{ content: "Detailed Findings – Email Attachment Analysis", colSpan: 2 }]],
        body: [
          ["Parameter", "Details"],
          ["Attachment Name", result.attachmentName],
          ["File Type",       result.fileType],
          ["File Size",       result.fileSize],
          ["Severity",        severity],
          ["Status",          status],
          ["Malware Detected",result.malwareDetected],
          ["Macro Detected",  result.macroDetected],
        ],
        headStyles: { fillColor: C.bgHeader, textColor: C.white, halign: "center" },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 55 },
          1: { cellWidth: 127 },
        },
        didParseCell: (data) => {
          if (data.column.index === 1 && data.section === "body") {
            const val = String(data.cell.raw || "");
            if (data.row.index === 4 || data.row.index === 5) { // Severity / Status
              if (isSuspicious) {
                data.cell.styles.textColor = C.red;
                data.cell.styles.fontStyle = "bold";
              } else {
                data.cell.styles.textColor = [22, 163, 74];
                data.cell.styles.fontStyle = "bold";
              }
            }
          }
        }
      });

      // ----------------------------------------------------------------------
      // PAGE 3 — FINDINGS (PART 2) & CONCLUSION
      // ----------------------------------------------------------------------
      doc.addPage();
      y = 25;

      renderTable(doc, {
        startY: y,
        head: [],
        body: [
          ["Embedded Scripts", result.embeddedScripts],
          ["Risk Level",       result.riskLevel],
          ["Issue Detected",   result.issueDetected],
          ["Impact",           result.impact],
          ["Recommendation",   result.recommendation],
        ],
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
          1: { cellWidth: 127 },
        },
        didParseCell: (data) => {
          if (data.column.index === 1 && data.section === "body") {
            if (data.row.index === 1) { // Risk Level
              if (isSuspicious) data.cell.styles.textColor = C.red;
              else data.cell.styles.textColor = [22, 163, 74];
              data.cell.styles.fontStyle = "bold";
            }
          }
        }
      });
      y = doc.lastAutoTable.finalY + 12;

      y = drawSectionHeader(doc, "4. CONCLUSION & RECOMMENDATIONS", y);

      const conclusionText1 = isSuspicious
        ? `The Email Attachment Analyzer assessment was performed on the submitted file ${filename}. The analysis confirmed that the file is suspicious and presents threat risks. Malware signatures, macros, or suspicious script patterns were identified during the scan. The file poses an identified security risk at the time of analysis.`
        : `The Email Attachment Analyzer assessment was performed on the submitted file ${filename}. The analysis confirmed that the file is clean and safe. No malware signatures, embedded scripts, macros, or suspicious behavioural indicators were identified during the scan. The file poses no identified security risk at the time of analysis.`;

      const conclusionText2 = "It is recommended that all email attachments be submitted for automated analysis prior to being opened or forwarded within the organisation. File-type allowlisting policies should be enforced at the email gateway level to restrict the delivery of high-risk attachment types such as executable files, macro-enabled Office documents, and script files. Attachments originating from unverified or external senders should be treated with elevated scrutiny regardless of file type. Periodic review of the scanning engine's threat signature database should be conducted to ensure detection coverage remains current against emerging threats.";

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...C.textMain);
      doc.text(conclusionText1, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });
      y += 18;

      doc.text(conclusionText2, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });

      // ----------------------------------------------------------------------
      // PAGE 4 — APPENDIX (COLUMN REFERENCE & ACKNOWLEDGEMENT)
      // ----------------------------------------------------------------------
      doc.addPage();
      y = 25;

      y = drawSectionHeader(doc, "5. APPENDIX", y);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...C.bluePrimary);
      doc.text("Column Reference Guide", 14, y);
      y += 5;

      renderTable(doc, {
        startY: y,
        head: [["Column", "Description"]],
        body: [
          ["Attachment Name", "The filename of the email attachment submitted for analysis."],
          ["File Type",       "The MIME type or file format of the attachment (e.g., PDF, DOCX, EXE, CSS)."],
          ["File Size",       "The size of the submitted file, used to flag unusually large or empty attachments."],
          ["Severity",        "Risk level assigned to the attachment finding: Critical / High / Medium / Low / Informational"],
          ["Status",          "Outcome of the analysis: Passed | Failed | Warning | Informational"],
          ["Malware Detected","Indicates whether any known malware signatures were identified within the attachment."],
          ["Macro Detected",  "Identifies the presence of macros in Office documents that may execute malicious code."],
          ["Embedded Scripts","Flags any embedded JavaScript, VBScript, or executable code found within the attachment."],
          ["Issue Detected",  "A concise description of the specific threat or anomaly identified in the attachment."],
          ["Impact",          "The potential security consequence if the attachment were opened or executed."],
          ["Recommendation",  "Specific, actionable guidance for handling the identified attachment or threat."],
        ],
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

      const ackText = "The findings presented in this report are based on observations made during the assessment period and represent the email attachment security analysis status of the target at the time of scanning. This report contains confidential and proprietary information intended solely for the authorized recipient. Unauthorized disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.";

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...C.textMain);
      doc.text(ackText, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });

      applyHeaderFooterDecorator(doc, "Email Attachment Analyzer");
      doc.save(`Email_Attachment_Report_${scanDate}.pdf`);

    } catch (err) {
      console.error("Failed to generate direct file PDF:", err);
    }
  }
};
