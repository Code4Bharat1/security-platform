'use client'
import { useState } from "react";
import { Search, Loader2, SearchIcon, Shield } from 'lucide-react';

const WordPressScanner = () => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [scanData, setScanData] = useState(null);
  const [loading, setLoading] = useState(false);

  const validateUrl = (url) => {
    const urlPattern = new RegExp(
      "^(https?:\\/\\/)?(([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}(:\\d+)?(\\/.*)?$",
      "i"
    );
    return !!urlPattern.test(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateUrl(url)) {
      setError("Please enter a valid website URL.");
      return;
    }

    setError("");
    setLoading(true); // Show loading indicator
    setScanData(null); // Clear previous results

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_PROD_API_URL}/wordpress/wordpress-scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const result = await response.json();

      if (result.error) {
        setError("Failed to scan WordPress site.");
        setLoading(false);
        return;
      }

      setScanData(result); // Update state with the fetched scan data
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setError("Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 mb-5">
      <img src="wordpress-secure.png" alt="wordpress security" className="w-16 h-20 mb-4 mt-7" />
      <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mt-3">Secure Your WordPress</h1>
      <p className="text-lg text-slate-600 max-w-2xl mx-auto text-center mt-3">
        Our WordPress security scanner identifies vulnerabilities, outdated plugins, and security issues before attackers can exploit them.
      </p>
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl mt-10">
        <h1 className="text-2xl font-bold text-center mb-5 mt-4 text-green-800">
          WordPress Security Scanner
        </h1>
        <form onSubmit={handleSubmit}>
          <input
            type="url"
            id="websiteUrl"
            name="websiteUrl"
            value={url}
            onChange={(e) => setUrl(e.target.value.trim())}           placeholder="https://example.com"
            required
            className="w-full border border-gray-300 rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-green-800"
          />
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-green-800 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors duration-300 flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Shield className="h-5 w-5" />
            )}
            {loading ? "Scanning..." : "Scan WordPress Site"}
          </button>
        </form>

        {/* Results area - contains either loading indicator or scan data */}
        <div className="mt-6">
          {loading && (
            <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-800 border-opacity-50 mb-3"></div>
              <p className="text-blue-800 font-medium">Scanning WordPress site...</p>
            </div>
          )}

          {!loading && scanData && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h2 className="text-xl font-bold text-blue-800 mb-2">WordPress Security Report</h2>
              <ul>
                <li className="mb-2">
                  <strong>WordPress Version: </strong>
                  <span className={scanData.versionSecure ? "text-green-600" : "text-red-600"}>
                    {scanData.version} {scanData.versionSecure ? "(Up to date)" : "(Outdated)"}
                  </span>
                </li>
                <li className="mb-2">
                  <strong>Theme: </strong>
                  {scanData.theme.name} {scanData.theme.version} 
                  <span className={scanData.theme.secure ? " text-green-600" : " text-red-600"}>
                    {scanData.theme.secure ? " (Secure)" : " (Vulnerable)"}
                  </span>
                </li>
                <li className="mb-2">
                  <strong>Vulnerable Plugins: </strong>
                  <span className={scanData.vulnerablePlugins === 0 ? "text-green-600" : "text-red-600"}>
                    {scanData.vulnerablePlugins || 0}
                  </span>
                </li>
                <li className="mb-2">
                  <strong>Outdated Plugins: </strong>
                  <span className={scanData.outdatedPlugins === 0 ? "text-green-600" : "text-yellow-600"}>
                    {scanData.outdatedPlugins || 0}
                  </span>
                </li>
                <li className="mb-2">
                  <strong>Security Score: </strong>
                  <span
                    className={
                      scanData.securityScore > 80
                        ? "text-green-600"
                        : scanData.securityScore > 50
                        ? "text-yellow-600"
                        : "text-red-600"
                    }
                  >
                    {scanData.securityScore}/100
                  </span>
                </li>
                {scanData.issues && scanData.issues.length > 0 && (
                  <li className="mt-4">
                    <strong>Detected Issues:</strong>
                    <ul className="ml-4 mt-2">
                      {scanData.issues.map((issue, index) => (
                        <li key={index} className="text-red-600 mb-1">
                          • {issue}
                        </li>
                      ))}
                    </ul>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WordPressScanner;

