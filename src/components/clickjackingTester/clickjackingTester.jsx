"use client";
import { useState } from "react";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Eye,
  Lock,
  Unlock,
} from "lucide-react";

export default function ClickjackingTester() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [iframeVisible, setIframeVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    setIframeVisible(false);
    setResult(null);
    try {
      const res = await fetch(
        "/api/clickjacking/jacking",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        }
      );
      const data = await res.json();
      setResult(data);
      setIframeVisible(!data.isProtected);
    } catch (err) {
      setResult({ error: "Something went wrong." });
    }
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && url.trim())} {
      handleTest();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-25 to-teal-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full mb-4 shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Clickjacking Security Tester
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Test websites for clickjacking vulnerabilities by checking their
            frame-busting protections
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-green-100">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Target URL
            </label>
            <div className="relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value.trim())}               onKeyPress={handleKeyPress}
                placeholder="Enter target URL (e.g. https://example.com)"
                className="w-full border-2 border-green-200 px-4 py-4 pr-12 rounded-xl focus:border-green-500 focus:outline-none transition-all duration-200 text-gray-800 placeholder-gray-500 text-lg"
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
            </div>
          </div>

          <button
            onClick={handleTest}
            disabled={loading || !url.trim()}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg flex items-center justify-center gap-3 shadow-lg"
          >
            {loading ? (
              <>
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Testing Security...
              </>
            ) : (
              <>
                <Shield className="w-6 h-6" />
                Test for Clickjacking
              </>
            )}
          </button>
        </div>

        {/* Results Section */}
        {result && (
          <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden">
            {result.error ? (
              <div className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Test Failed
                    </h3>
                    <p className="text-gray-600">
                      Unable to complete the security test
                    </p>
                  </div>
                </div>
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                  <p className="text-red-700 font-medium">{result.error}</p>
                </div>
              </div>
            ) : (
              <>
                {/* Status Header */}
                <div
                  className={`p-6 ${
                    result.isProtected
                      ? "bg-gradient-to-r from-green-600 to-emerald-600"
                      : "bg-gradient-to-r from-red-600 to-rose-600"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      {result.isProtected ? (
                        <Lock className="w-6 h-6 text-white" />
                      ) : (
                        <Unlock className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        {result.isProtected ? "Protected" : "Vulnerable"}
                      </h3>
                      <p className="text-white text-opacity-90">
                        {result.isProtected
                          ? "This website has clickjacking protection"
                          : "This website is vulnerable to clickjacking attacks"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  {/* Protection Status */}
                  <div
                    className={`rounded-xl p-6 mb-6 border-2 ${
                      result.isProtected
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {result.isProtected ? (
                        <>
                          <CheckCircle className="w-6 h-6 text-green-600" />
                          <span className="text-xl font-bold text-green-800">
                            ✅ Clickjacking Protection Active
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-6 h-6 text-red-600" />
                          <span className="text-xl font-bold text-red-800">
                            ❌ No Clickjacking Protection
                          </span>
                        </>
                      )}
                    </div>

                    {result.isProtected ? (
                      <p className="text-green-700">
                        The website implements proper frame-busting techniques
                        to prevent embedding in malicious iframes.
                      </p>
                    ) : (
                      <p className="text-red-700">
                        The website can be embedded in iframes, making it
                        potentially vulnerable to clickjacking attacks.
                      </p>
                    )}
                  </div>

                  {/* Protection Details */}
                  {result.protectedBy && result.protectedBy.length > 0 && (
                    <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200 mb-6">
                      <h4 className="text-lg font-bold text-emerald-800 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Protection Mechanisms Detected
                      </h4>
                      <ul className="space-y-2">
                        {result.protectedBy.map((line, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-emerald-700"
                          >
                            <CheckCircle className="w-4 h-4 mt-0.5 text-emerald-600 flex-shrink-0" />
                            <span className="font-medium">{line}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Iframe Demonstration */}
                  {iframeVisible && (
                    <div className="bg-amber-50 rounded-xl p-6 border-2 border-amber-200">
                      <div className="flex items-center gap-3 mb-4">
                        <Eye className="w-6 h-6 text-amber-600" />
                        <h4 className="text-lg font-bold text-amber-800">
                          Embedding Demonstration
                        </h4>
                      </div>
                      <p className="text-amber-700 mb-4 font-medium">
                        ⚠️ This website allows itself to be embedded,
                        demonstrating the vulnerability:
                      </p>
                      <div className="bg-white rounded-lg border-2 border-amber-300 overflow-hidden">
                        <iframe
                          src={url}
                          width="100%"
                          height="400"
                          className="border-0"
                          sandbox=""
                          title="Clickjacking Test Demonstration"
                        />
                      </div>
                      <p className="text-sm text-amber-600 mt-3 italic">
                        In a real attack, this embedded content could be
                        overlaid with invisible elements to trick users.
                      </p>
                    </div>
                  )}

                  {/* Security Recommendations */}
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 mt-6">
                    <h4 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Security Recommendations
                    </h4>
                    <div className="text-blue-700 space-y-2">
                      <p>
                        • Implement X-Frame-Options header with DENY or
                        SAMEORIGIN values
                      </p>
                      <p>
                        • Use Content Security Policy (CSP) with frame-ancestors
                        directive
                      </p>
                      <p>
                        • Add JavaScript frame-busting code as a backup
                        protection
                      </p>
                      <p>
                        • Regularly test your applications for clickjacking
                        vulnerabilities
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Info Footer */}
        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm">
            Clickjacking attacks trick users into clicking on hidden elements.
            Always implement proper frame protection.
          </p>
        </div>
      </div>
    </div>
  );
}
