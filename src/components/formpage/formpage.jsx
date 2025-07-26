'use client'
import { useState } from "react";
import { Search, Loader2, SearchIcon } from 'lucide-react';

const FormPage = () => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [sslData, setSslData] = useState(null);
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
    setSslData(null); // Clear previous results

    try {
      const response = await fetch("/api/ssl-checker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const result = await response.json();

      if (result.error) {
        setError("Failed to check SSL certificate.");
        setLoading(false);
        return;
      }

      setSslData(result); // Update state with the fetched SSL data
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setError("Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 mb-5">
      <img src="verify.png" alt="verify" className="w-16 h-20 mb-4 mt-7" />
      <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mt-3">Protect Your Website</h1>
      <p className="text-lg text-slate-600 max-w-2xl mx-auto text-center mt-3">
        Our advanced security scanner identifies vulnerabilities before attackers can exploit them.
      </p>
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl mt-10">
        <h1 className="text-2xl font-bold text-center mb-5 mt-4 text-green-800">
          Website SSL Checker
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
              <SearchIcon className="h-5 w-5" />
            )}
            {loading ? "Scanning..." : "Scan"}
          </button>
        </form>

        {/* Results area - contains either loading indicator or SSL data */}
        <div className="mt-6">
          {loading && (
            <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-green-800 border-opacity-50 mb-3"></div>
              <p className="text-green-800 font-medium">Checking SSL certificate...</p>
            </div>
          )}

          {!loading && sslData && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h2 className="text-xl font-bold text-green-800 mb-2">SSL Report</h2>
              <ul>
                <li className="mb-2">
                  <strong>Status: </strong>
                  <span className={sslData.valid ? "text-green-600" : "text-red-600"}>
                    {sslData.valid ? "Valid" : "Invalid"}
                  </span>
                </li>
                <li className="mb-2">
                  <strong>Issuer: </strong>
                  {sslData.issuer || "Unknown"}
                </li>
                <li className="mb-2">
                  <strong>Valid From: </strong>
                  {sslData.validFrom || "N/A"}
                </li>
                <li className="mb-2">
                  <strong>Valid To: </strong>
                  {sslData.validTo || "N/A"}
                </li>
                <li className="mb-2">
                  <strong>Days Remaining: </strong>
                  <span
                    className={
                      sslData.daysRemaining > 30
                        ? "text-green-600"
                        : sslData.daysRemaining > 0
                        ? "text-yellow-600"
                        : "text-red-600"
                    }
                  >
                    {sslData.daysRemaining || "0"}
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormPage;