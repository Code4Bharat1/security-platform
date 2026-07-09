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
    doc.text("NEXCORE ALLIANCE", 14, 30);

    doc.setFont("helvetica", "oblique");
    doc.setFontSize(10);
    doc.text("AI-Powered Cybersecurity & Information Security Solutions", 14, 36);

    // Divider
    doc.setDrawColor(...C.bluePrimary);
    doc.setLineWidth(0.4);
    doc.line(14, 40, 196, 40);

    // Tool title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(...C.bluePrimary);
    doc.text("LINK DETECTOR", 105, 58, { align: "center" });

    doc.setFontSize(13);
    doc.text("SECURITY ASSESSMENT REPORT", 105, 65, { align: "center" });

    // Double rule
    doc.setDrawColor(...C.bluePrimary);
    doc.setLineWidth(0.25);
    doc.line(14, 70, 196, 70);
    doc.line(14, 71, 196, 71);

    // Assessment Info table
    renderTable(doc, {
      startY: 78,
      head: [],
      body: [
        ["Assessment Performed by", employeeMail],
        ["Employee Name",           employeeName],
        ["Employee Mail ID",        employeeMail],
        ["Analysed URL / Target",   analyzedUrl],
        ["Verdict",                 verdict.toUpperCase()],
        ["Trust Index",             `${trustIndex} / 100`],
        ["Risk Classification",     riskLabel],
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
    // PAGE 2 — ASSESSMENT INFORMATION
    // ════════════════════════════════════════════════════════════════════════
    setPdfProgress("Building assessment information...");
    doc.addPage();

    let y = drawSectionHeader(doc, "1. ASSESSMENT INFORMATION", 25);

    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Tool Name",             "Link Detector"],
        ["Tool Category",         "Threat Intelligence / URL Safety Analysis"],
        ["Methodology Alignment", "VirusTotal Correlation / PhishTank / Google Safe Browsing / Blacklist Matching"],
        ["Compliance Alignment",  "ISO/IEC 27001 | AICPA SOC Frameworks"],
        ["Analysed Target",       analyzedUrl],
        ["Assessment Mode",       "Passive / API-based URL Safety Lookup"],
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
      "The Link Detector tool performs comprehensive URL safety analysis by following redirect chains, resolving final destination URLs, and cross-referencing targets against multiple threat intelligence feeds. The tool evaluates TLS/SSL certificate validity, detects typosquatting attempts against known brand domains, expands shortened URLs to reveal real destinations, performs CNAME chain traversal to uncover hidden hosting infrastructure, and inspects page content for cryptominers, suspicious eval calls, and form patterns. Each scan produces a Trust Index score (0–100) and a verdict of Safe, Suspicious, Malicious, or Invalid. Geolocation and ASN data are resolved for the destination IP to support threat attribution.";
    doc.text(overviewText, 14, y + 6, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 3 — URL ANALYSIS RESULTS
    // ════════════════════════════════════════════════════════════════════════
    setPdfProgress("Building analysis results...");
    doc.addPage();

    if (!isBulk) {
      // ── Single scan ────────────────────────────────────────────────────
      y = drawSectionHeader(doc, "2. URL ANALYSIS RESULTS", 25);

      // Core info table
      renderTable(doc, {
        startY: y,
        head: [],
        body: [
          ["Analysed URL",        safe(r.url)],
          ["Final Resolved URL",  safe(r.finalUrl)],
          ["Verdict",             verdict.toUpperCase()],
          ["Trust Index",         `${trustIndex} / 100`],
          ["Risk Level",          riskLabel],
          ["Scan Message",        safe(r.message)],
          ["HTTPS / SSL",         r.ssl?.isHttps ? "Yes — Secure" : "No — Not Secure"],
          ["Onion / Tor Link",    r.onion ? "Yes" : "No"],
          ["Server IP",           safe(r.geo?.ip)],
          ["Country",             safe(r.geo?.country)],
          ["Region",              safe(r.geo?.region)],
          ["City",                safe(r.geo?.city)],
          ["Scanned At",          r.scannedAt ? new Date(r.scannedAt).toLocaleString() : "—"],
        ],
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
          1: { cellWidth: 127 },
        },
      });

      y = doc.lastAutoTable.finalY + 12;

      // ── Redirect chain ─────────────────────────────────────────────────
      y = drawSectionHeader(doc, "3. REDIRECT CHAIN", y);

      const redirectRows = (r.redirectChain || []).length > 0
        ? (r.redirectChain || []).map((u, i) => [String(i + 1), u])
        : [["—", "No redirects detected"]];

      renderTable(doc, {
        startY: y,
        head: [["#", "URL Hop"]],
        body: redirectRows,
        columnStyles: {
          0: { cellWidth: 12, halign: "center", fontStyle: "bold" },
          1: { cellWidth: 170 },
        },
      });

      y = doc.lastAutoTable.finalY + 12;

      // ── Suspicious indicators ──────────────────────────────────────────
      if (297 - y < 55) { doc.addPage(); y = 25; }
      y = drawSectionHeader(doc, "4. SUSPICIOUS INDICATORS", y);

      renderTable(doc, {
        startY: y,
        head: [["Indicator", "Value"]],
        body: [
          ["Suspicious Keywords Found",  safe((r.suspicious?.keywordsFound || []).join(", ") || "None")],
          ["Typosquat Of",               safe(r.suspicious?.typosquatOf)],
          ["Shortener Expanded",         r.suspicious?.shortenerExpanded ? "Yes" : "No"],
          ["Suspicious Domain",          r.suspicious?.suspiciousDomain  ? "Yes" : "No"],
          ["CNAME Chain",                (r.suspicious?.cnameChain || []).length
            ? r.suspicious.cnameChain.join(" → ")
            : "—"],
          ["Blacklist Matches",          safe((r.suspicious?.blacklistMatches || []).join(", ") || "None")],
        ],
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 60, fillColor: [245, 245, 245] },
          1: { cellWidth: 122 },
        },
      });

      y = doc.lastAutoTable.finalY + 12;

      // ── Content findings ───────────────────────────────────────────────
      if (297 - y < 55) { doc.addPage(); y = 25; }
      y = drawSectionHeader(doc, "5. CONTENT ANALYSIS FINDINGS", y);

      renderTable(doc, {
        startY: y,
        head: [["Content Indicator", "Detected Value"]],
        body: [
          ["CryptoMiner Detected",      r.contentFindings?.hasCryptoMiner        ? "YES — Cryptominer script found" : "No"],
          ["Suspicious Inline Eval",    r.contentFindings?.suspiciousInlineEval  ? "YES — Suspicious eval() detected" : "No"],
          ["External JS Scripts Count", safe(r.contentFindings?.externalJsCount)],
          ["Forms Count",               safe(r.contentFindings?.formsCount)],
        ],
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 70, fillColor: [245, 245, 245] },
          1: { cellWidth: 112 },
        },
        didParseCell: (data) => {
          if (data.section === "body" && data.column.index === 1) {
            const val = String(data.cell.raw || "");
            if (val.startsWith("YES")) {
              data.cell.styles.textColor = C.red;
              data.cell.styles.fontStyle = "bold";
            }
          }
        },
      });

    } else {
      // ── Bulk scan table ────────────────────────────────────────────────
      y = drawSectionHeader(doc, "2. BULK SCAN RESULTS", 25);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...C.textMain);
      doc.text(`Total URLs scanned: ${bulk.length}`, 14, y);
      y += 8;

      const bulkRows = bulk.map((item, i) => [
        String(i + 1),
        safe(item.url),
        safe(item.status, "—").toUpperCase(),
        safe(item.trustIndex, "—"),
        item.ssl?.isHttps ? "Yes" : "No",
        safe(item.geo?.ip),
        safe(item.geo?.country),
      ]);

      renderTable(doc, {
        startY: y,
        head: [["#", "URL", "Verdict", "Trust", "HTTPS", "IP", "Country"]],
        body: bulkRows,
        columnStyles: {
          0: { cellWidth: 8,  halign: "center" },
          1: { cellWidth: 68 },
          2: { cellWidth: 22, fontStyle: "bold" },
          3: { cellWidth: 14, halign: "center" },
          4: { cellWidth: 14, halign: "center" },
          5: { cellWidth: 28 },
          6: { cellWidth: 28 },
        },
        didParseCell: (data) => {
          if (data.column.index === 2 && data.section === "body") {
            const txt = String(data.cell.raw || "").toLowerCase();
            data.cell.styles.textColor = getVerdictColor(txt);
          }
        },
      });

      y = doc.lastAutoTable.finalY + 12;

      // summary counts for bulk
      const counts = { safe: 0, suspicious: 0, malicious: 0, invalid: 0, unknown: 0 };
      bulk.forEach((item) => {
        const s = (item.status || "unknown").toLowerCase();
        if (counts[s] !== undefined) counts[s]++;
        else counts.unknown++;
      });

      if (297 - y < 45) { doc.addPage(); y = 25; }
      y = drawSectionHeader(doc, "3. BULK SCAN SUMMARY", y);

      renderTable(doc, {
        startY: y,
        head: [["Safe", "Suspicious", "Malicious", "Invalid", "Total"]],
        body: [[
          String(counts.safe),
          String(counts.suspicious),
          String(counts.malicious),
          String(counts.invalid),
          String(bulk.length),
        ]],
        headStyles: { fillColor: C.bgHeader, textColor: C.white, halign: "center" },
        bodyStyles: { halign: "center", fontStyle: "bold", fontSize: 10 },
        columnStyles: {
          0: { textColor: [22, 163, 74] },
          1: { textColor: C.amber },
          2: { textColor: C.red },
          3: { textColor: C.gray },
          4: { textColor: C.textMain },
        },
      });
    }

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 4 — SECURITY RISK ASSESSMENT & THREAT INTELLIGENCE
    // ════════════════════════════════════════════════════════════════════════
    setPdfProgress("Building security risk assessment...");
    doc.addPage();

    y = drawSectionHeader(doc, isBulk ? "4. THREAT INTELLIGENCE OVERVIEW" : "6. SECURITY RISK ASSESSMENT", 25);

    // Verdict verdict → impact table
    renderTable(doc, {
      startY: y,
      head: [["Verdict", "Security Impact", "Recommended Action"]],
      body: [
        ["MALICIOUS",   SECURITY_IMPACT_MAP.malicious,   REMEDIATION_MAP.malicious],
        ["SUSPICIOUS",  SECURITY_IMPACT_MAP.suspicious,  REMEDIATION_MAP.suspicious],
        ["SAFE",        SECURITY_IMPACT_MAP.safe,        REMEDIATION_MAP.safe],
        ["INVALID",     SECURITY_IMPACT_MAP.invalid,     REMEDIATION_MAP.invalid],
      ],
      columnStyles: {
        0: { cellWidth: 22, fontStyle: "bold" },
        1: { cellWidth: 76 },
        2: { cellWidth: 84 },
      },
      didParseCell: (data) => {
        if (data.column.index === 0 && data.section === "body") {
          const txt = String(data.cell.raw || "").toLowerCase();
          data.cell.styles.textColor = getVerdictColor(txt);
        }
      },
    });

    y = doc.lastAutoTable.finalY + 12;

    // ── Threat Intelligence Source Reference ──────────────────────────────
    if (297 - y < 60) { doc.addPage(); y = 25; }
    y = drawSectionHeader(doc, isBulk ? "5. THREAT INTELLIGENCE SOURCES" : "7. THREAT INTELLIGENCE SOURCES", y);

    renderTable(doc, {
      startY: y,
      head: [["Intelligence Source", "What It Checks", "Coverage"]],
      body: [
        [
          "VirusTotal Correlation",
          "Cross-references URL against 70+ antivirus and URL scanning engines. Flags malicious, phishing, and malware-distributing URLs.",
          "Global / Multi-engine",
        ],
        [
          "PhishTank",
          "Community-verified phishing URL database. Identifies credential-harvesting pages and brand impersonation attacks.",
          "Global / Phishing-focused",
        ],
        [
          "Google Safe Browsing",
          "Google's threat intelligence feed covering malware, unwanted software, and social engineering pages.",
          "Global / Google ecosystem",
        ],
        [
          "Blacklist Matching",
          "Matches the domain and IP against curated DNS-based blacklists (DNSBL) and threat reputation feeds.",
          "Multi-source / Real-time",
        ],
        [
          "Typosquat Detection",
          "Compares the domain name against a database of known brands to identify lookalike / typosquatted domains.",
          "Brand-specific",
        ],
        [
          "Redirect Chain Analysis",
          "Follows all HTTP redirects to the final destination, exposing cloaked or multi-hop malicious URLs.",
          "Per-scan / Real-time",
        ],
        [
          "Content Inspection",
          "Analyses page source for cryptomining scripts, suspicious eval() patterns, external JS sources, and HTML forms.",
          "Per-page / Real-time",
        ],
        [
          "GeoIP / ASN Resolution",
          "Resolves the destination IP to a geographic region and Autonomous System Number for threat attribution.",
          "Global / Network-level",
        ],
      ],
      columnStyles: {
        0: { cellWidth: 48, fontStyle: "bold", fillColor: [245, 245, 245] },
        1: { cellWidth: 80 },
        2: { cellWidth: 54 },
      },
    });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 5 — CONCLUSION & RECOMMENDATIONS
    // ════════════════════════════════════════════════════════════════════════
    setPdfProgress("Building conclusion...");
    doc.addPage();

    y = drawSectionHeader(doc, isBulk ? "6. CONCLUSION & RECOMMENDATIONS" : "8. CONCLUSION & RECOMMENDATIONS", 25);

    let conclusionText = "";
    if (isBulk) {
      const safeCount      = bulk.filter((i) => (i.status || "").toLowerCase() === "safe").length;
      const suspCount      = bulk.filter((i) => (i.status || "").toLowerCase() === "suspicious").length;
      const malCount       = bulk.filter((i) => (i.status || "").toLowerCase() === "malicious").length;
      const invalidCount   = bulk.filter((i) => (i.status || "").toLowerCase() === "invalid").length;
      conclusionText = `The Link Detector bulk scan analysed ${bulk.length} URLs and returned the following verdicts: ${safeCount} Safe, ${suspCount} Suspicious, ${malCount} Malicious, and ${invalidCount} Invalid.\n\n` +
        (malCount > 0
          ? `${malCount} URL(s) were classified as Malicious. These must be immediately blocked at the organisation's web proxy, DNS filter, or email gateway. Any users who may have accessed these URLs should be investigated for indicators of compromise.\n\n`
          : "") +
        (suspCount > 0
          ? `${suspCount} URL(s) returned Suspicious signals and should be manually reviewed or submitted for sandboxed detonation before being permitted in the environment.\n\n`
          : "") +
        "All flagged URLs should be reported to the relevant threat intelligence platform to contribute to community protection. Regular URL scanning of inbound links — particularly from email, messaging, and third-party integrations — is strongly recommended as part of a proactive security posture.";
    } else {
      conclusionText = `The Link Detector assessment analysed the target URL and returned a verdict of ${verdict.toUpperCase()} with a Trust Index of ${trustIndex}/100 (${riskLabel}).\n\n` +
        `${SECURITY_IMPACT_MAP[(verdict || "").toLowerCase()] || ""}\n\n` +
        `${REMEDIATION_MAP[(verdict || "").toLowerCase()] || ""}\n\n` +
        "Organisations should enforce a URL reputation filtering policy at the email gateway, web proxy, and DNS resolver layers to reduce exposure to malicious links. Threat intelligence feeds should be updated regularly to ensure accurate classification of emerging threats. Users should be trained to report suspicious links through an established security awareness programme.";
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMain);
    doc.text(conclusionText, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.45 });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 6 — APPENDIX
    // ════════════════════════════════════════════════════════════════════════
    setPdfProgress("Building appendix...");
    doc.addPage();

    y = drawSectionHeader(doc, "9. APPENDIX", 25);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Column Reference Guide", 14, y);

    renderTable(doc, {
      startY: y + 5,
      head: [["Column / Field", "Description"]],
      body: [
        ["Verdict",              "Overall safety classification: Safe | Suspicious | Malicious | Invalid."],
        ["Trust Index",          "A numeric score from 0 to 100 indicating the safety confidence of the URL. Higher scores indicate a safer link."],
        ["Risk Level",           "Human-readable risk classification derived from the Trust Index: Low Risk (80–100), Medium Risk (50–79), High Risk (20–49), Critical Risk (0–19)."],
        ["Final Resolved URL",   "The actual destination URL after all HTTP redirects have been followed. Useful for detecting cloaking and redirect-based evasion."],
        ["HTTPS / SSL",          "Indicates whether the final destination uses a valid TLS/SSL certificate (HTTPS). Non-HTTPS sites transmit data in plaintext."],
        ["Onion / Tor Link",     "Flags whether the URL resolves to a .onion Tor hidden service. Onion links are commonly associated with dark web activity."],
        ["Redirect Chain",       "The sequence of URL hops encountered between the original URL and the final destination."],
        ["Suspicious Keywords",  "Words or phrases commonly found in phishing or scam URLs (e.g., 'login', 'verify', 'bank', 'update') detected in the URL path or domain."],
        ["Typosquat Of",         "If the domain closely mimics a well-known brand domain (e.g., 'g00gle.com' vs 'google.com'), the legitimate domain it is impersonating is listed here."],
        ["CNAME Chain",          "The sequence of CNAME DNS records followed to resolve the domain. Long CNAME chains can be used to obscure the true hosting provider."],
        ["Blacklist Matches",    "Threat intelligence blacklists that have flagged this domain or IP as malicious or suspicious."],
        ["CryptoMiner",          "Indicates whether the page source contains scripts associated with browser-based cryptocurrency mining."],
        ["Suspicious Eval",      "Flags the presence of obfuscated JavaScript using eval() which is a common technique in malware delivery and XSS attacks."],
        ["External JS Count",    "Number of external JavaScript sources loaded by the page. A high count may indicate supply-chain risk."],
        ["Forms Count",          "Number of HTML forms detected on the page. High form counts on unknown sites may indicate phishing or data-harvesting pages."],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50, fillColor: [245, 245, 245] },
        1: { cellWidth: 132 },
      },
    });

    y = doc.lastAutoTable.finalY + 12;

    if (297 - y < 40) { doc.addPage(); y = 25; }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Acknowledgement", 14, y);

    const ackText =
      "The findings presented in this report are based on observations made during the assessment period and represent the URL safety posture at the time of scanning. Threat intelligence classifications may change as new indicators are published. This report contains confidential and proprietary information intended solely for the authorised recipient. Unauthorised disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMain);
    doc.text(ackText, 14, y + 6, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });

    // ── Apply header / footer decorator on all pages ───────────────────────
    applyHeaderFooterDecorator(doc, "Link Detector");

    // ── Save ──────────────────────────────────────────────────────────────
    setPdfProgress("Saving PDF...");
    doc.save(`LinkDetector-Report-${Date.now()}.pdf`);

  } catch (err) {
    console.error("Failed to generate Link Detector PDF:", err);
  } finally {
    setPdfProgress(null);
  }
};
