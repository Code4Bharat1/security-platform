"use client";

import { useState } from "react";

export default function SecureCrypt() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [mode, setMode] = useState("encrypt");

  const handleEncrypt = () => {
    const encrypted = btoa(text); // base64 encode
    setResult(encrypted);
  };

  const handleDecrypt = () => {
    try {
      const decrypted = atob(text); // base64 decode
      setResult(decrypted);
    } catch (error) {
      setResult("Invalid encrypted text!");
    }
  };

  const handleSubmit = () => {
    if (!text) return;
    if (mode === "encrypt") {
      handleEncrypt();
    } else {
      handleDecrypt();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center px-4 pt-20">
      <div className="text-center mb-6">
        <img
          src="/tools/securecrypt.png"
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
          onChange={(e) => setText(e.target.value)}
          className="w-full px-4 py-3 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <div className="flex justify-center gap-4 mb-4">
          <button
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
          onClick={handleSubmit}
          className="w-full py-3 rounded-md text-white font-semibold bg-green-700 hover:bg-green-800"
        >
          {mode === "encrypt" ? "Encrypt Text" : "Decrypt Text"}
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
