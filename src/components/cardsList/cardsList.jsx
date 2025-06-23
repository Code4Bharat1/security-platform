'use client'
import { useRouter } from "next/navigation";
import { useState } from "react";
const CardsList = () => {
  const router = useRouter();
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

 const [isHovered, setIsHovered] = useState(false)
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
      slug: "sonarScanner",
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
   
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6  mb-10 p-10 bg-white">
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

export default CardsList;