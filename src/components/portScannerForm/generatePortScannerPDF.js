import { jsPDF } from "jspdf";
import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../utils/pdfFramework";

// Static lookup map for Security Impact & Remediation Guidance
const SERVICE_GUIDANCE_MAP = {
  21: {
    service: "FTP",
    impact: "Cleartext transmission of credentials and data. Vulnerable to network eavesdropping and brute-force attacks.",
    remediation: "Disable unencrypted FTP. Migrate to SFTP (SSH File Transfer Protocol) or FTPS (FTP over SSL/TLS)."
  },
  22: {
    service: "SSH",
    impact: "Provides full remote administrative shell access. Vulnerable to password brute-forcing or exploitation of SSH service bugs.",
    remediation: "Enforce public-key authentication, disable password logins, change default port, and install rate-limiting (e.g., Fail2ban)."
  },
  23: {
    service: "Telnet",
    impact: "Completely unencrypted remote terminal communication. Login credentials and commands can be sniffed in transit.",
    remediation: "Immediately disable Telnet service. Force migration to SSH for all command-line administrative access."
  },
  25: {
    service: "SMTP",
    impact: "Potential risk of open mail relay configurations, allowing spam distribution and subsequent server IP domain blacklisting.",
    remediation: "Enforce TLS encryption, require authentication for outbound mail, and disable open relay features."
  },
  53: {
    service: "DNS",
    impact: "Exposed nameservers are targets for cache poisoning, unauthorized zone transfers, or recruitment into DNS amplification DDoS attacks.",
    remediation: "Restrict zone transfers (AXFR) to trusted secondary nameservers, and disable open recursion for external queries."
  },
  80: {
    service: "HTTP",
    impact: "Web traffic transmitted in cleartext, exposing session tokens, user credentials, and sensitive transaction data to interception.",
    remediation: "Migrate HTTP traffic to HTTPS (port 443), install a valid SSL/TLS certificate, and configure permanent 301 redirects."
  },
  110: {
    service: "POP3",
    impact: "Cleartext transmission of email access credentials and email message contents over local network segments.",
    remediation: "Disable unencrypted POP3 access and enforce POP3S (POP3 over SSL/TLS) or modern IMAPS protocols."
  },
  143: {
    service: "IMAP",
    impact: "Unencrypted email access allows sniffing of administrative or employee credentials and email communications.",
    remediation: "Force connections to IMAPS (port 993) and disable unencrypted IMAP (port 143) service nodes."
  },
  443: {
    service: "HTTPS",
    impact: "Encrypted web server endpoint. However, misconfigured SSL/TLS settings, expired certificates, or weak ciphers expose connections to interception.",
    remediation: "Enforce TLS 1.2/1.3 only, disable weak cipher suites (e.g., RC4, 3DES), and automate certificate renewal workflows."
  },
  445: {
    service: "SMB",
    impact: "Direct network-level exposure of Windows file sharing. High risk of worm-like exploits (e.g., EternalBlue) and access token theft.",
    remediation: "Block ports 137-139 and 445 at the network perimeter. Enforce SMB signing and upgrade to SMBv3."
  },
  3306: {
    service: "MySQL",
    impact: "Exposed database ports encourage remote credential brute-force attacks and open the system to unauthorized query execution or data theft.",
    remediation: "Restrict MySQL to bind to localhost (127.0.0.1) or trusted application subnet IPs only. Force SSL connection rules."
  },
  3389: {
    service: "RDP",
    impact: "Direct console access to Windows servers. Vulnerable to sophisticated remote code execution exploits (e.g., BlueKeep) and credential stuffing.",
    remediation: "Restrict RDP access behind an enterprise VPN or Remote Desktop Gateway, and enforce Multi-Factor Authentication (MFA)."
  },
  8080: {
    service: "HTTP-ALT",
    impact: "Often exposes web application administrative panels, testing environments, or proxy configurations running default configurations.",
    remediation: "Restrict access to trusted administrative subnets, configure HTTPS, and enforce strong custom credentials."
  },
  8443: {
    service: "HTTPS-ALT",
    impact: "Alternative SSL port, often running administrative consoles or API endpoints which may contain legacy or unpatched software versions.",
    remediation: "Ensure the backend service is fully patched, restrict IP source access, and disable default administrative credentials."
  }
};

const getGuidance = (port, risk, service) => {
  const normalizedPort = parseInt(port, 10);
  if (SERVICE_GUIDANCE_MAP[normalizedPort]) {
    return SERVICE_GUIDANCE_MAP[normalizedPort];
  }

  // Fallback based on service name match
  const svcLower = (service || "").toLowerCase();
  for (const [pKey, val] of Object.entries(SERVICE_GUIDANCE_MAP)) {
    if (svcLower === val.service.toLowerCase()) {
      return val;
    }
  }

  // General fallbacks based on risk levels
  if (risk === "High") {
    return {
      service: service || `Port ${port}`,
      impact: "Critical entry point exposed. Provides a path for target network intrusion, system command execution, or unauthorized database queries.",
      remediation: "Immediately firewall-restrict access to this port, disable the service if it is not business-critical, and enforce strong MFA."
    };
  } else if (risk === "Medium") {
    return {
      service: service || `Port ${port}`,
      impact: "Provides technical information, service version details, or directory maps that support targeted external vulnerability research.",
      remediation: "Enforce network ACLs to whitelist connection sources, suppress version-disclosure banners, and apply outstanding security patches."
    };
  } else {
    return {
      service: service || `Port ${port}`,
      impact: "Exposed network service socket. Low immediate exploit risk, but expands the potential target attack surface over time.",
      remediation: "Audit service requirements, restrict access using host-based firewall rules, and monitor socket traffic logs regularly."
    };
  }
};

export const generatePortScannerPDF = async (result = {}, hostInput = "") => {
  const { employeeName, employeeMail } = getAuditorInfo();
  
  const targetHost = result.host || hostInput || "localhost";
  const portRange = result.portRange || "Custom Scope";
  const filterType = result.filter || "All Ports";
  
  const portList = result.portList || [];
  
  const totalOpen = portList.filter((p) => p.open || p.status?.toLowerCase() === "open").length;
  const totalFiltered = portList.filter((p) => p.status?.toLowerCase() === "filtered").length;
  const totalClosed = portList.filter((p) => (!p.open && p.status?.toLowerCase() !== "filtered") || p.status?.toLowerCase() === "closed").length;
  
  const totalScanned = portList.length > 0 
    ? (totalOpen + totalClosed + totalFiltered)
    : (result.summary?.total || 0);

  const finalOpen = portList.length > 0 ? totalOpen : (result.summary?.open || 0);
  const finalFiltered = portList.length > 0 ? totalFiltered : (result.summary?.filtered || 0);
  const finalClosed = portList.length > 0 ? totalClosed : Math.max(0, totalScanned - finalOpen - finalFiltered);

  let overallRisk = "Low";
  if (portList.length > 0) {
    if (portList.some(p => (p.open || p.status?.toLowerCase() === "open") && p.risk === "High")) {
      overallRisk = "High";
    } else if (portList.some(p => (p.open || p.status?.toLowerCase() === "open") && p.risk === "Medium")) {
      overallRisk = "Medium";
    }
  } else {
    overallRisk = result.summary?.riskAssessment || "Low";
  }

  try {
    const doc = new jsPDF("p", "mm", "a4");
    const now = new Date();
    
    const scanDate = now.toLocaleDateString("en-GB", { 
      day: "2-digit", 
      month: "short", 
      year: "numeric" 
    }).toUpperCase();
    
    const scanTime = now.toLocaleTimeString("en-GB", { 
      hour: "2-digit", 
      minute: "2-digit", 
      second: "2-digit" 
    });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 1 — COVER PAGE
    // ════════════════════════════════════════════════════════════════════════
    // Top blue banner stripe
    doc.setFillColor(...C.bluePrimary);
    doc.rect(0, 0, 210, 3.5, "F");

    // Brand header
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – Port Scanner", 14, 12);

    // Company Logo / Title
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

    // Document Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...C.bluePrimary);
    doc.text("PORT SCANNER", 105, 54, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("SECURITY ASSESSMENT REPORT", 105, 60, { align: "center" });

    // Divider below title
    doc.line(14, 65, 196, 65);

    // Cover page info table
    renderTable(doc, {
      startY: 72,
      head: [],
      body: [
        ["Assessment Performed by", employeeMail],
        ["Employee Name",           employeeName],
        ["Employee Mail ID",        employeeMail],
        ["Scanned Target",          targetHost],
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

    // Cover page footer banner
    doc.line(14, 260, 196, 260);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("www.nexcorealliance.com | ISO/IEC 27001 Certified | AICPA SOC Compliant", 105, 267, { align: "center" });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 2 — 1. ASSESSMENT INFORMATION
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    let y = 25;

    y = drawSectionHeader(doc, "1. ASSESSMENT INFORMATION", y);

    // Tool Details Table
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Tool Details", 14, y);
    y += 5;

    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Tool Name",             "Port Scanner"],
        ["Tool Category",          "Network Reconnaissance / Service Discovery"],
        ["Methodology Alignment", "OWASP WSTG – OTG-CONFIG / NMAP Methodology / PTES"],
        ["Compliance Alignment",  "ISO/IEC 27001 │ AICPA SOC Frameworks"],
        ["Scanned Target",         targetHost],
        ["Assessment Mode",        "Non-Intrusive / Automated Port Scan"],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 45, fillColor: [245, 245, 245] },
        1: { cellWidth: 137 },
      },
    });
    y = doc.lastAutoTable.finalY + 10;

    // Tool Overview Description
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Tool Overview", 14, y);
    y += 5;

    const overviewText = "The Port Scanner tool performs network-level reconnaissance against a specified target IP address, hostname, or CIDR range to enumerate open, closed, and filtered TCP/UDP ports. For each discovered open port, the tool identifies the running service and, where detectable, the service version. Port scanning is a foundational phase of security assessments that reveals the exposed attack surface, highlights unnecessary or misconfigured services, and supports risk prioritisation for further exploitation testing or remediation planning.";
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(overviewText, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 3 — 2. SCAN SUMMARY, 3. DETAILED FINDINGS & 4. CONCLUSION
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    // 2. Scan Summary
    y = drawSectionHeader(doc, "2. SCAN SUMMARY", y);

    renderTable(doc, {
      startY: y,
      head: [["Total Ports Scanned", "Open", "Closed", "Filtered", "Overall Risk Level"]],
      body: [[
        String(totalScanned),
        String(finalOpen),
        String(finalClosed),
        String(finalFiltered),
        overallRisk.toUpperCase()
      ]],
      headStyles: { fillColor: C.bgHeader, textColor: C.white, halign: "center" },
      bodyStyles: { halign: "center", fontStyle: "bold" },
      columnStyles: {
        4: { textColor: overallRisk === "High" ? C.red : overallRisk === "Medium" ? C.amber : C.blue }
      }
    });
    y = doc.lastAutoTable.finalY + 10;

    // 3. Detailed Findings
    y = drawSectionHeader(doc, "3. DETAILED FINDINGS", y);

    const openPorts = portList.filter((p) => p.open);
    if (openPorts.length > 0) {
      // Loop over open ports to print their individual details
      for (const op of openPorts) {
        // Prevent layout overflow by pushing to a new page if space is low
        if (y > 230) {
          doc.addPage();
          y = 25;
        }

        const guidance = getGuidance(op.port, op.risk, op.service);

        renderTable(doc, {
          startY: y,
          head: [],
          body: [
            ["Port",          String(op.port)],
            ["Protocol",      "TCP"],
            ["Status",        "Open"],
            ["Service",       safe(op.service)],
            ["Host/Target",   targetHost],
            ["Severity",      safe(op.risk, "Low")],
            ["Impact",        guidance.impact],
            ["Recommendation",guidance.remediation],
          ],
          columnStyles: {
            0: { fontStyle: "bold", cellWidth: 35, fillColor: [240, 240, 245] },
            1: { cellWidth: 147 },
          },
          margin: { left: 14, right: 14 }
        });
        
        y = doc.lastAutoTable.finalY + 8;
      }
    } else {
      // If no open ports are found
      renderTable(doc, {
        startY: y,
        head: [],
        body: [
          ["No Open Ports Identified", "All scanned ports returned closed or filtered statuses. No active exposed services were discovered."]
        ],
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 50, fillColor: [240, 250, 240] },
          1: { cellWidth: 132 }
        }
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    // 4. Conclusion & Recommendations
    if (y > 210) {
      doc.addPage();
      y = 25;
    }
    
    y = drawSectionHeader(doc, "4. CONCLUSION & RECOMMENDATIONS", y);

    const conclusionText = `The Port Scanner assessment identified a total of ${finalOpen} open ports across the scanned target, with ${finalOpen} services positively identified. Open ports — particularly those associated with legacy protocols, unencrypted services, or internet-exposed administrative interfaces — should be prioritised for immediate remediation or access restriction.\n\nIt is recommended to enforce a principle of least exposure by disabling or firewall-filtering all ports not required for business operations. All internet-facing services should be reviewed for current patch levels, and version-disclosure banners should be suppressed where possible to reduce fingerprinting risk. Port scanning should be performed on a scheduled basis to detect newly introduced services or configuration drift.`;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(conclusionText, 14, y, { maxWidth: 182, lineHeightFactor: 1.4 });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 4 — 5. APPENDIX
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    y = drawSectionHeader(doc, "5. APPENDIX", y);

    // Appendix table Column Reference Guide
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Column Reference Guide", 14, y);
    y += 5;

    renderTable(doc, {
      startY: y,
      head: [["Column", "Description"]],
      body: [
        ["Total Ports Scanned", "Total number of TCP and/or UDP ports examined during the assessment."],
        ["Open Ports",          "Number of ports that accepted incoming network connections and exposed services."],
        ["Closed Ports",        "Number of ports that actively rejected connection requests."],
        ["Filtered Ports",      "Number of ports filtered by firewalls or network controls where the scanner could not determine their exact state."],
        ["Overall Risk Level",  "Overall security posture of the target based on the discovered exposed services and network attack surface."],
        ["Port",                "TCP or UDP port number identified during the assessment."],
        ["Protocol",            "Network protocol associated with the identified port (TCP or UDP)."],
        ["Status",              "Operational state of the port (Open, Closed, or Filtered)."],
        ["Service",             "Network service commonly associated with the identified port (e.g., HTTP, HTTPS, SSH, FTP)."],
        ["Host/ Target",        "Target hostname or IP address on which the port was identified."],
        ["Severity",            "Risk level assigned to the exposed service (Critical, High, Medium, Low, or Informational)."],
        ["Impact",              "Potential security implications of the exposed service, such as unauthorized access, information disclosure, increased attack surface, or exploitation of vulnerable services."],
        ["Recommendation",      "Recommended remediation actions, including disabling unnecessary services, restricting access through firewalls, implementing network segmentation, updating exposed services, and monitoring internet-facing ports regularly."],
      ],
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 45 },
        1: { cellWidth: 137 },
      }
    });
    y = doc.lastAutoTable.finalY + 10;

    // Acknowledgements
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Acknowledgement", 14, y);
    y += 5;

    const ackText = "The findings presented in this report are based on observations made during the assessment period and represent the network exposure status of the environment at the time of scanning. This report contains confidential and proprietary information intended solely for the authorised recipient. Unauthorised disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...C.textMain);
    doc.text(ackText, 14, y, { maxWidth: 182, lineHeightFactor: 1.35 });

    // Apply header & footer decorator
    applyHeaderFooterDecorator(doc, "Port Scanner");

    const pad = (n) => String(n).padStart(2, "0");
    const dStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    
    doc.save(`Port_Scanner_Report_${targetHost}_${dStr}.pdf`);

  } catch (err) {
    console.error("Failed to generate Port Scanner PDF:", err);
  }
};
