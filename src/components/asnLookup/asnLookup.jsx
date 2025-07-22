import { useState } from "react";
import {
  Search,
  CheckCircle,
  AlertCircle,
  Globe,
  Building,
  MapPin,
  FileText,
  Database,
} from "lucide-react";

// Toast Component
function Toast({ message, type, onClose }) {
  const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";
  const icon =
    type === "success" ? (
      <CheckCircle className="w-5 h-5" />
    ) : (
      <AlertCircle className="w-5 h-5" />
    );

  return (
    <div
      className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-in slide-in-from-top-2`}
    >
      {icon}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70">
        ×
      </button>
    </div>
  );
}

// ASN Lookup Component
export default function ASNLookupFullPage() {
  const [ip, setIp] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!ip.trim()) {
      setError("Please enter an IP address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:4180/api/asnLookup/lookupasn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Unknown error");
        showToast("Failed to lookup ASN information", "error");
      } else {
        setResult(data.asnInfo);
        showToast("ASN information retrieved successfully!", "success");
      }
    } catch (err) {
      setError("Failed to fetch ASN data.");
      showToast("Network error occurred", "error");
    }

    setLoading(false);
  }

  const clearForm = () => {
    setIp("");
    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Globe className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              ASN Lookup
            </h1>
            <p className="text-gray-600">
              Discover network information for any IP address
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-green-100 overflow-hidden">
            {/* Form Section */}
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <label
                    htmlFor="ip-input"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    IP Address
                  </label>
                  <div className="relative">
                    <input
                      id="ip-input"
                      type="text"
                      value={ip}
                      onChange={(e) => setIp(e.target.value.trim)}                      placeholder="Enter IPv4 or IPv6 address (e.g., 8.8.8.8)"
                      className="w-full pl-12 pr-4 py-3 border-2 border-green-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 text-gray-700 placeholder-gray-400"
                    />
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Looking up...
                      </div>
                    ) : (
                      "Lookup ASN"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={clearForm}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                  >
                    Clear
                  </button>
                </div>
              </form>
            </div>

            {/* Results Section */}
            {result && (
              <div className="border-t border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-8">
                <div className="flex items-center gap-2 mb-6">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h3 className="text-xl font-semibold text-gray-800">
                    ASN Information
                  </h3>
                </div>

                <div className="grid gap-4">
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-green-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Database className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">ASN Number</p>
                        <p className="text-lg font-semibold text-gray-800">
                          {result.asn}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-green-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Building className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Organization</p>
                        <p className="text-lg font-semibold text-gray-800">
                          {result.name}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-green-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Country</p>
                        <p className="text-lg font-semibold text-gray-800">
                          {result.country_code}
                        </p>
                      </div>
                    </div>
                  </div>

                  {result.description && (
                    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-green-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">Description</p>
                          <p className="text-lg font-semibold text-gray-800">
                            {result.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-green-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Globe className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Registry</p>
                        <p className="text-lg font-semibold text-gray-800">
                          {result.registry}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-gray-500 text-sm">
            <p>Enter any IPv4 or IPv6 address to retrieve ASN information</p>
          </div>
        </div>
      </div>
    </div>
  );
}
