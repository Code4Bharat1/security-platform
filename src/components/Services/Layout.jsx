import EngagementCta from "@/components/marketing/EngagementCta";
import SectionIntro from "@/components/marketing/SectionIntro";

export default function ServicesLayout({
  heroData,
  methodologyData,
  keyAspectsData,
  methodologyLayout = "default",
}) {
  const metricOne = `${String(methodologyData?.length ?? 0).padStart(2, "0")} modules`;
  const metricTwo = methodologyLayout === "default" ? "Consultant-led" : methodologyLayout;
  const keyImage = keyAspectsData?.image || keyAspectsData?.imgPath || "/Services/CS1.png";

  return (
    <main className="site-page-shell bg-[#050505] text-white">
      <section className="border-b border-white/6">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:px-8">
          <div className="space-y-8">
            <SectionIntro
              eyebrow="Service profile"
              title={heroData?.title ?? "Security Service"}
              description={heroData?.desc ?? ""}
            />

            <div className="grid gap-px overflow-hidden border border-white/8 bg-white/8 sm:grid-cols-2">
              <MetricCard value={metricOne} label="Delivery modules" />
              <MetricCard value={metricTwo} label="Operating model" />
            </div>
          </div>

          <div className="surface-panel p-8">
            <p className="eyebrow mb-6">Engagement Highlights</p>
            <div className="space-y-5">
              {(methodologyData ?? []).slice(0, 3).map((item, index) => (
                <div key={`${item.title}-${index}`} className="border-b border-white/6 pb-5 last:border-b-0 last:pb-0">
                  <p className="font-mono text-sm uppercase tracking-[0.22em] text-[var(--gold)]">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-3 font-mono text-xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/6">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionIntro
            eyebrow="How we execute"
            title={`${heroData?.title ?? "This service"} delivery model`}
            description="Each workstream is evidence-driven, consultant-led, and structured to land in engineering reality rather than slideware."
            className="mb-12"
          />

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {(methodologyData ?? []).map((item, index) => {
              const imagePath = item.imagePath || item.image;

              return (
                <article key={`${item.title}-${index}`} className="surface-panel p-6">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <span className="inline-flex h-10 w-10 items-center justify-center border border-[var(--gold)]/20 font-mono text-xs text-[var(--gold)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {imagePath ? (
                      <img
                        src={imagePath}
                        alt={item.title}
                        className="h-12 w-12 object-contain opacity-80"
                      />
                    ) : null}
                  </div>
                  <h3 className="font-mono text-2xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{item.desc}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-white/6">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionIntro
            eyebrow={keyAspectsData?.desc || "Reference"}
            title={keyAspectsData?.title || `${heroData?.title ?? "Service"} process`}
            className="mb-10"
          />

          <div className="surface-panel overflow-hidden p-4 sm:p-6">
            <img
              src={keyImage}
              alt={keyAspectsData?.title || `${heroData?.title ?? "Service"} visual`}
              className="w-full rounded-sm object-contain"
            />
          </div>
        </div>
      </section>

      <EngagementCta />
    </main>
  );
}

function MetricCard({ value, label }) {
  return (
    <div className="bg-[#0b0b0c] px-8 py-10">
      <p className="font-mono text-4xl font-semibold text-[var(--gold)]">{value}</p>
      <p className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-white/28">
        {label}
      </p>
    </div>
  );
}
