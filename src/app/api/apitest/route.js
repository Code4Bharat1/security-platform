const express = require("express");
const axios = require("axios");
const app = express();
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

// Apply basic security middleware
app.use(helmet());
app.use(express.json({ limit: '1mb' }));

// Rate limiting to prevent abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(apiLimiter);

// Function to test API security aspects
const testAPI = async (url, method, headers, body, options = {}) => {
  try {
    // Validate URL format before proceeding
    if (!isValidUrl(url)) {
      return { error: "Invalid URL format" };
    }

    // Add default headers for testing if not provided
    const testHeaders = {
      "User-Agent": "API-Security-Tester/1.0",
      ...headers
    };

    const response = await axios({
      method,
      url,
      headers: testHeaders,
      data: body,
      timeout: options.timeout || 5000, // Prevent long wait times
      validateStatus: () => true, // Don't throw on any status code
    });

    // Perform comprehensive security analysis
    return {
      status: response.status,
      statusText: response.statusText,
      responseTime: response.headers['x-response-time'] || 'Not provided',
      securityScorecard: calculateSecurityScore(response),
      securityChecks: {
        authentication: analyzeAuthentication(headers, response),
        sensitiveDataExposure: checkSensitiveData(response.data),
        headerSecurity: checkSecurityHeaders(response.headers),
        injectionVulnerability: checkForInjectionVulnerability(response),
        cors: analyzeCorsPolicy(response.headers),
        ssl: analyzeSSL(url, response),
      },
      recommendations: generateRecommendations(response, headers)
    };
  } catch (error) {
    console.error(`Error testing API ${url}:`, error.message);
    return { 
      error: error.message,
      errorType: error.code || error.name,
      recommendations: [
        "Ensure the API endpoint is accessible and correct",
        "Check network connectivity",
        error.code === 'ECONNREFUSED' ? "The server may be down or blocking requests" : null,
        error.code === 'ETIMEDOUT' ? "Consider increasing the timeout value" : null
      ].filter(Boolean)
    };
  }
};

// Validate URL format
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Calculate overall security score based on findings
function calculateSecurityScore(response) {
  let score = 100;
  const headers = response.headers;
  
  // Deduct points for missing security headers
  if (!headers["content-security-policy"]) score -= 10;
  if (!headers["x-content-type-options"]) score -= 5;
  if (!headers["x-frame-options"]) score -= 5;
  if (!headers["strict-transport-security"]) score -= 10;
  
  // Deduct points for questionable CORS settings
  if (headers["access-control-allow-origin"] === "*") score -= 8;
  
  // HTTP instead of HTTPS
  if (response.config.url.startsWith("http://")) score -= 20;
  
  // Potential sensitive data exposure
  if (JSON.stringify(response.data).match(/(password|token|secret|key|credential)/i)) score -= 15;
  
  // Status code issues
  if (response.status === 500) score -= 5; // Internal server error
  
  return {
    score: Math.max(0, score),
    rating: score > 90 ? "Excellent" : score > 70 ? "Good" : score > 50 ? "Fair" : "Poor"
  };
}

// Function to analyze authentication
function analyzeAuthentication(requestHeaders, response) {
  const authHeader = requestHeaders.Authorization || requestHeaders.authorization;
  
  // Check for common auth headers
  if (authHeader) {
    if (authHeader.startsWith("Bearer ")) {
      return {
        status: "JWT/Bearer Token Present",
        secure: authHeader.startsWith("Bearer ey") ? "Valid JWT format" : "Suspicious token format",
      };
    } else if (authHeader.startsWith("Basic ")) {
      return {
        status: "Basic Auth Present",
        secure: "Warning: Basic Auth transmits credentials in base64 encoding (not encrypted)",
      };
    } else {
      return {
        status: "Custom Auth Present",
        secure: "Unknown authentication scheme",
      };
    }
  }
  
  // Check for API key in headers or query
  const potentialApiKeys = Object.keys(requestHeaders).filter(key => 
    key.toLowerCase().includes('api-key') || 
    key.toLowerCase().includes('apikey') || 
    key.toLowerCase().includes('x-api-key')
  );
  
  if (potentialApiKeys.length > 0) {
    return {
      status: "API Key Present",
      secure: "API keys should be kept secure and rotated regularly",
    };
  }
  
  // Check for auth-related cookies
  const cookies = requestHeaders.cookie || '';
  if (cookies.includes('session') || cookies.includes('token') || cookies.includes('auth')) {
    return {
      status: "Cookie-based Auth Present",
      secure: "Ensure cookies use HttpOnly and Secure flags",
    };
  }
  
  // No auth detected
  return {
    status: "No Authentication Detected",
    secure: response.status === 401 ? "API correctly returns 401 Unauthorized" : "API allows unauthenticated access",
  };
}

// Function to check security headers
function checkSecurityHeaders(headers) {
  return {
    CORS: analyzeCorsPolicy(headers),
    ContentSecurityPolicy: headers["content-security-policy"] 
      ? { status: "Enabled", value: summarizeCSP(headers["content-security-policy"]) } 
      : { status: "Missing", recommendation: "Implement Content-Security-Policy" },
    XFrameOptions: headers["x-frame-options"] 
      ? { status: "Configured", value: headers["x-frame-options"] } 
      : { status: "Not Configured", recommendation: "Set X-Frame-Options to DENY or SAMEORIGIN" },
    StrictTransportSecurity: headers["strict-transport-security"] 
      ? { status: "Enabled", value: headers["strict-transport-security"] } 
      : { status: "Missing", recommendation: "Implement HSTS" },
    XContentTypeOptions: headers["x-content-type-options"] 
      ? { status: "Configured", value: headers["x-content-type-options"] } 
      : { status: "Missing", recommendation: "Set X-Content-Type-Options to nosniff" },
    ReferrerPolicy: headers["referrer-policy"] 
      ? { status: "Configured", value: headers["referrer-policy"] } 
      : { status: "Missing", recommendation: "Consider setting a Referrer-Policy" },
    PermissionsPolicy: headers["permissions-policy"] 
      ? { status: "Configured" } 
      : { status: "Missing", recommendation: "Consider implementing Permissions-Policy" },
  };
}

// Function to detect sensitive data exposure
function checkSensitiveData(data) {
  // Deeper regex patterns for common sensitive information
  const regexPatterns = {
    password: /\b(?:password|passwd|pwd)\b\s*[=:]\s*["']?[^"'\s]+["']?/i,
    token: /\b(?:token|auth_token|access_token|jwt)\b\s*[=:]\s*["']?[A-Za-z0-9._-]+["']?/i,
    secret: /\b(?:secret|api_secret|client_secret)\b\s*[=:]\s*["']?[^"'\s]+["']?/i,
    key: /\b(?:key|api_key|apikey|private_key)\b\s*[=:]\s*["']?[^"'\s]+["']?/i,
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
    ssn: /\b\d{3}-?\d{2}-?\d{4}\b/,
    creditCard: /\b(?:\d{4}[- ]?){3}\d{4}\b/,
    ipAddress: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/,
  };

  // Convert data to string for analysis
  const dataString = typeof data === 'object' ? JSON.stringify(data) : String(data);
  
  const findings = {};
  let exposureDetected = false;
  
  // Check each pattern
  for (const [key, regex] of Object.entries(regexPatterns)) {
    const matches = dataString.match(regex);
    if (matches) {
      exposureDetected = true;
      findings[key] = matches.length === 1 
        ? "Potential exposure detected" 
        : `Multiple exposures detected (${matches.length})`;
    }
  }
  
  return {
    status: exposureDetected ? "Potential Data Exposure" : "No obvious data exposure",
    details: exposureDetected ? findings : "No sensitive data patterns detected in response",
    recommendation: exposureDetected ? "Review and secure the exposed data in responses" : "",
  };
}

// Check for potential injection vulnerabilities
function checkForInjectionVulnerability(response) {
  const responseData = typeof response.data === 'object' ? JSON.stringify(response.data) : String(response.data);
  
  // Check for error messages that might indicate injection vulnerabilities
  const sqlErrorPatterns = [
    /SQL syntax/i,
    /ORA-\d{5}/i, // Oracle errors
    /SQLSTATE\[\d+/i,
    /mysqli?_/i,
    /PDOException/i,
    /DB2 SQL error/i,
    /syntax error at or near/i // PostgreSQL
  ];
  
  const noSqlErrorPatterns = [
    /MongoDB.*?Error/i,
    /CouchDB.*?Error/i,
    /TypeError.*?Cannot read property/i
  ];
  
  const stackTracePatterns = [
    /at .* \(.*:\d+:\d+\)/i,
    /File ".*", line \d+/i,
    /on line \d+/i
  ];
  
  let findings = {};
  
  // Check for SQL injection clues
  for (const pattern of sqlErrorPatterns) {
    if (pattern.test(responseData)) {
      findings.sqlInjection = "Potential SQL error disclosure detected";
      break;
    }
  }
  
  // Check for NoSQL injection clues
  for (const pattern of noSqlErrorPatterns) {
    if (pattern.test(responseData)) {
      findings.noSqlInjection = "Potential NoSQL error disclosure detected";
      break;
    }
  }
  
  // Check for stack traces
  for (const pattern of stackTracePatterns) {
    if (pattern.test(responseData)) {
      findings.stackTrace = "Potential stack trace disclosure detected";
      break;
    }
  }
  
  // Check for common error disclosure patterns
  if (/exception|error|failure|warning|debug/i.test(responseData)) {
    findings.errorDisclosure = "General error information disclosure detected";
  }
  
  const vulnerabilityDetected = Object.keys(findings).length > 0;
  
  return {
    status: vulnerabilityDetected ? "Potential Vulnerabilities Detected" : "No obvious vulnerabilities",
    details: vulnerabilityDetected ? findings : "No common error patterns detected in response",
    recommendation: vulnerabilityDetected ? 
      "Review error handling and ensure detailed errors are not exposed to clients" : "",
  };
}

// Analyze CORS policy
function analyzeCorsPolicy(headers) {
  const corsHeaders = {
    allowOrigin: headers["access-control-allow-origin"],
    allowMethods: headers["access-control-allow-methods"],
    allowHeaders: headers["access-control-allow-headers"],
    allowCredentials: headers["access-control-allow-credentials"],
    exposeHeaders: headers["access-control-expose-headers"],
    maxAge: headers["access-control-max-age"]
  };
  
  // Filter out undefined values
  const activeCorsHeaders = Object.fromEntries(
    Object.entries(corsHeaders).filter(([_, v]) => v !== undefined)
  );
  
  let corsStatus = "Not Configured";
  let recommendation = "";
  
  if (Object.keys(activeCorsHeaders).length > 0) {
    corsStatus = "Configured";
    
    // Check for overly permissive settings
    if (corsHeaders.allowOrigin === "*") {
      recommendation = "Warning: Wildcard origin (*) allows any site to make requests";
    } else if (corsHeaders.allowOrigin && !corsHeaders.allowOrigin.startsWith("https://")) {
      recommendation = "Consider restricting CORS to secure origins (https://)";
    }
    
    if (corsHeaders.allowCredentials === "true" && corsHeaders.allowOrigin === "*") {
      recommendation += "\nUnsafe configuration: allowCredentials with wildcard origin";
    }
  } else {
    recommendation = "CORS is not configured, which may be intentional for non-browser APIs";
  }
  
  return {
    status: corsStatus,
    details: Object.keys(activeCorsHeaders).length > 0 ? activeCorsHeaders : "No CORS headers found",
    recommendation
  };
}

// Analyze SSL/TLS configuration
function analyzeSSL(url, response) {
  const isHttps = url.startsWith("https://");
  
  if (!isHttps) {
    return {
      status: "Insecure",
      details: "Connection is not using HTTPS",
      recommendation: "Implement HTTPS with a valid SSL/TLS certificate"
    };
  }
  
  // Check HSTS header
  const hstsHeader = response.headers["strict-transport-security"];
  
  return {
    status: "Secure",
    details: "Connection is using HTTPS",
    hstsStatus: hstsHeader ? 
      "HSTS Implemented" : 
      "HSTS Not Implemented",
    recommendation: !hstsHeader ? 
      "Consider implementing HSTS (Strict-Transport-Security header)" : ""
  };
}

// Summarize CSP for readability
function summarizeCSP(cspHeader) {
  if (!cspHeader) return "Not provided";
  
  // If CSP is very long, provide a summary
  if (cspHeader.length > 100) {
    const directives = cspHeader.split(';').length;
    return `${directives} directives configured (${cspHeader.substring(0, 50)}...)`;
  }
  
  return cspHeader;
}

// Generate actionable recommendations
function generateRecommendations(response, requestHeaders) {
  const recommendations = [];
  const headers = response.headers;
  
  // Authentication recommendations
  if (!requestHeaders.Authorization && !requestHeaders.authorization) {
    recommendations.push("Implement authentication for API endpoints with sensitive operations");
  }
  
  // Security header recommendations
  if (!headers["content-security-policy"]) {
    recommendations.push("Implement Content-Security-Policy header");
  }
  
  if (!headers["x-frame-options"]) {
    recommendations.push("Set X-Frame-Options header to DENY or SAMEORIGIN");
  }
  
  if (!headers["strict-transport-security"]) {
    recommendations.push("Implement HTTP Strict Transport Security (HSTS)");
  }
  
  if (!headers["x-content-type-options"]) {
    recommendations.push("Set X-Content-Type-Options header to nosniff");
  }
  
  // CORS recommendations
  if (headers["access-control-allow-origin"] === "*") {
    recommendations.push("Avoid using wildcard (*) in Access-Control-Allow-Origin");
  }
  
  // HTTP vs HTTPS
  if (response.config.url.startsWith("http://")) {
    recommendations.push("Switch from HTTP to HTTPS for secure communication");
  }
  
  // Rate limiting recommendations
  if (!headers["x-ratelimit-limit"] && !headers["x-rate-limit-limit"]) {
    recommendations.push("Implement rate limiting to prevent abuse");
  }
  
  // Content type recommendations
  if (!headers["content-type"]) {
    recommendations.push("Specify Content-Type header in responses");
  }
  
  return recommendations;
}

// Create routes for API testing
app.post("/api/apitest", async (req, res) => {
  const { url, method = "GET", headers = {}, body = {}, options = {} } = req.body;
  
  if (!url) {
    return res.status(400).json({ 
      error: "API URL is required",
      example: {
        url: "https://api.example.com/endpoint",
        method: "GET",
        headers: { "Authorization": "Bearer token", "Content-Type": "application/json" },
        body: { key: "value" }
      }
    });
  }
  
  try {
    const result = await testAPI(url, method, headers, body, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: "An unexpected error occurred while processing your request",
      message: error.message
    });
  }
});

// Add a health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", uptime: process.uptime() });
});

// Add a simple documentation endpoint
app.get("/", (req, res) => {
  res.json({
    name: "API Security Tester",
    version: "1.0.0",
    endpoints: {
      "/api/apitest": {
        method: "POST",
        description: "Test the security of an API endpoint",
        body: {
          url: "Required - The API URL to test",
          method: "Optional - HTTP method (default: GET)",
          headers: "Optional - Request headers object",
          body: "Optional - Request body object",
          options: "Optional - Additional testing options"
        },
        example: {
          request: {
            url: "https://api.example.com/users",
            method: "POST",
            headers: {
              "Authorization": "Bearer YOUR_TOKEN",
              "Content-Type": "application/json"
            },
            body: {
              "username": "testuser"
            }
          }
        }
      },
      "/health": {
        method: "GET",
        description: "Health check endpoint"
      }
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error:", err.stack);
  res.status(500).json({
    error: "Server Error",
    message: "Something went wrong while processing your request"
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API Security Tester running on http://localhost:${PORT}`));

// Export app for testing
module.exports = app;