import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const Footer = () => {
  const router = useRouter();
  const pathname = usePathname();

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Auto-scroll when hash exists in URL (on homepage)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      if (hash) {
        setTimeout(() => scrollToSection(hash), 200);
      }
    }
  }, [pathname]);

  const Section = ({ title, links }) => (
    <div className="w-full md:w-auto mb-6 md:mb-0 md:px-4 font-inter">
      <h3 className="w-full text-left text-lg font-bold text-white">{title}</h3>
      <ul className="mt-2 space-y-2">
        {links.map((link, index) => (
          <li key={index}>
            {link.id ? (
              <button
                onClick={() => {
                  if (pathname === "/") {
                    // Already on homepage → smooth scroll
                    scrollToSection(link.id);
                  } else {
                    // Navigate to homepage + hash
                    router.push(`/#${link.id}`);
                  }
                }}
                className="text-white/90 cursor-pointer hover:underline transition-colors duration-200"
              >
                {link.label}
              </button>
            ) : (
              <Link
                href={link.href}
                className="text-white/90 cursor-pointer hover:underline transition-colors duration-200"
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="relative z-0 bg-[#9d7af0]/30 backdrop-blur-xl border border-white/20 shadow-lg transition-all duration-300 transform text-white pt-10 px-4 md:px-0 font-inter">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 px-2 md:px-3">
        {/* Left Section */}
        <div className="md:col-span-1">
          {/* className="w-full h-32 bg-black/10 mb-4" */}
          <div className="">
            <img
              src="/logo1.png"
              alt="Logo"
              className="w-50 h-50 object-contain"
            />
          </div>

          <p className="text-sm sm:text-base text-white/90 text-center md:text-left">
            Our security platform provides advanced tools for red teaming, blue
            teaming, forensic analysis, and cloud security. Built for enterprise
            environments, it delivers real-time threat detection, proactive risk
            management, and centralized control—ensuring robust and
            comprehensive protection of your critical digital assets.
          </p>

          {/* Social Icons */}
          <div className="flex justify-center md:justify-start space-x-3 mt-4">
            <Link
              href="https://www.instagram.com/nexcorealliance/"
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
            {
              label: "Vulnerability Assessment",
              href: "/services/vulnerability-assessment",
            },
            {
              label: "Penetration Testing",
              href: "/services/penetration-testing",
            },
            {
              label: "Security Operation Center",
              href: "/services/security-operations-center",
            },
            { label: "Cloud Security", href: "/services/cloud-security" },
            { label: "Network Security", href: "/services/network-security" },
            {
              label: "Cybersecurity Consultancy",
              href: "/services/cybersecurity-consultancy",
            },
          ]}
        />

        {/* Tools */}
        <Section
          title="Tools"
          links={[
            { label: "WAF Scanner", href: "/tools/firewallDashboard" },
            { label: "Vulnerability Scanner", href: "/tools/vuln-scanner" },
            {
              label: "Database Security Checker",
              href: "/tools/DbSecurityChecker",
            },
            { label: "Link Detector", href: "/tools/check-link" },
            {
              label: "IP Address Info Finder",
              href: "/tools/ip-address-info-finder",
            },
            { label: "Source Code Analyzer", href: "/tools/Source-Code" },
          ]}
        />

        {/* Quick */}
        <Section
          title="Quick"
          links={[
            { label: "Blog", id: "blogs" },
            { label: "Privacy Policy", href: "/tools/privacypolicy" },
            { label: "Terms and Conditions", href: "/tools/termscondition" },
            { label: "Schedule Meeting", href: "/tools/schedulemeeting" },
            { label: "Why Choose Us", id: "why-us" },
            { label: "Certificate", id: "certificates" },
            { label: "Connect", href: "/connect" },
            { label: "Feedback", href: "/tools/feedback" },
          ]}
        />
      </div>

      {/* Footer Bottom */}
      <div className="flex flex-col md:flex-row justify-center items-center mt-10 text-center text-sm text-[#9d7af0] border-t border-white/20 py-3 gap-1 md:gap-4">
        <div>
          ©{new Date().getFullYear()}
          <span className="hidden md:inline">&nbsp;|&nbsp;</span>
        </div>
        <div>
          Developed By&nbsp;
          <span className="font-bold text-black">Code4Bharat</span>
          <span className="hidden md:inline">&nbsp;|&nbsp;</span>
        </div>
        <div>All Rights Reserved.</div>
      </div>
    </footer>
  );
};

export default Footer;
