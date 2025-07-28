export const tools = [
  {
    name: "WAF Scanner",
    image: "waf1.png",
    description: "Detects and analyzes WAF protection on a website, providing insights into security rules",
    slug: "firewallDashboard",
    buttonLabel: "Check WAF",
    type: "blue-team"
  },
  {
    name: "Vulnerability Scanner",
    image: "vuln_scanner.png",
    description: "Scan websites for security weaknesses like XSS or SQL injection.",
    slug: "vuln-scanner",
    buttonLabel: "Scan for Vulnerabilities",
    type: "red-team"
  },
  {
    name: "Source Code Analyzer",
    image: "Code.png",
    description: "Scan websites for security weaknesses like XSS or SQL injection.",
    slug: "Source-Code",
    buttonLabel: "Check Your Code's",
    type: "red-team"
  },
  {
    name: "Checkmarx Scanner",
    image: "checkmarx.png",
    description: "Scan websites for security weaknesses like XSS or SQL injection.",
    slug: "codeAnalysis",
    buttonLabel: "Scan your codes",
    type: "red-team"
  },
  {
    name: "Subdomain Scanner",
    image: "subdomain.png",
    description: "Scan websites for analyzing subdomains and their security posture.",
    slug: "subdomainEnumeration",
    buttonLabel: "Scan your website",
    type: "red-team"
  },
  {
    name: "Website Recon",
    image: "web-recon.png",
    description: "Perform an in-depth reconnaissance of a website to identify key metadata, technologies used.",
    slug: "webrecon",
    buttonLabel: "Website Recon",
    type: "red-team"
  },
  {
    name: "Technology Fingerprinter",
    image: "fingerprint.png",
    description: "un an OWASP ZAP-powered automated security scan to detect vulnerabilities.",
    slug: "fingerPrint",
    buttonLabel: "fingerPrint",
    type: "red-team"
  },
  {
    name: "Brute Force Scanner",
    image: "brute-force.png",
    description: "un an OWASP ZAP-powered automated security scan to detect vulnerabilities.",
    slug: "bruteForce",
    buttonLabel: "bruteForce",
    type: "red-team"
  },
  {
    name: "Mocha Testing",
    image: "mocha-logo.png",
    description: "Displays all available Mocha commands, options, and usage details.",
    slug: "mochaForm",
    buttonLabel: "Mocha Testing",
    type: "red-team"
  },
  {
    name: "Sharepoint Scanner",
    image: "sharepoint.png",
    description: "Analyze SharePoint environments for security misconfigurations, permission issues.",
    slug: "sharepointForm",
    buttonLabel: "Sharepoint Scan",
    type: "blue-team"
  },
  {
    name: "Broken link Checker",
    image: "brokenlink1.png",
    description: "Scans web pages for dead or broken links, helping maintain SEO integrity",
    slug: "brokenStreamForm",
    buttonLabel: "Scan for Vulnerabilities",
    type: "non-tech"
  },
  {
    name: "Wordpress Scanner",
    image: "wordpress-secure.png",
    description: "Check for outdated plugins, misconfigurations, and known vulnerabilities.",
    slug: "wordpressForm",
    buttonLabel: "Scan for Wordpress",
    type: "red-team"
  },
  {
    name: "Sitemap Generator",
    image: "sitemap1.png",
    description: "Creates an XML sitemap to help search engines index a website efficiently",
    slug: "sitemapForm",
    buttonLabel: "Generate Sitemap",
    type: "non-tech"
  },
  {
    name: "API Testing",
    image: "api.png",
    description: "Allows users to test API endpoints, validating functionality and security headers",
    slug: "apiForm",
    buttonLabel: "Scan for API",
    type: "red-team"
  },
  {
    name: "Port Scanner",
    image: "port_scan.png",
    description: "Allows users to test API endpoints, validating functionality, security headers",
    slug: "portScannerForm",
    buttonLabel: "Check Headers",
    type: "red-team"
  },
  {
    name: "ASN Lookup",
    image: "asn-logo.png",
    description: "Retrieve details about an Autonomous System Number (ASN).",
    slug: "asnLookup",
    buttonLabel: "ASN Lookup",
    type: "blue-team"
  },
  {
    name: "Clickjacking Tester",
    image: "clickjacking.png",
    description: " Check for UI redressing vulnerabilities in a webpage.",
    slug: "clickjackingTester",
    buttonLabel: "Clickjacking Tester",
    type: "red-team"
  },
  {
    name: "CSRF Vulnerability Scanner",
    image: "csrf.png",
    description: " Check for UI redressing vulnerabilities in a webpage.",
    slug: "csrfChecker",
    buttonLabel: "CSRF Vulnerability Scanner",
    type: "red-team"
  },
  {
    name: "HTTPS Security Checker",
    image: "https-security.png",
    description: " Validate HTTPS security implementation.",
    slug: "httpsCheckerForm",
    buttonLabel: "HTTPS Security Checker",
    type: "blue-team"
  },
  {
    name: "JWT Checker",
    image: "jwt_checker.png",
    description: " Verify JWT authenticity and expiration",
    slug: "jwtForm",
    buttonLabel: "JWT Checker",
    type: "blue-team"
  },
  {
    name: "JWT Signature Validator",
    image: "jwt_signature.png",
    description: "Ensure JWT signature integrity.",
    slug: "JWTSignatureValidator",
    buttonLabel: "JWT Signature Validator",
    type: "blue-team"
  },
  {
    name: "OAuth Token Analyzer",
    image: "oauth.png",
    description: " Inspect OAuth tokens for security risks.",
    slug: "OAuthTokenInspector",
    buttonLabel: "OAuth Token Analyzer",
    type: "blue-team"
  },
  {
    name: " Obfuscation Detector",
    image: "obfuscation.png",
    description: "Identify obfuscation techniques in code.",
    slug: "obfuscationChecker",
    buttonLabel: "Obfuscation Detector",
    type: "blue-team"
  },
  {
    name: "Open Redirect Tester ",
    image: "open-redirect.png",
    description: "Find unsafe redirection vulnerabilities.",
    slug: "openRedirectTester",
    buttonLabel: "Open Redirect Tester ",
    type: "red-team"
  },
  {
    name: "Regex Security Validator",
    image: "regex.png",
    description: "Check regular expressions for security flaws",
    slug: "regexDetector",
    buttonLabel: "Regex Security Validator",
    type: "blue-team"
  },
  {
    name: "Reverse DNS Resolver ",
    image: "reverse_dns.png",
    description: "Retrieve domain names linked to an IP.",
    slug: "reverseDNSLookup",
    buttonLabel: "Reverse DNS Resolver",
    type: "blue-team"
  },
  {
    name: "Secret Key Scanner",
    image: "secret_key_scanner.png",
    description: "Search for exposed API keys or credentials.",
    slug: "secretKeyScanner",
    buttonLabel: "Secret Key Scanner",
    type: "red-team"
  },
  {
    name: "Session Fixation Tester",
    image: "session_fixation.png",
    description: "Detect session fixation vulnerabilities",
    slug: "sessionFixationChecker",
    buttonLabel: "Session Fixation Tester",
    type: "red-team"
  },
  {
    name: "Whois Domain Lookup",
    image: "whois.png",
    description: "Retrieve domain registration and ownership details.",
    slug: "whoisLookup",
    buttonLabel: "Whois Domain Lookup",
    type: "red-team"
  },
  {
    name: "XSS Vulnerability Tester",
    image: "xss.png",
    description: "Identify Cross-Site Scripting (XSS) risks",
    slug: "xssTester",
    buttonLabel: "XSS Vulnerability Tester",
    type: "red-team"
  },
  {
    name: "Meta Tag Analyzer",
    image: "meta_tag.png",
    description: "Analyze meta tags like title, description, and keywords.",
    slug: "meta-tag",
    buttonLabel: "Analyze Meta Tags",
    type: "non-tech"
  },
  {
    name: "Keyword Density Checker",
    image: "keyword_checker.png",
    description: "Analyze keyword frequency for SEO structuring on website.",
    slug: "keyword-checker",
    buttonLabel: "Check Keyword Density",
    type: "non-tech"
  },
  {
    name: "Link Detector",
    image: "link_dec.png",
    description: "This tool helps detect malicious, suspicious, or unsafe links.",
    slug: "check-link",
    buttonLabel: "Check Link",
    type: "non-tech"
  },
  {
    name: "SecureCrypt",
    image: "dycrypt.png",
    description: "Encrypts and decrypts text using secure algorithms.",
    slug: "securecrypt",
    buttonLabel: "Encrypt Now",
    type: "non-tech"
  },
  {
    name: "SQLi Scanner",
    image: "sql_injection.png",
    description: "This tool scans websites for SQL Injection vulnerabilities.",
    slug: "nexpose-scan",
    buttonLabel: "Scan SQLi",
    type: "red-team"
  },
  {
    name: "MDR Monitor",
    image: "MDR.png",
    description: "Monitors and responds to real-time security threats.",
    slug: "mdr-monitor",
    buttonLabel: "Start Monitoring",
    type: "blue-team"
  },
  {
    name: "File Scanner",
    image: "folder-scan.png",
    description: "Scans files for malware or suspicious files.",
    slug: "folder-threat-scanner",
    buttonLabel: "Scan File",
    type: "non-tech"
  },
  {
    name: "WhatsApp Privacy Inspector",
    image: "wp.png",
    description: "Checks WhatsApp settings for potential privacy risks.",
    slug: "whatsapp-privacy-inspector",
    buttonLabel: "Inspect Now",
    type: "non-tech"
  },
  {
    name: "Email Attachment Analyzer",
    image: "email.png",
    description: "Scans email attachments for malware or hidden threats.",
    slug: "email-attachment-analyzer",
    buttonLabel: "Analyze File",
    type: "non-tech"
  },
  {
    name: " IP Address Info Finder",
    image: "ip.png",
    description: "Fetches location and network details of an IP address.",
    slug: "ip-address-info-finder",
    buttonLabel: "Find Info",
    type: "non-tech"
  },
  {
    name: "Unsafe QR Detector",
    image: "QR.png",
    description: "Scans QR codes to detect Fake And Unsafe QR.",
    slug: "fake-qr-code-detector1",
    buttonLabel: "Scan QR",
    type: "non-tech"
  },
  {
    name: "QR Generator",
    image: "QR.png",
    description: "Generates QR codes as per your needs.",
    slug: "fake-qr-code-detector",
    buttonLabel: "Scan QR",
    type: "non-tech"
  },
  {
    name: "Website Optimization Tool",
    image: "optimization.png",
    description: "Detects deployment issues like unused code, large assets, and slow-loading elements.",
    slug: "website-optimization-tool",
    buttonLabel: "Check Optimization",
    type: "non-tech"
  },
  {
    name: "SEO Score Analyzer Tool",
    image: "seo-score.png",
    description: "Analyzes website SEO and provides improvement tips.",
    slug: "seo-score-analyzer-tool",
    buttonLabel: "Analyze SEO",
    type: "non-tech"
  },
  {
    name: "Keyword Generator",
    image: "keyword-generate.png",
    description: "Extract SEO-Friendly Keyword Suggestions.",
    slug: "Keyword-Generate",
    buttonLabel: "Generate Keyword",
    type: "non-tech"
  },
  {
    name: "Data Breach",
    image: "DataBreach1.png",
    description: "Find Where Your Email , Phone No. Or Username is Exposed",
    slug: "my-info",
    buttonLabel: "Check Info",
    type: "non-tech"
  },
  {
    name: "URL Shortener",
    image: "shorted-url.png",
    description: "Make Links Short and Simple.",
    slug: "Link-Shoretner",
    buttonLabel: "Shorten URL",
    type: "non-tech"
  },
  {
    name: "Database Security Checker",
    image: "DB-Security.png",
    description: "Database Safety Checker With Score.",
    slug: "DB-Security-Check",
    buttonLabel: "Check Security",
    type: "red-team"
  },
];
