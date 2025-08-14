"use client";
import { useState } from "react";

export default function SourceCodeAnalyzer() {
  const [code, setCode] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);

    let finalCode = code;

    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        finalCode = e.target.result;

        const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_API_URL}/analyze/analyzeCode`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: finalCode }),
        });

        const data = await res.json();
        setResult(data);
        setLoading(false);
      };
      reader.readAsText(file);
    } else {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_API_URL}/analyze/analyzeCode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      setResult(data);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-2xl mx-auto mt-10 border border-gray-300">
      <h2 className="text-3xl font-bold mb-4 text-center text-green-800">🔍 Source Code Analyzer</h2>
      <p className="text-center text-gray-600 mb-6">
        Scan your code for XSS & SQL Injection vulnerabilities.
      </p>

      {/* Paste Code */}
      <label className="block font-semibold mb-2">Paste Code:</label>
      <textarea
        className="w-full h-40 p-3 border border-gray-300 rounded-md mb-4 resize-none"
        placeholder="Paste your HTML / JS / PHP code here..."
        value={code}
        onChange={(e) => setCode(e.target.value)}
      ></textarea>

      {/* OR File Upload */}
      <div className="mb-4">
        <label className="block font-semibold mb-2">Or Upload File:</label>
        <input
          type="file"
          accept=".js,.html,.php,.txt"
          onChange={(e) => setFile(e.target.files[0])}
          className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4
            file:rounded file:border-0 file:text-sm file:font-semibold
            file:bg-green-100 file:text-green-700 hover:file:bg-green-200"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-green-700 text-white py-2 rounded-md hover:bg-green-800 transition"
      >
        {loading ? "Scanning..." : "Check Your Code"}
      </button>

      {/* Results */}
      {result && (
        <div className="mt-6 bg-gray-50 p-4 rounded-md">
          <h3 className="font-bold text-lg mb-2">Scan Result:</h3>
          {result.issues.length === 0 ? (
            <p className="text-green-600">✅ No vulnerabilities found!</p>
          ) : (
            <ul className="list-disc pl-5 text-red-600 space-y-1">
              {result.issues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
