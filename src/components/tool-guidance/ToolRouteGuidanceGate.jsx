"use client";

import { usePathname } from "next/navigation";

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
const slugBase = (slug) => slug.split("?")[0];

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
  const base = slugBase(slug);
  const found = ALL_CATALOG_TOOLS.find((t) => slugBase(t.slug) === base);
  return found ? found.name : null;
}

export default function ToolRouteGuidanceGate({ children }) {
  const pathname = usePathname();
  const { canAccessTool, loading: planLoading } = usePlan();
  const { loading: authLoading } = useAuth();

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

  // Access check — renders lock screen if the tool is not in the user's plan
  if (!canAccessTool(toolSlug)) {
    const toolName = getToolName(toolSlug);
    return <PlanAccessDenied toolName={toolName} toolSlug={toolSlug} />;
  }

  return children;
}
