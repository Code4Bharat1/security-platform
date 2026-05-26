'use client'
import { jsPDF } from "jspdf";
import { useState } from "react";
import { SearchIcon } from 'lucide-react';

export default function SecurityChecker() {
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState(null);
  const [error, setError] = useState(null);

  const fetchHeaders = async () => {
    try {
      setError(null);
      const response = await fetch(`${process.env.NEXT_PUBLIC_PROD_API_URL}/checkHeaders?url=${url}`);
      const data = await response.json();

      if (data.securityHeaders) {
        setHeaders(data.securityHeaders);
      } else {
        setError("Invalid response or missing headers.");
      }
    } catch (err) {
      setError("Failed to fetch headers.");
    }
  };

  const generateReport = () => {
    if (!headers) return;

    const doc = new jsPDF();
    doc.text("HTTP Header Security Report", 20, 20);

    Object.entries(headers).forEach(([header, status], index) => {
      doc.text(`${header}: ${status}`, 20, 40 + index * 10);
    });

    doc.save("security-report.pdf");
  };

  return (
    <div className="tool-detail-page flex min-h-screen flex-col items-center">
      <div className="tool-detail-shell flex w-full max-w-4xl flex-col items-center text-center">
        <img src="/tools/card-images/https-security.png" alt="verify" className="mb-4 mt-7 h-20 w-16" />
        <h1 className="mt-3 text-3xl font-bold text-[color:var(--text-heading)] md:text-4xl">
          Protect Your Website
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-[color:var(--text-muted)]">
          Our advanced security scanner identifies vulnerabilities before attackers can exploit them.
        </p>

        <div className="mt-10 w-full max-w-4xl rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-card)] p-6 shadow-[var(--shadow-elevated)]">
          <h2 className="mb-5 mt-4 text-center text-2xl font-bold text-[color:var(--text-heading)]">
            HTTP Header Security Checker
          </h2>
          <input
            type="text"
            placeholder="Enter website URL"
            value={url}
            onChange={(e) => setUrl(e.target.value.trim())}
            className="mt-3 w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-subtle)] p-3 text-[color:var(--text-body)] placeholder:text-[color:var(--text-muted)]"
          />
          <button
            onClick={fetchHeaders}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-[color:var(--gold)] bg-[color:var(--gold)] px-4 py-3 text-[color:var(--text-inverse)] transition-colors duration-300 hover:bg-[color:var(--gold-strong)]"
          >
            <SearchIcon className="h-5 w-5" />
            Check Headers
          </button>

          {error && <p className="mt-3 text-[color:var(--danger)]">{error}</p>}

          {headers && (
            <div className="mt-4">
              <h3 className="text-xl font-semibold text-[color:var(--text-heading)]">
                Security Headers Found:
              </h3>
              <table className="mt-2 w-full overflow-hidden rounded-xl border border-[color:var(--border)]">
                <thead>
                  <tr className="bg-[color:var(--surface-subtle)]">
                    <th className="p-2 text-left">Header</th>
                    <th className="p-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(headers).map(([key, value]) => (
                    <tr key={key} className="border-t border-[color:var(--border)]">
                      <td className="p-2 font-mono">{key}</td>
                      <td
                        className={`p-2 ${value === "Missing" ? "text-[color:var(--danger)]" : "text-[color:var(--success)]"}`}
                      >
                        {value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button
                onClick={generateReport}
                className="mt-4 rounded-lg border border-[color:var(--gold)] bg-[color:var(--gold)] px-4 py-2 text-[color:var(--text-inverse)] hover:bg-[color:var(--gold-strong)]"
              >
                Download Report
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
