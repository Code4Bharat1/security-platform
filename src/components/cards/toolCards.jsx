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
      name: "- CSRF Vulnerability Scanner",
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
      name: "ssrf Scanner",
      image: "/ssrf.png",
      description: "Analyze keyword frequency for SEO structuring on website.",
      slug: "ssrfScannerForm",
      buttonLabel: "SSRF Scanner",
    },
    {
      name: "File Scanner",
      image: "/file_scan.png",
      description: "Analyze keyword frequency for SEO structuring on website.",
      slug: "sensitiveFileScanner",
      buttonLabel: "File Scanner",
    },
    {
      name: "Broken Access Scanner",
      image: "/broken_access.png",
      description: "Analyze keyword frequency for SEO structuring on website.",
      slug: "brokenAccessPage",
      buttonLabel: "Broken Access Scanner",
    },
     {
      name: "AI Vulnerability Scanner",
      image: "/ai_scan.png",
      description: "Analyze keyword frequency for SEO structuring on website.",
      slug: "AIVulnerabilityExplainer",
      buttonLabel: "AI Vulnerability Scanner",
    },
     {
      name: "AI Headers checker",
      image: "/ai_header.png",
      description: "Analyze keyword frequency for SEO structuring on website.",
      slug: "AISecurityHeaders",
      buttonLabel: "AI Headers checker",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6  mb-10 p-3 bg-white">
      {tools.map((tool, index) => (
<div
  key={tool.slug}
  className="card bg-white p-5 rounded-lg shadow-lg flex border flex-col w-full h-[100%] items-center"
>
  {/* Tool Image/Icon */}
  <img src={tool.image} alt={tool.name} className="w-16 h-16 mb-4 mt-7" />

  {/* Tool Title */}
  <h2 className="text-xl font-bold text-green-800 mb-2">{tool.name}</h2>

  {/* Tool Description */}
  <p className="text-gray-700 text-center mb-6">{tool.description}</p>

  {/* Scan Button */}
  <button
    onClick={() => router.push(`/${tool.slug}`)}
    className="bg-green-800 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors duration-300 "
  >
    {tool.buttonLabel}
  </button>
</div>


      ))}
    </div>
  );
};

export default ToolCardsPage;