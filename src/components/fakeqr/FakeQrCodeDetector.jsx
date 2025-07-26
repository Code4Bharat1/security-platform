"use client";
import { useState } from "react";
import { QrCode } from "lucide-react";

export default function FakeQrCodeDetector() {
  const [image, setImage] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    setResult(null);
  };

  const handleScan = async () => {
    if (!image) return;

    setScanning(true);
    setResult(null);

    const formData = new FormData();
    formData.append("qrImage", image);

    try {
      const res = await fetch("/api/qr/scan", {
        method: "POST",
        body: formData,
      });


      const data = await res.json();

      if (data.status === "fake") {
        setResult(`⚠️ Fake QR Detected: ${data.message}`);
      } else if (data.status === "safe") {
        setResult(`✅ Safe QR Code: ${data.message}`);
      } else {
        setResult(`❌ Scan failed. Error: ${error}`);
      }
    } catch (err) {
      setResult("❌ Failed to connect to server.");
    }

    setScanning(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-20 px-4">
      <div className="text-center mb-10">
        <QrCode className="mx-auto mb-4 text-green-600" size={48} />
        <h1 className="text-3xl font-bold text-green-800">Fake QR Code Detector</h1>
        <p className="text-gray-600 mt-2">
          Upload a QR code image to detect phishing or malicious links.
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-lg text-center">
        <div className="mb-4">
          <label
            htmlFor="qr-upload"
            className="block w-full bg-green-700 text-white text-center py-3 rounded-md font-semibold cursor-pointer hover:bg-green-800 transition duration-300"
          >
            📷 Choose QR Code
          </label>
          <input
            id="qr-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        <button
          onClick={handleScan}
          disabled={scanning || !image}
          className={`w-full py-3 rounded-md text-white font-semibold transition ${scanning
              ? "bg-green-400 cursor-not-allowed"
              : "bg-green-700 hover:bg-green-800"
            }`}
        >
          {scanning ? "Scanning..." : "Scan QR"}
        </button>

        {result && (
          <div className="mt-6 text-center text-green-700 font-semibold">
            {result}
          </div>
        )}
      </div>
    </div>
  );
}
