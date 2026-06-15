"use client";

import InlineValidationMessage from "./InlineValidationMessage";

export default function GuidanceTooltip({ tooltip, onClose }) {
  if (!tooltip) return null;

  const viewportHeight =
    typeof window !== "undefined" ? window.innerHeight : 900;
  const viewportWidth =
    typeof window !== "undefined" ? window.innerWidth : 1440;
  const top = Math.min(tooltip.rect.bottom + 10, viewportHeight - 240);
  const left = Math.min(
    Math.max(tooltip.rect.left - 12, 12),
    viewportWidth - 340
  );

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
