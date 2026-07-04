import ServicesLayout from "./Layout";
export default function SOCPage() {
    const heroData = 
        {
            title: "Security Operations Center",
            desc: `A Security Operations Center is a centralized facility responsible for continuous monitoring, detection, analysis, and response to cybersecurity incidents. It leverages advanced tools such as SIEM and threat intelligence to track malicious activity in real time. SOC operations are divided into levels, with Level 1 focusing on monitoring and alert triage, and Level 2 handling in-depth investigations, threat hunting, and coordinated response.`,
            videoPath: "/Services/SOC.mp4"
        }

    // Methodology Section
    const methodologyData = [
        {
            title: "Log Inspection & Normalization",
            desc: "Centralize logs from endpoints, servers, applications, and cloud services into SIEM platforms (Splunk, QRadar, ELK).",
            imagePath:"/Services/SOC/1.png"
        },
        {
            title: "Threat Intelligence Correlation",
            desc: "Correlate data with global and internal threat feeds to detect zero-days, APTs, and insider threats.",
            imagePath:"/Services/SOC/2.png"
        },
        {
            title: "Real-Time Monitoring & Alerting",
            desc: "Detect anomalies, unusual behaviors, and malicious activity across the environment.",
            imagePath:"/Services/SOC/3.png"
        },
        {
            title: "Incident Triage & Response",
            desc: "Classify alerts by severity, investigate root causes, and contain threats quickly (isolating devices, disabling accounts).",
            imagePath:"/Services/SOC/4.png"
        },
        {
            title: "Forensic Investigation & Post-Incident Review",
            desc: "Perform in-depth analysis of breaches, preserve evidence, and strengthen defenses.",
            imagePath:"/Services/SOC/5.png"
        },
        {
            title: "Executive Dashboards & Reporting",
            desc: "Deliver actionable insights for both technical teams and executive stakeholders.",
            imagePath:"/Services/SOC/6.png"
        },
        {
            title: "Continuous Improvement & Threat Hunting",
            desc: "Refine detection rules, hunt proactively for hidden threats, and update incident playbooks.",
            imagePath:"/Services/SOC/7.png"
        }
    ];
        const keyaspectsData = {
        title: "SOC Process",
        desc: "Our key aspects :-",
        steps: [
          {
            title: "Scoping & Planning",
            desc: "Define operational baselines, check regulatory scope, and map critical security monitoring interfaces.",
            icon: "ShieldAlert",
          },
          {
            title: "Documentation & Evidence Collection",
            desc: "Gather security procedures, log architecture metrics, system configs, and access rules to build an evidence map.",
            icon: "Layers",
          },
          {
            title: "Control Assessment",
            desc: "Analyze SIEM configuration setups, firewall logs, alert correlation criteria, and endpoint detection limits.",
            icon: "Code",
          },
          {
            title: "Gap Analysis & Remediation Guidance",
            desc: "Identify gaps in threat coverage, alert false positives, and deliver actionable hardening strategies.",
            icon: "Wrench",
          },
          {
            title: "Effectiveness Testing",
            desc: "Run purple-team fire drills, threat emulation tests, and playbook runs to validate active SOC alert triggers.",
            icon: "Activity",
          },
          {
            title: "Final Audit & Reporting",
            desc: "Deliver verified posture summaries, SLA indicators, and compliance-ready reports for security stakeholders.",
            icon: "FileCheck",
          }
        ]
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