import { jsPDF } from "jspdf";
import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../utils/pdfFramework";

// Static lookup map for Security Impact and Remediation Recommendations
const staticHeadersMap = {
  "Strict-Transport-Security": {
    severity: "Medium",
    impact: "Without HSTS, the browser may establish insecure HTTP connections, allowing Man-in-the-Middle (MitM) attackers to intercept or modify traffic.",
    recommendation: "Configure the 'Strict-Transport-Security' header with a max-age of at least 6 months (15,768,000 seconds) and include the 'includeSubDomains' and 'preload' directives."
  },
  "Content-Security-Policy": {
    severity: "High",
    impact: "Absence of a Content Security Policy (CSP) increases vulnerability to Cross-Site Scripting (XSS), clickjacking, and data injection attacks.",
    recommendation: "Implement a robust Content-Security-Policy response header restricting script, style, and object sources to trusted domains."
  },
  "X-Frame-Options": {
    severity: "Medium",
    impact: "Missing X-Frame-Options exposes the site to clickjacking attacks, where malicious sites can embed it inside an iframe and hijack user interactions.",
    recommendation: "Configure 'X-Frame-Options' to 'DENY' or 'SAMEORIGIN' to control frame embedding behavior."
  },
  "X-Content-Type-Options": {
    severity: "Low",
    impact: "Without this header, older browsers might sniff MIME types, leading to execution of non-executable files as scripts (e.g., CSS as Javascript).",
    recommendation: "Set the 'X-Content-Type-Options' header to 'nosniff'."
  },
  "Referrer-Policy": {
    severity: "Low",
    impact: "Absence of Referrer-Policy might cause the web browser to leak sensitive session tokens or user parameters in referrer headers to external sites.",
    recommendation: "Implement 'Referrer-Policy' set to 'no-referrer-when-downgrade' or 'strict-origin-when-cross-origin'."
  },
  "Permissions-Policy": {
    severity: "Low",
    impact: "Without Permissions-Policy, the browser permits access to powerful device features (camera, microphone, geolocation) by default.",
    recommendation: "Implement 'Permissions-Policy' to restrict access to browser features and APIs."
  },
  "X-XSS-Protection": {
    severity: "Low",
    impact: "Legacy Cross-Site Scripting protection is disabled or missing, leaving older browsers unprotected against reflected XSS.",
    recommendation: "Implement 'X-XSS-Protection' set to '1; mode=block' (or secure the site via a robust CSP)."
  },
  "Cross-Origin-Opener-Policy": {
    severity: "Low",
    impact: "Without COOP, cross-origin documents can retain a reference to the window object, exposing it to potential cross-window tracking or attacks.",
    recommendation: "Set 'Cross-Origin-Opener-Policy' to 'same-origin'."
  },
  "Cross-Origin-Embedder-Policy": {
    severity: "Low",
    impact: "Without COEP, resources that do not explicitly opt-in can be loaded, risking cross-origin read leaks.",
    recommendation: "Set 'Cross-Origin-Embedder-Policy' to 'require-corp' or 'credentialless'."
  },
  "Cross-Origin-Resource-Policy": {
    severity: "Low",
    impact: "Without CORP, other origins can embed the resource, bypassing standard cross-origin read protections.",
    recommendation: "Set 'Cross-Origin-Resource-Policy' to 'same-origin' or 'same-site'."
  }
};

export const generateHttpsPDF = async (result, setPdfProgress) => {
  if (!result) return;
  if (setPdfProgress) setPdfProgress("Initializing PDF document...");

  const { employeeName, employeeMail } = getAuditorInfo();

  try {
    const doc = new jsPDF("p", "mm", "a4");
    
    // Dates
    const scanDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
    const scanTime = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    let y = 0;
    const target = result.target || "Unknown Host";
    const ai = result.additionalInfo || {};
    const raw = result.rawHeaders || {};

    const missingHeadersList = result.missingHeaders || [];
    const hardeningHeadersList = result.upcomingHeaders || [];
    
    const hstsStatus = result.hstsEnabled ? "Enabled" : "Disabled";
    const redirectStatus = result.httpRedirectsToHttps ? "Enabled" : "Disabled";
    
    // Calculate overall status
    const numMissing = missingHeadersList.length;
    const numHardeningMissing = hardeningHeadersList.length;
    const overallStatus = (numMissing > 3 || !result.httpRedirectsToHttps) ? "High Risk" : numMissing > 0 ? "Medium Risk" : "Clean";

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 1 — COVER PAGE
    // ══════════════════════════════════════════════════════════════════════
    if (setPdfProgress) setPdfProgress("Building cover page...");

    // Top blue banner stripe
    doc.setFillColor(...C.bluePrimary);
    doc.rect(0, 0, 210, 3.5, "F");

    // Brand line
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – HTTPS Security Checker", 105, 12, { align: "center" });

    // Company header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(...C.bluePrimary);
    doc.text("NEXCORE ALLIANCE", 105, 30, { align: "center" });

    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.text("AI-Powered Cybersecurity & Information Security Solutions", 105, 36, { align: "center" });

    // Divider line
    doc.setDrawColor(...C.bluePrimary);
    doc.setLineWidth(0.4);
    doc.line(14, 40, 196, 40);

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...C.bluePrimary);
    doc.text("HTTPS SECURITY CHECKER SECURITY ASSESSMENT REPORT", 105, 58, { align: "center" });

    // Double divider under title
    doc.setDrawColor(...C.bluePrimary);
    doc.setLineWidth(0.25);
    doc.line(14, 70, 196, 70);
    doc.line(14, 71, 196, 71);

    // Assessment Info Table
    renderTable(doc, {
      startY: 78,
      head: [],
      body: [
        ["Assessment Performed by", employeeMail],
        ["Employee Name",           employeeName],
        ["Employee Mail ID",        employeeMail],
        ["Target",                 target],
        ["Assessment Date",        scanDate],
        ["Assessment Time",        scanTime],
        ["Classification",         "Confidential"],
        ["Assessment Status",       "Completed"]
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 }
      },
    });

    // Cover Page Footer info
    doc.setDrawColor(...C.lineColor);
    doc.setLineWidth(0.25);
    doc.line(14, 260, 196, 260);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("www.nexcorealliance.com | ISO/IEC 27001 Certified | AICPA SOC Compliant", 105, 267, { align: "center" });

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 2 — ASSESSMENT INFORMATION & SCAN SUMMARY
    // ══════════════════════════════════════════════════════════════════════
    if (setPdfProgress) setPdfProgress("Building scan summaries...");
    doc.addPage();
    y = 25;

    y = drawSectionHeader(doc, "1. ASSESSMENT INFORMATION", y);

    // Tool Details Grid
    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Tool Name",             "HTTPS Security Checker"],
        ["Tool Category",         "Transport Layer Security / HTTP Security Header Review"],
        ["Methodology Alignment", "OWASP WSTG – OTG-CONFIG / OWASP Secure Headers Project / CWE-319 / CWE-693"],
        ["Compliance Alignment",  "ISO/IEC 27001 | AICPA SOC Frameworks"],
        ["Target",                target],
        ["Assessment Mode",       "Non-Intrusive / Automated TLS & Header Analysis"]
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 }
      }
    });

    y = doc.lastAutoTable.finalY + 10;

    // Tool Overview
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Tool Overview", 14, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMain);
    const overviewText = "The HTTPS Security Checker evaluates the transport-layer security configuration and HTTP security header posture of a target domain. The tool verifies whether HTTP-to-HTTPS redirection is enforced, assesses HTTP Strict Transport Security (HSTS) configuration, and identifies missing security-relevant response headers including Strict-Transport-Security, Content-Security-Policy, and Permissions-Policy. The tool further reports the presence of modern hardening headers such as Cross-Origin-Opener-Policy, Cross-Origin-Embedder-Policy, and Cross-Origin-Resource-Policy, and captures additional connection information including HTTP version, TLS protocol and cipher, server banner, and caching configuration. Results support identification of weak transport security configurations and missing defence-in-depth header controls.";

    doc.text(overviewText, 14, y + 6, { maxWidth: 182, align: "justify", lineHeightFactor: 1.45 });
    y += doc.splitTextToSize(overviewText, 182).length * 4.5 + 12;

    y = drawSectionHeader(doc, "2. SCAN SUMMARY", y);

    // Scan Summary Table
    renderTable(doc, {
      startY: y,
      head: [["HTTPS Redirect", "HSTS Configuration", "Missing Security Headers", "TLS Configuration", "Overall Security Status"]],
      body: [[
        redirectStatus,
        hstsStatus,
        `${numMissing} missing`,
        ai.tlsProtocol || "Unknown TLS",
        overallStatus
      ]],
      headStyles: {
        fillColor: C.bgHeader,
        textColor: C.white,
        halign: "center",
      },
      bodyStyles: {
        halign: "center",
        fontStyle: "bold",
        fontSize: 9,
      },
      columnStyles: {
        0: { textColor: result.httpRedirectsToHttps ? [16, 185, 129] : C.red },
        1: { textColor: result.hstsEnabled ? [16, 185, 129] : C.amber },
        2: { textColor: numMissing > 0 ? C.amber : [16, 185, 129] },
        3: { textColor: C.textMain },
        4: { textColor: overallStatus === "Clean" ? [16, 185, 129] : overallStatus === "Medium Risk" ? C.amber : C.red }
      }
    });

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 3 — DETAILED FINDINGS
    // ══════════════════════════════════════════════════════════════════════
    if (setPdfProgress) setPdfProgress("Building detailed findings...");
    doc.addPage();
    y = 25;

    y = drawSectionHeader(doc, "3. DETAILED FINDINGS", y);

    // Section header label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Missing Security Headers", 14, y);
    y += 5;

    // Build missing headers list or default
    const missingRows = [];
    if (missingHeadersList.length > 0) {
      missingHeadersList.forEach((headerName) => {
        const hInfo = staticHeadersMap[headerName] || { severity: "Low", impact: "No specific impact mapped.", recommendation: "Implement the security header." };
        missingRows.push([
          `Severity: ${hInfo.severity}\nMissing Header: ${headerName}\nStatus: Missing\nImpact: ${hInfo.impact}\nRecommendation: ${hInfo.recommendation}`
        ]);
      });
    } else {
      missingRows.push(["None - All recommended security headers are configured!"]);
    }

    renderTable(doc, {
      startY: y,
      head: [],
      body: missingRows,
      bodyStyles: {
        fontSize: 8.5,
        lineHeightFactor: 1.3
      }
    });

    y = doc.lastAutoTable.finalY + 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Modern Hardening Headers", 14, y);
    y += 5;

    // Hardening Headers Table
    const hardeningRows = [];
    if (hardeningHeadersList.length > 0) {
      hardeningHeadersList.forEach((headerName) => {
        const hInfo = staticHeadersMap[headerName] || { severity: "Low", impact: "No specific hardening impact mapped.", recommendation: "Implement browser hardening header." };
        hardeningRows.push([
          `Severity: ${hInfo.severity}\nHeader: ${headerName}\nStatus: Missing\nImpact: ${hInfo.impact}\nRecommendation: ${hInfo.recommendation}`
        ]);
      });
    } else {
      hardeningRows.push(["None - Modern browser hardening headers are fully configured."]);
    }

    renderTable(doc, {
      startY: y,
      head: [],
      body: hardeningRows,
      bodyStyles: {
        fontSize: 8.5,
        lineHeightFactor: 1.3
      }
    });

    y = doc.lastAutoTable.finalY + 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("TLS & Connection Information", 14, y);
    y += 5;

    // TLS & Connection Info Table
    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["HTTP Version",           safe(ai.httpVersion)],
        ["TLS Protocol",           safe(ai.tlsProtocol)],
        ["TLS Cipher",             safe(ai.tlsCipher)],
        ["Redirect Status",        safe(ai.redirect?.fromHttpStatus)],
        ["Redirect Location",      safe(ai.redirect?.location)],
        ["Web Server",             safe(ai.server)],
        ["X-Powered-By",           safe(ai.xPoweredBy)],
        ["CDN Provider",           safe(ai.cdnProvider)],
        ["Cache-Control",          safe(ai.cacheControl)],
        ["CSP",                    ai.csp?.enabled ? (ai.csp.reportOnly ? "Report-Only" : "Enabled") : "Not set"],
        ["HSTS includeSubDomains", String(ai.hsts?.includeSubDomains ?? false)],
        ["HSTS preload",           String(ai.hsts?.preload ?? false)]
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 }
      }
    });

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 4 — RAW HEADERS & CONCLUSION
    // ══════════════════════════════════════════════════════════════════════
    if (setPdfProgress) setPdfProgress("Building headers and conclusion...");
    doc.addPage();
    y = 25;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Raw Headers", 14, y);
    y += 5;

    const rawEntries = Object.entries(raw).slice(0, 15); // limit entries to fit cleanly
    const rawRows = rawEntries.map(([k, v]) => [k, String(v)]);
    if (rawRows.length === 0) rawRows.push(["—", "—"]);

    renderTable(doc, {
      startY: y,
      head: [["Header", "Value"]],
      body: rawRows,
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55 },
        1: { cellWidth: 127 }
      }
    });

    y = doc.lastAutoTable.finalY + 10;

    y = drawSectionHeader(doc, "4. CONCLUSION & RECOMMENDATIONS", y);

    const hstsMaxAgeVal = result.hstsMaxAge != null ? `${result.hstsMaxAge} seconds` : "Not Set";
    const conclusionText = `The HTTPS Security Checker assessment evaluated the transport-layer security configuration of ${target}. ` +
      `HTTP-to-HTTPS redirection was found to be ${redirectStatus}, and HSTS was reported as ${hstsStatus} with a max-age value of ${hstsMaxAgeVal}. ` +
      `A total of ${numMissing} security-relevant headers were identified as missing, and ${numHardeningMissing} modern hardening headers were not configured. ` +
      `TLS configuration was identified as ${safe(ai.tlsProtocol)} using the ${safe(ai.tlsCipher)} cipher suite.`;

    const recommendationText = "It is recommended that all missing security-relevant headers — including Strict-Transport-Security, Content-Security-Policy, and Permissions-Policy — be implemented in accordance with OWASP secure header guidelines. HSTS must be enabled with an appropriate max-age value and preload directive to enforce HTTPS-only communication. Modern hardening headers such as Cross-Origin-Opener-Policy, Cross-Origin-Embedder-Policy, and Cross-Origin-Resource-Policy should be implemented to provide defence-in-depth against cross-origin attacks. Server banners and version information should be suppressed where possible to reduce fingerprinting risk.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMain);
    doc.text(conclusionText, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.45 });
    y += doc.splitTextToSize(conclusionText, 182).length * 4.5 + 8;

    doc.text(recommendationText, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.45 });

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 5 — APPENDIX
    // ══════════════════════════════════════════════════════════════════════
    if (setPdfProgress) setPdfProgress("Building appendix...");
    doc.addPage();
    y = 25;

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
        ["HTTPS Redirect", "Indicates whether HTTP requests are automatically redirected to HTTPS, ensuring encrypted communication."],
        ["HSTS Configuration", "Specifies whether the Strict-Transport-Security (HSTS) header is configured to enforce secure HTTPS connections."],
        ["Missing Security Headers", "Total number of recommended HTTP security headers that are not configured on the target web server."],
        ["TLS Configuration", "Summarizes the security of the Transport Layer Security (TLS) configuration, including supported protocol versions and cipher suites."],
        ["Overall Security Status", "Overall assessment of the target's HTTPS security posture based on the performed checks."],
        ["Severity", "Risk level assigned to the identified issue (Critical, High, Medium, Low, or Informational)."],
        ["Missing Header", "Name of the recommended HTTP security header that was not detected during the assessment."],
        ["Status", "Indicates whether the evaluated security control is Present, Missing, Enabled, Disabled, Pass, or Warning."],
        ["Impact", "Describes the potential security risks associated with the identified issue or missing security configuration."],
        ["Recommendation", "Provides remediation guidance and security best practices to address the identified issue."],
        ["Header", "Name of the evaluated modern browser hardening header (e.g., Cross-Origin-Opener-Policy, Cross-Origin-Resource-Policy)."],
        ["HTTP Version", "HTTP protocol version supported by the web server (e.g., HTTP/1.1, HTTP/2)."],
        ["TLS Protocol", "Protocol version used to establish the encrypted TLS session (e.g., TLSv1.3)."],
        ["TLS Cipher", "Cipher suite used to encrypt connection traffic."],
        ["Redirect Status", "HTTP status code returned during the HTTP-to-HTTPS redirection process (e.g., 301 or 302)."],
        ["Redirect Location", "Destination HTTPS URL specified by the server during redirection."],
        ["Web Server", "Web server software identified during the assessment (e.g., Nginx, Apache, IIS)."],
        ["X-Powered-By", "Technology or application framework disclosed by the server through the X-Powered-By response header."],
        ["CDN Provider", "Content Delivery Network (CDN) service identified for the target website, if applicable."],
        ["Cache-Control", "HTTP response header that defines browser and intermediary caching behavior."],
        ["CSP", "Indicates whether a Content Security Policy (CSP) is configured to restrict resource loading."],
        ["HSTS includeSubDomains", "Indicates whether the HSTS policy applies to all subdomains of the target domain."],
        ["HSTS preload", "Indicates whether the domain is configured to be eligible for inclusion in browser HSTS preload lists."],
        ["Server", "Value of the HTTP Server response header identifying the web server software."],
        ["Content-Type", "MIME type of the response (e.g., text/html, application/json)."],
        ["Content-Length", "Size of the response body in bytes."],
        ["Connection", "Whether connection stays open or closes after response (keep-alive vs. close)."],
        ["Vary", "Tells caches which request headers affect the response (e.g. Accept-Encoding)."],
        ["X-NextJS-Cache", "Indicates caching status for applications built using the Next.js framework."],
        ["X-NextJS-Prerender", "Indicates whether the page was generated using Next.js pre-rendering."],
        ["X-NextJS-Stale-Time", "Duration for which cached Next.js content remains valid before revalidation."],
        ["ETag", "Entity tag used for cache validation and conditional HTTP requests."],
        ["X-Frame-Options", "Indicates whether the website is protected against clickjacking attacks by restricting iframe embedding."],
        ["X-Content-Type-Options", "Prevents browsers from MIME-type sniffing by enforcing the declared content type."],
        ["X-XSS-Protection", "Indicates the browser's legacy Cross-Site Scripting (XSS) protection setting."],
        ["Referrer-Policy", "Defines how much referrer information is included when users navigate away."]
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 45, fillColor: [245, 245, 245] },
        1: { cellWidth: 137 }
      }
    });

    y = doc.lastAutoTable.finalY + 10;

    // Acknowledgement
    if (y + 40 > doc.internal.pageSize.getHeight()) {
      doc.addPage();
      y = 25;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Acknowledgement", 14, y);

    const ackText = "The findings presented in this report are based on observations made during the assessment period and represent the HTTPS configuration and security header posture of the target at the time of scanning. This report contains confidential and proprietary information intended solely for the authorized recipient. Unauthorized disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMain);
    doc.text(ackText, 14, y + 6, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });

    // Apply headers and footers to all pages
    applyHeaderFooterDecorator(doc, "HTTPS Security Checker");

    if (setPdfProgress) setPdfProgress("Saving PDF...");
    doc.save(`HTTPS-Security-Report-${Date.now()}.pdf`);
  } catch (err) {
    console.error("Failed to generate HTTPS PDF report:", err);
  } finally {
    if (setPdfProgress) setPdfProgress(null);
  }
};
