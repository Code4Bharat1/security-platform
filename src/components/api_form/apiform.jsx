'use client'

import { useState } from "react";
import { Search, Loader2, ChevronDown, ChevronUp, RefreshCw, Shield, ShieldAlert, Code } from 'lucide-react';

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
  
  const EXAMPLES = [
    "https://httpbin.org/get",
    "https://jsonplaceholder.typicode.com/posts/1",
  ];
  const DEFAULT_EXAMPLE = EXAMPLES[0];

  const getRandomExample = () => {
    return EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)];
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
      new URL(formattedUrl);
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

    // Simulate the real API call - replace this section with your actual API call
    setTimeout(() => {
      const mockResults = {
        status: 200,
        statusText: "OK",
        securityScorecard: {
          score: 75,
          rating: "Good"
        },
        securityChecks: {
          authentication: {
            status: "Not Required",
            secure: "Public endpoint detected"
          },
          headerSecurity: {
            "X-Content-Type-Options": { status: "Missing", recommendation: "Add to prevent MIME sniffing" },
            "X-Frame-Options": { status: "Missing", recommendation: "Add to prevent clickjacking" },
            "Content-Security-Policy": { status: "Missing", recommendation: "Implement CSP headers" },
            "Strict-Transport-Security": { status: "Missing", recommendation: "Enable HSTS for HTTPS" }
          },
          ssl: {
            status: "Secure",
            hstsStatus: "Not Configured",
            recommendation: "Consider enabling HSTS"
          },
          sensitiveDataExposure: {
            status: "No obvious data exposure",
            details: "No sensitive data patterns detected in response"
          },
          injectionVulnerability: {
            status: "No obvious vulnerabilities",
            details: "No common error patterns detected in response"
          }
        },
        recommendations: [
          "Add security headers to improve overall security posture",
          "Implement Content Security Policy (CSP)",
          "Consider enabling HSTS for enhanced SSL security",
          "Add X-Frame-Options header to prevent clickjacking"
        ]
      };
      setResults(mockResults);
      setLoading(false);
    }, 2000);

    /* 
    // Uncomment and replace the setTimeout above with this for real API calls
    const requestData = {
      url: formattedUrl,
      method: formData.method,
      headers,
      body,
      options: { timeout: parseInt(formData.timeout, 10) || 5000 },
    };

    const backendUrl = process.env.NEXT_PUBLIC_PROD_API_URL;
    const fullUrl = `${backendUrl.replace(/\/$/, "")}/apiTest/apitest-scan`;

    try {
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (data?.error) {
        setError(`⚠️ ${data.error}`);
        return;
      }
      setResults(data);
    } catch (err) {
      console.error("API Test Error:", err);
      setError(`⚠️ Something went wrong. Please try again.`);
    } finally {
      setLoading(false);
    }
    */
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
  
  const formatRequestHeaders = () => {
    try {
      const headers = JSON.parse(formData.headers);
      return Object.entries(headers).map(([key, value]) => (
        <div key={key} className="font-mono text-sm">
          <span className="text-green-400 font-semibold">{key}</span>: {value}
        </div>
      ));
    } catch (e) {
      return <div className="text-red-500">Invalid JSON</div>;
    }
  };
  
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
    <div className="flex flex-col items-center min-h-screen   " style={{backgroundColor: '#1a1a1a'}}>
      <div className="flex items-center mt-15 mb-10 md:w-full justify-left lg:px-60">
        <img 
          src="/Redteam/api.png" 
          alt="Logo" 
          className="w-30 h-30 rounded-full mr-4" 
        />
        <div>
          <h1 className="text-white text-2xl md:text-3xl -font-bold">API Security Tester</h1>
          <p className="text-gray-400 text-sm">
            Test your API endpoints for security vulnerabilities<br/>
            and best practices compliance
          </p>
        </div>
      </div>
      
      <div className="w-full max-w-md md:max-w-5xl mx-4">
        <div className="bg-red-600 text-white p-3 rounded-t-lg">
          <h2 className="text-lg font-semibold">API Security Analysis</h2>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-b-lg border border-white-600">
          <div className="mb-4">
            <p className="text-white text-sm mb-4">Test your api</p>
            
            <div className="bg-gray-700 p-3 rounded mb-4 text-xs text-gray-300">
              Make sure your url is running and accessible
            </div>
          </div>
          
          <div>
            <div className="mb-4">
              <label className="block text-white text-sm mb-2">
                API Endpoint URL
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  placeholder={DEFAULT_EXAMPLE}
                  required
                  className="w-full bg-gray-700 text-white border border-white-600 rounded p-2 text-sm focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setFormData({...formData, url: getRandomExample()})}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300 text-xs"
                >
                  Random
                </button>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Try: jsonplaceholder.typicode.com/posts/1 or httpbin.org/get
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-white text-sm mb-2">
                HTTP Method
              </label>
              <select
                name="method"
                value={formData.method}
                onChange={handleInputChange}
                className="w-full bg-gray-700 text-white border border-white-600 rounded p-2 text-sm focus:outline-none focus:border-blue-500"
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
              <label className="block text-white text-sm mb-2">
                Request Headers (JSON)
              </label>
              <textarea
                name="headers"
                value={formData.headers}
                onChange={handleInputChange}
                rows="3"
                className="w-full bg-gray-700 text-white border border-white-600 rounded p-2 font-mono text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
            
            {formData.method !== "GET" && (
              <div className="mb-4">
                <label className="block text-white text-sm mb-2">
                  Request Body (JSON)
                </label>
                <textarea
                  name="body"
                  value={formData.body}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder='{\n  "key": "value"\n}'
                  className="w-full bg-gray-700 text-white border border-white-600 rounded p-2 font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
            
            <div className="mb-4">
              <button 
                type="button" 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center text-sm text-blue-400 hover:text-blue-300"
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
                <div className="mt-2 p-3 bg-gray-700 rounded">
                  <div className="mb-2">
                    <label className="block text-white text-sm mb-1">
                      Timeout (ms)
                    </label>
                    <input
                      type="number"
                      name="timeout"
                      value={formData.timeout}
                      onChange={handleInputChange}
                      min="1000"
                      max="30000"
                      className="w-full bg-gray-600 text-white border border-white-500 rounded p-2 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}
            
            <button
              type="submit"
              onClick={handleSubmit}
              className="w-full bg-red-600 text-white py-3 px-4 rounded hover:bg-red-700 transition-colors duration-300 flex items-center justify-center gap-2 font-semibold"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
              {loading ? "Testing API..." : "Test API Security"}
            </button>
          </div>

          {!loading && !results && (
            <div className="mt-6 border border-white-600 rounded bg-gray-700 p-4">
              <h3 className="text-white font-semibold mb-3">Request Preview</h3>
              <div className="mb-3">
                <div className="text-white font-medium mb-2">
                  {formData.method} {formData.url || DEFAULT_EXAMPLE}
                </div>
                
                <div className="flex border-b border-white-600">
                  <button
                    className={`px-3 py-2 text-sm ${activeTab === "headers" ? "border-b-2 border-red-500 text-red-400" : "text-gray-400"}`}
                    onClick={() => setActiveTab("headers")}
                  >
                    Headers
                  </button>
                  <button
                    className={`px-3 py-2 text-sm ${activeTab === "body" ? "border-b-2 border-red-500 text-red-400" : "text-gray-400"}`}
                    onClick={() => setActiveTab("body")}
                  >
                    Body
                  </button>
                </div>
                
                <div className="p-3 bg-gray-800 rounded-b">
                  {activeTab === "headers" ? (
                    <div className="text-gray-300">
                      {formatRequestHeaders()}
                    </div>
                  ) : (
                    <div className="text-gray-300">
                      {formatRequestBody()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="mt-6 flex flex-col items-center justify-center p-6 bg-gray-700 rounded border border-white-600">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-red-500 mb-3"></div>
              <p className="text-red-400 font-medium">Analyzing API security...</p>
            </div>
          )}

          {!loading && results && (
            <div className="mt-6 border border-white-600 rounded p-4 bg-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-semibold">Security Analysis Results</h3>
                <button 
                  onClick={() => setResults(null)}
                  className="flex items-center text-sm text-blue-400 hover:text-blue-300"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Test Another
                </button>
              </div>
              
              {results.securityScorecard && (
                <div className="mb-5 flex items-center justify-between p-4 bg-gray-800 rounded border border-white-600">
                  <div>
                    <h4 className="font-semibold text-gray-300">Security Score</h4>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`text-3xl font-bold ${getSeverityColor(results.securityScorecard.score)}`}>
                        {results.securityScorecard.score}/100
                      </span>
                      <span className={`text-lg font-medium ${getSeverityColor(results.securityScorecard.score)}`}>
                        {results.securityScorecard.rating}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center bg-gray-600 rounded-full h-16 w-16">
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
              
              <div className="mb-4">
                <h4 className="font-semibold text-gray-300 mb-2">Response Status</h4>
                <div className="bg-gray-800 p-3 rounded border border-white-600">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${results.status >= 400 ? 'text-red-600' : 'text-green-600'}`}>
                      {results.status}
                    </span>
                    <span className="text-gray-400">{results.statusText}</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="font-semibold text-gray-300 mb-2">Security Checks</h4>
                
                <div className="space-y-3">
                  {results.securityChecks?.authentication && (
                    <div className="bg-gray-800 p-3 rounded border border-white-600">
                      <h5 className="font-medium text-blue-400">Authentication</h5>
                      <div className="mt-1">
                        <div className="text-sm text-gray-300">
                          <span className="font-medium">Status: </span>
                          {results.securityChecks.authentication.status}
                        </div>
                        {results.securityChecks.authentication.secure && (
                          <div className="text-sm mt-1 text-gray-400">
                            <span className="font-medium">Security Note: </span>
                            {results.securityChecks.authentication.secure}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {results.securityChecks?.headerSecurity && (
                    <div className="bg-gray-800 p-3 rounded border border-white-600">
                      <h5 className="font-medium text-blue-400">Security Headers</h5>
                      <div className="mt-2 space-y-2">
                        {Object.entries(results.securityChecks.headerSecurity).map(([key, value]) => (
                          <div key={key} className="text-sm">
                            <div className="flex items-center gap-1">
                              <span>{getStatusSymbol(value.status)}</span>
                              <span className="font-medium text-gray-300">{key}:</span>
                            </div>
                            <div className="ml-5 text-gray-400">
                              {value.status}
                              {value.recommendation && (
                                <div className="text-yellow-500 text-xs mt-1">{value.recommendation}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {results.securityChecks?.ssl && (
                    <div className="bg-gray-800 p-3 rounded border border-white-600">
                      <h5 className="font-medium text-blue-400">SSL/TLS Security</h5>
                      <div className="mt-1">
                        <div className="text-sm flex items-center gap-1">
                          <span>{getStatusSymbol(results.securityChecks.ssl.status)}</span>
                          <span className="font-medium text-gray-300">Status: </span>
                          <span className={results.securityChecks.ssl.status === "Secure" ? "text-green-600" : "text-red-600"}>
                            {results.securityChecks.ssl.status}
                          </span>
                        </div>
                        {results.securityChecks.ssl.hstsStatus && (
                          <div className="text-sm mt-1 ml-5 text-gray-400">
                            <span className="font-medium">HSTS: </span>
                            {results.securityChecks.ssl.hstsStatus}
                          </div>
                        )}
                        {results.securityChecks.ssl.recommendation && (
                          <div className="text-yellow-500 text-xs mt-1 ml-5">
                            {results.securityChecks.ssl.recommendation}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {results.securityChecks?.sensitiveDataExposure && (
                    <div className="bg-gray-800 p-3 rounded border border-white-600">
                      <h5 className="font-medium text-blue-400">Sensitive Data Exposure</h5>
                      <div className="mt-1">
                        <div className="text-sm flex items-center gap-1">
                          <span>{results.securityChecks.sensitiveDataExposure.status === "No obvious data exposure" ? "✅" : "⚠️"}</span>
                          <span className="font-medium text-gray-300">Status: </span>
                          <span className={results.securityChecks.sensitiveDataExposure.status === "No obvious data exposure" ? "text-green-600" : "text-orange-600"}>
                            {results.securityChecks.sensitiveDataExposure.status}
                          </span>
                        </div>
                        {results.securityChecks.sensitiveDataExposure.details && 
                         results.securityChecks.sensitiveDataExposure.details !== "No sensitive data patterns detected in response" && (
                          <div className="bg-gray-600 p-2 rounded mt-2 text-sm">
                            <div className="font-medium text-gray-300">Details:</div>
                            <pre className="text-xs overflow-auto max-h-40 text-gray-400">
                              {JSON.stringify(results.securityChecks.sensitiveDataExposure.details, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {results.securityChecks?.injectionVulnerability && (
                    <div className="bg-gray-800 p-3 rounded border border-white-600">
                      <h5 className="font-medium text-blue-400">Injection Vulnerabilities</h5>
                      <div className="mt-1">
                        <div className="text-sm flex items-center gap-1">
                          <span>{results.securityChecks.injectionVulnerability.status === "No obvious vulnerabilities" ? "✅" : "⚠️"}</span>
                          <span className="font-medium text-gray-300">Status: </span>
                          <span className={results.securityChecks.injectionVulnerability.status === "No obvious vulnerabilities" ? "text-green-600" : "text-orange-600"}>
                            {results.securityChecks.injectionVulnerability.status}
                          </span>
                        </div>
                        {results.securityChecks.injectionVulnerability.details && 
                         results.securityChecks.injectionVulnerability.details !== "No common error patterns detected in response" && (
                          <div className="bg-gray-600 p-2 rounded mt-2 text-sm">
                            <div className="font-medium text-gray-300">Details:</div>
                            <pre className="text-xs overflow-auto max-h-40 text-gray-400">
                              {JSON.stringify(results.securityChecks.injectionVulnerability.details, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {results.recommendations && results.recommendations.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-300 mb-2">Recommendations</h4>
                  <div className="bg-gray-800 p-3 rounded border border-white-600">
                    <ul className="list-disc pl-5 space-y-1">
                      {results.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-gray-400">{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              <details className="mt-4">
                <summary className="cursor-pointer text-blue-400 font-medium flex items-center">
                  <Code className="h-4 w-4 mr-1" />
                  View Full Response Details
                </summary>
                <div className="mt-2 p-3 bg-gray-800 rounded text-sm overflow-auto max-h-96">
                  <pre className="whitespace-pre-wrap font-mono text-xs text-gray-300">
                    {JSON.stringify(results, null, 2)}
                  </pre>
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Apiform;