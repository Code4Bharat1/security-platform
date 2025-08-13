"use client";
import { useState, useEffect } from "react";
import {
  Search,
  Loader2,
  ShieldAlert,
  Server,
  Globe,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  X,
} from "lucide-react";

const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <div
        className={`p-4 rounded-xl shadow-lg border flex items-center gap-3 min-w-80 ${
          type === "success"
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-red-50 border-red-200 text-red-800"
        }`}
      >
        <div className="flex items-center gap-3 flex-1">
          {type === "success" ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600" />
          )}
          <span className="font-medium">{message}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/50 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const PortScannerForm = () => {
  const [host, setHost] = useState("");
  const [portRange, setPortRange] = useState("");
  const [error, setError] = useState("");
  const [scanResults, setScanResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Backend API configuration
  //const API_BASE_URL = "https://localhost:5000/api"; // Change this to your backend URL
  // For development, you might use: "https://zypher-api.code4bharat.com/api"
  // For production, use your deployed backend URL

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  const validateHost = (host) => {
    const hostnamePattern = new RegExp(
      "^(([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}(:\\d+)?(\\/.*)?$",
      "i"
    );
    const ipPattern = new RegExp(
      "^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$",
      "i"
    );
    return hostnamePattern.test(host) || ipPattern.test(host);
  };

  const validatePortRange = (range) => {
    const singlePortPattern = /^\d{1,5}$/;
    const portRangePattern = /^\d{1,5}-\d{1,5}$/;
    const commonPortsPattern = /^common$/i;

    if (commonPortsPattern.test(range)) {
      return true;
    } else if (singlePortPattern.test(range)) {
      const port = parseInt(range, 10);
      return port > 0 && port <= 65535;
    } else if (portRangePattern.test(range)) {
      const [start, end] = range.split("-").map((p) => parseInt(p, 10));
      return start > 0 && end <= 65535 && start < end;
    }
    return false;
  };

  // API call function
  const performPortScan = async (hostParam, portRangeParam) => {
    try {
      const response = await fetch(
    `${process.env.NEXT_PUBLIC_PROD_API_URL}/port/portScan?host=${hostParam}&port=${portRangeParam}`,
    {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    }
    
    catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {

    if (!validateHost(host)) {
      setError("Please enter a valid hostname or IP address.");
      return;
    }

    if (!validatePortRange(portRange)) {
      setError(
        "Please enter a valid port or port range (e.g., 80 or 80-10000) or 'common'."
      );
      return;
    }

    setError("");
    setLoading(true);
    setScanResults(null);

    try {
      // Call the actual backend API
      const results = await performPortScan(host, portRange);
      
      // Set the results from the backend
      setScanResults(results);

      // Show success toast
      const openPorts = results.summary?.open || 0;
      showToast(
        `✅ Scan completed successfully! Found ${openPorts} open port${
          openPorts !== 1 ? "s" : ""
        } on ${host}`
      );
    } catch (error) {
      console.error("Error:", error);
      setError(`${error.message || "Something went wrong. Please try again."}`);
      showToast("❌ Scan failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case "High":
        return "text-red-600";
      case "Medium":
        return "text-yellow-600";
      case "Low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const getRiskBadgeColor = (risk) => {
    switch (risk) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
      {/* Toast Notification */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center py-12">
          <img src="/port_scan.png" alt="verify" className="w-16 h-20 mb-4 mt-7" />
          <div className="flex justify-center items-center gap-3 mb-6">
            <div className="p-4 bg-green-100 rounded-full">
              <Shield className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Network Security Scanner
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Identify open ports and potential security vulnerabilities on your
            network infrastructure
          </p>
        </div>

        {/* Main Scanner Card */}
        <div className="bg-white shadow-2xl rounded-3xl p-8 border border-green-100 mb-8">
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-3 mb-4">
              <Server className="w-8 h-8 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-800">Port Scanner</h2>
            </div>
            <p className="text-gray-600">
              Enter your target host and port range to begin scanning
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Hostname or IP Address
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                  <input
                    type="text"
                    value={host}
                    onChange={(e) => setHost(e.target.value.trim())}                   placeholder="example.com or 192.168.1.1"
                    required
                    className="w-full pl-12 pr-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-gray-700"
                  />
                </div> {/*/api/port/portScan?host=${hostTarget}&port=${portNumber} */}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Port or Port Range
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                  <input
                    type="text"
                    value={portRange}
                    onChange={(e) => setPortRange(e.target.value.trim())}                   placeholder="80, 80-10000, or 'common'"
                    required
                    className="w-full pl-12 pr-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-gray-700"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Single port (80), range (80-10000), or 'common' for well-known
                  ports
                </p>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-700 font-medium">{error}</span>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Scanning Network...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Search className="w-6 h-6" />
                  Start Port Scan
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white shadow-xl rounded-2xl p-8 border border-green-100">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-green-200 rounded-full animate-spin border-t-green-600"></div>
                <Server className="w-8 h-8 text-green-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-2">
                Scanning Network Ports
              </h3>
              <p className="text-gray-600">
                Analyzing {host} for open ports...
              </p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {!loading && scanResults && (
          <div className="bg-white shadow-2xl rounded-3xl p-8 border border-green-100">
            <div className="flex items-center gap-3 mb-8">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-800">Scan Results</h2>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border border-green-200">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Target Host
                </p>
                <p className="text-lg font-bold text-gray-800 truncate">
                  {scanResults.host}
                </p>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border border-green-200">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Scan Time
                </p>
                <p className="text-lg font-bold text-gray-800">
                  {scanResults.scanTime ? new Date(scanResults.scanTime).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border border-green-200">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Open Ports
                </p>
                <p className="text-lg font-bold text-yellow-600">
                  {scanResults.summary?.open || 0} / {scanResults.summary?.total || 0}
                </p>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border border-green-200">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Risk Level
                </p>
                <span
                  className={`text-lg font-bold ${getRiskColor(
                    scanResults.summary?.riskAssessment || 'Unknown'
                  )}`}
                >
                  {scanResults.summary?.riskAssessment || 'Unknown'}
                </span>
              </div>
            </div>

            {/* Port Details Table */}
            {scanResults.ports && Object.keys(scanResults.ports).length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Server className="w-6 h-6 text-green-600" />
                  Port Details
                </h3>
                <div className="overflow-x-auto bg-gray-50 rounded-xl">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-green-100 to-emerald-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                          Port
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                          Service
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                          Risk Level
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.entries(scanResults.ports).map(
                        ([port, details]) => (
                          <tr
                            key={port}
                            className={`${
                              details.open ? "bg-green-50" : "hover:bg-gray-50"
                            } transition-colors`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                              {port}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                                  details.open
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {details.open ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : (
                                  <XCircle className="w-4 h-4" />
                                )}
                                {details.open ? "Open" : "Closed"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-700">
                              {details.service || 'Unknown'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getRiskBadgeColor(
                                  details.risk || 'Unknown'
                                )}`}
                              >
                                {details.risk || 'Unknown'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {details.description || 'No description available'}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Security Recommendations */}
            {scanResults.recommendations &&
              scanResults.recommendations.length > 0 && (
                <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <ShieldAlert className="w-6 h-6 text-yellow-600" />
                    <h4 className="text-lg font-bold text-yellow-800">
                      Security Recommendations
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {scanResults.recommendations.map(
                      (recommendation, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 bg-white rounded-lg"
                        >
                          <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <p className="text-gray-700">{recommendation}</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Action Button */}
            <div className="text-center">
              <button
                onClick={() => setScanResults(null)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Run New Scan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortScannerForm;