"use client";
import { ShieldCheck } from "lucide-react";
import React, { useState } from "react";

export default function MdrMonitor() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const handleMonitor = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setData(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_API_URL}/mdr-monitor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const json = await res.json();
      setData(json);
    } catch (err) {
      setData({ summary: "❌ Failed to connect to MDR Monitor server." });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center pt-20 px-4">
  {/* Row with image and text */}
  <div className="flex items-center gap-4 mb-4 w-full justify-start lg:px-80 mt-15">

  <img
    src="/BlueTeam/MDR.png"
    alt="Reverse DNS"
    className="w-30 h-30 rounded-full border-4 border-blue-500"
  />
  <div className="text-left">
    <h1 className="text-3xl font-bold text-white">MDR Monitor</h1>
    <p className="text-white mt-2">
      Monitors and responds to real-time security threats.
    </p>
  </div>
</div>


      <div className="bg-black shadow-lg rounded-xl p-6 w-full max-w-4xl border border-white px-10 py-10">
        <input
          type="text"
          placeholder="🔗 Enter website URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value.trim())}         className="w-full px-4 py-3 mb-4 border border-blue-500 rounded-md text-white"
        />

        <button
          onClick={handleMonitor}
          disabled={loading || !url}
          className={`w-full py-3 rounded-md text-white font-semibold transition ${
            loading
              ? "bg-blue-500 cursor-not-allowed"
              : "bg-blue-700 "
          }`}
        >
          {loading ? "Monitoring..." : "Start Monitoring"}
        </button>

        {data && (
          <div className="mt-6">
            <p className="text-lg font-bold text-green-700">{data.summary}</p>
            {data.results && (
              <ul className="mt-3 list-disc list-inside text-gray-700 text-left">
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
