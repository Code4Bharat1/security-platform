import ServicesLayout from "./Layout";

export default function PTPage() {
    const heroData = {
        title: "Penetration Testing",
        desc: `Penetration Testing (PT) is a simulated cyberattack conducted by ethical hackers to test the resilience of systems, networks, and applications. Unlike VA, which highlights vulnerabilities, PT demonstrates real-world exploitability, providing organizations with proof-of-concept attacks that reveal the true business impact of potential breaches.`,
        videoPath: "/services/PT.mp4"
    };

    const methodologyData = [
        { title: "Web & API Penetration Testing", desc: "Exploit OWASP Top 10 flaws..." },
        { title: "Network & Infrastructure PT", desc: "Simulate internal and external attacks..." },
        { title: "Cloud Penetration Testing", desc: "Exploit misconfigured IAM roles..." },
        { title: "Wireless & IoT PT", desc: "Assess Wi-Fi cracking, rogue access points..." },
        { title: "Social Engineering & Red Teaming", desc: "Conduct phishing campaigns..." }
    ];
    33

    

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
            heroVideo="/PT.mp4"  // <-- Add PT video here
            methodologyData={methodologyData}
            approchData={approchData}
        />
    );
}
