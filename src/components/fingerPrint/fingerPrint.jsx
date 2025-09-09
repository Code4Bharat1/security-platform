"use client";
import { useState } from "react";

export default function TechnologyFingerprinter() {
  const [url, setUrl] = useState("");
  const [results, setResults] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- outdated tech list ---
  const outdatedList = ["jquery", "flash", "angularjs", "dojo", "prototype"];

  const analyzeTech = async () => {
    setLoading(true);
    setError("");
    setResults([]);
    setMeta(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/fingerprint/fingerprint-scan`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        }
      );

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const data = await res.json();
      setResults(data.technologies || []);
      setMeta({
        timestamp: data.timestamp || new Date().toISOString(),
      });
    } catch (err) {
      setError("❌ Failed to analyze website technologies.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (tech) => {
    const s = tech.toLowerCase();
    if (s.includes("server") || s.includes("nginx") || s.includes("apache"))
      return "🖥️";
    if (s.includes("cdn") || s.includes("cloudflare") || s.includes("akamai"))
      return "☁️";
    if (s.includes("react") || s.includes("vue") || s.includes("angular"))
      return "⚛️";
    if (s.includes("jquery")) return "💡";
    if (s.includes("analytics") || s.includes("tag manager")) return "📊";
    if (s.includes("website builder") || s.includes("wix") || s.includes("shopify"))
      return "🏗️";
    return "🔧";
  };

  const isOutdated = (tech) =>
    outdatedList.some((old) => tech.toLowerCase().includes(old));

  return (
     <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
  <img
    src="/RedTeam/fingerprint.png" // yahan apni image ka path daaliye
    alt="Technology Fingerprinter Logo"
    className="w-20 h-20 rounded-full border-4 border-red-500 object-cover"
  />
  <div>
    <h1 className="text-3xl font-bold text-white">Technology Fingerprinter</h1>
    <p className="text-gray-400 text-lg">
      Scan websites for analyzing subdomains and their security posture.
    </p>
  </div>
</div>

        {/* Input + Button */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="https://example.com"
            className="flex-1 border border-white rounded px-3 py-2 bg-black text-red-500 placeholder-red-500"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button
            onClick={analyzeTech}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded disabled:opacity-50 font-bold"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-300 px-3 py-2 rounded mb-4">
            {error}
          </div>
        )}

        {/* Timestamp */}
        {meta?.timestamp && (
          <p className="text-sm text-gray-400 mb-3">
            Detected on:{" "}
            {new Date(meta.timestamp).toLocaleString(undefined, {
              dateStyle: "short",
              timeStyle: "medium",
            })}
          </p>
        )}

        {/* Results Table */}
        {results.length > 0 && (
          <table className="w-full border-collapse border border-gray-600 text-sm">
            <thead className="bg-gray-900">
              <tr>
                <th className="border border-gray-600 px-2 py-2 w-10 text-red-500">
                  #
                </th>
                <th className="border border-gray-600 px-2 py-2 text-left text-red-500">
                  Detected Technology
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map((tech, i) => (
                <tr key={i} className="hover:bg-gray-800">
                  <td className="border border-gray-700 px-2 py-2 text-center text-gray-300">
                    {i + 1}
                  </td>
                  <td
                    className={`border border-gray-700 px-2 py-2 flex items-center gap-2 ${
                      isOutdated(tech) ? "text-red-400 font-semibold" : "text-gray-200"
                    }`}
                  >
                    <span>{getIcon(tech)}</span>
                    {tech}
                    {isOutdated(tech) && (
                      <span className="ml-2 text-xs bg-red-800 text-red-200 px-2 py-0.5 rounded">
                        ⚠️ Outdated / Security Risk
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Empty State */}
        {!loading && results.length === 0 && url && !error && (
          <p className="text-gray-400 mt-4 text-center">
            No technologies detected.
          </p>
        )}
      </div>
    </div>
  );
}
