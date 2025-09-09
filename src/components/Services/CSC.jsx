import ServicesLayout from "./Layout";


export default function SOCPage() {
    const heroData = 
        {
            title: "Cyber Security Consultancy",
            desc: "Cybersecurity Consultancy provides expert guidance to organizations in designing, implementing, and maintaining effective security strategies. It involves risk assessments, compliance advisory, governance frameworks, policy development, and overall alignment of security practices with business objectives. Consultancy services help organizations enhance resilience and maturity in their cybersecurity posture.",
            videoPath: "/Services/CSC.mp4"
        }

    const methodologyData = [
        {
            title: "Initial Business & Security Assessment ",
            desc: "Real-time cloud-native threat monitoring.",
        },
        {
            title: "Risk Analysis & Gap Identification ",
            desc: "Assess IAM, APIs, workloads, and cloud storage.",
        },
        {
            title: "Security Roadmap Development ",
            desc: "ISO 27017, PCI DSS, HIPAA, GDPR compliance readiness.",
        },
        {
            title: "Implementation Support ",
            desc: "Detection of anomalies, misuse, and unauthorized access.",
        },
        {
            title: "Ongoing Governance & Review ",
            desc: "Advanced key management, DLP, and Zero-Trust controls.",
        },
{
            title: "Strategic Alignment",
            desc: "Advanced key management, DLP, and Zero-Trust controls.",
        },
    ];
    const keyaspectsData = {
        title: "Cyber Security Consultancy",
        desc: "Our key aspects :-",
        imgPath:"/PTDiagram.png",

    };
    // const approchData = {
    //     firstRow: [
    //         "Review architecture and IAM configurations",
    //         "Perform cloud security assessments",
    //         "Implement continuous monitoring solutions",
    //     ],
    //     secondRow: [
    //         { text: "Provide remediation guidance", colStart: "col-start-2"},
    //         { text: "Ensure compliance readiness", colStart: "col-start-4"},
    //     ],
    // };

    return (
        <ServicesLayout
            heroData={heroData}
            methodologyData={methodologyData}
            keyAspectsData={keyaspectsData}
        />
    );
}
