import { jsPDF } from "jspdf";
import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../utils/pdfFramework";

// Static lookup map for Findings Details (Severity, Status, Impact, Recommendation)
const findingsLookup = {
  "WHOIS:Registrar": {
    severity: "Informational",
    status: "Observed",
    impact: (val) => `Domain registered through ${val}. ${val} acts as both CDN and registrar, centralising control. If the registrar account is compromised, domain hijacking becomes possible.`,
    recommendation: "Enable registrar lock and two-factor authentication on the domain registrar account. Monitor for unauthorised registrar-transfer requests."
  },
  "WHOIS:Created": {
    severity: "Informational",
    status: "Observed",
    impact: (val) => `Domain was registered on ${val}. Long-standing domain age reduces likelihood of phishing association and improves DNS reputation.`,
    recommendation: "No immediate action required. Continue monitoring domain registration details for unauthorised modifications."
  },
  "WHOIS:Expires": {
    severity: "Informational",
    status: "Observed",
    impact: (val) => `Domain is registered through ${val}. Extended registration reduces risk of domain expiry and subsequent hijacking by third parties.`,
    recommendation: "Ensure domain auto-renewal is enabled. Monitor registration status periodically to prevent unintentional expiry."
  },
  "SSL:Issuer": {
    severity: "Informational",
    status: "Configured",
    impact: (val) => `SSL/TLS certificate issued by ${val}, a globally trusted Certificate Authority. No certificate authority trust issues detected.`,
    recommendation: "Monitor certificate validity and renewal cycles. Ensure certificate pinning is considered for high-value API communication."
  },
  "SSL:Valid Till": {
    severity: "Low",
    status: "Active",
    impact: (val) => `The SSL certificate expires on ${val}. If the certificate is not renewed prior to expiry, the site will present invalid certificate warnings, disrupting user trust and potentially enabling MITM attacks.`,
    recommendation: "Implement automated certificate renewal (e.g., via Let's Encrypt or Google Certificate Manager). Configure expiry alerts at 30-day and 7-day thresholds."
  },
  "SSL:Protocol": {
    severity: "Informational",
    status: "Secure",
    impact: (val) => `The server is configured to use ${val}, a secure transport layer protocol. This eliminates vulnerabilities associated with legacy protocol versions and weaker cipher suites.`,
    recommendation: "Ensure legacy protocol versions (TLS v1.0/v1.1, SSL v2/v3) are explicitly disabled in the server configuration. Conduct periodic TLS configuration audits."
  },
  "GeoIP:IP": {
    severity: "Informational",
    status: "Observed",
    impact: (val) => `The resolved IP address is ${val}. The server IP is identified on the network range. If hidden behind a CDN, it provides a layer of DDoS protection and IP obfuscation.`,
    recommendation: "Ensure the true origin server IP is not exposed through DNS records (e.g., MX, SPF, historical DNS). Periodically verify there is no origin IP leakage."
  },
  "GeoIP:Country": {
    severity: "Informational",
    status: "Observed",
    impact: (val) => `Server infrastructure is geo-located in ${val}. Depending on data residency and compliance requirements, hosting jurisdiction may have implications for applicable data protection regulations (e.g., GDPR, CCPA).`,
    recommendation: "Verify data residency requirements with applicable regulatory frameworks. Document hosting jurisdiction as part of the data processing agreements."
  },
  "GeoIP:ISP": {
    severity: "Informational",
    status: "Observed",
    impact: (val) => `Traffic is routed through ${val}'s infrastructure. Dependence on a single provider introduces third-party risk.`,
    recommendation: "Maintain documented incident response procedures for CDN/ISP-related outages. Evaluate secondary failover or multi-CDN strategies for critical infrastructure."
  },
  "Persistence:Saved": {
    severity: "Medium",
    status: "Flagged",
    impact: () => `Recon data has been persisted/saved by the scanning tool. Stored reconnaissance data may contain sensitive infrastructure details including IP addresses, technology stack, and port information. If this data is exposed or improperly secured, it could assist a threat actor in further targeted attacks.`,
    recommendation: "Ensure all saved recon reports are stored in access-controlled environments. Implement data retention policies. Restrict access to recon output to authorised personnel only."
  },
  "Technology:Frontend": {
    severity: "Low",
    status: "Observed",
    impact: (val) => `The frontend is built using ${val}. Exposing the frontend framework may assist attackers in identifying framework-specific vulnerabilities, CVEs, or attack vectors (e.g., prototype pollution, dependency chain attacks via npm).`,
    recommendation: "Avoid exposing technology stack information in HTTP headers or meta tags. Keep dependencies updated to patched versions. Implement a Software Composition Analysis (SCA) process."
  },
  "Technology:Backend": {
    severity: "Medium",
    status: "Observed",
    impact: (val) => `The backend/generator framework is identified as ${val}. Exact version disclosure enables targeted vulnerability research. Any known CVEs specific to ${val} or its dependencies may be directly exploitable.`,
    recommendation: "Remove or suppress generator/X-Powered-By headers from HTTP responses. Update components to the latest patched version. Subscribe to security advisories."
  },
  "Technology:Infrastructure": {
    severity: "Informational",
    status: "Observed",
    impact: (val) => `Infrastructure is hosted and proxied through ${val}. This provides distributed denial of service protection, Web Application Firewall (WAF) capabilities, and global content delivery. Single-provider dependency is a third-party risk factor.`,
    recommendation: "Configure WAF rules appropriate to the application's risk profile. Ensure firewall bypass protections are in place to prevent direct-to-origin attacks."
  },
  "Ports:Port 21 – FTP": {
    severity: "Informational",
    status: "Filtered",
    impact: () => "Port 21 (FTP) is filtered. No FTP service is accessible from the public network. This is the expected and correct posture — FTP is an insecure, cleartext protocol and should not be exposed.",
    recommendation: "Maintain the current filtered/closed posture for Port 21. If file transfer is required, use SFTP (Port 22) or FTPS with TLS enforcement instead of plain FTP."
  },
  "Ports:Port 22 – SSH": {
    severity: "Low",
    status: "Filtered",
    impact: () => "Port 22 (SSH) is filtered at the network perimeter. While the port is not directly accessible, filtering via firewall rules still indicates the service may exist on the host. Brute force attempts against SSH are common if exposed.",
    recommendation: "Confirm SSH access is restricted to authorised IP ranges via firewall allowlisting. Disable password-based SSH authentication; enforce key-based authentication. Consider port-knocking or a bastion host architecture."
  },
  "Ports:Port 80 – HTTP": {
    severity: "Medium",
    status: "Open",
    impact: () => "Port 80 (HTTP) is open and accessible. Unencrypted HTTP communication exposes data in transit to interception. If the server does not enforce HTTPS redirection from Port 80, users may communicate over cleartext HTTP.",
    recommendation: "Implement a permanent HTTP 301 redirect from Port 80 to HTTPS (Port 443). Enforce HSTS to prevent protocol downgrade. Ensure Port 80 serves only to redirect and does not host sensitive content."
  },
  "Ports:Port 443 – HTTPS": {
    severity: "Informational",
    status: "Open / Secure",
    impact: () => "Port 443 (HTTPS) is open and serving encrypted traffic. This is the expected configuration for any publicly accessible web service. TLS v1.3 is confirmed as the active protocol.",
    recommendation: "Ensure HSTS is enforced with an appropriate max-age and includeSubDomains directive. Conduct periodic TLS configuration assessments to validate cipher suite security."
  },
  "Ports:Port 8080 – HTTP-Alt": {
    severity: "High",
    status: "Open",
    impact: () => "Port 8080 (HTTP-Alt) is open and publicly accessible. This non-standard HTTP port is frequently used for development servers, proxy services, or administrative panels. Exposure of Port 8080 to the public internet increases the attack surface and may provide access to unprotected internal services, debug interfaces, or unauthenticated administrative endpoints.",
    recommendation: "Immediately assess the service running on Port 8080. If the service is not intended for public access, restrict it via firewall rules to trusted IP ranges only. Ensure the service requires authentication. Apply the same security header and TLS standards."
  }
};

const getFindingDetails = (section, key, value) => {
  const mapKey = `${section}:${key}`;
  
  if (findingsLookup[mapKey]) {
    const item = findingsLookup[mapKey];
    return {
      severity: item.severity,
      status: item.status,
      impact: typeof item.impact === "function" ? item.impact(value) : item.impact,
      recommendation: item.recommendation
    };
  }

  if (section === "Ports") {
    const portNum = key.match(/\d+/)?.[0];
    if (portNum) {
      const portKey = Object.keys(findingsLookup).find(k => k.startsWith(`Ports:Port ${portNum}`));
      if (portKey && findingsLookup[portKey]) {
        const item = findingsLookup[portKey];
        return {
          severity: item.severity,
          status: item.status,
          impact: typeof item.impact === "function" ? item.impact(value) : item.impact,
          recommendation: item.recommendation
        };
      }
    }
  }

  let severity = "Informational";
  let status = "Observed";
  let impact = `Reconnaissance identified ${key} with value ${value} in section ${section}.`;
  let recommendation = "Review the identified value for compliance with organizational security policies and standards.";

  const valStr = String(value || "").toLowerCase();
  const keyStr = String(key || "").toLowerCase();

  if (valStr.includes("open") || valStr.includes("flagged") || valStr.includes("yes")) {
    severity = "Medium";
    status = "Open";
  }
  if (keyStr.includes("8080") || valStr.includes("high")) {
    severity = "High";
  }

  return { severity, status, impact, recommendation };
};

export const generateWebreconPDF = async (scanResult, setPdfProgress) => {
  if (!scanResult) return;
  if (setPdfProgress) setPdfProgress("Initializing Website Recon PDF document...");

  const { employeeName, employeeMail } = getAuditorInfo();

  try {
    const doc = new jsPDF("p", "mm", "a4");
    const domain = safe(scanResult.urlUsed || scanResult.domain || "Unknown Domain").replace(/^https?:\/\//, "").split("/")[0];
    
    const scanDate = scanResult.createdAt
      ? new Date(scanResult.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()
      : new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
    const scanTime = scanResult.createdAt
      ? new Date(scanResult.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      : new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    const findingsList = [];

    // WHOIS
    if (scanResult.whois?.registrar) {
      findingsList.push({ section: "WHOIS", key: "Registrar", value: scanResult.whois.registrar });
    }
    if (scanResult.whois?.created) {
      findingsList.push({ section: "WHOIS", key: "Created", value: scanResult.whois.created });
    }
    if (scanResult.whois?.expires) {
      findingsList.push({ section: "WHOIS", key: "Expires", value: scanResult.whois.expires });
    }

    // SSL
    if (scanResult.ssl?.issuer) {
      findingsList.push({ section: "SSL", key: "Issuer", value: scanResult.ssl.issuer });
    }
    if (scanResult.ssl?.validTo) {
      findingsList.push({ section: "SSL", key: "Valid Till", value: scanResult.ssl.validTo });
    }
    if (scanResult.ssl?.protocol) {
      findingsList.push({ section: "SSL", key: "Protocol", value: scanResult.ssl.protocol });
    }

    // GeoIP
    if (scanResult.geoip?.ip) {
      findingsList.push({ section: "GeoIP", key: "IP", value: scanResult.geoip.ip });
    }
    if (scanResult.geoip?.country) {
      findingsList.push({ section: "GeoIP", key: "Country", value: scanResult.geoip.country });
    }
    if (scanResult.geoip?.isp) {
      findingsList.push({ section: "GeoIP", key: "ISP", value: scanResult.geoip.isp });
    }

    // Persistence
    findingsList.push({
      section: "Persistence",
      key: "Saved",
      value: scanResult.persistence?.saved ? "Yes" : "No"
    });

    // Tech
    const techTypes = ["frontend", "backend", "infrastructure"];
    techTypes.forEach(type => {
      const items = scanResult.technologies?.[type] || [];
      if (items.length > 0) {
        const label = type.charAt(0).toUpperCase() + type.slice(1);
        findingsList.push({
          section: "Technology",
          key: label,
          value: items.join(", ")
        });
      }
    });

    // Ports
    const portResults = scanResult.ports?.results || [];
    portResults.forEach(portObj => {
      const stateText = portObj.error
        ? `${portObj.state.toUpperCase()} (${portObj.error})`
        : portObj.state.toUpperCase();
      findingsList.push({
        section: "Ports",
        key: `Port ${portObj.port} – ${portObj.service.toUpperCase()}`,
        value: stateText
      });
    });

    const mappedFindings = findingsList.map((f, index) => {
      const details = getFindingDetails(f.section, f.key, f.value);
      return {
        id: index + 1,
        ...f,
        ...details
      };
    });

    const totalFindings = mappedFindings.length;
    const highCount = mappedFindings.filter(f => f.severity.toLowerCase() === "high").length;
    const mediumCount = mappedFindings.filter(f => f.severity.toLowerCase() === "medium").length;
    const lowCount = mappedFindings.filter(f => f.severity.toLowerCase() === "low").length;

    // PAGE 1 — COVER PAGE & ASSESSMENT INFORMATION
    if (setPdfProgress) setPdfProgress("Building cover page...");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – Website Recon", 14, 12);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(...C.bluePrimary);
    doc.text("NEXCORE ALLIANCE", 105, 30, { align: "center" });

    doc.setFont("helvetica", "oblique");
    doc.setFontSize(10);
    doc.text("AI-Powered Cybersecurity & Information Security Solutions", 105, 36, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(...C.bluePrimary);
    doc.text("WEBSITE RECON SECURITY ASSESSMENT REPORT", 105, 54, { align: "center" });

    renderTable(doc, {
      startY: 65,
      head: [],
      body: [
        ["Assessment Performed by", employeeMail],
        ["Employee Name",           employeeName],
        ["Employee Mail ID",        employeeMail],
        ["Target Domain",           domain],
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

    let y = doc.lastAutoTable.finalY + 8;

    y = drawSectionHeader(doc, "1. ASSESSMENT INFORMATION", y);

    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Tool Name",             "Website Recon"],
        ["Tool Category",         "Passive Reconnaissance / Open Source Intelligence (OSINT)"],
        ["Methodology Alignment", "OWASP WSTG – OTG-INFO (Information Gathering)"],
        ["Compliance Alignment",  "ISO/IEC 27001 │ OWASP WSTG │ NIST SP 800-115"],
        ["Target Domain",         domain],
        ["Assessment Mode",       "Passive / Non-Intrusive – OSINT-based Reconnaissance"],
        ["Sections Analysed",     "WHOIS │ SSL │ GeoIP │ Persistence │ Technology │ Ports"]
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
    const overviewText = "The Website Recon tool performs passive, non-intrusive open source intelligence (OSINT) gathering against a specified target domain. It aggregates information across six categories: WHOIS registration data, SSL/TLS certificate details, GeoIP and infrastructure intelligence, persistence indicators, frontend and backend technology identification, and port availability scanning. The tool does not actively exploit or interact with the target beyond standard DNS and HTTP/S queries, making it suitable for use during the information-gathering phase of a security assessment. All findings are based on publicly observable data and are reported in a structured format for further analysis by the security team.";
    doc.text(overviewText, 14, y + 5, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });

    // PAGE 2 — SCAN SUMMARY & DETAILED FINDINGS
    if (setPdfProgress) setPdfProgress("Building findings tables...");
    doc.addPage();

    y = drawSectionHeader(doc, "2. SCAN SUMMARY", 25);

    let overallRiskText = "WHOIS, SSL, and GeoIP posture is acceptable.";
    if (highCount > 0) {
      overallRiskText = `Port scan and technology stack disclosures present elevated risks. High severity exposures require immediate remediation.`;
    } else if (mediumCount > 0) {
      overallRiskText = `Medium severity vulnerabilities detected in port configurations or data persistence. WHOIS, SSL, and GeoIP posture is acceptable.`;
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
        1: { cellWidth: 20, fontStyle: "bold", textColor: highCount > 0 ? C.red : C.textMain },
        2: { cellWidth: 20, fontStyle: "bold", textColor: mediumCount > 0 ? C.amber : C.textMain },
        3: { cellWidth: 112, halign: "left" }
      }
    });

    y = doc.lastAutoTable.finalY + 10;

    y = drawSectionHeader(doc, "3. DETAILED FINDINGS", y);

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

    // CONCLUSION & RECOMMENDATIONS
    if (297 - y < 75) {
      doc.addPage();
      y = 25;
    }

    y = drawSectionHeader(doc, "4. CONCLUSION & RECOMMENDATIONS", y);

    const conclusionParagraphs = [
      `The Website Recon assessment identified ${totalFindings} observations across six reconnaissance categories. The overall security posture is rated as ${highCount > 0 ? "High" : (mediumCount > 0 ? "Medium" : "Low")} risk. The WHOIS, SSL, and GeoIP configurations are generally well-maintained; however, several findings require prompt attention.`,
      highCount > 0 ? `The most significant finding is the exposure of open high-risk ports such as Port 8080 (HTTP-Alt) to the public internet. This non-standard HTTP port may provide access to development services, proxy interfaces, or unauthenticated administrative panels, significantly increasing the external attack surface. Immediate investigation and restriction of this port is recommended.` : `All scanned network ports are appropriately filtered or configured, minimizing public attack surface exposure.`,
      `Technology stack disclosure presents a potential risk. Exact framework and version identification enables targeted vulnerability research. Any known CVEs specific to the running components or their dependencies may be directly exploitable. Access to persisted recon reports should be restricted to authorised personnel under a documented data retention policy.`,
      `All remediation actions should be prioritised by severity, implemented within defined SLA windows, and validated through re-assessment. Technology stack information should be removed from HTTP headers and meta tags to reduce information exposure.`
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

    // APPENDIX
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
        ["Section",         "The reconnaissance category from the Website Recon Report (WHOIS, SSL, GeoIP, Persistence, Technology, Ports)."],
        ["Key",             "The specific data field observed within the section."],
        ["Value",           "The data value retrieved for the key during the reconnaissance scan."],
        ["Severity",        "Risk level assigned: Critical / High / Medium / Low / Informational."],
        ["Status",          "Observation state: Observed / Configured / Active / Filtered / Open / Flagged / Secure."],
        ["Impact",          "The security risk or operational consequence arising from the observed value."],
        ["Recommendation",  "Specific, actionable remediation or hardening guidance for the observation."]
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

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Acknowledgement", 14, y);

    const ackText = "The findings presented in this report are based on publicly observable information collected during the reconnaissance assessment period and represent the target domain's exposure status at the time of scanning. This report contains confidential and proprietary information intended solely for the authorised recipient. Unauthorised disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.";
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(ackText, 14, y + 5, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });

    applyHeaderFooterDecorator(doc, "Website Recon");

    if (setPdfProgress) setPdfProgress("Saving PDF...");
    doc.save(`${domain}-Website-Recon-Report-${Date.now()}.pdf`);
  } catch (err) {
    console.error("Failed to generate Website Recon PDF report:", err);
  } finally {
    if (setPdfProgress) setPdfProgress(null);
  }
};
