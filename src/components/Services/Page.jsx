import Link from "next/link";
export default function ServicePage() {
    const services = [
        {
            title: 'Vulnerability Assessment',
            description: `A structured process to uncover, analyze, and prioritize security weaknesses across IT infrastructure, applications, cloud, and endpoints. Goes beyond automated scans by validating findings and mapping them to real-world attack scenarios.`,
            imageName: 'VA.png', // Replace with actual image path
        },
        {
            title: 'Penetration Testing',
            description: `Controlled ethical hacking that simulates real-world cyberattacks. Unlike VA, it shows if vulnerabilities can actually be exploited and their business impact.`,
            imageName: 'PT.png', // Replace with actual image path
        },
        {
            title: 'Security Operations Center',
            description: `24/7 monitoring, detection, and response to cyber threats using SIEM, AI-driven analytics, and threat intelligence. Ensures rapid incident detection and containment across networks, endpoints, and cloud.`,
            imageName: 'SOC.png', // Replace with actual image path
        },
        // {
        //     title: 'Cloud Security',
        //     description: `End-to-end protection for AWS, Azure, and GCP workloads. Focuses on misconfiguration reviews, IAM security, workload testing, anomaly detection, and compliance across hybrid and multi-cloud environments.`,
        //     imageName: 'CS.png', // Replace with actual image path
        // },
        // {
        //     title: 'Forensic Services',
        //     description: `Digital forensic investigations to trace attacker activity, recover compromised data, and provide legally defensible evidence. Helps reconstruct incidents for compliance, litigation, and regulatory audits.`,
        //     imageName: 'FS.png', // Replace with actual image path
        // },
        // {
        //     title: 'Network Security',
        //     description: `Multi-layered defenses including firewalls, IDS/IPS, endpoint controls, and zero-trust segmentation. Prevents unauthorized access, malware, and ransomware across enterprise networks.`,
        //     imageName: 'NS.png', // Replace with actual image path
        // },
        // {
        //     title: 'Cybersecurity Consultancy',
        //     description: `Advisory services to strengthen governance, policies, employee awareness, and strategic planning. Builds a security-first culture and aligns cybersecurity with business goals.`,
        //     imageName: 'CC.png', // Replace with actual image path
        // },
        // {
        //     title: 'Governance, Risk & Compliance',
        //     description: `Unified framework for governance, risk management, and compliance. Helps organizations achieve continuous audit readiness, improve accountability, and make risk-informed business decisions.`,
        //     imageName: 'GRC.png', // Replace with actual image path
        // },
    ];
    return (
        <div className="flex flex-col p-8 bg-black text-white mx-1 md:mx-5 lg:mx-10 gap-3 md:gap-10">
            {services.map((service, index) => (
                <div
                    key={index}
                    className={`
            flex flex-1 flex-col-reverse md:${index % 2 === 0 ? 'flex-row-reverse' : 'flex-row'} 
            items-center justify-between gap-3 md:gap-10
          `}
                >
                    {/* Text Content */}
                    <div className="w-full md:w-1/2 flex flex-col justify-between text-justify flex-1">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 text-center md:text-left">
                            {service.title}
                        </h2>
                        <p className="text-base md:text-md lg:text-lg xl:text-xl mb-6 text-justify">{service.description}</p>
                        <Link className="block bg-[#A580FF] text-white px-4 py-2 rounded hover:bg-[#A580FF]/50 self-center md:self-start mx-auto text-md md:text-lg lg:text-xl xl:text-2xl"
                        href={`/services/${service.title.toLowerCase().replace(' ',"-")}`}>
                            Know more
                        </Link>
                    </div>
                    {/* Image */}
                    <div className="w-full md:w-1/2">
                        <img
                            src={`/Services/${service.imageName}`}
                            alt={service.title}
                            className="object-contain"
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}