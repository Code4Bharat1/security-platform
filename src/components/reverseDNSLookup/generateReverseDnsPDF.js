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
const staticReputationMap = {
  Clean: {
    impact: "No adverse reputation issues or DNS blacklists detected. The target IP address maintains a clean network and mail reputation.",
    remediation: "Continue regular operations. Implement ongoing reverse DNS mapping reviews to ensure alignment with active forward DNS records."
  },
  Medium: {
    impact: "Listed on a single DNSBL zone. Minor risk of SMTP connection delays or temporary classification of outgoing mail traffic as spam.",
    remediation: "Check reverse resolver logs to identify transient email volume spikes. Request a delisting once the transient issue is resolved."
  },
  High: {
    impact: "Listed on multiple active DNSBL databases. Elevated risk of mail transport blockages, spam filter flags, and inbound connection drops.",
    remediation: "Audit host traffic for mail relay issues, unauthorized outgoing spam, or indicator of compromise. Submit delisting requests once clean."
  },
  Critical: {
    impact: "Severe reputation compromise. IP address listed on major DNSBL zones. Most external firewalls and mail transfer agents will block this IP.",
    remediation: "Isolate the server, check for active mail abuse or malware compromise, restrict port 25 outgoing traffic, and apply delisting procedures."
  }
};

export const generateReverseDnsPDF = async (data, blacklistSummary, blacklists, targetUrl = "IP Address Scan", setPdfProgress) => {
  if (setPdfProgress) setPdfProgress("Initializing PDF document...");

  const { employeeName, employeeMail } = getAuditorInfo();

  try {
    const doc = new jsPDF("p", "mm", "a4");
    let y = 0;

    // Dates
    const scanDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
    const scanTime = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    // Fallback or dynamic values
    const ipAddress = data?.ip || "Unknown IP";
    const ptrRecords = data?.ptr?.length ? data.ptr.join(", ") : "(none)";
    const timespan = data?.timespan || 0;
    
    // Determine overall validation status
    const anySuspicious = (data?.forwardValidation || []).some((v) => v.matches === false);
    const forwardStatusText = anySuspicious ? "Suspicious" : "Verified";
    const overallStatus = (blacklistSummary.reputationScore > 0 || anySuspicious) ? "Fail" : "Pass";

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 1 — COVER PAGE
    // ══════════════════════════════════════════════════════════════════════
    if (setPdfProgress) setPdfProgress("Building cover page...");

    // Top blue banner stripe
    doc.setFillColor(...C.bluePrimary);
    doc.rect(0, 0, 210, 3.5, "F");

    // Brand line
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – Reverse DNS Resolver", 105, 12, { align: "center" });

    // Company header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(...C.bluePrimary);
    doc.text("NEXCORE ALLIANCE", 105, 30, { align: "center" });

    doc.setFont("helvetica", "italic");
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
    doc.text("REVERSE DNS RESOLVER SECURITY ASSESSMENT REPORT", 105, 58, { align: "center" });

    // Double divider under title
    doc.setDrawColor(...C.bluePrimary);
    doc.setLineWidth(0.25);
    doc.line(14, 70, 196, 70);
    doc.line(14, 71, 196, 71);

    // Assessment Info Table
    renderTable(doc, {
      startY: 78,
      head: [],
      body: [
        ["Assessment Performed by", employeeMail],
        ["Employee Name",           employeeName],
        ["Employee Mail ID",        employeeMail],
        ["Target Input",           ipAddress],
        ["Assessment Date",        scanDate],
        ["Assessment Time",        scanTime],
        ["Classification",         "Confidential"],
        ["Assessment Status",       "Completed"]
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 }
      },
    });

    // Cover Page Footer info
    doc.setDrawColor(...C.lineColor);
    doc.setLineWidth(0.25);
    doc.line(14, 260, 196, 260);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("www.nexcorealliance.com | ISO/IEC 27001 Certified | AICPA SOC Compliant", 105, 267, { align: "center" });

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 2 — ASSESSMENT INFORMATION
    // ══════════════════════════════════════════════════════════════════════
    if (setPdfProgress) setPdfProgress("Building assessment information...");
    doc.addPage();

    y = drawSectionHeader(doc, "1. ASSESSMENT INFORMATION", 25);

    // Tool details grid header label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Tool Details", 14, y);
    y += 5;

    // Tool details grid
    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Tool Name",             "Reverse DNS Resolver"],
        ["Tool Category",         "Network Intelligence / DNS Analysis"],
        ["Methodology Alignment", "OWASP WSTG – OTG-INFO / Information Gathering"],
        ["Compliance Alignment",  "ISO/IEC 27001 | AICPA SOC Frameworks"],
        ["Target Input",           ipAddress],
        ["Assessment Mode",       "Non-Intrusive / Automated DNS Lookup"]
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 }
      }
    });

    y = doc.lastAutoTable.finalY + 10;

    // Tool Overview Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Tool Overview", 14, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMain);
    const overviewText = "The Reverse DNS Resolver tool performs reverse DNS lookups on submitted IP addresses to retrieve associated hostnames, network ownership details, geolocation data, and DNSBL blacklist status. The tool resolves PTR records, validates forward DNS consistency through domain verification, and cross-references the IP against multiple DNS-based blocklists to identify potential spam or abuse associations. Results include ASN and ISP attribution, geographic location data, and a comprehensive DNSBL zone check across industry-standard blacklist providers.";

    doc.text(overviewText, 14, y + 6, { maxWidth: 182, align: "justify", lineHeightFactor: 1.45 });

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 3 — SCAN SUMMARY, DETAILED FINDINGS & CONCLUSION
    // ══════════════════════════════════════════════════════════════════════
    if (setPdfProgress) setPdfProgress("Building scan findings & conclusion...");
    doc.addPage();
    y = 25;

    // Section 2: Scan Summary
    y = drawSectionHeader(doc, "2. SCAN SUMMARY", y);

    // Render Scan Summary table
    renderTable(doc, {
      startY: y,
      head: [["Target IP", "PTR Resolution", "Forward DNS Validation", "Overall Validation Status"]],
      body: [[
        ipAddress,
        ptrRecords !== "(none)" ? "Resolved" : "No PTR Record",
        forwardStatusText,
        overallStatus
      ]],
      headStyles: {
        fillColor: C.bgHeader,
        textColor: C.white,
        halign: "center",
      },
      bodyStyles: {
        halign: "center",
        fontStyle: "bold",
        fontSize: 9,
      },
      columnStyles: {
        0: { textColor: C.textMain },
        1: { textColor: C.textMain },
        2: { textColor: anySuspicious ? C.amber : [16, 185, 129] },
        3: { textColor: overallStatus === "Pass" ? [16, 185, 129] : C.red }
      }
    });

    y = doc.lastAutoTable.finalY + 10;

    // Section 3: Detailed findings
    y = drawSectionHeader(doc, "3. DETAILED FINDINGS", y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Findings", 14, y);
    y += 5;

    // Setup Geolocation text
    const geoText = data?.geo
      ? `${data.geo.country || "—"}, ${data.geo.region || "—"}, ${data.geo.city || "—"} (Timezone: ${data.geo.timezone || "—"}, Coords: ${data.geo.ll?.join(", ") || "—"})`
      : "Not Available";

    // Setup ASN text
    const asnText = data?.asn
      ? `ASN: ${data.asn.asn || "—"} | Org: ${data.asn.org || "—"} | ISP: ${data.asn.isp || "—"} | CIDR: ${data.asn.cidr || "—"}`
      : "Not Available";

    // Setup Forward DNS Verification text
    const fvText = (data?.forwardValidation || []).map((f) => 
      `${f.domain}: ${f.matches ? "VERIFIED" : "SUSPICIOUS"} (A=[${(f.resolved?.A || []).join(", ")}] AAAA=[${(f.resolved?.AAAA || []).join(", ")}])`
    ).join("\n") || "No forward validation records.";

    // Map dynamic static values for Impact and Remediation
    const repInfo = staticReputationMap[blacklistSummary.riskLevel] || staticReputationMap.Clean;
    const impactText = repInfo.impact;
    const remediationText = repInfo.remediation;

    // Scan result summary details
    const resultSummaryText = `The DNS search completed with status: ${data?.result || "Resolved"}. ` +
      `Reverse mapping returned ${data?.ptr?.length || 0} host PTR record(s). ` +
      `Forward verification returned validation status as: ${forwardStatusText.toUpperCase()}.`;

    // Render Detailed Findings table with 10 rows (removed Blacklist Status)
    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Record Type",             data?.type || "PTR"],
        ["PTR Hostname",            ptrRecords],
        ["Reverse DNS Zone",        `${timespan} ms (lookup latency)`],
        ["Lookup Status",           data?.result || "No PTR record found."],
        ["Geolocation",             geoText],
        ["ASN / Organization / ISP", asnText],
        ["Forward DNS Validation",  fvText],
        ["Impact",                 impactText],
        ["Recommendation",         remediationText],
        ["Scan Result Summary",     resultSummaryText]
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 45, fillColor: [245, 245, 245] },
        1: { cellWidth: 137 }
      },
      styles: {
        font: "helvetica",
        fontSize: 8,
      },
      didParseCell: (parsedCell) => {
        if (parsedCell.column.index === 1) {
          if (parsedCell.row.index === 6) {
            parsedCell.cell.styles.textColor = anySuspicious ? C.amber : [16, 185, 129];
            parsedCell.cell.styles.fontStyle = "bold";
          }
        }
      }
    });

    y = doc.lastAutoTable.finalY + 12;

    // Draw Section 4: Conclusion & recommendations
    y = drawSectionHeader(doc, "4. CONCLUSION & RECOMMENDATIONS", y);

    const isListedOnBlacklist = blacklistSummary.flagged > 0;
    
    // Dynamic text builder for Conclusion
    const resolvedHostnameText = data?.ptr?.length ? data.ptr[0] : "none";
    const orgName = data?.asn?.org || "Unknown ISP";
    const asnNum = data?.asn?.asn ? `AS${data.asn.asn}` : "AS Unknown";
    const cityLoc = data?.geo ? `${data.geo.city || "Unknown City"}, ${data.geo.country || "Unknown Country"}` : "Unknown Geolocation";
    const listedZones = blacklists.filter(b => b.status === "Listed").map(b => b.name.toLowerCase()).join(" and ") || "none";
    const clearZones = blacklists.filter(b => b.status === "Clear").map(b => b.name.toLowerCase()).join(", ");

    const conclusionText = `The Reverse DNS Resolver assessment of IP address ${ipAddress} successfully resolved the PTR record to ${resolvedHostnameText}, hosted by ${orgName} (${asnNum}) in ${cityLoc}. The lookup completed in ${timespan} ms and the domain was verified with ${forwardStatusText.toLowerCase()} forward DNS resolution. ` +
      (isListedOnBlacklist 
        ? `The IP is listed on ${blacklistSummary.flagged} of the five DNSBL zones checked — ${listedZones} — indicating active blacklist listing(s). The remaining ${blacklistSummary.checked - blacklistSummary.flagged} zones — ${clearZones} — returned clear status.`
        : `The IP is not listed on any of the five DNSBL zones checked — ${clearZones} — returning clear status.`);

    const actionText = isListedOnBlacklist
      ? `It is recommended to investigate the root cause of the DNSBL listings and initiate delisting requests with ${listedZones} upon remediation. The hosted server should be reviewed for signs of compromise, unauthorized mail relay activity, or spam origination. Ongoing DNSBL monitoring should be implemented to detect future listings promptly and prevent impact to mail deliverability and network reputation.`
      : `It is recommended to maintain ongoing reputation monitoring for host ${ipAddress} to proactively detect future DNS blocklist occurrences. Standard network access controls and host level compliance procedures should be followed as normal.`;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMain);
    doc.text(conclusionText, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.45 });
    y += doc.splitTextToSize(conclusionText, 182).length * 4.5 + 8;

    doc.text(actionText, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.45 });

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 4 — APPENDIX
    // ══════════════════════════════════════════════════════════════════════
    if (setPdfProgress) setPdfProgress("Building appendix...");
    doc.addPage();

    y = drawSectionHeader(doc, "5. APPENDIX", 25);

    // Column Reference Guide Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Column Reference Guide", 14, y);

    // Render reference guide table
    renderTable(doc, {
      startY: y + 5,
      head: [["Column", "Description"]],
      body: [
        ["Target IP", "IP address submitted for reverse DNS resolution."],
        ["PTR Resolution", "Reverse DNS lookup status"],
        ["DNSBL Blacklist Matches", "Number of blacklist databases where the IP is listed"],
        ["Forward DNS Validation", "Reverse-to-forward DNS mapping verification"],
        ["Overall Validation Status", "Overall DNS and reputation assessment"],
        ["Record Type", "DNS record type returned during the lookup (e.g., PTR)."],
        ["PTR Hostname", "Hostname resolved from the PTR record."],
        ["Reverse DNS Zone", "Time in milliseconds taken to complete the DNS resolution"],
        ["Lookup Status", "Result of the reverse DNS lookup (Successful / Failed)."],
        ["Blacklist Status", "Overall DNSBL reputation status (Listed / Clear / Unknown)."],
        ["Geolocation", "Country, region, city, timezone, and coordinates associated with the IP address."],
        ["ASN / Organization / ISP", "Network ownership details associated with the IP address."],
        ["Forward DNS Validation", "Indicates whether the resolved hostname correctly maps back to the original IP address."],
        ["Impact", "Potential security and operational impact of the identified DNS or reputation findings."],
        ["Recommendation", "Suggested remediation or best-practice guidance based on the assessment."],
        ["Scan Result Summary", "Concise summary of the lookup, blacklist status, and overall assessment outcome."]
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 45, fillColor: [245, 245, 245] },
        1: { cellWidth: 137 }
      }
    });

    y = doc.lastAutoTable.finalY + 12;

    // Acknowledgement Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Acknowledgement", 14, y);

    const ackText = "The findings presented in this report are based on observations made during the assessment period and represent the reverse DNS and network reputation posture of the target IP address at the time of scanning. This report contains confidential and proprietary information intended solely for the authorized recipient. Unauthorized disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMain);
    doc.text(ackText, 14, y + 6, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });

    // Apply header & footer decorator to all pages
    applyHeaderFooterDecorator(doc, "Reverse DNS Resolver");

    if (setPdfProgress) setPdfProgress("Saving PDF...");
    doc.save(`Reverse-DNS-Resolver-Report-${Date.now()}.pdf`);
  } catch (err) {
    console.error("Failed to generate Reverse DNS PDF report:", err);
  } finally {
    if (setPdfProgress) setPdfProgress(null);
  }
};
