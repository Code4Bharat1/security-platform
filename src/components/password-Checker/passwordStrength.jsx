"use client";

import { useEffect, useMemo, useState } from "react";
import GreenLayout from "../GreenTeam/layout";

const API_BASE =
  process.env.NEXT_PUBLIC_PROD_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  ""; // e.g. "http://localhost:5000" when using separate Express
const ENDPOINT = "/password/analyze"; // Express route we created

export default function PasswordCheckerPage() {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [data, setData] = useState(null);
  const [copied, setCopied] = useState(false);

  async function copyPw() {
    if (!pw) return;
    try {
      // Preferred modern API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(pw);
      } else {
        // Fallback for older browsers / http
        const ta = document.createElement("textarea");
        ta.value = pw;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Optional: show a tiny error state
      setCopied(false);
    }
  }
  // analyze as you type (debounced)
  useEffect(() => {
    const t = setTimeout(async () => {
      setErr(null);
      if (pw === "") {
        setData(null);
        return;
      }
      setLoading(true);
      try {
        const r = await fetch(`${API_BASE}${ENDPOINT}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: pw }),
        });
        const json = await r.json();
        if (!r.ok) throw new Error(json?.message || `HTTP ${r.status}`);
        setData(json);
      } catch (e) {
        setErr(e?.message || "Failed to analyze.");
        setData(null);
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => clearTimeout(t);
  }, [pw]);

  const pct = data ? data.score : 0;
  const label = data ? data.label : "—";
  const meterColor = useMemo(() => {
    if (pct < 35) return "bg-red-500";
    if (pct < 60) return "bg-yellow-500";
    if (pct < 80) return "bg-emerald-500";
    return "bg-green-600";
  }, [pct]);

  return (
    <div className="min-h-screen bg-black text-slate-100">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <header>
          <GreenLayout
            heroData={{
              imgPath: "/GreenTeam/password-checker.png",
              title: "Password Strength Checker",
            }}
          />
        </header>

        <section className="rounded-xl border border-white bg-black p-5">
          <div className="flex items-center justify-between gap-3 mb-2">
            <label className="text-sm text-slate-300">Enter password</label>
            <label className="text-xs flex items-center gap-2 text-slate-400">
              <input
                type="checkbox"
                checked={show}
                onChange={(e) => setShow(e.target.checked)}
              />
              Show password
            </label>
          </div>

          {/* <input
                  type={show ? "text" : "password"}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  className="w-full text-center text-2xl font-semibold tracking-wide rounded-lg border border-yellow-400 bg-yellow-100/10 text-yellow-300 placeholder-slate-500 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
                  placeholder="Type here…"
                /> */}
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="w-full text-center text-2xl font-semibold tracking-wide rounded-lg border border-green-400 bg-yellow-100/10 text-yellow-300 placeholder-slate-500 px-3 py-3 pr-28 focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
              placeholder="Type here…"
            />

            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button
                type="button"
                onClick={copyPw}
                disabled={!pw}
                aria-label="Copy password"
                className="px-3 py-1.5 rounded-md border border-slate-700 bg-slate-900 text-slate-200 text-sm hover:bg-slate-800 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Meter */}
          <div className="mt-3">
            <div className="h-2 w-full rounded bg-slate-800 overflow-hidden">
              <div
                className={`h-2 ${meterColor} transition-all`}
                style={{ width: `${Math.max(4, pct)}%` }}
              />
            </div>
            <div className="mt-1 text-sm text-center text-slate-300">
              {label}
            </div>
          </div>

          {/* Criteria */}
          <div className="mt-4 text-sm text-slate-300">
            <span className="mr-2">
              {data?.length ?? 0} characters containing:
            </span>
            <Badge ok={data?.classes?.lower}>Lower case</Badge>
            <Badge ok={data?.classes?.upper}>Upper case</Badge>
            <Badge ok={data?.classes?.number}>Numbers</Badge>
            <Badge ok={data?.classes?.symbol}>Symbols</Badge>
          </div>

          {/* Time to crack */}
          <div className="mt-4">
            <div className="text-xs text-slate-400">
              Time to crack your password:
            </div>
            <div className="text-3xl font-semibold">
              {data?.crackTime?.human ?? "—"}
            </div>
            {data && (
              <div className="text-xs text-slate-500 mt-1">
                (Assuming{" "}
                {data.crackTime.assumptions.guessesPerSecond.toLocaleString()}{" "}
                guesses/sec)
              </div>
            )}
          </div>

          {/* Review / advice */}
          {data?.advice?.length ? (
            <div className="mt-4 text-sm">
              <div className="font-medium mb-1">Review:</div>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                {data.advice.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          ) : pw ? (
            <div className="mt-4 text-sm text-emerald-400">
              Great! Your password looks strong.
            </div>
          ) : null}

          {loading && (
            <div className="mt-3 text-xs text-slate-400">Analyzing…</div>
          )}
          {err && <div className="mt-3 text-sm text-red-400">Error: {err}</div>}
        </section>

        <footer className="text-xs text-slate-500">
          Your passwords are never stored. The strength is computed on the
          server and nothing is logged.
        </footer>
      </div>
    </div>
  );
}

function Badge({ ok, children }) {
  return (
    <span
      className={
        "inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs mr-2 " +
        (ok
          ? "border-emerald-600 bg-emerald-500/10 text-emerald-400"
          : "border-slate-700 bg-slate-800 text-slate-400")
      }
    >
      <span
        className={
          "inline-block w-2 h-2 rounded-full " +
          (ok ? "bg-emerald-500" : "bg-slate-500")
        }
      />
      {children}
    </span>
  );
}
