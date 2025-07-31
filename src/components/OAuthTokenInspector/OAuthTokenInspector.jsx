"use client";

import { useState, useEffect } from "react";

export default function OAuthTokenInspector() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
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

  const analyzeToken = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/auth/oauthTokenInspector`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        }
      );

      const data = await res.json();
      setResult(data);

      if (data.error) {
        showToast("Token analysis failed. Please check your token.", "error");
      } else {
        showToast("Token analyzed successfully! ✨", "success");
      }
    } catch {
      const errorResult = { error: "Something went wrong. Please try again." };
      setResult(errorResult);
      showToast("Connection error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
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
      <div className="max-w-5xl mx-auto">
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
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent mb-2">
            OAuth Token Inspector
          </h1>
          <p className="text-gray-600 text-lg">
            Analyze and validate your JWT tokens with security insights
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-green-100 overflow-hidden">
          <div className="p-8">
            {/* Token Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Paste Your OAuth Token (JWT)
              </label>
              <div className="relative">
                <textarea
                  rows={6}
                  className="w-full bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-2xl p-4 text-sm font-mono resize-none transition-all duration-300 placeholder-gray-400"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={token}
                  onChange={(e) => setToken(e.target.value.trim())}               />
                <div className="absolute top-3 right-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Analyze Button */}
            <button
              onClick={analyzeToken}
              disabled={!token.trim() || loading}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 shadow-lg hover:shadow-xl disabled:shadow-none"
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
                    <span>Analyzing Token...</span>
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
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <span>Inspect Token</span>
                  </>
                )}
              </div>
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="border-t border-green-100 bg-gradient-to-br from-green-25 to-emerald-25 p-8 space-y-6">
              {result.error ? (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400 p-6 rounded-2xl shadow-sm">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
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
                    </div>
                    <div>
                      <h3 className="font-bold text-red-800 mb-1">
                        Error Occurred
                      </h3>
                      <p className="text-red-700">{result.error}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Decoded Payload */}
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
                        Decoded Payload
                      </h2>
                    </div>
                    <div className="bg-white/70 rounded-xl p-4 border border-emerald-100">
                      <pre className="overflow-x-auto text-sm text-gray-800 font-mono leading-relaxed">
                        {JSON.stringify(result.payload, null, 2)}
                      </pre>
                    </div>
                  </div>

                  {/* Security Issues */}
                  {result.issues.length > 0 ? (
                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-amber-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                          </svg>
                        </div>
                        <h2 className="text-xl font-bold text-amber-800">
                          Security Issues Detected
                        </h2>
                      </div>
                      <div className="space-y-3">
                        {result.issues.map((issue, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-3 p-3 bg-white/70 rounded-xl border border-amber-100"
                          >
                            <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-amber-800 font-medium">
                              {issue}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-green-800 mb-1">
                            Token Validated
                          </h3>
                          <p className="text-green-700">
                            No major security issues found in this token.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Secure token analysis • Built with modern security practices</p>
        </div>
      </div>
    </div>
  );
}
