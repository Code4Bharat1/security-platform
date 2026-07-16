// generateDataBreachPDF.js
// Unified PDF exporter for the DATA BREACH (OSINT) tool.
// Reuses shared design system from src/utils/pdfFramework.js — no duplicate styling.

import { jsPDF } from "jspdf";
import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../utils/pdfFramework";

// ── ASCII-safe helper ──────────────────────────────────────────────────────────
const pdfSafe = (str) =>
  safe(str)
    .replace(/[→←↑↓►◄▶◀•·–—]/g, "-")
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/\s+/g, " ")
    .trim();

// ── Status color helper ────────────────────────────────────────────────────────
const statusColor = (status) => {
  switch ((status || "").toLowerCase()) {
    case "found":     return C.red;
    case "not_found": return [22, 163, 74];
    case "invalid":
    case "error":     return C.amber;
    default:          return C.gray;
  }
};

// ── Status display label ───────────────────────────────────────────────────────
const statusLabel = (status) => {
  switch ((status || "").toLowerCase()) {
    case "found":     return "FOUND";
    case "not_found": return "NOT FOUND";
    case "invalid":   return "INVALID";
    case "error":     return "ERROR";
    default:          return (status || "UNKNOWN").toUpperCase();
  }
};

// ── Main export function ────────────────────────────────────────────────────────
// Parameters (from the OSINT API response):
//   queryType  {string}   — "username" | "email" | "phone"
//   queryValue {string}   — the actual searched identifier
//   details    {object[]} — array of { platform, status, url, note, error }
export const generateDataBreachPDF = ({
  queryType  = "username",
  queryValue = "",
  details    = [],
} = {}) => {
  const { employeeName, employeeMail } = getAuditorInfo();

  const now = new Date();
  const scanDate = now
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase();
  const scanTime = now.toLocaleTimeString("en-GB", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });

  const totalChecked  = details.length;
  const foundCount    = details.filter((d) => d.status === "found").length;
  const notFoundCount = details.filter((d) => d.status === "not_found").length;
  const errorCount    = details.filter((d) => ["error", "invalid"].includes(d.status)).length;
  const exposureRate  = totalChecked > 0 ? Math.round((foundCount / totalChecked) * 100) : 0;

  const riskBand =
    exposureRate >= 60 ? "High Exposure"    :
    exposureRate >= 30 ? "Medium Exposure"  :
    foundCount    >  0 ? "Low Exposure"     : "No Exposure Detected";

  const riskColor =
    exposureRate >= 60 ? C.red   :
    exposureRate >= 30 ? C.amber :
    foundCount    >  0 ? C.blue  : [22, 163, 74];

  const queryTypeLabel =
    queryType === "username" ? "Username / Handle" :
    queryType === "email"    ? "Email Address"     :
    queryType === "phone"    ? "Phone Number"      :
    pdfSafe(queryType);

  try {
    const doc = new jsPDF("p", "mm", "a4");

    // ═══════════════════════════════════════════════════════════════════════
    // PAGE 1 — COVER PAGE
    // ═══════════════════════════════════════════════════════════════════════
    doc.setFillColor(...C.bluePrimary);
    doc.rect(0, 0, 210, 3.5, "F");

    // Header label
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – Data Breach Detector", 14, 12);

    // Company name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(...C.bluePrimary);
    doc.text("NEXCORE ALLIANCE", 105, 30, { align: "center" });

    // Tagline
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(...C.textMuted);
    doc.text("AI-Powered Cybersecurity & Information Security Solutions", 105, 36, { align: "center" });

    // Divider
    doc.setDrawColor(...C.bluePrimary);
    doc.setLineWidth(0.4);
    doc.line(14, 40, 196, 40);

    // Report title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...C.bluePrimary);
    doc.text("DATA BREACH & OSINT EXPOSURE", 105, 53, { align: "center" });
    doc.text("ASSESSMENT REPORT", 105, 60, { align: "center" });

    doc.line(14, 65, 196, 65);

    // Assessment info table
    renderTable(doc, {
      startY: 72,
      head: [],
      body: [
        ["Assessment Performed by", employeeMail],
        ["Auditor Name",            employeeName],
        ["Auditor Mail ID",         employeeMail],
        ["Query Type",              queryTypeLabel],
        ["Target Identifier",       pdfSafe(queryValue) || "—"],
        ["Platforms Audited",       String(totalChecked)],
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

    doc.line(14, 265, 196, 265);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text(
      "www.nexcorealliance.com | ISO/IEC 27001 Certified | AICPA SOC Compliant",
      105, 272, { align: "center" }
    );

    // ═══════════════════════════════════════════════════════════════════════
    // PAGE 2 — ASSESSMENT INFORMATION
    // ═══════════════════════════════════════════════════════════════════════
    doc.addPage();
    let y = 25;

    y = drawSectionHeader(doc, "1. ASSESSMENT INFORMATION", y);

    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Tool Name",             "Data Breach & OSINT Exposure Detector"],
        ["Tool Category",         "Digital Footprint Analysis / Credential Exposure / Account Enumeration"],
        ["Methodology Alignment", "OSINT Framework | OWASP Testing Guide (OTG-INFO) | NIST SP 800-115"],
        ["Compliance Alignment",  "GDPR Article 33 (Breach Notification) | NIST SP 800-61 | ISO/IEC 27035"],
        ["Query Type",            queryTypeLabel],
        ["Target Identifier",     pdfSafe(queryValue) || "—"],
        ["Platforms Audited",     String(totalChecked)],
        ["Accounts Found",        String(foundCount)],
        ["Exposure Rate",         `${exposureRate}% (${foundCount} of ${totalChecked} platforms)`],
        ["Scan Method",           "HTTP presence check against public profile endpoints with response analysis"],
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
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(
      "The Data Breach & OSINT Exposure Detector scans public-facing platform endpoints to determine whether a given username, email address, or phone number has an established presence or has been exposed across commonly targeted social, professional, and communications platforms. Each platform is queried via its public URL with anti-bot evasion headers. Response status codes and page content are analyzed to classify the result as Found (active profile detected), Not Found (no profile detected), or Error (platform blocked or unreachable). This intelligence is used to assess a target's digital footprint and credential reuse risk surface.",
      14, y,
      { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 }
    );

    // ═══════════════════════════════════════════════════════════════════════
    // PAGE 3 — SCAN SUMMARY
    // ═══════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    y = drawSectionHeader(doc, "2. SCAN SUMMARY", y);

    // Overall stats row
    renderTable(doc, {
      startY: y,
      head: [["Platforms Checked", "Found", "Not Found", "Errors", "Exposure Rate", "Risk Level"]],
      body: [[
        String(totalChecked),
        String(foundCount),
        String(notFoundCount),
        String(errorCount),
        `${exposureRate}%`,
        riskBand,
      ]],
      headStyles: { fillColor: C.bgHeader, textColor: C.white, halign: "center" },
      columnStyles: {
        0: { halign: "center", cellWidth: 32 },
        1: { halign: "center", cellWidth: 22 },
        2: { halign: "center", cellWidth: 26 },
        3: { halign: "center", cellWidth: 22 },
        4: { halign: "center", cellWidth: 30 },
        5: { halign: "center", cellWidth: 50 },
      },
      didParseCell: (data) => {
        if (data.column.index === 5 && data.section === "body") {
          data.cell.styles.textColor = riskColor;
          data.cell.styles.fontStyle = "bold";
        }
        if (data.column.index === 1 && data.section === "body" && foundCount > 0) {
          data.cell.styles.textColor = C.red;
          data.cell.styles.fontStyle = "bold";
        }
      },
    });
    y = doc.lastAutoTable.finalY + 10;

    // ── Exposure risk highlight box ───────────────────────────────────────
    const boxColor = foundCount > 0
      ? (exposureRate >= 60 ? [254, 242, 242] : [255, 251, 235])
      : [240, 253, 244];
    const boxBorderColor = foundCount > 0
      ? (exposureRate >= 60 ? [220, 53, 69] : [253, 126, 20])
      : [22, 163, 74];
    const boxTextColor = foundCount > 0
      ? (exposureRate >= 60 ? C.red : C.amber)
      : [22, 163, 74];

    doc.setFillColor(...boxColor);
    doc.setDrawColor(...boxBorderColor);
    doc.setLineWidth(0.5);
    doc.roundedRect(14, y, 182, 22, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...boxTextColor);
    const boxTitle = foundCount > 0
      ? `[!] EXPOSURE ALERT — ${foundCount} platform${foundCount > 1 ? "s" : ""} returned an active profile for "${pdfSafe(queryValue)}"`
      : `[OK] No active profiles detected for "${pdfSafe(queryValue)}" across ${totalChecked} platforms`;
    doc.text(pdfSafe(boxTitle), 20, y + 9);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...C.textMain);
    const boxSub = foundCount > 0
      ? `Exposure Rate: ${exposureRate}% | Risk Band: ${riskBand} | Immediate review recommended for found platforms.`
      : `All ${totalChecked} platform checks returned no profile. Digital footprint for this identifier appears minimal.`;
    doc.text(pdfSafe(boxSub), 20, y + 17);
    y += 30;

    // ═══════════════════════════════════════════════════════════════════════
    // PAGE 4 — DETAILED PLATFORM FINDINGS
    // ═══════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    y = drawSectionHeader(doc, "3. DETAILED PLATFORM FINDINGS", y);

    const detailRows = details.map((d, i) => [
      String(i + 1),
      pdfSafe(d.platform),
      statusLabel(d.status),
      pdfSafe(d.url || "—"),
      pdfSafe(d.note || d.error || "—"),
    ]);

    renderTable(doc, {
      startY: y,
      head: [["#", "Platform", "Status", "Profile URL", "Notes / Errors"]],
      body: detailRows,
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 32, fontStyle: "bold" },
        2: { cellWidth: 24, halign: "center" },
        3: { cellWidth: 72 },
        4: { cellWidth: 44 },
      },
      didParseCell: (data) => {
        if (data.column.index === 2 && data.section === "body") {
          const raw = String(data.cell.raw || "").toLowerCase();
          if (raw === "found") {
            data.cell.styles.textColor = C.red;
            data.cell.styles.fontStyle = "bold";
          } else if (raw === "not found") {
            data.cell.styles.textColor = [22, 163, 74];
            data.cell.styles.fontStyle = "bold";
          } else {
            data.cell.styles.textColor = C.amber;
          }
        }
      },
    });

    // ═══════════════════════════════════════════════════════════════════════
    // PAGE 5 — FOUND PROFILES (FOCUSED VIEW) + CONCLUSION
    // ═══════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    const foundPlatforms = details.filter((d) => d.status === "found");

    if (foundPlatforms.length > 0) {
      y = drawSectionHeader(doc, "4. ACTIVE PROFILES DETECTED — PRIORITY REVIEW", y);

      renderTable(doc, {
        startY: y,
        head: [["Platform", "Profile URL", "Risk Implication"]],
        body: foundPlatforms.map((d) => [
          pdfSafe(d.platform),
          pdfSafe(d.url || "N/A"),
          "Active profile detected — credentials may be reused or exposed via this platform's breach history.",
        ]),
        headStyles: { fillColor: C.red, textColor: C.white },
        columnStyles: {
          0: { cellWidth: 30, fontStyle: "bold" },
          1: { cellWidth: 70 },
          2: { cellWidth: 82 },
        },
      });
      y = doc.lastAutoTable.finalY + 12;
    }

    y = drawSectionHeader(doc, "5. CONCLUSION & RECOMMENDATIONS", y);

    const conclusionText = foundCount > 0
      ? `The OSINT data breach scan for ${queryTypeLabel} "${pdfSafe(queryValue)}" identified active profiles on ${foundCount} of ${totalChecked} audited platforms, yielding an exposure rate of ${exposureRate}%. ${exposureRate >= 60 ? "This represents a HIGH exposure risk — the identifier is broadly discoverable and likely indexed in aggregated breach databases. " : exposureRate >= 30 ? "This represents MEDIUM exposure — the identifier appears on multiple platforms and warrants credential hygiene review. " : "This represents LOW but non-zero exposure — at least one platform returned an active presence. "} Found platforms should be treated as potential credential leakage surfaces, particularly if the same password has been reused across accounts.`
      : `The OSINT data breach scan for ${queryTypeLabel} "${pdfSafe(queryValue)}" returned no active profiles across all ${totalChecked} audited platforms. No public digital footprint was detected for this identifier at this time. This does not guarantee the identifier has never been part of a private breach database — dedicated breach notification services (e.g. HaveIBeenPwned) should be consulted for email-based checks.`;

    const recommendationText = "Recommendations: (1) Enable multi-factor authentication (MFA) on all detected platforms to prevent account takeover even if credentials are leaked. (2) Use unique randomized passwords for each platform — a password manager prevents reuse. (3) Monitor for new breach notifications via HaveIBeenPwned.com or similar services and enable breach alerting where supported. (4) Review privacy settings on all found platforms to minimize publicly discoverable information. (5) Consider rotating the email address or username used as the primary identifier on high-risk platforms (e.g. financial, healthcare) if significant exposure is detected.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(pdfSafe(conclusionText), 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });
    y += 38;
    doc.text(pdfSafe(recommendationText), 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });
    y += 42;

    y = drawSectionHeader(doc, "6. APPENDIX — COLUMN REFERENCE", y);

    renderTable(doc, {
      startY: y,
      head: [["Column / Field", "Description"]],
      body: [
        ["Platform",       "The social, professional, or communication platform queried during the scan"],
        ["Status: FOUND",  "An HTTP 200 response was received and page content did not match known 'not found' patterns — a profile likely exists"],
        ["Status: NOT FOUND", "Response indicated no profile exists (404, or known not-found page content matched)"],
        ["Status: ERROR",  "Platform blocked the request, rate-limited the agent, or connection timed out — result is inconclusive"],
        ["Profile URL",    "The public endpoint queried to check for the profile — link to the profile if found"],
        ["Exposure Rate",  "Percentage of audited platforms where an active profile was detected"],
        ["Risk Level",     "Composite risk band: High (>=60% exposure), Medium (>=30%), Low (<30% with finds), None (0%)"],
      ],
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 42 },
        1: { cellWidth: 140 },
      },
    });
    y = doc.lastAutoTable.finalY + 12;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Disclaimer", 14, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(
      "This report is generated from automated OSINT enumeration using public platform endpoints and does not constitute a full security audit. Platform blocking, rate-limiting, or anti-bot measures may cause false negatives (profiles exist but were not detected). This tool does not access private breach databases — for comprehensive breach history, consult specialized services. This report contains confidential information intended solely for the authorized recipient. Unauthorized disclosure, reproduction, or transmission is prohibited without prior written consent from Nexcore Alliance.",
      14, y,
      { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 }
    );

    applyHeaderFooterDecorator(doc, "Data Breach Detector");
    doc.save(`Data_Breach_Report_${pdfSafe(queryValue) || "scan"}_${scanDate}.pdf`);
  } catch (err) {
    console.error("Failed to generate Data Breach PDF:", err);
  }
};
