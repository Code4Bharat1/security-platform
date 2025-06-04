import sslChecker from "ssl-checker";
import axios from "axios";
import https from "https";
import { NextResponse } from "next/server";
export async function POST(request) {
  const { url } = await request.json();

  try {
    // Sanitize and format the URL
    const domain = url.replace(/^https?:\/\//, "").split("/")[0];
    const formattedUrl = `https://${domain}`;
    
    console.log("Processing URL:", formattedUrl);
    
    // Collect all scan results
    const scanResults = {
      domain,
      timestamp: new Date().toISOString(),
      ssl: null,
      headers: null,
      openPorts: null,
      vulnerabilities: []
    };
    
    // 1. Check SSL certificate
    try {
      scanResults.ssl = await sslChecker(domain);
    } catch (error) {
      scanResults.vulnerabilities.push({
        type: "ssl",
        severity: "high",
        description: "SSL certificate issue detected",
        details: error.message
      });
    }
    
    // 2. Check security headers
    try {
      const agent = new https.Agent({
        rejectUnauthorized: false // Allow self-signed certificates
      });
      
      const response = await axios.get(formattedUrl, {
        timeout: 5000,
        httpsAgent: agent,
        validateStatus: () => true // Accept any status code
      });
      
      const headers = response.headers;
      scanResults.headers = headers;
      
      // Check for missing security headers
      const securityHeaders = {
        "strict-transport-security": "Strict Transport Security not configured",
        "content-security-policy": "Content Security Policy not configured",
        "x-content-type-options": "X-Content-Type-Options not configured",
        "x-frame-options": "X-Frame-Options not configured",
        "x-xss-protection": "X-XSS-Protection not configured"
      };
      
      for (const [header, message] of Object.entries(securityHeaders)) {
        if (!headers[header]) {
          scanResults.vulnerabilities.push({
            type: "header",
            severity: "medium",
            description: message,
            recommendation: `Add the ${header} header to enhance security`
          });
        }
      }
      
      // Check for server information disclosure
      if (headers.server) {
        scanResults.vulnerabilities.push({
          type: "information_disclosure",
          severity: "low",
          description: "Server information disclosure",
          details: `Server header reveals: ${headers.server}`,
          recommendation: "Hide server information in HTTP headers"
        });
      }
      
    } catch (error) {
      scanResults.vulnerabilities.push({
        type: "connection",
        severity: "medium",
        description: "Failed to connect or retrieve headers",
        details: error.message
      });
    }
    
    // 3. Check for common misconfigurations by testing URLs
    const commonPaths = [
      "/.git/config",
      "/.env",
      "/wp-config.php",
      "/phpinfo.php",
      "/admin",
      "/config",
      "/backup",
      "/wp-admin",
      "/server-status"
    ];
    
    for (const path of commonPaths) {
      try {
        const testUrl = `${formattedUrl}${path}`;
        const response = await axios.get(testUrl, {
          timeout: 3000,
          httpsAgent: new https.Agent({ rejectUnauthorized: false }),
          validateStatus: () => true
        });
        
        // Check for successful responses to sensitive paths
        if (response.status === 200) {
          scanResults.vulnerabilities.push({
            type: "exposure",
            severity: "high",
            description: "Potentially sensitive resource exposed",
            details: `${path} is accessible (Status: ${response.status})`,
            recommendation: "Restrict access to this resource"
          });
        }
      } catch (error) {
         return NextResponse.json({ error: "Unable to fetch or analyze the website.",details: error.message }, { status: 500 });
      }
    }
    
    // Filter out any null properties and add summary
    scanResults.vulnerabilityCount = scanResults.vulnerabilities.length;
    scanResults.riskLevel = scanResults.vulnerabilityCount > 5 ? "high" : 
                            scanResults.vulnerabilityCount > 2 ? "medium" : "low";
    
    return new Response(JSON.stringify(scanResults), { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error("Vulnerability Scanner Error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to complete vulnerability scan",
        message: error.message 
      }),
      { status: 500 }
    );
  }
}
