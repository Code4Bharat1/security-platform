"use client";
import { useState } from "react";
import { Link2Off } from "lucide-react";

export default function BrokenLinkScanner() {
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);

  const handleScan = async () => {
    if (!url.trim()) return;

    setScanning(true);
    setResult(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_API_URL}/broken-link/brokenlink-stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      setResult(data.message || "Scan complete. No broken links found.");
    } catch (err) {
      setResult("Failed to scan website.");
    }

    setScanning(false);
  };

  return (
    <div className="tool-detail-page flex min-h-screen flex-col items-center px-4 pt-20">
      <div className="tool-detail-shell text-center">
        <Link2Off className="mx-auto mb-4 text-[color:var(--gold)]" size={48} />
        <h1 className="text-3xl font-bold text-[color:var(--text-heading)]">
          Broken Link & Dead Page Scanner
        </h1>
        <p className="mt-2 text-[color:var(--text-muted)]">
          Finds broken links and dead pages on websites.
        </p>

        <div className="mx-auto mt-10 w-full max-w-lg rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-card)] p-6 text-center shadow-[var(--shadow-elevated)]">
          <input
            type="text"
            placeholder="Enter website URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value.trim())}
            className="mb-4 w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-subtle)] px-4 py-3 text-[color:var(--text-body)] placeholder:text-[color:var(--text-muted)]"
          />

          <button
            onClick={handleScan}
            disabled={scanning || !url}
            className={`w-full rounded-lg border border-[color:var(--gold)] py-3 font-semibold text-[color:var(--text-inverse)] transition ${
              scanning
                ? "cursor-not-allowed bg-[color:var(--gold)] opacity-70"
                : "bg-[color:var(--gold)] hover:bg-[color:var(--gold-strong)]"
            }`}
          >
            {scanning ? "Scanning..." : "Scan Website"}
          </button>

          {result && (
            <div className="mt-6 text-center font-semibold text-[color:var(--text-heading)]">
              {result}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
