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
            image: "/Services/Consulting1.png"
        },
        {
            title: "Risk Analysis & Gap Identification ",
            desc: "Perform risk assessments, threat modeling, and maturity benchmarking.",
            image: "/Services/CSC2.png"
        },
        {
            title: "Security Roadmap Development ",
            desc: "Build a phased roadmap covering people, processes, and technology improvements.",
            image: "/Services/CSC3.png"
        },
        {
            title: "Implementation Support ",
            desc: "Help deploy security frameworks, policies, awareness training, and technical controls.",
            image: "/Services/CSC4.png"
        },
        {
            title: "Ongoing Governance & Review ",
            desc: "Provide periodic security audits, compliance checks, and board-level reporting with KPIs and metrics.",
            image: "/Services/CSC5.png"
        },
        {
            title: "Strategic Alignment",
            desc: "Align security strategy with business goals to maximize ROI.",
            image: "/Services/CSC6.png"
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
            methodologyLayout="circular"
            
        />
    );
}
