"use client";
import { useState } from "react";
import { Code, Send, Loader2 } from "lucide-react";

export default function CodeForm() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const downloadResult = () => {
  const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'analysis-result.json';
  a.click();
  URL.revokeObjectURL(url);
};

  const handleSubmit = async () => {
    // Reset previous states
    setResult(null);
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/analyzeCode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }), // Send user code
      });

      if (response.ok) {
        const result = await response.json();
        setResult(result);
      } else {
        const errorText = await response.text();
        setError(`Error: ${response.status} - ${errorText}`);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-5">
      <div className="flex items-center mb-4">
        <Code className="mr-2 text-blue-600" size={24} />
        <h2 className="text-xl font-semibold text-gray-800">Code Analyzer</h2>
      </div>
      
      <div className="mb-4">
        <textarea
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 resize-y"
          placeholder="Paste your code here (JavaScript, TypeScript, Python, etc.)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={10}
          aria-label="Code input"
        />
      </div>
      
      <button 
        onClick={handleSubmit} 
        disabled={!code.trim() || isLoading}
        className="w-full flex items-center justify-center py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 animate-spin" size={20} />
            Analyzing...
          </>
        ) : (
          <>
            <Send className="mr-2" size={20} />
            Analyze Code
          </>
        )}
      </button>

      {/* Error Handling */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Result Display */}
      {result && (
  <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
    <h3 className="text-lg font-semibold mb-2 text-gray-800">Analysis Result:</h3>

    {/* Summary Stats */}
    <ul className="text-sm text-gray-700 mb-3">
      <li><strong>Message:</strong> {result.message}</li>
      <li><strong>Total Lines of Code:</strong> {result.lines}</li>
     <li><strong>Total File Length:</strong> {result.length} characters</li>
      {result.coverage && (
        <>
          <li><strong>Line Coverage:</strong> {result.coverage.lines}</li>
          <li><strong>Function Coverage:</strong> {result.coverage.functions}</li>
          <li><strong>Statement Coverage:</strong> {result.coverage.statements}</li>
          <li><strong>Branch Coverage:</strong> {result.coverage.branches}</li>
        </>
      )}
    </ul>

    {/* Raw JSON View */}
    <pre className="bg-white p-3 rounded-md overflow-x-auto text-sm text-gray-700 border border-gray-200">
      {JSON.stringify(result, null, 2)}
    </pre>

    {/* Download Button */}
    <button
      onClick={downloadResult}
      className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300"
    >
      Download Result
    </button>
  </div>
)}


    </div>
  );
}