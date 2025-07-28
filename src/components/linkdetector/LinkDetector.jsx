"use client";
import { useState } from "react";
import { Link2 } from "lucide-react";

export default function LinkDetector() {
  const [link, setLink] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleScan = async () => {
    if (!link.trim()) return;

    setScanning(true);
    setResult(null);
    setError("");

    try {
      const res = await fetch("https://zypher-api.code4bharat.com/link-detector/link-scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: link }), // ✅ Fix: send `url` not `link`
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data);
      } else {
        setError("❌ Link check failed.");
      }
    } catch (err) {
      console.error("Request error:", err);
      setError("❌ Failed to check the link.");
    }

    setScanning(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-20 px-4">
      <div className="text-center mb-10">
        <Link2 className="mx-auto mb-4 text-green-600" size={48} />
        <h1 className="text-3xl font-bold text-green-800">Link Detector</h1>
        <p className="text-gray-600 mt-2">
          This tool helps detect malicious, suspicious, or unsafe links.
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-lg text-center">
        <input
          type="text"
          placeholder="🔗 Enter link to check..."
          value={link}
          onChange={(e) => setLink(e.target.value.trim())}         className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-800"
        />

        <button
          onClick={handleScan}
          disabled={scanning || !link}
          className={`w-full py-3 rounded-md text-white font-semibold transition ${
            scanning
              ? "bg-green-400 cursor-not-allowed"
              : "bg-green-700 hover:bg-green-800"
          }`}
        >
          {scanning ? "Scanning..." : "Check Link"}
        </button>

        {/* ✅ Result */}
        {result && (
          <div className="mt-6 text-center text-green-800 font-semibold">
            <p>
              {result.status === "malicious" && "🛑 Malicious Link Detected!"}
              {result.status === "suspicious" && "⚠️ Suspicious Link!"}
              {result.status === "safe" && "✅ Link is safe."}
            </p>
            <p className="text-sm mt-1 text-gray-700">Status: {result.status}</p>
            <p className="text-sm">{result.message}</p>
            <p className="text-xs text-gray-500 mt-1">
              Checked At: {new Date(result.scannedAt).toLocaleString()}
            </p>
          </div>
        )}

        {/* ❌ Error */}
        {error && (
          <div className="mt-6 text-red-600 font-semibold">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
