"use client";

import { CheckCircle2, Circle } from "lucide-react";

export default function PreScanChecklist({ items = [], fieldStates = {} }) {
  if (!items.length) return null;

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const state = item.fieldKey ? fieldStates[item.fieldKey] : null;
        const complete = item.advisory
          ? false
          : state?.status === "success" || state?.status === "info";

        return (
          <div
            key={item.label}
            className="flex items-start gap-3 rounded-xl border border-white/8 bg-black/20 px-3 py-3"
          >
            {complete ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />
            ) : (
              <Circle className="mt-0.5 h-4 w-4 text-white/30" />
            )}
            <p className="text-sm leading-6 text-white/72">{item.label}</p>
          </div>
        );
      })}
    </div>
  );
}
