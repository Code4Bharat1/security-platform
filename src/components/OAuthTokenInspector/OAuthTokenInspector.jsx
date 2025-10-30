"use client";

import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";

/* ---------- small helpers ---------- */
const safeName = (str) =>
  String(str || "token")
    .toLowerCase()
    .replace(/[^a-z0-9._-]/gi, "_")
    .slice(0, 60);

const fmtDateTime = (epoch) =>
  epoch == null ? "—" : new Date(epoch * 1000).toLocaleString();

function fmtDuration(s) {
  if (s == null) return "—";
  const neg = s < 0;
  s = Math.abs(s);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  const parts = [];
  if (d) parts.push(`${d}d`);
  if (h || d) parts.push(`${h}h`);
  if (m || h || d) parts.push(`${m}m`);
  parts.push(`${sec}s`);
  return (neg ? "-" : "") + parts.join(" ");
}

/* Basic client-side score if backend doesn't provide one */
function computeScore(payload = {}, issues = []) {
  let score = 100;
  const breakdown = [];

  const penalize = (label, pts) => {
    score -= pts;
    breakdown.push({ label, delta: -pts });
  };

  if (!("exp" in payload)) penalize("Missing exp", 25);
  if (!("iat" in payload)) penalize("Missing iat", 10);
  if (!("iss" in payload)) penalize("Missing iss", 10);
  if (!("sub" in payload)) penalize("Missing sub", 5);

  if (payload.exp && Date.now() >= payload.exp * 1000)
    penalize("Token expired", 30);

  issues.forEach((i) => {
    if (String(i).toLowerCase().includes("alg: none"))
      penalize("alg: none", 50);
  });

  score = Math.max(0, Math.min(100, score));
  return { score, breakdown };
}

/* Build endpoint safely whether env contains /api or not */
const API_BASE = (process.env.NEXT_PUBLIC_PROD_API_URL || "").replace(
  /\/$/,
  ""
);
const USE_API_PREFIX = !/\/api$/i.test(API_BASE);
const ENDPOINT = `${API_BASE}${
  USE_API_PREFIX ? "/api" : ""
}/auth/oauthTokenInspector`;

export default function OAuthTokenInspector() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState(null);
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  const protection = useProtectedAction();

  /* live clock for countdown */
  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  /* auto-hide toast */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (message, type = "success") => setToast({ message, type });

  /* Call API */
  const analyzeToken = async () => {
    setLoading(true);
    setResult(null);

    await protection(async (userToken) => {
      try {
        const res = await fetch(ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({ token }),
        });
        const data = await res.json().catch(() => ({}));
        setResult(data);
        if (!res.ok || data?.error) {
          showToast(data?.error || `Analysis failed (${res.status})`, "error");
        } else {
          showToast("Token analyzed successfully! ✨", "success");
        }
      } catch (e) {
        setResult({ error: "Connection error. Is the API running?" });
        showToast("Connection error. Please try again.", "error");
      } finally {
        setLoading(false);
      }
    });
  };

  /* Derive meta either from API (if provided) or from payload */
  const payload = result?.payload || {};
  const issues = result?.issues || [];

  const expEpoch = result?.meta?.expEpoch ?? payload?.exp ?? null;
  const iatEpoch = result?.meta?.iatEpoch ?? payload?.iat ?? null;

  const isExpired =
    result?.meta?.isExpired ?? (expEpoch ? now >= expEpoch : null);

  const lifetimePercentUsed = useMemo(() => {
    if (result?.meta?.lifetimePercentUsed != null)
      return result.meta.lifetimePercentUsed;
    if (expEpoch != null && iatEpoch != null && expEpoch > iatEpoch) {
      const used = Math.min(Math.max(now - iatEpoch, 0), expEpoch - iatEpoch);
      return Math.round((used / (expEpoch - iatEpoch)) * 100);
    }
    return null;
  }, [result?.meta?.lifetimePercentUsed, expEpoch, iatEpoch, now]);

  const timeRemaining = useMemo(() => {
    if (expEpoch == null) return null;
    return expEpoch - now;
  }, [expEpoch, now]);

  const scoreObj = useMemo(() => {
    if (result?.meta?.securityScore != null) {
      return {
        score: result.meta.securityScore,
        breakdown: result.meta.scoreBreakdown || [],
      };
    }
    return computeScore(payload, issues);
  }, [
    result?.meta?.securityScore,
    result?.meta?.scoreBreakdown,
    payload,
    issues,
  ]);

  const score = scoreObj.score;
  const scoreBarColor =
    score >= 80
      ? "bg-emerald-500"
      : score >= 60
      ? "bg-amber-500"
      : "bg-red-500";

  const progressColor =
    timeRemaining == null
      ? "bg-gray-300"
      : isExpired
      ? "bg-red-500"
      : (lifetimePercentUsed ?? 0) >= 80
      ? "bg-amber-500"
      : "bg-emerald-500";

  /* ---------- Exports ---------- */
  const handleDownloadTxt = () => {
    if (!result || result.error) return;
    const lines = [
      "OAuth Token Report",
      `Generated: ${new Date().toLocaleString()}`,
      "",
      "== Summary ==",
      `Issued At: ${fmtDateTime(iatEpoch)}`,
      `Expires At: ${fmtDateTime(expEpoch)}`,
      `Time Remaining: ${
        expEpoch == null
          ? "—"
          : timeRemaining <= 0 // ✅ FIX: Changed from isExpired to timeRemaining <= 0
          ? "Expired"
          : fmtDuration(timeRemaining)
      }`,
      `Security Score: ${score}/100`,
      "",
      "== Issues ==",
      ...(issues.length ? issues : ["None"]),
      "",
      "== Payload ==",
      JSON.stringify(payload, null, 2),
      "",
      "== Score Breakdown ==",
      ...(scoreObj.breakdown.length
        ? scoreObj.breakdown.map(
            (b) => `- ${b.label}${b.delta ? ` (${b.delta})` : ""}`
          )
        : ["—"]),
      "",
    ].join("\n");

    const nameFrom = payload.iss || payload.sub || payload.jti;
    const filename = `OAuth_Report_${safeName(nameFrom)}.txt`;

    const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = () => {
    if (!result || result.error) return;

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const M = 40;
    let y = 56;

    const add = (t, size = 12, style = "normal") => {
      doc.setFont("helvetica", style);
      doc.setFontSize(size);
      doc.text(String(t), M, y);
      y += 18;
    };

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("OAuth Token Report", M, y);
    y += 26;

    add(`Generated: ${new Date().toLocaleString()}`);

    // Summary
    autoTable(doc, {
      startY: y,
      head: [["Field", "Value"]],
      body: [
        ["Issued At", fmtDateTime(iatEpoch)],
        ["Expires At", fmtDateTime(expEpoch)],
        [
          "Time Remaining",
          expEpoch == null
            ? "—"
            : timeRemaining <= 0 // ✅ FIX: Changed from isExpired to timeRemaining <= 0
            ? "Expired"
            : fmtDuration(timeRemaining),
        ],
        ["Security Score", `${score}/100`],
      ],
      styles: { font: "helvetica", fontSize: 10 },
      headStyles: { fillColor: [16, 185, 129] },
      margin: { left: M, right: M },
    });
    y = doc.lastAutoTable.finalY + 18;

    // Issues
    autoTable(doc, {
      startY: y,
      head: [["Issues"]],
      body: (issues.length ? issues : ["None"]).map((i) => [i]),
      styles: { fontSize: 10 },
      margin: { left: M, right: M },
    });
    y = doc.lastAutoTable.finalY + 18;

    // Score breakdown
    if (scoreObj.breakdown.length) {
      autoTable(doc, {
        startY: y,
        head: [["Item", "Delta"]],
        body: scoreObj.breakdown.map((b) => [b.label, String(b.delta ?? "")]),
        styles: { fontSize: 10 },
        margin: { left: M, right: M },
      });
      y = doc.lastAutoTable.finalY + 18;
    }

    // Payload
    add("Payload", 13, "bold");
    const payloadStr = JSON.stringify(payload ?? {}, null, 2);
    const lines = doc.splitTextToSize(payloadStr, 515);
    lines.forEach((ln) => {
      if (y > 780) {
        doc.addPage();
        y = 56;
      }
      doc.text(ln, M, y);
      y += 14;
    });

    const nameFrom = payload.iss || payload.sub || payload.jti;
    const filename = `OAuth_Report_${safeName(nameFrom)}.pdf`;
    doc.save(filename);
  };

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen bg-black p-4 relative">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right duration-300">
          <div
            className={`px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-sm ${
              toast.type === "success"
                ? "bg-emerald-900/90 border-emerald-700 text-emerald-200"
                : "bg-red-900/90 border-red-700 text-red-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  toast.type === "success" ? "bg-emerald-800" : "bg-red-800"
                }`}
              >
                {toast.type === "success" ? "✓" : "×"}
              </div>
              <span className="font-medium">{toast.message}</span>
              <button
                onClick={() => setToast(null)}
                className="ml-2 text-gray-400 hover:text-gray-200"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-left gap-6 mb-8 pt-8 mt-15">
          <img
            src="/BlueTeam/oauth_token.png"
            alt="OAuth2"
            className="w-30 h-30 rounded-full shadow-lg border-2 border-blue-500"
          />
          <div className="text-left">
            <h1 className="text-4xl font-bold text-white mb-2">
              OAuth Token Inspector
            </h1>
            <p className="text-gray-400 text-lg">
              Analyze and validate your JWT tokens with security insights
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-gray-900/90 backdrop-blur-sm shadow-xl rounded-3xl border border-white-800 overflow-hidden">
          <div className="p-8">
            {/* Input */}
            <div className="mb-6">
              <label className="block text-xl font-semibold text-gray-300 mb-3 text-center">
                Paste Your OAuth Token (JWT)
              </label>
              <textarea
                rows={6}
                className="w-full bg-black border-2 border-white-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-900 rounded-2xl p-4 text-sm font-mono resize-none text-gray-200 transition-all"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={analyzeToken}
                disabled={!token.trim() || loading}
                className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-700 text-white font-bold rounded-2xl transition-all duration-300"
              >
                {loading ? "Analyzing Token..." : "Inspect Token"}
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={!result || result.error}
                className="px-4 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-700 text-white font-bold transition-all duration-300"
                title={!result ? "Run analysis first" : "Download PDF report"}
              >
                📄 Download PDF
              </button>

              <button
                type="button"
                onClick={handleDownloadTxt}
                disabled={!result || result.error}
                className="px-4 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-700 text-white font-bold transition-all duration-300"
                title={!result ? "Run analysis first" : "Download TXT report"}
              >
                📝 Download TXT
              </button>
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className="border-t border-white-800 bg-black p-8 space-y-6">
              {result.error ? (
                <div className="bg-red-900/50 border-l-4 border-red-700 p-6 rounded-2xl shadow-sm">
                  <h3 className="font-bold text-red-400 mb-1">
                    Error Occurred
                  </h3>
                  <p className="text-red-300">{result.error}</p>
                </div>
              ) : (
                <>
                  {/* Summary cards */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 rounded-xl border border-white-700 bg-gray-800">
                      <div className="text-sm text-gray-400 mb-1">
                        Issued At
                      </div>
                      <div className="font-semibold text-white">
                        {fmtDateTime(iatEpoch)}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl border border-white-700 bg-gray-800">
                      <div className="text-sm text-gray-400 mb-1">
                        Expires At
                      </div>
                      <div className="font-semibold text-white">
                        {fmtDateTime(expEpoch)}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl border border-white-700 bg-gray-800">
                      <div className="text-sm text-gray-400 mb-2">
                        Time Remaining
                      </div>
                      <div className="font-semibold text-white">
                        {expEpoch == null
                          ? "—"
                          : timeRemaining <=
                            0 /* ✅ FIX: Changed from isExpired to timeRemaining <= 0 */
                          ? "Expired"
                          : fmtDuration(timeRemaining)}
                      </div>
                      {lifetimePercentUsed != null && (
                        <div className="mt-3 h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`${progressColor} h-2`}
                            style={{
                              width: `${Math.min(
                                Math.max(lifetimePercentUsed, 0),
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="p-4 rounded-xl border border-white-700 bg-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-gray-400">
                          Token Security Score
                        </div>
                        <div className="text-xs text-gray-500">{score}/100</div>
                      </div>
                      <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`${scoreBarColor} h-2`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      {!!scoreObj.breakdown.length && (
                        <ul className="mt-3 text-sm text-gray-400 list-disc ml-5 space-y-1">
                          {scoreObj.breakdown.map((b, i) => (
                            <li key={i}>
                              {b.label} {b.delta ? `(${b.delta})` : ""}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Issues */}
                  {issues.length > 0 ? (
                    <div className="bg-amber-900/40 border border-amber-700 rounded-2xl p-6 shadow-sm">
                      <h2 className="text-lg font-bold text-amber-400 mb-3">
                        Security Issues Detected
                      </h2>
                      <div className="space-y-2">
                        {issues.map((issue, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-gray-800 rounded-xl border border-amber-800 text-gray-200"
                          >
                            {issue}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-emerald-900/40 border border-emerald-700 rounded-2xl p-6 shadow-sm">
                      <h3 className="text-lg font-bold text-emerald-400 mb-1">
                        Token Validated
                      </h3>
                      <p className="text-emerald-300">
                        No major security issues found.
                      </p>
                    </div>
                  )}

                  {/* Payload */}
                  <div className="bg-gray-900 rounded-2xl p-6 border border-white-700">
                    <h2 className="text-lg font-bold text-emerald-400 mb-3">
                      Decoded Payload
                    </h2>
                    <pre className="overflow-x-auto text-sm text-gray-300 font-mono leading-relaxed">
                      {JSON.stringify(payload, null, 2)}
                    </pre>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="text-center mt-8 text-blue-600 text-sm ">
          <p>Secure token analysis • Built with modern security practices</p>
        </div>
      </div>
    </div>
  );
}
