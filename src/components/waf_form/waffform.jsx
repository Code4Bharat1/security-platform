'use client';
import { useState } from "react";
import { SearchIcon, Loader2, Shield, AlertTriangle } from 'lucide-react';

const Wafform = () => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [wafData, setWafData] = useState(null);
  const [loading, setLoading] = useState(false);

  const validateUrl = (url) => {
    // Enhanced URL validation - handles URLs with or without protocol
    const urlPattern = new RegExp(
      "^(https?:\\/\\/)?(([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}(:\\d+)?(\\/.*)?$",
      "i"
    );
    return urlPattern.test(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure URL has protocol
    let formattedUrl = url;
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    if (!validateUrl(formattedUrl)) {
      setError("❌ Please enter a valid website URL.");
      return;
    }

    setError("");
    setLoading(true);
    setWafData(null);

    try {
      // Changed to use the GET method with URL parameter to match your API
      const apiUrl = `/api/WAF?url=${encodeURIComponent(formattedUrl)}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Safely handle JSON parsing
      let result;
      try {
        const textData = await response.text();
        result = textData ? JSON.parse(textData) : {};
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        throw new Error("Invalid response format");
      }

      if (result.error) {
        setError(`⚠️ ${result.error}`);
        return;
      }

      // Enhanced WAF detection processing
      const processedData = processWafData(result, formattedUrl);
      setWafData(processedData);
    } catch (error) {
      console.error("Error:", error);
      setError(`⚠️ ${error.message || "Something went wrong. Please try again."}`);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced WAF data processing function
  const processWafData = (result, url) => {
    // Extract domain from URL for deeper analysis
    const domain = extractDomain(url);
    
    // Detect WAF from headers and signature patterns
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

  // Extract domain from URL
  const extractDomain = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (e) {
      return url.replace(/^https?:\/\//, '').split('/')[0];
    }
  };

  // Enhanced WAF detection from response data
  const detectWafFromData = (wafResult, domain) => {
    const detectedWafs = [];
    const headers = wafResult.headers || {};
    
    // First check if the API already detected WAFs
    if (wafResult.waf && wafResult.waf !== "No WAF detected") {
      if (Array.isArray(wafResult.waf)) {
        detectedWafs.push(...wafResult.waf);
      } else {
        detectedWafs.push(wafResult.waf);
      }
    }
    
    // If no WAFs detected yet, perform advanced header analysis
    if (detectedWafs.length === 0) {
      // Cloudflare detection
      if (
        headers['cf-ray'] || 
        headers['cf-cache-status'] || 
        headers['server']?.toLowerCase().includes('cloudflare')
      ) {
        // Determine if it's enterprise based on other headers
        if (headers['cf-cache-status']?.includes('HIT') || headers['cf-edge-cache']) {
          detectedWafs.push('Cloudflare Enterprise');
        } else {
          detectedWafs.push('Cloudflare');
        }
      }
      
      // Akamai detection
      if (
        headers['x-akamai-transformed'] || 
        headers['akamai-origin-hop'] ||
        headers['server']?.toLowerCase().includes('akamai')
      ) {
        detectedWafs.push('Akamai');
      }
      
      // AWS WAF detection
      if (headers['x-amzn-requestid'] || headers['x-amz-cf-id'] || headers['x-amz-cf-pop']) {
        detectedWafs.push('AWS WAF');
      }
      
      // Fastly detection
      if (headers['fastly-io-info'] || headers['x-fastly-request-id']) {
        detectedWafs.push('Fastly Next-Gen WAF');
      }
      
      // Imperva/Incapsula detection
      if (
        headers['x-iinfo'] || 
        headers['x-cdn'] === 'Incapsula' ||
        headers['set-cookie']?.includes('incap_ses') || 
        headers['set-cookie']?.includes('visid_incap')
      ) {
        detectedWafs.push('Imperva/Incapsula');
      }
      
      // Sucuri detection
      if (headers['x-sucuri-id'] || headers['server']?.includes('Sucuri')) {
        detectedWafs.push('Sucuri WAF');
      }
      
      // F5 Big-IP detection
      if (headers['server']?.includes('BigIP') || headers['set-cookie']?.includes('BIGipServer')) {
        detectedWafs.push('F5 BIG-IP');
      }

      // Azure WAF detection
      if (headers['x-azure-ref'] || headers['x-ms-request-id']) {
        detectedWafs.push('Azure Web Application Firewall');
      }
      
      // Generic Server Analysis
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
      
      // Check for security headers as WAF indicators
      if (headers['x-xss-protection'] === '1; mode=block' ||
          headers['content-security-policy'] ||
          headers['x-content-type-options'] === 'nosniff') {
        // These are security headers that might indicate some form of WAF
        if (detectedWafs.length === 0) {
          detectedWafs.push('Basic Security Headers (Possible Lightweight WAF)');
        }
      }
    }
    
    return detectedWafs;
  };

  // Enhanced protection level determination
  const determineProtectionLevel = (detectedWafs, wafResult) => {
    if (detectedWafs.length === 0) {
      return "None";
    }
    
    // Enterprise-level WAFs typically provide stronger protection
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

    // Check if any enterprise WAFs are detected
    const hasEnterpriseWaf = detectedWafs.some(waf => 
      enterpriseWafs.some(enterpriseWaf => waf.includes(enterpriseWaf))
    );
    
    // Check for active security headers
    const headers = wafResult.headers || {};
    const hasStrongSecurityHeaders = 
      (headers['content-security-policy'] && !headers['content-security-policy'].includes('report-only')) ||
      (headers['strict-transport-security'] && headers['strict-transport-security'].includes('max-age=')) ||
      (headers['x-content-type-options'] === 'nosniff' && headers['x-xss-protection'] === '1; mode=block');
    
    // Check for WAF rule active blockers
    const hasActiveRules = wafResult.ruleAnalysis?.activeRules?.length > 0;
    
    // Additional check for blocking behaviors in test responses
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

  // Enhanced attack prevention capability determination
  const determineAttackPrevention = (detectedWafs, wafResult) => {
    if (detectedWafs.length === 0) {
      return false;
    }
    
    // Check for specific indicators of active protection
    const headers = wafResult.headers || {};
    
    // Signs of active protection
    const hasActiveProtection = 
      wafResult.isBlocking || 
      wafResult.ruleAnalysis?.activeRules?.length > 0 ||
      (wafResult.testResponses && Object.values(wafResult.testResponses).some(r => r.blocked)) ||
      headers['x-xss-protection'] === '1; mode=block' ||
      (headers['content-security-policy'] && !headers['content-security-policy'].includes('report-only'));
    
    return hasActiveProtection;
  };

  // Enhanced WAF rule analysis
  const analyzeWafRules = (detectedWafs, wafResult) => {
    // If we already have rule analysis from the API, use it
    if (wafResult.ruleAnalysis) {
      return wafResult.ruleAnalysis;
    }
    
    // Create a new rule analysis based on detected information
    const ruleAnalysis = {
      activeRules: [],
      recommendations: [],
      riskLevel: "High" // Default to high risk if no WAF detected
    };
    
    // Headers for analysis
    const headers = wafResult.headers || {};
    
    // If WAFs are detected, populate with generic information
    if (detectedWafs.length > 0) {
      // Determine risk level based on WAF type and security headers
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
      
      // Check for common security headers and add them as active rules
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
      
      // Add WAF-specific active rule assumptions
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
      
      // Add recommendations based on missing protections
      if (!headers['content-security-policy']) {
        ruleAnalysis.recommendations.push("Implement Content Security Policy (CSP)");
      }
      
      if (!headers['strict-transport-security']) {
        ruleAnalysis.recommendations.push("Enable HTTP Strict Transport Security (HSTS)");
      }
      
      if (!headers['x-frame-options']) {
        ruleAnalysis.recommendations.push("Add X-Frame-Options header to prevent clickjacking");
      }
      
      // If WAF is detected but protection level isn't high, suggest improvements
      const protectionLevel = determineProtectionLevel(detectedWafs, wafResult);
      if (protectionLevel !== "High") {
        ruleAnalysis.recommendations.push("Consider upgrading to an enterprise-level WAF solution");
        ruleAnalysis.recommendations.push("Enable advanced rule sets within your current WAF");
      }
    } else {
      // No WAF detected - recommend implementing one
      ruleAnalysis.recommendations.push("Implement a Web Application Firewall (WAF)");
      ruleAnalysis.recommendations.push("Add security headers: CSP, HSTS, X-Content-Type-Options");
      ruleAnalysis.recommendations.push("Consider Cloudflare, AWS WAF, or other WAF solutions");
    }
    
    return ruleAnalysis;
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 mb-5">
      <img src="verify.png" alt="verify" className="w-16 h-20 mb-4 mt-7" />
      <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mt-3">Protect Your Website</h1>
      <p className="text-lg text-slate-600 max-w-2xl mx-auto text-center mt-3">
        Our advanced security scanner identifies vulnerabilities before attackers can exploit them.
      </p>
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl mt-10">
        <h1 className="text-2xl font-bold text-center mb-5 mt-4 text-green-800">
          Web Application Firewall (WAF) Scanner
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-green-800">
            <input
              type="url"
              id="websiteUrl"
              name="websiteUrl"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              required
              className="flex-grow p-2 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-green-800 text-white py-2 px-4 hover:bg-green-700 transition-colors duration-300 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <SearchIcon className="h-5 w-5" />}
              {loading ? "Scanning..." : "Scan"}
            </button>
          </div>
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </form>

        {/* Results Area */}
        <div className="mt-6">
          {loading && (
            <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-green-800 mb-3"></div>
              <p className="text-green-800 font-medium">Analyzing web security configuration...</p>
            </div>
          )}

          {!loading && wafData && (
            <div className="border rounded-lg overflow-hidden">
              {/* Status Header */}
              <div className={`p-4 flex items-center gap-3 ${wafData.wafDetected ? 'bg-green-100' : 'bg-red-100'}`}>
                {wafData.wafDetected ? 
                  <Shield className="h-6 w-6 text-green-600" /> : 
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                }
                <div>
                  <h2 className="text-xl font-bold">
                    {wafData.wafDetected ? 'Protected' : 'Not Protected'}
                  </h2>
                  <p className="text-sm">
                    {wafData.domain}
                  </p>
                </div>
              </div>
              
              {/* Details Section */}
              <div className="p-4 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded border">
                    <h3 className="font-medium text-gray-700">WAF Status</h3>
                    <p className={wafData.wafDetected ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                      {wafData.wafDetected ? wafData.provider : "No WAF detected"}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded border">
                    <h3 className="font-medium text-gray-700">Protection Level</h3>
                    <p className={
                      wafData.protectionLevel === "High" ? "text-green-600 font-bold" : 
                      wafData.protectionLevel === "Medium-High" ? "text-green-600 font-bold" :
                      wafData.protectionLevel === "Medium" ? "text-yellow-600 font-bold" : 
                      "text-red-600 font-bold"
                    }>
                      {wafData.protectionLevel}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded border">
                    <h3 className="font-medium text-gray-700">Attack Prevention</h3>
                    <p className={wafData.attackPrevention ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                      {wafData.attackPrevention ? "✅ Active" : "❌ Not Enforced"}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded border">
                    <h3 className="font-medium text-gray-700">Risk Level</h3>
                    <p className={
                      wafData.ruleAnalysis?.riskLevel === "Low" ? "text-green-600 font-bold" : 
                      wafData.ruleAnalysis?.riskLevel === "Medium" ? "text-yellow-600 font-bold" : 
                      "text-red-600 font-bold"
                    }>
                      {wafData.ruleAnalysis?.riskLevel || "High"}
                    </p>
                  </div>
                </div>
              
                {/* WAF Rule Analysis */}
                {wafData.ruleAnalysis && (
                  <div className="mt-4 border-t pt-4">
                    <h3 className="font-bold text-green-800 mb-2">Security Analysis</h3>
                    
                    {wafData.ruleAnalysis.activeRules && wafData.ruleAnalysis.activeRules.length > 0 && (
                      <div className="mb-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Shield className="h-4 w-4 text-green-600" />
                          Active Protections:
                        </h4>
                        <ul className="list-disc pl-5 mt-1">
                          {wafData.ruleAnalysis.activeRules.map((rule, index) => (
                            <li key={index} className="text-sm text-gray-700">{rule}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {wafData.ruleAnalysis.recommendations && wafData.ruleAnalysis.recommendations.length > 0 && (
                      <div className="mb-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          Recommendations:
                        </h4>
                        <ul className="list-disc pl-5 mt-1">
                          {wafData.ruleAnalysis.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm text-gray-700">{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Show header details in collapsible section */}
                {wafData.rawHeaders && Object.keys(wafData.rawHeaders).length > 0 && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-green-800 font-medium">
                      View Technical Details
                    </summary>
                    <div className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto max-h-60">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(wafData.rawHeaders, null, 2)}
                      </pre>
                    </div>
                  </details>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wafform;