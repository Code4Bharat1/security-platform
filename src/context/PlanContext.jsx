"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "@/context/AuthContext";

const PlanContext = createContext(null);

const API_BASE = (
  process.env.NEXT_PUBLIC_PROD_API_URL || "http://localhost:5000"
).replace(/\/$/, "");
const USE_API_PREFIX = !/\/api$/i.test(API_BASE);
const API_URL = `${API_BASE}${USE_API_PREFIX ? "/api" : ""}`;

// Tools whose slugs use query-string variants but share the same base slug
// e.g. "report-generator?plan=free" → base slug is "report-generator"
const slugBase = (slug) => slug.split("?")[0];

import {
  redTools,
  blueTools,
  greenTools,
  purpleTools,
  vaTools,
  reportsTools,
} from "@/components/Tool/catalog";

const ALL_CATALOG_TOOLS = [
  ...redTools,
  ...blueTools,
  ...greenTools,
  ...purpleTools,
  ...vaTools,
  ...reportsTools,
];

import { toast } from "react-hot-toast";

export function PlanProvider({ children }) {
  const { token, logout } = useAuth();

  /** { Free: [{route, name}, …], Premium: […], … } */
  const [planFeaturesMap, setPlanFeaturesMap] = useState(null);
  /** "Free" | "Premium" | "Pro" | "Enterprise" | null */
  const [userPlan, setUserPlan] = useState(null);
  const [loadingFeatures, setLoadingFeatures] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState(false);

const PLAN_RANKS = {
  free: 0,
  premium: 1,
  pro: 2,
  enterprise: 3,
};
const planRank = (p) => PLAN_RANKS[(p || "free").trim().toLowerCase()] ?? 0;
const normKey = (s) => (s || "").toString().toLowerCase().replace(/[^a-z0-9]/g, "");

const DEFAULT_FREE_ROUTES = [
  "bruteforce",
  "wordpressform",
  "clickjackingtester",
  "portscannerform",
  "csrfchecker",
  "obfuscationchecker",
  "httpscheckerform",
  "metatag",
  "sitemapform",
  "checklink",
  "securecrypt",
  "dependencycheck",
  "systemhardening",
];

const DEFAULT_PREMIUM_ROUTES = [
  ...DEFAULT_FREE_ROUTES,
  "sessionfixationchecker",
  "webrecon",
  "vulnscanner",
  "whoislookup",
  "subdomainenumeration",
  "xsstester",
  "reversednslookup",
  "regexdetector",
  "firewalldashboard",
  "oauthtokeninspector",
  "folderthreatscanner",
  "emailattachmentanalyzer",
  "ipaddressinfofinder",
  "fakeqrcodedetector",
  "seoscoreanalyzertool",
  "activedirectoryscan",
  "credentialpathaudit",
];

const DEFAULT_PRO_ROUTES = [
  ...DEFAULT_PREMIUM_ROUTES,
  "mdrmonitor",
  "jwtsignaturevalidator",
  "cyberfraudidentifier",
  "keywordgenerator",
  "websiteoptimizationtool",
  "passwordchecker",
  "urlshortener",
  "advanceddynamicscan",
  "basicnetworkscan",
];

  // ── Fetch the global plan→tools map (public, no auth needed) ─────────────
  useEffect(() => {
    setLoadingFeatures(true);
    fetch(`${API_URL}/subscription/plan-features`)
      .then((res) => {
        if (!res.ok) throw new Error(`plan-features returned ${res.status}`);
        return res.json();
      })
      .then((data) => setPlanFeaturesMap(data))
      .catch((err) => {
        console.warn("[PlanContext] Could not load plan features, using catalog fallback:", err.message || err);
        const toolsForKeys = (keys) =>
          ALL_CATALOG_TOOLS.filter((t) =>
            keys.includes(normKey(slugBase(t.slug))) || keys.includes(normKey(t.name))
          ).map((t) => ({
            route: `/api/${slugBase(t.slug)}`,
            name: t.name,
          }));

        setPlanFeaturesMap({
          Free: toolsForKeys(DEFAULT_FREE_ROUTES),
          Premium: toolsForKeys(DEFAULT_PREMIUM_ROUTES),
          Pro: toolsForKeys(DEFAULT_PRO_ROUTES),
          Enterprise: ALL_CATALOG_TOOLS.map((t) => ({
            route: `/api/${slugBase(t.slug)}`,
            name: t.name,
          })),
        });
      })
      .finally(() => setLoadingFeatures(false));
  }, []);

  // ── Fetch the authenticated user's current plan ───────────────────────────
  useEffect(() => {
    if (!token) {
      setUserPlan(null);
      return;
    }
    setLoadingPlan(true);
    fetch(`${API_URL}/subscription/current`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          throw new Error("UNAUTHORIZED");
        }
        if (!res.ok) throw new Error(`subscription/current returned ${res.status}`);
        return res.json();
      })
      .then((data) => setUserPlan(data.plan || "Free"))
      .catch((err) => {
        if (err.message === "UNAUTHORIZED") {
          toast.error("Session expired. You have been logged out.");
          if (logout) logout();
        } else {
          console.warn("[PlanContext] Could not load user plan:", err.message || err);
        }
      })
      .finally(() => setLoadingPlan(false));
  }, [token, logout]);

  /**
   * Returns true when the user is allowed to access the tool identified by
   * `slug` (the URL segment after /tools/).
   *
   * Access rules:
   *  • Enterprise plan        → true   (full bypass)
   *  • Reports tools          → tiered rank check (Free < Premium < Pro < Enterprise)
   *  • Otherwise              → check planFeaturesMap[userPlan || "Free"]
   */
  const canAccessTool = useCallback(
    (slug) => {
      const effectivePlan = userPlan || "Free";
      if (effectivePlan.toLowerCase() === "enterprise") return true;

      const base = slugBase(slug);

      // Reports tools tiered gating
      if (base === "report-generator") {
        const queryMatch = slug.match(/[?&]plan=([^&]+)/i);
        const requestedPlan = queryMatch ? queryMatch[1].toLowerCase() : "free";
        return planRank(effectivePlan) >= planRank(requestedPlan);
      }

      const activeMap = planFeaturesMap || {
        Free: DEFAULT_FREE_ROUTES.map((r) => ({ route: `/api/${r}`, name: r })),
        Premium: DEFAULT_PREMIUM_ROUTES.map((r) => ({ route: `/api/${r}`, name: r })),
        Pro: DEFAULT_PRO_ROUTES.map((r) => ({ route: `/api/${r}`, name: r })),
      };

      const matchKey = Object.keys(activeMap).find(
        (k) => k.toLowerCase() === effectivePlan.toLowerCase()
      );
      const allowedTools = matchKey ? activeMap[matchKey] : (activeMap[effectivePlan] || []);

      const catalogTool = ALL_CATALOG_TOOLS.find(
        (t) => slugBase(t.slug) === base || normKey(t.name) === normKey(base)
      );
      const catalogName = catalogTool ? catalogTool.name : null;
      const normBase = normKey(base);
      const normCatalogName = catalogName ? normKey(catalogName) : null;

      return allowedTools.some((t) => {
        const toolRouteClean = normKey((t.route || "").replace(/^\/api\//i, ""));
        const toolNameClean = normKey(t.name);
        return (
          toolRouteClean === normBase ||
          toolNameClean === normBase ||
          (normCatalogName && toolNameClean === normCatalogName) ||
          (catalogTool && toolRouteClean === normKey(slugBase(catalogTool.slug)))
        );
      });
    },
    [planFeaturesMap, userPlan]
  );

  const loading = loadingFeatures || loadingPlan;

  return (
    <PlanContext.Provider
      value={{
        planFeaturesMap,
        userPlan,
        loading,
        canAccessTool,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) {
    throw new Error("usePlan must be used inside <PlanProvider>");
  }
  return ctx;
}
