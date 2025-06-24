"use client";
import { useState } from "react";
import { DatabaseZap } from "lucide-react";

export default function SQLiScanner() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleScan = async () => {
    if (!url) return;
    setLoading(true);
    setResult(null);

    setTimeout(() => {
      const isVulnerable = url.includes("'") || url.includes("=");
      setResult({
        status: isVulnerable ? "Vulnerability Found" : "No Vulnerability",
        message: isVulnerable
          ? "Potential SQL Injection vulnerability detected!"
          : "No SQLi vulnerability found.",
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-20 px-4">
      <div className="text-center mb-10">
        <DatabaseZap className="mx-auto mb-4 text-green-600" size={48} />
        <h1 className="text-3xl font-bold text-green-800">SQLi Scanner</h1>
        <p className="text-gray-600 mt-2">
          This tool scans websites for SQL Injection vulnerabilities.
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-lg">
        <input
          type="text"
          placeholder="Enter URL to scan"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-4 py-3 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          onClick={handleScan}
          disabled={loading}
          className={`w-full py-3 rounded-md text-white font-semibold ${
            loading
              ? "bg-green-400 cursor-not-allowed"
              : "bg-green-700 hover:bg-green-800"
          }`}
        >
          {loading ? "Scanning..." : "Scan Link"}
        </button>

        {result && (
          <div className="mt-6 text-center">
            <p className="text-lg font-bold text-green-700">{result.status}</p>
            <p className="text-gray-600 mt-1">{result.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
