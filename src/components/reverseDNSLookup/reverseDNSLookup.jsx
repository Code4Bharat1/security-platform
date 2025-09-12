"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  CheckCircle,
  AlertCircle,
  Loader2,
  Globe,
  MapPin,
  Shield,
  CircleSlash,
  Check,
  Download,
  FileText,
  RefreshCcw,
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function isValidIP(ip) {
  const ipv4 =
    /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
  const ipv6 =
    /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(([0-9a-fA-F]{1,4}:){1,7}:)|(([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4})|(([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2})|(([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3})|(([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4})|(([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5})|(([0-9a-fA-F]{1,4}:){1}(:[0-9a-fA-F]{1,4}){1,6})|(:((:[0-9a-fA-F]{1,4}){1,7}|:)))$/;
  return ipv4.test(ip) || ipv6.test(ip);
}

const apiBase = (process.env.NEXT_PUBLIC_PROD_API_URL || "").replace(/\/$/, "");

export default function ReverseDNSLookup() {
  const [ip, setIp] = useState("");
  const [valid, setValid] = useState(false);
  const [validationMsg, setValidationMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null); // full enriched response
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!ip) {
      setValid(false);
      setValidationMsg("");
      return;
    }
    if (isValidIP(ip.trim())) {
      setValid(true);
      setValidationMsg("");
    } else {
      setValid(false);
      setValidationMsg("Please enter a valid IPv4 or IPv6 address.");
    }
  }, [ip]);

  const blacklistCount = useMemo(() => {
    const zones = data?.blacklist?.results || [];
    const listed = zones.filter((z) => z.listed).length;
    return { total: zones.length, listed };
  }, [data]);

  const forwardVerdict = useMemo(() => {
    const arr = data?.forwardValidation || [];
    if (!arr.length) return { verified: false, suspicious: false };
    const anySuspicious = arr.some((v) => v.matches === false);
    const allMissing = arr.every((v) => v.matches === false);
    return { verified: !anySuspicious && arr.length > 0, suspicious: anySuspicious || allMissing };
  }, [data]);

  async function lookup() {
    setLoading(true);
    setErr("");
    setData(null);
    try {
      const res = await fetch(`${apiBase}/reverse/reverse-dns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: ip.trim() }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || res.statusText);
      // Backwards-compat: if old payload {domains: [...]}
      if (!j.type && j.domains && !j.ptr) {
        setData({
          type: "PTR",
          ip: ip.trim(),
          ptr: j.domains,
          reverseName: "",
          ttl: null,
          ttlHuman: null,
          result: j.domains.length ? "dns lookup found" : "no ptr record",
          test: "public",
          blacklist: { supported: false, listed: false, results: [] },
          geo: null,
          asn: null,
          displayName: null,
          forwardValidation: [],
          timespan: null,
        });
      } else {
        setData(j);
      }
    } catch (e) {
      setErr(e.message || "Lookup failed");
    } finally {
      setLoading(false);
    }
  }

  function human(val, empty = "—") {
    if (val === null || val === undefined || val === "") return empty;
    if (Array.isArray(val) && !val.length) return empty;
    return String(val);
  }

  // ---- Export TXT / PDF ----
  function downloadTXT() {
    if (!data) return;
    const zones = data.blacklist?.results || [];
    const forward = data.forwardValidation || [];

    const lines = [
      "=== Reverse DNS Report ===",
      "",
      `Type: ${human(data.type, "PTR")}`,
      `IP: ${data.ip}${data.displayName ? " " + data.displayName : ""}`,
      `PTR: ${data.ptr?.join(", ") || "(none)"}`,
      `Reverse name: ${human(data.reverseName)}`,
      `TTL: ${human(data.ttlHuman)}`,
      `Result: ${human(data.result)}`,
      `Test: ${human(data.test, "public")}`,
      "",
      "--- Geolocation ---",
      data.geo
        ? `Country: ${human(data.geo.country)}  Region: ${human(data.geo.region)}  City: ${human(
            data.geo.city
          )}  TZ: ${human(data.geo.timezone)}  Lat/Lon: ${human(data.geo.ll?.join(", "))}`
        : "(not available)",
      "",
      "--- ASN / WHOIS ---",
      data.asn
        ? `ASN: ${human(data.asn.asn)}  ORG: ${human(data.asn.org)}  ISP: ${human(
            data.asn.isp
          )}  CIDR: ${human(data.asn.cidr)}`
        : "(not available)",
      "",
      "--- DNSBL (Blacklist) ---",
      `Listed on ${blacklistCount.listed}/${blacklistCount.total} lists`,
      ...zones.map(
        (z) => `  - ${z.zone}: ${z.listed ? "LISTED (" + (z.addresses || []).join(",") + ")" : "clear"}`
      ),
      "",
      "--- Forward Validation ---",
      ...forward.map(
        (f) =>
          `  - ${f.domain}: ${f.matches ? "VERIFIED" : "SUSPICIOUS"}  A=[${(f.resolved?.A || []).join(
            ", "
          )}] AAAA=[${(f.resolved?.AAAA || []).join(", ")}]`
      ),
      "",
      `Lookup time: ${human(data.timespan, "—")} ms`,
      "",
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `reverse_dns_${data.ip}.txt`;
    a.click();
    a.remove();
  }

  function downloadPDF() {
    if (!data) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const M = 40;
    let y = 56;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Reverse DNS Report", M, y);
    y += 24;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    autoTable(doc, {
      startY: y,
      head: [["Field", "Value"]],
      body: [
        ["Type", human(data.type, "PTR")],
        ["IP", `${data.ip}${data.displayName ? " " + data.displayName : ""}`],
        ["PTR", data.ptr?.length ? data.ptr.join(", ") : "(none)"],
        ["Reverse name", human(data.reverseName)],
        ["TTL", human(data.ttlHuman)],
        ["Result", human(data.result)],
        ["Test", human(data.test, "public")],
        ["Lookup time (ms)", human(data.timespan)],
      ],
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 10 },
      margin: { left: M, right: M },
    });

    // Geolocation / ASN
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 16,
      head: [["Geolocation", "Value"]],
      body: data.geo
        ? [
            ["Country", human(data.geo.country)],
            ["Region", human(data.geo.region)],
            ["City", human(data.geo.city)],
            ["Timezone", human(data.geo.timezone)],
            ["Lat/Lon", human(data.geo.ll?.join(", "))],
          ]
        : [["(not available)", ""]],
      styles: { fontSize: 10 },
      margin: { left: M, right: M },
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 12,
      head: [["ASN / WHOIS", "Value"]],
      body: data.asn
        ? [
            ["ASN", human(data.asn.asn)],
            ["ORG", human(data.asn.org)],
            ["ISP", human(data.asn.isp)],
            ["CIDR", human(data.asn.cidr)],
          ]
        : [["(not available)", ""]],
      styles: { fontSize: 10 },
      margin: { left: M, right: M },
    });

    // Blacklist
    const blRows = (data.blacklist?.results || []).map((z) => [
      z.zone,
      z.listed ? "LISTED" : "clear",
      (z.addresses || []).join(", "),
    ]);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 12,
      head: [["DNSBL Zone", "Status", "Answer"]],
      body: blRows.length ? blRows : [["(none)", "", ""]],
      styles: { fontSize: 9 },
      margin: { left: M, right: M },
    });

    // Forward validation
    const fRows = (data.forwardValidation || []).map((f) => [
      f.domain,
      f.matches ? "VERIFIED" : "SUSPICIOUS",
      `A=[${(f.resolved?.A || []).join(", ")}] AAAA=[${(f.resolved?.AAAA || []).join(", ")}]`,
    ]);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 12,
      head: [["Domain", "Check", "Resolved"]],
      body: fRows.length ? fRows : [["(none)", "", ""]],
      styles: { fontSize: 9 },
      margin: { left: M, right: M },
    });

    doc.save(`reverse_dns_${data.ip}.pdf`);
  }

  return (
  <div className="min-h-screen bg-black p-4">
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <img
  src="/BlueTeam/reverse dns.png"
  alt="Reverse DNS"
  className="w-30 h-30 rounded-full border-4 border-blue-500"
/>

        <div className="text-white">
          <h1 className="text-3xl font-semibold">Reverse DNS Lookup</h1>
          <p className="text-white">
            PTR + Geo + ASN/WHOIS + DNSBL + <br />Forward Validation (with PDF/TXT export)
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-black/80 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-500 p-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xl font-semibold text-white mb-2 text-center">
              IP Address
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g., 8.8.8.8 or 2001:4860:4860::8888"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                className={`w-full text-white px-4 py-3 pl-12 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 ${
                  validationMsg
                    ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                    : valid
                    ? "border-blue-300 focus:border-blue-500 focus:ring-blue-100"
                    : "border-blue-500 focus:border-blue-400 focus:ring-blue-50"
                } text-gray-700 font-mono`}
              />
              <Globe
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  validationMsg ? "text-red-400" : valid ? "text-white" : "text-gray-400"
                }`}
              />
              {valid && (
                <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
            </div>
            {validationMsg && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" /> {validationMsg}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={lookup}
              disabled={!valid || loading}
              className={`flex-1 py-3 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                valid && !loading
                  ? "bg-blue-900 text-white shadow-lg hover:bg-blue-700 hover:shadow-xl"
                  : "bg-blue-600 text-white cursor-not-allowed"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Looking up...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" /> Perform Lookup
                </>
              )}
            </button>

            <button
              onClick={() => {
                setIp("");
                setData(null);
                setErr("");
              }}
              className="px-4 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
              title="Reset"
            >
              <RefreshCcw className="w-5 h-5" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {err && (
        <div className="bg-red-50 border border-blue-200 rounded-xl p-4 mb-6 text-red-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> {err}
        </div>
      )}

      {/* Results */}
      {data && (
        <div className="bg-black backdrop-blur-sm rounded-2xl shadow-xl border border-blue-200 p-6 space-y-6">
          {/* Top summary + exports */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="space-y-1">
              <div className="text-xl text-white font-semibold">Reverse DNS Summary</div>
              <div className="text-sm text-gray-500">{data.ip}</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={downloadPDF}
                className="px-3 py-2 rounded-lg border border-blue-700 text-white hover:bg-emerald-50 flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>
              <button
                onClick={downloadTXT}
                className="px-3 py-2 rounded-lg border border-blue-700 text-white hover:bg-emerald-50 flex items-center gap-2"
              >
                <FileText className="w-4 h-4" /> Download TXT
              </button>
            </div>
          </div>

          {/* Cards row */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-blue-200 bg-gray-50 p-4">
              <div className="text-xs text-gray-500">Type</div>
              <div className="text-gray-800 font-semibold mt-1">{data.type || "PTR"}</div>
            </div>
            <div className="rounded-lg border border-blue-200 bg-gray-50 p-4">
              <div className="text-xs text-gray-500">IP address with name</div>
              <div className="text-gray-800 font-semibold mt-1">
                {data.ip}
                {data.displayName ? ` ${data.displayName}` : ""}
              </div>
            </div>
            <div className="rounded-lg border border-blue-200 bg-gray-50 p-4">
              <div className="text-xs text-gray-500">TTL</div>
              <div className="text-gray-800 font-semibold mt-1">
                {human(data.ttlHuman) || human(data.ttl ? `${data.ttl}s` : null)}
              </div>
            </div>
            <div className="rounded-lg border border-blue-200 bg-gray-50 p-4">
              <div className="text-xs text-gray-500">Result</div>
              <div className="text-gray-800 font-semibold mt-1">
                {human(data.result, "dns lookup found")}
              </div>
            </div>
            <div className="rounded-lg border border-blue-200 bg-gray-50 p-4">
              <div className="text-xs text-gray-500">Test</div>
              <div className="text-gray-800 font-semibold mt-1">
                {human(data.test, "public")}
              </div>
            </div>
            <div className="rounded-lg border border-blue-200 bg-gray-50 p-4">
              <div className="text-xs text-gray-500">Reverse name</div>
              <div className="text-gray-800 font-semibold mt-1">
                {human(data.reverseName)}
              </div>
            </div>
          </div>

          {/* PTR list */}
          <div>
            <div className="font-semibold mb-2 text-white">PTR Domains</div>
            {data.ptr?.length ? (
              <ul className="list-disc list-inside text-sm text-gray-800">
                {data.ptr.map((d) => (
                  <li key={d}>
                    <code className="bg-gray-100 px-1 py-0.5 rounded">{d}</code>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-500">No PTR records.</div>
            )}
          </div>

          {/* Geo + ASN */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-blue-200 p-4">
              <div className="font-semibold mb-2 flex text-white items-center gap-2">
                <MapPin className="w-4 h-4 text-green-600" />
                Geolocation
              </div>
              {data.geo ? (
                <div className="text-sm text-white space-y-1">
                  <div>
                    Country: <span className="font-medium">{human(data.geo.country)}</span>
                  </div>
                  <div>
                    Region / City:{" "}
                    <span className="font-medium">
                      {human(data.geo.region)} / {human(data.geo.city)}
                    </span>
                  </div>
                  <div>Timezone: {human(data.geo.timezone)}</div>
                  <div>Lat/Lon: {human(data.geo.ll?.join(", "))}</div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">Not available</div>
              )}
            </div>
            <div className="rounded-lg border border-blue-200 text-white p-4">
              <div className="font-semibold mb-2">ASN / WHOIS</div>
              {data.asn ? (
                <div className="text-sm text-white space-y-1">
                  <div>
                    ASN: <span className="font-medium">{human(data.asn.asn)}</span>
                  </div>
                  <div>Org: {human(data.asn.org)}</div>
                  <div>ISP: {human(data.asn.isp)}</div>
                  <div>CIDR: {human(data.asn.cidr)}</div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">Not available</div>
              )}
            </div>
          </div>

          {/* DNSBL */}
          <div className="rounded-lg border border-blue-200 p-4">
            <div className="font-semibold mb-2 text-white">DNSBL / Blacklist</div>
            <div className="text-sm text-gray-700 mb-2">
              Listed on{" "}
              <span className="font-semibold">
                {blacklistCount.listed}/{blacklistCount.total}
              </span>{" "}
              lists
            </div>
            <div className="grid md:grid-cols-2 gap-2">
              {(data.blacklist?.results || []).map((z) => (
                <div
                  key={z.zone}
                  className={`p-3 rounded border text-sm ${
                    z.listed
                      ? "bg-red-50 border-red-200 text-red-700"
                      : "bg-blackborder-white text-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{z.zone}</div>
                    {z.listed ? (
                      <CircleSlash className="w-4 h-4" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                  </div>
                  {z.listed && z.addresses?.length ? (
                    <div className="mt-1 text-xs">Answer: {z.addresses.join(", ")}</div>
                  ) : null}
                </div>
              ))}
              {!data.blacklist?.results?.length && (
                <div className="text-sm text-gray-500">No DNSBL results.</div>
              )}
            </div>
          </div>

          {/* Forward validation */}
          <div className="rounded-lg border border-blue-200 p-4">
            <div className="font-semibold mb-2 text-white">Forward DNS Validation</div>
            <div className="text-sm mb-3">
              {forwardVerdict.verified ? (
                <span className="inline-flex items-center gap-1 text-white">
                  <Check className="w-4 h-4" /> All mappings verified
                </span>
              ) : forwardVerdict.suspicious ? (
                <span className="inline-flex items-center gap-1 text-red-700">
                  <AlertCircle className="w-4 h-4" /> Suspicious: at least one reverse → forward
                  mapping did not point back to {data.ip}
                </span>
              ) : (
                <span className="text-gray-600">No forward checks available.</span>
              )}
            </div>
            <div className="space-y-2">
              {(data.forwardValidation || []).map((f) => (
                <div
                  key={f.domain}
                  className={`p-3 rounded border text-sm ${
                    f.matches
                      ? "bg-black border-green-200 text-white"
                      : "bg-red-50 border-white text-red-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <code className="font-mono">{f.domain}</code>
                    {f.matches ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  </div>
                  <div className="mt-1 text-xs">
                    A=[{(f.resolved?.A || []).join(", ")}] AAAA=[{(f.resolved?.AAAA || []).join(", ")}]
                  </div>
                </div>
              ))}
              {!data.forwardValidation?.length && (
                <div className="text-sm text-gray-500">No forward data.</div>
              )}
            </div>
          </div>

          {/* Security usefulness line */}
          <div className="rounded-lg border border-blue-200">
            <div className="font-semibold mb-2 text-white">Security notes</div>
            <ul className="list-disc pl-5 text-sm text-white space-y-1">
              <li>
                DNSBL listing and reverse/forward mismatch are common signals of potential
                abuse/spoofing.
              </li>
              <li>ASN/WHOIS + Geolocation help attribute ownership and hosting region.</li>
              <li>PTR presence alone does not imply trust; always validate forward mapping.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  </div>
);
} 