import ServicesLayout from "./Layout";
export default function SOCPage() {
    const heroData = 
        {
            title: "Security Operations Center",
            desc: `A Security Operations Center is a centralized facility responsible for continuous monitoring, detection, analysis, and response to cybersecurity incidents. It leverages advanced tools such as SIEM and threat intelligence to track malicious activity in real time. SOC operations are divided into levels, with Level 1 focusing on monitoring and alert triage, and Level 2 handling in-depth investigations, threat hunting, and coordinated response.`,
            videoPath: "/services/SOC.mp4"
        }

    // Methodology Section
    const methodologyData = [
        {
            title: "Scoping & Planning",
            desc: "Define scope, stakeholders, and timelines."
        },
        {
            title: "Documentation & Evidence Collection",
            desc: "Gather SOPs, policies, logs, and system records."
        },
        {
            title: "Control Assessment",
            desc: "Evaluate design and implementation of controls."
        },
        {
            title: "Gap Analysis & Remediation Guidance",
            desc: "Identify weaknesses and recommend fixes."
        },
        {
            title: "Effectiveness Testing",
            desc: "Test technical and operational controls."
        },
        {
            title: "Final Audit & Reporting",
            desc: "Perform final audit and issue SOC 1 report."
        }
    ];
        const keyaspectsData = {
        title: "SOC",
        desc: "Our key aspects :-",
        imgPath:"/PTDiagram.png",

    };

    // // Approach Section
    // const approchData = {
    //     firstRow: [
    //         "Centralized log ingestion from multiple sources.",
    //         "Apply correlation rules and anomaly detection.",
    //         "Prioritize incidents by severity and impact."
    //     ],
    //     secondRow: [
    //         {
    //             text: "Provide rapid containment actions.",
    //             colStart: "col-start-2"
    //         },
    //         {
    //             text: "Generate compliance-ready reports.",
    //             colStart: "col-start-4"
    //         }
    //     ]
    // };

    return (<ServicesLayout heroData={heroData} methodologyData={methodologyData} keyAspectsData={keyaspectsData}></ServicesLayout>)
}