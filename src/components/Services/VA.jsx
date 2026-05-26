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
    image: "/Services/VA1.png",
  };

  return (
    <ServicesLayout
      heroData={heroData}
      methodologyData={methodologyData}
      keyAspectsData={keyAspectsData}
    />
  );
}
