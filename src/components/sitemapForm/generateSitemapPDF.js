import { jsPDF } from "jspdf";
import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../utils/pdfFramework";

const trim = (str, len) => {
  if (!str) return "";
  return str.length > len ? str.substring(0, len) + "..." : str;
};

export const generateSitemapPDF = async (sitemapData = {}, url = "", depth = 3) => {
  if (!sitemapData) return;

  const { employeeName, employeeMail } = getAuditorInfo();
  const targetUrl = url || "-";
  const s = sitemapData.summary || {};

  try {
    const doc = new jsPDF("p", "mm", "a4");

    // Dates
    const now = new Date();
    const scanDate = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
    const scanTime = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 1 — COVER PAGE
    // ════════════════════════════════════════════════════════════════════════
    // Top blue banner stripe
    doc.setFillColor(...C.bluePrimary);
    doc.rect(0, 0, 210, 3.5, "F");

    // Brand line
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – Site Map Generator", 14, 12);

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

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...C.bluePrimary);
    doc.text("SITEMAP GENERATOR", 105, 54, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("SECURITY ASSESSMENT REPORT", 105, 60, { align: "center" });

    // Divider below title
    doc.line(14, 65, 196, 65);

    // Assessment Info table
    renderTable(doc, {
      startY: 72,
      head: [],
      body: [
        ["Assessment Performed by", employeeMail],
        ["Employee Name",           employeeName],
        ["Employee Mail ID",        employeeMail],
        ["Scanned URL",             targetUrl],
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
    doc.line(14, 260, 196, 260);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("www.nexcorealliance.com | ISO/IEC 27001 Certified | AICPA SOC Compliant", 105, 267, { align: "center" });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 2 — ASSESSMENT INFORMATION
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();

    let y = drawSectionHeader(doc, "1. ASSESSMENT INFORMATION", 25);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Tool Details", 14, y);
    y += 5;

    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Tool Name",             "Sitemap Generator"],
        ["Tool Category",         "Web Crawling / Sitemap Enumeration"],
        ["Methodology Alignment", "OWASP WSTG – OTG-INFO / Information Gathering"],
        ["Compliance Alignment",  "ISO/IEC 27001 │ AICPA SOC Frameworks"],
        ["Scanned URL",           targetUrl],
        ["Assessment Mode",       "Non-Intrusive / Automated Web Crawl"],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 },
      },
    });

    y = doc.lastAutoTable.finalY + 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Tool Overview", 14, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMain);
    const overviewText =
      "The Sitemap Generator tool crawls the target website and enumerates all discoverable URLs to produce a structured sitemap. The tool records the URL, HTTP status code, crawl depth, and last modified date for each discovered page. Results support asset inventory, attack surface mapping, and identification of unintended publicly accessible resources.";
    doc.text(overviewText, 14, y + 6, { maxWidth: 182, align: "justify", lineHeightFactor: 1.45 });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 3 — SCAN SUMMARY & DETAILED FINDINGS & CONCLUSION & APPENDIX
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();

    y = drawSectionHeader(doc, "2. SCAN SUMMARY", 25);

    renderTable(doc, {
      startY: y,
      head: [["Total URLs Discovered", "Crawl Depth", "Redirected URLs", "Broken URLs"]],
      body: [
        [
          String(s.totalPages ?? sitemapData.pagesFound ?? 0),
          String(s.crawlDepth ?? depth),
          String(s.redirected ?? 0),
          String(s.broken ?? 0)
        ]
      ],
      headStyles: { fillColor: C.bgHeader, textColor: C.white, halign: "center" },
      bodyStyles: { halign: "center", fontStyle: "bold" }
    });

    y = doc.lastAutoTable.finalY + 10;

    y = drawSectionHeader(doc, "3. DETAILED FINDINGS", y);

    // Render Detailed Findings Table
    const tableData = (sitemapData.urlDetails || []).map((u) => [
      trim(u.url, 70),
      u.sourcePage ? trim(u.sourcePage, 35) : "-",
      String(u.status),
      u.statusText || "",
      String(u.redirectHops || 0),
      u.finalUrl && u.finalUrl !== u.url ? trim(u.finalUrl, 35) : "-"
    ]);

    renderTable(doc, {
      startY: y,
      head: [["URL", "Source Page", "HTTP Status Code", "Text", "Hops", "Final url"]],
      body: tableData,
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      bodyStyles: { fontSize: 7.5 },
      columnStyles: {
        0: { cellWidth: 55 },
        1: { cellWidth: 35 },
        2: { cellWidth: 15, halign: "center" },
        3: { cellWidth: 20 },
        4: { cellWidth: 12, halign: "center" },
        5: { cellWidth: 45 }
      }
    });

    y = doc.lastAutoTable.finalY + 10;

    // Conclusion page check
    if (297 - y < 85) {
      doc.addPage();
      y = 25;
    }

    y = drawSectionHeader(doc, "4. CONCLUSION & RECOMMENDATIONS", y);

    const totalN = s.totalPages ?? sitemapData.pagesFound ?? 0;
    const accessibleN = totalN - (s.broken ?? 0);
    const brokenN = s.broken ?? 0;
    const depthN = s.crawlDepth ?? depth;

    const conclusionText1 =
      `The Sitemap Generator assessment crawled the target website and discovered a total of ${totalN} URLs, comprising ${accessibleN} accessible pages, ${brokenN} pages returning error responses, and a maximum crawl depth of ${depthN}. The generated sitemap provides a structured inventory of all publicly discoverable resources at the time of scanning.`;
    
    const conclusionText2 =
      "All discovered URLs should be reviewed to confirm that only intended resources are publicly accessible. Pages returning error responses should be investigated and remediated or removed. Resources discovered at deeper crawl depths should be assessed for unintended exposure. The sitemap output should be incorporated into the organisation's asset inventory and reviewed periodically to detect newly introduced or forgotten publicly accessible pages.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMain);
    
    doc.text(conclusionText1, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.45 });
    y += doc.getTextDimensions(conclusionText1, { maxWidth: 182 }).h + 6;

    doc.text(conclusionText2, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.45 });
    y += doc.getTextDimensions(conclusionText2, { maxWidth: 182 }).h + 10;

    // Appendix Header
    if (297 - y < 65) {
      doc.addPage();
      y = 25;
    }

    y = drawSectionHeader(doc, "5. APPENDIX", y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Column Reference Guide", 14, y);
    y += 5;

    renderTable(doc, {
      startY: y,
      head: [["Column", "Description"]],
      body: [
        ["URL",               "The fully qualified URL of each page or resource discovered during the crawl"],
        ["HTTP Status Code",   "The HTTP response code returned by the server for the discovered URL (e.g. 200, 301, 404, 500)"],
        ["Hops",               "Number of redirects before reaching the final destination."],
        ["Crawl Depth",        "The number of link hops from the root URL at which the page was discovered during the crawl"],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 40, fillColor: [245, 245, 245] },
        1: { cellWidth: 142 }
      }
    });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 4 — APPENDIX (CONTINUED) & ACKNOWLEDGEMENT
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();

    y = 25;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Column Reference Guide (Continued)", 14, y);
    y += 5;

    renderTable(doc, {
      startY: y,
      head: [["Column", "Description"]],
      body: [
        ["Last Modified",      "The date on which the page or resource was last modified, as reported by the server"],
        ["Source Page",        "Page each broken/redirected link was found on"],
        ["Broken URLs",        "Count of URLs that returned errors (404, 500, etc.)"],
        ["Final URL",          "The actual destination after all redirects."],
        ["Total URLs Discovered","The total count of unique URLs enumerated during the sitemap generation crawl"]
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 40, fillColor: [245, 245, 245] },
        1: { cellWidth: 142 }
      }
    });

    y = doc.lastAutoTable.finalY + 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Acknowledgement", 14, y);
    y += 5;

    const ackText =
      "The findings presented in this report are based on observations made during the assessment period and represent the sitemap enumeration status of the environment at the time of scanning. This report contains confidential and proprietary information intended solely for the authorised recipient. Unauthorised disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMain);
    doc.text(ackText, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });

    // Apply header / footer decorator
    applyHeaderFooterDecorator(doc, "Site Map Generator");

    const pad = (n) => String(n).padStart(2, "0");
    const dStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    
    doc.save(`Sitemap_Generator_Report_${dStr}.pdf`);

  } catch (err) {
    console.error("Failed to generate Sitemap PDF:", err);
  }
};
