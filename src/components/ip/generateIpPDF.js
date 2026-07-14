import { jsPDF } from "jspdf";
import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../utils/pdfFramework";

export const generateIpPDF = async (info = {}) => {
  const { employeeName, employeeMail } = getAuditorInfo();
  
  // Format dates
  const now = new Date();
  const scanDate = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  const scanTime = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const targetIp = info.basicInformation?.ipAddress || "—";
  const riskScore = info.securityThreatIntel?.riskScore ?? 0;
  const securityRating = info.overallSecurityRating || "Safe";

  try {
    const doc = new jsPDF("p", "mm", "a4");

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
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – IP Address Info Finder", 14, 12);

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
    doc.text("IP ADDRESS INFO FINDER SECURITY ASSESSMENT", 105, 54, { align: "center" });
    doc.text("REPORT", 105, 60, { align: "center" });

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
        ["Scanned URL",             targetIp],
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

    // Cover footer line
    doc.line(14, 260, 196, 260);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("www.nexcorealliance.com | ISO/IEC 27001 Certified | AICPA SOC Compliant", 105, 267, { align: "center" });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 2 — ASSESSMENT INFORMATION
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    let y = 25;

    y = drawSectionHeader(doc, "1. ASSESSMENT INFORMATION", y);

    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Tool Name",             "IP Address Info Finder"],
        ["Tool Category",         "Network Reconnaissance / Threat Intelligence Lookup"],
        ["Methodology Alignment", "OWASP WSTG – OTG-INFO / Information Gathering"],
        ["Compliance Alignment",  "ISO/IEC 27001 | AICPA SOC Frameworks"],
        ["Scanned URL",           targetIp],
        ["Assessment Mode",       "Non-Intrusive / Automated IP Intelligence Lookup"],
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

    const overviewText =
      "The IP Address Info Finder tool retrieves geolocation, network ownership, and threat intelligence data for a given public IP address. It reports the IP version, reverse DNS, hostname, geographic location (country, region, city, coordinates, and timezone), network ownership details (ISP, organisation, ASN), and security indicators such as proxy/VPN status, Tor exit node status, blocklist presence, malware hosting history, and recent spam reports. This information supports attribution, exposure assessment, and reputation analysis of hosts and infrastructure associated with the target environment.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(overviewText, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 3 — SCAN SUMMARY & DETAILED FINDINGS (FLOWING TO PAGE 4)
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    y = drawSectionHeader(doc, "2. SCAN SUMMARY", y);

    // Compute metrics
    const blacklistCount = info.securityThreatIntel?.blacklistCount ?? 0;
    const isVpnOrProxy = info.securityThreatIntel?.proxyOrVpn === "Yes";
    const isTor = info.securityThreatIntel?.torExitNode === "Yes";
    const isMalware = info.securityThreatIntel?.malwareHostingHistory === "Detected";
    const isSpam = (info.securityThreatIntel?.spamReports ?? 0) > 0;
    
    let threatIndicatorsCount = 0;
    if (isVpnOrProxy) threatIndicatorsCount++;
    if (isTor) threatIndicatorsCount++;
    if (isMalware) threatIndicatorsCount++;
    if (isSpam) threatIndicatorsCount++;
    if (blacklistCount > 0) threatIndicatorsCount++;

    const blacklistStatus = info.securityThreatIntel?.blacklistStatus || "Not Listed";
    const severity = securityRating === "Safe" ? "Informational" : securityRating;
    const statusVal = securityRating === "Safe" ? "Passed" : "Warning";
    
    const ipVersion = info.basicInformation?.version || "—";
    const hostname = info.basicInformation?.hostname || "—";

    const country = info.locationData?.country || "—";
    const region = info.locationData?.region || "—";
    const city = info.locationData?.city || "—";
    const timezone = info.locationData?.timezone || "—";
    const coordinates = `${info.locationData?.latitude ?? "—"}° / ${info.locationData?.longitude ?? "—"}°`;

    const isp = info.networkDetails?.isp || "—";
    const organization = info.networkDetails?.organization || "—";
    const asn = info.networkDetails?.asn ? String(info.networkDetails.asn).replace("AS", "") : "—";
    
    const proxyStatus = info.securityThreatIntel?.proxyOrVpn || "No";
    const torStatus = info.securityThreatIntel?.torExitNode || "No";
    const malwareStatus = info.securityThreatIntel?.malwareHostingHistory || "None Detected";
    const spamReports = String(info.securityThreatIntel?.spamReports ?? 0);

    const issueText = securityRating === "Safe"
      ? "None. The queried IP address does not appear on any blocklist, shows no history of malware hosting, has not generated spam reports in the last 12 months, and does not exhibit proxy, VPN, or Tor exit node characteristics."
      : `Reputation warnings detected: ${info.recommendations?.join(" ") || "Exposed network parameters detected."}`;

    const impactText = securityRating === "Safe"
      ? "No security impact identified. The host associated with this IP address does not present an elevated risk based on currently available reputation and threat intelligence data."
      : "Active threat risk from flagged parameters. The host associated with this IP exhibits credentials exposure or network scanning indicators.";

    const recommendationText = securityRating === "Safe"
      ? "No remediation required based on current findings. As reputation data is time-sensitive, periodically re-run this lookup for IP addresses associated with critical infrastructure to detect changes in blocklist status, hosting reputation, or ownership. If the hostname or ASN changes unexpectedly, investigate for potential infrastructure compromise or unauthorized re-routing."
      : "Establish traffic logging, enforce multi-factor authentication triggers for sessions originating from this block, and correlation checks against firewall filters.";

    renderTable(doc, {
      startY: y,
      head: [["IP Address", "Threat Indicators Found", "Blocklist Status"]],
      body: [[targetIp, String(threatIndicatorsCount), blacklistStatus]],
      headStyles: { fillColor: C.bgHeader, textColor: C.white, halign: "center" },
      columnStyles: {
        0: { halign: "center", cellWidth: 70 },
        1: { halign: "center", cellWidth: 50 },
        2: { halign: "center", cellWidth: 62 },
      },
    });
    y = doc.lastAutoTable.finalY + 8;

    y = drawSectionHeader(doc, "3. DETAILED FINDINGS", y);

    const detailedBody = [
      [{ content: "Host Information", colSpan: 2, styles: { fontStyle: "bold", fillColor: [240, 243, 246] } }],
      ["Severity",                    severity],
      ["Status",                      statusVal],
      ["IP Address",                  targetIp],
      ["IP Version",                  ipVersion],
      ["Hostname",                    hostname],
      
      [{ content: "Location Information", colSpan: 2, styles: { fontStyle: "bold", fillColor: [240, 243, 246] } }],
      ["Country",                     country],
      ["Region",                      region],
      ["City",                        city],
      ["Timezone",                    timezone],
      ["Coordinates (Lat / Long)",    coordinates],
      
      [{ content: "Network Details", colSpan: 2, styles: { fontStyle: "bold", fillColor: [240, 243, 246] } }],
      ["ISP",                         isp],
      ["Organization",                organization],
      ["ASN",                         asn],
      ["Proxy / VPN Status",          proxyStatus],
      ["Tor Exit Node Status",        torStatus],
      ["Blocklist Status",            blacklistStatus],
      ["Malware Hosting History",     malwareStatus],
      ["Spam Reports (Last 12 Months)", spamReports],
      ["Issue Detected",              issueText],
      ["Impact",                      impactText],
      ["Recommendation",              recommendationText],
    ];

    renderTable(doc, {
      startY: y,
      head: [["Parameter", "Findings"]],
      body: detailedBody,
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55 },
        1: { cellWidth: 127 },
      },
      didParseCell: (data) => {
        if (data.column.index === 1 && data.section === "body") {
          const val = String(data.cell.raw || "");
          if (data.row.index === 1) { // Severity row
            if (val === "High" || val === "Critical" || val === "Medium Risk" || val === "High Risk") {
              data.cell.styles.textColor = C.red;
              data.cell.styles.fontStyle = "bold";
            } else {
              data.cell.styles.textColor = [22, 163, 74];
              data.cell.styles.fontStyle = "bold";
            }
          }
          if (data.row.index === 2) { // Status row
            if (val === "Warning" || val === "Failed") {
              data.cell.styles.textColor = C.red;
              data.cell.styles.fontStyle = "bold";
            } else if (val === "Passed") {
              data.cell.styles.textColor = [22, 163, 74];
              data.cell.styles.fontStyle = "bold";
            }
          }
        }
      }
    });

    // Detailed Findings continues to Page 4 automatically. We draw Section 4 right below it.
    y = doc.lastAutoTable.finalY + 12;

    y = drawSectionHeader(doc, "4. CONCLUSION & RECOMMENDATIONS", y);

    const conclusionText1 =
      `The IP Address Info Finder assessment queried ${targetIp} and returned a ${securityRating === "Safe" ? "clean" : "suspicious"} reputation profile. The address resolves to infrastructure operated by ${isp} (ASN ${asn}), is geolocated to ${city}, ${region}, ${country}, and ${securityRating === "Safe" ? "does not appear on any blocklist" : "exhibits security vulnerabilities"}. ${securityRating === "Safe" ? "No history of malware hosting was identified, no spam reports were recorded in the last 12 months, and the address does not exhibit proxy, VPN, or Tor exit node characteristics." : "Abuse lists logs indicate reputation history alerts."}`;

    const conclusionText2 =
      "It is recommended that this lookup be repeated periodically for IP addresses associated with critical or externally facing infrastructure, as reputation, blocklist status, and ownership data can change over time. Any future change in hostname, ASN, or organisation associated with this address should be investigated promptly, as it may indicate infrastructure migration, re-hosting, or unauthorized re-routing of traffic.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(conclusionText1, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });
    y += 18;

    doc.text(conclusionText2, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });
    y += 26;

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 5 — APPENDIX & ACKNOWLEDGEMENT
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    y = drawSectionHeader(doc, "5. APPENDIX", y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Column Reference Guide", 14, y);
    y += 5;

    const appendixPart = [
      ["Severity", "Risk level assigned to the IP intelligence finding: Critical / High / Medium / Low / Informational"],
      ["Status", "Validation result for the queried IP address: Passed | Failed | Warning | Informational"],
      ["IP Address / IP Version", "The IP address queried and its protocol version (IPv4 / IPv6)"],
      ["Hostname", "The domain name, if any, associated with the IP address through reverse DNS resolution"],
      ["Country / Region / City / Timezone / Coordinates", "The geographic location data associated with the IP address"],
      ["ISP / Organization / ASN", "The network ownership details associated with the IP address, including the responsible ISP, organisation, and Autonomous System Number"],
      ["Proxy / VPN Status", "Indicates whether the IP address is associated with proxy or VPN services"],
      ["Tor Exit Node Status", "Indicates whether the IP address is identified as a Tor exit node"],
      ["Blocklist Status", "Indicates whether the IP address appears on known threat intelligence blocklists"],
      ["Malware Hosting History", "Indicates whether the IP address has a history of hosting malware"],
      ["Spam Reports (Last 12 Months)", "The number of spam reports associated with the IP address within the preceding 12 months"],
      ["Issue Detected", "The specific reputation or threat intelligence concern identified during the lookup, if any"],
      ["Impact", "The security risk introduced by the identified issue (e.g. association with malicious infrastructure, anonymisation services, or spam activity)"],
      ["Recommendation", "Specific, actionable remediation guidance for the identified issue"],
    ];

    renderTable(doc, {
      startY: y,
      head: [["Column", "Description"]],
      body: appendixPart,
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55 },
        1: { cellWidth: 127 },
      }
    });
    y = doc.lastAutoTable.finalY + 12;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Acknowledgement", 14, y);
    y += 6;

    const ackText =
      "The findings presented in this report are based on observations made during the assessment period and represent the IP address reputation and threat intelligence status of the queried host at the time of scanning. This report contains confidential and proprietary information intended solely for the authorized recipient. Unauthorized disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(ackText, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });

    // Apply headers and footers to all pages using the shared decorator
    applyHeaderFooterDecorator(doc, "IP Address Info Finder");

    // Save PDF
    doc.save(`IP_Address_Assessment_Report_${scanDate}.pdf`);

  } catch (err) {
    console.error("Failed to generate IP PDF:", err);
  }
};
