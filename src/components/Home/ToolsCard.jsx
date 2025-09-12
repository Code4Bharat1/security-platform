"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ToolsCard() {
  const { push } = useRouter();

  // --- Tool Lists ---
  const buttonList = [
    [
      {
        name: "Vulnerability Scanner",
        image: "/RedTeam/vuln_scanner.png",
        description:
          "Scan websites for security weaknesses like XSS or SQL injection.",
        slug: "vuln-scanner",
        buttonLabel: "Scan for Vulnerabilities",
        type: "red-team",
      },
      {
        name: "Source Code Analyzer",
        image: "/RedTeam/code.png",
        description:
          "Scan websites for security weaknesses like XSS or SQL injection.",
        slug: "Source-Code",
        buttonLabel: "Check Your Code's",
        type: "red-team",
      },
      {
        name: "Checkmarx Scanner",
        image: "/RedTeam/heckmarx.png",
        description:
          "Scan websites for security weaknesses like XSS or SQL injection.",
        slug: "codeAnalysis",
        buttonLabel: "Scan your codes",
        type: "red-team",
      },
      {
        name: "Subdomain Scanner",
        image: "/RedTeam/subdomain.png",
        description:
          "Scan websites for analyzing subdomains and their security posture.",
        slug: "subdomainEnumeration",
        buttonLabel: "Scan your website",
        type: "red-team",
      },
      {
        name: "Website Recon",
        image: "/RedTeam/web-recon.png",
        description:
          "Perform an-depth reconnaissance of a website to identify key metadata, technologies used.",
        slug: "webrecon",
        buttonLabel: "Website Recon",
        type: "red-team",
      },
      {
        name: "Technology Fingerprinter",
        image: "/RedTeam/fingerprint.png",
        description:
          "Run an OWASP ZAP-powered automated security scan to detect vulnerabilities.",
        slug: "fingerPrint",
        buttonLabel: "fingerPrint",
        type: "red-team",
      },
    ],
    [
      {
        name: "WAF Scanner",
        image: "/BlueTeam/waf.png",
        description:
          "Detects and analyzes WAF protection on a website, providing insights into security rules",
        slug: "firewallDashboard",
        buttonLabel: "Check WAF",
        type: "blue-team",
      },
      {
        name: "HTTPS Security Checker",
        image: "/BlueTeam/https.png",
        description: "Validate HTTPS security implementation.",
        slug: "httpsCheckerForm",
        buttonLabel: "HTTPS Security Checker",
        type: "blue-team",
      },
      {
        name: "JWT Signature Validator",
        image: "/BlueTeam/jwt_signature.png",
        description: "Ensure JWT signature integrity.",
        slug: "JWTSignatureValidator",
        buttonLabel: "JWT Signature Validator",
        type: "blue-team",
      },
      {
        name: "OAuth Token Analyzer",
        image: "/BlueTeam/oauth_token.png",
        description: "Inspect OAuth tokens for security risks.",
        slug: "OAuthTokenInspector",
        buttonLabel: "OAuth Token Analyzer",
        type: "blue-team",
      },
      {
        name: "Obfuscation Detector",
        image: "/BlueTeam/obfuscation Detector.png",
        description: "Identify obfuscation techniques in code.",
        slug: "obfuscationChecker",
        buttonLabel: "Obfuscation Detector",
        type: "blue-team",
      },
      {
        name: "Regex Security Validator",
        image: "/BlueTeam/regex.png",
        description: "Check regular expressions for security flaws",
        slug: "regexDetector",
        buttonLabel: "Regex Security Validator",
        type: "blue-team",
      },
    ],
    [
      {
        name: "WhatsApp Privacy Inspector",
        image: "/GreenTeam/wp.png",
        description: "Checks WhatsApp settings for potential privacy risks.",
        slug: "whatsapp-privacy-inspector",
        buttonLabel: "Inspect Now",
        type: "non-tech",
      },
      {
        name: "Email Attachment Analyzer",
        image: "/GreenTeam/email.png",
        description: "Scans email attachments for malware or hidden threats.",
        slug: "email-attachment-analyzer",
        buttonLabel: "Analyze File",
        type: "non-tech",
      },
      {
        name: "IP Address Info Finder",
        image: "/GreenTeam/ip.png",
        description: "Fetches location and network details of an IP address.",
        slug: "ip-address-info-finder",
        buttonLabel: "Find Info",
        type: "non-tech",
      },
      {
        name: "QR Tool",
        image: "/GreenTeam/QR.png",
        description: "Unsafe QR & QR Generater.",
        slug: "fake-qr-code-detector",
        buttonLabel: "Scan QR",
        type: "non-tech",
      },
      {
        name: "Website Optimization Tool",
        image: "/GreenTeam/optimization.png",
        description:
          "Detects deployment issues like unused code, large assets, and slow-loading elements.",
        slug: "website-optimization-tool",
        buttonLabel: "Check Optimization",
        type: "non-tech",
      },
      {
        name: "SEO Score Analyzer Tool",
        image: "/GreenTeam/seo-score.png",
        description: "Analyzes website SEO and provides improvement tips.",
        slug: "seo-score-analyzer-tool",
        buttonLabel: "Analyze SEO",
        type: "non-tech",
      },
    ],
  ];

  // --- Categories ---
  const initialCategories = [
    {
      title: "Red Teaming",
      description: "Offensive security topics,\npenetration testing, etc.",
      bgColorClass: "bg-red-500",
      bgImageClass:
        "bg-[url('/tools/red-bg-design.png')] bg-bottom bg-no-repeat bg-contain",
      textColorClass: "text-white",
      glowColor: "#D01A1A",
      buttonColor: "bg-[#D01A1A] hover:bg-[#b31515]",
      borderGlow: "hover:border-[#D01A1A] hover:shadow-[0_0_15px_#D01A1A]",
    },
    {
      title: "Blue Teaming",
      description: "Defensive security,\nmonitoring, SIEM, etc.",
      bgColorClass: "bg-blue-500",
      bgImageClass:
        "bg-[url('/tools/blue-bg-design.png')] bg-left-top bg-no-repeat bg-[length:75%]",
      textColorClass: "text-white",
      glowColor: "#3C6DFF",
      buttonColor: "bg-[#3C6DFF] hover:bg-[#2a5de0]",
      borderGlow: "hover:border-[#3C6DFF] hover:shadow-[0_0_15px_#3C6DFF]",
    },
    {
      title: "Non-Tech",
      description: "Tools for everyday usage.",
      bgColorClass: "bg-green-500",
      bgImageClass:
        "bg-[url('/tools/white-bg-design-1.png')] bg-right-bottom bg-no-repeat bg-[length:50%]",
      textColorClass: "text-white",
      overlayImg: "/tools/white-bg-design-2.png",
      glowColor: "#008000",
      buttonColor: "bg-[#008000] hover:bg-[#006400]",
      borderGlow: "hover:border-[#008000] hover:shadow-[0_0_15px_#008000]",
    },
  ];

  // --- Helper function to get button list index from category title ---
  const getButtonListIndex = (title) => {
    if (title.includes("Red")) return 0;
    if (title.includes("Blue")) return 1;
    if (title.includes("Non-Tech")) return 2;
    return 1; // default to blue team
  };

  // --- Initialize state from localStorage or defaults ---
  const getInitialState = () => {
    if (typeof window === 'undefined') {
      // Server-side rendering fallback
      return {
        categories: initialCategories,
        activeIndex: 1,
        buttons: buttonList[1],
        activeGlow: initialCategories[1].glowColor,
        activeButtonStyle: initialCategories[1].buttonColor,
        activeBorderGlow: initialCategories[1].borderGlow,
      };
    }

    const savedCategories = localStorage.getItem("categories");
    const savedIndex = localStorage.getItem("activeIndex");

    if (savedCategories) {
      const parsedCategories = JSON.parse(savedCategories);
      const idx = savedIndex ? parseInt(savedIndex) : 1;
      const buttonIndex = getButtonListIndex(parsedCategories[idx].title);
      
      return {
        categories: parsedCategories,
        activeIndex: idx,
        buttons: buttonList[buttonIndex],
        activeGlow: parsedCategories[idx].glowColor,
        activeButtonStyle: parsedCategories[idx].buttonColor,
        activeBorderGlow: parsedCategories[idx].borderGlow,
      };
    } else if (savedIndex) {
      const idx = parseInt(savedIndex);
      const buttonIndex = getButtonListIndex(initialCategories[idx].title);
      
      return {
        categories: initialCategories,
        activeIndex: idx,
        buttons: buttonList[buttonIndex],
        activeGlow: initialCategories[idx].glowColor,
        activeButtonStyle: initialCategories[idx].buttonColor,
        activeBorderGlow: initialCategories[idx].borderGlow,
      };
    }

    // Default fallback
    return {
      categories: initialCategories,
      activeIndex: 1,
      buttons: buttonList[1],
      activeGlow: initialCategories[1].glowColor,
      activeButtonStyle: initialCategories[1].buttonColor,
      activeBorderGlow: initialCategories[1].borderGlow,
    };
  };

  // --- States (initialized from localStorage or defaults) ---
  const initialState = getInitialState();
  const [categories, setCategories] = useState(initialState.categories);
  const [activeIndex, setActiveIndex] = useState(initialState.activeIndex);
  const [buttons, setButtons] = useState(initialState.buttons);
  const [activeGlow, setActiveGlow] = useState(initialState.activeGlow);
  const [activeButtonStyle, setActiveButtonStyle] = useState(initialState.activeButtonStyle);
  const [activeBorderGlow, setActiveBorderGlow] = useState(initialState.activeBorderGlow);

  // --- Update buttons when activeIndex or categories change ---
  useEffect(() => {
    const buttonIndex = getButtonListIndex(categories[activeIndex].title);
    setButtons(buttonList[buttonIndex]);
    setActiveGlow(categories[activeIndex].glowColor);
    setActiveButtonStyle(categories[activeIndex].buttonColor);
    setActiveBorderGlow(categories[activeIndex].borderGlow);
  }, [activeIndex, categories]);

  const handleCardClick = (index) => {
    if (index !== 1) {
      // Swap the clicked card with the center card
      const newCategories = [...categories];
      const temp = newCategories[1];
      newCategories[1] = newCategories[index];
      newCategories[index] = temp;

      setCategories(newCategories);
      setActiveIndex(1);

      // Get the correct button list for the new center card
      const buttonIndex = getButtonListIndex(newCategories[1].title);
      setButtons(buttonList[buttonIndex]);
      setActiveGlow(newCategories[1].glowColor);
      setActiveButtonStyle(newCategories[1].buttonColor);
      setActiveBorderGlow(newCategories[1].borderGlow);

      // Save state to localStorage
      localStorage.setItem("categories", JSON.stringify(newCategories));
      localStorage.setItem("activeIndex", "1");
    } else {
      // Center card clicked - just refresh the state
      const buttonIndex = getButtonListIndex(categories[index].title);
      setButtons(buttonList[buttonIndex]);
      setActiveGlow(categories[index].glowColor);
      setActiveButtonStyle(categories[index].buttonColor);
      setActiveBorderGlow(categories[index].borderGlow);

      // Save state to localStorage
      localStorage.setItem("categories", JSON.stringify(categories));
      localStorage.setItem("activeIndex", index.toString());
    }
  };

  return (
    <div className="my-10 min-h-screen px-4 sm:px-8 font-inter flex flex-col">
      {/* Header */}
      <div className="mb-12">
        <h2 className="text-white text-4xl md:text-5xl lg:text-5xl font-black text-center mb-4">
          <span className="text-[#9d7af0]">Tools</span> | Security Platform
        </h2>
        <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#9d7af0] to-transparent mx-auto"></div>
      </div>

      {/* Team Section */}
      <div className="flex flex-col lg:flex-row gap-12 mb-12 justify-center">
        {categories.map((cat, index) => {
          const isActive = activeIndex === index;
          return (
            <div
              key={index}
              className={`
                flex-1 rounded-2xl p-8 cursor-pointer transition-all duration-300
                ${cat.bgColorClass} ${
                isActive
                  ? "ring-4 ring-white ring-opacity-90 scale-105 shadow-2xl"
                  : "opacity-90 hover:opacity-100 hover:scale-102"
              }
                relative overflow-hidden min-h-[260px] flex flex-col justify-center
                ${cat.bgImageClass}
              `}
              onClick={() => handleCardClick(index)}
            >
              <h3
                className={`text-2xl md:text-3xl font-bold mb-3 z-10 ${cat.textColorClass}`}
              >
                {cat.title}
              </h3>
              <p
                className={`text-base md:text-lg z-10 whitespace-pre-line ${cat.textColorClass} leading-relaxed`}
              >
                {cat.description}
              </p>

              {cat.overlayImg && (
                <img
                  src={cat.overlayImg}
                  alt=""
                  className="absolute top-0 right-0 h-24 md:h-32 pointer-events-none opacity-70"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Tools Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {buttons.map((tool, i) => (
          <SampleToolCard
            key={i}
            img_path={tool.image}
            title={tool.name}
            subtitle={tool.description}
            slug={tool.slug}
            push={push}
            buttonColor={activeButtonStyle}
            borderGlow={activeBorderGlow}
          />
        ))}
      </div>

      {/* View All */}
      <div className="mt-5 text-center">
        <button
          onClick={() => {
            let path = "";
            if (categories[activeIndex].title.includes("Red")) {
              path = "/tools/red-team";
            } else if (categories[activeIndex].title.includes("Blue")) {
              path = "/tools/blue-team";
            } else if (categories[activeIndex].title.includes("Non-Tech")) {
              path = "/tools/green-team";
            }
            push(path);
          }}
          className={`px-6 py-2 border-[#9d7af0] text-white font-semibold rounded-lg shadow-md 
               transition-all duration-300 ease-in-out ${activeButtonStyle} hover:scale-105 cursor-pointer`}
        >
          View All
        </button>
      </div>
    </div>
  );
}

function SampleToolCard({
  img_path,
  title,
  subtitle,
  slug,
  push,
  buttonColor,
  borderGlow,
}) {
  return (
    <div
      className={`bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20 transition-all duration-300 scale-90 hover:scale-[1.00] cursor-pointer h-full ${borderGlow}`}
      onClick={() => push(`/tools/${slug}`)}
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