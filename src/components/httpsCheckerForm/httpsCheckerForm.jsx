"use client";

import { useState } from "react";
import { Shield, CheckCircle, XCircle, AlertTriangle, Globe, Lock } from "lucide-react";

export default function HttpsCheckerPage() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(
        "https://zypher.code4bharat.com//api/http/https-enforcement",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target: domain }),
        }
      );

      const data = await res.json();
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || "Unknown error");
      }
    } catch (err) {
      setError("Failed to fetch results");
    } finally {
      setLoading(false);
    }
  };

  const renderRecommendations = () => {
    if (!result) return null;

    const recs = [];

    if (!result.httpRedirectsToHttps) {
      recs.push({
        icon: <XCircle className="w-5 h-5 text-red-500" />,
        text: "The site does NOT redirect HTTP traffic to HTTPS. This can expose users to insecure connections and man-in-the-middle attacks.",
        type: "error"
      });
    }

    if (!result.hstsEnabled) {
      recs.push({
        icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
        text: "The site does NOT have the Strict-Transport-Security (HSTS) header enabled. Without HSTS, browsers won't remember to always use HTTPS.",
        type: "warning"
      });
    } else if (result.hstsMaxAge && result.hstsMaxAge < 15768000) {
      recs.push({
        icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
        text: `The HSTS max-age is set to ${result.hstsMaxAge} seconds, which is below the recommended 6 months.`,
        type: "warning"
      });
    }

    if (recs.length === 0) {
      recs.push({
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        text: "HTTPS enforcement is excellent! The site has proper redirection and HSTS configuration.",
        type: "success"
      });
    }

    return (
      <div className="mt-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-green-800">Security Recommendations</h3>
        </div>
        <div className="space-y-3">
          {recs.map((rec, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
              {rec.icon}
              <p className="text-sm text-gray-700 leading-relaxed">{rec.text}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
      <div className="max-w-2xl mx-auto pt-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Lock className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              HTTPS Security Checker
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Verify your website's HTTPS configuration and security headers
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white shadow-xl rounded-2xl p-8 border border-green-100">
          {/* Input Section */}
          <div className="space-y-4 mb-6">
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
              <input
                type="text"
                placeholder="Enter domain (e.g., example.com)"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-gray-700"
              />
            </div>
            
            <button
              onClick={handleCheck}
              disabled={loading || !domain}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analyzing Security...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Shield className="w-5 h-5" />
                  Check HTTPS Security
                </div>
              )}
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700 font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Results Display */}
          {result && (
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center pb-4 border-b border-green-100">
                <h2 className="text-xl font-semibold text-gray-800 mb-1">
                  Security Analysis for
                </h2>
                <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {result.target}
                </span>
              </div>

              {/* Results Grid */}
              <div className="grid gap-4">
                {/* HTTP Redirect */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3">
                    {result.httpRedirectsToHttps ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500" />
                    )}
                    <span className="font-medium text-gray-700">HTTP → HTTPS Redirect</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    result.httpRedirectsToHttps 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {result.httpRedirectsToHttps ? "Enabled" : "Disabled"}
                  </span>
                </div>

                {/* HSTS */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3">
                    {result.hstsEnabled ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-yellow-500" />
                    )}
                    <span className="font-medium text-gray-700">HSTS Header</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    result.hstsEnabled 
                      ? "bg-green-100 text-green-800" 
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {result.hstsEnabled ? "Enabled" : "Disabled"}
                  </span>
                </div>

                {/* HSTS Max Age */}
                {result.hstsEnabled && (
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <div className="flex items-center gap-3">
                      <Shield className="w-6 h-6 text-green-500" />
                      <span className="font-medium text-gray-700">HSTS Max-Age</span>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                      {result.hstsMaxAge ? `${result.hstsMaxAge.toLocaleString()} seconds` : "N/A"}
                    </span>
                  </div>
                )}
              </div>

              {/* Recommendations */}
              {renderRecommendations()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}