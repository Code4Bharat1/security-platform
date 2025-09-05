"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ToolsCard() {
  const { push } = useRouter();
  const searchParams = useSearchParams();

  const buttonList = [
    [
      {
        name: "Vulnerability Scanner",
        image: "/tools/card-images/vuln_scanner.png",
        description:
          "Scan websites for security weaknesses like XSS or SQL injection.",
        slug: "vuln-scanner",
        buttonLabel: "Scan for Vulnerabilities",
        type: "red-team",
      },
      {
        name: "Source Code Analyzer",
        image: "/tools/card-images/ode.png",
        description: "Analyze source code for vulnerabilities.",
        slug: "Source-Code",
        buttonLabel: "Check Your Code's",
        type: "red-team",
      },
    ],
    [
      {
        name: "WAF Scanner",
        image: "/tools/card-images/waf1.png",
        description:
          "Detects and analyzes WAF protection on a website, providing insights into security rules.",
        slug: "firewallDashboard",
        buttonLabel: "Check WAF",
        type: "blue-team",
      },
      {
        name: "HTTPS Security Checker",
        image: "/tools/card-images/https-security.png",
        description: "Validate HTTPS security implementation.",
        slug: "httpsCheckerForm",
        buttonLabel: "HTTPS Security Checker",
        type: "blue-team",
      },
    ],
    [
      {
        name: "WhatsApp Privacy Inspector",
        image: "/tools/card-images/wp.png",
        description:
          "Checks WhatsApp settings for potential privacy risks.",
        slug: "whatsapp-privacy-inspector",
        buttonLabel: "Inspect Now",
        type: "non-tech",
      },
      {
        name: "Email Attachment Analyzer",
        image: "/tools/card-images/email.png",
        description:
          "Scans email attachments for malware or hidden threats.",
        slug: "email-attachment-analyzer",
        buttonLabel: "Analyze File",
        type: "non-tech",
      },
    ],
  ];

  const initialCategories = [
    {
      title: "Red Teaming",
      description: "Offensive security topics,\npenetration testing, etc.",
      bgColorClass: "bg-red-500",
      textColorClass: "text-white",
      glowColor: "#D01A1A",
      buttonColor: "bg-[#D01A1A] hover:bg-[#b31515]",
      borderGlow: "hover:border-[#D01A1A] hover:shadow-[0_0_15px_#D01A1A]",
    },
    {
      title: "Blue Teaming",
      description: "Defensive security,\nmonitoring, SIEM, etc.",
      bgColorClass: "bg-blue-500",
      textColorClass: "text-white",
      glowColor: "#3C6DFF",
      buttonColor: "bg-[#3C6DFF] hover:bg-[#2a5de0]",
      borderGlow: "hover:border-[#3C6DFF] hover:shadow-[0_0_15px_#3C6DFF]",
    },
    {
      title: "Non-Tech",
      description: "Tools for everyday usage.",
      bgColorClass: "bg-green-500",
      textColorClass: "text-white",
      glowColor: "#008000",
      buttonColor: "bg-[#008000] hover:bg-[#006400]",
      borderGlow: "hover:border-[#008000] hover:shadow-[0_0_15px_#008000]",
    },
  ];

  // ✅ Safe initial selection logic
  const getInitialSelection = () => {
    try {
      const categoryParam = searchParams?.get?.("category");

      if (typeof categoryParam === "string" && categoryParam.length > 0) {
        const categoryIndex = initialCategories.findIndex((cat) =>
          typeof cat?.title === "string" && cat.title.toLowerCase().includes(categoryParam.toLowerCase())
        );
        if (categoryIndex !== -1) return categoryIndex;
      }

      if (typeof window !== "undefined") {
        const savedCategory = localStorage.getItem("selectedToolCategory");
        if (savedCategory) {
          const parsedIndex = parseInt(savedCategory, 10);
          if (
            !isNaN(parsedIndex) &&
            parsedIndex >= 0 &&
            parsedIndex < initialCategories.length
          ) {
            return parsedIndex;
          }
        }
      }
    } catch (e) {
      console.warn("getInitialSelection error:", e);
    }

    return 1; // Default → Blue Team
  };

  const [categories, setCategories] = useState(() => initialCategories);
  const [buttons, setButtons] = useState(() => buttonList[getInitialSelection()]);
  const [activeGlow, setActiveGlow] = useState(categories[1].glowColor);
  const [activeButtonStyle, setActiveButtonStyle] = useState(
    categories[1].buttonColor
  );
  const [activeBorderGlow, setActiveBorderGlow] = useState(
    categories[1].borderGlow
  );

  useEffect(() => {
    setActiveGlow(categories[1].glowColor);
    setActiveButtonStyle(categories[1].buttonColor);
    setActiveBorderGlow(categories[1].borderGlow);
  }, [categories]);

  const handleCardClick = (index) => {
    if (!Array.isArray(categories) || index < 0 || index >= categories.length) return;
    const newCategories = [...categories];
    const typeTemp = newCategories[index];
    if (!typeTemp || typeof typeTemp.title !== "string") return;

    let type = 1;
    if (typeTemp.title.includes("Red")) type = 0;
    else if (typeTemp.title.includes("Blue")) type = 1;
    else if (typeTemp.title.includes("Non-Tech")) type = 2;

    if (newCategories[1] && newCategories[index]) {
      const temp = newCategories[1];
      newCategories[1] = newCategories[index];
      newCategories[index] = temp;
      setCategories(newCategories);
      setButtons(buttonList[type]);
    }

    if (typeof window !== "undefined") {
      const originalIndex = initialCategories.findIndex(
        (cat) => cat.title === typeTemp.title
      );
      if (originalIndex !== -1) {
        localStorage.setItem("selectedToolCategory", originalIndex.toString());
      }
    }
  };

  const navigateToTool = (slug) => {
    if (typeof window !== "undefined") {
      const currentCategory = categories[1].title;
      const originalIndex = initialCategories.findIndex(
        (cat) => cat.title === currentCategory
      );
      localStorage.setItem("selectedToolCategory", originalIndex.toString());
    }
    push(`/tools/${slug}`);
  };

  return (
    <div className="my-10 min-h-screen px-4 sm:px-8 font-inter flex flex-col">
      <h2 className="text-white text-4xl font-black text-center mb-8">
        <span className="text-[#9d7af0]">Toolkits</span> | Security Platform
      </h2>

      {/* Categories */}
      <div className="flex flex-col lg:flex-row gap-8 mb-12">
        {categories.map((cat, index) => {
          const isMiddleCard = index === 1;
          return (
            <div
              key={index}
              className={`flex-1 rounded-2xl p-8 cursor-pointer transition-all duration-300
                ${cat.bgColorClass} ${
                isMiddleCard
                  ? "ring-4 ring-white ring-opacity-90 scale-105 shadow-2xl"
                  : "opacity-90 hover:opacity-100 hover:scale-102"
              }`}
              onClick={() => handleCardClick(index)}
            >
              <h3 className={`text-2xl font-bold mb-3 ${cat.textColorClass}`}>
                {cat.title}
              </h3>
              <p className={`text-base ${cat.textColorClass}`}>
                {cat.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {buttons.map((tool, i) => (
          <SampleToolCard
            key={i}
            img_path={tool.image}
            title={tool.name}
            subtitle={tool.description}
            slug={tool.slug}
            onNavigate={navigateToTool}
            buttonColor={activeButtonStyle}
            borderGlow={activeBorderGlow}
          />
        ))}
      </div>
    </div>
  );
}

function SampleToolCard({
  img_path,
  title,
  subtitle,
  slug,
  onNavigate,
  buttonColor,
  borderGlow,
}) {
  return (
    <div
      className={`bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20 transition-all duration-300 hover:scale-[1.02] cursor-pointer h-full ${borderGlow}`}
      onClick={() => onNavigate(slug)}
    >
      <div className="flex flex-col items-center h-full">
        <img
          src={img_path}
          alt={title}
          className="h-20 w-20 object-contain mb-4"
        />
        <h3 className="text-white text-lg font-semibold text-center mb-2">
          {title}
        </h3>
        <p className="text-gray-300 text-sm text-center flex-grow">{subtitle}</p>
        <button
          className={`mt-4 ${buttonColor} text-white py-2 px-4 rounded-lg text-sm transition-colors cursor-pointer`}
        >
          Try Now
        </button>
      </div>
    </div>
  );
}
