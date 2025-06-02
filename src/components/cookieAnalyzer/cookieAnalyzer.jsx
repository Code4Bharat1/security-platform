'use client';
import { useState } from 'react';

export default function CookieAnalyzer() {
  const [url, setUrl] = useState('');
  const [cookies, setCookies] = useState([]);
  const [error, setError] = useState('');

  const analyzeCookies = async () => {
    setError('');
    try {
      const res = await fetch('/api/analyzeCookies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (res.ok) setCookies(data.cookies);
      else setError(data.error || 'Something went wrong');
    } catch (e) {
      setError('Server error');
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-2">Cookie Security Analyzer</h2>
      <input
        type="text"
        value={url}
        onChange={e => setUrl(e.target.value)}
        placeholder="https://example.com"
        className="border p-2 rounded w-full mb-2"
      />
      <button onClick={analyzeCookies} className="bg-blue-600 text-white px-4 py-2 rounded">
        Analyze
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}

     {cookies.length > 0 && (
  <table className="min-w-full text-sm mt-4 border border-gray-200">
    <thead className="bg-gray-100 text-left">
      <tr>
        <th className="px-4 py-2">Name</th>
        <th className="px-4 py-2">Secure</th>
        <th className="px-4 py-2">HttpOnly</th>
        <th className="px-4 py-2">SameSite</th>
        <th className="px-4 py-2">Path</th>
        <th className="px-4 py-2">Domain</th>
        <th className="px-4 py-2">Status</th>
      </tr>
    </thead>
    <tbody>
      {cookies.map((cookie, index) => {
        const issues = [];
        if (!cookie.secure) issues.push("Missing Secure");
        if (!cookie.httpOnly) issues.push("Missing HttpOnly");
        if (!cookie.sameSite || cookie.sameSiteValue === 'None') issues.push("SameSite not set properly");

        return (
          <tr key={index} className="border-t border-gray-200">
            <td className="px-4 py-2">{cookie.name}</td>
            <td className="px-4 py-2">
              <span className={`px-2 py-1 rounded text-white`}>
                {cookie.secure ? '✅' : '❌'}
              </span>
            </td>
            <td className="px-4 py-2">
              <span className={`px-2 py-1 rounded text-white`}>
                {cookie.httpOnly ? '✅' : '❌'}
              </span>
            </td>
            <td className="px-4 py-2">{cookie.sameSiteValue || 'Not set'}</td>
            <td className="px-4 py-2">{cookie.path}</td>
            <td className="px-4 py-2">{cookie.domain}</td>
            <td className="px-4 py-2 text-yellow-600">
              {issues.length === 0 ? (
                <span className="text-green-600 font-medium">✅ All good</span>
              ) : (
                issues.map((msg, i) => <div key={i}>❗ {msg}</div>)
              )}
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
)}

    </div>
  );
}

