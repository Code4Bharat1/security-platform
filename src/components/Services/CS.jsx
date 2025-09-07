import ServicesLayout from "./Layout";


export default function SOCPage() {
    const heroData = 
        {
            title: "Cloud Security",
            desc: "Cloud Security involves the protection of data, workloads, and applications hosted on cloud platforms such as AWS, Azure, and Google Cloud. It ensures that cloud environments are configured securely, access is properly controlled, and data remains protected from unauthorized access or breaches. Cloud security covers governance, compliance, identity management, and defence against both external and insider threats.",
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
