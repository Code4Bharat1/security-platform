"use client";
import { useState } from "react";
import {
  PlayCircle,
  Loader2,
  Check,
  AlertCircle,
  Info,
  Zap,
  Globe,
  Code,
  FileText,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";

export default function MochaForm() {
  const [endpoint, setEndpoint] = useState("");
  const [method, setMethod] = useState("GET");
  const [headers, setHeaders] = useState("");
  const [body, setBody] = useState("");
  const [testDescription, setTestDescription] = useState("");
  const [timeoutMs, setTimeoutMs] = useState(10000);
  const [error, setError] = useState("");
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const showToastMessage = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const validateEndpoint = (url) => {
    try {
      const parsed = new URL(url);
      return ["http:", "https:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  const protectedAction = useProtectedAction();

  const handleSubmit = async () => {
    if (!validateEndpoint(endpoint)) {
      const msg =
        "Please enter a valid API endpoint URL (must start with http:// or https://).";
      setError(msg);
      showToastMessage(msg, "error");
      return;
    }

    setError("");
    setLoading(true);
    setTestResults(null);

    await protectedAction(async (token) => {
      try {
        let headerObj = {};
        if (headers.trim()) {
          try {
            headerObj = JSON.parse(headers);
          } catch {
            const msg = "Invalid JSON format for headers";
            setError(msg);
            showToastMessage(msg, "error");
            setLoading(false);
            return;
          }
        }

        let bodyObj = null;
        if (body.trim() && method !== "GET") {
          try {
            bodyObj = JSON.parse(body);
          } catch {
            const msg = "Invalid JSON format for request body";
            setError(msg);
            showToastMessage(msg, "error");
            setLoading(false);
            return;
          }
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/mocha/mocha-test`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // ✅ added from protectedAction
            },
            body: JSON.stringify({
              endpoint,
              method,
              headers: headerObj,
              body: bodyObj,
              testDescription,
              timeoutMs,
              wantPrevious: true,
            }),
          }
        );

        if (!res.ok) {
          const errText = await res.text().catch(() => "");
          const msg = `API test failed with HTTP ${res.status}. ${
            errText || ""
          }`.trim();
          showToastMessage(msg, "error");
          setError(msg);
          setLoading(false);
          return;
        }

        const result = await res.json();
        setTestResults(result);

        if (
          result &&
          typeof result.statusCode === "number" &&
          result.statusCode >= 500
        ) {
          const msg = `API responded with ${result.statusCode}`;
          showToastMessage(msg, "error");
        } else {
          showToastMessage("🎉 Test completed successfully!", "success");
        }

        setLoading(false);
      } catch (e) {
        const msg = `Network error: ${e?.message || "Unknown error"}`;
        setError(msg);
        showToastMessage(msg, "error");
        setLoading(false);
      }
    });
  };

  const quickFillExample = () => {
    setEndpoint("https://jsonplaceholder.typicode.com/posts/1");
    setMethod("GET");
    setHeaders("");
    setBody("");
    setTestDescription("Get a single post from JSONPlaceholder API");
    showToastMessage(
      "✨ Example data filled! Click 'Run Test' to try it.",
      "info"
    );
  };

  const getHeadersPlaceholder = () => {
    if (method === "POST" || method === "PUT" || method === "PATCH") {
      return '{\n  "Content-Type": "application/json"\n}';
    }
    return '{\n  "Authorization": "Bearer your-token"\n}';
  };

  const ComparisonBadge = ({ deltaMs, deltaPct }) => {
    if (deltaMs === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-700 text-gray-300">
          <Minus className="w-3 h-3" /> Same
        </span>
      );
    }
    const improved = deltaMs < 0;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
          improved ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"
        }`}
      >
        {improved ? (
          <TrendingDown className="w-3 h-3" />
        ) : (
          <TrendingUp className="w-3 h-3" />
        )}
        {improved ? "Faster" : "Slower"} ({deltaMs > 0 ? "+" : ""}
        {deltaMs} ms, {deltaPct > 0 ? "+" : ""}
        {deltaPct}
        %)
      </span>
    );
  };

  return (
    <div className="tool-detail-page mocha-tool-page min-h-screen">
      {/* Toast */}
      {showToast && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border-l-4 transform transition-all duration-300 ${
            toastType === "success"
              ? "bg-green-900 border-green-500 text-green-300"
              : toastType === "error"
              ? "bg-red-900 border-red-500 text-red-300"
              : "bg-blue-900 border-blue-500 text-blue-300"
          }`}
        >
          <div className="flex items-center">
            {toastType === "success" && <Check className="h-5 w-5 mr-2" />}
            {toastType === "error" && <AlertCircle className="h-5 w-5 mr-2" />}
            {toastType === "info" && <Info className="h-5 w-5 mr-2" />}
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-4 pb-6 pt-8 sm:px-6 lg:px-8">
        <div className="tool-detail-shell flex max-w-5xl items-center gap-4">
          {/* Logo always left */}
          <img
            src="/RedTeam/mocha-logo.png"
            alt="Mocha Logo"
            className="w-30 h-30 object-contain flex-shrink-0"
          />

          {/* Text always right */}
          <div className="text-left">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[color:var(--text-heading)]">
              Mocha API Testing
            </h1>

            {/* Subtext */}
            <p className="mt-2 max-w-2xl text-sm text-[color:var(--text-muted)] sm:text-base">
              Test your API endpoints with ease. Enter your API details below{" "}
              <br />
              and get instant feedback on performance and reliability.
            </p>

            {/* Connection Info */}
            <div className="mt-4 text-sm text-[color:var(--text-muted)]">
              <p>Connected to: localhost:5000</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <div className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-card)] shadow-[var(--shadow-elevated)]">
          {/* Header Bar */}
          <div className="bg-red-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Globe className="h-5 w-5" />
                API Test Runner
              </h2>
              <button
                onClick={quickFillExample}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm font-medium transition-all duration-200 flex items-center gap-2"
              >
                <HelpCircle className="h-4 w-4" />
                Try Example
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 space-y-6">
            {/* URL */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-400" />
                API Endpoint URL
              </label>
              <input
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value.trim())}
                placeholder="https://example.com"
                className="w-full bg-gray-700 border border-white-600 rounded p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
              />
              <p className="text-xs text-gray-400">
                Must be a valid URL starting with http:// or https://
              </p>
            </div>

            {/* Method */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white flex items-center gap-2">
                <Code className="h-4 w-4 text-gray-400" />
                Request Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value.trim())}
                className="w-full bg-gray-700 border border-white-600 rounded p-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
              >
                <option value="GET">GET - Retrieve data</option>
                <option value="POST">POST - Create new data</option>
                <option value="PUT">PUT - Update existing data</option>
                <option value="DELETE">DELETE - Remove data</option>
                <option value="PATCH">PATCH - Partial update</option>
              </select>
            </div>

            {/* Test Description */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-400" />
                Test Description
              </label>
              <input
                type="text"
                value={testDescription}
                onChange={(e) => setTestDescription(e.target.value.trim())}
                placeholder="Describe what this test should do..."
                className="w-full bg-gray-700 border border-white-600 rounded p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
              />
            </div>

            {/* Headers */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white">
                Headers (JSON) - Optional
              </label>
              <textarea
                value={headers}
                onChange={(e) => setHeaders(e.target.value.trim())}
                placeholder={getHeadersPlaceholder()}
                rows={3}
                className="w-full bg-gray-700 border border-white-600 rounded p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 font-mono text-sm"
              />
            </div>

            {/* Body */}
            {method !== "GET" && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-white">
                  Request Body (JSON) - Optional
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value.trim())}
                  placeholder='{\n  "name": "John Doe",\n  "email": "john@example.com"\n}'
                  rows={4}
                  className="w-full bg-gray-700 border border-white-600 rounded p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 font-mono text-sm"
                />
              </div>
            )}

            {/* Timeout */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white">
                Timeout (ms)
              </label>
              <input
                type="number"
                min={1000}
                step={500}
                value={timeoutMs}
                onChange={(e) =>
                  setTimeoutMs(Math.max(0, Number(e.target.value || 0)))
                }
                className="w-56 bg-gray-700 border border-white-600 rounded p-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
              />
              <p className="text-xs text-gray-400">
                Request will be aborted if it exceeds this duration.
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-900 border border-red-700 rounded p-4 flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-300 font-medium">{error}</p>
                  <p className="text-red-400 text-sm mt-1">
                    Check the console for detailed error information
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-4 px-6 rounded font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <PlayCircle className="h-6 w-6" />
                  Run API Test
                </>
              )}
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="mx-6 mb-6">
              <div className="bg-gray-700 border border-white-600 rounded p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Running Mocha Tests...
                </h3>
                <p className="text-gray-400">
                  Testing your API endpoint with real Mocha tests
                </p>
                <div className="mt-4 bg-gray-800 rounded p-3">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Progress</span>
                    <span>Testing...</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                    <div
                      className="bg-red-600 h-2 rounded-full animate-pulse"
                      style={{ width: "75%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {!loading && testResults && (
            <div className="mx-6 mb-6">
              <div className="bg-gray-700 border border-white-600 rounded overflow-hidden">
                {/* Results Header */}
                <div
                  className={`px-6 py-4 ${
                    testResults.passed ? "bg-green-700" : "bg-red-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      {testResults.passed ? (
                        <Check className="h-6 w-6" />
                      ) : (
                        <AlertCircle className="h-6 w-6" />
                      )}
                      Test Results
                    </h3>
                    <span className="px-4 py-2 rounded text-sm font-bold bg-white/20 text-white">
                      {testResults.passed ? "✓ PASSED" : "✗ FAILED"}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Status */}
                  {typeof testResults.statusCode === "number" && (
                    <div className="flex items-center gap-3">
                      <span className="text-gray-300 font-medium">
                        HTTP Status:
                      </span>
                      <span
                        className={`px-3 py-1 rounded text-sm font-bold ${
                          testResults.statusCode >= 200 &&
                          testResults.statusCode < 300
                            ? "bg-green-900 text-green-300"
                            : "bg-red-900 text-red-300"
                        }`}
                      >
                        {testResults.statusCode}
                      </span>
                    </div>
                  )}

                  {/* Response */}
                  {testResults.response && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-white flex items-center gap-2">
                        <Info className="h-5 w-5 text-gray-400" />
                        API Response
                      </h4>
                      <div className="bg-black rounded p-4 overflow-auto max-h-60">
                        <pre className="text-sm text-green-400 whitespace-pre-wrap break-words">
                          {JSON.stringify(testResults.response, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Assertions */}
                  {Array.isArray(testResults.assertions) &&
                    testResults.assertions.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-white">
                          Test Assertions
                        </h4>
                        {testResults.assertions.map((a, i) => (
                          <div
                            key={i}
                            className={`p-4 rounded border-l-4 ${
                              a.passed
                                ? "bg-green-900 border-green-500"
                                : "bg-red-900 border-red-500"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {a.passed ? (
                                <Check className="h-5 w-5 text-green-400 mt-0.5" />
                              ) : (
                                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                              )}
                              <div className="flex-1">
                                <p
                                  className={`font-medium ${
                                    a.passed ? "text-green-300" : "text-red-300"
                                  }`}
                                >
                                  {a.message}
                                </p>
                                {!a.passed && a.error && (
                                  <p className="text-sm text-red-400 mt-1">
                                    {a.error}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  {/* Summary */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-gray-800 rounded p-4 border border-white-600 text-center">
                      <p className="text-2xl font-bold text-green-400">
                        {testResults.duration ?? "N/A"}ms
                      </p>
                      <p className="text-sm text-gray-400">Response Time</p>
                    </div>
                    <div className="bg-gray-800 rounded p-4 border border-white-600 text-center">
                      <p className="text-2xl font-bold text-blue-400">
                        {method}
                      </p>
                      <p className="text-sm text-gray-400">Method Used</p>
                    </div>
                    <div className="bg-gray-800 rounded p-4 border border-white-600 text-center">
                      <p className="text-2xl font-bold text-purple-400">
                        {Array.isArray(testResults.assertions)
                          ? `${
                              testResults.assertions.filter((a) => a.passed)
                                .length
                            }/${testResults.assertions.length}`
                          : "N/A"}
                      </p>
                      <p className="text-sm text-gray-400">Tests Passed</p>
                    </div>
                  </div>

                  {/* Previous vs Current */}
                  {typeof testResults.previousDuration === "number" && (
                    <div className="bg-gray-800 rounded p-4 border border-dashed border-white-600">
                      <h4 className="font-semibold text-white mb-3">
                        Response Time Comparison
                      </h4>
                      <div className="grid sm:grid-cols-3 gap-4 items-center">
                        <div className="text-center">
                          <p className="text-xs text-gray-400">Previous</p>
                          <p className="text-xl font-semibold text-white">
                            {testResults.previousDuration} ms
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-400">Current</p>
                          <p className="text-xl font-semibold text-white">
                            {testResults.duration} ms
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-400">Change</p>
                          <div className="mt-1">
                            <ComparisonBadge
                              deltaMs={testResults.deltaMs}
                              deltaPct={testResults.deltaPct}
                            />
                          </div>
                        </div>
                      </div>
                      {typeof testResults.degraded === "boolean" && (
                        <p
                          className={`mt-3 text-sm ${
                            testResults.degraded
                              ? "text-red-400"
                              : "text-green-400"
                          }`}
                        >
                          {testResults.degraded
                            ? "Performance degraded compared to previous run."
                            : "Performance improved or unchanged."}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-black-800 rounded-lg p-6 border border-white-700">
          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            How to Use This Tool
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="font-medium mb-3 text-white">🚀 Quick Start:</p>
              <ul className="text-sm text-red-400 space-y-1">
                <li>• Click "Try Example" to fill sample data</li>
                <li>• Or enter your own API endpoint URL</li>
                <li>• Select the HTTP method (GET, POST, etc.)</li>
                <li>• Add headers and body if needed</li>
                <li>• Click "Run API Test" and see results!</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-3 text-white">
                📋 What This Tool Tests:
              </p>
              <ul className="text-sm text-red-400 space-y-1">
                <li>• HTTP status code validation</li>
                <li>• Response format checking</li>
                <li>• Response time measurement</li>
                <li>• Timeout handling</li>
                <li>• Performance comparison</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
