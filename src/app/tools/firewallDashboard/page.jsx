"use client"; // because we'll use hooks and client fetch

import FirewallDashboard from "@/components/firewallDashboard/firewallDashboard";
import React, { useState } from "react";

export default function DashboardPage() {
  const [url, setUrl] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleScan(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/waf/waf-scan`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        }
      );
      const json = await res.json();

      if (res.ok) {
        console.log("#", json);
        setData(json.dashboard || { message: json.message });
      } else {
        setError(json.message || "Something went wrong");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-6">
      {/* Header Section */}
      <div className="flex items-center gap-4 mb-8">
        {/* Image */}
        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-blue-500">
          <img
            src="/BlueTeam/waf.png" // apna image path yahan do
            alt="Firewall Logo"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Text in multiple rows */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold">WAF Detection Dashboard</h1>
          <p className="text-gray-300 text-sm">
            Analyze websites for Web Application Firewall protection
          </p>
        </div>
      </div>

      {/* Form under header */}
      <form
        onSubmit={handleScan}
        className="mb-6 flex flex-col items-center justify-center w-full"
      >
        <input
          type="url"
          placeholder="Enter URL to scan"
          value={url}
          onChange={(e) => setUrl(e.target.value.trim())}
          required
          className="border rounded text-white px-4 py-2 w-full max-w-md text-black"
        />
        <button
  type="submit"
  className="mt-3 bg-blue-600 text-white px-6 py-2 rounded border border-blue-500"
  disabled={loading}
>
  {loading ? "Scanning..." : "Scan URL"}
</button>

      </form>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded max-w-md w-full text-center">
          {error}
        </div>
      )}

      {/* Dashboard Component */}
      {data && <FirewallDashboard data={data} />}
    </div>
  );
}
