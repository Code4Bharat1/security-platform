"use client";
import { useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";
import OwnershipVerificationWizard from "@/components/ownership/OwnershipVerificationWizard";

export default function SubdomainScanner() {
  const protectedAction = useProtectedAction();
  const [domain, setDomain] = useState("");
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ownershipVerified, setOwnershipVerified] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_PROD_API_URL;

  const formatDate = (iso) => {
    if (!iso) return "-";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  const formatDuration = (ms) => {
    if (ms === 0) return "0 ms";
    if (!ms && ms !== 0) return "-";
    if (ms < 1000) return `${ms} ms`;
    const sec = ms / 1000;
    if (sec < 60) return `${sec.toFixed(2)} s`;
    const m = Math.floor(sec / 60);
    const s = (sec % 60).toFixed(2);
    return `${m}m ${s}s`;
  };

  const handleSubmit = async () => {
    await protectedAction(async (token) => {
      setLoading(true);
      setError("");
      setResults([]);
      setStats(null);

      const cleanDomain = domain.trim().toLowerCase();
      if (!cleanDomain) {
        setError("Please enter a domain.");
        setLoading(false);
        return;
      }
      if (!ownershipVerified) {
        setError("Verify ownership of this domain before scanning subdomains.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.post(
          `${API_URL}/subdomain/subdomains-scan`,
          { domain: cleanDomain },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = response.data;

        setResults(data.results || []);
        setStats({
          total: data.total,
          startedAt: data.startedAt,
          finishedAt: data.finishedAt,
          durationMs: data.durationMs,
        });
      } catch (err) {
        console.error("Error fetching subdomains:", err);
        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Failed to fetch subdomains from server."
        );
      } finally {
        setLoading(false);
      }
    });
  };

  const downloadPDF = () => {
    if (!results || results.length === 0) return;

    const doc = new jsPDF();
    const tableColumn = ["#", "Subdomain"];
    const tableRows = [];

    results.forEach((item, index) => {
      const subdomainData = [index + 1, item.subdomain];
      tableRows.push(subdomainData);
    });

    // Header
    doc.setFontSize(20);
    doc.setTextColor(220, 38, 38); // Red-600
    doc.text("Security Platform", 14, 22);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Subdomain Enumeration Report", 14, 32);

    // Metadata
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const date = new Date().toLocaleString();
    doc.text(`Target Domain: ${domain}`, 14, 42);
    doc.text(`Total Subdomains Discovery: ${stats?.total || results.length}`, 14, 47);
    doc.text(`Scan Date: ${date}`, 14, 52);
    if (stats?.durationMs) {
      doc.text(`Scan Duration: ${formatDuration(stats.durationMs)}`, 14, 57);
    }

    // Table
    autoTable(doc, {
      startY: 65,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255] },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: "auto" },
      },
    });

    const fileName = `subdomain_scan_${domain.replace(/[^a-z0-9]/gi, "_")}.pdf`;
    doc.save(fileName);
  };

  const handleSubdomainClick = (subdomain) => {
    window.open(`https://${subdomain}`, "_blank");
  };

  return (
    <div className="tool-detail-page min-h-screen bg-black text-white">
      <div className="tool-detail-shell max-w-4xl mx-auto p-8">
        {/* Header */}
        {/* Header */}
        <div className="tool-detail-hero flex items-center justify-between mb-8 gap-4 sm:gap-6">
          {/* Logo (Left) */}
          <div className="w-30 h-30 sm:w-30 sm:h-30 rounded-full border-4 border-red-500 overflow-hidden flex items-center justify-center bg-gray-800">
            <img
              src="/RedTeam/subdomain.png"
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Title + Description (Right) */}
          <div className="flex-1 text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Subdomain Scanner
            </h1>
            <p className="text-gray-400 text-base sm:text-lg mt-1">
              Scan websites for analyzing subdomains and their security posture.
            </p>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-gray-900 border border-white-700 rounded-lg p-6">
          <div className="mb-6">
            <label className="block text-red-400 text-lg font-semibold mb-4">
              Subdomain
            </label>
            <input
              type="text"
              placeholder="Enter domain (e.g., example.com)"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full p-4 bg-white text-black rounded-lg text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-lg text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Scanning..." : "Find Subdomains"}
          </button>
          <OwnershipVerificationWizard
            targetValue={domain}
            targetLabel="Domain"
            onVerifiedChange={setOwnershipVerified}
            className="mt-4"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-900/50 border border-red-500 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="mt-6 bg-gray-900 border border-white-700 rounded-lg p-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total subdomains</p>
                <p className="text-white text-2xl font-bold">
                  {stats.total ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Scan duration</p>
                <p className="text-white text-2xl font-bold">
                  {formatDuration(stats.durationMs)}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-400 text-sm mb-1">Starting time</p>
                <p className="text-white font-medium">
                  {formatDate(stats.startedAt)}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-400 text-sm mb-1">Finish time</p>
                <p className="text-white font-medium">
                  {formatDate(stats.finishedAt)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4 text-white">Results</h3>
            <div className="bg-gray-900 border border-white-700 rounded-lg p-4 max-h-80 overflow-auto">
              <ul className="space-y-2">
                {results.map(({ subdomain }, idx) => (
                  <li key={idx}>
                    <button
                      onClick={() => handleSubdomainClick(subdomain)}
                      className="text-blue-400 hover:text-blue-300 hover:underline break-all text-left"
                    >
                      {subdomain}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={downloadPDF}
              className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Download PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
