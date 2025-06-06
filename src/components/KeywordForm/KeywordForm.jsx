"use client";
import { useState } from "react";

export default function KeywordPage() {
  const [url, setUrl] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setReport(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await fetch(
        "http://localhost:5000/api/keyword/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Server error");
      }

      const data = await response.json();
      setReport(data);
    } catch (err) {
      console.error("Keyword analysis failed:", err);
      if (err.name === "AbortError") {
        setError("Request timeout");
      } else {
        setError(err.message || "Network error or request failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-gray-200 min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Keyword Density Checker</h1>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          className="border p-2 w-full"
          placeholder="Enter website URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          type="submit"
          className="bg-purple-600 text-white px-4 py-2 rounded mb-6"
          disabled={loading}
        >
          Analyze Keyword Density
        </button>
      </form>

      {/* Loading */}
      {loading && (
        <div className="mt-4 p-4 bg-blue-100 border border-blue-300 rounded">
          <p className="text-blue-800">Analyzing keyword density...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded">
          <p className="text-red-800 font-semibold">Error:</p>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Report Display */}
      {report && !loading && !error && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Keyword Density Report</h2>
          <p>
            <strong>Total Words:</strong> {report.totalWords}
          </p>

          <h3 className="font-semibold mt-4">Top Single Keywords</h3>
          <table className="mt-2 w-full border">
            <thead>
              <tr>
                <th className="border px-2">Keyword</th>
                <th className="border px-2">Count</th>
                <th className="border px-2">Density (%)</th>
              </tr>
            </thead>
            <tbody>
              {report.singleWords.map(({ phrase, count, percentage }) => (
                <tr key={phrase}>
                  <td className="border px-2">{phrase}</td>
                  <td className="border px-2">{count}</td>
                  <td className="border px-2">{percentage}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="font-semibold mt-6">Top Two-word Phrases</h3>
          <table className="mt-2 w-full border">
            <thead>
              <tr>
                <th className="border px-2">Phrase</th>
                <th className="border px-2">Count</th>
                <th className="border px-2">Density (%)</th>
              </tr>
            </thead>
            <tbody>
              {report.phrases.map(({ phrase, count, percentage }) => (
                <tr key={phrase}>
                  <td className="border px-2">{phrase}</td>
                  <td className="border px-2">{count}</td>
                  <td className="border px-2">{percentage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
