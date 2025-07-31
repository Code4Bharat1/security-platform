'use client';

import { useState } from "react";

export default function SecureCrypt() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [mode, setMode] = useState("encrypt");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setResult("");

    const endpoint = mode === "encrypt"
      ? `${process.env.NEXT_PUBLIC_PROD_API_URL}/securecrypt/encrypt`
      : `${process.env.NEXT_PUBLIC_PROD_API_URL}/securecrypt/decrypt`;

    const body = mode === "encrypt"
      ? { text }
      : { encryptedText: text };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (mode === "encrypt") {
        setResult(
          data && typeof data.encrypted === "string"
            ? data.encrypted
            : "❌ Encryption failed: Invalid response from server."
        );
      } else {
        setResult(
          data && typeof data.decrypted === "string"
            ? data.decrypted
            : "❌ Decryption failed: Invalid response from server."
        );
      }
    } catch {
      setResult("❌ Error contacting server.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center px-2 sm:px-4 pt-10 sm:pt-20">
      <div className="text-center mb-6">
        <img
          src="/securecrypt.png"
          alt="SecureCrypt"
          className="w-16 h-16 mx-auto mb-4"
        />
        <h1 className="text-3xl font-bold text-green-700">SecureCrypt</h1>
        <p className="text-gray-600 mt-2">
          Encrypts and decrypts text using secure algorithms.
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-lg">
        <textarea
          rows={4}
          placeholder="Enter text here..."
          value={text}
          onChange={(e) => setText(e.target.value.trim())}         className="w-full px-4 py-3 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <div className="flex justify-center gap-4 mb-4">
          <button
            type="button"
            onClick={() => setMode("encrypt")}
            className={`px-4 py-2 rounded-md font-semibold ${
              mode === "encrypt"
                ? "bg-green-700 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Encrypt
          </button>
          <button
            type="button"
            onClick={() => setMode("decrypt")}
            className={`px-4 py-2 rounded-md font-semibold ${
              mode === "decrypt"
                ? "bg-green-700 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Decrypt
          </button>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-3 rounded-md text-white font-semibold bg-green-700 hover:bg-green-800 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading
            ? mode === "encrypt"
              ? "Encrypting..."
              : "Decrypting..."
            : mode === "encrypt"
            ? "Encrypt Text"
            : "Decrypt Text"}
        </button>

        {result && (
          <div className="mt-6 text-center break-all">
            <p className="text-lg font-bold text-green-700">Result:</p>
            <p className="text-gray-800 mt-1">{result}</p>
          </div>
        )}
      </div>
    </div>
  );
}
// Note: Ensure the backend server is running and accessible at the specified endpoint.
// Adjust the endpoint URL as needed based on your deployment setup.