"use client";
import { ShieldCheck } from "lucide-react";
import React, { useState } from "react";

export default function MdrMonitor() {
  const [monitoring, setMonitoring] = useState(false);
  const [status, setStatus] = useState("");

  const handleStartMonitoring = () => {
    setMonitoring(true);
    setStatus("Monitoring started...");

    // Simulate real-time detection
    setTimeout(() => {
      setStatus("✅ No active threats detected.");
    }, 2000);
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
        <p className="text-gray-700 mb-4">
          Click below to start real-time threat monitoring.
        </p>

        <button
          onClick={handleStartMonitoring}
          disabled={monitoring}
          className={`w-full py-3 rounded-md text-white font-semibold ${
            monitoring
              ? "bg-green-400 cursor-not-allowed"
              : "bg-green-700 hover:bg-green-800"
          }`}
        >
          {monitoring ? "Monitoring..." : "Start Monitoring"}
        </button>

        {status && (
          <div className="mt-6 text-center">
            <p className="text-lg font-bold text-green-700">{status}</p>
          </div>
        )}
      </div>
    </div>
  );
}
