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
  "core": {
    severity: "Low",
    status: "Observed",
    issueDetected: "WordPress Core version identified.",
    recommendation: "Ensure WordPress Core is kept up to date to minimize vulnerability exposure."
  },
  "user_enumeration": {
    severity: "Medium",
    status: "Warning",
    issueDetected: "User enumeration exposure detected. Public access to author archives or REST API endpoints allows harvesting of valid usernames.",
    recommendation: "Restrict public REST API access for the '/wp/v2/users' endpoint. Enforce security plugins or rules that block user enumeration scans."
  },
  "directory_listing": {
    severity: "Medium",
    status: "Warning",
    issueDetected: "Directory listing enabled on critical paths (e.g. wp-content/uploads or wp-content/plugins).",
    recommendation: "Disable directory indexing in the web server configuration (e.g., Options -Indexes in .htaccess or autoindex off in Nginx)."
  },
  "readme_exposed": {
    severity: "Low",
    status: "Info",
    issueDetected: "Default readme.html, license.txt, or wp-config-sample.php files exposed in the root directory, leaking version details.",
    recommendation: "Delete default readme.html, license.txt, and wp-config-sample.php files from the production web root."
  },
  "xmlrpc_enabled": {
    severity: "Medium",
    status: "Warning",
    issueDetected: "XML-RPC endpoint (xmlrpc.php) is active, exposing the application to brute force amplification or pingback DDoS attacks.",
    recommendation: "Disable XML-RPC by adding rewrite rules in .htaccess/nginx.conf or using a WordPress filter (add_filter('xmlrpc_enabled', '__return_false'))."
  },
  "debug_log_exposed": {
    severity: "High",
    status: "Vulnerable",
    issueDetected: "WordPress debug log (debug.log) is publicly accessible, potentially exposing PHP warnings, database errors, and sensitive cookies/keys.",
    recommendation: "Set WP_DEBUG_DISPLAY to false in wp-config.php and restrict public access to wp-content/debug.log via server configurations."
  },
  "vulnerable_plugin": {
    severity: "High",
    status: "Vulnerable",
    issueDetected: "Vulnerable plugin(s) detected in the installation.",
    recommendation: "Update the vulnerable plugin(s) to the latest secure version immediately. If no update is available, deactivate and remove the plugin."
  },
  "outdated_plugin": {
    severity: "Medium",
    status: "Warning",
    issueDetected: "Outdated plugin(s) detected in the installation.",
    recommendation: "Update all outdated plugins to their latest stable releases to remediate known bugs and vulnerabilities."
  }
};

const getFindingDetails = (issueStr) => {
  const issueLower = String(issueStr || "").toLowerCase();

  let key = null;
  if (issueLower.includes("user enumeration") || issueLower.includes("author archive") || issueLower.includes("rest api")) {
    key = "user_enumeration";
  } else if (issueLower.includes("directory listing") || issueLower.includes("directory index")) {
    key = "directory_listing";
  } else if (issueLower.includes("readme.html") || issueLower.includes("license.txt") || issueLower.includes("readme") || issueLower.includes("license")) {
    key = "readme_exposed";
  } else if (issueLower.includes("xml-rpc") || issueLower.includes("xmlrpc")) {
    key = "xmlrpc_enabled";
  } else if (issueLower.includes("debug.log") || issueLower.includes("debug log")) {
    key = "debug_log_exposed";
  } else if (issueLower.includes("vulnerable plugin")) {
    key = "vulnerable_plugin";
  } else if (issueLower.includes("outdated plugin")) {
    key = "outdated_plugin";
  }

  if (key && findingsLookup[key]) {
    return { ...findingsLookup[key], issueDetected: issueStr };
  }

  // Fallbacks
  return {
    severity: "Medium",
    status: "Warning",
    issueDetected: issueStr,
    recommendation: "Follow official WordPress hardening guidelines to secure this endpoint and configuration."
  };
};

export const calculateSecurityScore = (scanData) => {
  if (!scanData) return 100;
  if (scanData.notWordPress) return 100;
  
  let score = 100;
  
  // Vulnerable plugins deduction (15 pts each)
  const vulnVal = parseInt(scanData.vulnerablePlugins, 10);
  const vulnerableCount = isNaN(vulnVal) ? 0 : vulnVal;
  score -= vulnerableCount * 15;
  
  // Outdated plugins deduction (5 pts each)
  const outVal = parseInt(scanData.outdatedPlugins, 10);
  const outdatedCount = isNaN(outVal) ? 0 : outVal;
  score -= outdatedCount * 5;
  
  // Issues deduction (10 pts each)
  const issuesCount = Array.isArray(scanData.issues) ? scanData.issues.length : 0;
  score -= issuesCount * 10;
  
  // Core version safety deduction (20 pts)
  if (scanData.versionSecure === false || String(scanData.versionSecure) === "false") {
    score -= 20;
  }
  
  return Math.max(score, 0);
};

export const generateWordPressPDF = async (scanData = null, target = "") => {
  if (!scanData) return;

  const { employeeName, employeeMail } = getAuditorInfo();
  
  // Format Date & Time
  const now = new Date();
  const scanDate = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  const scanTime = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  try {
    const doc = new jsPDF("p", "mm", "a4");
    const domain = safe(target || "Unknown Target").replace(/^https?:\/\//, "").split("/")[0];

    // Recalculate Security Score accurately
    const score = calculateSecurityScore(scanData);
    
    let overallStatus = "Secure";
    if (scanData.notWordPress) overallStatus = "Secure (Non-WP Target)";
    else if (score < 50) overallStatus = "Critical";
    else if (score < 80) overallStatus = "Warning";

    // Build findings list from issues array and plugin listings
    const findingsList = [];

    if (scanData.notWordPress) {
      findingsList.push({
        title: "Target Detection Status",
        coreVersion: "N/A",
        severity: "Informational",
        status: "Observed",
        issueDetected: "The target website was analysed and was not identified as running WordPress. No WordPress-specific components, themes, or directories were exposed.",
        recommendation: "No WordPress security hardening is required. Apply general security headers and standard hardening practices to the active CMS or backend web server stack."
      });
    } else {
      // Core Version Finding
      findingsList.push({
        title: "WordPress Core Version",
        coreVersion: scanData.version || "Unknown",
        severity: score < 90 ? "Medium" : "Low",
        status: score < 90 ? "Outdated" : "Observed",
        issueDetected: score < 90 ? "WordPress core version is outdated or contains known version disclosures." : "WordPress core version is running a standard release.",
        recommendation: "Update WordPress Core to the latest stable release. Conceal version information in generator headers."
      });

      // Plugin findings if any
      if (scanData.vulnerablePlugins && scanData.vulnerablePlugins !== "None detected") {
        findingsList.push({
          title: "Vulnerable Plugins",
          coreVersion: "N/A",
          severity: "High",
          status: "Vulnerable",
          issueDetected: `Vulnerable plugins identified: ${scanData.vulnerablePlugins}`,
          recommendation: "Update the identified plugins immediately. Deactivate and uninstall any plugins that lack security updates."
        });
      }

      if (scanData.outdatedPlugins && scanData.outdatedPlugins !== "None") {
        findingsList.push({
          title: "Outdated Plugins",
          coreVersion: "N/A",
          severity: "Medium",
          status: "Warning",
          issueDetected: `Outdated plugins identified: ${scanData.outdatedPlugins}`,
          recommendation: "Ensure all installed plugins are updated to their latest stable releases."
        });
      }

      // Issues array findings
      const issues = scanData.issues || [];
      issues.forEach((issue, idx) => {
        const details = getFindingDetails(issue);
        findingsList.push({
          title: `WordPress Misconfiguration Flag ${idx + 1}`,
          coreVersion: "N/A",
          severity: details.severity,
          status: details.status,
          issueDetected: details.issueDetected,
          recommendation: details.recommendation
        });
      });
    }

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 1 — COVER PAGE & ASSESSMENT INFORMATION
    // ══════════════════════════════════════════════════════════════════════
    
    // Brand header
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – WordPress Scanner", 14, 12);

    // Company logo
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
    doc.setFontSize(18);
    doc.setTextColor(...C.bluePrimary);
    doc.text("WORDPRESS SCANNER SECURITY ASSESSMENT REPORT", 105, 54, { align: "center" });

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

    // Cover page footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...C.textMuted);
    doc.text("www.nexcorealliance.com | ISO/IEC 27001 Certified | AICPA SOC Compliant", 105, 275, { align: "center" });

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 2 — TOOL DETAILS & CRAWL OVERVIEW
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
        ["Tool Name",             "WordPress Scanner"],
        ["Tool Category",         "CMS Security Scanner / WordPress Enumeration"],
        ["Methodology Alignment", "OWASP WSTG – OTG-INFO / CMS Security Testing"],
        ["Compliance Alignment",  "ISO/IEC 27001 | AICPA SOC Frameworks"],
        ["Scanned URL",           target],
        ["Assessment Mode",       "Non-Intrusive / Automated CMS Enumeration"]
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
    const overviewText = "The WordPress Scanner tool performs automated enumeration and security assessment against WordPress-based installations. The tool identifies the WordPress core version, enumerates installed plugins and themes with their respective version numbers, detects outdated or vulnerable components, assesses user enumeration exposure, and records a scan timestamp for audit traceability. Results support vulnerability identification, patch management prioritisation, and CMS hardening activities.";
    doc.text(overviewText, 14, y + 5, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 3 — SCAN SUMMARY & DETAILED FINDINGS
    // ══════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = drawSectionHeader(doc, "2. SCAN SUMMARY", 25);

    renderTable(doc, {
      startY: y,
      head: [["Security Score", "Vulnerable Plugins", "Outdated Plugins", "Overall Security Status"]],
      body: [[
        scanData.notWordPress ? "100 / 100 (N/A)" : `${score} / 100`,
        scanData.notWordPress ? "N/A" : (scanData.vulnerablePlugins || "None detected"),
        scanData.notWordPress ? "N/A" : (scanData.outdatedPlugins || "None"),
        overallStatus
      ]],
      headStyles: {
        fillColor: C.bgHeader,
        textColor: C.white,
        halign: "center",
      },
      bodyStyles: {
        halign: "center",
        fontSize: 8.5,
        fontStyle: "bold"
      }
    });

    y = doc.lastAutoTable.finalY + 10;

    y = drawSectionHeader(doc, "3. DETAILED FINDINGS", y);

    findingsList.forEach((f) => {
      if (297 - y < 65) {
        doc.addPage();
        y = 25;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(...C.bluePrimary);
      doc.text(f.title, 14, y);
      y += 4;

      renderTable(doc, {
        startY: y,
        head: [],
        body: [
          ["WordPress Core Version", f.coreVersion],
          ["Severity",               f.severity],
          ["Status",                 f.status],
          ["Issue Detected",         f.issueDetected],
          ["Recommendation",         f.recommendation]
        ],
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 40, fillColor: [245, 245, 245] },
          1: { cellWidth: 142 }
        },
        didParseCell: (data) => {
          if (data.column.index === 1 && data.row.index === 1) {
            const sev = String(data.cell.raw || "").toLowerCase();
            if (sev === "high" || sev === "critical") {
              data.cell.styles.textColor = C.red;
              data.cell.styles.fontStyle = "bold";
            } else if (sev === "medium") {
              data.cell.styles.textColor = C.amber;
              data.cell.styles.fontStyle = "bold";
            } else if (sev === "informational") {
              data.cell.styles.textColor = C.textMuted;
              data.cell.styles.fontStyle = "normal";
            } else {
              data.cell.styles.textColor = C.blue;
              data.cell.styles.fontStyle = "bold";
            }
          }
        }
      });

      y = doc.lastAutoTable.finalY + 8;
    });

    // ══════════════════════════════════════════════════════════════════════
    // CONCLUSION & RECOMMENDATIONS
    // ══════════════════════════════════════════════════════════════════════
    if (297 - y < 75) {
      doc.addPage();
      y = 25;
    }

    y = drawSectionHeader(doc, "4. CONCLUSION & RECOMMENDATIONS", y);

    const conclusionParagraphs = scanData.notWordPress ? [
      "The WordPress Scanner assessment analyzed the target URL and confirmed that it is not running WordPress. As a result, no WordPress-specific core components, plugins, themes, or common misconfigurations were exposed.",
      "No WordPress-specific hardening recommendations are required. It is recommended to perform standard security reviews on the active web server, including validating security headers, access permissions, and auditing the active technology stack for outdated components."
    ] : [
      "The WordPress Scanner assessment identified the WordPress core version, enumerated installed plugins and themes with their respective version numbers, detected outdated or vulnerable components, and assessed user enumeration exposure. The scan timestamp has been recorded for audit trail purposes.",
      "It is recommended to update the WordPress core installation and all plugins and themes to their latest stable versions to remediate known CVEs and reduce exposure to publicly disclosed vulnerabilities. Plugins and themes that are inactive or no longer maintained should be removed. User enumeration vectors, including author archive pages and the REST API, should be restricted or disabled to prevent username harvesting. WordPress installations should be subjected to scheduled automated scans to detect newly introduced vulnerabilities following updates or new plugin installations."
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
        ["Security Score",           "Overall security score assigned to the WordPress installation based on detected configurations and components."],
        ["WordPress Core Version",   "Detected version of the WordPress core installation, or Unknown if it cannot be determined."],
        ["Vulnerable Plugins",       "Number of installed plugins identified with known security vulnerabilities."],
        ["Outdated Plugins",         "Number of installed plugins that are outdated and should be updated."],
        ["Overall Security Status",  "Overall assessment of the WordPress installation (Secure, Warning, or Critical)."],
        ["Severity",                 "Risk level assigned to the identified finding (Critical, High, Medium, Low, or Informational)."],
        ["Issue detected",           "Description of the identified vulnerability, outdated component, or security observation."],
        ["recommendation",           "Recommended remediation steps to improve the security of the WordPress installation."]
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

    const ackText = "The findings presented in this report are based on observations made during the assessment period and represent the WordPress installation status at the time of scanning. This report contains confidential and proprietary information intended solely for the authorised recipient. Unauthorised disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.";
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(ackText, 14, y + 5, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });

    // Apply header & footer decorator to all pages
    applyHeaderFooterDecorator(doc, "WordPress Scanner");

    doc.save(`${domain}-WordPress-Scan-Report-${Date.now()}.pdf`);
  } catch (err) {
    console.error("Failed to generate WordPress Scanner PDF report:", err);
  }
};
