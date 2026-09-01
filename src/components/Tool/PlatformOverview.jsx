"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, ExternalLink, Lock, Search, ShieldCheck } from "lucide-react";

import SectionIntro from "@/components/marketing/SectionIntro";
import EngagementCta from "@/components/marketing/EngagementCta";
import { usePlan } from "@/context/PlanContext";

import { toolGroups } from "./catalog";

const badgeTone = {
  active: "bg-[#8b2331]/35 text-[#ff667a] border-[#ff667a]/20",
  passive: "bg-[#0e3e4b]/35 text-[#64d6ff] border-[#64d6ff]/20",
};

export default function PlatformOverview() {
  const [activeGroup, setActiveGroup] = useState("reports");
  const [query, setQuery] = useState("");
  const { canAccessTool, loading: planLoading, userPlan } = usePlan();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") || searchParams.get("team");

  // Sync tab with URL search parameter or URL hash
  useEffect(() => {
    const rawTab = tabParam || (typeof window !== "undefined" ? window.location.hash.replace("#", "") : null);
    if (rawTab) {
      const normalized = rawTab.toLowerCase().trim();
      const matched = toolGroups.find(
        (g) =>
          g.key.toLowerCase() === normalized ||
          g.label.toLowerCase().replace(/\s+/g, "-") === normalized ||
          g.label.toLowerCase().includes(normalized)
      );
      if (matched) {
        setActiveGroup(matched.key);
        localStorage.setItem("platformActiveGroup", matched.key);
        return;
      }
    }

    const savedGroup = localStorage.getItem("platformActiveGroup");
    if (savedGroup) {
      setActiveGroup(savedGroup);
    }
  }, [tabParam]);

  // Listen to hash changes if navigated via anchor links
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "").toLowerCase().trim();
      if (!hash || hash === "platform-tools") return;
      const matched = toolGroups.find(
        (g) =>
          g.key.toLowerCase() === hash ||
          g.label.toLowerCase().replace(/\s+/g, "-") === hash ||
          g.label.toLowerCase().includes(hash)
      );
      if (matched) {
        setActiveGroup(matched.key);
        localStorage.setItem("platformActiveGroup", matched.key);
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
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
      <section id="platform-tools" className="border-b border-white/6 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <SectionIntro
            eyebrow="Security Platform"
            title="One platform for offensive and defensive security."
            description="50+ self-serve workflows across red team, blue team, privacy, posture, and vulnerability assessment — replacing the vendor sprawl your team is juggling today."
            accentWords={["security"]}
          />

          {/* Navigation and Search Container */}
          <div className="mt-14 space-y-6">
            {/* Single line tabs on full/desktop window, smoothly scrollable on smaller screens */}
            <div className="w-full overflow-x-auto pb-1.5 scrollbar-thin">
              <div className="flex items-center justify-between gap-2.5 sm:gap-3 min-w-[760px] xl:min-w-0 w-full">
                {toolGroups.map((group) => {
                  const isActive = group.key === activeGroup;
                  const neonClass = `neon-tab-btn neon-tab-btn-${group.key}-${isActive ? "active" : "inactive"}`;

                  return (
                    <button
                      key={group.key}
                      type="button"
                      onClick={() => handleGroupChange(group.key)}
                      className={`flex-1 inline-flex items-center justify-center gap-2 sm:gap-2.5 rounded-md px-3 sm:px-4 py-2.5 font-mono text-xs uppercase tracking-[0.14em] transition-all duration-300 cursor-pointer whitespace-nowrap text-center ${neonClass}`}
                    >
                      <span className="font-bold">{group.label}</span>
                      <span className={`text-[0.68rem] font-bold ${isActive ? "text-white opacity-100" : "text-white/50"}`}>
                        {group.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search Bar positioned below tabs across the width */}
            <div className="w-full">
              <label htmlFor="platform-tool-search" className="relative block w-full max-w-xl">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <input
                  id="platform-tool-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={`Search ${currentGroup.label} tools...`}
                  aria-label={`Search ${currentGroup.label} tools`}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-11 py-3 text-sm text-white placeholder:text-white/28 focus:border-[var(--gold)]/40 focus:outline-none transition-all font-mono shadow-sm"
                />
              </label>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredTools.map((tool) => {
              const isLocked = !canAccessTool(tool.slug);

              return (
                <article
                  key={`${currentGroup.key}-${tool.slug}-${tool.name}`}
                  className={`group flex min-h-64 flex-col justify-between border bg-white/[0.025] p-5 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] ${
                    isLocked
                      ? "border-amber-500/30 hover:border-amber-400 hover:bg-[linear-gradient(180deg,rgba(245,158,11,0.08),rgba(12,12,13,0.95))]"
                      : "border-white/8 hover:border-[var(--gold)]/35 hover:bg-[linear-gradient(180deg,rgba(212,166,74,0.08),rgba(12,12,13,0.92))]"
                  }`}
                >
                  <div className="space-y-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="eyebrow mb-3">{tool.teamLabel}</p>
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
                    <p className="text-sm leading-7 text-[var(--muted)]">
                      {tool.description}
                    </p>
                  </div>

                  <div className="mt-8 flex items-center justify-between">
                    <Link
                      href={`/tools/${tool.slug}`}
                      className={`inline-flex items-center gap-2 font-mono text-sm font-semibold transition ${
                        isLocked
                          ? "text-amber-400 hover:text-amber-300"
                          : "text-[var(--gold)] hover:text-white"
                      }`}
                    >
                      {isLocked && <Lock className="h-3.5 w-3.5 text-black bg-amber-400 rounded p-0.5" />}
                      <span>{isLocked ? "Upgrade to Access" : tool.buttonLabel}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>

                    <Link
                      href={`/tools/${tool.slug}`}
                      aria-label={`Open ${tool.name}`}
                      className={`transition ${isLocked ? "text-amber-400/60 hover:text-amber-300" : "text-white/30 hover:text-[var(--gold)]"}`}
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
