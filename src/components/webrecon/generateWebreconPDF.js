import { jsPDF } from "jspdf";
import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../utils/pdfFramework";

const getPortStateStyle = (state) => {
  switch ((state || "").toLowerCase()) {
    case "open":     return { textColor: [220, 53, 69], fontStyle: "bold" }; // red
    case "filtered": return { textColor: [253, 126, 20] }; // amber
    default:         return { textColor: [110, 110, 110] }; // gray
  }
};

const flattenTechnologies = (tech = {}) => {
  const groups = [
    { key: "frontend", label: "Frontend" },
    { key: "backend", label: "Backend" },
    { key: "infrastructure", label: "Infrastructure" },
    { key: "analytics", label: "Analytics" },
    { key: "payments", label: "Payments" },
  ];
  return groups.flatMap(({ key, label }) =>
    (tech[key] || []).map((item) => [label, item])
  );
};

export const generateWebreconPDF = async (scan = {}, targetDomain = "") => {
  const { employeeName, employeeMail } = getAuditorInfo();
  const domain = scan.domain || targetDomain || "Unknown Domain";
  const whois = scan.whois || {};
  const ssl = scan.ssl || {};
  const geoip = scan.geoip || {};
  const ports = scan.ports || {};
  const tech = scan.technologies || {};
  const headers = scan.securityHeaders || {};

  try {
    const doc = new jsPDF("p", "mm", "a4");

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
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – Website Reconnaissance", 14, 12);

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
    doc.text("WEBSITE RECONNAISSANCE AUDIT REPORT", 105, 54, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("ACTIVE & PASSIVE DISCOVERY LOG", 105, 60, { align: "center" });

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
        ["Target Domain",           domain],
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
    // PAGE 2 — EXECUTIVE SUMMARY & TECHNOLOGY PROFILE
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    let y = 25;

    y = drawSectionHeader(doc, "1. ASSESSMENT INFORMATION", y);

    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Tool Name",             "Website Recon Tool"],
        ["Tool Category",         "Reconnaissance / Metadata & Port Discovery"],
        ["Methodology Alignment", "OWASP WSTG – OTG-INFO / Passive & Active Infrastructure Gathering"],
        ["Compliance Alignment",  "ISO/IEC 27001 | AICPA SOC Frameworks"],
        ["Target Domain",         domain],
        ["Assessment Mode",       "Automated Passive WHOIS & Active Port Probe"],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 },
      },
    });
    y = doc.lastAutoTable.finalY + 6;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Tool Overview", 14, y);
    y += 5;

    const overviewText =
      "The Website Recon tool performs active and passive reconnaissance against a targeted domain to catalog its security boundary settings. The scan queries DNS records (A, AAAA, MX, TXT, NS), traverses WHOIS registrars to extract lifecycle dates, conducts a TLS handshake to extract SSL certificate issuers, scans common TCP ports to map active network interfaces, maps the web application technology stack (CMS, frontend libraries, CDN, analytics trackers), and assesses the configuration status of HTTP security headers. The resulting catalog forms a footprint model of the target domain's public infrastructure.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(overviewText, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });
    y += 30;

    y = drawSectionHeader(doc, "2. TECHNOLOGY & APPLICATION PROFILE", y);

    const techList = flattenTechnologies(tech);
    renderTable(doc, {
      startY: y,
      head: [["Technology Layer", "Detected Platform / Library / Framework"]],
      body: techList.length > 0 ? techList : [["All Layers", "No standard technologies detected from page signatures"]],
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55 },
        1: { cellWidth: 127 },
      }
    });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 3 — DNS RECORDS & PORT STATUS
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    y = drawSectionHeader(doc, "3. DETAILED DNS RECORDS LOG", y);

    // Flatten DNS records into rows
    const dnsRows = [];
    const recordTypes = ["A", "AAAA", "MX", "TXT", "NS"];
    recordTypes.forEach((type) => {
      const records = scan.dns?.[type]?.Answer || [];
      if (records.length === 0) {
        dnsRows.push([type, "—", "No record resolved"]);
      } else {
        records.forEach((r, idx) => {
          dnsRows.push([idx === 0 ? type : "", `TTL: ${r.TTL}s`, String(r.data)]);
        });
      }
    });

    renderTable(doc, {
      startY: y,
      head: [["Type", "Cache Params", "Resolved Record Value"]],
      body: dnsRows,
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 25 },
        1: { cellWidth: 35 },
        2: { cellWidth: 122 },
      }
    });
    y = doc.lastAutoTable.finalY + 8;

    y = drawSectionHeader(doc, "4. NETWORK PORT SCAN & GEOLOCATION", y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Server Geolocation & Network Host Information", 14, y);
    y += 5;

    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Resolved Target IP",   safe(geoip.ip)],
        ["ISP / Hosting ASN",    safe(geoip.isp)],
        ["Geographic Country",   `${safe(geoip.city)}, ${safe(geoip.region)}, ${safe(geoip.country)}`],
        ["SSL Issuer Authority", safe(ssl.issuer)],
        ["SSL Valid Until",      safe(ssl.validTo)],
        ["SSL Protocol Suite",   safe(ssl.protocol)],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 },
      }
    });
    y = doc.lastAutoTable.finalY + 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Common TCP Ports Survey", 14, y);
    y += 5;

    const portRows = (ports.results || []).map((p) => [
      `Port ${p.port}`,
      safe(p.service),
      String(p.state).toUpperCase(),
      p.error ? `Error: ${p.error}` : "Successful probe"
    ]);

    renderTable(doc, {
      startY: y,
      head: [["Port Probe", "Associated Service", "State", "Connection Code"]],
      body: portRows.length > 0 ? portRows : [["—", "—", "—", "No ports probed"]],
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 35 },
        1: { cellWidth: 50 },
        2: { cellWidth: 35, halign: "center" },
        3: { cellWidth: 62 },
      },
      didParseCell: (data) => {
        if (data.column.index === 2 && data.section === "body") {
          const state = String(data.cell.raw || "");
          const style = getPortStateStyle(state);
          if (style.textColor) data.cell.styles.textColor = style.textColor;
          if (style.fontStyle) data.cell.styles.fontStyle = style.fontStyle;
        }
      }
    });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 4 — SECURITY HEADERS & COMPLIANCE
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    y = drawSectionHeader(doc, "5. SECURITY HEADERS AUDIT", y);

    renderTable(doc, {
      startY: y,
      head: [["HTTP Security Header", "Status", "Description & Hardening Action"]],
      body: [
        ["HSTS (Strict-Transport-Security)", headers.hsts?.enabled ? "ENABLED" : "MISSING", headers.hsts?.enabled ? `Max Age: ${headers.hsts.maxAge}s` : "Enforces HTTPS connections only. Enable HSTS header in configuration."],
        ["Content-Security-Policy (CSP)", headers.present?.includes("content-security-policy") ? "PRESENT" : "MISSING", headers.present?.includes("content-security-policy") ? "Configured" : "Prevents Cross-Site Scripting (XSS). Implement restrictive policy."],
        ["X-Frame-Options", headers.present?.includes("x-frame-options") ? "PRESENT" : "MISSING", headers.present?.includes("x-frame-options") ? "Configured" : "Mitigates Clickjacking attacks. Set to SAMEORIGIN or DENY."],
        ["X-Content-Type-Options", headers.present?.includes("x-content-type-options") ? "PRESENT" : "MISSING", headers.present?.includes("x-content-type-options") ? "Configured" : "Blocks MIME type sniffing. Set to nosniff."],
        ["Referrer-Policy", headers.present?.includes("referrer-policy") ? "PRESENT" : "MISSING", headers.present?.includes("referrer-policy") ? "Configured" : "Restricts referrer header disclosure. Set to no-referrer-when-downgrade."],
      ],
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55 },
        1: { cellWidth: 25, halign: "center", fontStyle: "bold" },
        2: { cellWidth: 102 },
      },
      didParseCell: (data) => {
        if (data.column.index === 1 && data.section === "body") {
          const val = String(data.cell.raw || "");
          if (val === "MISSING") {
            data.cell.styles.textColor = C.red;
          } else if (val === "ENABLED" || val === "PRESENT") {
            data.cell.styles.textColor = [22, 163, 74];
          }
        }
      }
    });
    y = doc.lastAutoTable.finalY + 12;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Acknowledgement & Disclaimer", 14, y);
    y += 6;

    const ackText =
      "The findings presented in this report are based on observations made during the automated scanning period and represent the host configuration and technology posture of the target domain at the time of scanning. Passive WHOIS details are subject to caching and privacy configurations. Port scans evaluate only a specific set of common ports and do not constitute an exhaustive penetration test of the target network boundary.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(ackText, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });

    // Apply header / footer decorator
    applyHeaderFooterDecorator(doc, "Website Recon");

    doc.save(`Website_Recon_Report_${domain.replace(/[^a-z0-9]/gi, "_")}.pdf`);

  } catch (err) {
    console.error("Failed to generate Webrecon PDF:", err);
  }
};
