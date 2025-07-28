"use client";
import { useState } from "react";
import { FileSearch } from "lucide-react";

export default function FileMetadataAnalyzer() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("https://zypher-api.code4bharat.com/api/file-metadata", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResult(data.metadata || {});
    } catch (err) {
      setResult({ error: "❌ Analysis failed." });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-20 px-4">
      <div className="text-center mb-10">
        <FileSearch className="mx-auto mb-4 text-green-600" size={48} />
        <h1 className="text-3xl font-bold text-green-800">File Metadata Analyzer</h1>
        <p className="text-gray-600 mt-2">
          Upload a file to extract hidden metadata for analysis.
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-lg text-center">
        <input
          type="file"
          onChange={handleChange}
          className="mb-4 px-4 py-2 w-full border border-gray-300 rounded-md text-gray-700 cursor-pointer file:bg-green-700 file:text-white file:font-semibold file:px-4 file:py-2 file:rounded-md"
        />

        <button
          onClick={handleAnalyze}
          disabled={loading || !file}
          className={`w-full py-3 rounded-md text-white font-semibold transition ${
            loading
              ? "bg-green-400 cursor-not-allowed"
              : "bg-green-700 hover:bg-green-800"
          }`}
        >
          {loading ? "Analyzing..." : "Analyze File"}
        </button>

        {result && (
          <div className="mt-6 text-left text-sm text-gray-800 max-h-96 overflow-auto bg-gray-50 p-4 rounded-md border border-green-200">
            <h2 className="font-semibold mb-2 text-green-700">📋 Metadata Result:</h2>
            <ul className="space-y-1">
              {Object.entries(result).map(([key, value]) => (
                <li key={key}>
                  <strong>{key}:</strong> {JSON.stringify(value)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
