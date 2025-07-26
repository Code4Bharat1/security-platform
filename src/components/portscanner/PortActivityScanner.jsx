"use client";
import { useState } from "react";
import { Network } from "lucide-react";

export default function PortActivityScanner() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);

  const handleScan = async () => {
    setScanning(true);
    setResult(null);

    try {
      const res = await fetch("/api/port-scan"); // Backend call
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: "❌ Failed to scan ports." });
    }

    setScanning(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-20 px-4">
      <div className="text-center mb-10">
        <Network className="mx-auto mb-4 text-green-600" size={48} />
        <h1 className="text-3xl font-bold text-green-800">Network Port Activity Scanner</h1>
        <p className="text-gray-600 mt-2">
          Scans open ports and checks for suspicious activity.
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-xl text-center">
        <button
          onClick={handleScan}
          disabled={scanning}
          className={`w-full py-3 rounded-md text-white font-semibold ${
            scanning ? "bg-green-400 cursor-not-allowed" : "bg-green-700 hover:bg-green-800"
          }`}
        >
          {scanning ? "Scanning..." : "Scan Ports"}
        </button>

        {result && (
          <div className="mt-6 text-left bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto text-sm">
            {result.error ? (
              <p className="text-red-600">{result.error}</p>
            ) : (
              <>
                {result.openPorts?.length > 0 && (
                  <>
                    <p className="font-bold text-green-700">🔓 Open Ports:</p>
                    <ul className="list-disc list-inside text-gray-700 mb-2">
                      {result.openPorts.map((port, index) => (
                        <li key={index}>Port {port}</li>
                      ))}
                    </ul>
                  </>
                )}

                {result.suspicious?.length > 0 && (
                  <>
                    <p className="font-bold text-red-600">⚠ Suspicious Ports:</p>
                    <ul className="list-disc list-inside text-gray-700">
                      {result.suspicious.map((port, index) => (
                        <li key={index}>Port {port}</li>
                      ))}
                    </ul>
                  </>
                )}

                {result.openPorts?.length === 0 && result.suspicious?.length === 0 && (
                  <p className="text-gray-600">✅ No open or suspicious ports detected.</p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
