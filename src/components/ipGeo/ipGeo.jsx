"use client";
import { useState } from "react";
import { Globe, Search, MapPin, Wifi, Building2, Hash } from "lucide-react";

export default function IPGeoPage() {
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLookup = async () => {
    setError("");
    setResult(null);
    if (!domain) return;

    setLoading(true);
    try {
      const res = await fetch("https://zypher-api.code4bharat.com/api/ipgeo/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Lookup failed.");
        return;
      }

      setResult(data);
    } catch (err) {
      setError("Failed to fetch geolocation data.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLookup();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            IP & Geolocation Lookup
          </h1>
          <p className="text-gray-600">
            Discover the location and details of any domain or IP address
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-green-100">
          <div className="relative">
            <input
              type="text"
              placeholder="Enter domain (e.g., openai.com) or IP address"
              className="w-full p-4 pr-12 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors duration-200 text-gray-800 placeholder-gray-500"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          <button
            onClick={handleLookup}
            disabled={loading || !domain.trim()}
            className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Looking up...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Lookup Location
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="bg-white rounded-xl shadow-lg border border-green-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <MapPin className="w-6 h-6" />
                Location Details
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Domain
                      </p>
                      <p className="text-lg font-bold text-gray-800">
                        {result.domain}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <Hash className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        IP Address
                      </p>
                      <p className="text-lg font-bold text-gray-800">
                        {result.ip}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Country
                  </p>
                  <p className="text-lg font-bold text-gray-800">
                    {result.geo.country}
                  </p>
                </div>

                <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Region
                  </p>
                  <p className="text-lg font-bold text-gray-800">
                    {result.geo.regionName}
                  </p>
                </div>

                <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                  <p className="text-sm font-medium text-gray-600 mb-1">City</p>
                  <p className="text-lg font-bold text-gray-800">
                    {result.geo.city}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <Wifi className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">ISP</p>
                      <p className="font-bold text-gray-800">
                        {result.geo.isp}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Organization
                      </p>
                      <p className="font-bold text-gray-800">
                        {result.geo.org}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                  <div className="flex items-center gap-3">
                    <Hash className="w-5 h-5 text-teal-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">ASN</p>
                      <p className="font-bold text-gray-800">{result.geo.as}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm">
            Enter any domain name or IP address to discover its geographic
            location and network details
          </p>
        </div>
      </div>
    </div>
  );
}
