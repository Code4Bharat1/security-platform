"use client";
import { useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const dnsTypeMap = { 1: "A", 28: "AAAA", 15: "MX", 16: "TXT", 2: "NS" };
const getTypeName = (n) => dnsTypeMap[n] || `Type ${n}`;
const RECORD_TYPES = ["A", "AAAA", "MX", "TXT", "NS"];

export default function Webrecon() {
  const [domain, setDomain] = useState("");
  const [recordType, setRecordType] = useState("A");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [scan, setScan] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState("");

  const API_BASE = useMemo(() => {
    return process.env.NEXT_PUBLIC_PROD_API_URL?.replace(/\/+$/, "") || "";
  }, []);

  const normalizeDomain = (d) =>
    String(d).trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "");

  // DNS Lookup
  const handleLookup = async () => {
    setError("");
    setResult(null);

    const target = normalizeDomain(domain);
    if (!target) {
      setError("Please enter a domain");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/dns/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: target, type: recordType }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success)
        throw new Error(data?.error || `Request failed (${res.status})`);
      setResult(data.data);
    } catch (e) {
      setError(e?.message || "Error fetching DNS data");
    } finally {
      setLoading(false);
    }
  };

  // Deep Scan
  const handleDeepScan = async () => {
    setScanError("");
    setScan(null);
    setScanLoading(true);

    const target = normalizeDomain(domain);
    if (!target) {
      setScanError("Please enter a domain");
      setScanLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/dns/recon-scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: target }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);

      setScan(data);
    } catch (e) {
      setScanError(e.message || "Deep scan failed");
    } finally {
      setScanLoading(false);
    }
  };

  // CSV export
  const downloadCSV = () => {
    if (!scan) return;
    const csvContent = [
      "Section,Key,Value",
      `WHOIS,Registrar,${scan.whois?.registrar || "-"}`,
      `WHOIS,Created,${scan.whois?.created || "-"}`,
      `WHOIS,Expires,${scan.whois?.expires || "-"}`,
      `SSL,Issuer,${scan.ssl?.issuer || "-"}`,
      `SSL,Valid Till,${scan.ssl?.validTo || "-"}`,
      `SSL,Protocol,${scan.ssl?.protocol || "-"}`,
      `GeoIP,IP,${scan.geoip?.ip || "-"}`,
      `GeoIP,Country,${scan.geoip?.country || "-"}`,
      `GeoIP,ISP,${scan.geoip?.isp || "-"}`
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "website_recon.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // PDF export
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Website Recon Report", 14, 16);
    autoTable(doc, {
      head: [["Section", "Key", "Value"]],
      body: [
        ["WHOIS", "Registrar", scan?.whois?.registrar || "-"],
        ["WHOIS", "Created", scan?.whois?.created || "-"],
        ["WHOIS", "Expires", scan?.whois?.expires || "-"],
        ["SSL", "Issuer", scan?.ssl?.issuer || "-"],
        ["SSL", "Valid Till", scan?.ssl?.validTo || "-"],
        ["SSL", "Protocol", scan?.ssl?.protocol || "-"],
        ["GeoIP", "IP", scan?.geoip?.ip || "-"],
        ["GeoIP", "Country", scan?.geoip?.country || "-"],
        ["GeoIP", "ISP", scan?.geoip?.isp || "-"],
      ],
    });
    doc.save("website_recon.pdf");
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 text-center sm:text-left">
          <div className="w-24 h-24 sm:w-30 sm:h-30 bg-gray-800 rounded-full border-4 border-red-500 flex items-center justify-center overflow-hidden">
            <img
              src="/RedTeam/web-recon.png"
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Website Recon Tool</h1>
            <p className="text-gray-400 text-base sm:text-lg">
              Perform an in-depth reconnaissance of a website to identify key
              metadata and technologies used.
            </p>
          </div>
        </div>

        {/* DNS Lookup */}
        <div className="bg-gray-900 border border-white-700 rounded-lg p-6 mb-6 text-center">
          <h2 className="text-red-400 text-lg font-semibold mb-4">DNS Lookup</h2>

          {/* Responsive Input + Select + Button */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              type="text"
              placeholder="Enter domain (e.g., example.com)"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full bg-gray-800 text-white border border-white-600 rounded px-3 py-2"
            />
            <select
              value={recordType}
              onChange={(e) => setRecordType(e.target.value)}
              className="w-full sm:w-auto bg-gray-800 text-white border border-white-600 rounded px-3 py-2"
            >
              {RECORD_TYPES.map((rt) => (
                <option key={rt} value={rt}>{rt}</option>
              ))}
            </select>
            <button
              onClick={handleLookup}
              disabled={loading}
              className="w-full sm:w-auto bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded border border-white-600 disabled:opacity-50"
            >
              {loading ? "Looking up…" : "DNS Lookup"}
            </button>
          </div>

          {error && <p className="text-red-400 mb-4">{error}</p>}

          {result && (
            <div className="bg-gray-800 border border-white-600 rounded p-4 mb-4 overflow-x-auto">
              <h3 className="text-white font-semibold mb-2">DNS Results</h3>
              {Array.isArray(result.Answer) && result.Answer.length > 0 && (
                <ul className="space-y-2 text-left">
                  {result.Answer.map((rec, i) => (
                    <li key={i} className="text-gray-300 text-sm">
                      <div><span className="text-gray-400">Name:</span> {rec.name}</div>
                      <div><span className="text-gray-400">Type:</span> {getTypeName(rec.type)}</div>
                      <div><span className="text-gray-400">TTL:</span> {rec.TTL}s</div>
                      <div><span className="text-gray-400">Data:</span> {rec.data}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Deep Scan */}
        <div className="bg-gray-900 border border-white-700 rounded-lg p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
            <h3 className="text-gray-300 text-lg text-center sm:text-left">
              Deep Scan (WHOIS, SSL, Tech, GeoIP, DNS)
            </h3>
            <button
              onClick={handleDeepScan}
              disabled={scanLoading}
              className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 disabled:opacity-50"
            >
              {scanLoading ? "Scanning…" : "Run Deep Scan"}
            </button>
          </div>
          {scanError && <p className="text-red-400 mb-4">{scanError}</p>}
        </div>

        {/* Scan Results */}
        {scan && (
          <div className="space-y-6 mt-6">
            {/* WHOIS + SSL */}
            <div className="bg-gray-900 border border-white-700 rounded-lg p-6">
              <div className="text-sm text-gray-400 mb-4">
                Scanned URL: {scan.urlUsed || "-"}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-white font-semibold mb-3">WHOIS</h3>
                  <div className="space-y-1 text-gray-300">
                    <div>Registrar: {scan.whois?.registrar || "-"}</div>
                    <div>Created: {scan.whois?.created || "-"}</div>
                    <div>Expiry: {scan.whois?.expires || "-"}</div>
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-3">SSL / TLS</h3>
                  <div className="space-y-1 text-gray-300">
                    <div>Issuer: {scan.ssl?.issuer || "-"}</div>
                    <div>Valid Till: {scan.ssl?.validTo || "-"}</div>
                    <div>TLS Version: {scan.ssl?.protocol || "-"}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Technologies (commented out by you) */}
            {/* ... */}

            {/* GeoIP */}
            <div className="bg-gray-900 border border-white-700 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-3">Geo-IP</h3>
              <div className="space-y-1 text-gray-300">
                <div>IP: {scan.geoip?.ip || "-"}</div>
                <div>
                  Location: {scan.geoip?.country || "-"}
                  {scan.geoip?.region ? ` (${scan.geoip.region})` : ""}
                  {scan.geoip?.city ? ` – ${scan.geoip.city}` : ""}
                </div>
                <div>ISP: {scan.geoip?.isp || "-"}</div>
              </div>
            </div>

            {/* DNS */}
            <div className="bg-gray-900 border border-white-700 rounded-lg p-6 overflow-x-auto">
              <h3 className="text-white font-semibold mb-4">DNS (A/AAAA/MX/TXT/NS)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["A", "AAAA", "MX", "TXT", "NS"].map((k) => (
                  <div key={k}>
                    <div className="text-gray-300 font-medium mb-1">{k}</div>
                    <ul className="list-disc list-inside text-sm">
                      {(scan.dns?.[k]?.Answer || []).map((rec, i) => (
                        <li key={i} className="text-gray-400 break-words">
                          {rec.name} • {getTypeName(rec.type)} • {rec.TTL}s • {rec.data}
                        </li>
                      ))}
                      {!scan.dns?.[k]?.Answer?.length && (
                        <li className="text-gray-500">-</li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Downloads */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={downloadCSV}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
              >
                Download CSV
              </button>
              <button
                onClick={downloadPDF}
                className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded"
              >
                Download PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
