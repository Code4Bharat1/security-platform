"use client";
import { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

export default function QRTool() {
  const [mode, setMode] = useState("select");
  const [qrInput, setQrInput] = useState("");
  const [qrImage, setQrImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const API = "http://localhost:4180/api/qr";

  const handleGenerate = async () => {
    if (!qrInput) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await axios.post(`${API}/generate`, { url: qrInput }, { responseType: "blob" });
      const blobUrl = URL.createObjectURL(res.data);
      setResult({ type: "image", data: blobUrl });
    } catch {
      setResult({ type: "error", data: "QR generation failed." });
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
      const res = await axios.post(`${API}/scan`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult({ type: "text", data: res.data.report });
    } catch {
      setResult({ type: "error", data: "QR scan failed." });
    }
    setLoading(false);
  };

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4 text-success fw-bold">QR Code Scanner / Generator</h2>

      <div className="mb-4 text-center">
        <select
          className="form-select w-auto mx-auto"
          value={mode}
          onChange={(e) => {
            setMode(e.target.value);
            setQrInput("");
            setQrImage(null);
            setResult(null);
          }}
        >
          <option value="select">Select Option</option>
          <option value="generate">Generate QR</option>
          <option value="scan">Scan QR</option>
        </select>
      </div>

      {mode === "generate" && (
        <div className="card p-4 mb-4">
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Enter URL to encode"
            value={qrInput}
            onChange={(e) => setQrInput(e.target.value)}
          />
          <button
            className="btn btn-success"
            disabled={!qrInput || loading}
            onClick={handleGenerate}
          >
            {loading ? "Generating..." : "Generate QR"}
          </button>
        </div>
      )}

      {mode === "scan" && (
        <div className="card p-4 mb-4">
          <input
            type="file"
            className="form-control mb-3"
            accept="image/*"
            onChange={(e) => setQrImage(e.target.files[0])}
          />
          <button
            className="btn btn-success"
            disabled={!qrImage || loading}
            onClick={handleScan}
          >
            {loading ? "Scanning..." : "Scan QR"}
          </button>
        </div>
      )}

      {result && (
        <div className="card p-4 mt-4">
          {result.type === "image" && (
            <img
              src={result.data}
              alt="QR Code"
              className="img-thumbnail mx-auto d-block"
              style={{ maxWidth: "180px" }}
            />
          )}
          {result.type === "text" && <pre className="text-success">{result.data}</pre>}
          {result.type === "error" && <div className="text-danger">{result.data}</div>}
        </div>
      )}
    </div>
  );
}
