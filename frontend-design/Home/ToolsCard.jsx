import { useState } from "react";
export default function ToolsCard() {
  const [buttons, setButtons] = useState([[{
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
  // {
  //   name: "Checkmarx Scanner",
  //   image: "/tools/card-images/tools/card-images/heckmarx.png",
  //   description: "Scan websites for security weaknesses like XSS or SQL injection.",
  //   slug: "codeAnalysis",
  //   buttonLabel: "Scan your codes",
  //   type: "red-team"
  // },
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
    description: "un an OWASP ZAP-powered automated security scan to detect vulnerabilities.",
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
  },], [
  // {
  //   name: "WhatsApp Privacy Inspector",
  //   image: "/tools/card-images/wp.png",
  //   description: "Checks WhatsApp settings for potential privacy risks.",
  //   slug: "whatsapp-privacy-inspector",
  //   buttonLabel: "Inspect Now",
  //   type: "non-tech"
  // },
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
    image: "/cyber.png",
    description: "Flags potential online fraud by previous records",
    slug: "cyber-fraud-identifier",
    buttonLabel: "Identify Fraudster",
    type: "forensic"
  },]])
  const [categories, setCategories] = useState([
    {
      title: "Red Teaming",
      description: "Offensive security topics,\npenetration testing, etc.",
      bgColorClass: "bg-[#FF0000]",
      bgImageClass: "bg-[url('/tools/red-bg-design.png')] bg-bottom bg-no-repeat bg-contain",
      textColorClass: "text-white",
    },
    {
      title: "Blue Teaming",
      description: "Defensive security,\nmonitoring, SIEM etc.",
      bgColorClass: "bg-[#123AA0]",
      bgImageClass: "bg-[url('/tools/blue-bg-design.png')] bg-left-top bg-no-repeat bg-[length:75%]",
      textColorClass: "text-white",
    },
    {
      title: "Green Teaming",
      description: "Tools for everyday usage.",
      bgColorClass: "bg-green-500",
      bgImageClass: "bg-[url('/tools/white-bg-design-1.png')] bg-right-bottom bg-no-repeat bg-[length:50%]",
      textColorClass: "text-black",
      overlayImg: "/tools/white-bg-design-2.png",
    },
    {
      title: "Purple Teaming",
      description: "Tools for forencic research",
      bgColorClass: "bg-purple-500",
      bgImageClass: "bg-[url('/tools/blue-bg-design.png')] bg-right-bottom bg-no-repeat bg-[length:50%]",
      textColorClass: "text-white",
      overlayImg: "/tools/white-bg-design-2.png",
    },
  ])

  const [activeIndex, setActiveIndex] = useState(1);

  const handleCardClick = (index) => {
    // If clicked card is already active, reset the active index to null
    setActiveIndex(index);

    if (index != 1) {
      const newCategories = [...categories];
      const typeTemp = newCategories[index]
      const type =
        typeTemp["title"].includes("Red") ? 0 :
          typeTemp["title"].includes("Blue") ? 1 :
            typeTemp["title"].includes("Green") ? 2 :
              typeTemp["title"].includes("Purple") ? 3 : "team is unknown";
      const temp = newCategories[1];
      newCategories[1] = newCategories[index];
      newCategories[index] = temp;
      setActiveIndex(1);
      setCategories(newCategories);
    }
  };

  return (
    <div className="my-10 min-h-screen px-4 sm:px-8 font-inter flex flex-col">
      <h2 className="mx-auto text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-8 sm:mb-5 text-center lg:text-left">
        <span className="text-[#9d7af0]">Toolkits</span> | Security Platform
      </h2>

      {/* Team Section */}
      <div className="flex flex-col items-center p-2" >
        {/* Non-active Cards Group */}
        <div className="flex flex-row flex-nowrap gap-2 justify-center w-full my-2">
          {categories.map((cat, index) => {
            const isActive = activeIndex === index;

            // Only render non-active cards in this group
            if (!isActive) {
              return (
                <div
                  key={index}
                  className={`
              transition-all duration-200
              flex-1 rounded-xl lg:rounded-3xl flex flex-col justify-center
              px-1 py-5 cursor-pointer relative
              w-full break-words
              hover:scale-105
              
              ${cat.bgColorClass} ${cat.bgImageClass} ${cat.textColorClass}
              ${isActive ? ' opacity-100' : 'opacity-80'}
              transition
            `}
                  onClick={() => handleCardClick(index)}
                >
                  <h3 className="text-lg sm:text-lg md:text-xl font-bold mb-1 sm:mb-2 md:mb-3">
                    {cat.title}
                  </h3>
                  <p className="hidden sm:block text-xs sm:text-sm md:text-base leading-snug whitespace-pre-line">
                    {cat.description}
                  </p>

                  {cat.overlayImg && (
                    <img
                      src={cat.overlayImg}
                      alt=""
                      className="absolute top-0 left-0 h-[25%] sm:h-[30%] md:h-[35%] pointer-events-none"
                    />
                  )}
                </div>
              );
            }
            return null;  // Skip rendering active cards here
          })}
        </div>

        {/* Active Card */}
        {categories.map((cat, index) => {
          const isActive = activeIndex === index;
          if (isActive) {
            return (
              <div
                key={index}
                className={`
            transition-all duration-200
            w-full rounded-3xl flex flex-col justify-center
            p-2 md:p-5 cursor-pointer relative hover:scale-y-105 
            ${cat.bgColorClass} ${cat.bgImageClass} ${cat.textColorClass}
            ${isActive ? 'opacity-100 h-50' : 'opacity-80'}
            transition
          `}
                onClick={() => handleCardClick(index)}
              >
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 md:mb-3 break-words">
                  {cat.title}
                </h3>
                <p className="text-xs sm:text-sm md:text-base whitespace-pre-line">
                  {cat.description}
                </p>

                {cat.overlayImg && (
                  <img
                    src={cat.overlayImg}
                    alt=""
                    className="absolute top-0 left-0 h-[25%] sm:h-[30%] md:h-[35%] pointer-events-none"
                  />
                )}
              </div>
            );
          }
          return null;  // Skip rendering non-active cards here
        })}
      </div>

      {/* Tools Section */}
      <div className="grid grid-cols-2 grid-rows-3 sm:grid-cols-3 sm:grid-rows-2 lg:grid-cols-3 gap-4 sm:gap-5 mt-2 sm:mt-5">
        {[
          {
            title: "Firewall",
            image: "/firewall.png",
            description: "Detect session fixation vulnerabilities",
            type: "red-team"
          },
          {
            title: "Ip Info",
            image: "/ip.png",
            description: " Validate HTTPS security implementation.",
            type: "blue-team"
          }, 
          // {
          //   title: "WhatsApp Privacy",
          //   image: "/tools/card-images/wp.png",
          //   description: "Checks WhatsApp settings for potential privacy risks.",
          //   type: "non-tech"
          // },
          {
            title: "Whois Domain Lookup",
            image: "/tools/card-images/whois.png",
            description: "Retrieve domain registration and ownership details.",
            type: "red-team"
          },
          {
            title: "JWT Signature Validator",
            image: "/tools/card-images/jwt_signature.png",
            description: "Ensure JWT signature integrity.",
            type: "blue-team"
          },
          {
            title: "URL Shortener",
            image: "/tools/card-images/shorted-url.png",
            description: "Make Links Short and Simple.",
            type: "non-tech"
          },
        ].map((tool, i) => (
          <SampleToolCard
            key={i}
            img_path={tool.image}
            title={tool.title}
            subtitle={tool.description}
          />
        ))}
      </div>
    </div>
  );
}

function SampleToolCard({ img_path, title, subtitle }) {
  return (
    <div className="flex w-full max-w-xs sm:max-w-[21rem] md:max-w-[24rem] min-h-[10rem] sm:min-h-[13rem] max-h-[16rem] group mx-auto">
      {/* Colored Stripe */}
      <div className="ml-auto w-2 mt-4 sm:mt-5 h-16 sm:h-20 rounded-l-lg bg-[#9d7af0]"></div>

      {/* Card Body */}
      <div className="mr-auto flex flex-col rounded-xl py-2 px-3 w-full justify-center overflow-hidden group-hover:scale-105 bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg transition-all duration-200 transform cursor-pointer hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
        <img
          src={img_path}
          alt={title}
          className="h-20 sm:h-24 max-w-[80%] object-contain mx-auto"
        />
        <h3 className="text-white text-sm sm:text-base text-center">
          {title}
        </h3>
        <p className="hidden lg:block text-gray-400 text-xs text-center line-clamp-2">
          {subtitle}
        </p>
      </div>
    </div>
  );
}





