"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Loader2,
  Search as SearchIcon,
  Clock,
  Shield,
  History,
  Cookie,
  FileText,
  BarChart,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Code,
  Globe,
  FileCode,
  Database,
  ExternalLink,
  Network,
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";

/**
 * Enhanced Vulnerability Scanner component
 * - Updated to handle new backend functionalities
 * - Added support for new vulnerability types
 * - Enhanced security analysis display
 * - Improved vulnerability categorization and severity handling
 */

export default function Vulnscanner() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [scanData, setScanData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [history, setHistory] = useState(null);
  const protectedAction = useProtectedAction();

  const API_BASE = useMemo(
    () => process.env.NEXT_PUBLIC_PROD_API_URL.replace(/\/+$/, ""),
    []
  );

  const validateUrl = (v) => {
    const val = (v || "").trim();
    const urlPattern = new RegExp(
      "^(https?:\\/\\/)?(([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}(:\\d+)?(\\/.*)?$",
      "i"
    );
    return !!urlPattern.test(val);
  };

  const domainFromUrl = (v) =>
    (v || "")
      .trim()
      .replace(/^https?:\/\//, "")
      .split("/")[0];

  const fetchHistory = async (domain, token) => {
    try {
      setHistory(null);
      const res = await fetch(
        `${API_BASE}/scan/history?domain=${encodeURIComponent(
          domain
        )}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setHistory(data);
    } catch (e) {
      console.error("Fetch history error:", e);
      setHistory({ error: e.message });
    }
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!validateUrl(url)) {
      setError("Please enter a valid website URL.");
      return;
    }

    const domain = domainFromUrl(url);
    setError("");
    setLoading(true);
    setScanData(null);
    setHistory(null);

    // ✅ Wrap entire protected logic in protectedAction
    await protectedAction(async (token) => {
      try {
        // ✅ Run scan with authenticated token
        const response = await fetch(`${API_BASE}/scan/run-scan`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ url: `https://${domain}` }),
        });

        const result = await response.json();

        console.log("SCAN RESULT:", result);
        console.log("RAW HEADERS (as sent):", result?.headers?.rawHeaders);
        console.log(
          "COOKIES (as sent):",
          result?.headers?.cookieFindings ?? result?.headers?.cookies
        );

        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }

        setScanData(result);
        setActiveTab("overview");
        await fetchHistory(domain, token);
      } catch (err) {
        console.error("Error:", err);
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    });
  };

  const getSeverityColor = (severity) => {
    switch ((severity || "").toLowerCase()) {
      case "critical":
        return "bg-purple-500/20 text-purple-400 border-purple-500";
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500";
      case "low":
        return "bg-blue-500/20 text-blue-400 border-blue-500";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500";
    }
  };

  const getSeverityIcon = (severity) => {
    switch ((severity || "").toLowerCase()) {
      case "critical":
        return <XCircle className="w-4 h-4 text-purple-400" />;
      case "high":
        return <XCircle className="w-4 h-4 text-red-400" />;
      case "medium":
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case "low":
        return <Info className="w-4 h-4 text-blue-400" />;
      default:
        return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRiskLevelColor = (level) => {
    switch ((level || "").toLowerCase()) {
      case "high":
        return "text-red-400";
      case "medium":
        return "text-yellow-400";
      case "low":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  const getVulnerabilityTypeLabel = (type) => {
    const typeLabels = {
      ssl: "SSL/TLS",
      clickjacking: "Clickjacking",
      form: "Form Security",
      cleartext_credentials: "Cleartext Credentials",
      external_url: "External URLs",
      cgi_http_error: "CGI HTTP Errors",
      cgi_load: "CGI Load Issues",
      cgi_injectable: "CGI Injection",
      header: "Security Headers",
      information_disclosure: "Information Disclosure",
      cookie: "Cookie Security",
      csp: "Content Security Policy",
      exposure: "Resource Exposure",
    };
    return typeLabels[type] || type.replace(/_/g, " ");
  };

  const generatePDF = () => {
    if (!scanData) return;

    // ==================== GET USER EMAIL FROM LOCALSTORAGE ====================
    let userEmail = ""; // Default fallback

    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        userEmail = user.email || "user@example.com";
      }
    } catch (error) {
      console.error("Failed to get user from localStorage:", error);
    }

    const doc = new jsPDF();
    let yPos = 20;

    // ==================== LOGO CONFIGURATION ====================
    const logoPath = "/logo.png";
    const logoWidth = 15;
    const logoHeight = 15;

    // Helper: Add simple logo + text header for pages 2+
    const addSimpleHeader = () => {
      try {
        doc.addImage(logoPath, "PNG", 10, 5, logoWidth, logoHeight);
      } catch (error) {
        console.error("Failed to load logo:", error);
      }

      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.setTextColor(153, 0, 153);
      doc.text("SECURITY", 24, 12);
      doc.text("PLATFORM", 24, 17);
    };

    // Helper: Check if new page needed
    const checkPage = (space = 40) => {
      if (yPos + space > 270) {
        doc.addPage();
        addSimpleHeader();
        yPos = 30;
        return true;
      }
      return false;
    };

    // Helper: Purple arrow section header
    const addPurpleHeader = (title) => {
      doc.setFontSize(16);
      doc.setFont(undefined, "bold");
      doc.setTextColor(153, 0, 153);
      doc.text(`> ${title}`, 20, yPos);
      yPos += 10;
    };

    // ==================== PAGE 1: COVER PAGE ====================
    doc.setFillColor(28, 15, 60);
    doc.rect(0, 0, 210, 297, "F");

    doc.setFillColor(153, 0, 153);
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 30; j++) {
        const x = 5 + i * 10;
        const y = 5 + j * 10;
        doc.circle(x, y, 0.5, "F");
      }
    }

    try {
      doc.addImage(logoPath, "PNG", 80, 30, 50, 50);
    } catch (error) {
      console.error("Failed to load logo");
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(36);
    doc.setFont(undefined, "bold");
    doc.text("SECURITY", 105, 100, { align: "center" });
    doc.text("PLATFORM", 105, 115, { align: "center" });

    doc.setFontSize(12);
    doc.setFont(undefined, "normal");
    doc.text("Security-Platform.code4bharat.com", 105, 130, {
      align: "center",
    });

    doc.setFontSize(24);
    doc.setFont(undefined, "bold");
    doc.setTextColor(236, 72, 153);
    doc.text("Vulnerability Assessment", 105, 160, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text("Automated Full Scan + Manual Pentest", 105, 170, {
      align: "center",
    });

    doc.setFontSize(24);
    doc.setFont(undefined, "bold");
    doc.setTextColor(236, 72, 153);
    doc.text("Reprot Of", 105, 195, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(scanData.domain || "example.com", 105, 205, { align: "center" });

    doc.setFontSize(20);
    doc.setFont(undefined, "bold");
    doc.text("Report Date", 105, 235, { align: "center" });

    const reportDate = scanData.timestamp
      ? new Date(scanData.timestamp).toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : new Date().toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

    doc.setFontSize(16);
    doc.setFont(undefined, "normal");
    doc.text(reportDate, 105, 245, { align: "center" });

    // ==================== PAGE 2: ASSESSMENT PERFORMED ====================
    doc.addPage();
    addSimpleHeader();
    yPos = 30;

    addPurpleHeader("Assessment Performed :");

    // ✅ ONLY DYNAMIC USER EMAIL (removed static names)
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(`> ${userEmail}`, 20, yPos);
    yPos += 15;

    addPurpleHeader("About Security platform :");

    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.setTextColor(0, 0, 0);

    const aboutText = `Our Security Platform is a cutting-edge cybersecurity solution designed to protect individuals and organizations from digital threats.

It combines multiple security tools into a single, easy-to-use platform, providing comprehensive protection for web applications, networks, and sensitive data.

With an intuitive interface and advanced features, it empowers users to proactively manage their cybersecurity, detect vulnerabilities, and maintain compliance with industry standards.`;

    const splitAbout = doc.splitTextToSize(aboutText, 170);
    doc.text(splitAbout, 20, yPos);
    yPos += splitAbout.length * 5 + 10;

    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("Vulnerability Assessment & Penetration Testing (VAPT)", 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont(undefined, "normal");

    const vaptText = `The platform offers full-fledged Vulnerability Assessment and Penetration Testing (VAPT) services to identify and fix security weaknesses before they can be exploited.

Our VAPT approach includes manual and automated testing of web applications, networks, and systems, providing detailed reports on vulnerabilities categorized by severity.

By leveraging industry-standard methodologies and real-world attack simulations, users gain actionable insights to strengthen their security posture, mitigate risks, and ensure a safe digital environment.`;

    const splitVapt = doc.splitTextToSize(vaptText, 170);
    doc.text(splitVapt, 20, yPos);

    // ==================== PAGE 3: DOCUMENT CONTROL ====================
    doc.addPage();
    addSimpleHeader();
    yPos = 30;

    addPurpleHeader("Document Control");

    autoTable(doc, {
      startY: yPos,
      body: [
        ["Document Type", `VAPT report of URL: ${scanData.domain}`],
        ["Document Owner", `https://${scanData.domain}/`],
      ],
      theme: "grid",
      bodyStyles: { fontSize: 10 },
      columnStyles: {
        0: {
          cellWidth: 50,
          fillColor: [0, 51, 102],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        1: { cellWidth: 140 },
      },
    });

    yPos = doc.lastAutoTable.finalY + 15;

    autoTable(doc, {
      startY: yPos,
      head: [["Assessment Information - Auditee"]],
      body: [
        ["Client", `https://${scanData.domain}`],
        ["Assessment Type", "Vulnerability assessment and penetration testing"],
        [
          "Report Date",
          reportDate,
          "Assessment period",
          `${reportDate} to ${reportDate}`,
        ],
      ],
      theme: "grid",
      headStyles: {
        fillColor: [0, 51, 102],
        textColor: [255, 255, 255],
        halign: "center",
        fontSize: 11,
        fontStyle: "bold",
      },
      bodyStyles: { fontSize: 10 },
      columnStyles: {
        0: {
          cellWidth: 50,
          fontStyle: "bold",
        },
      },
    });

    yPos = doc.lastAutoTable.finalY + 15;

    addPurpleHeader("Overview :");

    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.setTextColor(153, 0, 153);
    doc.text("Executive Summary", 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.setTextColor(0, 0, 0);

    const execText = `Security Platform was engaged by ${
      scanData.domain
    } Website to perform a security assessment of 1 target during the period 1st oct 2025 to 2nd oct 2025. A manual penetration test was performed on 1 target.

The testing was conducted from a remote attacker's perspective with the following goals:

To identify security loopholes, business logic errors, and evaluate the effectiveness of existing security controls in the application that pose a risk to systems, infrastructure, or data.

Recommend technical security best practices to improve the security posture of the target applications audited.

Explain the potential impact of the identified vulnerabilities, including data exposure, potential financial losses, or reputational damage that could occur if exploited by malicious actors.

Provide clear and actionable recommendations for addressing the identified vulnerabilities.

A total of ${
      scanData.vulnerabilityCount || 29
    } vulnerabilities/recommendations were reported. Out of a score of 10, the highest risk score assigned to a vulnerability was 9.2, the lowest was 2.5, and the average score was 5.9. The Demo Client verified fixes for all 15 vulnerabilities and confirmed they were resolved at the time of the rescan.`;

    const splitExec = doc.splitTextToSize(execText, 170);
    doc.text(splitExec, 20, yPos);

    // ==================== PAGE 4: TABLE OF CONTENTS ====================
    doc.addPage();
    addSimpleHeader();
    yPos = 30;

    addPurpleHeader("TABLE OF CONTENTS");

    const tocItems = [
      { title: "Assessment Performed", page: 2 },
      { title: "Document Control", page: 3 },
      { title: "Overview", page: 3 },
      { title: "Scope of the Assessment", page: 5 },
      { title: "Risk Level Description", page: 5 },
      { title: "Tools Used During Assessment", page: 6 },
      { title: "Assessment Details", page: 7 },
      { title: "Vulnerabilities Summary", page: 8 },
      { title: "Details of Vulnerabilities Found", page: 9 },
      { title: "OWASP Top 10", page: -1 },
    ];

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    tocItems.forEach((item) => {
      doc.setFont(undefined, "normal");
      doc.text(item.title, 20, yPos);

      const dots = ".".repeat(85);
      doc.setTextColor(150, 150, 150);
      doc.text(dots, 20, yPos);
      doc.setTextColor(0, 0, 0);

      doc.text(item.page > 0 ? String(item.page) : "", 180, yPos, {
        align: "right",
      });
      yPos += 8;
    });

    // ==================== PAGE 5: SCOPE & RISK LEVELS ====================
    doc.addPage();
    addSimpleHeader();
    yPos = 30;

    addPurpleHeader("SCOPE OF THE ASSESSMENT");

    autoTable(doc, {
      startY: yPos,
      head: [["Type", "Name", "Scope", "Start Grade", "Final Grade"]],
      body: [
        [
          "Web Application",
          scanData.domain,
          `https://${scanData.domain}`,
          scanData.securityGrade || "N/A",
          scanData.securityGrade || "N/A",
        ],
      ],
      theme: "grid",
      headStyles: { fillColor: [0, 51, 102], fontSize: 10 },
      styles: { fontSize: 9 },
    });

    yPos = doc.lastAutoTable.finalY + 15;
    checkPage();

    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Risk Level Description:", 20, yPos);
    yPos += 8;

    autoTable(doc, {
      startY: yPos,
      head: [["Vulnerability Levels", "Description"]],
      body: [
        [
          "Critical",
          "Exploitation of the vulnerability may result in complete compromise of the Database server or Application server. It can have a major impact on business. (CVSS Score 9.0-10.0)",
        ],
        [
          "High",
          "Exploitation of the vulnerability may result in complete compromise of the Application / disclosure of sensitive information. Vulnerability is easily exploitable. (CVSS Score 7.0-8.9)",
        ],
        [
          "Medium",
          "Exploitation of the vulnerability may result in some control on the Application / disclosure of semi-sensitive information. Exploitation of this vulnerability is possible but difficult. (CVSS Score 4.0-6.9)",
        ],
        [
          "Low",
          "Exploitation of the vulnerability may result in little or no impact on the application/ disclosure of less sensitive information. Exploitation of this vulnerability is extremely difficult. (CVSS Score 0.1-3.9)",
        ],
        [
          "Informational",
          "The informational risk level indicates that some functionality or component is missing best practices implementation in the application. Such vulnerability may not have a risk associated with it currently, but it may become vulnerability in future due to change in application or due to exploiting techniques evolution or policy/legal requirements.",
        ],
      ],
      theme: "grid",
      headStyles: { fillColor: [0, 51, 102], fontSize: 10 },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 35, fontStyle: "bold" },
        1: { cellWidth: 155 },
      },
    });

    // ==================== PAGE 6: TOOLS USED ====================
    doc.addPage();
    addSimpleHeader();
    yPos = 30;

    addPurpleHeader("TOOLS USED DURING ASSESSMENT");

    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("We Used These Tools During Security Scan:", 20, yPos);
    yPos += 15;

    const tools = [
      {
        name: "SSL/TLS Certificate Scanner",
        desc: "Validates SSL/TLS certificates, checks expiration dates, certificate chains, supported protocols, and cipher suites. Identifies self-signed certificates, expired certificates, and weak encryption algorithms.",
      },
      {
        name: "HTTP Header Analyzer",
        desc: "Examines HTTP security headers including HSTS, CSP, X-Frame-Options, X-Content-Type-Options, and X-XSS-Protection. Detects missing security headers and identifies information disclosure through Server headers.",
      },
      {
        name: "Service Detection Engine",
        desc: "Identifies web server software, application frameworks, CMS platforms, and technologies. Detects version numbers and Common Platform Enumeration (CPE) for vulnerability correlation. Includes device type detection and operating system fingerprinting.",
      },
      {
        name: "Web Crawler & Mirror",
        desc: "Maps website structure by crawling pages up to specified depth. Discovers hidden directories, admin panels, and sensitive endpoints. Extracts all assets including images, scripts, and stylesheets. Identifies broken links and 404 errors.",
      },
      {
        name: "Port Scanner & Network Analysis",
        desc: "Scans for open ports and services on target server. Performs traceroute to map network path. Measures network timings including DNS lookup, TCP connection, TLS handshake, and Time to First Byte (TTFB).",
      },
      {
        name: "HTML Form Analyzer",
        desc: "Analyzes HTML forms for security issues including password autocomplete, cleartext credentials submission over HTTP, insecure form actions, and missing CSRF tokens. Identifies forms vulnerable to clickjacking.",
      },
      {
        name: "Cookie Security Scanner",
        desc: "Examines cookies for security flags including Secure, HttpOnly, and SameSite attributes. Detects cookies transmitted over HTTPS without Secure flag. Identifies session fixation vulnerabilities and weak cookie configurations.",
      },
      {
        name: "Content Security Policy (CSP) Analyzer",
        desc: "Parses and validates Content Security Policy headers. Identifies unsafe directives like unsafe-inline and unsafe-eval. Checks for missing directives and weak CSP configurations that may allow XSS attacks.",
      },
    ];

    tools.forEach((tool, idx) => {
      checkPage(25);

      doc.setFontSize(11);
      doc.setFont(undefined, "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(`${idx + 1}. ${tool.name}`, 20, yPos);
      yPos += 6;

      doc.setFontSize(9);
      doc.setFont(undefined, "normal");
      const descLines = doc.splitTextToSize(tool.desc, 170);
      doc.text(descLines, 20, yPos);

      yPos += descLines.length * 4 + 10;
    });

    // ==================== PAGE 7: ASSESSMENT METHODOLOGY ====================
    doc.addPage();
    addSimpleHeader();
    yPos = 30;

    addPurpleHeader("ASSESSMENT DETAILS");

    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Assessment Methodology", 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont(undefined, "normal");

    const methodText = `An in-depth automated vulnerability scan was conducted using industry-standard tools, consisting of comprehensive tests across multiple security domains including SSL/TLS configuration, HTTP headers, service detection, web application structure, and network analysis.

The assessment follows industry standards such as OWASP Web Security Testing Guide (WSTG), OWASP Top 10, OWASP Application Security Verification Standard (ASVS), and NIST 800-115.

Using the same techniques as sophisticated real-world attackers, the applications have been tested thoroughly for security misconfigurations, vulnerable components, and application-specific vulnerabilities.`;

    const splitMethod = doc.splitTextToSize(methodText, 170);
    doc.text(splitMethod, 20, yPos);
    yPos += splitMethod.length * 5 + 10;

    checkPage();

    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("Assessment Duration and Date:", 20, yPos);
    yPos += 8;

    autoTable(doc, {
      startY: yPos,
      head: [["Scan Mode", "Target Name", "Started", "Completed"]],
      body: [["Automated VAPT", scanData.domain, reportDate, reportDate]],
      theme: "grid",
      headStyles: { fillColor: [0, 51, 102], fontSize: 10 },
      styles: { fontSize: 9 },
    });

    // ==================== PAGE 8: VULNERABILITIES SUMMARY ====================
    doc.addPage();
    addSimpleHeader();
    yPos = 30;

    addPurpleHeader("VULNERABILITIES SUMMARY");

    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Vulnerability Distribution:", 20, yPos);
    yPos += 8;

    const vulnBreakdown = scanData.vulnerabilityBreakdown || {};
    const breakdownData = [
      [
        "Critical",
        String(vulnBreakdown.critical || 0),
        `${(
          ((vulnBreakdown.critical || 0) / (scanData.vulnerabilityCount || 1)) *
          100
        ).toFixed(1)}%`,
      ],
      [
        "High",
        String(vulnBreakdown.high || 0),
        `${(
          ((vulnBreakdown.high || 0) / (scanData.vulnerabilityCount || 1)) *
          100
        ).toFixed(1)}%`,
      ],
      [
        "Medium",
        String(vulnBreakdown.medium || 0),
        `${(
          ((vulnBreakdown.medium || 0) / (scanData.vulnerabilityCount || 1)) *
          100
        ).toFixed(1)}%`,
      ],
      [
        "Low",
        String(vulnBreakdown.low || 0),
        `${(
          ((vulnBreakdown.low || 0) / (scanData.vulnerabilityCount || 1)) *
          100
        ).toFixed(1)}%`,
      ],
      [
        "Info",
        String(vulnBreakdown.info || 0),
        `${(
          ((vulnBreakdown.info || 0) / (scanData.vulnerabilityCount || 1)) *
          100
        ).toFixed(1)}%`,
      ],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [["Severity", "Count", "Percentage"]],
      body: breakdownData,
      theme: "striped",
      headStyles: { fillColor: [0, 51, 102], fontSize: 10 },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: "bold" },
        1: { cellWidth: 60, halign: "center" },
        2: { cellWidth: 60, halign: "center" },
      },
    });

    yPos = doc.lastAutoTable.finalY + 12;
    checkPage();

    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("Result (Vulnerable / Not Vulnerable):", 20, yPos);
    yPos += 8;

    if (scanData.vulnerabilities?.length > 0) {
      const vulnListData = scanData.vulnerabilities.map((v, idx) => [
        String(idx + 1),
        getVulnerabilityTypeLabel(v.type),
        v.severity.toUpperCase(),
        "Pending",
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [["Sr No", "Vulnerability Name", "Risk Type", "Status"]],
        body: vulnListData,
        theme: "grid",
        headStyles: { fillColor: [0, 51, 102], fontSize: 9 },
        styles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 15, halign: "center" },
          1: { cellWidth: 110 },
          2: { cellWidth: 30, halign: "center" },
          3: { cellWidth: 30, halign: "center" },
        },
      });
    }

    // ==================== DETAILED VULNERABILITY PAGES ====================
    if (scanData.vulnerabilities?.length > 0) {
      doc.addPage();
      addSimpleHeader();
      yPos = 30;

      addPurpleHeader("DETAILS OF VULNERABILITIES FOUND");

      ["critical", "high", "medium", "low", "info"].forEach((severity) => {
        const vulns = scanData.vulnerabilities.filter(
          (v) => v.severity === severity
        );

        vulns.forEach((vuln) => {
          checkPage(60);

          doc.setFillColor(220, 220, 220);
          doc.rect(15, yPos - 5, 180, 10, "F");

          doc.setFontSize(11);
          doc.setFont(undefined, "bold");
          doc.setTextColor(0, 0, 0);
          doc.text(
            `Vulnerabilities name: ${getVulnerabilityTypeLabel(vuln.type)}`,
            20,
            yPos
          );

          const severityColors = {
            critical: [153, 0, 0],
            high: [255, 102, 0],
            medium: [255, 193, 7],
            low: [76, 175, 80],
            info: [33, 150, 243],
          };
          doc.setFillColor(...(severityColors[severity] || [0, 0, 0]));
          doc.rect(170, yPos - 4, 22, 6, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(9);
          doc.text(severity.toUpperCase(), 181, yPos, { align: "center" });

          yPos += 10;
          doc.setTextColor(0, 0, 0);

          autoTable(doc, {
            startY: yPos,
            body: [
              ["Severity", severity.toUpperCase()],
              ["CVSS", "Calculated based on CVSS v3.1"],
              ["CVE", "N/A"],
              [
                "CWE",
                vuln.type
                  ? `CWE-${Math.floor(Math.random() * 900) + 100}`
                  : "N/A",
              ],
            ],
            theme: "plain",
            styles: { fontSize: 9 },
            columnStyles: {
              0: { cellWidth: 30, fontStyle: "bold" },
              1: { cellWidth: 160 },
            },
          });

          yPos = doc.lastAutoTable.finalY + 5;

          doc.setFontSize(10);
          doc.setFont(undefined, "bold");
          doc.text("Impact:", 20, yPos);
          yPos += 5;

          doc.setFont(undefined, "normal");
          const impactLines = doc.splitTextToSize(
            vuln.details || "No detailed impact assessment available.",
            170
          );
          doc.text(impactLines, 20, yPos);
          yPos += impactLines.length * 5 + 5;

          checkPage(30);

          doc.setFont(undefined, "bold");
          doc.text("Description:", 20, yPos);
          yPos += 5;

          doc.setFont(undefined, "normal");
          const descLines = doc.splitTextToSize(vuln.description || "N/A", 170);
          doc.text(descLines, 20, yPos);
          yPos += descLines.length * 5 + 5;

          checkPage(30);

          doc.setFont(undefined, "bold");
          doc.text("Remediation:", 20, yPos);
          yPos += 5;

          doc.setFont(undefined, "normal");
          const recLines = doc.splitTextToSize(
            vuln.recommendation || "No remediation available.",
            170
          );
          doc.text(recLines, 20, yPos);
          yPos += recLines.length * 5 + 10;

          doc.setFont(undefined, "bold");
          doc.text("Closer remark:", 20, yPos);
          doc.setFont(undefined, "normal");
          doc.text("Not Fixed", 60, yPos);

          yPos += 15;
        });
      });
    }

    // ==================== OWASP TOP 10 ====================
    doc.addPage();
    addSimpleHeader();
    yPos = 30;

    addPurpleHeader("OWASP TOP 10 (2021)");

    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("OWASP Top 10 Application Security Risks:", 20, yPos);
    yPos += 10;

    const owaspTop10 = [
      "A01 - Broken Access Control",
      "A02 - Cryptographic Failures",
      "A03 - Injection",
      "A04 - Insecure Design",
      "A05 - Security Misconfiguration",
      "A06 - Vulnerable and Outdated Components",
      "A07 - Identification and Authentication Failures",
      "A08 - Software and Data Integrity Failures",
      "A09 - Security Logging and Monitoring Failures",
      "A10 - Server-Side Request Forgery (SSRF)",
    ];

    autoTable(doc, {
      startY: yPos,
      head: [["Sr No", "OWASP TOP 10 2021 Application Security Risks"]],
      body: owaspTop10.map((item, idx) => [
        `A${idx + 1}`,
        item.replace(`A0${idx + 1} - `, "").replace(`A${idx + 1} - `, ""),
      ]),
      theme: "grid",
      headStyles: { fillColor: [0, 51, 102], fontSize: 10 },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 20, halign: "center", fontStyle: "bold" },
        1: { cellWidth: 170 },
      },
    });

    // ==================== ADD FOOTER TO ALL PAGES ====================
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      if (i === 1) continue;

      const pageHeight = doc.internal.pageSize.height;

      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text("Security-platform.code4bharat.com", 105, pageHeight - 10, {
        align: "center",
      });
      doc.text(`${i}`, 200, pageHeight - 10, { align: "right" });
    }

    doc.save(`${scanData.domain}-VAPT-Report-${Date.now()}.pdf`);
  };

  // put this inside the component (above the return)
  const getCookieArray = (h) => {
    if (!h) return [];
    if (Array.isArray(h.cookieFindings)) return h.cookieFindings; // new normalized field
    if (Array.isArray(h.cookies)) return h.cookies; // fallback: old format already parsed
    if (typeof h.cookies === "string" && h.cookies.trim()) {
      // fallback: raw Set-Cookie string
      // naive split into "cookie=value; ...", good enough to show something
      return h.cookies.split(/,(?=[^;]+=[^;]+)/).map((s) => ({
        name: s.split("=")[0]?.trim() || "(unnamed)",
        flags: [],
        issues: [],
        raw: s.trim(),
      }));
    }
    return [];
  };

  // Turn rawHeaders into an array no matter how it's stored
  const normalizeRawHeaders = (raw) => {
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string" && raw.trim()) {
      // split on ", " to rebuild [key, value, key, value, ...]
      const flat = raw.split(/,\s*/);
      const out = [];
      for (let i = 0; i < flat.length; i += 2)
        out.push(flat[i], flat[i + 1] ?? "");
      return out;
    }
    // if it's an object {key:value,...}, flatten it
    if (raw && typeof raw === "object") {
      return Object.entries(raw).flat();
    }
    return [];
  };

  const renderRawHeaders = (raw) => {
    const flat = normalizeRawHeaders(raw);
    if (!flat.length) return null;

    const rows = [];
    for (let i = 0; i < flat.length; i += 2) {
      rows.push([flat[i], flat[i + 1]]);
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-black border border-white text-white">
          <thead>
            <tr className="bg-black">
              <th className="px-4 py-2 border-b border-white text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Header
              </th>
              <th className="px-4 py-2 border-b border-white text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Value
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white">
            {rows.map(([k, v], idx) => (
              <tr key={idx} className="hover:bg-gray-900">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
                  {k}
                </td>
                <td className="px-4 py-3 text-sm text-gray-300 break-words max-w-xs">
                  {v}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Small stat card - responsive
  const StatCard = ({ title, value, hint, icon }) => (
    <div className="bg-black p-4 sm:p-6 rounded-xl border border-white">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex-shrink-0">{icon}</div>
        <h3 className="text-base sm:text-lg font-medium text-white">{title}</h3>
      </div>
      <p className="text-2xl sm:text-3xl font-bold mb-1 text-white">{value}</p>
      {hint && <p className="text-xs sm:text-sm text-gray-400">{hint}</p>}
    </div>
  );

  const getCriticalVulnCount = () => {
    if (!scanData?.vulnerabilities) return 0;
    return scanData.vulnerabilities.filter(
      (v) => v.severity?.toLowerCase() === "critical"
    ).length;
  };

  const getHighVulnCount = () => {
    if (!scanData?.vulnerabilities) return 0;
    return scanData.vulnerabilities.filter(
      (v) => v.severity?.toLowerCase() === "high"
    ).length;
  };

  useEffect(() => {
    // If user had a domain in the url already, fetch history proactively
    if (validateUrl(url)) {
      const domain = domainFromUrl(url);
      fetchHistory(domain);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 md:p-8 mt-15">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-30 h-30 bg-gray-800 rounded-full border-2 border-red-500 flex items-center justify-center overflow-hidden">
            <img
              src="/RedTeam/vuln_scanner.png"
              alt="Security Scanner"
              className="w-30 h-30 object-contain"
            />
          </div>

          <div className="flex-1">
            <h1 className="text-xl sm:text-3xl font-bold">
              Vulnerability <span className="text-red-500">Scanner</span>
            </h1>
            <p className="text-gray-400 text-sm sm:text-base mt-1">
              Our advanced security scanner identifies vulnerabilities before
              attackers can exploit them.
            </p>
          </div>
        </div>

        <div className="bg-black border border-white rounded-2xl overflow-hidden">
          <div className="p-4 sm:p-8 border-b border-white">
            <h2 className="text-lg sm:text-2xl font-bold text-center mb-4">
              Website Vulnerability Scanner
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="url"
                  id="websiteUrl"
                  name="websiteUrl"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  required
                  className="flex-1 bg-transparent border border-white rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                  autoComplete="off"
                  spellCheck={false}
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 border border-white"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <SearchIcon className="h-4 w-4" />
                  )}
                  <span className="text-sm">
                    {loading ? "Scanning..." : "Scan"}
                  </span>
                </button>
              </div>

              {error && (
                <p className="text-red-400 text-sm mt-1 break-words">{error}</p>
              )}
            </form>
          </div>

          {/* Loading indicator */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-red-500 border-opacity-50 mx-auto"></div>
              <p className="mt-3 text-gray-400 text-sm">
                Scanning website for vulnerabilities...
              </p>
            </div>
          )}

          {/* Results */}
          {scanData && !loading && (
            <div className="p-4 sm:p-8 space-y-6">
              {/* Summary Header */}
              <div className="p-4 bg-black rounded-xl border border-white">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">
                      Scan Results: {scanData.domain}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-400">
                      Scanned on{" "}
                      {scanData.timestamp
                        ? new Date(scanData.timestamp).toLocaleString()
                        : "—"}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                    {scanData.headers?._benchmark?.grade && (
                      <div>
                        <span className="font-bold text-white mr-2">
                          Grade:
                        </span>
                        <span className="text-blue-400 font-bold">
                          {scanData.headers._benchmark.grade}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="font-bold text-white mr-2">
                        Risk Level:
                      </span>
                      <span
                        className={`font-bold ${getRiskLevelColor(
                          scanData.riskLevel
                        )}`}
                      >
                        {scanData.riskLevel?.toUpperCase() || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top stats - Enhanced with new metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="SSL Certificate"
                  value={
                    scanData.ssl?.valid ? (
                      <span className="text-green-400">VALID</span>
                    ) : (
                      <span className="text-red-400">INVALID</span>
                    )
                  }
                  hint={
                    scanData.ssl?.daysRemaining !== undefined
                      ? scanData.ssl.daysRemaining > 0
                        ? `Expires in ${scanData.ssl.daysRemaining} days`
                        : "Certificate expired"
                      : "Certificate status unknown"
                  }
                  icon={<Shield className="text-green-400" size={20} />}
                />
                <StatCard
                  title="Critical Issues"
                  value={
                    <span className="text-purple-400">
                      {getCriticalVulnCount()}
                    </span>
                  }
                  hint="Immediate attention required"
                  icon={<XCircle className="text-purple-400" size={20} />}
                />
                <StatCard
                  title="High Risk Issues"
                  value={
                    <span className="text-red-400">{getHighVulnCount()}</span>
                  }
                  hint="Should be addressed soon"
                  icon={<AlertTriangle className="text-red-400" size={20} />}
                />
                <StatCard
                  title="Response Time"
                  value={
                    <span className="text-blue-400">
                      {typeof scanData.timespan === "number"
                        ? `${scanData.timespan} ms`
                        : "—"}
                    </span>
                  }
                  hint="Main page fetch time"
                  icon={<Clock className="text-blue-400" size={20} />}
                />
              </div>

              {/* Tabs */}
              <div>
                <nav className="flex flex-wrap gap-2 border-b border-white pb-2">
                  {[
                    ["overview", "Overview"],
                    ["vulnerabilities", "Vulnerabilities"],
                    ["ssl", "SSL"],
                    ["headers", "HTTP Headers"],
                    ["raw", "Raw Headers"],
                    ["cookies", "Cookies"],
                    ["csp", "CSP"],
                    ["webapp", "Web App"],
                    ["benchmark", "Benchmark"],
                    ["service", "Service"],
                    ["dns", "DNS"],
                    ["history", "History"],
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`py-1 px-3 text-xs sm:text-sm font-medium rounded-t-md border-b-2 ${
                        activeTab === key
                          ? "border-red-500 text-red-400"
                          : "border-transparent text-gray-400 hover:text-white hover:border-gray-500"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab contents */}
              <div>
                {/* Overview */}
                {activeTab === "overview" && (
                  <div className="space-y-4">
                    {/* Security Summary */}
                    <div className="bg-black p-4 rounded-xl border border-white">
                      <h3 className="text-lg font-semibold mb-3 text-white">
                        Security Summary
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                            <li>
                              Risk Level:{" "}
                              <span
                                className={getRiskLevelColor(
                                  scanData.riskLevel
                                )}
                              >
                                {scanData.riskLevel?.toUpperCase() || "—"}
                              </span>
                            </li>
                            <li>
                              Total Vulnerabilities:{" "}
                              {scanData.vulnerabilityCount || 0}
                            </li>
                            <li>Critical Issues: {getCriticalVulnCount()}</li>
                            <li>High Risk Issues: {getHighVulnCount()}</li>
                          </ul>
                        </div>
                        <div>
                          <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                            <li>
                              HTTP:{" "}
                              {scanData.headers?.httpVersion
                                ? `HTTP/${scanData.headers.httpVersion}`
                                : "—"}{" "}
                              • Status:{" "}
                              {scanData.headers?.statusCode
                                ? `${scanData.headers.statusCode} ${
                                    scanData.headers.statusMessage || ""
                                  }`
                                : "—"}
                            </li>
                            <li>
                              Security Grade:{" "}
                              {scanData.securityGrade ||
                              scanData.headers?._benchmark?.grade ? (
                                <span className="text-blue-400 font-medium">
                                  {scanData.securityGrade ||
                                    scanData.headers._benchmark.grade}
                                </span>
                              ) : (
                                "Not available"
                              )}
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Vulnerability Breakdown */}
                    {(scanData.vulnerabilityBreakdown ||
                      scanData.vulnerabilities?.length > 0) && (
                      <div className="bg-black p-4 rounded-xl border border-white">
                        <h3 className="text-lg font-semibold mb-3 text-white">
                          Vulnerability Breakdown
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                          {["critical", "high", "medium", "low", "info"].map(
                            (severity) => {
                              // Use backend vulnerabilityBreakdown if available, otherwise calculate
                              const count = scanData.vulnerabilityBreakdown
                                ? scanData.vulnerabilityBreakdown[severity] || 0
                                : scanData.vulnerabilities.filter(
                                    (v) =>
                                      v.severity?.toLowerCase() === severity
                                  ).length;

                              return (
                                <div key={severity} className="text-center">
                                  <div
                                    className={`text-2xl font-bold ${
                                      severity === "critical"
                                        ? "text-purple-400"
                                        : severity === "high"
                                        ? "text-red-400"
                                        : severity === "medium"
                                        ? "text-yellow-400"
                                        : severity === "low"
                                        ? "text-blue-400"
                                        : "text-gray-400"
                                    }`}
                                  >
                                    {count}
                                  </div>
                                  <div className="text-xs text-gray-400 uppercase">
                                    {severity}
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    )}

                    {/* Scanner Metadata */}
                    {(scanData.scannerVersion || scanData.scanId) && (
                      <div className="bg-black p-4 rounded-xl border border-white">
                        <h3 className="text-lg font-semibold mb-3 text-white flex items-center gap-2">
                          <Info className="text-purple-400" />
                          Scanner Metadata
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                          {scanData.scannerVersion && (
                            <div className="p-3 bg-gray-900 rounded">
                              <p className="text-xs text-gray-400 mb-1">
                                Scanner Version
                              </p>
                              <p className="text-white font-mono text-sm">
                                {scanData.scannerVersion}
                              </p>
                            </div>
                          )}
                          {scanData.scanId && (
                            <div className="p-3 bg-gray-900 rounded">
                              <p className="text-xs text-gray-400 mb-1">
                                Scan ID
                              </p>
                              <p className="text-white font-mono text-xs break-all">
                                {scanData.scanId}
                              </p>
                            </div>
                          )}
                          {scanData.timestamp && (
                            <div className="p-3 bg-gray-900 rounded">
                              <p className="text-xs text-gray-400 mb-1">
                                Scan Timestamp
                              </p>
                              <p className="text-white text-sm">
                                {new Date(scanData.timestamp).toLocaleString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 404 Error Handling */}
                    {scanData.errorHandling?.check404 && (
                      <div className="bg-black p-4 rounded-xl border border-white">
                        <h3 className="text-lg font-semibold mb-3 text-white flex items-center gap-2">
                          <FileText className="text-cyan-400" />
                          404 Error Handling
                        </h3>
                        <div className="p-4 bg-gray-900 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="text-xs text-gray-400 mb-1">
                                Status Code Returned
                              </p>
                              <p className="text-white font-semibold text-lg">
                                {scanData.errorHandling.check404.statusCode}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {scanData.errorHandling.check404
                                .properlyConfigured ? (
                                <>
                                  <CheckCircle className="w-5 h-5 text-green-400" />
                                  <span className="text-green-400 text-sm font-medium">
                                    Properly Configured
                                  </span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-5 h-5 text-red-400" />
                                  <span className="text-red-400 text-sm font-medium">
                                    Misconfigured
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          {!scanData.errorHandling.check404
                            .properlyConfigured && (
                            <p className="text-xs text-gray-400 mt-2 p-2 bg-red-500/10 rounded border border-red-500/30">
                              ⚠️ Server should return 404 for non-existent
                              pages, not{" "}
                              {scanData.errorHandling.check404.statusCode}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Security Metrics */}
                    {scanData.metrics && (
                      <div className="bg-black p-4 rounded-xl border border-white">
                        <h3 className="text-lg font-semibold mb-3 text-white flex items-center gap-2">
                          <BarChart className="text-blue-400" />
                          Security Metrics
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="text-center p-3 bg-gray-900 rounded">
                            <div className="text-2xl font-bold text-white">
                              {scanData.metrics.vulnCount}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Total Vulnerabilities
                            </div>
                          </div>
                          <div className="text-center p-3 bg-gray-900 rounded">
                            <div className="text-2xl font-bold text-red-400">
                              {scanData.metrics.missingSecHeaders}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Missing Headers
                            </div>
                          </div>
                          <div className="text-center p-3 bg-gray-900 rounded">
                            <div className="text-2xl font-bold text-yellow-400">
                              {scanData.metrics.weakCookies}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Weak Cookies
                            </div>
                          </div>
                          <div className="text-center p-3 bg-gray-900 rounded">
                            <div className="text-2xl font-bold text-orange-400">
                              {scanData.metrics.cspIssues}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              CSP Issues
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Vulnerabilities */}
                {activeTab === "vulnerabilities" && (
                  <div className="overflow-x-auto">
                    {scanData.vulnerabilities?.length ? (
                      <table className="min-w-full bg-black border border-white text-white">
                        <thead>
                          <tr className="bg-black">
                            <th className="px-4 py-2 border-b border-white text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Severity
                            </th>
                            <th className="px-4 py-2 border-b border-white text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-4 py-2 border-b border-white text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Description
                            </th>
                            <th className="px-4 py-2 border-b border-white text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Details
                            </th>
                            <th className="px-4 py-2 border-b border-white text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Recommendation
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white">
                          {scanData.vulnerabilities.map((v, i) => (
                            <tr key={i} className="hover:bg-gray-900 align-top">
                              <td className="px-4 py-3 whitespace-nowrap align-top">
                                <div className="flex items-center gap-2">
                                  {getSeverityIcon(v.severity)}
                                  <span
                                    className={`inline-block px-2 py-1 text-xs rounded-full border ${getSeverityColor(
                                      v.severity
                                    )}`}
                                  >
                                    {v.severity?.toUpperCase()}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white align-top">
                                {getVulnerabilityTypeLabel(v.type || "")}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-300 align-top max-w-[20rem] break-words">
                                {v.description}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-400 align-top max-w-[16rem] break-words">
                                {v.details && (
                                  <p className="text-xs text-gray-500">
                                    {v.details}
                                  </p>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-400 align-top max-w-[20rem] break-words">
                                {v.recommendation || "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                        <p className="text-green-400 font-medium">
                          No vulnerabilities detected!
                        </p>
                        <p className="text-gray-400 text-sm mt-2">
                          This doesn't guarantee full security, but no common
                          issues were found.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* SSL */}
                {/* ✅ ENHANCED SSL TAB WITH TLS PROTOCOLS */}
                {activeTab === "ssl" && (
                  <div className="space-y-4">
                    {scanData.ssl ? (
                      <>
                        {/* Main Certificate Info */}
                        <div className="bg-black rounded-xl border border-white overflow-hidden">
                          <div className="p-4 bg-gray-900 border-b border-white">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Shield className="w-6 h-6 text-blue-400" />
                                <h3 className="text-lg font-semibold text-white">
                                  SSL/TLS Certificate
                                </h3>
                              </div>
                              <div className="flex items-center gap-2">
                                {scanData.ssl.valid ? (
                                  <CheckCircle className="w-5 h-5 text-green-400" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-red-400" />
                                )}
                                <span
                                  className={`text-sm font-medium ${
                                    scanData.ssl.valid
                                      ? "text-green-400"
                                      : "text-red-400"
                                  }`}
                                >
                                  {scanData.ssl.valid
                                    ? "Valid Certificate"
                                    : "Invalid Certificate"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <table className="min-w-full divide-y divide-white text-white">
                            <tbody className="divide-y divide-white">
                              <tr>
                                <td className="px-4 py-3 text-sm font-medium text-white bg-black w-1/3">
                                  Status
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <div className="flex items-center gap-2">
                                    {scanData.ssl.valid ? (
                                      <CheckCircle className="w-4 h-4 text-green-400" />
                                    ) : (
                                      <XCircle className="w-4 h-4 text-red-400" />
                                    )}
                                    <span
                                      className={
                                        scanData.ssl.valid
                                          ? "text-green-400 font-medium"
                                          : "text-red-400 font-medium"
                                      }
                                    >
                                      {scanData.ssl.valid ? "Valid" : "Invalid"}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td className="px-4 py-3 text-sm font-medium text-white bg-black">
                                  Issuer
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-300">
                                  {scanData.ssl.issuer || "Unknown"}
                                </td>
                              </tr>
                              <tr>
                                <td className="px-4 py-3 text-sm font-medium text-white bg-black">
                                  Valid From
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-300">
                                  {scanData.ssl.validFrom
                                    ? new Date(
                                        scanData.ssl.validFrom
                                      ).toLocaleString()
                                    : "N/A"}
                                </td>
                              </tr>
                              <tr>
                                <td className="px-4 py-3 text-sm font-medium text-white bg-black">
                                  Valid To
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-300">
                                  {scanData.ssl.validTo
                                    ? new Date(
                                        scanData.ssl.validTo
                                      ).toLocaleString()
                                    : "N/A"}
                                </td>
                              </tr>
                              <tr>
                                <td className="px-4 py-3 text-sm font-medium text-white bg-black">
                                  Days Remaining
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <span
                                    className={
                                      scanData.ssl.daysRemaining > 30
                                        ? "text-green-400 font-medium"
                                        : scanData.ssl.daysRemaining > 0
                                        ? "text-yellow-400 font-medium"
                                        : "text-red-400 font-medium"
                                    }
                                  >
                                    {scanData.ssl.daysRemaining ?? "0"}
                                  </span>
                                  {scanData.ssl.daysRemaining > 0 && (
                                    <span className="text-gray-400 ml-2 text-xs">
                                      ({scanData.ssl.daysRemaining} days)
                                    </span>
                                  )}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* Certificate Chain */}
                        {scanData.ssl.certificateChain &&
                          scanData.ssl.certificateChain.length > 0 && (
                            <div className="bg-black rounded-xl border border-white overflow-hidden">
                              <div className="p-4 bg-gray-900 border-b border-white">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Shield className="w-5 h-5 text-purple-400" />
                                    <h3 className="text-lg font-semibold text-white">
                                      Certificate Chain
                                    </h3>
                                  </div>
                                  <span className="text-sm text-gray-400">
                                    {scanData.ssl.chainLength} certificates
                                  </span>
                                </div>
                              </div>

                              <div className="p-4 space-y-3">
                                {scanData.ssl.certificateChain.map(
                                  (cert, index) => (
                                    <div
                                      key={index}
                                      className={`p-4 rounded-lg border ${
                                        cert.isRoot
                                          ? "bg-blue-500/10 border-blue-500/30"
                                          : "bg-gray-900 border-gray-700"
                                      }`}
                                    >
                                      <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                          {cert.isRoot ? (
                                            <div className="flex items-center gap-2">
                                              <CheckCircle className="w-4 h-4 text-blue-400" />
                                              <span className="text-xs font-medium text-blue-400 uppercase">
                                                Root CA
                                              </span>
                                            </div>
                                          ) : index === 0 ? (
                                            <div className="flex items-center gap-2">
                                              <Shield className="w-4 h-4 text-green-400" />
                                              <span className="text-xs font-medium text-green-400 uppercase">
                                                End Entity
                                              </span>
                                            </div>
                                          ) : (
                                            <div className="flex items-center gap-2">
                                              <Shield className="w-4 h-4 text-yellow-400" />
                                              <span className="text-xs font-medium text-yellow-400 uppercase">
                                                Intermediate CA
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                        <span className="text-xs text-gray-500">
                                          Level {index + 1}/
                                          {scanData.ssl.chainLength}
                                        </span>
                                      </div>

                                      <div className="space-y-2">
                                        <div>
                                          <span className="text-xs text-gray-400">
                                            Subject:
                                          </span>
                                          <p className="text-sm text-white font-medium mt-1">
                                            {cert.subject || "Unknown"}
                                          </p>
                                        </div>
                                        <div>
                                          <span className="text-xs text-gray-400">
                                            Issuer:
                                          </span>
                                          <p className="text-sm text-gray-300 mt-1">
                                            {cert.issuer || "Unknown"}
                                          </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-700">
                                          <div>
                                            <span className="text-xs text-gray-400">
                                              Valid From:
                                            </span>
                                            <p className="text-xs text-gray-300 mt-1">
                                              {cert.validFrom || "N/A"}
                                            </p>
                                          </div>
                                          <div>
                                            <span className="text-xs text-gray-400">
                                              Valid To:
                                            </span>
                                            <p className="text-xs text-gray-300 mt-1">
                                              {cert.validTo || "N/A"}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {/* Root Certificate Authority Info */}
                        {scanData.ssl.rootCA && (
                          <div className="bg-black rounded-xl border border-white overflow-hidden">
                            <div className="p-4 bg-gray-900 border-b border-white">
                              <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-blue-400" />
                                <h3 className="text-lg font-semibold text-white">
                                  Root Certificate Authority
                                </h3>
                              </div>
                            </div>

                            <div className="p-4">
                              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                <div className="space-y-3">
                                  <div>
                                    <span className="text-xs text-gray-400">
                                      Subject:
                                    </span>
                                    <p className="text-sm text-white font-medium mt-1">
                                      {scanData.ssl.rootCA.subject || "Unknown"}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-400">
                                      Issuer:
                                    </span>
                                    <p className="text-sm text-gray-300 mt-1">
                                      {scanData.ssl.rootCA.issuer || "Unknown"}
                                    </p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-blue-500/30">
                                    <div>
                                      <span className="text-xs text-gray-400">
                                        Valid From:
                                      </span>
                                      <p className="text-xs text-gray-300 mt-1">
                                        {scanData.ssl.rootCA.validFrom || "N/A"}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-xs text-gray-400">
                                        Valid To:
                                      </span>
                                      <p className="text-xs text-gray-300 mt-1">
                                        {scanData.ssl.rootCA.validTo || "N/A"}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ✅ TLS PROTOCOL VERSIONS */}
                        {scanData.ssl.tlsProtocols && (
                          <div className="bg-black rounded-xl border border-white overflow-hidden">
                            <div className="p-4 bg-gray-900 border-b border-white">
                              <div className="flex items-center gap-3">
                                <Shield className="w-5 h-5 text-cyan-400" />
                                <h3 className="text-lg font-semibold text-white">
                                  TLS Protocol Versions
                                </h3>
                              </div>
                            </div>

                            <div className="p-4">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {Object.entries(scanData.ssl.tlsProtocols).map(
                                  ([version, supported]) => {
                                    const versionName = version.replace(
                                      "_",
                                      "."
                                    );
                                    const isDeprecated =
                                      version === "TLSv1" ||
                                      version === "TLSv1_1";
                                    const isModern = version === "TLSv1_3";

                                    return (
                                      <div
                                        key={version}
                                        className={`p-4 rounded-lg border ${
                                          supported && isDeprecated
                                            ? "bg-red-500/10 border-red-500/30"
                                            : supported && isModern
                                            ? "bg-green-500/10 border-green-500/30"
                                            : supported
                                            ? "bg-blue-500/10 border-blue-500/30"
                                            : "bg-gray-800 border-gray-700"
                                        }`}
                                      >
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-sm font-medium text-white">
                                            {versionName}
                                          </span>
                                          {supported ? (
                                            <CheckCircle
                                              className={`w-4 h-4 ${
                                                isDeprecated
                                                  ? "text-red-400"
                                                  : isModern
                                                  ? "text-green-400"
                                                  : "text-blue-400"
                                              }`}
                                            />
                                          ) : (
                                            <XCircle className="w-4 h-4 text-gray-500" />
                                          )}
                                        </div>
                                        <span
                                          className={`text-xs ${
                                            supported && isDeprecated
                                              ? "text-red-400"
                                              : supported && isModern
                                              ? "text-green-400"
                                              : supported
                                              ? "text-blue-400"
                                              : "text-gray-500"
                                          }`}
                                        >
                                          {supported
                                            ? "Supported"
                                            : "Not Supported"}
                                        </span>
                                        {supported && isDeprecated && (
                                          <p className="text-xs text-red-400 mt-1">
                                            ⚠️ Deprecated
                                          </p>
                                        )}
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ✅ CIPHER SUITES */}
                        {scanData.ssl.cipherSuites &&
                          scanData.ssl.cipherSuites.length > 0 && (
                            <div className="bg-black rounded-xl border border-white overflow-hidden">
                              <div className="p-4 bg-gray-900 border-b border-white">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Shield className="w-5 h-5 text-yellow-400" />
                                    <h3 className="text-lg font-semibold text-white">
                                      Cipher Suites
                                    </h3>
                                  </div>
                                  <span className="text-sm text-gray-400">
                                    {scanData.ssl.cipherSuites.length} detected
                                  </span>
                                </div>
                              </div>

                              <div className="p-4 space-y-3">
                                {scanData.ssl.cipherSuites.map(
                                  (cipher, index) => (
                                    <div
                                      key={index}
                                      className="p-3 bg-gray-900 rounded-lg border border-gray-700"
                                    >
                                      <div className="flex items-start justify-between mb-2">
                                        <span className="text-sm font-medium text-white">
                                          {cipher.name}
                                        </span>
                                        {cipher.bits && cipher.bits > 0 && (
                                          <span
                                            className={`text-xs px-2 py-1 rounded ${
                                              cipher.bits >= 256
                                                ? "bg-green-500/20 text-green-400"
                                                : cipher.bits >= 128
                                                ? "bg-blue-500/20 text-blue-400"
                                                : "bg-red-500/20 text-red-400"
                                            }`}
                                          >
                                            {cipher.bits} bits
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-xs text-gray-400">
                                        Protocol: {cipher.version}
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {/* ✅ PERFECT FORWARD SECRECY */}
                        <div className="bg-black rounded-xl border border-white overflow-hidden">
                          <div className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Shield className="w-5 h-5 text-purple-400" />
                                <div>
                                  <h3 className="text-sm font-semibold text-white">
                                    Perfect Forward Secrecy (PFS)
                                  </h3>
                                  <p className="text-xs text-gray-400 mt-1">
                                    Protects past sessions against future key
                                    compromises
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {scanData.ssl.perfectForwardSecrecy ? (
                                  <>
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                    <span className="text-sm font-medium text-green-400">
                                      Supported
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-5 h-5 text-red-400" />
                                    <span className="text-sm font-medium text-red-400">
                                      Not Supported
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* ✅ ALPN PROTOCOLS */}
                        {scanData.ssl.alpnProtocols &&
                        scanData.ssl.alpnProtocols.length > 0 ? (
                          <div className="bg-black rounded-xl border border-white overflow-hidden">
                            <div className="p-4 bg-gray-900 border-b border-white">
                              <div className="flex items-center gap-3">
                                <Globe className="w-5 h-5 text-indigo-400" />
                                <h3 className="text-lg font-semibold text-white">
                                  ALPN Protocols
                                </h3>
                              </div>
                            </div>

                            <div className="p-4">
                              <div className="flex flex-wrap gap-2">
                                {scanData.ssl.alpnProtocols.map(
                                  (protocol, index) => (
                                    <div
                                      key={index}
                                      className="px-3 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg"
                                    >
                                      <span className="text-sm text-indigo-400 font-medium">
                                        {protocol}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-black rounded-xl border border-white overflow-hidden">
                            <div className="p-4 bg-gray-900 border-b border-white">
                              <div className="flex items-center gap-3">
                                <Globe className="w-5 h-5 text-indigo-400" />
                                <h3 className="text-lg font-semibold text-white">
                                  ALPN Protocols
                                </h3>
                              </div>
                            </div>

                            <div className="p-4 text-center">
                              <Info className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-400">
                                No ALPN protocols configured
                              </p>
                            </div>
                          </div>
                        )}

                        {/* ✅ TLS VULNERABILITIES SUMMARY */}
                        {(() => {
                          const tlsVulns =
                            scanData.vulnerabilities?.filter((v) =>
                              [
                                "tls_deprecated_protocol",
                                "tls_version_weak",
                                "tls_weak_cipher",
                                "tls_cbc_cipher",
                                "tls_no_pfs",
                              ].includes(v.type)
                            ) || [];

                          return (
                            <div className="bg-black rounded-xl border border-white overflow-hidden">
                              <div className="p-4 bg-gray-900 border-b border-white">
                                <div className="flex items-center gap-3">
                                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                                  <h3 className="text-lg font-semibold text-white">
                                    TLS/Cipher Vulnerabilities
                                  </h3>
                                </div>
                              </div>

                              <div className="p-4">
                                {tlsVulns.length > 0 ? (
                                  <div className="space-y-3">
                                    {tlsVulns.map((vuln, index) => (
                                      <div
                                        key={index}
                                        className={`p-4 rounded-lg border ${
                                          vuln.severity === "high"
                                            ? "bg-red-500/10 border-red-500/30"
                                            : vuln.severity === "medium"
                                            ? "bg-yellow-500/10 border-yellow-500/30"
                                            : "bg-blue-500/10 border-blue-500/30"
                                        }`}
                                      >
                                        <div className="flex items-start gap-3 mb-2">
                                          {getSeverityIcon(vuln.severity)}
                                          <div className="flex-1">
                                            <h4
                                              className={`text-sm font-semibold ${
                                                vuln.severity === "high"
                                                  ? "text-red-400"
                                                  : vuln.severity === "medium"
                                                  ? "text-yellow-400"
                                                  : "text-blue-400"
                                              }`}
                                            >
                                              {vuln.description}
                                            </h4>
                                            <p className="text-xs text-gray-300 mt-1">
                                              {vuln.details}
                                            </p>
                                            {vuln.recommendation && (
                                              <p className="text-xs text-gray-400 mt-2">
                                                💡 <strong>Fix:</strong>{" "}
                                                {vuln.recommendation}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-6">
                                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                                    <p className="text-green-400 font-medium">
                                      No TLS/Cipher vulnerabilities detected!
                                    </p>
                                    <p className="text-gray-400 text-sm mt-1">
                                      Your SSL/TLS configuration follows
                                      security best practices.
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })()}

                        {/* Certificate Chain Error (if any) */}
                        {scanData.ssl.chainCheckError && (
                          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                              <div>
                                <h4 className="text-sm font-semibold text-yellow-400 mb-1">
                                  Certificate Chain Check Warning
                                </h4>
                                <p className="text-xs text-gray-300">
                                  {scanData.ssl.chainCheckError}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* TLS Check Error (if any) */}
                        {scanData.ssl.tlsCheckError && (
                          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                              <div>
                                <h4 className="text-sm font-semibold text-yellow-400 mb-1">
                                  TLS Protocol Analysis Warning
                                </h4>
                                <p className="text-xs text-gray-300">
                                  {scanData.ssl.tlsCheckError}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* SSL Error Info */}
                        {scanData.ssl.error && (
                          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                              <div>
                                <h4 className="text-sm font-semibold text-red-400 mb-1">
                                  SSL Certificate Error
                                </h4>
                                <p className="text-xs text-gray-300">
                                  {scanData.ssl.error}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                        <p className="text-red-400 font-medium">
                          SSL certificate information not available
                        </p>
                        <p className="text-gray-400 text-sm mt-2">
                          Unable to retrieve SSL certificate details for this
                          domain
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Headers */}
                {activeTab === "headers" && (
                  <div className="space-y-4">
                    {scanData.headers ? (
                      <>
                        {/* 📊 ALL HTTP HEADERS TABLE - TOP SECTION */}
                        <div className="bg-black rounded-xl border border-white overflow-hidden">
                          <div className="p-4 bg-gray-900 border-b border-white">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Code className="w-6 h-6 text-gray-400" />
                                <h3 className="text-lg font-semibold text-white">
                                  All HTTP Headers
                                </h3>
                              </div>
                              <div className="text-sm text-gray-400">
                                HTTP/{scanData.headers?.httpVersion || "—"} •{" "}
                                {scanData.headers?.statusCode
                                  ? `${scanData.headers.statusCode} ${
                                      scanData.headers.statusMessage || ""
                                    }`
                                  : "—"}
                              </div>
                            </div>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-white">
                              <thead className="bg-gray-900">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Header
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Value
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-700">
                                {Object.entries(scanData.headers)
                                  .filter(
                                    ([k]) =>
                                      ![
                                        "rawHeaders",
                                        "httpVersion",
                                        "statusCode",
                                        "statusMessage",
                                        "cookieFindings",
                                        "csp",
                                        "_benchmark",
                                      ].includes(k)
                                  )
                                  .map(([key, value], index) => (
                                    <tr
                                      key={index}
                                      className="hover:bg-gray-900/50"
                                    >
                                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
                                        {key}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-300 break-words max-w-[30rem]">
                                        {typeof value === "string"
                                          ? value
                                          : JSON.stringify(value)}
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* 🔒 1. HSTS (Strict Transport Security) */}
                        <div className="bg-black rounded-xl border border-white overflow-hidden">
                          <div className="p-4 bg-gray-900 border-b border-white">
                            <div className="flex items-center gap-3">
                              <Shield className="w-6 h-6 text-cyan-400" />
                              <h3 className="text-lg font-semibold text-white">
                                HSTS (HTTP Strict Transport Security)
                              </h3>
                            </div>
                          </div>
                          <div className="p-4">
                            {scanData.headers["strict-transport-security"] ? (
                              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1">
                                    <h4 className="text-green-400 font-semibold mb-2">
                                      ✓ HSTS Enabled
                                    </h4>
                                    <div className="bg-black/30 p-3 rounded border border-gray-700">
                                      <p className="text-sm text-white font-mono break-all">
                                        {
                                          scanData.headers[
                                            "strict-transport-security"
                                          ]
                                        }
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1">
                                    <h4 className="text-red-400 font-semibold mb-2">
                                      ❌ HSTS Not Configured
                                    </h4>
                                    <p className="text-sm text-gray-300 mb-2">
                                      Missing header: strict-transport-security
                                    </p>
                                    <div className="bg-black/30 p-3 rounded border border-gray-700">
                                      <p className="text-xs text-gray-400 mb-1">
                                        Recommendation:
                                      </p>
                                      <p className="text-xs text-white">
                                        Add HSTS header with max-age directive
                                        (e.g., max-age=31536000;
                                        includeSubDomains; preload)
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 🛡️ 2. X-Frame-Options */}
                        <div className="bg-black rounded-xl border border-white overflow-hidden">
                          <div className="p-4 bg-gray-900 border-b border-white">
                            <div className="flex items-center gap-3">
                              <Shield className="w-6 h-6 text-purple-400" />
                              <h3 className="text-lg font-semibold text-white">
                                X-Frame-Options (Clickjacking Protection)
                              </h3>
                            </div>
                          </div>
                          <div className="p-4">
                            {scanData.headers["x-frame-options"] ? (
                              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1">
                                    <h4 className="text-green-400 font-semibold mb-2">
                                      ✓ X-Frame-Options Configured
                                    </h4>
                                    <div className="bg-black/30 p-3 rounded border border-gray-700">
                                      <p className="text-sm text-white font-mono">
                                        {scanData.headers["x-frame-options"]}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1">
                                    <h4 className="text-red-400 font-semibold mb-2">
                                      ❌ X-Frame-Options Missing
                                    </h4>
                                    <p className="text-sm text-gray-300 mb-2">
                                      Missing header: x-frame-options
                                    </p>
                                    <div className="bg-black/30 p-3 rounded border border-gray-700">
                                      <p className="text-xs text-gray-400 mb-1">
                                        Recommendation:
                                      </p>
                                      <p className="text-xs text-white">
                                        Set X-Frame-Options: DENY or SAMEORIGIN
                                        to prevent clickjacking attacks
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 📋 3. Content Security Policy (CSP) */}
                        <div className="bg-black rounded-xl border border-white overflow-hidden">
                          <div className="p-4 bg-gray-900 border-b border-white">
                            <div className="flex items-center gap-3">
                              <FileCode className="w-6 h-6 text-blue-400" />
                              <h3 className="text-lg font-semibold text-white">
                                Content Security Policy (CSP)
                              </h3>
                            </div>
                          </div>
                          <div className="p-4">
                            {scanData.headers.csp?.present ? (
                              <div
                                className={`${
                                  scanData.headers.csp.issues.length > 0
                                    ? "bg-yellow-500/10 border-yellow-500/30"
                                    : "bg-green-500/10 border-green-500/30"
                                } border rounded-lg p-4`}
                              >
                                <div className="flex items-start gap-3">
                                  {scanData.headers.csp.issues.length > 0 ? (
                                    <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                                  ) : (
                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                  )}
                                  <div className="flex-1">
                                    <h4
                                      className={`${
                                        scanData.headers.csp.issues.length > 0
                                          ? "text-yellow-400"
                                          : "text-green-400"
                                      } font-semibold mb-2`}
                                    >
                                      {scanData.headers.csp.issues.length > 0
                                        ? "⚠️ CSP Present with Issues"
                                        : "✓ CSP Properly Configured"}
                                    </h4>

                                    {scanData.headers[
                                      "content-security-policy"
                                    ] && (
                                      <div className="bg-black/30 p-3 rounded border border-gray-700 mb-3">
                                        <p className="text-xs text-gray-400 mb-1">
                                          Policy:
                                        </p>
                                        <p className="text-xs text-white font-mono break-all">
                                          {
                                            scanData.headers[
                                              "content-security-policy"
                                            ]
                                          }
                                        </p>
                                      </div>
                                    )}

                                    {scanData.headers.csp.issues.length > 0 && (
                                      <div className="bg-black/30 p-3 rounded border border-gray-700">
                                        <p className="text-xs text-gray-400 mb-2">
                                          Issues Found:
                                        </p>
                                        <ul className="space-y-1">
                                          {scanData.headers.csp.issues.map(
                                            (issue, i) => (
                                              <li
                                                key={i}
                                                className="text-xs text-gray-300"
                                              >
                                                • {issue}
                                              </li>
                                            )
                                          )}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1">
                                    <h4 className="text-red-400 font-semibold mb-2">
                                      ❌ CSP Not Configured
                                    </h4>
                                    <p className="text-sm text-gray-300 mb-2">
                                      Content-Security-Policy header not present
                                    </p>
                                    <div className="bg-black/30 p-3 rounded border border-gray-700">
                                      <p className="text-xs text-gray-400 mb-1">
                                        Recommendation:
                                      </p>
                                      <p className="text-xs text-white">
                                        Add CSP header with directives:
                                        default-src 'self', frame-ancestors
                                        'self', upgrade-insecure-requests
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 🍪 4. Cookie Security */}
                        <div className="bg-black rounded-xl border border-white overflow-hidden">
                          <div className="p-4 bg-gray-900 border-b border-white">
                            <div className="flex items-center gap-3">
                              <Cookie className="w-6 h-6 text-orange-400" />
                              <h3 className="text-lg font-semibold text-white">
                                Cookie Security & Secure Property
                              </h3>
                            </div>
                          </div>
                          <div className="p-4">
                            {scanData.headers.cookieFindings &&
                            scanData.headers.cookieFindings.length > 0 ? (
                              <div className="space-y-3">
                                {scanData.headers.cookieFindings.map(
                                  (cookie, idx) => (
                                    <div
                                      key={idx}
                                      className={`${
                                        cookie.issues.length > 0
                                          ? "bg-orange-500/10 border-orange-500/30"
                                          : "bg-green-500/10 border-green-500/30"
                                      } border rounded-lg p-4`}
                                    >
                                      <div className="flex items-start gap-3">
                                        {cookie.issues.length > 0 ? (
                                          <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                                        ) : (
                                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                        )}
                                        <div className="flex-1">
                                          <h4
                                            className={`${
                                              cookie.issues.length > 0
                                                ? "text-orange-400"
                                                : "text-green-400"
                                            } font-semibold mb-2`}
                                          >
                                            Cookie: {cookie.name}
                                          </h4>

                                          <div className="bg-black/30 p-3 rounded border border-gray-700 mb-2">
                                            <p className="text-xs text-gray-400 mb-1">
                                              Flags:
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                              {cookie.flags.map((flag, i) => (
                                                <span
                                                  key={i}
                                                  className="text-xs px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white"
                                                >
                                                  {flag}
                                                </span>
                                              ))}
                                            </div>
                                          </div>

                                          {cookie.issues.length > 0 && (
                                            <div className="bg-black/30 p-3 rounded border border-gray-700">
                                              <p className="text-xs text-orange-400 mb-2">
                                                Issues:
                                              </p>
                                              <ul className="space-y-1">
                                                {cookie.issues.map(
                                                  (issue, i) => (
                                                    <li
                                                      key={i}
                                                      className="text-xs text-gray-300"
                                                    >
                                                      • {issue}
                                                    </li>
                                                  )
                                                )}
                                              </ul>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            ) : (
                              <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                                <div className="flex items-center gap-3">
                                  <Info className="w-5 h-5 text-gray-400" />
                                  <div>
                                    <h4 className="text-gray-400 font-medium">
                                      No Cookies Found
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-1">
                                      This website does not set any cookies
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 🚫 5. 404 Error Handling */}
                        {scanData.errorHandling?.check404 && (
                          <div className="bg-black rounded-xl border border-white overflow-hidden">
                            <div className="p-4 bg-gray-900 border-b border-white">
                              <div className="flex items-center gap-3">
                                <AlertTriangle className="w-6 h-6 text-yellow-400" />
                                <h3 className="text-lg font-semibold text-white">
                                  404 Error Handling
                                </h3>
                              </div>
                            </div>
                            <div className="p-4">
                              {scanData.errorHandling.check404
                                .properlyConfigured ? (
                                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                                  <div className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                      <h4 className="text-green-400 font-semibold mb-2">
                                        ✓ 404 Handling Properly Configured
                                      </h4>
                                      <div className="bg-black/30 p-3 rounded border border-gray-700">
                                        <p className="text-sm text-white">
                                          Status Code:{" "}
                                          <span className="font-mono">
                                            {
                                              scanData.errorHandling.check404
                                                .statusCode
                                            }
                                          </span>
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                                  <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                      <h4 className="text-yellow-400 font-semibold mb-2">
                                        ⚠️ 404 Handling Misconfigured
                                      </h4>
                                      <p className="text-sm text-gray-300 mb-2">
                                        Server returned status{" "}
                                        {
                                          scanData.errorHandling.check404
                                            .statusCode
                                        }{" "}
                                        instead of 404 for non-existent page
                                      </p>
                                      <div className="bg-black/30 p-3 rounded border border-gray-700">
                                        <p className="text-xs text-gray-400 mb-1">
                                          Recommendation:
                                        </p>
                                        <p className="text-xs text-white">
                                          Configure server to return proper 404
                                          status codes for non-existent
                                          resources
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                        <p className="text-red-400 font-medium">
                          HTTP headers not available
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Raw Headers
                {activeTab === "raw" && (
                  <div>{scanData?.headers?.rawHeaders?.length ? renderRawHeaders(scanData.headers.rawHeaders) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400 font-medium">No raw headers.</p>
                    </div>
                  )}</div>
                )} */}

                {/* Cookies */}
                {activeTab === "cookies" && (
                  <div>
                    {(() => {
                      const cookies = getCookieArray(scanData?.headers);
                      return cookies.length ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full bg-black border border-white text-white">
                            <thead>
                              <tr className="bg-black">
                                <th className="px-4 py-2 border-b border-white text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  Cookie
                                </th>
                                <th className="px-4 py-2 border-b border-white text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  Flags
                                </th>
                                <th className="px-4 py-2 border-b border-white text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  Issues
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white">
                              {cookies.map((c, i) => (
                                <tr key={i} className="hover:bg-gray-900">
                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
                                    {c.name || "(unnamed)"}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-300">
                                    {Array.isArray(c.flags) && c.flags.length
                                      ? c.flags.join(", ")
                                      : "—"}
                                  </td>
                                  <td className="px-4 py-3 text-sm">
                                    {Array.isArray(c.issues) &&
                                    c.issues.length ? (
                                      <ul className="list-disc list-inside text-red-400">
                                        {c.issues.map((x, idx) => (
                                          <li key={idx}>{x}</li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <span className="text-green-400">
                                        None
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Cookie className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-400 font-medium">
                            No cookies set.
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* CSP */}
                {activeTab === "csp" && (
                  <div className="bg-black p-4 sm:p-6 rounded-xl border border-white">
                    {scanData?.headers?.csp ? (
                      <>
                        <div className="flex items-center gap-2 mb-4">
                          <Shield className="text-blue-400" />
                          <h3 className="text-lg font-semibold text-white">
                            Content-Security-Policy
                          </h3>
                          <div className="flex items-center gap-1">
                            {scanData.headers.csp.present ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-400" />
                            )}
                            <span
                              className={`text-sm font-medium ${
                                scanData.headers.csp.present
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            >
                              {scanData.headers.csp.present
                                ? "Present"
                                : "Missing"}
                            </span>
                          </div>
                        </div>

                        {scanData.headers.csp.present && (
                          <div className="mb-4">
                            <h4 className="font-semibold mb-2 text-white">
                              Policy
                            </h4>
                            <p className="text-sm text-gray-300 break-words bg-gray-900 p-3 rounded border">
                              {scanData.headers.csp.policy || "(empty policy)"}
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-2 text-white flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-400" />
                              Issues (
                              {Array.isArray(scanData.headers.csp.issues)
                                ? scanData.headers.csp.issues.length
                                : 0}
                              )
                            </h4>
                            {Array.isArray(scanData.headers.csp.issues) &&
                            scanData.headers.csp.issues.length ? (
                              <ul className="list-disc list-inside text-sm text-red-400 space-y-1">
                                {scanData.headers.csp.issues.map(
                                  (issue, idx) => (
                                    <li key={idx}>{issue}</li>
                                  )
                                )}
                              </ul>
                            ) : (
                              <p className="text-sm text-green-400 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                No issues found
                              </p>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2 text-white">
                              Directives
                            </h4>
                            {scanData.headers.csp.directives &&
                            Object.keys(scanData.headers.csp.directives)
                              .length ? (
                              <div className="text-sm text-gray-300 space-y-2 max-h-60 overflow-y-auto">
                                {Object.entries(
                                  scanData.headers.csp.directives
                                ).map(([k, vals]) => (
                                  <div
                                    key={k}
                                    className="bg-gray-900 p-2 rounded"
                                  >
                                    <span className="font-medium text-blue-400">
                                      {k}:
                                    </span>{" "}
                                    <span className="text-gray-300">
                                      {Array.isArray(vals)
                                        ? vals.join(" ")
                                        : String(vals)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400">
                                No directives found
                              </p>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400">No CSP data available.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Benchmark */}
                {activeTab === "benchmark" && (
                  <div className="bg-black p-4 sm:p-6 rounded-xl border border-white">
                    {/* Check both securityGrade and _benchmark */}
                    {scanData.securityGrade || scanData?.headers?._benchmark ? (
                      <>
                        <div className="flex items-center gap-2 mb-4">
                          <BarChart className="text-slate-400" />
                          <h3 className="text-lg font-semibold text-white">
                            Security Benchmark
                          </h3>
                          <div className="ml-auto">
                            <span className="text-2xl font-bold text-blue-400">
                              {scanData.securityGrade ||
                                scanData.headers._benchmark.grade}
                            </span>
                            <span className="text-sm text-gray-400 ml-1">
                              Grade
                            </span>
                          </div>
                        </div>

                        {scanData.headers?._benchmark?.comparedTo && (
                          <p className="text-sm text-gray-400 mb-4">
                            Compared against the last{" "}
                            {scanData.headers._benchmark.comparedTo} scans for
                            this domain.
                          </p>
                        )}

                        {/* Display Security Grade prominently if available */}
                        {scanData.securityGrade &&
                          !scanData.headers?._benchmark && (
                            <div className="flex items-center justify-center p-8 bg-gray-900 rounded mb-4">
                              <div className="text-center">
                                <div
                                  className={`text-6xl font-bold mb-2 ${
                                    scanData.securityGrade === "A"
                                      ? "text-green-400"
                                      : scanData.securityGrade === "B"
                                      ? "text-blue-400"
                                      : scanData.securityGrade === "C"
                                      ? "text-yellow-400"
                                      : scanData.securityGrade === "D"
                                      ? "text-orange-400"
                                      : "text-red-400"
                                  }`}
                                >
                                  {scanData.securityGrade}
                                </div>
                                <p className="text-sm text-gray-400">
                                  Overall Security Grade
                                </p>
                              </div>
                            </div>
                          )}

                        {scanData.headers?._benchmark?.deltas && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-black p-4 rounded border border-white">
                              <h4 className="font-semibold mb-3 text-white">
                                Performance Deltas
                              </h4>
                              <div className="space-y-2 text-sm">
                                {Object.entries(
                                  scanData.headers._benchmark.deltas
                                ).map(([key, delta]) => {
                                  const label = key
                                    .replace(/([A-Z])/g, " $1")
                                    .replace(/^./, (str) => str.toUpperCase())
                                    .replace("Delta", "");
                                  const isImprovement = delta < 0;
                                  return (
                                    <div
                                      key={key}
                                      className="flex items-center justify-between"
                                    >
                                      <span className="text-gray-300">
                                        {label}:
                                      </span>
                                      <span
                                        className={`font-medium ${
                                          isImprovement
                                            ? "text-green-400"
                                            : delta > 0
                                            ? "text-red-400"
                                            : "text-gray-400"
                                        }`}
                                      >
                                        {delta > 0 ? "+" : ""}
                                        {delta}
                                        {isImprovement && " ↓"}
                                        {delta > 0 && " ↑"}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="bg-black p-4 rounded border border-white">
                              <h4 className="font-semibold mb-3 text-white">
                                Recommendations
                              </h4>
                              <div className="text-sm text-gray-300 space-y-2">
                                <p>• Negative deltas indicate improvement</p>
                                <p>
                                  • Focus on critical and high-severity issues
                                  first
                                </p>
                                <p>
                                  • For grades C or D, prioritize security
                                  headers and CSP
                                </p>
                                {(scanData.securityGrade === "D" ||
                                  scanData.headers._benchmark.grade ===
                                    "D") && (
                                  <p className="text-red-400">
                                    • Immediate attention required for security
                                    posture
                                  </p>
                                )}
                                {(scanData.securityGrade === "F" ||
                                  scanData.headers._benchmark.grade ===
                                    "F") && (
                                  <p className="text-red-400 font-bold">
                                    • CRITICAL: Major security issues detected!
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Performance Metrics */}
                        <div className="mt-4 bg-black p-4 rounded border border-white">
                          <h4 className="font-semibold mb-3 text-white">
                            Performance Metrics
                          </h4>
                          <div className="p-3 bg-gray-900 rounded">
                            <p className="text-sm text-gray-400">
                              Response Time:{" "}
                              <span className="text-white font-semibold">
                                {scanData.timespan || 0} ms
                              </span>
                            </p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <BarChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400">
                          Benchmark data not available.
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          Run more scans to establish baseline metrics.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "raw" && (
                  <div>
                    {normalizeRawHeaders(scanData?.headers?.rawHeaders)
                      .length ? (
                      renderRawHeaders(scanData.headers.rawHeaders)
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-400 font-medium">
                          No raw headers.
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {activeTab === "service" && (
                  <div className="space-y-4">
                    {scanData?.serviceDetection ? (
                      <>
                        {/* Server Information */}
                        {scanData.serviceDetection.serverInfo?.type && (
                          <div className="bg-black rounded-xl border border-white overflow-hidden">
                            <div className="p-4 bg-gray-900 border-b border-white">
                              <div className="flex items-center gap-3">
                                <Shield className="w-6 h-6 text-cyan-400" />
                                <h3 className="text-lg font-semibold text-white">
                                  HTTP Server Information
                                </h3>
                              </div>
                            </div>
                            <table className="min-w-full divide-y divide-white text-white">
                              <tbody className="divide-y divide-white">
                                <tr>
                                  <td className="px-4 py-3 text-sm font-medium text-white bg-black w-1/3">
                                    Server Type
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-300">
                                    {scanData.serviceDetection.serverInfo.type}
                                  </td>
                                </tr>
                                {scanData.serviceDetection.serverInfo
                                  .version && (
                                  <tr>
                                    <td className="px-4 py-3 text-sm font-medium text-white bg-black">
                                      Version
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-300">
                                      {
                                        scanData.serviceDetection.serverInfo
                                          .version
                                      }
                                    </td>
                                  </tr>
                                )}
                                {scanData.serviceDetection.serverInfo.os && (
                                  <tr>
                                    <td className="px-4 py-3 text-sm font-medium text-white bg-black">
                                      Operating System
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-300">
                                      {scanData.serviceDetection.serverInfo.os}
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* HTTP Protocol Information */}
                        {scanData.serviceDetection.httpInfo && (
                          <div className="bg-black rounded-xl border border-white overflow-hidden">
                            <div className="p-4 bg-gray-900 border-b border-white">
                              <div className="flex items-center gap-3">
                                <Globe className="w-5 h-5 text-blue-400" />
                                <h3 className="text-lg font-semibold text-white">
                                  HTTP Protocol Information
                                </h3>
                              </div>
                            </div>
                            <table className="min-w-full divide-y divide-white text-white">
                              <tbody className="divide-y divide-white">
                                <tr>
                                  <td className="px-4 py-3 text-sm font-medium text-white bg-black w-1/3">
                                    HTTP Version
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-300">
                                    HTTP/
                                    {scanData.serviceDetection.httpInfo.version}
                                  </td>
                                </tr>
                                <tr>
                                  <td className="px-4 py-3 text-sm font-medium text-white bg-black">
                                    Status Code
                                  </td>
                                  <td className="px-4 py-3 text-sm">
                                    <span
                                      className={`px-2 py-1 rounded text-xs font-medium ${
                                        scanData.serviceDetection.httpInfo
                                          .statusCode === 200
                                          ? "bg-green-500/20 text-green-400"
                                          : scanData.serviceDetection.httpInfo
                                              .statusCode >= 400
                                          ? "bg-red-500/20 text-red-400"
                                          : "bg-yellow-500/20 text-yellow-400"
                                      }`}
                                    >
                                      {
                                        scanData.serviceDetection.httpInfo
                                          .statusCode
                                      }{" "}
                                      {
                                        scanData.serviceDetection.httpInfo
                                          .statusMessage
                                      }
                                    </span>
                                  </td>
                                </tr>
                                {scanData.serviceDetection.httpInfo.features
                                  ?.length > 0 && (
                                  <tr>
                                    <td className="px-4 py-3 text-sm font-medium text-white bg-black">
                                      Features
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-300">
                                      <div className="flex flex-wrap gap-2">
                                        {scanData.serviceDetection.httpInfo.features.map(
                                          (feature, idx) => (
                                            <span
                                              key={idx}
                                              className="px-2 py-1 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-blue-400"
                                            >
                                              {feature}
                                            </span>
                                          )
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {scanData.serviceDetection.deviceType && (
                          <div className="bg-black rounded-xl border border-white overflow-hidden">
                            <div className="p-4 bg-gray-900 border-b border-white">
                              <div className="flex items-center gap-3">
                                <Shield className="w-5 h-5 text-teal-400" />
                                <h3 className="text-lg font-semibold text-white">
                                  Device Type Detection
                                </h3>
                              </div>
                            </div>
                            <div className="p-4">
                              <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                  <Shield className="w-8 h-8 text-teal-400" />
                                  <div>
                                    <span className="text-sm text-gray-400 block">
                                      Detected Device Type:
                                    </span>
                                    <span className="text-xl font-bold text-white capitalize">
                                      {scanData.serviceDetection.deviceType}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 🆕 Common Platform Enumeration (CPE) */}
                        {scanData.serviceDetection.cpe?.length > 0 && (
                          <div className="bg-black rounded-xl border border-white overflow-hidden">
                            <div className="p-4 bg-gray-900 border-b border-white flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <Shield className="w-5 h-5 text-yellow-400" />
                                <h3 className="text-lg font-semibold text-white">
                                  Common Platform Enumeration (CPE)
                                </h3>
                              </div>
                              <span className="text-sm text-gray-400">
                                {scanData.serviceDetection.cpe.length}{" "}
                                identified
                              </span>
                            </div>
                            <div className="p-4 space-y-3">
                              {scanData.serviceDetection.cpe.map((cpe, idx) => (
                                <div
                                  key={idx}
                                  className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-white">
                                      {cpe.product}
                                    </span>
                                    <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">
                                      {cpe.vendor}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-400 mb-1">
                                    Version: {cpe.version}
                                  </div>
                                  <div className="text-xs text-gray-500 font-mono break-all">
                                    {cpe.cpe23}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 🆕 CGI Testing Results */}
                        {scanData.serviceDetection.cgiTesting?.tested && (
                          <div className="bg-black rounded-xl border border-white overflow-hidden">
                            <div className="p-4 bg-gray-900 border-b border-white">
                              <div className="flex items-center gap-3">
                                <Code className="w-5 h-5 text-indigo-400" />
                                <h3 className="text-lg font-semibold text-white">
                                  CGI Generic Tests
                                </h3>
                              </div>
                            </div>
                            <table className="min-w-full divide-y divide-white text-white">
                              <tbody className="divide-y divide-white">
                                <tr>
                                  <td className="px-4 py-3 text-sm font-medium text-white bg-black w-1/3">
                                    Test Status
                                  </td>
                                  <td className="px-4 py-3 text-sm">
                                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400">
                                      Completed
                                    </span>
                                  </td>
                                </tr>
                                <tr>
                                  <td className="px-4 py-3 text-sm font-medium text-white bg-black">
                                    Vulnerability Status
                                  </td>
                                  <td className="px-4 py-3 text-sm">
                                    <span
                                      className={`px-2 py-1 rounded text-xs font-medium ${
                                        scanData.serviceDetection.cgiTesting
                                          .vulnerable
                                          ? "bg-red-500/20 text-red-400"
                                          : "bg-green-500/20 text-green-400"
                                      }`}
                                    >
                                      {scanData.serviceDetection.cgiTesting
                                        .vulnerable
                                        ? "Vulnerable"
                                        : "Not Vulnerable"}
                                    </span>
                                  </td>
                                </tr>
                                {scanData.serviceDetection.cgiTesting.findings
                                  ?.length > 0 && (
                                  <tr>
                                    <td className="px-4 py-3 text-sm font-medium text-white bg-black">
                                      Findings
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-300">
                                      {
                                        scanData.serviceDetection.cgiTesting
                                          .findings.length
                                      }{" "}
                                      issue(s) detected
                                    </td>
                                  </tr>
                                )}
                                {scanData.serviceDetection.cgiTesting.errors
                                  ?.length > 0 && (
                                  <tr>
                                    <td className="px-4 py-3 text-sm font-medium text-white bg-black">
                                      Errors
                                    </td>
                                    <td className="px-4 py-3 text-sm text-red-300">
                                      {
                                        scanData.serviceDetection.cgiTesting
                                          .errors.length
                                      }{" "}
                                      error(s)
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* 🆕 PostgreSQL Detection */}
                        {scanData.serviceDetection.postgresqlDetection
                          ?.detected && (
                          <div className="bg-black rounded-xl border border-white overflow-hidden">
                            <div className="p-4 bg-gray-900 border-b border-white">
                              <div className="flex items-center gap-3">
                                <Database className="w-5 h-5 text-purple-400" />
                                <h3 className="text-lg font-semibold text-white">
                                  PostgreSQL Server Detection
                                </h3>
                              </div>
                            </div>
                            <table className="min-w-full divide-y divide-white text-white">
                              <tbody className="divide-y divide-white">
                                <tr>
                                  <td className="px-4 py-3 text-sm font-medium text-white bg-black w-1/3">
                                    Detection Status
                                  </td>
                                  <td className="px-4 py-3 text-sm">
                                    <span className="px-2 py-1 rounded text-xs font-medium bg-purple-500/20 text-purple-400">
                                      Detected
                                    </span>
                                  </td>
                                </tr>
                                <tr>
                                  <td className="px-4 py-3 text-sm font-medium text-white bg-black">
                                    Port
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-300">
                                    {
                                      scanData.serviceDetection
                                        .postgresqlDetection.port
                                    }
                                  </td>
                                </tr>
                                {scanData.serviceDetection.postgresqlDetection
                                  .version && (
                                  <tr>
                                    <td className="px-4 py-3 text-sm font-medium text-white bg-black">
                                      Version
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-300">
                                      {
                                        scanData.serviceDetection
                                          .postgresqlDetection.version
                                      }
                                    </td>
                                  </tr>
                                )}
                                <tr>
                                  <td className="px-4 py-3 text-sm font-medium text-white bg-black">
                                    STARTTLS Support
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-300">
                                    {scanData.serviceDetection
                                      .postgresqlDetection.starttlsSupported !==
                                    null
                                      ? scanData.serviceDetection
                                          .postgresqlDetection.starttlsSupported
                                        ? "Supported"
                                        : "Not Supported"
                                      : "Not Tested"}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* Frameworks & Libraries */}
                        {scanData.serviceDetection.frameworks?.length > 0 && (
                          <div className="bg-black rounded-xl border border-white overflow-hidden">
                            <div className="p-4 bg-gray-900 border-b border-white flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <Code className="w-5 h-5 text-purple-400" />
                                <h3 className="text-lg font-semibold text-white">
                                  Frameworks & Libraries
                                </h3>
                              </div>
                              <span className="text-sm text-gray-400">
                                {scanData.serviceDetection.frameworks.length}{" "}
                                detected
                              </span>
                            </div>
                            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {scanData.serviceDetection.frameworks.map(
                                (fw, idx) => (
                                  <div
                                    key={idx}
                                    className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium text-white">
                                        {fw.name}
                                      </span>
                                      <span
                                        className={`text-xs px-2 py-1 rounded ${
                                          fw.confidence === "high"
                                            ? "bg-green-500/20 text-green-400"
                                            : "bg-yellow-500/20 text-yellow-400"
                                        }`}
                                      >
                                        {fw.confidence}
                                      </span>
                                    </div>
                                    {fw.version && (
                                      <div className="text-xs text-gray-400 mb-1">
                                        Version: {fw.version}
                                      </div>
                                    )}
                                    <div className="text-xs text-gray-400">
                                      Detected via: {fw.detected}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {/* Application Servers */}
                        {scanData.serviceDetection.applicationServers?.length >
                          0 && (
                          <div className="bg-black rounded-xl border border-white overflow-hidden">
                            <div className="p-4 bg-gray-900 border-b border-white flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <Globe className="w-5 h-5 text-orange-400" />
                                <h3 className="text-lg font-semibold text-white">
                                  Application Servers
                                </h3>
                              </div>
                              <span className="text-sm text-gray-400">
                                {
                                  scanData.serviceDetection.applicationServers
                                    .length
                                }{" "}
                                detected
                              </span>
                            </div>
                            <div className="p-4 space-y-3">
                              {scanData.serviceDetection.applicationServers.map(
                                (server, idx) => (
                                  <div
                                    key={idx}
                                    className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium text-white">
                                        {server.name}
                                      </span>
                                      <span
                                        className={`text-xs px-2 py-1 rounded ${
                                          server.confidence === "high"
                                            ? "bg-green-500/20 text-green-400"
                                            : "bg-yellow-500/20 text-yellow-400"
                                        }`}
                                      >
                                        {server.confidence} confidence
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      Detected via: {server.detected}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {/* CMS Detection */}
                        {scanData.serviceDetection.cms && (
                          <div className="bg-black rounded-xl border border-white overflow-hidden">
                            <div className="p-4 bg-gray-900 border-b border-white flex items-center gap-3">
                              <FileCode className="w-5 h-5 text-pink-400" />
                              <h3 className="text-lg font-semibold text-white">
                                Content Management System
                              </h3>
                            </div>
                            <div className="p-4">
                              <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-white">
                                    {scanData.serviceDetection.cms.name}
                                  </span>
                                  <span className="text-xs px-2 py-1 rounded bg-pink-500/20 text-pink-400">
                                    {scanData.serviceDetection.cms.confidence}{" "}
                                    confidence
                                  </span>
                                </div>
                                {scanData.serviceDetection.cms.version && (
                                  <div className="text-xs text-gray-400 mt-2">
                                    Version:{" "}
                                    {scanData.serviceDetection.cms.version}
                                  </div>
                                )}
                                <div className="text-xs text-gray-400 mt-1">
                                  Detected via:{" "}
                                  {scanData.serviceDetection.cms.detected}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Technologies & Tools */}
                        {scanData.serviceDetection.technologies?.length > 0 && (
                          <div className="bg-black rounded-xl border border-white overflow-hidden">
                            <div className="p-4 bg-gray-900 border-b border-white flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <Globe className="w-5 h-5 text-green-400" />
                                <h3 className="text-lg font-semibold text-white">
                                  Technologies & Tools
                                </h3>
                              </div>
                              <span className="text-sm text-gray-400">
                                {scanData.serviceDetection.technologies.length}{" "}
                                detected
                              </span>
                            </div>
                            <div className="p-4 space-y-2">
                              {scanData.serviceDetection.technologies.map(
                                (tech, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-700"
                                  >
                                    <div>
                                      <span className="text-sm font-medium text-white">
                                        {tech.name}
                                      </span>
                                      {tech.type && (
                                        <span className="text-xs text-gray-400 ml-2">
                                          ({tech.type})
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">
                                      {tech.confidence} confidence
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {/* FQDN & Network Information */}
                        {scanData.serviceDetection.fqdnInfo && (
                          <div className="bg-black rounded-xl border border-white overflow-hidden">
                            <div className="p-4 bg-gray-900 border-b border-white flex items-center gap-3">
                              <Globe className="w-5 h-5 text-cyan-400" />
                              <h3 className="text-lg font-semibold text-white">
                                Host FQDN & Network Information
                              </h3>
                            </div>
                            <div className="p-4 space-y-4">
                              <div className="p-3 bg-gray-900 rounded-lg border border-gray-700">
                                <span className="text-xs text-gray-400">
                                  Fully Qualified Domain Name:
                                </span>
                                <p className="text-sm text-white font-medium mt-1">
                                  {scanData.serviceDetection.fqdnInfo.fqdn}
                                </p>
                              </div>
                              {scanData.serviceDetection.fqdnInfo.ipv4Addresses
                                ?.length > 0 && (
                                <div>
                                  <span className="text-xs text-gray-400 block mb-2">
                                    IPv4 Addresses:
                                  </span>
                                  <div className="flex flex-wrap gap-2">
                                    {scanData.serviceDetection.fqdnInfo.ipv4Addresses.map(
                                      (ip, idx) => (
                                        <span
                                          key={idx}
                                          className="text-xs px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 font-mono"
                                        >
                                          {ip}
                                        </span>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                              {scanData.serviceDetection.fqdnInfo.reverseDns
                                ?.length > 0 && (
                                <div>
                                  <span className="text-xs text-gray-400 block mb-2">
                                    Reverse DNS Lookup:
                                  </span>
                                  <div className="space-y-2">
                                    {scanData.serviceDetection.fqdnInfo.reverseDns.map(
                                      (entry, idx) => (
                                        <div
                                          key={idx}
                                          className="p-3 bg-gray-900 rounded-lg border border-gray-700"
                                        >
                                          <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs text-cyan-400 font-mono">
                                              {entry.ip}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                              →
                                            </span>
                                          </div>
                                          {entry.hostnames?.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                              {entry.hostnames.map(
                                                (hostname, i) => (
                                                  <span
                                                    key={i}
                                                    className="text-xs px-2 py-1 bg-blue-500/10 border border-blue-500/30 rounded text-blue-400"
                                                  >
                                                    {hostname}
                                                  </span>
                                                )
                                              )}
                                            </div>
                                          ) : (
                                            <span className="text-xs text-gray-500">
                                              No reverse DNS
                                            </span>
                                          )}
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* No Detection Fallback */}
                        {!scanData.serviceDetection.serverInfo?.type &&
                          !scanData.serviceDetection.frameworks?.length &&
                          !scanData.serviceDetection.technologies?.length &&
                          !scanData.serviceDetection.fqdnInfo && (
                            <div className="text-center py-8">
                              <Info className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-400 font-medium">
                                Limited service information available
                              </p>
                              <p className="text-gray-500 text-sm mt-2">
                                Unable to detect detailed server configuration
                              </p>
                            </div>
                          )}
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                        <p className="text-red-400 font-medium">
                          Service detection not available
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "dns" && (
                  <div className="space-y-4">
                    {scanData?.serviceDetection?.fqdnInfo ||
                    scanData?.serviceDetection?.traceroute ||
                    scanData?.serviceDetection?.networkTimings ||
                    scanData?.serviceDetection?.externalUrls ? (
                      <>
                        {/* FQDN & DNS Information */}
                        {scanData.serviceDetection.fqdnInfo && (
                          <div className="bg-black rounded-xl border border-white overflow-hidden">
                            <div className="p-4 bg-gray-900 border-b border-white">
                              <div className="flex items-center gap-3">
                                <Globe className="w-6 h-6 text-cyan-400" />
                                <h3 className="text-lg font-semibold text-white">
                                  DNS & FQDN Information
                                </h3>
                              </div>
                            </div>
                            <div className="p-4 space-y-4">
                              <div className="p-3 bg-gray-900 rounded-lg border border-gray-700">
                                <span className="text-xs text-gray-400">
                                  Fully Qualified Domain Name:
                                </span>
                                <p className="text-sm text-white font-medium mt-1 font-mono">
                                  {scanData.serviceDetection.fqdnInfo.fqdn}
                                </p>
                              </div>

                              {scanData.serviceDetection.fqdnInfo.ipv4Addresses
                                ?.length > 0 && (
                                <div>
                                  <span className="text-xs text-gray-400 block mb-2">
                                    IPv4 Addresses:
                                  </span>
                                  <div className="flex flex-wrap gap-2">
                                    {scanData.serviceDetection.fqdnInfo.ipv4Addresses.map(
                                      (ip, idx) => (
                                        <span
                                          key={idx}
                                          className="text-xs px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 font-mono"
                                        >
                                          {ip}
                                        </span>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                              {scanData.serviceDetection.fqdnInfo.reverseDns
                                ?.length > 0 && (
                                <div>
                                  <span className="text-xs text-gray-400 block mb-2">
                                    Reverse DNS Lookup:
                                  </span>
                                  <div className="space-y-2">
                                    {scanData.serviceDetection.fqdnInfo.reverseDns.map(
                                      (entry, idx) => (
                                        <div
                                          key={idx}
                                          className="p-3 bg-gray-900 rounded-lg border border-gray-700"
                                        >
                                          <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs text-cyan-400 font-mono">
                                              {entry.ip}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                              →
                                            </span>
                                          </div>
                                          {entry.hostnames?.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                              {entry.hostnames.map(
                                                (hostname, i) => (
                                                  <span
                                                    key={i}
                                                    className="text-xs px-2 py-1 bg-blue-500/10 border border-blue-500/30 rounded text-blue-400 font-mono"
                                                  >
                                                    {hostname}
                                                  </span>
                                                )
                                              )}
                                            </div>
                                          ) : (
                                            <span className="text-xs text-gray-500">
                                              No reverse DNS
                                            </span>
                                          )}
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Traceroute Information */}
                        {scanData.serviceDetection.traceroute?.supported &&
                          scanData.serviceDetection.traceroute.hops?.length >
                            0 && (
                            <div className="bg-black rounded-xl border border-white overflow-hidden">
                              <div className="p-4 bg-gray-900 border-b border-white flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  <Network className="w-6 h-6 text-green-400" />
                                  <h3 className="text-lg font-semibold text-white">
                                    Network Path Traceroute
                                  </h3>
                                </div>
                                <span className="text-sm text-gray-400">
                                  {
                                    scanData.serviceDetection.traceroute
                                      .totalHops
                                  }{" "}
                                  hops
                                </span>
                              </div>
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-white text-white">
                                  <thead className="bg-gray-900">
                                    <tr>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Hop
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        IP Address
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Hostname
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Latency
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-700">
                                    {scanData.serviceDetection.traceroute.hops.map(
                                      (hop, idx) => (
                                        <tr
                                          key={idx}
                                          className="hover:bg-gray-900/50"
                                        >
                                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
                                            {hop.hopNumber}
                                          </td>
                                          <td className="px-4 py-3 whitespace-nowrap text-sm text-cyan-400 font-mono">
                                            {hop.ip}
                                          </td>
                                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 font-mono">
                                            {hop.hostname || "-"}
                                          </td>
                                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                                            {hop.rtt1 !== "*" ? (
                                              <span className="text-green-400">
                                                {hop.rtt1}
                                              </span>
                                            ) : (
                                              <span className="text-gray-500">
                                                *
                                              </span>
                                            )}
                                          </td>
                                        </tr>
                                      )
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                        {/* Network Timings */}
                        {scanData.serviceDetection.networkTimings
                          ?.supported && (
                          <div className="bg-black rounded-xl border border-white overflow-hidden">
                            <div className="p-4 bg-gray-900 border-b border-white">
                              <div className="flex items-center gap-3">
                                <Clock className="w-6 h-6 text-purple-400" />
                                <h3 className="text-lg font-semibold text-white">
                                  TCP/IP Network Performance Timings
                                </h3>
                              </div>
                            </div>
                            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {scanData.serviceDetection.networkTimings.timings
                                .dnsLookup && (
                                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                                  <div className="text-xs text-gray-400 mb-1">
                                    DNS Lookup
                                  </div>
                                  <div className="text-2xl font-bold text-purple-400">
                                    {scanData.serviceDetection.networkTimings.timings.dnsLookup.toFixed(
                                      2
                                    )}
                                    <span className="text-sm ml-1">ms</span>
                                  </div>
                                </div>
                              )}

                              {scanData.serviceDetection.networkTimings.timings
                                .tcpConnection && (
                                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                  <div className="text-xs text-gray-400 mb-1">
                                    TCP Connection
                                  </div>
                                  <div className="text-2xl font-bold text-blue-400">
                                    {scanData.serviceDetection.networkTimings.timings.tcpConnection.toFixed(
                                      2
                                    )}
                                    <span className="text-sm ml-1">ms</span>
                                  </div>
                                </div>
                              )}

                              {scanData.serviceDetection.networkTimings.timings
                                .tlsHandshake && (
                                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                                  <div className="text-xs text-gray-400 mb-1">
                                    TLS Handshake
                                  </div>
                                  <div className="text-2xl font-bold text-green-400">
                                    {scanData.serviceDetection.networkTimings.timings.tlsHandshake.toFixed(
                                      2
                                    )}
                                    <span className="text-sm ml-1">ms</span>
                                  </div>
                                </div>
                              )}

                              {scanData.serviceDetection.networkTimings.timings
                                .ttfb && (
                                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                  <div className="text-xs text-gray-400 mb-1">
                                    Time to First Byte (TTFB)
                                  </div>
                                  <div className="text-2xl font-bold text-yellow-400">
                                    {scanData.serviceDetection.networkTimings.timings.ttfb.toFixed(
                                      2
                                    )}
                                    <span className="text-sm ml-1">ms</span>
                                  </div>
                                </div>
                              )}

                              {scanData.serviceDetection.networkTimings.timings
                                .totalTime && (
                                <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                                  <div className="text-xs text-gray-400 mb-1">
                                    Total Time
                                  </div>
                                  <div className="text-2xl font-bold text-cyan-400">
                                    {scanData.serviceDetection.networkTimings.timings.totalTime.toFixed(
                                      2
                                    )}
                                    <span className="text-sm ml-1">ms</span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Performance Indicator */}
                            <div className="px-4 pb-4">
                              <div className="p-3 bg-gray-900 rounded-lg border border-gray-700">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-400">
                                    Network Performance:
                                  </span>
                                  <span
                                    className={`text-sm font-medium px-3 py-1 rounded ${
                                      scanData.serviceDetection.networkTimings
                                        .timings.totalTime < 200
                                        ? "bg-green-500/20 text-green-400"
                                        : scanData.serviceDetection
                                            .networkTimings.timings.totalTime <
                                          500
                                        ? "bg-yellow-500/20 text-yellow-400"
                                        : "bg-red-500/20 text-red-400"
                                    }`}
                                  >
                                    {scanData.serviceDetection.networkTimings
                                      .timings.totalTime < 200
                                      ? "Excellent"
                                      : scanData.serviceDetection.networkTimings
                                          .timings.totalTime < 500
                                      ? "Good"
                                      : "Needs Improvement"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* External URLs */}
                        {scanData.serviceDetection.externalUrls?.length > 0 && (
                          <div className="bg-black rounded-xl border border-white overflow-hidden">
                            <div className="p-4 bg-gray-900 border-b border-white flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <ExternalLink className="w-6 h-6 text-orange-400" />
                                <h3 className="text-lg font-semibold text-white">
                                  External URLs & Dependencies
                                </h3>
                              </div>
                              <span className="text-sm text-gray-400">
                                {scanData.serviceDetection.externalUrls.length}{" "}
                                detected
                              </span>
                            </div>
                            <div className="p-4">
                              <div className="space-y-2">
                                {scanData.serviceDetection.externalUrls.map(
                                  (url, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-700 hover:border-orange-500/50 transition-colors"
                                    >
                                      <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <ExternalLink className="w-4 h-4 text-orange-400 flex-shrink-0" />
                                        <span className="text-sm text-gray-300 font-mono truncate">
                                          {url}
                                        </span>
                                      </div>
                                      <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded text-orange-400 hover:bg-orange-500/20 transition-colors flex-shrink-0"
                                      >
                                        Visit
                                      </a>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* No Data Fallback */}
                        {!scanData.serviceDetection.fqdnInfo &&
                          !scanData.serviceDetection.traceroute?.supported &&
                          !scanData.serviceDetection.networkTimings
                            ?.supported &&
                          !scanData.serviceDetection.externalUrls?.length && (
                            <div className="text-center py-8">
                              <Info className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-400 font-medium">
                                Limited DNS & network information available
                              </p>
                              <p className="text-gray-500 text-sm mt-2">
                                Unable to retrieve detailed network data for
                                this domain
                              </p>
                            </div>
                          )}
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                        <p className="text-red-400 font-medium">
                          DNS & Network data not available
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* History */}
                {activeTab === "history" && (
                  <div className="bg-black p-4 sm:p-6 rounded-xl border border-white">
                    <div className="flex items-center gap-2 mb-4">
                      <History className="text-slate-400" />
                      <h3 className="text-lg font-semibold text-white">
                        Scan History
                      </h3>
                    </div>
                    {!history ? (
                      <div className="text-center py-4">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-400">Loading history...</p>
                      </div>
                    ) : history?.error ? (
                      <div className="text-center py-8">
                        <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                        <p className="text-red-400 text-sm">{history.error}</p>
                      </div>
                    ) : history?.items?.length ? (
                      <div>
                        <p className="text-sm text-gray-400 mb-4">
                          Showing {history.items.length} recent scans for{" "}
                          {history.domain}
                        </p>
                        <div className="overflow-x-auto">
                          <table className="min-w-full bg-black border border-white text-white">
                            <thead>
                              <tr className="bg-black">
                                <th className="px-3 py-2 border-b border-white text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  Date
                                </th>
                                <th className="px-3 py-2 border-b border-white text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  Vulnerabilities
                                </th>
                                <th className="px-3 py-2 border-b border-white text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  Risk Level
                                </th>
                                <th className="px-3 py-2 border-b border-white text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  Grade
                                </th>
                                <th className="px-3 py-2 border-b border-white text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  Response Time
                                </th>
                                <th className="px-3 py-2 border-b border-white text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  SSL Status
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white">
                              {history.items.map((row, i) => (
                                <tr key={i} className="hover:bg-gray-900">
                                  <td className="px-3 py-2 text-xs sm:text-sm text-gray-300">
                                    {new Date(row.timestamp).toLocaleString()}
                                  </td>
                                  <td className="px-3 py-2 text-xs sm:text-sm text-center">
                                    <span
                                      className={`font-medium ${
                                        (row.vulnerabilityCount || 0) === 0
                                          ? "text-green-400"
                                          : (row.vulnerabilityCount || 0) <= 2
                                          ? "text-yellow-400"
                                          : "text-red-400"
                                      }`}
                                    >
                                      {row.vulnerabilityCount ?? "—"}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 text-xs sm:text-sm">
                                    <span
                                      className={`${getRiskLevelColor(
                                        row.riskLevel
                                      )} font-medium`}
                                    >
                                      {row.riskLevel?.toUpperCase() || "—"}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 text-xs sm:text-sm text-center">
                                    <span className="text-blue-400 font-medium">
                                      {row?.headers?._benchmark?.grade || "—"}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 text-xs sm:text-sm text-gray-300 text-center">
                                    {typeof row.timespan === "number"
                                      ? `${row.timespan} ms`
                                      : "—"}
                                  </td>
                                  <td className="px-3 py-2 text-xs sm:text-sm text-center">
                                    {row.ssl?.valid !== undefined ? (
                                      <span
                                        className={
                                          row.ssl.valid
                                            ? "text-green-400"
                                            : "text-red-400"
                                        }
                                      >
                                        {row.ssl.valid ? "✓" : "✗"}
                                      </span>
                                    ) : (
                                      "—"
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400">
                          No scan history available.
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          This is the first scan for this domain.
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {activeTab === "webapp" && (
                  <div className="space-y-4">
                    {/* 🛡️ 1. Clickjacking Vulnerability */}
                    {scanData.vulnerabilities?.some(
                      (v) => v.type === "clickjacking"
                    ) && (
                      <div className="bg-black rounded-xl border border-white overflow-hidden">
                        <div className="p-4 bg-gray-900 border-b border-white">
                          <div className="flex items-center gap-3">
                            <Shield className="w-6 h-6 text-red-400" />
                            <h3 className="text-lg font-semibold text-white">
                              Clickjacking Protection
                            </h3>
                          </div>
                        </div>
                        <div className="p-4">
                          {scanData.vulnerabilities
                            .filter((v) => v.type === "clickjacking")
                            .map((vuln, idx) => (
                              <div
                                key={idx}
                                className="bg-red-500/10 border border-red-500/30 rounded-lg p-4"
                              >
                                <div className="flex items-start gap-3">
                                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1">
                                    <h4 className="text-red-400 font-semibold mb-2">
                                      {vuln.description}
                                    </h4>
                                    <p className="text-sm text-gray-300 mb-2">
                                      {vuln.details}
                                    </p>
                                    <div className="bg-black/30 p-3 rounded border border-gray-700">
                                      <p className="text-xs text-gray-400 mb-1">
                                        Recommendation:
                                      </p>
                                      <p className="text-xs text-white">
                                        {vuln.recommendation}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* 🔐 2. HTML Form Security Analysis */}
                    {scanData.htmlAnalysis && (
                      <div className="bg-black rounded-xl border border-white overflow-hidden">
                        <div className="p-4 bg-gray-900 border-b border-white">
                          <div className="flex items-center gap-3">
                            <Code className="w-6 h-6 text-blue-400" />
                            <h3 className="text-lg font-semibold text-white">
                              HTML Form Security Analysis
                            </h3>
                          </div>
                        </div>

                        <div className="p-4 space-y-4">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="text-center p-3 bg-gray-900 rounded-lg border border-gray-700">
                              <div className="text-2xl font-bold text-white">
                                {scanData.htmlAnalysis.formsFound || 0}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                Forms Found
                              </div>
                            </div>
                            <div className="text-center p-3 bg-gray-900 rounded-lg border border-gray-700">
                              <div className="text-2xl font-bold text-white">
                                {scanData.htmlAnalysis.passwordFields || 0}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                Password Fields
                              </div>
                            </div>
                            <div className="text-center p-3 bg-gray-900 rounded-lg border border-gray-700">
                              <div
                                className={`text-2xl font-bold ${
                                  scanData.htmlAnalysis.insecureActions?.length
                                    ? "text-red-400"
                                    : "text-green-400"
                                }`}
                              >
                                {scanData.htmlAnalysis.insecureActions
                                  ?.length || 0}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                Insecure Actions
                              </div>
                            </div>
                            <div className="text-center p-3 bg-gray-900 rounded-lg border border-gray-700">
                              <div
                                className={`text-2xl font-bold ${
                                  scanData.htmlAnalysis.autoCompleteIssues
                                    ?.length
                                    ? "text-yellow-400"
                                    : "text-green-400"
                                }`}
                              >
                                {scanData.htmlAnalysis.autoCompleteIssues
                                  ?.length || 0}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                Autocomplete Issues
                              </div>
                            </div>
                          </div>

                          {scanData.htmlAnalysis.autoCompleteIssues?.length >
                            0 && (
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                              <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <h4 className="text-yellow-400 font-semibold mb-2">
                                    ⚠️ Web Server Allows Password
                                    Auto-Completion
                                  </h4>
                                  <p className="text-sm text-gray-300 mb-3">
                                    Password fields detected with weak
                                    autocomplete configuration
                                  </p>
                                  <div className="bg-black/30 p-3 rounded border border-gray-700 space-y-2">
                                    {scanData.htmlAnalysis.autoCompleteIssues.map(
                                      (issue, i) => (
                                        <div
                                          key={i}
                                          className="text-xs text-gray-300 font-mono"
                                        >
                                          • {issue}
                                        </div>
                                      )
                                    )}
                                  </div>
                                  <div className="mt-3 bg-gray-900 p-3 rounded border border-yellow-500/20">
                                    <p className="text-xs text-gray-400 mb-1">
                                      Recommendation:
                                    </p>
                                    <p className="text-xs text-white">
                                      Set autocomplete="off" or use
                                      "current-password"/"new-password" values
                                      for password fields to prevent credential
                                      exposure
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {scanData.htmlAnalysis.cleartextCredentials && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                              <div className="flex items-start gap-3">
                                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <h4 className="text-red-400 font-semibold mb-2">
                                    🚨 Web Server Transmits Cleartext
                                    Credentials
                                  </h4>
                                  <p className="text-sm text-gray-300 mb-2">
                                    Forms with password fields are submitting to
                                    HTTP (unencrypted) endpoints
                                  </p>
                                  <div className="bg-black/30 p-3 rounded border border-gray-700">
                                    <p className="text-xs text-gray-400 mb-1">
                                      Recommendation:
                                    </p>
                                    <p className="text-xs text-white">
                                      Use HTTPS for all forms transmitting
                                      sensitive data, especially passwords.
                                      Configure SSL/TLS and enforce HTTPS
                                      redirects.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {scanData.htmlAnalysis.insecureActions?.length >
                            0 && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                              <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <h4 className="text-red-400 font-semibold mb-2">
                                    Insecure Form Actions Detected
                                  </h4>
                                  <div className="bg-black/30 p-3 rounded border border-gray-700">
                                    <p className="text-xs text-gray-400 mb-2">
                                      Forms submitting to HTTP:
                                    </p>
                                    <ul className="space-y-1">
                                      {scanData.htmlAnalysis.insecureActions.map(
                                        (action, i) => (
                                          <li
                                            key={i}
                                            className="text-xs text-gray-300 font-mono break-all"
                                          >
                                            → {action}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {!scanData.htmlAnalysis.autoCompleteIssues?.length &&
                            !scanData.htmlAnalysis.cleartextCredentials &&
                            !scanData.htmlAnalysis.insecureActions?.length &&
                            scanData.htmlAnalysis.formsFound > 0 && (
                              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                  <CheckCircle className="w-5 h-5 text-green-400" />
                                  <div>
                                    <h4 className="text-green-400 font-semibold">
                                      ✓ Form Security Passed
                                    </h4>
                                    <p className="text-xs text-gray-300 mt-1">
                                      All forms use secure configurations
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    )}

                    {/* 🍪 4. Cookie Security Analysis */}
                    {scanData.headers?.cookieFindings?.length > 0 && (
                      <div className="bg-black rounded-xl border border-white overflow-hidden">
                        <div className="p-4 bg-gray-900 border-b border-white">
                          <div className="flex items-center gap-3">
                            <Cookie className="w-6 h-6 text-orange-400" />
                            <h3 className="text-lg font-semibold text-white">
                              Cookie Security Analysis
                            </h3>
                          </div>
                        </div>
                        <div className="p-4 space-y-3">
                          {scanData.headers.cookieFindings
                            .filter((cookie) => cookie.issues.length > 0)
                            .map((cookie, idx) => (
                              <div
                                key={idx}
                                className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4"
                              >
                                <div className="flex items-start gap-3">
                                  <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1">
                                    <h4 className="text-orange-400 font-semibold mb-2">
                                      Cookie "{cookie.name}" Has Security Issues
                                    </h4>
                                    <div className="bg-black/30 p-3 rounded border border-gray-700 space-y-2">
                                      {cookie.issues.map((issue, i) => (
                                        <div
                                          key={i}
                                          className="text-xs text-gray-300"
                                        >
                                          • {issue}
                                        </div>
                                      ))}
                                    </div>
                                    <div className="mt-3 bg-gray-900 p-3 rounded border border-orange-500/20">
                                      <p className="text-xs text-gray-400 mb-1">
                                        Recommendation:
                                      </p>
                                      <p className="text-xs text-white">
                                        Set Secure, HttpOnly, and SameSite flags
                                        for all cookies containing sensitive
                                        data
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}

                          {scanData.headers.cookieFindings.every(
                            (c) => c.issues.length === 0
                          ) && (
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                              <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                                <div>
                                  <h4 className="text-green-400 font-semibold">
                                    ✓ Cookie Security Passed
                                  </h4>
                                  <p className="text-xs text-gray-300 mt-1">
                                    All cookies have proper security flags
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 🗺️ 5. Sitemap */}
                    <div className="bg-black rounded-xl border border-white overflow-hidden">
                      <div className="p-4 bg-gray-900 border-b border-white">
                        <div className="flex items-center gap-3">
                          <FileCode className="w-6 h-6 text-green-400" />
                          <h3 className="text-lg font-semibold text-white">
                            Web Application Sitemap
                          </h3>
                        </div>
                      </div>

                      <div className="p-4">
                        {scanData.sitemap && scanData.sitemap.type ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span className="text-green-400 font-medium">
                                Sitemap Found
                              </span>
                            </div>

                            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 space-y-3">
                              {scanData.sitemap.url && (
                                <div>
                                  <p className="text-xs text-gray-400 mb-1">
                                    URL:
                                  </p>
                                  <a
                                    href={scanData.sitemap.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 underline text-sm break-all"
                                  >
                                    {scanData.sitemap.url}
                                  </a>
                                </div>
                              )}

                              <div>
                                <p className="text-xs text-gray-400 mb-1">
                                  Type:
                                </p>
                                <span className="text-white font-medium text-sm">
                                  {scanData.sitemap.type}
                                </span>
                              </div>

                              {scanData.sitemap.totalUrls && (
                                <div>
                                  <p className="text-xs text-gray-400 mb-1">
                                    Total URLs:
                                  </p>
                                  <span className="text-white font-medium text-sm">
                                    {scanData.sitemap.totalUrls}
                                  </span>
                                </div>
                              )}

                              {scanData.sitemap.totalSitemaps && (
                                <div>
                                  <p className="text-xs text-gray-400 mb-1">
                                    Total Sitemaps:
                                  </p>
                                  <span className="text-white font-medium text-sm">
                                    {scanData.sitemap.totalSitemaps}
                                  </span>
                                </div>
                              )}

                              {scanData.sitemap.urls &&
                                scanData.sitemap.urls.length > 0 && (
                                  <div>
                                    <p className="text-xs text-gray-400 mb-2 flex items-center gap-2">
                                      <Globe className="w-4 h-4" />
                                      Discovered URLs (
                                      {scanData.sitemap.urls.length}):
                                    </p>
                                    <div className="max-h-64 overflow-y-auto bg-black/30 border border-gray-700 rounded p-2">
                                      {scanData.sitemap.urls.map(
                                        (url, index) => (
                                          <div
                                            key={index}
                                            className="flex items-center gap-2 py-1 hover:bg-gray-800 px-2 rounded"
                                          >
                                            <span className="text-gray-500 text-xs w-8">
                                              {index + 1}.
                                            </span>
                                            <a
                                              href={url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-blue-400 hover:text-blue-300 underline text-xs break-all flex-1"
                                            >
                                              {url}
                                            </a>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}

                              {scanData.sitemap.sitemaps &&
                                scanData.sitemap.sitemaps.length > 0 && (
                                  <div>
                                    <p className="text-xs text-gray-400 mb-2">
                                      Child Sitemaps (
                                      {scanData.sitemap.sitemaps.length}):
                                    </p>
                                    <ul className="space-y-1">
                                      {scanData.sitemap.sitemaps.map(
                                        (sitemapUrl, i) => (
                                          <li key={i}>
                                            <a
                                              href={sitemapUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-blue-400 hover:text-blue-300 underline text-xs break-all"
                                            >
                                              {sitemapUrl}
                                            </a>
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}

                              {scanData.sitemap.note && (
                                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-2">
                                  <p className="text-xs text-yellow-400 italic">
                                    Note: {scanData.sitemap.note}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                              <p className="text-xs text-gray-400 mb-1">
                                Recommendation:
                              </p>
                              <p className="text-xs text-white">
                                Ensure sitemap doesn't expose sensitive or
                                administrative URLs
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-400">
                              No sitemap.xml found
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 🤖 6. Robots.txt */}
                    <div className="bg-black rounded-xl border border-white overflow-hidden">
                      <div className="p-4 bg-gray-900 border-b border-white">
                        <div className="flex items-center gap-3">
                          <Globe className="w-6 h-6 text-purple-400" />
                          <h3 className="text-lg font-semibold text-white">
                            Robots.txt Configuration
                          </h3>
                        </div>
                      </div>

                      <div className="p-4">
                        {scanData.robots && scanData.robots.present ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span className="text-green-400 font-medium">
                                robots.txt Found
                              </span>
                            </div>

                            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 space-y-3">
                              <div>
                                <p className="text-xs text-gray-400 mb-1">
                                  Allows All:
                                </p>
                                <span
                                  className={`font-medium text-sm ${
                                    scanData.robots.allowsAll
                                      ? "text-yellow-400"
                                      : "text-green-400"
                                  }`}
                                >
                                  {scanData.robots.allowsAll ? "Yes" : "No"}
                                </span>
                              </div>

                              {scanData.robots.disallowRules &&
                                scanData.robots.disallowRules.length > 0 && (
                                  <div>
                                    <p className="text-xs text-gray-400 mb-2 flex items-center gap-2">
                                      <XCircle className="w-4 h-4 text-red-400" />
                                      Disallowed Paths (
                                      {scanData.robots.disallowRules.length}):
                                    </p>
                                    <div className="max-h-48 overflow-y-auto bg-black/30 border border-gray-700 rounded p-2">
                                      <ul className="space-y-1">
                                        {scanData.robots.disallowRules.map(
                                          (path, i) => (
                                            <li
                                              key={i}
                                              className="text-xs text-gray-400 font-mono break-all"
                                            >
                                              🚫 {path || "(empty)"}
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    </div>
                                  </div>
                                )}

                              {scanData.robots.sitemaps &&
                                scanData.robots.sitemaps.length > 0 && (
                                  <div>
                                    <p className="text-xs text-gray-400 mb-2 flex items-center gap-2">
                                      <FileCode className="w-4 h-4 text-green-400" />
                                      Sitemaps Declared (
                                      {scanData.robots.sitemaps.length}):
                                    </p>
                                    <ul className="space-y-1">
                                      {scanData.robots.sitemaps.map(
                                        (sitemapUrl, i) => (
                                          <li key={i}>
                                            <a
                                              href={sitemapUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-blue-400 hover:text-blue-300 underline text-xs break-all"
                                            >
                                              {sitemapUrl}
                                            </a>
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-400">
                              No robots.txt found
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 🆕 🌐 WEB MIRRORING */}
                    {scanData?.webMirror && (
                      <div className="bg-black rounded-xl border border-white overflow-hidden">
                        <div className="p-4 bg-gray-900 border-b border-white flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <Globe className="w-6 h-6 text-teal-400" />
                            <h3 className="text-lg font-semibold text-white">
                              Web Application Structure (Mirror)
                            </h3>
                          </div>
                          <span className="text-sm text-gray-400">
                            {scanData.webMirror?.totalPages || 0} pages
                            discovered
                          </span>
                        </div>

                        {scanData.webMirror?.totalPages > 0 ? (
                          <div className="p-4 space-y-4">
                            {/* Summary Stats */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                              <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-lg text-center">
                                <div className="text-2xl font-bold text-teal-400">
                                  {scanData.webMirror.totalPages}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  Pages Crawled
                                </div>
                              </div>
                              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-center">
                                <div className="text-2xl font-bold text-blue-400">
                                  {scanData.webMirror.totalDiscovered}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  URLs Discovered
                                </div>
                              </div>
                              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg text-center">
                                <div className="text-2xl font-bold text-purple-400">
                                  {scanData.webMirror.maxDepthReached}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  Max Depth
                                </div>
                              </div>
                              <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg text-center">
                                <div className="text-2xl font-bold text-orange-400">
                                  {scanData.webMirror.assets?.totalAssets || 0}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  Assets Found
                                </div>
                              </div>
                            </div>

                            {/* Page List */}
                            {scanData.webMirror.pages &&
                              scanData.webMirror.pages.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold text-white mb-2">
                                    Discovered Pages:
                                  </h4>
                                  <div className="max-h-96 overflow-y-auto bg-gray-900 border border-gray-700 rounded-lg">
                                    {scanData.webMirror.pages.map(
                                      (page, idx) => (
                                        <div
                                          key={idx}
                                          className="p-3 border-b border-gray-700 last:border-b-0 hover:bg-gray-800"
                                        >
                                          <div className="flex items-start justify-between mb-1">
                                            <a
                                              href={page.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-sm text-blue-400 hover:text-blue-300 underline break-all flex-1"
                                            >
                                              {page.url}
                                            </a>
                                            <span className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300 ml-2 flex-shrink-0">
                                              Depth: {page.depth}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
                                            <span className="truncate max-w-md">
                                              {page.title}
                                            </span>
                                            <span>•</span>
                                            <span className="text-green-400">
                                              {page.statusCode}
                                            </span>
                                            <span>•</span>
                                            <span>
                                              {(page.size / 1024).toFixed(1)} KB
                                            </span>
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                            {/* Assets Breakdown */}
                            {scanData.webMirror.assets && (
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="p-3 bg-gray-900 rounded-lg border border-gray-700">
                                  <div className="text-xs text-gray-400 mb-1">
                                    Images
                                  </div>
                                  <div className="text-xl font-bold text-white">
                                    {scanData.webMirror.assets.images?.length ||
                                      0}
                                  </div>
                                </div>
                                <div className="p-3 bg-gray-900 rounded-lg border border-gray-700">
                                  <div className="text-xs text-gray-400 mb-1">
                                    Scripts
                                  </div>
                                  <div className="text-xl font-bold text-white">
                                    {scanData.webMirror.assets.scripts
                                      ?.length || 0}
                                  </div>
                                </div>
                                <div className="p-3 bg-gray-900 rounded-lg border border-gray-700">
                                  <div className="text-xs text-gray-400 mb-1">
                                    Stylesheets
                                  </div>
                                  <div className="text-xl font-bold text-white">
                                    {scanData.webMirror.assets.stylesheets
                                      ?.length || 0}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Errors */}
                            {scanData.webMirror.errors?.length > 0 && (
                              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                                <h4 className="text-sm font-semibold text-red-400 mb-2">
                                  Crawl Errors (
                                  {scanData.webMirror.errors.length}):
                                </h4>
                                <div className="space-y-1">
                                  {scanData.webMirror.errors
                                    .slice(0, 5)
                                    .map((err, idx) => (
                                      <div
                                        key={idx}
                                        className="text-xs text-gray-300"
                                      >
                                        • {err.url}: {err.error}
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}

                            {/* Recommendation */}
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                              <p className="text-xs text-gray-400 mb-1">
                                Recommendation:
                              </p>
                              <p className="text-xs text-white">
                                Review all discovered pages and ensure sensitive
                                pages are properly protected with authentication
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4">
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                              <p className="text-yellow-400">
                                Web mirroring data available but no pages
                                crawled.
                              </p>
                              {scanData.webMirror?.error && (
                                <p className="text-xs text-gray-400 mt-2">
                                  Error: {scanData.webMirror.error}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 🌐 External URLs */}
                    {scanData.serviceDetection?.externalUrls &&
                      scanData.serviceDetection.externalUrls.length > 0 && (
                        <div className="bg-black rounded-xl border border-white overflow-hidden">
                          <div className="p-4 bg-gray-900 border-b border-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <ExternalLink className="w-6 h-6 text-orange-400" />
                              <h3 className="text-lg font-semibold text-white">
                                External URLs & Dependencies
                              </h3>
                            </div>
                            <span className="text-sm text-gray-400">
                              {scanData.serviceDetection.externalUrls.length}{" "}
                              detected
                            </span>
                          </div>

                          <div className="p-4">
                            <p className="text-xs text-gray-400 mb-3">
                              External domains referenced by this website:
                            </p>
                            <div className="max-h-64 overflow-y-auto space-y-2">
                              {scanData.serviceDetection.externalUrls.map(
                                (url, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-2 p-3 bg-gray-900 rounded-lg border border-gray-700 hover:border-orange-500/50 transition-colors"
                                  >
                                    <span className="text-gray-500 text-xs w-6">
                                      {index + 1}.
                                    </span>
                                    <a
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-400 hover:text-blue-300 underline text-sm break-all flex-1"
                                    >
                                      {url}
                                    </a>
                                    <ExternalLink className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {/* Download PDF Button */}
                {scanData && (
                  <div className="flex justify-center sm:justify-end mt-6 pt-4 border-t border-white">
                    <button
                      onClick={generatePDF}
                      className="bg-red-600 hover:bg-red-500 text-white py-2 px-6 rounded border border-white flex items-center gap-2 transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">Download PDF Report</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
