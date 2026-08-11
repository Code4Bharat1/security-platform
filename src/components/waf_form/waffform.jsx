'use client';

import React, { useState } from "react";
import { 
  Search, 
  Loader2, 
  Shield, 
  AlertTriangle, 
  Info,
  ChevronDown
} from 'lucide-react';

const Wafform = () => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [wafData, setWafData] = useState(null);
  const [loading, setLoading] = useState(false);

  const validateUrl = (url) => {
    const urlPattern = new RegExp(
      "^(https?:\\/\\/)?(([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}(:\\d+)?(\\/.*)?$",
      "i"
    );
    return urlPattern.test(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let formattedUrl = url;
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    if (!validateUrl(formattedUrl)) {
      setError("Please enter a valid website URL.");
      return;
    }

    setError("");
    setLoading(true);
    setWafData(null);

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_PROD_API_URL || ""}/WAF?url=${encodeURIComponent(formattedUrl)}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      let result;
      try {
        const textData = await response.text();
        result = textData ? JSON.parse(textData) : {};
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        throw new Error("Invalid response format");
      }

      if (result.error) {
        setError(result.error);
        return;
      }

      const processedData = processWafData(result, formattedUrl);
      setWafData(processedData);
    } catch (error) {
      console.error("Error:", error);
      setError(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const processWafData = (result, url) => {
    const domain = extractDomain(url);
    const detectedWafs = detectWafFromData(result, domain);
    
    return {
      wafDetected: detectedWafs.length > 0,
      provider: detectedWafs.length > 0 ? detectedWafs.join(", ") : "No WAF detected",
      protectionLevel: determineProtectionLevel(detectedWafs, result),
      attackPrevention: determineAttackPrevention(detectedWafs, result),
      rawHeaders: result.headers || {},
      ruleAnalysis: analyzeWafRules(detectedWafs, result),
      domain: domain
    };
  };

  const extractDomain = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (e) {
      return url.replace(/^https?:\/\//, '').split('/')[0];
    }
  };

  const detectWafFromData = (wafResult, domain) => {
    const detectedWafs = [];
    const headers = wafResult.headers || {};
    
    if (wafResult.waf && wafResult.waf !== "No WAF detected") {
      if (Array.isArray(wafResult.waf)) {
        detectedWafs.push(...wafResult.waf);
      } else {
        detectedWafs.push(wafResult.waf);
      }
    }
    
    if (detectedWafs.length === 0) {
      if (
        headers['cf-ray'] || 
        headers['cf-cache-status'] || 
        headers['server']?.toLowerCase().includes('cloudflare')
      ) {
        if (headers['cf-cache-status']?.includes('HIT') || headers['cf-edge-cache']) {
          detectedWafs.push('Cloudflare Enterprise');
        } else {
          detectedWafs.push('Cloudflare');
        }
      }
      
      if (
        headers['x-akamai-transformed'] || 
        headers['akamai-origin-hop'] ||
        headers['server']?.toLowerCase().includes('akamai')
      ) {
        detectedWafs.push('Akamai');
      }
      
      if (headers['x-amzn-requestid'] || headers['x-amz-cf-id'] || headers['x-amz-cf-pop']) {
        detectedWafs.push('AWS WAF');
      }
      
      if (headers['fastly-io-info'] || headers['x-fastly-request-id']) {
        detectedWafs.push('Fastly Next-Gen WAF');
      }
      
      if (
        headers['x-iinfo'] || 
        headers['x-cdn'] === 'Incapsula' ||
        headers['set-cookie']?.includes('incap_ses') || 
        headers['set-cookie']?.includes('visid_incap')
      ) {
        detectedWafs.push('Imperva/Incapsula');
      }
      
      if (headers['x-sucuri-id'] || headers['server']?.includes('Sucuri')) {
        detectedWafs.push('Sucuri WAF');
      }
      
      if (headers['server']?.includes('BigIP') || headers['set-cookie']?.includes('BIGipServer')) {
        detectedWafs.push('F5 BIG-IP');
      }
      
      if (headers['x-azure-ref'] || headers['x-ms-request-id']) {
        detectedWafs.push('Azure Web Application Firewall');
      }
      
      if (headers['server']) {
        const serverHeader = headers['server'].toLowerCase();
        if (serverHeader.includes('barracuda')) {
          detectedWafs.push('Barracuda WAF');
        } else if (serverHeader.includes('fortigate') || serverHeader.includes('fortiweb')) {
          detectedWafs.push('Fortinet FortiWeb');
        } else if (serverHeader.includes('nginx') && wafResult.isBlocking) {
          detectedWafs.push('NGINX WAF Module');
        }
      }
      
      if (headers['x-xss-protection'] === '1; mode=block' ||
          headers['content-security-policy'] ||
          headers['x-content-type-options'] === 'nosniff') {
        if (detectedWafs.length === 0) {
          detectedWafs.push('Basic Security Headers (Possible Lightweight WAF)');
        }
      }
    }
    
    return detectedWafs;
  };

  const determineProtectionLevel = (detectedWafs, wafResult) => {
    if (detectedWafs.length === 0) {
      return "None";
    }
    
    const enterpriseWafs = [
      "Cloudflare Enterprise",
      "Akamai",
      "F5 BIG-IP",
      "Imperva",
      "Imperva/Incapsula",
      "AWS WAF",
      "Azure Web Application Firewall",
      "Barracuda WAF",
      "Fortinet FortiWeb",
      "Radware AppWall",
      "Citrix Web App Firewall",
      "StackPath WAF",
      "Fastly Next-Gen WAF",
      "Sophos XG Firewall"
    ];

    const hasEnterpriseWaf = detectedWafs.some(waf => 
      enterpriseWafs.some(enterpriseWaf => waf.includes(enterpriseWaf))
    );
    
    const headers = wafResult.headers || {};
    const hasStrongSecurityHeaders = 
      (headers['content-security-policy'] && !headers['content-security-policy'].includes('report-only')) ||
      (headers['strict-transport-security'] && headers['strict-transport-security'].includes('max-age=')) ||
      (headers['x-content-type-options'] === 'nosniff' && headers['x-xss-protection'] === '1; mode=block');
    
    const hasActiveRules = wafResult.ruleAnalysis?.activeRules?.length > 0;
    const hasBlockingBehavior = wafResult.isBlocking || 
                               (wafResult.testResponses && Object.values(wafResult.testResponses).some(r => r.blocked));
    
    if (hasEnterpriseWaf && (hasActiveRules || hasBlockingBehavior)) {
      return "High";
    } else if (hasEnterpriseWaf || (detectedWafs.length > 0 && hasStrongSecurityHeaders)) {
      return "Medium-High";
    } else if (detectedWafs.length > 0) {
      return "Medium";
    } else if (hasStrongSecurityHeaders) {
      return "Low";
    }
    
    return "None";
  };

  const determineAttackPrevention = (detectedWafs, wafResult) => {
    if (detectedWafs.length === 0) {
      return false;
    }
    const headers = wafResult.headers || {};
    const hasActiveProtection = 
      wafResult.isBlocking || 
      wafResult.ruleAnalysis?.activeRules?.length > 0 ||
      (wafResult.testResponses && Object.values(wafResult.testResponses).some(r => r.blocked)) ||
      headers['x-xss-protection'] === '1; mode=block' ||
      (headers['content-security-policy'] && !headers['content-security-policy'].includes('report-only'));
    
    return hasActiveProtection;
  };

  const analyzeWafRules = (detectedWafs, wafResult) => {
    if (wafResult.ruleAnalysis) {
      return wafResult.ruleAnalysis;
    }
    
    const ruleAnalysis = {
      activeRules: [],
      recommendations: [],
      riskLevel: "High"
    };
    
    const headers = wafResult.headers || {};
    
    if (detectedWafs.length > 0) {
      if (detectedWafs.some(waf => 
        waf.includes("Cloudflare Enterprise") || 
        waf.includes("Imperva") || 
        waf.includes("F5 BIG-IP") ||
        waf.includes("AWS WAF")
      )) {
        ruleAnalysis.riskLevel = "Low";
      } else if (detectedWafs.length > 0) {
        ruleAnalysis.riskLevel = "Medium";
      }
      
      if (headers['x-xss-protection'] === '1; mode=block') {
        ruleAnalysis.activeRules.push("XSS Protection");
      }
      if (headers['x-content-type-options'] === 'nosniff') {
        ruleAnalysis.activeRules.push("Content Type Protection");
      }
      if (headers['content-security-policy']) {
        ruleAnalysis.activeRules.push("Content Security Policy");
      }
      if (headers['strict-transport-security']) {
        ruleAnalysis.activeRules.push("HTTP Strict Transport Security");
      }
      if (headers['x-frame-options']) {
        ruleAnalysis.activeRules.push("Clickjacking Protection");
      }
      
      detectedWafs.forEach(waf => {
        if (waf.includes("Cloudflare")) {
          ruleAnalysis.activeRules.push("DDoS Protection");
          ruleAnalysis.activeRules.push("Rate Limiting");
        } else if (waf.includes("Imperva") || waf.includes("Incapsula")) {
          ruleAnalysis.activeRules.push("OWASP Top 10 Protection");
          ruleAnalysis.activeRules.push("Advanced Bot Detection");
        } else if (waf.includes("AWS WAF")) {
          ruleAnalysis.activeRules.push("IP Reputation Filtering");
          ruleAnalysis.activeRules.push("Geo-blocking");
        }
      });
      
      if (!headers['content-security-policy']) {
        ruleAnalysis.recommendations.push("Implement Content Security Policy (CSP)");
      }
      if (!headers['strict-transport-security']) {
        ruleAnalysis.recommendations.push("Enable HTTP Strict Transport Security (HSTS)");
      }
      if (!headers['x-frame-options']) {
        ruleAnalysis.recommendations.push("Add X-Frame-Options header to prevent clickjacking");
      }
      
      const protectionLevel = determineProtectionLevel(detectedWafs, wafResult);
      if (protectionLevel !== "High") {
        ruleAnalysis.recommendations.push("Consider upgrading to an enterprise-level WAF solution");
        ruleAnalysis.recommendations.push("Enable advanced rule sets within your current WAF");
      }
    } else {
      ruleAnalysis.recommendations.push("Implement a Web Application Firewall (WAF)");
      ruleAnalysis.recommendations.push("Add security headers: CSP, HSTS, X-Content-Type-Options");
      ruleAnalysis.recommendations.push("Consider Cloudflare, AWS WAF, or other WAF solutions");
    }
    
    return ruleAnalysis;
  };

  return (
    <div 
      className="tool-detail-page min-h-screen"
      style={{
        '--hero-ambient-a': 'rgba(59, 130, 246, 0.08)',
        '--hero-ambient-b': 'rgba(6, 182, 212, 0.03)',
        '--glow-primary': '0 0 34px rgba(59, 130, 246, 0.16)',
        '--gold': '#3b82f6',
        '--gold-strong': '#60a5fa',
        '--gold-dark': '#1d4ed8',
        '--ring': 'rgba(59, 130, 246, 0.34)',
        '--surface-glow': 'rgba(59, 130, 246, 0.14)',
      }}
    >
      <style>{`
        .tool-detail-page .tool-detail-shell {
          padding-top: 3.5rem !important;
        }
        .tool-detail-page ::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.35) !important;
        }
        .tool-detail-page ::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.55) !important;
        }
        .tool-detail-page ::selection {
          background: rgba(59, 130, 246, 0.22) !important;
          color: #eff6ff !important;
        }
        .tool-detail-page :is(button, [role="button"]):is([class*="bg-blue-"], [class*="bg-sky-"]) {
          color: #000000 !important;
        }
        .tool-detail-page :is(button, [role="button"]):is([class*="bg-blue-"], [class*="bg-sky-"]) * {
          color: #000000 !important;
        }
      `}</style>

      <div className="tool-detail-shell">
        {/* Navigation & Header */}
        <div className="flex justify-end mb-8">
          <span className="rounded-full border border-blue-500/30 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-blue-400">
            Blue Team
          </span>
        </div>

        {/* Title Block */}
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl border border-blue-500/30 overflow-hidden shadow-lg flex-shrink-0 flex items-center justify-center">
            <Shield className="h-8 w-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              WAF <span className="text-blue-400">SCANNER</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Detect and analyze active Web Application Firewall (WAF) configurations, evaluate defense levels, and inspect security response headers.
            </p>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* Form card */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-blue-500/10 transition-all duration-300">
              <h2 className="text-lg font-mono font-medium text-zinc-100 mb-6 flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-400" />
                Target Website Details
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="waf-target-url" className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                    Target Website URL
                  </label>
                  <input 
                    id="waf-target-url"
                    type="url" 
                    value={url}
                    onChange={(e) => setUrl(e.target.value.trim())}
                    placeholder="https://example.com"
                    className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3 text-sm focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 focus:shadow-[0_0_12px_rgba(59,130,246,0.08)] focus:outline-none transition-all placeholder:text-zinc-650 font-mono"
                    required
                  />
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-black rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2 focus:ring-offset-black/20 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-black" />
                        Analyzing Protection rules...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 text-black" />
                        Run WAF Scanner
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Results Block */}
            {error && (
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-950/10 text-red-400 text-xs font-mono flex items-start gap-2">
                <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                <span>Error: {error}</span>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center p-12 border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                <p className="text-zinc-300 font-mono text-xs uppercase tracking-wider">Analyzing web security configuration...</p>
              </div>
            )}

            {!loading && wafData && (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-blue-500/10 transition-all duration-300 space-y-6">
                
                {/* Status Banner */}
                <div className={`border rounded-xl p-4 flex items-center gap-3 ${
                  wafData.wafDetected ? 
                    'border-blue-500/30 bg-blue-500/10 text-blue-400' : 
                    'border-red-500/30 bg-red-500/10 text-red-400'
                }`}>
                  {wafData.wafDetected ? 
                    <Shield className="h-6 w-6" /> : 
                    <AlertTriangle className="h-6 w-6" />
                  }
                  <div>
                    <h2 className="text-lg font-mono font-bold uppercase tracking-wider">
                      {wafData.wafDetected ? 'Protected' : 'Not Protected'}
                    </h2>
                    <p className="text-xs font-mono text-zinc-400 mt-0.5">
                      {wafData.domain}
                    </p>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl font-mono text-xs">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-semibold mb-1 block">
                      WAF Status
                    </span>
                    <span className={wafData.wafDetected ? "text-blue-400 font-bold" : "text-red-400 font-bold"}>
                      {wafData.wafDetected ? wafData.provider : "No WAF detected"}
                    </span>
                  </div>

                  <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl font-mono text-xs">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-semibold mb-1 block">
                      Protection Level
                    </span>
                    <span className={
                      wafData.protectionLevel === "High" || wafData.protectionLevel === "Medium-High" ? "text-blue-400 font-bold" : 
                      wafData.protectionLevel === "Medium" ? "text-sky-400 font-bold" : 
                      "text-red-400 font-bold"
                    }>
                      {wafData.protectionLevel}
                    </span>
                  </div>

                  <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl font-mono text-xs">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-semibold mb-1 block">
                      Attack Prevention
                    </span>
                    <span className={wafData.attackPrevention ? "text-blue-400 font-bold" : "text-red-400 font-bold"}>
                      {wafData.attackPrevention ? "Active" : "Not Enforced"}
                    </span>
                  </div>

                  <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl font-mono text-xs">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-semibold mb-1 block">
                      Risk Level
                    </span>
                    <span className={
                      wafData.ruleAnalysis?.riskLevel === "Low" ? "text-blue-400 font-bold" : 
                      wafData.ruleAnalysis?.riskLevel === "Medium" ? "text-sky-400 font-bold" : 
                      "text-red-400 font-bold"
                    }>
                      {wafData.ruleAnalysis?.riskLevel || "High"}
                    </span>
                  </div>
                </div>

                {/* Details list */}
                {wafData.ruleAnalysis && (
                  <div className="border-t border-zinc-800/40 pt-4 space-y-4">
                    <h3 className="text-sm font-mono font-bold text-zinc-200">Security Analysis</h3>

                    {wafData.ruleAnalysis.activeRules && wafData.ruleAnalysis.activeRules.length > 0 && (
                      <div>
                        <h4 className="text-xs font-mono font-bold text-zinc-300 mb-2 flex items-center gap-1.5">
                          <Shield className="h-4 w-4 text-blue-400" />
                          Active Rules:
                        </h4>
                        <ul className="space-y-2 list-none pl-0">
                          {wafData.ruleAnalysis.activeRules.map((rule, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500/60 mt-1.5 flex-shrink-0" />
                              <span className="text-xs text-zinc-400 leading-relaxed font-mono">{rule}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {wafData.ruleAnalysis.recommendations && wafData.ruleAnalysis.recommendations.length > 0 && (
                      <div className="pt-2">
                        <h4 className="text-xs font-mono font-bold text-zinc-300 mb-2 flex items-center gap-1.5">
                          <AlertTriangle className="h-4 w-4 text-orange-400" />
                          Recommendations:
                        </h4>
                        <ul className="space-y-2 list-none pl-0">
                          {wafData.ruleAnalysis.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500/60 mt-1.5 flex-shrink-0" />
                              <span className="text-xs text-zinc-400 leading-relaxed font-mono">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Raw Response Headers */}
                {wafData.rawHeaders && Object.keys(wafData.rawHeaders).length > 0 && (
                  <details className="group border-t border-zinc-800/40 pt-4">
                    <summary className="cursor-pointer text-blue-400 font-mono text-xs uppercase tracking-wider hover:text-blue-300 transition-colors flex items-center gap-1">
                      View Technical Headers
                      <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" />
                    </summary>
                    <pre className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl text-xs text-zinc-300 font-mono mt-3 overflow-auto max-h-60">
                      {JSON.stringify(wafData.rawHeaders, null, 2)}
                    </pre>
                  </details>
                )}

              </div>
            )}

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Guidance sidebar card */}
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Info className="text-blue-400 w-4 h-4" />
                Scan Scope
              </h2>
              <ul className="space-y-3.5 list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Scans target headers for provider fingerprints (Cloudflare, Akamai, AWS WAF, etc.).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Analyzes security configurations (CSP, HSTS, XSS protection headers).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Provides suggestions for improving edge-level application shielding.
                  </span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Wafform;