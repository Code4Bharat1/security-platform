import Link from "next/link";

export default function BrandMark({
  href = "/",
  className = "",
  compact = false,
}) {
  const content = (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
        <span className="absolute inset-0 rotate-45 border border-[var(--gold)]/90 bg-[var(--gold)]/6" />
      </span>
      <div className="mono-heading flex items-baseline gap-1 text-sm font-semibold uppercase tracking-[0.18em] text-white">
        <span>Nexcore</span>
        <span className="text-[var(--gold)]">//</span>
        <span>{compact ? "Sec" : "Alliance"}</span>
      </div>
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} aria-label="Nexcore home">
      {content}
    </Link>
  );
}
