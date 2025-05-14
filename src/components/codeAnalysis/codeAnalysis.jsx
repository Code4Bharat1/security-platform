"use client";
import React, { useState, useEffect } from "react";

export default function AnalysisForm() {
  const [code, setCode] = useState("");
  const [results, setResults] = useState([]);
  const [reportContent, setReportContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rawResponse, setRawResponse] = useState("");
  const [debugMode, setDebugMode] = useState(false);

  // Sample vulnerable code for testing
  const vulnerableCodeSamples = {
    xss: `function displayUserInput() {
  // XSS vulnerability: directly inserting user input into innerHTML
  const userInput = document.getElementById('userInput').value;
  document.getElementById('output').innerHTML = userInput;
}`,
    sqlInjection: `function getUserData(userId) {
  // SQL Injection vulnerability: constructing SQL query with string concatenation
  const query = "SELECT * FROM users WHERE id = " + userId;
  return executeQuery(query);
}`,
    eval: `function processUserCode() {
  // Dangerous eval usage with user input
  const userCode = document.getElementById('codeInput').value;
  eval(userCode);
}`,
    noIssues: `function safeFunction(input) {
  // Properly escaped function
  const sanitizedInput = escapeHtml(input);
  document.getElementById('output').textContent = sanitizedInput;
}`,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setRawResponse("");
    
    if (!code.trim()) {
      setError("Please enter some code to analyze");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      // Get the raw text first for debugging
      const rawText = await res.text();
      setRawResponse(rawText);
      
      // Parse the JSON (again, since we already consumed the response body)
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (err) {
        throw new Error(`Invalid JSON response: ${err.message}`);
      }

      // Check if issues exist and properly handle them
      if (data.issues && Array.isArray(data.issues)) {
        setResults(data.issues);

        // Prepare the report content
        if (data.issues.length > 0) {
          const formatted = data.issues
            .map(
              (issue, i) =>
                `#${i + 1}\nLine: ${issue.line}\nSnippet: ${issue.snippet}\nIssue: ${issue.message}\n`
            )
            .join("\n");
          setReportContent(formatted);
        } else {
          setReportContent("No security issues found!");
        }
      } else {
        console.error("Invalid response format:", data);
        setError("Invalid response format from server");
        setResults([]);
        setReportContent("");
      }
    } catch (error) {
      console.error("Error during analysis:", error);
      setError(`Error analyzing the code: ${error.message}`);
      setReportContent("");
    } finally {
      setIsLoading(false);
    }
  };

  const exportReportAsText = () => {
    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "security_report.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportReportAsJSON = () => {
    const json = JSON.stringify(results, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "security_report.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadSampleCode = (type) => {
    setCode(vulnerableCodeSamples[type] || "");
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">JavaScript Security Analyzer</h1>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Test with sample code:</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => loadSampleCode("xss")}
            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
          >
            XSS Example
          </button>
          <button
            onClick={() => loadSampleCode("sqlInjection")}
            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
          >
            SQL Injection Example
          </button>
          <button
            onClick={() => loadSampleCode("eval")}
            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
          >
            Eval Example
          </button>
          <button
            onClick={() => loadSampleCode("noIssues")}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            Safe Code Example
          </button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="codeInput" className="block text-sm font-medium text-gray-700 mb-1">
            Code to Analyze:
          </label>
          <textarea
            id="codeInput"
            className="w-full h-40 p-4 border border-gray-300 rounded font-mono text-sm"
            placeholder="Paste your JavaScript code here..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
        
        <div className="flex items-center">
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
            disabled={isLoading}
          >
            {isLoading ? "Analyzing..." : "Analyze Code"}
          </button>
          
          <label className="ml-4 flex items-center">
            <input
              type="checkbox" 
              checked={debugMode}
              onChange={() => setDebugMode(!debugMode)}
              className="mr-2"
            />
            <span>Debug Mode</span>
          </label>
        </div>
      </form>

      {/* Error message display */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Results display */}
      {results.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Security Issues Found: {results.length}</h2>
          <table className="w-full table-auto border">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left border">#</th>
                <th className="px-4 py-2 text-left border">Line</th>
                <th className="px-4 py-2 text-left border">Snippet</th>
                <th className="px-4 py-2 text-left border">Issue</th>
              </tr>
            </thead>
            <tbody>
              {results.map((issue, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{idx + 1}</td>
                  <td className="border px-4 py-2">{issue.line}</td>
                  <td className="border px-4 py-2 font-mono text-sm">{issue.snippet}</td>
                  <td className="border px-4 py-2">{issue.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="mt-4 flex gap-2">
            <button
              onClick={exportReportAsText}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Export as TXT
            </button>
            <button
              onClick={exportReportAsJSON}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Export as JSON
            </button>
          </div>
        </div>
      )}

      {/* No issues display */}
      {results.length === 0 && reportContent === "No security issues found!" && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          <strong>Success:</strong> No security issues found!
        </div>
      )}
      
      {/* Debug section */}
      {debugMode && (
        <div className="mt-6 p-4 border border-gray-300 rounded bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">Debug Information</h3>
          
          <div className="mb-4">
            <h4 className="font-medium mb-1">Raw API Response:</h4>
            <pre className="bg-gray-800 text-green-400 p-3 rounded overflow-x-auto text-xs">
              {rawResponse || "No response yet"}
            </pre>
          </div>
          
          <div>
            <h4 className="font-medium mb-1">Parsed Results:</h4>
            <pre className="bg-gray-800 text-green-400 p-3 rounded overflow-x-auto text-xs">
              {JSON.stringify(results, null, 2) || "No results yet"}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}