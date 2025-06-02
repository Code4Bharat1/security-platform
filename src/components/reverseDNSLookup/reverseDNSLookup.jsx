'use client';

import { useState, useEffect } from 'react';

function isValidIP(ip) {
  // Simple IPv4 regex
  const ipv4Pattern = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
  // Simple IPv6 regex (doesn't cover all cases but works for most)
  const ipv6Pattern = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(([0-9a-fA-F]{1,4}:){1,7}:)|(([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4})|(([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2})|(([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3})|(([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4})|(([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5})|(([0-9a-fA-F]{1,4}:){1}(:[0-9a-fA-F]{1,4}){1,6})|(:((:[0-9a-fA-F]{1,4}){1,7}|:)))$/;


  return ipv4Pattern.test(ip) || ipv6Pattern.test(ip);
}

export default function ReverseDNSLookup() {
  const [ip, setIp] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

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

  const handleLookup = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/reverse-dns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip }),
      });

      const data = await res.json();

      if (res.ok) {
        const uniqueDomains = Array.from(new Set(data.domains));
        setResult({ success: true, domains: uniqueDomains });
      } else {
        setResult({ success: false, error: data.error || 'Unknown error occurred' });
      }
    } catch {
      setResult({ success: false, error: 'Request failed' });
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-md shadow-md font-sans">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Reverse DNS Lookup</h2>
      <input
        type="text"
        placeholder="Enter IPv4 or IPv6 address"
        value={ip}
        onChange={(e) => setIp(e.target.value.trim())}
        className={`w-full px-4 py-2 mb-2 border rounded-md focus:outline-none focus:ring-2 ${
          validationMessage ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
        }`}
      />
      {validationMessage && <p className="text-red-600 mb-2">{validationMessage}</p>}

      <button
        onClick={handleLookup}
        disabled={!isValid || loading}
        className={`w-full py-2 font-semibold text-white rounded-md ${
          isValid && !loading ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        {loading ? 'Looking up...' : 'Lookup'}
      </button>

      {result && (
        <div className="mt-6">
          {result.success ? (
            <>
              <p className="mb-2 font-semibold text-gray-700">
                Unique domains found: <span className="text-blue-600">{result.domains.length}</span>
              </p>
              <ul className="list-disc list-inside space-y-1">
                {result.domains.map((domain, idx) => (
                  <li
                    key={idx}
                    title="This domain is the PTR record associated with the IP address."
                    className="font-mono cursor-help text-gray-800"
                  >
                    {domain}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm italic text-gray-500">
                * PTR records map IP addresses to domain names. Multiple PTR records can exist for a single IP.
              </p>
            </>
          ) : (
            <p className="text-red-600 font-semibold">Error: {result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
