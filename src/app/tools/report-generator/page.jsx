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
import { generateBruteForcePDF } from "@/components/bruteForce/generateBruteForcePDF";
import { generateWordPressPDF } from "@/components/wordpressForm/generateWordPressPDF";
import { generateClickjackingPDF } from "@/components/clickjackingTester/generateClickjackingPDF";
import { generateVulnScannerPDF } from "@/components/vuln-scanner/generateVulnScannerPDF";
import { generateXssTesterPDF } from "@/components/xssTester/generateXssTesterPDF";
import { generateOpenRedirectPDF } from "@/components/openRedirectTester/generateOpenRedirectPDF";
import { generateSQLiPDF } from "@/components/nexpose/generateSQLiPDF";
import { generateHttpsPDF } from "@/components/httpsCheckerForm/generateHttpsPDF";
import { generateWafPDF } from "@/components/waf_form/generateWafPDF";
import { generateMdrPDF } from "@/components/mdr/generateMdrPDF";
import { generateKeywordPDF } from "@/components/KeywordForm/generateKeywordPDF";
import { generateSitemapPDF } from "@/components/sitemapForm/generateSitemapPDF";
import { generateLinkDetectorPDF } from "@/components/linkdetector/generateLinkDetectorPDF";
import { generateIpPDF } from "@/components/ip/generateIpPDF";
import { generateSeoScoreAnalyzerPDF } from "@/components/seoanalyzer/generateSeoScoreAnalyzerPDF";
import { generateWebsiteOptimizationPDF } from "@/components/websiteoptimization/generateWebsiteOptimizationPDF";
import { generateAdvancedDynamicScanPDF } from "@/components/advancedDynamicScan/generateAdvancedDynamicScanPDF";
import { generateBasicNetworkScanPDF } from "@/components/basicNetworkScan/generateBasicNetworkScanPDF";
import { generateWebAppTestPDF } from "@/components/webAppAudit/generateWebAppTestPDF";

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

// ── Canonical 25 URL-Compatible Security Tools for Integrated Reports ────────
const URL_TOOL_LIST = [
  { name: "Brute Force Scanner", route: "/api/bruteForce" },
  { name: "WordPress Scanner", route: "/api/wordpressForm" },
  { name: "Clickjacking Tester", route: "/api/clickjackingTester" },
  { name: "Website Recon", route: "/api/webrecon" },
  { name: "Vulnerability Scanner", route: "/api/vuln-scanner" },
  { name: "Whois Domain Lookup", route: "/api/whoisLookup" },
  { name: "Subdomain Scanner", route: "/api/subdomainEnumeration" },
  { name: "XSS Tester", route: "/api/xssTester" },
  { name: "Open Redirect Tester", route: "/api/openRedirectTester" },
  { name: "Technology Fingerprinter", route: "/api/fingerPrint" },
  { name: "SQLi Scanner", route: "/api/nexpose-scan" },
  { name: "HTTPS Security Checker", route: "/api/httpsCheckerForm" },
  { name: "WAF Scanner", route: "/api/firewallDashboard" },
  { name: "MDR Monitor", route: "/api/mdr-monitor" },
  { name: "Keyword Density Checker", route: "/api/keyword-checker" },
  { name: "Meta Tag Analyzer", route: "/api/meta-tag" },
  { name: "Sitemap Generator", route: "/api/sitemapForm" },
  { name: "Link Detector", route: "/api/check-link" },
  { name: "IP Address Info Finder", route: "/api/ip-address-info-finder" },
  { name: "SEO Score Analyzer Tool", route: "/api/seo-score-analyzer-tool" },
  { name: "Keyword Generator", route: "/api/KeywordGenerator" },
  { name: "Website Optimization Tool", route: "/api/website-optimization-tool" },
  { name: "Advanced Dynamic Scan", route: "/api/advanced-dynamic-scan" },
  { name: "Basic Network Scanning", route: "/api/basic-network-scan" },
  { name: "Web Application Test", route: "/api/web-app-audit" }
];

const isSameTool = (t1, t2) => {
  if (!t1 || !t2) return false;
  const r1 = (t1.route || "").toLowerCase().replace(/^\/api\//, "");
  const r2 = (t2.route || "").toLowerCase().replace(/^\/api\//, "");
  if (r1 && r2 && r1 === r2) return true;
  const n1 = (t1.name || "").trim().toLowerCase();
  const n2 = (t2.name || "").trim().toLowerCase();
  if (n1 && n2 && n1 === n2) return true;
  return false;
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
  const [domain, setDomain] = useState("");
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
      console.warn("Unable to fetch current subscription:", err.message || err);
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
      console.warn("Unable to fetch plan features:", err.message || err);
    } finally {
      setLoadingFeatures(false);
    }
  };

  useEffect(() => {
    fetchCurrentSub();
    fetchPlanFeatures();
  }, []);

  const userPlan = currentSub?.plan || "Free";
  const tierLabel = useMemo(() => {
    return requestedTier.charAt(0).toUpperCase() + requestedTier.slice(1).toLowerCase();
  }, [requestedTier]);

  // Helper to get raw tools assigned to a specific plan from planFeatures
  const getToolsForPlan = useCallback((planName) => {
    if (!planFeatures || typeof planFeatures !== "object") return [];
    const normalized = (planName || "Free").trim().toLowerCase();
    const matchKey = Object.keys(planFeatures).find(
      (k) => k.toLowerCase() === normalized
    );
    const tools = matchKey ? planFeatures[matchKey] : planFeatures[planName];
    if (Array.isArray(tools) && tools.length > 0) {
      return tools;
    }
    // If plan is Enterprise and empty in DB (full bypass), default to URL_TOOL_LIST
    if (normalized === "enterprise") {
      return URL_TOOL_LIST;
    }
    return Array.isArray(tools) ? tools : [];
  }, [planFeatures]);

  // Derive tools for the clicked report tier intersected with user's plan access
  const currentPlanTools = useMemo(() => {
    // 1. Get raw tools configured for the Clicked Report's tier (e.g. Free, Premium, Pro, Enterprise)
    const clickedTierRawTools = getToolsForPlan(tierLabel);

    // 2. Get user's plan and permissions
    const isUserEnterprise = (userPlan || "").trim().toLowerCase() === "enterprise";
    const userPlanRawTools = getToolsForPlan(userPlan);

    // 3. Filter: tool must be in Clicked Report tier AND user must have access to it in their plan AND it must be a URL report tool
    const filtered = clickedTierRawTools.filter((tool) => {
      // Exclude non-URL / code / token / file tools
      if (EXCLUDED_TOOL_NAMES_AND_ROUTES.has(tool.name) || EXCLUDED_TOOL_NAMES_AND_ROUTES.has(tool.route)) {
        return false;
      }

      // Check if it belongs to the 25 URL tools
      const isUrlReportTool = Boolean(TOOL_ENDPOINT_MAP[tool.route]) || URL_TOOL_LIST.some((u) => isSameTool(u, tool));
      if (!isUrlReportTool) {
        return false;
      }

      // Check if user's plan includes this tool (Enterprise has full access; otherwise check user's plan tools)
      const userHasAccess = isUserEnterprise || userPlanRawTools.some((uTool) => isSameTool(uTool, tool));
      return userHasAccess;
    });

    // Map each tool to its canonical name & route
    return filtered.map((tool) => {
      const canonical = URL_TOOL_LIST.find((u) => isSameTool(u, tool));
      return {
        name: canonical ? canonical.name : tool.name,
        route: canonical ? canonical.route : tool.route
      };
    });
  }, [planFeatures, userPlan, tierLabel, getToolsForPlan]);

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

  // ── Helper to upload PDF to Backend History ────────────────────────────────
  const uploadPdfToHistory = async (toolName, fileName, arrayBuffer, targetDomain, details = {}, authToken = null) => {
    try {
      const activeToken = authToken || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
      if (!activeToken) {
        console.warn(`[History Upload] Skipped: No auth token available for ${fileName}`);
        return;
      }

      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);

      const res = await fetch(`${API_BASE}/history/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeToken}`
        },
        body: JSON.stringify({
          toolName,
          target: targetDomain,
          fileName,
          fileBufferBase64: base64,
          details
        })
      });

      if (res.ok) {
        const resJson = await res.json();
        console.log(`[History Upload] Saved ${fileName} to history (ID: ${resJson.historyId})`);
      } else {
        const errText = await res.text();
        console.error(`[History Upload] HTTP ${res.status} error for ${fileName}:`, errText);
      }
    } catch (err) {
      console.error(`Failed to upload ${fileName} to history:`, err);
    }
  };

  // ── Helper to run individual tool PDF generator and capture buffer ─────────
  const generateToolPdfBuffer = async (tool, resData, cleanHost) => {
    let capturedBuffer = null;

    // Save original jsPDF save functions
    const _apiSave = jsPDF.API?.save;
    const _protoSave = jsPDF.prototype?.save;

    const interceptSave = function (filename) {
      try {
        capturedBuffer = this.output("arraybuffer");
      } catch (err) {
        console.error("Capture save error:", err);
      }
      return this; // Intercept & return doc instance; DO NOT trigger browser download!
    };

    if (jsPDF.API) jsPDF.API.save = interceptSave;
    if (jsPDF.prototype) jsPDF.prototype.save = interceptSave;

    const dummyProgress = () => {};

    try {
      let ret = null;
      const name = tool.name;
      const route = tool.route;

      if (route === "/api/subdomainEnumeration" || name === "Subdomain Scanner") {
        const subs = Array.isArray(resData) ? resData : (resData?.subdomains || []);
        ret = await generateSubdomainPDF(subs, resData?.stats || {}, cleanHost, dummyProgress, null);
      } else if (route === "/api/whoisLookup" || name === "Whois Domain Lookup") {
        ret = await generateWhoisPDF(resData, cleanHost, null);
      } else if (route === "/api/meta-tag" || name === "Meta Tag Analyzer") {
        ret = await generateMetaPDF(resData, cleanHost, null);
      } else if (route === "/api/fingerPrint" || name === "Technology Fingerprinter") {
        const techs = Array.isArray(resData) ? resData : (resData?.results || resData?.technologies || []);
        ret = await generateFingerprintPDF(techs, resData?.meta || {}, cleanHost, dummyProgress, null);
      } else if (route === "/api/webrecon" || name === "Website Recon") {
        ret = await generateWebsiteReconPDF(resData, dummyProgress, null);
      } else if (route === "/api/bruteForce" || name === "Brute Force Scanner") {
        const items = Array.isArray(resData) ? resData : (resData?.results || []);
        ret = await generateBruteForcePDF(items, resData?.meta || null, cleanHost);
      } else if (route === "/api/wordpressForm" || name === "WordPress Scanner") {
        ret = await generateWordPressPDF(resData, cleanHost);
      } else if (route === "/api/clickjackingTester" || name === "Clickjacking Tester") {
        ret = await generateClickjackingPDF(resData, dummyProgress);
      } else if (route === "/api/vuln-scanner" || name === "Vulnerability Scanner") {
        ret = await generateVulnScannerPDF(resData, dummyProgress, null);
      } else if (route === "/api/xssTester" || name === "XSS Tester") {
        ret = await generateXssTesterPDF(resData, cleanHost);
      } else if (route === "/api/openRedirectTester" || name === "Open Redirect Tester") {
        ret = await generateOpenRedirectPDF(resData, dummyProgress);
      } else if (route === "/api/nexpose-scan" || name === "SQLi Scanner") {
        ret = await generateSQLiPDF(resData);
      } else if (route === "/api/httpsCheckerForm" || name === "HTTPS Security Checker") {
        ret = await generateHttpsPDF(resData, dummyProgress);
      } else if (route === "/api/firewallDashboard" || name === "WAF Scanner") {
        ret = await generateWafPDF(resData, dummyProgress);
      } else if (route === "/api/mdr-monitor" || name === "MDR Monitor") {
        ret = await generateMdrPDF(resData, cleanHost, dummyProgress);
      } else if (route === "/api/keyword-checker" || name === "Keyword Density Checker") {
        ret = await generateKeywordPDF(resData, cleanHost);
      } else if (route === "/api/KeywordGenerator" || name === "Keyword Generator") {
        ret = await generateKeywordPDF(resData, cleanHost);
      } else if (route === "/api/sitemapForm" || name === "Sitemap Generator") {
        ret = await generateSitemapPDF(resData, cleanHost, 3);
      } else if (route === "/api/check-link" || name === "Link Detector") {
        ret = await generateLinkDetectorPDF(resData, dummyProgress);
      } else if (route === "/api/ip-address-info-finder" || name === "IP Address Info Finder") {
        ret = await generateIpPDF(resData);
      } else if (route === "/api/seo-score-analyzer-tool" || name === "SEO Score Analyzer Tool") {
        ret = await generateSeoScoreAnalyzerPDF(resData, dummyProgress);
      } else if (route === "/api/website-optimization-tool" || name === "Website Optimization Tool") {
        ret = await generateWebsiteOptimizationPDF(resData, dummyProgress);
      } else if (route === "/api/advanced-dynamic-scan" || name === "Advanced Dynamic Scan") {
        const dynamicResults = Array.isArray(resData?.results) ? resData.results : (Array.isArray(resData?.data) ? resData.data : (Array.isArray(resData) ? resData : []));
        ret = await generateAdvancedDynamicScanPDF(dynamicResults, cleanHost, resData?.riskScore || 0, resData?.urlsCrawled || [], resData?.summary || "");
      } else if (route === "/api/basic-network-scan" || name === "Basic Network Scanning") {
        ret = await generateBasicNetworkScanPDF(resData, cleanHost);
      } else if (route === "/api/web-app-audit" || name === "Web Application Test") {
        ret = await generateWebAppTestPDF(resData);
      }

      if (!capturedBuffer && ret && typeof ret.output === "function") {
        capturedBuffer = ret.output("arraybuffer");
      }
    } catch (err) {
      console.error(`Error building PDF buffer for ${tool.name}:`, err);
    } finally {
      if (jsPDF.API && _apiSave) jsPDF.API.save = _apiSave;
      if (jsPDF.prototype && _protoSave) jsPDF.prototype.save = _protoSave;
    }

    return capturedBuffer;
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

    appendLog(`[INFO] Starting Multi-Tool Security Audit for ${tierLabel.toUpperCase()} Tier Report...`);
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
              Authorization: `Bearer ${token}`,
              "X-Skip-History-Middleware": "true"
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
          appendLog(`[SUCCESS] ${tool.name} finished scan.`);

          // Generate styled tool PDF report buffer and save to history BEFORE marking tool as completed
          appendLog(`[PDF] Generating styled PDF report for ${tool.name}...`);
          const toolPdfBuf = await generateToolPdfBuffer(tool, resData, cleanHost);

          if (toolPdfBuf) {
            const safeName = `${tool.name.replace(/[^a-zA-Z0-9_-]/g, "_")}_Report.pdf`;
            await uploadPdfToHistory(tool.name, safeName, toolPdfBuf, cleanHost, { status: "completed" }, token);
            appendLog(`[HISTORY] Styled PDF report for ${tool.name} saved to history.`);
          } else {
            appendLog(`[HISTORY] Notice: PDF generator returned no buffer for ${tool.name}.`);
          }

          const resultItem = {
            name: tool.name,
            route: tool.route,
            status: "completed",
            data: resData,
            pdfBuffer: toolPdfBuf,
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

      const passed = accumulatedResults.filter(r => r.status === "completed").length;
      const failed = accumulatedResults.filter(r => r.status === "failed").length;

      appendLog(`[INFO] Consolidated Multi-Tool Pipeline Completed.`);
      appendLog(`[SUMMARY] ${passed} tool(s) completed successfully, ${failed} failed.`);

      // ── Build Consolidated Integrated PDF ───────────────────────────────────
      appendLog(`[PDF] Compiling Consolidated Integrated Security Report PDF...`);
      try {
        const { PDFDocument } = await import("pdf-lib");
        const summaryDoc = new jsPDF("p", "mm", "a4");

        // Cover Page
        summaryDoc.setFillColor(...C.bluePrimary);
        summaryDoc.rect(0, 0, 210, 3.5, "F");

        summaryDoc.setFont("helvetica", "bold");
        summaryDoc.setFontSize(22);
        summaryDoc.setTextColor(...C.bluePrimary);
        summaryDoc.text("NEXCORE ALLIANCE", 105, 28, { align: "center" });

        summaryDoc.setFont("helvetica", "italic");
        summaryDoc.setFontSize(10);
        summaryDoc.text("AI-Powered Cybersecurity & Information Security Solutions", 105, 34, { align: "center" });

        summaryDoc.setDrawColor(...C.bluePrimary);
        summaryDoc.setLineWidth(0.4);
        summaryDoc.line(14, 38, 196, 38);

        summaryDoc.setFont("helvetica", "bold");
        summaryDoc.setFontSize(15);
        summaryDoc.setTextColor(...C.bluePrimary);
        summaryDoc.text(`CONSOLIDATED ${tierLabel.toUpperCase()} INTEGRATED SECURITY REPORT`, 105, 50, { align: "center" });

        summaryDoc.line(14, 55, 196, 55);

        const { employeeName, employeeMail } = getAuditorInfo();
        const now = new Date();
        const scanDate = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
        const scanTime = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

        renderTable(summaryDoc, {
          startY: 62,
          head: [],
          body: [
            ["Assessment Performed by", employeeMail],
            ["Auditor Name",            employeeName],
            ["Auditor Mail ID",         employeeMail],
            ["Target Domain / Host",    cleanHost],
            ["Target URL",              targetUrl],
            ["Subscription Plan",       userPlan],
            ["Report Tier",             `${tierLabel} Tier Report`],
            ["Assessment Date",         scanDate],
            ["Assessment Time",         scanTime],
            ["Total Tools Assessed",    `${accumulatedResults.length} Tools`],
            ["Successful Assessments",  `${passed} Passed`],
            ["Failed Assessments",      `${failed} Failed`],
            ["Report Classification",   "Confidential"],
            ["Pipeline Status",         "Completed"]
          ],
          columnStyles: {
            0: { fontStyle: "bold", cellWidth: 55, fillColor: [245, 245, 245] },
            1: { cellWidth: 127 }
          }
        });

        applyHeaderFooterDecorator(summaryDoc, `Consolidated ${tierLabel} Integrated Security Report`);

        // Index / Table of Contents Page
        summaryDoc.addPage();
        let indexY = drawSectionHeader(summaryDoc, "REPORT INDEX & TOOL DIRECTORY", 20);

        const indexHeaders = [["Index", "Tool Name", "Category / Focus Area", "Audit Result"]];
        const indexData = accumulatedResults.map((r, idx) => [
          `Section ${idx + 1}`,
          r.name,
          r.route || "Security Audit",
          r.status === "completed" ? "PASSED (Integrated)" : "FAILED (Skipped)"
        ]);

        renderTable(summaryDoc, {
          head: indexHeaders,
          body: indexData,
          startY: indexY,
          columnStyles: {
            0: { cellWidth: 25, fontStyle: "bold" },
            1: { cellWidth: 55, fontStyle: "bold" },
            2: { cellWidth: 65 },
            3: { cellWidth: 37 }
          }
        });

        const integratedBuffers = [summaryDoc.output("arraybuffer")];
        for (const res of accumulatedResults) {
          if (res.status === "completed" && res.pdfBuffer) {
            integratedBuffers.push(res.pdfBuffer);
          }
        }

        const mergedPdf = await PDFDocument.create();
        for (const buf of integratedBuffers) {
          try {
            const donorPdf = await PDFDocument.load(buf);
            const copiedPages = await mergedPdf.copyPages(donorPdf, donorPdf.getPageIndices());
            copiedPages.forEach(p => mergedPdf.addPage(p));
          } catch (mergeErr) {
            console.error("Error merging PDF donor buffer:", mergeErr);
          }
        }

        const mergedBytes = await mergedPdf.save();
        await uploadPdfToHistory(
          `${tierLabel} Integrated Security Report`,
          `Integrated_${tierLabel}_Security_Report_${cleanHost}.pdf`,
          mergedBytes.buffer,
          cleanHost,
          { status: "completed", reportTier: tierLabel, userPlan, totalTools: accumulatedResults.length, passed, failed },
          token
        );
        appendLog(`[HISTORY] Consolidated ${tierLabel} Integrated Security Report saved to history.`);

      } catch (integratedErr) {
        console.error("Failed compiling Integrated PDF:", integratedErr);
      }

      appendLog(`[SUCCESS] Integrated Report ready. You may now download the stacked PDF report.`);

      setScanResults(accumulatedResults);
      setScanning(false);
      setReportReady(true);
    });
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

    try {
      const { PDFDocument } = await import("pdf-lib");
      const summaryDoc = new jsPDF("p", "mm", "a4");
      const passedCount = scanResults.filter(r => r.status === "completed").length;
      const failedCount = scanResults.filter(r => r.status === "failed").length;
      const { employeeName, employeeMail } = getAuditorInfo();
      const cleanHost = domain.replace(/^https?:\/\//i, "").replace(/\/.*$/, "");

      // ── Cover Page & Executive Summary ──────────────────────────────────────
      summaryDoc.setFillColor(...C.bluePrimary);
      summaryDoc.rect(0, 0, 210, 3.5, "F");

      summaryDoc.setFont("helvetica", "bold");
      summaryDoc.setFontSize(22);
      summaryDoc.setTextColor(...C.bluePrimary);
      summaryDoc.text("NEXCORE ALLIANCE", 105, 28, { align: "center" });

      summaryDoc.setFont("helvetica", "italic");
      summaryDoc.setFontSize(10);
      summaryDoc.text("AI-Powered Cybersecurity & Information Security Solutions", 105, 34, { align: "center" });

      summaryDoc.setDrawColor(...C.bluePrimary);
      summaryDoc.setLineWidth(0.4);
      summaryDoc.line(14, 38, 196, 38);

      summaryDoc.setFont("helvetica", "bold");
      summaryDoc.setFontSize(14);
      summaryDoc.setTextColor(...C.bluePrimary);
      summaryDoc.text(`CONSOLIDATED ${tierLabel.toUpperCase()} TIER MULTI-TOOL AUDIT REPORT`, 105, 50, { align: "center" });
      summaryDoc.line(14, 56, 196, 56);

      renderTable(summaryDoc, {
        startY: 62,
        head: [],
        body: [
          ["Assessment Performed by", employeeMail],
          ["Employee Name",           employeeName],
          ["Target Domain / Host",    cleanHost || domain],
          ["Subscription Tier",       userPlan],
          ["Report Tier",             `${tierLabel} Tier Report`],
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

      let y = drawSectionHeader(summaryDoc, "Master Executive Audit Summary Table", summaryDoc.lastAutoTable.finalY + 10);

      const summaryHeaders = [["#", "Tool Name", "Status", "Timestamp", "Audit Summary Finding"]];
      const summaryData = scanResults.map((r, idx) => [
        String(idx + 1),
        r.name,
        r.status.toUpperCase(),
        r.timestamp,
        r.status === "completed" 
          ? "Scan completed cleanly. PDF report saved to history and integrated below." 
          : `Execution error: ${r.error}`
      ]);

      renderTable(summaryDoc, {
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

      // Add Table of Contents / Index page
      summaryDoc.addPage();
      let indexY = drawSectionHeader(summaryDoc, "REPORT INDEX & TOOL DIRECTORY", 20);

      const indexHeaders = [["Index", "Tool Name", "Category / Focus Area", "Audit Result"]];
      const indexData = scanResults.map((r, idx) => [
        `Section ${idx + 1}`,
        r.name,
        r.route || "Security Audit",
        r.status === "completed" ? "PASSED (Integrated)" : "FAILED (Skipped)"
      ]);

      renderTable(summaryDoc, {
        head: indexHeaders,
        body: indexData,
        startY: indexY,
        columnStyles: {
          0: { cellWidth: 25, fontStyle: "bold" },
          1: { cellWidth: 55, fontStyle: "bold" },
          2: { cellWidth: 65 },
          3: { cellWidth: 37 }
        }
      });

      const integratedBuffers = [summaryDoc.output("arraybuffer")];
      for (const res of scanResults) {
        if (res.status === "completed" && res.pdfBuffer) {
          integratedBuffers.push(res.pdfBuffer);
        }
      }

      const mergedPdf = await PDFDocument.create();
      for (const buf of integratedBuffers) {
        try {
          const donorPdf = await PDFDocument.load(buf);
          const copiedPages = await mergedPdf.copyPages(donorPdf, donorPdf.getPageIndices());
          copiedPages.forEach(p => mergedPdf.addPage(p));
        } catch (mergeErr) {
          console.error("Error merging PDF donor buffer:", mergeErr);
        }
      }

      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Nexcore_${tierLabel}_Integrated_Security_Report_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Failed to download integrated PDF:", err);
    }
  };

  // ── Paywall Block Screen ──────────────────────────────────────────────────
  if (!loadingCurrent && !hasAccess) {
    const requiredPlan = tierLabel;
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
            Sequential multi-tool security engine. Runs all {dynamicToolsList.length} tools assigned to the {tierLabel} tier (accessible under your <span className="text-white font-medium">{userPlan}</span> plan) one-by-one against your target URL, handles exceptions automatically, and stacks findings into a unified PDF report.
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
                {tierLabel} Report Tools Checklist
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
                className="bg-white hover:bg-zinc-200 text-black border border-white font-mono font-bold text-xs uppercase px-6 py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.3)]"
              >
                <Download className="h-4 w-4 text-black stroke-[2.5]" />
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
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--gold)] font-bold">Report Tier</span>
                    <h4 className="text-xl font-bold font-mono">{tierLabel} Tier</h4>
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
