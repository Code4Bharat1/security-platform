"use client";
import { useState } from "react";
import { ExternalLink, Search, ShieldAlert } from "lucide-react";
import GreenLayout from "../GreenTeam/layout";

const statusChip = (status) => {
  const base = "px-2 py-0.5 rounded text-xs font-semibold";
  switch (status) {
    case "found":
      return `${base} bg-green-600/20 text-green-300 border border-green-600/40`;
    case "not_found":
      return `${base} bg-red-600/20 text-red-300 border border-red-600/40`;
    case "invalid":
      return `${base} bg-yellow-600/20 text-yellow-200 border border-yellow-600/40`;
    case "error":
      return `${base} bg-orange-600/20 text-orange-200 border border-orange-600/40`;
    default:
      return `${base} bg-gray-600/20 text-gray-300 border border-gray-600/40`;
  }
};

export default function OsintTool() {
  const [queryType, setQueryType] = useState("username"); // username | email | phone
  const [queryValue, setQueryValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null); // { success, details, foundOn, ... }
  const [error, setError] = useState("");

  const handleCheck = async () => {
    if (!queryValue.trim()) return;
    setLoading(true);
    setResults(null);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_API_URL}/osint/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [queryType]: queryValue }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Scan failed");
      } else {
        setResults(data);
      }
    } catch (e) {
      setError(e.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center pt-16 px-4">
      <GreenLayout
        heroData={{
          imgPath: "/GreenTeam/DataBreach1.png",
          title: "OSINT Checker",
          desc: "Verify if a username/email appears on public platforms",
        }}
      />
      <div className="w-full border border-white max-w-2xl bg-black rounded-xl shadow p-6">
        <div className="grid sm:grid-cols-3 gap-3">
          <select
            value={queryType}
            onChange={(e) => setQueryType(e.target.value)}
            className="w-full px-4 py-3 border border-gray-700 bg-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            <option value="username">Username</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
          </select>

          <input
            type="text"
            placeholder={`Enter ${queryType}…`}
            value={queryValue}
            onChange={(e) => setQueryValue(e.target.value)}
            className="w-full px-4 py-3 border border-gray-700 bg-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
          />

          <button
            onClick={handleCheck}
            disabled={loading || !queryValue.trim()}
            className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md font-semibold transition ${
              loading || !queryValue.trim()
                ? "bg-green-700/50 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            <Search size={18} />
            {loading ? "Scanning…" : "Scan Platforms"}
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 text-red-300 bg-red-900/30 border border-red-800 rounded p-3">
            <ShieldAlert size={18} className="mt-0.5" />
            <div className="text-sm">{error}</div>
          </div>
        )}

        {results && (
          <div className="mt-6">
            <div className="text-sm text-gray-300 mb-3">
              <span className="font-semibold">Query:</span>{" "}
              <span className="text-gray-200">{results.queryType}</span>{" "}
              <span className="text-gray-400">→</span>{" "}
              <span className="text-gray-100 break-all">{results.queryValue}</span>
            </div>

            <div className="space-y-2">
              {(results.details || []).map((row, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-gray-100">{row.platform}</div>
                    {row.url ? (
                      <a
                        href={row.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-green-300 hover:underline inline-flex items-center gap-1 break-all"
                      >
                        {row.url}
                        <ExternalLink size={14} />
                      </a>
                    ) : (
                      <div className="text-xs text-gray-400">No public URL</div>
                    )}
                    {row.note && <div className="text-xs text-yellow-300 mt-1">{row.note}</div>}
                    {row.error && <div className="text-xs text-orange-300 mt-1">Error: {row.error}</div>}
                  </div>
                  <div className={statusChip(row.status)}>{row.status}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-xs text-gray-500">
              Tip: Some platforms gate profiles behind auth or anti-bot measures; such checks may appear as
              <span className="mx-1 px-1 py-0.5 rounded bg-gray-700/60">unknown</span>.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
