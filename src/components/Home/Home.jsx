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
      <section className="border-b border-white/6">
        <div className="mx-auto grid max-w-7xl gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="eyebrow inline-flex items-center gap-3 border border-[var(--gold)]/18 bg-[var(--gold)]/8 px-3 py-2">
              <span>v6.08</span>
              <span>Architecture Release</span>
            </div>

            <h1 className="mono-heading max-w-3xl text-5xl font-semibold uppercase leading-[0.88] text-white sm:text-6xl lg:text-7xl">
              Protecting Your Digital Assets in an Evolving{" "}
              <span className="text-[var(--gold)]">Threat Landscape</span>
            </h1>

            <p className="max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg">
              Our advanced security platform offers comprehensive protection
              against the most sophisticated cyber threats, keeping your data
              safe and your business compliant.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/gain-access" className="gold-button">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/connect" className="ghost-button">
                Shedule a Demo
              </Link>
            </div>

            <div className="flex flex-wrap gap-6 border-t border-white/6 pt-6 font-mono text-[0.68rem] uppercase tracking-[0.24em] text-white/30">
              <span>SOC 2 Type II</span>
              <span>ISO 27001:2022</span>
              <span>Cert-In Empanelled</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, ease: "easeOut", delay: 0.08 }}
            className="flex justify-center lg:justify-end"
          >
            <OrbitRadar />
          </motion.div>
        </div>
      </section>

      <section className="border-b border-white/6">
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
          <p className="eyebrow mb-6 text-center text-white/32">
            Trusted by world-leading institutions
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
            eyebrow="// Disciplines"
            title="Six disciplines. One accountable team."
            description="A single roster of senior consultants covering the full security lifecycle — without vendor sprawl."
            className="mb-12"
          />

          <div className="grid gap-px overflow-hidden border border-white/8 bg-white/8 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon;

              return (
                <Link
                  key={service.title}
                  href={service.href}
                  className="group bg-[#0b0b0c] p-8 transition hover:bg-[#101011]"
                >
                  <p className="eyebrow mb-6">{service.index}</p>
                  <div className="mb-8 flex items-center justify-between">
                    <Icon className="h-5 w-5 text-[var(--gold)]" />
                    <ArrowRight className="h-4 w-4 text-white/28 transition group-hover:text-[var(--gold)]" />
                  </div>
                  <h3 className="font-mono text-2xl font-semibold text-white">
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

      <section className="border-b border-white/6">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionIntro
            eyebrow="// We Operate"
            title="A continuous program — not a one-time audit."
            className="mb-12"
          />

          <div className="grid gap-px overflow-hidden border border-white/8 bg-white/8 lg:grid-cols-4">
            {processSteps.map((step) => (
              <div key={step.index} className="bg-[#0b0b0c] p-6">
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
                className="group border border-white/8 bg-white/[0.025] p-6 transition hover:border-[var(--gold)]/35 hover:shadow-[0_0_50px_rgba(212,166,74,0.10)]"
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
