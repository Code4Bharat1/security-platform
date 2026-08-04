import { jsPDF } from "jspdf";
import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../utils/pdfFramework";

const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
};

export const generateWhoisPDF = async (result = {}, targetDomain = "—", existingDoc = null) => {
  const { employeeName, employeeMail } = getAuditorInfo();
  
  const now = new Date();
  const scanDate = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  const scanTime = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const summary = result?.summary || {};
  const targetDomainName = summary?.domainName || result?.input || targetDomain || "—";
  const registrarName = summary?.registrar || "—";
  const resolvedIp = summary?.ip || "—";
  const assessmentOutcome = result?.ok ? "Successful" : "Lookup Failed";

  try {
    const isJsPDF = existingDoc && typeof existingDoc.addPage === "function";
    const doc = isJsPDF ? (existingDoc.addPage(), existingDoc) : new jsPDF("p", "mm", "a4");

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 1 — COVER PAGE & ASSESSMENT INFORMATION
    // ══════════════════════════════════════════════════════════════════════
    
    // Top brand text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – Whois Domain Lookup", 14, 12);

    // Company logo/header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(...C.bluePrimary);
    doc.text("NEXCORE ALLIANCE", 105, 30, { align: "center" });

    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.text("AI-Powered Cybersecurity & Information Security Solutions", 105, 36, { align: "center" });

    // Divider below company header block
    doc.setDrawColor(...C.bluePrimary);
    doc.setLineWidth(0.4);
    doc.line(14, 40, 196, 40);

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...C.bluePrimary);
    doc.text("WHOIS DOMAIN LOOKUP SECURITY ASSESSMENT REPORT", 105, 54, { align: "center" });

    // Divider below title block
    doc.line(14, 60, 196, 60);

    // Cover Page Table
    renderTable(doc, {
      startY: 65,
      head: [],
      body: [
        ["Assessment Performed by", employeeMail],
        ["Employee Name",           employeeName],
        ["Employee Mail ID",        employeeMail],
        ["Scanned Domain",          targetDomain],
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
    // PAGE 2 — TOOL INFORMATION, SCAN SUMMARY & DETAILED FINDINGS
    // ══════════════════════════════════════════════════════════════════════
    doc.addPage();
    let y = drawSectionHeader(doc, "1. ASSESSMENT INFORMATION", 25);

    // Tool details
    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Tool Name",             "Whois Domain Lookup"],
        ["Tool Category",         "Domain Intelligence / WHOIS Lookup"],
        ["Methodology Alignment", "OWASP WSTG – OTG-INFO / Passive Reconnaissance"],
        ["Compliance Alignment",  "ISO/IEC 27001 │ AICPA SOC Frameworks"],
        ["Scanned Domain",        targetDomain],
        ["Assessment Mode",       "Non-Intrusive / Passive Query"]
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 }
      }
    });

    y = doc.lastAutoTable.finalY + 8;

    // Overview
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Tool Overview", 14, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMuted);
    const overviewText = "The Whois Domain Lookup tool queries public WHOIS databases to retrieve domain registration and ownership information for a specified target domain. The tool collects registrar details, registration and expiry dates, registrant contact information, name server records, and domain status flags. This information supports passive reconnaissance activities, assists in identifying domain ownership, and provides an audit trail for domain registration history. The results aid security teams in assessing domain age, expiry risk, and potential takeover exposure.";
    doc.text(overviewText, 14, y + 5, { maxWidth: 182, align: "left", lineHeightFactor: 1.45 });

    y += doc.getTextDimensions(overviewText, { maxWidth: 182 }).h + 12;

    doc.addPage();
    y = drawSectionHeader(doc, "2. SCAN SUMMARY", 25);

    renderTable(doc, {
      startY: y,
      head: [["Domain Queried", "IP", "Registrar", "Assessment Result"]],
      body: [[
        targetDomain,
        resolvedIp,
        registrarName,
        assessmentOutcome
      ]],
      headStyles: {
        fillColor: C.bgHeader,
        textColor: C.white,
        halign: "center",
      },
      bodyStyles: {
        halign: "center",
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 45 },
        1: { cellWidth: 40 },
        2: { cellWidth: 52 },
        3: { cellWidth: 45, fontStyle: "bold", textColor: result?.ok ? [22, 163, 74] : C.red }
      }
    });

    y = doc.lastAutoTable.finalY + 10;

    y = drawSectionHeader(doc, "3. DETAILED FINDINGS", y);

    const countryVal = summary?.registrarGeo?.country || summary?.country || "—";
    const statusVal = Array.isArray(summary?.status) ? summary.status.join(", ") : (summary?.status || "—");
    const createdVal = formatDate(summary?.creationDate);
    const expiryVal = formatDate(summary?.registryExpiryDate);
    const updatedVal = formatDate(summary?.updatedAt);
    const privacyVal = summary?.privacyProtected ? "Yes" : "No";
    const dnssecVal = summary?.dnssecSigned ? "Enabled / Signed" : "Disabled / Unsigned";
    const nsVal = Array.isArray(summary?.nameservers) ? summary.nameservers.join(", ") : "—";

    renderTable(doc, {
      startY: y,
      head: [["Field", "Value"]],
      body: [
        ["Registrar Country", countryVal],
        ["Domain Status",     statusVal],
        ["Created Date",      createdVal],
        ["Expiry Date",       expiryVal],
        ["Updated Date",      updatedVal],
        ["Privacy Protected", privacyVal],
        ["DNSSEC Status",     dnssecVal],
        ["Name Servers",      nsVal]
      ],
      headStyles: {
        fillColor: C.bgHeader,
        textColor: C.white,
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 }
      }
    });

    y = doc.lastAutoTable.finalY + 10;

    y = drawSectionHeader(doc, "4. CONCLUSION & RECOMMENDATIONS", y);

    const conclusionText = `The Whois Domain Lookup assessment retrieved publicly available registration data for the target domain. The results include registrar information, domain creation and expiry dates, name server records, domain status flags, and ASN / hosting network information. The query timestamp has been recorded for audit trail purposes.\n\nIt is recommended to monitor domain expiry dates and implement auto-renewal policies to prevent accidental domain expiry and potential takeover by malicious actors. Registrant contact details should be kept accurate and up to date with the registrar. Domains approaching expiry should be escalated for immediate renewal review. Name server configurations should be validated periodically to detect unauthorised changes.`;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(conclusionText, 14, y, { maxWidth: 182, align: "left", lineHeightFactor: 1.45 });

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 4 — APPENDIX & ACKNOWLEDGEMENT
    // ══════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = drawSectionHeader(doc, "5. APPENDIX", 25);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Column Reference Guide", 14, y);

    renderTable(doc, {
      startY: y + 5,
      head: [["Column", "Description"]],
      body: [
        ["Domain Queried",     "The registered domain name queried against the WHOIS database."],
        ["IP",                 "The IP address currently associated with the queried domain through DNS resolution, if available."],
        ["Registrar",          "The ICANN-accredited registrar responsible for managing the domain registration."],
        ["Assessment result",  "Overall outcome of the WHOIS lookup (e.g., Successful, Partial, Record Not Found, or Lookup Failed)."],
        ["Registrar Country",  "The country or region associated with the domain registrar, where available from WHOIS records."],
        ["Domain Status",      "Current ICANN/EPP status indicating restrictions or protection applied to the domain."],
        ["Created Date",       "The date on which the domain was first registered."],
        ["Expiry Date",        "The date on which the domain registration is due to expire."],
        ["Updated Date",       "The most recent date on which the domain record was modified."],
        ["Privacy Protected",  "Indicates whether the registrant's identity and contact information are protected using a WHOIS privacy or proxy service."],
        ["DNSSEC Status",      "Indicates whether Domain Name System Security Extensions (DNSSEC) are enabled to protect DNS records against spoofing and tampering."],
        ["Name Servers",       "The authoritative DNS servers responsible for resolving the queried domain."]
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50, fillColor: [245, 245, 245] },
        1: { cellWidth: 132 }
      }
    });

    y = doc.lastAutoTable.finalY + 10;

    // Acknowledgement
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Acknowledgement", 14, y);

    const ackText = "The findings presented in this report are based on observations made during the assessment period and represent the domain registration status at the time of the WHOIS query. This report contains confidential and proprietary information intended solely for the authorised recipient. Unauthorised disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.";
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(ackText, 14, y + 5, { maxWidth: 182, align: "left", lineHeightFactor: 1.45 });

    if (!existingDoc) {
      doc.save(`Whois-Domain-Report-${Date.now()}.pdf`);
    }
    return doc;
  } catch (err) {
    console.error("Failed to generate Whois PDF report:", err);
  }
};
