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
      const response = await fetch(`${process.env.NEXT_PUBLIC_PROD_API_URL}/wordpress/wordpress-scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const result = await response.json();

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      setScanData(result);
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
    <div className="flex flex-col items-center min-h-screen bg-gray-100 py-12 px-4">
      <img src="wordpress-secure.png" alt="wordpress security" className="w-16 h-20 mb-4" />

      <h1 className="text-3xl md:text-4xl font-bold text-slate-800 text-center">Secure Your WordPress</h1>
      <p className="text-lg text-slate-600 max-w-2xl mx-auto text-center mt-3">
        Scan for vulnerabilities, outdated plugins, and security misconfigurations in your WordPress site.
      </p>

      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-4xl mt-10">
        <h2 className="text-2xl font-bold text-center mb-6 text-green-800">
          WordPress Security Scanner
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="flex gap-2 mb-4">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value.trim())}
              placeholder="https://example.com"
              required
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-800"
            />
            <button
              type="button"
              onClick={handlePaste}
              title="Paste from clipboard"
              className="bg-gray-200 rounded px-2 hover:bg-gray-300"
            >
              <ClipboardPaste className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <p className="text-red-600 text-sm font-semibold mb-4 text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-green-800 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors duration-300 flex items-center justify-center gap-2 text-lg"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Shield className="h-5 w-5" />}
            {loading ? "Scanning..." : "Scan WordPress Site"}
          </button>
        </form>

        {/* ✅ Result Display */}
        <div className="mt-8">
          {!loading && scanData && (
            <div className="border border-green-300 rounded-lg p-6 bg-green-50">
              <h2 className="text-xl font-bold text-green-900 mb-4 text-center">Security Report</h2>
              <ul className="space-y-3 text-base text-slate-800">
                <li><strong>Version:</strong> {scanData.version}</li>
                <li><strong>Theme:</strong> {scanData.theme?.name || 'N/A'}</li>
                <li><strong>Vulnerable Plugins:</strong> {scanData.vulnerablePlugins || 'None detected'}</li>
                <li><strong>Outdated Plugins:</strong> {scanData.outdatedPlugins || 'None'}</li>
                <li><strong>Security Score:</strong> <span className="font-semibold text-green-700">{scanData.securityScore}/100</span></li>
                <li>
                  <strong>Issues:</strong>
                  <ul className="list-disc list-inside ml-4 text-red-700">
                    {scanData.issues?.length > 0 ? (
                      scanData.issues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))
                    ) : (
                      <li className="text-green-700">No major issues found</li>
                    )}
                  </ul>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WordPressScanner;
