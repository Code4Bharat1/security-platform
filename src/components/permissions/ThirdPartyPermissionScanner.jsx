"use client";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";

export default function ThirdPartyPermissionScanner() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const handleScan = async () => {
    setLoading(true);
    setResults([]);

    try {
      // Backend API hit karo yahan
      const res = await fetch("/api/permission-scan");
      const data = await res.json();
      setResults(data.apps || []);
    } catch (err) {
      setResults([{ name: "Error", permissions: ["Failed to fetch data"] }]);
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
          Check for apps with risky or suspicious permissions.
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-xl text-center">
        <button
          onClick={handleScan}
          disabled={loading}
          className={`w-full py-3 rounded-md text-white font-semibold ${
            loading ? "bg-green-400 cursor-not-allowed" : "bg-green-700 hover:bg-green-800"
          }`}
        >
          {loading ? "Scanning..." : "Scan Apps"}
        </button>

        {results.length > 0 && (
          <div className="mt-6 text-left text-sm bg-gray-50 rounded-lg p-4 max-h-[300px] overflow-y-auto">
            {results.map((app, index) => (
              <div key={index} className="mb-4">
                <p className="font-bold text-green-800">{app.name}</p>
                <ul className="list-disc list-inside text-gray-700">
                  {app.permissions.map((perm, i) => (
                    <li key={i}>{perm}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
