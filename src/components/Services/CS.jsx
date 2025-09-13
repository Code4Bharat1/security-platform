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
            title: "Cloud Architecture & IAM Review",
            desc: "Evaluate identity and access management (IAM), roles, policies, and cloud configurations.",
            image: "/Services/Cloud1.png"
        },
        {
            title: "Security Benchmarking",
            desc: "Assess environments against frameworks (CIS Benchmarks, NIST, ISO, CSA).",
            image: "/Services/Cloud2.png"
        },
        {
            title: "Threat Modeling",
            desc: "Identify cloud-specific risks (misconfigured storage, insecure APIs, excessive permissions).",
            image: "/Services/Cloud3.png"
        },
        {
            title: "Vulnerability & Compliance Assessment",
            desc: "Scan for security misconfigurations, exposed services, and compliance gaps (GDPR, HIPAA,  SOC 2, PCI DSS).",
            image: "/Services/Cloud4.png"
        },
        {
            title: "Continuous Monitoring & Automation",
            desc: "Deploy CSPM (Cloud Security Posture Management), CWPP (Cloud Workload Protection), and SIEM solutions.",
            image: "/Services/Cloud5.png"
        },
        {
            title: "Remediation Guidance",
            desc: "Provide clear steps to fix misconfigurations, enforce least privilege, encrypt workloads, and enable logging.",
            image: "/Services/Cloud6.png"

        },
        {
            title: "Compliance Readiness",
            desc: "Ensure alignment with regulatory standards and provide audit support."
        }
    ];
    const keyaspectsData = {
        title: "Cloud Security Process",
        desc: "Our key aspects :-",
        imgPath:"/services/CS1.png",

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
            methodologyLayout="zigzag"
        />
    );
}
