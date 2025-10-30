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

  const analyzeSEO = async () => {
    if (!url) {
      setError("⚠️ Please enter a valid URL");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    protectedAction(async (userToken) => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/seo/analyze`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userToken}`,
            },
            body: JSON.stringify({ url }),
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
        setError("🚨 Failed to connect with backend!");
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      <GreenLayout
        heroData={{
          imgPath: "/GreenTeam/seo-score.png",
          title: "SEO Score Analyzer",
        }}
      />
      <div className="w-full max-w-3xl bg-black border border-white text-white rounded-2xl shadow-xl p-8 border border-gray-700">
        {/* Input Section */}
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter website URL (e.g. https://example.com)"
            className="flex-1 border border-gray-600 bg-gray-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="flex justify-center mb-6 space-x-4">
          <button
            onClick={analyzeSEO}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition disabled:bg-gray-500"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>
        {/* Error Message */}
        {error && (
          <p className="text-red-400 font-medium mb-4 bg-red-900/40 p-3 rounded-lg">
            {error}
          </p>
        )}

        {/* Loader */}
        {loading && (
          <div className="flex justify-center items-center py-6">
            <div className="w-10 h-10 border-4 border-green-500 border-dashed rounded-full animate-spin"></div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Score Card */}
            <div className="bg-gray-700 rounded-xl p-6 flex flex-col items-center shadow-md">
              <h2 className="text-xl font-semibold mb-2">SEO Score</h2>
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32">
                  <circle
                    className="text-gray-600"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="50"
                    cx="64"
                    cy="64"
                  />
                  <circle
                    className="text-green-400"
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
                <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
                  {result.score || 0}
                </span>
              </div>
            </div>

            {/* Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-700 p-5 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold mb-2">📌 Title</h3>
                <p className="text-gray-300">{result.title || "N/A"}</p>
              </div>
              <div className="bg-gray-700 p-5 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold mb-2">
                  📝 Meta Description
                </h3>
                <p className="text-gray-300">
                  {result.metaDescription || "N/A"}
                </p>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-900/40 p-5 rounded-xl shadow-md border border-green-600">
                <h3 className="text-lg font-semibold mb-3">✅ Strengths</h3>
                <ul className="list-disc pl-5 space-y-1 text-green-300">
                  {result.summary?.strengths?.length > 0 ? (
                    result.summary.strengths.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))
                  ) : (
                    <li>N/A</li>
                  )}
                </ul>
              </div>

              <div className="bg-red-900/40 p-5 rounded-xl shadow-md border border-red-600">
                <h3 className="text-lg font-semibold mb-3">❌ Weaknesses</h3>
                <ul className="list-disc pl-5 space-y-1 text-red-300">
                  {result.summary?.weaknesses?.length > 0 ? (
                    result.summary.weaknesses.map((item, index) => (
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
