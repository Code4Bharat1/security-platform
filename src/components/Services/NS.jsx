import ServicesLayout from "./Layout";

export default function NSPage() {
    const heroData = 
        {
            title: "Network Security",
            desc: "Network Security involves implementing measures to protect the integrity, confidentiality, and availability of computer networks and data. Our services include threat detection, firewall management, and incident response to safeguard your network infrastructure."
        }

    const methodologyData = [
        {
            title: "Network Asset Discovery & Mapping ",
            desc: "Real-time cloud-native threat monitoring."
        },
        {
            title: "Configuration & Policy Review "
        },
        {
            title: "Traffic Analysis & Threat Detection ",
            desc: "ISO 27017, PCI DSS, HIPAA, GDPR compliance readiness."
        },
        {
            title: "Attack Simulation "
        },
        {
            title: "Vulnerability Remediation & Hardening",
            desc: "Advanced key management, DLP, and Zero-Trust controls."
        },
        {
            title:"Continuous Monitoring & Alerting "
        }
    ];

    const approchData = {
        firstRow: [
            "Review architecture and IAM configurations",
            "Perform cloud security assessments.",
            "Implement continuous monitoring solutions."
        ],
        secondRow: [
            { text: "Provide remediation guidance.", colStart: 2 },
            { text: "Ensure compliance readiness.", colStart: 4 }
        ]
    };

    return (
        <ServicesLayout
            heroData={heroData}
            methodologyData={methodologyData}
            approchData={approchData}
        />
    );
}
