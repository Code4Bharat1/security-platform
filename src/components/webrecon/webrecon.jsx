"use client";

import { useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import useProtectedAction from "../UseProtectedAction/UseProtectedAction";

const dnsTypeMap = { 1: "A", 28: "AAAA", 15: "MX", 16: "TXT", 2: "NS" };
const RECORD_TYPES = ["A", "AAAA", "MX", "TXT", "NS"];
const TECH_GROUPS = [
  { key: "frontend", label: "Frontend" },
  { key: "backend", label: "Backend" },
  { key: "infrastructure", label: "Infrastructure" },
  { key: "analytics", label: "Analytics" },
  { key: "payments", label: "Payments" },
];

const getTypeName = (n) => dnsTypeMap[n] || `Type ${n}`;
const normalizeDomain = (value) =>
  String(value).trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "");

const flattenTechnologies = (tech = {}) =>
  TECH_GROUPS.flatMap(({ key, label }) =>
    (tech[key] || []).map((item) => ({ label, value: item }))
  );

const getPortTone = (state) => {
  if (state === "open") return "text-emerald-400";
  if (state === "closed") return "text-gray-400";
  if (state === "filtered") return "text-amber-400";
  return "text-rose-400";
};

export default function Webrecon() {
  const protectedAction = useProtectedAction();
  const [domain, setDomain] = useState("");
  const [recordType, setRecordType] = useState("A");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [scan, setScan] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState("");

  const API_BASE = useMemo(
    () => process.env.NEXT_PUBLIC_PROD_API_URL?.replace(/\/+$/, "") || "",
    []
  );

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
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || `Request failed (${res.status})`);
      }
      setResult(data.data);
    } catch (err) {
      setError(err?.message || "Error fetching DNS data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeepScan = async () => {
    await protectedAction(async (token) => {
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
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ domain: target }),
        });

        const data = await res.json();
        if (!res.ok || !data?.success) {
          throw new Error(data?.error || `Request failed (${res.status})`);
        }

        setScan(data);
      } catch (err) {
        setScanError(err?.message || "Deep scan failed");
      } finally {
        setScanLoading(false);
      }
    });
  };

  const downloadCSV = () => {
    if (!scan) return;

    const techRows = flattenTechnologies(scan.technologies).map(
      (item) => `Technology,${item.label},${item.value}`
    );
    const headerRows = (scan.securityHeaders?.missing || []).map(
      (item) => `Security Headers,Missing,${item}`
    );
    const portRows = (scan.ports?.results || []).map(
      (item) => `Ports,${item.port},${item.service} (${item.state})`
    );

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
      `GeoIP,ISP,${scan.geoip?.isp || "-"}`,
      `Persistence,Saved,${scan.persistence?.saved ? "Yes" : "No"}`,
      ...techRows,
      ...headerRows,
      ...portRows,
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "website_recon.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    if (!scan) return;

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const horizontalMargin = 10;
    const usableWidth = pageWidth - horizontalMargin * 2;
    const sectionWidth = 28;
    const keyWidth = 34;
    const valueWidth = usableWidth - sectionWidth - keyWidth;
    const body = [
      ["WHOIS", "Registrar", scan.whois?.registrar || "-"],
      ["WHOIS", "Created", scan.whois?.created || "-"],
      ["WHOIS", "Expires", scan.whois?.expires || "-"],
      ["SSL", "Issuer", scan.ssl?.issuer || "-"],
      ["SSL", "Valid Till", scan.ssl?.validTo || "-"],
      ["SSL", "Protocol", scan.ssl?.protocol || "-"],
      ["GeoIP", "IP", scan.geoip?.ip || "-"],
      ["GeoIP", "Country", scan.geoip?.country || "-"],
      ["GeoIP", "ISP", scan.geoip?.isp || "-"],
      ["Persistence", "Saved", scan.persistence?.saved ? "Yes" : "No"],
      ...(flattenTechnologies(scan.technologies).map((item) => [
        "Technology",
        item.label,
        item.value,
      ]) || []),
      ...((scan.securityHeaders?.missing || []).map((item) => [
        "Security Headers",
        "Missing",
        item,
      ]) || []),
      ...((scan.ports?.results || []).map((item) => [
        "Ports",
        `${item.port}`,
        `${item.service} - ${item.state.toUpperCase()}${item.error ? ` (${item.error})` : ""}`,
      ]) || []),
    ];

    doc.setFontSize(14);
    doc.text("Website Recon Report", horizontalMargin, 14);
    autoTable(doc, {
      head: [["Section", "Key", "Value"]],
      body,
      startY: 18,
      margin: { left: horizontalMargin, right: horizontalMargin },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: "linebreak",
        valign: "middle",
      },
      headStyles: {
        fillColor: [31, 41, 55],
        textColor: 255,
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: sectionWidth },
        1: { cellWidth: keyWidth },
        2: { cellWidth: valueWidth },
      },
    });
    doc.save("website_recon.pdf");
  };

  return (
    <div className="tool-detail-page min-h-screen bg-black text-white">
      <div className="tool-detail-shell max-w-4xl mx-auto p-6">
        <div className="tool-detail-hero flex flex-row items-center gap-4 mb-8 text-left">
          <div className="w-30 h-30 bg-gray-800 rounded-full border-4 border-red-500 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img
              src="/RedTeam/web-recon.png"
              alt="Website Recon"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Website Recon Tool
            </h1>
            <p className="text-gray-400 text-base sm:text-lg">
              Perform an in-depth reconnaissance of a website to identify key
              metadata and technologies used.
            </p>
          </div>
        </div>

        <div className="bg-gray-900 border border-white-700 rounded-lg p-6 mb-6 text-center">
          <h2 className="text-red-400 text-lg font-semibold mb-4">DNS Lookup</h2>

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
                <option key={rt} value={rt}>
                  {rt}
                </option>
              ))}
            </select>
            <button
              onClick={handleLookup}
              disabled={loading}
              className="w-full sm:w-auto bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded border border-white-600 disabled:opacity-50"
            >
              {loading ? "Looking up..." : "DNS Lookup"}
            </button>
          </div>

          {error && <p className="text-red-400 mb-4">{error}</p>}

          {result && (
            <div className="bg-gray-800 border border-white-600 rounded p-4 mb-4 overflow-x-auto">
              <h3 className="text-white font-semibold mb-2">DNS Results</h3>
              {Array.isArray(result.Answer) && result.Answer.length > 0 ? (
                <ul className="space-y-2 text-left">
                  {result.Answer.map((rec, i) => (
                    <li key={i} className="text-gray-300 text-sm">
                      <div>
                        <span className="text-gray-400">Name:</span> {rec.name}
                      </div>
                      <div>
                        <span className="text-gray-400">Type:</span>{" "}
                        {getTypeName(rec.type)}
                      </div>
                      <div>
                        <span className="text-gray-400">TTL:</span> {rec.TTL}s
                      </div>
                      <div>
                        <span className="text-gray-400">Data:</span> {rec.data}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-400 text-sm">
                  No DNS answers returned for this record type.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-gray-900 border border-white-700 rounded-lg p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
            <h3 className="text-gray-300 text-lg text-center sm:text-left">
              Deep Scan (WHOIS, SSL, Tech, GeoIP, DNS, Headers, Ports)
            </h3>
            <button
              onClick={handleDeepScan}
              disabled={scanLoading}
              className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 disabled:opacity-50"
            >
              {scanLoading ? "Scanning..." : "Run Deep Scan"}
            </button>
          </div>
          {scanError && <p className="text-red-400 mb-4">{scanError}</p>}
        </div>

        {scan && (
          <div className="space-y-6 mt-6">
            {scan.warnings?.length > 0 && (
              <div className="bg-amber-950/40 border border-amber-700 rounded-lg p-4">
                <h3 className="text-amber-300 font-semibold mb-2">
                  Partial Scan Warnings
                </h3>
                <ul className="list-disc list-inside text-sm text-amber-200 space-y-1">
                  {scan.warnings.map((warning, index) => (
                    <li key={`${warning}-${index}`}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-gray-900 border border-white-700 rounded-lg p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <div className="text-sm text-gray-400">
                  Scanned URL: {scan.urlUsed || "-"}
                </div>
                <div className="text-sm text-gray-400">
                  Saved to database:{" "}
                  <span
                    className={
                      scan.persistence?.saved
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }
                  >
                    {scan.persistence?.saved ? "Yes" : "No"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-white font-semibold mb-3">WHOIS</h3>
                  <div className="space-y-1 text-gray-300">
                    <div>Registrar: {scan.whois?.registrar || "-"}</div>
                    <div>Created: {scan.whois?.created || "-"}</div>
                    <div>Updated: {scan.whois?.updated || "-"}</div>
                    <div>Expiry: {scan.whois?.expires || "-"}</div>
                    <div>
                      Privacy Protected:{" "}
                      {scan.whois?.privacyProtected ? "Yes" : "No"}
                    </div>
                    <div>
                      Source:{" "}
                      {scan.whois?.source?.length
                        ? scan.whois.source.join(", ")
                        : "-"}
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-gray-400 text-sm mb-1">Nameservers</div>
                    <ul className="list-disc list-inside text-sm text-gray-300">
                      {scan.whois?.nameservers?.length ? (
                        scan.whois.nameservers.map((item) => (
                          <li key={item}>{item}</li>
                        ))
                      ) : (
                        <li>-</li>
                      )}
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-3">SSL / TLS</h3>
                  <div className="space-y-1 text-gray-300">
                    <div>Issuer: {scan.ssl?.issuer || "-"}</div>
                    <div>Subject CN: {scan.ssl?.subjectCN || "-"}</div>
                    <div>Valid From: {scan.ssl?.validFrom || "-"}</div>
                    <div>Valid Till: {scan.ssl?.validTo || "-"}</div>
                    <div>TLS Version: {scan.ssl?.protocol || "-"}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-white-700 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4">
                Technology Detection
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TECH_GROUPS.map(({ key, label }) => (
                  <div key={key}>
                    <div className="text-gray-300 font-medium mb-2">{label}</div>
                    <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                      {scan.technologies?.[key]?.length ? (
                        scan.technologies[key].map((item) => (
                          <li key={`${key}-${item}`}>{item}</li>
                        ))
                      ) : (
                        <li>-</li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 border border-white-700 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4">Security Headers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
                <div className="space-y-1">
                  <div>
                    HTTP redirects to HTTPS:{" "}
                    {scan.securityHeaders?.redirect?.redirectsToHttps
                      ? "Yes"
                      : "No"}
                  </div>
                  <div>
                    HSTS Enabled:{" "}
                    {scan.securityHeaders?.hsts?.enabled ? "Yes" : "No"}
                  </div>
                  <div>
                    HSTS Max-Age: {scan.securityHeaders?.hsts?.maxAge ?? "-"}
                  </div>
                  <div>Server: {scan.securityHeaders?.server || "-"}</div>
                  <div>
                    X-Powered-By: {scan.securityHeaders?.xPoweredBy || "-"}
                  </div>
                </div>

                <div>
                  <div className="text-gray-300 font-medium mb-2">
                    Missing Core Headers
                  </div>
                  <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                    {scan.securityHeaders?.missing?.length ? (
                      scan.securityHeaders.missing.map((item) => (
                        <li key={item}>{item}</li>
                      ))
                    ) : (
                      <li>None</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-white-700 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-3">Geo-IP</h3>
              <div className="space-y-1 text-gray-300">
                <div>IP: {scan.geoip?.ip || "-"}</div>
                <div>
                  Location: {scan.geoip?.country || "-"}
                  {scan.geoip?.region ? ` (${scan.geoip.region})` : ""}
                  {scan.geoip?.city ? ` - ${scan.geoip.city}` : ""}
                </div>
                <div>ISP: {scan.geoip?.isp || "-"}</div>
              </div>
            </div>

            <div className="bg-gray-900 border border-white-700 rounded-lg p-6 overflow-x-auto">
              <h3 className="text-white font-semibold mb-4">
                DNS (A/AAAA/MX/TXT/NS)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {RECORD_TYPES.map((key) => (
                  <div key={key}>
                    <div className="text-gray-300 font-medium mb-1">{key}</div>
                    <ul className="list-disc list-inside text-sm">
                      {(scan.dns?.[key]?.Answer || []).map((rec, i) => (
                        <li key={i} className="text-gray-400 break-words">
                          {rec.name} - {getTypeName(rec.type)} - {rec.TTL}s -{" "}
                          {rec.data}
                        </li>
                      ))}
                      {!scan.dns?.[key]?.Answer?.length && (
                        <li className="text-gray-500">-</li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 border border-white-700 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4">
                Common Port Snapshot
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(scan.ports?.results || []).map((item) => (
                  <div
                    key={`${item.port}-${item.service}`}
                    className="border border-white-700 rounded px-3 py-2 text-sm"
                  >
                    <div className="text-white font-medium">
                      {item.port} / {item.service}
                    </div>
                    <div className={getPortTone(item.state)}>
                      {item.state.toUpperCase()}
                    </div>
                    {item.error && (
                      <div className="text-gray-500 break-words">
                        {item.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

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
