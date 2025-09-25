"use client";

import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const MotionImage = motion(Image);

export default function ServicePage() {
  const services = [
    {
      title: "Vulnerability Assessment",
      description: `A structured process to uncover, analyze, and prioritize security weaknesses across IT infrastructure, applications, cloud, and endpoints.`,
      imageName: "VA.png",
    },
    {
      title: "Penetration Testing",
      description: `Controlled ethical hacking that simulates real-world cyberattacks.`,
      imageName: "PT.png",
    },
    {
      title: "Security Operations Center",
      description: `24/7 monitoring, detection, and response to cyber threats.`,
      imageName: "SOC.png",
    },
    {
      title: "Cloud Security",
      description: `End-to-end protection for AWS, Azure, and GCP workloads.`,
      imageName: "CS.png",
    },
    {
      title: "Network Security",
      description: `Multi-layered defenses including firewalls, IDS/IPS, endpoint controls, and zero-trust segmentation.`,
      imageName: "NS.png",
    },
    {
      title: "Cybersecurity Consultancy",
      description: `Advisory services to strengthen governance, policies, employee awareness, and strategic planning.`,
      imageName: "CC.png",
    },
  ];

  const [isVisible, setIsVisible] = useState(Array(services.length).fill(false));
  const serviceRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = serviceRefs.current.findIndex(
              (ref) => ref === entry.target
            );
            if (index !== -1) {
              setIsVisible((prev) => {
                const newState = [...prev];
                newState[index] = true;
                return newState;
              });
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    serviceRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      serviceRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  // Animation variants for text (from left)
  const textVariants = {
    hidden: { 
      opacity: 0, 
      x: -100,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.2
      }
    }
  };

  // Animation variants for images (from right)
  const imageVariants = {
    hidden: { 
      opacity: 0, 
      x: 100,
      scale: 0.8,
      rotateY: 15
    },
    visible: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      rotateY: 0,
      transition: {
        duration: 0.9,
        ease: "easeOut",
        delay: 0.3
      }
    }
  };

  // Child animation variants for staggered text elements
  const childVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      x: -30
    },
    visible: { 
      opacity: 1, 
      y: 0,
      x: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white py-12 px-4 md:px-8 lg:px-16 overflow-hidden">
      {/* Heading */}
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500 mb-4 mt-4">
          OUR SERVICES
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
          Comprehensive cybersecurity solutions to protect your digital assets
        </p>
        <motion.div
          className="w-24 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 mx-auto mt-6 rounded-full"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Services */}
      <div className="space-y-20 md:space-y-32">
        {services.map((service, index) => (
          <div
            key={index}
            ref={(el) => (serviceRefs.current[index] = el)}
            className={`flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 ${
              index % 2 === 0 ? "md:flex-row-reverse" : ""
            }`}
          >
            {/* Text Content */}
            <motion.div
              className="w-full md:w-1/2 flex flex-col justify-center"
              variants={textVariants}
              initial="hidden"
              animate={isVisible[index] ? "visible" : "hidden"}
            >
              <motion.h2 
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-indigo-300"
                variants={childVariants}
              >
                {service.title}
              </motion.h2>
              
              <motion.p 
                className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed"
                variants={childVariants}
              >
                {service.description}
              </motion.p>

              <motion.div variants={childVariants}>
                <Link
                  href={`/services/${service.title
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                  className="hidden md:inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105 w-fit group"
                >
                  Know More
                  <motion.svg
                    className="w-5 h-5 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </motion.svg>
                </Link>
              </motion.div>
            </motion.div>

            {/* Image Content */}
            <motion.div
              className="w-full md:w-1/2 relative group perspective-1000"
              variants={imageVariants}
              initial="hidden"
              animate={isVisible[index] ? "visible" : "hidden"}
              whileHover={{ scale: 1.02, rotateY: -2 }}
              transition={{ type: "spring", stiffness: 120 }}
            >
              <motion.div 
                className="relative overflow-hidden rounded-2xl shadow-2xl transform-gpu"
                whileHover={{ 
                  scale: 1.05,
                  rotateX: 2,
                  rotateY: -5,
                  z: 50
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-60 z-10"></div>
                
                {/* Animated border glow */}
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: "linear-gradient(45deg, transparent, rgba(147, 51, 234, 0.3), transparent, rgba(79, 70, 229, 0.3), transparent)",
                    backgroundSize: "400% 400%"
                  }}
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                
                <MotionImage
                  src={`/services/${service.imageName}`}
                  alt={service.title}
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover relative z-20"
                  initial={{ scale: 1.1, opacity: 0 }}
                  animate={isVisible[index] ? { scale: 1, opacity: 1 } : { scale: 1.1, opacity: 0 }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                  whileHover={{ scale: 1.15 }}
                />
              </motion.div>

              {/* Enhanced floating elements */}
              <motion.div
                className="absolute -top-6 -right-6 w-12 h-12 bg-purple-500 rounded-full blur-xl opacity-0 group-hover:opacity-70"
                animate={isVisible[index] ? { 
                  y: [0, -15, 0],
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.7, 0.3]
                } : {}}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute -bottom-6 -left-6 w-12 h-12 bg-indigo-500 rounded-full blur-xl opacity-0 group-hover:opacity-70"
                animate={isVisible[index] ? { 
                  y: [0, 15, 0],
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.8, 0.3]
                } : {}}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }}
              />

              {/* Additional particle effects */}
              <motion.div
                className="absolute top-1/2 -left-4 w-2 h-2 bg-purple-400 rounded-full opacity-0 group-hover:opacity-80"
                animate={isVisible[index] ? {
                  x: [0, 20, 0],
                  opacity: [0, 0.8, 0],
                  scale: [0, 1, 0]
                } : {}}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 1 }}
              />

              {/* Mobile Button with enhanced animation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible[index] ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.8 }}
              >
                <Link
                  href={`/services/${service.title
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                  className="mt-6 block md:hidden text-center px-8 py-3 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105 group"
                >
                  Know More
                </Link>
              </motion.div>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}