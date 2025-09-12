import ServicesLayout from "./Layout";

export default function PTPage() {
    const heroData = {
        title: "Penetration Testing",
        desc: `Penetration Testing is a controlled simulation of cyberattacks designed to evaluate the security of applications, networks, and infrastructure. By mimicking real-world attack techniques, penetration testing reveals exploitable vulnerabilities and validates the effectiveness of existing security controls. It goes beyond detection by demonstrating the actual impact of security flaws.`,
        videoPath: "/Services/PT.mp4"
    };

    const methodologyData = [
        { title: "External & Internal Network Pen Testing", desc: "Simulating real-world attacks on both public-facing and internal systems to identify exploitable weaknesses." },
        { title: "Web Application Pen Testing ", desc: "Testing authentication, input validation, session handling, and business logic to uncover critical flaws." },
        { title: "Vulnerability Identification", desc: "Performing brute-force, dictionary, and privilege escalation attacks to identify weak or reused credentials." },
        { title: "Password & Credential Security Testing", desc: "Performing brute-force, dictionary, and privilege escalation attacks to identify weak or reused credentials." },
        { title: "Mobile & API Pen Testing  ", desc: "Assessing mobile apps and APIs for insecure data handling, authentication gaps, and potential data leaks." },
        { title: "Social Engineering Simulation", desc:"Conducting phishing campaigns, email spoofing, and awareness testing to evaluate the human factor in security." },
        { title: "Exploitation with PoC & Remediation Plan", desc: "Demonstrating vulnerabilities with proof-of-concept exploits and providing a structured hardening plan for remediation." }
    ];

    const keyaspectsData = {
        title: "Penetration Testing Process",
        desc: "Our key aspects :-",
        imgPath:"/services/PT1.png",

    };




    // const approchData = {
    //     firstRow: [
    //         "Reconnaissance and threat modeling.",
    //         "Vulnerability identification.",
    //         "Exploitation and post-exploitation."
    //     ],
    //     secondRow: [
    //         { text: "Attack path documentation.", colStart: "col-start-2" },
    //         { text: "Reporting with PoCs and risk-based recommendations.", colStart: "col-start-4" }
    //     ]
    // };

    return (
        <ServicesLayout
            heroData={heroData}
            heroVideo="/PT.mp4"  
            methodologyData={methodologyData}
            keyAspectsData={keyaspectsData}
        />
    );
};