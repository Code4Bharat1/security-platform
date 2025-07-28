"use client";
import { FolderSearch } from "lucide-react";
import { useState } from "react";

export default function FolderThreatScanner() {
  const [files, setFiles] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);

  const handleFolderChange = (e) => {
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
      const res = await fetch("https://zypher-api.code4bharat.com/api/folder-scan", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ message: "❌ Failed to scan file.", suspiciousFiles: [] });
    }

    setScanning(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-20 px-4">
      <div className="text-center mb-10">
        <FolderSearch className="mx-auto mb-4 text-green-600" size={48} />
        <h1 className="text-3xl font-bold text-green-800">File Scanner</h1>
        <p className="text-gray-600 mt-2">
          Upload a file to scan for malware or suspicious files.
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-lg text-center">
        <label
          htmlFor="folderInput"
          className="block mb-4 w-full bg-green-600 text-white text-center py-3 rounded-md cursor-pointer hover:bg-green-700 transition-all"
        >
          📁 Choose File
        </label>
        <input
          type="file"
          id="folderInput"
          webkitdirectory="true"
          directory=""
          multiple
          onChange={handleFolderChange}
          className="hidden"
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
          {scanning ? "Scanning..." : "Scan File"}
        </button>

        {result && (
          <div className="mt-6 text-left text-green-700 font-medium">
            <p className="text-lg font-bold text-center">{result.message}</p>

            <div className="mt-4">
              <p>Total Files Scanned: {result.totalFiles}</p>
              <p>Suspicious Files Detected: {result.suspiciousCount}</p>

              {result.suspiciousFiles?.length > 0 && (
                <ul className="mt-3 list-disc list-inside text-red-600">
                  {result.suspiciousFiles.map((file, idx) => (
                    <li key={idx}>{file}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
