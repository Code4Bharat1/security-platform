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
