"use client";
import { useState } from "react";
import axios from "axios";
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

  // URL validation function
  const isValidUrl = (urlString) => {
    try {
      const url = new URL(urlString);
      // Check if it's a valid HTTP/HTTPS URL and has a proper domain
      const hasValidProtocol = url.protocol === 'http:' || url.protocol === 'https:';
      const hasValidHostname = url.hostname && url.hostname.includes('.') && url.hostname.length > 1;
      const isNotLocalhost = !url.hostname.includes('localhost') && !url.hostname.includes('127.0.0.1');
      
      return hasValidProtocol && hasValidHostname && isNotLocalhost;
    } catch {
      return false;
    }
  };
  
  // Enhanced validation for common invalid patterns
  const validateUrlInput = (input) => {
    const trimmed = input.trim();
    
    // Check for empty input
    if (!trimmed) {
      return { isValid: false, error: "Please enter a URL to test." };
    }
    
    // Check for obviously invalid patterns
    if (trimmed === 'http://' || trimmed === 'https://') {
      return { isValid: false, error: "Please enter a complete URL (e.g., https://example.com)" };
    }
    
    // Check for single words or invalid patterns
    if (!trimmed.includes('.') && !trimmed.includes('://')) {
      return { isValid: false, error: "Invalid URL format. Please enter a valid URL (e.g., https://example.com)" };
    }
    
    const normalizedUrl = /^https?:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
    
    if (!isValidUrl(normalizedUrl)) {
      return { isValid: false, error: "Invalid URL format. Please enter a valid website URL (e.g., https://example.com)" };
    }
    
    return { isValid: true, url: normalizedUrl };
  };

  const handleTest = async () => {
    const trimmedUrl = url.trim();
    
    // Validate URL input first
    const validation = validateUrlInput(trimmedUrl);
    if (!validation.isValid) {
      setResult({
        error: validation.error
      });
      return;
    }
    
    const normalizedUrl = validation.url;
    setUrl(normalizedUrl);
    setLoading(true);
    setResult(null);
    setIframeVisible(false);

    // Build the full API URL
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
    const fullApiUrl = `${apiBaseUrl}/clickjacking/jacking`;
    
    console.log("Making request to:", fullApiUrl);
    console.log("Request payload:", { url: normalizedUrl });

    try {
      const response = await axios.post(fullApiUrl, {
        url: normalizedUrl,
      }, {
        timeout: 15000, // 15 second timeout
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log("API Response:", response.data);
      
      setResult(response.data);
      setIframeVisible(!response.data.isProtected);
    } catch (error) {
      console.error("Clickjacking test error:", error);
      
      let errorMessage = "Request failed. Please try again later.";
      
      if (error.response) {
        const status = error.response.status;
        const responseData = error.response.data;
        
        console.log("Error Status:", status);
        console.log("Error Response Data:", responseData);
        
        // Handle different HTTP status codes with user-friendly messages
        switch (status) {
          case 400:
            errorMessage = "Invalid request. Please check the URL format and try again.";
            break;
          case 404:
            errorMessage = "Service unavailable. The testing service could not be reached.";
            break;
          case 422:
            errorMessage = "Invalid URL provided. Please enter a valid website URL.";
            break;
          case 500:
            errorMessage = "Server error occurred. Please try again later.";
            break;
          case 503:
            errorMessage = "Service temporarily unavailable. Please try again later.";
            break;
          default:
            // Use server's error message if available, otherwise generic message
            errorMessage = responseData?.error || responseData?.message || `Service error (${status}). Please try again.`;
        }
      } else if (error.request) {
        errorMessage = "Cannot connect to the testing service. Please check your internet connection.";
        console.log("Request made but no response:", error.request);
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timed out. The website may be taking too long to respond or may be unavailable.";
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        errorMessage = "Cannot reach the testing service. Please try again later.";
      } else {
        errorMessage = "An unexpected error occurred. Please try again.";
      }
      
      setResult({
        error: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleTest();
  };

  // Debug: Log environment variable (remove in production)
  console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-25 to-teal-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img src="/clickjacking.png" alt="verify" className="w-16 h-20 mb-4 mt-7" />
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full mb-4 shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Clickjacking Security Tester
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Test websites for clickjacking vulnerabilities by checking their
            frame-busting protections.
          </p>
        </div>

        {/* Debug Info (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-blue-700">
                <strong>Debug Info:</strong> API URL = {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4180 (default)'}
              </p>
              <button
                onClick={async () => {
                  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4180';
                  try {
                    console.log(`Testing connection to: ${apiBaseUrl}`);
                    const response = await axios.get(apiBaseUrl);
                    console.log("Connection test successful:", response.status);
                    alert("Connection successful!");
                  } catch (error) {
                    console.error("Connection test failed:", error);
                    alert(`Connection failed: ${error.message}`);
                  }
                }}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
              >
                Test Connection
              </button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-green-100">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Target URL
            </label>
            <div className="relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyPress}
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

        {/* Results */}
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

                {/* Detail */}
                <div className="p-8">
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
                    <p
                      className={
                        result.isProtected ? "text-green-700" : "text-red-700"
                      }
                    >
                      {result.isProtected
                        ? "The website implements proper frame-busting techniques."
                        : "The website can be embedded in iframes, making it vulnerable to clickjacking attacks."}
                    </p>
                  </div>

                  {result.protectedBy?.length > 0 && (
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

                  {iframeVisible && (
                    <div className="bg-amber-50 rounded-xl p-6 border-2 border-amber-200">
                      <div className="flex items-center gap-3 mb-4">
                        <Eye className="w-6 h-6 text-amber-600" />
                        <h4 className="text-lg font-bold text-amber-800">
                          Embedding Demonstration
                        </h4>
                      </div>
                      <p className="text-amber-700 mb-4 font-medium">
                        ⚠️ This website allows itself to be embedded:
                      </p>
                      <div className="bg-white rounded-lg border-2 border-amber-300 overflow-hidden">
                        <iframe
                          src={result.url}
                          width="100%"
                          height="400"
                          className="border-0"
                          sandbox=""
                          title="Clickjacking Demo"
                        />
                      </div>
                      <p className="text-sm text-amber-600 mt-3 italic">
                        In a real attack, invisible elements could trick users.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}