import { jsPDF } from "jspdf";
import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../utils/pdfFramework";

export const generateCredentialPathPDF = async (results = [], domain = "corp.local", scope = "full") => {
  const { employeeName, employeeMail } = getAuditorInfo();
  
  // Format dates
  const now = new Date();
  const scanDate = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  const scanTime = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const totalChecks = results.length;
  const failedChecks = results.filter(r => r.status === "Fail").length;
  const passedChecks = results.filter(r => r.status === "Pass").length;
  const highRisks = results.filter(r => r.status === "Fail" && r.severity === "High").length;
  
  const riskBand = failedChecks > 0 ? (highRisks > 0 ? "High Risk" : "Medium Risk") : "Low Risk";

  try {
    const doc = new jsPDF("p", "mm", "a4");

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 1 — COVER PAGE
    // ════════════════════════════════════════════════════════════════════════
    // Top banner stripe
    doc.setFillColor(...C.bluePrimary);
    doc.rect(0, 0, 210, 3.5, "F");

    // Brand line
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – Credential Path Audit", 14, 12);

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
    doc.text("CREDENTIAL Traversal PATH SECURITY ASSESSMENT", 105, 54, { align: "center" });
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
        ["Target AD Domain",        domain],
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
        ["Tool Name",             "Credential Path Audit"],
        ["Tool Category",         "Identity Traversal / Directory Auditing"],
        ["Methodology Alignment", "OWASP WSTG – OTG-IDENT-001 / Directory Traversal Audit"],
        ["Compliance Alignment",  "ISO/IEC 27001 | AICPA SOC Frameworks"],
        ["Target AD Domain",      domain],
        ["Traversal Scope",       scope === "full" ? "Full Path Traversal" : "Quick Privilege Check"],
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
      "The Credential Traversal Path Audit tool traces network identity pathways, user local privilege nesting structures, and Active Directory permission sets. It maps shortest attack vectors to Domain Admin credentials and highlights lateral movement risks, service delegation flaws, and unconstrained Kerberos permissions across host configurations.";

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
      head: [["Target AD Domain", "Total Checks", "Failed Controls", "Passed Controls", "Risk Level"]],
      body: [
        [
          domain,
          String(totalChecks),
          String(failedChecks),
          String(passedChecks),
          riskBand
        ]
      ],
      headStyles: { fillColor: C.bgHeader, textColor: C.white, halign: "center" },
      columnStyles: {
        0: { halign: "center", cellWidth: 50 },
        1: { halign: "center", cellWidth: 28 },
        2: { halign: "center", cellWidth: 32 },
        3: { halign: "center", cellWidth: 32 },
        4: { halign: "center", cellWidth: 40 },
      },
      didParseCell: (data) => {
        if (data.column.index === 4 && data.section === "body") {
          if (failedChecks > 0) {
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

    const findingsRows = results.map((r) => [
      r.control,
      r.status.toUpperCase(),
      r.severity.toUpperCase(),
      r.remediation || r.details
    ]);

    if (findingsRows.length === 0) {
      findingsRows.push(["No findings compiled", "N/A", "N/A", "Scan completed with no active targets or findings."]);
    }

    renderTable(doc, {
      startY: y,
      head: [["Security Control Check", "Status", "Severity", "Remediation Guidance"]],
      body: findingsRows,
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50 },
        1: { cellWidth: 22, halign: "center" },
        2: { cellWidth: 22, halign: "center" },
        3: { cellWidth: 88 },
      },
      didParseCell: (data) => {
        if (data.column.index === 1 && data.section === "body") {
          const val = String(data.cell.raw || "");
          if (val === "FAIL") {
            data.cell.styles.textColor = C.red;
            data.cell.styles.fontStyle = "bold";
          } else if (val === "PASS") {
            data.cell.styles.textColor = [22, 163, 74];
            data.cell.styles.fontStyle = "bold";
          }
        }
        if (data.column.index === 2 && data.section === "body") {
          const val = String(data.cell.raw || "");
          if (val === "HIGH" || val === "CRITICAL") {
            data.cell.styles.textColor = C.red;
          } else if (val === "MEDIUM") {
            data.cell.styles.textColor = C.amber;
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

    const conclusionText1 = failedChecks > 0
      ? `The Credential Traversal Path Audit resolved a vulnerable security posture for Active Directory domain ${domain}. The traversal mapped ${failedChecks} security control failures. Active lateral movement paths to Domain Administration exist.`
      : `The Credential Traversal Path Audit completed successfully for Active Directory domain ${domain}. No active privilege escalation paths or Kerberos delegation vulnerabilities were flagged.`;

    const conclusionText2 = "It is strongly recommended to restrict local administrator credentials reuse across workstations, disable NTLM authentication, enforce LSA protection, and decommission unconstrained Kerberos delegations. Periodically re-run directory configuration audits to prevent account nesting privilege creep.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(conclusionText1, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });
    y += 18;

    doc.text(conclusionText2, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 5 — APPENDIX & ACKNOWLEDGEMENT
    // ════════════════════════════════════════════════════════════════════════
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
        ["Security Control Check", "The Active Directory or host configuration boundary audited"],
        ["Status", "Audit result status: Pass (Secure) or Fail (Vulnerable)"],
        ["Severity", "Calculated risk rating of the control gap: High / Medium / Low"],
        ["Remediation Guidance", "Actionable actions required to close the security gap"],
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

    const ackText = "The findings presented in this report are based on observations made during the assessment period and represent the Active Directory credential traversal path status of the target at the time of scanning. This report contains confidential and proprietary information intended solely for the authorized recipient. Unauthorized disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(ackText, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });

    applyHeaderFooterDecorator(doc, "Credential Path Audit");
    doc.save(`Credential_Path_Report_${scanDate}.pdf`);

  } catch (err) {
    console.error("Failed to generate Credential PDF:", err);
  }
};
