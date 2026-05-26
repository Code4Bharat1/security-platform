"use client";
import { useState } from "react";
import axios from "axios";
import GreenLayout from "../GreenTeam/layout";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";

export default function WebsiteOptimizationTool() {
  const [url, setUrl] = useState("");
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const protection = useProtectedAction();

  const handleScan = async () => {
    const trimmedUrl = url.trim();

    if (!trimmedUrl || !trimmedUrl.startsWith("http")) {
      setError("❌ Please enter a valid URL that starts with http or https.");
      setInfo("");
      return;
    }

    await protection(async (userToken) => {
      try {
        setLoading(true);
        setError("");
        setInfo("");

        console.log("📡 Sending URL to backend:", trimmedUrl);
        console.log("🔑 Using auth token:", userToken ? "Present" : "Missing");

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/website-optimization`,
          {
            url: trimmedUrl,
          },
          {
            headers: {
              Authorization: `Bearer ${userToken}`, // ✅ ADD THIS
            },
          }
        );

        setInfo(response.data.message);
      } catch (err) {
        console.error("❌ Error during scan:", err);
        setError(
          err.response?.data?.error || "Something went wrong. Please try again."
        );
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <div className="tool-detail-page flex min-h-screen flex-col items-center px-3 pt-10 pb-24">
      <GreenLayout
        heroData={{
          imgPath: "/GreenTeam/optimization.png",
          title: "Website Optimization Tool",
          desc: "Analyze and optimize your website for better performance and SEO.",
        }}
      />
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-card)] p-6 shadow-[var(--shadow-elevated)]">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value.trim())}
          placeholder="Enter website URL (e.g. https://example.com)"
          className="mb-4 w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-subtle)] p-3 text-[color:var(--text-body)] placeholder:text-[color:var(--text-muted)] focus:outline-none"
        />
        <button
          onClick={handleScan}
          disabled={loading}
          className="w-full rounded-lg border border-[color:var(--gold)] bg-[color:var(--gold)] py-3 font-semibold text-[color:var(--text-inverse)] transition duration-300 hover:bg-[color:var(--gold-strong)] disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>

        {error && <p className="mt-4 text-center text-[color:var(--danger)]">{error}</p>}
        {info && (
          <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-subtle)] p-4 text-sm text-[color:var(--text-heading)]">
            {info}
          </pre>
        )}
      </div>
    </div>
  );
}
