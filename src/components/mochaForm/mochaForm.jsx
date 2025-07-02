"use client"
import { useState } from "react";
import { PlayCircle, Loader2, Check, AlertCircle, Info, Zap, Globe, Code, FileText, HelpCircle } from 'lucide-react';

const MochaTestPage = () => {
  const [endpoint, setEndpoint] = useState("");
  const [method, setMethod] = useState("GET");
  const [headers, setHeaders] = useState("");
  const [body, setBody] = useState("");
  const [testDescription, setTestDescription] = useState("");
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

  const handleSubmit = async () => {
    if (!validateEndpoint(endpoint)) {
      const msg = "Please enter a valid API endpoint URL (must start with http:// or https://).";
      setError(msg);
      showToastMessage(msg, "error");
      return;
    }

    setError("");
    setLoading(true);
    setTestResults(null);

    try {
      let headerObj = {};
      if (headers.trim()) {
        try {
          headerObj = JSON.parse(headers);
        } catch (e) {
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
        } catch (e) {
          const msg = "Invalid JSON format for request body";
          setError(msg);
          showToastMessage(msg, "error");
          setLoading(false);
          return;
        }
      }

      // Call your real Mocha API endpoint
      const response = await fetch('https://zypher-api.code4bharat.com/api/mocha/mocha-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: endpoint,
          method: method,
          headers: headerObj,
          body: bodyObj,
          testDescription: testDescription
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setTestResults(result);
      showToastMessage("🎉 Test completed successfully!", "success");
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      const msg = `Something went wrong: ${error.message}`;
      setError(msg);
      showToastMessage(msg, "error");
      setLoading(false);
    }
  };

  const quickFillExample = () => {
    setEndpoint("https://jsonplaceholder.typicode.com/posts/1");
    setMethod("GET");
    setHeaders("");
    setBody("");
    setTestDescription("Get a single post from JSONPlaceholder API");
    showToastMessage("✨ Example data filled! Click 'Run Test' to try it.", "info");
  };

  const getHeadersPlaceholder = () => {
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      return '{\n  "Content-Type": "application/json"\n}';
    }
    return '{\n  "Authorization": "Bearer your-token"\n}';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Custom Toast */}
      {showToast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border-l-4 transform transition-all duration-300 ${
          toastType === 'success' ? 'bg-green-50 border-green-500 text-green-800' :
          toastType === 'error' ? 'bg-red-50 border-red-500 text-red-800' :
          'bg-blue-50 border-blue-500 text-blue-800'
        }`}>
          <div className="flex items-center">
            {toastType === 'success' && <Check className="h-5 w-5 mr-2" />}
            {toastType === 'error' && <AlertCircle className="h-5 w-5 mr-2" />}
            {toastType === 'info' && <Info className="h-5 w-5 mr-2" />}
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center pt-8 pb-6">
        <div className="flex justify-center items-center mb-4">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-full shadow-lg">
            <Zap className="w-12 h-12 text-white" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent mb-3">
          Mocha API Testing
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto px-4">
          Test your API endpoints with ease. Enter your API details below and get instant feedback on performance and reliability.
        </p>
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-md mx-auto">
          <p className="text-sm text-blue-700 flex items-center gap-2">
            <Info className="h-4 w-4" />
            <span className="font-medium">Connected to:</span>
            <code className="bg-blue-100 px-2 py-1 rounded text-xs">localhost:5000</code>
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Globe className="h-5 w-5" />
                API Test Runner
              </h2>
              <button
                onClick={quickFillExample}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
              >
                <HelpCircle className="h-4 w-4" />
                Try Example
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 space-y-6">
            {/* URL Input */}
            <div className="space-y-2">
              <label htmlFor="endpoint" className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Globe className="h-4 w-4 text-green-600" />
                API Endpoint URL *
              </label>
              <input
                type="text"
                id="endpoint"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="https://api.example.com/users"
                required
                className="w-full border-2 border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
              />
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Info className="h-3 w-3" />
                Must be a valid URL starting with http:// or https://
              </p>
            </div>

            {/* Method and Description Row */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="method" className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Code className="h-4 w-4 text-green-600" />
                  Request Method
                </label>
                <select
                  id="method"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                >
                  <option value="GET">GET - Retrieve data</option>
                  <option value="POST">POST - Create new data</option>
                  <option value="PUT">PUT - Update existing data</option>
                  <option value="DELETE">DELETE - Remove data</option>
                  <option value="PATCH">PATCH - Partial update</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="testDescription" className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  Test Description
                </label>
                <input
                  type="text"
                  id="testDescription"
                  value={testDescription}
                  onChange={(e) => setTestDescription(e.target.value)}
                  placeholder="Describe what this test should do..."
                  className="w-full border-2 border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* Headers */}
            <div className="space-y-2">
              <label htmlFor="headers" className="block text-sm font-semibold text-gray-700">
                Headers (JSON) - Optional
              </label>
              <textarea
                id="headers"
                value={headers}
                onChange={(e) => setHeaders(e.target.value)}
                placeholder={getHeadersPlaceholder()}
                rows="3"
                className="w-full border-2 border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 font-mono text-sm"
              />
            </div>

            {/* Body (only for non-GET requests) */}
            {method !== "GET" && (
              <div className="space-y-2">
                <label htmlFor="body" className="block text-sm font-semibold text-gray-700">
                  Request Body (JSON) - Optional
                </label>
                <textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder='{\n  "name": "John Doe",\n  "email": "john@example.com"\n}'
                  rows="4"
                  className="w-full border-2 border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 font-mono text-sm"
                />
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-700 font-medium">{error}</p>
                  <p className="text-red-600 text-sm mt-1">
                    Check the console for detailed error information
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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

          {/* Loading State */}
          {loading && (
            <div className="mx-6 mb-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-green-700 mb-2">Running Mocha Tests...</h3>
                <p className="text-green-600">Testing your API endpoint with real Mocha tests</p>
                <div className="mt-4 bg-white rounded-lg p-3">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Progress</span>
                    <span>Testing...</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Test Results */}
          {!loading && testResults && (
            <div className="mx-6 mb-6">
              <div className="bg-gradient-to-r from-gray-50 to-green-50 border-2 border-gray-200 rounded-xl overflow-hidden">
                {/* Results Header */}
                <div className={`px-6 py-4 ${testResults.passed ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-red-600'}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      {testResults.passed ? <Check className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
                      Test Results
                    </h3>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                      testResults.passed 
                        ? 'bg-white/20 text-white' 
                        : 'bg-white/20 text-white'
                    }`}>
                      {testResults.passed ? '✓ PASSED' : '✗ FAILED'}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Status Code */}
                  {testResults.statusCode && (
                    <div className="flex items-center gap-3">
                      <span className="text-gray-600 font-medium">HTTP Status:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        testResults.statusCode >= 200 && testResults.statusCode < 300 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {testResults.statusCode}
                      </span>
                    </div>
                  )}

                  {/* API Response */}
                  {testResults.response && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                        <Info className="h-5 w-5 text-green-600" />
                        API Response
                      </h4>
                      <div className="bg-gray-900 rounded-xl p-4 overflow-auto max-h-60">
                        <pre className="text-sm text-green-400 whitespace-pre-wrap break-words">
                          {JSON.stringify(testResults.response, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Test Assertions */}
                  {testResults.assertions && testResults.assertions.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-700">Test Assertions</h4>
                      <div className="space-y-2">
                        {testResults.assertions.map((assertion, index) => (
                          <div key={index} className={`p-4 rounded-xl border-l-4 ${
                            assertion.passed 
                              ? 'bg-green-50 border-green-500' 
                              : 'bg-red-50 border-red-500'
                          }`}>
                            <div className="flex items-start gap-3">
                              {assertion.passed ? (
                                <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                              ) : (
                                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1">
                                <p className={`font-medium ${assertion.passed ? "text-green-700" : "text-red-700"}`}>
                                  {assertion.message}
                                </p>
                                {!assertion.passed && assertion.error && (
                                  <p className="text-sm text-red-600 mt-1">{assertion.error}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
                    <div className="grid md:grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-green-600">{testResults.duration || 'N/A'}ms</p>
                        <p className="text-sm text-gray-600">Response Time</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{method}</p>
                        <p className="text-sm text-gray-600">Method Used</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-600">
                          {testResults.assertions ? 
                            `${testResults.assertions.filter(a => a.passed).length}/${testResults.assertions.length}` : 
                            'N/A'
                          }
                        </p>
                        <p className="text-sm text-gray-600">Tests Passed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
          <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            How to Use This Tool
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <p className="font-medium mb-2">🚀 Quick Start:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Click "Try Example" to fill sample data</li>
                <li>Or enter your own API endpoint URL</li>
                <li>Select the HTTP method (GET, POST, etc.)</li>
                <li>Add headers and body if needed</li>
                <li>Click "Run API Test" and see results!</li>
              </ol>
            </div>
            <div>
              <p className="font-medium mb-2">📋 What This Tool Tests:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>HTTP status code validation</li>
                <li>Response format checking</li>
                <li>Response time measurement</li>
                <li>Basic API health verification</li>
                <li>JSON structure validation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MochaTestPage;