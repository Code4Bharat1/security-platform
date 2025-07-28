"use client";
import { useState, useCallback } from "react";
import { LocateFixed } from "lucide-react";
import axios from "axios";

export default function IPInfoFinder() {
  const [ip, setIp] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post("https://zypher-api.code4bharat.com/api/ipinfo/ip-info", { ip });
      setInfo(res.data);
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to fetch IP info"
      );
    } finally {
      setLoading(false);
    }
  }, [ip]);

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
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter IP address..."
            value={ip}
            onChange={(e) => setIp(e.target.value.trim())}           className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
          />
          <button
            type="submit"
            disabled={loading || !ip.trim()}
            className={`w-full py-3 rounded-md text-white font-semibold ${
              loading
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-700 hover:bg-green-800"
            }`}
          >
            {loading ? "Fetching..." : "Get IP Info"}
          </button>
        </form>

        {error && (
          <div className="mt-4 text-red-600 font-semibold">{error}</div>
        )}

        {info && (
          <div className="mt-6 text-left text-sm text-gray-800">
            <p><strong>🌍 IP:</strong> {info?.ip ?? "N/A"}</p>
            <p><strong>📍 Country:</strong> {info?.country ?? "N/A"}</p>
            <p><strong>🏙️ City:</strong> {info?.city ?? "N/A"}</p>
            <p><strong>🛰️ ISP:</strong> {info?.isp ?? "N/A"}</p>
            <p><strong>🌐 Org:</strong> {info?.org ?? "N/A"}</p>
            <p><strong>🕓 Timezone:</strong> {info?.timezone ?? "N/A"}</p>
            <p><strong>📡 Latitude:</strong> {info?.lat ?? "N/A"}</p>
            <p><strong>📡 Longitude:</strong> {info?.lon ?? "N/A"}</p>
          </div>
        )}
      </div>
    </div>
  );
}
