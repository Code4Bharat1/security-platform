
import ServicesLayout from "./Layout";

export default function PTPage() {
    const heroData = {
        title: "Penetration Testing",
        desc: `Penetration Testing is a controlled simulation of cyberattacks designed to evaluate the security of applications, networks, and infrastructure. By mimicking real-world attack techniques, penetration testing reveals exploitable vulnerabilities and validates the effectiveness of existing security controls.`,
        videoPath: "/Services/PT.mp4"
    };

    const methodologyData = [
        { title: "External & Internal Network Pen Testing", desc: "Simulating real-world attacks on both public-facing and internal systems to identify exploitable weaknesses.", 
          imagePath: "/services/PT/PT01.png"
        },
        { title: "Web Application Pen Testing", desc: "Testing authentication, input validation, session handling, and business logic to uncover critical flaws."
          , imagePath: "/services/PT/PT2.png"
         },
        { title: "Vulnerability Identification", desc: "Comprehensive scanning and manual testing to identify security weaknesses across all systems." 
          , imagePath: "/services/PT/PT4.png"
        },
        { title: "Password & Credential Security Testing", desc: "Performing brute-force, dictionary, and privilege escalation attacks to identify weak credentials."
          , imagePath: "/services/PT/PT5.png"
         },
        { title: "Mobile & API Pen Testing", desc: "Assessing mobile apps and APIs for insecure data handling and authentication gaps." 
          , imagePath: "/services/PT/PT6.png"  
        },
        { title: "Social Engineering Simulation", desc: "Conducting phishing campaigns and awareness testing to evaluate human factor security."
          , imagePath: "/services/PT/PT7.png"
         }
    ];

    const keyAspectsData = {
        title: "Penetration Testing Process",
        desc: "Our key aspects:",
        image: "/services/PT1.png"
    };

    return (
        <ServicesLayout
            heroData={heroData}
            methodologyData={methodologyData}
            keyAspectsData={keyAspectsData}
            methodologyLayout="cards"
        />
    )
}