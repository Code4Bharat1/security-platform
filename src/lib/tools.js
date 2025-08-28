export const tools = [
  {
    name: "WAF Scanner",
    image: "/tools/card-images/waf1.png",
    description: "Detects and analyzes WAF protection on a website, providing insights into security rules",
    slug: "firewallDashboard",
    buttonLabel: "Check WAF",
    type: "blue-team"
  },
  {
    name: "Vulnerability Scanner",
    image: "/tools/card-images/vuln_scanner.png",
    description: "Scan websites for security weaknesses like XSS or SQL injection.",
    slug: "vuln-scanner",
    buttonLabel: "Scan for Vulnerabilities",
    type: "red-team"
  },
  {
    name: "Source Code Analyzer",
    image: "/tools/card-images/tools/card-images/ode.png",
    description: "Scan websites for security weaknesses like XSS or SQL injection.",
    slug: "Source-Code",
    buttonLabel: "Check Your Code's",
    type: "red-team"
  },
  {
    name: "Checkmarx Scanner",
    image: "/tools/card-images/tools/card-images/heckmarx.png",
    description: "Scan websites for security weaknesses like XSS or SQL injection.",
    slug: "codeAnalysis",
    buttonLabel: "Scan your codes",
    type: "red-team"
  },
  {
    name: "Subdomain Scanner",
    image: "/tools/card-images/subdomain.png",
    description: "Scan websites for analyzing subdomains and their security posture.",
    slug: "subdomainEnumeration",
    buttonLabel: "Scan your website",
    type: "red-team"
  },
  {
    name: "Website Recon",
    image: "/tools/card-images/web-recon.png",
    description: "Perform an in-depth reconnaissance of a website to identify key metadata, technologies used.",
    slug: "webrecon",
    buttonLabel: "Website Recon",
    type: "red-team"
  },
  {
    name: "Technology Fingerprinter",
    image: "/tools/card-images/fingerprint.png",
    description: "un an OWASP ZAP-powered automated security scan to detect vulnerabilities.",
    slug: "fingerPrint",
    buttonLabel: "fingerPrint",
    type: "red-team"
  },
  {
    name: "Brute Force Scanner",
    image: "/tools/card-images/brute-force.png",
    description: "un an OWASP ZAP-powered automated security scan to detect vulnerabilities.",
    slug: "bruteForce",
    buttonLabel: "bruteForce",
    type: "red-team"
  },
  {
    name: "Mocha Testing",
    image: "/tools/card-images/mocha-logo.png",
    description: "Displays all available Mocha commands, options, and usage details.",
    slug: "mochaForm",
    buttonLabel: "Mocha Testing",
    type: "red-team"
  },
  {
    name: "Broken link Checker",
    image: "/tools/card-images/brokenlink1.png",
    description: "Scans web pages for dead or broken links, helping maintain SEO integrity",
    slug: "brokenStreamForm",
    buttonLabel: "Scan for Vulnerabilities",
    type: "non-tech"
  },
  {
    name: "Wordpress Scanner",
    image: "/tools/card-images/wordpress-secure.png",
    description: "Check for outdated plugins, misconfigurations, and known vulnerabilities.",
    slug: "wordpressForm",
    buttonLabel: "Scan for Wordpress",
    type: "red-team"
  },
  {
    name: "Sitemap Generator",
    image: "/tools/card-images/sitemap1.png",
    description: "Creates an XML sitemap to help search engines index a website efficiently",
    slug: "sitemapForm",
    buttonLabel: "Generate Sitemap",
    type: "non-tech"
  },
  {
    name: "API Testing",
    image: "/tools/card-images/api.png",
    description: "Allows users to test API endpoints, validating functionality and security headers",
    slug: "apiForm",
    buttonLabel: "Scan for API",
    type: "red-team"
  },
  {
    name: "Port Scanner",
    image: "/tools/card-images/port_scan.png",
    description: "Allows users to test API endpoints, validating functionality, security headers",
    slug: "portScannerForm",
    buttonLabel: "Check Headers",
    type: "red-team"
  },
    // {
  //   name: "ASN Lookup",
  //   image: "/asn-logo.png",
  //   description: "Retrieve details about an Autonomous System Number (ASN).",
  //   slug: "asnLookup",
  //   buttonLabel: "ASN Lookup",
  //   type: "blue-team"
  // },
    // {
  //   name: "Sharepoint Scanner",
  //   image: "/sharepoint.png",
  //   description: "Analyze SharePoint environments for security misconfigurations, permission issues.",
  //   slug: "sharepointForm",
  //   buttonLabel: "Sharepoint Scan",
  //   type: "blue-team"
  // },
  {
    name: "Clickjacking Tester",
    image: "/tools/card-images/tools/card-images/lickjacking.png",
    description: " Check for UI redressing vulnerabilities in a webpage.",
    slug: "clickjackingTester",
    buttonLabel: "Clickjacking Tester",
    type: "red-team"
  },
  {
    name: "CSRF Vulnerability Scanner",
    image: "/tools/card-images/tools/card-images/srf.png",
    description: " Check for UI redressing vulnerabilities in a webpage.",
    slug: "csrfChecker",
    buttonLabel: "CSRF Vulnerability Scanner",
    type: "red-team"
  },
  {
    name: "HTTPS Security Checker",
    image: "/tools/card-images/https-security.png",
    description: " Validate HTTPS security implementation.",
    slug: "httpsCheckerForm",
    buttonLabel: "HTTPS Security Checker",
    type: "blue-team"
  },
  {
    name: "JWT Signature Validator",
    image: "/tools/card-images/jwt_signature.png",
    description: "Ensure JWT signature integrity.",
    slug: "JWTSignatureValidator",
    buttonLabel: "JWT Signature Validator",
    type: "blue-team"
  },
  {
    name: "OAuth Token Analyzer",
    image: "/tools/card-images/oauth.png",
    description: " Inspect OAuth tokens for security risks.",
    slug: "OAuthTokenInspector",
    buttonLabel: "OAuth Token Analyzer",
    type: "blue-team"
  },
  {
    name: " Obfuscation Detector",
    image: "/tools/card-images/obfuscation.png",
    description: "Identify obfuscation techniques in code.",
    slug: "obfuscationChecker",
    buttonLabel: "Obfuscation Detector",
    type: "blue-team"
  },
  {
    name: "Open Redirect Tester ",
    image: "/tools/card-images/open-redirect.png",
    description: "Find unsafe redirection vulnerabilities.",
    slug: "openRedirectTester",
    buttonLabel: "Open Redirect Tester ",
    type: "red-team"
  },
  {
    name: "Regex Security Validator",
    image: "/tools/card-images/regex.png",
    description: "Check regular expressions for security flaws",
    slug: "regexDetector",
    buttonLabel: "Regex Security Validator",
    type: "blue-team"
  },
  {
    name: "Reverse DNS Resolver ",
    image: "/tools/card-images/reverse_dns.png",
    description: "Retrieve domain names linked to an IP.",
    slug: "reverseDNSLookup",
    buttonLabel: "Reverse DNS Resolver",
    type: "blue-team"
  },
  {
    name: "Secret Key Scanner",
    image: "/tools/card-images/secret_key_scanner.png",
    description: "Search for exposed API keys or credentials.",
    slug: "secretKeyScanner",
    buttonLabel: "Secret Key Scanner",
    type: "red-team"
  },
  {
    name: "Session Fixation Tester",
    image: "/tools/card-images/session_fixation.png",
    description: "Detect session fixation vulnerabilities",
    slug: "sessionFixationChecker",
    buttonLabel: "Session Fixation Tester",
    type: "red-team"
  },
  {
    name: "Whois Domain Lookup",
    image: "/tools/card-images/whois.png",
    description: "Retrieve domain registration and ownership details.",
    slug: "whoisLookup",
    buttonLabel: "Whois Domain Lookup",
    type: "red-team"
  },
  {
    name: "XSS Vulnerability Tester",
    image: "/tools/card-images/xss.png",
    description: "Identify Cross-Site Scripting (XSS) risks",
    slug: "xssTester",
    buttonLabel: "XSS Vulnerability Tester",
    type: "red-team"
  },
  {
    name: "Meta Tag Analyzer",
    image: "/tools/card-images/meta_tag.png",
    description: "Analyze meta tags like title, description, and keywords.",
    slug: "meta-tag",
    buttonLabel: "Analyze Meta Tags",
    type: "non-tech"
  },
  {
    name: "Keyword Density Checker",
    image: "/tools/card-images/keyword_checker.png",
    description: "Analyze keyword frequency for SEO structuring on website.",
    slug: "keyword-checker",
    buttonLabel: "Check Keyword Density",
    type: "non-tech"
  },
  {
    name: "Link Detector",
    image: "/tools/card-images/link_dec.png",
    description: "This tool helps detect malicious, suspicious, or unsafe links.",
    slug: "check-link",
    buttonLabel: "Check Link",
    type: "non-tech"
  },
  {
    name: "SecureCrypt",
    image: "/tools/card-images/dycrypt.png",
    description: "Encrypts and decrypts text using secure algorithms.",
    slug: "securecrypt",
    buttonLabel: "Encrypt Now",
    type: "non-tech"
  },
  {
    name: "SQLi Scanner",
    image: "/tools/card-images/sql_injection.png",
    description: "This tool scans websites for SQL Injection vulnerabilities.",
    slug: "nexpose-scan",
    buttonLabel: "Scan SQLi",
    type: "red-team"
  },
  {
    name: "MDR Monitor",
    image: "/tools/card-images/MDR.png",
    description: "Monitors and responds to real-time security threats.",
    slug: "mdr-monitor",
    buttonLabel: "Start Monitoring",
    type: "blue-team"
  },
  {
    name: "File Scanner",
    image: "/tools/card-images/folder-scan.png",
    description: "Scans files for malware or suspicious files.",
    slug: "folder-threat-scanner",
    buttonLabel: "Scan File",
    type: "non-tech"
  },
  {
    name: "WhatsApp Privacy Inspector",
    image: "/tools/card-images/wp.png",
    description: "Checks WhatsApp settings for potential privacy risks.",
    slug: "whatsapp-privacy-inspector",
    buttonLabel: "Inspect Now",
    type: "non-tech"
  },
  {
    name: "Email Attachment Analyzer",
    image: "/tools/card-images/email.png",
    description: "Scans email attachments for malware or hidden threats.",
    slug: "email-attachment-analyzer",
    buttonLabel: "Analyze File",
    type: "non-tech"
  },
  {
    name: " IP Address Info Finder",
    image: "/tools/card-images/ip.png",
    description: "Fetches location and network details of an IP address.",
    slug: "ip-address-info-finder",
    buttonLabel: "Find Info",
    type: "non-tech"
  },
  {
    name: "QR Tool",
    image: "/tools/card-images/QR.png",
    description: "Unsafe QR & QR Generater.",
    slug: "fake-qr-code-detector",
    buttonLabel: "Scan QR",
    type: "non-tech"
  },
  {
    name: "Website Optimization Tool",
    image: "/tools/card-images/optimization.png",
    description: "Detects deployment issues like unused code, large assets, and slow-loading elements.",
    slug: "website-optimization-tool",
    buttonLabel: "Check Optimization",
    type: "non-tech"
  },
  {
    name: "SEO Score Analyzer Tool",
    image: "/tools/card-images/seo-score.png",
    description: "Analyzes website SEO and provides improvement tips.",
    slug: "seo-score-analyzer-tool",
    buttonLabel: "Analyze SEO",
    type: "non-tech"
  },
  {
    name: "Keyword Generator",
    image: "/tools/card-images/keyword-generate.png",
    description: "Extract SEO-Friendly Keyword Suggestions.",
    slug: "KeywordGenerator",
    buttonLabel: "Generate Keyword",
    type: "non-tech"
  },
  {
    name: "Data Breach",
    image: "/tools/card-images/DataBreach1.png",
    description: "Find Where Your Email , Phone No. Or Username is Exposed",
    slug: "osint",
    buttonLabel: "Check Info",
    type: "non-tech"
  },
  {
    name: "URL Shortener",
    image: "/tools/card-images/shorted-url.png",
    description: "Make Links Short and Simple.",
    slug: "url-shortener",
    buttonLabel: "Shorten URL",
    type: "non-tech"
  },
  {
    name: "Database Security Checker",
    image: "/tools/card-images/DB-Security.png",
    description: "Database Safety Checker With Score.",
    slug: "DbSecurityChecker",
    buttonLabel: "Check Security",
    type: "red-team"
  },
   {
    name: "PDF",
    image: "PDF.png",
    description: "Create Your PDF.",
    slug: "PDF",
    buttonLabel: "Create PDF",
    type: "non-tech"
  },
   

  {
    name: "Domain-to-IP",
    image: "domain.png",
    description: "Description ......",
    slug: "domain-to-ip",
    buttonLabel: "Use ",
    type: "blue-team"
  },


   {
    name: "Chrome Extention",
    image: "chrome.png",
    description: "Description Chrome Extention ....",
    slug: "Chrome-Extention",
    buttonLabel: "Use Chrome Extention",
    type: "non-tech"
  },
  {
    name: "Password Strength Checker",
    image: "password-checker.png",
    description: "Description Passsword Strenght Checker....",
    slug: "password-checker",
    buttonLabel: "Check Your Password",
    type: "non-tech"
  },
   {
    name: "Data Leak",
    image: "data-leak.png",
    description: "Description Data Leak....",
    slug: "Data-Leak",
    buttonLabel: "Find Data Leak",
    type: "blue-team"
  },
];
