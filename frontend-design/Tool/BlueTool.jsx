import ToolLayout from "./Layout";
export default function GreenTool() {
    const toolList = [// Blue-Team
  {
    name: "WAF Scanner",
    image: "/tools/card-images/waf1.png",
    description: "Detects and analyzes WAF protection on a website, providing insights into security rules",
    slug: "firewallDashboard",
    buttonLabel: "Check WAF",
    type: "blue-team"
  },
  {
    name: "HTTPS Security Checker",
    image: "/tools/card-images/https-security.png",
    description: "Validate HTTPS security implementation.",
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
    description: "Inspect OAuth tokens for security risks.",
    slug: "OAuthTokenInspector",
    buttonLabel: "OAuth Token Analyzer",
    type: "blue-team"
  },
  {
    name: "Obfuscation Detector",
    image: "/tools/card-images/obfuscation.png",
    description: "Identify obfuscation techniques in code.",
    slug: "obfuscationChecker",
    buttonLabel: "Obfuscation Detector",
    type: "blue-team"
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
    name: "MDR Monitor",
    image: "/tools/card-images/MDR.png",
    description: "Monitors and responds to real-time security threats.",
    slug: "mdr-monitor",
    buttonLabel: "Start Monitoring",
    type: "blue-team"
  },
  {
    name: "Wireshark",
    image: "Wireshark.png",
    description: "Description Wireshark ......",
    slug: "Wireshark",
    buttonLabel: "Use Wireshark",
    type: "blue-team"
  },
  {
    name: "Data Leak",
    image: "data-leak.png",
    description: "Description Data Leak....",
    slug: "Data-Leak",
    buttonLabel: "Find Data Leak",
    type: "blue-team"
  },
    ]
    return (<ToolLayout team="blue" toolList={toolList}></ToolLayout>)
}