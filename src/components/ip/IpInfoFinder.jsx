"use client";
import { useState } from "react";
import { Globe } from "lucide-react";

export default function IpInfoFinder() {
  const [ip, setIp] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFind = async () => {
    if (!ip) return;
    setLoading(true);
    setResult(null);

    try {
      // Replace this URL with your backend endpoint
      const res = await fetch(`/api/ip-info?ip=${ip}`);
      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({ error: "❌ Failed to fetch IP info." });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-20 px-4">
      <div className="text-center mb-10">
        <Globe className="mx-auto mb-4 text-green-600" size={48} />
        <h1 className="text-3xl font-bold text-green-800">IP Address Info Finder</h1>
        <p className="text-gray-600 mt-2">
          Enter an IP address to get location and network details.
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-lg text-center">
        <input
          type="text"
          placeholder="Enter IP address (e.g., 8.8.8.8)"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          className="w-full px-4 py-3 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <button
          onClick={handleFind}
          disabled={loading}
          className={`w-full py-3 rounded-md text-white font-semibold ${
            loading ? "bg-green-400 cursor-not-allowed" : "bg-green-700 hover:bg-green-800"
          }`}
        >
          {loading ? "Fetching..." : "Find Info"}
        </button>

        {result && (
          <div className="mt-6 text-left text-sm text-gray-700 bg-gray-50 p-4 rounded-md">
            {result.error ? (
              <p className="text-red-600">{result.error}</p>
            ) : (
              <>
                <p><strong>IP:</strong> {result.ip}</p>
                <p><strong>Country:</strong> {result.country}</p>
                <p><strong>Region:</strong> {result.region}</p>
                <p><strong>City:</strong> {result.city}</p>
                <p><strong>ISP:</strong> {result.isp}</p>
                <p><strong>Latitude:</strong> {result.lat}</p>
                <p><strong>Longitude:</strong> {result.lon}</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
