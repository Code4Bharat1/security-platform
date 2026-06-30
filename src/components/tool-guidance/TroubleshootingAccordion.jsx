"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function TroubleshootingAccordion({ items = [] }) {
  const [openIndex, setOpenIndex] = useState(0);

  if (!items.length) return null;

  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        const open = openIndex === index;
        return (
          <article
            key={`${item.title}-${index}`}
            className="overflow-hidden rounded-xl border border-white/8 bg-black/20"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(open ? -1 : index)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
            >
              <span className="text-sm font-medium text-white">{item.title}</span>
              <ChevronDown
                className={`h-4 w-4 text-white/55 transition ${open ? "rotate-180" : ""}`}
              />
            </button>
            {open ? (
              <div className="border-t border-white/8 px-4 py-3 text-sm leading-relaxed text-white/80">
                {item.body}
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
