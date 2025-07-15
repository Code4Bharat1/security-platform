"use client";
import { useState } from "react";

export default function AISecurityHeaders() {
  const [context, setContext] = useState("");
  const [headers, setHeaders] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSuggest = async () => {
    if (!context) return;
    setLoading(true);
    setHeaders("");

    try {
      const res = await fetch("https://zypher.code4bharat.com//api/aiheaders/suggest-headers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context }),
      });

      const data = await res.json();
      setHeaders(data.headers || "No output received.");
    } catch (err) {
      setHeaders("Error generating headers.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 w-full max-w-3xl mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">🛡️ AI-Suggested Security Headers</h2>

      <textarea
        placeholder="Describe your website or stack (e.g., Express API with React frontend)"
        className="border p-2 rounded w-full mb-4 h-28"
        value={context}
        onChange={(e) => setContext(e.target.value)}
      />

      <button
        onClick={handleSuggest}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Generating..." : "Suggest Headers"}
      </button>

      {headers && (
    <div className="text-gray-500 italic">
    ⏳ AI is generating recommended headers...
  </div>
      )}
    </div>
  );
}
