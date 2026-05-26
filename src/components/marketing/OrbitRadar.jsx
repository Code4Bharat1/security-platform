const rings = [
  { inset: "8%", opacity: 0.18 },
  { inset: "16%", opacity: 0.14 },
  { inset: "24%", opacity: 0.12 },
  { inset: "32%", opacity: 0.1 },
  { inset: "40%", opacity: 0.08 },
];

const blips = [
  { top: "17%", left: "57%", delay: "0s", size: "sm" },
  { top: "26%", left: "74%", delay: "0.35s", size: "lg" },
  { top: "34%", left: "42%", delay: "0.7s", size: "sm" },
  { top: "38%", left: "26%", delay: "1.05s", size: "sm" },
  { top: "42%", left: "82%", delay: "1.4s", size: "lg" },
  { top: "55%", left: "18%", delay: "1.75s", size: "sm" },
  { top: "61%", left: "66%", delay: "2.1s", size: "sm" },
  { top: "68%", left: "52%", delay: "2.45s", size: "lg" },
  { top: "73%", left: "45%", delay: "2.8s", size: "sm" },
  { top: "79%", left: "71%", delay: "3.15s", size: "sm" },
];

const particles = [
  { top: "14%", left: "21%", delay: "0.4s" },
  { top: "23%", left: "63%", delay: "1.1s" },
  { top: "31%", left: "84%", delay: "2.4s" },
  { top: "46%", left: "12%", delay: "1.9s" },
  { top: "52%", left: "78%", delay: "0.8s" },
  { top: "63%", left: "28%", delay: "2.7s" },
  { top: "72%", left: "59%", delay: "1.6s" },
  { top: "84%", left: "37%", delay: "3.2s" },
];

const orbitTracks = [
  { inset: "18%", duration: "14s", delay: "0s" },
  { inset: "28%", duration: "11s", delay: "-2s" },
  { inset: "38%", duration: "8.5s", delay: "-1s" },
];

export default function OrbitRadar() {
  return (
    <div className="radar-shell">
      <div className="radar-frame" />
      <div className="radar-core-glow" />

      {rings.map((ring) => (
        <div
          key={ring.inset}
          className="radar-ring"
          style={{ inset: ring.inset, opacity: ring.opacity }}
        />
      ))}

      <div className="radar-axis radar-axis-vertical" />
      <div className="radar-axis radar-axis-horizontal" />
      <div className="radar-sweep" />

      {orbitTracks.map((orbit, index) => (
        <div
          key={`${orbit.inset}-${index}`}
          className="radar-orbit"
          style={{
            inset: orbit.inset,
            ["--orbit-duration"]: orbit.duration,
            ["--orbit-delay"]: orbit.delay,
          }}
        >
          <span className="radar-orbit-node" />
        </div>
      ))}

      <div className="absolute inset-0">
        {blips.map((point, index) => (
          <span
            key={`${point.top}-${point.left}-${index}`}
            className={`radar-dot radar-dot-${point.size}`}
            style={{
              top: point.top,
              left: point.left,
              animationDelay: point.delay,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0">
        {particles.map((point, index) => (
          <span
            key={`${point.top}-${point.left}-particle-${index}`}
            className="radar-particle"
            style={{
              top: point.top,
              left: point.left,
              animationDelay: point.delay,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="eyebrow mb-3">Protected Asset Value</p>
        <div className="font-mono text-4xl font-semibold text-[var(--gold)] drop-shadow-[0_0_24px_rgba(212,166,74,0.35)] sm:text-6xl">
          $4.2T+
        </div>
        <p className="mt-3 max-w-[14rem] text-[0.62rem] uppercase tracking-[0.35em] text-white/42 sm:text-[0.72rem]">
          Assets under active monitoring
        </p>
      </div>

      <div className="radar-label radar-label-tl">
        <span className="text-emerald-300/70">Live telemetry</span>
        <span>global mesh // active</span>
      </div>
      <div className="radar-label radar-label-tr">
        <span className="text-[var(--gold)]/75">Threat level // 100</span>
        <span>scan sweep // sync</span>
      </div>
      <div className="radar-label radar-label-bl">
        <span>signatures // 245.1k</span>
        <span>io observables</span>
      </div>
      <div className="radar-label radar-label-br">
        <span>nodes // 4,129</span>
        <span>uptime // 99.998%</span>
      </div>
    </div>
  );
}
