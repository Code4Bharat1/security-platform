"use client"
import { useState } from "react";

export default function JWTSignatureValidator() {
  const [token, setToken] = useState("");
  const [secret, setSecret] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleValidate = async () => {
    // Basic validation
    if (!token.trim() || !secret.trim()) {
      setError("Both JWT token and secret key are required");
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
          body: JSON.stringify({ token: token.trim(), secret: secret.trim() }),
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
        "Network error: Unable to connect to server. Make sure the backend is running on https://zypher.code4bharat.com/"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
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
                onChange={(e) => setToken(e.target.value.trim())}               className="w-full border-2 border-green-200 p-4 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-400 transition-all duration-200 text-sm font-mono resize-none"
                rows={5}
              />
              <div className="absolute top-3 right-3 text-xs text-green-500 bg-green-50 px-2 py-1 rounded-full">
                {token.length} characters
              </div>
            </div>
          </div>

          {/* Secret Key Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-green-800 mb-2">
              Secret Key
            </label>
            <input
              type="text"
              placeholder="Enter your secret key"
              value={secret}
              onChange={(e) => setSecret(e.target.value.trim())}             className="w-full border-2 border-green-200 p-4 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-400 transition-all duration-200 font-mono"
            />
          </div>

          {/* Validate Button */}
          <button
            onClick={handleValidate}
            disabled={loading || !token.trim() || !secret.trim()}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-4 px-8 rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Validating...</span>
              </div>
            ) : (
              "Validate JWT Token"
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-xl">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-red-800">
                    Validation Error
                  </h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Result */}
          {result && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 space-y-6">
              {/* Success Header */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-3 h-5 border-r-2 border-b-2 border-white transform rotate-45 -mt-1"></div>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-green-800 mb-2">
                  JWT Signature Valid
                </h2>
                <p className="text-green-600">
                  Your JWT token has been successfully validated and decoded
                </p>
              </div>

              {/* Token Details */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Header Section */}
                <div className="bg-white rounded-xl p-5 border border-green-100 shadow-sm">
                  <h3 className="text-lg font-bold text-green-800 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Header
                  </h3>
                  <pre className="bg-green-50 p-4 rounded-lg text-sm overflow-x-auto text-green-800 border border-green-100">
                    {JSON.stringify(result.header, null, 2)}
                  </pre>
                </div>

                {/* Payload Section */}
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

              {/* Additional Info */}
              <div className="bg-white rounded-xl p-4 border border-green-100">
                <h4 className="font-semibold text-green-800 mb-2">
                  Token Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="font-semibold text-green-800">
                      Algorithm
                    </div>
                    <div className="text-green-600">
                      {result.header?.alg || "N/A"}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="font-semibold text-green-800">Type</div>
                    <div className="text-green-600">
                      {result.header?.typ || "N/A"}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="font-semibold text-green-800">Status</div>
                    <div className="text-green-600 font-semibold">Valid</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-green-600 text-sm">
          <p>Secure JWT validation powered by industry-standard algorithms</p>
        </div>
      </div>
    </div>
  );
}
