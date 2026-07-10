import { jsPDF } from "jspdf";
import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../utils/pdfFramework";

// Helper to dynamically analyze code contexts for findings
const analyzeFinding = (code, issue) => {
  const lineNum = issue.line;
  const lines = code ? code.split("\n") : [];
  
  // Extract Code Snippet (2 lines before, current line, 2 lines after)
  const startIdx = Math.max(0, lineNum - 3);
  const endIdx = Math.min(lines.length - 1, lineNum + 1);
  const snippetLines = [];
  for (let i = startIdx; i <= endIdx; i++) {
    snippetLines.push({
      num: i + 1,
      text: lines[i] || "",
      isTarget: (i + 1) === lineNum
    });
  }

  // Taint Flow and dynamic analysis
  const targetLine = lines[lineNum - 1] || "";
  let taintFlow = "External Source -> [Input] -> RegExp Constructor";
  let isFalsePositive = "Unlikely";
  let confidence = "High";
  let exploitability = "High";
  let cwe = "CWE-20: Improper Input Validation";
  let owasp = "A03:2021-Injection";
  let category = "Input Validation / Dynamic Regex";
  let references = [
    "OWASP A03:2021 - Injection (https://owasp.org/Top10/A03_2021-Injection/)",
    "CWE-20 (https://cwe.mitre.org/data/definitions/20.html)",
    "MDN RegExp (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp)"
  ];
  let scanSummaryExplanation = `Vulnerable dynamic regular expression construction detected on line ${lineNum}.`;
  
  // Match RegExp argument
  const regExpMatch = targetLine.match(/new\s+RegExp\s*\(([^)]+)\)/);
  let beforeCode = targetLine.trim();
  let afterCode = targetLine.trim();
  let fixAvailable = false;
  
  if (regExpMatch) {
    const arg = regExpMatch[1].trim();
    
    // Check if literal or already sanitized
    const isStringLiteral = /^(['"`]).*\1$/.test(arg) || /^\d+$/.test(arg);
    const isSanitized = /\.replace|\.escape|escape/.test(targetLine) || 
      (lineNum > 1 && (lines[lineNum - 2]?.includes(".replace") || lines[lineNum - 2]?.includes("escape")));
      
    if (isStringLiteral) {
      isFalsePositive = "Likely (Static String Literal)";
      confidence = "Low";
      exploitability = "Low";
      scanSummaryExplanation = `Dynamic RegExp constructor is initialized with a static string literal '${arg}' on line ${lineNum}, which is safe.`;
    } else if (isSanitized) {
      isFalsePositive = "Likely (Sanitization/Escape Detected)";
      confidence = "Low";
      exploitability = "Low";
      scanSummaryExplanation = `RegExp constructor on line ${lineNum} uses an escaped or sanitized variable.`;
    } else {
      isFalsePositive = "Unlikely";
      confidence = "High";
      exploitability = "High";
      scanSummaryExplanation = `The user-controlled variable '${arg}' is passed unescaped to the RegExp constructor on line ${lineNum}, leading to potential Regex Injection.`;
      
      // Auto-fix generation
      afterCode = targetLine.replace(arg, `${arg}.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&')`);
      fixAvailable = true;
    }
    
    // Trace taint flow backwards
    let sourceLineIndex = -1;
    let sourceText = "External Input";
    for (let j = lineNum - 2; j >= 0; j--) {
      const prevLine = lines[j] || "";
      if (prevLine.includes(arg) && (prevLine.includes("=") || prevLine.includes("const ") || prevLine.includes("let ") || prevLine.includes("var "))) {
        sourceLineIndex = j + 1;
        sourceText = prevLine.trim();
        break;
      }
    }
    
    if (sourceLineIndex !== -1) {
      taintFlow = `${sourceText} (Line ${sourceLineIndex}) -> Taint: ${arg} -> Sink: new RegExp(${arg}) (Line ${lineNum})`;
    } else {
      taintFlow = `Source: User Parameter -> Taint: ${arg} -> Sink: new RegExp(${arg}) (Line ${lineNum})`;
    }
  } else {
    // If not a RegExp constructor, check for ReDoS/Permissive patterns
    const isReDos = /ReDoS|catastrophic|backtracking/i.test(issue.risk);
    const isPermissive = /permissive/i.test(issue.risk);
    
    if (isReDos) {
      cwe = "CWE-1333: Inefficient Regular Expression Complexity";
      owasp = "A05:2021-Security Misconfiguration";
      category = "Denial of Service / ReDoS";
      exploitability = "Medium";
      confidence = "High";
      scanSummaryExplanation = `The regular expression pattern on line ${lineNum} contains complex or nested quantifiers vulnerable to catastrophic backtracking.`;
      references = [
        "OWASP A05:2021 - Security Misconfiguration",
        "CWE-1333 (https://cwe.mitre.org/data/definitions/1333.html)",
        "MDN RegExp (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)"
      ];
    } else if (isPermissive) {
      cwe = "CWE-20: Improper Input Validation";
      owasp = "A04:2021-Insecure Design";
      category = "Permissive Validation";
      exploitability = "Medium";
      confidence = "Medium";
      scanSummaryExplanation = `The regular expression on line ${lineNum} lacks strict start/end anchors.`;
      references = [
        "OWASP A04:2021 - Insecure Design",
        "CWE-20 (https://cwe.mitre.org/data/definitions/20.html)"
      ];
    }
  }

  return {
    snippetLines,
    taintFlow,
    isFalsePositive,
    confidence,
    exploitability,
    cwe,
    owasp,
    category,
    references,
    scanSummaryExplanation,
    beforeCode,
    afterCode,
    fixAvailable
  };
};

// Static mapping for regex risk/severity impacts
const getFindingImpact = (risk) => {
  const r = String(risk || "").toLowerCase();
  if (r.includes("unescaped")) {
    return "Passing unescaped user input directly into RegExp constructors enables Regex Injection attacks and exposes the application to denial-of-service vectors.";
  }
  if (r.includes("redos") || r.includes("catastrophic") || r.includes("backtracking")) {
    return "Nested quantifiers or overlapping patterns can trigger catastrophic backtracking, consuming CPU resources exponentially and causing service outages.";
  }
  if (r.includes("permissive")) {
    return "Overly permissive regex patterns can bypass input sanitization controls, letting malicious payloads through to downstream database or execution layers.";
  }
  return "Insecure regex pattern implementation that may weaken input validation or expose the application to denial of service.";
};

const getFindingRemediation = (risk) => {
  const r = String(risk || "").toLowerCase();
  if (r.includes("unescaped")) {
    return "Sanitize user input before constructing dynamic RegExp instances. Use a secure escape function: input.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&').";
  }
  if (r.includes("redos") || r.includes("catastrophic") || r.includes("backtracking")) {
    return "Refactor the regular expression to eliminate nested or overlapping quantifiers (e.g., (a+)+). Restrict maximum input lengths and enforce match timeouts.";
  }
  if (r.includes("permissive")) {
    return "Tighten the pattern match boundaries (use ^ and $ anchors) and explicitly define strict character whitelists instead of using generic wildcards (.*).";
  }
  return "Review regular expression patterns against secure coding guidelines and replace dynamic regex building with static predefined lists where possible.";
};

export const generateRegexPDF = async (results, code = "", targetUrl = "Static Source Code Scan", setPdfProgress) => {
  if (setPdfProgress) setPdfProgress("Initializing PDF document...");

  const { employeeName, employeeMail } = getAuditorInfo();

  try {
    const doc = new jsPDF("p", "mm", "a4");

    // Dates
    const scanDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
    const scanTime = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    // Helper to extract lines/patterns scanned
    const codeLinesCount = code ? code.split("\n").length : 0;
    const filesScannedText = codeLinesCount > 0 ? `1 Source File (${codeLinesCount} Lines)` : "1 Source File";

    // Count RegExp definitions in the scanned code as "Regex Patterns Detected"
    const regexMatch = code ? code.match(/new\s+RegExp|\|\s*\/.*\/[gimy]*\b/g) : null;
    const regexPatternsCount = regexMatch ? regexMatch.length : Math.max(1, results.length);

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
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – Regex Security Validator", 105, 12, { align: "center" });

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
    doc.setFontSize(18);
    doc.setTextColor(...C.bluePrimary);
    doc.text("REGEX SECURITY VALIDATOR SECURITY ASSESSMENT", 105, 58, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("REPORT", 105, 65, { align: "center" });

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
        ["Scanned URL",            targetUrl],
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

    // Tool details grid header label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Tool Details", 14, y);
    y += 5;

    // Tool details grid
    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Tool Name",             "Regex Security Validator"],
        ["Tool Category",         "Input Validation / Pattern Security Analyser"],
        ["Methodology Alignment", "OWASP WSTG – OTG-CONFIG / Client-Side Testing"],
        ["Compliance Alignment",  "ISO/IEC 27001 | AICPA SOC Frameworks"],
        ["Scanned URL",           targetUrl],
        ["Assessment Mode",       "Non-Intrusive / Automated Pattern Analysis"]
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
    const overviewText = "The Regex Security Validator analyzes regular expression patterns used within application source code to identify insecure implementations that may introduce security risks such as Regex Injection, Regular Expression Denial of Service (ReDoS), catastrophic backtracking, overly permissive expressions, and improper input validation. The assessment also evaluates dynamic regular expression construction, user-controlled regex usage, sanitization practices, and secure regex implementation against industry best practices.";

    doc.text(overviewText, 14, y + 6, { maxWidth: 182, align: "justify", lineHeightFactor: 1.45 });

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 3 — SCAN SUMMARY & DETAILED FINDINGS
    // ══════════════════════════════════════════════════════════════════════
    if (setPdfProgress) setPdfProgress("Building scan findings...");
    doc.addPage();

    y = drawSectionHeader(doc, "2. SCAN SUMMARY", 25);

    const issuesCount = results.length;
    const isSuccess = issuesCount === 0;

    // Render Scan Summary table
    renderTable(doc, {
      startY: y,
      head: [["Files / Patterns Scanned", "Regex Patterns Detected", "Validation Status"]],
      body: [[
        filesScannedText,
        String(regexPatternsCount),
        isSuccess ? "Pass" : "Fail"
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
        0: { textColor: C.textMain },
        1: { textColor: C.bluePrimary },
        2: { textColor: isSuccess ? [16, 185, 129] : C.red }
      }
    });

    y = doc.lastAutoTable.finalY + 10;

    // Section 3: Detailed findings
    y = drawSectionHeader(doc, "3. DETAILED FINDINGS", y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Findings", 14, y);
    y += 5;

    if (issuesCount > 0) {
      results.forEach((issue, idx) => {
        // Prevent layout overflow.
        if (297 - y < 85) {
          doc.addPage();
          y = 25;
        }

        // Run deep code parsing for advanced mappings
        const parsed = analyzeFinding(code, issue);

        // Extract severity
        const riskMsg = issue.risk || "Unescaped user input";
        let severity = "Medium";
        if (/ReDoS/i.test(riskMsg)) severity = "High";
        else if (/Unescaped|Template/i.test(riskMsg)) severity = "Medium";
        else severity = "Low";

        // Construct code snippet string
        const snippetText = parsed.snippetLines.map(sl => 
          `${sl.isTarget ? '>> ' : '   '} L${sl.num}: ${sl.text}`
        ).join('\n');

        // Construct comparative recommendation text
        let recText = getFindingRemediation(issue.risk);
        if (parsed.fixAvailable) {
          recText += `\n\n[BEFORE FIX]\n${parsed.beforeCode}\n\n[AFTER FIX]\n${parsed.afterCode}`;
        }

        // Detailed Scan Result Summary with explanation and references
        const summaryText = `${parsed.scanSummaryExplanation}\nDetected dynamic RegExp instantiation using the unescaped variable. References:\n${parsed.references.map(r => '• ' + r).join('\n')}`;

        renderTable(doc, {
          startY: y,
          head: [],
          body: [
            ["Severity",              `${severity.toUpperCase()} (Confidence: ${parsed.confidence} | Exploitability: ${parsed.exploitability} | FP Check: ${parsed.isFalsePositive})`],
            ["Pattern Type/Category", `${parsed.category} (CWE: ${parsed.cwe.split(":")[0]} | OWASP: ${parsed.owasp})`],
            ["Pattern / Key",         `Pattern: ${safe(issue.pattern)}\n\nTaint Flow:\n${parsed.taintFlow}\n\nCode Snippet:\n${snippetText}`],
            ["Source File",           `Static Code Input (Line ${issue.line})`],
            ["Issue Detected",        safe(issue.risk)],
            ["Impact",                getFindingImpact(issue.risk)],
            ["Recommendation",        recText],
            ["Scan Result Summary",   summaryText]
          ],
          columnStyles: {
            0: { fontStyle: "bold", cellWidth: 40, fillColor: [245, 245, 245] },
            1: { cellWidth: 142 }
          },
          styles: {
            font: "helvetica",
            fontSize: 8,
          },
          didParseCell: (data) => {
            // Apply monospaced font to Pattern / Key and Recommendation codes
            if (data.column.index === 1) {
              if (data.row.index === 0) {
                const sev = severity.toUpperCase();
                data.cell.styles.textColor = sev === "HIGH" ? C.red : sev === "MEDIUM" ? C.amber : C.blue;
                data.cell.styles.fontStyle = "bold";
              }
              if (data.row.index === 2 || data.row.index === 6) {
                data.cell.styles.font = "courier";
                data.cell.styles.fontSize = 7.5;
              }
            }
          }
        });

        y = doc.lastAutoTable.finalY + 8;
      });
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(...C.gray);
      doc.text("No vulnerable regular expression patterns identified.", 14, y + 4);
      y += 12;
    }

    // Check remaining space before drawing Section 4. If space is less than 60mm, add new page.
    if (297 - y < 60) {
      doc.addPage();
      y = 25;
    }

    // Draw Section 4: Conclusion & recommendations
    y = drawSectionHeader(doc, "4. CONCLUSION & RECOMMENDATIONS", y);

    const conclusionText = `The Regex Security Validator analyzed the supplied source code and evaluated all detected regular expression patterns for security weaknesses. The assessment identified ${issuesCount} vulnerable regex patterns, including potential Regex Injection, ReDoS, dynamic regular expression construction, and overly permissive expressions. Patterns that failed validation should be reviewed and remediated to reduce the risk of application compromise and denial-of-service attacks.`;

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
        ["Files / Patterns Scanned", "Total number of source files and regular expression patterns analyzed during the assessment."],
        ["Regex Detected",  "Total number of regular expression patterns identified within the scanned source code."],
        ["Validation Status",        "Overall outcome of the scan indicating whether the analyzed patterns passed or failed the security validation (Pass / Fail)."],
        ["Severity",                 "Risk level assigned to the identified issue based on its potential security impact (Critical, High, Medium, Low, Informational)."],
        ["Pattern Type / Category",  "Classification of the regular expression based on its purpose or usage, such as Email Validation, URL Validation, Password Validation, Input Sanitization, or Dynamic Regex."],
        ["Pattern / Key",            "The regular expression pattern or relevant code snippet identified during the assessment."],
        ["Source File",              "Name or path of the source code file containing the identified regular expression pattern."],
        ["Issue Detected",           "The specific security issue identified, such as Regex Injection, Regular Expression Denial of Service (ReDoS), Catastrophic Backtracking, Missing Input Sanitization, or Overly Permissive Regex."],
        ["Impact",                   "Describes the potential security and operational consequences of the identified issue if left unaddressed."],
        ["Recommendation",           "Suggested remediation steps and secure coding practices to mitigate the identified security issue."],
        ["Scan Result Summary",      "A concise summary of the scan outcome for the finding, including the validation result and key observations."]
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

    const ackText = "The findings presented in this report are based on observations made during the assessment period and represent the regex pattern security validation status of the environment at the time of scanning. This report contains confidential and proprietary information intended solely for the authorized recipient. Unauthorized disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMain);
    doc.text(ackText, 14, y + 6, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });

    // Apply header & footer decorator to all pages
    applyHeaderFooterDecorator(doc, "Regex Security Validator");

    if (setPdfProgress) setPdfProgress("Saving PDF...");
    doc.save(`Regex-Security-Validator-Report-${Date.now()}.pdf`);
  } catch (err) {
    console.error("Failed to generate Regex PDF report:", err);
  } finally {
    if (setPdfProgress) setPdfProgress(null);
  }
};
