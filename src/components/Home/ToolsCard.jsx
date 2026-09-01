"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePlan } from "@/context/PlanContext";
import { Lock } from "lucide-react";

export default function ToolsCard() {
  const { push } = useRouter();
  const { canAccessTool, loading: planLoading } = usePlan();

  // --- Tool Lists ---
  const buttonList = [
    [
      {
        name: "Free Report",
        image: "/tools/card-images/tools/card-images/ode.png",
        description: "Generate consolidated summary reports for basic scans including WHOIS, DNS, and HTTP security.",
        slug: "report-generator?plan=free",
        buttonLabel: "Generate Report",
        type: "reports",
      },
      {
        name: "Premium Report",
        image: "/tools/card-images/tools/card-images/ode.png",
        description: "Access intermediate scanner details, WAF configurations, and domain trust reports.",
        slug: "report-generator?plan=premium",
        buttonLabel: "Generate Report",
        type: "reports",
      },
      {
        name: "Pro Report",
        image: "/tools/card-images/tools/card-images/ode.png",
        description: "Consolidated reports for advanced AST analyzers, API testers, and credentials paths.",
        slug: "report-generator?plan=pro",
        buttonLabel: "Generate Report",
        type: "reports",
      },
      {
        name: "Enterprise Report",
        image: "/tools/card-images/tools/card-images/ode.png",
        description: "Full network, Active Directory, and organizational security posture compliance reports.",
        slug: "report-generator?plan=enterprise",
        buttonLabel: "Generate Report",
        type: "reports",
      },
    ],
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
          "Analyze source code repositories for security flaws and vulnerabilities.",
        slug: "Source-Code",
        buttonLabel: "Check Your Code's",
        type: "red-team",
      },
      // {
      //   name: "Checkmarx Scanner",
      //   image: "/RedTeam/heckmarx.png",
      //   description:
      //     "Enterprise-grade code security review and static analysis workflow.",
      //   slug: "codeAnalysis",
      //   buttonLabel: "Scan your codes",
      //   type: "red-team",
      // },
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
          "Identify the tech stack, CMS, frameworks, and third-party scripts used on any website.",
        slug: "fingerPrint",
        buttonLabel: "fingerPrint",
        type: "red-team",
      },
    ],
    [
      {
        name: "WAF Scanner",
        image: "/BlueTeam/WAF.png",
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
        image: "/BlueTeam/Obfuscation Detector.png",
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
      // {
      //   name: "WhatsApp Privacy Inspector",
      //   image: "/GreenTeam/wp.png",
      //   description: "Checks WhatsApp settings for potential privacy risks.",
      //   slug: "whatsapp-privacy-inspector",
      //   buttonLabel: "Inspect Now",
      //   type: "non-tech",
      // },
      {
        name: "Email Phishing & Threat Analyzer",
        image: "/GreenTeam/email.png",
        description: "Audits email authentication headers, body links, and attachments for phishing indicators.",
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

  // --- Categories with tool counts ---
  const initialCategories = [
    {
      title: "Integrated Reports",
      description: "AD posture reviews and\ncredential theft paths.",
      bgColorClass: "bg-[#D4A64A]",
      bgImageClass:
        "bg-[url('/tools/white-bg-design-1.png')] bg-right-bottom bg-no-repeat bg-[length:50%]",
      textColorClass: "text-white",
      glowColor: "#D4A64A",
      buttonColor: "bg-[#D4A64A] hover:bg-[#c3963a]",
      borderGlow: "hover:border-[#D4A64A] hover:shadow-[0_0_15px_#D4A64A]",
      toolCount: 4,
    },
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
      toolCount: 21,
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
      toolCount: 7,
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
      toolCount: 19,
    },
  ];

  // --- Helper function to get button list index from category title ---
  const getButtonListIndex = (title) => {
    if (title.includes("Reports")) return 0;
    if (title.includes("Red")) return 1;
    if (title.includes("Blue")) return 2;
    if (title.includes("Non-Tech")) return 3;
    return 2; // default to blue team
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

      {/* Team Section with Center Focus */}
      <div className="flex flex-col lg:flex-row gap-6 gap-x-15 mb-12 justify-center items-center">
        {categories.map((cat, index) => {
          const isActive = activeIndex === index;
          const isCenter = index === 1;

          return (
            <div
              key={index}
              className={`
                rounded-2xl p-6 cursor-pointer transition-all duration-500 ease-in-out
                ${cat.bgColorClass}
                ${isActive && isCenter
                  ? "ring-4 ring-white ring-opacity-90 shadow-2xl scale-110 lg:scale-125 z-20 flex-[0.9]"
                  : isCenter
                    ? "shadow-xl scale-105 lg:scale-110 z-10 flex-[0.80]"
                    : "opacity-80 hover:opacity-90 scale-95 lg:scale-90 hover:scale-100 flex-1"
                }
                relative overflow-hidden flex flex-col justify-between
                ${cat.bgImageClass}
                ${isActive && isCenter ? 'min-h-[250px]' : 'min-h-[250px]'}
                transform-gpu
              `}
              onClick={() => handleCardClick(index)}
              style={{
                boxShadow: isActive && isCenter
                  ? `0 20px 40px ${cat.glowColor}40, 0 0 30px ${cat.glowColor}30`
                  : isCenter
                    ? `0 10px 25px rgba(0,0,0,0.3)`
                    : `0 5px 15px rgba(0,0,0,0.2)`
              }}
            >
              <div className="z-10">
                <div className="flex justify-between items-start mb-3">
                  <h3 className={`${isActive && isCenter ? 'text-3xl md:text-4xl' : 'text-xl md:text-2xl'} font-bold ${cat.textColorClass} transition-all duration-300`}>
                    {cat.title}
                  </h3>

                </div>
                <p className={`${isActive && isCenter ? 'text-lg md:text-xl' : 'text-sm md:text-base'} ${cat.textColorClass} whitespace-pre-line leading-relaxed transition-all duration-300 opacity-90`}>
                  {cat.description}
                </p>
              </div>

              {/* Active indicator */}
              {isActive && isCenter && (
                <div className="absolute top-4 right-4 w-3 h-3 bg-white rounded-full animate-pulse shadow-lg z-20"></div>
              )}

              {/* Overlay image */}
              {cat.overlayImg && (
                <img
                  src={cat.overlayImg}
                  alt=""
                  className={`absolute top-0 right-0 ${isActive && isCenter ? 'h-32 md:h-40' : 'h-24 md:h-32'} pointer-events-none opacity-70 transition-all duration-300`}
                />
              )}

              {/* Gradient overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
            </div>
          );
        })}
      </div>

      {/* Active Team Indicator */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
          <div
            className="w-4 h-4 rounded-full animate-pulse"
            style={{ backgroundColor: activeGlow }}
          ></div>
          <span className="text-white font-semibold text-lg">
            {categories[activeIndex].title} - {categories[activeIndex].toolCount} Tools Available
          </span>
        </div>
      </div>

      {/* Tools Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {buttons.map((tool, i) => {
          const isLocked = !canAccessTool(tool.slug);

          return (
            <SampleToolCard
              key={i}
              img_path={tool.image}
              title={tool.name}
              subtitle={tool.description}
              slug={tool.slug}
              push={push}
              buttonColor={activeButtonStyle}
              borderGlow={activeBorderGlow}
              isLocked={isLocked}
            />
          );
        })}
      </div>

      {/* View All */}
      <div className="mt-8 text-center">
        <button
          onClick={() => {
            let path = "";
            if (categories[activeIndex].title.includes("Reports")) {
              path = "/tools/reports";
            } else if (categories[activeIndex].title.includes("Red")) {
              path = "/tools/red-team";
            } else if (categories[activeIndex].title.includes("Blue")) {
              path = "/tools/blue-team";
            } else if (categories[activeIndex].title.includes("Non-Tech")) {
              path = "/tools/green-team";
            }
            push(path);
          }}
          className={`px-8 py-3 border-2 border-[#9d7af0] text-white font-semibold rounded-lg shadow-md 
               transition-all duration-300 ease-in-out ${activeButtonStyle} hover:scale-105 cursor-pointer
               backdrop-blur-sm bg-white/5 hover:bg-white/10`}
        >
          View All {categories[activeIndex].toolCount} {categories[activeIndex].title} Tools
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
  isLocked,
}) {
  return (
    <div
      className={`relative bg-white/10 backdrop-blur-md rounded-xl p-5 border transition-all duration-300 scale-90 hover:scale-[1.00] cursor-pointer h-full ${
        isLocked
          ? "border-amber-500/40 hover:border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
          : `border-white/20 ${borderGlow}`
      }`}
      onClick={() => push(`/tools/${slug}`)}
    >
      {isLocked && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-amber-400 border border-amber-300 text-black text-[0.65rem] font-mono font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-[0_0_12px_rgba(251,191,36,0.45)]">
          <Lock className="w-3 h-3 text-black stroke-[2.5]" />
          <span>Locked</span>
        </div>
      )}

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
          className={`mt-4 ${
            isLocked
              ? "bg-amber-400 hover:bg-amber-300 text-black font-extrabold shadow-[0_0_15px_rgba(251,191,36,0.35)]"
              : `${buttonColor} text-white`
          } py-2 px-4 rounded-lg text-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5`}
        >
          {isLocked && <Lock className="w-3.5 h-3.5 text-black stroke-[2.5]" />}
          <span>{isLocked ? "Upgrade Plan" : "Check Security"}</span>
        </button>
      </div>
    </div>
  );
}