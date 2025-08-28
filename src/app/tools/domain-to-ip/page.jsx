'use client';
import { useState } from 'react';
import axios from 'axios';

const DomainToIP = () => {
  const [domain, setDomain] = useState('');
  const [ip, setIp] = useState(null);
  const [error, setError] = useState('');

  const handleDomainChange = (e) => setDomain(e.target.value);

  const handleConvert = async () => {
    if (!domain) {
      setError('Domain is required');
      return;
    }

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_PROD_API_URL}/domain/convert`, { domain });
      setIp(response.data.ip);
      setError('');
    } catch (error) {
      setError('Error resolving domain');
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
          className="w-full p-2 bg-gray-800 text-white rounded-lg mb-4"
          placeholder="Enter domain"
        />
        <button
          onClick={handleConvert}
          className="w-full bg-blue-500 text-white p-2 rounded-lg"
        >
          Convert
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
