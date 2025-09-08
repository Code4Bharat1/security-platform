"use client";
import { useState } from "react";
import { MailSearch } from "lucide-react";
import GreenLayout from "../GreenTeam/layout";

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
      const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_API_URL}/email-attachment`, {
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
    <div className="min-h-screen bg-black flex flex-col items-center pt-20 px-4">
    
      <GreenLayout  
        heroData={{
          imgPath: "/GreenTeam/email.png",
          title: "Email Attachment Analyzer",
          desc: "Upload an email attachment to scan for potential threats or malware.",
        }}
      />

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
