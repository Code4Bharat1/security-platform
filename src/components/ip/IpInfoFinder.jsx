"use client";
import { useState } from "react";
import { LocateFixed } from "lucide-react";

export default function IPInfoFinder() {
  const [ip, setIp] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!ip.trim()) return;

    setLoading(true);
    setInfo(null);
    setError("");

    try {
      const res = await fetch("https://zypher-api.code4bharat.com/api/ip-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setInfo(data);
      }
    } catch (err) {
      setError("❌ Failed to fetch IP info.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-20 px-4">
      <div className="text-center mb-10">
        <LocateFixed className="mx-auto mb-4 text-green-600" size={48} />
        <h1 className="text-3xl font-bold text-green-800">IP Address Info Finder</h1>
        <p className="text-gray-600 mt-2">
          Fetches location and network details of an IP address.
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-lg text-center">
        <input
          type="text"
          placeholder="Enter IP address..."
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
        />

        <button
          onClick={handleSubmit}
          disabled={loading || !ip}
          className={`w-full py-3 rounded-md text-white font-semibold ${
            loading
              ? "bg-green-400 cursor-not-allowed"
              : "bg-green-700 hover:bg-green-800"
          }`}
        >
          {loading ? "Fetching..." : "Get IP Info"}
        </button>

        {error && (
          <div className="mt-4 text-red-600 font-semibold">{error}</div>
        )}

        {info && (
          <div className="mt-6 text-left text-sm text-gray-800">
            <p><strong>🌍 IP:</strong> {info.ip}</p>
            <p><strong>📍 Country:</strong> {info.country}</p>
            <p><strong>🏙️ City:</strong> {info.city}</p>
            <p><strong>🛰️ ISP:</strong> {info.isp}</p>
            <p><strong>🌐 Org:</strong> {info.org}</p>
            <p><strong>🕓 Timezone:</strong> {info.timezone}</p>
            <p><strong>📡 Latitude:</strong> {info.lat}</p>
            <p><strong>📡 Longitude:</strong> {info.lon}</p>
          </div>
        )}
      </div>
    </div>
  );
}
