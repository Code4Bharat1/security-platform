import ServicesLayout from "./Layout";

export default function SOCPage() {
    const heroData = 
        {
            title: "Cloud Security",
            desc: "Our Security Operations Center (SOC) provides 24/7 monitoring, detection, and response capabilities, combining advanced SIEM platforms, threat intelligence feeds, and AI-driven analytics. The SOC ensures businesses have continuous visibility into their threat landscape, enabling rapid incident response.",
            videoPath: "/Services/CS.mp4"
        }

    const methodologyData = [
        {
            title: "Cloud SOC",
            desc: "Real-time cloud-native threat monitoring.",
        },
        {
            title: "Cloud VAPT",
            desc: "Assess IAM, APIs, workloads, and cloud storage.",
        },
        {
            title: "Compliance Alignment",
            desc: "ISO 27017, PCI DSS, HIPAA, GDPR compliance readiness.",
        },
        {
            title: "Activity & Log Analysis",
            desc: "Detection of anomalies, misuse, and unauthorized access.",
        },
        {
            title: "Data Security & Encryption",
            desc: "Advanced key management, DLP, and Zero-Trust controls.",
        },
    ];

    const approchData = {
        firstRow: [
            "Review architecture and IAM configurations",
            "Perform cloud security assessments",
            "Implement continuous monitoring solutions",
        ],
        secondRow: [
            { text: "Provide remediation guidance", colStart: "col-start-2"},
            { text: "Ensure compliance readiness", colStart: "col-start-4"},
        ],
    };

    return (
        <ServicesLayout
            heroData={heroData}
            methodologyData={methodologyData}
            approchData={approchData}
        />
    );
}
