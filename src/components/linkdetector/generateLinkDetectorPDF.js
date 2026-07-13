import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../utils/pdfFramework";
import { jsPDF } from "jspdf";

// ── Static verdict → severity mapper ─────────────────────────────────────────
const getVerdictColor = (status) => {
  switch ((status || "").toLowerCase()) {
    case "malicious":   return C.red;
    case "suspicious":  return C.amber;
    case "safe":        return [22, 163, 74];   // green-600
    default:            return C.gray;
  }
};

const getSeverity = (status, trustIndex) => {
  const st = (status || "").toLowerCase();
  if (st === "malicious") return "High";
  if (st === "suspicious") return "Medium";
  if (st === "safe") return "Low";
  return "Informational";
};

// ── Static trust index → risk label ──────────────────────────────────────────
const trustToRisk = (idx) => {
  if (idx === null || idx === undefined) return "Unknown";
  const n = Number(idx);
  if (n >= 80) return "Low Risk";
  if (n >= 50) return "Medium Risk";
  if (n >= 20) return "High Risk";
  return "Critical Risk";
};

// ── Static recommendations by verdict ────────────────────────────────────────
const REMEDIATION_MAP = {
  malicious:
    "Immediately block access to this URL at the firewall/proxy level. Report the domain to threat intelligence feeds. Investigate any users who may have visited the link for indicators of compromise (IOC). Reset credentials if the page contained a phishing or credential-harvesting form.",
  suspicious:
    "Avoid navigating to this URL until a manual review is completed. Submit the URL for sandbox detonation or deeper analysis. Monitor network traffic for outbound connections to the resolved IP address. Consider blocking at the web gateway as a precautionary measure.",
  safe:
    "No immediate action required. Continue to monitor this domain periodically as threat classifications can change. Ensure your organisation's URL filtering policy is enforced to prevent future exposure to malicious links.",
  invalid:
    "The URL could not be resolved. Verify that the URL is correctly formed. If it was received via email or message, treat it as potentially deceptive and do not attempt to visit it manually.",
};

const SECURITY_IMPACT_MAP = {
  malicious:
    "Active threat confirmed. Visiting this URL may result in malware delivery, credential phishing, session hijacking, drive-by downloads, or ransomware infection. Immediate containment is required.",
  suspicious:
    "Potential risk signals detected. The URL exhibits one or more indicators of malicious intent including suspicious keywords, typosquatting, blacklist presence, or anomalous redirect chains.",
  safe:
    "No known threats detected at the time of scanning. The URL appears legitimate and resolves correctly without suspicious indicators.",
  invalid:
    "URL could not be resolved or is malformed. Non-resolving domains may be registered for future malicious use (domain parking / squatting).",
};

/**
 * generateLinkDetectorPDF
 *
 * @param {Object} scanData
 *   - result    {Object}   Single-scan result object from the backend
 *   - bulkResults {Array}  Bulk scan results array (used if result is null)
 * @param {Function} setPdfProgress  State setter for progress messages
 */
export const generateLinkDetectorPDF = async (scanData, setPdfProgress) => {
  if (!scanData?.result && !scanData?.bulkResults?.length) return;

  const isBulk = !scanData.result && scanData.bulkResults?.length > 0;
  const r      = scanData.result || {};
  const bulk   = scanData.bulkResults || [];

  setPdfProgress("Initializing PDF document...");

  try {
    const doc  = new jsPDF("p", "mm", "a4");
    const { employeeName, employeeMail } = getAuditorInfo();

    // ── Common date/time ───────────────────────────────────────────────────
    const now      = new Date();
    const scanDate = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
    const scanTime = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    const analyzedUrl  = isBulk ? `${bulk.length} URLs (Bulk Scan)` : safe(r.url, "Unknown URL");
    const verdict      = isBulk ? "Bulk Scan"                       : safe(r.status, "Unknown");
    const trustIndex   = isBulk ? "—"                               : safe(r.trustIndex, "—");
    const riskLabel    = isBulk ? "—"                               : trustToRisk(r.trustIndex);
    const scannedAt    = isBulk
      ? scanDate
      : (r.scannedAt
          ? new Date(r.scannedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()
          : scanDate);

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 1 — COVER PAGE
    // ════════════════════════════════════════════════════════════════════════
    setPdfProgress("Building cover page...");

    // Top blue banner stripe
    doc.setFillColor(...C.bluePrimary);
    doc.rect(0, 0, 210, 3.5, "F");

    // Brand line
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – Link Detector", 14, 12);

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

    // Tool title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...C.bluePrimary);
    doc.text("LINK DETECTOR SECURITY ASSESSMENT REPORT", 105, 54, { align: "center" });

    // Double rule
    doc.setDrawColor(...C.bluePrimary);
    doc.setLineWidth(0.25);
    doc.line(14, 60, 196, 60);

    // Assessment Info table
    renderTable(doc, {
      startY: 68,
      head: [],
      body: [
        ["Assessment Performed by", employeeMail],
        ["Employee Name",           employeeName],
        ["Employee Mail ID",        employeeMail],
        ["Scanned URL",             analyzedUrl],
        ["Assessment Date",         scannedAt],
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
    // PAGE 2 — ASSESSMENT INFORMATION & DETAILED FINDINGS
    // ════════════════════════════════════════════════════════════════════════
    setPdfProgress("Building assessment information...");
    doc.addPage();

    let y = drawSectionHeader(doc, "1. ASSESSMENT INFORMATION", 25);

    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Tool Name",             "Link Detector"],
        ["Tool Category",         "URL Analysis / Trust & Reachability Assessment"],
        ["Methodology Alignment", "OWASP WSTG – OTG-CONFIG / URL Validation / SSL/TLS Verification"],
        ["Compliance Alignment",  "ISO/IEC 27001 | AICPA SOC Frameworks"],
        ["Scanned URL",           analyzedUrl],
        ["Assessment Mode",       "Non-Intrusive / Automated URL Analysis"],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 },
      },
    });

    y = doc.lastAutoTable.finalY + 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Tool Overview", 14, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    const overviewText =
      "The Link Detector tool analyses a submitted URL to evaluate its trustworthiness, reachability, and security posture. The tool performs reachability checks, resolves redirect chains, inspects SSL status, and evaluates suspicious indicators including typosquatting, blacklist matches, URL shortener expansion, and suspicious domain classification. Content findings including crypto miner presence, inline eval usage, external JavaScript count, and form count are reported. Each analysis produces a Trust Index score and an overall status verdict. Results support identification of suspicious, malicious, or misconfigured URLs prior to user interaction or system integration.";
    doc.text(overviewText, 14, y + 5, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });

    y += 35;

    y = drawSectionHeader(doc, "2. SCAN SUMMARY", y);

    // Calculate scan summary counts
    const totalCount = isBulk ? bulk.length : 1;
    const safeCount = isBulk ? bulk.filter(item => (item.status || "").toLowerCase() === "safe").length : (verdict.toLowerCase() === "safe" ? 1 : 0);
    const suspiciousCount = isBulk ? bulk.filter(item => (item.status || "").toLowerCase() === "suspicious").length : (verdict.toLowerCase() === "suspicious" ? 1 : 0);
    const unsafeCount = isBulk ? bulk.filter(item => (item.status || "").toLowerCase() === "malicious").length : (verdict.toLowerCase() === "malicious" ? 1 : 0);

    renderTable(doc, {
      startY: y,
      head: [["Total URLs Analyzed", "Safe", "Suspicious", "Unsafe"]],
      body: [[String(totalCount), String(safeCount), String(suspiciousCount), String(unsafeCount)]],
      headStyles: { fillColor: C.bgHeader, textColor: C.white, halign: "center" },
      bodyStyles: { halign: "center", fontStyle: "bold", fontSize: 9 },
      columnStyles: {
        0: { textColor: C.textMain },
        1: { textColor: [22, 163, 74] },
        2: { textColor: C.amber },
        3: { textColor: C.red },
      }
    });

    y = doc.lastAutoTable.finalY + 8;

    y = drawSectionHeader(doc, "3. DETAILED FINDINGS", y);

    if (!isBulk) {
      // Single scan detailed finding row headers start
      const st = r.status || "Unknown";
      const sev = getSeverity(st, r.trustIndex);
      const remediationVal = REMEDIATION_MAP[st.toLowerCase()] || REMEDIATION_MAP.safe;
      const impactVal = SECURITY_IMPACT_MAP[st.toLowerCase()] || SECURITY_IMPACT_MAP.safe;

      renderTable(doc, {
        startY: y,
        head: [["Finding 1", ""]],
        body: [
          ["Severity",           sev],
          ["URL",                safe(r.url)],
          ["Final URL",          safe(r.finalUrl)],
          ["Status",             `${st.toUpperCase()} (Trust Index: ${trustIndex})`],
          ["Message",            safe(r.message)],
          ["HTTPS",              r.ssl?.isHttps ? "Yes — Secure" : "No — Not Secure"],
          ["Onion",              r.onion ? "Yes" : "No"],
          ["IP / Country",       `${safe(r.geo?.ip)} / ${safe(r.geo?.country)}`],
          ["Scanned At",         r.scannedAt ? new Date(r.scannedAt).toLocaleString() : "—"],
          ["Redirect Chain",     (r.redirectChain || []).length > 0 ? (r.redirectChain || []).join(" -> ") : "No redirects"],
          ["Keywords",           safe((r.suspicious?.keywordsFound || []).join(", ") || "None")],
          ["Typosquat of",       safe(r.suspicious?.typosquatOf || "No typosquatting detected")],
          ["Shortener Expanded", r.suspicious?.shortenerExpanded ? "Yes" : "No"],
          ["Suspicious Domain",  r.suspicious?.suspiciousDomain ? "Yes" : "No"],
          ["CNAME Chain",        (r.suspicious?.cnameChain || []).length ? r.suspicious.cnameChain.join(" -> ") : "—"],
          ["Blacklist Matches",  safe((r.suspicious?.blacklistMatches || []).join(", ") || "None")],
          ["hasCryptoMiner",     r.contentFindings?.hasCryptoMiner ? "true" : "false"],
          ["suspiciousInlineEval", r.contentFindings?.suspiciousInlineEval ? "true" : "false"],
          ["externalJsCount",    String(r.contentFindings?.externalJsCount ?? 0)],
          ["formsCount",         String(r.contentFindings?.formsCount ?? 0)],
          ["Impact",             impactVal],
          ["Recommendation",     remediationVal],
        ],
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 45, fillColor: [245, 245, 245] },
          1: { cellWidth: 137 },
        },
        didParseCell: (data) => {
          if (data.row.index === 0 && data.column.index === 1 && data.section === "body") {
            data.cell.styles.textColor = getVerdictColor(st);
            data.cell.styles.fontStyle = "bold";
          }
        }
      });
    } else {
      // Bulk scan detailed findings loop
      let findingIndex = 1;
      bulk.forEach((item, idx) => {
        const itemSt = item.status || "Unknown";
        const itemSev = getSeverity(itemSt, item.trustIndex);
        const itemRemed = REMEDIATION_MAP[itemSt.toLowerCase()] || REMEDIATION_MAP.safe;
        const itemImp = SECURITY_IMPACT_MAP[itemSt.toLowerCase()] || SECURITY_IMPACT_MAP.safe;

        // Add page break if we are near the bottom of the page
        if (y > 220) {
          doc.addPage();
          y = 25;
        }

        renderTable(doc, {
          startY: y,
          head: [[`Finding ${findingIndex}`, ""]],
          body: [
            ["Severity",           itemSev],
            ["URL",                safe(item.url)],
            ["Final URL",          safe(item.finalUrl)],
            ["Status",             `${itemSt.toUpperCase()} (Trust Index: ${safe(item.trustIndex)})`],
            ["Message",            safe(item.message)],
            ["HTTPS",              item.ssl?.isHttps ? "Yes — Secure" : "No — Not Secure"],
            ["Onion",              item.onion ? "Yes" : "No"],
            ["IP / Country",       `${safe(item.geo?.ip)} / ${safe(item.geo?.country)}`],
            ["Scanned At",         item.scannedAt ? new Date(item.scannedAt).toLocaleString() : "—"],
            ["Redirect Chain",     (item.redirectChain || []).length > 0 ? (item.redirectChain || []).join(" -> ") : "No redirects"],
            ["Keywords",           safe((item.suspicious?.keywordsFound || []).join(", ") || "None")],
            ["Typosquat of",       safe(item.suspicious?.typosquatOf || "No typosquatting detected")],
            ["Shortener Expanded", item.suspicious?.shortenerExpanded ? "Yes" : "No"],
            ["Suspicious Domain",  item.suspicious?.suspiciousDomain ? "Yes" : "No"],
            ["CNAME Chain",        (item.suspicious?.cnameChain || []).length ? item.suspicious.cnameChain.join(" -> ") : "—"],
            ["Blacklist Matches",  safe((item.suspicious?.blacklistMatches || []).join(", ") || "None")],
            ["hasCryptoMiner",     item.contentFindings?.hasCryptoMiner ? "true" : "false"],
            ["suspiciousInlineEval", item.contentFindings?.suspiciousInlineEval ? "true" : "false"],
            ["externalJsCount",    String(item.contentFindings?.externalJsCount ?? 0)],
            ["formsCount",         String(item.contentFindings?.formsCount ?? 0)],
            ["Impact",             itemImp],
            ["Recommendation",     itemRemed],
          ],
          columnStyles: {
            0: { fontStyle: "bold", cellWidth: 45, fillColor: [245, 245, 245] },
            1: { cellWidth: 137 },
          },
          didParseCell: (data) => {
            if (data.row.index === 0 && data.column.index === 1 && data.section === "body") {
              data.cell.styles.textColor = getVerdictColor(itemSt);
              data.cell.styles.fontStyle = "bold";
            }
          }
        });
        y = doc.lastAutoTable.finalY + 10;
        findingIndex++;
      });
    }

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 3 — CONCLUSION & RECOMMENDATIONS
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    y = drawSectionHeader(doc, "4. CONCLUSION & RECOMMENDATIONS", y);

    const findingsCount = isBulk ? bulk.filter(item => (item.status || "").toLowerCase() !== "safe").length : (verdict.toLowerCase() !== "safe" ? 1 : 0);
    const scoreVal = isBulk ? "Bulk Scan N/A" : `${trustIndex}/100`;
    const redirectHops = isBulk ? "Bulk Scan N/A" : String((r.redirectChain || []).length);

    let activeThreats = [];
    if (!isBulk) {
      if (r.onion) activeThreats.push("Onion domain");
      if (r.suspicious?.suspiciousDomain) activeThreats.push("Suspicious registration");
      if (r.suspicious?.typosquatOf) activeThreats.push("Typosquatting attempt");
      if (r.contentFindings?.hasCryptoMiner) activeThreats.push("Cryptominer script");
      if (r.contentFindings?.suspiciousInlineEval) activeThreats.push("Eval obfuscation");
      if ((r.suspicious?.blacklistMatches || []).length > 0) activeThreats.push("Blacklist matches");
    } else {
      activeThreats.push("Bulk scan anomalies");
    }
    const indicatorSummaryText = activeThreats.length > 0 ? activeThreats.join(", ") : "No Issues Found";

    const conclusionPara1 =
      `The Link Detector assessment analysed a total of ${totalCount} URL(s) and identified ${findingsCount} finding(s). The overall Trust Index for the scanned target was ${scoreVal}, with a status verdict of ${verdict.toLowerCase()}. Redirect chain analysis confirmed ${redirectHops} hop(s). Suspicious indicator checks identified (${indicatorSummaryText}). Content analysis reported (${isBulk ? "Bulk Scan N/A" : (r.contentFindings?.externalJsCount ?? 0)}) external JavaScript files and (${isBulk ? "Bulk Scan N/A" : (r.contentFindings?.formsCount ?? 0)}) form(s) on the target page.`;

    const conclusionPara2 =
      "It is recommended that all URLs with a Trust Index below the acceptable threshold be blocked or flagged for manual review prior to use. Suspicious indicators including blacklist matches, typosquatting, and URL shortener expansion must be investigated and confirmed before the URL is permitted in production systems or user-facing communications. High external JavaScript counts should be reviewed for third-party dependency risks. Where HTTPS is absent, secure transport must be enforced. All redirect chains should be validated to ensure no intermediate hops introduce risk.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...C.textMain);
    doc.text(conclusionPara1, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.45 });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 4 — APPENDIX (COLUMN REFERENCE GUIDE)
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...C.textMain);
    doc.text(conclusionPara2, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.45 });

    y += 28;

    y = drawSectionHeader(doc, "5. APPENDIX", y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Column Reference Guide", 14, y);
    y += 5;

    renderTable(doc, {
      startY: y,
      head: [["Column", "Description"]],
      body: [
        ["Severity", "Risk level assigned to the finding: Critical / High / Medium / Low / Informational."],
        ["URL", "The original URL submitted for analysis."],
        ["Final URL", "The resolved destination URL after all redirects have been followed."],
        ["Status", "Overall verdict returned by the tool: safe / suspicious / unsafe, along with the Trust Index score in parentheses (e.g., safe (Trust Index: 80))."],
        ["Message", "Human-readable summary of the analysis result based on evaluated heuristics."],
        ["HTTPS", "Indicates whether the URL uses HTTPS (secure transport): Yes / No."],
        ["Onion", "Indicates whether the URL resolves to a Tor hidden service (.onion domain): Yes / No."],
        ["IP / Country", "The resolved IP address of the target host and the associated country code."],
        ["Scanned At", "The date and time at which the URL analysis was performed."],
        ["Redirect Chain", "The ordered sequence of URLs traversed from the original URL to the final destination."],
        ["Keywords", "Suspicious keywords detected in the URL or page content that may indicate phishing or malicious intent: Found / Not Found."],
        ["Typosquat of", "Indicates whether the domain is a typographical variant of a known legitimate domain: detected domain name or No typosquatting detected."],
        ["Shortener Expanded", "Indicates whether the URL was identified as a shortened URL and expanded to its destination: Yes / No."],
        ["Suspicious Domain", "Indicates whether the domain exhibits characteristics associated with suspicious or malicious registration patterns: Yes / No."],
        ["CNAME Chain", "The CNAME resolution chain for the target domain, if applicable. Displayed as - when not present."],
        ["Blacklist Matches", "Indicates whether the URL or domain appears on known threat intelligence blacklists. Displayed as - when no matches are found."],
        ["hasCryptoMiner", "Indicates whether a cryptocurrency mining script was detected on the target page: true / false."],
        ["suspiciousInlineEval", "Indicates whether suspicious inline JavaScript eval() usage was detected on the target page: true / false."],
        ["externalJsCount", "The number of external JavaScript files loaded by the target page. High counts may indicate elevated third-party dependency risk."],
        ["formsCount", "The number of HTML forms present on the target page. May indicate credential harvesting risk when combined with other suspicious indicators."],
        ["Risk Level", "Overall risk classification assigned to the URL based on all evaluated indicators: Low / Medium / High."],
        ["Trust Index", "A numeric score (0–100) representing the overall trustworthiness of the URL based on all evaluated heuristics and indicators."],
        ["Impact", "Potential security consequence if the identified URL is accessed or integrated without remediation."],
        ["Recommendation", "Specific, actionable guidance to address the identified URL risk or trust finding."],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50, fillColor: [245, 245, 245] },
        1: { cellWidth: 132 },
      },
    });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 5 — ACKNOWLEDGEMENT (rendered automatically by page breaks if guide overlaps)
    // ════════════════════════════════════════════════════════════════════════
    y = doc.lastAutoTable.finalY + 12;
    if (297 - y < 45) {
      doc.addPage();
      y = 25;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Acknowledgement", 14, y);
    y += 6;

    const ackText =
      "The findings presented in this report are based on observations made during the assessment period and represent the URL trust and reachability posture of the submitted target at the time of analysis. This report contains confidential and proprietary information intended solely for the authorised recipient. Unauthorised disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(ackText, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });

    // Apply header/footer decorators
    applyHeaderFooterDecorator(doc, "Link Detector");

    // Save
    setPdfProgress("Saving PDF...");
    const pad = (n) => String(n).padStart(2, "0");
    const dStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    doc.save(`LinkDetector-Report-${dStr}.pdf`);

  } catch (err) {
    console.error("Failed to generate Link Detector PDF:", err);
  } finally {
    setPdfProgress(null);
  }
};
