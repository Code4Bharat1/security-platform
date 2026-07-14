import { jsPDF } from "jspdf";
import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../utils/pdfFramework";

export const generateSystemHardeningPDF = async (results = [], target = "127.0.0.1") => {
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

  const totalChecks  = results.length;
  const failedChecks = results.filter((r) => r.status === "Fail").length;
  const passedChecks = results.filter((r) => r.status === "Pass").length;
  const highRisks    = results.filter((r) => r.status === "Fail" && r.severity === "High").length;
  const mediumRisks  = results.filter((r) => r.status === "Fail" && r.severity === "Medium").length;

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
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – System Hardening", 14, 12);

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
    doc.text("SYSTEM HARDENING SECURITY ASSESSMENT", 105, 54, { align: "center" });
    doc.text("REPORT", 105, 60, { align: "center" });

    doc.line(14, 65, 196, 65);

    renderTable(doc, {
      startY: 72,
      head: [],
      body: [
        ["Assessment Performed by", employeeMail],
        ["Employee Name",           employeeName],
        ["Employee Mail ID",        employeeMail],
        ["Scanned Target / Host",   target],
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
    doc.text(
      "www.nexcorealliance.com | ISO/IEC 27001 Certified | AICPA SOC Compliant",
      105,
      267,
      { align: "center" }
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
        ["Tool Name",             "System Hardening"],
        ["Tool Category",         "Advance Scanning / CIS Benchmark Auditor"],
        ["Methodology Alignment", "CIS Benchmarks / OWASP WSTG – OTG-CONFIG-001"],
        ["Compliance Alignment",  "ISO/IEC 27001 | AICPA SOC Frameworks"],
        ["Scanned Target / Host", target],
        ["Assessment Mode",       "Non-Intrusive / Automated CIS Configuration Audit"],
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
      "The System Hardening tool performs an automated CIS Benchmark configuration audit against a target host. It scans active network services and open port configurations, identifies insecure or unnecessary services, validates encryption enforcement, and detects database management interfaces exposed to the internet. Findings are mapped directly against standard hardening control requirements.",
      14,
      y,
      { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 }
    );

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 3 — SCAN SUMMARY + DETAILED FINDINGS
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    y = drawSectionHeader(doc, "2. SCAN SUMMARY", y);

    renderTable(doc, {
      startY: y,
      head: [["Target Host", "Total Checks", "Failed Controls", "Passed Controls", "Risk Level", "Status"]],
      body: [
        [target, String(totalChecks), String(failedChecks), String(passedChecks), riskBand, "Completed"],
      ],
      headStyles: { fillColor: C.bgHeader, textColor: C.white, halign: "center" },
      columnStyles: {
        0: { halign: "center", cellWidth: 42 },
        1: { halign: "center", cellWidth: 25 },
        2: { halign: "center", cellWidth: 28 },
        3: { halign: "center", cellWidth: 28 },
        4: { halign: "center", cellWidth: 32 },
        5: { halign: "center", cellWidth: 27 },
      },
      didParseCell: (data) => {
        if (data.column.index === 4 && data.section === "body") {
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
      head: [["Security Control Check", "Status", "Severity", "Details"]],
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
        ? results.map((r) => [safe(r.control), safe(r.status).toUpperCase(), safe(r.remediation)])
        : [["No findings", "N/A", "No remediation action required."]];

    renderTable(doc, {
      startY: y,
      head: [["Security Control Check", "Status", "Remediation Guidance"]],
      body: remediationRows,
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 52 },
        1: { cellWidth: 20, halign: "center" },
        2: { cellWidth: 110 },
      },
      didParseCell: (data) => {
        if (data.column.index === 1 && data.section === "body") {
          const v = String(data.cell.raw || "");
          if (v === "FAIL") { data.cell.styles.textColor = C.red;          data.cell.styles.fontStyle = "bold"; }
          else if (v === "PASS") { data.cell.styles.textColor = [22, 163, 74]; data.cell.styles.fontStyle = "bold"; }
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
        ? `The System Hardening assessment completed against target host ${target}. A total of ${failedChecks} CIS Benchmark control check(s) returned a FAIL result, indicating exposed or misconfigured service interfaces. The overall risk posture is rated ${riskBand}.`
        : `The System Hardening assessment completed against target host ${target}. All CIS Benchmark control checks returned a PASS result. No exposed insecure service interfaces were identified. The overall security posture is rated Secure.`;

    const conclusionText2 =
      "It is recommended to enforce a default-deny inbound firewall policy using UFW or iptables, disable all cleartext management protocols (Telnet, FTP), migrate to encrypted alternatives (SSH, SFTP, HTTPS), restrict database administrative ports to localhost bindings only, and periodically re-run CIS Benchmark configuration audits as part of a scheduled security maintenance programme.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(conclusionText1, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });
    y += 20;
    doc.text(conclusionText2, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });
    y += 26;

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
        ["Security Control Check", "The CIS Benchmark or service configuration control that was audited"],
        ["Status",                 "Audit result: Pass (Compliant) or Fail (Non-compliant)"],
        ["Severity",               "Risk rating assigned to the control gap: High / Medium / Low"],
        ["Details",                "Technical evidence or observations gathered for this control"],
        ["Remediation Guidance",   "Actionable steps to close the identified security configuration gap"],
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
      "The findings presented in this report are based on observations made during the assessment period and represent the system hardening configuration status of the target at the time of scanning. This report contains confidential and proprietary information intended solely for the authorized recipient. Unauthorized disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.",
      14,
      y,
      { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 }
    );

    applyHeaderFooterDecorator(doc, "System Hardening");
    doc.save(`System_Hardening_Report_${scanDate}.pdf`);
  } catch (err) {
    console.error("Failed to generate System Hardening PDF:", err);
  }
};
