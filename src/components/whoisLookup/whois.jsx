"use client";

import { useRef, useState } from "react";
import {
  Shield,
  Globe,
  CheckCircle,
  Clock,
  Server,
  FileDown,
  Download,
  Database,
  Lock,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";
import OwnershipVerificationWizard from "@/components/ownership/OwnershipVerificationWizard";

const ccToFlag = (cc) => {
  if (!cc) return "";
  return cc
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
};

const formatDate = (iso) => (iso ? new Date(iso).toLocaleString() : "—");

export default function WhoisLookup() {
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ownershipVerified, setOwnershipVerified] = useState(false);
  const cardRef = useRef(null);

  const protectedAction = useProtectedAction();

  const handleLookup = async (e) => {
    e?.preventDefault?.();
    setError("");
    setResult(null);

    const v = domain.trim();
    if (!v) return setError("Please enter a domain name.");
    if (v.includes("http://") || v.includes("https://"))
      return setError("Enter domain name only (no http/https).");
    if (!ownershipVerified) {
      return setError("Verify ownership of this domain before running a WHOIS scan.");
    }

    setLoading(true);

    await protectedAction(async (token) => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_PROD_API_URL || "";
        const res = await fetch(`${apiBase}/whois/whois-scan`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ send token for protected access
          },
          body: JSON.stringify({ domain: v }),
        });

        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          setError(json.error || `Request failed: ${res.status}`);
        } else {
          setResult(json);
        }
      } catch (err) {
        console.error("Lookup error", err);
        setError("Network error: " + (err?.message || err));
      } finally {
        setLoading(false);
      }
    });
  };

  const downloadPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    doc.text(`WHOIS Report for ${result.input || domain}`, 10, 10);
    const text = JSON.stringify(result.summary || result, null, 2);
    const lines = doc.splitTextToSize(text, 180);
    doc.text(lines, 10, 20);
    doc.save("whois-report.pdf");
  };

  const downloadPNG = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current);
      const link = document.createElement("a");
      link.download = "whois-report.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("PNG export error", err);
      setError("Could not export PNG: " + (err?.message || err));
    }
  };

  const summary = result?.summary;

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header (left) */}
        <div className="flex items-center gap-4 mb-4 mt-15">
          <div className="w-30 h-30 sm:w-24 md:w-30 sm:h-24 md:h-30 rounded-full overflow-hidden border-4 border-red-500 -ml-2 sm:-ml-3 md:-ml-5 flex-shrink-0">
            <img
              src="/Redteam/whois.png"
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="text-left">
            <h1 className="text-3xl font-bold">Whois Domain Lookup</h1>
            <p className="text-sm text-gray-400">
              Retrieve domain registration and ownership details.
            </p>
          </div>
        </div>

        <div className="border border-white mb-4 text-center px-10 py-10">
          <p>WHOIS LOOKUP (Enhanced)</p>

          {/* Centered form */}
          <div className="w-full flex justify-center">
            <form
              onSubmit={handleLookup}
              className="w-full max-w-2xl flex flex-col gap-4"
            >
              <input
                type="text"
                placeholder="example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full px-4 py-3 rounded-full bg-black border border-white text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              />

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
              >
                {loading ? "Looking up…" : "Lookup"}
              </button>
            </form>
          </div>
          <OwnershipVerificationWizard
            targetValue={domain}
            targetLabel="Domain"
            onVerifiedChange={setOwnershipVerified}
            className="mt-6"
          />

          {error && <p className="text-red-500 mt-4">{error}</p>}

          {result?.ok && (
            <>
              <section
                ref={cardRef}
                className="bg-gray-900 text-white rounded-xl shadow p-5 mt-6"
              >
                <h2 className="text-xl font-bold mb-4">Domain Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-red-500" />
                    <span className="font-semibold">Domain:</span>
                    <span>{summary?.domainName || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-red-500" />
                    <span className="font-semibold">Registrar:</span>
                    <span>{summary?.registrar || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-red-500" />
                    <span className="font-semibold">Created:</span>
                    <span>{formatDate(summary?.creationDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-red-500" />
                    <span className="font-semibold">Expires:</span>
                    <span>{formatDate(summary?.registryExpiryDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-red-500" />
                    <span className="font-semibold">Country:</span>
                    <span>
                      {ccToFlag(summary?.country)} {summary?.country || "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-500" />
                    <span className="font-semibold">Status:</span>
                    <div className="flex flex-wrap items-center">
                      {summary?.status?.length ? (
                        summary.status.map((s, i) => (
                          <span
                            key={i}
                            className="ml-1 inline-block px-2 py-0.5 text-xs rounded-full font-semibold bg-red-500 text-white"
                          >
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="ml-2">—</span>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <div className="flex gap-4 mt-4">
                <button
                  onClick={downloadPDF}
                  className="flex items-center gap-2 px-4 py-2 rounded border border-red-500 text-red-500 hover:bg-red-600 hover:text-white"
                >
                  <FileDown className="w-4 h-4" /> PDF
                </button>
                <button
                  onClick={downloadPNG}
                  className="flex items-center gap-2 px-4 py-2 rounded border border-red-500 text-red-500 hover:bg-red-600 hover:text-white"
                >
                  <Download className="w-4 h-4" /> PNG
                </button>
              </div>

              <section className="bg-gray-900 text-white rounded-xl shadow p-5 mt-6">
                <h2 className="text-xl font-bold mb-2">WHOIS Raw Data</h2>
                <pre className="whitespace-pre-wrap text-sm text-gray-300 bg-black p-4 rounded">
                  {result.raw || "—"}
                </pre>
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
