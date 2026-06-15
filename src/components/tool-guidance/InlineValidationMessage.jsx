"use client";

const STATUS_STYLES = {
  idle: "text-white/40",
  info: "text-sky-200",
  success: "text-emerald-200",
  warning: "text-amber-200",
  error: "text-rose-200",
};

export default function InlineValidationMessage({ status = "info", message, fixHint, example }) {
  if (!message && !fixHint && !example) return null;

  return (
    <div className={`space-y-1 text-xs leading-6 ${STATUS_STYLES[status] || STATUS_STYLES.info}`}>
      {message ? <p>{message}</p> : null}
      {fixHint ? <p className="text-white/60">{fixHint}</p> : null}
      {example ? (
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-white/38">
          Example: {example}
        </p>
      ) : null}
    </div>
  );
}
