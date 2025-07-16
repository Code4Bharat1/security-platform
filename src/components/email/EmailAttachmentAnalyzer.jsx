"use client";
import { useState } from "react";
import { MailSearch } from "lucide-react";

export default function EmailAttachmentAnalyzer() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
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
      const res = await fetch("https://zypher-api.code4bharat.com/api/email-attachment", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data.message || "✅ File analyzed successfully.");
    } catch (error) {
      setResult("❌ Failed to analyze file.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-20 px-4">
      <div className="text-center mb-10">
        <MailSearch className="mx-auto mb-4 text-blue-600" size={48} />
        <h1 className="text-3xl font-bold text-green-800">Email Attachment Analyzer</h1>
        <p className="text-gray-600 mt-2">
          Upload an attachment file to scan for threats or malware.
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-lg text-center">
        <input
          type="file"
          onChange={handleFileChange}
          className="mb-4 border cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-green-700 file:text-white hover:file:bg-green-800"
        />

        <button
          onClick={handleAnalyze}
          disabled={!file || loading}
          className={`w-full py-3 rounded-md text-white font-semibold ${
            loading
              ? "bg-green-400 cursor-not-allowed"
              : "bg-green-700 hover:bg-green-800"
          }`}
        >
          {loading ? "Analyzing..." : "Analyze File"}
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
