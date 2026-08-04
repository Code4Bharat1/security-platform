import { jsPDF } from "jspdf";
import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../utils/pdfFramework";

export const generateAdvancedDynamicScanPDF = async (
  results = [],
  targetUrl = "https://example.com",
  riskScore = 0,
  urlsCrawled = [],
  summaryText = ""
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

  const safeResults = Array.isArray(results)
    ? results
    : (Array.isArray(results?.results)
      ? results.results
      : (Array.isArray(results?.findings)
        ? results.findings
        : (Array.isArray(results?.vulnerabilities)
          ? results.vulnerabilities
          : [])));

  // Aggregate counts
  const totalVulns   = safeResults.length;
  const failedVulns  = safeResults.filter((r) => r.status === "Fail").length;
  const passedVulns  = safeResults.filter((r) => r.status === "Pass").length;
  const criticals    = safeResults.filter((r) => r.status === "Fail" && r.severity === "Critical").length;
  const highs        = safeResults.filter((r) => r.status === "Fail" && r.severity === "High").length;
  const mediums      = safeResults.filter((r) => r.status === "Fail" && r.severity === "Medium").length;
  const lows         = safeResults.filter((r) => r.status === "Fail" && r.severity === "Low").length;

  const riskBand =
    criticals > 0 ? "Critical Risk"
    : highs > 0   ? "High Risk"
    : mediums > 0  ? "Medium Risk"
    : lows > 0     ? "Low Risk"
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
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – Advanced Dynamic Scan", 14, 12);

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
    doc.text("ADVANCED DYNAMIC SCAN SECURITY ASSESSMENT", 105, 54, { align: "center" });
    doc.text("REPORT", 105, 60, { align: "center" });

    doc.line(14, 65, 196, 65);

    renderTable(doc, {
      startY: 72,
      head: [],
      body: [
        ["Assessment Performed by", employeeMail],
        ["Employee Name",           employeeName],
        ["Employee Mail ID",        employeeMail],
        ["Target URL",              targetUrl],
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
      105, 267, { align: "center" }
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
        ["Tool Name",             "Advanced Dynamic Scan (DAST)"],
        ["Tool Category",         "Vulnerability Assessment / Web Application Security Testing"],
        ["Methodology Alignment", "OWASP WSTG – OTG-VULN-001 / DAST Automated Web Security Testing"],
        ["Compliance Alignment",  "ISO/IEC 27001 | AICPA SOC Frameworks"],
        ["Target URL",            targetUrl],
        ["Assessment Mode",       "Active / Dynamic Application Security Testing (DAST)"],
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
      "The Advanced Dynamic Scan tool performs automated DAST (Dynamic Application Security Testing) against live web application targets. It crawls discovered page paths, analyzes HTTP response headers for security misconfigurations, tests query parameter inputs for injection attack patterns (SQL Injection, Reflected XSS), and validates cookie security flags, CORS policies, and transport encryption configurations.",
      14, y,
      { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 }
    );

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 3 — SCAN SUMMARY
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    y = drawSectionHeader(doc, "2. SCAN SUMMARY", y);

    renderTable(doc, {
      startY: y,
      head: [["Total Checks", "Failed", "Passed", "Critical", "High", "Medium", "Risk Score", "Risk Band"]],
      body: [[
        String(totalVulns),
        String(failedVulns),
        String(passedVulns),
        String(criticals),
        String(highs),
        String(mediums),
        `${riskScore}/100`,
        riskBand,
      ]],
      headStyles: { fillColor: C.bgHeader, textColor: C.white, halign: "center" },
      columnStyles: {
        0: { halign: "center", cellWidth: 22 },
        1: { halign: "center", cellWidth: 20 },
        2: { halign: "center", cellWidth: 20 },
        3: { halign: "center", cellWidth: 22 },
        4: { halign: "center", cellWidth: 20 },
        5: { halign: "center", cellWidth: 22 },
        6: { halign: "center", cellWidth: 25 },
        7: { halign: "center", cellWidth: 31 },
      },
      didParseCell: (data) => {
        if (data.column.index === 7 && data.section === "body") {
          if (criticals > 0 || highs > 0) {
            data.cell.styles.textColor = C.red;
            data.cell.styles.fontStyle = "bold";
          } else if (mediums > 0) {
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

    // Crawled URLs table
    if (urlsCrawled.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...C.bluePrimary);
      doc.text("URLs Crawled During Scan", 14, y);
      y += 5;

      renderTable(doc, {
        startY: y,
        head: [["#", "Crawled URL"]],
        body: urlsCrawled.slice(0, 12).map((url, i) => [String(i + 1), url]),
        headStyles: { fillColor: C.bgHeader, textColor: C.white },
        columnStyles: {
          0: { cellWidth: 10, halign: "center" },
          1: { cellWidth: 172 },
        },
      });
      y = doc.lastAutoTable.finalY + 8;
    }

    // Summary text
    if (summaryText) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...C.textMain);
      doc.text(summaryText, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });
    }

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 4 — DETAILED FINDINGS — STATUS / SEVERITY / OWASP / CWE
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    y = drawSectionHeader(doc, "3. DETAILED FINDINGS", y);

    const findingRows =
      safeResults.length > 0
        ? safeResults.map((v) => [
            safe(v.control),
            safe(v.status).toUpperCase(),
            safe(v.severity).toUpperCase(),
            safe(v.owaspMapping, "—"),
            safe(v.cweMapping, "—"),
          ])
        : [["No findings compiled", "N/A", "N/A", "—", "—"]];

    renderTable(doc, {
      startY: y,
      head: [["Vulnerability / Control Check", "Status", "Severity", "OWASP Mapping", "CWE"]],
      body: findingRows,
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 62 },
        1: { cellWidth: 18, halign: "center" },
        2: { cellWidth: 22, halign: "center" },
        3: { cellWidth: 52 },
        4: { cellWidth: 28 },
      },
      didParseCell: (data) => {
        if (data.column.index === 1 && data.section === "body") {
          const v = String(data.cell.raw || "");
          if (v === "FAIL") { data.cell.styles.textColor = C.red;          data.cell.styles.fontStyle = "bold"; }
          else if (v === "PASS") { data.cell.styles.textColor = [22, 163, 74]; data.cell.styles.fontStyle = "bold"; }
        }
        if (data.column.index === 2 && data.section === "body") {
          const v = String(data.cell.raw || "");
          if (v === "CRITICAL") { data.cell.styles.textColor = C.purple; data.cell.styles.fontStyle = "bold"; }
          else if (v === "HIGH")   { data.cell.styles.textColor = C.red;    data.cell.styles.fontStyle = "bold"; }
          else if (v === "MEDIUM") { data.cell.styles.textColor = C.amber;  }
          else if (v === "LOW")    { data.cell.styles.textColor = C.blue;   }
        }
      },
    });
    y = doc.lastAutoTable.finalY + 8;

    // Details + Evidence table
    y = drawSectionHeader(doc, "3. DETAILED FINDINGS — EVIDENCE & DETAILS", y);

    const evidenceRows =
      safeResults.length > 0
        ? safeResults.map((v) => [
            safe(v.control),
            safe(v.severity).toUpperCase(),
            safe(v.details),
            safe(v.evidence, "—"),
          ])
        : [["No findings", "N/A", "No active vulnerabilities detected.", "—"]];

    renderTable(doc, {
      startY: y,
      head: [["Control Check", "Severity", "Details", "Evidence"]],
      body: evidenceRows,
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 45 },
        1: { cellWidth: 20, halign: "center" },
        2: { cellWidth: 65 },
        3: { cellWidth: 52 },
      },
      didParseCell: (data) => {
        if (data.column.index === 1 && data.section === "body") {
          const v = String(data.cell.raw || "");
          if (v === "CRITICAL") { data.cell.styles.textColor = C.purple; data.cell.styles.fontStyle = "bold"; }
          else if (v === "HIGH")   { data.cell.styles.textColor = C.red;   data.cell.styles.fontStyle = "bold"; }
          else if (v === "MEDIUM") { data.cell.styles.textColor = C.amber; }
          else if (v === "LOW")    { data.cell.styles.textColor = C.blue;  }
        }
      },
    });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 5 — REMEDIATION GUIDE
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    y = drawSectionHeader(doc, "3. DETAILED FINDINGS — REMEDIATION GUIDE", y);

    const remediationRows =
      safeResults.length > 0
        ? safeResults.map((v) => [
            safe(v.control),
            safe(v.status).toUpperCase(),
            safe(v.severity).toUpperCase(),
            safe(v.remediation),
          ])
        : [["No findings", "N/A", "N/A", "No remediation required."]];

    renderTable(doc, {
      startY: y,
      head: [["Vulnerability / Control Check", "Status", "Severity", "Remediation Guidance"]],
      body: remediationRows,
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 52 },
        1: { cellWidth: 18, halign: "center" },
        2: { cellWidth: 22, halign: "center" },
        3: { cellWidth: 90 },
      },
      didParseCell: (data) => {
        if (data.column.index === 1 && data.section === "body") {
          const v = String(data.cell.raw || "");
          if (v === "FAIL") { data.cell.styles.textColor = C.red;          data.cell.styles.fontStyle = "bold"; }
          else if (v === "PASS") { data.cell.styles.textColor = [22, 163, 74]; data.cell.styles.fontStyle = "bold"; }
        }
        if (data.column.index === 2 && data.section === "body") {
          const v = String(data.cell.raw || "");
          if (v === "CRITICAL") { data.cell.styles.textColor = C.purple; data.cell.styles.fontStyle = "bold"; }
          else if (v === "HIGH")   { data.cell.styles.textColor = C.red;   data.cell.styles.fontStyle = "bold"; }
          else if (v === "MEDIUM") { data.cell.styles.textColor = C.amber; }
          else if (v === "LOW")    { data.cell.styles.textColor = C.blue;  }
        }
      },
    });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 6 — CONCLUSION & APPENDIX
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    y = drawSectionHeader(doc, "4. CONCLUSION & RECOMMENDATIONS", y);

    const conclusionText1 =
      failedVulns > 0
        ? `The Advanced Dynamic Scan (DAST) assessment completed against target ${targetUrl}. A total of ${failedVulns} vulnerability check(s) returned a FAIL result, with a computed risk score of ${riskScore}/100 and an overall risk band of ${riskBand}. ${criticals > 0 ? "Critical injection vulnerabilities were confirmed and require immediate remediation." : ""}`
        : `The Advanced Dynamic Scan (DAST) assessment completed against target ${targetUrl}. All security controls returned a PASS result with a risk score of ${riskScore}/100. No active web application vulnerabilities were identified at the time of scanning.`;

    const conclusionText2 =
      "It is recommended to enforce comprehensive Content Security Policy headers, enable Strict Transport Security, restrict CORS policies to trusted origins only, configure all cookies with HttpOnly, Secure and SameSite flags, and implement parameterized queries throughout all database interaction layers to mitigate injection attack surfaces.";

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
        ["Vulnerability / Control Check", "The OWASP security control or vulnerability type that was tested"],
        ["Status", "PASS (No vulnerability found) or FAIL (Vulnerability confirmed)"],
        ["Severity", "Risk rating: Critical / High / Medium / Low / Info"],
        ["OWASP Mapping", "OWASP Top 10 (2021) category aligned to this finding"],
        ["CWE", "Common Weakness Enumeration identifier for the underlying flaw"],
        ["Details", "Technical observation describing the vulnerability evidence"],
        ["Evidence", "HTTP request, header key, or URL path where the finding was confirmed"],
        ["Remediation Guidance", "Specific corrective action to fix the identified vulnerability"],
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
      "The findings presented in this report are based on observations made during the assessment period and represent the dynamic web application security status of the target at the time of scanning. This report contains confidential and proprietary information intended solely for the authorized recipient. Unauthorized disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.",
      14, y,
      { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 }
    );

    applyHeaderFooterDecorator(doc, "Advanced Dynamic Scan");
    doc.save(`Advanced_Dynamic_Scan_Report_${scanDate}.pdf`);
  } catch (err) {
    console.error("Failed to generate Advanced Dynamic Scan PDF:", err);
  }
};
