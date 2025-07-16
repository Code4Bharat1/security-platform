"use client";
import { useState } from "react";
import { BarChart3 } from "lucide-react";

export default function SeoScoreAnalyzer() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("https://zypher-api.code4bharat.com/api/seo/analyze", {
        method: "POST",  
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult({ score: data.score, issues: data.issues });
      } else {
        setResult("❌ Failed to analyze SEO.");
      }
    } catch (err) {
      setResult("❌ Failed to analyze SEO.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-20 px-4">
      <div className="text-center mb-10">
        <BarChart3 className="mx-auto mb-4 text-green-600" size={48} />
        <h1 className="text-3xl font-bold text-green-800">SEO Score Analyzer Tool</h1>
        <p className="text-gray-600 mt-2">
          Analyzes website SEO and provides improvement tips.
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-lg text-center">
        <input
          type="text"
          placeholder="🔗 Enter website URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-800"
        />

        <button
          onClick={handleAnalyze}
          disabled={loading || !url}
          className={`w-full py-3 rounded-md text-white font-semibold transition ${
            loading
              ? "bg-green-400 cursor-not-allowed"
              : "bg-green-700 hover:bg-green-800"
          }`}
        >
          {loading ? "Analyzing..." : "Analyze SEO"}
        </button>

        {result && typeof result === "object" && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-5 text-center shadow-inner">
            <div className="text-4xl font-bold text-green-800 mb-2">
              ✅ {result.score}/100
            </div>
            <div className="text-green-700 text-sm">
              {result.issues.length > 0
                ? `Issues: ${result.issues.join(", ")}`
                : "No major issues found."}
            </div>
          </div>
        )}

        {typeof result === "string" && (
          <div className="mt-6 text-center text-red-600 font-semibold">
            {result}
          </div>
        )}
      </div>
    </div>
  );
}
