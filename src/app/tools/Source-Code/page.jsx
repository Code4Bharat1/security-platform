"use client";
import { useState } from "react";

export default function SourceCodeAnalyzer() {
  const [code, setCode] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Utility to read file as text
  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleSubmit = async () => {
    setResult(null);
    setLoading(true);

    try {
      let finalCode = code.trim();

      if (!file && finalCode === "") {
        alert("Please paste code or upload a file.");
        setLoading(false);
        return;
      }

      if (file) {
        finalCode = await readFileAsText(file);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/analyze/analyzeCode`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: finalCode }),
        }
      );

      if (!res.ok) {
        throw new Error(`API error: ${res.statusText}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Error analyzing code:", err);
      setResult({ issues: ["❌ An error occurred while analyzing the code."] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black min-h-screen text-white flex flex-col items-center justify-center p-6">
      
      {/* Header Section */}
<div className="flex flex-col items-start gap-6 mb-10 text-left w-full max-w-3xl">
  <div className="flex items-center gap-6">
    {/* Logo Image */}
    <img
      src="/RedTeam/code.png"
      alt="Logo"
      className="w-20 h-20 rounded-full border-4 border-red-600 object-cover"
    />

    <div>
      <h1 className="text-4xl sm:text-5xl font-bold">
        <span className="text-white">Source Code</span>{" "}
        <span className="text-red-600">Analyzer</span>
      </h1>
      <p className="text-gray-300 text-lg mt-2">
        Scan your code for XSS & SQL Injection vulnerabilities.
      </p>
    </div>
  </div>
</div>


      {/* Main Analyzer Box */}
      <div className="bg-black border border-white rounded-2xl p-6 w-full max-w-3xl">
        
        {/* Paste Code */}
        <label className="block font-semibold mb-3 text-white text-base sm:text-lg md:text-xl">
          Paste Code:
        </label>
        <textarea
          className="w-full h-40 p-3 border border-white bg-black text-red-500 rounded-md mb-4 resize-none placeholder-red-500 text-base sm:text-lg md:text-xl"
          placeholder="Paste your HTML, JS, PHP code here..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
        ></textarea>

        {/* File Upload */}
        <div className="mb-4 flex items-center space-x-4">
          <label className="font-semibold text-white text-base sm:text-lg md:text-xl whitespace-nowrap">
            Upload File:
          </label>
          <input
            type="file"
            accept=".js,.html,.php,.txt"
            onChange={(e) => setFile(e.target.files[0])}
            className="block text-xs text-gray-300 file:mr-4 file:py-1 file:px-3
              file:rounded file:border-0 file:text-xs file:font-semibold
              file:bg-red-600 file:text-white hover:file:bg-red-700
              file:cursor-pointer"
          />
          {file && <span className="text-gray-300 text-xs">{file.name}</span>}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-red-600 text-white font-bold px-5 py-2 rounded-md hover:bg-red-700 transition text-sm"
          >
            {loading ? "Scanning..." : "Check Your Code"}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="mt-6 bg-gray-900 border border-gray-700 p-4 rounded-md">
            <h3 className="font-bold text-base mb-2 text-white">Scan Result:</h3>
            {result.issues?.length === 0 ? (
              <p className="text-green-500 text-sm">✅ No vulnerabilities found!</p>
            ) : (
              <ul className="list-disc pl-5 text-red-400 space-y-1 text-sm">
                {result.issues?.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
