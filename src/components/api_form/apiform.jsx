'use client'

import axios from "axios";
import { useState } from "react";
import { Search, Loader2, ChevronDown, ChevronUp, RefreshCw, Shield, ShieldAlert, Code, Share2 } from 'lucide-react';

const Apiform = () => {
  const [formData, setFormData] = useState({
    url: "",
    method: "GET",
    headers: '{\n  "Content-Type": "application/json"\n}',
    body: '{\n  \n}',
    timeout: 5000
  });
  
  const [error, setError] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("headers");
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Generate random example URLs
// Deterministic examples for SSR (no randomness during render)
const EXAMPLES = [
  "https://httpbin.org/get",
  "https://jsonplaceholder.typicode.com/posts/1",
];
const DEFAULT_EXAMPLE = EXAMPLES[0];

  
  const validateUrl = (url) => {
    // Enhanced URL validation - handles URLs with or without protocol
    const urlPattern = new RegExp(
      "^(https?:\\/\\/)?(([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}(:\\d+)?(\\/.*)?$",
      "i"
    );
    return urlPattern.test(url);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = async (e) => {
  e.preventDefault();

  // Ensure URL has protocol
  let formattedUrl = formData.url.trim();
  if (formattedUrl && !/^https?:\/\//i.test(formattedUrl)) {
    formattedUrl = "https://" + formattedUrl;
  }
  // Validate URL
  try {
    new URL(formattedUrl); // throws if invalid
  } catch {
    setError("❌ Please enter a valid API URL (e.g., https://api.example.com/resource).");
    return;
  }

  setError("");
  setLoading(true);
  setResults(null);

  // Parse headers
  let headers = {};
  try {
    headers = formData.headers ? JSON.parse(formData.headers) : {};
    if (headers && typeof headers !== "object") throw new Error();
  } catch {
    setLoading(false);
    setError('❌ Invalid JSON in headers field. Example: { "Authorization": "Bearer <token>" }');
    return;
  }

  // Parse body for non-GET
  let body = {};
  if (formData.method !== "GET") {
    try {
      body = formData.body ? JSON.parse(formData.body) : {};
      if (body && typeof body !== "object") throw new Error();
    } catch {
      setLoading(false);
      setError('❌ Invalid JSON in body field. Example: { "key": "value" }');
      return;
    }
  }

  const requestData = {
    url: formattedUrl,
    method: formData.method,
    headers,
    body,
    options: { timeout: parseInt(formData.timeout, 10) || 5000 },
  };

  const backendUrl = process.env.NEXT_PUBLIC_PROD_API_URL
  const fullUrl = `${backendUrl.replace(/\/$/, "")}/apiTest/apitest-scan`;

  try {
    const { data } = await axios.post(fullUrl, requestData, {
      headers: { "Content-Type": "application/json" },
      timeout: 30000, // 30s timeout for the backend call
      withCredentials: false,
    });

    if (data?.error) {
      setError(`⚠️ ${data.error}`);
      return;
    }
    setResults(data);
  } catch (err) {
    console.error("API Test Error:", err);

    let errorMessage = "Something went wrong. Please try again.";
    if (axios.isAxiosError(err)) {
      if (err.code === "ECONNABORTED") {
        errorMessage = "Request timed out. Please try again.";
      } else if (err.response) {
        const { status, statusText, data } = err.response;
        const serverMsg = data?.error || data?.message || "";
        if (status === 404) {
          errorMessage =
            serverMsg ||
            "Backend endpoint not found. Check if your backend is running and the endpoint path is correct.";
        } else if (status === 500) {
          errorMessage = serverMsg || "Internal server error. Please check your backend logs.";
        } else {
          errorMessage = serverMsg || `Server error: ${status} ${statusText || ""}`.trim();
        }
      } else if (err.request) {
        errorMessage =
          "Cannot connect to backend. Please ensure your backend is running and CORS is configured.";
      } else if (err.message) {
        errorMessage = err.message;
      }
    } else if (err?.message) {
      errorMessage = err.message;
    }

    setError(`⚠️ ${errorMessage}`);
  } finally {
    setLoading(false);
  }
};


  
  const getSeverityColor = (score) => {
    if (score > 80) return "text-green-600";
    if (score > 60) return "text-yellow-600";
    return "text-red-600";
  };
  
  const getStatusSymbol = (status) => {
    if (status === "Secure" || status === "Enabled" || status === "Configured") {
      return "✅";
    }
    if (status === "Missing" || status === "Not Configured" || status === "Insecure") {
      return "❌";
    }
    return "⚠️";
  };
  
  // Formats the request headers for display
  const formatRequestHeaders = () => {
    try {
      const headers = JSON.parse(formData.headers);
      return Object.entries(headers).map(([key, value]) => (
        <div key={key} className="font-mono text-sm">
          <span className="text-green-700 font-semibold">{key}</span>: {value}
        </div>
      ));
    } catch (e) {
      return <div className="text-red-500">Invalid JSON</div>;
    }
  };
  
  // Formats the request body for display
  const formatRequestBody = () => {
    try {
      if (!formData.body || formData.body.trim() === '{}') {
        return <div className="text-gray-500 italic">No body</div>;
      }
      
      const body = JSON.parse(formData.body);
      return <pre className="font-mono text-sm">{JSON.stringify(body, null, 2)}</pre>;
    } catch (e) {
      return <div className="text-red-500">Invalid JSON</div>;
    }
  };
  
  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 mb-5">
      <img src="/api.png" alt="verify" className="w-16 h-20 mb-4 mt-7" />
      <div className="w-16 h-20 flex items-center justify-center bg-blue-700 rounded-lg mb-4 mt-7">
        <Shield className="w-12 h-12 text-white" />
      </div>
      <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mt-3">API Security Tester</h1>
      <p className="text-lg text-slate-600 max-w-2xl mx-auto text-center mt-3">
        Test your API endpoints for security vulnerabilities and best practices compliance
      </p>
      
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl mt-10">
        <h1 className="text-2xl font-bold text-center mb-5 mt-4 text-blue-700">
          API Security Analysis
        </h1>
        
        Test  your api
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-700">
            {/* <strong>Backend URL:</strong> {process.env.NEXT_PUBLIC_PROD_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4180'} */}
          </div>
          <div className="text-xs text-blue-600 mt-1">
            Make sure your url is running and accessible 
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
              API Endpoint URL
            </label>
            <div className="relative">
              <input
                type="text"
                id="url"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                placeholder={DEFAULT_EXAMPLE}
                required
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setFormData({...formData, url: getRandomExample()})}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800 text-sm"
              >
                Random
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Try: jsonplaceholder.typicode.com/posts/1 or httpbin.org/get
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="method" className="block text-sm font-medium text-gray-700 mb-1">
              HTTP Method
            </label>
            <select
              id="method"
              name="method"
              value={formData.method}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
              <option value="HEAD">HEAD</option>
              <option value="OPTIONS">OPTIONS</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="headers" className="block text-sm font-medium text-gray-700 mb-1">
              Request Headers (JSON)
            </label>
            <textarea
              id="headers"
              name="headers"
              value={formData.headers}
              onChange={handleInputChange}
              rows="3"
              className="w-full border border-gray-300 rounded-lg p-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {formData.method !== "GET" && (
            <div className="mb-4">
              <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">
                Request Body (JSON)
              </label>
              <textarea
                id="body"
                name="body"
                value={formData.body}
                onChange={handleInputChange}
                rows="3"
                placeholder='{\n  "key": "value"\n}'
                className="w-full border border-gray-300 rounded-lg p-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          
          <div className="mb-4">
            <button 
              type="button" 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              {showAdvanced ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Hide Advanced Options
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Show Advanced Options
                </>
              )}
            </button>
            
            {showAdvanced && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <div className="mb-2">
                  <label htmlFor="timeout" className="block text-sm font-medium text-gray-700 mb-1">
                    Timeout (ms)
                  </label>
                  <input
                    type="number"
                    id="timeout"
                    name="timeout"
                    value={formData.timeout}
                    onChange={handleInputChange}
                    min="1000"
                    max="30000"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          
          <button
            type="submit"
            className="w-full bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-300 flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
            {loading ? "Testing API..." : "Test API Security"}
          </button>
        </form>

        {/* Request Preview */}
        {!loading && !results && (
          <div className="mt-6 border rounded-lg p-4 bg-gray-50">
            <h2 className="text-xl font-bold text-blue-700 mb-2">Request Preview</h2>
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <div className="font-semibold">{formData.method} {formData.url || DEFAULT_EXAMPLE}</div>
              </div>
              
              <div className="mt-3">
                <div className="flex border-b">
                  <button
                    className={`px-4 py-2 ${activeTab === "headers" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
                    onClick={() => setActiveTab("headers")}
                  >
                    Headers
                  </button>
                  <button
                    className={`px-4 py-2 ${activeTab === "body" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
                    onClick={() => setActiveTab("body")}
                  >
                    Body
                  </button>
                </div>
                
                <div className="p-3 bg-gray-100 rounded-b-lg">
                  {activeTab === "headers" ? (
                    <div>
                      {formatRequestHeaders()}
                    </div>
                  ) : (
                    <div>
                      {formatRequestBody()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Area */}
        {loading && (
          <div className="mt-6 flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-700 mb-3"></div>
            <p className="text-blue-700 font-medium">Analyzing API security...</p>
          </div>
        )}

        {!loading && results && (
          <div className="mt-6 border rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-blue-700">Security Analysis Results</h2>
              <button 
                onClick={() => setResults(null)}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Test Another
              </button>
            </div>
            
            {/* Score Card */}
            {results.securityScorecard && (
              <div className="mb-5 flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div>
                  <h3 className="font-semibold text-gray-700">Security Score</h3>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`text-3xl font-bold ${getSeverityColor(results.securityScorecard.score)}`}>
                      {results.securityScorecard.score}/100
                    </span>
                    <span className={`text-lg font-medium ${getSeverityColor(results.securityScorecard.score)}`}>
                      {results.securityScorecard.rating}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-center bg-gray-100 rounded-full h-16 w-16">
                  {results.securityScorecard.score > 80 ? (
                    <Shield className="h-8 w-8 text-green-600" />
                  ) : results.securityScorecard.score > 60 ? (
                    <ShieldAlert className="h-8 w-8 text-yellow-600" />
                  ) : (
                    <ShieldAlert className="h-8 w-8 text-red-600" />
                  )}
                </div>
              </div>
            )}
            
            {/* Response Status */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-700 mb-2">Response Status</h3>
              <div className="bg-white p-3 rounded border border-gray-200">
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${results.status >= 400 ? 'text-red-600' : 'text-green-600'}`}>
                    {results.status}
                  </span>
                  <span className="text-gray-600">{results.statusText}</span>
                </div>
              </div>
            </div>
            
            {/* Security Checks */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-700 mb-2">Security Checks</h3>
              
              <div className="space-y-3">
                {/* Authentication */}
                {results.securityChecks?.authentication && (
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <h4 className="font-medium text-blue-700">Authentication</h4>
                    <div className="mt-1">
                      <div className="text-sm">
                        <span className="font-medium">Status: </span>
                        {results.securityChecks.authentication.status}
                      </div>
                      {results.securityChecks.authentication.secure && (
                        <div className="text-sm mt-1">
                          <span className="font-medium">Security Note: </span>
                          {results.securityChecks.authentication.secure}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Header Security */}
                {results.securityChecks?.headerSecurity && (
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <h4 className="font-medium text-blue-700">Security Headers</h4>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Object.entries(results.securityChecks.headerSecurity).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <div className="flex items-center gap-1">
                            <span>{getStatusSymbol(value.status)}</span>
                            <span className="font-medium">{key}:</span>
                          </div>
                          <div className="ml-5 text-gray-600">
                            {value.status}
                            {value.recommendation && (
                              <div className="text-yellow-600 text-xs mt-1">{value.recommendation}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* SSL/TLS */}
                {results.securityChecks?.ssl && (
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <h4 className="font-medium text-blue-700">SSL/TLS Security</h4>
                    <div className="mt-1">
                      <div className="text-sm flex items-center gap-1">
                        <span>{getStatusSymbol(results.securityChecks.ssl.status)}</span>
                        <span className="font-medium">Status: </span>
                        <span className={results.securityChecks.ssl.status === "Secure" ? "text-green-600" : "text-red-600"}>
                          {results.securityChecks.ssl.status}
                        </span>
                      </div>
                      {results.securityChecks.ssl.hstsStatus && (
                        <div className="text-sm mt-1 ml-5">
                          <span className="font-medium">HSTS: </span>
                          {results.securityChecks.ssl.hstsStatus}
                        </div>
                      )}
                      {results.securityChecks.ssl.recommendation && (
                        <div className="text-yellow-600 text-xs mt-1 ml-5">
                          {results.securityChecks.ssl.recommendation}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Sensitive Data */}
                {results.securityChecks?.sensitiveDataExposure && (
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <h4 className="font-medium text-blue-700">Sensitive Data Exposure</h4>
                    <div className="mt-1">
                      <div className="text-sm flex items-center gap-1">
                        <span>{results.securityChecks.sensitiveDataExposure.status === "No obvious data exposure" ? "✅" : "⚠️"}</span>
                        <span className="font-medium">Status: </span>
                        <span className={results.securityChecks.sensitiveDataExposure.status === "No obvious data exposure" ? "text-green-600" : "text-orange-600"}>
                          {results.securityChecks.sensitiveDataExposure.status}
                        </span>
                      </div>
                      {results.securityChecks.sensitiveDataExposure.details && 
                       results.securityChecks.sensitiveDataExposure.details !== "No sensitive data patterns detected in response" && (
                        <div className="bg-gray-50 p-2 rounded mt-2 text-sm">
                          <div className="font-medium">Details:</div>
                          <pre className="text-xs overflow-auto max-h-40">
                            {JSON.stringify(results.securityChecks.sensitiveDataExposure.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Injection Vulnerabilities */}
                {results.securityChecks?.injectionVulnerability && (
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <h4 className="font-medium text-blue-700">Injection Vulnerabilities</h4>
                    <div className="mt-1">
                      <div className="text-sm flex items-center gap-1">
                        <span>{results.securityChecks.injectionVulnerability.status === "No obvious vulnerabilities" ? "✅" : "⚠️"}</span>
                        <span className="font-medium">Status: </span>
                        <span className={results.securityChecks.injectionVulnerability.status === "No obvious vulnerabilities" ? "text-green-600" : "text-orange-600"}>
                          {results.securityChecks.injectionVulnerability.status}
                        </span>
                      </div>
                      {results.securityChecks.injectionVulnerability.details && 
                       results.securityChecks.injectionVulnerability.details !== "No common error patterns detected in response" && (
                        <div className="bg-gray-50 p-2 rounded mt-2 text-sm">
                          <div className="font-medium">Details:</div>
                          <pre className="text-xs overflow-auto max-h-40">
                            {JSON.stringify(results.securityChecks.injectionVulnerability.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Recommendations */}
            {results.recommendations && results.recommendations.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">Recommendations</h3>
                <div className="bg-white p-3 rounded border border-gray-200">
                  <ul className="list-disc pl-5 space-y-1">
                    {results.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-700">{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {/* Technical Details */}
            <details className="mt-4">
              <summary className="cursor-pointer text-blue-700 font-medium flex items-center">
                <Code className="h-4 w-4 mr-1" />
                View Full Response Details
              </summary>
              <div className="mt-2 p-3 bg-gray-100 rounded text-sm overflow-auto max-h-96">
                <pre className="whitespace-pre-wrap font-mono text-xs">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        )}
      </div>
      
      <div className="mt-6 text-center text-gray-500 text-sm">
        <p>Use this tool to test your API endpoints for security vulnerabilities and best practices.</p>
        <p className="mt-1">Always follow security best practices and regularly audit your APIs.</p>
      </div>
    </div>
  );
};

export default Apiform;