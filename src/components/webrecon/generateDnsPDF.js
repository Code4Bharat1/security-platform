import { jsPDF } from "jspdf";
import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../utils/pdfFramework";

const dnsTypeMap = { 1: "A", 28: "AAAA", 15: "MX", 16: "TXT", 2: "NS" };
const getTypeName = (n) => dnsTypeMap[n] || `Type ${n}`;

export const generateDnsPDF = async (result = null, targetDomain = "", recordType = "ALL") => {
  if (!result || !result.Answer) return;

  const { employeeName, employeeMail } = getAuditorInfo();
  
  // Format Date & Time
  const now = new Date();
  const scanDate = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  const scanTime = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  try {
    const doc = new jsPDF("p", "mm", "a4");
    const domain = safe(targetDomain || "Unknown Target").replace(/^https?:\/\//, "").split("/")[0];

    const recordsCount = result.Answer.length;

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 1 — COVER PAGE & ASSESSMENT INFORMATION
    // ══════════════════════════════════════════════════════════════════════
    
    // Brand header
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – DNS Records Lookup", 14, 12);

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
    doc.text("DNS RECORDS LOOKUP REPORT", 105, 54, { align: "center" });

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
        ["Target Domain",           domain],
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
    // PAGE 2 — TOOL DETAILS & DNS RECORD LISTINGS
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
        ["Tool Name",             "DNS Records Lookup"],
        ["Tool Category",         "DNS Resolution / Domain Mapping"],
        ["Methodology Alignment", "OWASP WSTG – OTG-INFO / Active DNS Gathering"],
        ["Compliance Alignment",  "ISO/IEC 27001 | AICPA SOC Frameworks"],
        ["Target Domain",         domain],
        ["Assessment Mode",       "Active DNS Query"]
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
    const overviewText = "The DNS Records Lookup tool queries name servers for common DNS resource record types (A, AAAA, MX, TXT, NS). DNS configuration analysis helps identify host mappings, mail exchange configurations, domain verification signatures, and nameserver authorities. Auditing these records supports asset inventory mapping and identification of configuration oversights.";
    doc.text(overviewText, 14, y + 5, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });

    y += 35;

    y = drawSectionHeader(doc, `2. RESOLVED DNS RESULTS (${recordType})`, y);

    const dnsRows = result.Answer.map((rec) => [
      getTypeName(rec.type),
      `TTL: ${rec.TTL}s`,
      String(rec.data || "—")
    ]);

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

    const ackText = "The findings presented in this report are based on observations made during the assessment period and represent the DNS resolution status of the environment at the time of scanning. This report contains confidential and proprietary information intended solely for the authorized recipient. Unauthorized disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.";
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(ackText, 14, y + 5, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });

    // Apply header & footer decorator to all pages
    applyHeaderFooterDecorator(doc, "DNS Lookup");

    doc.save(`${domain}-DNS-Records-Lookup-Report-${Date.now()}.pdf`);
  } catch (err) {
    console.error("Failed to generate DNS Records PDF report:", err);
  }
};
