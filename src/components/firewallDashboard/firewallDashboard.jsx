import React from "react";

export default function FirewallDashboard({ data }) {
  if (!data) return <p>No data to display.</p>;

  const {
    url,
    statusCode,
    detected,
    firewallName,
    matchedHeaders,
    securityHeadersDetected,
    serverHeader,
    protectionLevel,
  } = data;

  // Color codes for protection level
  const protectionColors = {
    None: "text-gray-600 bg-gray-100",
    Moderate: "text-yellow-800 bg-yellow-100",
    High: "text-red-800 bg-red-100",
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-md font-sans">
      <h2 className="text-2xl font-bold mb-4">Firewall Detection Report</h2>

      <div className="mb-4">
        <strong>URL Scanned:</strong> <span className="text-blue-600">{url}</span>
      </div>

      <div className="mb-4">
        <strong>HTTP Status Code:</strong> {statusCode}
      </div>

      <div className={`mb-4 p-2 rounded ${protectionColors[protectionLevel]}`}>
        <strong>Protection Level:</strong> {protectionLevel}
      </div>

      <div className="mb-4">
        <strong>Firewall Detected:</strong>{" "}
        {detected ? (
          <span className="text-green-600 font-semibold">{firewallName}</span>
        ) : (
          <span className="text-gray-500 italic">None</span>
        )}
      </div>

      <div className="mb-4">
        <strong>Server Header:</strong> {serverHeader || "N/A"}
      </div>

      <div className="mb-4">
        <strong>Matched Headers:</strong>
        {matchedHeaders.length > 0 ? (
          <ul className="list-disc list-inside ml-4">
            {matchedHeaders.map(({ header, value }) => (
              <li key={header}>
                <code>{header}:</code> {value}
              </li>
            ))}
          </ul>
        ) : (
          <span> None</span>
        )}
      </div>

      <div className="mb-4">
        <strong>Security Headers Detected:</strong>
        {securityHeadersDetected.length > 0 ? (
          <ul className="list-disc list-inside ml-4">
            {securityHeadersDetected.map((header) => (
              <li key={header}>
                <code>{header}</code>
              </li>
            ))}
          </ul>
        ) : (
          <span> None</span>
        )}
      </div>
    </div>
  );
}

