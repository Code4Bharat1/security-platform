export default function SectionIntro({
  eyebrow,
  title,
  description,
  align = "left",
  accentWords = [],
  className = "",
}) {
  const alignment = align === "center" ? "text-center items-center" : "text-left items-start";

  const renderTitle = () => {
    if (!accentWords.length) {
      return title;
    }

    return title.split(/(\s+)/).map((part, index) => {
      const normalized = part.toLowerCase().replace(/[^a-z0-9]/g, "");
      const isAccent = accentWords.some((word) => word.toLowerCase() === normalized);

      return (
        <span key={`${part}-${index}`} className={isAccent ? "text-[var(--gold)]" : ""}>
          {part}
        </span>
      );
    });
  };

  return (
    <div className={`flex flex-col gap-4 ${alignment} ${className}`}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 className="mono-heading max-w-5xl text-balance text-4xl leading-[0.95] text-white sm:text-5xl lg:text-7xl">
        {renderTitle()}
      </h2>
      {description ? (
        <p className="max-w-3xl text-pretty text-base leading-8 text-[var(--muted)] sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
