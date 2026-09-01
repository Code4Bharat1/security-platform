import { Suspense } from "react";
import ToolRouteGuidanceGate from "@/components/tool-guidance/ToolRouteGuidanceGate";

export default function ToolsLayout({ children }) {
  return (
    <div className="tools-route-family">
      <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
        <ToolRouteGuidanceGate>{children}</ToolRouteGuidanceGate>
      </Suspense>
    </div>
  );
}
