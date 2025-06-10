'use client'
import { useState } from "react";
import { Search, Loader2, SearchIcon, FileText } from 'lucide-react';

const SitemapForm = () => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [sitemapData, setSitemapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [depth, setDepth] = useState(3); // Default crawl depth

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
    setSitemapData(null); // Clear previous results

    try {
      // Add https:// if not provided
      const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
      
      const response = await fetch("http://localhost:5000/api/sitemap/sitemap-scanner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalizedUrl, depth }),
      });

      const result = await response.json();

      if (result.error) {
        setError(result.message || "Failed to generate sitemap.");
        setLoading(false);
        return;
      }

      setSitemapData(result); // Update state with the fetched sitemap data
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setError("Something went wrong with the request.");
      setLoading(false);
    }
  };
  
  // Function to download sitemap as XML
  const downloadXML = () => {
    if (!sitemapData || !sitemapData.xml) return;
    
    const blob = new Blob([sitemapData.xml], { type: 'application/xml' });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    // Extract hostname from the input URL for the filename
    let hostname = 'website';
    try {
      // Make sure we have a valid URL for parsing
      const inputUrl = url.startsWith('http') ? url : `https://${url}`;
      hostname = new URL(inputUrl).hostname;
    } catch (error) {
      console.error('Error parsing URL:', error);
      // Keep default hostname if there's an error
    }
    
    a.href = downloadUrl;
    a.download = `sitemap-${hostname}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  };
  
  // Function to download sitemap as TXT
  const downloadTXT = () => {
    if (!sitemapData || !sitemapData.urls) return;
    
    const content = sitemapData.urls.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    // Extract hostname from the input URL for the filename
    let hostname = 'website';
    try {
      // Make sure we have a valid URL for parsing
      const inputUrl = url.startsWith('http') ? url : `https://${url}`;
      hostname = new URL(inputUrl).hostname;
    } catch (error) {
      console.error('Error parsing URL:', error);
      // Keep default hostname if there's an error
    }
    
    a.href = downloadUrl;
    a.download = `sitemap-${hostname}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 mb-5">
      <img src="sitemap1.png" alt="sitemap" className="w-35 h-35 mb-4 mt-7" />
      <h1 className="text-3xl md:text-4xl font-bold text-blue-800 mt-3">Optimize Your Website</h1>
      <p className="text-lg text-slate-600 max-w-2xl mx-auto text-center mt-3">
        Our sitemap generator helps search engines find and index all pages on your website.
      </p>
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl mt-10">
        <h1 className="text-2xl font-bold text-center mb-5 mt-4 text-blue-800">
          Website Sitemap Generator
        </h1>
        <form onSubmit={handleSubmit}>
          <input
            type="url"
            id="websiteUrl"
            name="websiteUrl"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            required
            className="w-full border border-gray-300 rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-blue-800"
          />
          
          <div className="mb-4">
            <label htmlFor="depth" className="block text-sm font-medium text-gray-700 mb-1">
              Crawl Depth (1-5):
            </label>
            <input
              type="number"
              id="depth"
              name="depth"
              min="1"
              max="5"
              value={depth}
              onChange={(e) => setDepth(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-blue-800"
            />
          </div>
          
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-800 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <SearchIcon className="h-5 w-5" />
            )}
            {loading ? "Generating..." : "Generate Sitemap"}
          </button>
        </form>

        {/* Results area - contains either loading indicator or sitemap data */}
        <div className="mt-6">
          {loading && (
            <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-800 border-opacity-50 mb-3"></div>
              <p className="text-blue-800 font-medium">Generating sitemap, please wait...</p>
            </div>
          )}

          {!loading && sitemapData && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h2 className="text-xl font-bold text-blue-800 mb-2">Sitemap Report</h2>
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="bg-blue-50 p-3 rounded border border-blue-200 flex-1 min-w-32">
                  <div className="text-sm text-blue-600">Pages Found</div>
                  <div className="text-2xl font-bold text-blue-800">{sitemapData.pagesFound || 0}</div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded border border-blue-200 flex-1 min-w-32">
                  <div className="text-sm text-blue-600">Crawl Depth</div>
                  <div className="text-2xl font-bold text-blue-800">{depth}</div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">URL List:</h3>
                  <span className="text-sm text-gray-500">{sitemapData.pagesFound || 0} pages</span>
                </div>
                <div className="max-h-64 overflow-y-auto bg-white p-3 border border-gray-200 rounded">
                  {sitemapData.urls && sitemapData.urls.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {sitemapData.urls.map((url, index) => (
                        <li key={index} className="text-sm truncate hover:text-clip">
                          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">No URLs found</p>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button 
                  onClick={downloadXML}
                  className="flex-1 bg-blue-800 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  <FileText className="h-5 w-5" />
                  Download XML
                </button>
                <button 
                  onClick={downloadTXT}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  <FileText className="h-5 w-5" />
                  Download TXT
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SitemapForm;