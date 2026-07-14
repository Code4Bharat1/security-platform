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
const SECRET_GUIDANCE_MAP = {
  "Database Credentials": {
    impact: "Allows unauthorized access to target database storage systems, risking sensitive user data leakage, deletion, or manipulation.",
    remediation: "Immediately revoke database password keys, migrate credentials to secure environment variables, and restrict IP address connection rights."
  },
  "JWT Secret": {
    impact: "Enables attackers to forge valid cryptographic session signatures, leading to full session hijacking and authorization bypass.",
    remediation: "Generate a new high-entropy JWT secret key, update server environment configurations, and rotate active session hashes."
  },
  "AWS Access Key": {
    impact: "Provides full control over cloud computing environments, allowing server provisioning, data exfiltration, or billing abuse.",
    remediation: "Revoke key credentials on the cloud platform portal immediately, deploy IAM role policies, and configure automated secrets rotation."
  },
  "Stripe API Key": {
    impact: "Grants unauthorized access to billing accounts, customer details, and transaction capabilities, enabling financial fraud or data theft.",
    remediation: "Immediately revoke the Stripe API key in the Stripe Dashboard, issue a new key, and restrict key access permissions."
  },
  "GitHub Token": {
    impact: "Exposes private software repositories, deployment pipelines, and workflow automation settings to source-code manipulation or leakage.",
    remediation: "Revoke the personal access token (PAT) on GitHub settings, generate a new token with minimal scopes, and store it securely."
  },
  "OpenAI API Key": {
    impact: "Enables unauthorized third-party API consumption, leading to account budget exhaustion, service suspension, or prompt data access.",
    remediation: "Immediately deactivate the exposed API key in the OpenAI developer platform and issue a replacement token."
  },
  "Google API Key": {
    impact: "Enables unauthorized access to Google Cloud APIs, potentially leading to quota abuse, billing fraud, or restricted data access.",
    remediation: "Delete the exposed API key in the Google Cloud Console, generate a restricted replacement key, and restrict usage to specific HTTP referrers."
  },
  "Hardcoded Password": {
    impact: "Unprotected credential exposure allows authentication bypass, account takeover, privilege escalation, or unauthorized access to services.",
    remediation: "Rotate credentials immediately. Move secrets out of codebases into environment variables or dedicated secret stores."
  }
};

const getGuidance = (secretType, severity) => {
  const typeLower = (secretType || "").toLowerCase();
  for (const [key, val] of Object.entries(SECRET_GUIDANCE_MAP)) {
    if (typeLower.includes(key.toLowerCase()) || key.toLowerCase().includes(typeLower)) {
      return val;
    }
  }

  // Fallbacks based on severity
  if (severity === "Critical" || severity === "High") {
    return {
      impact: "High-risk credential exposure that compromises the integrity of critical user profiles, server databases, or administration consoles.",
      remediation: "Revoke the exposed key/password immediately, audit system access logs for anomalies, and migrate credentials to a secure environment vault."
    };
  } else {
    return {
      impact: "Low-to-medium risk credential leakage that expands the attack surface and exposes technical service parameters to attackers.",
      remediation: "Rotate and invalidate the token immediately. Store secrets in environment variables instead of hardcoding them in source files."
    };
  }
};

export const generateSecretKeyScannerPDF = async (results = [], validateOnline = false) => {
  const { employeeName, employeeMail } = getAuditorInfo();
  
  // Calculate counts strictly from the actual scan results
  const totalSecrets = results.length;
  const uniqueTypesList = Array.from(new Set(results.map(r => r.type).filter(Boolean)));
  const uniqueTypesCount = uniqueTypesList.length;
  const filesScanned = totalSecrets > 0 ? Array.from(new Set(results.map(r => r.file).filter(Boolean))).length || 1 : 0;
  
  const validationStatus = totalSecrets > 0 
    ? (results.some(r => r.validation?.status === "valid") ? "Valid Credentials Found" : "Not Verified / Unknown")
    : "No Secrets Found";
  
  let overallRisk = "Low";
  if (totalSecrets > 0) {
    if (results.some(r => r.severity === "Critical" || r.severity === "High")) {
      overallRisk = "High";
    } else if (results.some(r => r.severity === "Medium")) {
      overallRisk = "Medium";
    }
  }

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
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – Secret Key Scanner", 14, 12);

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
    doc.text("SECRET KEY SCANNER", 105, 54, { align: "center" });

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
        ["Scanned Target",          totalSecrets > 0 ? (results[0].file || "Submitted Source Code") : "Code Snippet / Config File"],
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
        ["Tool Name",             "Secret Key Scanner"],
        ["Tool Category",          "Sensitive Data Exposure / Credential Leakage Detection"],
        ["Methodology Alignment", "OWASP WSTG – OTG-CONFIG / CWE-312 / CWE-798 / OWASP Top 10 – A02"],
        ["Compliance Alignment",  "ISO/IEC 27001 │ AICPA SOC Frameworks"],
        ["Scanned Target",         totalSecrets > 0 ? (results[0].file || "Submitted Source Code") : "Code Snippet / Config File"],
        ["Assessment Mode",        "Non-Intrusive / Static Pattern Analysis"],
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

    const overviewText = "The Secret Key Scanner performs static pattern-based analysis against submitted source code files or repositories to detect hardcoded sensitive credentials and secret material. The tool identifies database credentials, email account passwords, JWT secrets, cloud service credentials, and generic API keys embedded directly within source code. Each detected secret is reported with its type, the affected file and line reference, a partially redacted value for verification, and the applicable severity rating. Early detection of hardcoded secrets prevents credential exposure through public repository leaks, insider threats, or supply chain attacks, and supports enforcement of secure development practices across the software development lifecycle.";
    
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
      head: [["Files Scanned", "Total Secrets Detected", "Unique Secret Types", "Validation Status", "Overall Risk Rating"]],
      body: [[
        String(filesScanned),
        String(totalSecrets),
        String(uniqueTypesCount),
        validationStatus,
        overallRisk.toUpperCase()
      ]],
      headStyles: { fillColor: C.bgHeader, textColor: C.white, halign: "center" },
      bodyStyles: { halign: "center", fontStyle: "bold" },
      columnStyles: {
        4: { textColor: overallRisk === "High" ? C.red : overallRisk === "Medium" ? C.amber : C.blue }
      }
    });
    y = doc.lastAutoTable.finalY + 10;

    // 3. Detailed Findings
    y = drawSectionHeader(doc, "3. DETAILED FINDINGS", y);

    if (totalSecrets > 0) {
      // Loop over secrets to print their individual details
      for (const secret of results) {
        if (y > 220) {
          doc.addPage();
          y = 25;
        }

        const guidance = getGuidance(secret.type, secret.severity);

        renderTable(doc, {
          startY: y,
          head: [],
          body: [
            ["Severity",      safe(secret.severity, "Low")],
            ["Secret Type",   safe(secret.type)],
            ["File",          safe(secret.file || "Code Snippet")],
            ["Line Number",   String(secret.line || "—")],
            ["Redacted Value",safe(secret.redacted || secret.secret)],
            ["Validation Status", safe(secret.validation?.status || "unknown")],
            ["Impact",        guidance.impact],
            ["Recommendation",guidance.remediation],
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
          ["Secret Type",       "None"],
          ["File",              "No Evidence Found"],
          ["Line Number",       "No Applicable Data"],
          ["Redacted Value",    "None"],
          ["Validation Status", "Not Detected"],
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

    const conclusionText = `The Secret Key Scanner assessment identified a total of ${totalSecrets} hardcoded secrets across ${filesScanned} files, comprising ${uniqueTypesCount} unique secret types including database credentials, cloud service credentials, JWT secrets, and API keys. All detected secrets represent a direct credential exposure risk and must be treated as compromised regardless of current deployment status.\n\nIt is recommended that all identified secrets be immediately rotated and revoked. Hardcoded credentials must be removed from source code and replaced with environment variables or a dedicated secrets management solution. Repository history should be purged or access-restricted where secrets may have been previously committed. A pre-commit hook or CI/CD pipeline integration should be enforced to prevent future secret exposure at the point of code submission. Identical secrets appearing across multiple files should be deduplicated and consolidated under a single managed credential reference.`;

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
        ["File Scanned",         "Total number of source files, repositories, or configuration files processed during the credential scanning assessment."],
        ["Total Secrets Detected","Total number of exposed credentials and sensitive values identified during the scan."],
        ["Unique Secret Types",  "Number of distinct credential categories detected across all findings."],
        ["Validation Status",    "Overall verification status of detected credentials following optional provider validation (Valid, Invalid, Unknown, or Not Verified)."],
        ["Overall Risk Rating",  "Overall security posture determined by the number, severity, and types of exposed secrets identified during the assessment."],
        ["Severity",             "Risk level assigned to the detected credential (Critical, High, Medium, Low, or Informational)."],
        ["Secret Type",          "Classification of the detected credential or secret (e.g., AWS Access Key, JWT Secret, GitHub Token, Stripe Secret Key, OpenAI API Key, Google API Key, Generic API Key, Hardcoded Password)."],
        ["File / Location",      "File name, repository path, or code snippet location where the exposed credential was detected."],
        ["Line Number",          "Exact line number within the source file where the secret was identified."],
        ["Redacted Value",       "Partially masked representation of the detected credential used for secure identification without exposing the complete secret."],
        ["Validation Status",    "Indicates whether the credential was successfully verified against the corresponding provider or whether its status remains unknown or unverified."],
        ["Impact",               "Describes the potential security risks associated with the exposed credential, including unauthorized access, account takeover, data disclosure, privilege escalation, financial abuse, or service compromise."],
        ["Recommendation",       "Recommended remediation actions, such as immediate credential revocation and rotation, removal of hardcoded secrets, migration to environment variables or secret management solutions, and implementation of automated secret scanning within the CI/CD pipeline."],
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

    const ackText = "The findings presented in this report are based on observations made during the assessment period and represent the credential exposure status of the submitted source code at the time of analysis. This report contains confidential and proprietary information intended solely for the authorised recipient. Unauthorised disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...C.textMain);
    doc.text(ackText, 14, y, { maxWidth: 182, lineHeightFactor: 1.35 });

    // Apply header & footer decorator
    applyHeaderFooterDecorator(doc, "Secret Key Scanner");

    const pad = (n) => String(n).padStart(2, "0");
    const dStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    
    doc.save(`Secret_Key_Scanner_Report_${dStr}.pdf`);

  } catch (err) {
    console.error("Failed to generate Secret Key Scanner PDF:", err);
  }
};
