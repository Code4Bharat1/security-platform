import ServicesLayout from "./Layout";

export default function PTPage() {
    const heroData = {
        title: "Penetration Testing",
        desc: `Penetration Testing is a controlled simulation of cyberattacks designed to evaluate the security of applications, networks, and infrastructure. By mimicking real-world attack techniques, penetration testing reveals exploitable vulnerabilities and validates the effectiveness of existing security controls. It goes beyond detection by demonstrating the actual impact of security flaws.`,
        videoPath: "/services/PT.mp4"
    };

    const methodologyData = [
        { title: "Web & API Penetration Testing", desc: "Exploit OWASP Top 10 flaws..." },
        { title: "Network & Infrastructure PT", desc: "Simulate internal and external attacks..." },
        { title: "Cloud Penetration Testing", desc: "Exploit misconfigured IAM roles..." },
        { title: "Wireless & IoT PT", desc: "Assess Wi-Fi cracking, rogue access points..." },
        { title: "Social Engineering & Red Teaming", desc: "Conduct phishing campaigns..." }
    ];
    
    const approchData = {
        firstRow: [
            "Reconnaissance and threat modeling.",
            "Vulnerability identification.",
            "Exploitation and post-exploitation."
        ],
        secondRow: [
            { text: "Attack path documentation.", colStart: "col-start-2" },
            { text: "Reporting with PoCs and risk-based recommendations.", colStart: "col-start-4" }
        ]
    };

    return (
        <ServicesLayout
            heroData={heroData}
            heroVideo="/PT.mp4"  
            methodologyData={methodologyData}
            keyAspectsData={keyAspectsData}
        />
    );
}
