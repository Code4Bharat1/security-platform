import { jsPDF } from "jspdf";
import {
  C as sharedC,
  safe,
  drawSectionHeader,
  renderTable,
  getAuditorInfo,
  applyHeaderFooterDecorator,
  getSeverityColor
} from "../../utils/pdfFramework";

// ── Extended Design System Color Tokens (Inherits shared color system) ──
const C = {
  ...sharedC,
  green: [22, 163, 74],
  orange: sharedC.amber,
  cyan: sharedC.bluePrimary,
};

// Legacy severity color alias helper
const sevColor = (sev) => {
  return getSeverityColor(sev);
};

// Helper: Draw Section Title Box
const addSectionHeader = (doc, title, rightText, y = 22) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...C.bluePrimary);
  doc.text(title, 14, y);
  
  if (rightText) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMuted);
    doc.text(rightText, 196, y, { align: "right" });
  }

  doc.setDrawColor(...C.lineColor);
  doc.setLineWidth(0.4);
  doc.line(14, y + 4, 196, y + 4);

  return y + 12;
};

// Table wrapper alias
const baseTable = (doc, opts) => {
  renderTable(doc, opts);
};

// Key-Value data grid renderer
const kvTable = (doc, rows, startY) => {
  renderTable(doc, {
    startY: startY,
    head: [],
    body: rows,
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
      1: { cellWidth: 127 },
    },
  });
  return doc.lastAutoTable.finalY + 4;
};

// Section sub-heading renderer
const subHead = (doc, title, y) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...C.bluePrimary);
  doc.text(title, 14, y + 4);
  return y + 9;
};

// Footer decorator wrapper
const addFooters = (doc) => {
  applyHeaderFooterDecorator(doc, "Vulnerability Scanner");
};

/**
 * generateVulnScannerPDF
 * 
 * @param {Object} scanData - Vulnerability scanning results
 * @param {Function} setPdfProgress - Dynamic progress reporter callback
 * @param {Object} history - Historical scan records state
 */
export const generateVulnScannerPDF = async (scanData, setPdfProgress, history) => {
  if (!scanData) return;
  setPdfProgress("Initializing PDF document...");

  const { employeeName, employeeMail } = getAuditorInfo();

  try {
    const doc = new jsPDF("p", "mm", "a4");
    const domain = safe(scanData.domain, "Unknown Domain");
    const scanDate = scanData.timestamp
      ? new Date(scanData.timestamp).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()
      : new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
    const scanTime = scanData.timestamp
      ? new Date(scanData.timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      : new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 1 — COVER PAGE
    // ══════════════════════════════════════════════════════════════════════
    setPdfProgress("Building cover page...");
    
    // Top blue banner stripe
    doc.setFillColor(...C.bluePrimary);
    doc.rect(0, 0, 210, 3.5, "F");

    // Brand line
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text("NEXCORE ALLIANCE | Individual Tool Report – Vulnerability Scanner", 14, 12);

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
    doc.setFontSize(22);
    doc.setTextColor(...C.bluePrimary);
    doc.text("VULNERABILITY SCANNER", 105, 58, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("SECURITY ASSESSMENT REPORT", 105, 65, { align: "center" });

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
        ["Scanned Target",         domain],
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
    setPdfProgress("Building assessment information...");
    doc.addPage();

    let y = drawSectionHeader(doc, "1. ASSESSMENT INFORMATION", 25);

    // Tool details grid
    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Tool Name",             "Vulnerability Scanner"],
        ["Tool Category",         "Vulnerability Assessment / Web Application Security Scanning"],
        ["Methodology Alignment", "OWASP WSTG / CVE / CVSS v3.1 / NIST NVD / PTES"],
        ["Compliance Alignment",  "ISO/IEC 27001 | AICPA SOC Frameworks"],
        ["Scanned Target",        domain],
        ["Assessment Mode",       "Non-Intrusive / Automated Vulnerability Scan"]
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 }
      }
    });

    y = doc.lastAutoTable.finalY + 12;

    // Tool Overview Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Tool Overview", 14, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textMain);
    const overviewText = "The Vulnerability Scanner performs automated security assessments against target web applications and network endpoints to identify known vulnerabilities, misconfigurations, and exploitable weaknesses. The tool correlates detected indicators against established vulnerability databases including CVE and NIST NVD, and assigns CVSS v3.1 base scores to each finding. Each finding is reported with supporting evidence, a CVSS score, affected component details, and specific remediation guidance. Generic impact paragraphs, placeholder descriptions, unsupported critical findings, and duplicate open-port findings are excluded to ensure all reported vulnerabilities are accurate, evidence-backed, and actionable.";
    
    // Print description text
    doc.text(overviewText, 14, y + 6, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });

    // Spacing after overview text (approx 7 lines of text ~30mm + spacing)
    y = y + 42;

    // Render Scan Summary on Page 2 directly below overview text to maximize layout use
    setPdfProgress("Building scan summary...");
    y = drawSectionHeader(doc, "2. SCAN SUMMARY", y);

    // Calculate vulnerability counts
    const vulns = scanData.vulnerabilities || [];
    const counts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
    vulns.forEach((v) => {
      const s = (v.severity || "info").toLowerCase();
      if (counts[s] !== undefined) counts[s]++;
      else counts.info++;
    });

    // Render Scan Summary table
    renderTable(doc, {
      startY: y,
      head: [["Critical", "High", "Medium", "Low", "Informational"]],
      body: [[
        String(counts.critical),
        String(counts.high),
        String(counts.medium),
        String(counts.low),
        String(counts.info)
      ]],
      headStyles: {
        fillColor: C.bgHeader,
        textColor: C.white,
        halign: "center",
      },
      bodyStyles: {
        halign: "center",
        fontStyle: "bold",
        fontSize: 10,
      },
      columnStyles: {
        0: { textColor: C.purple },
        1: { textColor: C.red },
        2: { textColor: C.amber },
        3: { textColor: C.blue },
        4: { textColor: C.gray }
      }
    });

    y = doc.lastAutoTable.finalY + 10;

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 4 — VULNERABILITY DETAILS
    // ══════════════════════════════════════════════════════════════════════
    setPdfProgress("Building vulnerability details...");
    doc.addPage();
    y = addSectionHeader(doc, "Vulnerability Details", `${vulns.length} findings`);

    if (vulns.length === 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...C.green);
      doc.text("No vulnerabilities detected.", 14, y + 6);
    } else {
      baseTable(doc, {
        startY: y,
        head: [["#", "Severity", "Type", "Description", "Recommendation"]],
        body: vulns.map((v, i) => [
          String(i + 1),
          safe(v.severity, "info").toUpperCase(),
          safe(v.type),
          safe(v.description),
          safe(v.recommendation),
        ]),
        columnStyles: {
          0: { cellWidth: 12, halign: "center" },
          1: { cellWidth: 22, fontStyle: "bold" },
          2: { cellWidth: 30 },
          3: { cellWidth: 65 },
          4: {},
        },
        didParseCell: (data) => {
          if (data.column.index === 1 && data.section === "body") {
            data.cell.styles.textColor = sevColor(data.cell.raw);
          }
        },
      });
    }

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 5 — SSL / TLS SECURITY AUDIT
    // ══════════════════════════════════════════════════════════════════════
    setPdfProgress("Building SSL/TLS section...");
    doc.addPage();
    y = addSectionHeader(doc, "SSL / TLS Security Audit", domain);

    if (scanData.ssl) {
      const ssl = scanData.ssl;
      y = subHead(doc, "Certificate Information", y);
      y = kvTable(doc, [
        ["Status",         ssl.valid ? "Valid" : "Invalid"],
        ["Issuer",         safe(ssl.issuer)],
        ["Valid From",     ssl.validFrom ? new Date(ssl.validFrom).toLocaleString() : "—"],
        ["Valid To",       ssl.validTo ? new Date(ssl.validTo).toLocaleString() : "—"],
        ["Days Remaining", ssl.daysRemaining != null ? `${ssl.daysRemaining} days` : "—"],
        ["PFS Supported",  ssl.perfectForwardSecrecy ? "Yes" : "No"],
        ["ALPN Protocols", ssl.alpnProtocols?.length ? ssl.alpnProtocols.join(", ") : "None"],
      ], y);

      if (ssl.tlsProtocols) {
        y = subHead(doc, "TLS Protocol Support", y);
        baseTable(doc, {
          startY: y,
          head: [["Protocol", "Supported", "Status"]],
          body: Object.entries(ssl.tlsProtocols).map(([ver, sup]) => {
            const deprecated = ver === "TLSv1" || ver === "TLSv1_1";
            return [
              ver.replace("_", "."),
              sup ? "Yes" : "No",
              sup && deprecated ? "DEPRECATED" : sup ? "OK" : "Not Supported",
            ];
          }),
          columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: 30, halign: "center" },
          },
          didParseCell: (data) => {
            if (data.column.index === 2 && data.section === "body") {
              if (data.cell.raw.includes("DEPRECATED")) data.cell.styles.textColor = C.red;
              else if (data.cell.raw.includes("OK"))    data.cell.styles.textColor = C.green;
              else                                       data.cell.styles.textColor = C.gray;
            }
          },
        });
        y = doc.lastAutoTable.finalY + 4;
      }

      if (ssl.cipherSuites?.length > 0) {
        y = subHead(doc, "Cipher Suites", y);
        baseTable(doc, {
          startY: y,
          head: [["Cipher Name", "Protocol", "Bit Strength"]],
          body: ssl.cipherSuites.map((c) => [
            safe(c.name),
            safe(c.version),
            c.bits ? `${c.bits} bits` : "—",
          ]),
          columnStyles: {
            2: { halign: "center", cellWidth: 30 },
          },
        });
        y = doc.lastAutoTable.finalY + 4;
      }

      // TLS Vulnerabilities
      const tlsVulns = (scanData.vulnerabilities || []).filter((v) =>
        ["tls_deprecated_protocol","tls_version_weak","tls_weak_cipher","tls_cbc_cipher","tls_no_pfs"].includes(v.type)
      );
      if (tlsVulns.length > 0) {
        y = subHead(doc, "TLS / Cipher Vulnerabilities", y);
        baseTable(doc, {
          startY: y,
          head: [["Severity", "Description", "Recommendation"]],
          body: tlsVulns.map((v) => [
            safe(v.severity).toUpperCase(),
            safe(v.description),
            safe(v.recommendation),
          ]),
          columnStyles: { 0: { cellWidth: 24, fontStyle: "bold" } },
          didParseCell: (data) => {
            if (data.column.index === 0 && data.section === "body")
              data.cell.styles.textColor = sevColor(data.cell.raw);
          },
        });
      }
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...C.gray);
      doc.text("SSL/TLS data not available for this scan.", 14, y + 6);
    }

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 6 — HTTP HEADERS SECURITY
    // ══════════════════════════════════════════════════════════════════════
    setPdfProgress("Building HTTP headers section...");
    doc.addPage();
    y = addSectionHeader(doc, "HTTP Headers Security", domain);

    if (scanData.headers) {
      const headers = scanData.headers;
      const skippedKeys = ["rawHeaders","httpVersion","statusCode","statusMessage","cookieFindings","csp","_benchmark"];
      const headerRows = Object.entries(headers)
        .filter(([k]) => !skippedKeys.includes(k))
        .map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)]);

      if (headerRows.length > 0) {
        y = subHead(doc, "All HTTP Response Headers", y);
        baseTable(doc, {
          startY: y,
          head: [["Header Name", "Value"]],
          body: headerRows,
          columnStyles: {
            0: { cellWidth: 55, fontStyle: "bold", textColor: C.cyan },
          },
        });
        y = doc.lastAutoTable.finalY + 4;
      }

      // Security header checklist
      y = subHead(doc, "Security Header Analysis", y);
      const secHeaders = [
        ["strict-transport-security", "HSTS", "Add HSTS with max-age=31536000; includeSubDomains; preload"],
        ["x-frame-options",           "X-Frame-Options", "Set DENY or SAMEORIGIN to prevent clickjacking"],
        ["content-security-policy",   "CSP", "Add CSP with default-src 'self', frame-ancestors 'self'"],
        ["x-content-type-options",    "X-Content-Type-Options", "Set nosniff"],
        ["x-xss-protection",          "X-XSS-Protection", "Set 1; mode=block"],
        ["referrer-policy",           "Referrer-Policy", "Set strict-origin-when-cross-origin"],
        ["permissions-policy",        "Permissions-Policy", "Restrict camera, microphone, geolocation"],
      ];
      baseTable(doc, {
        startY: y,
        head: [["Header", "Status", "Value / Recommendation"]],
        body: secHeaders.map(([key, name, rec]) => {
          const val = headers[key];
          return [name, val ? "Present" : "Missing", val || rec];
        }),
        columnStyles: {
          0: { cellWidth: 52, fontStyle: "bold" },
          1: { cellWidth: 26, halign: "center", fontStyle: "bold" },
        },
        didParseCell: (data) => {
          if (data.column.index === 1 && data.section === "body") {
            data.cell.styles.textColor = data.cell.raw === "Present" ? C.green : C.red;
          }
        },
      });
      y = doc.lastAutoTable.finalY + 4;

      // 404 error handling
      if (scanData.errorHandling?.check404) {
        y = subHead(doc, "404 Error Handling", y);
        const e4 = scanData.errorHandling.check404;
        y = kvTable(doc, [
          ["Properly Configured", e4.properlyConfigured ? "Yes" : "No"],
          ["Status Code Returned", safe(e4.statusCode)],
        ], y);
      }
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...C.gray);
      doc.text("HTTP headers data not available.", 14, y + 6);
    }

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 7 — COOKIE INTEGRITY ANALYSIS
    // ══════════════════════════════════════════════════════════════════════
    setPdfProgress("Building cookies section...");
    doc.addPage();
    y = addSectionHeader(doc, "Cookie Integrity Analysis", domain);

    const cookies = scanData.headers?.cookieFindings || [];
    if (cookies.length > 0) {
      baseTable(doc, {
        startY: y,
        head: [["Cookie Name", "Flags", "Security Issues"]],
        body: cookies.map((c) => [
          safe(c.name),
          Array.isArray(c.flags) ? c.flags.join(", ") : "—",
          c.issues?.length > 0 ? c.issues.join("; ") : "No issues",
        ]),
        columnStyles: {
          0: { cellWidth: 45, fontStyle: "bold" },
          1: { cellWidth: 55 },
        },
        didParseCell: (data) => {
          if (data.column.index === 2 && data.section === "body") {
            data.cell.styles.textColor = data.cell.raw === "No issues" ? C.green : C.orange;
          }
        },
      });
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...C.gray);
      doc.text("No cookies detected in this scan.", 14, y + 6);
    }

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 8 — SESSION SECURITY AUDIT
    // ══════════════════════════════════════════════════════════════════════
    setPdfProgress("Building sessions section...");
    doc.addPage();
    y = addSectionHeader(doc, "Session Security Audit", domain);

    if (scanData.sessionManagement) {
      const sm = scanData.sessionManagement;
      y = kvTable(doc, [
        ["Sessions Detected",    sm.sessionCreated ? "Yes" : "No"],
        ["Total Session Cookies", safe(sm.sessionDetails?.totalSessionCookies, "0")],
        ["Secure Cookies",       safe(sm.sessionDetails?.secureCount, "0")],
        ["HttpOnly Cookies",     safe(sm.sessionDetails?.httpOnlyCount, "0")],
        ["SameSite Cookies",     safe(sm.sessionDetails?.sameSiteCount, "0")],
      ], y);

      if (sm.sessionCookies?.length > 0) {
        y = subHead(doc, "Session Cookie Details", y);
        baseTable(doc, {
          startY: y,
          head: [["Cookie Name", "Secure", "HttpOnly", "SameSite"]],
          body: sm.sessionCookies.map((c) => [
            safe(c.name),
            c.attributes?.secure ? "Yes" : "No",
            c.attributes?.httponly ? "Yes" : "No",
            c.attributes?.samesite ? "Yes" : "No",
          ]),
          columnStyles: {
            0: { cellWidth: 60, fontStyle: "bold" },
            1: { cellWidth: 30, halign: "center" },
            2: { cellWidth: 30, halign: "center" },
            3: { halign: "center" },
          },
          didParseCell: (data) => {
            if ([1, 2, 3].includes(data.column.index) && data.section === "body") {
              data.cell.styles.textColor = data.cell.raw === "Yes" ? C.green : C.red;
              data.cell.styles.fontStyle = "bold";
            }
          },
        });
        y = doc.lastAutoTable.finalY + 4;
      }

      if (sm.securityIssues?.length > 0) {
        y = subHead(doc, "Session Security Issues", y);
        baseTable(doc, {
          startY: y,
          head: [["Issue", "Affected Cookie", "Description", "Recommendation"]],
          body: sm.securityIssues.map((i) => [
            safe(i.issue),
            safe(i.cookie),
            safe(i.description),
            safe(i.recommendation),
          ]),
          columnStyles: {
            0: { cellWidth: 35, fontStyle: "bold", textColor: C.red },
            1: { cellWidth: 35 },
          },
        });
      }
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...C.gray);
      doc.text("Session management data not available.", 14, y + 6);
    }

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 9 — CONTENT SECURITY POLICY
    // ══════════════════════════════════════════════════════════════════════
    setPdfProgress("Building CSP section...");
    doc.addPage();
    y = addSectionHeader(doc, "Content Security Policy (CSP)", domain);

    const csp = scanData.headers?.csp;
    if (csp) {
      y = kvTable(doc, [
        ["CSP Present", csp.present ? "Yes" : "No"],
        ["Status",      csp.issues?.length > 0 ? "Issues Found" : csp.present ? "Properly Configured" : "Missing"],
      ], y);

      if (csp.policy) {
        y = subHead(doc, "Policy String", y);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...C.textMain);
        const policyLines = doc.splitTextToSize(csp.policy, 185);
        doc.text(policyLines, 14, y);
        y += policyLines.length * 4 + 4;
      }

      if (csp.directives && Object.keys(csp.directives).length > 0) {
        y = subHead(doc, "CSP Directives", y);
        baseTable(doc, {
          startY: y,
          head: [["Directive", "Values"]],
          body: Object.entries(csp.directives).map(([k, vals]) => [
            k,
            Array.isArray(vals) ? vals.join(" ") : String(vals),
          ]),
          columnStyles: {
            0: { cellWidth: 55, fontStyle: "bold", textColor: C.cyan },
          },
        });
        y = doc.lastAutoTable.finalY + 4;
      }

      if (csp.issues?.length > 0) {
        y = subHead(doc, "CSP Issues", y);
        baseTable(doc, {
          startY: y,
          head: [["Issue"]],
          body: csp.issues.map((i) => [i]),
          didParseCell: (data) => {
            if (data.section === "body") data.cell.styles.textColor = C.red;
          },
        });
      }
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...C.red);
      doc.text("CSP header not present. Recommend adding a Content-Security-Policy header.", 14, y + 6);
    }

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 10 — WEB APPLICATION INSPECTION
    // ══════════════════════════════════════════════════════════════════════
    setPdfProgress("Building web application section...");
    doc.addPage();
    y = addSectionHeader(doc, "Web Application Inspection", domain);

    // HTML Analysis
    if (scanData.htmlAnalysis) {
      const h = scanData.htmlAnalysis;
      y = subHead(doc, "HTML Form Security", y);
      y = kvTable(doc, [
        ["Forms Found",          safe(h.formsFound, "0")],
        ["Password Fields",      safe(h.passwordFields, "0")],
        ["Insecure Form Actions", h.insecureActions?.length ? String(h.insecureActions.length) : "None"],
        ["Autocomplete Issues",  h.autoCompleteIssues?.length ? String(h.autoCompleteIssues.length) : "None"],
        ["Cleartext Credentials", h.cleartextCredentials ? "DETECTED" : "None"],
      ], y);

      if (h.insecureActions?.length > 0) {
        y = subHead(doc, "Insecure Form Actions (HTTP endpoints)", y);
        baseTable(doc, {
          startY: y,
          head: [["URL"]],
          body: h.insecureActions.map((a) => [a]),
          didParseCell: (data) => {
            if (data.section === "body") data.cell.styles.textColor = C.red;
          },
        });
        y = doc.lastAutoTable.finalY + 4;
      }
    }

    // Directory Enumeration
    if (scanData.directoryEnumeration?.tested && scanData.directoryEnumeration.foundPaths?.length > 0) {
      y = subHead(doc, "Directory & File Enumeration — Exposed Paths", y);
      baseTable(doc, {
        startY: y,
        head: [["Path", "Status", "Content Type", "URL"]],
        body: scanData.directoryEnumeration.foundPaths.map((p) => [
          safe(p.path),
          `${safe(p.statusCode)} ${safe(p.statusText)}`,
          safe(p.contentType, "unknown"),
          safe(p.url),
        ]),
        columnStyles: {
          0: { cellWidth: 40, fontStyle: "bold", textColor: C.blue },
          1: { cellWidth: 26, halign: "center" },
          2: { cellWidth: 34 },
        },
      });
      y = doc.lastAutoTable.finalY + 4;
    }

    // Sitemap
    if (scanData.sitemap?.type) {
      y = subHead(doc, "Web Sitemap", y);
      y = kvTable(doc, [
        ["Sitemap Type",  safe(scanData.sitemap.type)],
        ["Sitemap URL",   safe(scanData.sitemap.url)],
        ["Total URLs",    safe(scanData.sitemap.totalUrls, "—")],
      ], y);
    }

    // External URLs
    const extUrls = scanData.serviceDetection?.externalUrls || [];
    if (extUrls.length > 0) {
      y = subHead(doc, `External URLs & Dependencies (${extUrls.length})`, y);
      baseTable(doc, {
        startY: y,
        head: [["#", "URL"]],
        body: extUrls.slice(0, 50).map((u, i) => [String(i + 1), u]),
        columnStyles: { 0: { cellWidth: 12, halign: "center" } },
      });
    }

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 11 — SECURITY BENCHMARKING
    // ══════════════════════════════════════════════════════════════════════
    setPdfProgress("Building benchmark section...");
    doc.addPage();
    y = addSectionHeader(doc, "Security Benchmarking", domain);

    const benchmark = scanData.headers?._benchmark;
    const grade = scanData.securityGrade || benchmark?.grade || "—";

    y = kvTable(doc, [
      ["Security Grade",   grade],
      ["Risk Level",       safe(scanData.riskLevel, "—").toUpperCase()],
      ["Response Time",    scanData.timespan ? `${scanData.timespan} ms` : "—"],
      ["Compared Against", benchmark?.comparedTo ? `${benchmark.comparedTo} past scans` : "First scan"],
    ], y);

    if (benchmark?.deltas && Object.keys(benchmark.deltas).length > 0) {
      y = subHead(doc, "Performance Deltas vs Previous Scans", y);
      baseTable(doc, {
        startY: y,
        head: [["Metric", "Delta", "Trend"]],
        body: Object.entries(benchmark.deltas).map(([k, delta]) => [
          k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).replace("Delta", ""),
          `${delta > 0 ? "+" : ""}${delta}`,
          delta < 0 ? "↓ Improved" : delta > 0 ? "↑ Degraded" : "→ No change",
        ]),
        columnStyles: {
          1: { cellWidth: 25, halign: "center", fontStyle: "bold" },
          2: { cellWidth: 35, halign: "center" },
        },
        didParseCell: (data) => {
          if (data.column.index === 2 && data.section === "body") {
            data.cell.styles.textColor = data.cell.raw.includes("Improved") ? C.green
              : data.cell.raw.includes("Degraded") ? C.red : C.gray;
          }
        },
      });
    }

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 12 — SERVER & SERVICE INSPECTION
    // ══════════════════════════════════════════════════════════════════════
    setPdfProgress("Building server service section...");
    doc.addPage();
    y = addSectionHeader(doc, "Server & Service Inspection", domain);

    const sd = scanData.serviceDetection;
    if (sd) {
      if (sd.serverInfo?.type) {
        y = subHead(doc, "HTTP Server Information", y);
        y = kvTable(doc, [
          ["Server Type",      safe(sd.serverInfo.type)],
          ["Server Version",   safe(sd.serverInfo.version)],
          ["Operating System", safe(sd.serverInfo.os)],
        ].filter(([, v]) => v !== "—"), y);
      }

      if (sd.httpInfo) {
        y = subHead(doc, "HTTP Protocol", y);
        y = kvTable(doc, [
          ["HTTP Version", `HTTP/${safe(sd.httpInfo.version)}`],
          ["Status Code",  `${safe(sd.httpInfo.statusCode)} ${safe(sd.httpInfo.statusMessage)}`],
        ], y);
      }

      if (sd.cms) {
        y = subHead(doc, "CMS Detection", y);
        y = kvTable(doc, [
          ["CMS Name",       safe(sd.cms.name)],
          ["Version",        safe(sd.cms.version)],
          ["Confidence",     safe(sd.cms.confidence)],
          ["Detected Via",   safe(sd.cms.detected)],
        ].filter(([, v]) => v !== "—"), y);
      }

      if (sd.frameworks?.length > 0) {
        y = subHead(doc, "Detected Frameworks & Libraries", y);
        baseTable(doc, {
          startY: y,
          head: [["Name", "Version", "Confidence", "Detected Via"]],
          body: sd.frameworks.map((f) => [safe(f.name), safe(f.version), safe(f.confidence), safe(f.detected)]),
        });
        y = doc.lastAutoTable.finalY + 4;
      }

      if (sd.technologies?.length > 0) {
        y = subHead(doc, "Technologies & Tools", y);
        baseTable(doc, {
          startY: y,
          head: [["Technology", "Type", "Confidence"]],
          body: sd.technologies.map((t) => [safe(t.name), safe(t.type), safe(t.confidence)]),
        });
        y = doc.lastAutoTable.finalY + 4;
      }

      if (sd.cpe?.length > 0) {
        y = subHead(doc, "Common Platform Enumeration (CPE)", y);
        baseTable(doc, {
          startY: y,
          head: [["Product", "Vendor", "Version", "CPE String"]],
          body: sd.cpe.map((c) => [safe(c.product), safe(c.vendor), safe(c.version), safe(c.cpe23)]),
          columnStyles: { 3: { fontSize: 7 } },
        });
      }
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...C.gray);
      doc.text("Service detection data not available.", 14, y + 6);
    }

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 13 — DNS & NETWORK
    // ══════════════════════════════════════════════════════════════════════
    setPdfProgress("Building DNS section...");
    doc.addPage();
    y = addSectionHeader(doc, "DNS & Network Analysis", domain);

    const fqdn = sd?.fqdnInfo;
    if (fqdn) {
      y = kvTable(doc, [
        ["FQDN",            safe(fqdn.fqdn)],
        ["IPv4 Addresses",  fqdn.ipv4Addresses?.join(", ") || "—"],
      ], y);

      if (fqdn.reverseDns?.length > 0) {
        y = subHead(doc, "Reverse DNS Lookup", y);
        baseTable(doc, {
          startY: y,
          head: [["IP Address", "Hostname(s)"]],
          body: fqdn.reverseDns.map((e) => [safe(e.ip), e.hostnames?.join(", ") || "No reverse DNS"]),
          columnStyles: {
            0: { cellWidth: 45, fontStyle: "bold", textColor: C.cyan },
          },
        });
        y = doc.lastAutoTable.finalY + 4;
      }
    }

    const traceroute = sd?.traceroute;
    if (traceroute?.supported && traceroute.hops?.length > 0) {
      y = subHead(doc, `Network Traceroute (${traceroute.totalHops} hops)`, y);
      baseTable(doc, {
        startY: y,
        head: [["Hop", "IP Address", "Hostname", "RTT"]],
        body: traceroute.hops.map((h) => [
          safe(h.hopNumber),
          safe(h.ip),
          safe(h.hostname, "—"),
          h.rtt1 !== "*" ? safe(h.rtt1) : "*",
        ]),
        columnStyles: {
          0: { cellWidth: 14, halign: "center" },
          1: { cellWidth: 44, fontStyle: "bold", textColor: C.cyan },
          3: { cellWidth: 25, halign: "center" },
        },
      });
      y = doc.lastAutoTable.finalY + 4;
    }

    const nt = sd?.networkTimings;
    if (nt?.supported && nt.timings) {
      y = subHead(doc, "Network Performance Timings", y);
      const timRows = [];
      if (nt.timings.dnsLookup)     timRows.push(["DNS Lookup",    `${nt.timings.dnsLookup.toFixed(2)} ms`]);
      if (nt.timings.tcpConnection) timRows.push(["TCP Connection", `${nt.timings.tcpConnection.toFixed(2)} ms`]);
      if (nt.timings.tlsHandshake)  timRows.push(["TLS Handshake", `${nt.timings.tlsHandshake.toFixed(2)} ms`]);
      if (nt.timings.ttfb)          timRows.push(["TTFB",          `${nt.timings.ttfb.toFixed(2)} ms`]);
      if (nt.timings.totalTime)     timRows.push(["Total Time",    `${nt.timings.totalTime.toFixed(2)} ms`]);
      if (timRows.length > 0) y = kvTable(doc, timRows, y);
    }

    if (!fqdn && !traceroute?.supported && !nt?.supported) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...C.gray);
      doc.text("DNS / network data not available.", 14, y + 6);
    }

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 14 — WAF & FIREWALL STATUS
    // ══════════════════════════════════════════════════════════════════════
    setPdfProgress("Building firewall/WAF section...");
    doc.addPage();
    y = addSectionHeader(doc, "WAF & Firewall Status", domain);

    if (scanData.firewall) {
      const fw = scanData.firewall;
      y = kvTable(doc, [
        ["WAF Detected",    fw.detected ? "Yes" : "No"],
        ["WAF Type",        fw.detected ? safe(fw.wafType, "Unknown") : "—"],
        ["Confidence",      fw.detected ? safe(fw.confidence, "—").toUpperCase() : "—"],
        ["Fingerprints",    fw.fingerprints?.length ? String(fw.fingerprints.length) : "0"],
        ["Security Tests",  fw.testResults?.length ? String(fw.testResults.length) : "0"],
      ], y);

      if (!fw.detected) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...C.amber);
        doc.text(
          "No WAF detected. Consider deploying Cloudflare, AWS WAF, or ModSecurity.",
          14, y + 2
        );
        y += 10;
      }

      if (fw.fingerprints?.length > 0) {
        y = subHead(doc, "WAF Fingerprints", y);
        baseTable(doc, {
          startY: y,
          head: [["Header / Type", "WAF", "Value / Pattern"]],
          body: fw.fingerprints.map((fp) => [safe(fp.header || fp.type), safe(fp.waf), safe(fp.value || fp.pattern)]),
          columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: 30, fontStyle: "bold", textColor: C.green },
          },
        });
        y = doc.lastAutoTable.finalY + 4;
      }

      if (fw.testResults?.length > 0) {
        y = subHead(doc, "WAF Security Test Results", y);
        baseTable(doc, {
          startY: y,
          head: [["Attack Type", "Status", "HTTP Code", "Payload"]],
          body: fw.testResults.map((t) => [
            safe(t.type),
            t.blocked ? "BLOCKED" : "NOT BLOCKED",
            safe(t.statusCode),
            safe(t.payload),
          ]),
          columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: 30, fontStyle: "bold", halign: "center" },
            2: { cellWidth: 22, halign: "center" },
          },
          didParseCell: (data) => {
            if (data.column.index === 1 && data.section === "body") {
              data.cell.styles.textColor = data.cell.raw === "BLOCKED" ? C.green : C.red;
            }
          },
        });
        y = doc.lastAutoTable.finalY + 4;
      }

      if (fw.details?.length > 0) {
        y = subHead(doc, "Additional Information", y);
        baseTable(doc, {
          startY: y,
          head: [["Detail"]],
          body: fw.details.map((d) => [d]),
        });
      }
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...C.gray);
      doc.text("Firewall / WAF detection data not available.", 14, y + 6);
    }

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 15 — PORT SCANNER LOGS
    // ══════════════════════════════════════════════════════════════════════
    setPdfProgress("Building port scanner section...");
    doc.addPage();
    y = addSectionHeader(doc, "Port Scanner Logs", domain);

    if (scanData.portScan) {
      const ps = scanData.portScan;
      y = kvTable(doc, [
        ["Host Status",    safe(ps.hostStatus, "unknown").toUpperCase()],
        ["Scan Type",      safe(ps.scanType, "TCP Connect")],
        ["Ports Scanned",  safe(ps.totalScanned, "0")],
        ["Open Ports",     String(ps.openPorts?.length || 0)],
        ["Closed Ports",   String(ps.closedPorts?.length || 0)],
        ["Filtered Ports", String(ps.filteredPorts?.length || 0)],
        ["Scan Duration",  ps.scanDuration ? `${ps.scanDuration} ms` : "—"],
      ], y);

      if (ps.openPorts?.length > 0) {
        y = subHead(doc, "Open Ports", y);
        baseTable(doc, {
          startY: y,
          head: [["Port", "Service", "Protocol", "State", "Risk", "Version / Banner"]],
          body: ps.openPorts.map((p) => [
            String(p.port),
            safe(p.service, "Unknown"),
            safe(p.protocol, "TCP").toUpperCase(),
            safe(p.state, "open").toUpperCase(),
            safe(p.risk, "low").toUpperCase(),
            p.version ? safe(p.version) : (p.banner ? `Banner: ${p.banner.substring(0, 40)}` : "—"),
          ]),
          columnStyles: {
            0: { cellWidth: 16, halign: "center", fontStyle: "bold", textColor: C.green },
            1: { cellWidth: 30 },
            2: { cellWidth: 22, halign: "center" },
            3: { cellWidth: 22, halign: "center" },
            4: { cellWidth: 24, fontStyle: "bold", halign: "center" },
          },
          didParseCell: (data) => {
            if (data.column.index === 4 && data.section === "body") {
              const risk = (data.cell.raw || "").toLowerCase();
              data.cell.styles.textColor =
                risk.includes("critical") ? C.purple :
                risk.includes("high") ? C.red :
                risk.includes("medium") ? C.amber : C.green;
            }
          },
        });
      }
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...C.gray);
      doc.text("Port scan data not available.", 14, y + 6);
    }

    // ══════════════════════════════════════════════════════════════════════
    // PAGE 16 — HISTORICAL RECORDS
    // ══════════════════════════════════════════════════════════════════════
    setPdfProgress("Building historical records section...");
    doc.addPage();
    y = addSectionHeader(doc, "Historical Records", domain);

    if (history?.items?.length > 0) {
      baseTable(doc, {
        startY: y,
        head: [["Date", "Vulnerabilities", "Risk Level", "Grade", "Response Time", "SSL"]],
        body: history.items.map((row) => [
          new Date(row.timestamp).toLocaleString(),
          safe(row.vulnerabilityCount, "—"),
          safe(row.riskLevel, "—").toUpperCase(),
          safe(row.headers?._benchmark?.grade, "—"),
          typeof row.timespan === "number" ? `${row.timespan} ms` : "—",
          row.ssl?.valid !== undefined ? (row.ssl.valid ? "Valid" : "Invalid") : "—",
        ]),
        columnStyles: {
          0: { cellWidth: 38 },
          1: { cellWidth: 26, halign: "center" },
          2: { cellWidth: 24, halign: "center" },
          3: { cellWidth: 16, halign: "center", fontStyle: "bold" },
          4: { cellWidth: 26, halign: "center" },
        },
        didParseCell: (data) => {
          if (data.column.index === 5 && data.section === "body") {
            data.cell.styles.textColor = data.cell.raw === "Valid" ? C.green : C.red;
          }
        },
      });
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...C.gray);
      doc.text("No historical scan records available.", 14, y + 6);
    }

    // ══════════════════════════════════════════════════════════════════════
    // DRAW PAGE HEADERS & FOOTERS (Post-processing decorator)
    // ══════════════════════════════════════════════════════════════════════
    setPdfProgress("Finalising document...");
    addFooters(doc);

    setPdfProgress("Saving PDF...");
    doc.save(`${domain}-VAPT-Report-${Date.now()}.pdf`);
  } catch (err) {
    console.error("Failed to generate PDF:", err);
  } finally {
    setPdfProgress(null);
  }
};
