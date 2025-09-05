"use client";

import { useMemo, useState } from "react";
import { Clipboard, ClipboardCheck, Download } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function SecureCrypt() {
  const API = useMemo(
    () => (process.env.NEXT_PUBLIC_PROD_API_URL || "").replace(/\/+$/, ""),
    []
  );

  const [mode, setMode] = useState("encrypt"); // "encrypt" | "decrypt"
  const [text, setText] = useState("");            // plaintext (encrypt) OR package (decrypt)
  const [passphrase, setPassphrase] = useState("");
  const [keyB64, setKeyB64] = useState("");
  const [loading, setLoading] = useState(false);

  const [resultText, setResultText] = useState("");   // ciphertext package (encrypt) OR plaintext (decrypt)
  const [report, setReport] = useState(null);         // detailed meta
  const [generatedKeyB64, setGeneratedKeyB64] = useState("");
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);

  const encrypt = async () => {
    setLoading(true);
    setResultText("");
    setReport(null);
    setGeneratedKeyB64("");
    setNote("");

    try {
      const body = { text: text.trim() };
      if (passphrase.trim()) body.passphrase = passphrase;
      if (keyB64.trim()) body.keyB64 = keyB64.trim();

      const res = await fetch(`${API}/securecrypt/encrypt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Encryption failed.");
      }

      // result is a package (Base64 JSON) + report
      setResultText(data.package || "");
      setReport(data.report || null);
      if (data.generatedKeyB64) setGeneratedKeyB64(data.generatedKeyB64);
      if (data.note) setNote(data.note);
    } catch (e) {
      setResultText(`❌ ${e.message || "Error contacting server."}`);
    } finally {
      setLoading(false);
    }
  };

  const decrypt = async () => {
    setLoading(true);
    setResultText("");
    setReport(null);
    setNote("");

    try {
      const body = { package: text.trim() };
      if (passphrase.trim()) body.passphrase = passphrase.trim();
      if (keyB64.trim()) body.keyB64 = keyB64.trim();

      const res = await fetch(`${API}/securecrypt/decrypt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Decryption failed.");
      }

      setResultText(data.decrypted || "");
      setReport(data.report || null);
      setNote(data.integrity ? `Integrity: ${data.integrity}` : "");
    } catch (e) {
      setResultText(`❌ ${e.message || "Error contacting server."}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!text.trim()) return;
    mode === "encrypt" ? encrypt() : decrypt();
  };

  const copyToClipboard = async (val) => {
    try {
      await navigator.clipboard.writeText(val);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
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

  const downloadPdf = (title, r) => {
    const doc = new jsPDF({ unit: "pt" });
    doc.setFontSize(16);
    doc.text(title, 40, 40);
    doc.setFontSize(10);

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
      summary.push(["Result", resultText || "-"]);
    }

    autoTable(doc, {
      startY: 60,
      head: [["Field", "Value"]],
      body: summary,
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [240, 240, 240] },
    });

    doc.save(`${mode === "encrypt" ? "encryption" : "decryption"}_report.pdf`);
  };

  const resultIsError = resultText.startsWith("❌");

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center px-3 pt-10 pb-24">
      <div className="text-center mb-6">
        <img src="/tools/card-images/dycrypt.png" alt="SecureCrypt" className="w-16 h-16 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-green-700">SecureCrypt</h1>
        <p className="text-gray-600 mt-2">
          AES‑256‑GCM encryption with passphrase/key, portable package, Copy/PDF/TXT export.
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-2xl">
        {/* Mode */}
        <div className="flex justify-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => { setMode("encrypt"); setResultText(""); setReport(null); }}
            className={`px-4 py-2 rounded-md font-semibold ${
              mode === "encrypt" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            Encrypt
          </button>
          <button
            type="button"
            onClick={() => { setMode("decrypt"); setResultText(""); setReport(null); }}
            className={`px-4 py-2 rounded-md font-semibold ${
              mode === "decrypt" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            Decrypt
          </button>
        </div>

        {/* Input */}
        <label className="block text-sm font-medium mb-1">
          {mode === "encrypt" ? "Plaintext" : "Encrypted Package (Base64)"}
        </label>
        <textarea
          rows={4}
          placeholder={mode === "encrypt" ? "Enter text to encrypt…" : "Paste the package returned by Encrypt…"}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full px-4 py-3 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        {/* Passphrase / Key */}
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Passphrase (optional)</label>
            <input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Strong passphrase…"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              If empty, a random 256‑bit key will be generated for you.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Base64 Key (optional)</label>
            <input
              type="text"
              value={keyB64}
              onChange={(e) => setKeyB64(e.target.value)}
              placeholder="Use instead of passphrase"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Exactly 32 bytes (base64). Overrides passphrase if provided.
            </p>
          </div>
        </div>

        {/* Action */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-3 rounded-md text-white font-semibold bg-green-700 hover:bg-green-800 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? (mode === "encrypt" ? "Encrypting…" : "Decrypting…") : (mode === "encrypt" ? "Encrypt" : "Decrypt")}
        </button>

        {/* Results */}
        {resultText && (
          <div className="mt-6">
            <div className={`rounded-lg p-4 ${resultIsError ? "bg-red-50 border border-red-200" : "bg-gray-50 border border-gray-200"}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-lg font-bold text-gray-800">
                  {mode === "encrypt" ? "Encrypted Package" : "Decrypted Text"}
                </p>
                {!resultIsError && (
                  <button
                    onClick={() => copyToClipboard(resultText)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-900 text-white hover:bg-black text-sm"
                  >
                    {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                )}
              </div>
              <pre className="whitespace-pre-wrap break-all text-gray-800 text-sm">
                {resultText}
              </pre>

              {!resultIsError && (
                <div className="flex flex-wrap gap-3 mt-4">
                  <button
                    onClick={() => downloadTxt(`${mode}_output.txt`, resultText)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-sm"
                  >
                    <Download size={16} /> TXT
                  </button>
                  <button
                    onClick={() => downloadPdf("SecureCrypt Report", report)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-900 text-white hover:bg-black text-sm"
                  >
                    <Download size={16} /> PDF
                  </button>
                </div>
              )}

              {note && <p className="text-xs text-amber-700 mt-3">{note}</p>}
            </div>

            {/* Technical Report */}
            {report && (
              <div className="mt-4 text-sm text-gray-700">
                <p className="font-semibold mb-1">Technical Report</p>
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-1">
                  <p><span className="font-medium">Algorithm:</span> {report.algorithm}</p>
                  <p><span className="font-medium">KDF:</span> {report.kdf}</p>
                  {"iterations" in report && <p><span className="font-medium">Iterations:</span> {report.iterations}</p>}
                  {"keyLengthBits" in report && <p><span className="font-medium">Key Length:</span> {report.keyLengthBits} bit</p>}
                  <p className="break-all"><span className="font-medium">Salt:</span> {report.salt}</p>
                  <p className="break-all"><span className="font-medium">IV:</span> {report.iv}</p>
                  {"authTag" in report && <p className="break-all"><span className="font-medium">Auth Tag:</span> {report.authTag}</p>}
                  <p className="break-all md:col-span-2"><span className="font-medium">Ciphertext:</span> {report.ciphertext}</p>
                </div>

                {generatedKeyB64 && (
                  <div className="mt-3">
                    <p className="font-medium text-gray-800">Generated Key (Base64):</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs break-all bg-gray-100 px-2 py-1 rounded">
                        {generatedKeyB64}
                      </code>
                      <button
                        onClick={() => copyToClipboard(generatedKeyB64)}
                        className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-gray-900 text-white hover:bg-black text-xs"
                      >
                        {copied ? <ClipboardCheck size={14} /> : <Clipboard size={14} />}
                        Copy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
