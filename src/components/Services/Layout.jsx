import EngagementCta from "@/components/marketing/EngagementCta";
import SectionIntro from "@/components/marketing/SectionIntro";
import { 
  ShieldAlert, 
  Layers, 
  Code, 
  FileCheck, 
  Wrench, 
  Activity, 
  ChevronRight, 
  ShieldCheck,
  Globe
} from "lucide-react";

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

          {keyAspectsData?.steps ? (
            <div className="relative mt-8">
              {/* Desktop Horizontal Line Indicator track */}
              <div className="hidden lg:block absolute top-[44px] left-8 right-8 h-0.5 bg-gradient-to-r from-[var(--gold)]/20 via-white/5 to-[var(--gold)]/20 z-0" />
              
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-6 relative z-10">
                {keyAspectsData.steps.map((step, index) => {
                  const IconComponent = {
                    ShieldAlert: ShieldAlert,
                    Layers: Layers,
                    Code: Code,
                    FileCheck: FileCheck,
                    Wrench: Wrench,
                    Activity: Activity,
                    Globe: Globe
                  }[step.icon] || ShieldCheck;

                  return (
                    <div key={index} className="group relative">
                      {/* Step Progress Container Card */}
                      <div className="surface-panel p-6 rounded-2xl border border-white/5 bg-black/40 hover:bg-black/60 transition duration-300 flex flex-col justify-between h-full hover:border-[var(--gold)]/30 hover:shadow-[0_0_24px_rgba(212,166,74,0.06)]">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <span className="font-mono text-[10px] text-[var(--gold)] font-bold tracking-widest">
                              STEP {String(index + 1).padStart(2, "0")}
                            </span>
                            <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-[var(--gold)]/20 transition duration-300">
                              <IconComponent className="w-4 h-4 text-[var(--gold)] group-hover:scale-110 transition duration-300" />
                            </div>
                          </div>
                          <h3 className="font-mono text-base font-bold text-white mb-2 leading-snug">
                            {step.title}
                          </h3>
                          <p className="text-xs text-[var(--muted)] leading-relaxed">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                      
                      {/* Desktop direction arrow */}
                      {index < keyAspectsData.steps.length - 1 && (
                        <div className="hidden lg:flex absolute top-[44px] -right-4 -translate-y-1/2 items-center justify-center text-white/15 group-hover:text-[var(--gold)]/40 transition z-20">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="surface-panel overflow-hidden p-4 sm:p-6">
              <img
                src={keyImage}
                alt={keyAspectsData?.title || `${heroData?.title ?? "Service"} visual`}
                className="w-full rounded-sm object-contain"
              />
            </div>
          )}
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
