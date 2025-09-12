import ServicesLayout from "./Layout";

export default function NSPage() {
    const heroData = 
        {
            title: "Network Security",
            desc: "Network Security focuses on safeguarding the integrity and confidentiality of data as it travels across enterprise networks. It encompasses the design and management of secure architectures, deployment of firewalls, intrusion detection and prevention systems, and segmentation of networks to reduce attack surfaces. Network security ensures that communication systems remain protected from unauthorized access, misuse, and disruptions.",
            videoPath: "/Services/NS.mp4",
        }

    const methodologyData = [
        {
            title: "Network Asset Discovery & Mapping ",
            desc: "Real-time cloud-native threat monitoring."
        },
        {
            title: "Configuration & Policy Review ",
            desc: "Evaluate firewalls, IDS/IPS, VPN, Evaluate firewalls, IDS/IPS, VPN, segmentation, and routing policies.segmentation, and routing policies."
        },
        {
            title: "Traffic Analysis & Threat Detection ",
            desc: "Use packet captures, NetFlow, and anomaly detection to uncover hidden risks."
        },
        {
            title: "Attack Simulation ",
            desc: "Conduct penetration attempts such as DoS, MITM, ARP spoofing, and lateral movement to test resilience.."
        },
        {
            title: "Vulnerability Remediation & Hardening",
            desc: "Patch weaknesses, strengthen configurations, and enforce segmentation."
        },
        {
            title:"Continuous Monitoring & Alerting ",
            desc: "Integrate with SOC and SIEM for real-time protection."
        }
    ];

        const keyaspectsData = {
        title: "Network Security Process",
        desc: "Our key aspects :-",
        imgPath:"/services/NS1.png",

    };
    // const approchData = {
    //     firstRow: [
    //         "Review architecture and IAM configurations",
    //         "Perform cloud security assessments.",
    //         "Implement continuous monitoring solutions."
    //     ],
    //     secondRow: [
    //         { text: "Provide remediation guidance.", colStart: 2 },
    //         { text: "Ensure compliance readiness.", colStart: 4 }
    //     ]
    // };

    return (
        <ServicesLayout
            heroData={heroData}
            methodologyData={methodologyData}
            keyAspectsData={keyaspectsData}
        />
    );
}
