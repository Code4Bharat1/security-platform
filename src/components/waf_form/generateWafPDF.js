import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../utils/pdfFramework";
import { jsPDF } from "jspdf";

// ── Static lookup maps ───────────────────────────────────────────────────────
const SECURITY_IMPACT_MAP = {
  protected:
    "Active Web Application Firewall (WAF) protection is enabled. The server is shielded against common OWASP Top 10 vulnerabilities (including SQL injection and cross-site scripting), automated bot scanners, and volumetric application-layer attacks. Overall threat exposure is low.",
  unprotected:
    "No active Web Application Firewall (WAF) was detected protecting the target host. The web application is directly exposed to external threats and vulnerabilities including injection attacks, path traversals, parameter tampering, and layer-7 Denial of Service (DoS) attempts.",
};

const REMEDIATION_MAP = {
  protected:
    "Verify that the WAF policy is operating in enforcement/blocking mode rather than monitoring/log-only mode. Review rule sets periodically against application updates. Ensure logging telemetry is forwarded to a centralized SIEM for threat hunting and incident response.",
  unprotected:
    "Immediately deploy a Web Application Firewall (such as Cloudflare, AWS WAF, or Imperva) to filter incoming traffic. Configure defensive security headers (CSP, HSTS, X-Frame-Options) to mitigate browser-side exploits and restrict exposed server response headers.",
};

/**
 * generateWafPDF
 *
 * @param {Object} data - WAF detection data
 * @param {Function} setPdfProgress - Progress indicator setter
 */
export const generateWafPDF = async (data, setPdfProgress) => {
  if (!data) return;

  const {
    url = "-",
    statusCode = "-",
    protectionLevel = "None",
    detected = false,
    firewallName = "None",
    serverHeader = "N/A",
    matchedHeaders = [],
    securityHeadersDetected = [],
  } = data;

  setPdfProgress?.("Initializing PDF document...");

  try {
    const doc = new jsPDF("p", "mm", "a4");
    const { employeeName, employeeMail } = getAuditorInfo();

    // ── Common date/time ───────────────────────────────────────────────────
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
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – WAF Scanner", 14, 12);

    // Company header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(...C.bluePrimary);
    doc.text("NEXCORE ALLIANCE", 105, 30, { align: "center" });

    doc.setFont("helvetica", "oblique");
    doc.setFontSize(10);
    doc.text("AI-Powered Cybersecurity & Information Security Solutions", 105, 36, { align: "center" });

    // Divider
    doc.setDrawColor(...C.bluePrimary);
    doc.setLineWidth(0.4);
    doc.line(14, 40, 196, 40);

    // Tool title (Combined and Centered)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...C.bluePrimary);
    doc.text("WAF SCANNER SECURITY ASSESSMENT REPORT", 105, 54, { align: "center" });

    // Divider below title
    doc.line(14, 62, 196, 62);

    // Assessment Info table
    renderTable(doc, {
      startY: 70,
      head: [],
      body: [
        ["Assessment Performed by", employeeMail],
        ["Employee Name",           employeeName],
        ["Employee Mail ID",        employeeMail],
        ["Scanned Target",          url],
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

    // Cover footer
    doc.setDrawColor(...C.lineColor);
    doc.setLineWidth(0.25);
    doc.line(14, 260, 196, 260);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("www.nexcorealliance.com | ISO/IEC 27001 Certified | AICPA SOC Compliant", 105, 267, { align: "center" });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 2 — ASSESSMENT INFORMATION
    // ════════════════════════════════════════════════════════════════════════
    setPdfProgress?.("Building assessment information...");
    doc.addPage();

    let y = drawSectionHeader(doc, "1. ASSESSMENT INFORMATION", 25);

    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Tool Name",             "WAF Scanner"],
        ["Tool Category",         "Web Application Firewall Detection"],
        ["Methodology Alignment", "OWASP WSTG – OTG-CONFIG-006 / Network & Infrastructure Configuration Testing"],
        ["Compliance Alignment",  "ISO/IEC 27001 │ AICPA SOC Frameworks"],
        ["Scanned Target",       url],
        ["Assessment Mode",       "Non-Intrusive / Passive Fingerprinting"],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 },
      },
    });

    y = doc.lastAutoTable.finalY + 12;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Tool Overview", 14, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMain);
    const overviewText =
      "The WAF Scanner performs passive fingerprinting of a target web application or domain to detect the presence, identity, and configuration of a Web Application Firewall (WAF). The tool analyses HTTP response headers, cookie names, error-page patterns, and network-level indicators to determine whether a WAF is deployed and to identify the specific product or service in use (e.g., Cloudflare, AWS WAF, Imperva). Detection results include a confidence rating and the specific evidence that triggered the identification. Absence of a WAF or a low-confidence detection indicates an increased exposure to web-layer attacks including SQL injection, cross-site scripting, and volumetric request flooding.";
    doc.text(overviewText, 14, y + 6, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 3 — SCAN SUMMARY & DETAILED FINDINGS
    // ════════════════════════════════════════════════════════════════════════
    setPdfProgress?.("Building scan results...");
    doc.addPage();

    y = drawSectionHeader(doc, "2. SCAN SUMMARY", 25);

    const verdictLabel = detected ? "WAF Present" : (firewallName === "Protected or Obfuscated" ? "Protected or Obfuscated" : "WAF Not Detected");
    const methodLabel = detected ? "Header Inspection / Cookie Analysis" : "Passive Header Inspection";

    renderTable(doc, {
      startY: y,
      head: [["WAF Detected", "WAF Verdict", "Detection Method"]],
      body: [[
        detected ? "Yes" : "No",
        verdictLabel,
        methodLabel
      ]],
      headStyles: { fillColor: C.bgHeader, textColor: C.white, halign: "center" },
      bodyStyles: { halign: "center", fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: 50, textColor: detected ? [22, 163, 74] : C.red },
        1: { cellWidth: 65 },
        2: { cellWidth: 67 }
      }
    });

    y = doc.lastAutoTable.finalY + 12;

    y = drawSectionHeader(doc, "3. DETAILED FINDINGS", y);

    // Prepare variables for table rows
    const signaturesMatchedText = matchedHeaders.length > 0
      ? matchedHeaders.map((h) => `${h.header}: ${h.value}`).join("\n")
      : "None";

    const securityHeadersText = securityHeadersDetected.length > 0
      ? securityHeadersDetected.join(", ")
      : "None";

    const evidenceText = detected
      ? `Successfully matched response signature header for WAF Vendor: ${firewallName}.`
      : (firewallName === "Protected or Obfuscated" ? "Target host appears to be obfuscated or returned non-standard security banners indicating active protection." : "No known WAF vendor signature matches found in response headers.");

    const impactLabel = (detected || firewallName === "Protected or Obfuscated") ? "protected" : "unprotected";

    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["HTTP Status Response",      safe(statusCode)],
        ["Server Response",           safe(serverHeader)],
        ["Matched WAF Signature",     signaturesMatchedText],
        ["Security Headers Detected",  securityHeadersText],
        ["Detection Evidence",        evidenceText],
        ["Risk Implication",          SECURITY_IMPACT_MAP[impactLabel]],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, textColor: C.white, fillColor: C.bluePrimary },
        1: { cellWidth: 127 },
      },
    });

    // ════════════════════════════════════════════════════════════════════════
    // SECTION 4 — CONCLUSION & RECOMMENDATIONS (Flows continuously on Page 3)
    // ════════════════════════════════════════════════════════════════════════
    setPdfProgress?.("Building conclusion...");
    y = doc.lastAutoTable.finalY + 12;
    y = drawSectionHeader(doc, "4. CONCLUSION & RECOMMENDATIONS", y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMain);

    // Paragraph 1
    const p1 = "The WAF Scanner assessment evaluated the target for the presence of a Web Application Firewall using passive HTTP fingerprinting techniques. The scan analysed response headers, server banners, cookie attributes, and error-page content to determine whether a WAF is active and to identify the product in use.";
    doc.text(p1, 14, y, { maxWidth: 182, lineHeightFactor: 1.4 });
    y += doc.getTextDimensions(p1, { maxWidth: 182 }).h + 8;

    // Recommended Action heading
    doc.setFont("helvetica", "bold");
    doc.text("Recommended Action:", 14, y);
    y += 5;

    // Recommended Action body
    doc.setFont("helvetica", "normal");
    const p2 = REMEDIATION_MAP[impactLabel];
    doc.text(p2, 14, y, { maxWidth: 182, lineHeightFactor: 1.4 });
    y += doc.getTextDimensions(p2, { maxWidth: 182 }).h + 8;

    // Final paragraph
    const p3 = "All WAF bypass techniques relevant to the identified product should be assessed as part of a broader penetration testing engagement.";
    doc.text(p3, 14, y, { maxWidth: 182, lineHeightFactor: 1.4 });
    y += doc.getTextDimensions(p3, { maxWidth: 182 }).h + 12;

    y = drawSectionHeader(doc, "5. APPENDIX", y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Column Reference Guide", 14, y);

    renderTable(doc, {
      startY: y + 5,
      head: [["Column / Field", "Description"]],
      body: [
        ["WAF Detected",      "Boolean status (Yes/No) indicating whether a Web Application Firewall was found protecting the target."],
        ["WAF Verdict",       "Final analyst conclusion summarizing the detection outcome: WAF Present / WAF Not Detected / Inconclusive."],
        ["Detection Method",  "Explains the technical approach used to identify the WAF (e.g., header inspection, cookie analysis, response behavior testing, error page fingerprinting)."],
        ["HTTP Status Response", "The HTTP status code(s) returned by the server during testing (e.g., 403, 406, 429) that indicated WAF-driven blocking or filtering behavior."],
        ["Server Response",   "The raw or relevant portion of the server's response (headers/body) observed during the request, used as supporting evidence for detection."],
        ["Matched WAF Signature", "The specific known WAF signature, pattern, or rule that was matched against the response, confirming the product identification."],
        ["Security Headers Detected", "List of relevant HTTP security headers observed in the response (e.g., cf-ray, x-sucuri-id, server: cloudflare) that contributed to WAF fingerprinting."],
        ["Detection Evidence", "Consolidated proof (header, cookie, status code, or behavior) that directly supports the WAF Verdict."],
        ["Risk Implication",  "Brief note on what the presence or absence of a WAF means for the target's overall attack surface (e.g., reduced exposure to common web attacks, or increased risk if no WAF is present)."],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50, fillColor: [245, 245, 245] },
        1: { cellWidth: 132 },
      },
    });

    y = doc.lastAutoTable.finalY + 10;
    if (297 - y < 45) {
      doc.addPage();
      y = 25;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Acknowledgement", 14, y);

    const ackText =
      "The findings presented in this report are based on observations made during the assessment period and represent the WAF detection status of the environment at the time of scanning. This report contains confidential and proprietary information intended solely for the authorised recipient. Unauthorised disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMain);
    doc.text(ackText, 14, y + 6, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });

    // ── Apply header / footer decorator on all pages ───────────────────────
    applyHeaderFooterDecorator(doc, "WAF Scanner");

    // ── Save ──────────────────────────────────────────────────────────────
    setPdfProgress?.("Saving PDF...");
    const pad = (n) => String(n).padStart(2, "0");
    const dStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    
    doc.save(`WAF_Report_${dStr}.pdf`);

  } catch (err) {
    console.error("Failed to generate WAF PDF:", err);
  } finally {
    setPdfProgress?.(null);
  }
};
