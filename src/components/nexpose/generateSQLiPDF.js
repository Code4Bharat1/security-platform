import { jsPDF } from "jspdf";
import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../utils/pdfFramework";

const sqliLookup = {
  "Boolean-Based": {
    impact: "Boolean-based SQL injection allows attackers to query database values by checking page response variations to true/false logical conditions, potentially exposing all database records.",
    recommendation: "Ensure all database input variables are parameterized or prepared statements are enforced to prevent SQL structural changes."
  },
  "Error-Based": {
    impact: "Error-based SQL injection allows attackers to force the database to output runtime errors containing table schemas, credentials, and data directly into responses.",
    recommendation: "Use parameterized queries, disable detailed database error messages in production environments, and use generic error logs."
  },
  "Time-Based Blind": {
    impact: "Time-based blind SQL injection allows attackers to infer database values by injecting time delays (e.g., SLEEP), enabling complete data extraction.",
    recommendation: "Enforce strictly parameterized queries across all database drivers and run static code analysis to verify input sterilization."
  },
  "Generic": {
    impact: "SQL Injection vulnerabilities allow unauthorized access to database servers, enabling attackers to read, modify, or delete database tables, bypass authentications, and execute arbitrary system commands.",
    recommendation: "Configure parameterization or prepared queries across all database connections and restrict database user permissions to least privilege."
  }
};

export const generateSQLiPDF = async (result = {}) => {
  const { employeeName, employeeMail } = getAuditorInfo();
  
  const now = new Date();
  const scanDate = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  const scanTime = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const targetUrl = result?.url || "—";
  const overallSecurityStatus = (result?.findings || []).length > 0 ? "Vulnerable" : "Secure";
  const vulnParamsCount = String((result?.findings || []).length);
  const totalPayloads = String(result?.payloadsAttempted || (result?.tests || []).length);
  const totalParams = "1";

  try {
    const doc = new jsPDF("p", "mm", "a4");

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 1 — COVER PAGE & ASSESSMENT INFORMATION
    // ══════════════════════════════════════════════════════════════════════
    
    // Top brand text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – SQLi Scanner", 14, 12);

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
    doc.text("SQLi SCANNER SECURITY ASSESSMENT REPORT", 105, 54, { align: "center" });

    // Divider below title block
    doc.line(14, 60, 196, 60);

    // Cover Page Table
    renderTable(doc, {
      startY: 65,
      body: [
        ["Assessment Performed by", employeeMail],
        ["Employee Name",           employeeName],
        ["Employee Mail ID",        employeeMail],
        ["Scanned URL",             targetUrl],
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
    // PAGE 2 — TOOL INFORMATION, SCAN SUMMARY & DETAILED FINDINGS
    // ══════════════════════════════════════════════════════════════════════
    doc.addPage();
    let y = drawSectionHeader(doc, "1. ASSESSMENT INFORMATION", 25);

    // Tool details
    renderTable(doc, {
      startY: y,
      body: [
        ["Tool Name",             "SQLi Scanner"],
        ["Tool Category",         "Web Application Security / SQL Injection Testing"],
        ["Methodology Alignment", "OWASP WSTG – OTG-INPVAL-005 (Testing for SQL Injection)"],
        ["Compliance Alignment",  "ISO/IEC 27001 │ AICPA SOC Frameworks"],
        ["Scanned URL",           targetUrl],
        ["Assessment Mode",       "Non-Intrusive / Automated Injection Probe"]
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
    const overviewText = "The SQLi Scanner tool performs automated SQL Injection assessments against target web application parameters by executing Boolean-based, Error-based, and Time-based blind injection techniques. For each test, the tool captures a baseline response to establish a normal application behaviour reference, then injects numbered payloads and evaluates response deviations including error pattern presence, response body differences, and measurable time delays. A confidence score is assigned to each finding based on the strength of evidence observed, ensuring that only substantiated results are escalated as confirmed vulnerabilities. The overall verdict consolidates individual finding risk scores into a single risk rating for the assessed target.";
    doc.text(overviewText, 14, y + 5, { maxWidth: 182, align: "left", lineHeightFactor: 1.45 });

    y += doc.getTextDimensions(overviewText, { maxWidth: 182 }).h + 12;

    doc.addPage();
    y = drawSectionHeader(doc, "2. SCAN SUMMARY", 25);

    renderTable(doc, {
      startY: y,
      head: [["Total Parameters Tested", "Total Payloads Executed", "Confirmed Vulnerable Parameters", "Overall Security Status"]],
      body: [[
        totalParams,
        totalPayloads,
        vulnParamsCount,
        overallSecurityStatus
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
        0: { cellWidth: 42 },
        1: { cellWidth: 42 },
        2: { cellWidth: 52 },
        3: { cellWidth: 46, fontStyle: "bold", textColor: overallSecurityStatus === "Vulnerable" ? C.red : [22, 163, 74] }
      }
    });

    y = doc.lastAutoTable.finalY + 8;

    // Assessment Result Details
    const vulnParamsList = (result?.findings || []).map(f => f.parameter || result?.paramName || "test").join(", ") || "None";
    const safeParamsList = (result?.findings || []).length > 0 ? "None" : (result?.paramName || "test");

    renderTable(doc, {
      startY: y,
      body: [
        ["SQLi Vulnerability Status", overallSecurityStatus],
        ["Injection Techniques Tested", "Boolean-Based | Error-Based | Time-Based Blind"],
        ["Confirmed Vulnerable Parameters", vulnParamsList],
        ["Safe Parameters",             safeParamsList]
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 }
      },
      didParseCell: (data) => {
        if (data.column.index === 1 && data.row.index === 0) {
          data.cell.styles.textColor = overallSecurityStatus === "Vulnerable" ? C.red : [22, 163, 74];
          data.cell.styles.fontStyle = "bold";
        }
      }
    });

    y = doc.lastAutoTable.finalY + 10;

    y = drawSectionHeader(doc, "3. DETAILED FINDINGS", y);

    const findings = result?.findings || [];
    if (findings.length === 0) {
      // Safe state check entry
      renderTable(doc, {
        startY: y,
        body: [
          ["Severity",         "Safe"],
          ["Security Check",   "SQL Injection Testing"],
          ["Status",           "Passed"],
          ["Affected Endpoint", targetUrl],
          ["Evidence",         "No active SQL injection indicators detected across all injected test payloads."],
          ["Impact",           "No SQL Injection risk identified. Database contents are secure against raw payload injections."],
          ["Recommendation",   "Maintain current input validation parameters. Periodically run structural scanning."]
        ],
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
          1: { cellWidth: 127 }
        },
        didParseCell: (data) => {
          if (data.column.index === 1 && data.row.index === 0) {
            data.cell.styles.textColor = [22, 163, 74];
            data.cell.styles.fontStyle = "bold";
          }
        }
      });
      y = doc.lastAutoTable.finalY + 8;
    } else {
      findings.forEach((f, idx) => {
        const severity = f.severity || "High";
        const technique = f.type || "Error-Based";
        const endpoint = targetUrl;
        const param = f.parameter || result?.paramName || "test";
        const payload = f.payload || "—";
        const httpStatus = String(f.status || f.responseStatus || "200");
        const respTime = String(f.timeMs || f.responseTime || "—");
        const evidence = f.evidence || "Observable database response signature mismatch.";

        const lookup = sqliLookup[technique] || sqliLookup["Generic"];
        const impact = lookup.impact;
        const recommendation = lookup.recommendation;

        if (297 - y < 90) {
          doc.addPage();
          y = 25;
        }

        renderTable(doc, {
          startY: y,
          body: [
            ["Severity",           severity],
            ["Injection Technique", technique],
            ["Affected Endpoint",   endpoint],
            ["Parameter Tested",    param],
            ["Injected Payload",    payload],
            ["HTTP Status",         httpStatus],
            ["Response Time (ms)",  respTime],
            ["Evidence / Observation", evidence],
            ["Impact",             impact],
            ["Recommendation",     recommendation]
          ],
          columnStyles: {
            0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
            1: { cellWidth: 127 }
          },
          didParseCell: (data) => {
            if (data.column.index === 1 && data.row.index === 0) {
              data.cell.styles.textColor = C.red;
              data.cell.styles.fontStyle = "bold";
            }
          }
        });

        y = doc.lastAutoTable.finalY + 8;
      });
    }

    // ══════════════════════════════════════════════════════════════════════
    // CONCLUSION & RECOMMENDATIONS & APPENDIX
    // ══════════════════════════════════════════════════════════════════════
    if (297 - y < 85) {
      doc.addPage();
      y = 25;
    }

    y = drawSectionHeader(doc, "4. CONCLUSION & RECOMMENDATIONS", y);

    const conclusionText = `The SQLi Scanner assessment executed Boolean-based, Error-based, and Time-based blind injection payload sets against all testable parameters of the target web application. A baseline response was recorded prior to each test series to establish a reference for response size, HTTP status code, and response time. Deviations from the baseline — including database error strings, response body differences, and measurable time delays — were evaluated alongside a confidence score to determine whether each finding constitutes a confirmed vulnerability.\n\nSQL Injection vulnerabilities represent a critical risk, enabling adversaries to extract, modify, or delete database contents; bypass authentication mechanisms; and, in certain configurations, execute operating system commands. Confirmed findings must be prioritised for immediate remediation. Findings with a lower confidence score should be validated through manual testing before treatment as confirmed vulnerabilities to avoid remediation effort based on false positives.\n\nIt is strongly recommended to replace all dynamic SQL query construction with parameterised queries or prepared statements across every database interaction layer. An ORM (Object-Relational Mapping) framework should be used where possible to abstract direct query composition. Database accounts used by the application should be granted least-privilege permissions, restricting access to only the tables and operations required for application function. Detailed database error messages must be suppressed in production environments and replaced with generic error responses to prevent error-based information leakage. All parameters identified as vulnerable in Section 3 must be remediated and validated through re-testing prior to production deployment.`;

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
        ["Total Parameters Tested",   "Total number of HTTP request parameters evaluated for SQL Injection vulnerabilities."],
        ["Total Payloads Executed",   "Total number of SQL Injection payloads executed during the assessment."],
        ["Injection Techniques Tested", "SQL Injection techniques applied during testing, including Error-Based, Union-Based, Boolean-Based Blind, Time-Based Blind, and Out-of-Band (if applicable)."],
        ["Confirmed Vulnerable Parameters", "Number or list of parameters confirmed to be vulnerable to SQL Injection."],
        ["Overall Security Status",   "Overall assessment of the application's SQL Injection security posture (Secure, Vulnerable, or Partially Vulnerable)."],
        ["SQL Injection Status",       "Indicates whether SQL Injection vulnerabilities were identified during the assessment."],
        ["Parameters in Scope",        "List of HTTP parameters included in the SQL Injection assessment."],
        ["Safe Parameters",            "Parameters that did not exhibit SQL Injection behavior during testing."],
        ["Severity",                   "Risk level assigned to the identified finding (Critical, High, Medium, Low, or Informational)."],
        ["Injection Technique",        "SQL Injection technique used to evaluate the target parameter."],
        ["Affected Endpoint",          "Target URL and endpoint where the SQL Injection payload was executed."],
        ["Parameter Tested",           "HTTP parameter evaluated for SQL Injection vulnerabilities."],
        ["Injected Payload",           "The SQL Injection payload used during testing."],
        ["HTTP Status",                "HTTP response code returned by the server after payload execution."],
        ["Response Time (ms)",         "Time taken by the server to respond after payload execution, used particularly for Time-Based Blind SQL Injection analysis."],
        ["Evidence / Observation",     "Observed indicators supporting the assessment, such as database error messages, response content differences, or response delays."],
        ["Impact",                     "Describes the potential consequences of a successful SQL Injection attack, including unauthorized database access, data disclosure, authentication bypass, data manipulation, or remote code execution in certain environments."],
        ["Recommendation",             "Specific, actionable remediation guidance aligned to the identified injection vulnerability and technique."]
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

    const ackText = "The findings presented in this report are based on observations made during the assessment period and represent the SQL injection vulnerability posture of the environment at the time of scanning. This report contains confidential and proprietary information intended solely for the authorised recipient. Unauthorised disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(ackText, 14, y + 5, { maxWidth: 182, align: "left", lineHeightFactor: 1.45 });

    // Apply header & footer decorator to all pages
    applyHeaderFooterDecorator(doc, "SQLi Scanner");

    doc.save(`SQLi-Scanner-Report-${Date.now()}.pdf`);
  } catch (err) {
    console.error("Failed to generate SQLi PDF report:", err);
  }
};
