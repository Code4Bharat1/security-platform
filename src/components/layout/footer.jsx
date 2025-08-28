const Footer = () => {
    const Section = ({ title, links }) => (
        <div className="w-full md:w-auto mb-4 md:mb-0 md:px-16 font-inter">
            <h3 className="w-full text-left text-lg font-bold md:font-black text-black underline decoration-2">
                {title}
            </h3>
            <ul className="mt-2 md:mt-4 space-y-2">
                {links.map((link, index) => (
                    <li
                        key={index}
                        className="text-white/90 cursor-pointer hover:underline"
                    >
                        {link}
                    </li>
                ))}
            </ul>
        </div>
    );


    return (
        <footer className="bg-[#9d7af0] text-white pt-10 md:px-0 font-inter">
            <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 px-6 md:px-16">
                {/* Left Section */}
                <div className="md:col-span-1">
                    {/* Logo Placeholder */}
                    <div className="w-full h-32 bg-gray-200 mb-4"></div>
                    <p className="text-sm text-white/90">
                        Our security platform provides advanced tools for red teaming, blue
                        teaming, forensic analysis, and cloud security. Built for enterprise
                        environments, it delivers real-time threat detection, proactive risk
                        management, and centralized control—ensuring robust and comprehensive
                        protection of your critical digital assets.
                    </p>

                    {/* Placeholder Social Icons */}
                    <div className="flex space-x-4 mt-4">
                        <a className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-xl" href="https://www.instagram.com/nexcorealliancellp/">I</a>
                        <a className="w-10 h-10 bg-[#3b5998] rounded-lg flex items-center justify-center text-white font-bold text-xl" href="https://www.facebook.com/profile.php?id=61570113656994">f</a>
                        <a className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white font-bold text-xl" href="https://https://x.com/Code4Bharat">x</a>
                        <a className="w-10 h-10 bg-[#0e76a8] rounded-lg flex items-center justify-center text-white font-bold text-xl" href="https://www.linkedin.com/company/nexcore-alliance">in</a>
                    </div>
                </div>

                {/* Services */}
                <Section
                    id="services"
                    title="Services"
                    links={[
                        'Soc',
                        'Vulnerability Assessment',
                        'Penetration Testing',
                        'Cyber Forensic',
                        'Cloud Security',
                        'Data Security Auditing',
                    ]}
                />

                {/* Tools */}
                <Section
                    id="tools"
                    title="Tools"
                    links={[
                        'Waf Scanner',
                        'Vulnerability Scanner',
                        'Database Security Checker',
                        'Link Detector',
                        'IP Address Info Finder',
                        'Source Code Analyzer',
                    ]}
                />

                {/* Quick */}
                <Section
                    id="quick"
                    title="Quick"
                    links={[
                        'Blog',
                        'Privacy Policy',
                        'Terms and Conditions',
                        'Schedule Meeting',
                        'Why Choose Us',
                        'Certificate',
                    ]}
                />
            </div>

            {/* Footer Bottom */}
            <div className="flex justify-center flex-col md:flex-row border-t border-white/30 mt-10 text-center text-sm text-[#9d7af0] bg-white md:py-3">
                <div>©2025<span className='hidden md:inline'>&nbsp;|&nbsp;</span></div>
                <div>
                    Developed By&nbsp;<span className="font-bold text-black">Code4Bharat</span><span className='hidden md:inline'>&nbsp;|&nbsp;</span>
                </div>
                <div>All Rights Reserved.</div>
            </div>
        </footer>
    );
};

export default Footer;
