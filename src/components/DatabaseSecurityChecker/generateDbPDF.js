import { jsPDF } from "jspdf";
import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../utils/pdfFramework";

// Helper to map dynamic security impacts
const getFindingImpact = (message) => {
  const msg = String(message || "").toLowerCase();
  if (msg.includes("port mismatch")) {
    return "Standard port mismatch allows potential database service fingerprinting or configuration confusion by unauthorized scanners.";
  }
  if (msg.includes("non-standard port")) {
    return "Running database services on non-standard ports might obscure them from automated discovery but does not prevent targeted port scans.";
  }
  if (msg.includes("open port") || msg.includes("exposed")) {
    return "Direct public exposure of the database port allows remote threat actors to attempt credential cracking, brute force attacks, or exploit software vulnerabilities.";
  }
  if (msg.includes("port") && msg.includes("closed")) {
    return "No security impact. Database port is secure and inaccessible from public scanning nodes.";
  }
  if (msg.includes("authentication")) {
    return "Unauthenticated or weak database access controls allow unauthorized actors to execute arbitrary commands, read sensitive tables, and corrupt databases.";
  }
  if (msg.includes("ssl/tls") || msg.includes("ssl")) {
    return "Cleartext traffic transmits database commands and user credentials unencrypted, allowing eavesdropping and Man-in-the-Middle (MitM) credential harvesting.";
  }
  if (msg.includes("encryption at rest") || msg.includes("encryption")) {
    return "Lack of data-at-rest encryption allows actors with physical storage access or backup file access to extract database tables and configurations directly.";
  }
  return "Potential security configuration weakness that could increase the database attack surface.";
};

// Helper to map dynamic security recommendations
const getFindingRemediation = (message) => {
  const msg = String(message || "").toLowerCase();
  if (msg.includes("port mismatch")) {
    return "Verify database settings. Ensure the connection string and port map align with the standard service configurations.";
  }
  if (msg.includes("non-standard port")) {
    return "Confirm that firewall policies and network segment protections are applied to the database service running on the custom port.";
  }
  if (msg.includes("open port") || msg.includes("exposed")) {
    return "Restrict the database service binding address to localhost (127.0.0.1) or allow only specific IP addresses via host-based firewalls.";
  }
  if (msg.includes("port") && msg.includes("closed")) {
    return "No remediation required. Maintain current network ACL configurations.";
  }
  if (msg.includes("authentication")) {
    return "Enable database-level authentication, disable default/anonymous account profiles, and enforce complex passwords across all profiles.";
  }
  if (msg.includes("ssl/tls") || msg.includes("ssl")) {
    return "Configure TLS/SSL in the database server daemon settings and require client-side encryption certificates for connection validation.";
  }
  if (msg.includes("encryption at rest") || msg.includes("encryption")) {
    return "Activate database storage encryption (e.g. WiredTiger encryption in MongoDB, transparent data encryption in MySQL/MSSQL) for all active volumes.";
  }
  return "Review configuration standards and CIS Benchmarks for this database engine version.";
};

export const generateDbPDF = async (scanResult, setPdfProgress) => {
  if (!scanResult) return;
  if (setPdfProgress) setPdfProgress("Initializing PDF document...");

  const { employeeName, employeeMail } = getAuditorInfo();

  try {
    const doc = new jsPDF("p", "mm", "a4");
    const host = safe(scanResult.host, "Unknown Host");
    const port = safe(scanResult.port, "Unknown Port");
    const targetInput = `${host}:${port}`;
    const dbType = safe(scanResult.dbType, "Database");
    
    // Dates
    const scanDate = scanResult.createdAt
      ? new Date(scanResult.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()
      : new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
    const scanTime = scanResult.createdAt
      ? new Date(scanResult.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      : new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

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
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – Database Security Checker", 14, 12);

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
    doc.setFontSize(20);
    doc.setTextColor(...C.bluePrimary);
    doc.text("DATABASE SECURITY CHECKER", 105, 58, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("SECURITY ASSESSMENT REPORT", 105, 65, { align: "center" });

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
        ["Target / Input",         targetInput],
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
    // PAGE 2 — ASSESSMENT INFORMATION
    // ══════════════════════════════════════════════════════════════════════
    if (setPdfProgress) setPdfProgress("Building assessment information...");
    doc.addPage();

    let y = drawSectionHeader(doc, "1. ASSESSMENT INFORMATION", 25);

    // Tool details grid
    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Tool Name",             "Database Security Checker"],
        ["Tool Category",         "Database Security Assessment / Configuration Review"],
        ["Methodology Alignment", "OWASP WSTG – OTG-INPVAL / CIS Database Benchmarks / CWE-284 / CWE-306"],
        ["Compliance Alignment",  "ISO/IEC 27001 │ AICPA SOC Frameworks"],
        ["Target / Input",        targetInput],
        ["Assessment Mode",       "Non-Intrusive / Automated Configuration Check"]
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 }
      }
    });

    y = doc.lastAutoTable.finalY + 12;

    // Tool Overview Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Tool Overview", 14, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMain);
    const overviewText = "The Database Security Checker assesses the security configuration of a target database instance by connecting to the specified host and port and evaluating exposure, authentication enforcement, and database type identification. The tool reports the identified database engine, connection details, and an overall security score, along with a count of identified issues. Findings are returned with a type and message describing the result of each check performed, and suggestions are provided where applicable. Results support identification of misconfigured or exposed database services that may be exploitable through unauthenticated access, privilege escalation, or direct network exposure.";
    
    // Print description text
    doc.text(overviewText, 14, y + 6, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 3 — SCAN SUMMARY & DETAILED FINDINGS
    // ══════════════════════════════════════════════════════════════════════
    if (setPdfProgress) setPdfProgress("Building scan findings...");
    doc.addPage();

    y = drawSectionHeader(doc, "2. SCAN SUMMARY", 25);

    // Score metrics
    const scoreVal = scanResult.securityScore ?? 100;
    const issuesVal = scanResult.issues ?? 0;
    const isSuccess = issuesVal === 0;
    const scoreText = scoreVal === "N/A" ? "N/A" : `${scoreVal}/100`;

    // Render Scan Summary table
    renderTable(doc, {
      startY: y,
      head: [["Status", "Security Score", "Issues Found"]],
      body: [[
        isSuccess ? "Success" : "Warning",
        scoreText,
        String(issuesVal)
      ]],
      headStyles: {
        fillColor: C.bgHeader,
        textColor: C.white,
        halign: "center",
      },
      bodyStyles: {
        halign: "center",
        fontStyle: "bold",
        fontSize: 10,
      },
      columnStyles: {
        0: { textColor: isSuccess ? [16, 185, 129] : C.amber },
        1: { textColor: C.bluePrimary },
        2: { textColor: issuesVal > 0 ? C.red : [16, 185, 129] }
      }
    });

    y = doc.lastAutoTable.finalY + 10;

    // Section 3: Detailed findings
    y = drawSectionHeader(doc, "3. DETAILED FINDINGS", y);

    const findings = scanResult.findings || [];
    if (findings.length > 0) {
      findings.forEach((f, idx) => {
        // Prevent layout overflow. If remaining page space < 75mm, add new page.
        if (297 - y < 75) {
          doc.addPage();
          y = 25;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...C.bluePrimary);
        doc.text(`Finding ${idx + 1}`, 14, y);
        y += 4;

        renderTable(doc, {
          startY: y,
          head: [],
          body: [
            ["Target / Input",      targetInput],
            ["Status",              f.type === "warning" ? "WARNING" : "SUCCESS"],
            ["Database Type",       dbType],
            ["Host",                host],
            ["Port",                port],
            ["Username",            safe(scanResult.username)],
            ["Findings",            safe(f.message)],
            ["Impact",              getFindingImpact(f.message)],
            ["Remediation",         getFindingRemediation(f.message)]
          ],
          columnStyles: {
            0: { fontStyle: "bold", cellWidth: 40, fillColor: [245, 245, 245] },
            1: { cellWidth: 142 }
          },
          didParseCell: (data) => {
            if (data.column.index === 1 && data.row.index === 1) {
              data.cell.styles.textColor = data.cell.raw === "WARNING" ? C.red : [16, 185, 129];
              data.cell.styles.fontStyle = "bold";
            }
          }
        });

        y = doc.lastAutoTable.finalY + 8;
      });
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(...C.gray);
      doc.text("No database checks or configuration findings available.", 14, y + 4);
      y += 12;
    }

    // Check remaining space before drawing Section 4. If space is less than 65mm, add new page.
    if (297 - y < 65) {
      doc.addPage();
      y = 25;
    }

    // Draw Section 4: Conclusion & recommendations
    y = drawSectionHeader(doc, "4. CONCLUSION & RECOMMENDATIONS", y);

    const authStatus = scanResult.authStatus || "N/A";
    const exposureScope = scanResult.exposureScope || "N/A";

    const conclusionText = `The Database Security Checker assessment connected to ${targetInput} and identified the database as ${dbType} with an overall security score of ${scoreText} and ${issuesVal} issue(s) identified. The authentication status was determined to be ${authStatus} with an exposure scope of ${exposureScope}. Reported findings indicate key configurations around port access, client encryption, and role configurations. Where issues are identified, they must be prioritised for remediation based on their associated severity and exposure scope.

It is recommended that authentication be enforced on all database interfaces without exception. Database services should not be exposed directly to public-facing network segments; access must be restricted to authorised internal hosts through firewall rules or network segmentation controls. The principle of least privilege should be applied to all database accounts, and default or anonymous accounts must be disabled. Suggestions returned by the tool should be reviewed and actioned in full. Regular configuration audits against CIS Database Benchmarks should be scheduled to detect and remediate configuration drift.`;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMain);
    doc.text(conclusionText, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.45 });

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 4 — APPENDIX
    // ══════════════════════════════════════════════════════════════════════
    if (setPdfProgress) setPdfProgress("Building appendix...");
    doc.addPage();

    y = drawSectionHeader(doc, "5. APPENDIX", 25);

    // Column Reference Guide Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Column Reference Guide", 14, y);

    // Render reference guide table
    renderTable(doc, {
      startY: y + 5,
      head: [["Column", "Description"]],
      body: [
        ["Severity",      "Risk level assigned to the finding: Critical | High | Medium | Low | Informational."],
        ["Target / Input", "The database host and port submitted for analysis (e.g. 127.0.0.1:27017)."],
        ["Scan Date",     "The date and time at which the assessment was performed."],
        ["Status",        "The result status of the scan check: Success / Warning."],
        ["Database Type", "The database engine identified on the target host (e.g., MongoDB, MySQL, PostgreSQL, MSSQL, Redis)."],
        ["Host",          "The IP address or hostname of the target database server."],
        ["Port",          "The network port on which the database service was identified."],
        ["Username",      "The account identifier associated with the scan session or database connection, where applicable."],
        ["Security Score","A numeric score (0-100) representing the overall security posture of the database instance based on evaluated checks."],
        ["Findings",      "The result(s) of individual checks performed against the database, including the check type and a descriptive message (e.g. 'Port 27017 is closed')."],
        ["Impact",        "Concise risk statement describing the potential security impact of the identified database configuration."],
        ["Remediation",   "Specific, actionable guidance to remediate the identified database security finding."]
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 45, fillColor: [245, 245, 245] },
        1: { cellWidth: 137 }
      }
    });

    y = doc.lastAutoTable.finalY + 12;

    // Acknowledgement Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Acknowledgement", 14, y);

    const ackText = "The findings presented in this report are based on observations made during the assessment period and represent the database security posture of the target environment at the time of scanning. This report contains confidential and proprietary information intended solely for the authorised recipient. Unauthorised disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMain);
    doc.text(ackText, 14, y + 6, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });

    // Apply header & footer decorator to all pages
    applyHeaderFooterDecorator(doc, "Database Security Checker");

    if (setPdfProgress) setPdfProgress("Saving PDF...");
    doc.save(`${host}-DB-Report-${Date.now()}.pdf`);
  } catch (err) {
    console.error("Failed to generate DB PDF report:", err);
  } finally {
    if (setPdfProgress) setPdfProgress(null);
  }
};
