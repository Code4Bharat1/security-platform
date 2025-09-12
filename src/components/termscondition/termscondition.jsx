"use client";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";

export default function TermsAndConditions() {
  const { theme } = useTheme();

  const sections = [
    {
      title: "1. Introduction",
      content: `Since 2011, NexCore Alliance has been providing high-value IT and cybersecurity services for over 14 years. These Terms & Conditions govern your engagement with our services, ensuring transparency, legal clarity, and mutual trust.`,
    },
    {
      title: "2. Scope of Services",
      list: [
        "Vulnerability Assessment & Penetration Testing (VAPT)",
        "Security Operations Center (SOC) services",
        "Red & Blue Teaming",
        "Cloud security audits & compliance reviews",
        "Digital forensics & incident response",
        "Threat intelligence & advisory services",
      ],
    },
    {
      title: "3. Client Responsibilities",
      list: [
        "Provide accurate system and network details.",
        "Ensure legal authorization for testing.",
        "Avoid disrupting active security operations.",
      ],
    },
    {
      title: "4. Confidentiality & Data Protection",
      list: [
        "All information shared will be protected under binding Non-Disclosure Agreements (NDAs).",
        "We adhere to GDPR, ISO/IEC 27001:2022, and India’s Digital Personal Data Protection Act (DPDP) 2023.",
        "Sensitive information will never be disclosed without client consent unless required by law.",
        "All data is stored securely with AES-256 encryption and transmitted using TLS 1.3.",
      ],
    },
    {
      title: "5. Acceptable Use of Deliverables",
      list: [
        "Clients may not use deliverables for unauthorized or illegal activities.",
        "Exploiting third-party vulnerabilities without written consent is prohibited.",
        "Reselling, redistributing, or publicizing proprietary reports, scripts, or tools without permission is not allowed.",
      ],
    },
    {
      title: "6. Intellectual Property Rights",
      list: [
        "All proprietary methodologies, frameworks, and tools remain the property of NexCore Alliance.",
        "Clients are granted a non-transferable, internal-use-only license for deliverables.",
        "Unauthorized replication or resale is prohibited.",
      ],
    },
    {
      title: "7. Limitation of Liability",
      list: [
        "NexCore Alliance is not liable for indirect, incidental, or consequential damages.",
        "Our liability is capped at the total amount paid for the specific service.",
      ],
    },
    {
      title: "8. Payment Terms",
      list: [
        "Payment terms, schedules, and fees will be outlined in the Service Agreement.",
        "Late payments may incur penalties and lead to service suspension.",
      ],
    },
    {
      title: "9. Termination of Engagement",
      list: [
        "We may terminate services if the client breaches these Terms.",
        "If the engagement poses legal, ethical, or reputational risks.",
        "All outstanding dues must be cleared upon termination.",
      ],
    },
    {
      title: "10. Governing Law & Jurisdiction",
      content: `These Terms are governed by the laws of India, with exclusive jurisdiction in the courts of Mumbai, Maharashtra.`,
    },
  ];

  return (
    <div
      className={`min-h-screen py-20 px-6 sm:px-12 lg:px-32 transition-colors duration-300 ${
        theme === "dark" ? "bg-black text-gray-200" : "bg-gray-50 text-gray-800"
      }`}
    >
      {/* Page Heading */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center text-4xl md:text-5xl font-bold mb-12 text-indigo-500"
      >
        Terms & Conditions
      </motion.h1>

      {/* Sections */}
      <div className="space-y-10">
        {sections.map((section, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.6 }}
            className="p-6 rounded-2xl shadow-md backdrop-blur-lg border border-gray-700/20 bg-white/5 dark:bg-gray-900/40"
          >
            <h2 className="text-2xl font-semibold mb-4 text-indigo-400">
              {section.title}
            </h2>
            {section.content && (
              <p className="leading-relaxed whitespace-pre-line">{section.content}</p>
            )}
            {section.list && (
              <ul className="list-disc list-inside space-y-2">
                {section.list.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
