"use client";
import { useState } from "react";
import axios from "axios";
import { Loader2, LockIcon } from "lucide-react";

const SharePointScanner = () => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [scanData, setScanData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fallback for API base URL if env var is undefined
  const baseURL =
    process.env.NEXT_PUBLIC_PROD_API_URL || "http://localhost:4180/api";

  const validateUrl = (url) => {
    const pattern = new RegExp(
      "^(https?:\\/\\/)?(([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}(:\\d+)?(\\/.*)?$",
      "i"
    );
    return !!pattern.test(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateUrl(url)) {
      setError("Please enter a valid SharePoint URL.");
      return;
    }

    setError("");
    setLoading(true);
    setScanData(null);

    try {
      const response = await axios.post(
        `${baseURL}/sharepoint/sharepoint-scanner`,
        { url }
      );

      const result = response.data;

      if (result?.error) {
        setError(result.error || "Failed to scan SharePoint site.");
      } else {
        setScanData(result);
      }
    } catch (err) {
      console.error("Axios error:", err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 px-4 py-8">
      <img
        src="/tools/card-images/sharepoint.png"
        alt="SharePoint Security"
        className="w-48 h-20 mb-4"
      />
      <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mt-3">
        Secure Your SharePoint
      </h1>
      <p className="text-lg text-slate-600 max-w-2xl text-center mt-3">
        Our SharePoint security scanner identifies configuration issues,
        permission problems, and vulnerabilities before they can be exploited.
      </p>

      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl mt-10">
        <h2 className="text-2xl font-bold text-center text-green-800 mb-6">
          SharePoint Security Scanner
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="url"
            placeholder="https://company.sharepoint.com/sites/teamsite"
            value={url}
            onChange={(e) => setUrl(e.target.value.trim())}
            required
            className="w-full border border-gray-300 rounded-lg p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-green-800"
          />
          {error && (
            <p className="text-red-600 text-sm mb-4 font-medium">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-green-800 text-white py-2 px-4 rounded hover:bg-green-700 flex items-center justify-center gap-2 transition-colors duration-300"
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

        {/* Error or Info Message */}
{error && (
  <div className="mt-4 bg-red-100 border border-red-300 text-red-800 text-sm font-medium px-4 py-3 rounded-lg">
    🚫 {error}
  </div>
)}

{!error && scanData && (
  <div className="mt-4 bg-green-100 border border-green-300 text-green-800 text-sm font-medium px-4 py-3 rounded-lg">
    ✅ SharePoint scan completed successfully.
  </div>
)}


        {loading && (
          <div className="mt-6 flex flex-col items-center p-6 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-purple-800 border-opacity-50 mb-3"></div>
            <p className="text-green-800 font-medium">
              Scanning SharePoint site...
            </p>
          </div>
        )}

        {!loading && scanData && (
          <div className="mt-6 border rounded-lg p-4 bg-gray-50">
            <h2 className="text-xl font-bold text-purple-800 mb-2">
              SharePoint Security Report
            </h2>
            <ul className="space-y-2">
              <li>
                <strong>Version:</strong> {scanData.version}{" "}
                {scanData.versionSupported ? (
                  <span className="text-green-600">(Supported)</span>
                ) : (
                  <span className="text-red-600">(Outdated)</span>
                )}
              </li>
              <li>
                <strong>Authentication:</strong>{" "}
                <span
                  className={
                    scanData.authenticationSecure
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {scanData.authenticationType}{" "}
                  {scanData.authenticationSecure ? "(Secure)" : "(Vulnerable)"}
                </span>
              </li>
              <li>
                <strong>External Sharing:</strong>{" "}
                <span
                  className={
                    scanData.externalSharing === "Disabled"
                      ? "text-green-600"
                      : scanData.externalSharing === "Limited"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }
                >
                  {scanData.externalSharing}
                </span>
              </li>
              <li>
                <strong>Permission Issues:</strong>{" "}
                <span
                  className={
                    scanData.permissionIssues === 0
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {scanData.permissionIssues}
                </span>
              </li>
              <li>
                <strong>Security Patches:</strong>{" "}
                <span
                  className={
                    scanData.securityPatches === "Up to date"
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {scanData.securityPatches}
                </span>
              </li>
              <li>
                <strong>Security Score:</strong>{" "}
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

              {scanData.vulnerabilities &&
                scanData.vulnerabilities.length > 0 && (
                  <li className="mt-4">
                    <strong>Detected Vulnerabilities:</strong>
                    <ul className="ml-4 mt-2 list-disc text-red-600">
                      {scanData.vulnerabilities.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </li>
                )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharePointScanner;
