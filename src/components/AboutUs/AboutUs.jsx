import { MapPin } from "lucide-react";

import EngagementCta from "@/components/marketing/EngagementCta";
import SectionIntro from "@/components/marketing/SectionIntro";

const stats = [
  ["220+", "Assessments delivered"],
  ["14", "Security experts on staff"],
  ["99.98%", "Platform uptime"],
  ["4m 11s", "Median response"],
];

const offices = {
  Domestic: [
    ["Mumbai", "Maharashtra"],
    ["Bangalore", "Karnataka"],
    ["Lucknow", "Uttar Pradesh"],
    ["Guwahati", "Assam"],
    ["Jaipur", "Rajasthan"],
  ],
  International: [
    ["Dubai", "UAE"],
    ["Sharjah", "UAE"],
    ["Muscat", "Oman"],
    ["Kuwait City", "Kuwait"],
    ["Johannesburg", "South Africa"],
  ],
};

const steps = [
  {
    index: "01",
    title: "Identify",
    description: "Asset inventory, attack-surface mapping, threat modeling.",
  },
  {
    index: "02",
    title: "Analyze",
    description: "Manual testing, code review, and configuration audit.",
  },
  {
    index: "03",
    title: "Strategize",
    description: "Tailored response, prioritized roadmap, control design.",
  },
  {
    index: "04",
    title: "Implement",
    description: "Engineering pairing, control rollout, and re-testing.",
  },
  {
    index: "05",
    title: "Monitor & Improve",
    description: "24x7 detection, hunting, and executive reporting.",
  },
];

const pillars = [
  {
    title: "Mission",
    items: [
      "Secure businesses end-to-end",
      "Strengthen operations continuously",
      "Proactive intelligence-led defense",
      "Rapid, accountable response",
      "24x7 protection of critical assets",
    ],
  },
  {
    title: "Vision",
    items: [
      "Be the world's most trusted security partner",
      "AI-augmented, analyst-led defense",
      "Threat intelligence in every workflow",
      "Protect every regulated sector",
      "Build a safer digital economy",
    ],
  },
  {
    title: "Values",
    items: [
      "Integrity — ethical and transparent",
      "Outcomes over outputs",
      "Excellence, measured",
      "Innovation ahead of adversaries",
      "Accountability at every layer",
    ],
  },
];

export default function AboutUs() {
  return (
    <main className="site-page-shell bg-[#050505] text-white">
      <section className="border-b border-white/6">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionIntro
            eyebrow="About Nexcore//Alliance"
            title="A cybersecurity firm built for the next decade of threats."
            description="Nexcore Alliance defends regulated enterprises across finance, healthcare, government, and technology — through senior consultants, an in-house tier-3 SOC, and a single integrated platform."
          />

          <div className="mt-14 grid gap-px overflow-hidden border border-white/8 bg-white/8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(([value, label]) => (
              <div key={label} className="bg-[#0b0b0c] px-8 py-10 transition-all duration-300 hover:bg-white/[0.04] cursor-pointer">
                <div className="font-mono text-4xl font-semibold text-white">{value}</div>
                <p className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-white/28">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/6">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
          <SectionIntro
            eyebrow="Positioning"
            title="The security partner you can put in front of a regulator."
          />

          <div className="space-y-6 text-base leading-8 text-[var(--muted)]">
            <p>
              We exist for organizations where a breach is not just operational — it is
              existential. Listed banks, hospital networks, defense suppliers,
              payments processors, and government departments.
            </p>
            <p>
              Every engagement is led by a senior consultant who has signed audit
              reports in your sector and your jurisdiction. No junior hand-off, no SDR
              theatrics, no template deliverables.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-white/6">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionIntro
            eyebrow="Global Presence"
            title="Five domestic, five international offices."
            className="mb-12"
          />

          <div className="grid gap-10 lg:grid-cols-2">
            {Object.entries(offices).map(([region, entries]) => (
              <div key={region} className="space-y-5">
                <p className="eyebrow">{region}</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {entries.map(([city, state]) => (
                    <article key={`${region}-${city}`} className="surface-panel p-5 transition-all duration-300 hover:border-[var(--gold)]/35 hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(212,166,74,0.05)] cursor-pointer">
                      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center border border-[var(--gold)]/18 text-[var(--gold)]">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <h3 className="font-mono text-lg font-semibold text-white">{city}</h3>
                      <p className="mt-1 text-sm text-[var(--muted)]">{state}</p>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/6">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionIntro
            eyebrow="How We Operate"
            title="A repeatable, evidence-driven process."
            className="mb-12"
          />

          <div className="space-y-4">
            {steps.map((step) => (
              <article
                key={step.index}
                className="grid gap-4 border border-white/8 bg-white/[0.025] p-5 sm:grid-cols-[auto_1fr] sm:items-center transition-all duration-300 cursor-pointer hover:glow-panel hover:-translate-y-1"
              >
                <div className="flex items-center gap-4">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--gold)]/35 font-mono text-xs text-[var(--gold)] shadow-[0_0_24px_rgba(212,166,74,0.18)]">
                    {step.index}
                  </span>
                </div>
                <div>
                  <h3 className="font-mono text-xl font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{step.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/6">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-3">
            {pillars.map((pillar) => (
              <article key={pillar.title} className="surface-panel p-8 transition-all duration-300 hover:border-[var(--gold)]/35 hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(212,166,74,0.05)] cursor-pointer">
                <div className="mb-5 inline-flex h-10 w-10 items-center justify-center border border-[var(--gold)]/18 text-[var(--gold)]">
                  <MapPin className="h-4 w-4" />
                </div>
                <h3 className="font-mono text-2xl font-semibold text-white">{pillar.title}</h3>
                <ul className="mt-6 space-y-3 text-sm leading-7 text-[var(--muted)]">
                  {pillar.items.map((item) => (
                    <li key={item}>· {item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <EngagementCta />
    </main>
  );
}
