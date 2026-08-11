"use client";

import Link from "next/link";
import {
  ArrowRight,
  Binary,
  Crosshair,
  Eye,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { motion } from "framer-motion";

import EngagementCta from "@/components/marketing/EngagementCta";
import OrbitRadar from "@/components/marketing/OrbitRadar";
import SectionIntro from "@/components/marketing/SectionIntro";

const services = [
  {
    index: "Service 01",
    title: "Vulnerability Assessment",
    description:
      "Deep-stack infrastructure analysis and authenticated scanning with remediation playbooks for every critical finding.",
    href: "/services/vulnerability-assessment",
    icon: ShieldCheck,
  },
  {
    index: "Service 02",
    title: "Penetration Testing",
    description:
      "OSCP / OSCE-certified consultants simulate high-tier adversaries against your frontline.",
    href: "/services/penetration-testing",
    icon: Crosshair,
  },
  {
    index: "Service 03",
    title: "Cloud Security",
    description:
      "Posture management and zero-trust hardening across AWS, Azure, GCP, and GovCloud estates.",
    href: "/services/cloud-security",
    icon: Binary,
  },
  {
    index: "Service 04",
    title: "Managed Detection & Response",
    description:
      "24x7 tier-3 SOC with correlating threat hunting and executive-ready incident reporting.",
    href: "/services/security-operations-center",
    icon: Eye,
  },
  {
    index: "Service 05",
    title: "Network & Zero-Trust",
    description:
      "Architecture, segmentation, and policy rollout for NGFW, IDS/IPS, and identity-aware access.",
    href: "/services/network-security",
    icon: Workflow,
  },
  {
    index: "Service 06",
    title: "Compliance Advisory",
    description:
      "ISO 27001, SOC 2, PCI DSS, DPDP, and board-ready security governance support.",
    href: "/services/cybersecurity-consultancy",
    icon: ShieldCheck,
  },
];

const processSteps = [
  {
    index: "01",
    title: "Discover",
    description:
      "Asset inventory, attack-surface mapping, and threat modeling.",
  },
  {
    index: "02",
    title: "Assess",
    description: "Manual testing, code review, and configuration audit.",
  },
  {
    index: "03",
    title: "Remediate",
    description: "Engineering pair sessions, control rollout, and re-testing.",
  },
  {
    index: "04",
    title: "Monitor",
    description: "24x7 detection, hunting, and executive reporting.",
  },
];

const modules = [
  {
    title: "Continuous External Scanner",
    description:
      "Automated recon and vulnerability discovery on internet-facing assets.",
    href: "/tools/vuln-scanner",
  },
  {
    title: "Cloud Posture Audit",
    description:
      "Drift detection, IAM blast-radius checks, and benchmark scoring.",
    href: "/tools",
  },
  {
    title: "SIEM & Log Analytics",
    description:
      "High-fidelity detection rules over enriched telemetry and threat intel.",
    href: "/tools/blue-team",
  },
  {
    title: "Compliance Workspace",
    description:
      "Evidence collection, control mapping, and audit deliverables in one place.",
    href: "/tools/green-team",
  },
];

const testimonials = [
  {
    quote:
      "Nexcore's red team uncovered an authentication bypass our in-house team missed. Their report was launch-blocker for us.",
    author: "CTSO",
    organization: "Listed Bank · Mumbai",
  },
  {
    quote:
      "Moving our MDR to SentinelSec dropped mean-time-to-detect from hours to minutes. The quarterly executive review reads like the rest of the world's already does.",
    author: "VP Security",
    organization: "Payments Processor",
  },
  {
    quote:
      "Their consultants speak both control language and engineering reality. That's rare.",
    author: "Head of Risk",
    organization: "Government Department",
  },
];

const logoStrip = ["BARCLAYS", "HSBC", "ST. JUDE", "BOEING", "NATO", "FDA"];

export default function Home() {
  return (
    <main className="site-page-shell bg-[#050505] text-white">
      <section className="group relative border-b border-white/6 flex items-center justify-start min-h-[calc(100vh-80px)] lg:min-h-[calc(100vh-113px)] bg-black overflow-hidden">
        {/* Full-bleed Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 z-0 h-full w-full object-cover opacity-40 transition-opacity duration-500 group-hover:opacity-50"
        >
          <source src="/video.mp4" type="video/mp4" />
        </video>


        <div className="relative z-20 w-full px-4 sm:px-6 lg:px-20 py-12 lg:py-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl space-y-8"
          >


            <h1 className="mono-heading text-5xl font-bold uppercase leading-[0.9] text-white sm:text-7xl lg:text-8xl">
              Protecting Your <br />
              <span className="text-[var(--gold)]">Digital Assets</span>
            </h1>

            <p className="max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg lg:text-xl">
              Next-generation security platform for the modern enterprise.
              Deploy deep-stack infrastructure analysis and contain threats
              before they impact your operations.
            </p>

            <div className="flex flex-col gap-5 sm:flex-row">
              <Link href="/gain-access" className="gold-button !px-10 !py-4 !text-sm">
                Get Started Now
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/connect" className="ghost-button !px-10 !py-4 !text-sm !backdrop-blur-sm">
                Schedule Demo
              </Link>
            </div>

            <div className="flex flex-wrap gap-x-10 gap-y-4 border-t border-white/10 pt-8 font-mono text-[0.7rem] uppercase tracking-[0.24em] text-white/40">
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[var(--gold)]" />
                SOC 2 Type II
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[var(--gold)]" />
                ISO 27001:2022
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[var(--gold)]" />
                GDPR COMPLIANT
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-white/6">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <p className="eyebrow mb-6 text-center text-white/32">
            Trusted by Many World Leading Organizations
          </p>
          <div className="grid gap-6 text-center font-mono text-sm uppercase tracking-[0.22em] text-white/38 sm:grid-cols-3 lg:grid-cols-6">
            {logoStrip.map((logo) => (
              <div key={logo}>{logo}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Video & Use Case Showcase Section */}
      <section className="border-b border-white/6 py-20 lg:py-20 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* LEFT COLUMN: Video Player Showcase */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-6 relative group"
            >
              {/* Glow Accent Backdrop */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[var(--gold)]/20 via-red-500/10 to-cyan-500/20 blur-xl opacity-60 group-hover:opacity-100 transition duration-1000"></div>

              <div className="relative rounded-2xl border border-white/12 bg-black/60 shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden pointer-events-none select-none">
                {/* Video Container (Unclickable, muted, autoPlay loop) */}
                <div className="relative aspect-video w-full bg-black overflow-hidden pointer-events-none select-none">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-full w-full object-cover pointer-events-none select-none"
                  >
                    <source src="/security_platform_v.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </motion.div>

            {/* RIGHT COLUMN: Explanatory Content & Value Proposition */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-6 space-y-6"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-3.5 py-1 font-mono text-xs text-[var(--gold)] tracking-wider uppercase">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Offensive & Defensive Security Platform</span>
              </div>

              <h2 className="font-mono text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                Security findings you can prioritize. In{" "}
                <span className="text-[var(--gold)]">web apps, network, and cloud.</span>
              </h2>

              <p className="text-base sm:text-lg leading-relaxed text-white/70">
                Nexcore discovers, exploits, and proves security issues in a unified workflow — so you prioritize on proven risk, not theoretical severity.
              </p>

              {/* Bullet Checklist */}
              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3 text-sm sm:text-base text-white/90">
                  <span className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-[var(--gold)]/20 text-[var(--gold)] font-bold text-xs mt-0.5">✓</span>
                  <span><strong>Cut manual triage</strong> with confirmed findings and automated scan execution</span>
                </div>
                <div className="flex items-start gap-3 text-sm sm:text-base text-white/90">
                  <span className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-[var(--gold)]/20 text-[var(--gold)] font-bold text-xs mt-0.5">✓</span>
                  <span><strong>Prioritize remediation</strong> on proof of exploitability & telemetry</span>
                </div>
                <div className="flex items-start gap-3 text-sm sm:text-base text-white/90">
                  <span className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-[var(--gold)]/20 text-[var(--gold)] font-bold text-xs mt-0.5">✓</span>
                  <span><strong>Report verifiable evidence</strong> for SOC 2, ISO 27001, and compliance</span>
                </div>
                <div className="flex items-start gap-3 text-sm sm:text-base text-white/90">
                  <span className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-[var(--gold)]/20 text-[var(--gold)] font-bold text-xs mt-0.5">✓</span>
                  <span><strong>62+ self-serve tool workflows</strong> replacing complex vendor sprawl</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  href="/tools"
                  className="gold-button !px-8 !py-3.5 !text-sm flex items-center gap-2"
                >
                  <span>Explore Platform Tools</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/gain-access"
                  className="ghost-button !px-8 !py-3.5 !text-sm"
                >
                  Book a Live Demo
                </Link>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Team & Tool Mindmap Architecture Section */}
      <section className="border-b border-white/6 py-20 lg:py-20 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionIntro
            eyebrow="// ARCHITECTURE & TOOL MATRIX"
            title="Unified Security Telemetry & Integrated Reporting."
            description="How 50+ specialized tools across Red, Blue, Green, and VA teams feed directly into a single consolidated reporting engine."
            className="mb-16"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* LEFT COLUMN: Clean Organic Mindmap Diagram (Matching Site Aesthetic) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-7 relative flex items-center justify-center overflow-x-auto py-4"
            >
              <div className="min-w-[660px] w-full flex justify-center py-2">
                <svg viewBox="0 0 680 500" className="w-full h-auto max-w-[680px] overflow-visible">
                  
                  {/* ========================================================
                     1. RED TEAM (Color: #ef4444)
                     ======================================================== */}
                  <text x="25" y="16" fill="#a1a1aa" fontSize="11" fontFamily="monospace">Vulnerability Scanner</text>
                  <path d="M 25 22 L 180 22 C 230 22, 230 60, 275 60" stroke="#ef4444" strokeWidth="1.5" strokeOpacity="0.8" fill="none" />

                  <text x="25" y="41" fill="#a1a1aa" fontSize="11" fontFamily="monospace">Brute Force Scanner</text>
                  <path d="M 25 47 L 180 47 C 230 47, 230 60, 275 60" stroke="#ef4444" strokeWidth="1.5" strokeOpacity="0.8" fill="none" />

                  <text x="25" y="66" fill="#a1a1aa" fontSize="11" fontFamily="monospace">API Testing</text>
                  <path d="M 25 72 L 180 72 C 230 72, 230 60, 275 60" stroke="#ef4444" strokeWidth="1.5" strokeOpacity="0.8" fill="none" />

                  <text x="25" y="91" fill="#a1a1aa" fontSize="11" fontFamily="monospace">Subdomain Scanner</text>
                  <path d="M 25 97 L 180 97 C 230 97, 230 60, 275 60" stroke="#ef4444" strokeWidth="1.5" strokeOpacity="0.8" fill="none" />

                  {/* Red Team Node */}
                  <g transform="translate(275, 42)">
                    <rect x="0" y="0" width="95" height="34" rx="6" fill="#121215" stroke="#ef4444" strokeWidth="1.2" />
                    <text x="47.5" y="21" fill="#f87171" fontSize="11" fontWeight="600" textAnchor="middle" fontFamily="monospace">Red Team</text>
                  </g>

                  {/* Red Team -> Integrated Report Arc */}
                  <path d="M 370 60 C 445 60, 445 250, 500 250" stroke="#ef4444" strokeWidth="1.5" strokeOpacity="0.8" fill="none" />


                  {/* ========================================================
                     2. BLUE TEAM (Color: #38bdf8)
                     ======================================================== */}
                  <text x="25" y="136" fill="#a1a1aa" fontSize="11" fontFamily="monospace">HTTPS Security Checker</text>
                  <path d="M 25 142 L 180 142 C 230 142, 230 180, 275 180" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.8" fill="none" />

                  <text x="25" y="161" fill="#a1a1aa" fontSize="11" fontFamily="monospace">JWT Signature Validator</text>
                  <path d="M 25 167 L 180 167 C 230 167, 230 180, 275 180" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.8" fill="none" />

                  <text x="25" y="186" fill="#a1a1aa" fontSize="11" fontFamily="monospace">Obfuscation Detector</text>
                  <path d="M 25 192 L 180 192 C 230 192, 230 180, 275 180" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.8" fill="none" />

                  <text x="25" y="211" fill="#a1a1aa" fontSize="11" fontFamily="monospace">WAF Scanner</text>
                  <path d="M 25 217 L 180 217 C 230 217, 230 180, 275 180" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.8" fill="none" />

                  {/* Blue Team Node */}
                  <g transform="translate(275, 162)">
                    <rect x="0" y="0" width="95" height="34" rx="6" fill="#121215" stroke="#38bdf8" strokeWidth="1.2" />
                    <text x="47.5" y="21" fill="#38bdf8" fontSize="11" fontWeight="600" textAnchor="middle" fontFamily="monospace">Blue Team</text>
                  </g>

                  {/* Blue Team -> Integrated Report Arc */}
                  <path d="M 370 180 C 445 180, 445 250, 500 250" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.8" fill="none" />


                  {/* ========================================================
                     3. GREEN TEAM (Color: #4ade80)
                     ======================================================== */}
                  <text x="25" y="266" fill="#a1a1aa" fontSize="11" fontFamily="monospace">Meta Tag Analyzer</text>
                  <path d="M 25 272 L 180 272 C 230 272, 230 310, 275 310" stroke="#4ade80" strokeWidth="1.5" strokeOpacity="0.8" fill="none" />

                  <text x="25" y="291" fill="#a1a1aa" fontSize="11" fontFamily="monospace">Keyword Density Checker</text>
                  <path d="M 25 297 L 180 297 C 230 297, 230 310, 275 310" stroke="#4ade80" strokeWidth="1.5" strokeOpacity="0.8" fill="none" />

                  <text x="25" y="316" fill="#a1a1aa" fontSize="11" fontFamily="monospace">Link Detector</text>
                  <path d="M 25 322 L 180 322 C 230 322, 230 310, 275 310" stroke="#4ade80" strokeWidth="1.5" strokeOpacity="0.8" fill="none" />

                  <text x="25" y="341" fill="#a1a1aa" fontSize="11" fontFamily="monospace">SEO Score Analyzer Tool</text>
                  <path d="M 25 347 L 180 347 C 230 347, 230 310, 275 310" stroke="#4ade80" strokeWidth="1.5" strokeOpacity="0.8" fill="none" />

                  {/* Green Team Node */}
                  <g transform="translate(275, 292)">
                    <rect x="0" y="0" width="95" height="34" rx="6" fill="#121215" stroke="#4ade80" strokeWidth="1.2" /> 
                    <text x="47.5" y="21" fill="#4ade80" fontSize="11" fontWeight="600" textAnchor="middle" fontFamily="monospace">Green Team</text>
                  </g>

                  {/* Green Team -> Integrated Report Arc */}
                  <path d="M 370 310 C 445 310, 445 250, 500 250" stroke="#4ade80" strokeWidth="1.5" strokeOpacity="0.8" fill="none" />


                  {/* ========================================================
                     4. VA TEAM (Color: #facc15)
                     ======================================================== */}
                  <text x="25" y="396" fill="#a1a1aa" fontSize="11" fontFamily="monospace">Basic Network Scanning</text>
                  <path d="M 25 402 L 180 402 C 230 402, 230 440, 275 440" stroke="#facc15" strokeWidth="1.5" strokeOpacity="0.8" fill="none" />

                  <text x="25" y="421" fill="#a1a1aa" fontSize="11" fontFamily="monospace">AWS Credential Validation</text>
                  <path d="M 25 427 L 180 427 C 230 427, 230 440, 275 440" stroke="#facc15" strokeWidth="1.5" strokeOpacity="0.8" fill="none" />

                  <text x="25" y="446" fill="#a1a1aa" fontSize="11" fontFamily="monospace">Malware Scan</text>
                  <path d="M 25 452 L 180 452 C 230 452, 230 440, 275 440" stroke="#facc15" strokeWidth="1.5" strokeOpacity="0.8" fill="none" />

                  <text x="25" y="471" fill="#a1a1aa" fontSize="11" fontFamily="monospace">Active Directory Scan</text>
                  <path d="M 25 477 L 180 477 C 230 477, 230 440, 275 440" stroke="#facc15" strokeWidth="1.5" strokeOpacity="0.8" fill="none" />

                  {/* VA Team Node */}
                  <g transform="translate(275, 422)">
                    <rect x="0" y="0" width="95" height="34" rx="6" fill="#121215" stroke="#facc15" strokeWidth="1.2" />
                    <text x="47.5" y="21" fill="#facc15" fontSize="11" fontWeight="600" textAnchor="middle" fontFamily="monospace">VA Team</text>
                  </g>

                  {/* VA Team -> Integrated Report Arc */}
                  <path d="M 370 440 C 445 440, 445 250, 500 250" stroke="#facc15" strokeWidth="1.5" strokeOpacity="0.8" fill="none" />


                  {/* ========================================================
                     5. CENTRAL HUB: INTEGRATED REPORT NODE
                     ======================================================== */}
                  <g transform="translate(500, 228)">
                    <rect x="0" y="0" width="155" height="44" rx="8" fill="#18181b" stroke="white" strokeWidth="1.5" />
                    <text x="77.5" y="27" fill="white" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="monospace">Integrated Report</text>
                  </g>12
                </svg>
              </div>
            </motion.div>

            {/* RIGHT COLUMN: Clean Enterprise Explanatory Panel (Matching Site Style) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-5 space-y-8"
            >
              {/* Header & Export Formats */}
              <div className="space-y-3 border-b border-white/10 pb-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-white/40 uppercase tracking-wider">Report Formats:</span>
                  <span className="px-2.5 py-1 rounded border border-white/12 bg-white/5 font-mono text-xs text-white/80">PDF</span>
                  <span className="px-2.5 py-1 rounded border border-white/12 bg-white/5 font-mono text-xs text-white/80">JSON</span>
                  <span className="px-2.5 py-1 rounded border border-white/12 bg-white/5 font-mono text-xs text-white/80">TXT</span>
                  <span className="px-2.5 py-1 rounded border border-white/12 bg-white/5 font-mono text-xs text-white/80">XML</span>
                  <span className="px-2.5 py-1 rounded border border-white/12 bg-white/5 font-mono text-xs text-white/80">CSV</span>
                </div>
                <p className="text-sm text-white/70 leading-relaxed">
                  Consolidate all scan telemetry into unified security reports. Instantly export executive summaries and detailed technical findings in <strong>PDF, JSON, TXT, XML, or CSV</strong> formats.
                </p>
              </div>

              {/* Team Role Clean List */}
              <div className="space-y-6">
                
                {/* Red Team */}
                <div className="space-y-1">
                  <h4 className="font-mono text-sm font-semibold text-[#f87171] flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#f87171]"></span>
                    What Red Team does:
                  </h4>
                  <p className="text-sm text-white/60 leading-relaxed pl-3.5">
                    Offensive security tools to simulate adversary attacks, enumerate subdomains, scan vulnerabilities, and test API endpoints.
                  </p>
                </div>

                {/* Blue Team */}
                <div className="space-y-1">
                  <h4 className="font-mono text-sm font-semibold text-[#38bdf8] flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#38bdf8]"></span>
                    What Blue Team does:
                  </h4>
                  <p className="text-sm text-white/60 leading-relaxed pl-3.5">
                    Defensive monitoring and posture inspection including HTTPS verification, JWT signature validation, code obfuscation checks, and WAF audit.
                  </p>
                </div>

                {/* Green Team */}
                <div className="space-y-1">
                  <h4 className="font-mono text-sm font-semibold text-[#4ade80] flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80]"></span>
                    What Green Team does:
                  </h4>
                  <p className="text-sm text-white/60 leading-relaxed pl-3.5">
                    Digital presence & SEO health optimization tools for meta tag validation, link integrity detection, keyword density, and site score audits.
                  </p>
                </div>

                {/* VA Team */}
                <div className="space-y-1">
                  <h4 className="font-mono text-sm font-semibold text-[#facc15] flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#facc15]"></span>
                    What VA Team does:
                  </h4>
                  <p className="text-sm text-white/60 leading-relaxed pl-3.5">
                    Deep infrastructure vulnerability assessment covering network port activity, AWS credential validation, malware scanning, and Active Directory scans.
                  </p>
                </div>

                {/* Purple Team */}
                <div className="space-y-1">
                  <h4 className="font-mono text-sm font-semibold text-[#c084fc] flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#c084fc]"></span>
                    What Purple Team does:
                  </h4>
                  <p className="text-sm text-white/60 leading-relaxed pl-3.5">
                    Collaborative threat simulation aligning Red Team attack findings with Blue Team defense rules for continuous security posture hardening.
                  </p>
                </div>

              </div>

            </motion.div>

          </div>
        </div>
      </section>

      <section className="border-b border-white/6">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionIntro
            eyebrow="// Services"
            title="Six Services. One accountable team."
            description="A single roster of senior consultants covering the full security lifecycle — without vendor sprawl."
            className="mb-12"
          />

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3 lg:items-stretch">
            {services.map((service) => {
              const Icon = service.icon;

              return (
                <Link
                  key={service.title}
                  href={service.href}
                  className="group flex h-full flex-col border border-white/8 bg-[#0b0b0c] p-8 lg:p-10 transition-all duration-300 hover:bg-[#101011] hover:border-[var(--gold)]/30 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
                >
                  <p className="eyebrow mb-6">{service.index}</p>
                  <div className="mb-8 flex items-center justify-between">
                    <Icon className="h-5 w-5 text-[var(--gold)]" />
                    <ArrowRight className="h-4 w-4 text-white/28 transition group-hover:text-[var(--gold)]" />
                  </div>
                  <h3 className="font-mono text-2xl font-semibold text-white break-words">
                    {service.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                    {service.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-white/6">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionIntro
            eyebrow="// For The Board"
            title="Built for security leaders who answer to a board."
            className="mb-12"
          />

          <div className="grid gap-px overflow-hidden border border-white/8 bg-white/8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["220+", "Assessments delivered"],
              ["14", "Senior experts on staff"],
              ["99.98%", "Platform uptime"],
              ["4m 11s", "Median MTTA"],
            ].map(([value, label]) => (
              <div key={label} className="bg-[#0b0b0c] px-8 py-10">
                <div className="font-mono text-4xl font-semibold text-[var(--gold)]">
                  {value}
                </div>
                <p className="mt-3 font-mono text-[0.68rem] uppercase tracking-[0.26em] text-white/30">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/6 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-20 lg:grid-cols-[1fr_520px] lg:items-stretch">
            <div>
              <SectionIntro
                eyebrow="// We Operate"
                title="A continuous program — not a one-time audit."
                className="mb-12"
              />

              <div className="grid gap-6 md:grid-cols-2">
                {processSteps.map((step) => (
                  <div key={step.index} className="bg-[#0b0b0c] p-8 border border-white/8 transition-all duration-300 hover:bg-[#101011] hover:border-[var(--gold)]/30 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                    <p className="eyebrow mb-5">{step.index}</p>
                    <h3 className="font-mono text-xl font-semibold text-white">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex h-full items-center justify-center lg:justify-end">
              <div className="w-full max-w-[520px] aspect-square flex items-center justify-center lg:translate-y-24">
                <OrbitRadar />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/6">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionIntro
              eyebrow="// Platform"
              title="A single workspace for offense and defense."
              description="Modular workflows designed to connect recon, assessment, reporting, and operational follow-through."
            />
            <Link
              href="/tools"
              className="eyebrow inline-flex items-center gap-2 text-[var(--gold)] hover:text-white"
            >
              See all tools
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {modules.map((module) => (
              <Link
                key={module.title}
                href={module.href}
                className="group border border-white/8 bg-white/[0.025] p-6 transition-all duration-300 hover:border-[var(--gold)]/35 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
              >
                <div className="mb-6 inline-flex h-10 w-10 items-center justify-center border border-[var(--gold)]/25 text-[var(--gold)]">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <h3 className="font-mono text-xl font-semibold text-white">
                  {module.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  {module.description}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-[var(--gold)]">
                  Module Overview
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/6">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionIntro
            eyebrow="// Outcomes"
            title="What security leaders put on the record."
            className="mb-12"
          />

          <div className="grid gap-px overflow-hidden border border-white/8 bg-white/8 lg:grid-cols-3">
            {testimonials.map((item) => (
              <article key={item.author} className="bg-[#0b0b0c] p-8">
                <p className="mb-8 text-sm leading-8 text-white/72">
                  “{item.quote}”
                </p>
                <div>
                  <p className="font-mono text-sm uppercase tracking-[0.18em] text-[var(--gold)]">
                    {item.author}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.24em] text-white/30">
                    {item.organization}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <EngagementCta />
    </main>
  );
}
