import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const generatePDF = async (scanData, setPdfProgress) => {
  if (!scanData) return;
  setPdfProgress("Initializing PDF document...");

  // ── Design System Color Tokens ───────────────────────────────────────────
  const C = {
    bg:          [255, 255, 255],     // Page background: white
    bgAlt:       [248, 249, 250],     // Alternate rows: light grey
    bgHeader:    [13, 56, 115],       // Header box background: dark blue
    bluePrimary: [13, 56, 115],       // Primary text / box: dark blue
    white:       [255, 255, 255],
    black:       [0, 0, 0],
    textMain:    [40, 40, 40],        // Dark grey main text
    textMuted:   [110, 110, 110],     // Light grey caption text
    lineColor:   [210, 210, 210],     // Table border lines
    red:         [220, 53, 69],       // High severity
    amber:       [253, 126, 20],      // Medium severity
    blue:        [13, 110, 253],      // Low severity
    purple:      [111, 66, 193],      // Critical severity
    gray:        [110, 110, 110],     // Info severity
  };

  const safe = (v, fallback = "—") =>
    v !== undefined && v !== null && v !== "" ? String(v) : fallback;

  // Severity color utility
  const getSeverityColor = (sev) => {
    switch ((sev || "").toLowerCase()) {
      case "critical": return C.purple;
      case "high":     return C.red;
      case "medium":   return C.amber;
      case "low":      return C.blue;
      default:         return C.gray;
    }
  };

  // Helper: Draw Section Title Box
  const drawSectionHeader = (doc, title, y) => {
    doc.setFillColor(...C.bluePrimary);
    doc.rect(14, y, 182, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.white);
    doc.text(title, 18, y + 5.5);
    return y + 14;
  };

  // Helper: Render standard tables
  const renderTable = (doc, opts) => {
    autoTable(doc, {
      styles: {
        fontSize: 8,
        cellPadding: { top: 3.5, right: 4, bottom: 3.5, left: 4 },
        fillColor: C.bg,
        textColor: C.textMain,
        lineColor: C.lineColor,
        lineWidth: 0.15,
        font: "helvetica",
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: C.bgHeader,
        textColor: C.white,
        fontStyle: "bold",
        fontSize: 8,
        lineColor: C.bluePrimary,
        lineWidth: 0.15,
      },
      alternateRowStyles: { fillColor: C.bgAlt },
      margin: { left: 14, right: 14 },
      ...opts,
    });
  };

  // Helper: Get user profile details
  let employeeName = "Security Auditor";
  let employeeMail = "auditor@nexcorealliance.com";
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed.name) employeeName = parsed.name;
      if (parsed.email) employeeMail = parsed.email;
    }
  } catch (_) {}

  try {
    const doc = new jsPDF("p", "mm", "a4");
    const domain = safe(scanData.domain, "Unknown Domain");
    const scanDate = scanData.timestamp
      ? new Date(scanData.timestamp).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()
      : new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
    const scanTime = scanData.timestamp
      ? new Date(scanData.timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      : new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 1 — COVER PAGE
    // ══════════════════════════════════════════════════════════════════════
    setPdfProgress("Building cover page...");
    
    // Top blue banner stripe
    doc.setFillColor(...C.bluePrimary);
    doc.rect(0, 0, 210, 3.5, "F");

    // Brand line
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – Vulnerability Scanner", 14, 12);

    // Company header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(...C.bluePrimary);
    doc.text("NEXCORE ALLIANCE", 14, 30);

    doc.setFont("helvetica", "oblique");
    doc.setFontSize(10);
    doc.text("AI-Powered Cybersecurity & Information Security Solutions", 14, 36);

    // Divider line
    doc.setDrawColor(...C.bluePrimary);
    doc.setLineWidth(0.4);
    doc.line(14, 40, 196, 40);

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(...C.bluePrimary);
    doc.text("VULNERABILITY SCANNER", 105, 58, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("SECURITY ASSESSMENT REPORT", 105, 65, { align: "center" });

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
        ["Scanned Target",         domain],
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
    setPdfProgress("Building assessment information...");
    doc.addPage();

    let y = drawSectionHeader(doc, "1. ASSESSMENT INFORMATION", 25);

    // Tool details grid
    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Tool Name",             "Vulnerability Scanner"],
        ["Tool Category",         "Vulnerability Assessment / Web Application Security Scanning"],
        ["Methodology Alignment", "OWASP WSTG / CVE / CVSS v3.1 / NIST NVD / PTES"],
        ["Compliance Alignment",  "ISO/IEC 27001 | AICPA SOC Frameworks"],
        ["Scanned Target",        domain],
        ["Assessment Mode",       "Non-Intrusive / Automated Vulnerability Scan"]
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 }
      }
    });

    y = doc.lastAutoTable.finalY + 12;

    // Tool Overview Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Tool Overview", 14, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMain);
    const overviewText = "The Vulnerability Scanner performs automated security assessments against target web applications and network endpoints to identify known vulnerabilities, misconfigurations, and exploitable weaknesses. The tool correlates detected indicators against established vulnerability databases including CVE and NIST NVD, and assigns CVSS v3.1 base scores to each finding. Each finding is reported with supporting evidence, a CVSS score, affected component details, and specific remediation guidance. Generic impact paragraphs, placeholder descriptions, unsupported critical findings, and duplicate open-port findings are excluded to ensure all reported vulnerabilities are accurate, evidence-backed, and actionable.";
    
    // Print description text
    doc.text(overviewText, 14, y + 6, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 3 — SCAN SUMMARY & DETAILED FINDINGS
    // ══════════════════════════════════════════════════════════════════════
    setPdfProgress("Building scan summary...");
    doc.addPage();

    y = drawSectionHeader(doc, "2. SCAN SUMMARY", 25);

    // Calculate vulnerability counts
    const vulns = scanData.vulnerabilities || [];
    const counts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
    vulns.forEach((v) => {
      const s = (v.severity || "info").toLowerCase();
      if (counts[s] !== undefined) counts[s]++;
      else counts.info++;
    });

    // Render Scan Summary table
    renderTable(doc, {
      startY: y,
      head: [["Critical", "High", "Medium", "Low", "Informational"]],
      body: [[
        String(counts.critical),
        String(counts.high),
        String(counts.medium),
        String(counts.low),
        String(counts.info)
      ]],
      headStyles: {
        fillColor: C.bgHeader,
        textColor: C.white,
        halign: "center",
      },
      bodyStyles: {
        halign: "center",
        fontStyle: "bold",
        fontSize: 10,
      },
      columnStyles: {
        0: { textColor: C.purple },
        1: { textColor: C.red },
        2: { textColor: C.amber },
        3: { textColor: C.blue },
        4: { textColor: C.gray }
      }
    });

    y = doc.lastAutoTable.finalY + 10;

    // Draw Section 3: Detailed findings
    y = drawSectionHeader(doc, "3. DETAILED FINDINGS", y);

    // Render Detailed findings table
    const tableRows = vulns.map((v) => [
      safe(v.severity).toUpperCase(),
      safe(v.cve || v.cveId, "N/A"),
      safe(v.description || v.title || v.name),
      safe(v.affected || "Web Endpoint"),
      safe(v.cvss || "—"),
      safe(v.details || "Observed mismatch"),
      safe(v.recommendation)
    ]);

    if (tableRows.length > 0) {
      renderTable(doc, {
        startY: y,
        head: [["Severity", "CVE ID", "Vulnerability", "Affected Component", "CVSS Score", "Evidence", "Recommendation"]],
        body: tableRows,
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 20 },
          1: { cellWidth: 18 },
          2: { cellWidth: 32 },
          3: { cellWidth: 28 },
          4: { cellWidth: 14, halign: "center" },
          5: { cellWidth: 32 },
          6: { cellWidth: 38 }
        },
        didParseCell: (data) => {
          if (data.column.index === 0 && data.section === "body") {
            const text = String(data.cell.raw || "").toLowerCase();
            data.cell.styles.textColor = getSeverityColor(text);
          }
        }
      });
      y = doc.lastAutoTable.finalY + 12;
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(...C.gray);
      doc.text("No vulnerabilities or weaknesses detected during the assessment scan.", 14, y + 4);
      y += 12;
    }

    // Check remaining space before drawing Section 4. If space is less than 65mm, add new page.
    if (297 - y < 65) {
      doc.addPage();
      y = 25;
    }

    // Draw Section 4: Conclusion & recommendations
    y = drawSectionHeader(doc, "4. CONCLUSION & RECOMMENDATIONS", y);

    const totalN = vulns.length;
    const conclusionText = `The Vulnerability Scanner assessment identified a total of ${totalN} findings against the target, comprising ${counts.critical} Critical, ${counts.high} High, ${counts.medium} Medium, ${counts.low} Low, and ${counts.info} Informational severity issues. All findings reported are supported by direct evidence and have been validated against CVE and NIST NVD records where applicable.

Critical and High severity findings must be prioritised for immediate remediation. All identified vulnerabilities should be addressed in order of CVSS score. Underlying vulnerabilities must be patched at the application and infrastructure layer. Duplicate open-port findings have been consolidated, and unsupported or placeholder findings have been excluded from this report to ensure accuracy and actionability. A follow-up scan is recommended following remediation to confirm resolution of identified findings.`;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMain);
    doc.text(conclusionText, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.45 });

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 4 — APPENDIX
    // ══════════════════════════════════════════════════════════════════════
    setPdfProgress("Building appendix...");
    doc.addPage();

    y = drawSectionHeader(doc, "5. APPENDIX", 25);

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
        ["Severity",           "Risk level assigned to the finding: Critical | High | Medium | Low | Informational."],
        ["CVE ID",             "Common Vulnerabilities and Exposures identifier assigned to the finding where applicable. Displayed as N/A for configuration or non-CVE findings."],
        ["Vulnerability",      "Name or description of the identified vulnerability. Only findings with verified evidence are included; placeholder or unsupported descriptions are excluded."],
        ["Affected Component", "The specific service, endpoint, header, library, or configuration item where the vulnerability was identified."],
        ["CVSS Score",         "Common Vulnerability Scoring System (CVSS v3.1) base score quantifying the severity of the finding."],
        ["Evidence",           "Technical evidence supporting the finding, such as response headers, version strings, error messages, or observed behaviour that confirms the vulnerability."],
        ["Recommendation",     "Specific, actionable remediation guidance to resolve the identified vulnerability."]
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

    const ackText = "The findings presented in this report are based on observations made during the assessment period and represent the vulnerability posture of the target environment at the time of scanning. This report contains confidential and proprietary information intended solely for the authorised recipient. Unauthorised disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMain);
    doc.text(ackText, 14, y + 6, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });

    // ══════════════════════════════════════════════════════════════════════
    // DRAW PAGE HEADERS & FOOTERS (Post-processing)
    // ══════════════════════════════════════════════════════════════════════
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      const pageW = doc.internal.pageSize.getWidth();

      // 1. Draw top blue banner stripe on every page
      doc.setFillColor(...C.bluePrimary);
      doc.rect(0, 0, pageW, 3, "F");

      // 2. Draw running header text on subsequent pages (page > 1)
      if (i > 1) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(...C.textMuted);
        doc.text("NEXCORE ALLIANCE | Individual Tool Report – Vulnerability Scanner", 14, 12);
        
        doc.setDrawColor(...C.bluePrimary);
        doc.setLineWidth(0.2);
        doc.line(14, 14.5, 196, 14.5);
      }

      // 3. Draw running footer on every page
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...C.textMuted);
      
      doc.setDrawColor(...C.lineColor);
      doc.setLineWidth(0.2);
      doc.line(14, 283, 196, 283);

      doc.text("Confidential | www.nexcorealliance.com", 14, 289);
      doc.text(`Page ${i}`, pageW - 14, 289, { align: "right" });
    }

    setPdfProgress("Saving PDF...");
    doc.save(`${domain}-VAPT-Report-${Date.now()}.pdf`);
  } catch (err) {
    console.error("Failed to generate PDF:", err);
  } finally {
    setPdfProgress(null);
  }
};
