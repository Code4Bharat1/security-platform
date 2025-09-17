'use client';

import ToolLayout from "./Layout";
export default function BlueTool() {
    const toolList = [// Blue-Team
  {
    name: "WAF Scanner",
    image: "/BlueTeam/waf.png",
    description: "Detects and analyzes WAF protection on a website, providing insights into security rules",
    slug: "firewallDashboard",
    buttonLabel: "Check WAF",
    type: "blue-team"
  },
  {
    name: "HTTPS Security Checker",
    image: "/BlueTeam/https.png",
    description: "Validate HTTPS security implementation.",
    slug: "httpsCheckerForm",
    buttonLabel: "HTTPS Security Checker",
    type: "blue-team"
  },
  {
    name: "JWT Signature Validator",
    image: "/BlueTeam/jwt_signature.png",
    description: "Ensure JWT signature integrity.",
    slug: "JWTSignatureValidator",
    buttonLabel: "JWT Signature Validator",
    type: "blue-team"
  },
  {
    name: "OAuth Token Analyzer",
    image: "/BlueTeam/oauth_token.png",
    description: "Inspect OAuth tokens for security risks.",
    slug: "OAuthTokenInspector",
    buttonLabel: "OAuth Token Analyzer",
    type: "blue-team"
  },
  {
    name: "Obfuscation Detector",
    image: "/BlueTeam/obfuscation Detector.png",
    description: "Identify obfuscation techniques in code.",
    slug: "obfuscationChecker",
    buttonLabel: "Obfuscation Detector",
    type: "blue-team"
  },
  {
    name: "Regex Security Validator",
    image: "/BlueTeam/regex.png",
    description: "Check regular expressions for security flaws",
    slug: "regexDetector",
    buttonLabel: "Regex Security Validator",
    type: "blue-team"
  },
  {
    name: "Reverse DNS Resolver ",
    image: "/BlueTeam/reverse dns.png",
    description: "Retrieve domain names linked to an IP.",
    slug: "reverseDNSLookup",
    buttonLabel: "Reverse DNS Resolver",
    type: "blue-team"
  },
  {
    name: "MDR Monitor",
    image: "/BlueTeam/MDR.png",
    description: "Monitors and responds to real-time security threats.",
    slug: "mdr-monitor",
    buttonLabel: "Start Monitoring",
    type: "blue-team"
  },
  // {
  //   name: "Wireshark",
  //   image: "/BlueTeam/Wireshark.png",
  //   description: "Description Wireshark ......",
  //   slug: "Wireshark",
  //   buttonLabel: "Use Wireshark",
  //   type: "blue-team"
  // },
  // {
  //   name: "Data Leak",
  //   image: "/BlueTeam/data-leak.png",
  //   description: "Description Data Leak....",
  //   slug: "Data-Leak",
  //   buttonLabel: "Find Data Leak",
  //   type: "blue-team"
  // },
    ]
    return( <div className="relative w-full h-full">
            {/* Background Video */}
            {/* <video
                autoPlay
                loop
                muted
                className="absolute top-0 left-0 w-full h-full object-cover "
            >
                <source src="/BlueTeam/Blue-Team.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video> */}

            {/* Tool Layout */}
            <ToolLayout team="blue" toolList={toolList} />
        </div>
    );
}