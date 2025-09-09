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

  const isAsymmetric = useMemo(() => /^(RS|ES)/.test(algorithm), [algorithm]);

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
            secret: s,
            algorithm,
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
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("JWT Signature Validation Report", M, y);
    y += 24;
    sub(`Generated: ${new Date().toLocaleString()}`);
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
    });
    y = doc.lastAutoTable.finalY + 16;
    H("Header");
    autoTable(doc, {
      startY: y,
      head: [["Key", "Value"]],
      body: Object.entries(result.header || {}).map(([k, v]) => [k, JSON.stringify(v)]),
      styles: { fontSize: 10 },
      margin: { left: M, right: M },
    });
    y = doc.lastAutoTable.finalY + 16;
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
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `JWT_Report_${safeName(result.header?.typ || "JWT")}.txt`;
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(link.href);
    link.remove();
  };

  return (
    <div className="min-h-screen bg-black py-8 px-4 text-white">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
<div className="flex items-center justify-start gap-4 mb-6">
  <img
    src="/tools/card-images/jwt_signature.png"
    alt="verify"
    className="w-20 h-20"
  />
  <div className="text-left">
    <h1 className="text-3xl font-bold">JWT Signature Validator</h1>
    <p className="text-gray-300 text-sm">
      Validate and decode your JSON Web Tokens securely
    </p>
  </div>
</div>



        {/* Card */}
        <div className="bg-[#1c1c1e] rounded-xl shadow-lg border border-blue-700 p-6 space-y-6">
          <div className="bg-blue-600 p-4 rounded-lg ">
  <h1 className="text-2xl font-bold text-white">JWT Signature Validator</h1>
</div>

          {/* JWT Token */}
          <div>
            <label className="block text-sm font-semibold text-blue-400 mb-2">JWT Token</label>
            <textarea
              placeholder="Paste your JWT Token here ( e.g , gsdjbcdsmnvwhkvhjiesnjrve,vb)"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full border border-blue-600 bg-transparent p-4 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm font-mono resize-none"
              rows={4}
            />
          </div>

          {/* Algorithm + Secret */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-blue-400">Algorithm</label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              className="w-full border border-blue-600 bg-transparent p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {ALG_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-black">
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400">
              For RS*/ES* choose the correct algorithm and provide a PEM public key.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-blue-400 mb-2">
              {isAsymmetric ? "Public Key / Certificate (PEM)" : "Secret Key"}
            </label>
            {isAsymmetric ? (
              <textarea
                placeholder={`-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----`}
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="w-full border border-blue-600 bg-transparent p-3 rounded-lg font-mono"
                rows={5}
              />
            ) : (
              <input
                type="text"
                placeholder="Enter your HMAC secret (e.g. , your-256-bit-secret)"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="w-full border border-blue-600 bg-transparent p-3 rounded-lg font-mono"
              />
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleValidate}
              disabled={loading || !token.trim() || !secret.trim()}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 transition"
            >
              {loading ? "Validating..." : "Validate JWT Token"}
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={!result}
              className={`px-4 py-3 rounded-lg border transition ${
                result
                  ? "border-blue-500 text-blue-400 hover:bg-blue-900/30"
                  : "border-blue-600 text-gray-500 cursor-not-allowed"
              }`}
            >
              Download PDF
            </button>
            <button
              onClick={handleDownloadTXT}
              disabled={!result}
              className={`px-4 py-3 rounded-lg border transition ${
                result
                  ? "border-blue-500 text-blue-400 hover:bg-blue-900/30"
                  : "border-blue-600 text-gray-500 cursor-not-allowed"
              }`}
            >
              Download TXT
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-900/30 border-l-4 border-red-500 p-4 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Success */}
          {result && (
            <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-6">
              <h2 className="text-lg font-bold text-blue-400 mb-3">JWT Signature Valid</h2>
              <p className="text-gray-300 text-sm mb-4">
                Your JWT token has been successfully validated and decoded
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#111] rounded-lg p-4 border border-blue-700">
                  <h3 className="text-sm font-bold text-blue-400 mb-2">Header</h3>
                  <pre className="text-xs text-gray-300">{JSON.stringify(result.header, null, 2)}</pre>
                </div>
                <div className="bg-[#111] rounded-lg p-4 border border-blue-700">
                  <h3 className="text-sm font-bold text-blue-400 mb-2">Payload</h3>
                  <pre className="text-xs text-gray-300">{JSON.stringify(result.payload, null, 2)}</pre>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-6 text-sm text-blue-400">
          Secure <span className="font-semibold">JWT</span> validation powered by industry-standard algorithms
        </div>
      </div>
    </div>
  );
}

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

  const isAsymmetric = useMemo(() => /^(RS|ES)/.test(algorithm), [algorithm]);

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
            secret: s,
            algorithm,
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
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("JWT Signature Validation Report", M, y);
    y += 24;
    sub(`Generated: ${new Date().toLocaleString()}`);
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
    });
    y = doc.lastAutoTable.finalY + 16;
    H("Header");
    autoTable(doc, {
      startY: y,
      head: [["Key", "Value"]],
      body: Object.entries(result.header || {}).map(([k, v]) => [k, JSON.stringify(v)]),
      styles: { fontSize: 10 },
      margin: { left: M, right: M },
    });
    y = doc.lastAutoTable.finalY + 16;
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
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `JWT_Report_${safeName(result.header?.typ || "JWT")}.txt`;
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(link.href);
    link.remove();
  };

  return (
    <div className="min-h-screen bg-black py-8 px-4 text-white">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
<div className="flex items-center justify-start gap-4 mb-6">
  <img
    src="/BlueTeam/jwt_signature.png"
    alt="verify"
    className="w-20 h-20 rounded-full border-4 border-blue-500"
  />
  <div className="text-left">
    <h1 className="text-3xl font-bold">JWT Signature Validator</h1>
    <p className="text-gray-300 text-sm">
      Validate and decode your JSON Web Tokens securely
    </p>
  </div>
</div>




        {/* Card */}
        <div className="bg-[#1c1c1e] rounded-xl shadow-lg border border-blue-700 p-6 space-y-6">
          <div className="bg-blue-600 p-4 rounded-lg ">
  <h1 className="text-2xl font-bold text-white">JWT Signature Validator</h1>
</div>

          {/* JWT Token */}
          <div>
            <label className="block text-sm font-semibold text-blue-400 mb-2">JWT Token</label>
            <textarea
              placeholder="Paste your JWT Token here ( e.g , gsdjbcdsmnvwhkvhjiesnjrve,vb)"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full border border-blue-600 bg-transparent p-4 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm font-mono resize-none"
              rows={4}
            />
          </div>

          {/* Algorithm + Secret */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-blue-400">Algorithm</label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              className="w-full border border-blue-600 bg-transparent p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {ALG_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-black">
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400">
              For RS*/ES* choose the correct algorithm and provide a PEM public key.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-blue-400 mb-2">
              {isAsymmetric ? "Public Key / Certificate (PEM)" : "Secret Key"}
            </label>
            {isAsymmetric ? (
              <textarea
                placeholder={`-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----`}
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="w-full border border-blue-600 bg-transparent p-3 rounded-lg font-mono"
                rows={5}
              />
            ) : (
              <input
                type="text"
                placeholder="Enter your HMAC secret (e.g. , your-256-bit-secret)"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="w-full border border-blue-600 bg-transparent p-3 rounded-lg font-mono"
              />
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
  onClick={handleValidate}
  disabled={loading || !token.trim() || !secret.trim()}
  className="flex-1 bg-blue text-white py-3 px-6 rounded-lg hover:bg-blue-600 disabled:bg-blue-600 transition"
>
  {loading ? "Validating..." : "Validate JWT Token"}
</button>
<button
  onClick={handleDownloadPDF}
  disabled={!result}
  className={`px-4 py-3 rounded-lg border transition ${
    result
      ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
      : "bg-blue-600 text-gray-100 border-blue-300 cursor-not-allowed"
  }`}
>
  Download PDF
</button>

           
            <button
  onClick={handleDownloadTXT}
  disabled={!result}
  className={`px-4 py-3 rounded-lg border transition ${
    result
      ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
      : "bg-blue-600 text-gray-100 border-blue-300 cursor-not-allowed"
  }`}
>
  Download TXT
</button>

          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-900/30 border-l-4 border-red-500 p-4 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Success */}
          {result && (
            <div className="bg-blue-600 border border-blue-600 rounded-lg p-6">
              <h2 className="text-lg font-bold text-blue-400 mb-3">JWT Signature Valid</h2>
              <p className="text-gray-300 text-sm mb-4">
                Your JWT token has been successfully validated and decoded
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#111] rounded-lg p-4 border border-blue-700">
                  <h3 className="text-sm font-bold text-blue-400 mb-2">Header</h3>
                  <pre className="text-xs text-gray-300">{JSON.stringify(result.header, null, 2)}</pre>
                </div>
                <div className="bg-[#111] rounded-lg p-4 border border-blue-700">
                  <h3 className="text-sm font-bold text-blue-400 mb-2">Payload</h3>
                  <pre className="text-xs text-gray-300">{JSON.stringify(result.payload, null, 2)}</pre>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-6 text-sm text-blue-400">
          Secure <span className="font-semibold">JWT</span> validation powered by industry-standard algorithms
        </div>
      </div>
    </div>
  );
}
