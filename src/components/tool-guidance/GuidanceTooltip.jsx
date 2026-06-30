"use client";
import { useEffect, useState } from "react";
import InlineValidationMessage from "./InlineValidationMessage";

export default function GuidanceTooltip({ tooltip, onClose }) {
  const [rect, setRect] = useState(tooltip?.rect || null);

  // Re-measure the anchor on every scroll event
  useEffect(() => {
    if (!tooltip?.anchorEl) return undefined;

    const handleScroll = () => {
      const newRect = tooltip.anchorEl.getBoundingClientRect();
      setRect(newRect);
    };

    window.addEventListener("scroll", handleScroll, true);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [tooltip?.anchorEl]);

  // Sync rect whenever the tooltip prop itself changes
  useEffect(() => {
    if (tooltip?.rect) {
      setRect(tooltip.rect);
    } else {
      setRect(null);
    }
  }, [tooltip]);

  if (!tooltip || !rect) return null;

  const viewportHeight =
    typeof window !== "undefined" ? window.innerHeight : 900;
  const viewportWidth =
    typeof window !== "undefined" ? window.innerWidth : 1440;

  // If the anchor has scrolled completely out of the visible viewport
  // (above the top edge or below the bottom edge), hide the popover entirely
  // instead of clamping it to an arbitrary screen position.
  const anchorVisible = rect.bottom > 0 && rect.top < viewportHeight;
  if (!anchorVisible) return null;

  // Position the popover just below the anchor, clamped inside the viewport.
  // Allow going above the anchor if it is too close to the bottom edge.
  const POPOVER_HEIGHT = 240;
  const POPOVER_WIDTH  = 320;
  const GAP            = 10;

  let top  = rect.bottom + GAP;
  let left = Math.max(rect.left - 12, 12);

  // Flip upward if there isn't enough space below
  if (top + POPOVER_HEIGHT > viewportHeight - 8) {
    top = Math.max(rect.top - POPOVER_HEIGHT - GAP, 8);
  }

  // Keep within horizontal viewport bounds
  if (left + POPOVER_WIDTH > viewportWidth - 8) {
    left = viewportWidth - POPOVER_WIDTH - 8;
  }

  return (
    <>
      <button
        type="button"
        onClick={onClose}
        className="fixed inset-0 z-40 cursor-default bg-transparent"
        aria-label="Close guidance tooltip"
      />
      <div
        className="fixed z-50 w-[320px] rounded-2xl border border-white/10 bg-[#090909] p-4 shadow-[0_20px_40px_rgba(0,0,0,0.55)]"
        style={{ top, left }}
      >
        <p className="eyebrow mb-2">Field Help</p>
        <h4 className="font-mono text-lg font-semibold text-white">
          {tooltip.field.label}
        </h4>
        <p className="mt-2 text-sm leading-7 text-white/70">
          {tooltip.field.description}
        </p>
        {tooltip.field.examples?.length ? (
          <div className="mt-3 rounded-xl border border-white/8 bg-black/25 p-3">
            <p className="text-[0.7rem] uppercase tracking-[0.16em] text-white/45">
              Example
            </p>
            <code className="mt-2 block break-all text-sm text-white">
              {tooltip.field.examples[0]}
            </code>
          </div>
        ) : null}
        <div className="mt-3">
          <InlineValidationMessage {...tooltip.validation} />
        </div>
      </div>
    </>
  );
}
