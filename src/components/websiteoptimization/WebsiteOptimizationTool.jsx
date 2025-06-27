"use client";
import { useState } from "react";
import { GaugeCircle } from "lucide-react";

export default function WebsiteOptimizationTool() {
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);

  const handleScan = async () => {
    if (!url.trim()) return;

    setScanning(true);
    setResult(null);

    try {
      const res = await fetch("/api/website-optimization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      setResult(data.message || "✅ Optimization check complete.");
    } catch (err) {
      setResult("❌ Failed to analyze website.");
    }

    setScanning(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-20 px-4">
      <div className="text-center mb-10">
        <GaugeCircle className="mx-auto mb-4 text-green-600" size={48} />
        <h1 className="text-3xl font-bold text-green-800">Website Optimization Tool</h1>
        <p className="text-gray-600 mt-2">
          Detects deployment issues like unused code, large assets, and slow-loading elements.
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
          onClick={handleScan}
          disabled={scanning || !url}
          className={`w-full py-3 rounded-md text-white font-semibold transition ${
            scanning
              ? "bg-green-400 cursor-not-allowed"
              : "bg-green-700 hover:bg-green-800"
          }`}
        >
          {scanning ? "Checking..." : "Check Optimization"}
        </button>

        {result && (
          <div className="mt-6 text-center text-green-700 font-semibold">
            {result}
          </div>
        )}
      </div>
    </div>
  );
}
