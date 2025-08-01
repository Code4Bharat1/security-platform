"use client";
import { useEffect, useRef, useState } from "react";

const CameraCapture = ({ onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [ready, setReady] = useState(false);



  useEffect(() => {
    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setReady(true);
      } catch (err) {
        console.error("Camera error:", err);
      }
    };
    setupCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const capture = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg");
    onCapture(dataUrl);
  };

  return (
    <div className="text-center mb-4">
      <video ref={videoRef} className="w-64 h-48 rounded border mx-auto mb-2" />
      <canvas ref={canvasRef} className="hidden" />
      <button
        onClick={capture}
        disabled={!ready}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Capture Image
      </button>
    </div>
  );
};

const App = () => {
  const [tab, setTab] = useState("scanner"); // 'scanner' or 'generator'
  const [inputMethod, setInputMethod] = useState("upload"); // 'upload' or 'camera'
  const [imageSrc, setImageSrc] = useState(null);
  const [scanResult, setScanResult] = useState("");
  const [generateResult, setGenerateResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [qrText, setQrText] = useState("");

  // Called when user uploads file or captures from camera
  const handleImage = (dataUrl) => {
    setImageSrc(dataUrl);
    setScanResult(""); // clear old result
  };

  // Handle file input (browse)
  const handleFileInput = (e) => {
    setInputMethod("upload");
    setImageSrc(null);

    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      handleImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle drag and drop file upload
  const handleDrop = (e) => {
    e.preventDefault();
    setInputMethod("upload");
    setImageSrc(null);

    if (e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        handleImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Send the image (base64) to backend for scanning
  const handleScan = async () => {
    if (!imageSrc) {
      setScanResult("Please upload or capture an image first.");
      return;
    }
    setLoading(true);
    setScanResult("");

    try {
      const res = await fetch(imageSrc);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append("qrImage", blob, "qr-image.jpg");

      const response = await fetch(`${process.env.NEXT_PUBLIC_PROD_API_URL}/qr/scan`, { // replace with your backend URL
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setScanResult(`${data.data}\n\n${data.message}`);

      // if (data.status === "fake") {
      //   setScanResult(`⚠️ Fake QR Detected: ${data.message}`);
      // } else if (data.status === "safe") {
      //   setScanResult(`✅ Safe QR Code: ${data.message}`);
      // } else {
      //   setScanResult(`❌ Scan failed: ${data.message || "Unknown error"}`);
      // }
    } catch (err) {
      setScanResult("❌ Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };
  const handleGenerate = async () => {
    if (!qrText || qrText.trim() === "") {
      setScanResult("Please enter text or a link to generate QR code.");
      return;
    }

    setLoading(true);
    setScanResult("");
    setImageSrc(null); // clear previous image if needed

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_PROD_API_URL}/qr/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: qrText }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === "success") {
        const qrImageSrc = data.data.replaceAll("\r\n", "\n");
        console.log(qrImageSrc)
        setImageSrc(qrImageSrc);
        setScanResult(data.message || "QR code generated successfully.");
      } else {
        setGenerateResult(data.message || "Failed to generate QR code.");
      }
    } catch (err) {
      setGenerateResult("❌ Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-lg max-w-2xl w-full p-6">
        {/* Tabs */}
        <div className="flex justify-center mb-6 space-x-4">
          <button
            onClick={() => {
              setTab("scanner");
              setImageSrc(null);
              setScanResult("");
            }}
            className={`px-4 py-2 rounded ${tab === "scanner" ? "bg-blue-600 text-white" : "bg-gray-200 text-black"
              }`}
          >
            Unsafe QR Detector
          </button>
          <button
            onClick={() => {
              setTab("generator");
              setImageSrc(null);
              setScanResult("");
            }}
            className={`px-4 py-2 rounded ${tab === "generator" ? "bg-blue-600 text-white" : "bg-gray-200 text-black"
              }`}
          >
            QR Generator
          </button>
        </div>

        {/* Scanner Mode */}
        {tab === "scanner" && (
          <>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-gray-400 p-6 mb-4 text-center rounded bg-gray-50"
            >
              Drag & Drop Image Here or&nbsp;
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-blue-500"
                onClick={() => {
                  setInputMethod("upload");
                  setImageSrc(null);
                  setScanResult("");
                }}
              >
                Browse Files
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
              &nbsp;or&nbsp;
              <button
                onClick={() => {
                  setInputMethod("camera");
                  setImageSrc(null);
                  setScanResult("");
                }}
                className="cursor-pointer text-blue-500"
              >
                Use Camera
              </button>
            </div>

            {inputMethod === "camera" && <CameraCapture onCapture={handleImage} />}

            {imageSrc && (
              <img
                src={imageSrc}
                alt="Captured or uploaded"
                className="max-h-64 mx-auto mb-4 rounded border"
              />
            )}

            <div className="text-center">
              <button
                onClick={handleScan}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {loading ? "Scanning..." : "Scan"}
              </button>
            </div>

            {scanResult && (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mt-4">
                {scanResult}
              </div>
            )}
          </>
        )}

        {/* Generator Mode */}
        {tab === "generator" && (
          <div className="text-center mt-4">
            <input
              type="text"
              placeholder="Enter text or link to encode"
              className="p-2 border rounded w-full mb-4"
              value={qrText}
              onChange={(e) => setQrText(e.target.value)}
            />
            <div>
              <button
                onClick={handleGenerate}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {loading ? "Generating..." : "Generate"}
              </button>
              {imageSrc && (
                <pre style={{ fontFamily: 'Fira Code, Courier New, monospace', lineHeight:1.1, letterSpacing: '-0.08ch'}} className="text-xl">
                  {imageSrc}
                </pre>
              )}
              {generateResult && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mt-4">
                  {generateResult}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
