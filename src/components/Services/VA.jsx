import ServicesLayout from "./Layout";

export default function VAPage() {
  const heroData = {
    title: "Vulnerability Assessment",
    desc:
      "Vulnerability Assessment is the first line of defense in a strong cybersecurity program. It uncovers, analyzes, and prioritizes weaknesses across infrastructure, applications, cloud environments, and endpoints. Every finding is validated by security experts and mapped against real-world attack scenarios so remediation stays actionable and business-focused.",
  };

  const methodologyData = [
    {
      title: "Network & System Scanning",
      desc: "Identify open ports, services, and operating system vulnerabilities across IT assets.",
      imagePath: "/Services/VA01.png",
    },
    {
      title: "Web & Mobile Application VA",
      desc: "Assess applications for OWASP Top 10 issues, insecure APIs, and mobile app weaknesses.",
      imagePath: "/Services/VA3.png",
    },
    {
      title: "Patch & Configuration Review",
      desc: "Check for missing patches, outdated software, and insecure default configurations.",
      imagePath: "/Services/patch.png",
    },
    {
      title: "Database & Cloud Assessment",
      desc: "Detect misconfigurations, insecure permissions, and weaknesses in data platforms.",
      imagePath: "/Services/VA4.png",
    },
    {
      title: "Wireless Network VA",
      desc: "Evaluate Wi-Fi networks for weak encryption, rogue access points, and lateral risk.",
      imagePath: "/Services/VA6.png",
    },
    {
      title: "Risk-Based Reporting",
      desc: "Categorize vulnerabilities by severity and provide actionable remediation guidance.",
      imagePath: "/Services/VA7.png",
    },
  ];

  const keyAspectsData = {
    title: "Vulnerability Assessment Process",
    desc: "Key aspects",
    steps: [
      {
        title: "Asset Discovery & Scoping",
        desc: "Identify, catalog, and scope all hardware, software, and cloud assets across the organization's perimeter.",
        icon: "ShieldAlert",
      },
      {
        title: "Vulnerability Detection",
        desc: "Run active automated security scans and manual correlation to locate unpatched services and misconfigurations.",
        icon: "Layers",
      },
      {
        title: "Risk Prioritization",
        desc: "Score findings using the CVSS framework and assess business impact to highlight critical vulnerabilities.",
        icon: "Code",
      },
      {
        title: "Reporting",
        desc: "Compile comprehensive risk scores, details, and vulnerability profiles into structured dashboards.",
        icon: "FileCheck",
      },
      {
        title: "Remediation Planning",
        desc: "Provide technical details and remediation checklists to support rapid patching and configuration hardening.",
        icon: "Wrench",
      },
      {
        title: "Validation & Monitoring",
        desc: "Perform delta re-scans to verify patches and maintain continuous security visibility.",
        icon: "Activity",
      }
    ]
  };

  return (
    <ServicesLayout
      heroData={heroData}
      methodologyData={methodologyData}
      keyAspectsData={keyAspectsData}
    />
  );
}
