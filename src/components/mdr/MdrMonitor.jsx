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
      const res = await fetch("http://localhost:4180/api/mdr-monitor", {
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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-20 px-4">
      <div className="text-center mb-10">
        <ShieldCheck className="mx-auto mb-4 text-green-600" size={48} />
        <h1 className="text-3xl font-bold text-green-800">MDR Monitor</h1>
        <p className="text-gray-600 mt-2">
          Monitors and responds to real-time security threats.
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-lg">
        <input
          type="text"
          placeholder="🔗 Enter website URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value.trim)}          className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-800"
        />

        <button
          onClick={handleMonitor}
          disabled={loading || !url}
          className={`w-full py-3 rounded-md text-white font-semibold transition ${
            loading
              ? "bg-green-400 cursor-not-allowed"
              : "bg-green-700 hover:bg-green-800"
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
