import ServicesLayout from "./Layout";

export default function NSPage() {
  const heroData = {
    title: "Network Security",
    desc: "Network Security focuses on safeguarding the integrity and confidentiality of data as it travels across enterprise networks. It encompasses the design and management of secure architectures, deployment of firewalls, intrusion detection and prevention systems, and segmentation of networks to reduce attack surfaces. Network security ensures that communication systems remain protected from unauthorized access, misuse, and disruptions.",
    videoPath: "/Services/NS2.mp4",
  };

  const methodologyData = [
    {
      title: "Network Asset Discovery & Mapping",
      desc: "Real-time cloud-native threat monitoring.",
      image: "/Services/Network1.png",
    },
    {
      title: "Configuration & Policy Review",
      desc: "Evaluate firewalls, IDS/IPS, VPN, segmentation, and routing policies.",
      image: "/Services/Network2.png",
    },
    {
      title: "Traffic Analysis & Threat Detection",
      desc: "Use packet captures, NetFlow, and anomaly detection to uncover hidden risks.",
      image: "/Services/Network3.png",
    },
    {
      title: "Attack Simulation",
      desc: "Conduct penetration attempts such as DoS, MITM, ARP spoofing, and lateral movement to test resilience.",
      image: "/Services/Network4.png",
    },
    {
      title: "Vulnerability Remediation & Hardening",
      desc: "Patch weaknesses, strengthen configurations, and enforce segmentation.",
      image: "/Services/Network5.png",
    },
    {
      title: "Continuous Monitoring & Alerting",
      desc: "Integrate with SOC and SIEM for real-time protection.",
      image: "/Services/Network6.png",
    },
  ];

  const keyaspectsData = {
    title: "Network Security Process",
    desc: "Our key aspects :-",
    imgPath: "/services/NS1.png",
  };

  return (
    <ServicesLayout
      heroData={heroData}
      methodologyData={methodologyData}
      keyAspectsData={keyaspectsData}
      methodologyLayout="hexagon"
    />
  );
}
