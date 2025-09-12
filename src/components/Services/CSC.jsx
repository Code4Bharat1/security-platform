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
            desc: "Understand industry, business processes, current maturity level, and compliance obligations.",
        },
        {
            title: "Risk Analysis & Gap Identification ",
            desc: "Perform risk assessments, threat modeling, and maturity benchmarking.",
        },
        {
            title: "Security Roadmap Development ",
            desc: "Build a phased roadmap covering people, processes, and technology improvements.",
        },
        {
            title: "Implementation Support ",
            desc: "Help deploy security frameworks, policies, awareness training, and technical controls.",
        },
        {
            title: "Ongoing Governance & Review ",
            desc: "Provide periodic security audits, compliance checks, and board-level reporting with KPIs and metrics.",
        },
        {
            title: "Strategic Alignment",
            desc: "Align security strategy with business goals to maximize ROI.",
        },
    ];
    const keyaspectsData = {
        title: "Cyber Security Consultancy Process",
        desc: "Our key aspects :-",
        imgPath:"/services/CSC1.png",

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
