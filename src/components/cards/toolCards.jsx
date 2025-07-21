'use client'
import { useRouter } from "next/navigation";

const ToolCardsPage = () => {
  const router = useRouter();

  const tools = [
    {
      name: "WAF Scanner",
      image: "/waf1.png",
      description: "Detects and analyzes WAF protection on a website, providing insights into security rules",
      slug: "firewallDashboard",
      buttonLabel: "Check WAF",
    },
    {
      name: "Vulnerability Scanner",
      image: "/vuln_scanner.png",
      description: "Scan websites for security weaknesses like XSS or SQL injection.",
      slug: "vuln-scanner",
      buttonLabel: "Scan for Vulnerabilities",
    },
    {
      name: "Jest Scanner",
      image: "/jest.png",
      description: "Scan websites for security weaknesses like XSS or SQL injection.",
      slug: "codeForm",
      buttonLabel: "Jest Scanner",
    },
    {
      name: "Sonar Scanner",
      image: "/sonar-image.png",
      description: "Scan websites for security weaknesses like XSS or SQL injection.",
      slug: "sonarForm",
      buttonLabel: "Sonar Scanner",
    },
    {
      name: "Checkmarx Scanner",
      image: "/checkmarx.png",
      description: "Scan websites for security weaknesses like XSS or SQL injection.",
      slug: "codeAnalysis",
      buttonLabel: "Scan your codes",
    },


     {
      name: "subdomain Scanner",
      image: "/subdomain.png",
      description: "Scan websites for analyzing subdomains and their security posture.",
      slug: "subdomainEnumeration",
      buttonLabel: "Scan your website",
    },
    {
      name: "Website Recon",
      image: "/web-recon.png",
      description: "Perform an in-depth reconnaissance of a website to identify key metadata, technologies used.",
      slug: "webrecon",
      buttonLabel: "Website Recon",
    },
    {
      name: "Technology Fingerprinter",
      image: "/fingerprint.png",
      description: "un an OWASP ZAP-powered automated security scan to detect vulnerabilities.",
      slug: "fingerPrint",
      buttonLabel: "fingerPrint",
    },
    {
      name: "Brute Force Scanner",
      image: "/brute-force.png",
      description: "un an OWASP ZAP-powered automated security scan to detect vulnerabilities.",
      slug: "bruteForce",
      buttonLabel: "bruteForce",
    },
    {
      name: "Mocha Testing",
      image: "/mocha-logo.png",
      description: "Displays all available Mocha commands, options, and usage details.",
      slug: "mochaForm",
      buttonLabel: "Mocha Testing",
    },
    {
      name: "Sharepoint Scanner",
      image: "/sharepoint.png",
      description: "Analyze SharePoint environments for security misconfigurations, permission issues.",
      slug: "sharepointForm",
      buttonLabel: "Sharepoint Scan",
    },
    {
      name: "Broken link Checker",
      image: "/brokenlink1.png",
      description: "Scans web pages for dead or broken links, helping maintain SEO integrity",
      slug: "brokenStreamForm",
      buttonLabel: "Scan for Vulnerabilities",
    },
    {
      name: "Wordpress Scanner",
      image: "/wordpress-secure.png",
      description: "Check for outdated plugins, misconfigurations, and known vulnerabilities.",
      slug: "wordpressForm",
      buttonLabel: "Scan for Wordpress",
    },
    {
      name: "Sitemap Generator",
      image: "/sitemap1.png",
      description: "Creates an XML sitemap to help search engines index a website efficiently",
      slug: "sitemapForm",
      buttonLabel: "Generate Sitemap",
    },
    {
      name: "API Testing",
      image: "/api.png",
      description: "Allows users to test API endpoints, validating functionality and security headers",
      slug: "apiForm",
      buttonLabel: "Scan for API",
    },
    {
      name: "Port Scanner",
      image: "/port_scan.png",
      description: "Allows users to test API endpoints, validating functionality, security headers",
      slug: "portScannerForm",
      buttonLabel: "Check Headers",

    },

    {
      name: "ASN Lookup",
      image: "asn-logo.png",
      image: "/asn.png",
      description: "Retrieve details about an Autonomous System Number (ASN).",
      slug: "asnLookup",
      buttonLabel: "ASN Lookup",

    },
    {
      name: "Clickjacking Tester",
      image: "/clickjacking.png",
      description: " Check for UI redressing vulnerabilities in a webpage.",
      slug: "clickjackingTester",
      buttonLabel: "Clickjacking Tester",

    },
    {
      name: "CSRF Vulnerability Scanner",
      image: "/csrf.png",
      description: " Check for UI redressing vulnerabilities in a webpage.",
      slug: "csrfChecker",
      buttonLabel: "CSRF Vulnerability Scanner",

    },
    {
      name: "HTTPS Security Checker",
      image: "/https-security.png",
      description: " Validate HTTPS security implementation.",
      slug: "httpsCheckerForm",
      buttonLabel: "HTTPS Security Checker",

    },
    {
      name: "IP Geolocation Lookup",
      image: "/ipGeo.png",
      description: " Validate HTTPS security implementation.",
      slug: "ipGeo",
      buttonLabel: "IP Geolocation Lookup",

    },
    {
      name: "JWT Checker",
      image: "/jwt_checker.png",
      description: " Verify JWT authenticity and expiration",
      slug: "jwtForm",
      buttonLabel: "JWT Checker",

    },
    {
      name: "JWT Signature Validator",
      image: "/jwt_signature.png",
      description: "Ensure JWT signature integrity.",
      slug: "JWTSignatureValidator",
      buttonLabel: "JWT Signature Validator",

    },
    {
      name: "OAuth Token Analyzer",
      image: "/oauth.png",
      description: " Inspect OAuth tokens for security risks.",
      slug: "OAuthTokenInspector",
      buttonLabel: "OAuth Token Analyzer",

    },
    {
      name: " Obfuscation Detector",
      image: "/obfuscation.png",
      description: "Identify obfuscation techniques in code.",
      slug: "obfuscationChecker",
      buttonLabel: "Obfuscation Detector",

    },
    {
      name: "Open Redirect Tester ",
      image: "/open-redirect.png",
      description: "Find unsafe redirection vulnerabilities.",
      slug: "openRedirectTester",
      buttonLabel: "Open Redirect Tester ",
    },

    {
      name: " Regex Security Validator",
      image: "/regex.png",
      description: "Check regular expressions for security flaws",
      slug: "regexDetector",
      buttonLabel: "Regex Security Validator",
    },
    {
      name: "Reverse DNS Resolver ",
      image: "/reverse_dns.png",
      description: "Retrieve domain names linked to an IP.",
      slug: "reverseDNSLookup",
      buttonLabel: "Reverse DNS Resolver",
    },
    {
      name: "Secret Key Scanner",
      image: "/secret_key_scanner.png",
      description: "Search for exposed API keys or credentials.",
      slug: "secretKeyScanner",
      buttonLabel: "Secret Key Scanner",
    },
    {
      name: "Session Fixation Tester",
      image: "/session_fixation.png",
      description: "Detect session fixation vulnerabilities",
      slug: "sessionFixationChecker",
      buttonLabel: "Session Fixation Tester",
    },
    {
      name: "Whois Domain Lookup",
      image: "/whois.png",
      description: "Retrieve domain registration and ownership details.",
      slug: "whoisLookup",
      buttonLabel: "Whois Domain Lookup",
    },
    {
      name: "XSS Vulnerability Tester",
      image: "/xss.png",
      description: "Identify Cross-Site Scripting (XSS) risks",
      slug: "xssTester",
      buttonLabel: "XSS Vulnerability Tester",
    },
    {
      name: "Meta Tag Analyzer",
      image: "/meta_tag.png",
      description: "Analyze meta tags like title, description, and keywords.",
      slug: "meta-tag",
      buttonLabel: "Analyze Meta Tags",
    },
    {
      name: "Page Speed Tester",
      image: "/page_speed.png",
      description: "Evaluate webpage load speed and optimization recommendations.",
      slug: "page-speed",
      buttonLabel: "Test Page Speed",
    },
    {
      name: "Keyword Density Checker",
      image: "/keyword_checker.png",
      description: "Analyze keyword frequency for SEO structuring on website.",
      slug: "keyword-checker",
      buttonLabel: "Check Keyword Density",
    },

    {

      name: "Rogue WiFi Detector",
      image: "/wifi.png",
      description: "Scans for duplicate WiFi networks with suspicious behavior.",
      slug: "rogue-wifi-detector",
      buttonLabel: "Scan Now",
    },
    {
      name: "Link Detector",
      image: "/link_dec.png",
      description: "This tool helps detect malicious, suspicious, or unsafe links.",
      slug: "check-link",
      buttonLabel: "Check Link",
    },
    {
      name: "SQLi Scanner",
      image: "/sql_injection.png",
      description: "This tool scans websites for SQL Injection vulnerabilities.",
      slug: "sqli-scanner",
      buttonLabel: "Scan SQLi",
    },
    {
      name: "Hash Generator",
      image: "/hash.png",
      description: "This tool generates cryptographic hashes.",
      slug: "hash-generator",
      buttonLabel: "Generate Hash",
    },
    {
      name: "SecureCrypt",
      image: "/dycrypt.png",
      description: "Encrypts and decrypts text using secure algorithms.",
      slug: "securecrypt",
      buttonLabel: "Encrypt Now",
    },
    {
      name: "Nexpose",
      image: "/nexpose.png",
      description: "This tool scans websites for SQL Injection vulnerabilities.",
      slug: "nexpose-scan",
      buttonLabel: "Nexpose Scan",
    },
    {
      name: "MDR Monitor",
      image: "/MDR.png",
      description: "Monitors and responds to real-time security threats.",
      slug: "mdr-monitor",
      buttonLabel: "Start Monitoring",
    },
    {
      name: "File Scanner",
      image: "/folder-scan.png",
      description: "Scans files for malware or suspicious files.",
      slug: "folder-threat-scanner",
      buttonLabel: "Scan File",
    },
    {
      name: "WhatsApp Privacy Inspector",
      image: "/wp.png",
      description: "Checks WhatsApp settings for potential privacy risks.",
      slug: "whatsapp-privacy-inspector",
      buttonLabel: "Inspect Now",
    },
    {
      name: "Email Attachment Analyzer",
      image: "/email.png",
      description: "Scans email attachments for malware or hidden threats.",
      slug: "email-attachment-analyzer",
      buttonLabel: "Analyze File",
    },
    {
      name: " IP Address Info Finder",
      image: "/ip.png",
      description: "Fetches location and network details of an IP address.",
      slug: "ip-address-info-finder",
      buttonLabel: "Find Info",
    },
    {
      name: "QR Detector",
      image: "/QR.png",
      description: "Scans QR codes to detect Fake And Unsafe QR.",
      slug: "fake-qr-code-detector",
      buttonLabel: "Scan QR",
    },
    {
      name: "Website Optimization Tool",
      image: "/optimization.png",
      description: "Detects deployment issues like unused code, large assets, and slow-loading elements.",
      slug: "website-optimization-tool",
      buttonLabel: "Check Optimization",
    },
    {
      name: "SEO Score Analyzer Tool",
      image: "/seo-score.png",
      description: "Analyzes website SEO and provides improvement tips.",
      slug: "seo-score-analyzer-tool",
      buttonLabel: "Analyze SEO",
    },
     {
      name: "Kuch Rakhna Hai",
      image: "",
      description: "John the Ripper.",
      slug: "crack Pass",
      buttonLabel: "Crack Password",
    },
    {
      name: "Data Breach",
      image: "/DataBreach1.png",
      description: "Find Where Your Email , Phone No. Or Username is Exposed",
      slug: "my-info",
      buttonLabel: "Check Info",
    },
     {
      name: "URL Shortener",
      image: "/shorted-url.png",
      description: "Make Links Short and Simple.",
      slug: "Link-Shoretner",
      buttonLabel: "Shorten URL",
    },
     {
      name: "Database Security Checker",
      image: "/DB-Security.png",
      description: "Database Safety Checker With Score.",
      slug: "DB-Security-Check",
      buttonLabel: "Check Security",
    },
     {
      name: "Keyword Generator",
      image: "/keyword-generate.png",
      description: "Extract SEO-Friendly Keyword Suggestions.",
      slug: "Keyword-Generate",
      buttonLabel: "Generate Keyword",
    },
     {
      name: "Add Tool - 05",
      image: "/seo-score.png",
      description: "Analyzes website SEO and provides improvement tips.",
      slug: "seo-score-analyzer-tool",
      buttonLabel: "Analyze SEO",
    },
     {
      name: "Add Tool - 06",
      image: "/seo-score.png",
      description: "Analyzes website SEO and provides improvement tips.",
      slug: "seo-score-analyzer-tool",
      buttonLabel: "Analyze SEO",
    },
     {
      name: "Add Tool - 07",
      image: "/seo-score.png",
      description: "Analyzes website SEO and provides improvement tips.",
      slug: "seo-score-analyzer-tool",
      buttonLabel: "Analyze SEO",
    },
     {
      name: "Add Tool - 08",
      image: "/seo-score.png",
      description: "Analyzes website SEO and provides improvement tips.",
      slug: "seo-score-analyzer-tool",
      buttonLabel: "Analyze SEO",
    },
     {
      name: "Add Tool - 09",
      image: "/seo-score.png",
      description: "Analyzes website SEO and provides improvement tips.",
      slug: "seo-score-analyzer-tool",
      buttonLabel: "Analyze SEO",
    },
     {
      name: "Add Tool - 10",
      image: "/seo-score.png",
      description: "Analyzes website SEO and provides improvement tips.",
      slug: "seo-score-analyzer-tool",
      buttonLabel: "Analyze SEO",
    },
  ];


  return (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 p-3 bg-white">
    {tools.map((tool) => (
      <div
        key={tool.slug}
        className="card bg-white p-5 rounded-lg shadow-lg flex border flex-col w-full h-[100%] items-center"
      >
        {/* Tool Image/Icon */}
        <img
          src={tool.image}
          alt={tool.name}
          className={`${tool.className || 'w-16 h-16'} object-contain mb-4 mt-7`}
        />

        {/* Tool Title */}
        <h2 className="text-xl font-bold text-green-800 mb-2">{tool.name}</h2>

        {/* Tool Description */}
        <p className="text-gray-700 text-center mb-6">{tool.description}</p>

        {/* Scan Button */}
        <button
          onClick={() => router.push(`/${tool.slug}`)}
          className="bg-green-800 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors duration-300 cursor-pointer"
        >
          {tool.buttonLabel}
        </button>
      </div>
    ))}
  </div>
);

};

export default ToolCardsPage;