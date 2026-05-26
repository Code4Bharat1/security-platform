"use client";

import Link from "next/link";
import { ArrowRight, Cloud, Crosshair, Network, Shield, TowerControl, WalletCards } from "lucide-react";

import EngagementCta from "@/components/marketing/EngagementCta";
import SectionIntro from "@/components/marketing/SectionIntro";

const serviceRows = [
  {
    id: "S.01",
    title: "Vulnerability Assessment",
    description:
      "Structured discovery and prioritization of weaknesses across infrastructure, applications, cloud, and endpoints.",
    href: "/services/vulnerability-assessment",
    icon: Shield,
    capabilities: [
      "Authenticated & unauthenticated scans",
      "CVSS-scored findings",
      "Remediation playbooks",
    ],
    idealFor:
      "Pre-audit posture baselining, M&A diligence, quarterly hygiene cycles.",
    deliverables:
      "Executive summary · Technical findings register · Remediation tracker.",
    metrics: [
      ["96%", "Median critical remediation in 14 days"],
      ["3.2x", "More findings vs. last vendor"],
    ],
  },
  {
    id: "S.02",
    title: "Penetration Testing",
    description:
      "Manual offensive engagements by OSCP / OSCE-certified consultants — web, mobile, network, API, and cloud.",
    href: "/services/penetration-testing",
    icon: Crosshair,
    capabilities: [
      "Senior consultant-led",
      "Detailed PoCs with impact",
      "Re-test included",
    ],
    idealFor:
      "Regulatory testing, pre-launch sign-off, and material control validation.",
    deliverables:
      "PoC walkthroughs · Risk-rated report · Auditor letter on request.",
    metrics: [
      ["48h", "To first critical finding (median)"],
      ["100%", "Engagements include free re-test"],
    ],
  },
  {
    id: "S.03",
    title: "Security Operations Center",
    description:
      "24x7 managed detection and response from a tier-3 SOC with proactive threat hunting.",
    href: "/services/security-operations-center",
    icon: TowerControl,
    capabilities: ["MTTA under 15 minutes", "SIEM + SOAR included", "Quarterly executive reviews"],
    idealFor:
      "Lean security teams, regulated firms, and post-incident resilience uplift.",
    deliverables:
      "Live SOC dashboard · Monthly hunt report · Incident retrospectives.",
    metrics: [
      ["4m 11s", "Median MTTR"],
      ["99.98%", "Platform uptime SLA"],
    ],
  },
  {
    id: "S.04",
    title: "Cloud Security",
    description:
      "Posture management, workload protection, and zero-trust architecture for AWS, Azure, and GCP.",
    href: "/services/cloud-security",
    icon: Cloud,
    capabilities: ["CSPM & CWPP", "IAM least-privilege review", "Kubernetes hardening"],
    idealFor:
      "Multi-cloud estates, fast-growth SaaS, and regulated data residency.",
    deliverables:
      "Posture scorecard · IaC guardrails · Kubernetes benchmark report.",
    metrics: [
      ["62%", "Average reduction in IAM blast radius"],
      ["CIS L1+L2", "Automated continuous checks"],
    ],
  },
  {
    id: "S.05",
    title: "Network & Zero-Trust",
    description:
      "Architecture, segmentation, and policy design — NGFW, IDS/IPS, and zero-trust access rollouts.",
    href: "/services/network-security",
    icon: Network,
    capabilities: ["Network segmentation", "Zero-trust rollout", "EDR integration"],
    idealFor:
      "Hybrid datacenter + cloud, OT/IT convergence, and migration programs.",
    deliverables:
      "Target architecture · Migration runbook · Cutover playbook.",
    metrics: [
      ["9 weeks", "Median zero-trust rollout"],
      ["0", "Downtime incidents on cutover"],
    ],
  },
  {
    id: "S.06",
    title: "Cybersecurity Consulting",
    description:
      "Advisory to strengthen governance, policy, awareness, and strategic security execution.",
    href: "/services/cybersecurity-consultancy",
    icon: WalletCards,
    capabilities: ["vCISO engagements", "ISO 27001 / SOC 2 readiness", "Board-level reporting"],
    idealFor:
      "Series B+ scale-ups, regulated newcomers, and board-ready posture reviews.",
    deliverables:
      "Strategy roadmap · Policy library · Board pack and operating model.",
    metrics: [
      ["6 months", "To ISO 27001 stage 2 (median)"],
      ["100%", "Audit pass rate"],
    ],
  },
];

export default function ServicePage() {
  return (
    <main className="site-page-shell bg-[#050505] text-white">
      <section className="border-b border-white/6">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionIntro
            eyebrow="Our Services"
            title="Security services that scale with your risk."
            description="Six disciplines, one accountable team. Senior consultants lead every engagement — from a single web app to a global multi-cloud estate."
            className="mb-16"
          />

          <div className="space-y-8">
            {serviceRows.map((service, index) => {
              const Icon = service.icon;

              return (
                <section key={service.id} className="border-t border-white/6 pt-8">
                  <div className="grid gap-8 lg:grid-cols-[1.1fr_1.4fr] lg:items-start">
                    <div className={`${index % 2 === 1 ? "lg:order-2" : ""} space-y-5`}>
                      <p className="eyebrow">{service.id}</p>
                      <div className="inline-flex h-10 w-10 items-center justify-center border border-[var(--gold)]/25 text-[var(--gold)]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <h2 className="font-mono text-3xl font-semibold text-white sm:text-4xl">
                        {service.title}
                      </h2>
                      <p className="max-w-xl text-base leading-8 text-[var(--muted)]">
                        {service.description}
                      </p>
                      <Link href={service.href} className="inline-flex items-center gap-2 font-mono text-sm text-[var(--gold)] transition hover:text-white">
                        Discuss this service
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>

                    <div className={`${index % 2 === 1 ? "lg:order-1" : ""} grid gap-4 md:grid-cols-2`}>
                      <InfoPanel title="Capabilities">
                        {service.capabilities.map((capability) => (
                          <li key={capability}>{capability}</li>
                        ))}
                      </InfoPanel>
                      <TextPanel title="Ideal For" text={service.idealFor} />
                      <TextPanel title="Deliverables" text={service.deliverables} />
                      <div className="grid gap-4 sm:grid-cols-2">
                        {service.metrics.map(([value, label]) => (
                          <div key={label} className="surface-panel p-6">
                            <p className="font-mono text-4xl font-semibold text-white">{value}</p>
                            <p className="mt-2 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-white/28">
                              {label}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </section>

      <EngagementCta />
    </main>
  );
}

function InfoPanel({ title, children }) {
  return (
    <div className="surface-panel p-6">
      <p className="eyebrow mb-5">{title}</p>
      <ul className="space-y-3 text-sm leading-7 text-white/74 [&_li]:relative [&_li]:pl-5 [&_li::before]:absolute [&_li::before]:left-0 [&_li::before]:top-[0.7rem] [&_li::before]:h-1.5 [&_li::before]:w-1.5 [&_li::before]:rounded-full [&_li::before]:bg-[var(--gold)]">
        {children}
      </ul>
    </div>
  );
}

function TextPanel({ title, text }) {
  return (
    <div className="surface-panel p-6">
      <p className="eyebrow mb-5">{title}</p>
      <p className="text-sm leading-7 text-[var(--muted)]">{text}</p>
    </div>
  );
}
