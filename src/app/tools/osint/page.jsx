"use client";
import { useState } from "react";

export default function OsintTool() {
  const [queryType, setQueryType] = useState("username");
  const [queryValue, setQueryValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [foundOn, setFoundOn] = useState([]);

  const handleCheck = async () => {
    if (!queryValue.trim()) return;
    setLoading(true);
    setFoundOn([]);

    try {
      const res = await fetch("http://localhost:4180/api/osint/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          [queryType]: queryValue 
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFoundOn(data.foundOn || []);
      } else {
        console.error("Scan failed:", data.message);
      }
    } catch (err) {
      console.error("Error:", err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-20 px-4">
      <h1 className="text-3xl font-bold mb-4 text-green-800">OSINT Checker</h1>
      <p className="mb-6 text-gray-600">Check if a username, email, or phone exists on popular platforms</p>

      <div className="bg-white shadow-md rounded-xl p-6 w-full max-w-md">
        <select
          value={queryType}
          onChange={(e) => setQueryType(e.target.value)}
          className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
        >
          <option value="username">Username</option>
          <option value="email">Email</option>
          <option value="phone">Phone</option>
        </select>

        <input
          type="text"
          placeholder={`Enter ${queryType}...`}
          value={queryValue}
          onChange={(e) => setQueryValue(e.target.value)}
          className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
        />

        <button
          onClick={handleCheck}
          disabled={loading || !queryValue}
          className={`w-full py-3 rounded-md text-white font-semibold transition ${
            loading ? "bg-green-400 cursor-not-allowed" : "bg-green-700 hover:bg-green-800"
          }`}
        >
          {loading ? "Scanning..." : "Scan Platforms"}
        </button>

        {foundOn.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Found on:</h3>
            <ul>
              {foundOn.map((platform, idx) => (
                <li key={idx} className="text-green-700 mb-1">✅ {platform}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
