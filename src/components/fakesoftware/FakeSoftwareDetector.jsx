"use client";
import { Bug } from "lucide-react";
import { useState } from "react";

export default function FakeSoftwareDetector() {
  const [file, setFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
  };

  const handleScan = async () => {
    if (!file) return;

    setScanning(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("https://zypher-api.code4bharat.com/api/fake-software-scan", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data.message);
      } else {
        setResult("❌ Error: " + (data.message || "Scan failed."));
      }
    } catch (error) {
      setResult("❌ Failed to connect to backend.");
    }

    setScanning(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-20 px-4">
      <div className="text-center mb-10">
        <Bug className="mx-auto mb-4 text-green-600" size={48} />
        <h1 className="text-3xl font-bold text-green-800">Fake Software Detector</h1>
        <p className="text-gray-600 mt-2">
          Upload software or setup file to check for fake or malicious behavior.
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-lg text-center">
        <input
          type="file"
          onChange={handleFileChange}
          className="mb-4 cursor-pointer border p-2 rounded-md"
        />

        <button
          onClick={handleScan}
          disabled={scanning || !file}
          className={`w-full py-3 rounded-md text-white font-semibold ${
            scanning
              ? "bg-green-400 cursor-not-allowed"
              : "bg-green-700 hover:bg-green-800"
          }`}
        >
          {scanning ? "Scanning..." : "Detect Now"}
        </button>

        {result && (
          <div className="mt-6 text-center text-green-700 font-semibold">
            {result}
          </div>
        )}
      </div>
    </div>
  );
}
