'use client';
import { useState } from 'react';
import axios from 'axios';

const DomainToIP = () => {
  const [domain, setDomain] = useState('');
  const [scannedDomain, setScannedDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [ip, setIp] = useState(null);
  const [error, setError] = useState('');

  const handleDomainChange = (e) => setDomain(e.target.value);

  const handleConvert = async () => {
    const activeDomain = domain.trim();
    if (!activeDomain) {
      setError('Domain is required');
      return;
    }

    setScannedDomain(activeDomain);
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_PROD_API_URL}/domain/convert`, { domain: activeDomain });
      setIp(response.data.ip);
      setError('');
    } catch (error) {
      setError('Error resolving domain');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 text-white p-4 rounded-lg">
      <h1 className="text-2xl font-semibold mb-4">Domain to IP Converter</h1>
      <div>
        <input
          type="text"
          value={domain}
          onChange={handleDomainChange}
          disabled={loading}
          className="w-full p-2 bg-gray-800 text-white rounded-lg mb-4"
          placeholder="Enter domain"
        />
        <button
          onClick={handleConvert}
          disabled={loading || !domain}
          className="w-full bg-blue-500 text-white p-2 rounded-lg disabled:opacity-50"
        >
          {loading ? 'Converting...' : 'Convert'}
        </button>
      </div>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {ip && (
        <div className="mt-4">
          <h2 className="font-semibold">Your Results:</h2>
          <p>
            {domain} → <span className="font-mono">{ip}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default DomainToIP;
