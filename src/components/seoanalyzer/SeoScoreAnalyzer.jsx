"use client";

import React, { useState } from "react";
import GreenLayout from "../GreenTeam/layout";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";

export default function SeoScoreAnalyzer() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const protectedAction = useProtectedAction();

  const strengths =
    result?.summary?.strengths || result?.strengths || [];
  const weaknesses =
    result?.summary?.weaknesses || result?.issues || [];
  const metaDescription =
    result?.metaDescription || result?.description || "N/A";

  const analyzeSEO = async () => {
    if (!url.trim()) {
      setError("Please enter a valid URL");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    let requestStarted = false;
    await protectedAction(async (userToken) => {
      requestStarted = true;
      try {
        const normalizedUrl = /^https?:\/\//i.test(url.trim())
          ? url.trim()
          : `https://${url.trim()}`;
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/seo/analyze`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userToken}`,
            },
            body: JSON.stringify({ url: normalizedUrl }),
          }
        );

        const data = await res.json();

        if (res.ok) {
          setResult(data);
        } else {
          setError(data.message || "Something went wrong!");
        }
      } catch (err) {
        console.log(err);
        setError("Failed to connect with backend!");
      } finally {
        setLoading(false);
      }
    });
    if (!requestStarted) {
      setLoading(false);
    }
  };

  return (
    <div className="tool-detail-page flex min-h-screen flex-col items-center justify-center p-6">
      <GreenLayout
        heroData={{
          imgPath: "/GreenTeam/seo-score.png",
          title: "SEO Score Analyzer",
        }}
      />
      <div className="w-full max-w-3xl rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-card)] p-8 text-[color:var(--text-body)] shadow-[var(--shadow-elevated)]">
        <div className="mb-6 flex gap-3">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter website URL (e.g. https://example.com)"
            className="flex-1 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-subtle)] p-3 text-[color:var(--text-body)] placeholder:text-[color:var(--text-muted)]"
          />
        </div>
        <div className="mb-6 flex justify-center space-x-4">
          <button
            onClick={analyzeSEO}
            disabled={loading}
            className="rounded-lg border border-[color:var(--gold)] bg-[color:var(--gold)] px-6 py-3 text-[color:var(--text-inverse)] transition hover:bg-[color:var(--gold-strong)] disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-900/20 p-3 font-medium text-[color:var(--danger)]">
            {error}
          </p>
        )}

        {loading && (
          <div className="flex items-center justify-center py-6">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[color:var(--gold)] border-dashed"></div>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <div className="flex flex-col items-center rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-subtle)] p-6 shadow-[var(--shadow-soft)]">
              <h2 className="mb-2 text-xl font-semibold text-[color:var(--text-heading)]">SEO Score</h2>
              <div className="relative h-32 w-32">
                <svg className="h-32 w-32">
                  <circle
                    className="text-[color:var(--border)]"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="50"
                    cx="64"
                    cy="64"
                  />
                  <circle
                    className="text-[color:var(--gold)]"
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 50}
                    strokeDashoffset={
                      2 * Math.PI * 50 -
                      ((result.score || 0) / 100) * (2 * Math.PI * 50)
                    }
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="50"
                    cx="64"
                    cy="64"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-[color:var(--text-heading)]">
                  {result.score || 0}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-subtle)] p-5 shadow-[var(--shadow-soft)]">
                <h3 className="mb-2 text-lg font-semibold text-[color:var(--text-heading)]">Title</h3>
                <p className="text-[color:var(--text-body)]">{result.title || "N/A"}</p>
              </div>
              <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-subtle)] p-5 shadow-[var(--shadow-soft)]">
                <h3 className="mb-2 text-lg font-semibold text-[color:var(--text-heading)]">Meta Description</h3>
                <p className="text-[color:var(--text-body)]">
                  {metaDescription}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-[color:var(--border)] bg-green-900/20 p-5 shadow-[var(--shadow-soft)]">
                <h3 className="mb-3 text-lg font-semibold text-[color:var(--text-heading)]">Strengths</h3>
                <ul className="list-disc space-y-1 pl-5 text-[color:var(--success)]">
                  {strengths.length > 0 ? (
                    strengths.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))
                  ) : (
                    <li>N/A</li>
                  )}
                </ul>
              </div>

              <div className="rounded-xl border border-[color:var(--border)] bg-red-900/20 p-5 shadow-[var(--shadow-soft)]">
                <h3 className="mb-3 text-lg font-semibold text-[color:var(--text-heading)]">Weaknesses</h3>
                <ul className="list-disc space-y-1 pl-5 text-[color:var(--danger)]">
                  {weaknesses.length > 0 ? (
                    weaknesses.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))
                  ) : (
                    <li>N/A</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
