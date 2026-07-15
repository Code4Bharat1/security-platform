import { jsPDF } from "jspdf";
import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../utils/pdfFramework";

const sessionFixationLookup = {
  "Session ID generation": {
    impact: "Reusing session identifiers across the login boundary allows attackers to inject or sniff pre-authentication session tokens and easily hijack the authenticated user session.",
    recommendation: "Ensure session regeneration APIs (like req.session.regenerate() or equivalent) are executed immediately post-authentication.",
    issue: "Session ID is not regenerated upon successful authentication."
  },
  "Secure Cookie Configuration": {
    impact: "Cookies missing HttpOnly, Secure, or SameSite=Strict/Lax attributes can be read via XSS, transmitted over unencrypted connections, or sent during cross-site requests.",
    recommendation: "Configure all session cookies with HttpOnly=true, Secure=true, and SameSite=Strict or Lax attributes.",
    issue: "Insecure session cookie attributes detected in cookie initialization."
  },
  "Session Identifier Exposure": {
    impact: "Exposing session identifiers in URL parameters, logs, or unencrypted headers allows attackers to easily capture session IDs from browser history, server logs, or network traffic.",
    recommendation: "Transmit session identifiers only within HTTP request headers or cookies; avoid URL query parameters.",
    issue: "Session identifier leaked or exposed via URL parameters or console logs."
  },
  "Weak Session Token Generation": {
    impact: "Weak or predictable session identifiers can be easily guessed or brute-forced by an attacker, allowing full session hijacking without knowing user credentials.",
    recommendation: "Use cryptographically secure pseudo-random number generators (CSPRNG) to generate high-entropy session IDs.",
    issue: "Session identifiers are generated using predictable or low-entropy functions."
  },
  "Secure Transport": {
    impact: "Transmitting session cookies or headers over unencrypted HTTP channels allows local or network attackers to capture credentials via passive sniffing.",
    recommendation: "Enforce HTTPS for all routes, enable HSTS (Strict-Transport-Security), and set the Secure flag on all session cookies.",
    issue: "Session transmission is allowed over unencrypted HTTP (Secure flag missing or HTTPS not enforced)."
  },
  "Session Invalidation": {
    impact: "Failing to properly invalidate sessions on the server side upon logout or timeout allows old session identifiers to remain active, keeping the session open to hijackers.",
    recommendation: "Explicity destroy the session on the server (e.g. req.session.destroy()) and clear the client cookie on logout.",
    issue: "Missing or incomplete session destruction handler on logout."
  }
};

const sessionPassImpact = {
  "Session ID generation": "The application successfully regenerates the session identifier post-login, neutralizing session fixation vectors.",
  "Secure Cookie Configuration": "Session cookies enforce HttpOnly, Secure, and SameSite attributes, protecting against theft and cross-site leaks.",
  "Session Identifier Exposure": "No session identifiers are exposed in URLs, console logs, or other insecure channels.",
  "Weak Session Token Generation": "Session tokens are generated using strong, cryptographically secure random sources.",
  "Secure Transport": "Sessions are restricted to secure transport channels (HTTPS) with proper transport configurations.",
  "Session Invalidation": "Sessions are properly destroyed on the server and cleared on the client upon user logout."
};

export const generateSessionFixationPDF = async (report = [], summary = {}, metrics = {}) => {
  const { employeeName, employeeMail } = getAuditorInfo();
  
  const now = new Date();
  const scanDate = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  const scanTime = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  try {
    const doc = new jsPDF("p", "mm", "a4");
    
    // We map backend metrics / findings count
    const filesAnalyzed = String(metrics?.filesScanned || 1);
    const checksList = [
      "Session ID generation",
      "Secure Cookie Configuration",
      "Session Identifier Exposure",
      "Weak Session Token Generation",
      "Secure Transport",
      "Session Invalidation"
    ];
    
    const checksEvaluated = String(checksList.length);
    const findingsCount = String(report.length);
    const riskLevel = summary?.overallRisk || "Low";
    const overallAssessment = report.some(f => ["critical", "high"].includes(f.severity?.toLowerCase())) ? "Vulnerable" : "Secure";

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 1 — COVER PAGE & ASSESSMENT INFORMATION
    // ══════════════════════════════════════════════════════════════════════
    
    // Top brand text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – Session Fixation Tester", 14, 12);

    // Company logo/header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(...C.bluePrimary);
    doc.text("NEXCORE ALLIANCE", 105, 30, { align: "center" });

    doc.setFont("helvetica", "oblique");
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
    doc.text("SESSION FIXATION TESTER SECURITY ASSESSMENT REPORT", 105, 54, { align: "center" });

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
        ["Tool Name",             "Session Fixation Tester"],
        ["Tool Category",         "Session Management Security / Authentication Testing"],
        ["Methodology Alignment", "OWASP WSTG – WSTG-SESS-03 / CWE-384 / OWASP Top 10 – A07"],
        ["Compliance Alignment",  "ISO/IEC 27001 | AICPA SOC Frameworks"],
        ["Scanned URL",           "Source Code Repository"],
        ["Assessment Mode",       "Non-Intrusive / Automated Session Analysis"]
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
    const overviewText = "The Session Fixation Tester evaluates the target web application for susceptibility to session fixation attacks. The tool examines whether the application issues a new session token upon successful authentication, thereby invalidating any pre-authentication session identifier. A vulnerable application that accepts or reuses a session token across the authentication boundary allows an attacker who has obtained or injected a known session identifier to hijack the authenticated session without requiring credential knowledge. Each tested endpoint is reported with its vulnerability status, the affected session token, evidence of the observed behaviour, severity rating, and specific remediation guidance.";
    doc.text(overviewText, 14, y + 5, { maxWidth: 182, align: "left", lineHeightFactor: 1.45 });

    doc.addPage();
    y = drawSectionHeader(doc, "2. SCAN SUMMARY", 25);

    renderTable(doc, {
      startY: y,
      head: [["Files Analyzed", "Session Checks Evaluated", "Findings Count", "Risk Level", "Overall Assessment"]],
      body: [[
        filesAnalyzed,
        checksEvaluated,
        findingsCount,
        riskLevel,
        overallAssessment
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
        1: { cellWidth: 38 },
        2: { cellWidth: 28 },
        3: { cellWidth: 40, fontStyle: "bold" },
        4: { cellWidth: 51, fontStyle: "bold", textColor: overallAssessment === "Vulnerable" ? C.red : [22, 163, 74] }
      }
    });

    y = doc.lastAutoTable.finalY + 10;

    y = drawSectionHeader(doc, "3. DETAILED FINDINGS", y);

    // Loop and render detailed findings for each check
    checksList.forEach((chkName) => {
      // Find matching findings for this check
      const finding = report.find(f => f.rule === chkName);
      
      const isPassed = !finding;
      const severity = isPassed ? "Safe" : (finding.severity || "Medium");
      const status = isPassed ? "Passed" : "Vulnerable";
      const sourceFile = isPassed ? "N/A" : (finding.locations?.[0]?.file || "Source Code");
      const lineNum = isPassed ? "N/A" : String((finding.locations || []).map(l => l.line).join(", "));
      const evidence = isPassed ? "N/A" : (finding.snippet || finding.message || "N/A");
      const issue = isPassed ? "None" : (finding.message || sessionFixationLookup[chkName].issue);

      const impact = isPassed ? sessionPassImpact[chkName] : sessionFixationLookup[chkName].impact;
      const recommendation = isPassed ? "No remediation required. Maintain current secure configuration." : sessionFixationLookup[chkName].recommendation;

      if (297 - y < 85) {
        doc.addPage();
        y = 25;
      }

      renderTable(doc, {
        startY: y,
        head: [],
        body: [
          ["Severity",       severity],
          ["Security Check", chkName],
          ["Status",         status],
          ["Source File",    sourceFile],
          ["Evidence",       evidence],
          ["Issue Detected", issue],
          ["Impact",         impact],
          ["Recommendation", recommendation]
        ],
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
          1: { cellWidth: 127 }
        },
        didParseCell: (data) => {
          if (data.column.index === 1 && data.row.index === 0) {
            data.cell.styles.textColor = isPassed ? [22, 163, 74] : C.red;
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

    const conclusionText = `The Session Fixation Tester assessment evaluated ${filesAnalyzed} endpoint(s) on the target application for session fixation vulnerability. The overall vulnerability status was determined to be ${overallAssessment}, with ${findingsCount} findings identified. Where the application was found to reuse or accept a pre-authentication session identifier post-login, the finding represents a confirmed session fixation vulnerability that must be remediated before production deployment.\n\nIt is recommended that the application be configured to generate and issue a new, cryptographically random session token immediately upon successful authentication, invalidating any pre-existing session identifier. Session tokens must not be accepted from URL parameters or untrusted sources. Secure cookie attributes — including HttpOnly, Secure, and SameSite=Strict — should be enforced on all session tokens. Session management implementation should be reviewed against OWASP WSTG-SESS-03 guidelines to ensure full compliance with secure session lifecycle controls.`;
    
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
        ["Severity",       "Risk level assigned to the finding: Critical | High | Medium | Low | Informational."],
        ["Security Check", "The session management control evaluated."],
        ["Status",         "Result of the security assessment (Secure, Vulnerable, Missing, Insecure)."],
        ["Source File",    "File containing the identified issue."],
        ["Line Number",    "Source code line(s) where the issue was detected."],
        ["Evidence",       "Code snippet or observation supporting the finding."],
        ["Issue Detected", "Description of the identified session management weakness."],
        ["Impact",         "Potential security consequences of the identified issue."],
        ["Recommendation", "Suggested remediation aligned with OWASP Session Management guidelines."]
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

    const ackText = "The findings presented in this report are based on observations made during the assessment period and represent the session management security posture of the target application at the time of testing. This report contains confidential and proprietary information intended solely for the authorised recipient. Unauthorised disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.";
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(ackText, 14, y + 5, { maxWidth: 182, align: "left", lineHeightFactor: 1.45 });

    // Apply header & footer decorator to all pages
    applyHeaderFooterDecorator(doc, "Session Fixation Tester");

    doc.save(`Session-Fixation-Report-${Date.now()}.pdf`);
  } catch (err) {
    console.error("Failed to generate Session Fixation PDF report:", err);
  }
};
