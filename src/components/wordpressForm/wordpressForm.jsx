'use client'
import { useState } from "react";
import { Loader2, Shield, ClipboardPaste } from 'lucide-react';

const WordPressScanner = () => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [scanData, setScanData] = useState(null);
  const [loading, setLoading] = useState(false);

  const validateUrl = (url) => {
    const urlPattern = new RegExp("^(https?:\\/\\/)?(([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}(:\\d+)?(\\/.*)?$", "i");
    return !!urlPattern.test(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateUrl(url)) {
      setError("Please enter a valid website URL.");
      return;
    }

    setError("");
    setLoading(true);
    setScanData(null);

    try {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockResult = {
        version: "WordPress 6.3.1",
        theme: { name: "Twenty Twenty-Three" },
        vulnerablePlugins: "2 plugins found",
        outdatedPlugins: "1 plugin needs update",
        securityScore: 85,
        issues: [
          "Outdated WordPress version detected",
          "Admin user with weak password",
          "Directory listing enabled"
        ]
      };

      setScanData(mockResult);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setError("Something went wrong.");
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch {
      alert("Failed to paste from clipboard");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
<div className="flex items-center gap-4 mb-8">
  <img
    src="/RedTeam/wordpress-secure.png"  // <-- apni image ka path yahan daaliye
    alt="Secure Your WordPress Logo"
    className="w-30 h-30 rounded-full border-2 border-red-600 object-cover"
  />
  <div>
    <h1 className="text-2xl font-bold text-white">Secure Your WordPress</h1>
    <p className="text-gray-300 text-sm">
      Scan for vulnerabilities, outdated plugins, and<br />
      security misconfigurations in your WordPress site.
    </p>
  </div>
</div>


        {/* Tool Title */}
        <div className="mb-6">
          <div className="bg-gray-900 border border-white rounded-lg p-10 mb-6 text-center">
            WordPress Security Scanner
         

        {/* Input Section */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value.trim())}
              placeholder="https://example.com"
              required
              className="flex-1 p-4 bg-black border-2 border-white rounded-full text-white placeholder-gray-400 text-center focus:outline-none focus:border-red-600"
            />
              {/* <button
                type="button"
                onClick={handlePaste}
                title="Paste from clipboard"
                className="px-3 py-2 border-2 border-white text-white bg-transparent rounded-full hover:bg-white hover:text-black transition-colors"
              >
                <ClipboardPaste className="w-5 h-5" />
              </button> */}
          </div>

          {error && (
            <p className="text-red-400 text-sm font-semibold text-center">{error}</p>
          )}

          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Shield className="h-5 w-5" />}
              {loading ? "Scanning..." : "Scan WordPress Site"}
            </button>
          </div>
        </div>

        {/* Results Display */}
        {!loading && scanData && (
          <div className="border-2 border-red-600 rounded p-6 bg-black">
            <h2 className="text-xl font-bold text-white mb-4 text-center">Security Report</h2>
            <div className="space-y-3 text-base text-gray-300">
              <div>
                <span className="font-bold text-white">Version:</span> {scanData.version}
              </div>
              <div>
                <span className="font-bold text-white">Theme:</span> {scanData.theme?.name || 'N/A'}
              </div>
              <div>
                <span className="font-bold text-white">Vulnerable Plugins:</span> {scanData.vulnerablePlugins || 'None detected'}
              </div>
              <div>
                <span className="font-bold text-white">Outdated Plugins:</span> {scanData.outdatedPlugins || 'None'}
              </div>
              <div>
                <span className="font-bold text-white">Security Score:</span> 
                <span className="font-semibold text-green-400 ml-1">{scanData.securityScore}/100</span>
              </div>
              <div>
                <span className="font-bold text-white">Issues:</span>
                <ul className="list-disc list-inside ml-4 mt-2">
                  {scanData.issues?.length > 0 ? (
                    scanData.issues.map((issue, index) => (
                      <li key={index} className="text-red-400">{issue}</li>
                    ))
                  ) : (
                    <li className="text-green-400">No major issues found</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="border-2 border-red-600 rounded p-6 bg-black text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-red-600" />
            <p className="text-white">Scanning your WordPress site for security issues...</p>
          </div>
        )}
      </div>
    </div>
     </div>
      </div>
  );
};

export default WordPressScanner;