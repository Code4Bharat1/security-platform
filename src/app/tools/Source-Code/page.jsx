"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useProtectedAction from "@/components/UseProtectedAction/UseProtectedAction";
import { toast } from "react-hot-toast";

export default function SourceCodeAnalyzer() {
  const router = useRouter();
  const protectedAction = useProtectedAction();

  const [code, setCode] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Utility: read file as text
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

    await protectedAction(async (token) => {
      try {
        // 1️⃣ Prepare code
        let finalCode = code.trim();
        if (!file && finalCode === "") {
          toast.error("Please paste code or upload a file.");
          setLoading(false);
          return;
        }
        if (file) finalCode = await readFileAsText(file);

        // 2️⃣ Run code analysis API
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/source-code/analyze-code`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ code: finalCode }),
          }
        );

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `API error: ${res.statusText}`);
        }

        const data = await res.json();
        console.log("Scan API response:", data);
        setResult(data);
      } catch (err) {
        console.error("Error:", err);
        toast.error(err.message || "An error occurred while analyzing the code.");
        setResult({
          results: ["❌ An error occurred while analyzing the code."],
          passed: 0,
          failed: 1,
          riskBand: "Error",
        });
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <div className="tool-detail-page flex min-h-screen flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="mb-10 flex w-full max-w-3xl flex-col items-start gap-6 text-left">
        <div className="flex items-center gap-6">
          <img
            src="/RedTeam/code.png"
            alt="Logo"
            className="h-30 w-30 rounded-full border-4 border-[color:var(--gold)] object-cover"
          />
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold">
                <span className="text-[color:var(--text-heading)]">Source Code</span>{" "}
                <span className="text-[color:var(--gold)]">Analyzer</span>
            </h1>
            <p className="mt-2 text-lg text-[color:var(--text-muted)]">
              Scan your code for XSS & SQL Injection vulnerabilities.
            </p>
          </div>
        </div>
      </div>

      {/* Main Analyzer Box */}
      <div className="w-full max-w-3xl rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-card)] p-6 shadow-[var(--shadow-elevated)]">
        {/* Paste Code */}
        <label className="mb-3 block text-base font-semibold text-[color:var(--text-heading)] sm:text-lg md:text-xl">
          Paste Code:
        </label>
        <textarea
          className="mb-4 h-40 w-full resize-none rounded-md border border-[color:var(--border)] bg-[color:var(--surface-subtle)] p-3 text-base text-[color:var(--text-heading)] placeholder:text-[color:var(--text-muted)] sm:text-lg md:text-xl"
          placeholder="Paste your HTML, JS, PHP code here..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
        ></textarea>

        {/* File Upload */}
        <div className="mb-4 flex items-center space-x-4">
          <label className="whitespace-nowrap text-base font-semibold text-[color:var(--text-heading)] sm:text-lg md:text-xl">
            Upload File:
          </label>
          <input
            type="file"
            accept=".js,.html,.php,.txt"
            onChange={(e) => setFile(e.target.files[0])}
            className="block text-xs text-[color:var(--text-muted)] file:mr-4 file:rounded file:border-0
              file:bg-[color:var(--gold)] file:px-3 file:py-1 file:text-xs
              file:font-semibold file:text-[color:var(--text-inverse)] hover:file:bg-[color:var(--gold-strong)]
              file:cursor-pointer"
          />
          {file && <span className="text-xs text-[color:var(--text-muted)]">{file.name}</span>}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-md border border-[color:var(--gold)] bg-[color:var(--gold)] px-5 py-2 text-sm font-bold text-[color:var(--text-inverse)] transition hover:bg-[color:var(--gold-strong)]"
          >
            {loading ? "Scanning..." : "Check Your Code"}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="mt-6 rounded-md border border-[color:var(--border)] bg-[color:var(--surface-subtle)] p-4">
            <h3 className="mb-2 text-base font-bold text-[color:var(--text-heading)]">
              Scan Result:
            </h3>

            {/* Language & Risk Info */}
            {result.language && (
              <p className="text-gray-400 text-sm mb-1">
                Language: <span className="text-white">{result.language}</span>
              </p>
            )}
            {result.riskBand && (
              <p className="text-gray-400 text-sm mb-1">
                Risk Level:{" "}
                <span
                  className={`font-semibold ${
                    result.riskBand === "Critical"
                      ? "text-red-600"
                      : result.riskBand === "High"
                      ? "text-orange-500"
                      : result.riskBand === "Medium"
                      ? "text-yellow-500"
                      : result.riskBand === "Low"
                      ? "text-blue-400"
                      : "text-green-500"
                  }`}
                >
                  {result.riskBand}
                </span>
                {result.riskScore !== undefined &&
                  ` (Score: ${result.riskScore}/100)`}
              </p>
            )}

            <p className="text-gray-400 text-sm mb-2">
              ✅ Passed: {result.passed} | ❌ Failed: {result.failed}
            </p>

            {result.results?.length === 0 || result.failed === 0 ? (
              <p className="text-green-500 text-sm">
                ✅ No vulnerabilities found!
              </p>
            ) : (
              <ul className="list-disc pl-5 text-red-400 space-y-1 text-sm">
                {result.results?.map((issue, index) => (
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
