"use client";
import { useState } from "react";
import axios from "axios";

export default function WebsiteOptimizationTool() {
  const [url, setUrl] = useState("");
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    const trimmedUrl = url.trim();

    if (!trimmedUrl || !trimmedUrl.startsWith("http")) {
      setError("❌ Please enter a valid URL that starts with http or https.");
      setInfo("");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setInfo("");

      console.log("📡 Sending URL to backend:", trimmedUrl);

      const response = await axios.post(`${process.env.NEXT_PUBLIC_PROD_API_URL}/website-optimization`, {
        url: trimmedUrl,
      });

      setInfo(response.data.message);
    } catch (err) {
      console.error("❌ Error during scan:", err);
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-xl mx-auto p-6 shadow-lg rounded-lg bg-white">
        <img src="/tools/card-images/optimization.png" alt="verify" className="w-16 h-20 mb-4 mt-7" />
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">
          🌐 Website Optimization Tool
        </h1>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value.trim())}         placeholder="Enter website URL (e.g. https://example.com)"
          className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <button
          onClick={handleScan}
          disabled={loading}
          className="w-full py-3 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition duration-300 disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>

        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
        {info && (
          <pre className="mt-4 p-4 bg-gray-100 border border-gray-300 rounded text-sm whitespace-pre-wrap">
            {info}
          </pre>
        )}
      </div>
    </div>
  );
}
