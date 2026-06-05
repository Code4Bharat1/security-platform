"use client";
import React, { useState } from "react";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";

export default function MdrMonitor() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const protectedAction = useProtectedAction();

  const handleMonitor = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setData(null);

    await protectedAction(async (userToken) => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/mdr-monitor`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userToken}`,
            },
            body: JSON.stringify({ url }),
          }
        );

        const json = await res.json();
        setData(json);
      } catch (err) {
        setData({ summary: "Failed to connect to MDR Monitor server." });
      }

      setLoading(false);
    });
  };

  return (
    <div className="tool-detail-page flex min-h-screen flex-col items-center pt-20 px-4">
      <div className="tool-detail-shell mb-4 flex w-full items-center gap-4 justify-start">
        <img
          src="/BlueTeam/MDR.png"
          alt="Reverse DNS"
          className="h-30 w-30 rounded-full border-4 border-[color:var(--gold)]"
        />
        <div className="text-left">
          <h1 className="text-3xl font-bold text-[color:var(--text-heading)]">MDR Monitor</h1>
          <p className="mt-2 text-[color:var(--text-muted)]">
            Monitors and responds to real-time security threats.
          </p>
        </div>
      </div>

      <div className="w-full max-w-4xl rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-card)] px-10 py-10 shadow-[var(--shadow-elevated)]">
        <input
          type="text"
          placeholder="Enter website URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value.trim())}
          className="mb-4 w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-subtle)] px-4 py-3 text-[color:var(--text-body)] placeholder:text-[color:var(--text-muted)]"
        />

        <button
          onClick={handleMonitor}
          disabled={loading || !url}
          className={`w-full rounded-lg border border-[color:var(--gold)] py-3 font-semibold text-[color:var(--text-inverse)] transition ${
            loading
              ? "cursor-not-allowed bg-[color:var(--gold)] opacity-70"
              : "bg-[color:var(--gold)] hover:bg-[color:var(--gold-strong)]"
          }`}
        >
          {loading ? "Monitoring..." : "Start Monitoring"}
        </button>

        {data && (
          <div className="mt-6">
            <p
              className={`text-lg font-bold ${
                data.summary?.includes("Failed") ||
                data.summary?.includes("Unreachable") ||
                data.threatsFound
                  ? "text-[color:var(--danger)]"
                  : "text-[color:var(--success)]"
              }`}
            >
              {data.summary}
            </p>
            {data.results && (
              <ul className="mt-3 list-inside list-disc text-left text-[color:var(--text-body)]">
                {data.results.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
