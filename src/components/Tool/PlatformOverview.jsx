"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ExternalLink, Search } from "lucide-react";

import SectionIntro from "@/components/marketing/SectionIntro";
import EngagementCta from "@/components/marketing/EngagementCta";

import { toolGroups } from "./catalog";

const badgeTone = {
  active: "bg-[#8b2331]/35 text-[#ff667a] border-[#ff667a]/20",
  passive: "bg-[#0e3e4b]/35 text-[#64d6ff] border-[#64d6ff]/20",
};

export default function PlatformOverview() {
  const [activeGroup, setActiveGroup] = useState("reports");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const savedGroup = localStorage.getItem("platformActiveGroup");
    if (savedGroup) {
      setActiveGroup(savedGroup);
    }
  }, []);

  const handleGroupChange = (groupKey) => {
    setActiveGroup(groupKey);
    localStorage.setItem("platformActiveGroup", groupKey);
  };

  const currentGroup = useMemo(
    () => toolGroups.find((group) => group.key === activeGroup) ?? toolGroups[0],
    [activeGroup]
  );

  const filteredTools = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return currentGroup.tools;
    }

    return currentGroup.tools.filter((tool) => {
      const haystack = `${tool.name} ${tool.description}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [currentGroup, query]);

  return (
    <main className="bg-[#050505] text-white">
      <section className="border-b border-white/6">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <SectionIntro
            eyebrow="Security Platform"
            title="One platform for offensive and defensive security."
            description="62+ self-serve workflows across red team, blue team, privacy, posture, and vulnerability assessment — replacing the vendor sprawl your team is juggling today."
            accentWords={["security"]}
          />

          <div className="mt-14 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-3">
              {toolGroups.map((group) => {
                const isActive = group.key === activeGroup;
                const neonClass = `neon-tab-btn neon-tab-btn-${group.key}-${isActive ? "active" : "inactive"}`;

                return (
                  <button
                    key={group.key}
                    type="button"
                    onClick={() => handleGroupChange(group.key)}
                    className={`inline-flex items-center gap-3 rounded-md px-4.5 py-2.5 font-mono text-xs uppercase tracking-[0.18em] transition-all duration-300 cursor-pointer ${neonClass}`}
                  >
                    <span className="font-bold">{group.label}</span>
                    <span className={`text-[0.68rem] font-bold ${isActive ? "text-white opacity-100" : "text-white/50"}`}>
                      {group.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <label htmlFor="platform-tool-search" className="relative block w-full max-w-sm">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                id="platform-tool-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Search ${currentGroup.label} tools`}
                aria-label={`Search ${currentGroup.label} tools`}
                className="w-full border border-white/8 bg-white/[0.03] px-11 py-3 text-sm text-white placeholder:text-white/28 focus:border-[var(--gold)]/40 focus:outline-none"
              />
            </label>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredTools.map((tool) => (
              <article
                key={`${currentGroup.key}-${tool.slug}-${tool.name}`}
                className="group flex min-h-64 flex-col justify-between border border-white/8 bg-white/[0.025] p-5 transition-all duration-300 hover:border-[var(--gold)]/35 hover:bg-[linear-gradient(180deg,rgba(212,166,74,0.08),rgba(12,12,13,0.92))] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
              >
                <div className="space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="eyebrow mb-3">{tool.teamLabel}</p>
                      <h3 className="font-mono text-2xl font-semibold text-white">
                        {tool.name}
                      </h3>
                    </div>
                    {/* <span
                      className={`rounded-full border px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] ${badgeTone[tool.status]}`}
                    >
                      {tool.status}
                    </span> */}
                  </div>
                  <p className="text-sm leading-7 text-[var(--muted)]">
                    {tool.description}
                  </p>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="inline-flex items-center gap-2 font-mono text-sm text-[var(--gold)] transition hover:text-white"
                  >
                    <span>{tool.buttonLabel}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    href={`/tools/${tool.slug}`}
                    aria-label={`Open ${tool.name}`}
                    className="text-white/30 transition hover:text-[var(--gold)]"
                  >
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
