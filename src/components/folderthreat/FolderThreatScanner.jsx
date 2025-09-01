"use client";
import { FolderSearch, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export default function FileThreatScanner() {
  const [files, setFiles] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState([]);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
    setResults([]);
  };

  const handleScan = async () => {
    if (files.length === 0) return;
    setScanning(true);
    setResults([]);

    const formData = new FormData();
    files.forEach((file) => formData.append("file", file));

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/file/scan`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      setResults(data.files || []);
    } catch (err) {
      setResults([{ fileName: "Error", status: "❌ Failed to scan file." }]);
    }

    setScanning(false);
  };

  const getStatusColor = (status) => {
    if (status === "Clean") return "text-green-600";
    if (status === "Suspicious") return "text-yellow-600";
    if (status === "Malicious") return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-20 px-4">
      <img src="/waf1.png" alt="verify" className="w-16 h-20 mb-4 mt-7" />
      <div className="text-center mb-10">
        <FolderSearch className="mx-auto mb-4 text-green-600" size={48} />
        <h1 className="text-3xl font-bold text-green-800">File Scanner</h1>
        <p className="text-gray-600 mt-2">
          Upload files to scan for malware or suspicious activity.
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-3xl text-center">
        {/* File Upload */}
        <label
          htmlFor="fileInput"
          className="block mb-4 w-full bg-green-600 text-white text-center py-3 rounded-md cursor-pointer hover:bg-green-700 transition-all"
        >
          📄 Choose Files
        </label>
        <input
          type="file"
          id="fileInput"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Show selected files */}
        {files.length > 0 && (
          <div className="mt-4 text-left text-sm text-gray-700 bg-gray-50 p-3 rounded-lg max-h-40 overflow-y-auto">
            <p className="font-semibold mb-2">Selected Files:</p>
            <ul className="list-disc list-inside space-y-1">
              {files.map((f, i) => (
                <li key={i}>{f.name}</li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={handleScan}
          disabled={scanning || files.length === 0}
          className={`w-full mt-4 py-3 rounded-md text-white font-semibold ${
            scanning
              ? "bg-green-400 cursor-not-allowed"
              : "bg-green-700 hover:bg-green-800"
          }`}
        >
          {scanning ? "🔍 Scanning..." : "🚀 Start Scan"}
        </button>

        {/* Results */}
        {results.length > 0 && (
          <div className="mt-6 text-left">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Scan Results
            </h2>
            <div className="space-y-4">
              {results.map((file, idx) => (
                <FileResult
                  key={idx}
                  file={file}
                  getStatusColor={getStatusColor}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FileResult({ file, getStatusColor }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border rounded-lg p-4 shadow-sm bg-gray-50">
      <div className="flex justify-between items-center">
        <p className="font-semibold">
          {file.fileName}{" "}
          <span className={`${getStatusColor(file.status)} font-bold`}>
            ({file.status})
          </span>
        </p>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gray-600 hover:text-gray-800"
        >
          {expanded ? <ChevronUp /> : <ChevronDown />}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 text-sm text-gray-700 space-y-1">
          <p>📏 Size: {file.size} bytes</p>
          <p>📑 Type: {file.type}</p>
          <p>🔐 MD5: {file.hashes?.md5}</p>
          <p>🔐 SHA-1: {file.hashes?.sha1}</p>
          <p>🔐 SHA-256: {file.hashes?.sha256}</p>
          <p>🎲 Entropy: {file.entropy}</p>
          <p>🛡️ Engines: {file.engines} engines flagged</p>
          <p>☠️ Malware Family: {file.family || "N/A"}</p>
          <p>
            ⚡ Threat Score:{" "}
            <span
              className={`font-bold ${
                file.threatScore > 70
                  ? "text-red-600"
                  : file.threatScore > 30
                  ? "text-yellow-600"
                  : "text-green-600"
              }`}
            >
              {file.threatScore} / 100
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
