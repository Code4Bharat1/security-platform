"use client";

import { useState, useRef, useEffect } from "react";

export default function VAPage() {
    const heroData = {
      title: "Vulnerability Assessment",
      desc: `Vulnerability Assessment (VA) is the first line of defense in a strong cybersecurity program. It is a structured process designed to uncover, analyze, and prioritize security weaknesses across an organization’s IT infrastructure, applications, cloud environments, and endpoints. Our VA services go beyond automated scans—every finding is validated by security experts and mapped against real-world attack scenarios, ensuring your remediation strategy is both actionable and business-focused.`,
      videoPath: "/Services/VA2.mp4"
     }

const methodologyData = [
  {
    title: "Network & System Scanning",
    desc: "Identifying open ports, services, and operating system vulnerabilities across IT assets.",
    imagePath: "/Services/VA01.png"
  },
  {
    title: "Web & Mobile Application VA",
    desc: "Assessing applications for common flaws such as OWASP Top 10 issues, insecure APIs, and mobile app security weaknesses.",
    imagePath: "/Services/VA3.png"
  },
  {
    title: "Patch & Configuration Review",
    desc: "Checking for missing security patches, outdated software, and weak or default configurations.",
    imagePath: "/Services/patch.png"
  },
  {
    title: "Database & Cloud Assessment",
    desc: "Detecting misconfigurations, insecure permissions, and vulnerabilities in databases and cloud environments.",
    imagePath: "/Services/VA4.png"
  },
  {
    title: "Wireless Network VA",
    desc: "Evaluating Wi-Fi networks for weak encryption, rogue access points, and other wireless security risks.",
    imagePath: "/Services/VA6.png"
  },
  {
    title: "Risk-Based Reporting & Remediation Guidance",
    desc: "Categorizing vulnerabilities based on severity and providing actionable recommendations for remediation.",
    imagePath: "/Services/VA7.png"
  }
];

    
    // const approchData = {
    //     firstRow: [
    //         "Reconnaissance and threat modeling.",
    //         "Vulnerability identification.",
    //         "Exploitation and post-exploitation.",
    //     ], 
    //     secondRow: [
    //         {
    //             text: "Attack path documentation.",
    //             colStart: "col-start-2",
    //         },
    //         {
    //             text: "Reporting with PoCs and risk-based recommendations.",
    //             colStart: "col-start-4",
    //         },
    //     ]
    // };
    
    return (
        <ServicesLayout 
            heroData={heroData} 
            methodologyData={methodologyData} 
            keyAspectsData={KeyAspects} 
            // approchData={approchData} 
        />
    );
}

function ServicesLayout({ heroData, methodologyData, approchData ,keyAspectsData}) {
    return (
        <div className="bg-gradient-to-b from-gray-900 to-black text-white">
            <DescHero data={heroData} />
            <Hero data={heroData} />
            <Methodology data={methodologyData} />
            <KeyAspects data={keyAspectsData} />
            {/* <OurApproch data={approchData} /> */}
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
                <source src="/Services/VA2.mp4" type="video/mp4" />
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
                    <div className="hidden md:block w-1 h-32 mx-8"></div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-right md:w-2/5 mt-4 md:mt-0">
                        {secondPart}
                    </h1>
                </div>
            </div>
        </div>
    );
}

function KeyAspects() {
  return (
    <div className="py-16 px-6 sm:px-12 lg:px-20 bg-black text-center">
      {/* Section Heading */}
      <h2 className="text-sm uppercase tracking-wider text-orange-600 mb-2">
        Key Aspects of
      </h2>
      <h1 className="text-2xl md:text-4xl font-bold mb-10">
        Vulnerability Assessment Process
      </h1>

      {/* Diagram Image */}
      <div className="flex justify-center">
        <img
          src="/Services/VA1.png" // <-- update with your actual image path
          alt="Vulnerability Assessment Process"
          className="w-full max-w-5xl object-contain"
        />
      </div>
                      <button>
                    <a
                        href="#next-section"
                        className="mt-6 inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300"
                    >
                        Free Consultation
                    </a>
                </button>
    </div>

  );
}

function Hero({ data }) {
  const desc = data.desc.split("Vulnerability Assessment");

  return (
    <div className=" bg-gradient-to-b from-black to-gray-900 z-0 max-w-9xl mx-auto px-6 md:px-25 py-10 grid md:grid-cols-2 gap-8 items-center">
      {/* Left side - Text */}
      <div>
        <p className="text-lg md:text-xl text-gray-200 leading-relaxed">
          {desc[0]}
          <strong className=" text-white">Vulnerability Assessment</strong>
          {desc[1]}
        </p>
      </div>

      {/* Right side - Image */}
      <div className="flex justify-center">
        <img
          src="/OurCoreServices/va-diagram.png"
          alt="Vulnerability Assessment"
          className="rounded-xl shadow-lg w-full max-w-md object-contain"
        />
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
            const index = methodologyRefs.current.findIndex(
              (ref) => ref === entry.target
            );
            setIsVisible((prev) => {
              const newState = [...prev];
              newState[index] = true;
              return newState;
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    methodologyRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      methodologyRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [data.length]);

  return (
    <div className="relative py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-black">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black z-0"></div>

      {/* Section Title */}
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-indigo-500 relative z-10">
        Vulnerability Assessment <br />
        <span className="text-white">Services</span>
      </h2>

      {/* Timeline Layout */}
      <div className="relative flex flex-col space-y-14 max-w-6xl mx-auto z-10">
        {data.map((item, index) => (
          <div
            key={index}
            ref={(el) => (methodologyRefs.current[index] = el)}
            className={`grid grid-cols-1 md:grid-cols-3 gap-6 items-center transition-all duration-700 ease-out ${
              isVisible[index]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            {/* Left Text */}
            {index % 2 === 0 ? (
              <div className="text-right md:pr-6">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ) : (
              <div></div>
            )}

            {/* Icon in Center */}
            <div className="flex justify-center">
              <div className="w-30 h-30 md:w-30 md:h-30  justify-center shadow-lg">
                <img
                  src={item.imagePath}
                  alt={item.title}
                  className="w-30 h-30 md:w-30 md:h-30 object-contain"
                />
              </div>
            </div>

            {/* Right Text */}
            {index % 2 !== 0 ? (
              <div className="text-left md:pl-6">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ) : (
              <div></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}




// function OurApproch({ data }) {
//     return (
//         <div className="py-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20">
//             <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500">
//                 Our Approach
//             </h2>
            
//             {/* Desktop Grid Layout */}
//             <div className="hidden md:grid grid-cols-6 gap-6 text-white text-center">
//                 {/* Row 1 */}
//                 {data.firstRow.map((item, index) => (
//                     <div key={index} className="col-span-2 flex justify-center items-center">
//                         <div className="rounded-xl font-semibold text-lg border-dashed border-2 border-[#A580FF]/50 p-6 w-full aspect-video bg-gradient-to-br from-[#A580FF]/10 to-[#7C4DFF]/10 backdrop-blur-lg h-full flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20">
//                             {item}
//                         </div>
//                     </div>
//                 ))}

//                 {/* Row 2 */}
//                 {data.secondRow.map((item, index) => (
//                     <div
//                         key={index}
//                         className={`${item.colStart} col-span-2 flex justify-center items-center`}
//                     >
//                         <div className="rounded-xl font-semibold text-lg border-dashed border-2 border-[#A580FF]/50 p-6 w-full aspect-video bg-gradient-to-br from-[#A580FF]/10 to-[#7C4DFF]/10 backdrop-blur-lg h-full flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20">
//                             {item.text}
//                         </div>
//                     </div>
//                 ))}
//             </div>

//             {/* Mobile Layout */}
//             <div className="md:hidden flex flex-col gap-8 text-white text-center">
//                 {[...data.firstRow, ...data.secondRow.map(item => item.text)].map((item, index) => (
//                     <div key={index} className="w-full flex justify-center items-center">
//                         <div className="rounded-xl font-semibold text-lg border-dashed border-2 border-[#A580FF]/50 p-6 w-full aspect-video bg-gradient-to-br from-[#A580FF]/10 to-[#7C4DFF]/10 backdrop-blur-lg h-full flex items-center justify-center transition-all duration-300 hover:scale-105">
//                             {item}
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// }