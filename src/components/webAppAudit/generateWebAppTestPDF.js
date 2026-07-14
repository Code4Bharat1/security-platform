import { jsPDF } from "jspdf";
import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../utils/pdfFramework";

export const generateWebAppTestPDF = async (scanData = {}) => {
  if (!scanData) return;

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

  // Extract all data fields
  const domain        = safe(scanData.domain, "N/A");
  const securityGrade = safe(scanData.securityGrade, "N/A");
  const riskLevel     = safe(scanData.riskLevel, "Unknown").toUpperCase();
  const scanTimestamp = scanData.timestamp
    ? new Date(scanData.timestamp).toLocaleString("en-GB")
    : scanDate;

  const vulnerabilities = Array.isArray(scanData.vulnerabilities) ? scanData.vulnerabilities : [];
  const breakdown       = scanData.vulnerabilityBreakdown || {};
  const criticals       = breakdown.critical || 0;
  const highs           = breakdown.high || 0;
  const mediums         = breakdown.medium || 0;
  const lows            = breakdown.low || 0;
  const totalVulns      = vulnerabilities.length;

  const ssl               = scanData.ssl || {};
  const firewall          = scanData.firewall || {};
  const sessionCookies    = scanData.sessionManagement?.sessionCookies || [];

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
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – Web App Test", 14, 12);

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
    doc.text("WEB APPLICATION SECURITY CONFIGURATION", 105, 54, { align: "center" });
    doc.text("ASSESSMENT REPORT", 105, 60, { align: "center" });

    doc.line(14, 65, 196, 65);

    renderTable(doc, {
      startY: 72,
      head: [],
      body: [
        ["Assessment Performed by", employeeMail],
        ["Employee Name",           employeeName],
        ["Employee Mail ID",        employeeMail],
        ["Target Domain / Host",    domain],
        ["Scan Timestamp",          scanTimestamp],
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
        ["Tool Name",             "Web App Test"],
        ["Tool Category",         "Vulnerability Assessment / Web Application Security Configuration Audit"],
        ["Methodology Alignment", "OWASP WSTG – OTG-CONFIG / OWASP Top 10 (2021)"],
        ["Compliance Alignment",  "ISO/IEC 27001 | AICPA SOC Frameworks | OWASP Top 10"],
        ["Target Domain",         domain],
        ["Security Grade",        securityGrade],
        ["Risk Level",            riskLevel],
        ["Assessment Mode",       "Passive / Active Configuration Audit – Headers, TLS, Cookies, WAF"],
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
      "The Web App Test tool performs automated web application security configuration auditing against a live target domain. It evaluates HTTP response security headers (Content-Security-Policy, HSTS, X-Frame-Options, etc.), analyses session cookie security flags (HttpOnly, Secure, SameSite), validates SSL/TLS certificate integrity, detects WAF/firewall shielding, and identifies vulnerabilities including insecure configurations, missing headers, exposed server banners, and cookie injection risks. Each finding is mapped to OWASP Top 10 (2021) categories and assigned a CVSS v3.1 severity score.",
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
      head: [["Domain", "Security Grade", "Risk Level", "Total Findings", "Critical", "High", "Medium", "Low"]],
      body: [[
        domain,
        securityGrade,
        riskLevel,
        String(totalVulns),
        String(criticals),
        String(highs),
        String(mediums),
        String(lows),
      ]],
      headStyles: { fillColor: C.bgHeader, textColor: C.white, halign: "center" },
      columnStyles: {
        0: { cellWidth: 38 },
        1: { halign: "center", cellWidth: 24 },
        2: { halign: "center", cellWidth: 24 },
        3: { halign: "center", cellWidth: 22 },
        4: { halign: "center", cellWidth: 20 },
        5: { halign: "center", cellWidth: 18 },
        6: { halign: "center", cellWidth: 22 },
        7: { halign: "center", cellWidth: 14 },
      },
      didParseCell: (data) => {
        if (data.column.index === 2 && data.section === "body") {
          const v = String(data.cell.raw || "").toLowerCase();
          if (v === "critical") { data.cell.styles.textColor = C.purple; data.cell.styles.fontStyle = "bold"; }
          else if (v === "high")   { data.cell.styles.textColor = C.red;   data.cell.styles.fontStyle = "bold"; }
          else if (v === "medium") { data.cell.styles.textColor = C.amber; data.cell.styles.fontStyle = "bold"; }
          else if (v === "low")    { data.cell.styles.textColor = C.blue;  data.cell.styles.fontStyle = "bold"; }
        }
      },
    });
    y = doc.lastAutoTable.finalY + 8;

    // SSL/TLS Summary
    y = drawSectionHeader(doc, "SSL/TLS CERTIFICATE STATUS", y);
    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Certificate Status", ssl.valid ? "Valid" : "Invalid / Not Found"],
        ["Issuer Authority",   safe(ssl.issuer, "Not Available")],
        ["Valid From",         ssl.validFrom ? new Date(ssl.validFrom).toLocaleDateString("en-GB") : "N/A"],
        ["Valid To / Expires", ssl.validTo   ? new Date(ssl.validTo).toLocaleDateString("en-GB")   : "N/A"],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: {
          cellWidth: 127,
          textColor: ssl.valid ? [22, 163, 74] : C.red,
          fontStyle: "bold",
        },
      },
    });
    y = doc.lastAutoTable.finalY + 8;

    // WAF / Firewall Summary
    y = drawSectionHeader(doc, "WAF / FIREWALL DETECTION", y);
    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["WAF State",              firewall.detected ? "Shield Detected" : "No Firewall Detected"],
        ["WAF Provider",           firewall.detected ? safe(firewall.wafType, "Unknown") : "N/A"],
        ["Detection Confidence",   firewall.detected ? safe(firewall.confidence, "N/A").toUpperCase() : "N/A"],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 },
      },
    });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 4 — DETAILED VULNERABILITY FINDINGS
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    y = drawSectionHeader(doc, "3. DETAILED FINDINGS — VULNERABILITY CLASSIFICATION", y);

    const findingRows =
      vulnerabilities.length > 0
        ? vulnerabilities.map((v) => [
            safe(v.description),
            safe(v.severity).toUpperCase(),
            safe(v.cvss, "N/A"),
            safe(v.details),
          ])
        : [["No vulnerabilities identified", "—", "—", "All security configuration checks passed."]];

    renderTable(doc, {
      startY: y,
      head: [["Vulnerability / Check", "Severity", "CVSS", "Details"]],
      body: findingRows,
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55 },
        1: { cellWidth: 22, halign: "center" },
        2: { cellWidth: 18, halign: "center" },
        3: { cellWidth: 87 },
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
    // PAGE 5 — REMEDIATION GUIDE + COOKIE AUDIT
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    y = drawSectionHeader(doc, "3. DETAILED FINDINGS — REMEDIATION GUIDE", y);

    const remediationRows =
      vulnerabilities.length > 0
        ? vulnerabilities.map((v) => [
            safe(v.description),
            safe(v.severity).toUpperCase(),
            safe(v.recommendation),
          ])
        : [["No findings", "—", "No remediation action required."]];

    renderTable(doc, {
      startY: y,
      head: [["Vulnerability / Control Check", "Severity", "Remediation Guidance"]],
      body: remediationRows,
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 60 },
        1: { cellWidth: 22, halign: "center" },
        2: { cellWidth: 100 },
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
    y = doc.lastAutoTable.finalY + 8;

    // Session Cookie Audit
    if (sessionCookies.length > 0) {
      y = drawSectionHeader(doc, "SESSION COOKIE SECURITY AUDIT", y);

      const cookieRows = sessionCookies.map((cookie) => [
        safe(cookie.name),
        cookie.attributes?.httponly ? "Yes" : "No",
        cookie.attributes?.secure   ? "Yes" : "No",
        safe(cookie.attributes?.samesite, "None"),
      ]);

      renderTable(doc, {
        startY: y,
        head: [["Cookie Name", "HttpOnly", "Secure", "SameSite"]],
        body: cookieRows,
        headStyles: { fillColor: C.bgHeader, textColor: C.white },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 60 },
          1: { cellWidth: 32, halign: "center" },
          2: { cellWidth: 32, halign: "center" },
          3: { cellWidth: 58, halign: "center" },
        },
        didParseCell: (data) => {
          if ((data.column.index === 1 || data.column.index === 2) && data.section === "body") {
            const v = String(data.cell.raw || "");
            if (v === "No") { data.cell.styles.textColor = C.red;   data.cell.styles.fontStyle = "bold"; }
            else            { data.cell.styles.textColor = [22, 163, 74]; data.cell.styles.fontStyle = "bold"; }
          }
        },
      });
    }

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 6 — CONCLUSION & APPENDIX
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    y = drawSectionHeader(doc, "4. CONCLUSION & RECOMMENDATIONS", y);

    const conclusionText1 =
      totalVulns > 0
        ? `The Web App Test security configuration assessment completed against target domain ${domain}. A total of ${totalVulns} security vulnerability/configuration gap(s) were identified${criticals > 0 ? `, including ${criticals} Critical severity finding(s)` : ""}${highs > 0 ? ` and ${highs} High severity finding(s)` : ""}. The overall security grade is ${securityGrade} with a risk level of ${riskLevel}.`
        : `The Web App Test security configuration assessment completed against target domain ${domain}. No active security vulnerabilities or configuration gaps were identified. The target achieved a security grade of ${securityGrade} with a risk level of ${riskLevel}.`;

    const conclusionText2 =
      "It is recommended to implement all missing HTTP security response headers (Content-Security-Policy, Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options), configure all session cookies with HttpOnly, Secure and SameSite=Lax attributes, enforce TLS 1.2+ with a CA-issued certificate, deploy a Web Application Firewall (WAF) solution, and periodically re-run this configuration audit as part of a scheduled security maintenance programme.";

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
        ["Vulnerability / Control Check", "The OWASP security control or configuration check that was evaluated"],
        ["Severity",                       "Risk classification: Critical / High / Medium / Low"],
        ["CVSS",                           "CVSS v3.1 base score assigned to the vulnerability"],
        ["Details",                        "Technical evidence or observation gathered for this finding"],
        ["Remediation Guidance",           "Specific corrective configuration action to close the identified gap"],
        ["HttpOnly",                       "Whether the session cookie has the HttpOnly flag set (prevents JS access)"],
        ["Secure",                         "Whether the session cookie has the Secure flag set (HTTPS only)"],
        ["SameSite",                       "The SameSite attribute of the cookie (Lax / Strict / None)"],
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
      "The findings presented in this report are based on observations made during the assessment period and represent the web application security configuration status of the target at the time of scanning. This report contains confidential and proprietary information intended solely for the authorized recipient. Unauthorized disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.",
      14, y,
      { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 }
    );

    applyHeaderFooterDecorator(doc, "Web App Test");
    doc.save(`Web_App_Test_Report_${scanDate}.pdf`);
  } catch (err) {
    console.error("Failed to generate Web App Test PDF:", err);
  }
};
