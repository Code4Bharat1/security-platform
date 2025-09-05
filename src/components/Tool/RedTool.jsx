'use client';

import ToolLayout from "./Layout";
export default function RedTool() {
    const toolList = [{
        name: "Vulnerability Scanner",
        image: "/RedTeam/vuln_scanner.png",
        description: "Scan websites for security weaknesses like XSS or SQL injection.",
        slug: "vuln-scanner",
        buttonLabel: "Scan for Vulnerabilities",
        type: "red-team"
    },
    {
        name: "Source Code Analyzer",
        image: "/RedTeam/code.png",
        description: "Scan websites for security weaknesses like XSS or SQL injection.",
        slug: "Source-Code",
        buttonLabel: "Check Your Code's",
        type: "red-team"
    },
    {
        name: "Checkmarx Scanner",
        image: "/RedTeam/heckmarx.png",
        description: "Scan websites for security weaknesses like XSS or SQL injection.",
        slug: "codeAnalysis",
        buttonLabel: "Scan your codes",
        type: "red-team"
    },
    {
        name: "Subdomain Scanner",
        image: "/RedTeam/subdomain.png",
        description: "Scan websites for analyzing subdomains and their security posture.",
        slug: "subdomainEnumeration",
        buttonLabel: "Scan your website",
        type: "red-team"
    },
    {
        name: "Website Recon",
        image: "/RedTeam/web-recon.png",
        description: "Perform an in-depth reconnaissance of a website to identify key metadata, technologies used.",
        slug: "webrecon",
        buttonLabel: "Website Recon",
        type: "red-team"
    },
    {
        name: "Technology Fingerprinter",
        image: "/RedTeam/fingerprint.png",
        description: "un an OWASP ZAP-powered automated security scan to detect vulnerabilities.",
        slug: "fingerPrint",
        buttonLabel: "fingerPrint",
        type: "red-team"
    },
    {
        name: "Brute Force Scanner",
        image: "/RedTeam/brute-force.png",
        description: "un an OWASP ZAP-powered automated security scan to detect vulnerabilities.",
        slug: "bruteForce",
        buttonLabel: "bruteForce",
        type: "red-team"
    },
    {
        name: "Mocha Testing",
        image: "/RedTeam/mocha-logo.png",
        description: "Displays all available Mocha commands, options, and usage details.",
        slug: "mochaForm",
        buttonLabel: "Mocha Testing",
        type: "red-team"
    },
    {
        name: "Broken link Checker",
        image: "/RedTeam/brokenlink.png",
        description: "Scans web pages for dead or broken links, helping maintain SEO integrity",
        slug: "brokenStreamForm",
        buttonLabel: "Scan for Vulnerabilities",
        type: "non-tech"
    },
    {
        name: "Wordpress Scanner",
        image: "/RedTeam/wordpress-secure.png",
        description: "Check for outdated plugins, misconfigurations, and known vulnerabilities.",
        slug: "wordpressForm",
        buttonLabel: "Scan for Wordpress",
        type: "red-team"
    }, {
        name: "API Testing",
        image: "/RedTeam/api.png",
        description: "Allows users to test API endpoints, validating functionality and security headers",
        slug: "apiForm",
        buttonLabel: "Scan for API",
        type: "red-team"
    },
    {
        name: "Port Scanner",
        image: "/RedTeam/port_scan.png",
        description: "Allows users to test API endpoints, validating functionality, security headers",
        slug: "portScannerForm",
        buttonLabel: "Check Headers",
        type: "red-team"
    },
    {
        name: "Clickjacking Tester",
        image: "/RedTeam/lickjacking.png",
        description: " Check for UI redressing vulnerabilities in a webpage.",
        slug: "clickjackingTester",
        buttonLabel: "Clickjacking Tester",
        type: "red-team"
    },
    {
        name: "CSRF Vulnerability Scanner",
        image: "/RedTeam/csrf.png",
        description: " Check for UI redressing vulnerabilities in a webpage.",
        slug: "csrfChecker",
        buttonLabel: "CSRF Vulnerability Scanner",
        type: "red-team"
    },
    {
        name: "Open Redirect Tester ",
        image: "/RedTeam/open-redirect.png",
        description: "Find unsafe redirection vulnerabilities.",
        slug: "openRedirectTester",
        buttonLabel: "Open Redirect Tester ",
        type: "red-team"
    },
    {
        name: "Secret Key Scanner",
        image: "/RedTeam/secret_key_scanner.png",
        description: "Search for exposed API keys or credentials.",
        slug: "secretKeyScanner",
        buttonLabel: "Secret Key Scanner",
        type: "red-team"
    },
    {
        name: "Session Fixation Tester",
        image: "/RedTeam/session_fixation.png",
        description: "Detect session fixation vulnerabilities",
        slug: "sessionFixationChecker",
        buttonLabel: "Session Fixation Tester",
        type: "red-team"
    },
    {
        name: "Whois Domain Lookup",
        image: "/RedTeam/whois.png",
        description: "Retrieve domain registration and ownership details.",
        slug: "whoisLookup",
        buttonLabel: "Whois Domain Lookup",
        type: "red-team"
    },
    {
        name: "XSS Vulnerability Tester",
        image: "/RedTeam/xss.png",
        description: "Identify Cross-Site Scripting (XSS) risks",
        slug: "xssTester",
        buttonLabel: "XSS Vulnerability Tester",
        type: "red-team"
    }, {
        name: "SQLi Scanner",
        image: "/RedTeam/sql_injection.png",
        description: "This tool scans websites for SQL Injection vulnerabilities.",
        slug: "nexpose-scan",
        buttonLabel: "Scan SQLi",
        type: "red-team"
    }, {
        name: "Database Security Checker",
        image: "/RedTeam/DB-Security.png",
        description: "Database Safety Checker With Score.",
        slug: "DbSecurityChecker",
        buttonLabel: "Check Security",
        type: "red-team"
    }
    ]
    return (<ToolLayout team="red" toolList={toolList}></ToolLayout>)
}