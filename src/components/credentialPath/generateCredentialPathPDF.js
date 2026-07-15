import { jsPDF } from "jspdf";
import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../utils/pdfFramework";

// Strip Unicode characters unsupported by Helvetica in jsPDF (arrows, special symbols)
// to prevent monospace font-fallback and cell overflow.
const pdfSafe = (str) =>
  safe(str)
    .replace(/→/g, "->")
    .replace(/←/g, "<-")
    .replace(/↑/g, "^")
    .replace(/↓/g, "v")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[^\x00-\x7F]/g, "");

export const generateCredentialPathPDF = async (
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

  const scopeLabel =
    scope === "full" ? "Full Path Traversal" : "Quick Privilege Check";

  // Aggregate counters
  const totalChecks   = results.length;
  const failedChecks  = results.filter((r) => r.status === "Fail").length;
  const passedChecks  = results.filter((r) => r.status === "Pass").length;
  const highRisks     = results.filter((r) => r.status === "Fail" && r.severity === "High").length;
  const mediumRisks   = results.filter((r) => r.status === "Fail" && r.severity === "Medium").length;
  const lowRisks      = results.filter((r) => r.status === "Fail" && r.severity === "Low").length;

  const riskBand =
    highRisks > 0
      ? "Critical Risk"
      : mediumRisks > 0
      ? "Medium Risk"
      : failedChecks > 0
      ? "Low Risk"
      : "Secure";

  // Pull the shortest-path finding if present
  const attackPathFinding = results.find(
    (r) => r.control === "Shortest Path to Domain Admin"
  );

  // Shadow admin finding
  const shadowAdminFinding = results.find(
    (r) => r.control === "Shadow Administrator Detection"
  );

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
    doc.text(
      "NEXCORE ALLIANCE | Individual Tool Report – Credential Path Audit",
      14, 12
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(...C.bluePrimary);
    doc.text("NEXCORE ALLIANCE", 105, 30, { align: "center" });

    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.text(
      "AI-Powered Cybersecurity & Information Security Solutions",
      105, 36, { align: "center" }
    );

    doc.setDrawColor(...C.bluePrimary);
    doc.setLineWidth(0.4);
    doc.line(14, 40, 196, 40);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...C.bluePrimary);
    doc.text("CREDENTIAL TRAVERSAL PATH SECURITY", 105, 54, { align: "center" });
    doc.text("ASSESSMENT REPORT", 105, 60, { align: "center" });

    doc.line(14, 65, 196, 65);

    renderTable(doc, {
      startY: 72,
      head: [],
      body: [
        ["Assessment Performed by", employeeMail],
        ["Employee Name",           employeeName],
        ["Employee Mail ID",        employeeMail],
        ["Target AD Domain",        domain],
        ["Traversal Scope",         scopeLabel],
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
        ["Tool Name",             "Credential Path Audit"],
        ["Tool Category",         "Identity Traversal / Lateral Movement Mapping / Privilege Escalation"],
        ["Methodology Alignment", "MITRE ATT&CK – Credential Access / Lateral Movement / Privilege Escalation"],
        ["Compliance Alignment",  "ISO/IEC 27001 | AICPA SOC Frameworks | Microsoft Tiered Admin Model"],
        ["Target AD Domain",      domain],
        ["Traversal Scope",       scopeLabel],
        ["Assessment Mode",       "Active / Network Port Probe + BloodHound-Style Path Simulation"],
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
      "The Credential Traversal Path Audit tool traces network identity pathways, user local privilege nesting structures, and Active Directory permission sets. It performs DNS resolution against the target domain, probes AD service ports (Kerberos/88, LDAP/389, LDAPS/636, Global Catalog), and simulates a BloodHound-style privilege graph to map shortest attack vectors to Domain Admin credentials. The tool identifies ACL path vulnerabilities, Kerberos unconstrained delegation configurations, orphaned local administrators, shadow administrator accounts, and hop-by-hop lateral movement paths.",
      14, y,
      { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 }
    );
    y = y + 30;

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 3 — SCAN SUMMARY
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    y = drawSectionHeader(doc, "2. SCAN SUMMARY", y);

    renderTable(doc, {
      startY: y,
      head: [["Target AD Domain", "Scope", "Total Checks", "Failed", "Passed", "High Risk", "Risk Level"]],
      body: [[
        domain,
        scopeLabel,
        String(totalChecks),
        String(failedChecks),
        String(passedChecks),
        String(highRisks),
        riskBand,
      ]],
      headStyles: { fillColor: C.bgHeader, textColor: C.white, halign: "center" },
      columnStyles: {
        0: { cellWidth: 36 },
        1: { cellWidth: 34 },
        2: { halign: "center", cellWidth: 22 },
        3: { halign: "center", cellWidth: 18 },
        4: { halign: "center", cellWidth: 18 },
        5: { halign: "center", cellWidth: 20 },
        6: { halign: "center", cellWidth: 34 },
      },
      didParseCell: (data) => {
        if (data.column.index === 6 && data.section === "body") {
          if (highRisks > 0) {
            data.cell.styles.textColor = C.red;
            data.cell.styles.fontStyle = "bold";
          } else if (mediumRisks > 0) {
            data.cell.styles.textColor = C.amber;
            data.cell.styles.fontStyle = "bold";
          } else if (failedChecks === 0) {
            data.cell.styles.textColor = [22, 163, 74];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
    });
    y = doc.lastAutoTable.finalY + 10;

    // ── Attack Path Highlight Box ──────────────────────────────────────────
    if (attackPathFinding) {
      y = drawSectionHeader(doc, "IDENTIFIED ATTACK PATH TO DOMAIN ADMIN", y);

      const pathText = pdfSafe(attackPathFinding.details);
      const pathLines = doc.splitTextToSize(pathText, 168);
      // Line height ~4mm each, plus 14mm for heading and padding
      const boxHeight = Math.max(22, pathLines.length * 4.2 + 14);

      doc.setFillColor(254, 242, 242);
      doc.setDrawColor(...C.red);
      doc.setLineWidth(0.5);
      doc.roundedRect(14, y, 182, boxHeight, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...C.red);
      doc.text("[!]  CRITICAL ATTACK PATH DETECTED", 20, y + 7);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 0, 0);
      doc.text(pathLines, 20, y + 13);
      y += boxHeight + 6;
    }

    // ── Security Control Findings Overview ────────────────────────────────
    y = drawSectionHeader(doc, "3. DETAILED FINDINGS — CONTROL OVERVIEW", y);

    const overviewRows =
      results.length > 0
        ? results.map((r) => [
            pdfSafe(r.control),
            pdfSafe(r.status).toUpperCase(),
            pdfSafe(r.severity).toUpperCase(),
            pdfSafe(r.details),
          ])
        : [["No findings compiled", "N/A", "N/A", "Scan completed with no active targets."]];

    renderTable(doc, {
      startY: y,
      head: [["Security Control Check", "Status", "Severity", "Technical Details"]],
      body: overviewRows,
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
          if (v === "HIGH" || v === "CRITICAL") { data.cell.styles.textColor = C.red;   data.cell.styles.fontStyle = "bold"; }
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
          if (v === "HIGH" || v === "CRITICAL") { data.cell.styles.textColor = C.red;   data.cell.styles.fontStyle = "bold"; }
          else if (v === "MEDIUM") { data.cell.styles.textColor = C.amber; }
          else if (v === "LOW")    { data.cell.styles.textColor = C.blue; }
        }
      },
    });
    y = doc.lastAutoTable.finalY + 10;

    // ── Shadow Admin Box ────────────────────────────────────────────────────
    if (shadowAdminFinding && shadowAdminFinding.status === "Fail") {
      y = drawSectionHeader(doc, "SHADOW ADMINISTRATOR DETECTION", y);

      renderTable(doc, {
        startY: y,
        head: [],
        body: [
          ["Control",    "Shadow Administrator Detection"],
          ["Status",     "FAIL — Shadow Admin Confirmed"],
          ["Evidence",   safe(shadowAdminFinding.details)],
          ["Mitigation", safe(shadowAdminFinding.remediation)],
        ],
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 28, fillColor: [245, 245, 245] },
          1: { cellWidth: 154 },
        },
        didParseCell: (data) => {
          if (data.column.index === 1 && data.row.index === 1 && data.section === "body") {
            data.cell.styles.textColor = C.red;
            data.cell.styles.fontStyle = "bold";
          }
        },
      });
    }

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 5 — CONCLUSION & APPENDIX
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    y = drawSectionHeader(doc, "4. CONCLUSION & RECOMMENDATIONS", y);

    const conclusionText1 =
      failedChecks > 0
        ? `The Credential Traversal Path Audit completed against Active Directory domain ${domain} (scope: ${scopeLabel}). A total of ${failedChecks} security control check(s) returned a FAIL result${highRisks > 0 ? `, including ${highRisks} High-severity finding(s)` : ""}. ${attackPathFinding ? "A critical lateral movement path to Domain Admin was successfully mapped and confirmed." : ""} The overall risk posture is rated ${riskBand}.`
        : `The Credential Traversal Path Audit completed against Active Directory domain ${domain} (scope: ${scopeLabel}). All ${totalChecks} security control checks returned a PASS result. No active privilege escalation paths, ACL vulnerabilities, or Kerberos delegation misconfigurations were identified.`;

    const conclusionText2 =
      "It is strongly recommended to: (1) Remove WriteDACL/WriteOwner permissions for non-admin groups from GPOs, (2) Disable Unconstrained Kerberos Delegation and migrate to Constrained or Resource-Based Constrained Delegation, (3) Deploy Microsoft LAPS to eliminate shared local administrator credentials, (4) Audit and remove orphaned accounts from local administrator groups, (5) Remove excessive object-level permissions from service accounts, and (6) Implement a Tiered Active Directory Administration model to contain lateral movement to Tier-0 assets.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(conclusionText1, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });
    y += 26;
    doc.text(conclusionText2, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });
    y += 36;

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
        ["Security Control Check",  "The identity traversal or privilege boundary control that was evaluated"],
        ["Status",                   "Audit result: Pass (Compliant / Secure) or Fail (Vulnerable)"],
        ["Severity",                 "Risk classification: High / Medium / Low"],
        ["Technical Details",        "Evidence or observed condition that triggered the control finding"],
        ["Remediation Guidance",     "Specific corrective action to resolve the identified credential path gap"],
        ["Attack Path Highlight",    "Critical multi-hop path from a low-privilege user to Domain Admin access"],
        ["Shadow Administrator",     "Account with excessive object permissions not reflected in group membership"],
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
      "The findings presented in this report are based on observations made during the assessment period and represent the Active Directory credential traversal path status of the target domain at the time of scanning. Some findings use high-fidelity simulation models where live DC connectivity is unavailable. This report contains confidential and proprietary information intended solely for the authorized recipient. Unauthorized disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.",
      14, y,
      { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 }
    );

    applyHeaderFooterDecorator(doc, "Credential Path Audit");
    doc.save(`Credential_Path_Audit_Report_${scanDate}.pdf`);
  } catch (err) {
    console.error("Failed to generate Credential Path PDF:", err);
  }
};
