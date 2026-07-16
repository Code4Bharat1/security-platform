"use client";
import { Bug, Download, FileText } from "lucide-react";
import { useState } from "react";
import { generateDataBreachPDF } from "./generateDataBreachPDF";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";

export default function FakeSoftwareDetector() {
  const [files, setFiles] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);   // full API response object
  const [error, setError] = useState(null);

  const protectedAction = useProtectedAction();
  const apiBase = (process.env.NEXT_PUBLIC_PROD_API_URL || "").replace(/\/+$/, "");

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
    setResult(null);
    setError(null);
  };

  const handleScan = async () => {
    if (!files.length) return;
    setScanning(true);
    setResult(null);
    setError(null);

    await protectedAction(async (token) => {
      try {
        const formData = new FormData();
        // Backend accepts either single file (fake-software-scan) or multiple (data-leak)
        // We use files endpoint for multi-file breach detection
        for (const f of files) formData.append("files", f);

        const response = await fetch(`${apiBase}/data-leak`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          setResult({
            ...data,
            fileNames: files.map((f) => f.name),
          });
        } else {
          setError(data.message || "Scan failed.");
        }
      } catch (err) {
        setError("Failed to connect to backend: " + (err?.message || ""));
      } finally {
        setScanning(false);
      }
    });
  };

  const handleDownloadPDF = () => {
    if (!result) return;
    generateDataBreachPDF({
      message:          result.message          || "",
      totalLinesScanned:result.totalLinesScanned || 0,
      sensitiveMatches: result.sensitiveMatches  || [],
      fileNames:        result.fileNames         || [],
      generatedFiles:   result.generatedFiles    || [],
    });
  };

  const hasMatches = result && Array.isArray(result.sensitiveMatches) && result.sensitiveMatches.length > 0;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-20 px-4">
      <div className="text-center mb-10">
        <Bug className="mx-auto mb-4 text-green-600" size={48} />
        <h1 className="text-3xl font-bold text-green-800">Data Breach Detector</h1>
        <p className="text-gray-600 mt-2">
          Upload files to scan for exposed API keys, tokens, emails, credit card numbers, and passwords.
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-lg text-center space-y-4">
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="mb-2 cursor-pointer border p-2 rounded-md w-full text-sm"
        />

        {files.length > 0 && (
          <p className="text-xs text-gray-500">{files.length} file(s) selected</p>
        )}

        <button
          onClick={handleScan}
          disabled={scanning || !files.length}
          className={`w-full py-3 rounded-md text-white font-semibold ${
            scanning ? "bg-green-400 cursor-not-allowed" : "bg-green-700 hover:bg-green-800"
          }`}
        >
          {scanning ? "Scanning..." : "Scan for Data Breach"}
        </button>

        {error && (
          <div className="mt-4 text-red-600 font-semibold text-sm">{error}</div>
        )}

        {result && (
          <div className="mt-4 space-y-3 text-left">
            {/* Result message */}
            <div
              className={`p-3 rounded-lg text-sm font-semibold ${
                hasMatches
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-green-50 text-green-700 border border-green-200"
              }`}
            >
              {result.message}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div className="bg-gray-50 border rounded p-2">
                <span className="font-bold block text-gray-800">{result.totalLinesScanned?.toLocaleString() || 0}</span>
                Lines Scanned
              </div>
              <div className="bg-gray-50 border rounded p-2">
                <span className="font-bold block text-gray-800">{result.sensitiveMatches?.length || 0}</span>
                Sensitive Matches
              </div>
            </div>

            {/* Matches list */}
            {hasMatches && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <FileText size={12} /> Detected Patterns (Redacted)
                </p>
                <ul className="space-y-1 max-h-48 overflow-y-auto">
                  {result.sensitiveMatches.map((m, i) => (
                    <li key={i} className="text-xs font-mono bg-white border border-red-100 rounded px-2 py-1 text-red-800">
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* PDF download */}
            <button
              onClick={handleDownloadPDF}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              <Download size={16} />
              Download PDF Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
