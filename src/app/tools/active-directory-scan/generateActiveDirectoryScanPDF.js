import { jsPDF } from "jspdf";
import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../../utils/pdfFramework";

export const generateActiveDirectoryScanPDF = async (
  results = [],
  domain = "corp.local",
  scope = "full"
) => {
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

  const scopeLabel = scope === "full" ? "Full Domain Audit" : "Quick Configuration Audit";

  // Aggregate counts
  const totalChecks  = results.length;
  const failedChecks = results.filter((r) => r.status === "Fail").length;
  const passedChecks = results.filter((r) => r.status === "Pass").length;
  const highRisks    = results.filter((r) => r.status === "Fail" && r.severity === "High").length;
  const mediumRisks  = results.filter((r) => r.status === "Fail" && r.severity === "Medium").length;
  const lowRisks     = results.filter((r) => r.status === "Fail" && r.severity === "Low").length;

  const riskBand =
    highRisks > 0   ? "High Risk"
    : mediumRisks > 0 ? "Medium Risk"
    : failedChecks > 0  ? "Low Risk"
    : "Secure";

  try {
    const doc = new jsPDF("p", "mm", "a4");

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 1 — COVER PAGE
    // ════════════════════════════════════════════════════════════════════════
    doc.setFillColor(...C.bluePrimary);
    doc.rect(0, 0, 210, 3.5, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – Active Directory Scan", 14, 12);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(...C.bluePrimary);
    doc.text("NEXCORE ALLIANCE", 105, 30, { align: "center" });

    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.text("AI-Powered Cybersecurity & Information Security Solutions", 105, 36, {
      align: "center",
    });

    doc.setDrawColor(...C.bluePrimary);
    doc.setLineWidth(0.4);
    doc.line(14, 40, 196, 40);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...C.bluePrimary);
    doc.text("ACTIVE DIRECTORY SECURITY SCAN", 105, 54, { align: "center" });
    doc.text("ASSESSMENT REPORT", 105, 60, { align: "center" });

    doc.line(14, 65, 196, 65);

    renderTable(doc, {
      startY: 72,
      head: [],
      body: [
        ["Assessment Performed by", employeeMail],
        ["Employee Name",           employeeName],
        ["Employee Mail ID",        employeeMail],
        ["Target Domain",           domain],
        ["Audit Scope",             scopeLabel],
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

    doc.line(14, 265, 196, 265);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text(
      "www.nexcorealliance.com | ISO/IEC 27001 Certified | AICPA SOC Compliant",
      105, 272, { align: "center" }
    );

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
        ["Tool Name",             "Active Directory Scan"],
        ["Tool Category",         "Identity & Access Management / Active Directory Security Audit"],
        ["Methodology Alignment", "MITRE ATT&CK – Credential Access / Privilege Escalation / Lateral Movement"],
        ["Compliance Alignment",  "ISO/IEC 27001 | AICPA SOC Frameworks | Microsoft Security Benchmark"],
        ["Target Domain",         domain],
        ["Audit Scope",           scopeLabel],
        ["Assessment Mode",       "Active / Network Port Probe + Simulated AD Configuration Audit"],
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
      "The Active Directory Scan tool performs an automated security configuration audit against Microsoft Active Directory domains. It resolves the Domain Controller network address, probes key AD service ports (Kerberos/88, LDAP/389, LDAPS/636, Global Catalog/3268-3269), and evaluates critical security controls including Krbtgt password rotation age, Kerberoasting SPN exposure, LDAP communication security (signing and channel binding), SMB signing policy, anonymous LDAP bind policy, privileged group nested memberships, and Kerberos delegation configurations. Findings are severity-rated and accompanied by direct remediation guidance.",
      14, y,
      { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 }
    );

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 3 — SCAN SUMMARY + FINDINGS
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    y = drawSectionHeader(doc, "2. SCAN SUMMARY", y);

    renderTable(doc, {
      startY: y,
      head: [["Target Domain", "Scope", "Total Checks", "Failed", "Passed", "High", "Medium", "Risk Band"]],
      body: [[
        domain,
        scopeLabel,
        String(totalChecks),
        String(failedChecks),
        String(passedChecks),
        String(highRisks),
        String(mediumRisks),
        riskBand,
      ]],
      headStyles: { fillColor: C.bgHeader, textColor: C.white, halign: "center" },
      columnStyles: {
        0: { cellWidth: 32 },
        1: { cellWidth: 30 },
        2: { halign: "center", cellWidth: 18 },
        3: { halign: "center", cellWidth: 15 },
        4: { halign: "center", cellWidth: 15 },
        5: { halign: "center", cellWidth: 14 },
        6: { halign: "center", cellWidth: 20 },
        7: { halign: "center", cellWidth: 38 },
      },
      didParseCell: (data) => {
        if (data.column.index === 7 && data.section === "body") {
          if (highRisks > 0) {
            data.cell.styles.textColor = C.red;
            data.cell.styles.fontStyle = "bold";
          } else if (mediumRisks > 0) {
            data.cell.styles.textColor = C.amber;
            data.cell.styles.fontStyle = "bold";
          } else {
            data.cell.styles.textColor = [22, 163, 74];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
    });
    y = doc.lastAutoTable.finalY + 8;

    y = drawSectionHeader(doc, "3. DETAILED FINDINGS", y);

    const findingRows =
      results.length > 0
        ? results.map((r) => [
            safe(r.control),
            safe(r.status).toUpperCase(),
            safe(r.severity).toUpperCase(),
            safe(r.details),
          ])
        : [["No findings compiled", "N/A", "N/A", "Scan completed with no active targets or findings."]];

    renderTable(doc, {
      startY: y,
      head: [["Security Control Check", "Status", "Severity", "Technical Details"]],
      body: findingRows,
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 52 },
        1: { cellWidth: 20, halign: "center" },
        2: { cellWidth: 22, halign: "center" },
        3: { cellWidth: 88 },
      },
      didParseCell: (data) => {
        if (data.column.index === 1 && data.section === "body") {
          const v = String(data.cell.raw || "");
          if (v === "FAIL") { data.cell.styles.textColor = C.red;          data.cell.styles.fontStyle = "bold"; }
          else if (v === "PASS") { data.cell.styles.textColor = [22, 163, 74]; data.cell.styles.fontStyle = "bold"; }
        }
        if (data.column.index === 2 && data.section === "body") {
          const v = String(data.cell.raw || "");
          if (v === "HIGH")   { data.cell.styles.textColor = C.red;   data.cell.styles.fontStyle = "bold"; }
          else if (v === "MEDIUM") { data.cell.styles.textColor = C.amber; }
          else if (v === "LOW")    { data.cell.styles.textColor = C.blue; }
        }
      },
    });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 4 — REMEDIATION GUIDE
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    y = drawSectionHeader(doc, "3. DETAILED FINDINGS — REMEDIATION GUIDE", y);

    const remediationRows =
      results.length > 0
        ? results.map((r) => [
            safe(r.control),
            safe(r.status).toUpperCase(),
            safe(r.severity).toUpperCase(),
            safe(r.remediation),
          ])
        : [["No findings", "N/A", "N/A", "No remediation action required."]];

    renderTable(doc, {
      startY: y,
      head: [["Security Control Check", "Status", "Severity", "Remediation Guidance"]],
      body: remediationRows,
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 52 },
        1: { cellWidth: 20, halign: "center" },
        2: { cellWidth: 22, halign: "center" },
        3: { cellWidth: 88 },
      },
      didParseCell: (data) => {
        if (data.column.index === 1 && data.section === "body") {
          const v = String(data.cell.raw || "");
          if (v === "FAIL") { data.cell.styles.textColor = C.red;          data.cell.styles.fontStyle = "bold"; }
          else if (v === "PASS") { data.cell.styles.textColor = [22, 163, 74]; data.cell.styles.fontStyle = "bold"; }
        }
        if (data.column.index === 2 && data.section === "body") {
          const v = String(data.cell.raw || "");
          if (v === "HIGH")   { data.cell.styles.textColor = C.red;   data.cell.styles.fontStyle = "bold"; }
          else if (v === "MEDIUM") { data.cell.styles.textColor = C.amber; }
          else if (v === "LOW")    { data.cell.styles.textColor = C.blue; }
        }
      },
    });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 5 — CONCLUSION & APPENDIX
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    y = drawSectionHeader(doc, "4. CONCLUSION & RECOMMENDATIONS", y);

    const conclusionText1 =
      failedChecks > 0
        ? `The Active Directory Security Scan assessment completed against domain ${domain} (scope: ${scopeLabel}). A total of ${failedChecks} AD security control check(s) returned a FAIL result${highRisks > 0 ? `, including ${highRisks} High severity finding(s) such as Krbtgt password age and unconstrained Kerberos delegation` : ""}. The overall risk posture is rated ${riskBand}.`
        : `The Active Directory Security Scan assessment completed against domain ${domain} (scope: ${scopeLabel}). All AD security control checks returned a PASS result. No critical authentication, delegation, or directory policy gaps were identified. The overall security posture is rated Secure.`;

    const conclusionText2 =
      "It is recommended to enforce Krbtgt password rotation on a 12-month cycle (twice per rotation, 24-hours apart), migrate all SPN-configured service accounts to Group Managed Service Accounts (gMSA), require LDAP signing and channel binding at the GPO level, enforce SMB signing on all Domain Controllers, eliminate unconstrained Kerberos delegation, and implement a tiered Active Directory administrative model to reduce lateral movement exposure.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(conclusionText1, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });
    y += 22;
    doc.text(conclusionText2, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });
    y += 28;

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
        ["Security Control Check",  "The Active Directory or Kerberos security control that was evaluated"],
        ["Status",                   "Audit result: Pass (Compliant) or Fail (Non-compliant)"],
        ["Severity",                 "Risk classification assigned to the control gap: High / Medium / Low"],
        ["Technical Details",        "Evidence or observed condition that triggered the control finding"],
        ["Remediation Guidance",     "Specific corrective action to resolve the identified AD security gap"],
      ],
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55 },
        1: { cellWidth: 127 },
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
    doc.text(
      "The findings presented in this report are based on observations made during the assessment period and represent the Active Directory security configuration status of the target domain at the time of scanning. Some findings use high-fidelity simulation models where live DC connectivity is unavailable in production. This report contains confidential and proprietary information intended solely for the authorized recipient. Unauthorized disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.",
      14, y,
      { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 }
    );

    applyHeaderFooterDecorator(doc, "Active Directory Scan");
    doc.save(`Active_Directory_Scan_Report_${scanDate}.pdf`);
  } catch (err) {
    console.error("Failed to generate Active Directory Scan PDF:", err);
  }
};
