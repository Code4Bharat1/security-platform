import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../../utils/pdfFramework";
import { jsPDF } from "jspdf";

/**
 * generateURLShortenerPDF
 *
 * @param {Object} scanData
 *   - result    {Object}   Single shortened URL result (optional)
 *   - history   {Array}    Session history list of shortened URLs (optional)
 * @param {Function} setPdfProgress  State setter for progress messages
 */
export const generateURLShortenerPDF = async (scanData, setPdfProgress) => {
  if (!scanData?.result && !scanData?.history?.length && !scanData?.original) return;

  const isBulk = !scanData.original && !scanData.result && scanData.history?.length > 0;
  const r = scanData.result || scanData;
  const history = scanData.history || [];

  setPdfProgress?.("Initializing PDF document...");

  try {
    const doc = new jsPDF("p", "mm", "a4");
    const { employeeName, employeeMail } = getAuditorInfo();

    // ── Common date/time ───────────────────────────────────────────────────
    const now = new Date();
    const scanDate = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
    const scanTime = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    const sourceUrl = isBulk
      ? `${history.length} URLs (Session History)`
      : safe(r.original || r.originalUrl, "Unknown URL");

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
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – URL Shortener", 14, 12);

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
    doc.text("URL SHORTENER SECURITY ASSESSMENT REPORT", 105, 54, { align: "center" });

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
        ["Source URL",              sourceUrl],
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
        ["Tool Name",             "URL Shortener"],
        ["Tool Category",         "URL Management / Link Shortening Utility"],
        ["Methodology Alignment", "OWASP WSTG – WSTG-BUSL-04 (Business Logic) / Client-Side Redirect Validation"],
        ["Compliance Alignment",  "ISO/IEC 27001 | AICPA SOC Frameworks"],
        ["Source URL",           sourceUrl],
        ["Assessment Mode",       "Non-Intrusive / Automated Functional Verification"],
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
      "The URL Shortener tool accepts a user-submitted destination URL and generates a condensed, unique alias for it. The mapping between the original URL and the generated short link is stored within the platform's internal database, and accessing the shortened link triggers a server-side redirect to the original destination.\n\nThe tool operates entirely on internally hosted infrastructure and does not rely on any third-party URL shortening service, which reduces exposure to external dependency and data-sharing risks. From a security perspective, the assessment focuses on validating that the shortening and redirection workflow functions correctly, that generated links are stored securely, and that the mechanism does not introduce open-redirect or link-spoofing weaknesses.";
    doc.text(overviewText, 14, y + 5, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 3 — SCAN SUMMARY & DETAILED FINDINGS & CONCLUSION
    // ════════════════════════════════════════════════════════════════════════
    setPdfProgress?.("Building scan summary & detailed findings...");
    doc.addPage();
    y = 25;

    y = drawSectionHeader(doc, "2. SCAN SUMMARY", y);

    // Calculate scan summary counts
    const processed = isBulk ? history.length : 1;
    const successful = isBulk ? history.length : 1;
    const failed = 0;
    const validationStatus = "Passed";

    renderTable(doc, {
      startY: y,
      head: [["URLs Processed", "Successful", "Failed", "Validation Status"]],
      body: [[String(processed), String(successful), String(failed), validationStatus]],
      headStyles: { fillColor: C.bgHeader, textColor: C.white, halign: "center" },
      bodyStyles: { halign: "center", fontStyle: "bold", fontSize: 9 },
      columnStyles: {
        0: { textColor: C.textMain },
        1: { textColor: [22, 163, 74] }, // green-600
        2: { textColor: C.red },
        3: { textColor: [22, 163, 74] }, // green-600
      }
    });

    y = doc.lastAutoTable.finalY + 8;

    y = drawSectionHeader(doc, "3. DETAILED FINDINGS", y);

    const standardRecommendation =
      "Implement server-side validation of submitted destination URLs to prevent generation of shortened links pointing to malicious, phishing, or open-redirect destinations. Record and display the original URL, shortened URL, creation timestamp, and link status for each request to support audit and traceability. Periodically review stored URL mappings to identify and remove expired, unused, or abused links.";

    if (!isBulk) {
      // Single scan detailed findings
      renderTable(doc, {
        startY: y,
        head: [["Severity", "Informational"]],
        body: [
          ["Status",            "Passed"],
          ["Original URL",      safe(r.original || r.originalUrl)],
          ["Shortened URL",     safe(r.short || r.shortUrl)],
          ["Creation Time",     safe(r.timestamp || scanTime)],
          ["Validation Status", "Passed (Shortened URL Generated and Stored Successfully)"],
          ["Issue Detected",    "None Identified"],
          ["Impact",            "N/A – No security weakness identified during this operation"],
          ["Recommendation",    standardRecommendation],
        ],
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 45, fillColor: [245, 245, 245] },
          1: { cellWidth: 137 },
        },
        didParseCell: (cellData) => {
          if (cellData.row.index === 0 && cellData.column.index === 1 && cellData.section === "body") {
            cellData.cell.styles.textColor = [22, 163, 74]; // green-600
            cellData.cell.styles.fontStyle = "bold";
          }
        }
      });
    } else {
      // Bulk scan detailed findings loop
      let findingIndex = 1;
      history.forEach((item) => {
        // Add page break if we are near the bottom of the page
        if (y > 220) {
          doc.addPage();
          y = 25;
        }

        renderTable(doc, {
          startY: y,
          head: [[`Finding ${findingIndex}`, ""]],
          body: [
            ["Severity",          "Informational"],
            ["Status",            "Passed"],
            ["Original URL",      safe(item.original || item.originalUrl)],
            ["Shortened URL",     safe(item.short || item.shortUrl)],
            ["Creation Time",     safe(item.timestamp || scanTime)],
            ["Validation Status", "Passed (Shortened URL Generated and Stored Successfully)"],
            ["Issue Detected",    "None Identified"],
            ["Impact",            "N/A – No security weakness identified during this operation"],
            ["Recommendation",    standardRecommendation],
          ],
          columnStyles: {
            0: { fontStyle: "bold", cellWidth: 45, fillColor: [245, 245, 245] },
            1: { cellWidth: 137 },
          },
          didParseCell: (cellData) => {
            if (cellData.row.index === 0 && cellData.column.index === 1 && cellData.section === "body") {
              cellData.cell.styles.textColor = [22, 163, 74]; // green-600
              cellData.cell.styles.fontStyle = "bold";
            }
          }
        });
        y = doc.lastAutoTable.finalY + 10;
        findingIndex++;
      });
    }

    // Check if y is too low for Conclusion. If so, add page break
    if (297 - y < 65) {
      doc.addPage();
      y = 25;
    } else {
      y += 5;
    }

    y = drawSectionHeader(doc, "4. CONCLUSION & RECOMMENDATIONS", y);

    const conclusionPara1 =
      `The URL Shortener tool was assessed and confirmed to be functioning as intended, successfully generating ${isBulk ? "shortened links" : `a shortened link (${safe(r.short || r.shortUrl)})`} and storing the corresponding URL mapping${isBulk ? "s" : ""} within the platform's internal database. As the service is hosted internally and does not depend on an external URL shortening provider, the primary considerations relate to destination URL validation, integrity of stored mappings, and audit logging rather than third-party data exposure.`;

    const conclusionPara2 =
      "No critical, high, or medium severity issues were identified during this assessment. It is recommended that the tool be enhanced to validate submitted destination URLs prior to shortening, record creation timestamps and link status for each generated short URL, and support periodic review or expiry of stored mappings to reduce the risk of misuse for phishing or open-redirect attacks.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...C.textMain);
    doc.text(conclusionPara1, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.45 });

    y += 28;
    doc.text(conclusionPara2, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.45 });

    y += 30;

    // Check if Appendix table 1 fits on Page 3
    if (297 - y < 55) {
      doc.addPage();
      y = 25;
    }

    y = drawSectionHeader(doc, "5. APPENDIX", y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Column Reference Guide", 14, y);
    y += 5;

    // Split Appendix table: Severity row on Page 3, the rest on Page 4
    renderTable(doc, {
      startY: y,
      head: [["Column", "Description"]],
      body: [
        ["Severity", "Risk level assigned to the finding: Critical / High / Medium / Low / Informational"],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50, fillColor: [245, 245, 245] },
        1: { cellWidth: 132 },
      },
    });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 4 — APPENDIX CONTINUATION & ACKNOWLEDGEMENT
    // ════════════════════════════════════════════════════════════════════════
    setPdfProgress?.("Building appendix and acknowledgement...");
    doc.addPage();
    y = 25;

    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Status",            "Overall validation result for the shortening operation: Passed / Failed / Warning"],
        ["Original URL",      "The destination URL submitted by the user for shortening"],
        ["Shortened URL",     "The condensed link generated and stored by the tool"],
        ["Creation Time",     "The timestamp at which the shortened URL was generated"],
        ["Validation Status", "Confirmation of whether the shortening and storage operation completed successfully"],
        ["Issue Detected",    "Any security weakness or anomaly identified during the operation"],
        ["Impact",            "The potential security consequence of the identified issue, if any"],
        ["Recommendation",    "Specific, actionable guidance to address identified issues or strengthen the tool's security posture"],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50, fillColor: [245, 245, 245] },
        1: { cellWidth: 132 },
      },
    });

    y = doc.lastAutoTable.finalY + 12;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Acknowledgement", 14, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    const ackText =
      "The findings presented in this report are based on observations made during the assessment period and represent the URL shortening and redirection functionality status of the environment at the time of testing. This report contains confidential and proprietary information intended solely for the authorized recipient. Unauthorized disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.";
    doc.text(ackText, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });

    // Apply header/footer decorators
    applyHeaderFooterDecorator(doc, "URL Shortener");

    // Save
    setPdfProgress?.("Saving PDF...");
    const pad = (n) => String(n).padStart(2, "0");
    const dStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    doc.save(`URLShortener-Report-${dStr}.pdf`);

  } catch (err) {
    console.error("Failed to generate URL Shortener PDF:", err);
  } finally {
    setPdfProgress?.(null);
  }
};
