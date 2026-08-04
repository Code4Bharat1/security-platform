"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Terminal, 
  Download, 
  ShieldCheck, 
  ShieldAlert,
  FileText, 
  ChevronRight,
  ChevronDown, 
  CheckCircle2, 
  Loader2, 
  Server,
  AlertTriangle,
  Globe,
  Fingerprint,
  Link2,
  Search,
  FileCode,
  Tag,
  Hash,
  Compass,
  ArrowLeft,
  Shield,
  Wrench,
  Check,
  Mail,
  XCircle,
  Clock
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import useProtectedAction from "@/components/UseProtectedAction/UseProtectedAction";
import { C, drawSectionHeader, renderTable, applyHeaderFooterDecorator, getAuditorInfo, safe } from "@/utils/pdfFramework";

// ── Import Dedicated Tool PDF Generators ────────────────────────────────────
import { generateSubdomainPDF } from "@/components/subdomainEnumeration/generateSubdomainPDF";
import { generateWhoisPDF } from "@/components/whoisLookup/generateWhoisPDF";
import { generateMetaPDF } from "@/components/MetaForm/generateMetaPDF";
import { generateFingerprintPDF } from "@/components/fingerPrint/generateFingerprintPDF";
import { generateWebsiteReconPDF } from "@/components/webrecon/generateWebsiteReconPDF";

// ── Excluded Tools Registry (Tools requiring files, code snippets, tokens or local parameters) ──
const EXCLUDED_TOOL_NAMES_AND_ROUTES = new Set([
  // Tool Display Names
  "Source Code Analyzer",
  "API Testing",
  "Port Scanner",
  "CSRF Scanner",
  "Secret Key Scanner",
  "Session Fixation Tester",
  "Database Security Checker",
  "JWT Signature Validator",
  "OAuth Token Analyzer",
  "Obfuscation Detector",
  "Regex Security Validator",
  "Reverse DNS Resolver",
  "URL Shortener",
  "Password Strength Checker",
  "Cyber Fraud Identifier",
  "AWS Credential Validation",
  "System Hardening",
  "Malware Scan",
  "Active Directory Scan",
  "Credential Path Audit",
  "SecureCrypt",
  "File Scanner",
  "Email Phishing & Threat Analyzer",
  "QR Tool",
  "Broken Link Checker",
  // Route Strings
  "/api/Source-Code",
  "/api/apiForm",
  "/api/portScannerForm",
  "/api/csrfChecker",
  "/api/secretKeyScanner",
  "/api/sessionFixationChecker",
  "/api/DbSecurityChecker",
  "/api/JWTSignatureValidator",
  "/api/OAuthTokenInspector",
  "/api/obfuscationChecker",
  "/api/regexDetector",
  "/api/reverseDNSLookup",
  "/api/url-shortener",
  "/api/password-checker",
  "/api/cyber-fraud-identifier",
  "/api/cloud-security",
  "/api/system-hardening",
  "/api/dependency-check",
  "/api/active-directory-scan",
  "/api/credential-path-audit",
  "/api/securecrypt",
  "/api/folder-threat-scanner",
  "/api/email-attachment-analyzer",
  "/api/fake-qr-code-detector",
  "/api/brokenStreamForm"
]);

// ── Plan hierarchy for tier comparison ──────────────────────────────────────
const PLAN_HIERARCHY = ["free", "premium", "pro", "enterprise"];
const planRank = (p) => PLAN_HIERARCHY.indexOf((p || "free").toLowerCase());

// ── Icon lookup for dynamically loaded tool names ───────────────────────────
const TOOL_ICON_MAP = {
  "Subdomain Scanner": Compass,
  "Website Recon": Globe,
  "Technology Fingerprinter": Fingerprint,
  "Whois Domain Lookup": Search,
  "Meta Tag Analyzer": Tag,
  "Keyword Density Checker": Hash,
  "Link Detector": FileCode,
  "IP Address Info Finder": Server,
  "Vulnerability Scanner": ShieldAlert,
  "Brute Force Scanner": Shield,
  "WordPress Scanner": Globe,
  "Clickjacking Tester": ShieldAlert,
  "XSS Tester": ShieldAlert,
  "Open Redirect Tester": Link2,
  "SQLi Scanner": ShieldAlert,
  "HTTPS Security Checker": ShieldCheck,
  "WAF Scanner": Shield,
  "MDR Monitor": Server,
  "Sitemap Generator": FileText,
  "SEO Score Analyzer Tool": Tag,
  "Keyword Generator": Hash,
  "Website Optimization Tool": Globe,
  "Advanced Dynamic Scan": Terminal,
  "Basic Network Scanning": Server,
  "Web Application Test": Globe
};

// ── Complete Tool Endpoint Mapping (Mapped to backend server.js Express mounts) ─────
const TOOL_ENDPOINT_MAP = {
  "/api/bruteForce": { endpoint: "/bruteForce/brute-Force", method: "POST", field: "target", useFullUrl: true },
  "/api/wordpressForm": { endpoint: "/wordpress/wordpress-scan", method: "POST", field: "url", useFullUrl: true },
  "/api/clickjackingTester": { endpoint: "/clickjacking/jacking", method: "POST", field: "url", useFullUrl: true },
  "/api/webrecon": { endpoint: "/dns/recon-scan", method: "POST", field: "domain" },
  "/api/vuln-scanner": { endpoint: "/scan/run-scan", method: "POST", field: "url", useFullUrl: true },
  "/api/whoisLookup": { endpoint: "/whois/whois-scan", method: "POST", field: "domain" },
  "/api/subdomainEnumeration": { endpoint: "/subdomain/subdomains-scan", method: "POST", field: "domain" },
  "/api/xssTester": { endpoint: "/xssTester/xssTester-scan", method: "POST", field: "url", useFullUrl: true },
  "/api/openRedirectTester": { endpoint: "/openRedirectTester/openRedirect-tester-advanced", method: "POST", field: "url", useFullUrl: true },
  "/api/fingerPrint": { endpoint: "/fingerprint/fingerprint-scan", method: "POST", field: "url", useFullUrl: true },
  "/api/nexpose-scan": { endpoint: "/nexpose/sql", method: "POST", field: "url", useFullUrl: true },
  "/api/httpsCheckerForm": { endpoint: "/http/https-enforcement", method: "POST", field: "target", useFullUrl: true },
  "/api/firewallDashboard": { endpoint: "/waf/waf-scan", method: "POST", field: "url", useFullUrl: true },
  "/api/mdr-monitor": { endpoint: "/mdr-monitor", method: "POST", field: "url", useFullUrl: true },
  "/api/keyword-checker": { endpoint: "/keyword/generate", method: "POST", field: "url", useFullUrl: true },
  "/api/meta-tag": { endpoint: "/meta/meta-analyze", method: "POST", field: "url", useFullUrl: true },
  "/api/sitemapForm": { endpoint: "/sitemap/sitemap-scanner", method: "POST", field: "url", useFullUrl: true, extra: { depth: 3 } },
  "/api/check-link": { endpoint: "/link-detector/link-scan", method: "POST", field: "url", useFullUrl: true },
  "/api/ip-address-info-finder": { endpoint: "/ipinfo/", method: "POST", field: "ip" },
  "/api/seo-score-analyzer-tool": { endpoint: "/seo/analyze", method: "POST", field: "url", useFullUrl: true },
  "/api/KeywordGenerator": { endpoint: "/keywords/generate", method: "POST", field: "url", useFullUrl: true },
  "/api/website-optimization-tool": { endpoint: "/website-optimization/", method: "POST", field: "url", useFullUrl: true },
  "/api/advanced-dynamic-scan": { endpoint: "/advanced-dynamic-scan/scan", method: "POST", field: "targetUrl", useFullUrl: true },
  "/api/basic-network-scan": { endpoint: "/basic-network-scan/scan", method: "POST", field: "target" },
  "/api/web-app-audit": { endpoint: "/scan/web-app-audit", method: "POST", field: "url", useFullUrl: true }
};

const API_BASE = (process.env.NEXT_PUBLIC_PROD_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");

// ── Clean Formatter to Convert Raw Nested Objects/Arrays to Readable PDF Rows ──
const formatToolDataToRows = (dataObj) => {
  const rows = [];
  if (!dataObj || typeof dataObj !== "object") {
    return [["Inspection Result", safe(dataObj), "Passed"]];
  }

  const cleanKey = (k) => k.replace(/([A-Z])/g, " $1").replace(/_/g, " ").replace(/^./, s => s.toUpperCase());

  const processVal = (val) => {
    if (val === null || val === undefined) return "—";
    if (typeof val === "boolean") return val ? "Enabled / True" : "Disabled / False";
    if (typeof val === "number" || typeof val === "string") return String(val);
    if (Array.isArray(val)) {
      if (val.length === 0) return "None Detected";
      return val.map(v => typeof v === "object" ? (v.name || v.type || v.header || v.subdomain || JSON.stringify(v)) : String(v)).join(", ");
    }
    if (typeof val === "object") {
      const parts = Object.entries(val).map(([nk, nv]) => {
        const valStr = typeof nv === "object" ? JSON.stringify(nv) : String(nv);
        return `${cleanKey(nk)}: ${valStr}`;
      });
      return parts.join(" | ");
    }
    return String(val);
  };

  Object.entries(dataObj).forEach(([key, val]) => {
    if (key === "success" || key === "ok" || key === "timestamp" || key === "message") return;

    const formattedLabel = cleanKey(key);
    if (typeof val === "object" && val !== null && !Array.isArray(val) && Object.keys(val).length > 0) {
      Object.entries(val).forEach(([subKey, subVal]) => {
        const subLabel = `${formattedLabel} → ${cleanKey(subKey)}`;
        const subFormattedVal = processVal(subVal);
        rows.push([subLabel, safe(subFormattedVal), "Verified"]);
      });
    } else {
      const formattedValue = processVal(val);
      const statusTag = (typeof val === "boolean" && !val) || (Array.isArray(val) && val.length === 0) ? "Notice" : "Verified";
      rows.push([formattedLabel, safe(formattedValue), statusTag]);
    }
  });

  return rows.length > 0 ? rows : [["Result Status", "Scan completed cleanly with no issues reported.", "Clean"]];
};

function ReportGeneratorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTier = useMemo(() => (searchParams.get("plan") || "free").toLowerCase(), [searchParams]);
  const protectedAction = useProtectedAction();
  
  // General State
  const [domain, setDomain] = useState("example.com");
  const [scanning, setScanning] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [reportReady, setReportReady] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");
  const [scanResults, setScanResults] = useState([]);
  const logContainerRef = useRef(null);

  // Subscription & Plan Feature State
  const [currentSub, setCurrentSub] = useState({ plan: "Free" });
  const [planFeatures, setPlanFeatures] = useState({});
  const [loadingCurrent, setLoadingCurrent] = useState(true);
  const [loadingFeatures, setLoadingFeatures] = useState(true);

  // Fetch current user subscription
  const fetchCurrentSub = async () => {
    setLoadingCurrent(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setLoadingCurrent(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/subscription/current`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentSub(data);
      }
    } catch (err) {
      console.error("Error fetching current subscription:", err);
    } finally {
      setLoadingCurrent(false);
    }
  };

  // Fetch all plan-features mapping from backend
  const fetchPlanFeatures = async () => {
    setLoadingFeatures(true);
    try {
      const res = await fetch(`${API_BASE}/subscription/plan-features`);
      if (res.ok) {
        const data = await res.json();
        setPlanFeatures(data);
      }
    } catch (err) {
      console.error("Error fetching plan features:", err);
    } finally {
      setLoadingFeatures(false);
    }
  };

  useEffect(() => {
    fetchCurrentSub();
    fetchPlanFeatures();
  }, []);

  const userPlan = currentSub?.plan || "Free";

  // Derive tools assigned to user's plan — Filter out non-URL tools
  const currentPlanTools = useMemo(() => {
    const rawTools = planFeatures[userPlan] || planFeatures["Free"] || [];
    return rawTools.filter(tool => 
      !EXCLUDED_TOOL_NAMES_AND_ROUTES.has(tool.name) && 
      !EXCLUDED_TOOL_NAMES_AND_ROUTES.has(tool.route)
    );
  }, [planFeatures, userPlan]);

  const dynamicToolsList = useMemo(() => {
    return currentPlanTools.map((tool, idx) => ({
      id: `tool-${idx}`,
      name: tool.name,
      route: tool.route,
      icon: TOOL_ICON_MAP[tool.name] || Wrench,
      status: "pending"
    }));
  }, [currentPlanTools]);

  const [toolsStatus, setToolsStatus] = useState([]);

  useEffect(() => {
    setToolsStatus(dynamicToolsList);
  }, [dynamicToolsList]);

  // Access check
  const hasAccess = useMemo(() => {
    if (loadingCurrent) return true;
    return planRank(userPlan) >= planRank(requestedTier);
  }, [userPlan, requestedTier, loadingCurrent]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [consoleLogs]);

  // Helper log emitter
  const appendLog = (msg) => {
    setConsoleLogs((prev) => [...prev, msg]);
  };

  // ── Sequential Multi-Tool Execution Runner ────────────────────────────────
  const handleStartScan = async (e) => {
    e.preventDefault();
    if (!hasAccess) return;
    if (!domain.trim()) return;

    setScanning(true);
    setReportReady(false);
    setConsoleLogs([]);
    setScanResults([]);
    
    // Reset all tool statuses to pending
    setToolsStatus(dynamicToolsList.map(t => ({ ...t, status: "pending" })));

    const cleanHost = domain.replace(/^https?:\/\//i, "").replace(/\/.*$/, "");
    const targetUrl = domain.startsWith("http") ? domain : `https://${cleanHost}`;

    appendLog(`[INFO] Starting Multi-Tool Security Audit for ${userPlan.toUpperCase()} Plan...`);
    appendLog(`[INFO] Target Host: ${cleanHost} (${targetUrl})`);
    appendLog(`[WARNING] DO NOT CLOSE OR REFRESH THIS TAB while the sequential audit is running.`);
    appendLog(`[NOTICE] Email notification for completed reports is planned for upcoming phase.`);

    const totalTools = dynamicToolsList.length;
    const accumulatedResults = [];

    await protectedAction(async (token) => {
      for (let i = 0; i < totalTools; i++) {
        const tool = dynamicToolsList[i];
        const stageNum = i + 1;

        // Mark current tool as running
        setToolsStatus(prev => prev.map((t, idx) => idx === i ? { ...t, status: "running" } : t));
        appendLog(`[STAGE ${stageNum}/${totalTools}] Executing ${tool.name}...`);

        const config = TOOL_ENDPOINT_MAP[tool.route] || { 
          endpoint: `${tool.route}/scan`, 
          method: "POST", 
          field: "url" 
        };

        const payload = { ...(config.extra || {}) };
        if (config.useFullUrl) {
          payload[config.field || "url"] = targetUrl;
        } else if (config.field === "domain" || config.field === "ipOrDomain" || config.field === "host" || config.field === "ip" || config.field === "target") {
          payload[config.field || "target"] = cleanHost;
        } else {
          payload[config.field || "url"] = targetUrl;
        }

        try {
          const endpointUrl = `${API_BASE}${config.endpoint}`;
          const fetchOptions = {
            method: config.method || "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            }
          };

          if (config.method !== "GET") {
            fetchOptions.body = JSON.stringify(payload);
          }

          const res = await fetch(endpointUrl, fetchOptions);

          if (!res.ok) {
            const errText = await res.text();
            throw new Error(`HTTP ${res.status}: ${errText.slice(0, 100) || res.statusText}`);
          }

          const resData = await res.json();
          appendLog(`[SUCCESS] ${tool.name} finished successfully.`);

          const resultItem = {
            name: tool.name,
            route: tool.route,
            status: "completed",
            data: resData,
            timestamp: new Date().toLocaleTimeString()
          };

          accumulatedResults.push(resultItem);
          setToolsStatus(prev => prev.map((t, idx) => idx === i ? { ...t, status: "completed" } : t));

        } catch (err) {
          console.error(`Error executing ${tool.name}:`, err);
          appendLog(`[ERROR] ${tool.name} failed: ${err.message || "Endpoint error"}`);

          const resultItem = {
            name: tool.name,
            route: tool.route,
            status: "failed",
            error: err.message || "Failed to execute scan endpoint",
            timestamp: new Date().toLocaleTimeString()
          };

          accumulatedResults.push(resultItem);
          setToolsStatus(prev => prev.map((t, idx) => idx === i ? { ...t, status: "failed" } : t));
        }

        // Brief delay between sequential scans
        await new Promise(r => setTimeout(r, 600));
      }
    });

    const passed = accumulatedResults.filter(r => r.status === "completed").length;
    const failed = accumulatedResults.filter(r => r.status === "failed").length;

    appendLog(`[INFO] Consolidated Multi-Tool Pipeline Completed.`);
    appendLog(`[SUMMARY] ${passed} tool(s) completed successfully, ${failed} failed.`);
    appendLog(`[SUCCESS] Integrated Report ready. You may now download the stacked PDF report.`);

    setScanResults(accumulatedResults);
    setScanning(false);
    setReportReady(true);
  };

  // ── Render Formatted PDF Page Fallback ────────────────────────────────────
  const renderToolFormattedPDFPage = (doc, res, index, totalTools, targetDomain) => {
    doc.addPage();

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
    const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    // Section 1 Header Banner
    let y = drawSectionHeader(doc, `TOOL ${index + 1}/${totalTools}: ${res.name.toUpperCase()} ASSESSMENT REPORT`, 20);

    // Section 1 Metadata Table
    renderTable(doc, {
      startY: y,
      head: [],
      body: [
        ["Tool Name",             res.name],
        ["Target Domain / URL",   targetDomain],
        ["Execution Status",       res.status === "completed" ? "COMPLETED" : `FAILED (${res.error || "Error"})`],
        ["Execution Time",         `${dateStr} ${timeStr}`],
        ["Compliance Framework",  "OWASP WSTG / ISO 27001 / AICPA SOC 2 Alignment"],
        ["Classification",        "Confidential"]
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50, fillColor: [245, 245, 245] },
        1: { cellWidth: 132 }
      }
    });

    y = doc.lastAutoTable.finalY + 8;

    // Scope & Overview
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Tool Scope & Assessment Overview", 14, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    const scopeDesc = `The ${res.name} tool performed automated security assessment checks against target ${targetDomain}. This audit inspects host parameters, maps attack surfaces, and evaluates security posture in alignment with OWASP and ISO 27001 benchmarks.`;
    doc.text(scopeDesc, 14, y + 5, { maxWidth: 182, align: "justify", lineHeightFactor: 1.4 });

    y += doc.getTextDimensions(scopeDesc, { maxWidth: 182 }).h + 10;

    // Section 2 Detailed Scan Findings Table
    y = drawSectionHeader(doc, `${res.name} — Detailed Scan Findings & Inspection Matrix`, y);

    let findingsRows = [];

    if (res.status === "completed" && res.data) {
      findingsRows = formatToolDataToRows(res.data);
    } else {
      findingsRows = [
        ["Execution Outcome", "Tool endpoint returned error or failed to execute.", "Failed"],
        ["Error Details", res.error || "Route unavailable or network timeout.", "Failed"],
        ["Impact", "Security parameters for this module could not be verified automatically.", "Attention Needed"]
      ];
    }

    renderTable(doc, {
      startY: y,
      head: [["Assessment Parameter / Inspection Key", "Observed Result / Output Data", "Status"]],
      body: findingsRows,
      headStyles: { fillColor: C.bgHeader, textColor: C.white },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55 },
        1: { cellWidth: 100 },
        2: { cellWidth: 27, halign: "center", fontStyle: "bold" }
      }
    });

    y = doc.lastAutoTable.finalY + 10;

    // Section 3 Recommendations
    if (297 - y < 45) {
      doc.addPage();
      y = 25;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.bluePrimary);
    doc.text("Security Recommendations & Remediation Plan", 14, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMain);
    if (res.status === "completed") {
      doc.text(`1. Validate all ${res.name} outputs above against organizational security baselines.`, 14, y + 6);
      doc.text(`2. Address any highlighted security exceptions or misconfigurations immediately.`, 14, y + 12);
      doc.text(`3. Include ${res.name} in continuous automated monitoring schedules.`, 14, y + 18);
    } else {
      doc.text(`1. Verify server configuration and network routing for ${res.name} backend endpoint.`, 14, y + 6);
      doc.text(`2. Re-trigger an isolated audit run for ${res.name} once host accessibility is restored.`, 14, y + 12);
    }
  };

  // ── Stacked Integrated PDF Generator ──────────────────────────────────────
  const handleDownloadPDF = async () => {
    if (!hasAccess || scanResults.length === 0) return;
    
    const doc = new jsPDF("p", "mm", "a4");
    const passedCount = scanResults.filter(r => r.status === "completed").length;
    const failedCount = scanResults.filter(r => r.status === "failed").length;
    const { employeeName, employeeMail } = getAuditorInfo();

    // ── Page 1: Cover Page & Master Executive Summary ─────────────────────────
    doc.setFillColor(...C.bluePrimary);
    doc.rect(0, 0, 210, 3.5, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(...C.bluePrimary);
    doc.text("NEXCORE ALLIANCE", 105, 28, { align: "center" });

    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.text("AI-Powered Cybersecurity & Information Security Solutions", 105, 34, { align: "center" });

    doc.setDrawColor(...C.bluePrimary);
    doc.setLineWidth(0.4);
    doc.line(14, 38, 196, 38);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...C.bluePrimary);
    doc.text(`CONSOLIDATED ${userPlan.toUpperCase()} TIER MULTI-TOOL AUDIT REPORT`, 105, 50, { align: "center" });
    doc.line(14, 56, 196, 56);

    renderTable(doc, {
      startY: 62,
      head: [],
      body: [
        ["Assessment Performed by", employeeMail],
        ["Employee Name",           employeeName],
        ["Target Domain / Host",    domain],
        ["Subscription Tier",       userPlan],
        ["Assessment Date",         new Date().toLocaleDateString("en-GB")],
        ["Total Tools Executed",    `${scanResults.length} (${passedCount} Passed, ${failedCount} Failed)`],
        ["Classification",          "Confidential"],
        ["Assessment Status",       "Completed"]
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
        1: { cellWidth: 127 }
      }
    });

    let y = drawSectionHeader(doc, "Master Executive Audit Summary Table", doc.lastAutoTable.finalY + 10);

    const summaryHeaders = [["#", "Tool Name", "Status", "Timestamp", "Audit Summary Finding"]];
    const summaryData = scanResults.map((r, idx) => [
      String(idx + 1),
      r.name,
      r.status.toUpperCase(),
      r.timestamp,
      r.status === "completed" 
        ? "Scan completed cleanly. Full tool PDF report integrated below." 
        : `Execution error: ${r.error}`
    ]);

    renderTable(doc, {
      head: summaryHeaders,
      body: summaryData,
      startY: y,
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 45, fontStyle: "bold" },
        2: { cellWidth: 25 },
        3: { cellWidth: 30 },
        4: { cellWidth: 72 }
      }
    });

    // ── Stacked Pages: Integrated Tool PDF Generators ────────────────────────
    for (let index = 0; index < scanResults.length; index++) {
      const res = scanResults[index];
      
      if (res.status === "completed" && res.data) {
        try {
          if (res.route === "/api/subdomainEnumeration" || res.name === "Subdomain Scanner") {
            const subs = Array.isArray(res.data) ? res.data : (res.data?.subdomains || []);
            await generateSubdomainPDF(subs, res.data?.stats || {}, domain, null, doc);
          } else if (res.route === "/api/whoisLookup" || res.name === "Whois Domain Lookup") {
            await generateWhoisPDF(res.data, domain, doc);
          } else if (res.route === "/api/meta-tag" || res.name === "Meta Tag Analyzer") {
            await generateMetaPDF(res.data, domain, doc);
          } else if (res.route === "/api/fingerPrint" || res.name === "Technology Fingerprinter") {
            const techs = Array.isArray(res.data) ? res.data : (res.data?.results || res.data?.technologies || []);
            await generateFingerprintPDF(techs, res.data?.meta || {}, domain, null, doc);
          } else if (res.route === "/api/webrecon" || res.name === "Website Recon") {
            await generateWebsiteReconPDF(res.data, null, doc);
          } else {
            renderToolFormattedPDFPage(doc, res, index, scanResults.length, domain);
          }
        } catch (err) {
          console.error(`Error generating PDF for ${res.name}:`, err);
          renderToolFormattedPDFPage(doc, res, index, scanResults.length, domain);
        }
      } else {
        renderToolFormattedPDFPage(doc, res, index, scanResults.length, domain);
      }
    }

    // Apply master header / footer decorator
    applyHeaderFooterDecorator(doc, `${userPlan} Integrated Security Audit`);

    doc.save(`Nexcore_${userPlan}_Integrated_Security_Report_${Date.now()}.pdf`);
  };

  // ── Paywall Block Screen ──────────────────────────────────────────────────
  if (!loadingCurrent && !hasAccess) {
    const requiredPlan = requestedTier.charAt(0).toUpperCase() + requestedTier.slice(1);
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white px-4">
        <div className="max-w-md w-full bg-white/[0.02] border border-white/10 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-[var(--gold)]/10 border border-[var(--gold)]/20 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="h-8 w-8 text-[var(--gold)]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-mono font-bold uppercase tracking-wider text-white">Access Locked</h2>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              The <span className="text-[var(--gold)] font-bold">{requiredPlan}</span> consolidated report requires a {requiredPlan} subscription or higher. 
              Your current plan: <span className="text-white font-bold">{userPlan}</span>.
            </p>
          </div>
          <div className="border-t border-white/5 pt-4 flex flex-col gap-3">
            <button 
              onClick={() => router.push("/subscription")}
              className="w-full bg-[var(--gold)] hover:bg-[var(--gold)]/90 text-black py-3 rounded-lg font-mono font-bold text-xs uppercase transition duration-200 cursor-pointer shadow-lg hover:scale-[1.01] active:scale-[0.99]"
            >
              Upgrade Subscription Plan
            </button>
            <button 
              onClick={() => router.push("/tools")}
              className="w-full border border-white/10 hover:bg-white/5 text-white/80 py-3 rounded-lg font-mono text-xs uppercase transition duration-200 cursor-pointer"
            >
              Return to Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tierLabel = requestedTier.charAt(0).toUpperCase() + requestedTier.slice(1);

  return (
    <div className="tool-detail-page min-h-screen bg-[#050505] text-white">
      <div className="tool-detail-shell mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <div className="mb-8 flex items-center justify-between">
          <button 
            onClick={() => router.push("/tools")} 
            className="flex items-center gap-2 text-sm text-[var(--gold)] hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Platform Overview
          </button>
          <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-white/50 bg-white/[0.02]">
            {tierLabel} Tier Report
          </span>
        </div>

        {/* Title Header */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-mono font-bold text-white uppercase">
            CONSOLIDATED <span className="text-[var(--gold)]">{tierLabel.toUpperCase()} REPORT</span>
          </h1>
          <p className="mt-2 text-[var(--muted)] max-w-3xl text-sm leading-relaxed">
            Sequential multi-tool security engine. Runs all {dynamicToolsList.length} tools assigned to your <span className="text-white font-medium">{userPlan}</span> plan one-by-one against your target URL, handles exceptions automatically, and stacks findings into a unified PDF report.
          </p>
        </div>

        {/* ── Active Scanning Warning Banner ────────────────────────────────── */}
        {scanning && (
          <div className="mb-8 bg-amber-500/10 border border-amber-500/30 rounded-xl p-5 shadow-2xl animate-pulse">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  Multi-Tool Execution in Progress — Keep Tab Open
                </h4>
                <p className="text-xs text-white/80 leading-relaxed">
                  Tools are running sequentially for target <span className="text-amber-400 font-mono font-bold">{domain}</span>. 
                  <span className="text-white font-bold"> Please do not close, refresh, or navigate away from this browser tab</span> until all checks complete.
                </p>
                <div className="flex items-center gap-2 pt-2 text-[11px] text-white/50 font-mono">
                  <Mail className="h-3.5 w-3.5 text-amber-400/70" />
                  <span>Email notification for completed reports is planned for the upcoming release phase.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          
          {/* Scan Setup Form & Console */}
          <div className="space-y-6">
            
            {/* Form Box */}
            <div className="bg-white/[0.02] border border-white/8 rounded-xl p-6 shadow-2xl">
              <h2 className="text-lg font-mono font-semibold text-white mb-6 flex items-center gap-2">
                <Server className="h-5 w-5 text-[var(--gold)]" />
                Audit Target Configuration
              </h2>
              
              <form onSubmit={handleStartScan} className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono text-white/60 mb-2 font-semibold">Target Domain / URL</label>
                  <input 
                    type="text" 
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    disabled={scanning}
                    placeholder="e.g. example.com"
                    className="w-full bg-white/[0.03] text-white border border-white/10 rounded-lg p-3 text-sm focus:border-[var(--gold)]/50 focus:outline-none transition-all font-mono"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={scanning}
                  className="w-full bg-[var(--gold)] hover:bg-[var(--gold)]/90 text-black rounded-lg font-mono font-bold text-xs uppercase py-3.5 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  {scanning ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Executing Sequential Tool Audit...
                    </>
                  ) : (
                    <>
                      <Terminal className="h-4 w-4" />
                      Generate Consolidated Report
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Console Log Component */}
            {(scanning || consoleLogs.length > 0) && (
              <div className="border border-white/10 bg-black/80 rounded-xl p-6 font-mono text-xs text-white/80 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="flex items-center gap-2 font-bold text-[var(--gold)]">
                    <Terminal className="h-4 w-4" />
                    CONSOLIDATED AUDIT CONSOLE
                  </span>
                  {scanning && <span className="text-[var(--gold)] animate-pulse flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> PIPELINE ACTIVE</span>}
                </div>
                
                <div 
                  ref={logContainerRef}
                  className="h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar text-white/70"
                >
                  {consoleLogs.map((log, index) => {
                    let color = "text-white/60";
                    if (log.includes("[SUCCESS]")) color = "text-green-400 font-semibold";
                    if (log.includes("[WARNING]")) color = "text-amber-400 font-semibold";
                    if (log.includes("[ERROR]")) color = "text-red-400 font-bold";
                    if (log.includes("[STAGE")) color = "text-[var(--gold)] font-semibold";
                    if (log.includes("[NOTICE]")) color = "text-blue-400";
                    
                    return (
                      <div key={index} className={`leading-relaxed ${color}`}>
                        {log}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar — Dynamic Tools Checklist */}
          <div className="space-y-6">
            <div className="border border-white/10 bg-white/[0.01] rounded-xl p-6 space-y-5">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white border-b border-white/10 pb-3">
                {userPlan} Plan Tools Checklist
              </h3>
              <div className="space-y-3.5">
                {loadingFeatures ? (
                  <div className="space-y-2.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-4 bg-white/5 animate-pulse rounded w-full" />
                    ))}
                  </div>
                ) : toolsStatus.length === 0 ? (
                  <div className="text-xs text-white/30 italic">No tools assigned yet.</div>
                ) : (
                  toolsStatus.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <div key={tool.id} className="flex items-center justify-between p-2 bg-white/[0.01] rounded-lg border border-white/[0.03]">
                        <div className="flex items-center gap-3">
                          <Icon className={`h-4 w-4 ${
                            tool.status === "completed" 
                              ? "text-green-400" 
                              : tool.status === "failed"
                                ? "text-red-400"
                                : tool.status === "running" 
                                  ? "text-[var(--gold)] animate-pulse" 
                                  : "text-white/30"
                          }`} />
                          <span className={`text-xs ${
                            tool.status === "completed" 
                              ? "text-white" 
                              : tool.status === "failed"
                                ? "text-red-300"
                                : tool.status === "running" 
                                  ? "text-[var(--gold)] font-medium" 
                                  : "text-white/50"
                          }`}>
                            {tool.name}
                          </span>
                        </div>
                        <span className={`font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded ${
                          tool.status === "completed" 
                            ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                            : tool.status === "failed"
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : tool.status === "running" 
                                ? "bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/20" 
                                : "bg-white/5 text-white/30 border border-white/5"
                        }`}>
                          {tool.status}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Consolidated Outputs Section (When Report Ready) */}
        {reportReady && (
          <div className="mt-12 space-y-8 animate-fadeIn">
            
            {/* Download Summary Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border border-[var(--gold)]/30 bg-[linear-gradient(90deg,rgba(212,166,74,0.06),rgba(0,0,0,0))] p-6 rounded-xl gap-4">
              <div>
                <h3 className="text-lg font-mono font-bold text-white">Consolidated Integrated Report Ready</h3>
                <p className="text-xs text-[var(--muted)]">Review stacked findings below or download client-ready multi-page PDF.</p>
              </div>
              <button 
                onClick={handleDownloadPDF}
                className="bg-[var(--gold)] hover:bg-[var(--gold)]/90 text-black font-mono font-bold text-xs uppercase px-6 py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Download className="h-4 w-4" />
                Download Stacked PDF Report
              </button>
            </div>

            {/* Results Grid Tab system */}
            <div className="flex gap-2 border-b border-white/10 pb-px overflow-x-auto">
              <button 
                onClick={() => setActiveTab("summary")} 
                className={`px-4 py-2 font-mono text-xs uppercase tracking-wider border-b-2 transition cursor-pointer whitespace-nowrap ${
                  activeTab === "summary" ? "border-[var(--gold)] text-white" : "border-transparent text-white/50 hover:text-white"
                }`}
              >
                Summary Dashboard
              </button>
              <button 
                onClick={() => setActiveTab("tools")} 
                className={`px-4 py-2 font-mono text-xs uppercase tracking-wider border-b-2 transition cursor-pointer whitespace-nowrap ${
                  activeTab === "tools" ? "border-[var(--gold)] text-white" : "border-transparent text-white/50 hover:text-white"
                }`}
              >
                Stacked Tool Results ({scanResults.length} tools)
              </button>
            </div>

            {/* Tab content panel */}
            <div className="grid gap-6">
              
              {activeTab === "summary" && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <div className="bg-white/[0.01] border border-white/8 rounded-xl p-5 space-y-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--gold)] font-bold">Plan Tiers</span>
                    <h4 className="text-xl font-bold font-mono">{userPlan} Tier</h4>
                    <p className="text-xs text-[var(--muted)]">{scanResults.length} tools executed sequentially.</p>
                  </div>
                  <div className="bg-white/[0.01] border border-white/8 rounded-xl p-5 space-y-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-green-400 font-bold">Pass / Fail</span>
                    <h4 className="text-xl font-bold font-mono">
                      {scanResults.filter(r => r.status === "completed").length} Passed / {scanResults.filter(r => r.status === "failed").length} Failed
                    </h4>
                    <p className="text-xs text-[var(--muted)]">Tool modules executed with automated error resilience.</p>
                  </div>
                  <div className="bg-white/[0.01] border border-white/8 rounded-xl p-5 space-y-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">Target</span>
                    <h4 className="text-xl font-bold font-mono break-all">{domain}</h4>
                    <p className="text-xs text-[var(--muted)]">Target host audited during this run.</p>
                  </div>
                </div>
              )}

              {activeTab === "tools" && (
                <div className="space-y-6">
                  {scanResults.map((res, idx) => {
                    const Icon = TOOL_ICON_MAP[res.name] || Wrench;
                    return (
                      <div key={idx} className="bg-white/[0.01] border border-white/8 rounded-xl p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5 text-[var(--gold)]" />
                            <h4 className="font-mono font-bold text-white">{res.name} — Stacked Result</h4>
                          </div>
                          <span className={`font-mono text-[10px] uppercase px-2.5 py-0.5 rounded ${
                            res.status === "completed" 
                              ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}>
                            {res.status}
                          </span>
                        </div>

                        {res.status === "completed" ? (
                          <div className="text-xs font-mono text-green-400 border border-green-500/20 bg-green-500/5 p-3 rounded">
                            <div className="flex items-center gap-2 font-semibold mb-2">
                              <CheckCircle2 className="h-4 w-4 text-green-400" />
                              {res.name} completed successfully at {res.timestamp}
                            </div>
                            <pre className="text-[11px] text-white/70 overflow-x-auto whitespace-pre-wrap max-h-40 p-2 bg-black/40 rounded border border-white/5">
                              {JSON.stringify(res.data, null, 2)}
                            </pre>
                          </div>
                        ) : (
                          <div className="text-xs font-mono text-red-400 border border-red-500/20 bg-red-500/5 p-3 rounded flex items-start gap-2">
                            <XCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="font-semibold">Tool Execution Failed</div>
                              <div className="text-white/70 mt-1">{res.error}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function ReportGeneratorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white font-mono text-xs">
        <Loader2 className="h-5 w-5 animate-spin text-[var(--gold)] mr-2" />
        Loading Report Generator...
      </div>
    }>
      <ReportGeneratorContent />
    </Suspense>
  );
}
