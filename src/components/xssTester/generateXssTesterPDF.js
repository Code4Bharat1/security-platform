import { jsPDF } from "jspdf";
import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../utils/pdfFramework";

// Static lookup map for Security Impact & Remediation Guidance
const XSS_GUIDANCE_MAP = {
  "HTML Body": {
    category: "Script Injection",
    impact: "Execution of malicious scripts in the victim's browser, leading to session hijacking, credential harvesting, or application defacement.",
    remediation: "Apply context-aware HTML entity encoding to all user inputs before rendering them in the HTML body context."
  },
  "HTML Attribute": {
    category: "Attribute Breakout",
    impact: "Breakout from attribute delimiters allowing execution of arbitrary event handlers (e.g. onload, onerror, onclick) under victim sessions.",
    remediation: "Enforce strict attribute encoding using HTML attribute character escapes and restrict characters like quotes and brackets."
  },
  "JavaScript": {
    category: "Script Context Injection",
    impact: "Execution of arbitrary JavaScript commands directly within inline script blocks, bypassing simple HTML tag filtering.",
    remediation: "Avoid dynamic inline JavaScript generation from user input. Use secure JSON serialization and escape all quote characters."
  },
  "URL": {
    category: "javascript: Schema Execution",
    impact: "Execution of arbitrary javascript: scheme URLs when clicked, or unauthorized redirection of users to phishing sites.",
    remediation: "Validate and restrict link protocols to http/https only, and escape URL structures before outputting them to href attributes."
  }
};

const getGuidance = (context, risk) => {
  const ctxLower = (context || "").toLowerCase();
  for (const [key, val] of Object.entries(XSS_GUIDANCE_MAP)) {
    if (ctxLower.includes(key.toLowerCase())) {
      return val;
    }
  }

  // Fallbacks based on risk
  if (risk === "Critical" || risk === "High") {
    return {
      category: "Reflected Script Injection",
      impact: "Immediate threat of session hijacking, administrative account takeover, cookie theft, and client-side application compromise.",
      remediation: "Implement strict server-side input validation, enforce a robust Content Security Policy (CSP), and mark session cookies as HttpOnly."
    };
  } else {
    return {
      category: "HTML Tag Injection",
      impact: "Enables minor layout defacement, phishing alert prompts, or redirecting of users to external malicious web domains.",
      remediation: "Sanitize user inputs against HTML syntax tokens, use library sanitizers (e.g. DOMPurify), and escape output tags."
    };
  }
};

export const generateXssTesterPDF = async (result = {}, hostUrl = "") => {
  const { employeeName, employeeMail } = getAuditorInfo();
  
  const targetUrl = result.url || hostUrl || "Target URL";
  const runs = result.runs || [];
  
  // Mathematically consistent calculation
  const totalParametersTested = result.summary?.totalTested || 16; // Scope parameters
  const totalPayloadsInjected = result.summary?.total || runs.length || 0;
  const vulnerabilitiesDetected = runs.filter(r => r.reflected || r.domExecuted).length;
  
  const overallRisk = vulnerabilitiesDetected > 0 
    ? (runs.some(r => (r.reflected || r.domExecuted) && r.risk === "High") ? "High" : "Medium")
    : "Low";

  const vulnerableParams = Array.from(new Set(runs.filter(r => r.reflected || r.domExecuted).map(r => r.param).filter(Boolean)));
  const vulnerabilityStatus = vulnerabilitiesDetected > 0 ? "Detected" : "Not Detected";
  const confirmedVulnerableParamsText = vulnerableParams.length > 0 ? vulnerableParams.join(", ") : "None";

  try {
    const doc = new jsPDF("p", "mm", "a4");
    const now = new Date();
    
    const scanDate = now.toLocaleDateString("en-GB", { 
      day: "2-digit", 
      month: "short", 
      year: "numeric" 
    }).toUpperCase();
    
    const scanTime = now.toLocaleTimeString("en-GB", { 
      hour: "2-digit", 
      minute: "2-digit", 
      second: "2-digit" 
    });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 1 — COVER PAGE
    // ════════════════════════════════════════════════════════════════════════
    // Top blue banner stripe
    doc.setFillColor(...C.bluePrimary);
    doc.rect(0, 0, 210, 3.5, "F");

    // Brand header
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – XSS Tester", 14, 12);

    // Company Logo / Title
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

    // Document Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...C.bluePrimary);
    doc.text("XSS TESTER", 105, 54, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("SECURITY ASSESSMENT REPORT", 105, 60, { align: "center" });

    // Divider below title
    doc.line(14, 65, 196, 65);

    // Cover page info table
    renderTable(doc, {
      startY: 72,
      head: [],
      body: [
        ["Assessment Performed by", employeeMail],
        ["Employee Name",           employeeName],
        ["Employee Mail ID",        employeeMail],
        ["Scanned URL",             targetUrl],
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

    // Cover page footer banner
    doc.line(14, 260, 196, 260);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("www.nexcorealliance.com | ISO/IEC 27001 Certified | AICPA SOC Compliant", 105, 267, { align: "center" });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 2 — 1. ASSESSMENT INFORMATION
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    let y = 25;

    y = drawSectionHeader(doc, "1. ASSESSMENT INFORMATION", y);

    // Tool Details Table
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Tool Details", 14, y);
    y += 5;

    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Tool Name",             "XSS Tester"],
        ["Tool Category",          "Web Application Security / Injection Testing"],
        ["Methodology Alignment", "OWASP WSTG – OTG-INPVAL-001 / OTG-INPVAL-002 (Reflected & Stored XSS Testing)"],
        ["Compliance Alignment",  "ISO/IEC 27001 │ AICPA SOC Frameworks"],
        ["Scanned URL",            targetUrl],
        ["Assessment Mode",        "Non-Intrusive / Automated Payload Injection"],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 45, fillColor: [245, 245, 245] },
        1: { cellWidth: 137 },
      },
    });
    y = doc.lastAutoTable.finalY + 10;

    // Tool Overview Description
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Tool Overview", 14, y);
    y += 5;

    const overviewText = "The XSS Tester tool performs automated Cross-Site Scripting (XSS) assessments against target web application parameters by injecting a defined set of payloads into user-controllable input fields. The tool targets commonly vulnerable parameters including q, search, query, id, name, username, email, message, comment, redirect, url, callback, return, page, category, and post. Each injected payload is evaluated for reflection in the HTTP response, and the reflection context (HTML body, attribute, JavaScript, or URL) is recorded to determine exploitability. Severity is calculated based on reflection outcome and context, producing an actionable finding set that distinguishes confirmed vulnerabilities from non-reflective parameter responses.";
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(overviewText, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 3 — 2. SCAN SUMMARY, 3. DETAILED FINDINGS & 4. CONCLUSION
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    // 2. Scan Summary
    y = drawSectionHeader(doc, "2. SCAN SUMMARY", y);

    renderTable(doc, {
      startY: y,
      head: [["Total Parameters Tested", "Total Payloads Injected", "Vulnerabilities Detected", "Overall Risk Rating"]],
      body: [[
        String(totalParametersTested),
        String(totalPayloadsInjected),
        String(vulnerabilitiesDetected),
        overallRisk.toUpperCase()
      ]],
      headStyles: { fillColor: C.bgHeader, textColor: C.white, halign: "center" },
      bodyStyles: { halign: "center", fontStyle: "bold" },
      columnStyles: {
        3: { textColor: overallRisk === "High" ? C.red : overallRisk === "Medium" ? C.amber : C.blue }
      }
    });
    y = doc.lastAutoTable.finalY + 6;

    // Assessment Result Details
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Assessment Result", 14, y);
    y += 4;

    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Parameters in Scope", "q, search, query, id, name, username, email, message, comment, redirect, url, callback, return, page, category, post"],
        ["XSS Vulnerability Status", vulnerabilityStatus],
        ["Confirmed Vulnerable Parameters", confirmedVulnerableParamsText],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 },
      },
    });
    y = doc.lastAutoTable.finalY + 10;

    // 3. Detailed Findings
    y = drawSectionHeader(doc, "3. DETAILED FINDINGS", y);

    const vulnerableRuns = runs.filter(r => r.reflected || r.domExecuted);
    if (vulnerableRuns.length > 0) {
      for (const vr of vulnerableRuns) {
        if (y > 220) {
          doc.addPage();
          y = 25;
        }

        const guidance = getGuidance(vr.context, vr.risk);

        renderTable(doc, {
          startY: y,
          head: [],
          body: [
            ["Severity",          safe(vr.risk, "Low")],
            ["Parameter Tested",  safe(vr.param)],
            ["Payload Category",  guidance.category],
            ["Injected Payload",  safe(vr.payload)],
            ["Reflected Execution", vr.reflected ? "Yes" : "No"],
            ["DOM Execution",      vr.domExecuted ? "Yes" : "No"],
            ["Issue Detected",    vr.reflected ? "Reflected payload found in HTTP response." : "Payload execution found in DOM context."],
            ["Impact",            guidance.impact],
            ["Recommendation",    guidance.remediation],
          ],
          columnStyles: {
            0: { fontStyle: "bold", cellWidth: 35, fillColor: [240, 240, 245] },
            1: { cellWidth: 147 },
          },
          margin: { left: 14, right: 14 }
        });
        
        y = doc.lastAutoTable.finalY + 8;
      }
    } else {
      renderTable(doc, {
        startY: y,
        head: [],
        body: [
          ["Severity",          "None"],
          ["Parameter Tested",  "Not Detected"],
          ["Payload Category",  "No Evidence Found"],
          ["Injected Payload",  "None"],
          ["Reflected Execution", "No Unsafe Reflection Observed"],
          ["DOM Execution",      "No Evidence Found"],
          ["Issue Detected",    "No Unsafe Reflection Observed"],
          ["Impact",            "None"],
          ["Recommendation",    "None"],
        ],
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 35, fillColor: [240, 240, 245] },
          1: { cellWidth: 147 },
        },
        margin: { left: 14, right: 14 }
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    // 4. Conclusion & Recommendations
    if (y > 210) {
      doc.addPage();
      y = 25;
    }
    
    y = drawSectionHeader(doc, "4. CONCLUSION & RECOMMENDATIONS", y);

    const conclusionText = `The XSS Tester assessment injected a structured payload set across commonly vulnerable input parameters of the target web application. Each parameter was evaluated for payload reflection, and the reflection context was analysed to determine exploitability and assign a severity rating. Parameters that returned injected payloads unmodified within HTML body, attribute, or JavaScript contexts were classified as confirmed XSS vulnerabilities.\n\nReflected XSS vulnerabilities allow adversaries to craft malicious URLs that, when visited by an authenticated user, execute attacker-controlled scripts within the victim’s browser session. This can result in session token theft, credential harvesting, defacement, and redirection to malicious resources. High and Critical severity findings should be prioritised for immediate remediation.\n\nIt is recommended to implement strict output encoding for all user-supplied input rendered in HTML, JavaScript, and URL contexts using context-aware encoding libraries. A Content-Security-Policy (CSP) header should be enforced to restrict script execution to trusted sources. Input validation should be applied at the server side to reject or sanitise payloads containing script injection characters. The HttpOnly and Secure flags must be set on all session cookies to limit the impact of any successful XSS exploitation. All parameters identified as vulnerable in Section 3 should be remediated and re-tested prior to next release.`;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(conclusionText, 14, y, { maxWidth: 182, lineHeightFactor: 1.4 });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 4 — 5. APPENDIX
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    y = drawSectionHeader(doc, "5. APPENDIX", y);

    // Appendix table Column Reference Guide
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Column Reference Guide", 14, y);
    y += 5;

    renderTable(doc, {
      startY: y,
      head: [["Column", "Description"]],
      body: [
        ["Total Parameters Tested", "Total number of input parameters evaluated for potential Cross-Site Scripting (XSS) vulnerabilities during the assessment."],
        ["Total Payloads Injected", "Total number of XSS test payloads injected across all parameters during the security assessment."],
        ["Vulnerabilities Detected","Total number of confirmed XSS vulnerabilities identified based on successful payload execution."],
        ["Overall Risk Rating",    "Overall security assessment of the target application based on the scan results (Critical, High, Medium, Low, or None)."],
        ["Assessment Result",      "Overall outcome of the XSS assessment indicating whether the application is Vulnerable, Partially Vulnerable, or Not Vulnerable to Cross-Site Scripting attacks."],
        ["Parameters in Scope",    "List of HTTP request parameters included in the XSS assessment."],
        ["XSS Vulnerability Status","Indicates whether Cross-Site Scripting vulnerabilities were identified during the assessment (Detected / Not Detected)."],
        ["Confirmed Vulnerable Parameters", "Lists the parameters confirmed to be vulnerable to XSS through successful payload reflection or execution. Displays None if no vulnerabilities are identified."],
        ["Severity",               "Risk level assigned to the identified XSS finding (Critical, High, Medium, Low, or Informational)."],
        ["Parameter Tested",       "Name of the HTTP request parameter tested for XSS vulnerabilities (e.g., q, search, id)."],
        ["Payload Category",       "Classification of the injected payload based on its attack technique, such as Script Injection, HTML Injection, SVG Event, Image Event Handler, JavaScript URI, or DOM-based payload."],
        ["Injected Payload",       "The specific XSS payload used to evaluate whether the application improperly processes untrusted input."],
        ["Reflected Execution",    "Indicates whether the injected payload was reflected in the server's HTTP response (Yes / No)."],
        ["DOM Execution",          "Indicates whether the payload executed through client-side DOM manipulation (Yes / No)."],
        ["Issue Detected",         "Description of the identified XSS vulnerability or confirmation that no executable payload was observed during testing."],
        ["Impact",                 "Describes the potential security consequences of a successful XSS attack, including session hijacking, cookie theft, credential harvesting, phishing, website defacement, or arbitrary JavaScript execution in a user's browser."],
        ["Recommendation",         "Recommended remediation measures, such as implementing contextual output encoding, strict input validation, Content Security Policy (CSP), secure handling of user input, and avoiding unsafe JavaScript functions."],
      ],
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 45 },
        1: { cellWidth: 137 },
      }
    });
    y = doc.lastAutoTable.finalY + 10;

    // Acknowledgements
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Acknowledgement", 14, y);
    y += 5;

    const ackText = "The findings presented in this report are based on observations made during the assessment period and represent the XSS vulnerability posture of the environment at the time of scanning. This report contains confidential and proprietary information intended solely for the authorised recipient. Unauthorised disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...C.textMain);
    doc.text(ackText, 14, y, { maxWidth: 182, lineHeightFactor: 1.35 });

    // Apply header & footer decorator
    applyHeaderFooterDecorator(doc, "XSS Tester");

    const pad = (n) => String(n).padStart(2, "0");
    const dStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    
    doc.save(`XSS_Tester_Report_${dStr}.pdf`);

  } catch (err) {
    console.error("Failed to generate XSS Tester PDF:", err);
  }
};
