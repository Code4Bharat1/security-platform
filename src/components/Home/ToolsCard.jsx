import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from 'next/navigation';

export default function ToolsCard() {
  const { push } = useRouter();
  const searchParams = useSearchParams();

  const buttonList = [[{
    name: "Vulnerability Scanner",
    image: "/tools/card-images/vuln_scanner.png",
    description: "Scan websites for security weaknesses like XSS or SQL injection.",
    slug: "vuln-scanner",
    buttonLabel: "Scan for Vulnerabilities",
    type: "red-team"
  },
  {
    name: "Source Code Analyzer",
    image: "/tools/card-images/tools/card-images/ode.png",
    description: "Scan websites for security weaknesses like XSS or SQL injection.",
    slug: "Source-Code",
    buttonLabel: "Check Your Code's",
    type: "red-team"
  },
  {
    name: "Checkmarx Scanner",
    image: "/tools/card-images/tools/card-images/heckmarx.png",
    description: "Scan websites for security weaknesses like XSS or SQL injection.",
    slug: "codeAnalysis",
    buttonLabel: "Scan your codes",
    type: "red-team"
  },
  {
    name: "Subdomain Scanner",
    image: "/tools/card-images/subdomain.png",
    description: "Scan websites for analyzing subdomains and their security posture.",
    slug: "subdomainEnumeration",
    buttonLabel: "Scan your website",
    type: "red-team"
  },
  {
    name: "Website Recon",
    image: "/tools/card-images/web-recon.png",
    description: "Perform an in-depth reconnaissance of a website to identify key metadata, technologies used.",
    slug: "webrecon",
    buttonLabel: "Website Recon",
    type: "red-team"
  },
  {
    name: "Technology Fingerprinter",
    image: "/tools/card-images/fingerprint.png",
    description: "Run an OWASP ZAP-powered automated security scan to detect vulnerabilities.",
    slug: "fingerPrint",
    buttonLabel: "fingerPrint",
    type: "red-team"
  },], [{
    name: "WAF Scanner",
    image: "/tools/card-images/waf1.png",
    description: "Detects and analyzes WAF protection on a website, providing insights into security rules",
    slug: "firewallDashboard",
    buttonLabel: "Check WAF",
    type: "blue-team"
  },
  {
    name: "HTTPS Security Checker",
    image: "/tools/card-images/https-security.png",
    description: "Validate HTTPS security implementation.",
    slug: "httpsCheckerForm",
    buttonLabel: "HTTPS Security Checker",
    type: "blue-team"
  },
  {
    name: "JWT Signature Validator",
    image: "/tools/card-images/jwt_signature.png",
    description: "Ensure JWT signature integrity.",
    slug: "JWTSignatureValidator",
    buttonLabel: "JWT Signature Validator",
    type: "blue-team"
  },
  {
    name: "OAuth Token Analyzer",
    image: "/tools/card-images/oauth.png",
    description: "Inspect OAuth tokens for security risks.",
    slug: "OAuthTokenInspector",
    buttonLabel: "OAuth Token Analyzer",
    type: "blue-team"
  },
  {
    name: "Obfuscation Detector",
    image: "/tools/card-images/obfuscation.png",
    description: "Identify obfuscation techniques in code.",
    slug: "obfuscationChecker",
    buttonLabel: "Obfuscation Detector",
    type: "blue-team"
  },
  {
    name: "Regex Security Validator",
    image: "/tools/card-images/regex.png",
    description: "Check regular expressions for security flaws",
    slug: "regexDetector",
    buttonLabel: "Regex Security Validator",
    type: "blue-team"
  },], [{
    name: "WhatsApp Privacy Inspector",
    image: "/tools/card-images/wp.png",
    description: "Checks WhatsApp settings for potential privacy risks.",
    slug: "whatsapp-privacy-inspector",
    buttonLabel: "Inspect Now",
    type: "non-tech"
  },
  {
    name: "Email Attachment Analyzer",
    image: "/tools/card-images/email.png",
    description: "Scans email attachments for malware or hidden threats.",
    slug: "email-attachment-analyzer",
    buttonLabel: "Analyze File",
    type: "non-tech"
  },
  {
    name: "IP Address Info Finder",
    image: "/tools/card-images/ip.png",
    description: "Fetches location and network details of an IP address.",
    slug: "ip-address-info-finder",
    buttonLabel: "Find Info",
    type: "non-tech"
  },
  {
    name: "QR Tool",
    image: "/tools/card-images/QR.png",
    description: "Unsafe QR & QR Generater.",
    slug: "fake-qr-code-detector",
    buttonLabel: "Scan QR",
    type: "non-tech"
  },
  {
    name: "Website Optimization Tool",
    image: "/tools/card-images/optimization.png",
    description: "Detects deployment issues like unused code, large assets, and slow-loading elements.",
    slug: "website-optimization-tool",
    buttonLabel: "Check Optimization",
    type: "non-tech"
  },
  {
    name: "SEO Score Analyzer Tool",
    image: "/tools/card-images/seo-score.png",
    description: "Analyzes website SEO and provides improvement tips.",
    slug: "seo-score-analyzer-tool",
    buttonLabel: "Analyze SEO",
    type: "non-tech"
  },], [{
    name: "Cyber Fraud Identifier",
    image: "/cyber-fraud-identifier.png",
    description: "Flags potential online fraud by previous records",
    slug: "cyber-fraud-identifier",
    buttonLabel: "Identify Fraudster",
    type: "forensic"
  },]]

  const initialCategories = [
    {
      title: "Red Teaming",
      description: "Offensive security topics,\npenetration testing, etc.",
      bgColorClass: "bg-red-500",
      bgImageClass: "bg-[url('/tools/red-bg-design.png')] bg-bottom bg-no-repeat bg-contain",
      textColorClass: "text-white",
      glowColor: "#D01A1A",
      buttonColor: "bg-[#D01A1A] hover:bg-[#b31515]",
      borderGlow: "hover:border-[#D01A1A] hover:shadow-[0_0_15px_#D01A1A]"
    },
    {
      title: "Blue Teaming",
      description: "Defensive security,\nmonitoring, SIEM, etc.",
      bgColorClass: "bg-blue-500",
      bgImageClass: "bg-[url('/tools/blue-bg-design.png')] bg-left-top bg-no-repeat bg-[length:75%]",
      textColorClass: "text-white",
      glowColor: "#3C6DFF",
      buttonColor: "bg-[#3C6DFF] hover:bg-[#2a5de0]",
      borderGlow: "hover:border-[#3C6DFF] hover:shadow-[0_0_15px_#3C6DFF]"
    },
    {
      title: "Non-Tech",
      description: "Tools for everyday usage.",
      bgColorClass: "bg-green-500",
      bgImageClass: "bg-[url('/tools/white-bg-design-1.png')] bg-right-bottom bg-no-repeat bg-[length:50%]",
      textColorClass: "text-white",
      overlayImg: "/tools/white-bg-design-2.png",
      glowColor: "#008000",
      buttonColor: "bg-[#008000] hover:bg-[#006400]",
      borderGlow: "hover:border-[#008000] hover:shadow-[0_0_15px_#008000]"
    },
  ];

  // Initialize state based on URL parameter or localStorage
  const getInitialSelection = () => {
    // Check URL parameter first
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      const categoryIndex = initialCategories.findIndex(cat => 
        cat.title.toLowerCase().includes(categoryParam.toLowerCase())
      );
      if (categoryIndex !== -1) return categoryIndex;
    }

    // Check localStorage
    if (typeof window !== 'undefined') {
      const savedCategory = localStorage.getItem('selectedToolCategory');
      if (savedCategory) {
        const parsedIndex = parseInt(savedCategory);
        if (!isNaN(parsedIndex) && parsedIndex >= 0 && parsedIndex < 3) {
          return parsedIndex;
        }
      }
    }
    
    // Default to Blue Team (index 1)
    return 1;
  };

  // Initialize activeIndex to always be 1 (middle position)
  const [activeIndex, setActiveIndex] = useState(1);
  const [categories, setCategories] = useState(() => {
    const selectedIndex = getInitialSelection();
    if (selectedIndex === 1) return initialCategories;
    
    const newCategories = [...initialCategories];
    const temp = newCategories[1];
    newCategories[1] = newCategories[selectedIndex];
    newCategories[selectedIndex] = temp;
    return newCategories;
  });

  const [buttons, setButtons] = useState(() => {
    const selectedIndex = getInitialSelection();
    const typeIndex = selectedIndex === 0 ? 0 : selectedIndex === 1 ? 1 : 2;
    return buttonList[typeIndex];
  });

  const [activeGlow, setActiveGlow] = useState(categories[1].glowColor);
  const [activeButtonStyle, setActiveButtonStyle] = useState(categories[1].buttonColor);
  const [activeBorderGlow, setActiveBorderGlow] = useState(categories[1].borderGlow);

  // Update active styles when categories change
  useEffect(() => {
    setActiveGlow(categories[1].glowColor);
    setActiveButtonStyle(categories[1].buttonColor);
    setActiveBorderGlow(categories[1].borderGlow);
  }, [categories]);

  const handleCardClick = (index) => {
    setActiveIndex(index);

    if (index != 1) {
      const newCategories = [...categories];
      const typeTemp = newCategories[index];
      const type =
        typeTemp["title"].includes("Red") ? 0 :
          typeTemp["title"].includes("Blue") ? 1 :
            typeTemp["title"].includes("Non-Tech") ? 2 : 1; // Default to blue if unknown

      const temp = newCategories[1]; 
      newCategories[1] = newCategories[index];
      newCategories[index] = temp;
      setActiveIndex(1);
      setButtons(buttonList[type]);
      setCategories(newCategories);

      // Save selection to localStorage
      const originalIndex = initialCategories.findIndex(cat => cat.title === typeTemp.title);
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedToolCategory', originalIndex.toString());
      }
    }
  };

  // Enhanced navigation function that preserves category
  const navigateToTool = (slug) => {
    // Save current selection before navigating
    if (typeof window !== 'undefined') {
      const currentCategory = categories[1].title;
      const originalIndex = initialCategories.findIndex(cat => cat.title === currentCategory);
      localStorage.setItem('selectedToolCategory', originalIndex.toString());
    }
    push(`/tools/${slug}`);
  };

  // Enhanced "View All" navigation
  const navigateToViewAll = () => {
    const currentCategory = categories[1].title;
    const originalIndex = initialCategories.findIndex(cat => cat.title === currentCategory);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedToolCategory', originalIndex.toString());
    }

    let path = "";
    if (currentCategory.includes("Red")) {
      path = "/tools/red-team";
    } else if (currentCategory.includes("Blue")) {
      path = "/tools/blue-team";
    } else if (currentCategory.includes("Non-Tech")) {
      path = "/tools/green-team";
    } else {
      path = "/tools/blue-team"; // Default fallback
    }
    
    // Add category parameter to URL for additional persistence
    const categoryParam = currentCategory.toLowerCase().replace(' teaming', '').replace(' ', '-');
    push(`${path}?category=${categoryParam}`);
  };

  return (
    <div className="my-10 min-h-screen px-4 sm:px-8 font-inter flex flex-col">
      {/* Header matching the image */}
      <div className="mb-12">
        <h2 className="text-white text-4xl md:text-5xl lg:text-5xl font-black text-center mb-4">
          <span className="text-[#9d7af0]">Toolkits</span> | Security Platform
        </h2>
        <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#9d7af0] to-transparent mx-auto"></div>
      </div>

      {/* Team Section - Updated to match the image with larger cards */}
      <div className="flex flex-col lg:flex-row gap-12 mb-12">
        {categories.map((cat, index) => {
          const isMiddleCard = index === 1; // Only middle card gets the active styling
          return (
            <div
              key={index}
              className={`
                flex-1 rounded-2xl p-8 cursor-pointer transition-all duration-300
                ${cat.bgColorClass} ${isMiddleCard ? 'ring-4 ring-white ring-opacity-90 scale-105 shadow-2xl' : 'opacity-90 hover:opacity-100 hover:scale-102'}
                relative overflow-hidden min-h-[260px] flex flex-col justify-center
                ${cat.bgImageClass}
              `}
              onClick={() => handleCardClick(index)}
            >
              <h3 className={`text-2xl md:text-3xl font-bold mb-3 z-10 ${cat.textColorClass}`}>
                {cat.title}
              </h3>
              <p className={`text-base md:text-lg z-10 whitespace-pre-line ${cat.textColorClass} leading-relaxed`}>
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

      {/* Tools Section with Glowing Borders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
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

      <div className="mt-5 text-center">
        <button
          onClick={navigateToViewAll}
          className={`px-6 py-2 border-[#9d7af0] text-white font-semibold rounded-lg shadow-md 
                     transition-all duration-300 ease-in-out ${activeButtonStyle} hover:scale-105 cursor-pointer`}
        >
          View All
        </button>
      </div>
    </div>
  );
}

function SampleToolCard({ img_path, title, subtitle, slug, onNavigate, buttonColor, borderGlow }) {
  return (
    <div 
      className={`bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20 transition-all duration-300 scale-90 hover:scale-[1.00] cursor-pointer h-full ${borderGlow}`}
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
        <p className="text-gray-300 text-sm text-center flex-grow">
          {subtitle}
        </p>
        <button className={`mt-4 ${buttonColor} text-white py-2 px-4 rounded-lg text-sm transition-colors cursor-pointer`}>
          Try Now
        </button>
      </div>
    </div>
  );
}