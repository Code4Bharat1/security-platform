"use client";
import { useState } from "react";
import { Link2 } from "lucide-react";

export default function UrlShortener() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleShorten = async () => {
    if (!originalUrl.trim()) return;
    setLoading(true);
    setError("");
    setShortUrl("");
    const url = `${process.env.NEXT_PUBLIC_PROD_API_URL.replace("/api", "")}/shorten`

    try {
      console.log(url)
      const res = await fetch(`${url}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalUrl }),
      });

      const data = await res.json();
      if (res.ok) {
        // ✅ Show short URL with professional prefix
        const professionalUrl = `${url.replace("/shorten", "")}/${data.code}`;
        setShortUrl(professionalUrl);
      } else {
        setError(data.message || "Failed to shorten URL.");
      }
    } catch (err) {
      setError("❌ Failed to shorten URL.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-50 flex flex-col items-center pt-20 px-4">
      <div className="text-center mb-8">
        <Link2 className="mx-auto mb-3 text-green-700" size={48} />
        <h1 className="text-3xl font-bold text-green-900">URL Shortener</h1>
        <p className="text-gray-700 mt-1 text-sm">Make your long links short, clean & professional.</p>
      </div>

      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-xl text-center">
        <input
          type="text"
          placeholder="🔗 Paste your long URL here..."
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          className="w-full px-4 py-3 mb-5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
        />

        <button
          onClick={handleShorten}
          disabled={loading || !originalUrl}
          className={`w-full py-3 rounded-xl text-white font-semibold transition ${
            loading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Shortening..." : "Generate Short URL"}
        </button>

        {shortUrl && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4 shadow-inner">
            <p className="text-gray-800 text-sm mb-1">Your short link:</p>
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-800 font-semibold break-words underline"
            >
              {shortUrl}
            </a>
          </div>
        )}

        {error && <div className="mt-6 text-red-600 font-semibold">{error}</div>}
      </div>
    </div>
  );
}
