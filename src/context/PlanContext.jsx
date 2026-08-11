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
        console.warn("[PlanContext] Could not load plan features:", err.message || err);
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
   *  • No token               → false  (must log in first)
   *  • Plan data not yet loaded → true  (optimistic — gate shows spinner)
   *  • Enterprise plan        → true   (full bypass)
   *  • Reports tools          → true   (no gating on report-generator)
   *  • Otherwise              → check planFeaturesMap[userPlan]
   */
  const canAccessTool = useCallback(
    (slug) => {
      if (!token) return false;
      if (!planFeaturesMap || !userPlan) return true; // still loading — optimistic
      if (userPlan === "Enterprise") return true;

      const base = slugBase(slug);

      // Reports are always accessible (handled separately)
      if (base === "report-generator") return true;

      const allowedTools = planFeaturesMap[userPlan] || [];
      const catalogTool = ALL_CATALOG_TOOLS.find(
        (t) => slugBase(t.slug) === base
      );
      const catalogName = catalogTool ? catalogTool.name : null;

      // Backend stores tools as { route: "/api/...", name: "..." }
      return allowedTools.some(
        (t) =>
          t.route === `/api/${base}` ||
          t.name === base ||
          (catalogName && t.name === catalogName)
      );
    },
    [token, planFeaturesMap, userPlan]
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
