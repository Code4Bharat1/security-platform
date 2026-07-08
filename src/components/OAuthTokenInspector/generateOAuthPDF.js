import { jsPDF } from "jspdf";
import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../utils/pdfFramework";

// Static lookup maps for security impact of findings
const SECURITY_IMPACT = {
  exp: "The token does not carry an expiration time. This allows the token to remain valid indefinitely, exposing the application to token replay attacks. An attacker who obtains such a token can reuse it without restriction, bypassing session controls and maintaining unauthorized access long after the intended session lifetime.",
  expired: "The token has expired and its validity window is closed. Accepting expired tokens allows replay attacks and unauthorized access using stale credentials.",
  iss: "The absence of an issuer ('iss') claim prevents authorization servers and resource APIs from validating the identity of the token authority, making it vulnerable to spoofing and origin confusion.",
  iat: "Without an issued-at ('iat') time, the token's age cannot be validated. This hinders the ability to verify token freshness, enforce max token lifetimes, or perform audit trail logging.",
  sub: "Without a subject ('sub') claim, the token fails to identify the user or client entity it represents. This makes it impossible to apply user-specific access controls or principal authorization rules securely.",
  none: "The 'none' algorithm is permitted, which completely disables cryptographic signature checks. An attacker can modify the token payload and signature at will, bypassing all integrity controls.",
};

// Static lookup maps for remediation guidance of findings
const REMEDIATION_GUIDANCE = {
  exp: "Include the exp claim in all issued tokens with a short-lived expiration window appropriate to the application context. Enforce server-side expiration validation on every token verification request. Reject any token that does not carry a valid exp claim.",
  expired: "Configure the server to strictly validate the 'exp' claim on incoming requests and reject any tokens that are past their expiration timestamp.",
  iss: "Configure the authorization provider to append the 'iss' claim (typically a URL or domain) to all tokens and enforce issuer validation on all resource servers.",
  iat: "Include the 'iat' claim in the token payload at the time of issuance, containing the exact UTC epoch timestamp of generation.",
  sub: "Ensure that all issued tokens define a unique, non-empty identifier for the user or client entity in the 'sub' claim.",
  none: "Reconfigure the OAuth and token parsing libraries on the backend to explicitly block and reject tokens specifying the 'none' algorithm.",
};

// Helper: Format seconds into human-readable duration
const fmtDuration = (s) => {
  if (s == null) return "Cannot be calculated";
  const neg = s < 0;
  s = Math.abs(s);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  const parts = [];
  if (d) parts.push(`${d}d`);
  if (h || d) parts.push(`${h}h`);
  if (m || h || d) parts.push(`${m}m`);
  parts.push(`${sec}s`);
  return (neg ? "-" : "") + parts.join(" ");
};

const fmtDateTime = (epoch) =>
  epoch == null ? "Not Present" : new Date(epoch * 1000).toLocaleString();

const getExpiredMessage = (epoch) => {
  if (epoch == null) return "Cannot be calculated";
  const secAgo = Math.floor(Date.now() / 1000) - epoch;
  if (secAgo <= 0) return "Not Expired";
  const daysAgo = Math.floor(secAgo / 86400);
  const dateStr = new Date(epoch * 1000).toLocaleString();
  if (daysAgo >= 1) {
    return `Expired ${daysAgo} day${daysAgo > 1 ? "s" : ""} ago`;
  }
  return `Expired on ${dateStr}`;
};

// Truncate long JWT token strings to prevent layout overflow in tables
const truncateToken = (token) => {
  if (!token) return "—";
  const clean = String(token).trim();
  if (clean.length <= 40) return clean;
  return `${clean.substring(0, 15)}...[truncated]...${clean.substring(clean.length - 15)}`;
};

export const generateOAuthPDF = async (result, token, setPdfProgress) => {
  if (!result) return;
  if (setPdfProgress) setPdfProgress("Initializing OAuth PDF Report...");

  const { employeeName, employeeMail } = getAuditorInfo();
  const header = result.header || {};
  const payload = result.payload || {};
  const now = Math.floor(Date.now() / 1000);

  const expEpoch = result.meta?.expEpoch ?? payload.exp ?? null;
  const iatEpoch = result.meta?.iatEpoch ?? payload.iat ?? null;
  const timeRemaining = expEpoch == null ? null : expEpoch - now;
  const score = result.meta?.securityScore ?? 100;
  const riskLevel = score >= 80 ? "Low" : score >= 60 ? "Medium" : score >= 40 ? "High" : "Critical";

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

    // 1. Expiration checks
    if (!("exp" in payload)) {
      findingsList.push({
        field: "exp",
        observed: "Missing 'exp' claim",
        delta: "-25",
        impact: SECURITY_IMPACT.exp,
        remediation: REMEDIATION_GUIDANCE.exp,
      });
    } else if (expEpoch && now >= expEpoch) {
      findingsList.push({
        field: "exp",
        observed: getExpiredMessage(expEpoch),
        delta: "-30",
        impact: SECURITY_IMPACT.expired,
        remediation: REMEDIATION_GUIDANCE.expired,
      });
    }

    // 2. Issued-at checks
    if (!("iat" in payload)) {
      findingsList.push({
        field: "iat",
        observed: "Missing 'iat' claim",
        delta: "-10",
        impact: SECURITY_IMPACT.iat,
        remediation: REMEDIATION_GUIDANCE.iat,
      });
    }

    // 3. Issuer checks
    if (!("iss" in payload)) {
      findingsList.push({
        field: "iss",
        observed: "Missing 'iss' claim",
        delta: "-10",
        impact: SECURITY_IMPACT.iss,
        remediation: REMEDIATION_GUIDANCE.iss,
      });
    }

    // 4. Subject checks
    if (!("sub" in payload)) {
      findingsList.push({
        field: "sub",
        observed: "Missing 'sub' claim",
        delta: "-5",
        impact: SECURITY_IMPACT.sub,
        remediation: REMEDIATION_GUIDANCE.sub,
      });
    }

    // 5. Algorithm checks
    if (header.alg && String(header.alg).toLowerCase() === "none") {
      findingsList.push({
        field: "alg",
        observed: "alg: none",
        delta: "-50",
        impact: SECURITY_IMPACT.none,
        remediation: REMEDIATION_GUIDANCE.none,
      });
    }

    // Default finding if everything is valid
    if (findingsList.length === 0) {
      findingsList.push({
        field: "None",
        observed: "All standard claims present",
        delta: "0",
        impact: "No security impact identified. The token structure conforms to standard claims completeness.",
        remediation: "Maintain current token configurations and regularly inspect tokens to ensure standards compliance.",
      });
    }

    const missingClaims = [];
    if (!("exp" in payload)) missingClaims.push("exp");
    if (!("iat" in payload)) missingClaims.push("iat");
    if (!("iss" in payload)) missingClaims.push("iss");
    if (!("sub" in payload)) missingClaims.push("sub");
    const numMissing = missingClaims.length;

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
    doc.text("NEXCORE ALLIANCE | Individual Tool Report–OAuth Token Analyzer", 105, 12, { align: "center" });

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
    doc.setFontSize(18);
    doc.setTextColor(...C.bluePrimary);
    doc.text("OAUTH TOKEN ANALYZER SECURITY ASSESSMENT REPORT", 105, 58, { align: "center" });

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
        ["Target Input",            truncatedToken],
        ["Assessment Date",        scanDate],
        ["Assessment Time",        scanTime],
        ["Audience (aud)",         payload.aud ? (Array.isArray(payload.aud) ? payload.aud.join(", ") : String(payload.aud)) : "Not Present"],
        ["Risk Level",             riskLevel],
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
    // PAGE 2 — ASSESSMENT INFORMATION, SUMMARY & DETAILED FINDINGS
    // ══════════════════════════════════════════════════════════════════════
    if (setPdfProgress) setPdfProgress("Building assessment information...");
    doc.addPage();

    let y = drawSectionHeader(doc, "1. ASSESSMENT INFORMATION", 25);

    // Tool details
    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Tool Name",             "OAuth Token Analyzer"],
        ["Tool Category",         "Authentication Security / Token Inspection"],
        ["Methodology Alignment", "OWASP WSTG – OTG-AUTHN / Authentication Testing"],
        ["Compliance Alignment",  "ISO/IEC 27001 │ AICPA SOC Frameworks"],
        ["Target Input",           truncatedToken],
        ["Assessment Mode",       "Non-Intrusive / Automated Token Analysis"],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 },
      },
    });

    y = doc.lastAutoTable.finalY + 10;

    // Tool Overview Block
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Tool Overview", 14, y);

    const overviewText = "The OAuth Token Analyzer tool inspects OAuth and JWT tokens submitted for analysis, evaluating their structural integrity, claim completeness, and overall security posture. The tool decodes token payloads, validates the presence of mandatory security claims including expiration (exp), issued-at (iat), issuer (iss), and subject (sub), and computes a security score reflecting the completeness of the token structure. Missing claims are identified with an associated score delta, indicating their individual contribution to the overall security degradation.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(overviewText, 14, y + 5, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });

    y = y + 36;

    // Section 2: Scan Summary
    y = drawSectionHeader(doc, "2. SCAN SUMMARY", y);

    renderTable(doc, {
      startY: y,
      head: [["Tokens Analyzed", "Security Score", "Risk Level", "Claims Validated", "Issues Detected"]],
      body: [[
        "1",
        `${score}/100`,
        riskLevel,
        "4",
        String(result.issues?.length ?? numMissing),
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
        1: { textColor: score >= 80 ? [16, 185, 129] : score >= 60 ? C.amber : C.red },
        2: { textColor: riskLevel === "Low" ? [16, 185, 129] : riskLevel === "Medium" ? C.amber : riskLevel === "High" ? C.red : C.purple, fontStyle: "bold" },
        4: { textColor: (result.issues?.length ?? numMissing) > 0 ? C.red : [16, 185, 129] },
      },
    });

    y = doc.lastAutoTable.finalY + 8;

    // Missing Claims Summary Block
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Missing Claims Summary", 14, y);
    
    const missingClaimsList = missingClaims.length > 0 ? missingClaims.join(", ") : "None";
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(`The following standard claims were found to be missing from the analyzed token payload: ${missingClaimsList}`, 14, y + 4.5, { maxWidth: 182 });
    
    y = y + 18;

    // Section 3: Detailed Findings
    y = drawSectionHeader(doc, "3. DETAILED FINDINGS", y);

    // Render Token Information Section ONCE
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Token Information", 14, y);
    y += 4;

    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Issued At",        fmtDateTime(iatEpoch)],
        ["Expires At",       fmtDateTime(expEpoch)],
        ["Time Remaining",   expEpoch == null ? "Cannot be calculated" : timeRemaining <= 0 ? getExpiredMessage(expEpoch) : fmtDuration(timeRemaining)],
        ["Audience (aud)",   payload.aud ? (Array.isArray(payload.aud) ? payload.aud.join(", ") : String(payload.aud)) : "Not Present"],
        ["Token Type",       header.typ ?? "OAuth / JWT"],
        ["Signature Status", "Not Verified"],
        ["Algorithm",        header.alg ?? "Not Present"],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 },
      },
    });

    y = doc.lastAutoTable.finalY + 12;

    // Render findings focused on issues, impact, and recommendation
    if (findingsList.length > 0) {
      findingsList.forEach((f, idx) => {
        // Prevent overflow: check remaining space
        if (297 - y < 55) {
          doc.addPage();
          y = 25;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(...C.bluePrimary);
        doc.text(f.field === "None" ? "No Compliance Issues Detected" : `Finding ${idx + 1}: Missing ${f.field.toUpperCase()} Claim`, 14, y);
        y += 4;

        renderTable(doc, {
          startY: y,
          head: [],
          body: [
            ["Issue Detected",  f.observed],
            ["Score Delta",    f.delta],
            ["Impact",         f.impact],
            ["Recommendation", f.remediation],
          ],
          columnStyles: {
            0: { fontStyle: "bold", cellWidth: 40, fillColor: [245, 245, 245] },
            1: { cellWidth: 142 },
          },
          didParseCell: (data) => {
            if (data.column.index === 1 && data.row.index === 1) {
              data.cell.styles.textColor = parseInt(f.delta, 10) < 0 ? C.red : [16, 185, 129];
              data.cell.styles.fontStyle = "bold";
            }
          },
        });

        y = doc.lastAutoTable.finalY + 10;
      });
    }

    // Check height space before Conclusion
    if (297 - y < 75) {
      doc.addPage();
      y = 25;
    }

    // Section 4: Conclusion & Recommendations
    y = drawSectionHeader(doc, "4. CONCLUSION & RECOMMENDATIONS", y);

    let conclusionText = `The OAuth Token Analyzer assessment identified ${numMissing} missing claims within the analyzed token, resulting in a security score of ${score}/100. `;

    if (numMissing === 4) {
      conclusionText += `All four standard JWT/OAuth claims — exp, iat, iss, and sub — are absent from the token payload, with the issued-at, expires-at, and time-remaining fields all returning no values. The most critical deficiency is the missing exp claim (score delta: -25), which renders the token perpetually valid and exposes the application to token replay and session hijacking risks. The missing iss and iat claims (score delta: -10 each) further undermine issuer verification and token lifecycle management. The absent sub claim (score delta: -5) removes reliable principal identification from the token.`;
    } else if (numMissing > 0) {
      conclusionText += `The missing standard JWT/OAuth claim(s) include: ${missingClaims.join(", ")}. `;
      if (missingClaims.includes("exp")) {
        conclusionText += `The most critical deficiency is the missing exp claim (score delta: -25), which renders the token perpetually valid and exposes the application to token replay and session hijacking risks. `;
      }
      if (missingClaims.includes("iss") || missingClaims.includes("iat")) {
        const parts = [];
        if (missingClaims.includes("iss")) parts.push("iss");
        if (missingClaims.includes("iat")) parts.push("iat");
        conclusionText += `The missing ${parts.join(" and ")} claim(s) (score delta: -10 each) further undermine issuer verification and token lifecycle management. `;
      }
      if (missingClaims.includes("sub")) {
        conclusionText += `The absent sub claim (score delta: -5) removes reliable principal identification from the token.`;
      }
    } else {
      conclusionText += `All four standard JWT/OAuth claims — exp, iat, iss, and sub — are successfully present and validated in the token payload. No critical security configuration gaps or missing claims were identified.`;
    }

    conclusionText += `\n\nIt is recommended to enforce a token issuance policy that mandates the inclusion of all standard claims as defined in RFC 7519. All tokens must carry exp, iat, iss, and sub claims as a minimum baseline. Token signature validation must be implemented and enforced at every resource server. Tokens that fail claim validation or signature verification must be rejected without processing.`;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(conclusionText, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 3 — APPENDIX
    // ══════════════════════════════════════════════════════════════════════
    if (setPdfProgress) setPdfProgress("Building appendix...");
    doc.addPage();

    y = drawSectionHeader(doc, "5. APPENDIX", 25);

    // Appendix Reference Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Column Reference Guide", 14, y);

    renderTable(doc, {
      startY: y + 5,
      head: [["Column", "Description"]],
      body: [
        ["Issued At",        "Timestamp indicating when the token was issued; blank if the iat claim is absent"],
        ["Expires At",       "Timestamp indicating when the token expires; blank if the exp claim is absent"],
        ["Time Remaining",   "Duration remaining before token expiration; blank when no expiration is set"],
        ["Security Score",   "Composite score out of 100 reflecting the overall security posture of the analyzed token"],
        ["Token Type",       "Classification of the token under analysis (e.g., OAuth / JWT)"],
        ["Signature Status", "Indicates whether cryptographic signature validation was performed on the token"],
        ["Score Delta",      "Numeric reduction applied to the security score due to the missing or invalid claim"],
        ["Algorithm",        "The cryptographic signing algorithm used to generate and verify the token's signature (e.g., HS256, RS256)"],
        ["Tokens Analyzed",  "Total number of tokens submitted/scanned (usually 1, since the tool does per-token analysis)"],
        ["Claims Validated", "Total number of standard claims checked (exp, iat, iss, sub = 4)"],
        ["Issues Detected",  "Number of claims found missing/invalid"],
        ["Impact",           "Potential security consequence if the identified deficiency is not remediated"],
        ["Recommendation",   "Specific, actionable remediation guidance for the identified issue"],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 45, fillColor: [245, 245, 245] },
        1: { cellWidth: 137 },
      },
    });

    y = doc.lastAutoTable.finalY + 10;

    // Check height space before Acknowledgement
    if (297 - y < 55) {
      doc.addPage();
      y = 25;
    }

    // Acknowledgement Block
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Acknowledgement", 14, y);

    const ackText = "The findings presented in this report are based on observations made during the assessment period and represent the OAuth token security posture of the environment at the time of analysis. This report contains confidential and proprietary information intended solely for the authorized recipient. Unauthorized disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(ackText, 14, y + 5, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });

    // Apply header & footer decorator to all pages
    applyHeaderFooterDecorator(doc, "OAuth Token Analyzer");

    if (setPdfProgress) setPdfProgress("Saving PDF...");
    const fileName = `OAuth_Report_${header.typ || "JWT"}_${Date.now()}.pdf`;
    doc.save(fileName);
  } catch (err) {
    console.error("Failed to generate OAuth PDF report:", err);
  } finally {
    if (setPdfProgress) setPdfProgress(null);
  }
};
