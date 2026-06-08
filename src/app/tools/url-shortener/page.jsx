"use client";
import { useState } from "react";
import { Link2 } from "lucide-react";
import GreenLayout from "@/components/GreenTeam/layout";
import useProtectedAction from "@/components/UseProtectedAction/UseProtectedAction";

export default function UrlShortener() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const protectedAction = useProtectedAction();

  const handleShorten = async () => {
    const trimmedUrl = originalUrl.trim();
    if (!trimmedUrl) return;

    let formatted = trimmedUrl;
    if (!/^https?:\/\//i.test(formatted)) {
      formatted = 'https://' + formatted;
    }

    let isValid = false;
    try {
      const parsed = new URL(formatted);
      const hostname = parsed.hostname;
      const isIp = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname);
      if ((parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
          (hostname === 'localhost' || isIp || hostname.includes('.'))) {
        isValid = true;
      }
    } catch (_) {
      isValid = false;
    }

    if (!isValid) {
      setError("❌ Invalid URL. Please enter a valid URL (e.g., https://example.com).");
      setShortUrl("");
      return;
    }

    setLoading(true);
    setError("");
    setShortUrl("");
    const url = `${process.env.NEXT_PUBLIC_PROD_API_URL.replace(
      "/api",
      ""
    )}/shorten`;
    await protectedAction(async (userToken) => {
      try {
        console.log(url);
        const res = await fetch(`${url}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
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
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center pt-20 px-4">
      <GreenLayout
        heroData={{
          imgPath: "/GreenTeam/shorted-url.png",
          title: "URL Shortener",
          desc: "Make your long links short, clean & professional.",
        }}
      />

      <div className="bg-black border border-white shadow-2xl rounded-2xl p-8 w-full max-w-xl text-center">
        <input
          type="text"
          placeholder="🔗 Paste your long URL here..."
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          className="w-full px-4 py-3 mb-5 border border-white text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
        />

        <button
          onClick={handleShorten}
          disabled={loading || !originalUrl}
          className={`w-50 py-3 rounded-xl text-white font-semibold transition ${
            loading
              ? "bg-green-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
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

        {error && (
          <div className="mt-6 text-red-600 font-semibold">{error}</div>
        )}
      </div>
    </div>
  );
}
