'use client';
import { useState } from 'react';
import { toast } from "react-hot-toast";

export default function SonarForm() {
  const [code, setCode] = useState("");
  const [results, setResults] = useState([]);

 const handleAnalyze = async () => {           
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_API_URL}/sonar/sonar_analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

      const errText = await res.text();
      console.error("Server error:", errText);
      toast.error("Analysis failed. See console for details.");
      return;
    }

    const data = await res.json();
    setResults(data.issues);
  } catch (err) {
    console.error("Error parsing response:", err);
    toast.error("Something went wrong while analyzing the code.");
  }
};

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-4">Code Security Analyzer</h1>
      <textarea
        className="w-full h-64 p-4 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none"
        placeholder="Paste your code here..."
        value={code}
        onChange={(e) => setCode(e.target.value.trim())}     />
      <button
        onClick={handleAnalyze}
        className="mt-4 px-6 py-2 bg-blue-600 rounded hover:bg-blue-700 transition"
      >
        Analyze
      </button>

      {results.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-2">Results</h2>
          <table className="w-full border-collapse border border-gray-700">
            <thead>
              <tr>
                <th className="border border-gray-700 px-4 py-2">Line</th>
                <th className="border border-gray-700 px-4 py-2">Issue</th>
              </tr>
            </thead>
            <tbody>
              {results.map((issue, index) => (
                <tr key={index}>
                  <td className="border border-gray-700 px-4 py-2">{issue.line}</td>
                  <td className="border border-gray-700 px-4 py-2">{issue.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

