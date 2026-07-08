import { jsPDF } from "jspdf";
import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
  getSeverityColor,
} from "../../utils/pdfFramework";

// Dynamic lookup maps will be defined inside generateJWTPDF to support varying key lengths and algorithms.

// Truncate long JWT token strings to prevent layout overflow in tables
const truncateToken = (token) => {
  if (!token) return "—";
  const clean = String(token).trim();
  if (clean.length <= 40) return clean;
  return `${clean.substring(0, 15)}...[truncated]...${clean.substring(clean.length - 15)}`;
};

export const generateJWTPDF = async (result, algorithm, token, secret, setPdfProgress) => {
  if (!result) return;
  if (setPdfProgress) setPdfProgress("Initializing JWT PDF Report...");

  const { employeeName, employeeMail } = getAuditorInfo();
  const header = result.header || {};
  const payload = result.payload || {};

  const alg = String(header.alg || algorithm || "HS256").toUpperCase();
  const bits = alg.endsWith("384") ? "384" : alg.endsWith("512") ? "512" : "256";
  const reqBytes = parseInt(bits, 10) / 8;

  const symmetricHS = alg.startsWith("HS") ? alg : `HS${bits}`;
  const asymmetricRS = alg.startsWith("RS") ? alg : `RS${bits}`;
  const asymmetricES = alg.startsWith("ES") ? alg : `ES${bits}`;

  // Dynamic lookup maps for security impact of findings
  const SECURITY_IMPACT = {
    exp: "Without an expiration ('exp') claim, the token remains valid indefinitely, increasing the vulnerability window if the token is intercepted or leaked.",
    expired: "The token has expired. Continuing to accept expired tokens allows replay attacks and unauthorized access using stale credentials.",
    iss: "Missing issuer ('iss') claim makes it impossible for the application to verify which authority issued the token, enabling potential trust exploitation.",
    aud: "Without an audience ('aud') restriction, this token could be replayed against other services or applications that trust the same signing key.",
    symmetric: "Symmetric HS* algorithms use a shared secret. If the verifier is compromised, the signing key is exposed, allowing the compromise of the entire token-based auth system.",
    entropy: "Low-entropy symmetric secrets can be cracked offline via brute-force or dictionary attacks, allowing attackers to forge valid tokens.",
    none: "The 'none' algorithm disables signature validation entirely, allowing attackers to forge arbitrary tokens by simply altering the header.",
  };

  // Dynamic lookup maps for remediation guidance of findings
  const REMEDIATION_GUIDANCE = {
    exp: "Add an 'exp' claim to the token payload (e.g., 15-60 mins) and validate it on the server during token verification.",
    expired: "Reject expired tokens on the server by enforcing strict expiration checks in the token validation configuration.",
    iss: "Configure the identity provider to include the 'iss' claim, and configure the verifier to validate it against a trusted list.",
    aud: "Include the 'aud' claim in the token payload, and verify that the client application matches the expected audience value.",
    symmetric: `Transition to asymmetric algorithms like ${asymmetricRS} or ${asymmetricES}, where only the authorization server holds the private key to sign tokens.`,
    entropy: `Generate a strong, cryptographically secure signing secret containing at least ${bits} bits of entropy (e.g., a random ${reqBytes}-byte string).`,
    none: "Configure the JWT library on the server side to explicitly reject tokens that specify 'none' in the header 'alg' field.",
  };

  try {
    const doc = new jsPDF("p", "mm", "a4");

    // Dates
    const scanDate = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).toUpperCase();
    const scanTime = new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const truncatedToken = truncateToken(token);

    // Dynamic security findings analysis
    const findingsList = [];

    // 1. Expiration check
    if (!payload.exp) {
      findingsList.push({
        field: "exp",
        observed: "Missing 'exp' claim",
        severity: "High",
        impact: SECURITY_IMPACT.exp,
        remediation: REMEDIATION_GUIDANCE.exp,
      });
    } else {
      const isExpired = payload.exp * 1000 < Date.now();
      if (isExpired) {
        findingsList.push({
          field: "exp",
          observed: "Token is Expired",
          severity: "High",
          impact: SECURITY_IMPACT.expired,
          remediation: REMEDIATION_GUIDANCE.expired,
        });
      }
    }

    // 2. Issuer check
    if (!payload.iss) {
      findingsList.push({
        field: "iss",
        observed: "Missing 'iss' claim",
        severity: "Medium",
        impact: SECURITY_IMPACT.iss,
        remediation: REMEDIATION_GUIDANCE.iss,
      });
    }

    // 3. Audience check
    if (!payload.aud) {
      findingsList.push({
        field: "aud",
        observed: "Missing 'aud' claim",
        severity: "Medium",
        impact: SECURITY_IMPACT.aud,
        remediation: REMEDIATION_GUIDANCE.aud,
      });
    }

    // 4. Algorithm check (Symmetric/None)
    const alg = String(header.alg || algorithm || "").toUpperCase();
    if (alg === "NONE") {
      findingsList.push({
        field: "alg",
        observed: "alg: none",
        severity: "Critical",
        impact: SECURITY_IMPACT.none,
        remediation: REMEDIATION_GUIDANCE.none,
      });
    } else if (alg.startsWith("HS")) {
      findingsList.push({
        field: "alg",
        observed: `alg: ${alg} (Symmetric)`,
        severity: "Low",
        impact: SECURITY_IMPACT.symmetric,
        remediation: REMEDIATION_GUIDANCE.symmetric,
      });

      // 5. Entropy check
      if (secret && secret.trim().length < reqBytes) {
        findingsList.push({
          field: "secret",
          observed: `Secret key length: ${secret.trim().length} chars`,
          severity: "High",
          impact: SECURITY_IMPACT.entropy,
          remediation: REMEDIATION_GUIDANCE.entropy,
        });
      }
    }

    const numWarnings = findingsList.filter((f) => f.severity === "High" || f.severity === "Medium").length;
    const numWeaknesses = findingsList.filter((f) => f.severity === "Low" || f.severity === "Critical").length;
    const totalFindings = findingsList.length;

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 1 — COVER PAGE
    // ══════════════════════════════════════════════════════════════════════
    if (setPdfProgress) setPdfProgress("Building cover page...");

    // Top blue banner stripe
    doc.setFillColor(...C.bluePrimary);
    doc.rect(0, 0, 210, 3.5, "F");

    // Running header text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – JWT Signature Validator", 105, 12, { align: "center" });

    // Running header line for cover page
    doc.setDrawColor(...C.bluePrimary);
    doc.setLineWidth(0.2);
    doc.line(14, 14.5, 196, 14.5);

    // Company logo/header text
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

    // Report Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(...C.bluePrimary);
    doc.text("JWT SIGNATURE VALIDATOR", 105, 58, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("SECURITY ASSESSMENT REPORT", 105, 65, { align: "center" });

    // Double divider line under title
    doc.setDrawColor(...C.bluePrimary);
    doc.setLineWidth(0.25);
    doc.line(14, 70, 196, 70);
    doc.line(14, 71, 196, 71);

    // Assessment Info Grid
    renderTable(doc, {
      startY: 78,
      head: [],
      body: [
        ["Assessment Performed by", employeeMail],
        ["Employee Name",           employeeName],
        ["Employee Mail ID",        employeeMail],
        ["Token Submitted",         truncatedToken],
        ["Assessment Date",        scanDate],
        ["Assessment Time",        scanTime],
        ["Classification",         "Confidential"],
        ["Assessment Status",       "Completed"],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 },
      },
    });

    // Cover Page Footer details
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

    // Tool details
    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Tool Name",             "JWT Signature Validator"],
        ["Tool Category",         "Authentication Security / Token Integrity Validation"],
        ["Methodology Alignment", "OWASP WSTG – WSTG-SESS-10 / RFC 7519 / CWE-347 / CWE-345"],
        ["Compliance Alignment",  "ISO/IEC 27001 │ AICPA SOC Frameworks"],
        ["Token Submitted",        truncatedToken],
        ["Assessment Mode",       "Non-Intrusive / Static Token Analysis"],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 },
      },
    });

    y = doc.lastAutoTable.finalY + 12;

    // Tool Overview Block
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Tool Overview", 14, y);

    const overviewText = `The JWT Signature Validator performs static analysis of submitted JSON Web Tokens (JWTs) to assess the integrity and security posture of the token structure, signature, and claims. The tool decodes and inspects the token header and payload, validates the signature against the declared algorithm, identifies missing or misconfigured security claims such as expiration (exp), issuer (iss), and audience (aud), and flags weak algorithm configurations including the use of the none algorithm or ${alg.startsWith("HS") ? "symmetric" : "asymmetric"} ${alg} keys without adequate entropy. Validation warnings are clearly reported to identify security gaps that may allow token forgery, privilege escalation, or unauthorised access. Each finding is reported with its field reference, observed value, severity, and specific remediation guidance.`;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMain);
    doc.text(overviewText, 14, y + 6, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 3 — SCAN SUMMARY, DETAILED FINDINGS & CONCLUSION
    // ══════════════════════════════════════════════════════════════════════
    if (setPdfProgress) setPdfProgress("Building scan findings...");
    doc.addPage();

    y = drawSectionHeader(doc, "2. SCAN SUMMARY", 25);

    // Scan Summary Table
    renderTable(doc, {
      startY: y,
      head: [["Chosen Algorithm", "Header alg", "Header typ", "Validation Status"]],
      body: [[
        algorithm,
        header.alg ?? "—",
        header.typ ?? "—",
        "Valid",
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
        0: { textColor: C.bluePrimary },
        3: { textColor: [16, 185, 129] }, // Green for "Valid" status
      },
    });

    y = doc.lastAutoTable.finalY + 10;

    // Section 3: Detailed Findings
    y = drawSectionHeader(doc, "3. DETAILED FINDINGS", y);

    // Header sub-heading
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Header", 14, y);
    y += 4;

    // Header Table
    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["alg", header.alg ?? "—"],
        ["typ", header.typ ?? "—"],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 },
      },
    });

    y = doc.lastAutoTable.finalY + 8;

    // Payload sub-heading
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Payload", 14, y);
    y += 4;

    // Payload Table
    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["sub",   safe(payload.sub)],
        ["name",  safe(payload.name)],
        ["admin", safe(payload.admin)],
        ["iat",   safe(payload.iat)],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 },
      },
    });

    y = doc.lastAutoTable.finalY + 8;

    // Security Findings & Analysis Table (if findings present)
    if (findingsList.length > 0) {
      if (297 - y < 65) {
        doc.addPage();
        y = 25;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...C.bluePrimary);
      doc.text("Security Findings & Recommendations", 14, y);
      y += 4;

      renderTable(doc, {
        startY: y,
        head: [["Field", "Observed", "Severity", "Security Impact", "Remediation Guidance"]],
        body: findingsList.map((f) => [
          f.field,
          f.observed,
          f.severity,
          f.impact,
          f.remediation,
        ]),
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 18, fillColor: [245, 245, 245] },
          1: { cellWidth: 20 },
          2: { fontStyle: "bold", cellWidth: 18 },
          3: { cellWidth: 63 },
          4: { cellWidth: 63 },
        },
        didParseCell: (data) => {
          if (data.column.index === 2 && data.row.section === "body") {
            const sev = data.cell.raw;
            data.cell.styles.textColor = getSeverityColor(sev);
          }
        },
      });

      y = doc.lastAutoTable.finalY + 10;
    }

    // Check height space before Conclusion
    if (297 - y < 70) {
      doc.addPage();
      y = 25;
    }

    // Section 4: Conclusion & Recommendations
    y = drawSectionHeader(doc, "4. CONCLUSION & RECOMMENDATIONS", y);

    const conclusionText = `The JWT Signature Validator assessment analysed the submitted token and identified a total of ${totalFindings} findings, comprising ${numWarnings} validation warnings and ${numWeaknesses} structural or algorithm weaknesses. The token signature status was determined to be Valid using the ${header.alg || algorithm} algorithm. Missing or misconfigured claims — including the absence of expiration (exp), issuer (iss), or audience (aud) fields — represent exploitable weaknesses that may allow attackers to reuse, forge, or escalate privileges using the affected token.

It is recommended that all JWTs include mandatory security claims: exp (expiration), iss (issuer), and aud (audience). The none algorithm must be explicitly rejected by the application. Symmetric signing keys must meet minimum entropy requirements, and asymmetric algorithms such as ${asymmetricRS} or ${asymmetricES} should be preferred for production environments. Token validation logic must be enforced server-side and must not rely solely on client-supplied algorithm headers. All validation warnings identified in this report must be reviewed and remediated prior to production deployment.`;

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

    // Appendix reference table title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Column Reference Guide", 14, y);

    renderTable(doc, {
      startY: y + 5,
      head: [["Field", "Description"]],
      body: [
        ["alg",               "Specifies the cryptographic algorithm used to sign the token (e.g., HS256, RS256, none). Determines how the signature should be verified."],
        ["typ",               "Identifies the token type. Standard value is JWT"],
        ["sub",               "Subject — uniquely identifies the user or entity the token is issued for (e.g., user ID)."],
        ["name",              "Display name of the user associated with the token (custom/non-registered claim)."],
        ["admin",             "Custom claim indicating whether the user has administrative privileges (boolean). Often a target for privilege escalation testing if not properly validated server-side."],
        ["iat",               "Issued At - Unix timestamp indicating when the token was created. Used to calculate token age and validate expiry logic."],
        ["Validation Status", "Indicates the outcome when the crafted/manipulated token was submitted to the server for verification. Reflects whether the server correctly rejected an invalid or tampered token, or incorrectly accepted it (indicating a vulnerability such as algorithm confusion or signature bypass)."],
        ["Remediation",       "Recommended corrective action(s) to fix the identified issue and prevent exploitation. Should be specific and actionable, mapped directly to the finding (e.g., enforce algorithm whitelisting, reject alg: none, use strong/rotated signing keys, validate iss/aud/exp claims server-side)."],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 45, fillColor: [245, 245, 245] },
        1: { cellWidth: 137 },
      },
    });

    y = doc.lastAutoTable.finalY + 12;

    // Acknowledgement Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Acknowledgement", 14, y);

    const ackText = "The findings presented in this report are based on observations made during the assessment period and represent the token security posture of the submitted JWT at the time of analysis. This report contains confidential and proprietary information intended solely for the authorised recipient. Unauthorised disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMain);
    doc.text(ackText, 14, y + 6, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });

    // Apply header & footer decorator to all pages
    applyHeaderFooterDecorator(doc, "JWT Signature Validator");

    if (setPdfProgress) setPdfProgress("Saving PDF...");
    const fileName = `JWT_Report_${header.typ || "JWT"}_${Date.now()}.pdf`;
    doc.save(fileName);
  } catch (err) {
    console.error("Failed to generate JWT PDF report:", err);
  } finally {
    if (setPdfProgress) setPdfProgress(null);
  }
};
