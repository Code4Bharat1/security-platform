import React, { useState } from "react";

function RogueWifiDetector() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("https://zypher.code4bharat.com//api/rogue-wifi/rogue-wifi-scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Scan failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rogue-scanner-container" style={{ textAlign: "center", marginTop: "60px" }}>
      <h2 style={{ color: "#00703c" }}>Rogue WiFi Detector</h2>
      <p>Scans for duplicate or suspicious WiFi networks in your area.</p>

      <form onSubmit={handleScan} style={{ marginTop: "20px" }}>
        <input
          type="text"
          placeholder="Enter SSID or IP"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            padding: "10px",
            width: "300px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
          required
        />
        <br />
        <button
          type="submit"
          style={{
            marginTop: "15px",
            padding: "10px 20px",
            backgroundColor: "#00703c",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {loading ? "Scanning..." : "Scan Now"}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: "30px", color: "#333" }}>
          <h3 style={{ color: "#00703c" }}>Scan Complete</h3>
          <p>
            {result.status === "rogue" && "⚠️ Rogue WiFi detected!"}
            {result.status === "suspicious" && "⚠️ Suspicious WiFi network found!"}
            {result.status === "safe" && "✅ No rogue WiFi networks detected."}
          </p>
          <p><strong>Status:</strong> {result.status}</p>
          <p><strong>Message:</strong> {result.message}</p>
          <p><strong>Checked At:</strong> {new Date(result.savedAt).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}

export default RogueWifiDetector;
