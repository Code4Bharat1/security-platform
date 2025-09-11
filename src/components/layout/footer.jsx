'use client';
import Link from "next/link";

const Footer = () => {
  const Section = ({ title, links }) => (
    <div className="w-full md:w-auto mb-4 md:mb-0 md:px-4 font-inter">
      <h3 className="w-full text-left text-lg font-bold md:font-bold text-white">
        {title}
      </h3>
      <ul className="mt-2 md:mt-4 space-y-2">
        {links.map((link, index) => (
          <li key={index}>
            <Link
              href={link.href}
              className="text-white/90 cursor-pointer hover:underline transition-colors duration-200"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

   const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <footer className="relative z-0 bg-[#9d7af0]/30 backdrop-blur-xl border border-white/20 shadow-lg transition-all duration-300 transform text-white pt-10 md:px-0 font-inter">
      <div className="max-w-4xl mx-auto grid md:grid-cols-4 gap-8 px-2 md:px-3">
        {/* Left Section */}
        <div className="md:col-span-1">
          {/* Logo Placeholder */}
          <div className="h-30 w-30 bg-black mb-4">
  <img 
    src="/OurCoreServices/logo.png" 
    alt="Logo" 
    className="w-full h-full object-contain" 
  />
</div>

          <p className="text-base text-white/90">
            Our security platform provides advanced tools for red teaming, blue
            teaming, forensic analysis, and cloud security. Built for enterprise
            environments, it delivers real-time threat detection, proactive risk
            management, and centralized control—ensuring robust and comprehensive
            protection of your critical digital assets.
          </p>

          {/* Placeholder Social Icons */}
          <div className="flex space-x-4 mt-4">
            <Link
              href=" https://www.instagram.com/nexcorealliance/"
              target="_blank"
              className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-xl"
            >
              I
            </Link>
            <Link
              href="https://www.facebook.com/people/Nexcore-Alliance/61570113656994/"
              target="_blank"
              className="w-10 h-10 bg-[#3b5998] rounded-lg flex items-center justify-center text-white font-bold text-xl"
            >
              f
            </Link>
            <Link
              href="https://x.com/Code4Bharat"
              target="_blank"
              className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white font-bold text-xl"
            >
              x
            </Link>
            <Link
              href="https://www.linkedin.com/company/nexcore-alliance/posts/?feedView=all"
              target="_blank"
              className="w-10 h-10 bg-[#0e76a8] rounded-lg flex items-center justify-center text-white font-bold text-xl"
            >
              in
            </Link>
          </div>
        </div>

        {/* Services */}
        <Section
          title="Services"
          links={[
            { label: "SOC", href: "/services/soc" },
            { label: "Vulnerability Assessment", href: "/services/vulnerability-assessment" },
            { label: "Penetration Testing", href: "/services/penetration-testing" },

          ]}
        />

        {/* Tools */}
        <Section
          title="Tools"
          links={[
            { label: "WAF Scanner", href: "/tools/firewallDashboard" },
            { label: "Vulnerability Scanner", href: "/tools/vuln-scanner" },
            { label: "Database Security Checker", href: "/tools/db-security" },
            { label: "Link Detector", href: "/tools/link-detector" },
            { label: "IP Address Info Finder", href: "/tools/ip-address-info-finder" },
            { label: "Source Code Analyzer", href: "/tools/Source-Code" },
          ]}
        />

        {/* Quick */}
        <Section
          title="Quick"
          links={[
            { label: "Blog", href: "/blog" },
            { label: "Privacy Policy", href: "/privacy-policy" },
            { label: "Terms and Conditions", href: "/terms" },
            { label: "Schedule Meeting", href: "/schedule-meeting" },
            { label: "Why Choose Us", href: "/why-choose-us" },
            { label: "Certificate", href: "/certificate" },
          ]}
        />
      </div>

      {/* Footer Bottom */}
      <div className="flex justify-center flex-col md:flex-row mt-10 text-center text-sm text-[#9d7af0] bg-white md:py-3 border-b-5 border-b-black">
        <div>©2025<span className="hidden md:inline">&nbsp;|&nbsp;</span></div>
        <div>
          Developed By&nbsp;
          <span className="font-bold text-black">Code4Bharat</span>
          <span className="hidden md:inline">&nbsp;|&nbsp;</span>
        </div>
        <div>All Rights Reserved.</div>
      </div>
    </footer>
  );
}
export default Footer;