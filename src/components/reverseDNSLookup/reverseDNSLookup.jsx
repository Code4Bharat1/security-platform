'use client';

import { useState, useEffect } from 'react';
import { Search, CheckCircle, AlertCircle, Loader2, Globe, Network } from 'lucide-react';

function isValidIP(ip) {
  const ipv4Pattern = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
  const ipv6Pattern = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(([0-9a-fA-F]{1,4}:){1,7}:)|(([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4})|(([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2})|(([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3})|(([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4})|(([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5})|(([0-9a-fA-F]{1,4}:){1}(:[0-9a-fA-F]{1,4}){1,6})|(:((:[0-9a-fA-F]{1,4}){1,7}|:)))$/;
  return ipv4Pattern.test(ip) || ipv6Pattern.test(ip);
}

// Toast Component
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const Icon = type === 'success' ? CheckCircle : AlertCircle;

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 transform transition-all duration-300 animate-pulse z-50`}>
      <Icon size={20} />
      <span className="font-medium">{message}</span>
      <button 
        onClick={onClose}
        className="ml-2 text-white hover:text-gray-200 font-bold text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}

export default function ReverseDNSLookup() {
  const [ip, setIp] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!ip) {
      setIsValid(false);
      setValidationMessage('');
      return;
    }
    if (isValidIP(ip)) {
      setIsValid(true);
      setValidationMessage('');
    } else {
      setIsValid(false);
      setValidationMessage('Please enter a valid IPv4 or IPv6 address.');
    }
  }, [ip]);

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  const handleLookup = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('https://zypher.code4bharat.com//api/reverse/reverse-dns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip }),
      });

      const data = await res.json();

      if (res.ok) {
        const uniqueDomains = Array.from(new Set(data.domains));
        setResult({ success: true, domains: uniqueDomains });
        showToast(`Found ${uniqueDomains.length} unique domain${uniqueDomains.length !== 1 ? 's' : ''}!`, 'success');
      } else {
        setResult({ success: false, error: data.error || 'Unknown error occurred' });
        showToast('Lookup failed: ' + (data.error || 'Unknown error'), 'error');
      }
    } catch {
      const errorMsg = 'Request failed. Please check the server.';
      setResult({ success: false, error: errorMsg });
      showToast('Connection error: Server unreachable', 'error');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
      
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-4 shadow-lg">
            <Network className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent mb-2">
            Reverse DNS Lookup
          </h1>
          <p className="text-gray-600 text-lg">
            Discover domains associated with IP addresses
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100 p-8 mb-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                IP Address
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g., 8.8.8.8 or 2001:4860:4860::8888"
                  value={ip}
                  onChange={(e) => setIp(e.target.value.trim())}
                  className={`w-full px-4 py-3 pl-12 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 ${
                    validationMessage 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                      : isValid 
                        ? 'border-green-300 focus:border-green-500 focus:ring-green-100'
                        : 'border-gray-200 focus:border-green-400 focus:ring-green-50'
                  } text-gray-700 font-mono`}
                />
                <Globe className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  validationMessage ? 'text-red-400' : isValid ? 'text-green-500' : 'text-gray-400'
                }`} />
                {isValid && (
                  <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {validationMessage && (
                <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {validationMessage}
                </div>
              )}
            </div>

            <button
              onClick={handleLookup}
              disabled={!isValid || loading}
              className={`w-full py-4 px-6 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-3 ${
                isValid && !loading 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5' 
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Looking up...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Perform Lookup
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100 p-8">
            {result.success ? (
              <div className="space-y-6">
                {/* Results Header */}
                <div className="flex items-center gap-3 pb-4 border-b border-green-100">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Lookup Successful</h3>
                    <p className="text-green-600 font-semibold">
                      Found {result.domains.length} unique domain{result.domains.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Domain List */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-green-500" />
                    Associated Domains
                  </h4>
                  <div className="grid gap-3">
                    {result.domains.map((domain, idx) => (
                      <div
                        key={idx}
                        className="group bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-green-300"
                        title="This domain is the PTR record associated with the IP address."
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <code className="font-mono text-gray-800 group-hover:text-green-700 transition-colors">
                            {domain}
                          </code>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info Footer */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 text-sm font-bold">i</span>
                    </div>
                    <div className="text-sm text-green-700">
                      <p className="font-medium mb-1">About PTR Records</p>
                      <p>PTR records map IP addresses to domain names. Multiple PTR records can exist for a single IP address, which is why you might see several domains listed above.</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Lookup Failed</h3>
                  <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
                    {result.error}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}