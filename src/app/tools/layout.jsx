import ToolRouteGuidanceGate from "@/components/tool-guidance/ToolRouteGuidanceGate";

export default function ToolsLayout({ children }) {
  return (
    <div className="tools-route-family">
      <ToolRouteGuidanceGate>{children}</ToolRouteGuidanceGate>
    </div>
  );
}
