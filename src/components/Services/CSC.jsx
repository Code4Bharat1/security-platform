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
            image: "/Services/Consulting2.png"
        },
        {
            title: "Security Roadmap Development ",
            desc: "Build a phased roadmap covering people, processes, and technology improvements.",
            image: "/Services/Consulting3.png"
        },
        {
            title: "Implementation Support ",
            desc: "Help deploy security frameworks, policies, awareness training, and technical controls.",
            image: "/Services/Consulting4.png"
        },
        {
            title: "Ongoing Governance & Review ",
            desc: "Provide periodic security audits, compliance checks, and board-level reporting with KPIs and metrics.",
            image: "/Services/Consulting5.png"
        },
        {
            title: "Strategic Alignment",
            desc: "Align security strategy with business goals to maximize ROI.",
            image: "/Services/Consulting6.png"
        },
    ];
    const keyaspectsData = {
        title: "Cyber Security Consultancy Process",
        desc: "Our key aspects :-",
        steps: [
          {
            title: "Scoping & Asset Inventory",
            desc: "Define the engagement boundaries and compile a comprehensive inventory of all organizational digital and physical assets.",
            icon: "ShieldAlert",
          },
          {
            title: "Configuration & Architecture Review",
            desc: "Analyze platform architectures, infrastructure layouts, security group controls, and identity settings against hardened benchmarks.",
            icon: "Layers",
          },
          {
            title: "Vulnerability & Threat Analysis",
            desc: "Conduct automated and manual vulnerability scans, identify security gaps, and perform deep threat modeling across workstreams.",
            icon: "Code",
          },
          {
            title: "Compliance & Governance Review",
            desc: "Evaluate alignment with global regulatory frameworks (ISO 27001, SOC 2, NIST, GDPR) and check policies and procedural controls.",
            icon: "FileCheck",
          },
          {
            title: "Remediation Planning",
            desc: "Develop prioritized, risk-based remediation checklists and action items with clear step-by-step remediation strategies.",
            icon: "Wrench",
          },
          {
            title: "Continuous Monitoring & Validation",
            desc: "Deploy validation pipelines, active threat tracking, and continuous posture monitoring to ensure lasting resilience.",
            icon: "Activity",
          }
        ]
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
