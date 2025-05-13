'use client'
import { useRouter } from "next/navigation";

const ToolCardsPage = () => {
  const router = useRouter();

  const tools = [
    {
      name: "WAF Scanner",
      image: "/waf1.png",
      description: "Detects and analyzes WAF protection on a website, providing insights into security rules",
      slug: "waf_form",
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
      image: "/vuln_scanner.png",
      description: "Scan websites for security weaknesses like XSS or SQL injection.",
      slug: "codeForm",
      buttonLabel: "Jest Scanner",
    },
    {
      name: "Website Recon",
      image: "/web-recon.png",
      description: "Perform an in-depth reconnaissance of a website to identify key metadata, technologies used.",
      slug: "webreconForm",
      buttonLabel: "Website Recon",
    },
    {
      name: "Zap Scanner",
      image: "/zap-logo.png",
      description: "un an OWASP ZAP-powered automated security scan to detect vulnerabilities.",
      slug: "zapForm",
      buttonLabel: "Zap Scanner",
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
      slug: "brokenlinkForm",
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
      name: "Jest Scanner",
      image: "/port_scan.png",
      description: "Allows users to test API endpoints, validating functionality, security headers",
      slug: "jestForm",
      buttonLabel: "Analyze code",

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