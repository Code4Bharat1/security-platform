"use client";
import { ShieldAlert } from "lucide-react";
import { useState } from "react";

export default function LeakDetector() {
  const [files, setFiles] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
    setResult(null);
  };

  const handleScan = async () => {
    if (files.length === 0) return;

    setScanning(true);
    setResult(null);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const res = await fetch("/api/data-leak-scan", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data.message || "✅ No data leaks detected.");
    } catch (err) {
      setResult("❌ Failed to scan for leaks.");
    }

    setScanning(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-20 px-4">
      <div className="text-center mb-10">
        <ShieldAlert className="mx-auto mb-4 text-green-600" size={48} />
        <h1 className="text-3xl font-bold text-green-800">Data Leak Detector</h1>
        <p className="text-gray-600 mt-2">
          Upload files/folders to detect potential sensitive data leaks.
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-lg text-center">
        <input
          type="file"
          webkitdirectory="true"
          directory=""
          multiple
          onChange={handleFileChange}
          className="mb-4 cursor-pointer border p-2 rounded-md bg-gray-50 hover:bg-gray-100"
        />

        <button
          onClick={handleScan}
          disabled={scanning || files.length === 0}
          className={`w-full py-3 rounded-md text-white font-semibold ${
            scanning
              ? "bg-green-400 cursor-not-allowed"
              : "bg-green-700 hover:bg-green-800"
          }`}
        >
          {scanning ? "Detecting..." : "Detect Leak"}
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
