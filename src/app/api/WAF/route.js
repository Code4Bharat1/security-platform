// Function to analyze WAF rules based on detected WAFs and headers
/* eslint-env node, es2022 */

function analyzeWafRules(detectedWAFs, headers, statusCode) {
    if (detectedWAFs.length === 0) {
        return {
            protectionLevel: "None",
            activeRules: [],
            riskLevel: "High",
            recommendations: [
                "Implement a WAF solution to protect against common web attacks",
                "Consider Cloudflare, AWS WAF, or other leading solutions",
                "Implement rate limiting to prevent brute force attacks"
            ]
        };
    }

    const analysis = {
        protectionLevel: "Medium",
        activeRules: [],
        riskLevel: "Medium",
        recommendations: []
    };

    // Analyze headers for specific protection mechanisms
    const headersStr = JSON.stringify(headers).toLowerCase();
    
    // Check for specific WAF providers and their typical rules
    if (detectedWAFs.includes("Cloudflare")) {
        analysis.activeRules.push("DDoS Protection");
        
        if (headersStr.includes("cf-ray")) {
            analysis.activeRules.push("Request Tracing");
        }
        
        if (headers["cf-cache-status"]) {
            analysis.activeRules.push("Content Caching");
        }
        
        if (headers["cf-mitigated"]) {
            analysis.activeRules.push("Threat Mitigation Active");
            analysis.protectionLevel = "High";
        }
        
        if (statusCode === 403) {
            analysis.activeRules.push("Active Blocking Rules");
        }
    }
    
    if (detectedWAFs.includes("AWS WAF")) {
        analysis.activeRules.push("AWS Managed Rules");
        
        if (statusCode === 403) {
            analysis.activeRules.push("IP Reputation Filtering");
        }
    }
    
    if (detectedWAFs.includes("Imperva")) {
        analysis.activeRules.push("Advanced Bot Protection");
        analysis.activeRules.push("Virtual Patching");
        analysis.protectionLevel = "High";
    }
    
    if (detectedWAFs.includes("F5 BIG-IP")) {
        analysis.activeRules.push("Protocol Validation");
        analysis.activeRules.push("Advanced Threat Protection");
        analysis.protectionLevel = "High";
    }

    // Check for security headers
    if (headers["strict-transport-security"]) {
        analysis.activeRules.push("HSTS Enabled");
    }
    
    if (headers["x-xss-protection"]) {
        analysis.activeRules.push("XSS Protection");
    }
    
    if (headers["x-content-type-options"]) {
        analysis.activeRules.push("Content Type Protection");
    }
    
    if (headers["content-security-policy"]) {
        analysis.activeRules.push("Content Security Policy");
        analysis.protectionLevel = "High";
    }

    // Determine risk level based on protection level
    if (analysis.protectionLevel === "High") {
        analysis.riskLevel = "Low";
    } else if (analysis.protectionLevel === "Medium") {
        analysis.riskLevel = "Medium";
    } else {
        analysis.riskLevel = "High";
    }

    // Generate recommendations based on findings
    if (!analysis.activeRules.includes("Content Security Policy")) {
        analysis.recommendations.push("Implement Content Security Policy (CSP) headers");
    }
    
    if (!analysis.activeRules.includes("HSTS Enabled")) {
        analysis.recommendations.push("Enable HTTP Strict Transport Security (HSTS)");
    }
    
    if (analysis.protectionLevel !== "High") {
        analysis.recommendations.push("Consider upgrading to enterprise-level WAF protection");
    }
    
    // If multiple WAFs detected
    if (detectedWAFs.length > 1) {
        analysis.recommendations.push("Optimize multiple WAF configuration to prevent conflicts");
    }

    return analysis;
}

// Save this as app/api/WAF/route.js
export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get("url");

    if (!targetUrl) {
        return new Response(JSON.stringify({ error: "URL required" }), { 
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }

    try {
        // Initialize variables to store response and headers
        let headers = {};
        let statusCode = 0;
        let methodUsed = '';
        
        // Try multiple methods with different options
        const methods = ["GET", "HEAD", "OPTIONS"];
        
        for (const method of methods) {
            try {
                // Set up request with timeout and appropriate headers
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
                
                const requestOptions = {
                    method: method,
                    signal: controller.signal,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        'Accept': '*/*',
                        'Accept-Language': 'en-US,en;q=0.9',
                        'Connection': 'keep-alive'
                    },
                    redirect: 'follow',
                    credentials: 'omit'
                };
                
                const fetchResponse = await fetch(targetUrl, requestOptions);
                clearTimeout(timeoutId);
                
                // If we got any response, store it even if not "ok"
                statusCode = fetchResponse.status;
                methodUsed = method;
                
                // Extract headers even from non-ok responses
                headers = Object.fromEntries(fetchResponse.headers.entries());
                
                // If we got a successful response, no need to try other methods
                if (fetchResponse.ok) {
                    break;
                }
            } catch (methodError) {
                console.log(`${method} request failed:`, methodError.message);
                // Continue to the next method
            }
        }
        
        // Even if all requests failed but we got headers, we can still proceed
        if (Object.keys(headers).length === 0) {
            // If we couldn't get any headers at all
            throw new Error(`Could not connect to the target URL using any method. Last status: ${statusCode}`);
        }

        // Expanded list of WAF providers with common header indicators
        const wafSignatures = {
            "Cloudflare": ["cf-ray", "cloudflare"],
            "Imperva": ["incap_ses", "visid_incap", "imperva"],
            "Akamai": ["akamai", "akamaighost"],
            "Sucuri": ["sucuri", "sucurisecurity"],
            "AWS WAF": ["awselb", "aws-waf"],
            "F5 BIG-IP": ["bigip", "f5"],
            "Fastly": ["fastly"],
            "Barracuda": ["barracuda"],
            "Fortinet": ["fortigate", "fortiwebcloud"],
            "ModSecurity": ["modsecurity"]
        };

        let detectedWAFs = [];

        // Check headers for WAF signatures
        for (const [provider, signatures] of Object.entries(wafSignatures)) {
            const headersString = JSON.stringify(headers).toLowerCase();
            if (signatures.some(sig => headersString.includes(sig.toLowerCase()))) {
                detectedWAFs.push(provider);
            }
        }

        // Analyze WAF rules and protection capabilities
        const ruleAnalysis = analyzeWafRules(detectedWAFs, headers, statusCode);

        // Return results with proper headers
        return new Response(
            JSON.stringify({ 
                waf: detectedWAFs.length > 0 ? detectedWAFs : "No WAF detected",
                headers: headers,
                statusCode: statusCode,
                methodUsed: methodUsed,
                ruleAnalysis: ruleAnalysis
            }), 
            { 
                status: 200,
                headers: { "Content-Type": "application/json" }
            }
        );
    } catch (error) {
        console.error("WAF detection error:", error);
        
        // Return more detailed error for troubleshooting
        return new Response(
            JSON.stringify({ 
                error: `Scan failed: ${error.message}`,
                url: targetUrl,
                timestamp: new Date().toISOString(),
                errorType: error.name,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }), 
            { 
                status: 500,
                headers: { "Content-Type": "application/json" } 
            }
        );
    }
}

// Also support POST method for backward compatibility
export async function POST(req) {
    try {
        const body = await req.json();
        const url = body.url;
        
        // Create a new request with the URL as a search parameter
        const newUrl = new URL(req.url);
        newUrl.searchParams.set("url", url);
        
        // Forward to the GET handler
        return GET(new Request(newUrl, {
            headers: req.headers
        }));
    } catch (error) {
        return new Response(
            JSON.stringify({ 
                error: `Invalid request: ${error.message}` 
            }), 
            { 
                status: 400,
                headers: { "Content-Type": "application/json" } 
            }
        );
    }
}