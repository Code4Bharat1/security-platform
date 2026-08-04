import { jsPDF } from "jspdf";
import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../utils/pdfFramework";

const csrfLookup = {
  "Token Present": {
    weight: 30,
    impact: "Absent anti-CSRF tokens in state-changing POST/PUT/DELETE forms allow cross-site requests to execute actions within the context of an authenticated user session.",
    recommendation: "Implement CSRF tokens in all state-changing forms",
    issue: "Anti-CSRF validation tokens were not detected in form request handlers or HTML source code."
  },
  "Cookie SameSite": {
    weight: 30,
    impact: "Cookies missing the SameSite attribute (or set to SameSite=None) will be sent along with cross-site requests, facilitating session hijacking and Cross-Site Request Forgery.",
    recommendation: "Use SameSite-Strict cookie attribute on all session and authentication cookies",
    issue: "Authentication and session cookies do not declare SameSite=Strict or SameSite=Lax restrictions."
  },
  "Origin / Referrer Policy": {
    weight: 30,
    impact: "Failure to validate the Origin and Referer headers server-side allows requests originating from arbitrary malicious external domains to be accepted and processed.",
    recommendation: "Validate Origin and Referrer headers server-side on all state-changing requests",
    issue: "No server-side origin policy or Referer verification validation was detected for state-changing endpoints."
  },
  "Token Randomness": {
    weight: 10,
    impact: "Weak or predictable anti-CSRF tokens can be guessed or brute-forced by attackers, bypassing token validation checks entirely.",
    recommendation: "Avoid cross-origin requests without proper validation; ensure CSRF tokens are cryptographically random",
    issue: "Anti-CSRF tokens do not meet the minimum entropy requirements for cryptographic randomness."
  }
};

const csrfPassImpact = {
  "Token Present": "The application is successfully protected against Cross-Site Request Forgery via anti-CSRF token verification.",
  "Cookie SameSite": "Session and authentication cookies enforce SameSite attributes, restricting cookie transmission during cross-site requests.",
  "Origin / Referrer Policy": "Server-side code validates Origin/Referer headers to prevent processing of state-changing requests from untrusted origins.",
  "Token Randomness": "Anti-CSRF tokens utilize strong, cryptographically secure random sources, preventing token predictability."
};

export const generateCsrfPDF = async (result = {}, setPdfProgress) => {
  if (!result) return;
  setPdfProgress?.("Initializing CSRF PDF Report...");

  const { employeeName, employeeMail } = getAuditorInfo();
  
  const now = new Date();
  const scanDate = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  const scanTime = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  try {
    const doc = new jsPDF("p", "mm", "a4");
    const domain = "Source Code Analysis";

    const checksList = [
      { name: "Token Present", ok: result.breakdown?.tokenPresentOK },
      { name: "Cookie SameSite", ok: result.breakdown?.cookieSameSiteOK },
      { name: "Origin / Referrer Policy", ok: result.breakdown?.originRefererOK },
      { name: "Token Randomness", ok: result.breakdown?.tokenRandomnessOK }
    ];

    const checksEvaluated = checksList.length;
    const checksPassed = checksList.filter(c => c.ok).length;
    const checksFailed = checksList.filter(c => !c.ok).length;

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 1 — COVER PAGE & ASSESSMENT INFORMATION
    // ══════════════════════════════════════════════════════════════════════
    
    // Top brand text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – CSRF Vulnerability Scanner", 14, 12);

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
    doc.text("CSRF VULNERABILITY SCANNER SECURITY ASSESSMENT REPORT", 105, 54, { align: "center" });

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
        ["Scanned URL",             "Source Code Repository"],
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
    // PAGE 2 — ASSESSMENT INFORMATION & SCAN SUMMARY
    // ══════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = drawSectionHeader(doc, "1. ASSESSMENT INFORMATION", 25);

    // Tool details
    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Tool Name",             "CSRF Vulnerability Scanner"],
        ["Tool Category",         "Web Application Security Testing / CSRF Detection"],
        ["Methodology Alignment", "OWASP WSTG – WSTG-SESS-05 (Cross-Site Request Forgery Testing)"],
        ["Compliance Alignment",  "ISO/IEC 27001 │ AICPA SOC Frameworks"],
        ["Scanned URL",           "Source Code Repository"],
        ["Assessment Mode",       "Non-Intrusive / Automated CSRF Detection Scan"]
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
    doc.setTextColor(...C.textMuted);
    const overviewText = "The CSRF Vulnerability Scanner tool analyses the target web application to detect the presence and effectiveness of Cross-Site Request Forgery (CSRF) protections. The tool evaluates the CSRF token presence in state-changing forms, Cookie SameSite attribute configuration, Origin and Referrer header policy enforcement, and token randomness. A composite security score is calculated, and a risk level is assigned based on the cumulative check results. Identified weaknesses and corresponding security recommendations are recorded to support remediation activities.";
    doc.text(overviewText, 14, y + 5, { maxWidth: 182, align: "left", lineHeightFactor: 1.45 });

    y += doc.getTextDimensions(overviewText, { maxWidth: 182 }).h + 12;

    y = drawSectionHeader(doc, "2. SCAN SUMMARY", y);

    renderTable(doc, {
      startY: y,
      head: [["Security Score", "Risk Level", "Checks Evaluated", "Checks Passed", "Checks Failed", "Assessment Result"]],
      body: [[
        `${result.score} / 100`,
        result.riskLevel,
        String(checksEvaluated),
        String(checksPassed),
        String(checksFailed),
        result.vulnerable ? "Vulnerable" : "Safe"
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
        0: { cellWidth: 25 },
        1: { cellWidth: 25, fontStyle: "bold" },
        2: { cellWidth: 32 },
        3: { cellWidth: 28 },
        4: { cellWidth: 28 },
        5: { cellWidth: 44, fontStyle: "bold", textColor: result.vulnerable ? C.red : [22, 163, 74] }
      }
    });

    y = doc.lastAutoTable.finalY + 10;

    y = drawSectionHeader(doc, "3. DETAILED FINDINGS", y);

    // Loop and render detailed findings for each check
    checksList.forEach((c) => {
      if (297 - y < 65) {
        doc.addPage();
        y = 25;
      }

      const staticMeta = csrfLookup[c.name];
      const severity = c.ok === "N/A" ? "N/A" : (c.ok ? "Safe" : (staticMeta.weight >= 30 ? "High" : "Medium"));
      const status = c.ok === "N/A" ? "N/A" : (c.ok ? "Passed" : "Failed");
      const scoreContribution = c.ok === "N/A" ? "N/A" : (c.ok ? `+${staticMeta.weight}` : "+0");
      const issueDetected = c.ok === "N/A" ? "N/A" : (c.ok ? "None" : staticMeta.issue);
      const impact = c.ok === "N/A" ? "Not Applicable" : (c.ok ? csrfPassImpact[c.name] : staticMeta.impact);
      const recommendation = c.ok === "N/A" ? "Not Applicable" : (c.ok ? "No remediation required. Maintain current configuration and policies." : staticMeta.recommendation);

      renderTable(doc, {
        startY: y,
        head: [],
        body: [
          ["Severity",           severity],
          ["Check",              c.name],
          ["Status",             status],
          ["Score Contribution", scoreContribution],
          ["Issue Detected",     issueDetected],
          ["Impact",             impact],
          ["Recommendation",     recommendation]
        ],
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
          1: { cellWidth: 127 }
        },
        didParseCell: (data) => {
          if (data.column.index === 1 && data.row.index === 0) {
            if (c.ok === "N/A") {
              data.cell.styles.textColor = C.textMuted;
            } else {
              data.cell.styles.textColor = c.ok ? [22, 163, 74] : (staticMeta.weight >= 30 ? C.red : C.amber);
            }
            data.cell.styles.fontStyle = "bold";
          }
        }
      });

      y = doc.lastAutoTable.finalY + 8;
    });

    // ══════════════════════════════════════════════════════════════════════
    // CONCLUSION & RECOMMENDATIONS & APPENDIX
    // ══════════════════════════════════════════════════════════════════════
    if (297 - y < 85) {
      doc.addPage();
      y = 25;
    }

    y = drawSectionHeader(doc, "4. CONCLUSION & RECOMMENDATIONS", y);

    const conclusionText = "The CSRF Vulnerability Scanner assessment evaluated the target URL against four CSRF protection checks: CSRF token presence, Cookie SameSite attribute configuration, Origin and Referrer policy enforcement, and token randomness. A composite security score and risk level were calculated based on the cumulative results of all checks performed.\n\nAll CSRF protection mechanisms identified as absent or misconfigured must be remediated as a priority. CSRF tokens must be implemented in all state-changing forms and validated server-side on every request. Session and authentication cookies must be configured with the SameSite=Strict attribute to prevent cross-site cookie transmission. Origin and Referrer headers must be validated server-side to reject requests that do not originate from the expected domain. CSRF tokens must be generated using a cryptographically secure random source and must not be predictable or reused across sessions.\n\nApplications should be retested following remediation to confirm all CSRF protections are functioning as intended.";
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(conclusionText, 14, y, { maxWidth: 182, align: "left", lineHeightFactor: 1.45 });

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
        ["Severity",                    "Risk level assigned to the finding: Critical / High / Medium / Low / Informational"],
        ["Check",                       "The specific CSRF protection mechanism evaluated during the scan"],
        ["Status",                      "Result of the individual check: Passed / Failed"],
        ["Score Contribution",          "The points awarded toward the composite security score if the check passes"],
        ["Issue Detected",              "The specific CSRF weakness or misconfiguration identified for the check"],
        ["Impact",                      "The potential security consequence of the identified CSRF protection weakness"],
        ["Recommendation",              "Specific, actionable remediation guidance for the identified CSRF protection issue"],
        ["Security Score",              "The composite score calculated by the tool reflecting the overall CSRF protection posture of the target"],
        ["Risk Level",                  "An overall risk classification assigned based on the composite security score: High / Medium / Low"],
        ["Security Recommendations",    "Consolidated set of actionable remediation steps produced by the tool for all failed checks"]
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

    const ackText = "The findings presented in this report are based on observations made during the assessment period and represent the CSRF protection status of the target application at the time of scanning. This report contains confidential and proprietary information intended solely for the authorised recipient. Unauthorised disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.";
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(ackText, 14, y + 5, { maxWidth: 182, align: "left", lineHeightFactor: 1.45 });

    // Apply header & footer decorator to all pages
    applyHeaderFooterDecorator(doc, "CSRF Vulnerability Scanner");

    setPdfProgress?.("Saving PDF...");
    doc.save(`CSRF-Security-Report-${Date.now()}.pdf`);
  } catch (err) {
    console.error("Failed to generate CSRF PDF report:", err);
  } finally {
    setPdfProgress?.(null);
  }
};
