"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ExternalLink, Search } from "lucide-react";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import SectionIntro from "@/components/marketing/SectionIntro";
import EngagementCta from "@/components/marketing/EngagementCta";
import { useAuth } from "@/context/AuthContext";

import { toolGroups } from "./catalog";

const API_BASE = (process.env.NEXT_PUBLIC_PROD_API_URL || "http://localhost:5000").replace(/\/$/, "");
const USE_API_PREFIX = !/\/api$/i.test(API_BASE);
const API_URL = `${API_BASE}${USE_API_PREFIX ? "/api" : ""}`;

const badgeTone = {
  active: "bg-[#8b2331]/35 text-[#ff667a] border-[#ff667a]/20",
  passive: "bg-[#0e3e4b]/35 text-[#64d6ff] border-[#64d6ff]/20",
};

export default function PlatformOverview() {
  const [activeGroup, setActiveGroup] = useState("reports");
  const [query, setQuery] = useState("");
  const [planFeaturesMap, setPlanFeaturesMap] = useState(null);
  const [userPlan, setUserPlan] = useState(null);

  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Load the plan features map globally for validation
    fetch(`${API_URL}/subscription/plan-features`)
      .then(res => res.json())
      .then(data => setPlanFeaturesMap(data))
      .catch(err => console.error("Failed to load plan features:", err));
  }, []);

  useEffect(() => {
    // If user is logged in, fetch their current plan
    if (token) {
      fetch(`${API_URL}/subscription/current`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setUserPlan(data.plan || "Free"))
        .catch(err => console.error("Failed to load user plan:", err));
    } else {
      setUserPlan(null);
    }
  }, [token]);

  const handleLaunchClick = (e, tool) => {
    if (!token) return; // if not logged in, let them navigate so it redirects to login
    if (tool.team === 'reports') return; // bypass plan check for reports
    
    if (planFeaturesMap && userPlan) {
      if (userPlan === 'Enterprise') return; // Enterprise bypass
      
      const allowedTools = planFeaturesMap[userPlan] || [];
      const hasAccess = allowedTools.some(t => t.name === tool.name);
      
      if (!hasAccess) {
        e.preventDefault(); // Stop navigation
        toast.error(`"${tool.name}" is not included in your active plan.`);
      }
    }
  };

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

                return (
                  <button
                    key={group.key}
                    type="button"
                    onClick={() => handleGroupChange(group.key)}
                    className={`inline-flex items-center gap-3 rounded-sm border px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] transition cursor-pointer ${isActive
                        ? "border-[var(--gold)] bg-[var(--gold)] text-black"
                        : "border-white/8 bg-white/[0.03] text-white/72 hover:border-[var(--gold)]/40 hover:text-white"
                      }`}
                  >
                    <span>{group.label}</span>
                    <span className={`text-[0.68rem] ${isActive ? "text-black/65" : "text-white/35"}`}>
                      {group.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <label className="relative block w-full max-w-sm">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Search ${currentGroup.label} tools`}
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
                    onClick={(e) => handleLaunchClick(e, tool)}
                    className="inline-flex items-center gap-2 font-mono text-sm text-[var(--gold)] transition hover:text-white"
                  >
                    <span>{tool.buttonLabel}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    href={`/tools/${tool.slug}`}
                    onClick={(e) => handleLaunchClick(e, tool)}
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
