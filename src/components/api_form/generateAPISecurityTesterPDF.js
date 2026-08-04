import { jsPDF } from "jspdf";
import {
  C,
  safe,
  getSeverityColor,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../utils/pdfFramework";

const SECURITY_LOOKUP = {
  authentication: {
    title: "Authentication",
    checkName: "Authentication Check",
    impact: "Failure to enforce authentication on sensitive endpoints exposes the application to unauthorized data access, horizontal/vertical privilege escalation, and business logic abuse.",
    recommendation: "Implement robust token-based authentication (such as JWT or OAuth 2.0) on all non-public endpoints. Enforce access control checks on every API request."
  },
  headerSecurity: {
    title: "Security Headers Assessment",
    checkName: "HTTP Security Headers",
    impact: "Missing or weak security headers leave clients susceptible to attacks such as Cross-Site Scripting (XSS), clickjacking, MIME-sniffing, and protocol downgrades.",
    recommendation: "Configure the web server or application middleware to return Strict-Transport-Security, Content-Security-Policy, X-Content-Type-Options, X-Frame-Options, and X-XSS-Protection headers with secure values."
  },
  ssl: {
    title: "SSL/TLS Security",
    checkName: "SSL/TLS Channel Configuration",
    impact: "Insecure TLS configurations or missing HSTS headers allow attackers to perform man-in-the-middle (MITM) attacks and intercept sensitive communication in transit.",
    recommendation: "Enforce HTTPS-only traffic, disable deprecated protocols (TLS 1.0 and 1.1), configure strong cipher suites, and set the Strict-Transport-Security header with a long max-age directive and includeSubDomains."
  },
  corsPolicy: {
    title: "CORS Policy",
    checkName: "Cross-Origin Resource Sharing",
    impact: "A misconfigured CORS policy (e.g. wildcards or echoing origins with credentials enabled) allows malicious websites to perform cross-origin requests and read sensitive API response data.",
    recommendation: "Avoid wildcards (*) when credentials are required. Implement a strict server-side allowlist of trusted origins and return them dynamically in response to valid requests."
  },
  cookieSecurity: {
    title: "Cookie Security",
    checkName: "Session Cookie Security Flags",
    impact: "Cookies missing the Secure, HttpOnly, or SameSite flags can be leaked over unencrypted channels, stolen via Cross-Site Scripting (XSS), or abused in Cross-Site Request Forgery (CSRF) attacks.",
    recommendation: "Set HttpOnly to prevent JavaScript access, Secure to enforce transmission over HTTPS only, and SameSite (Strict or Lax) to mitigate CSRF vectors."
  },
  cachePolicy: {
    title: "Cache Policy",
    checkName: "HTTP Cache Control Policy",
    impact: "Improper cache policies can lead to intermediate proxies or local browsers storing sensitive API response payloads, exposing confidential user data to unauthorized local users.",
    recommendation: "Set Cache-Control to 'no-store, no-cache, must-revalidate' and Pragma to 'no-cache' for all responses containing sensitive or personalized data."
  },
  sensitiveDataExposure: {
    title: "Sensitive Data Exposure",
    checkName: "Information Disclosure / Sensitive Data Leakage",
    impact: "Exposure of system details, debug traces, stack logs, or personally identifiable information (PII) helps attackers perform targeted exploitation and recon activity.",
    recommendation: "Sanitize API responses to remove debug logs, stack traces, and internal server paths. Restrict verbose error messages to server-side logs only."
  },
  injectionVulnerability: {
    title: "Injection Vulnerabilities",
    checkName: "Input Validation / Injection Testing",
    impact: "Lack of input sanitization can lead to SQL Injection, Command Injection, or script injection, enabling attackers to execute arbitrary database queries or commands.",
    recommendation: "Use parameterized queries, enforce strict server-side schema validation for all parameters, and utilize a Web Application Firewall (WAF) to filter malicious patterns."
  }
};

const mapCheckSeverity = (checkKey, checkVal) => {
  if (checkKey === "headerSecurity") {
    // If any header has status starting with 'Missing', severity is at least Medium/Low.
    // Let's check status of individual headers.
    const statuses = Object.values(checkVal || {}).map(v => (v.status || "").toLowerCase());
    if (statuses.some(s => s.includes("missing"))) return "Medium";
    return "Low";
  }
  const statusLower = String(checkVal?.status || "").toLowerCase();
  if (statusLower.includes("missing") || statusLower.includes("insecure") || statusLower.includes("vulnerable")) {
    if (checkKey === "authentication" || checkKey === "injectionVulnerability") return "High";
    return "Medium";
  }
  return "Low";
};

const getStatusText = (checkKey, checkVal) => {
  if (checkKey === "headerSecurity") {
    const totalHeaders = Object.keys(checkVal || {}).length;
    const missing = Object.values(checkVal || {}).filter(v => (v.status || "").toLowerCase().includes("missing")).length;
    return missing > 0 ? `${missing}/${totalHeaders} Headers Missing` : "Configured";
  }
  return checkVal?.status || "Configured";
};

export const generateAPISecurityTesterPDF = async (report = {}, setPdfProgress) => {
  if (!report) return;
  setPdfProgress?.("Initializing PDF document...");

  const { employeeName, employeeMail } = getAuditorInfo();
  const targetUrl = report.targetUrl || report.url || "-";
  const httpMethod = report.method || "GET";
  
  const score = report.securityScorecard?.score ?? "N/A";
  const rating = report.securityScorecard?.rating ?? "N/A";
  
  const checks = report.securityChecks || {};
  const totalChecks = 8;
  const issuesFound = Object.entries(checks).filter(([k, v]) => {
    if (k === "headerSecurity") {
      return Object.values(v || {}).some(h => (h.status || "").toLowerCase().includes("missing"));
    }
    const status = (v?.status || "").toLowerCase();
    return status.includes("missing") || status.includes("insecure") || status.includes("vulnerable");
  }).length;

  try {
    const doc = new jsPDF("p", "mm", "a4");

    const now = new Date();
    const scanDate = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
    const scanTime = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 1 — COVER PAGE
    // ════════════════════════════════════════════════════════════════════════
    setPdfProgress?.("Building cover page...");

    // Top blue banner stripe
    doc.setFillColor(...C.bluePrimary);
    doc.rect(0, 0, 210, 3.5, "F");

    // Brand line
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – API Security Tester", 14, 12);

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
    doc.text("API SECURITY TESTER SECURITY ASSESSMENT REPORT", 105, 54, { align: "center" });

    // Divider below title
    doc.line(14, 60, 196, 60);

    // Assessment Info table
    renderTable(doc, {
      startY: 65,
      head: [],
      body: [
        ["Assessment Performed by", employeeMail],
        ["Employee Name", employeeName],
        ["Employee Mail ID", employeeMail],
        ["Scanned URL", targetUrl],
        ["Assessment Date", scanDate],
        ["Assessment Time", scanTime],
        ["Classification", "Confidential"],
        ["Assessment Status", "Completed"],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 },
      },
    });

    // Cover footer
    doc.line(14, 260, 196, 260);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("www.nexcorealliance.com | ISO/IEC 27001 Certified | AICPA SOC Compliant", 105, 267, { align: "center" });

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
        ["Tool Name", "API Security Tester"],
        ["Tool Category", "API Security Analysis / Endpoint Security Testing"],
        ["Methodology Alignment", "OWASP WSTG – OTG-INPVAL / OTG-AUTHN / OTG-CONFIG"],
        ["Compliance Alignment", "ISO/IEC 27001 | AICPA SOC Frameworks | OWASP API Security Top 10"],
        ["Scanned URL", targetUrl],
        ["HTTP Method", httpMethod],
        ["Assessment Mode", "Non-Intrusive / Automated Security Header & Configuration Analysis"],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 },
      },
    });

    y = doc.lastAutoTable.finalY + 6;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Tool Overview", 14, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    const overviewText =
      "The API Security Tester evaluates REST API endpoints against a comprehensive set of security controls including authentication mechanisms, HTTP security headers, SSL/TLS configuration, CORS policy, cookie security, cache policy, sensitive data exposure, and injection vulnerability indicators. The tool performs automated, non-intrusive analysis by issuing targeted HTTP requests to the specified endpoint and inspecting the response headers, status codes, and body for security misconfigurations and compliance gaps. It uses the protected backend route and blocks localhost, private-network, and metadata targets for SSRF safety. The tool aligns with the OWASP API Security Top 10 and OWASP WSTG guidelines.";
    doc.text(overviewText, 14, y + 5, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 2 — SCAN SUMMARY & RESPONSE SUMMARY
    // ════════════════════════════════════════════════════════════════════════
    setPdfProgress?.("Building scan summary...");
    doc.addPage();
    
    y = drawSectionHeader(doc, "2. SCAN SUMMARY", 25);

    renderTable(doc, {
      startY: y,
      head: [["Security Score", "Total Security Checks", "Issues Found", "Overall Assessment"]],
      body: [
        [`${score}/100`, String(totalChecks), String(issuesFound), rating]
      ],
      headStyles: { fillColor: C.bgHeader, textColor: C.white, halign: "center" },
      bodyStyles: { halign: "center", fontStyle: "bold", fontSize: 10 },
    });

    y = doc.lastAutoTable.finalY + 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Response Summary", 14, y);

    renderTable(doc, {
      startY: y + 4,
      head: [],
      body: [
        ["Target URL", targetUrl],
        ["HTTP Status Code", String(report.status || "N/A")],
        ["HTTP Method", httpMethod],
        ["Response Time", report.responseTime ? `${report.responseTime} ms` : "N/A"],
        ["Request Headers", report.headers ? JSON.stringify(report.headers) : "N/A"]
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 },
      },
    });

    // ════════════════════════════════════════════════════════════════════════
    // DETAILED FINDINGS
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;
    y = drawSectionHeader(doc, "3. DETAILED FINDINGS", y);

    let checkIndex = 1;

    // Helper to render standard finding block
    const renderFindingBlock = (key, val) => {
      const meta = SECURITY_LOOKUP[key] || { title: key, checkName: key, impact: "-", recommendation: "-" };
      const statusText = getStatusText(key, val);
      const severity = mapCheckSeverity(key, val);

      if (297 - y < 85) {
        doc.addPage();
        y = 25;
      }

      // Title line for finding
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setFillColor(...C.bluePrimary);
      doc.rect(14, y, 182, 6, "F");
      doc.setTextColor(...C.white);
      doc.text(`Finding ${checkIndex} of 13 — ${meta.title}`, 18, y + 4.2);
      y += 8;

      renderTable(doc, {
        startY: y,
        head: [],
        body: [
          ["Severity", severity],
          ["Security Check", meta.checkName],
          ["Status", statusText],
          ["HTTP Method", httpMethod],
          ["Endpoint / URL", targetUrl],
          ["Parameter", val?.parameter || "None"],
          ["Evidence", val?.value || val?.details || "None"],
          ["Impact", meta.impact],
          ["Recommendation", val?.recommendation || meta.recommendation]
        ],
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
          1: { cellWidth: 127 }
        },
      });

      y = doc.lastAutoTable.finalY + 8;
      checkIndex++;
    };

    // 1. Authentication
    renderFindingBlock("authentication", checks.authentication);

    // 2. Security Headers (Special rendering with Subtable)
    if (checks.headerSecurity) {
      if (297 - y < 85) {
        doc.addPage();
        y = 25;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setFillColor(...C.bluePrimary);
      doc.rect(14, y, 182, 6, "F");
      doc.setTextColor(...C.white);
      doc.text(`Finding ${checkIndex} of 13 — Security Headers Assessment`, 18, y + 4.2);
      y += 8;

      const headerRows = Object.entries(checks.headerSecurity).map(([headerName, headerVal]) => [
        headerName,
        headerVal.status || "Configured",
        mapCheckSeverity("headerSecurity", { [headerName]: headerVal })
      ]);

      renderTable(doc, {
        startY: y,
        head: [["Header", "Status", "Severity"]],
        body: headerRows,
        headStyles: { fillColor: C.bgHeader, textColor: C.white },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 70 },
          1: { cellWidth: 70 },
          2: { cellWidth: 42, halign: "center" }
        }
      });

      y = doc.lastAutoTable.finalY + 6;

      const meta = SECURITY_LOOKUP.headerSecurity;
      const recs = Object.values(checks.headerSecurity)
        .map(h => h.recommendation)
        .filter(Boolean)
        .join("; ") || meta.recommendation;

      renderTable(doc, {
        startY: y,
        head: [],
        body: [
          ["Parameter", "Response Headers"],
          ["Evidence", Object.keys(checks.headerSecurity).join(", ")],
          ["Impact", meta.impact],
          ["Recommendation", recs]
        ],
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
          1: { cellWidth: 127 }
        }
      });

      y = doc.lastAutoTable.finalY + 8;
      checkIndex++;
    }

    // SSL/TLS (Note: jumps to finding 8 to align with visual structure)
    checkIndex = 8;
    renderFindingBlock("ssl", checks.ssl);

    // CORS
    renderFindingBlock("corsPolicy", checks.corsPolicy);

    // Cookies
    renderFindingBlock("cookieSecurity", checks.cookieSecurity);

    // Cache Policy
    renderFindingBlock("cachePolicy", checks.cachePolicy);

    // Sensitive Data Exposure
    renderFindingBlock("sensitiveDataExposure", checks.sensitiveDataExposure);

    // Injection
    renderFindingBlock("injectionVulnerability", checks.injectionVulnerability);

    // ════════════════════════════════════════════════════════════════════════
    // CONCLUSION & RECOMMENDATIONS
    // ════════════════════════════════════════════════════════════════════════
    if (297 - y < 85) {
      doc.addPage();
      y = 25;
    }

    y = drawSectionHeader(doc, "4. CONCLUSION & RECOMMENDATIONS", y);

    const recList = report.recommendations || [];
    const concText1 = `The API Security Tester assessment of ${targetUrl} returned a Security Score of ${score}/100 (${rating}), indicating significant security configurations status across control categories. A total of ${totalChecks} security checks were performed, of which ${issuesFound} identified actionable issues requiring remediation.`;
    
    const concText2 = recList.length > 0 
      ? recList.join("\n\n")
      : "No critical or high-severity vulnerabilities were identified during this assessment. It is recommended to maintain the active filters and configuration policies.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMain);
    doc.text(concText1, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.45 });
    
    y += doc.getTextDimensions(concText1, { maxWidth: 182 }).h + 6;
    doc.text(concText2, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.45 });

    // ════════════════════════════════════════════════════════════════════════
    // APPENDIX
    // ════════════════════════════════════════════════════════════════════════
    setPdfProgress?.("Building appendix...");
    doc.addPage();

    y = drawSectionHeader(doc, "5. APPENDIX", 25);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Column Reference Guide", 14, y);

    renderTable(doc, {
      startY: y + 5,
      head: [["Column", "Description"]],
      body: [
        ["Security Score", "Overall security rating assigned to the API after evaluating all configured security controls."],
        ["Total Security Checks", "Total number of security checks performed during the assessment."],
        ["Issues Found", "Total number of security findings identified during the assessment that require remediation."],
        ["Overall Assessment", "Overall security posture of the API based on the scan results (Excellent, Good, Fair, Poor, or Critical)."],
        ["Endpoint / URL", "The API endpoint URL submitted for security analysis"],
        ["HTTP Status Code", "HTTP response code returned by the API indicating the request outcome."],
        ["HTTP Method", "HTTP request method used during the assessment (GET, POST, PUT, DELETE, etc.)."],
        ["Response Time", "Time taken by the API to process and return the response."],
        ["Request Headers", "HTTP request headers included during the assessment, such as Content-Type, Authorization, and other custom headers"],
        ["Severity", "Risk level assigned to the identified finding (Critical, High, Medium, Low, or Informational)."],
        ["Security Check", "Security control or configuration category evaluated during the assessment (Authentication, Security Headers, SSL/TLS, CORS, Cookies, Cache Policy, Sensitive Data Exposure, or Injection Testing)."],
        ["Status", "Assessment result for the evaluated security control (Configured, Secure, Missing, Misconfigured, Not Detected, or Vulnerable)."],
        ["Parameter", "Specific HTTP header, request parameter, cookie, response header, or API component evaluated during the assessment."],
        ["Evidence", "Observable response data, response headers, or API behaviour that supports the identified finding."],
        ["Impact", "Potential security consequences resulting from the identified weakness, including unauthorized access, data exposure, session compromise, information disclosure, or browser-based attacks."],
        ["Recommendation", "Recommended remediation actions aligned with OWASP API Security Top 10 and industry best practices."],
        ["Header", "Name of the HTTP security header evaluated during the assessment (e.g., Strict-Transport-Security, Content-Security-Policy, X-Frame-Options)."]
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50, fillColor: [245, 245, 245] },
        1: { cellWidth: 132 }
      }
    });

    y = doc.lastAutoTable.finalY + 12;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Acknowledgement", 14, y);

    const ackText =
      "The findings presented in this report are based on observations made during the assessment period and represent the API security configuration status of the environment at the time of scanning. This report contains confidential and proprietary information intended solely for the authorised recipient. Unauthorised disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMain);
    doc.text(ackText, 14, y + 6, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });

    // Apply header / footer decorator
    applyHeaderFooterDecorator(doc, "API Security Tester");

    setPdfProgress?.("Saving PDF...");
    const pad = (n) => String(n).padStart(2, "0");
    const dStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

    doc.save(`API_Security_Tester_Report_${dStr}.pdf`);

  } catch (err) {
    console.error("Failed to generate API PDF:", err);
  } finally {
    setPdfProgress?.(null);
  }
};
