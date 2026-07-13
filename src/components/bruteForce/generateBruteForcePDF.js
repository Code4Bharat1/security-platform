import { jsPDF } from "jspdf";
import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../utils/pdfFramework";

// Static lookup map for Security Impact and Remediation Guidance
const findingsLookup = {
  "status:2xx": {
    severity: "High",
    impact: "Exposed resource or endpoint is publicly accessible without authentication. Depending on the nature of the resource (e.g., administrative panels, configuration files, source code repositories), this may allow attackers to gain unauthorized access, view sensitive configuration data, or compromise backend infrastructure.",
    recommendation: "Ensure strict authentication and authorization controls are enforced. Restrict access via IP allowlisting, or remove public exposure if the resource is for internal use only."
  },
  "status:3xx": {
    severity: "Low",
    impact: "The resource redirects to another location, exposing route existence. While not directly accessible, it confirms the path structure and may leak internal routing information or support open-redirect vulnerability chaining.",
    recommendation: "Review the redirect destination. Restrict access if the target page contains sensitive data. Ensure redirect parameters are not user-controlled to prevent open redirect vulnerabilities."
  },
  "status:401": {
    severity: "Medium",
    impact: "The resource exists but requires authentication. While access is blocked, the visibility of the endpoint confirms its presence, providing a target for credential stuffing, brute force attacks, or vulnerability exploitation.",
    recommendation: "Verify that credentials cannot be brute-forced (enforce strong password policies and rate limiting). Implement multi-factor authentication (MFA) and restrict access at the network layer if possible."
  },
  "status:403": {
    severity: "Medium",
    impact: "The resource is forbidden. The existence of the path is confirmed, which could indicate administrative portals, internal services, or restricted assets. Attackers might attempt to bypass access controls or find misconfigured sub-directories.",
    recommendation: "Ensure IP or role-based restrictions are correctly configured. Disable directory listing on the web server to prevent enumeration of files in the directory."
  },
  "status:4xx": {
    severity: "Informational",
    impact: "The resource returned a client error. Minimal security risk as the path does not expose active components.",
    recommendation: "Enforce generic 404 error pages. Ensure that no detailed error messages or stack traces are returned to the user."
  },
  "path:admin": {
    severity: "High",
    impact: "Publicly accessible administrative portal. Attackers can perform brute force login attempts, exploit portal vulnerabilities, or gain full control of the application if administrative credentials are weak or default.",
    recommendation: "Restrict administrative access to VPN/internal networks. Enforce multi-factor authentication (MFA). Consider renaming the admin route to a non-standard path."
  },
  "path:config": {
    severity: "Critical",
    impact: "Exposure of sensitive configuration details, which may contain database credentials, API keys, encryption secrets, or internal service URLs. This can lead to full system compromise.",
    recommendation: "Remove configuration files from the web root directory immediately. Secure secrets using environment variables or a dedicated secrets manager."
  },
  "path:backup": {
    severity: "Critical",
    impact: "Exposed system or database backups. These archives typically contain source code, database dumps, configuration files, and credentials. Access allows complete offline analysis and database compromise.",
    recommendation: "Delete backup files from the web server directory immediately. Store backups in a secure, offline, or external cloud storage bucket with strict access controls."
  },
  "path:env": {
    severity: "Critical",
    impact: "Exposed environment configuration file. Typically contains database credentials, API secret keys, mail server configurations, and encryption salts, leading directly to third-party integrations and database takeover.",
    recommendation: "Ensure the web server configuration denies access to dotfiles (e.g. .env, .git). Move secret keys to secure environment variables handled outside the web root."
  },
  "path:git": {
    severity: "Critical",
    impact: "Exposed .git directory. Allows attackers to reconstruct the entire source code repository, examine commit history for credentials, and identify code-level vulnerabilities offline.",
    recommendation: "Disable public access to .git and other version control directories on the web server. Configure server rules to return 404 or 403 for such paths."
  }
};

const getDiscoveryResult = (statusCode) => {
  if (statusCode >= 200 && statusCode < 300) return "Accessible Resource";
  if (statusCode === 301 || statusCode === 302 || statusCode === 307 || statusCode === 308) return "Redirected Resource";
  if (statusCode >= 300 && statusCode < 400) return "Redirected Resource";
  if (statusCode === 401) return "Authentication Required";
  if (statusCode === 403) return "Access Forbidden";
  if (statusCode === 404) return "Not Found";
  if (statusCode >= 500 && statusCode < 600) return "Server Error";
  return "Unknown Status";
};

const getFindingDetails = (path, status) => {
  const pathLower = String(path || "").toLowerCase();
  const statusStr = String(status || "");
  const statusCode = parseInt(statusStr, 10);

  const discoveryResult = getDiscoveryResult(statusCode);

  // Rule 3 & 4: For 404 responses
  if (statusCode === 404) {
    return {
      severity: "Informational",
      discoveryResult,
      impact: "The requested resource was not found. No evidence was found that this endpoint is publicly accessible.",
      recommendation: "No immediate action required. Continue ensuring this resource remains inaccessible to the public."
    };
  }

  // Rule 2: Never report a resource as Exposed Config/Git/Backup/Admin unless actually accessible (i.e. not 404).
  // We already handled 404 above, so if we reach here, it is NOT 404.
  let severity = "Low";
  let impact = "";
  let recommendation = "";

  let matchedKeyword = null;
  if (pathLower.includes("admin") || pathLower.includes("login") || pathLower.includes("portal")) {
    matchedKeyword = "path:admin";
  } else if (pathLower.includes("config") || pathLower.includes("setup") || pathLower.includes("settings")) {
    matchedKeyword = "path:config";
  } else if (pathLower.includes("backup") || pathLower.includes("zip") || pathLower.includes("tar") || pathLower.includes("bak")) {
    matchedKeyword = "path:backup";
  } else if (pathLower.includes(".env")) {
    matchedKeyword = "path:env";
  } else if (pathLower.includes(".git")) {
    matchedKeyword = "path:git";
  }

  if (matchedKeyword && findingsLookup[matchedKeyword]) {
    const override = findingsLookup[matchedKeyword];
    severity = override.severity;
    impact = override.impact;
    recommendation = override.recommendation;
  } else {
    // Status-based defaults
    let statusKey = "status:4xx";
    if (statusCode >= 200 && statusCode < 300) statusKey = "status:2xx";
    else if (statusCode >= 300 && statusCode < 400) statusKey = "status:3xx";
    else if (statusCode === 401) statusKey = "status:401";
    else if (statusCode === 403) statusKey = "status:403";

    const defaultDetails = findingsLookup[statusKey] || findingsLookup["status:4xx"];
    severity = defaultDetails.severity;
    impact = defaultDetails.impact;
    recommendation = defaultDetails.recommendation;
  }

  // If status is 5xx, adjust accordingly
  if (statusCode >= 500 && statusCode < 600) {
    severity = "Low";
    impact = `The server returned a server error (${statusCode}) when accessing this path. This may indicate a misconfiguration, application crash, or internal exception triggered by the request.`;
    recommendation = "Review application server logs to identify and resolve the root cause of the internal error. Ensure database connections and services are running properly.";
  }

  return {
    severity,
    discoveryResult,
    impact,
    recommendation
  };
};

export const generateBruteForcePDF = async (results = [], meta = null, target = "") => {
  const { employeeName, employeeMail } = getAuditorInfo();
  
  // Format Date & Time
  const now = new Date();
  const scanDate = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  const scanTime = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  try {
    const doc = new jsPDF("p", "mm", "a4");
    const domain = safe(target || "Unknown Target").replace(/^https?:\/\//, "").split("/")[0];

    // Count statistics
    const totalPaths = meta?.totalRequests || results.length;
    const success2xx = results.filter(r => parseInt(r.status, 10) >= 200 && parseInt(r.status, 10) < 300).length;
    const redirect3xx = results.filter(r => parseInt(r.status, 10) >= 300 && parseInt(r.status, 10) < 400).length;
    const notFound4xx = results.filter(r => parseInt(r.status, 10) === 404).length;

    // Rule 5: Overall Assessment calculated accurately based on active count
    const activeCount = results.filter(r => {
      const code = parseInt(r.status, 10);
      return code !== 404 && !isNaN(code);
    }).length;

    let overallAssessment = "Acceptable posture; no active directories or endpoints exposed.";
    if (activeCount === 1 || activeCount === 2) {
      overallAssessment = `Minimal exposure detected. Only ${activeCount} active endpoint(s) discovered. Review to ensure public access is intended.`;
    } else if (activeCount > 2) {
      overallAssessment = `Multiple active directories or paths exposed. Implement strict access control lists or remove public files.`;
    }

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 1 — COVER PAGE & ASSESSMENT INFORMATION
    // ══════════════════════════════════════════════════════════════════════
    
    // Brand header
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – Brute Force Scanner", 14, 12);

    // Company logo
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(...C.bluePrimary);
    doc.text("NEXCORE ALLIANCE", 105, 30, { align: "center" });

    doc.setFont("helvetica", "oblique");
    doc.setFontSize(10);
    doc.text("AI-Powered Cybersecurity & Information Security Solutions", 105, 36, { align: "center" });

    // Divider line
    doc.setDrawColor(...C.bluePrimary);
    doc.setLineWidth(0.4);
    doc.line(14, 40, 196, 40);

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...C.bluePrimary);
    doc.text("BRUTE FORCE SCANNER", 105, 54, { align: "center" });

    // Divider line below title
    doc.line(14, 65, 196, 65);

    // Assessment Info Table
    renderTable(doc, {
      startY: 72,
      head: [],
      body: [
        ["Assessment Performed by", employeeMail],
        ["Employee Name",           employeeName],
        ["Employee Mail ID",        employeeMail],
        ["Scanned URL",             target],
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

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 2 — TOOL DETAILS & SCAN SUMMARY
    // ══════════════════════════════════════════════════════════════════════
    doc.addPage();

    let y = drawSectionHeader(doc, "1. ASSESSMENT INFORMATION", 25);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Tool Details", 14, y);
    y += 5;

    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Tool Name",             "Brute Force Scanner"],
        ["Tool Category",         "Web Security / Directory & Path Enumeration Scanner"],
        ["Methodology Alignment", "OWASP WSTG – OTG-CONFIG-004 / Forced Browsing Testing"],
        ["Compliance Alignment",  "ISO/IEC 27001 │ AICPA SOC Frameworks"],
        ["Scanned URL",           target],
        ["Assessment Mode",       "Active / Automated Directory Brute Force"]
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 }
      }
    });

    y = doc.lastAutoTable.finalY + 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Tool Overview", 14, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    const overviewText = "The Brute Force Scanner performs automated directory and path enumeration against the target web application by iterating through a predefined wordlist of common paths, filenames, and directory names. Each candidate path is requested and the HTTP response is evaluated to determine whether the resource exists, is accessible, or returns a redirect. Exposed directories, administrative panels, backup files, and configuration endpoints can represent significant attack surfaces. The scanner records the HTTP response status code, response size, and similarity metrics to distinguish valid findings from wildcard or catch-all responses.";
    doc.text(overviewText, 14, y + 5, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });

    y += 35;

    y = drawSectionHeader(doc, "2. SCAN SUMMARY", y);

    renderTable(doc, {
      startY: y,
      head: [["Total Paths Tested", "Success (2xx)", "Redirected (3xx)", "Not Found (4xx)", "Overall Assessment"]],
      body: [[
        String(totalPaths),
        String(success2xx),
        String(redirect3xx),
        String(notFound4xx),
        overallAssessment
      ]],
      headStyles: {
        fillColor: C.bgHeader,
        textColor: C.white,
        halign: "center",
      },
      bodyStyles: {
        halign: "center",
        fontSize: 8.5,
      },
      columnStyles: {
        0: { cellWidth: 30, fontStyle: "bold" },
        1: { cellWidth: 25, fontStyle: "bold", textColor: success2xx > 0 ? C.red : C.textMain },
        2: { cellWidth: 25, fontStyle: "bold", textColor: redirect3xx > 0 ? C.amber : C.textMain },
        3: { cellWidth: 25, fontStyle: "bold" },
        4: { cellWidth: 77, halign: "left" }
      }
    });

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 3 — DETAILED FINDINGS
    // ══════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = drawSectionHeader(doc, "3. DETAILED FINDINGS", 25);

    if (results.length === 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...C.textMain);
      doc.text("No active directory exposure findings recorded for the target.", 14, y);
      y += 10;
    } else {
      results.forEach((item, index) => {
        const details = getFindingDetails(item.path, item.status);
        
        if (297 - y < 65) {
          doc.addPage();
          y = 25;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(...C.bluePrimary);
        doc.text(`Finding ${String(index + 1).padStart(2, "0")} of ${String(results.length).padStart(2, "0")} — ${item.path}`, 14, y);
        y += 4;

        renderTable(doc, {
          startY: y,
          head: [],
          body: [
            ["Path / Endpoint", item.path],
            ["HTTP Status",     String(item.status)],
            ["Discovery Result", details.discoveryResult],
            ["Impact",         details.impact],
            ["Recommendation", details.recommendation]
          ],
          columnStyles: {
            0: { fontStyle: "bold", cellWidth: 40, fillColor: [245, 245, 245] },
            1: { cellWidth: 142 }
          },
          didParseCell: (data) => {
            if (data.column.index === 1 && data.row.index === 2) {
              const sev = details.severity.toLowerCase();
              if (sev === "critical" || sev === "high") {
                data.cell.styles.textColor = C.red;
                data.cell.styles.fontStyle = "bold";
              } else if (sev === "medium") {
                data.cell.styles.textColor = C.amber;
                data.cell.styles.fontStyle = "bold";
              } else {
                data.cell.styles.textColor = C.blue;
                data.cell.styles.fontStyle = "bold";
              }
            }
          }
        });

        y = doc.lastAutoTable.finalY + 8;
      });
    }

    // ══════════════════════════════════════════════════════════════════════
    // CONCLUSION & RECOMMENDATIONS
    // ══════════════════════════════════════════════════════════════════════
    if (297 - y < 80) {
      doc.addPage();
      y = 25;
    }

    y = drawSectionHeader(doc, "4. CONCLUSION & RECOMMENDATIONS", y);

    const conclusionParagraphs = [
      "The Brute Force Scanner assessment enumerated the target URL for exposed directories, files, and endpoints using an automated wordlist-based approach. Each discovered path was validated against its HTTP response status code, response size, and similarity score to minimise false positives resulting from wildcard or catch-all responses.",
      "All paths returning a 200 OK or equivalent success response should be reviewed to confirm whether public accessibility is intentional. Sensitive directories such as administrative panels, backup locations, configuration files, and source code repositories must be restricted through server-level access controls or removed from the web root entirely.",
      "It is recommended to implement server-side rate limiting and lockout mechanisms to prevent enumeration in production environments. Generic 404 responses should be enforced for all non-existent paths to avoid response-based path disclosure. Wildcard DNS and catch-all route configurations must be reviewed to ensure they do not mask the true existence of sensitive endpoints."
    ];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    
    conclusionParagraphs.forEach((para) => {
      if (297 - y < 20) {
        doc.addPage();
        y = 25;
      }
      doc.text(para, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });
      const lines = doc.splitTextToSize(para, 182);
      y += (lines.length * 4) + 4;
    });

    // ══════════════════════════════════════════════════════════════════════
    // APPENDIX
    // ══════════════════════════════════════════════════════════════════════
    if (297 - y < 65) {
      doc.addPage();
      y = 25;
    }

    y = drawSectionHeader(doc, "5. APPENDIX", y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Column Reference Guide", 14, y);

    renderTable(doc, {
      startY: y + 5,
      head: [["Column", "Description"]],
      body: [
        ["Total Paths Tested",    "Total number of directories and resources tested during enumeration."],
        ["Accessible Resources",  "Number of paths returning successful HTTP responses (2xx), indicating accessible resources."],
        ["Redirected Resources",  "Number of paths returning HTTP redirect responses (3xx)."],
        ["Not Found / Blocked",   "Number of paths returning client error responses (4xx), such as Not Found or Forbidden."],
        ["Overall Assessment",    "Overall result of the directory enumeration based on the scan findings."],
        ["Path / Endpoint",       "The enumerated directory, file, or endpoint appended to the target URL."],
        ["HTTP Status",           "HTTP response code returned for the tested resource (e.g., 200, 301, 403, 404)."],
        ["Discovery Result",      "Outcome of the enumeration, such as Accessible, Redirected, Forbidden, or Not Found."],
        ["Impact",                "Describes the potential security implications of exposing the identified resource."],
        ["Recommendation",        "Concise summary of the discovered resource, its accessibility, and the associated security assessment."]
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 40, fillColor: [245, 245, 245] },
        1: { cellWidth: 142 }
      }
    });

    y = doc.lastAutoTable.finalY + 10;

    if (297 - y < 45) {
      doc.addPage();
      y = 25;
    }

    // Acknowledgement
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Acknowledgement", 14, y);

    const ackText = "The findings presented in this report are based on observations made during the assessment period and represent the directory and path exposure status of the environment at the time of scanning. This report contains confidential and proprietary information intended solely for the authorised recipient. Unauthorised disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.";
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(ackText, 14, y + 5, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });

    // Apply header & footer decorator to all pages
    applyHeaderFooterDecorator(doc, "Brute Force Scanner");

    doc.save(`${domain}-Brute-Force-Scanner-Report-${Date.now()}.pdf`);
  } catch (err) {
    console.error("Failed to generate Brute Force Scanner PDF report:", err);
  }
};
