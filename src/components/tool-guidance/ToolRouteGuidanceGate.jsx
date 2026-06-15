"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";

import SecurityToolGuidanceFrame from "./SecurityToolGuidanceFrame";
import { isSecurityToolGuided } from "@/lib/tool-guidance/registry";

export default function ToolRouteGuidanceGate({ children }) {
  const pathname = usePathname();

  const toolSlug = useMemo(() => {
    const segments = String(pathname || "")
      .split("/")
      .filter(Boolean);
    return segments[0] === "tools" ? segments[1] || "" : "";
  }, [pathname]);

  if (!toolSlug || !isSecurityToolGuided(toolSlug)) {
    return children;
  }

  return (
    <SecurityToolGuidanceFrame toolSlug={toolSlug}>
      {children}
    </SecurityToolGuidanceFrame>
  );
}
