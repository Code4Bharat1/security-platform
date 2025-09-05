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
    setInfo(null);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/ipinfo/`,
        { ip }
      );
      setInfo(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch IP info");
    } finally {
      setLoading(false);
    }
  }, [ip]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-20 px-4">
      <img src="/tools/card-images/ip.png" alt="verify" className="w-16 h-20 mb-4 mt-7" />
      <div className="text-center mb-10">
        <LocateFixed className="mx-auto mb-4 text-green-600" size={48} />
        <h1 className="text-3xl font-bold text-green-800">
          IP Address Info Finder
        </h1>
        <p className="text-gray-600 mt-2">
          Fetches location, network, and threat intel of an IP address.
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-2xl">
        <form onSubmit={handleSubmit} className="mb-6">
          <input
            type="text"
            placeholder="Enter IP address..."
            value={ip}
            onChange={(e) => setIp(e.target.value.trim())}
            className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
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
          <div className="mt-4 text-red-600 font-semibold text-center">
            {error}
          </div>
        )}

        {info && (
          <div className="space-y-6 text-sm">
            {/* Header */}
            <div className="bg-green-100 border-l-4 border-green-600 p-3 rounded">
              <p className="font-bold text-green-800">
                📑 IP INTELLIGENCE REPORT — {info.reportGeneratedAt}
              </p>
            </div>

            {/* Basic Info */}
            <div>
              <h2 className="font-bold text-lg text-green-700 mb-2">
                🔹 Basic Information:
              </h2>
              <ul className="space-y-1 pl-4">
                <li>IP Address: {info.basicInformation?.ipAddress}</li>
                <li>Version: {info.basicInformation?.version}</li>
                <li>Reverse DNS: {info.basicInformation?.reverseDNS}</li>
                <li>Hostname: {info.basicInformation?.hostname}</li>
              </ul>
            </div>

            {/* Location Data */}
            <div>
              <h2 className="font-bold text-lg text-green-700 mb-2">
                🌍 Location Data:
              </h2>
              <ul className="space-y-1 pl-4">
                <li>Country: {info.locationData?.country}</li>
                <li>Region: {info.locationData?.region}</li>
                <li>City: {info.locationData?.city}</li>
                <li>Timezone: {info.locationData?.timezone}</li>
                <li>Latitude: {info.locationData?.latitude}</li>
                <li>Longitude: {info.locationData?.longitude}</li>
              </ul>
            </div>

            {/* Network Details */}
            <div>
              <h2 className="font-bold text-lg text-green-700 mb-2">
                🛰️ Network Details:
              </h2>
              <ul className="space-y-1 pl-4">
                <li>ISP: {info.networkDetails?.isp}</li>
                <li>Organization: {info.networkDetails?.organization}</li>
                <li>ASN: {info.networkDetails?.asn}</li>
                <li>ASN Type: {info.networkDetails?.asType}</li>
                <li>CIDR Range: {info.networkDetails?.cidrRange}</li>
              </ul>
            </div>

            {/* Security & Threat Intel */}
            <div>
              <h2 className="font-bold text-lg text-green-700 mb-2">
                ⚠️ Security & Threat Intelligence:
              </h2>
              <ul className="space-y-1 pl-4">
                <li>Proxy/VPN: {info.securityThreatIntel?.proxyOrVpn}</li>
                <li>Tor Exit Node: {info.securityThreatIntel?.torExitNode}</li>
                <li>
                  Blacklist Status:{" "}
                  <span
                    className={`${
                      info.securityThreatIntel?.blacklistStatus === "Listed"
                        ? "text-red-600 font-bold"
                        : "text-green-600 font-bold"
                    }`}
                  >
                    {info.securityThreatIntel?.blacklistStatus}
                  </span>
                </li>
                <li>
                  Malware Hosting History:{" "}
                  {info.securityThreatIntel?.malwareHostingHistory}
                </li>
                <li>
                  Spam Reports (last 12 months):{" "}
                  {info.securityThreatIntel?.spamReports}
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
