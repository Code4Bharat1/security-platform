"use client";

import { useState } from "react";

const claimDescriptions = {
  exp: "Expiration time – when the token expires",
  iat: "Issued At – when the token was created",
  nbf: "Not Before – the token is not valid before this time",
  sub: "Subject – the identity the token refers to",
  iss: "Issuer – the entity that issued the token",
  aud: "Audience – who the token is intended for"
};

export default function JWTAnalyzer() {
  const [token, setToken] = useState("");
  const [secret, setSecret] = useState("");
  const [header, setHeader] = useState(null);
  const [payload, setPayload] = useState(null);
  const [isValid, setIsValid] = useState(null);
  const [error, setError] = useState("");
  const [expirationStatus, setExpirationStatus] = useState(null);

  const base64UrlDecode = (str) => {
    str = str.replace(/-/g, "+").replace(/_/g, "/");
    while (str.length % 4) {
      str += "=";
    }
    return atob(str);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return isNaN(date.getTime()) ? "N/A" : date.toUTCString();
  };

  const handleDecode = async () => {
    setError("");
    setHeader(null);
    setPayload(null);
    setIsValid(null);
    setExpirationStatus(null);

    try {
      const parts = token.split(".");
      if (parts.length !== 3) throw new Error("Invalid JWT structure");

      const decodedHeader = JSON.parse(base64UrlDecode(parts[0]));
      const decodedPayload = JSON.parse(base64UrlDecode(parts[1]));

      const updatedPayload = { ...decodedPayload };
      ["iat", "nbf", "exp"].forEach((key) => {
        if (updatedPayload[key]) {
          updatedPayload[`${key}_formatted`] = formatTimestamp(updatedPayload[key]);
        }
      });

      if (decodedPayload.exp) {
        const now = Math.floor(Date.now() / 1000);
        const status = decodedPayload.exp < now ? "Expired ❌" : "Active ✅";
        setExpirationStatus(`${status} (${formatTimestamp(decodedPayload.exp)})`);
      } else {
        setExpirationStatus("No expiration (exp) claim found");
      }

      setHeader(decodedHeader);
      setPayload(updatedPayload);
    } catch (err) {
      setError("Error: " + err.message);
    }
  };

  const exportAsJWTFile = () => {
    const fileContent = JSON.stringify({
      Header: header,
      Payload: payload,
      "Expiration Status": expirationStatus || "No expiration (exp) claim found"
    }, null, 2);

    const blob = new Blob([fileContent], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "decoded.jwt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatClaim = (key, value) => {
    const tooltip = claimDescriptions[key];
    return (
      <div className="relative group">
        <strong>{key}:</strong> {value.toString()}
        {tooltip && (
          <span className="absolute z-10 bottom-full mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
            {tooltip}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-3xl font-bold">JWT Analyzer</h1>

      <textarea
        rows={4}
        className="w-full p-2 border rounded"
        placeholder="Paste JWT here"
        value={token}
        onChange={(e) => setToken(e.target.value.trim())}
      />

      <input
        type="text"
        className="w-full p-2 border rounded"
        placeholder="(Optional) Secret key for verification"
        value={secret}
        onChange={(e) => setSecret(e.target.value.trim())}
      />

      <button
        onClick={handleDecode}
        className="bg-blue-600 text-white px-4 py-2 rounded"
        disabled={!token}
      >
        Decode
      </button>

      {error && <p className="text-red-600 font-semibold">{error}</p>}

      {header && (
        <div>
          <h2 className="font-semibold mt-4">Header</h2>
          <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(header, null, 2)}</pre>
        </div>
      )}

      {payload && (
        <div>
          <h2 className="font-semibold mt-4">Payload</h2>
          <div className="bg-gray-100 p-2 rounded space-y-1">
            {Object.entries(payload).map(([key, value]) => (
              <div key={key}>{formatClaim(key, value)}</div>
            ))}
          </div>
        </div>
      )}

      {expirationStatus && (
        <p className="mt-4 font-semibold text-blue-600">
          Expiration Status: {expirationStatus}
        </p>
      )}

      {header && payload && (
        <button
          onClick={exportAsJWTFile}
          className="bg-green-600 text-white px-4 py-2 rounded mt-4"
        >
          Export as .jwt File
        </button>
      )}
    </div>
  );
}
