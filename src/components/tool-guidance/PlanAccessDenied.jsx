"use client";

import Link from "next/link";
import { ShieldOff, ArrowRight, Lock } from "lucide-react";
import { usePlan } from "@/context/PlanContext";
import { useAuth } from "@/context/AuthContext";

/**
 * Shown when a user tries to access a tool that is not included in
 * their current plan — either via the tools listing or a direct URL.
 */
export default function PlanAccessDenied({ toolName, toolSlug }) {
  const { userPlan } = usePlan();
  const { token } = useAuth();

  const displayTool = toolName || (toolSlug ? toolSlug.replace(/-/g, " ") : "This tool");

  return (
    <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Icon badge */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ff6f7f]/20 to-[#c995ff]/10 border border-white/8 flex items-center justify-center">
              <Lock className="w-10 h-10 text-[#ff6f7f]" />
            </div>
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-full border border-[#ff6f7f]/20 animate-ping" />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#ff6f7f] mb-4">
            Access Restricted
          </p>
          <h1 className="font-mono text-3xl font-semibold text-white mb-4 capitalize">
            {displayTool}
          </h1>
          <p className="text-sm leading-7 text-white/50 max-w-sm mx-auto">
            {token ? (
              <>
                <span className="text-white/70 font-medium capitalize">{displayTool}</span>
                {" "}is not included in your{" "}
                <span className="text-[var(--gold)] font-mono">{userPlan || "current"}</span>
                {" "}plan. Upgrade your subscription to unlock this tool.
              </>
            ) : (
              <>
                You must be logged in to use this tool. Please sign in to continue.
              </>
            )}
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-white/6 mb-8" />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {token ? (
            <>
              <Link
                href="/subscription"
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-[var(--gold)] bg-[var(--gold)] px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-black transition hover:bg-[var(--gold)]/90 hover:shadow-[0_0_24px_rgba(212,166,74,0.3)]"
              >
                <ShieldOff className="w-4 h-4" />
                <span>Upgrade Plan</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/tools"
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-white/10 bg-white/[0.03] px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-white/60 transition hover:border-white/20 hover:text-white"
              >
                ← Back to Tools
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/gain-access"
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-[var(--gold)] bg-[var(--gold)] px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-black transition hover:bg-[var(--gold)]/90 hover:shadow-[0_0_24px_rgba(212,166,74,0.3)]"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/tools"
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-white/10 bg-white/[0.03] px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-white/60 transition hover:border-white/20 hover:text-white"
              >
                ← Browse Tools
              </Link>
            </>
          )}
        </div>

        {/* Plan info hint */}
        {token && userPlan && (
          <p className="mt-8 text-center font-mono text-[0.68rem] text-white/25 uppercase tracking-[0.2em]">
            Current plan: {userPlan}
          </p>
        )}
      </div>
    </main>
  );
}
