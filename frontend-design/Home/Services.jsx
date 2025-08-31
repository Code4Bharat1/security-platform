import { useState } from "react";

const services = [
    {
        title: "Vulnerability Assessment",
        imgSrc: "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?auto=format&fit=crop&w=800&q=80",
        description: "Identify, classify, and prioritize vulnerabilities in systems before they become threats."
    },
    {
        title: "Security Operations Center",
        imgSrc: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
        description: "24/7 centralized monitoring, detection, and response to security incidents and threats."
    },
    {
        title: "Digital Forensics",
        imgSrc: "https://images.unsplash.com/photo-1591696205602-2f950c417cb9?auto=format&fit=crop&w=800&q=80",
        description: "Investigate cyber incidents and gather legal digital evidence using forensics tools."
    }
];

export default function ServicesPage() {
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
            <div className="w-full h-[2px] bg-[#9d7af0]/70 backdrop-blur-xl border border-white/20 shadow-lg mb-6 md:mb-10"></div>

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
                                    <p className="text-sm mb-4 mt-6">{service.description}</p>
                                    <button className="text-[#9d7af0] underline font-medium hover:text-[#bba6f3] transition-colors duration-500 ease-in">
                                        Read More
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
}
