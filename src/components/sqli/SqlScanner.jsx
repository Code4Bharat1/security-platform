"use client";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";

export default function SQLiScanner() {
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleScan = async () => {
    if (!url.trim()) return;

    setScanning(true);
    setResult(null);
    setError("");

    try {
      const res = await fetch("http://localhost:4180/api/sqli/sqli-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data);
      } else {
        setError("❌ Scan failed.");
      }
    } catch (err) {
      setError("❌ Error scanning the website.");
    }

    setScanning(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-20 px-4">
      <div className="text-center mb-10">
        <ShieldCheck className="mx-auto mb-4 text-green-600" size={48} />
        <h1 className="text-3xl font-bold text-green-800">SQL Injection Scanner</h1>
        <p className="text-gray-600 mt-2">
          This tool scans websites for SQL Injection vulnerabilities.
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-lg text-center">
        <input
          type="text"
          placeholder="🔗 Enter website URL to scan..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-800"
        />

        <button
          onClick={handleScan}
          disabled={scanning || !url}
          className={`w-full py-3 rounded-md text-white font-semibold transition ${
            scanning ? "bg-green-400 cursor-not-allowed" : "bg-green-700 hover:bg-green-800"
          }`}
        >
          {scanning ? "Scanning..." : "Scan Website"}
        </button>

        {result && (
          <div className={`mt-6 font-semibold ${result.vulnerable ? "text-red-600" : "text-green-700"}`}>
            <p>{result.message}</p>
            <p className="text-sm mt-1 text-gray-500">Scanned: {new Date(result.scannedAt).toLocaleString()}</p>
          </div>
        )}

        {error && <div className="mt-6 text-red-600 font-semibold">{error}</div>}
      </div>
    </div>
  );
}
