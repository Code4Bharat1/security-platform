"use client";

import { useMemo, useState } from "react";
import {
  Clipboard,
  ClipboardCheck,
  Download,
  Lock,
  Unlock,
  Key,
  Info,
  ShieldCheck,
  Loader2,
  XCircle,
  FileText,
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";

export default function SecureCrypt() {
  const API = useMemo(
    () => (process.env.NEXT_PUBLIC_PROD_API_URL || "").replace(/\/+$/, ""),
    []
  );

  const [mode, setMode] = useState("encrypt");
  const [text, setText] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [keyB64, setKeyB64] = useState("");
  const [loading, setLoading] = useState(false);

  const [resultText, setResultText] = useState("");
  const [report, setReport] = useState(null);
  const [generatedKeyB64, setGeneratedKeyB64] = useState("");
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const protectedAction = useProtectedAction();

  const encrypt = async () => {
    setLoading(true);
    setResultText("");
    setReport(null);
    setGeneratedKeyB64("");
    setNote("");

    await protectedAction(async (userToken) => {
      try {
        const body = { text: text.trim() };
        if (passphrase.trim()) body.passphrase = passphrase;
        if (keyB64.trim()) body.keyB64 = keyB64.trim();

        const res = await fetch(`${API}/securecrypt/encrypt`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify(body),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Encryption failed.");

        setResultText(data.package || "");
        setReport(data.report || null);
        if (data.generatedKeyB64) setGeneratedKeyB64(data.generatedKeyB64);
        if (data.note) setNote(data.note);
      } catch (e) {
        setResultText(`ERROR: ${e.message || "Error contacting server."}`);
      } finally {
        setLoading(false);
      }
    });
  };

  const decrypt = async () => {
    setLoading(true);
    setResultText("");
    setReport(null);
    setNote("");

    await protectedAction(async (userToken) => {
      try {
        const body = { package: text.trim() };
        if (passphrase.trim()) body.passphrase = passphrase.trim();
        if (keyB64.trim()) body.keyB64 = keyB64.trim();

        const res = await fetch(`${API}/securecrypt/decrypt`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify(body),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Decryption failed.");

        setResultText(data.decrypted || "");
        setReport(data.report || null);
        setNote(data.integrity ? `Integrity: ${data.integrity}` : "");
      } catch (e) {
        setResultText(`ERROR: ${e.message || "Error contacting server."}`);
      } finally {
        setLoading(false);
      }
    });
  };

  const handleSubmit = () => {
    if (!text.trim()) return;
    mode === "encrypt" ? encrypt() : decrypt();
  };

  const copyToClipboard = async (val, setFn) => {
    try {
      await navigator.clipboard.writeText(val);
      setFn(true);
      setTimeout(() => setFn(false), 1400);
    } catch {}
  };

  const downloadTxt = (name, content) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = (r) => {
    const doc = new jsPDF({ unit: "pt" });

    // Branded header
    doc.setFillColor(18, 18, 18);
    doc.rect(0, 0, doc.internal.pageSize.width, 40, "F");
    doc.setTextColor(16, 185, 129);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(18);
    doc.text("NEXCORE SECURITY PLATFORM", 15, 20);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(`SECURECRYPT — ${mode.toUpperCase()} REPORT`, 15, 34);

    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.5);
    doc.line(15, 48, doc.internal.pageSize.width - 15, 48);

    const summary = [];
    if (mode === "encrypt") {
      summary.push(["Mode", "Encrypt"]);
      summary.push(["Algorithm", r?.algorithm || "-"]);
      summary.push(["KDF", r?.kdf || "-"]);
      summary.push(["Iterations", String(r?.iterations ?? "-")]);
      summary.push(["Key Length", `${r?.keyLengthBits ?? "-"} bit`]);
      summary.push(["Salt", r?.salt || "-"]);
      summary.push(["IV", r?.iv || "-"]);
      summary.push(["Auth Tag", r?.authTag || "-"]);
      summary.push(["Ciphertext", r?.ciphertext || "-"]);
    } else {
      summary.push(["Mode", "Decrypt"]);
      summary.push(["Algorithm", r?.algorithm || "-"]);
      summary.push(["KDF", r?.kdf || "-"]);
      summary.push(["Iterations", String(r?.iterations ?? "-")]);
      summary.push(["Key Length", `${r?.keyLengthBits ?? "-"} bit`]);
      summary.push(["Salt", r?.salt || "-"]);
      summary.push(["IV", r?.iv || "-"]);
      summary.push(["Auth Tag", r?.authTag || "-"]);
      summary.push(["Ciphertext (src)", r?.ciphertext || "-"]);
      summary.push(["Decrypted Result", resultText || "-"]);
    }

    autoTable(doc, {
      startY: 58,
      head: [["Field", "Value"]],
      body: summary,
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
    });

    doc.save(`${mode}_report.pdf`);
  };

  const resultIsError = resultText.startsWith("ERROR:");

  return (
    <div
      className="tool-detail-page min-h-screen"
      style={{
        "--hero-ambient-a": "rgba(16, 185, 129, 0.08)",
        "--hero-ambient-b": "rgba(16, 185, 129, 0.03)",
        "--glow-primary": "0 0 34px rgba(16, 185, 129, 0.16)",
        "--gold": "#10b981",
        "--gold-strong": "#34d399",
        "--gold-dark": "#047857",
        "--ring": "rgba(16, 185, 129, 0.34)",
        "--surface-glow": "rgba(16, 185, 129, 0.14)",
      }}
    >
      <style>{`
        .tool-detail-page .tool-detail-shell {
          padding-top: 3.5rem !important;
        }
        .tool-detail-page ::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.35) !important;
        }
        .tool-detail-page ::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.55) !important;
        }
        .tool-detail-page ::selection {
          background: rgba(16, 185, 129, 0.22) !important;
          color: #e6fffa !important;
        }
        .tool-detail-page .tool-detail-panel,
        .tool-detail-page .bg-gray-900,
        .tool-detail-page .bg-zinc-900\/70,
        .tool-detail-page .bg-black\/60,
        .tool-detail-page .bg-gray-800,
        .tool-detail-page .bg-black\/30 {
          background:
            radial-gradient(circle at center, rgba(16, 185, 129, 0.04), transparent 55%),
            linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)) !important;
          box-shadow:
            inset 0 0 0 1px rgba(255,255,255,0.01),
            0 0 40px rgba(16, 185, 129, 0.04) !important;
          border-color: rgba(16, 185, 129, 0.12) !important;
        }
      `}</style>

      <div className="tool-detail-shell">
        {/* Top Badge */}
        <div className="flex justify-end mb-8">
          <span className="rounded-full border border-emerald-500/30 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-emerald-400">
            Green Team
          </span>
        </div>

        {/* Title Block */}
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl border border-emerald-500/30 overflow-hidden shadow-lg flex-shrink-0 flex items-center justify-center">
            <Lock className="h-8 w-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              SECURE<span className="text-emerald-400">CRYPT</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              AES-256-GCM encryption with passphrase or key-based auth, portable ciphertext packages, and one-click export.
            </p>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">

          {/* Left Column */}
          <div className="space-y-6">

            {/* Mode Selection Card */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-emerald-500/10 transition-all duration-300">
              <h2 className="text-lg font-mono font-medium text-zinc-100 mb-6 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                Operation Mode
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { value: "encrypt", icon: Lock, label: "Encrypt", desc: "Plaintext → secure package" },
                  { value: "decrypt", icon: Unlock, label: "Decrypt", desc: "Package → original text" },
                ].map(({ value, icon: Icon, label, desc }) => (
                  <label
                    key={value}
                    className={`flex items-center gap-3 text-sm cursor-pointer group p-3.5 rounded-xl border transition-all ${
                      mode === value
                        ? "border-emerald-500/50 bg-emerald-500/5 text-white"
                        : "border-zinc-800/80 bg-white/[0.01] text-zinc-300 hover:bg-white/[0.03] hover:border-zinc-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="mode"
                      value={value}
                      checked={mode === value}
                      onChange={() => {
                        setMode(value);
                        setResultText("");
                        setReport(null);
                        setGeneratedKeyB64("");
                        setNote("");
                      }}
                      className="text-emerald-500 focus:ring-emerald-500 bg-transparent border-zinc-700"
                    />
                    <Icon className={`h-4 w-4 flex-shrink-0 ${mode === value ? "text-emerald-400" : "text-zinc-500"}`} />
                    <div>
                      <div className="font-mono font-semibold text-xs uppercase tracking-wider">{label}</div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">{desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Input Form Card */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-emerald-500/10 transition-all duration-300">
              <h2 className="text-lg font-mono font-medium text-zinc-100 mb-6 flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-400" />
                {mode === "encrypt" ? "Plaintext Input" : "Encrypted Package"}
              </h2>

              <div className="space-y-5">
                {/* Main textarea */}
                <div>
                  <label className="block text-xs uppercase tracking-widest font-mono text-zinc-400 mb-2 font-semibold">
                    {mode === "encrypt" ? "Text to Encrypt" : "Encrypted Package (Base64)"}
                  </label>
                  <textarea
                    rows={5}
                    placeholder={
                      mode === "encrypt"
                        ? "Enter the plaintext you want to encrypt…"
                        : "Paste the Base64 package returned by Encrypt…"
                    }
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={loading}
                    className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 focus:shadow-[0_0_12px_rgba(16,185,129,0.08)] focus:outline-none transition-all placeholder:text-zinc-600 font-mono resize-none"
                  />
                </div>

                {/* Passphrase / Key */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest font-mono text-zinc-400 mb-2 font-semibold">
                      Passphrase <span className="text-zinc-600 normal-case tracking-normal">(optional)</span>
                    </label>
                    <input
                      type="password"
                      value={passphrase}
                      onChange={(e) => setPassphrase(e.target.value)}
                      placeholder="Strong passphrase…"
                      disabled={loading}
                      className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 focus:outline-none transition-all placeholder:text-zinc-600 font-mono"
                    />
                    <p className="text-[11px] text-zinc-500 mt-1.5 font-mono">
                      If empty, a random 256-bit key is generated.
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest font-mono text-zinc-400 mb-2 font-semibold">
                      Base64 Key <span className="text-zinc-600 normal-case tracking-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={keyB64}
                      onChange={(e) => setKeyB64(e.target.value)}
                      placeholder="Use instead of passphrase"
                      disabled={loading}
                      className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 focus:outline-none transition-all placeholder:text-zinc-600 font-mono"
                    />
                    <p className="text-[11px] text-zinc-500 mt-1.5 font-mono">
                      Exactly 32 bytes (base64). Overrides passphrase.
                    </p>
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading || !text.trim()}
                    className="w-full bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/50 rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-2 focus:ring-offset-black/20 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {mode === "encrypt" ? "Encrypting…" : "Decrypting…"}
                      </>
                    ) : mode === "encrypt" ? (
                      <>
                        <Lock className="h-4 w-4" />
                        Encrypt Text
                      </>
                    ) : (
                      <>
                        <Unlock className="h-4 w-4" />
                        Decrypt Package
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Loading state */}
            {loading && (
              <div className="flex flex-col items-center justify-center p-10 bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.15)] animate-pulse">
                <Loader2 className="h-8 w-8 text-emerald-400 animate-spin mb-4" />
                <p className="text-emerald-400 font-mono font-bold text-xs uppercase tracking-widest">
                  {mode === "encrypt" ? "Encrypting with AES-256-GCM…" : "Decrypting package…"}
                </p>
              </div>
            )}

            {/* Result Panel */}
            {resultText && !loading && (
              <div className={`bg-zinc-950/20 backdrop-blur-md border rounded-2xl p-6 shadow-[0_12px_40px_rgb(0,0,0,0.2)] space-y-5 transition-all duration-300 ${
                resultIsError ? "border-rose-500/30" : "border-zinc-800/80 hover:border-emerald-500/10"
              }`}>
                {/* Result header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800/50 pb-4">
                  <div className="flex items-center gap-2">
                    {resultIsError ? (
                      <XCircle className="h-5 w-5 text-rose-400" />
                    ) : (
                      <ShieldCheck className="h-5 w-5 text-emerald-400" />
                    )}
                    <span className={`font-mono font-bold text-sm uppercase tracking-wider ${resultIsError ? "text-rose-400" : "text-emerald-400"}`}>
                      {resultIsError ? "Operation Failed" : mode === "encrypt" ? "Encrypted Package" : "Decrypted Text"}
                    </span>
                  </div>
                  {!resultIsError && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(resultText, setCopied)}
                        className="bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/50 px-3.5 py-2 rounded-xl transition-all duration-300 font-mono font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] focus:outline-none"
                      >
                        {copied ? <ClipboardCheck size={14} /> : <Clipboard size={14} />}
                        {copied ? "Copied!" : "Copy"}
                      </button>
                      <button
                        onClick={() => downloadTxt(`${mode}_output.txt`, resultText)}
                        className="bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/50 px-3.5 py-2 rounded-xl transition-all duration-300 font-mono font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] focus:outline-none"
                      >
                        <Download size={14} /> TXT
                      </button>
                      <button
                        onClick={() => downloadPdf(report)}
                        className="bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/50 px-3.5 py-2 rounded-xl transition-all duration-300 font-mono font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] focus:outline-none"
                      >
                        <Download size={14} /> PDF
                      </button>
                    </div>
                  )}
                </div>

                {/* Output text */}
                <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-4">
                  <pre className={`whitespace-pre-wrap break-all text-xs font-mono leading-relaxed ${resultIsError ? "text-rose-400" : "text-zinc-300"}`}>
                    {resultText}
                  </pre>
                </div>

                {note && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
                    <p className="text-xs text-emerald-400 font-mono">{note}</p>
                  </div>
                )}

                {/* Technical Report */}
                {report && (
                  <div className="space-y-3">
                    <div className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                      <Key className="h-3.5 w-3.5 text-emerald-400" />
                      Technical Report
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2.5">
                      {[
                        ["Algorithm", report.algorithm],
                        ["KDF", report.kdf],
                        ...("iterations" in report ? [["Iterations", String(report.iterations)]] : []),
                        ...("keyLengthBits" in report ? [["Key Length", `${report.keyLengthBits} bit`]] : []),
                        ["Salt", report.salt],
                        ["IV", report.iv],
                        ...("authTag" in report ? [["Auth Tag", report.authTag]] : []),
                        ["Ciphertext", report.ciphertext],
                      ].map(([label, val]) => (
                        <div key={label} className="bg-zinc-900/30 rounded-xl p-3 border border-zinc-800/50">
                          <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-1">{label}</div>
                          <div className="text-[11px] text-zinc-300 font-mono break-all">{val ?? "-"}</div>
                        </div>
                      ))}
                    </div>

                    {/* Generated Key */}
                    {generatedKeyB64 && (
                      <div className="bg-zinc-900/30 rounded-xl p-4 border border-emerald-500/20">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                            <Key className="h-3.5 w-3.5" /> Generated Key (Base64)
                          </span>
                          <button
                            onClick={() => copyToClipboard(generatedKeyB64, setCopiedKey)}
                            className="bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/50 px-2.5 py-1.5 rounded-lg transition-all font-mono font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer hover:scale-[1.01] focus:outline-none"
                          >
                            {copiedKey ? <ClipboardCheck size={12} /> : <Clipboard size={12} />}
                            {copiedKey ? "Copied!" : "Copy"}
                          </button>
                        </div>
                        <code className="text-[11px] break-all text-zinc-300 font-mono">{generatedKeyB64}</code>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Specs & Guidance Sidebar */}
          <div className="space-y-6">
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Info className="h-4 w-4 text-emerald-400" />
                How SecureCrypt Works
              </h4>
              <ul className="space-y-3.5 list-none pl-0">
                {[
                  "Uses AES-256-GCM — a military-grade authenticated encryption algorithm.",
                  "Passphrase-based key derivation uses PBKDF2 with 300,000+ iterations for brute-force resistance.",
                  "If no passphrase or key is provided, a cryptographically random 256-bit key is generated.",
                  "The output is a portable Base64 package containing the ciphertext, IV, salt, and auth tag.",
                  "The authentication tag ensures data integrity — any tampering will cause decryption to fail.",
                  "Supply the same passphrase or Base64 key during decryption to recover the original text.",
                  "Generated keys should be saved securely — they cannot be recovered after the session.",
                  "All operations are performed server-side over a secure, authenticated connection.",
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/60 mt-1.5 flex-shrink-0" />
                    <span className="text-xs text-zinc-400 leading-relaxed">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Crypto specs card */}
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-400" />
                Cryptographic Specs
              </h4>
              <div className="space-y-2.5">
                {[
                  ["Cipher", "AES-256-GCM"],
                  ["Key Length", "256 bit"],
                  ["KDF", "PBKDF2-SHA512"],
                  ["Auth Tag", "128 bit"],
                  ["IV Length", "96 bit"],
                  ["Output Format", "Base64 Package"],
                ].map(([label, val]) => (
                  <div key={label} className="flex items-center justify-between py-1.5 border-b border-zinc-800/40 last:border-0">
                    <span className="text-[11px] text-zinc-500 font-mono uppercase tracking-wider">{label}</span>
                    <span className="text-[11px] text-emerald-400 font-mono font-semibold">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
