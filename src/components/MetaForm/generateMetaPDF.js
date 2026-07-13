import { jsPDF } from "jspdf";
import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../utils/pdfFramework";

const trim = (str, len) => {
  if (!str) return "";
  return str.length > len ? str.substring(0, len) + "..." : str;
};

export const generateMetaPDF = async (report = {}, url = "") => {
  if (!report) return;

  const { employeeName, employeeMail } = getAuditorInfo();
  const targetUrl = report.targetUrl || url || "-";
  const fetchedUrl = report.fetchedUrl || targetUrl;
  const timestamp = report.timestamp || new Date().toISOString();

  // Extract scores
  const seoScore = report.scores?.seo ?? 0;
  const securityScore = report.scores?.security ?? 0;
  const totalScore = report.scores?.total ?? 0;
  const corsVerdict = report.cors?.verdict || "Reasonable";

  try {
    const doc = new jsPDF("p", "mm", "a4");

    // Dates
    const now = new Date();
    const scanDate = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
    const scanTime = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

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
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – Meta Tag Analyzer", 14, 12);

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
    doc.text("META TAG ANALYZER", 105, 54, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("SECURITY ASSESSMENT REPORT", 105, 60, { align: "center" });

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
        ["Target URL",              targetUrl],
        ["Fetched URL",             fetchedUrl],
        ["Assessment Timestamp",    timestamp],
        ["Classification",          "Confidential"],
        ["Assessment Status",       "Completed"],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 },
      },
    });

    // Page 1 Section Tag
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("1. ASSESSMENT INFORMATION", 14, 250);

    // Cover footer
    doc.line(14, 260, 196, 260);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("www.nexcorealliance.com | ISO/IEC 27001 Certified | AICPA SOC Compliant", 105, 267, { align: "center" });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 2 — ASSESSMENT INFORMATION & TOOL OVERVIEW
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();

    let y = 25;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Tool Details", 14, y);
    y += 5;

    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Tool Name",             "Meta Tag Analyzer"],
        ["Tool Category",         "Web Security Configuration & Metadata Analyzer"],
        ["Methodology Alignment", "OWASP WSTG – OTG-CONFIG / OTG-CLIENT – HTTP Security Header & CORS Configuration Review"],
        ["Compliance Alignment",  "ISO/IEC 27001 | AICPA SOC Frameworks | OWASP Secure Headers Project"],
        ["Target URL",            targetUrl],
        ["Fetched URL",           fetchedUrl],
        ["Assessment Mode",       "Non-Intrusive / Automated HTTP Response Header, Meta Tag & CORS Analysis"],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 },
      },
    });

    y = doc.lastAutoTable.finalY + 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Tool Overview", 14, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMain);
    const overviewText =
      "The Meta Tag Analyzer performs automated inspection of HTTP response security headers, HTML meta tags, and Cross-Origin Resource Sharing (CORS) configuration for a target web application. The tool evaluates the presence and configuration of critical security headers – including Content-Security-Policy, Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options, and Referrer-Policy – against OWASP Secure Headers recommendations. It additionally reviews SEO-relevant meta tags (meta description, robots directives, canonical links, and Open Graph properties) and audits CORS response headers to determine cross-origin access policy exposure. The tool produces composite SEO and Security scores summarising the overall configuration posture of the target.";
    doc.text(overviewText, 14, y + 6, { maxWidth: 182, align: "justify", lineHeightFactor: 1.45 });

    y = doc.internal.pageSize.height - 40;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("2. SCAN SUMMARY", 14, y);

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 3 — SCAN SUMMARY & DETAILED FINDINGS
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();

    y = 25;
    renderTable(doc, {
      startY: y,
      head: [["SEO Score", "Security Score", "Total Score", "CORS Verdict"]],
      body: [[`${seoScore} / 10`, `${securityScore} / 10`, `${totalScore} / 10`, corsVerdict]],
      headStyles: { fillColor: C.bgHeader, textColor: C.white, halign: "center" },
      bodyStyles: { halign: "center", fontStyle: "bold" }
    });

    y = doc.lastAutoTable.finalY + 10;

    y = drawSectionHeader(doc, "3. DETAILED FINDINGS", y);

    // Section 3a: Security Header Configuration Table
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Security Header Configuration", 14, y);
    y += 5;

    const securityRows = (report.security?.checks || []).map((c) => [
      c.key || "-",
      c.exists ? (c.value ? trim(c.value, 40) : "Present") : "Missing",
      c.severity || "-",
      c.note || "-"
    ]);

    renderTable(doc, {
      startY: y,
      head: [["Header/Meta", "Status/Value", "Severity", "Note"]],
      body: securityRows.length > 0 ? securityRows : [["-", "-", "-", "-"]],
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 45 },
        1: { cellWidth: 40 },
        2: { cellWidth: 20, halign: "center" },
        3: { cellWidth: 77 }
      }
    });

    y = doc.lastAutoTable.finalY + 10;

    // Section 3b: Meta Tag & SEO Configuration Table
    if (297 - y < 55) {
      doc.addPage();
      y = 25;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Meta Tag & SEO Configuration", 14, y);
    y += 5;

    const seoRows = (report.seo?.checks || []).map((c) => [
      c.key || "-",
      c.status || "-",
      c.severity || "Low",
      c.detail || "-"
    ]);

    // Push Open Graph preview info if available
    const ogTitle = report.og?.title ? "Present" : "Missing";
    const ogDesc = report.og?.description ? "Present" : "Missing";
    const ogImage = report.og?.image ? "Present" : "Missing";
    seoRows.push([
      "Open Graph",
      report.og?.title ? "Exists" : "Missing",
      "Low",
      `title=${ogTitle.toLowerCase()[0]} desc=${ogDesc.toLowerCase()[0]} image=${ogImage.toLowerCase()[0]}`
    ]);

    renderTable(doc, {
      startY: y,
      head: [["Item", "Status", "Severity", "Detail"]],
      body: seoRows,
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 40 },
        1: { cellWidth: 35 },
        2: { cellWidth: 20, halign: "center" },
        3: { cellWidth: 87 }
      }
    });

    y = doc.lastAutoTable.finalY + 10;

    // Section 3c: CORS Configuration Table
    if (297 - y < 65) {
      doc.addPage();
      y = 25;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("CORS Configuration", 14, y);
    y += 5;

    const corsHeaders = [
      ["Access-Control-Allow-Origin",      report.cors?.headers?.allow_origin || "Not Present",      ""],
      ["Access-Control-Allow-Credentials", report.cors?.headers?.allow_credentials || "Not Present", ""],
      ["Access-Control-Allow-Methods",     report.cors?.headers?.allow_methods || "Not Present",     ""],
      ["Access-Control-Allow-Headers",     report.cors?.headers?.allow_headers || "Not Present",     ""],
      ["Access-Control-Expose-Headers",    report.cors?.headers?.expose_headers || "Not Present",    ""],
    ];

    renderTable(doc, {
      startY: y,
      head: [["Header", "Value", "Severity"]],
      body: corsHeaders,
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 60 },
        1: { cellWidth: 92 },
        2: { cellWidth: 30 }
      }
    });

    // Add Verdict Row manually
    y = doc.lastAutoTable.finalY;
    doc.setFillColor(...C.bgHeader);
    doc.rect(14, y, 182, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...C.white);
    doc.text(`Verdict: ${corsVerdict}`, 18, y + 4.2);
    y += 15;

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 4 — CONCLUSION & RECOMMENDATIONS & APPENDIX
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();

    y = drawSectionHeader(doc, "4. CONCLUSION & RECOMMENDATIONS", 25);

    // Count findings
    const secIssues = (report.security?.checks || []).filter(c => !c.exists).length;
    const seoIssues = (report.seo?.checks || []).filter(c => c.status?.toLowerCase().includes("missing")).length;
    const totalFindings = secIssues + seoIssues;

    const conclusionText1 =
      `The Meta Tag Analyzer assessment of ${targetUrl} returned a SEO Score of ${seoScore}/10, a Security Score of ${securityScore}/10, and a Total Score of ${totalScore}/10. ${totalFindings} findings were identified: missing or weak security configurations, duplicate or misconfigured tags, and exposed Cross-Origin Resource Sharing settings.`;

    const conclusionText2 =
      "It is recommended that Content-Security-Policy and Strict-Transport-Security be implemented as priority remediation items, given their importance in mitigating XSS and session hijacking vectors. Referrer-Policy and X-Content-Type-Options should also be configured to minimize sensitive parameter disclosure and content-sniffing exposure. SEO metadata gaps should be addressed systematically to improve indexation, and CORS policies should restrict origins to authorized clients only.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMain);
    doc.text(conclusionText1, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.45 });
    y += doc.getTextDimensions(conclusionText1, { maxWidth: 182 }).h + 6;

    doc.text(conclusionText2, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.45 });
    y += doc.getTextDimensions(conclusionText2, { maxWidth: 182 }).h + 12;

    y = drawSectionHeader(doc, "5. APPENDIX", y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Column Reference Guide", 14, y);
    y += 5;

    renderTable(doc, {
      startY: y,
      head: [["Column", "Description"]],
      body: [
        ["Severity",       "Risk level assigned to the finding: Critical / High / Medium / Low / Informational"],
        ["Header/Meta",    "The HTTP security header or HTML meta element evaluated during the assessment"],
        ["Status/Value",   "The observed configuration state: Missing, Not Present, or the configured directive value"],
        ["Category",       "Classification of the finding: HTTP Security Header / SEO Metadata / CORS Configuration"],
        ["Item",           "Specific meta tag or metadata element assessed (e.g., meta:description, link:canonical)"],
        ["Status",         "Presence status of the meta/SEO item: Missing / Present / Not present (OK)"],
        ["Detail",         "Supporting detail or sub-property values relevant to the assessed item"],
        ["Note",           "Brief description of the security purpose served by the assessed header"],
        ["Verdict",        "Overall assessment outcome for the CORS configuration: Reasonable / Excessive / Misconfigured"],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 40, fillColor: [245, 245, 245] },
        1: { cellWidth: 142 }
      }
    });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 5 — APPENDIX (CONTINUED) & ACKNOWLEDGEMENT
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();

    y = 25;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Column Reference Guide (Continued)", 14, y);
    y += 5;

    renderTable(doc, {
      startY: y,
      head: [["Column", "Description"]],
      body: [
        ["Headers Assessed",   "List of CORS response headers evaluated for the target resource"],
        ["SEO Score",          "Composite score (0–10) reflecting SEO metadata configuration coverage"],
        ["Security Score",     "Composite score (0–10) reflecting security header configuration coverage"],
        ["Total Score",        "Combined composite score (0–10) reflecting overall SEO and security configuration coverage"],
        ["Validation Status",  "Outcome of finding validation: Passed / Failed / Warning / Informational"],
        ["Impact",             "Potential security or SEO consequence if the finding is not addressed"],
        ["Recommendation",     "Specific, actionable remediation guidance for the identified finding"]
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 40, fillColor: [245, 245, 245] },
        1: { cellWidth: 142 }
      }
    });

    y = doc.lastAutoTable.finalY + 15;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Acknowledgement", 14, y);
    y += 5;

    const ackText =
      "The findings presented in this report are based on observations made during the assessment period and represent the HTTP security header, meta tag, and CORS configuration posture of the target environment at the time of scanning. This report contains confidential and proprietary information intended solely for the authorised recipient. Unauthorised disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMain);
    doc.text(ackText, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });

    // Apply header / footer decorator
    applyHeaderFooterDecorator(doc, "Meta Tag Analyzer");

    const pad = (n) => String(n).padStart(2, "0");
    const dStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    
    doc.save(`Meta_Tag_Analyzer_Report_${dStr}.pdf`);

  } catch (err) {
    console.error("Failed to generate Meta PDF:", err);
  }
};
