import { jsPDF } from "jspdf";
import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../utils/pdfFramework";

const SECURITY_IMPACT_MAP = {
  "Backend": {
    risk: "Disclosure of backend runtime environments (e.g., PHP, ASP.NET, Express) enables attackers to target known platform vulnerabilities and tailor payload delivery.",
    remediation: "Disable or sanitize 'X-Powered-By' and application-specific headers in backend configurations."
  },
  "Server": {
    risk: "Web server banners (e.g., Nginx, Apache, IIS) expose the server software type and version, helping attackers identify exploit vectors for target OS and HTTP daemons.",
    remediation: "Configure the web server to restrict server headers (e.g., 'server_tokens off' in Nginx)."
  },
  "CMS": {
    risk: "CMS identification (e.g., WordPress, Drupal) flags the system's plugin ecosystem, which is a frequent source of third-party software vulnerabilities.",
    remediation: "Suppress version tags in meta tags and restrict public access to standard admin and installation directories."
  },
  "Analytics": {
    risk: "Analytics and tracking scripts disclose data collection frameworks and marketing integrations, outlining business partners and telemetry channels.",
    remediation: "Audit script tags regularly and implement strict Content Security Policies (CSP)."
  },
  "CDN": {
    risk: "Exposing CDN proxies (e.g., Cloudflare, Akamai) details edge routing setups. If origin IP is leaked, attackers can bypass CDN firewalls.",
    remediation: "Ensure the origin server accepts requests exclusively from the CDN IP ranges."
  },
  "Frontend": {
    risk: "Exposing JavaScript library types and versions allows automated vulnerability scanners to identify client-side cross-site scripting (XSS) risks in dependencies.",
    remediation: "Keep all JavaScript libraries and CSS frameworks updated to their latest stable patches."
  },
  "Security Header": {
    risk: "Active security headers mitigate major exploitation classes (XSS, Clickjacking, MIME sniffing, MitM). Missing or loose headers weaken site defensive posture.",
    remediation: "Deploy strict HSTS, CSP, X-Frame-Options, X-Content-Type-Options, and Referrer Policy headers."
  },
  "Default": {
    risk: "Passive detection of technology assets reveals operational stacks and provides intelligence for targeted attack campaigns.",
    remediation: "Audit active technology footprints, prune legacy scripts, and ensure proper security configurations across all systems."
  }
};

export const generateFingerprintPDF = async (results = [], meta = {}, targetUrl = "-", setPdfProgress, existingDoc = null) => {
  const techList = Array.isArray(results) ? results : (results?.results || results?.technologies || []);
  if (!techList || techList.length === 0) return;
  setPdfProgress?.("Initializing PDF document...");

  const { employeeName, employeeMail } = getAuditorInfo();

  try {
    const isJsPDF = existingDoc && typeof existingDoc.addPage === "function";
    const doc = isJsPDF ? (existingDoc.addPage(), existingDoc) : new jsPDF("p", "mm", "a4");

    // Dates
    const now = new Date();
    const scanDate = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
    const scanTime = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    const totalTech = techList.length;
    const durationText = meta?.durationMs ? `${(meta.durationMs / 1000).toFixed(2)} s` : "-";

    const categoriesSet = new Set(techList.map(f => f.category));
    const categoriesScanned = categoriesSet.size;

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
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – Technology Fingerprinter", 14, 12);

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

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...C.bluePrimary);
    doc.text("TECHNOLOGY FINGERPRINTER SECURITY", 105, 54, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("ASSESSMENT REPORT", 105, 60, { align: "center" });

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
    // PAGE 2 — ASSESSMENT INFORMATION & RESULTS
    // ════════════════════════════════════════════════════════════════════════
    setPdfProgress?.("Building assessment information...");
    doc.addPage();

    let y = drawSectionHeader(doc, "1. ASSESSMENT INFORMATION", 25);

    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Tool Name",             "Technology Fingerprinter"],
        ["Tool Category",         "Reconnaissance / Technology Stack Identification"],
        ["Methodology Alignment", "OWASP WSTG – OTG-INFO-008 (Fingerprint Web Application Framework)"],
        ["Compliance Alignment",  "ISO/IEC 27001 │ AICPA SOC Frameworks"],
        ["Scanned URL",           targetUrl],
        ["Assessment Mode",       "Non-Intrusive / Passive Fingerprinting"],
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
      "The Technology Fingerprinter tool performs passive reconnaissance against a target web application to identify the underlying technology stack. It analyses HTTP response headers, HTML meta tags, JavaScript libraries, CMS signatures, CDN indicators, server banners, and frontend framework patterns to enumerate technologies in use. The tool categorises detected components by layer — including Frontend, Backend, CMS, Analytics, CDN, and Server — and identifies specific frameworks and platforms where detectable. Technology disclosure findings are relevant to attack surface mapping, as exposure of version information enables adversaries to correlate targets with known CVEs and publicly available exploit code.";
    doc.text(overviewText, 14, y + 6, { maxWidth: 182, align: "justify", lineHeightFactor: 1.45 });

    y += doc.getTextDimensions(overviewText, { maxWidth: 182 }).h + 12;

    y = drawSectionHeader(doc, "2. SCAN SUMMARY", y);

    // Primary detected framework or platforms
    const frameworksList = results.filter(f => ["Frontend", "CMS", "Backend"].includes(f.category)).map(f => f.name);
    const detectedPlatform = frameworksList.length > 0 ? frameworksList.slice(0, 2).join(", ") : "Generic Web Stack";
    
    // Overall Risk Rating
    const hasLow = results.some(f => f.severity?.toLowerCase() === "low");
    const overallRisk = hasLow ? "Low / Info Disclosure" : "Informational";

    renderTable(doc, {
      startY: y,
      head: [["Total Technologies Detected", "Technology Categories Scanned", "Detected Framework / Platform", "Overall Risk Rating"]],
      body: [[
        String(totalTech),
        String(categoriesScanned),
        detectedPlatform,
        overallRisk
      ]],
      headStyles: { fillColor: C.bgHeader, textColor: C.white, halign: "center" },
      bodyStyles: { halign: "center", fontStyle: "bold", fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 42 },
        1: { cellWidth: 45 },
        2: { cellWidth: 55 },
        3: { cellWidth: 40 }
      }
    });

    y = doc.lastAutoTable.finalY + 12;

    y = drawSectionHeader(doc, "3. DETAILED FINDINGS", y);

    // --- Technology Inventory Summary Table ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Technology Inventory Summary", 14, y);

    const inventoryRows = results.map(f => [
      f.name,
      f.category,
      f.version || "Not Disclosed",
      `${f.confidence || 100}%`,
      f.severity || "Informational"
    ]);

    renderTable(doc, {
      startY: y + 5,
      head: [["Technology", "Category", "Version", "Confidence", "Severity"]],
      body: inventoryRows,
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      bodyStyles: { fontSize: 8.5 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50 },
        1: { cellWidth: 35 },
        2: { cellWidth: 35 },
        3: { cellWidth: 27, halign: "center" },
        4: { cellWidth: 35, halign: "center", fontStyle: "bold" }
      }
    });

    y = doc.lastAutoTable.finalY + 12;

    // Render stacked findings boxes
    for (let i = 0; i < results.length; i++) {
      const f = results[i];
      const staticMeta = SECURITY_IMPACT_MAP[f.category] || SECURITY_IMPACT_MAP["Default"];

      // Check space before drawing findings box
      if (297 - y < 65) {
        doc.addPage();
        y = 25;
      }

      renderTable(doc, {
        startY: y,
        head: [],
        body: [
          ["Severity",                      f.severity || "Informational"],
          ["Technology Category",           f.category],
          ["Detected Technology / Framework", f.name],
          ["Detected Version",              f.version || "Not Disclosed"],
          ["Detection Method",              f.method || "Pattern Match"],
          ["Confidence Score",              `${f.confidence || 100}%`],
          ["Detection Evidence",            f.evidence || "HTML Footprint Match"],
          ["Risk / Exposure",               staticMeta.risk],
          ["Recommendation",                staticMeta.remediation]
        ],
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
          1: { cellWidth: 127 }
        },
        margin: { left: 14, right: 14 }
      });

      y = doc.lastAutoTable.finalY + 10;
    }

    // Spacing check for Section 4
    if (297 - y < 65) {
      doc.addPage();
      y = 25;
    }

    y = drawSectionHeader(doc, "4. CONCLUSION & RECOMMENDATIONS", y);

    const conclusionText1 =
      "The Technology Fingerprinter assessment scanned the target URL and identified technologies across the following categories: Frontend, Backend, CMS, Analytics, CDN, and Server. Detected technologies were mapped against known disclosure risks, and any version information identified in HTTP headers, HTML source, or JavaScript libraries was recorded as a finding.";
    
    const conclusionText2 =
      "Technology disclosure, particularly version-level information, represents a reconnaissance risk as it enables adversaries to identify applicable CVEs and craft targeted exploits without requiring active interaction with the application. All technologies for which version strings were detected should be treated as medium-to-high priority remediation items depending on the current patch status of the identified version.";

    const conclusionText3 =
      "It is recommended to suppress version information from all HTTP response headers, including Server, X-Powered-By, X-Generator, and X-AspNet-Version. Frontend JavaScript library versions should be obfuscated or removed from publicly accessible bundles. A web application firewall (WAF) should be deployed to add an additional layer of protection in front of identified server technologies. All detected frameworks and platforms should be maintained at current stable release versions to minimise exposure to publicly disclosed vulnerabilities. Technology stack assessments should be repeated following any infrastructure changes or deployment updates.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMain);
    
    doc.text(conclusionText1, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.45 });
    y += doc.getTextDimensions(conclusionText1, { maxWidth: 182 }).h + 6;

    doc.text(conclusionText2, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.45 });
    y += doc.getTextDimensions(conclusionText2, { maxWidth: 182 }).h + 6;

    doc.text(conclusionText3, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.45 });
    y += doc.getTextDimensions(conclusionText3, { maxWidth: 182 }).h + 12;

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 3 — APPENDIX
    // ════════════════════════════════════════════════════════════════════════
    setPdfProgress?.("Building appendix...");
    doc.addPage();

    y = drawSectionHeader(doc, "5. APPENDIX", 25);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Column Reference Guide", 14, y);

    renderTable(doc, {
      startY: y + 5,
      head: [["Column", "Description"]],
      body: [
        ["Severity",                      "Risk level assigned to the finding: Critical / High / Medium / Low / Informational"],
        ["Technology Category",           "Layer of the stack where the technology was detected: Frontend / Backend / CMS / Analytics / CDN / Server"],
        ["Detected Technology / Framework", "Name of the identified technology or framework (e.g., React, Next.js, Express.js, WordPress, Laravel, Nginx)"],
        ["Detected Version",              "Specific version string identified during fingerprinting, if available; 'Not Disclosed' if version was not detectable"],
        ["Detection Method",              "Mechanism used to identify the technology: HTTP Header / HTML Meta Tag / JavaScript Pattern / Server Banner / CDN Indicator"],
        ["Confidence Score",              "Determined reliability score of the detection based on signal strength (50% - 100%)"],
        ["Detection Evidence",            "The raw HTTP header value, HTML asset link, cookie name, or DOM element footprint matched"],
        ["Risk / Exposure",               "Description of the security implication of the identified technology disclosure"],
        ["Recommendation",                "Specific, actionable remediation guidance aligned to the identified technology exposure"]
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50, fillColor: [245, 245, 245] },
        1: { cellWidth: 132 }
      }
    });

    y = doc.lastAutoTable.finalY + 12;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Acknowledgement", 14, y);

    const ackText =
      "The findings presented in this report are based on observations made during the assessment period and represent the technology exposure posture of the environment at the time of scanning. This report contains confidential and proprietary information intended solely for the authorised recipient. Unauthorised disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMain);
    doc.text(ackText, 14, y + 6, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });

    // Apply header / footer decorator
    if (!existingDoc) {
      setPdfProgress?.("Saving PDF...");
      const pad = (n) => String(n).padStart(2, "0");
      const dStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      doc.save(`Technology_Fingerprinter_Report_${dStr}.pdf`);
    }
    return doc;

  } catch (err) {
    console.error("Failed to generate Fingerprint PDF:", err);
  } finally {
    setPdfProgress?.(null);
  }
};
