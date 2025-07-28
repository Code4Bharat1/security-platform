"use client";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";

export default function SocialAnalyzer() {
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [risks, setRisks] = useState([]);

  const handleAnalyze = async () => {
    if (!url) return;

    setScanning(true);
    setResult(null);
    setRisks([]);

    try {
      const res = await fetch("https://zypher-api.code4bharat.com/api/social-analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      setResult(data.message || "✅ No privacy issues detected.");
      setRisks(data.risks || []);
    } catch (err) {
      setResult("❌ Failed to analyze profile.");
    }

    setScanning(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-20 px-4">
      <div className="text-center mb-10">
        <ShieldCheck className="mx-auto mb-4 text-green-600" size={48} />
        <h1 className="text-3xl font-bold text-green-800">
          Social Media Privacy Analyzer
        </h1>
        <p className="text-gray-600 mt-2">
          Analyze your social media profile for potential privacy risks.
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-lg text-center">
        <input
          type="text"
          placeholder="Enter your social media profile URL"
          value={url}
          onChange={(e) => setUrl(e.target.value.trim())}         className="w-full px-4 py-3 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <button
          onClick={handleAnalyze}
          disabled={scanning || !url}
          className={`w-full py-3 rounded-md text-white font-semibold ${
            scanning
              ? "bg-green-400 cursor-not-allowed"
              : "bg-green-700 hover:bg-green-800"
          }`}
        >
          {scanning ? "Analyzing..." : "Analyze Now"}
        </button>

        {result && (
          <div className="mt-6 text-center text-green-700 font-semibold">
            {result}
          </div>
        )}

        {risks.length > 0 && (
          <ul className="mt-4 text-left text-sm text-gray-700 list-disc list-inside">
            {risks.map((risk, index) => (
              <li key={index}>⚠️ {risk}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
