import ServicesLayout from "./Layout";

export default function PTPage() {
    const heroData = {
        title: "Penetration Testing",
        desc: `Penetration Testing is a controlled simulation of cyberattacks designed to evaluate the security of applications, networks, and infrastructure. By mimicking real-world attack techniques, penetration testing reveals exploitable vulnerabilities and validates the effectiveness of existing security controls. It goes beyond detection by demonstrating the actual impact of security flaws.`,
        videoPath: "/Services/PT.mp4"
    };

    const methodologyData = [
  {
    title: "External & Internal Network Pen Testing",
    desc: "Simulating real-world attacks on both public-facing and internal systems to identify exploitable weaknesses.",
    imagePath: "/Services/PT01.png"
  },
  {
    title: "Web Application Pen Testing",
    desc: "Testing authentication, input validation, session handling, and business logic to uncover critical flaws.",
    imagePath: "/Services/PT2.png"
  },
  // {
  //   title: "Vulnerability Identification",
  //   desc: "Performing brute-force, dictionary, and privilege escalation attacks to identify weak or reused credentials.",
  //   imagePath: "/Services/PT3.png"
  // },
  {
    title: "Password & Credential Security Testing",
    desc: "Performing brute-force, dictionary, and privilege escalation attacks to identify weak or reused credentials.",
    imagePath: "/Services/PT4.png"
  },
  {
    title: "Mobile & API Pen Testing",
    desc: "Assessing mobile apps and APIs for insecure data handling, authentication gaps, and potential data leaks.",
    imagePath: "/Services/PT5.png"
  },
  {
    title: "Social Engineering Simulation",
    desc: "Conducting phishing campaigns, email spoofing, and awareness testing to evaluate the human factor in security.",
    imagePath: "/Services/PT6.png"
  },
  {
    title: "Exploitation with PoC & Remediation Plan",
    desc: "Demonstrating vulnerabilities with proof-of-concept exploits and providing a structured hardening plan for remediation.",
    imagePath: "/Services/PT7.png"
  }
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