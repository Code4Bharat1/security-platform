"use client";
import { useState } from "react";

export default function KeywordGenerator() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState([]);

  const handleGenerate = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setKeywords([]);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_API_URL}/keywords/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      setKeywords(data.keywords || []);
    } catch (err) {
      console.error("Keyword generation failed:", err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-4">
      <h1 className="text-xl font-bold text-green-800 mb-2">🔍 Keyword Generator</h1>
      <p className="mb-4 text-gray-600">Extract SEO-friendly keywords from your website URL</p>
      
      <div className="bg-white p-4 rounded shadow max-w-md w-full">
        <input
          type="text"
          placeholder="Enter website URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-3 py-2 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-600"
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !url}
          className={`w-full py-2 rounded text-white ${loading ? "bg-green-400" : "bg-green-700 hover:bg-green-800"}`}>
          {loading ? "Generating..." : "Generate Keywords"}
        </button>
      </div>

      {keywords.length > 0 && (
        <div className="bg-black text-green-400 mt-4 p-4 w-full max-w-md rounded font-mono text-sm">
          <p className="mb-2">✅ Top Keywords:</p>
          <ul className="list-disc list-inside">
            {keywords.map((k, idx) => (
              <li key={idx}>{k}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
