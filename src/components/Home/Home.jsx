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
    href: "/tools/VulnerabilityAssessment",
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

        {/* Vignette Overlay */}
        <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_10%,rgba(0,0,0,0.85)_100%)] pointer-events-none" />

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
