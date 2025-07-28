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
      const res = await fetch("https://zypher-api.code4bharat.com/waf/waf-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const json = await res.json();

      if (res.ok) {
        // assume your API sends the detailed dashboard in json.dashboard
        console.log("#", json)
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
      <div className="max-w-5xl mx-auto p-6">
    
      <h1 className="text-3xl font-bold mb-6">WAF Detection Dashboard</h1>

      <form onSubmit={handleScan} className="mb-6">
        <input
          type="url"
          placeholder="Enter URL to scan"
          value={url}
          onChange={(e) => setUrl(e.target.value.trim())}
          required
          className="border rounded px-4 py-2 w-full"
        />
        <button
          type="submit"
          className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Scanning..." : "Scan URL"}
        </button>
      </form>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {data && <FirewallDashboard data={data}/>}
    </div>
  );
}

//<FirewallDashboard data={data} />