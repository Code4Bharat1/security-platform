"use client";
import { useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const ALG_OPTIONS = [
  { value: "auto", label: "Auto (from token)" },
  { value: "HS256", label: "HS256" },
  { value: "HS384", label: "HS384" },
  { value: "HS512", label: "HS512" },
  { value: "RS256", label: "RS256" },
  { value: "RS384", label: "RS384" },
  { value: "RS512", label: "RS512" },
  { value: "ES256", label: "ES256" },
  { value: "ES384", label: "ES384" },
  { value: "ES512", label: "ES512" },
];

export default function JWTSignatureValidator() {
  const [token, setToken] = useState("");
  const [secret, setSecret] = useState("");
  const [algorithm, setAlgorithm] = useState("auto");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const isAsymmetric = useMemo(
    () => /^(RS|ES)/.test(algorithm),
    [algorithm]
  );

  const handleValidate = async () => {
    const t = token.trim();
    const s = secret.trim();

    if (!t || !s) {
      setError("Both JWT token and secret/key are required");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/jwtsign/jwt-signature`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: t,
            secret: s,          // For RS*/ES* this should be a PEM public key or certificate
            algorithm,          // NEW: selected algorithm
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || "Invalid JWT");
      }
    } catch (err) {
      console.error("Network error:", err);
      setError(
        "Network error: Unable to connect to server. Make sure the backend is reachable."
      );
    } finally {
      setLoading(false);
    }
  };

  // ----- EXPORTS -----
  const safeName = (name) =>
    String(name || "token").replace(/[^a-z0-9.-]/gi, "_").toLowerCase();

  const handleDownloadPDF = () => {
    if (!result) return;

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const M = 40;
    let y = 56;

    const H = (txt) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(txt, M, y);
      y += 18;
    };
    const sub = (txt) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(txt, M, y);
      y += 16;
    };

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("JWT Signature Validation Report", M, y);
    y += 24;
    sub(`Generated: ${new Date().toLocaleString()}`);

    // Summary
    H("Summary");
    autoTable(doc, {
      startY: y,
      head: [["Field", "Value"]],
      body: [
        ["Chosen Algorithm", algorithm],
        ["Header alg", result.header?.alg ?? "—"],
        ["Header typ", result.header?.typ ?? "—"],
        ["Validation Status", "Valid"],
      ],
      styles: { font: "helvetica", fontSize: 10 },
      margin: { left: M, right: M },
      columnStyles: { 0: { cellWidth: 170 }, 1: { cellWidth: 330 } },
    });
    y = doc.lastAutoTable.finalY + 16;

    // Header
    H("Header");
    autoTable(doc, {
      startY: y,
      head: [["Key", "Value"]],
      body: Object.entries(result.header || {}).map(([k, v]) => [k, JSON.stringify(v)]),
      styles: { fontSize: 10 },
      margin: { left: M, right: M },
    });
    y = doc.lastAutoTable.finalY + 16;

    // Payload
    H("Payload");
    autoTable(doc, {
      startY: y,
      head: [["Key", "Value"]],
      body: Object.entries(result.payload || {}).map(([k, v]) => [k, JSON.stringify(v)]),
      styles: { fontSize: 10 },
      margin: { left: M, right: M },
    });

    doc.save(`JWT_Report_${safeName(result.header?.typ || "JWT")}.pdf`);
  };

  const handleDownloadTXT = () => {
    if (!result) return;

    const lines = [];
    lines.push("JWT Signature Validation Report");
    lines.push("====================================");
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push("");
    lines.push("Summary");
    lines.push("------------------------------------");
    lines.push(`Chosen Algorithm: ${algorithm}`);
    lines.push(`Header alg:       ${result.header?.alg ?? "—"}`);
    lines.push(`Header typ:       ${result.header?.typ ?? "—"}`);
    lines.push(`Validation:       Valid`);
    lines.push("");
    lines.push("Header");
    lines.push("------------------------------------");
    Object.entries(result.header || {}).forEach(([k, v]) =>
      lines.push(`${k}: ${JSON.stringify(v)}`)
    );
    lines.push("");
    lines.push("Payload");
    lines.push("------------------------------------");
    Object.entries(result.payload || {}).forEach(([k, v]) =>
      lines.push(`${k}: ${JSON.stringify(v)}`)
    );

    const blob = new Blob([lines.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `JWT_Report_${safeName(result.header?.typ || "JWT")}.txt`;
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(link.href);
    link.remove();
  };

  // ----- UI -----
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img src="/tools/card-images/jwt_signature.png" alt="verify" className="w-16 h-20 mb-4 mt-7" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            JWT Signature Validator
          </h1>
          <p className="text-green-700 text-lg">
            Validate and decode your JSON Web Tokens securely
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-8 space-y-6">
          {/* JWT Token Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-green-800 mb-2">
              JWT Token
            </label>
            <div className="relative">
              <textarea
                placeholder="Paste your JWT token here (e.g., eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full border-2 border-green-200 p-4 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-400 transition-all duration-200 text-sm font-mono resize-none"
                rows={5}
              />
              <div className="absolute top-3 right-3 text-xs text-green-500 bg-green-50 px-2 py-1 rounded-full">
                {token.length} characters
              </div>
            </div>
          </div>

          {/* Algorithm + Key/Secret */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-green-800 mb-2">
                Algorithm
              </label>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                className="w-full border-2 border-green-200 p-3 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-400 transition-all duration-200 bg-white"
              >
                {ALG_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-green-700">
                For RS*/ES* choose the correct algorithm and provide a PEM public key.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-green-800 mb-2">
                {isAsymmetric ? "Public Key / Certificate (PEM)" : "Secret Key"}
              </label>

              {isAsymmetric ? (
                <textarea
                  placeholder={`-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----`}
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  rows={isAsymmetric ? 6 : 1}
                  className="w-full border-2 border-green-200 p-3 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-400 transition-all duration-200 font-mono"
                />
              ) : (
                <input
                  type="text"
                  placeholder="Enter your HMAC secret (e.g., your-256-bit-secret)"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  className="w-full border-2 border-green-200 p-3 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-400 transition-all duration-200 font-mono"
                />
              )}
            </div>
          </div>

          {/* Validate Button */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleValidate}
              disabled={loading || !token.trim() || !secret.trim()}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Validating...</span>
                </div>
              ) : (
                "Validate JWT Token"
              )}
            </button>

            {/* Export buttons (enabled only when result exists) */}
            <button
              onClick={handleDownloadPDF}
              disabled={!result}
              className={`px-4 py-3 rounded-xl border transition ${
                result
                  ? "border-green-700 text-green-700 hover:bg-green-50"
                  : "border-gray-300 text-gray-400 cursor-not-allowed"
              }`}
              title={!result ? "Validate a token first" : "Download PDF"}
            >
              Download PDF
            </button>
            <button
              onClick={handleDownloadTXT}
              disabled={!result}
              className={`px-4 py-3 rounded-xl border transition ${
                result
                  ? "border-green-700 text-green-700 hover:bg-green-50"
                  : "border-gray-300 text-gray-400 cursor-not-allowed"
              }`}
              title={!result ? "Validate a token first" : "Download TXT"}
            >
              Download TXT
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-xl">
              <h3 className="text-sm font-semibold text-red-800">Validation Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          )}

          {/* Success */}
          {result && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-3 h-5 border-r-2 border-b-2 border-white transform rotate-45 -mt-1"></div>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-green-800 mb-2">JWT Signature Valid</h2>
                <p className="text-green-600">
                  Your JWT token has been successfully validated and decoded
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-5 border border-green-100 shadow-sm">
                  <h3 className="text-lg font-bold text-green-800 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Header
                  </h3>
                  <pre className="bg-green-50 p-4 rounded-lg text-sm overflow-x-auto text-green-800 border border-green-100">
                    {JSON.stringify(result.header, null, 2)}
                  </pre>
                </div>

                <div className="bg-white rounded-xl p-5 border border-green-100 shadow-sm">
                  <h3 className="text-lg font-bold text-green-800 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Payload
                  </h3>
                  <pre className="bg-green-50 p-4 rounded-lg text-sm overflow-x-auto text-green-800 border border-green-100">
                    {JSON.stringify(result.payload, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-green-100">
                <h4 className="font-semibold text-green-800 mb-2">Token Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="font-semibold text-green-800">Algorithm (chosen)</div>
                    <div className="text-green-600">{algorithm}</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="font-semibold text-green-800">Header alg</div>
                    <div className="text-green-600">{result.header?.alg || "N/A"}</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="font-semibold text-green-800">Type</div>
                    <div className="text-green-600">{result.header?.typ || "N/A"}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-8 text-green-600 text-sm">
          <p>Secure JWT validation powered by industry-standard algorithms</p>
        </div>
      </div>
    </div>
  );
}
