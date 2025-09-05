'use client';
import Link from "next/link";

const Footer = () => {
  const Section = ({ title, links }) => (
    <div className="w-full md:w-auto mb-6 md:mb-0 md:px-4 font-inter">
      <h3 className="w-full text-left text-lg font-bold text-red-400 tracking-wide uppercase">
        {title}
      </h3>
      <ul className="mt-3 space-y-2">
        {links.map((link, index) => (
          <li key={index}>
            <Link
              href={link.href}
              className="text-gray-300 hover:text-red-500 transition-colors duration-300 cursor-pointer"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="relative z-0 bg-gradient-to-br from-black via-[#1a1a1a] to-[#0a0a0a] border-t border-red-900/40 shadow-inner shadow-black pt-10 md:px-0 font-inter">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 px-4 md:px-6">
        {/* Left Section */}
        <div className="md:col-span-1">
          {/* Logo */}
          <div className="w-full h-28 bg-red-900/20 flex items-center justify-center mb-4 rounded-lg">
            <img
              src="/OurCoreServices/logo.png"
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            Our Red Team platform delivers enterprise-grade tools for offensive
            and defensive security. From red teaming and forensics to advanced
            cloud security, we empower organizations with real-time threat
            detection and proactive risk mitigation.
          </p>

          {/* Social Icons */}
          <div className="flex space-x-3 mt-5">
            <Link
              href="https://www.instagram.com/nexcorealliance/"
              target="_blank"
              className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-800 rounded-lg flex items-center justify-center text-white font-bold text-lg hover:scale-110 transition-transform"
            >
              I
            </Link>
            <Link
              href="https://www.facebook.com/people/Nexcore-Alliance/61570113656994/"
              target="_blank"
              className="w-10 h-10 bg-[#3b5998] rounded-lg flex items-center justify-center text-white font-bold text-lg hover:scale-110 transition-transform"
            >
              f
            </Link>
            <Link
              href="https://x.com/Code4Bharat"
              target="_blank"
              className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white font-bold text-lg hover:scale-110 transition-transform"
            >
              x
            </Link>
            <Link
              href="https://www.linkedin.com/company/nexcore-alliance/posts/?feedView=all"
              target="_blank"
              className="w-10 h-10 bg-[#0e76a8] rounded-lg flex items-center justify-center text-white font-bold text-lg hover:scale-110 transition-transform"
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
      <div className="flex justify-center flex-col md:flex-row mt-10 text-center text-xs text-gray-400 border-t border-red-900/40 py-4">
        <div>©2025<span className="hidden md:inline">&nbsp;|&nbsp;</span></div>
        <div>
          Developed By&nbsp;
          <span className="font-bold text-red-500">Code4Bharat</span>
          <span className="hidden md:inline">&nbsp;|&nbsp;</span>
        </div>
        <div>All Rights Reserved.</div>
      </div>
    </footer>
  );
};

export default Footer;
