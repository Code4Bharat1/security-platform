"use client";

import { useState } from "react";
import {
  Search,
  ShieldIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from "lucide-react";

export default function MetaForm() {
  const [url, setUrl] = useState("");
  const [metaTags, setMetaTags] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    try {
      const res = await fetch("http://localhost:4180/api/meta/meta-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      setMetaTags(data.meta || []);
    } catch (error) {
      setMetaTags([]);
      console.error("Error fetching meta tags:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-white p-4 rounded-full shadow-lg">
              <img src="verify.png" alt="verify" className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-4xl md:text-4xl font-bold text-slate-800 mb-4">
            Protect Your Website
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Our advanced security scanner identifies vulnerabilities before
            attackers can exploit them.
          </p>
        </div>

        {/* Main Analyzer Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-green-800 to-emerald-700 p-8 text-white">
            <div className="flex items-center justify-center gap-3 mb-2">
              <ShieldIcon className="h-8 w-8" />
              <h2 className="text-3xl font-bold">Meta Tag Analyzer</h2>
            </div>
            <p className="text-green-100 text-center">
              Analyze your website's security meta tags and headers
            </p>
          </div>

          {/* Form Section */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="mb-8">
              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder="Enter website URL (e.g., https://example.com)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl p-4 text-lg focus:outline-none focus:ring-4 focus:ring-green-200 focus:border-green-600 transition-all duration-300 pl-4 pr-12"
                />
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
              </div>

              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="w-full bg-gradient-to-r from-green-800 to-emerald-700 text-white py-4 px-8 rounded-xl hover:from-green-700 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-300 flex items-center justify-center gap-3 text-lg font-semibold shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="h-6 w-6" />
                    Start Security Analysis
                  </>
                )}
              </button>
            </form>

            {/* Results Section */}
            {(loading || metaTags.length > 0) && (
              <div className="border-t-2 border-gray-100 pt-8">
                <MetaReport meta={metaTags} loading={loading} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaReport({ meta, loading }) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-pulse">
          <div className="bg-green-100 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
            <ShieldIcon className="h-12 w-12 text-green-600" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-700 mb-2">
            Analyzing Security Headers...
          </h3>
          <p className="text-gray-500">
            Please wait while we scan your website for security meta tags
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-green-100 p-3 rounded-full">
          <ShieldIcon className="h-6 w-6 text-green-700" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800">
          Security Meta Tag Report
        </h3>
      </div>

      {meta.length === 0 ? (
        <div className="bg-amber-50 border-l-4 border-amber-400  rounded-r-lg">
          <div className="flex items-center gap-3">
            <AlertCircleIcon className="h-6 w-6 text-amber-600" />
            <div>
              <h4 className="text-lg font-semibold text-amber-800">
                No Meta Tags Found
              </h4>
              <p className="text-amber-700">
                The URL may be unreachable or contains no security meta tags.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg mb-6">
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
              <div>
                <h4 className="text-lg font-semibold text-green-800">
                  Analysis Complete
                </h4>
                <p className="text-green-700">
                  Found {meta.length} security-related meta tag
                  {meta.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {meta.map((tag, i) => (
              <div
                key={i}
                className="bg-gray-50 border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-full flex-shrink-0">
                    <ShieldIcon className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-gray-800 text-lg mb-2">
                      {tag.name}
                    </h5>
                    <p className="text-gray-600 leading-relaxed break-all">
                      {tag.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
