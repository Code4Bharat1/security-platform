"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";

import SecurityToolGuidanceFrame from "./SecurityToolGuidanceFrame";
import { isSecurityToolGuided } from "@/lib/tool-guidance/registry";

export default function ToolRouteGuidanceGate({ children }) {
  return children;
}
