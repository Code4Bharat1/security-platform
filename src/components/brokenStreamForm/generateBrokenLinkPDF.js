import { jsPDF } from "jspdf";
import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../utils/pdfFramework";

// Static lookup map for Security Impact and Remediation Guidance
const findingsLookup = {
  "status:2xx": {
    impact: "The hyperlink is fully functional and resolves successfully. No security or user experience impact detected.",
    remediation: "No remediation required. Continue normal operational checks."
  },
  "status:3xx": {
    impact: "The resource redirects to another location. Excessive redirects degrade page load times, impact search engine optimization (SEO) performance, and can introduce open-redirect security risks if target parameters are user-controlled.",
    remediation: "Update the link directly to the final destination URL to avoid unnecessary redirect hops."
  },
  "status:4xx": {
    impact: "A broken link leading to an invalid or missing resource (e.g., 404 Not Found) harms SEO rankings, degrades user experience, and may point to an expired domain or service that can be registered by a third party, exposing users to broken link hijacking.",
    remediation: "Remove the link or update it to point to a valid, existing destination. Verify the domain registration status of external links."
  },
  "status:5xx": {
    impact: "The server hosting the resource returned a server error (e.g., 500 Internal Server Error). This prevents users from accessing the intended resource and indicates potential server-side instability or misconfiguration.",
    remediation: "Coordinate with the external resource administrator to resolve server exceptions, or temporarily disable the link until service is restored."
  }
};

const getFindingDetails = (status, statusText) => {
  const statusCode = parseInt(status, 10);
  
  let statusKey = "status:4xx";
  if (statusCode >= 200 && statusCode < 300) statusKey = "status:2xx";
  else if (statusCode >= 300 && statusCode < 400) statusKey = "status:3xx";
  else if (statusCode >= 500 && statusCode < 600) statusKey = "status:5xx";

  const details = findingsLookup[statusKey];

  // Map Link Status
  let linkStatus = "Broken";
  if (statusCode >= 200 && statusCode < 300) linkStatus = "Working";
  else if (statusCode >= 300 && statusCode < 400) linkStatus = "Redirected";

  // Map Error Reason
  let errorReason = statusText || "—";
  if (!statusText || statusText === "—") {
    if (statusCode === 404) errorReason = "Not Found";
    else if (statusCode === 403) errorReason = "Forbidden";
    else if (statusCode === 401) errorReason = "Unauthorized";
    else if (statusCode === 500) errorReason = "Internal Server Error";
    else if (statusCode === 502) errorReason = "Bad Gateway";
    else if (statusCode === 503) errorReason = "Service Unavailable";
    else if (statusCode === 504) errorReason = "Gateway Timeout";
    else if (isNaN(statusCode) || statusCode === 0) errorReason = "Connection Timeout / Network Error";
  }

  return {
    linkStatus,
    errorReason,
    impact: details.impact,
    remediation: details.remediation
  };
};

export const generateBrokenLinkPDF = async (items = [], summary = null, url = "") => {
  const { employeeName, employeeMail } = getAuditorInfo();
  
  // Format Date & Time
  const now = new Date();
  const scanDate = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  const scanTime = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  try {
    const doc = new jsPDF("p", "mm", "a4");
    const domain = safe(url || "Unknown Target").replace(/^https?:\/\//, "").split("/")[0];

    // Compute metrics if summary is null
    const totalLinks = summary?.total ?? items.length;
    const workingLinks = summary?.working ?? items.filter(i => parseInt(i.status, 10) >= 200 && parseInt(i.status, 10) < 300).length;
    const brokenLinks = summary?.broken ?? items.filter(i => parseInt(i.status, 10) >= 400 || isNaN(parseInt(i.status, 10))).length;
    const redirectLinks = summary?.redirects ?? items.filter(i => parseInt(i.status, 10) >= 300 && parseInt(i.status, 10) < 400).length;
    
    const internalLinks = items.filter(i => String(i.scope).toLowerCase() === "internal").length;
    const externalLinks = items.filter(i => String(i.scope).toLowerCase() === "external").length;

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 1 — COVER PAGE & ASSESSMENT INFORMATION
    // ══════════════════════════════════════════════════════════════════════
    
    // Brand header
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – Broken Link Checker", 14, 12);

    // Company logo
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

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...C.bluePrimary);
    doc.text("BROKEN LINK CHECKER SECURITY ASSESSMENT REPORT", 105, 54, { align: "center" });

    // Divider line below title
    doc.line(14, 65, 196, 65);

    // Assessment Info Table
    renderTable(doc, {
      startY: 72,
      head: [],
      body: [
        ["Assessment Performed by", employeeMail],
        ["Employee Name",           employeeName],
        ["Employee Mail ID",        employeeMail],
        ["Scanned URL",             url],
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
    // PAGE 2 — TOOL DETAILS & CRAWL OVERVIEW
    // ══════════════════════════════════════════════════════════════════════
    doc.addPage();

    let y = drawSectionHeader(doc, "1. ASSESSMENT INFORMATION", 25);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Tool Details", 14, y);
    y += 5;

    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Tool Name",             "Broken Link Checker"],
        ["Tool Category",         "Web Crawl / Link Integrity Scanner"],
        ["Methodology Alignment", "OWASP WSTG – OTG-CONFIG / Client-Side Testing"],
        ["Compliance Alignment",  "ISO/IEC 27001 | AICPA SOC Frameworks"],
        ["Scanned URL",           url],
        ["Assessment Mode",       "Automated Crawl"]
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 }
      }
    });

    y = doc.lastAutoTable.finalY + 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Tool Overview", 14, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    const overviewText = "The Broken Link Checker tool crawls the target website and identifies all hyperlinks — internal and external — that return error responses, redirect chains, or are otherwise unreachable. Broken links degrade user experience, harm SEO ranking, and can expose residual attack surfaces such as domain-takeover risks on expired external resources.";
    doc.text(overviewText, 14, y + 5, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 3 — SCAN SUMMARY & DETAILED FINDINGS
    // ══════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = drawSectionHeader(doc, "2. SCAN SUMMARY", 25);

    renderTable(doc, {
      startY: y,
      head: [["Total Links Scanned", "Working links", "Broken links", "Internal links", "External links"]],
      body: [[
        String(totalLinks),
        String(workingLinks),
        String(brokenLinks),
        String(internalLinks),
        String(externalLinks)
      ]],
      headStyles: {
        fillColor: C.bgHeader,
        textColor: C.white,
        halign: "center",
      },
      bodyStyles: {
        halign: "center",
        fontSize: 8.5,
        fontStyle: "bold"
      }
    });

    y = doc.lastAutoTable.finalY + 10;

    y = drawSectionHeader(doc, "3. DETAILED FINDINGS", y);

    if (items.length === 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...C.textMain);
      doc.text("No broken or redirected link findings recorded for the target.", 14, y);
      y += 10;
    } else {
      items.forEach((item, index) => {
        const details = getFindingDetails(item.status, item.statusText);
        
        if (297 - y < 75) {
          doc.addPage();
          y = 25;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(...C.bluePrimary);
        doc.text(`Finding ${String(index + 1).padStart(2, "0")} of ${String(items.length).padStart(2, "0")} — ${item.url}`, 14, y);
        y += 4;

        renderTable(doc, {
          startY: y,
          head: [],
          body: [
            ["Link Status",     details.linkStatus],
            ["Status Code",     String(item.status || "—")],
            ["Error reason",    details.errorReason],
            ["Anchor Text",     safe(item.anchorText)],
            ["URL",             safe(item.url)],
            ["Destination URL", safe(item.finalUrl)],
            ["Scope",           safe(item.scope)],
            ["Impact",          details.impact],
            ["Remediation",     details.remediation]
          ],
          columnStyles: {
            0: { fontStyle: "bold", cellWidth: 40, fillColor: [245, 245, 245] },
            1: { cellWidth: 142 }
          },
          didParseCell: (data) => {
            if (data.column.index === 1 && data.row.index === 0) {
              const statusVal = String(data.cell.raw || "").toLowerCase();
              if (statusVal === "broken") {
                data.cell.styles.textColor = C.red;
                data.cell.styles.fontStyle = "bold";
              } else if (statusVal === "redirected") {
                data.cell.styles.textColor = C.amber;
                data.cell.styles.fontStyle = "bold";
              } else {
                data.cell.styles.textColor = C.blue;
                data.cell.styles.fontStyle = "bold";
              }
            }
          }
        });

        y = doc.lastAutoTable.finalY + 8;
      });
    }

    // ══════════════════════════════════════════════════════════════════════
    // CONCLUSION & RECOMMENDATIONS
    // ══════════════════════════════════════════════════════════════════════
    if (297 - y < 75) {
      doc.addPage();
      y = 25;
    }

    y = drawSectionHeader(doc, "4. CONCLUSION & RECOMMENDATIONS", y);

    const conclusionParagraphs = [
      `The Broken Link Checker assessment identified a total of ${totalLinks} links across the scanned URL, comprising ${brokenLinks} broken links, ${redirectLinks} redirects, and ${workingLinks} working links. Broken links — particularly those returning 404 responses — should be prioritized for immediate remediation to preserve user experience, avoid SEO penalties, and eliminate potential domain-takeover risks on expired external resources.`,
      "It is recommended to implement an automated link-monitoring process on a scheduled basis (weekly/monthly) to detect newly introduced broken links as site content evolves. All external links should be reviewed for subdomain or domain expiry risks that may enable malicious takeover."
    ];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    
    conclusionParagraphs.forEach((para) => {
      if (297 - y < 20) {
        doc.addPage();
        y = 25;
      }
      doc.text(para, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });
      const lines = doc.splitTextToSize(para, 182);
      y += (lines.length * 4) + 4;
    });

    // ══════════════════════════════════════════════════════════════════════
    // APPENDIX
    // ══════════════════════════════════════════════════════════════════════
    if (297 - y < 65) {
      doc.addPage();
      y = 25;
    }

    y = drawSectionHeader(doc, "5. APPENDIX", y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Column Reference Guide", 14, y);

    renderTable(doc, {
      startY: y + 5,
      head: [["Column", "Description"]],
      body: [
        ["Total Links Scanned", "Total number of hyperlinks analyzed during the broken link assessment."],
        ["Working Links",       "Number of links that responded successfully and are accessible (typically HTTP 2xx responses)."],
        ["Broken Links",        "Number of links identified as inaccessible, invalid, or returning error responses (e.g., HTTP 4xx or 5xx)."],
        ["Internal Links",      "Total number of hyperlinks pointing to resources within the same domain."],
        ["External Links",      "Total number of hyperlinks pointing to resources hosted on external domains."],
        ["Link Status",         "Indicates the accessibility status of the evaluated hyperlink (e.g., Working, Broken, Redirected)."],
        ["Status Code",         "HTTP response code returned by the destination URL (e.g., 200, 301, 302, 404, 500)."],
        ["Error Reason",        "Description of the error encountered during link validation, such as Not Found, Forbidden, Internal Server Error, or Connection Timeout."],
        ["Anchor Text",         "Clickable text associated with the hyperlink on the source page."],
        ["URL",                 "Source webpage containing the hyperlink that was analyzed."],
        ["Destination URL",     "Target URL to which the hyperlink points after any redirects are processed."],
        ["Scope",               "Specifies whether the hyperlink is classified as an Internal or External link."],
        ["Impact",              "Describes the potential impact of the broken or inaccessible link, such as degraded user experience, SEO issues, navigation problems, or reduced website reliability."],
        ["Remediation",         "Recommended corrective action, such as updating the hyperlink, correcting the destination URL, replacing invalid links, or removing obsolete references."]
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 40, fillColor: [245, 245, 245] },
        1: { cellWidth: 142 }
      }
    });

    y = doc.lastAutoTable.finalY + 10;

    if (297 - y < 45) {
      doc.addPage();
      y = 25;
    }

    // Acknowledgement
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Acknowledgement", 14, y);

    const ackText = "The findings presented in this report are based on observations made during the assessment period and represent the link integrity status of the environment at the time of scanning. This report contains confidential and proprietary information intended solely for the authorized recipient. Unauthorized disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.";
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(ackText, 14, y + 5, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });

    // Apply header & footer decorator to all pages
    applyHeaderFooterDecorator(doc, "Broken Link Checker");

    doc.save(`${domain}-Broken-Links-Report-${Date.now()}.pdf`);
  } catch (err) {
    console.error("Failed to generate Broken Link Checker PDF report:", err);
  }
};
