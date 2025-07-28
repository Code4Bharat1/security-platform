'use client'
import { useState } from "react";
import { Search, Loader2, LockIcon } from 'lucide-react';
import axios from "axios";
const SharePointScanner = () => {
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
      setError("Please enter a valid SharePoint URL.");
      return;
    }

    setError("");
    setLoading(true); // Show loading indicator
    setScanData(null); // Clear previous results

    try {      
      const response = await fetch("https://zypher-api.code4bharat.com/api/sharepoint/sharepoint-scanner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const result = await response.json();

      if (result.error) {
        setError("Failed to scan SharePoint site.");
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
      <img src="sharepoint.png" alt="sharepoint security" className="w-45 h-20 mb-4 mt-7" />
      <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mt-3">Secure Your SharePoint</h1>
      <p className="text-lg text-slate-600 max-w-2xl mx-auto text-center mt-3">
        Our SharePoint security scanner identifies configuration issues, permission problems, and security vulnerabilities before they can be exploited.
      </p>
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl mt-10">
        <h1 className="text-2xl font-bold text-center mb-5 mt-4 text-green-800">
          SharePoint Security Scanner
        </h1>
        <form onSubmit={handleSubmit}>
          <input
            type="url"
            id="sharePointUrl"
            name="sharePointUrl"
            value={url}
            onChange={(e) => setUrl(e.target.value.trim())}           placeholder="https://company.sharepoint.com/sites/teamsite"
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
              <LockIcon className="h-5 w-5" />
            )}
            {loading ? "Scanning..." : "Scan SharePoint Site"}
          </button>
        </form>

        {/* Results area - contains either loading indicator or scan data */}
        <div className="mt-6">
          {loading && (
            <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-purple-800 border-opacity-50 mb-3"></div>
              <p className="text-green-800 font-medium">Scanning SharePoint site...</p>
            </div>
          )}

          {!loading && scanData && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h2 className="text-xl font-bold text-purple-800 mb-2">SharePoint Security Report</h2>
              <ul>
                <li className="mb-2">
                  <strong>SharePoint Version: </strong>
                  <span>
                    {scanData.version} {scanData.versionSupported ? "(Supported)" : "(End of Support)"}
                  </span>
                </li>
                <li className="mb-2">
                  <strong>Authentication: </strong>
                  <span className={scanData.authenticationSecure ? "text-green-600" : "text-red-600"}>
                    {scanData.authenticationType} {scanData.authenticationSecure ? "(Secure)" : "(Vulnerable)"}
                  </span>
                </li>
                <li className="mb-2">
                  <strong>External Sharing: </strong>
                  <span className={
                    scanData.externalSharing === "Disabled" ? "text-green-600" : 
                    scanData.externalSharing === "Limited" ? "text-yellow-600" : 
                    "text-red-600"
                  }>
                    {scanData.externalSharing}
                  </span>
                </li>
                <li className="mb-2">
                  <strong>Permission Issues: </strong>
                  <span className={scanData.permissionIssues === 0 ? "text-green-600" : "text-red-600"}>
                    {scanData.permissionIssues}
                  </span>
                </li>
                <li className="mb-2">
                  <strong>Security Patches: </strong>
                  <span className={scanData.securityPatches === "Up to date" ? "text-green-600" : "text-red-600"}>
                    {scanData.securityPatches}
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
                {scanData.vulnerabilities && scanData.vulnerabilities.length > 0 && (
                  <li className="mt-4">
                    <strong>Detected Vulnerabilities:</strong>
                    <ul className="ml-4 mt-2">
                      {scanData.vulnerabilities.map((issue, index) => (
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

export default SharePointScanner;

