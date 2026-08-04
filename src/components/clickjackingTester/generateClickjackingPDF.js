import { jsPDF } from "jspdf";
import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../utils/pdfFramework";

// Static lookup map for clickjacking finding details
const clickjackingLookup = {
  Vulnerable: {
    severity: "High",
    status: "Vulnerable / Unprotected",
    recommendedConfig: "X-Frame-Options: DENY or SAMEORIGIN\nContent-Security-Policy: frame-ancestors 'self' or 'none'",
    impact: "Absent or misconfigured X-Frame-Options and CSP frame-ancestors headers allow an attacker to overlay the target site within an invisible iframe. This enables UI redressing (clickjacking) where users are tricked into performing unintended actions such as clicking buttons, submitting forms, or entering credentials.",
    recommendation: "Deploy the X-Frame-Options header set to 'DENY' or 'SAMEORIGIN'. Additionally, implement a Content-Security-Policy (CSP) header specifying the 'frame-ancestors' directive (e.g. frame-ancestors 'self') to prevent unauthorized embedding in modern browsers."
  },
  Safe: {
    severity: "Safe",
    status: "Protected",
    recommendedConfig: "Current configuration meets security requirements.",
    impact: "Active X-Frame-Options or Content-Security-Policy (frame-ancestors) headers successfully instruct client browsers to reject iframe nesting attempts from external origins, completely mitigating standard clickjacking vectors.",
    recommendation: "No immediate action required. Maintain consistent header configuration across all subdomains and route endpoints."
  }
};

export const generateClickjackingPDF = async (result = {}, setPdfProgress) => {
  if (!result) return;
  setPdfProgress?.("Initializing Clickjacking PDF Report...");

  const { employeeName, employeeMail } = getAuditorInfo();
  
  const now = new Date();
  const scanDate = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  const scanTime = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  try {
    const doc = new jsPDF("p", "mm", "a4");
    const domain = safe(result.url || "Unknown Target").replace(/^https?:\/\//, "").split("/")[0];

    const isProtected = result.isProtected || false;
    const overallStatus = isProtected ? "Safe" : "Vulnerable";
    const xfoStatus = (result.headers?.hasXfo || result.headers?.xFrameOptions) ? "Present" : "Missing";
    const cspStatus = (result.headers?.hasCspFrameAncestors) ? "Present" : "Missing";

    const lookup = clickjackingLookup[overallStatus];

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 1 — COVER PAGE & ASSESSMENT INFORMATION
    // ══════════════════════════════════════════════════════════════════════
    
    // Top brand text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – Clickjacking Tester", 14, 12);

    // Company logo/header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(...C.bluePrimary);
    doc.text("NEXCORE ALLIANCE", 105, 30, { align: "center" });

    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.text("AI-Powered Cybersecurity & Information Security Solutions", 105, 36, { align: "center" });

    // Divider below company header block
    doc.setDrawColor(...C.bluePrimary);
    doc.setLineWidth(0.4);
    doc.line(14, 40, 196, 40);

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...C.bluePrimary);
    doc.text("CLICKJACKING TESTER SECURITY ASSESSMENT REPORT", 105, 54, { align: "center" });

    // Divider below title block
    doc.line(14, 60, 196, 60);

    // Cover Page Table
    renderTable(doc, {
      startY: 65,
      head: [],
      body: [
        ["Assessment Performed by", employeeMail],
        ["Employee Name",           employeeName],
        ["Employee Mail ID",        employeeMail],
        ["Scanned URL",             result.url || "—"],
        ["Assessment Date",         scanDate],
        ["Assessment Time",         scanTime],
        ["Classification",          "Confidential"],
        ["Assessment Status",        "Completed"]
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 }
      },
    });

    let y = doc.lastAutoTable.finalY + 8;

    // Cover page footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...C.textMuted);
    doc.text("www.nexcorealliance.com | ISO/IEC 27001 Certified | AICPA SOC Compliant", 105, 275, { align: "center" });

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 2 — ASSESSMENT INFORMATION
    // ══════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = drawSectionHeader(doc, "1. ASSESSMENT INFORMATION", 25);

    // Tool details
    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Tool Name",             "Clickjacking Tester"],
        ["Tool Category",         "Web Application Security / UI Redressing"],
        ["Methodology Alignment", "OWASP WSTG – OTG-CLIENT-009 / Clickjacking Testing"],
        ["Compliance Alignment",  "ISO/IEC 27001 | AICPA SOC Frameworks"],
        ["Scanned URL",           result.url || "—"],
        ["Assessment Mode",       "Non-Intrusive / Automated Header Analysis"]
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 }
      }
    });

    y = doc.lastAutoTable.finalY + 8;

    // Overview
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Tool Overview", 14, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    const overviewText = "The Clickjacking Tester analyses the target URL for the presence and correct configuration of the X-Frame-Options and Content-Security-Policy (frame-ancestors) HTTP response headers. When these headers are absent or misconfigured, an attacker may embed the target page inside a transparent iframe, tricking authenticated users into performing unintended actions such as authorising transactions, modifying account settings, or disclosing credentials.";
    doc.text(overviewText, 14, y + 5, { maxWidth: 182, align: "justify", lineHeightFactor: 1.45 });

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 3 — SCAN SUMMARY & DETAILED FINDINGS & CONCLUSION
    // ══════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = drawSectionHeader(doc, "2. SCAN SUMMARY", 25);

    renderTable(doc, {
      startY: y,
      head: [["Target URL", "X-Frame-Options", "CSP frame-ancestors", "Overall Status"]],
      body: [[
        domain,
        xfoStatus,
        cspStatus,
        overallStatus
      ]],
      headStyles: {
        fillColor: C.bgHeader,
        textColor: C.white,
        halign: "center",
      },
      bodyStyles: {
        halign: "center",
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: "bold", halign: "left" },
        1: { cellWidth: 35 },
        2: { cellWidth: 47 },
        3: { cellWidth: 40, fontStyle: "bold", textColor: isProtected ? [22, 163, 74] : C.red }
      }
    });

    y = doc.lastAutoTable.finalY + 10;

    y = drawSectionHeader(doc, "3. DETAILED FINDINGS", y);

    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Severity",                  lookup.severity],
        ["Status",                    lookup.status],
        ["Recommended Configuration", lookup.recommendedConfig],
        ["Impact",                    lookup.impact],
        ["Recommendation",            lookup.recommendation]
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 }
      },
      didParseCell: (data) => {
        if (data.column.index === 1 && data.row.index === 0) {
          data.cell.styles.textColor = isProtected ? [22, 163, 74] : C.red;
          data.cell.styles.fontStyle = "bold";
        }
      }
    });

    y = doc.lastAutoTable.finalY + 10;

    y = drawSectionHeader(doc, "4. CONCLUSION & RECOMMENDATIONS", y);

    const conclusionText = `The Clickjacking Tester assessment evaluated the HTTP response headers of the target URL for controls that prevent UI-redressing attacks. The absence of X-Frame-Options or a Content-Security-Policy frame-ancestors directive leaves the application susceptible to clickjacking, where a malicious page embeds the target inside a transparent iframe to capture user interactions without their knowledge.\n\nThe following remediation actions are recommended:\n1. Add X-Frame-Options: DENY to all HTTP responses. Use SAMEORIGIN only if same-domain iframe embedding is a documented business requirement.\n2. Implement a Content-Security-Policy header with frame-ancestors 'none' (or 'self') for modern browser enforcement, which supersedes X-Frame-Options in current browsers.\n3. Apply header controls at the web server or reverse-proxy layer to ensure consistent enforcement across all application endpoints and subdomains.\n4. Schedule periodic reassessment after any infrastructure or configuration change to confirm protective headers remain in place.`;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(conclusionText, 14, y, { maxWidth: 182, align: "left", lineHeightFactor: 1.4 });

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 4 — APPENDIX
    // ══════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = drawSectionHeader(doc, "5. APPENDIX", 25);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Column Reference Guide", 14, y);

    renderTable(doc, {
      startY: y + 5,
      head: [["Column", "Description"]],
      body: [
        ["Target URL",                  "Website URL evaluated for clickjacking protection mechanisms."],
        ["X-Frame-Options Status",      "Indicates whether the X-Frame-Options response header is present, missing, or misconfigured."],
        ["CSP frame-ancestors Status",  "Indicates whether the Content-Security-Policy frame-ancestors directive is implemented and properly configured."],
        ["Overall Status",              "Overall security risk determined from the clickjacking assessment results."],
        ["Severity",                    "Risk level assigned to the identified issue (Critical, High, Medium, Low, or Informational)."],
        ["Status",                      "Indicates whether the evaluated security header is Present, Missing, or Misconfigured."],
        ["Recommended Configuration",   "Secure configuration recommended according to OWASP and industry best practices."],
        ["Impact",                      "Describes the potential consequences of missing or improperly configured clickjacking protection, including UI redressing attacks, unauthorized user actions, and credential theft."],
        ["Recommendation",              "Recommended remediation actions, including implementing X-Frame-Options and Content-Security-Policy frame-ancestors headers with secure values across all application responses."]
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50, fillColor: [245, 245, 245] },
        1: { cellWidth: 132 }
      }
    });

    y = doc.lastAutoTable.finalY + 10;

    // Acknowledgement
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Acknowledgement", 14, y);

    const ackText = "The findings presented in this report are based on observations made during the assessment period and represent the HTTP header configuration of the environment at the time of scanning. This report contains confidential and proprietary information intended solely for the authorised recipient. Unauthorised disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.";
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(ackText, 14, y + 5, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });

    // Apply header & footer decorator to all pages
    applyHeaderFooterDecorator(doc, "Clickjacking Tester");

    setPdfProgress?.("Saving PDF...");
    doc.save(`${domain}-Clickjacking-Report-${Date.now()}.pdf`);
  } catch (err) {
    console.error("Failed to generate Clickjacking PDF report:", err);
  } finally {
    setPdfProgress?.(null);
  }
};
