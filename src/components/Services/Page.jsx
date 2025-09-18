"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export default function ServicePage() {
    const services = [
        {
            title: 'Vulnerability Assessment',
            description: `A structured process to uncover, analyze, and prioritize security weaknesses across IT infrastructure, applications, cloud, and endpoints. Goes beyond automated scans by validating findings and mapping them to real-world attack scenarios.`,
            imageName: 'VA.png',
        },
        {
            title: 'Penetration Testing',
            description: `Controlled ethical hacking that simulates real-world cyberattacks. Unlike VA, it shows if vulnerabilities can actually be exploited and their business impact.`,
            imageName: 'PT.png',
        },
        {
            title: 'Security Operations Center',
            description: `24/7 monitoring, detection, and response to cyber threats using SIEM, AI-driven analytics, and threat intelligence. Ensures rapid incident detection and containment across networks, endpoints, and cloud.`,
            imageName: 'SOC.png',
        },
        {
            title: 'Cloud Security',
            description: `End-to-end protection for AWS, Azure, and GCP workloads. Focuses on misconfiguration reviews, IAM security, workload testing, anomaly detection, and compliance across hybrid and multi-cloud environments.`,
            imageName: 'CS.png',
        },
        {
            title: 'Network Security',
            description: `Multi-layered defenses including firewalls, IDS/IPS, endpoint controls, and zero-trust segmentation. Prevents unauthorized access, malware, and ransomware across enterprise networks.`,
            imageName: 'NS.png',
        },
        {
            title: 'Cybersecurity Consultancy',
            description: `Advisory services to strengthen governance, policies, employee awareness, and strategic planning. Builds a security-first culture and aligns cybersecurity with business goals.`,
            imageName: 'CC.png',
        },
    ];

    const [isVisible, setIsVisible] = useState(Array(services.length).fill(false));
    const serviceRefs = useRef([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = serviceRefs.current.findIndex(ref => ref === entry.target);
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

        serviceRefs.current.forEach(ref => {
            if (ref) observer.observe(ref);
        });

        return () => {
            serviceRefs.current.forEach(ref => {
                if (ref) observer.unobserve(ref);
            });
        };
    }, []);

    // Add ref to each service
    useEffect(() => {
        serviceRefs.current = serviceRefs.current.slice(0, services.length);
    }, [services.length]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white py-12 px-4 md:px-8 lg:px-16">
            <div className="text-center mb-16">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500 mb-4">
                    OUR SERVICES
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
                    Comprehensive cybersecurity solutions to protect your digital assets
                </p>
                <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 mx-auto mt-6 rounded-full"></div>
            </div>

            <div className="space-y-20 md:space-y-32">
                {services.map((service, index) => (
                    <div
                        key={index}
                        ref={el => serviceRefs.current[index] = el}
                        className={`flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 transition-all duration-700 ease-out ${isVisible[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                    >
                        {/* Text Content */}
                        <div className="w-full md:w-1/2 flex flex-col justify-center">
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-300">
                                {service.title}
                            </h2>
                            <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
                                {service.description}
                            </p>
                            {/* Button - Desktop only */}
                        <Link 
                            href={`/services/${service.title.toLowerCase().replace(/\s+/g, "-")}`}
                            className="hidden md:inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105 w-fit group"
                        >
                            Know More
                            <svg className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>

                        </div>
                                                {/* Image with Hover Effect */}
                        <div className="w-full md:w-1/2 relative group">
                            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-60 z-10"></div>
                                <img
                                    src={`/Services/${service.imageName}`}
                                    alt={service.title}
                                    className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                />
                                <div className="absolute inset-0 border border-transparent group-hover:border-purple-500/30 transition-all duration-700 ease-out z-20"></div>
                            </div>
                            
                            {/* Floating elements on hover */}
                            <div className="absolute -inset-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out pointer-events-none z-30">
                                <div className="absolute -top-4 -right-4 w-8 h-8 bg-purple-500 rounded-full blur-xl"></div>
                                <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-indigo-500 rounded-full blur-xl"></div>
                            </div>

                            {/* Button - Mobile only */}
                            <Link 
                                href={`/services/${service.title.toLowerCase().replace(/\s+/g, "-")}`}
                                className="mt-6 block md:hidden text-center px-8 py-3 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105 group"
                            >
                                Know More
                                <svg className="w-5 h-5 ml-2 inline transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </div>

                        
                        
                    </div>
                ))}
            </div>

        </div>
    );
}