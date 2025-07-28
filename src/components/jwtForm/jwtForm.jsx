"use client";

import { useState, useEffect } from "react";

const claimDescriptions = {
  exp: "Expiration time – when the token expires",
  iat: "Issued At – when the token was created",
  nbf: "Not Before – the token is not valid before this time",
  sub: "Subject – the identity the token refers to",
  iss: "Issuer – the entity that issued the token",
  aud: "Audience – who the token is intended for",
};

export default function JWTAnalyzer() {
  const [token, setToken] = useState("");
  const [secret, setSecret] = useState("");
  const [header, setHeader] = useState(null);
  const [payload, setPayload] = useState(null);
  const [isValid, setIsValid] = useState(null);
  const [error, setError] = useState("");
  const [expirationStatus, setExpirationStatus] = useState(null);
  const [backendResponse, setBackendResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Auto-hide toast after 4 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

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
    setBackendResponse(null);

    try {
      const parts = token.split(".");
      if (parts.length !== 3) throw new Error("Invalid JWT structure");

      const decodedHeader = JSON.parse(base64UrlDecode(parts[0]));
      const decodedPayload = JSON.parse(base64UrlDecode(parts[1]));

      const updatedPayload = { ...decodedPayload };
      ["iat", "nbf", "exp"].forEach((key) => {
        if (updatedPayload[key]) {
          updatedPayload[`${key}_formatted`] = formatTimestamp(
            updatedPayload[key]
          );
        }
      });

      if (decodedPayload.exp) {
        const now = Math.floor(Date.now() / 1000);
        const status = decodedPayload.exp < now ? "Expired ❌" : "Active ✅";
        setExpirationStatus(
          `${status} (${formatTimestamp(decodedPayload.exp)})`
        );
      } else {
        setExpirationStatus("No expiration (exp) claim found");
      }

      setHeader(decodedHeader);
      setPayload(updatedPayload);
      showToast("JWT decoded successfully! 🎉", "success");

      // After successful decode, send token+secret to backend for saving/verifying
      await sendTokenToBackend(token, secret);
    } catch (err) {
      setError("Error: " + err.message);
      showToast("Failed to decode JWT. Please check your token.", "error");
    }
  };

  async function sendTokenToBackend(token, secret) {
    setLoading(true);
    setBackendResponse(null);

    try {
      const res = await fetch("https://zypher-api.code4bharat.com/jwt/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, secret }),
      });

      const data = await res.json();

      if (!res.ok) {
        setBackendResponse(`Backend error: ${data.error || res.statusText}`);
        showToast("Failed to save token to backend.", "error");
      } else {
        setBackendResponse("Token saved to backend successfully.");
        showToast("Token saved to backend successfully! ✨", "success");
      }
    } catch (err) {
      setBackendResponse("Network error: " + err.message);
      showToast("Network error occurred.", "error");
    } finally {
      setLoading(false);
    }
  }

  const exportAsJWTFile = () => {
    const fileContent = JSON.stringify(
      {
        Header: header,
        Payload: payload,
        "Expiration Status":
          expirationStatus || "No expiration (exp) claim found",
      },
      null,
      2
    );

    const blob = new Blob([fileContent], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "decoded.jwt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("JWT file exported successfully! 📄", "success");
  };

  const formatClaim = (key, value) => {
    const tooltip = claimDescriptions[key];
    return (
      <div className="relative group bg-white/50 p-3 rounded-xl border border-emerald-100 hover:bg-white/70 transition-all duration-200">
        <div className="flex items-start space-x-2">
          <span className="font-semibold text-emerald-700 min-w-fit">
            {key}:
          </span>
          <span className="text-gray-700 break-all">{value.toString()}</span>
        </div>
        {tooltip && (
          <div className="absolute z-10 bottom-full mb-2 left-0 hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
            {tooltip}
            <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-4 relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right duration-300">
          <div
            className={`
            px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-sm transform transition-all duration-300
            ${
              toast.type === "success"
                ? "bg-emerald-50/90 border-emerald-200 text-emerald-800"
                : "bg-red-50/90 border-red-200 text-red-800"
            }
          `}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`
                w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                ${toast.type === "success" ? "bg-emerald-100" : "bg-red-100"}
              `}
              >
                {toast.type === "success" ? (
                  <svg
                    className="w-4 h-4 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </div>
              <span className="font-medium">{toast.message}</span>
              <button
                onClick={() => setToast(null)}
                className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl mb-4 shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent mb-2">
            JWT Analyzer
          </h1>
          <p className="text-gray-600 text-lg">
            Decode, analyze, and verify your JSON Web Tokens
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-green-100 overflow-hidden">
          <div className="p-8">
            {/* Input Section */}
            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  JWT Token
                </label>
                <div className="relative">
                  <textarea
                    rows={5}
                    className="w-full bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-2xl p-4 text-sm font-mono resize-none transition-all duration-300 placeholder-gray-400"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={token}
                    onChange={(e) => setToken(e.target.value.trim())}
                  />
                  <div className="absolute top-3 right-3">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Secret Key (Optional)
                </label>
                <input
                  type="password"
                  className="w-full bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-2xl p-4 text-sm transition-all duration-300 placeholder-gray-400"
                  placeholder="Enter secret key for verification..."
                  value={secret}
                  onChange={(e) => setSecret(e.target.value.trim())}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mb-6">
              <button
                onClick={handleDecode}
                disabled={!token || loading}
                className="flex-1 min-w-fit py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 shadow-lg hover:shadow-xl disabled:shadow-none"
              >
                <div className="flex items-center justify-center space-x-2">
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>Decode & Save</span>
                    </>
                  )}
                </div>
              </button>

              {header && payload && (
                <button
                  onClick={exportAsJWTFile}
                  className="py-4 px-6 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                >
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span>Export .jwt</span>
                  </div>
                </button>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400 p-4 rounded-2xl">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-red-800 font-semibold">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Results Section */}
          {(header || payload) && (
            <div className="border-t border-green-100 bg-gradient-to-br from-green-25 to-emerald-25 p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Header Section */}
                {header && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <h2 className="text-xl font-bold text-blue-800">
                        Header
                      </h2>
                    </div>
                    <div className="bg-white/70 rounded-xl p-4 border border-blue-100">
                      <pre className="text-sm text-gray-800 font-mono leading-relaxed overflow-x-auto">
                        {JSON.stringify(header, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Payload Section */}
                {payload && (
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-emerald-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                      </div>
                      <h2 className="text-xl font-bold text-emerald-800">
                        Payload
                      </h2>
                    </div>
                    <div className="space-y-3">
                      {Object.entries(payload).map(([key, value]) => (
                        <div key={key}>{formatClaim(key, value)}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Expiration Status */}
              {expirationStatus && (
                <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-purple-800 mb-1">
                        Expiration Status
                      </h3>
                      <p className="text-purple-700 font-medium">
                        {expirationStatus}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Secure JWT analysis • Built with modern security practices</p>
        </div>
      </div>
    </div>
  );
}
