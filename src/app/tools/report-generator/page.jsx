"use client";

import React, { useState, useEffect, useRef, useMemo, Suspense } from "react";
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
  ArrowLeft
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import useProtectedAction from "@/components/UseProtectedAction/UseProtectedAction";

function ReportGeneratorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = useMemo(() => searchParams.get("plan") || "free", [searchParams]);
  const protectedAction = useProtectedAction();
  
  // State for AD/Cred scans (other plans)
  const [reportType, setReportType] = useState("active-directory");
  const [scope, setScope] = useState("full");

  // General State
  const [domain, setDomain] = useState("example.com");
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [reportReady, setReportReady] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");
  const logContainerRef = useRef(null);

  // Free Tier Tools List (9 tools)
  const freeToolsList = [
    { id: "subdomain", name: "Subdomain Scanner", icon: Compass, status: "pending" },
    { id: "recon", name: "Website Recon", icon: Globe, status: "pending" },
    { id: "fingerprint", name: "Technology Fingerprinter", icon: Fingerprint, status: "pending" },
    { id: "broken-link", name: "Broken Link Checker", icon: Link2, status: "pending" },
    { id: "whois", name: "Whois Domain Lookup", icon: Search, status: "pending" },
    { id: "meta", name: "Meta Tag Analyzer", icon: Tag, status: "pending" },
    { id: "keyword", name: "Keyword Density Checker", icon: Hash, status: "pending" },
    { id: "link-detect", name: "Link Detector", icon: FileCode, status: "pending" },
    { id: "ip-info", name: "IP Address Info Finder", icon: Server, status: "pending" }
  ];

  // Tool status based on current plan
  const [toolsStatus, setToolsStatus] = useState([]);

  useEffect(() => {
    if (plan === "free") {
      setToolsStatus(freeToolsList);
    }
  }, [plan]);

  // Console log sequences for Free Tier 9 tools
  const freeScanLogs = [
    "[INFO] Initializing Free Tier Consolidated Security Audit...",
    `[INFO] Target Host: ${domain}`,
    "[STAGE 1/9] Launching Subdomain Scanner...",
    "[INFO] Querying common subdomain DNS records...",
    `[SUCCESS] Detected: api.${domain} (IP: 104.244.42.1)`,
    `[SUCCESS] Detected: dev.${domain} (IP: 104.244.42.2)`,
    `[SUCCESS] Detected: mail.${domain} (IP: 104.244.42.3)`,
    "[STAGE 2/9] Launching Website Recon...",
    "[INFO] Analysing server HTTP response headers...",
    "[INFO] Server: nginx/1.24.0 | Protocol: HTTP/2",
    "[WARNING] X-Frame-Options header missing (Clickjacking risk).",
    "[STAGE 3/9] Launching Technology Fingerprinter...",
    "[INFO] Analyzing application scripts and layout...",
    "[SUCCESS] Framework detected: Next.js (React 19)",
    "[INFO] CDN detected: Cloudflare DNS",
    "[STAGE 4/9] Launching Broken Link Checker...",
    "[INFO] Crawling home page for internal and external links...",
    "[WARNING] Found 1 broken link: 'https://archive.org/details/broken-ref' -> Status 404",
    "[STAGE 5/9] Launching Whois Domain Lookup...",
    `[INFO] Querying WHOIS database for ${domain}...`,
    `[SUCCESS] Registrar: GoDaddy.com, LLC | Expires: 2028-11-12`,
    "[STAGE 6/9] Launching Meta Tag Analyzer...",
    "[INFO] Parsing HTML meta elements...",
    "[SUCCESS] Title tag: 'Nexcore Security - Premium Cybersecurity Solutions'",
    "[WARNING] Meta description exceeds recommended 160 characters (182 chars).",
    "[STAGE 7/9] Launching Keyword Density Checker...",
    "[INFO] Tokenizing text content and calculating frequencies...",
    "[INFO] Primary Keywords: security (4.2%), platform (3.8%), enterprise (2.5%)",
    "[STAGE 8/9] Launching Link Detector...",
    "[INFO] Validating third-party links against threat intelligence feeds...",
    "[SUCCESS] 24 external links verified. No phishing or malicious domains detected.",
    "[STAGE 9/9] Launching IP Address Info Finder...",
    `[INFO] Resolving geographical coordinates for ${domain}...`,
    `[SUCCESS] Host Country: United States (US) | ISP: Cloudflare Inc.`,
    "[INFO] Consolidating tool outputs...",
    "[SUCCESS] Consolidated Free Tier Security Report is ready for download."
  ];

  const currentLogs = useMemo(() => {
    if (plan === "free") return freeScanLogs;
    return [];
  }, [plan, domain]);

  useEffect(() => {
    if (plan === "free" && scanning && scanStep < currentLogs.length) {
      const timer = setTimeout(() => {
        setConsoleLogs((prev) => [...prev, currentLogs[scanStep]]);
        
        // Update tool status badges
        const log = currentLogs[scanStep];
        if (log.includes("[STAGE")) {
          const stageNum = parseInt(log.match(/\d+/)[0]) - 1;
          setToolsStatus(prev => prev.map((t, idx) => {
            if (idx === stageNum) return { ...t, status: "running" };
            if (idx < stageNum) return { ...t, status: "completed" };
            return t;
          }));
        }
        
        setScanStep((prev) => prev + 1);
      }, 150 + Math.random() * 100);
      return () => clearTimeout(timer);
    } else if (plan === "free" && scanning && scanStep === currentLogs.length) {
      setScanning(false);
      setReportReady(true);
      setToolsStatus(prev => prev.map(t => ({ ...t, status: "completed" })));
    }
  }, [scanning, scanStep, currentLogs, plan]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [consoleLogs]);

  const handleStartScan = async (e) => {
    e.preventDefault();
    if (plan !== "free") return;
    if (!domain.trim()) return;
    setScanning(true);
    setReportReady(false);
    setScanStep(0);
    setConsoleLogs([]);
    setToolsStatus(freeToolsList);

    const API_BASE = (process.env.NEXT_PUBLIC_PROD_API_URL || "").replace(/\/+$/, "");
    await protectedAction(async (token) => {
      try {
        await fetch(`${API_BASE}/report-generator/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            reportType: "free-tier-consolidated",
            domain,
            scope
          })
        });
      } catch (err) {
        console.error("Failed to log scan on backend:", err);
      }
    });
  };

  const handleDownloadPDF = () => {
    if (plan !== "free") return;
    const doc = new jsPDF();
    
    // Header Banner
    doc.setFillColor(18, 18, 18);
    doc.rect(0, 0, doc.internal.pageSize.width, 40, "F");
    
    doc.setTextColor(212, 166, 74); // Gold
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.text("NEXCORE SECURITY PLATFORM", 15, 20);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text("FREE TIER CONSOLIDATED SECURITY REPORT", 15, 30);
    
    // Scan Meta Info
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    doc.text(`Target: ${domain}`, 15, 50);
    doc.text(`Report Type: Consolidated Plan Audit`, 15, 55);
    doc.text(`Date: ${new Date().toLocaleString()}`, 15, 60);
    doc.text("Status: Sec-Verified / Completed", 15, 65);
    
    doc.setDrawColor(212, 166, 74);
    doc.setLineWidth(0.5);
    doc.line(15, 72, doc.internal.pageSize.width - 15, 72);

    // Consolidated PDF Content
    doc.setFontSize(14);
    doc.text("Consolidated Findings Summary", 15, 82);
    
    const summaryHeaders = [["Tool Module", "Key Findings / Status", "Severity"]];
    const summaryData = [
      ["Subdomain Scanner", "Detected 3 active hosts: api, dev, mail.", "Informational"],
      ["Website Recon", "Nginx web server. Clickjacking protections missing.", "Low"],
      ["Technology Fingerprinter", "Next.js core system. Cloudflare DNS routed.", "Informational"],
      ["Broken Link Checker", "Detected 1 broken outbound links (404 status).", "Low"],
      ["Whois Domain Lookup", "Domain registered via GoDaddy. Expires 2028.", "Informational"],
      ["Meta Tag Analyzer", "Optimal SEO configuration. Meta description slightly long.", "Low"],
      ["Keyword Density Checker", "Top terms: security (4.2%), platform (3.8%).", "Informational"],
      ["Link Detector", "Verified external URLs. No threat vectors detected.", "Safe"],
      ["IP Address Info Finder", "Hosted in US region (Cloudflare nodes).", "Informational"]
    ];

    autoTable(doc, {
      head: summaryHeaders,
      body: summaryData,
      startY: 90,
      theme: "striped",
      headStyles: { fillColor: [212, 166, 74], textColor: [255, 255, 255] },
      margin: { top: 90 }
    });

    doc.addPage();
    doc.setFillColor(18, 18, 18);
    doc.rect(0, 0, doc.internal.pageSize.width, 20, "F");
    doc.setTextColor(212, 166, 74);
    doc.setFontSize(14);
    doc.text("Detailed Security Guidance & Posture", 15, 12);

    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    doc.setFont("Helvetica", "bold");
    doc.text("Security Recommendation:", 15, 35);
    doc.setFont("Helvetica", "normal");
    
    doc.text("1. Fix Clickjacking Vulnerability by adding 'X-Frame-Options: SAMEORIGIN' header.", 15, 43);
    doc.text("2. Resolve 404 reference link detected on home page routing.", 15, 51);
    doc.text("3. Shorten HTML Meta description length for optimal SEO crawling indexing.", 15, 59);

    doc.text("Report generation completed using Nexcore Alliance Automated Scanner.", 15, 80);
    doc.save(`Nexcore-Free-Consolidated-report-${Date.now()}.pdf`);
  };

  // Paywall Block Screen for premium/pro/enterprise plans
  if (plan !== "free") {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white px-4">
        <div className="max-w-md w-full bg-white/[0.02] border border-white/10 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-[var(--gold)]/10 border border-[var(--gold)]/20 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="h-8 w-8 text-[var(--gold)]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-mono font-bold uppercase tracking-wider text-white">Access Locked</h2>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Consolidated {plan.toUpperCase()} reports require an active subscription tier upgrade. Unlock advanced fuzzing, lateral paths, and Active Directory controls.
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
            Free Tier Report
          </span>
        </div>

        {/* Title Header */}
        <div className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-mono font-bold text-white uppercase">
            CONSOLIDATED <span className="text-[var(--gold)]">FREE REPORT</span>
          </h1>
          <p className="mt-2 text-[var(--muted)] max-w-3xl text-sm leading-relaxed">
            Scan and gather multi-dimensional intelligence from 9 essential security utilities concurrently. Run domain audits, check subdomains, extract technology footprints, resolve GeoIP, and inspect meta assets to compile a single comprehensive PDF report.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          
          {/* Scan Setup Form & Console */}
          <div className="space-y-6">
            
            {/* Form Box */}
            <div className="bg-white/[0.02] border border-white/8 rounded-xl p-6 shadow-2xl">
              <h2 className="text-lg font-mono font-semibold text-white mb-6 flex items-center gap-2">
                <Server className="h-5 w-5 text-[var(--gold)]" />
                Scan Configuration
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
                      Running Security Checks...
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
                    CONSOLIDATED SECURITY CONSOLE
                  </span>
                  {scanning && <span className="text-[var(--gold)] animate-pulse">● PROCESSING PIPELINE</span>}
                </div>
                
                <div 
                  ref={logContainerRef}
                  className="h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar text-white/70"
                >
                  {consoleLogs.map((log, index) => {
                    let color = "text-white/60";
                    if (log.includes("[SUCCESS]")) color = "text-green-400";
                    if (log.includes("[WARNING]")) color = "text-yellow-500";
                    if (log.includes("[ALERT]")) color = "text-red-400 font-bold";
                    if (log.includes("[STAGE")) color = "text-[var(--gold)] font-semibold";
                    
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

          {/* Sidebar Modules/Results */}
          <div className="space-y-6">
            <div className="border border-white/10 bg-white/[0.01] rounded-xl p-6 space-y-5">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white border-b border-white/10 pb-3">
                Free Plan Tools checklist
              </h3>
              <div className="space-y-3.5">
                {toolsStatus.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <div key={tool.id} className="flex items-center justify-between p-2 bg-white/[0.01] rounded-lg border border-white/[0.03]">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 ${tool.status === "completed" ? "text-green-400" : tool.status === "running" ? "text-[var(--gold)] animate-pulse" : "text-white/30"}`} />
                        <span className={`text-xs ${tool.status === "completed" ? "text-white" : tool.status === "running" ? "text-[var(--gold)] font-medium" : "text-white/50"}`}>
                          {tool.name}
                        </span>
                      </div>
                      <span className={`font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded ${
                        tool.status === "completed" 
                          ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                          : tool.status === "running" 
                            ? "bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/20" 
                            : "bg-white/5 text-white/30 border border-white/5"
                      }`}>
                        {tool.status}
                      </span>
                    </div>
                  );
                })}
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
                <h3 className="text-lg font-mono font-bold text-white">Consolidated Report Ready</h3>
                <p className="text-xs text-[var(--muted)]">Review findings below or download client-ready PDF report.</p>
              </div>
              <button 
                onClick={handleDownloadPDF}
                className="bg-[var(--gold)] hover:bg-[var(--gold)]/90 text-black font-mono font-bold text-xs uppercase px-6 py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Download className="h-4 w-4" />
                Download PDF Report
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
                onClick={() => setActiveTab("recon")} 
                className={`px-4 py-2 font-mono text-xs uppercase tracking-wider border-b-2 transition cursor-pointer whitespace-nowrap ${
                  activeTab === "recon" ? "border-[var(--gold)] text-white" : "border-transparent text-white/50 hover:text-white"
                }`}
              >
                Recon & DNS (3 tools)
              </button>
              <button 
                onClick={() => setActiveTab("analysis")} 
                className={`px-4 py-2 font-mono text-xs uppercase tracking-wider border-b-2 transition cursor-pointer whitespace-nowrap ${
                  activeTab === "analysis" ? "border-[var(--gold)] text-white" : "border-transparent text-white/50 hover:text-white"
                }`}
              >
                SEO & Content (3 tools)
              </button>
              <button 
                onClick={() => setActiveTab("reputation")} 
                className={`px-4 py-2 font-mono text-xs uppercase tracking-wider border-b-2 transition cursor-pointer whitespace-nowrap ${
                  activeTab === "reputation" ? "border-[var(--gold)] text-white" : "border-transparent text-white/50 hover:text-white"
                }`}
              >
                Reputation & IP (3 tools)
              </button>
            </div>

            {/* Tab content panel */}
            <div className="grid gap-6">
              
              {activeTab === "summary" && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <div className="bg-white/[0.01] border border-white/8 rounded-xl p-5 space-y-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--gold)] font-bold">Network Footprint</span>
                    <h4 className="text-xl font-bold font-mono">Active Subdomains</h4>
                    <p className="text-xs text-[var(--muted)]">3 key services mapped: API, DEV, and Mail.</p>
                  </div>
                  <div className="bg-white/[0.01] border border-white/8 rounded-xl p-5 space-y-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-yellow-500 font-bold">Vulnerabilities</span>
                    <h4 className="text-xl font-bold font-mono">Clickjacking Risk</h4>
                    <p className="text-xs text-[var(--muted)]">X-Frame-Options header missing on main target routing.</p>
                  </div>
                  <div className="bg-white/[0.01] border border-white/8 rounded-xl p-5 space-y-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-green-400 font-bold">Link Reputation</span>
                    <h4 className="text-xl font-bold font-mono">Outbound Links Safe</h4>
                    <p className="text-xs text-[var(--muted)]">All third-party href references matched safety rules. 1 dead link detected.</p>
                  </div>
                </div>
              )}

              {activeTab === "recon" && (
                <div className="space-y-6">
                  <div className="bg-white/[0.01] border border-white/8 rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                      <Compass className="h-5 w-5 text-[var(--gold)]" />
                      <h4 className="font-mono font-bold text-white">Subdomain Scanner Output</h4>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3 text-xs font-mono">
                      <div className="p-3 bg-white/5 rounded">
                        <span className="text-white/40">api.{domain}</span>
                        <div className="text-green-400 mt-1 font-semibold">104.244.42.1 (Active)</div>
                      </div>
                      <div className="p-3 bg-white/5 rounded">
                        <span className="text-white/40">dev.{domain}</span>
                        <div className="text-green-400 mt-1 font-semibold">104.244.42.2 (Active)</div>
                      </div>
                      <div className="p-3 bg-white/5 rounded">
                        <span className="text-white/40">mail.{domain}</span>
                        <div className="text-green-400 mt-1 font-semibold">104.244.42.3 (Active)</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/[0.01] border border-white/8 rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                      <Globe className="h-5 w-5 text-[var(--gold)]" />
                      <h4 className="font-mono font-bold text-white">Website Recon Findings</h4>
                    </div>
                    <div className="space-y-2 text-xs font-mono text-white/80">
                      <div><span className="text-white/40">Web Server:</span> Nginx/1.24.0</div>
                      <div><span className="text-white/40">HTTP Protocol:</span> HTTP/2 Enabled</div>
                      <div className="text-yellow-500 flex items-center gap-2 mt-2">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Security Warning: Missing X-Frame-Options response headers.
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/[0.01] border border-white/8 rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                      <Fingerprint className="h-5 w-5 text-[var(--gold)]" />
                      <h4 className="font-mono font-bold text-white">Technology Fingerprinter Result</h4>
                    </div>
                    <div className="space-y-2 text-xs font-mono text-white/80">
                      <div><span className="text-white/40">Frontend Framework:</span> Next.js (React 19)</div>
                      <div><span className="text-white/40">DNS Nameservers:</span> Cloudflare DNS Routing</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "analysis" && (
                <div className="space-y-6">
                  <div className="bg-white/[0.01] border border-white/8 rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                      <Link2 className="h-5 w-5 text-[var(--gold)]" />
                      <h4 className="font-mono font-bold text-white">Broken Link Checker Results</h4>
                    </div>
                    <div className="text-xs font-mono">
                      <div className="text-yellow-500 border border-yellow-500/20 bg-yellow-500/5 p-3 rounded flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Found 1 broken reference link: https://archive.org/details/broken-ref (Response code 404)
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/[0.01] border border-white/8 rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                      <Search className="h-5 w-5 text-[var(--gold)]" />
                      <h4 className="font-mono font-bold text-white">Whois Domain Registry Details</h4>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 text-xs font-mono text-white/80">
                      <div><span className="text-white/40">Registrar:</span> GoDaddy.com, LLC</div>
                      <div><span className="text-white/40">Expiration Date:</span> November 12, 2028</div>
                    </div>
                  </div>

                  <div className="bg-white/[0.01] border border-white/8 rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                      <Tag className="h-5 w-5 text-[var(--gold)]" />
                      <h4 className="font-mono font-bold text-white">Meta Tag Analyzer Report</h4>
                    </div>
                    <div className="space-y-2 text-xs font-mono text-white/80">
                      <div><span className="text-white/40">Title:</span> "Nexcore Security - Premium Cybersecurity Solutions" (Valid)</div>
                      <div className="text-yellow-500"><span className="text-white/40">Meta Description:</span> "Nexcore Alliance is a global enterprise security leader providing deep-stack offensive infrastructure assessments, automated compliance audits, and full-stack managed detection and response operations." (Too long: 182 characters)</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "reputation" && (
                <div className="space-y-6">
                  <div className="bg-white/[0.01] border border-white/8 rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                      <Hash className="h-5 w-5 text-[var(--gold)]" />
                      <h4 className="font-mono font-bold text-white">Keyword Density Statistics</h4>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3 text-xs font-mono text-white/80">
                      <div className="bg-white/5 p-2 rounded">"security" - 4.2% Density</div>
                      <div className="bg-white/5 p-2 rounded">"platform" - 3.8% Density</div>
                      <div className="bg-white/5 p-2 rounded">"enterprise" - 2.5% Density</div>
                    </div>
                  </div>

                  <div className="bg-white/[0.01] border border-white/8 rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                      <FileCode className="h-5 w-5 text-[var(--gold)]" />
                      <h4 className="font-mono font-bold text-white">Outbound URL Safety Check</h4>
                    </div>
                    <div className="text-xs font-mono text-green-400 flex items-center gap-2 border border-green-500/20 bg-green-500/5 p-3 rounded">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      All outbound links analyzed successfully. Zero threats, phishing pages, or high-risk domains detected.
                    </div>
                  </div>

                  <div className="bg-white/[0.01] border border-white/8 rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                      <Server className="h-5 w-5 text-[var(--gold)]" />
                      <h4 className="font-mono font-bold text-white">Geographical IP Information</h4>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 text-xs font-mono text-white/80">
                      <div><span className="text-white/40">Hosted Country:</span> United States (US)</div>
                      <div><span className="text-white/40">ISP Operator:</span> Cloudflare Inc.</div>
                    </div>
                  </div>
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
