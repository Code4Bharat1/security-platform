"use client";

import React, { useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  Shield, 
  Download, 
  Terminal, 
  Info, 
  Key, 
  FileText,
  AlertTriangle,
  Lock,
  Loader2
} from "lucide-react";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";

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

  const protectedAction = useProtectedAction();
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

    await protectedAction(async (userToken) => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_PROD_API_URL;
        if (!apiUrl) {
          setError(
            "API URL is not configured. Please set NEXT_PUBLIC_PROD_API_URL environment variable."
          );
          return;
        }

        const res = await fetch(`${apiUrl}/jwtsign/jwt-signature`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            token: t,
            secret: s,
            algorithm,
          }),
        });

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
    });
  };

  const safeName = (name) =>
    String(name || "token")
      .replace(/[^a-z0-9.-]/gi, "_")
      .toLowerCase();

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
    
    // Header Banner
    doc.setFillColor(18, 18, 18);
    doc.rect(0, 0, doc.internal.pageSize.width, 80, "F");
    
    doc.setTextColor(59, 130, 246); // Blue Accent
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("NEXCORE SECURITY PLATFORM", M, 35);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text("JWT SIGNATURE VALIDATION REPORT", M, 55);
    y = 110;

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
      headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
      margin: { left: M, right: M },
    });
    
    y = doc.lastAutoTable.finalY + 20;
    H("Header JSON");
    autoTable(doc, {
      startY: y,
      head: [["Key", "Value"]],
      body: Object.entries(result.header || {}).map(([k, v]) => [
        k,
        JSON.stringify(v),
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
      margin: { left: M, right: M },
    });
    
    y = doc.lastAutoTable.finalY + 20;
    H("Payload JSON");
    autoTable(doc, {
      startY: y,
      head: [["Key", "Value"]],
      body: Object.entries(result.payload || {}).map(([k, v]) => [
        k,
        JSON.stringify(v),
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
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

  return (
    <div 
      className="tool-detail-page min-h-screen"
      style={{
        '--hero-ambient-a': 'rgba(59, 130, 246, 0.08)',
        '--hero-ambient-b': 'rgba(6, 182, 212, 0.03)',
        '--glow-primary': '0 0 34px rgba(59, 130, 246, 0.16)',
        '--gold': '#3b82f6',
        '--gold-strong': '#60a5fa',
        '--gold-dark': '#1d4ed8',
        '--ring': 'rgba(59, 130, 246, 0.34)',
        '--surface-glow': 'rgba(59, 130, 246, 0.14)',
      }}
    >
      <style>{`
        .tool-detail-page .tool-detail-shell {
          padding-top: 3.5rem !important;
        }
        .tool-detail-page ::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.35) !important;
        }
        .tool-detail-page ::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.55) !important;
        }
        .tool-detail-page ::selection {
          background: rgba(59, 130, 246, 0.22) !important;
          color: #eff6ff !important;
        }
        .tool-detail-page :is(button, [role="button"]):is([class*="bg-blue-"], [class*="bg-sky-"]) {
          color: #000000 !important;
        }
        .tool-detail-page :is(button, [role="button"]):is([class*="bg-blue-"], [class*="bg-sky-"]) * {
          color: #000000 !important;
        }
      `}</style>

      <div className="tool-detail-shell">
        {/* Navigation & Header */}
        <div className="flex justify-end mb-8">
          <span className="rounded-full border border-blue-500/30 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-blue-400">
            Blue Team
          </span>
        </div>

        {/* Title Block */}
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl border border-blue-500/30 overflow-hidden shadow-lg flex-shrink-0 flex items-center justify-center">
            <Lock className="h-8 w-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              JWT SIGNATURE <span className="text-blue-400">VALIDATOR</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Inspect claims, decode structures, verify encryption algorithms, and ensure the cryptographic signature integrity of JSON Web Tokens.
            </p>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* Form Card */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-blue-500/10 transition-all duration-300 space-y-5">
              <h2 className="text-lg font-mono font-medium text-zinc-100 mb-2 flex items-center gap-2">
                <Lock className="h-5 w-5 text-blue-400" />
                Token Parameters
              </h2>

              <div className="space-y-4">
                {/* JWT Token */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                    JWT Token
                  </label>
                  <textarea
                    placeholder="Paste your JWT Token here (e.g. eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 text-xs focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 focus:shadow-[0_0_12px_rgba(59,130,246,0.08)] focus:outline-none transition-all placeholder:text-zinc-650 font-mono resize-none"
                    rows={4}
                  />
                </div>

                {/* Algorithm */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                    Signature Verification Algorithm
                  </label>
                  <select
                    value={algorithm}
                    onChange={(e) => setAlgorithm(e.target.value)}
                    className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3 text-sm focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 focus:shadow-[0_0_12px_rgba(59,130,246,0.08)] focus:outline-none transition-all font-mono"
                  >
                    {ALG_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-zinc-950 text-zinc-300">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] font-mono text-zinc-500 mt-1.5">
                    For RS* / ES* cryptographic checks, choose the correct algorithm and paste public PEM key material.
                  </p>
                </div>

                {/* Secret Key */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono text-zinc-400 mb-2 font-semibold">
                    {isAsymmetric ? "Public Key / Certificate (PEM)" : "HMAC Secret Key / Shared Password"}
                  </label>
                  {isAsymmetric ? (
                    <textarea
                      placeholder={`-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----`}
                      value={secret}
                      onChange={(e) => setSecret(e.target.value)}
                      className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3 text-xs focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 focus:shadow-[0_0_12px_rgba(59,130,246,0.08)] focus:outline-none transition-all font-mono"
                      rows={5}
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g. your-256-bit-shared-secret"
                      value={secret}
                      onChange={(e) => setSecret(e.target.value)}
                      className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3 text-sm focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 focus:shadow-[0_0_12px_rgba(59,130,246,0.08)] focus:outline-none transition-all font-mono"
                    />
                  )}
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    onClick={handleValidate}
                    disabled={loading || !token.trim() || !secret.trim()}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-black rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2 focus:ring-offset-black/20 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-black" />
                        Validating Signature...
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4 text-black" />
                        Validate JWT Token
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Error output */}
            {error && (
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-950/10 text-red-400 text-xs font-mono flex items-start gap-2">
                <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                <span>Validation Failure: {error}</span>
              </div>
            )}

            {/* Validation Results */}
            {result && (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-blue-500/10 transition-all duration-300 space-y-6">
                
                {/* Success Banner */}
                <div className="border border-blue-500/30 bg-blue-500/10 rounded-xl p-4 flex items-center gap-3 text-blue-400">
                  <Shield className="h-6 w-6" />
                  <div>
                    <h2 className="text-lg font-mono font-bold uppercase tracking-wider">
                      JWT Signature Valid
                    </h2>
                    <p className="text-xs font-mono text-zinc-400 mt-0.5">
                      The cryptographic integrity check completed successfully.
                    </p>
                  </div>
                </div>

                {/* Exporter actions */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleDownloadPDF}
                    className="flex-1 bg-zinc-900/40 hover:bg-blue-500/5 text-zinc-300 hover:text-blue-400 border border-zinc-800/80 hover:border-blue-500/30 rounded-xl font-mono font-bold text-xs uppercase py-3.5 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF Report
                  </button>

                  <button
                    onClick={handleDownloadTXT}
                    className="flex-1 bg-zinc-900/40 hover:bg-blue-500/5 text-zinc-300 hover:text-blue-400 border border-zinc-800/80 hover:border-blue-500/30 rounded-xl font-mono font-bold text-xs uppercase py-3.5 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    Download TXT Report
                  </button>
                </div>

                {/* JSON Blocks Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl font-mono text-xs overflow-auto">
                    <h3 className="text-sm font-mono font-bold text-blue-400 mb-3 flex items-center gap-1.5 border-b border-zinc-800/40 pb-2">
                      <Terminal className="w-4 h-4" />
                      Header JSON
                    </h3>
                    <pre className="text-xs text-zinc-300 leading-relaxed">
                      {JSON.stringify(result.header, null, 2)}
                    </pre>
                  </div>

                  <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl font-mono text-xs overflow-auto">
                    <h3 className="text-sm font-mono font-bold text-blue-400 mb-3 flex items-center gap-1.5 border-b border-zinc-800/40 pb-2">
                      <Terminal className="w-4 h-4" />
                      Payload JSON
                    </h3>
                    <pre className="text-xs text-zinc-300 leading-relaxed">
                      {JSON.stringify(result.payload, null, 2)}
                    </pre>
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Guidance sidebar card */}
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Info className="text-blue-400 w-4 h-4" />
                Validation Scope
              </h2>
              <ul className="space-y-3.5 list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Verifies cryptographic signatures against selected algorithm keys (HS*, RS*, ES*).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Audits token expiration (exp), activation time (nbf), and audience validation parameters.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500/60 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Detects common structural algorithm attacks (e.g. none algorithm signatures).
                  </span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
