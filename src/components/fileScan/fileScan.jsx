"use client";

import { useState } from "react";

export default function FileScan() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
  };

  const handleSubmit = async () => {
    if (!file) {
      alert("Please select a file to scan.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Correct endpoint: /file/scan (api prefix is already in process.env.NEXT_PUBLIC_PROD_API_URL)
      const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_API_URL}/file/scan`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to scan file");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "malicious": return "text-red-500 bg-red-500/10 border-red-500/20";
      case "suspicious": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      default: return "text-green-500 bg-green-500/10 border-green-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            AI-Powered Malware Scanner
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Upload your files for a deep security analysis using multi-engine threat intelligence and entropy calculation.
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-[#16161a] border border-white/10 rounded-2xl p-8 mb-8 shadow-2xl backdrop-blur-xl transition-all hover:border-blue-500/30">
          <div className="flex flex-col items-center">
            <div className="w-full relative group">
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer bg-[#1c1c21] hover:bg-[#23232a] hover:border-blue-500 transition-all duration-300"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-12 h-12 mb-4 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mb-2 text-sm text-gray-400 font-semibold">
                    {file ? <span className="text-blue-400">{file.name}</span> : <span>Click to upload or drag and drop</span>}
                  </p>
                  <p className="text-xs text-gray-500">Any file type (max 50MB)</p>
                </div>
              </label>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !file}
              className={`mt-8 w-full md:w-64 py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 ${
                loading || !file
                  ? "bg-gray-700 cursor-not-allowed opacity-50"
                  : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]"
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : "Initialize Scan"}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {result && !result.error && result.files && result.files[0] && (
          (() => {
            const fileData = result.files[0];
            return (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Status Overview */}
                <div className={`p-6 rounded-2xl border flex items-center justify-between ${getStatusColor(fileData.status)}`}>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-current bg-opacity-20">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {fileData.status === "Clean" ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        )}
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold uppercase tracking-wider">{fileData.status}</h3>
                      <p className="text-sm opacity-80">Final analysis verdict based on global intelligence</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-mono font-bold">{fileData.engines}</div>
                    <div className="text-xs uppercase opacity-70 mt-1">Detections Reported</div>
                  </div>
                </div>

                {/* Detailed Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* File Info */}
                  <div className="bg-[#16161a] border border-white/5 rounded-2xl p-6">
                    <h4 className="text-gray-400 text-xs uppercase tracking-widest mb-4 font-bold">File Properties</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-gray-500">Name</span>
                        <span className="text-blue-400 truncate max-w-[200px]">{fileData.fileName}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-gray-500">Size</span>
                        <span className="text-gray-300">{(fileData.size / 1024).toFixed(2)} KB</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-gray-500">Entropy</span>
                        <span className="text-orange-400 font-mono">{fileData.entropy} bits</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Reputation</span>
                        <span className="text-purple-400">{fileData.threatScore || 0} pts</span>
                      </div>
                    </div>
                  </div>

                  {/* Hash Data */}
                  <div className="bg-[#16161a] border border-white/5 rounded-2xl p-6">
                    <h4 className="text-gray-400 text-xs uppercase tracking-widest mb-4 font-bold">Hash Fingerprints</h4>
                    <div className="space-y-4">
                      <div>
                        <span className="text-gray-500 text-[10px] block mb-1">SHA-256</span>
                        <code className="text-xs text-indigo-300 break-all bg-indigo-500/10 p-2 rounded block border border-indigo-500/20">
                          {fileData.hashes?.sha256}
                        </code>
                      </div>
                      <div>
                        <span className="text-gray-500 text-[10px] block mb-1">MD5</span>
                        <code className="text-xs text-indigo-300 break-all bg-indigo-500/10 p-2 rounded block border border-indigo-500/20">
                          {fileData.hashes?.md5}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()
        )}

        {/* Error State */}
        {result?.error && (
          <div className="mt-8 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-400">
            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-medium">{result.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
