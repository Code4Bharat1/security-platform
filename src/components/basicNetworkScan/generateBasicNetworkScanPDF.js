import { jsPDF } from "jspdf";
import {
  C,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
} from "../../utils/pdfFramework";

export const generateBasicNetworkScanPDF = async (result = {}, target = "127.0.0.1") => {
  const { employeeName, employeeMail } = getAuditorInfo();
  
  // Format dates
  const now = new Date();
  const scanDate = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  const scanTime = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const summary = result.summary || {};
  const hosts = result.hostResults || [];
  const riskLevel = (summary.riskLevel || "clean").toUpperCase();
  
  // Assign risk score based on level
  let riskScore = 0;
  if (riskLevel === "CRITICAL") riskScore = 95;
  else if (riskLevel === "HIGH") riskScore = 80;
  else if (riskLevel === "MEDIUM") riskScore = 50;
  else if (riskLevel === "LOW") riskScore = 20;

  try {
    const doc = new jsPDF("p", "mm", "a4");

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 1 — COVER PAGE
    // ════════════════════════════════════════════════════════════════════════
    // Top banner stripe
    doc.setFillColor(...C.bluePrimary);
    doc.rect(0, 0, 210, 3.5, "F");

    // Brand line
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – Basic Network Scan", 14, 12);

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
    doc.text("BASIC NETWORK SCANNING SECURITY ASSESSMENT", 105, 54, { align: "center" });
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
        ["Scanned Target / Range",  target],
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
        ["Tool Name",             "Basic Network Scanning"],
        ["Tool Category",         "Vulnerability Assessment / Network Discovery"],
        ["Methodology Alignment", "OWASP WSTG – OTG-INFO-002 / Active Network Discovery"],
        ["Compliance Alignment",  "ISO/IEC 27001 | AICPA SOC Frameworks"],
        ["Scanned Target / Range",target],
        ["Assessment Mode",       "Non-Intrusive / Automated Port Probe & Service Scanner"],
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
      "The Basic Network Scanning tool performs non-intrusive scans of target networks, IP ranges, or subnets. It detects open TCP/UDP ports, identifies network service protocols, and analyzes banner metadata. This assessment highlights exposed interfaces, potential misconfigurations, and services running without authorization, assisting administrators in minimizing the network's attack surface.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(overviewText, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 3 — SCAN SUMMARY & HOST DETAILS
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    y = drawSectionHeader(doc, "2. SCAN SUMMARY", y);

    renderTable(doc, {
      startY: y,
      head: [["Total Hosts", "Alive Hosts", "Total Scanned", "Open Ports", "Max Risk Level", "Status"]],
      body: [
        [
          String(summary.totalHosts || 0),
          String(summary.aliveHosts || 0),
          String(summary.totalScanned || 0),
          String(summary.openCount || 0),
          riskLevel,
          "Completed"
        ]
      ],
      headStyles: { fillColor: C.bgHeader, textColor: C.white, halign: "center" },
      columnStyles: {
        0: { halign: "center", cellWidth: 25 },
        1: { halign: "center", cellWidth: 25 },
        2: { halign: "center", cellWidth: 32 },
        3: { halign: "center", cellWidth: 28 },
        4: { halign: "center", cellWidth: 35 },
        5: { halign: "center", cellWidth: 37 },
      },
      didParseCell: (data) => {
        if (data.column.index === 4 && data.section === "body") {
          if (riskLevel === "CRITICAL" || riskLevel === "HIGH") {
            data.cell.styles.textColor = C.red;
            data.cell.styles.fontStyle = "bold";
          } else if (riskLevel === "MEDIUM") {
            data.cell.styles.textColor = C.amber;
            data.cell.styles.fontStyle = "bold";
          } else {
            data.cell.styles.textColor = [22, 163, 74];
            data.cell.styles.fontStyle = "bold";
          }
        }
      }
    });
    y = doc.lastAutoTable.finalY + 8;

    y = drawSectionHeader(doc, "3. DETAILED FINDINGS — TARGET HOSTS", y);

    const hostRows = hosts.map((h) => {
      const openCount = h.openPorts?.length ?? 0;
      const status = h.alive ? "Online" : "Offline";
      return [
        h.target,
        h.resolvedIp || "—",
        status,
        String(openCount),
        openCount > 0 ? "Exposed" : "Secure"
      ];
    });

    if (hostRows.length === 0) {
      hostRows.push(["No target hosts detected.", "—", "—", "—", "—"]);
    }

    renderTable(doc, {
      startY: y,
      head: [["Host target", "Resolved IP", "Status", "Open Ports", "Risk Profile"]],
      body: hostRows,
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 40 },
        2: { cellWidth: 25, halign: "center" },
        3: { cellWidth: 25, halign: "center" },
        4: { cellWidth: 42, halign: "center" },
      },
      didParseCell: (data) => {
        if (data.column.index === 4 && data.section === "body") {
          const val = String(data.cell.raw || "");
          if (val === "Exposed") {
            data.cell.styles.textColor = C.red;
            data.cell.styles.fontStyle = "bold";
          } else if (val === "Secure") {
            data.cell.styles.textColor = [22, 163, 74];
            data.cell.styles.fontStyle = "bold";
          }
        }
      }
    });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 4 — PORT DETAILS PER HOST
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    y = drawSectionHeader(doc, "3. DETAILED FINDINGS — PORT AUDIT", y);

    // Loop through hosts and print open port lists
    hosts.forEach((h) => {
      if (y > 240) {
        doc.addPage();
        y = 25;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(...C.bluePrimary);
      doc.text(`Host: ${h.target} (${h.resolvedIp || "Unresolved IP"})`, 14, y);
      y += 5;

      const portRows = (h.ports || []).map((p) => {
        const isOpen = p.state === "open" || p.state === "open|filtered";
        return [
          `${p.port} / ${p.protocol.toUpperCase()}`,
          p.state.toUpperCase(),
          isOpen ? (p.service || "unknown") : "—",
          isOpen ? (p.risk || "medium").toUpperCase() : "NONE",
          isOpen ? (p.impact || "Exposed port service") : "Port Closed"
        ];
      });

      if (portRows.length === 0) {
        portRows.push(["No ports scanned / found.", "—", "—", "—", "—"]);
      }

      renderTable(doc, {
        startY: y,
        head: [["Port / Proto", "State", "Service", "Risk", "Notes"]],
        body: portRows,
        headStyles: { fillColor: C.bgHeader, textColor: C.white },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 35 },
          1: { cellWidth: 25, halign: "center" },
          2: { cellWidth: 30 },
          3: { cellWidth: 25, halign: "center" },
          4: { cellWidth: 67 },
        },
        didParseCell: (data) => {
          if (data.column.index === 3 && data.section === "body") {
            const val = String(data.cell.raw || "");
            if (val === "CRITICAL" || val === "HIGH") {
              data.cell.styles.textColor = C.red;
              data.cell.styles.fontStyle = "bold";
            } else if (val === "MEDIUM") {
              data.cell.styles.textColor = C.amber;
              data.cell.styles.fontStyle = "bold";
            } else if (val === "LOW") {
              data.cell.styles.textColor = [22, 163, 74];
            }
          }
        }
      });

      y = doc.lastAutoTable.finalY + 8;
    });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 5 — CONCLUSION & APPENDIX
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    y = 25;

    y = drawSectionHeader(doc, "4. CONCLUSION & RECOMMENDATIONS", y);

    const exposedCount = hosts.filter(h => h.openPorts?.length > 0).length;
    const conclusionText1 = exposedCount > 0
      ? `The Basic Network Scan detected active listening services on ${exposedCount} of the target hosts. Exposed ports and open TCP interfaces constitute immediate network exposure points. A maximum risk level of ${riskLevel} was flagged.`
      : `The Basic Network Scan did not detect any open TCP/UDP service interfaces on the target range. Security filters appear to drop port scans cleanly. The targets represent a safe external network footprint profile.`;

    const conclusionText2 = "It is recommended to implement firewall ingress filters to hide management interfaces (SSH, VNC, RDP) from public internet sweeps. Enforce transport encryption (TLS) on all active web services, and disable insecure cleartext protocols such as Telnet or unauthenticated databases. Regularly re-run network sweep audits to catch unauthorized development interfaces.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(conclusionText1, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });
    y += 18;

    doc.text(conclusionText2, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });
    y += 26;

    y = drawSectionHeader(doc, "5. APPENDIX", y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Column Reference Guide", 14, y);
    y += 5;

    renderTable(doc, {
      startY: y,
      head: [["Column", "Description"]],
      body: [
        ["Port / Proto", "The network port index and standard transport layer protocol (TCP or UDP)"],
        ["State", "Connection state: Open (accepting), Filtered (blocked/dropped), or Closed"],
        ["Service", "Identified service handler protocol (HTTP, SSH, MySQL, FTP, etc.)"],
        ["Risk Level", "Assigned threat severity representing service exploits or exposure risks"],
      ],
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

    const ackText = "The findings presented in this report are based on observations made during the assessment period and represent the network interface vulnerability status of the target at the time of scanning. This report contains confidential and proprietary information intended solely for the authorized recipient. Unauthorized disclosure, distribution, or reproduction of this report is prohibited without prior written consent from Nexcore Alliance.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    doc.text(ackText, 14, y, { maxWidth: 182, align: "justify", lineHeightFactor: 1.35 });

    applyHeaderFooterDecorator(doc, "Basic Network Scan");
    doc.save(`Basic_Network_Scan_Report_${scanDate}.pdf`);

  } catch (err) {
    console.error("Failed to generate Network Scan PDF:", err);
  }
};
