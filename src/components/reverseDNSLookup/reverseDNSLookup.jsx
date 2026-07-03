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
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";

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

  const protectedAction = useProtectedAction();

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

  const blacklistSummary = useMemo(() => {
    if (data?.blacklistSummary) return data.blacklistSummary;
    const zones = data?.blacklist?.results || [];
    const listed = zones.filter((z) => z.listed).length;
    const checked = zones.length;
    let score = listed * 20; // fallback calculation
    let risk = "Clean";
    let action = "No action required. IP appears reputable.";
    if (score >= 80) {
      risk = "Critical";
      action = "Block IP immediately; execute standard incident response procedures.";
    } else if (score >= 40) {
      risk = "High";
      action = "Restrict traffic from this IP address; initiate active security monitoring.";
    } else if (score >= 20) {
      risk = "Medium";
      action = "Investigate for potential false positive or temporary SMTP/network issue.";
    }
    return {
      flagged: listed,
      checked,
      reputationScore: score,
      riskLevel: risk,
      recommendedAction: action
    };
  }, [data]);

  const blacklists = useMemo(() => {
    if (data?.blacklists) return data.blacklists;
    const zones = data?.blacklist?.results || [];
    return zones.map((z) => {
      const namePart = z.zone.split(".")[0];
      const displayName = namePart === "zen" ? "Spamhaus Zen" : namePart === "bl" ? "SpamCop" : namePart === "b" ? "Barracuda BRBL" : namePart === "dnsbl" ? "SORBS" : namePart === "cbl" ? "CBL" : z.zone;
      return {
        name: displayName,
        status: z.listed ? "Listed" : "Clear",
        severity: z.listed ? "High" : "Low",
        reason: z.listed ? `IP listed on zone ${z.zone}` : "No active listing found.",
        confidence: "High",
        sourceType: "DNSBL",
        lastSeen: z.listed ? new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"
      };
    });
  }, [data]);

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
    return {
      verified: !anySuspicious && arr.length > 0,
      suspicious: anySuspicious || allMissing,
    };
  }, [data]);

  async function lookup() {
    setLoading(true);
    setErr("");
    setData(null);
    await protectedAction(async (userToken) => {
      try {
        const res = await fetch(`${apiBase}/reverse/reverse-dns`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
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
    });
  }

  function human(val, empty = "—") {
    if (val === null || val === undefined || val === "") return empty;
    if (Array.isArray(val) && !val.length) return empty;
    return String(val);
  }

  // ---- Export TXT / PDF ----
  function downloadTXT() {
    if (!data) return;
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
      "--- IP Reputation Assessment ---",
      `Reputation Score: ${blacklistSummary.reputationScore} / 100`,
      `Blacklist Detection Rate: ${blacklistSummary.flagged} / ${blacklistSummary.checked} Blacklists Flagged`,
      `Risk Level: ${blacklistSummary.riskLevel}`,
      `Recommended Action: ${blacklistSummary.recommendedAction}`,
      "",
      "--- Geolocation ---",
      data.geo
        ? `Country: ${human(data.geo.country)}  Region: ${human(
            data.geo.region
          )}  City: ${human(data.geo.city)}  TZ: ${human(
            data.geo.timezone
          )}  Lat/Lon: ${human(data.geo.ll?.join(", "))}`
        : "(not available)",
      "",
      "--- ASN / WHOIS ---",
      data.asn
        ? `ASN: ${human(data.asn.asn)}  ORG: ${human(
            data.asn.org
          )}  ISP: ${human(data.asn.isp)}  CIDR: ${human(data.asn.cidr)}`
        : "(not available)",
      "",
      "--- Blacklists Checked ---",
      ...blacklists.map(
        (bl) =>
          `  - ${bl.name}: ${bl.status} [Severity: ${bl.severity}, Confidence: ${bl.confidence}]` + 
          `    Details: ${bl.reason} (Last Seen: ${bl.lastSeen})`
      ),
      "",
      "--- Forward Validation ---",
      ...forward.map(
        (f) =>
          `  - ${f.domain}: ${f.matches ? "VERIFIED" : "SUSPICIOUS"}  A=[${(
            f.resolved?.A || []
          ).join(", ")}] AAAA=[${(f.resolved?.AAAA || []).join(", ")}]`
      ),
      "",
      `Lookup time: ${human(data.timespan, "—")} ms`,
      "",
    ];

    const blob = new Blob([lines.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
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

    // Blacklist / Reputation
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 16,
      head: [["IP Reputation Assessment Summary", "Value"]],
      body: [
        ["Reputation Score", `${blacklistSummary.reputationScore} / 100`],
        ["Detection Rate", `${blacklistSummary.flagged} / ${blacklistSummary.checked} Blacklists Flagged`],
        ["Risk Level", blacklistSummary.riskLevel],
        ["Recommended Action", blacklistSummary.recommendedAction]
      ],
      headStyles: { fillColor: [30, 41, 59] }, // Slate gray header
      styles: { fontSize: 10 },
      margin: { left: M, right: M },
    });

    const blRows = blacklists.map((bl) => [
      bl.name,
      bl.status,
      bl.severity,
      bl.confidence,
      bl.reason,
      bl.lastSeen
    ]);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 12,
      head: [["Blacklist Feed", "Status", "Severity", "Confidence", "Observed Threat Intel", "Last Seen"]],
      body: blRows.length ? blRows : [["(none)", "", "", "", "", ""]],
      styles: { fontSize: 8.5 },
      columnStyles: {
        4: { cellWidth: 180 }
      },
      didParseCell: (data) => {
        if (data.column.index === 1 && data.section === "body") {
          if (data.cell.raw === "Listed") {
            data.cell.styles.textColor = [220, 53, 69]; // red
            data.cell.styles.fontStyle = "bold";
          } else if (data.cell.raw === "Clear") {
            data.cell.styles.textColor = [16, 185, 129]; // green
          }
        }
      },
      margin: { left: M, right: M },
    });

    // Forward validation
    const fRows = (data.forwardValidation || []).map((f) => [
      f.domain,
      f.matches ? "VERIFIED" : "SUSPICIOUS",
      `A=[${(f.resolved?.A || []).join(", ")}] AAAA=[${(
        f.resolved?.AAAA || []
      ).join(", ")}]`,
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
        <div className="flex items-center gap-4 mb-8 mt-15">
          <img
            src="/BlueTeam/reverse dns.png"
            alt="Reverse DNS"
            className="w-30 h-30 rounded-full border-4 border-blue-500"
          />

          <div className="text-white">
            <h1 className="text-3xl font-semibold">Reverse DNS Lookup</h1>
            <p className="text-white">
              PTR + Geo + ASN/WHOIS + DNSBL + <br />
              Forward Validation (with PDF/TXT export)
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
                    validationMsg
                      ? "text-red-400"
                      : valid
                      ? "text-white"
                      : "text-gray-400"
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
                <div className="text-xl text-white font-semibold">
                  Reverse DNS Summary
                </div>
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

            {/* IP Reputation Assessment Summary Card */}
            <div className="bg-black/45 border border-blue-500/20 rounded-xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-blue-500/10 pb-3">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-500 animate-pulse" />
                  IP Reputation & Threat Assessment
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  blacklistSummary.riskLevel === "Critical"
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : blacklistSummary.riskLevel === "High"
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                    : blacklistSummary.riskLevel === "Medium"
                    ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                    : "bg-emerald-500/20 text-emerald-450 border border-emerald-500/30"
                }`}>
                  {blacklistSummary.riskLevel} Risk
                </span>
              </div>
              <div className="grid md:grid-cols-3 gap-6 items-center">
                {/* Reputation Score Meter */}
                <div className="flex flex-col items-center justify-center p-3 bg-blue-955/10 border border-blue-500/5 rounded-lg text-center">
                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Reputation Score</div>
                  <div className="relative flex items-center justify-center">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle cx="40" cy="40" r="34" className="stroke-current text-blue-950" strokeWidth="6" fill="transparent" />
                      <circle cx="40" cy="40" r="34" className={`stroke-current ${
                        blacklistSummary.reputationScore >= 75 ? "text-red-500" : blacklistSummary.reputationScore >= 40 ? "text-orange-500" : blacklistSummary.reputationScore >= 11 ? "text-yellow-500" : "text-emerald-500"
                      }`} strokeWidth="6" fill="transparent"
                      strokeDasharray={213.6}
                      strokeDashoffset={213.6 - (213.6 * blacklistSummary.reputationScore) / 100}
                      strokeLinecap="round" />
                    </svg>
                    <div className="absolute text-lg font-bold text-white">
                      {blacklistSummary.reputationScore}
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1">out of 100 max</div>
                </div>

                {/* Match Counter */}
                <div className="space-y-1 text-center md:text-left">
                  <div className="text-xs text-gray-400 uppercase tracking-wider">Blacklist Match Count</div>
                  <div className="text-3xl font-extrabold text-white">
                    {blacklistSummary.flagged} <span className="text-sm font-normal text-gray-500">/ {blacklistSummary.checked} Flagged</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Queried from active reputation lists.
                  </div>
                </div>

                {/* Recommendations */}
                <div className="p-3.5 bg-blue-955/15 border border-blue-500/10 rounded-lg space-y-1 text-left">
                  <div className="text-xs font-semibold text-blue-450 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Security Guidance:
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed font-medium">
                    {blacklistSummary.recommendedAction}
                  </p>
                </div>
              </div>
            </div>

            {/* Cards row */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-lg border border-blue-200 bg-gray-50 p-4">
                <div className="text-xs text-gray-500">Type</div>
                <div className="text-gray-800 font-semibold mt-1">
                  {data.type || "PTR"}
                </div>
              </div>
              <div className="rounded-lg border border-blue-200 bg-gray-50 p-4">
                <div className="text-xs text-gray-500">
                  IP address with name
                </div>
                <div className="text-gray-800 font-semibold mt-1">
                  {data.ip}
                  {data.displayName ? ` ${data.displayName}` : ""}
                </div>
              </div>
              <div className="rounded-lg border border-blue-200 bg-gray-50 p-4">
                <div className="text-xs text-gray-500">TTL</div>
                <div className="text-gray-800 font-semibold mt-1">
                  {human(data.ttlHuman) ||
                    human(data.ttl ? `${data.ttl}s` : null)}
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
                      <code className="bg-gray-100 px-1 py-0.5 rounded">
                        {d}
                      </code>
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
                      Country:{" "}
                      <span className="font-medium">
                        {human(data.geo.country)}
                      </span>
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
                      ASN:{" "}
                      <span className="font-medium">{human(data.asn.asn)}</span>
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

            {/* IP Reputation & Blacklist Details Table */}
            <div className="bg-black/45 border border-blue-500/20 rounded-xl p-5 shadow-lg space-y-4">
              <div className="font-semibold text-base text-white flex items-center gap-2 border-b border-blue-500/10 pb-3">
                <Globe className="w-5 h-5 text-blue-500" />
                IP Reputation & Blacklist Details
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-blue-500/10 text-gray-400 text-xs font-semibold uppercase">
                      <th className="py-2.5 px-3">Blacklist Feed</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Severity</th>
                      <th className="py-2.5 px-3">Confidence</th>
                      <th className="py-2.5 px-3">Observed Threat Intel</th>
                      <th className="py-2.5 px-3">Last Seen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-500/10 text-sm">
                    {blacklists.map((bl) => (
                      <tr key={bl.name} className="hover:bg-blue-950/10 transition-colors">
                        <td className="py-3 px-3 font-semibold text-white">{bl.name}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                            bl.status === "Listed"
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }`}>
                            {bl.status}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`font-semibold ${
                            bl.severity === "High"
                              ? "text-red-400"
                              : bl.severity === "Medium"
                              ? "text-orange-400"
                              : bl.severity === "Low"
                              ? "text-blue-400"
                              : "text-gray-400"
                          }`}>
                            {bl.severity}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-gray-300">{bl.confidence}</td>
                        <td className="py-3 px-3 text-xs text-gray-400 max-w-xs truncate" title={bl.reason}>
                          {bl.reason}
                        </td>
                        <td className="py-3 px-3 text-xs text-gray-500">{bl.lastSeen}</td>
                      </tr>
                    ))}
                    {!blacklists.length && (
                      <tr>
                        <td colSpan="6" className="py-4 text-center text-sm text-gray-500">
                          No blacklists checked.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Forward validation */}
            <div className="rounded-lg border border-blue-200 p-4">
              <div className="font-semibold mb-2 text-white">
                Forward DNS Validation
              </div>
              <div className="text-sm mb-3">
                {forwardVerdict.verified ? (
                  <span className="inline-flex items-center gap-1 text-white">
                    <Check className="w-4 h-4" /> All mappings verified
                  </span>
                ) : forwardVerdict.suspicious ? (
                  <span className="inline-flex items-center gap-1 text-red-700">
                    <AlertCircle className="w-4 h-4" /> Suspicious: at least one
                    reverse → forward mapping did not point back to {data.ip}
                  </span>
                ) : (
                  <span className="text-gray-600">
                    No forward checks available.
                  </span>
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
                      {f.matches ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                    </div>
                    <div className="mt-1 text-xs">
                      A=[{(f.resolved?.A || []).join(", ")}] AAAA=[
                      {(f.resolved?.AAAA || []).join(", ")}]
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
              <div className="font-semibold mb-2 text-white">
                Security notes
              </div>
              <ul className="list-disc pl-5 text-sm text-white space-y-1">
                <li>
                  DNSBL listing and reverse/forward mismatch are common signals
                  of potential abuse/spoofing.
                </li>
                <li>
                  ASN/WHOIS + Geolocation help attribute ownership and hosting
                  region.
                </li>
                <li>
                  PTR presence alone does not imply trust; always validate
                  forward mapping.
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
