import { useState } from "react";
import { useRouter } from 'next/navigation';
const services = [
    {
        title: "Vulnerability Assessment",
        imgSrc: "/OurCoreServices/VA.png",
        description: "Identify, classify, and prioritize vulnerabilities in systems before they become threats.",
    },
    {
        title: "Penetration Testing",
        imgSrc: "/OurCoreServices/PT.png",
        description: "Investigate cyber incidents and gather legal digital evidence using forensics tool.",
        
    },
    {
        title: "Security Operations Center",
        imgSrc: "/OurCoreServices/SOC.png",
        description: "24/7 centralized monitoring, detection, and response to security incidents and threatss.",
    }
];

export default function ServicesPage() {
    const {push} = useRouter()
    const [expandedIndex, setExpandedIndex] = useState(null);

    const handleToggle = (index) => {
        setExpandedIndex(prev => (prev === index ? null : index));
    };

    return (
        <div className="">
            <div className="mx-5 lg:mx-15 grid grid-cols-1 grid-rows-2 size-fit text-white items-end text-center font-inter font-bold underline underline-offset-8 md:underline-offset-12 decoration-[#9d7af0]/70 shadow-lg text-nowrap">
                <h2 className="col-start-1 row-start-1 text-5xl md:text-6xl lg:text-7xl font-black mask-alpha mask-b-from-5%">SERVICES</h2>
                <h3 className="col-start-1 row-start-1 text-2xl md:text-3xl lg:text-4xl font-extrabold">Our Core Services</h3>
            </div>

            {/* Horizontal line */}
            {/* <div className="w-full h-[2px] bg-[#9d7af0]/70 backdrop-blur-xl border border-white/20 shadow-lg mb-6 md:mb-10"></div> */}

            {/* Services */}
            <div className="flex flex-col md:flex-row justify-around items-stretch gap-6 px-6 bg-white/10 backdrop-blur-2xl border border-white/20 py-6 transition-all duration-700 ease-in lg:flex-wrap">
                {services.map((service, index) => (
                    <div
                        key={index}
                        className="flex flex-col items-center justify-between text-white bg-white/5 border border-white/10 rounded-md overflow-hidden flex-1 max-w-sm transition-transform duration-500 ease-in hover:scale-105 cursor-pointer"
                        onClick={() => handleToggle(index)}
                        onMouseEnter={() => handleToggle(index)}
                        onMouseLeave={() => setExpandedIndex(null)}
                    >
                        {/* Image container */}
                        <div className="relative w-full aspect-[4/3] overflow-hidden group">
                            <img
                                src={service.imgSrc}
                                alt={service.title}
                                className="object-cover w-full h-full transition-transform duration-500 ease-in-out group-hover:scale-110"
                            />
                            {/* Title over image */}
                            <div className="absolute bottom-0 w-full bg-white/80 backdrop-blur-md text-black text-center py-2 font-semibold text-lg z-10">
                                {service.title}
                            </div>

                            {/* Description overlay */}
                            <div
                                className={`absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-md text-white text-center px-4 py-6 z-20 transition-all duration-500 ease-in-out transform size-full
        ${expandedIndex === index
                                        ? 'opacity-100 translate-y-0 pointer-events-auto'
                                        : 'opacity-0 translate-y-10 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto'
                                    }`}
                            >
                                <div className="flex flex-col">
                                    <p className="text-sm mb-6 mt-6 leading-relaxed">{service.description}</p>
                                    <button 
                                        className="relative inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#9d7af0] to-[#7c5ce0] border border-[#9d7af0]/50 rounded-lg shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out hover:from-[#bba6f3] hover:to-[#9d7af0] hover:shadow-xl hover:shadow-[#9d7af0]/25 hover:scale-105 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#9d7af0]/50 focus:ring-offset-2 focus:ring-offset-transparent active:scale-95"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            push(`/services/${service.title.toLowerCase().replace(/\s+/g, "-")}`);
                                        }}
                                    >
                                        <span className="mr-2">Read More</span>
                                        <svg 
                                            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                        
                                        {/* Glowing effect on hover */}
                                        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#9d7af0] to-[#7c5ce0] opacity-0 blur-xl transition-opacity duration-300 hover:opacity-30 -z-10"></div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>


            {/* Horizontal line */}
            <div className="w-full h-[2px] bg-[#9d7af0]/70 backdrop-blur-xl border border-white/20 shadow-lg mt-6 md:mt-10"></div>
        </div>

    )
};