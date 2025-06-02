"use client";
import { useState } from "react";

export default function ASNLookup() {
  const [ip, setIp] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!ip.trim()) {
      setError("Please enter an IP address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/asnLookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Unknown error");
      } else {
        setResult(data.asnInfo);
      }
    } catch (err) {
      setError("Failed to fetch ASN data.");
    }

    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-semibold mb-4">ASN Lookup</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          placeholder="Enter IPv4 or IPv6 address"
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Looking up..." : "Lookup ASN"}
        </button>
      </form>

      {result && (
        <div className="mt-6 bg-gray-100 p-4 rounded">
          <h3 className="font-semibold mb-2">ASN Information</h3>
          <p>
            <strong>ASN:</strong> {result.asn}
          </p>
          <p>
            <strong>Organization:</strong> {result.name}
          </p>
          <p>
            <strong>Country:</strong> {result.country_code}
          </p>
          <p>
            <strong>Description:</strong> {result.description || "N/A"}
          </p>
          <p>
            <strong>Registry:</strong> {result.registry}
          </p>
        </div>
      )}
    </div>
  );
}

