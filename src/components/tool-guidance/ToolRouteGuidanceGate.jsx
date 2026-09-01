"use client";

import { usePathname, useSearchParams } from "next/navigation";

import { usePlan } from "@/context/PlanContext";
import { useAuth } from "@/context/AuthContext";
import PlanAccessDenied from "./PlanAccessDenied";
import {
  redTools,
  blueTools,
  greenTools,
  purpleTools,
  vaTools,
  reportsTools,
} from "@/components/Tool/catalog";

// Tool pages at /tools/<slug> — skip gating for the index and group overview pages
const GROUP_PAGES = new Set([
  "red-team",
  "blue-team",
  "green-team",
  "purple-team",
  "va",
  "reports",
]);

// Strips query-string variants: "report-generator?plan=free" → "report-generator"
const slugBase = (slug) => (slug || "").split("?")[0];

// Build a flat lookup from the tool catalog so we can resolve a display name
// when showing the PlanAccessDenied screen
const ALL_CATALOG_TOOLS = [
  ...redTools,
  ...blueTools,
  ...greenTools,
  ...purpleTools,
  ...vaTools,
  ...reportsTools,
];

function getToolName(slug) {
  const directMatch = ALL_CATALOG_TOOLS.find(
    (t) => t.slug.toLowerCase() === (slug || "").toLowerCase()
  );
  if (directMatch) return directMatch.name;

  const base = slugBase(slug);
  const found = ALL_CATALOG_TOOLS.find((t) => slugBase(t.slug) === base);
  return found ? found.name : null;
}

export default function ToolRouteGuidanceGate({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { canAccessTool, loading: planLoading } = usePlan();
  const { token, loading: authLoading } = useAuth();

  // Extract the tool slug from the path: /tools/<slug>/…
  const segments = pathname.split("/").filter(Boolean);
  // segments[0] === "tools", segments[1] === slug (or undefined for /tools index)
  const toolSlug = segments.length >= 2 && segments[0] === "tools"
    ? segments[1]
    : null;

  // Don't gate the /tools index page or team-overview pages
  if (!toolSlug || GROUP_PAGES.has(toolSlug)) {
    return children;
  }

  // While auth or plan data is loading, show a spinner to avoid flash of content
  if (authLoading || planLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050505]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[color:var(--gold)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-white/30 tracking-wider font-mono uppercase">
            Verifying access…
          </p>
        </div>
      </div>
    );
  }

  const planQuery = searchParams.get("plan");
  const fullSlug = planQuery ? `${toolSlug}?plan=${planQuery}` : toolSlug;

  // Access check — renders lock screen if user is not logged in OR if tool is not in user's plan
  if (!token || !canAccessTool(fullSlug)) {
    const toolName = getToolName(fullSlug);
    return <PlanAccessDenied toolName={toolName} toolSlug={fullSlug} />;
  }

  return children;
}
