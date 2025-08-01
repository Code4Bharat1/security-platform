"use client";
import { useState } from "react";
import axios from "axios";
import { QrCode } from "lucide-react";

export default function QRTool() {
  const [mode, setMode] = useState("select");
  const [qrInput, setQrInput] = useState("");
  const [qrImage, setQrImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_PROD_API_URL || "http://localhost:4180/api";

  const handleGenerate = async () => {
    if (!qrInput) return;

    setLoading(true);
    setResult(null);

    try {
      const formData = new URLSearchParams();
      formData.append("text", qrInput);

      const response = await axios.post(`${API_BASE}/qr/generate`, formData, {
        responseType: "blob",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const qrUrl = URL.createObjectURL(response.data);
      setResult({ type: "image", data: qrUrl });
    } catch (err) {
      console.error(err);
      setResult({ type: "error", data: "Failed to generate QR." });
    }

    setLoading(false);
  };

  const handleScan = async () => {
    if (!qrImage) return;

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("qrImage", qrImage);

    try {
      const response = await axios.post(`${API_BASE}/qr/scan`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult({
        type: "text",
        data: `${response.data.status.toUpperCase()}: ${response.data.message}`,
      });
    } catch (err) {
      console.error(err);
      setResult({ type: "error", data: "Scan failed." });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-20 px-4">
      <div className="text-center mb-10">
        <QrCode className="mx-auto mb-4 text-green-600" size={48} />
        <h1 className="text-3xl font-bold text-green-800">QR Code Tool</h1>
        <p className="text-gray-600 mt-2">
          Scan or generate QR codes securely with your own backend.
        </p>
      </div>

      <div className="mb-6">
        <select
          value={mode}
          onChange={(e) => {
            setMode(e.target.value);
            setResult(null);
            setQrInput("");
            setQrImage(null);
          }}
          className="p-3 border border-green-700 rounded-md"
        >
          <option value="select">🧭 Select Mode</option>
          <option value="scan">🔍 Scan QR Code</option>
          <option value="generate">🛠️ Generate QR Code</option>
        </select>
      </div>

      {mode === "generate" && (
        <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-lg text-center">
          <h2 className="text-xl font-bold text-green-700 mb-4">Generate QR</h2>
          <input
            type="text"
            placeholder="Enter text or URL"
            value={qrInput}
            onChange={(e) => setQrInput(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-3 mb-4"
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !qrInput}
            className={`w-full py-3 rounded-md text-white font-semibold transition ${
              loading ? "bg-green-400 cursor-not-allowed" : "bg-green-700 hover:bg-green-800"
            }`}
          >
            {loading ? "Generating..." : "Generate QR"}
          </button>
        </div>
      )}

      {mode === "scan" && (
        <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-lg text-center">
          <h2 className="text-xl font-bold text-green-700 mb-4">Scan QR</h2>
          <label
            htmlFor="qr-upload"
            className="block w-full bg-green-700 text-white py-3 rounded-md font-semibold cursor-pointer hover:bg-green-800 mb-4"
          >
            📷 Upload QR Image
          </label>
          <input
            id="qr-upload"
            type="file"
            accept="image/*"
            onChange={(e) => setQrImage(e.target.files[0])}
            className="hidden"
          />
          {qrImage && (
            <p className="text-gray-700 mb-2 font-medium">File: {qrImage.name}</p>
          )}
          <button
            onClick={handleScan}
            disabled={loading || !qrImage}
            className={`w-full py-3 rounded-md text-white font-semibold transition ${
              loading ? "bg-green-400 cursor-not-allowed" : "bg-green-700 hover:bg-green-800"
            }`}
          >
            {loading ? "Scanning..." : "Scan QR"}
          </button>
        </div>
      )}

      {result && (
        <div className="mt-6 bg-white rounded-lg shadow p-4 w-full max-w-lg text-center">
          {result.type === "image" && (
            <img src={result.data} alt="Generated QR" className="mx-auto" />
          )}
          {result.type === "text" && (
            <p className="text-green-700 font-semibold">{result.data}</p>
          )}
          {result.type === "error" && (
            <p className="text-red-600 font-semibold">{result.data}</p>
          )}
        </div>
      )}
    </div>
  );
}
