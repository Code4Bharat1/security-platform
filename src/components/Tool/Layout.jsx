'use client';

import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

import EngagementCta from "@/components/marketing/EngagementCta";
import SectionIntro from "@/components/marketing/SectionIntro";

const teamTheme = {
  reports: {
    label: "Integrated Reports",
    accent: "text-[var(--gold)]",
    border: "border-[var(--gold)]/30",
    glow: "hover:shadow-[0_0_50px_rgba(212,166,74,0.12)]",
    tint: "from-[var(--gold)]/8",
  },
  red: {
    label: "Red Team",
    accent: "text-[#ff6f7f]",
    border: "border-[#ff6f7f]/28",
    glow: "hover:shadow-[0_0_50px_rgba(255,111,127,0.12)]",
    tint: "from-[#ff6f7f]/8",
  },
  blue: {
    label: "Blue Team",
    accent: "text-[#64d6ff]",
    border: "border-[#64d6ff]/28",
    glow: "hover:shadow-[0_0_50px_rgba(100,214,255,0.12)]",
    tint: "from-[#64d6ff]/8",
  },
  green: {
    label: "Green Team",
    accent: "text-[#7dcf93]",
    border: "border-[#7dcf93]/28",
    glow: "hover:shadow-[0_0_50px_rgba(125,207,147,0.12)]",
    tint: "from-[#7dcf93]/8",
  },
  purple: {
    label: "Purple Team",
    accent: "text-[#c995ff]",
    border: "border-[#c995ff]/28",
    glow: "hover:shadow-[0_0_50px_rgba(201,149,255,0.12)]",
    tint: "from-[#c995ff]/8",
  },
  va: {
    label: "Vulnerability Assessment",
    accent: "text-[var(--gold)]",
    border: "border-[var(--gold)]/30",
    glow: "hover:shadow-[0_0_50px_rgba(212,166,74,0.12)]",
    tint: "from-[var(--gold)]/8",
  },
};

export default function ToolLayout({ team = "green", toolList = [] }) {
  const currentTheme = teamTheme[team] ?? teamTheme.green;

  return (
    <main className="site-page-shell bg-[#050505] text-white">
      <section className="border-b border-white/6">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionIntro
            eyebrow={currentTheme.label}
            title={`${currentTheme.label} toolkit`}
            description="Launch existing workflows without changing any API wiring, route structure, or business logic."
            className="mb-12"
          />

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {toolList.map((tool) => (
              <article
                key={`${team}-${tool.slug}-${tool.name}`}
                className={`group flex min-h-64 flex-col justify-between border bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.02))] p-5 transition ${currentTheme.border} ${currentTheme.glow}`}
              >
                <div className="space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="eyebrow mb-3">{currentTheme.label}</p>
                      <h3 className="font-mono text-2xl font-semibold text-white">
                        {tool.name}
                      </h3>
                    </div>
                    <span className={`rounded-full border px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] ${currentTheme.border} ${currentTheme.accent}`}>
                      {tool.status ?? "active"}
                    </span>
                  </div>

                  <p className="text-sm leading-7 text-[var(--muted)]">{tool.description}</p>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <Link
                    href={`/tools/${tool.slug}`}
                    className={`inline-flex items-center gap-2 font-mono text-sm transition ${currentTheme.accent} hover:text-white`}
                  >
                    <span>{tool.buttonLabel}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link href={`/tools/${tool.slug}`} aria-label={`Open ${tool.name}`} className="text-white/30 transition hover:text-white">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
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
