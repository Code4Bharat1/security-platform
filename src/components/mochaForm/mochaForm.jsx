'use client'
import { useState } from "react";
import { PlayCircle, Loader2, Check, AlertCircle } from 'lucide-react';

const MochaTestPage = () => {
  const [endpoint, setEndpoint] = useState("");
  const [method, setMethod] = useState("GET");
  const [headers, setHeaders] = useState("");
  const [body, setBody] = useState("");
  const [testDescription, setTestDescription] = useState("");
  const [error, setError] = useState("");
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const validateEndpoint = (url) => {
    const urlPattern = new RegExp(
      "^(https?:\\/\\/)?(([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}(:\\d+)?(\\/[-a-zA-Z\\d%_.~+]*)*$",
      "i"
    );
    return !!urlPattern.test(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEndpoint(endpoint)) {
      setError("Please enter a valid API endpoint URL.");
      return;
    }

    setError("");
    setLoading(true);
    setTestResults(null);

    try {
      // Parse headers if provided
      let headerObj = {};
      if (headers.trim()) {
        try {
          headerObj = JSON.parse(headers);
        } catch (e) {
          setError("Invalid JSON format for headers");
          setLoading(false);
          return;
        }
      }

      // Parse body if provided and not GET method
      let bodyObj = null;
      if (body.trim() && method !== "GET") {
        try {
          bodyObj = JSON.parse(body);
        } catch (e) {
          setError("Invalid JSON format for request body");
          setLoading(false);
          return;
        }
      }

      const response = await fetch("/api/mocha-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint,
          method,
          headers: headerObj,
          body: bodyObj,
          testDescription
        }),
      });

      const result = await response.json();

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      setTestResults(result);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setError("Something went wrong while running the tests.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 mb-5">
      <img src="/mocha-logo.png" alt="Mocha logo" className="w-20 h-20 mb-4 mt-7" />
      <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mt-3">Mocha API Testing</h1>
      <p className="text-lg text-slate-600 max-w-2xl mx-auto text-center mt-3">
        Test your API endpoints with Mocha and verify responses with a simple interface.
      </p>
      
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl mt-10">
        <h1 className="text-2xl font-bold text-center mb-5 mt-4 text-brown-700">
          API Test Runner
        </h1>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="endpoint" className="block text-sm font-medium text-gray-700 mb-1">
              API Endpoint URL
            </label>
            <input
              type="text"
              id="endpoint"
              name="endpoint"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="https://api.example.com/users"
              required
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-brown-700 focus:border-brown-700"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="method" className="block text-sm font-medium text-gray-700 mb-1">
              Request Method
            </label>
            <select
              id="method"
              name="method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-brown-700 focus:border-brown-700"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="headers" className="block text-sm font-medium text-gray-700 mb-1">
              Headers (JSON)
            </label>
            <textarea
              id="headers"
              name="headers"
              value={headers}
              onChange={(e) => setHeaders(e.target.value)}
              placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
              rows="3"
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-brown-700 focus:border-brown-700"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">
              Request Body (JSON) - for POST, PUT, PATCH
            </label>
            <textarea
              id="body"
              name="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder='{"name": "John Doe", "email": "john@example.com"}'
              rows="4"
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-brown-700 focus:border-brown-700"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="testDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Test Description
            </label>
            <input
              type="text"
              id="testDescription"
              name="testDescription"
              value={testDescription}
              onChange={(e) => setTestDescription(e.target.value)}
              placeholder="Should return user details"
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-brown-700 focus:border-brown-700"
            />
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          
          <button
            type="submit"
            className="w-full bg-brown-700 text-white py-2 px-4 rounded hover:bg-brown-600 transition-colors duration-300 flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <PlayCircle className="h-5 w-5" />
            )}
            {loading ? "Running Tests..." : "Run Test"}
          </button>
        </form>

        {/* Test Results Area */}
        <div className="mt-6">
          {loading && (
            <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brown-700 border-opacity-50 mb-3"></div>
              <p className="text-brown-700 font-medium">Running Mocha tests...</p>
            </div>
          )}

          {!loading && testResults && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h2 className="text-xl font-bold text-brown-700 mb-2">Test Results</h2>
              
              <div className="mb-3">
                <strong>Status: </strong>
                <span className={testResults.passed ? "text-green-600" : "text-red-600"}>
                  {testResults.passed ? "Passed" : "Failed"}
                </span>
              </div>
              
              <div className="mb-3">
                <h3 className="font-medium text-gray-700 mb-1">API Response:</h3>
                <div className="bg-gray-100 p-3 rounded-md overflow-auto max-h-60">
                  <pre className="text-sm whitespace-pre-wrap break-words">
                    {JSON.stringify(testResults.response, null, 2)}
                  </pre>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-1">Test Assertions:</h3>
                <ul className="space-y-2">
                  {testResults.assertions.map((assertion, index) => (
                    <li key={index} className="flex items-start">
                      {assertion.passed ? (
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                      )}
                      <div>
                        <span className={assertion.passed ? "text-green-600" : "text-red-600"}>
                          {assertion.message}
                        </span>
                        {!assertion.passed && assertion.error && (
                          <p className="text-sm text-red-500">{assertion.error}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-3 text-sm text-gray-500">
                <p>Tests completed in {testResults.duration}ms</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MochaTestPage;