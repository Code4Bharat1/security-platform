"use client";

import { useState, useRef, useEffect } from "react";

export default function VAPage() {
    const heroData = { title: "Vulnerability Assessment", desc: `Vulnerability Assessment (VA) is the first line of defense in a strong cybersecurity program. It is a structured process designed to uncover, analyze, and prioritize security weaknesses across an organization’s IT infrastructure, applications, cloud environments, and endpoints. Our VA services go beyond automated scans—every finding is validated by security experts and mapped against real-world attack scenarios, ensuring your remediation strategy is both actionable and business-focused.`,
        videoPath: "/services/VA.mp4"

     }
    const methodologyData = [
        { title: "Network Vulnerability Scanning", desc: "Detect open ports, weak services, and misconfigured firewalls." },
        { title: "Web Application Assessment", desc: "Review business-critical applications for OWASP Top 10 flaws, insecure APIs, and broken authentication." },
        { title: "Mobile Application Assessment", desc: "Analyze Android/iOS apps for insecure storage, permissions misuse, and unsafe data transmission." },
        { title: "Cloud Vulnerability Assessment", desc: "Identify misconfigured IAM roles, exposed cloud storage, and insecure workloads across AWS, Azure, and GCP." },
        { title: "Endpoint & Host Review", desc: "Evaluate OS patches, privilege escalations, insecure accounts, and device-level exposures." }
    ];
    
    const approchData = {
        firstRow: [
            "Reconnaissance and threat modeling.",
            "Vulnerability identification.",
            "Exploitation and post-exploitation.",
        ], 
        secondRow: [
            {
                text: "Attack path documentation.",
                colStart: "col-start-2",
            },
            {
                text: "Reporting with PoCs and risk-based recommendations.",
                colStart: "col-start-4",
            },
        ]
    };
    
    return (
        <ServicesLayout 
            heroData={heroData} 
            methodologyData={methodologyData} 
            approchData={approchData} 
        />
    );
}

function ServicesLayout({ heroData, methodologyData, approchData }) {
    return (
        <div className="bg-gradient-to-b from-gray-900 to-black text-white">
            <DescHero data={heroData} />
            <Methodology data={methodologyData} />
            <OurApproch data={approchData} />
        </div>
    );
}

function DescHero({ data }) {
    const titleParts = data.title.split(" ");
    const firstPart = titleParts[0]; // "Vulnerability"
    const secondPart = titleParts.slice(1).join(" "); // "Assessment"

    return (
        <div className="relative h-screen font-inter overflow-hidden text-white">
            <video
                className="absolute top-0 left-0 w-full h-full object-cover z-0"
                autoPlay
                loop
                muted
                playsInline
            >
                <source src="/VA.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/40 z-1"></div>
            
            {/* Content */}
            <div className="relative flex flex-col h-full justify-center items-center z-2 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20">
                {/* Split Title */}
                <div className="flex flex-col md:flex-row w-full max-w-6xl justify-between items-center mb-8">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-left md:w-2/5">
                        {firstPart}
                    </h1>
                    <div className="hidden md:block w-1 h-32 bg-gradient-to-b from-transparent via-[#9d7af0] to-transparent mx-8"></div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-right md:w-2/5 mt-4 md:mt-0">
                        {secondPart}
                    </h1>
                </div>
                
                {/* Description */}
                <div className="max-w-4xl bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                    <p className="text-lg md:text-xl text-gray-200 leading-relaxed text-center">
                        {data.desc}
                    </p>
                </div>
                
                {/* Scroll indicator */}
                <div className="absolute bottom-10 flex flex-col items-center">
                    <p className="text-sm text-gray-300 mb-2">Scroll to explore</p>
                    <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center">
                        <div className="w-1 h-3 bg-gray-300 rounded-full mt-2 animate-bounce"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Methodology({ data }) {
    const [isVisible, setIsVisible] = useState(Array(data.length).fill(false));
    const methodologyRefs = useRef([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = methodologyRefs.current.findIndex(ref => ref === entry.target);
                        setIsVisible(prev => {
                            const newState = [...prev];
                            newState[index] = true;
                            return newState;
                        });
                    }
                });
            },
            { threshold: 0.3 }
        );

        methodologyRefs.current.forEach(ref => {
            if (ref) observer.observe(ref);
        });

        return () => {
            methodologyRefs.current.forEach(ref => {
                if (ref) observer.unobserve(ref);
            });
        };
    }, [data.length]);

    return (
        <div className="relative min-h-screen py-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20">
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black z-0"></div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500">
                Methodology
            </h2>
            
            <div className="flex flex-col gap-16 relative z-10">
                {data.map((item, index) => (
                    <div 
                        key={index}
                        ref={el => methodologyRefs.current[index] = el}
                        className={`flex flex-col text-center transition-all duration-700 ease-out ${isVisible[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                    >
                        <h3 className={`w-full md:w-4/5 lg:w-2/3 py-4 bg-gradient-to-r from-[#A580FF]/20 to-[#7C4DFF]/20 backdrop-blur-lg text-xl sm:text-2xl lg:text-3xl font-bold rounded-lg mx-auto ${index % 2 === 0 ? "md:ml-auto" : "md:mr-auto"}`}>
                            {item.title}
                        </h3>
                        <p className="w-full md:w-4/5 lg:w-2/3 bg-white/5 backdrop-blur-lg py-4 px-6 font-medium text-lg md:text-xl leading-relaxed rounded-lg mx-auto mt-4">
                            {item.desc}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function OurApproch({ data }) {
    return (
        <div className="py-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500">
                Our Approach
            </h2>
            
            {/* Desktop Grid Layout */}
            <div className="hidden md:grid grid-cols-6 gap-6 text-white text-center">
                {/* Row 1 */}
                {data.firstRow.map((item, index) => (
                    <div key={index} className="col-span-2 flex justify-center items-center">
                        <div className="rounded-xl font-semibold text-lg border-dashed border-2 border-[#A580FF]/50 p-6 w-full aspect-video bg-gradient-to-br from-[#A580FF]/10 to-[#7C4DFF]/10 backdrop-blur-lg h-full flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20">
                            {item}
                        </div>
                    </div>
                ))}

                {/* Row 2 */}
                {data.secondRow.map((item, index) => (
                    <div
                        key={index}
                        className={`${item.colStart} col-span-2 flex justify-center items-center`}
                    >
                        <div className="rounded-xl font-semibold text-lg border-dashed border-2 border-[#A580FF]/50 p-6 w-full aspect-video bg-gradient-to-br from-[#A580FF]/10 to-[#7C4DFF]/10 backdrop-blur-lg h-full flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20">
                            {item.text}
                        </div>
                    </div>
                ))}
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden flex flex-col gap-8 text-white text-center">
                {[...data.firstRow, ...data.secondRow.map(item => item.text)].map((item, index) => (
                    <div key={index} className="w-full flex justify-center items-center">
                        <div className="rounded-xl font-semibold text-lg border-dashed border-2 border-[#A580FF]/50 p-6 w-full aspect-video bg-gradient-to-br from-[#A580FF]/10 to-[#7C4DFF]/10 backdrop-blur-lg h-full flex items-center justify-center transition-all duration-300 hover:scale-105">
                            {item}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}