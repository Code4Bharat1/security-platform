import ServicesLayout from "./Layout";
export default function VAPage() {
    const heroData = [{ title: "Vulnerability Assessment", desc: `Vulnerability Assessment (VA) is the first line of defense in a strong cybersecurity program. It is a structured process designed to uncover, analyze, and prioritize security weaknesses across an organization’s IT infrastructure, applications, cloud environments, and endpoints. Our VA services go beyond automated scans—every finding is validated by security experts and mapped against real-world attack scenarios, ensuring your remediation strategy is both actionable and business-focused.` }]
    const methodologyData = [
        { title: "Network Vulnerability Scanning", desc: "Detect open ports, weak services, and misconfigured firewalls." },
        { title: "Web Application Assessment", desc: "Review business-critical applications for OWASP Top 10 flaws, insecure APIs, and broken authentication." },
        { title: "Mobile Application Assessment", desc: "Analyze Android/iOS apps for insecure storage, permissions misuse, and unsafe data transmission." },
        { title: "Cloud Vulnerability Assessment", desc: "Identify misconfigured IAM roles, exposed cloud storage, and insecure workloads across AWS, Azure, and GCP." },
        { title: "Endpoint & Host Review", desc: "Evaluate OS patches, privilege escalations, insecure accounts, and device-level exposures." }
    ]
    const approchData = {
        firstRow: [
            "Reconnaissance and threat modeling.",
            "Vulnerability identification.",
            "Exploitation and post-exploitation.",
        ], secondRow: [
            {
                text: "Attack path documentation.",
                colStart: "col-start-2",
            },
            {
                text: "Reporting with PoCs and risk-based recommendations.",
                colStart: "col-start-4",
            },
        ]
    }
    return (<ServicesLayout heroData={heroData} methodologyData={methodologyData} approchData={approchData}></ServicesLayout>)
}