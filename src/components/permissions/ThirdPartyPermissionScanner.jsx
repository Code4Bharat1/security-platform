"use client";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";

export default function ThirdPartyPermissionScanner() {
  const [appName, setAppName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleScan = async () => {
    if (!appName.trim()) return;

    setLoading(true);
    setResult(null);
    setError("");

    try {
      const res = await fetch("http://localhost:4180/api/permission-scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ appName }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.message || "❌ Failed to fetch permissions.");
      }
    } catch (err) {
      setError("❌ Server error. Try again later.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-20 px-4">
      <div className="text-center mb-10">
        <ShieldCheck className="mx-auto mb-4 text-green-600" size={48} />
        <h1 className="text-3xl font-bold text-green-800">
          Third-Party App Permission Scanner
        </h1>
        <p className="text-gray-600 mt-2">
          Checks third-party apps for risky or extra permissions.
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-xl text-center">
        <input
          type="text"
          placeholder="Enter App Name (e.g. Facebook Lite)"
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
          className="w-full px-4 py-2 border rounded-md mb-4"
        />

        <button
          onClick={handleScan}
          disabled={loading || !appName}
          className={`w-full py-3 rounded-md text-white font-semibold ${
            loading ? "bg-green-400 cursor-not-allowed" : "bg-green-700 hover:bg-green-800"
          }`}
        >
          {loading ? "Scanning..." : "Scan App"}
        </button>

        {error && (
          <div className="mt-4 text-red-600 font-semibold">{error}</div>
        )}

        {result && (
          <div className="mt-6 text-left bg-gray-50 p-4 rounded-lg">
            <p className="font-bold text-green-800 mb-2">
              App: {result.appName}
            </p>

            <p className="text-gray-700 mb-1 font-semibold">Permissions:</p>
            <ul className="list-disc list-inside text-gray-700 mb-2">
              {result.permissions.map((perm, i) => (
                <li key={i}>{perm}</li>
              ))}
            </ul>

            <p className="text-gray-700 mb-1 font-semibold">Risky Permissions:</p>
            <ul className="list-disc list-inside text-red-600 mb-2">
              {result.risky.length > 0 ? (
                result.risky.map((r, i) => <li key={i}>{r}</li>)
              ) : (
                <li>✅ No risky permissions found.</li>
              )}
            </ul>

            <p className="font-semibold text-green-700">{result.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
