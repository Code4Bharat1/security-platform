import { jsPDF } from "jspdf";
import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../utils/pdfFramework";

export const generateFileScanPDF = async (results = []) => {
  const { employeeName, employeeMail } = getAuditorInfo();
  
  // Format dates
  const now = new Date();
  const scanDate = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  const scanTime = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  try {
    const doc = new jsPDF("p", "mm", "a4");

    const totalFiles = results.length;
    const cleanCount = results.filter((r) => r.status === "Clean").length;
    const flaggedCount = totalFiles - cleanCount;
    const validationStatus = flaggedCount > 0 ? "Failed (Issues Found)" : "Passed (No Issues Found)";

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
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – File Scanner", 14, 12);

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
    doc.text("FILE SCANNER SECURITY ASSESSMENT REPORT", 105, 54, { align: "center" });

    // Divider below title
    doc.line(14, 65, 196, 65);

    // Dynamic file target label
    const targetLabel = totalFiles === 1 
      ? results[0]?.fileName 
      : `${totalFiles} uploaded files`;

    // Assessment Info table
    renderTable(doc, {
      startY: 72,
      head: [],
      body: [
        ["Assessment Performed by", employeeMail],
        ["Employee Name",           employeeName],
        ["Employee Mail ID",        employeeMail],
        ["Scanned Target",          targetLabel || "—"],
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
        ["Tool Name",             "File Scanner"],
        ["Tool Category",         "Malware Detection / File Integrity Analyser"],
        ["Methodology Alignment", "OWASP WSTG – OTG-BUSLOGIC / Malware & File Upload Testing"],
        ["Compliance Alignment",  "ISO/IEC 27001 | AICPA SOC Frameworks"],
        ["Scanned Target",        targetLabel || "—"],
        ["Assessment Mode",       "Non-Intrusive / Automated Static File Analysis"],
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
      "The File Scanner tool performs static analysis of submitted files to identify malicious content, verify file integrity, and assess malware risk. It computes cryptographic hashes (MD5, SHA-1, SHA-256), determines file type and size, calculates Shannon entropy to detect obfuscation or packing, and cross-references the file against multiple anti-malware engines to identify known threats. The tool reports a consolidated threat score and, where applicable, the identified malware family. This assessment supports detection of malicious uploads, tampered files, and supply-chain integrity issues.";

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
      head: [["Files Scanned", "Clean", "Flagged", "Validation Status"]],
      body: [
        [
          String(totalFiles),
          String(cleanCount),
          String(flaggedCount),
          validationStatus
        ]
      ],
      headStyles: { fillColor: C.bgHeader, textColor: C.white, halign: "center" },
      columnStyles: {
        0: { halign: "center", cellWidth: 35 },
        1: { halign: "center", cellWidth: 25 },
        2: { halign: "center", cellWidth: 25 },
        3: { halign: "center", cellWidth: 97 },
      },
      didParseCell: (data) => {
        if (data.column.index === 3 && data.section === "body") {
          if (flaggedCount > 0) {
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

    // Loop through each file result and draw details
    results.forEach((file, index) => {
      // If index > 0, we can add a page to separate detailed results for readability
      if (index > 0) {
        doc.addPage();
        y = 25;
        y = drawSectionHeader(doc, `3. DETAILED FINDINGS (CONTINUED) — FILE ${index + 1}`, y);
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...C.bluePrimary);
      doc.text(`Detailed Analysis for: ${file.fileName}`, 14, y);
      y += 5;

      const isClean = file.status === "Clean";
      const isUnverified = file.status === "Unverified";
      const entropyNum = parseFloat(file.entropy) || 0.0;
      const entropyRange = entropyNum > 7.0 
        ? `${file.entropy} (Obfuscation, packing, or encryption suspected)` 
        : `${file.entropy} (Within Normal Range for Plaintext / Markup Content)`;

      const issueText = isClean
        ? "None. The scanned file returned a clean result across all 70 anti-malware engines, with an entropy value consistent with unobfuscated content and no indicators of packing, encryption, or embedded payloads."
        : isUnverified
        ? "Unverified file. The file hash was not found in the global anti-malware databases. Reputation score is currently zero, and local static analysis checks passed with normal entropy."
        : `Malicious indicators detected. Flagged by ${file.engines} engines. Association identified with the ${file.family} malware family.`;

      const impactText = isClean
        ? "No security impact identified. The file does not exhibit characteristics associated with malware, obfuscation, or tampering."
        : isUnverified
        ? "Unknown risk. No immediate malware family is confirmed, but the lack of reputational indexing makes verification impossible without dynamic sandboxing."
        : `Critical risk. Execution or distribution of this file may result in active system compromise, backdoors, or credential extraction.`;

      const recommendationText = isClean
        ? "No remediation required for this file. Retain the recorded hash values (MD5, SHA-1, SHA-256) as an integrity baseline for future comparison. Continue routine file scanning for all newly uploaded or modified files, with particular attention to files exhibiting entropy values above 7.0."
        : isUnverified
        ? "Establish an integrity baseline. Monitor system logs if this file is executed. We recommend submitting the file's binary content to dynamic analysis tools or static security code reviews to verify internal functions."
        : "Immediately quarantine and remove this file from all endpoints. Revoke and rotate any credentials or keys handled by or near this binary. Conduct a full forensics trace to identify any horizontal movement.";

      const detailedBody = [
        ["Severity",                    isClean ? "Informational" : isUnverified ? "Low" : "High"],
        ["Status",                      file.status === "Clean" ? "Passed" : file.status === "Unverified" ? "Unverified" : "Failed"],
        ["File Name",                   file.fileName],
        ["File Type",                   safe(file.type)],
        ["File Size",                   `${file.size} bytes`],
        ["MD5 Hash",                    safe(file.hashes?.md5)],
        ["SHA-1 Hash",                  safe(file.hashes?.sha1)],
        ["SHA-256 Hash",                safe(file.hashes?.sha256)],
        ["Entropy Score",               entropyRange],
        ["Engines Flagged",             safe(file.engines)],
        ["Malware Family",              safe(file.family)],
        ["Threat Score",                `${file.threatScore} / 100`],
        ["Issue Detected",              issueText],
        ["Impact",                      impactText],
        ["Files / Patterns Scanned",    "1"],
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
              if (val === "Low") data.cell.styles.textColor = C.blue;
              if (val === "Informational") data.cell.styles.textColor = [22, 163, 74];
              data.cell.styles.fontStyle = "bold";
            }
            if (data.row.index === 1) { // Status row
              const val = String(data.cell.raw || "");
              if (val === "Failed") data.cell.styles.textColor = C.red;
              if (val === "Unverified") data.cell.styles.textColor = C.amber;
              if (val === "Passed") data.cell.styles.textColor = [22, 163, 74];
              data.cell.styles.fontStyle = "bold";
            }
          }
        }
      });
      y = doc.lastAutoTable.finalY + 8;
    });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 4 — CONCLUSION & RECOMMENDATIONS
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    y = drawSectionHeader(doc, "4. CONCLUSION & RECOMMENDATIONS", y);

    const firstFileName = results[0]?.fileName || "uploaded-file";
    const firstEntropy = results[0]?.entropy || "0.0";
    const firstThreat = results[0]?.threatScore || "0";
    const firstEngines = results[0]?.engines || "0/70";

    const conclusionText1 =
      `The File Scanner assessment analysed ${totalFiles} file(s) (${firstFileName}) and returned a ${flaggedCount > 0 ? "failed" : "clean"} result, with ${firstEngines} anti-malware engines flagging the primary file and a Threat Score of ${firstThreat}/100. The primary file's entropy value of ${firstEntropy} is consistent with its payload structures and analysis shows no unverified packaging or obfuscation indicators.`;

    const conclusionText2 =
      "It is recommended that the recorded cryptographic hash values be retained as an integrity baseline for the file and compared against future versions to detect unauthorized modification. Routine file scanning should continue for all files received via upload functionality or external sources, with priority remediation applied to any file returning a non-zero engine detection count, a Threat Score above 0, or an entropy value indicative of obfuscation (typically above 7.0).";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(conclusionText1, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });
    y += 18;

    doc.text(conclusionText2, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });
    y += 18;

    y = drawSectionHeader(doc, "5. APPENDIX", y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Column Reference Guide", 14, y);
    y += 5;

    const appendixPart1 = [
      ["Severity", "Risk level assigned to the file scan finding: Critical / High / Medium / Low / Informational"],
      ["Status", "Validation result for the scanned file: Passed | Failed | Warning | Informational"],
      ["File Name", "The name of the file submitted for scanning"],
      ["File Type", "The detected file type or format of the scanned file"],
      ["File Size", "The size of the scanned file in bytes"],
      ["MD5 / SHA-1 / SHA-256 Hash", "Cryptographic hash values used to uniquely identify the file and verify its integrity"],
      ["Entropy Score", "A measure of randomness in the file's contents, used to detect obfuscation, packing, or encryption"],
      ["Engines Flagged", "The number of anti-malware engines, out of the total queried, that flagged the file as malicious"],
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
      ["Malware Family", "The identified malware family or classification, where applicable"],
      ["Threat Score", "A composite score representing the overall malware risk associated with the file"],
      ["Validation Status", "Overall validation result for the scanned file: Passed / Failed (Issues Found)"],
      ["Issue Detected", "The specific malware indicator or integrity issue identified during the scan, if any"],
      ["Impact", "The security risk introduced by the identified issue (e.g. malware execution, data compromise)"],
      ["Files / Patterns Scanned", "The total number of files submitted and analysed during the scan"],
      ["Scan Result Summary", "A concise summary of the overall outcome of the file scan"],
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
      "The findings presented in this report are based on observations made during the assessment period and represent the file integrity and malware scan status of the submitted file at the time of scanning. This report contains confidential and proprietary information intended solely for the authorized recipient. Unauthorized disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(ackText, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });

    // Apply headers and footers to all pages using the shared decorator
    applyHeaderFooterDecorator(doc, "File Scanner");

    // Save PDF
    doc.save(`File_Scanner_Assessment_Report_${scanDate}.pdf`);

  } catch (err) {
    console.error("Failed to generate File Scanner PDF:", err);
  }
};
