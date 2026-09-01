'use client';

import Link from "next/link";
import { ArrowRight, ExternalLink, Lock, ShieldCheck } from "lucide-react";

import EngagementCta from "@/components/marketing/EngagementCta";
import SectionIntro from "@/components/marketing/SectionIntro";
import { usePlan } from "@/context/PlanContext";

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
  const { canAccessTool, loading: planLoading } = usePlan();

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
            {toolList.map((tool) => {
              const isLocked = !canAccessTool(tool.slug);

              return (
                <article
                  key={`${team}-${tool.slug}-${tool.name}`}
                  className={`group flex min-h-64 flex-col justify-between border p-5 transition ${
                    isLocked
                      ? "border-amber-500/30 bg-[linear-gradient(180deg,rgba(245,158,11,0.06),rgba(255,255,255,0.02))] hover:border-amber-400 hover:shadow-[0_0_50px_rgba(245,158,11,0.2)]"
                      : `bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.02))] ${currentTheme.border} ${currentTheme.glow}`
                  }`}
                >
                  <div className="space-y-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="eyebrow mb-3">{currentTheme.label}</p>
                        <h3 className="font-mono text-2xl font-semibold text-white">
                          {tool.name}
                        </h3>
                      </div>
                      {isLocked ? (
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 border border-amber-300 px-3 py-1 font-mono text-[0.65rem] font-bold uppercase tracking-wider text-black shadow-[0_0_15px_rgba(251,191,36,0.45)] flex-shrink-0"
                          title="This tool is not included in your current plan. Click to view upgrade options."
                        >
                          <Lock className="h-3.5 w-3.5 text-black stroke-[2.5]" />
                          <span className="text-black font-extrabold">Locked</span>
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400 border border-emerald-300 px-3 py-1 font-mono text-[0.65rem] font-bold uppercase tracking-wider text-black shadow-[0_0_15px_rgba(52,211,153,0.45)] flex-shrink-0"
                        >
                          <ShieldCheck className="h-3.5 w-3.5 text-black stroke-[2.5]" />
                          <span className="text-black font-extrabold">Available</span>
                        </span>
                      )}
                    </div>

                    <p className="text-sm leading-7 text-[var(--muted)]">{tool.description}</p>
                  </div>

                  <div className="mt-8 flex items-center justify-between">
                    <Link
                      href={`/tools/${tool.slug}`}
                      className={`inline-flex items-center gap-2 font-mono text-sm font-semibold transition ${
                        isLocked
                          ? "text-amber-400 hover:text-amber-300"
                          : `${currentTheme.accent} hover:text-white`
                      }`}
                    >
                      {isLocked && <Lock className="h-3.5 w-3.5 text-black bg-amber-400 rounded p-0.5" />}
                      <span>{isLocked ? "Upgrade to Access" : tool.buttonLabel}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>

                    <Link
                      href={`/tools/${tool.slug}`}
                      aria-label={`Open ${tool.name}`}
                      className={`transition ${isLocked ? "text-amber-400/60 hover:text-amber-300" : "text-white/30 hover:text-white"}`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <EngagementCta />
    </main>
  );
}
