"use client";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";

export default function PrivacyPolicy() {
  const { theme } = useTheme();

  const sections = [
    {
      title: "1. Introduction",
      content: `Established in 2011, NexCore Alliance has been delivering world-class IT and cybersecurity solutions for over 14 years. Serving clients from startups to enterprises, we are committed to protecting your personal, corporate, and technical data through globally recognized security frameworks, ethical practices, and strict compliance measures.
      
This Privacy Policy explains how we collect, process, store, and safeguard your information across all services, platforms, and engagements. By using our services, you agree to the practices outlined herein.`,
    },
    {
      title: "2. Scope",
      list: [
        "All clients, partners, vendors, and users of NexCore Alliance services.",
        "All products, platforms, software, and cybersecurity solutions we operate.",
        "Engagements across India and our international offices.",
      ],
    },
    {
      title: "3. Global Presence",
      list: [
        "International Offices: Dubai (UAE), Sharjah (UAE), Oman, Kuwait.",
        "Domestic Offices (India): Bandra Kurla Complex (BKC) – Mumbai HQ, Karnataka, Assam, Uttar Pradesh, Rajasthan.",
      ],
    },
    {
      title: "4. Data We Collect",
      list: [
        "Personal Data: Name, contact details, designation.",
        "Corporate Data: Company name, contractual details, service scope.",
        "Technical Data: IP addresses, logs, vulnerability scan results.",
        "Operational Data: Communication records, forensic evidence, audit trails.",
        "Payment Data: Secure transaction details.",
      ],
    },
    {
      title: "5. How We Use Data",
      list: [
        "Delivering cybersecurity services (VAPT, SOC, Red/Blue Teaming, Cloud Security, Forensics).",
        "Project execution, onboarding, and client support.",
        "Compliance with legal, contractual, and regulatory requirements.",
        "Enhancing service quality through analytics.",
      ],
    },
    {
      title: "6. Data Security",
      list: [
        "TLS 1.3 encryption for data in transit.",
        "AES-256 encryption for data at rest.",
        "Zero-Trust Architecture with real-time monitoring.",
        "Role-Based Access Control (RBAC) for data handling.",
      ],
    },
    {
      title: "7. Third-Party Sharing",
      list: [
        "We do not sell or rent your data. We may share it internally on a need-to-know basis.",
        "With trusted vendors bound by NDAs.",
        "With regulators where legally required.",
      ],
    },
    {
      title: "8. Data Retention",
      list: [
        "Project-related data: Retained for 90 days post-completion unless extended.",
        "Forensic evidence: Retained as per legal mandates.",
      ],
    },
    {
      title: "9. Your Rights",
      list: [
        "Data access.",
        "Rectification of inaccuracies.",
        "Deletion, subject to legal constraints.",
      ],
    },
    {
      title: "10. Compliance",
      list: [
        "ISO/IAF 27001:2022 – Information Security Management.",
        "OWASP Security Guidelines.",
        "Applicable GDPR and Indian data laws.",
      ],
    },
    {
      title: "11. Contact",
      content: `📍 Head Office: Bandra Kurla Complex (BKC), Mumbai, India  
📧 Email: director@nexcorealliance.com  
📱 WhatsApp: +91 95944 30295`,
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
        Privacy Policy
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
