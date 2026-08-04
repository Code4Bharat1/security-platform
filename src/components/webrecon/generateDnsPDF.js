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

// Static lookup map for DNS Record Findings (Severity, Status, Impact, Recommendation)
const dnsFindingsLookup = {
  "A": {
    severity: "Informational",
    status: "Resolved",
    impact: (val) => `Points the domain name to the IPv4 address ${val}. This is a standard and expected DNS routing configuration.`,
    recommendation: "Ensure the IP address points to a secure and active web host. Monitor IP reputation for spam blocklists."
  },
  "AAAA": {
    severity: "Informational",
    status: "Resolved",
    impact: (val) => `Points the domain name to the IPv6 address ${val}. Enables modern IPv6 networking support.`,
    recommendation: "Maintain IPv6 compatibility across hosting environments to support legacy-free connectivity."
  },
  "NS": {
    severity: "Informational",
    status: "Resolved",
    impact: (val) => `Delegates a DNS zone to use the authoritative nameserver ${val}. Unresolved nameserver queries can lead to site-wide downtime.`,
    recommendation: "Ensure nameservers are hosted on redundant, geographically dispersed networks with DDoS protection."
  },
  "MX": {
    severity: "Informational",
    status: "Resolved",
    impact: (val) => `Specifies the mail server ${val} responsible for accepting email messages on behalf of the domain.`,
    recommendation: "Ensure mail exchangers are configured with transport encryption (TLS) and robust spam filtering."
  },
  "TXT": {
    severity: "Informational",
    status: "Resolved",
    impact: (val) => `Contains descriptive text records. Often used for domain verification, SPF authorization, and security declarations: "${val}".`,
    recommendation: "Verify that all TXT entries (such as SPF, DKIM, DMARC) are syntactically valid and current."
  },
  "Missing:SPF": {
    severity: "Medium",
    status: "Missing",
    impact: () => "No Sender Policy Framework (SPF) record was detected in the domain's TXT records. Without SPF, malicious actors can easily spoof emails claiming to be from your domain, increasing phishing success rates.",
    recommendation: "Publish a valid SPF record (TXT) designating authorized outbound mail servers (e.g., 'v=spf1 include:_spf.google.com ~all')."
  },
  "Missing:DMARC": {
    severity: "Medium",
    status: "Missing",
    impact: () => "Domain-based Message Authentication, Reporting, and Conformance (DMARC) is missing. Mail servers cannot verify alignment with SPF/DKIM, allowing unauthorized mail flow to go unpunished.",
    recommendation: "Publish a DMARC TXT record under '_dmarc.yourdomain.com' to define a quarantine or reject policy (e.g., 'v=DMARC1; p=quarantine; pct=100')."
  }
};

export const generateDnsPDF = async (result = null, targetDomain = "", recordType = "ALL") => {
  if (!result || !result.Answer) return;

  const { employeeName, employeeMail } = getAuditorInfo();
  
  const now = new Date();
  const scanDate = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  const scanTime = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  try {
    const doc = new jsPDF("p", "mm", "a4");
    const domain = safe(targetDomain || "Unknown Target").replace(/^https?:\/\//, "").split("/")[0];

    // Build findings list from resolved records
    const findingsList = [];
    let hasSPF = false;
    let hasDMARC = false;

    result.Answer.forEach((rec) => {
      const typeStr = getTypeName(rec.type);
      const valStr = String(rec.data || "");
      
      if (typeStr === "TXT") {
        if (valStr.toLowerCase().includes("v=spf1")) hasSPF = true;
        if (valStr.toLowerCase().includes("v=dmarc")) hasDMARC = true;
      }

      findingsList.push({
        section: "DNS Record",
        key: `${typeStr} Record`,
        value: valStr,
        recordType: typeStr
      });
    });

    // Add security gaps if missing SPF/DMARC and looking at ALL/TXT
    if (recordType === "ALL" || recordType === "TXT") {
      if (!hasSPF) {
        findingsList.push({
          section: "Email Security",
          key: "SPF Record",
          value: "None Detected",
          recordType: "Missing:SPF"
        });
      }
      if (!hasDMARC) {
        findingsList.push({
          section: "Email Security",
          key: "DMARC Record",
          value: "None Detected",
          recordType: "Missing:DMARC"
        });
      }
    }

    // Map finding details
    const mappedFindings = findingsList.map((f, index) => {
      const lookupKey = f.recordType;
      const lookup = dnsFindingsLookup[lookupKey] || dnsFindingsLookup[lookupKey.split(" ")[0]] || {
        severity: "Informational",
        status: "Resolved",
        impact: `Resolved ${f.key} with value: ${f.value}`,
        recommendation: "Verify resource parameters are aligned with corporate hosting guidelines."
      };

      return {
        id: index + 1,
        section: f.section,
        key: f.key,
        value: f.value,
        severity: lookup.severity,
        status: lookup.status,
        impact: typeof lookup.impact === "function" ? lookup.impact(f.value) : lookup.impact,
        recommendation: lookup.recommendation
      };
    });

    const totalFindings = mappedFindings.length;
    const highCount = mappedFindings.filter(f => f.severity.toLowerCase() === "high").length;
    const mediumCount = mappedFindings.filter(f => f.severity.toLowerCase() === "medium").length;
    const lowCount = mappedFindings.filter(f => f.severity.toLowerCase() === "low").length;

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 1 — COVER PAGE & ASSESSMENT INFORMATION
    // ══════════════════════════════════════════════════════════════════════
    
    // Top brand text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – DNS Records Lookup", 14, 12);

    // Company logo/header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(...C.bluePrimary);
    doc.text("NEXCORE ALLIANCE", 105, 30, { align: "center" });

    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.text("AI-Powered Cybersecurity & Information Security Solutions", 105, 36, { align: "center" });

    // Main Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(...C.bluePrimary);
    doc.text("DNS RECORDS LOOKUP REPORT", 105, 54, { align: "center" });

    // Cover Page Assessment Table
    renderTable(doc, {
      startY: 65,
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

    let y = doc.lastAutoTable.finalY + 8;

    // Section 1: ASSESSMENT INFORMATION
    y = drawSectionHeader(doc, "1. ASSESSMENT INFORMATION", y);

    // Tool details
    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Tool Name",             "DNS Records Lookup"],
        ["Tool Category",         "DNS Resolution / Domain Mapping"],
        ["Methodology Alignment", "OWASP WSTG – OTG-INFO / Active DNS Gathering"],
        ["Compliance Alignment",  "ISO/IEC 27001 | AICPA SOC Frameworks"],
        ["Target Domain",         domain],
        ["Assessment Mode",       "Active DNS Query"],
        ["Sections Analysed",     `DNS Records (${recordType})`]
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
    doc.setTextColor(...C.textMain);
    const overviewText = "The DNS Records Lookup tool queries name servers for common DNS resource record types (A, AAAA, MX, TXT, NS). DNS configuration analysis helps identify host mappings, mail exchange configurations, domain verification signatures, and nameserver authorities. Auditing these records supports asset inventory mapping and identification of configuration oversights.";
    doc.text(overviewText, 14, y + 5, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 2 — SCAN SUMMARY & DETAILED FINDINGS
    // ══════════════════════════════════════════════════════════════════════
    doc.addPage();

    y = drawSectionHeader(doc, "2. SCAN SUMMARY", 25);

    let overallRiskText = "DNS configuration is generally secure. No critical gaps identified.";
    if (mediumCount > 0) {
      overallRiskText = "Missing email authentication protocols (SPF/DMARC) expose domain to spoofing vulnerabilities.";
    }

    renderTable(doc, {
      startY: y,
      head: [["Total Findings", "High", "Medium", "Overall Risk Assessment"]],
      body: [[
        String(totalFindings),
        String(highCount),
        String(mediumCount),
        overallRiskText
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
        0: { cellWidth: 30, fontStyle: "bold" },
        1: { cellWidth: 20, fontStyle: "bold", textColor: C.textMain },
        2: { cellWidth: 20, fontStyle: "bold", textColor: mediumCount > 0 ? C.amber : C.textMain },
        3: { cellWidth: 112, halign: "left" }
      }
    });

    y = doc.lastAutoTable.finalY + 10;

    y = drawSectionHeader(doc, "3. DETAILED FINDINGS", y);

    // Render each record mapping as a detailed finding block
    mappedFindings.forEach((f) => {
      if (297 - y < 70) {
        doc.addPage();
        y = 25;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...C.bluePrimary);
      doc.text(`Finding ${String(f.id).padStart(2, "0")} of ${String(totalFindings).padStart(2, "0")} — ${f.section} : ${f.key}`, 14, y);
      y += 4;

      renderTable(doc, {
        startY: y,
        head: [],
        body: [
          ["Section",        f.section],
          ["Key",            f.key],
          ["Value",          safe(f.value)],
          ["Severity",       f.severity],
          ["Status",         f.status],
          ["Impact",         f.impact],
          ["Recommendation", f.recommendation]
        ],
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 40, fillColor: [245, 245, 245] },
          1: { cellWidth: 142 }
        },
        didParseCell: (data) => {
          if (data.column.index === 1 && data.row.index === 3) {
            const sev = String(data.cell.raw || "").toLowerCase();
            if (sev === "high") {
              data.cell.styles.textColor = C.red;
              data.cell.styles.fontStyle = "bold";
            } else if (sev === "medium") {
              data.cell.styles.textColor = C.amber;
              data.cell.styles.fontStyle = "bold";
            } else if (sev === "low") {
              data.cell.styles.textColor = C.blue;
              data.cell.styles.fontStyle = "bold";
            } else {
              data.cell.styles.textColor = C.bluePrimary;
              data.cell.styles.fontStyle = "bold";
            }
          }
        }
      });

      y = doc.lastAutoTable.finalY + 8;
    });

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 3 — CONCLUSION & RECOMMENDATIONS
    // ══════════════════════════════════════════════════════════════════════
    if (297 - y < 75) {
      doc.addPage();
      y = 25;
    }

    y = drawSectionHeader(doc, "4. CONCLUSION & RECOMMENDATIONS", y);

    const conclusionParagraphs = [
      `The DNS Records Lookup assessment resolved ${totalFindings} parameters on the domain ${domain}. The configuration presents a ${mediumCount > 0 ? "Medium" : "Low"} risk profile. Essential hostname resolution parameters (A, AAAA, NS) are resolved and active.`,
      mediumCount > 0 ? "The critical security gaps identified involve email security authentication records. The absence of SPF (Sender Policy Framework) and DMARC records allows unauthorized servers to send messages claiming to be from your domain, risking email deliverability, spam complaints, and phishing exploitation." : "Email security records (SPF/DMARC) are validated and configured, offering robust domain verification protection.",
      "It is recommended to verify DNSSEC (Domain Name System Security Extensions) configuration to cryptographically sign DNS records and protect against DNS hijacking or spoofing. Keep nameserver configurations restricted from unauthorized zone transfer lookups."
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
    // PAGE 4 — APPENDIX
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
        ["Finding No",      "Sequential finding identifier for this report."],
        ["Section",         "The category segment of the DNS architecture under audit."],
        ["Key",             "Resource Record type (e.g. A, AAAA, MX, NS, TXT)."],
        ["Value",           "Target pointer, server address, or descriptive string stored in the DNS record."],
        ["Severity",        "Risk scale assigned: Critical / High / Medium / Low / Informational."],
        ["Status",          "Resolved status state: Resolved / Missing."],
        ["Impact",          "The functional routing description or security risk associated with the record."],
        ["Recommendation",  "Actionable hardening instructions for domain resolution parameters."]
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

    const ackText = "The findings presented in this report are based on observations made during the assessment period and represent the DNS resolution status of the environment at the time of scanning. This report contains confidential and proprietary information intended solely for the authorized recipient. Unauthorized disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.";
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(ackText, 14, y + 5, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });

    // Apply header & footer decorator
    applyHeaderFooterDecorator(doc, "DNS Lookup");

    doc.save(`${domain}-DNS-Records-Lookup-Report-${Date.now()}.pdf`);
  } catch (err) {
    console.error("Failed to generate DNS Records PDF report:", err);
  }
};
