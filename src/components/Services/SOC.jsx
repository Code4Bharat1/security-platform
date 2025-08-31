import ServicesLayout from "./Layout";
export default function SOCPage() {
    const heroData = 
        {
            title: "Security Operations Center",
            desc: `Our Security Operations Center (SOC) provides 24/7 monitoring, detection, and response capabilities, combining advanced SIEM platforms, threat intelligence feeds, and AI-driven analytics. The SOC ensures businesses have continuous visibility into their threat landscape, enabling rapid incident response.`
        }

    // Methodology Section
    const methodologyData = [
        {
            title: "24/7 Monitoring & Alerting",
            desc: "Real-time oversight of networks, endpoints, and cloud workloads."
        },
        {
            title: "Threat Intelligence Correlation",
            desc: "Detection of zero-days, insider threats, and APTs."
        },
        {
            title: "Incident Response & Containment",
            desc: "Isolation of compromised devices and accounts."
        },
        {
            title: "Log Management & Analysis",
            desc: "Compliance-ready log retention with deep analytics."
        },
        {
            title: "Executive Dashboards & Reporting",
            desc: "Actionable insights for both technical and board-level stakeholders."
        }
    ];

    // Approach Section
    const approchData = {
        firstRow: [
            "Centralized log ingestion from multiple sources.",
            "Apply correlation rules and anomaly detection.",
            "Prioritize incidents by severity and impact."
        ],
        secondRow: [
            {
                text: "Provide rapid containment actions.",
                colStart: "col-start-2"
            },
            {
                text: "Generate compliance-ready reports.",
                colStart: "col-start-4"
            }
        ]
    };

    return (<ServicesLayout heroData={heroData} methodologyData={methodologyData} approchData={approchData}></ServicesLayout>)
}