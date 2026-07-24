"use client";

import { useEffect, useRef, useState } from "react";
import {
  QrCode,
  Search,
  Sparkles,
  Camera,
  Upload,
  Info,
  ShieldCheck,
  Loader2,
  XCircle,
  RefreshCcw,
  ArrowRight,
  Maximize2,
  EyeOff,
  Download,
} from "lucide-react";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";
import { generateQrPDF } from "./generateQrPDF";

/* ── Sub-component: Camera Capture ─────────────────────────── */
const CameraCapture = ({ onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [cameraError, setCameraError] = useState("");

  useEffect(() => {
    let streamInstance = null;
    let isMounted = true;
    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        streamInstance = stream;
        if (isMounted && videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
            if (isMounted) setReady(true);
          } catch (playErr) {
            if (playErr.name !== "AbortError") {
              console.error("Camera play error:", playErr);
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Camera error:", err);
          setCameraError("Unable to access camera. Please check permissions.");
        }
      }
    };
    setupCamera();

    return () => {
      isMounted = false;
      if (streamInstance) {
        streamInstance.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const capture = () => {
    if (!ready) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    
    // Draw raw blob structure to mimic original file uploading structure
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "captured-qr.jpg", { type: "image/jpeg" });
        onCapture({
          file,
          url: URL.createObjectURL(file),
        });
      }
    }, "image/jpeg");
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-xl">
      <div className="relative w-full max-w-sm aspect-[4/3] rounded-lg overflow-hidden border border-zinc-700 bg-black">
        {cameraError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <XCircle className="h-8 w-8 text-rose-400 mb-2" />
            <p className="text-xs text-zinc-400 font-mono">{cameraError}</p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Holographic targeting reticle */}
            <div className="absolute inset-0 pointer-events-none border-[2px] border-emerald-500/20 m-6 flex items-center justify-center">
              <div className="w-12 h-12 border-t-2 border-l-2 border-emerald-400 absolute top-0 left-0" />
              <div className="w-12 h-12 border-t-2 border-r-2 border-emerald-400 absolute top-0 right-0" />
              <div className="w-12 h-12 border-b-2 border-l-2 border-emerald-400 absolute bottom-0 left-0" />
              <div className="w-12 h-12 border-b-2 border-r-2 border-emerald-400 absolute bottom-0 right-0" />
              <div className="w-full h-[1px] bg-emerald-500/10 absolute top-1/2 left-0" />
              <div className="h-full w-[1px] bg-emerald-500/10 absolute top-0 left-1/2" />
            </div>
            {!ready && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <Loader2 className="h-6 w-6 text-emerald-400 animate-spin" />
              </div>
            )}
          </>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
      <button
        type="button"
        onClick={capture}
        disabled={!ready}
        className="mt-4 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/50 rounded-xl font-mono font-bold text-xs uppercase px-5 py-2.5 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
      >
        <Maximize2 size={14} /> Capture Image
      </button>
    </div>
  );
};

/* ── Main component ───────────────────────────────────────────────────── */
const FakeQRCodeDetectorAndQRGenerator = () => {
  const [tab, setTab] = useState("scanner");
  const [inputMethod, setInputMethod] = useState("upload");
  const [imageSrc, setImageSrc] = useState(null);
  const [scanResult, setScanResult] = useState("");
  const [rawScanResult, setRawScanResult] = useState(null);
  const [generateResult, setGenerateResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [qrText, setQrText] = useState("");
  const [generatedImage, setGeneratedImage] = useState(null);
  const protectedAction = useProtectedAction();

  const handleImage = (fileData) => {
    setImageSrc(fileData);
    setScanResult("");
  };

  const handleFileInput = (e) => {
    setInputMethod("upload");
    const file = e.target.files[0];
    if (!file) return;
    handleImage({
      file,
      url: URL.createObjectURL(file),
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drop-zone-active");
    setInputMethod("upload");

    if (e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleImage({
        file,
        url: URL.createObjectURL(file),
      });
    }
  };

  const handleScan = async () => {
    if (!imageSrc) {
      setScanResult("Please upload or capture an image first.");
      return;
    }
    setLoading(true);
    setScanResult("");
    await protectedAction(async (userToken) => {
      try {
        const formData = new FormData();
        formData.append("qrImage", imageSrc.file, "qr-image.jpg");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/qr/scan`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
            body: formData,
          }
        );

        const data = await response.json();
        setRawScanResult(data);
        if (data.status === "error") {
          setScanResult(`❌ Error: ${data.message}`);
        } else {
          const verdictRaw = data.verdict || "SAFE";
          const displayVerdict = verdictRaw.includes("SAFE") ? `✅ ${verdictRaw}` : `⚠️ ${verdictRaw}`;
          setScanResult(`VERDICT        : ${displayVerdict}\nRISK DETAILS   : ${data.risk || "None"}\nRECOMMENDATION : ${data.suggestion || "None"}\n\nDECODED CONTENT:\n${data.data}`);
        }
      } catch (err) {
        setScanResult("❌ Failed to connect to server.");
      } finally {
        setLoading(false);
      }
    });
  };

  const handleGenerate = async () => {
    if (!qrText || qrText.trim() === "") {
      setGenerateResult("Please enter text or a link to generate QR code.");
      return;
    }

    setLoading(true);
    setGenerateResult("");
    setScanResult("");
    setImageSrc(null);
    setGeneratedImage(null);
    await protectedAction(async (userToken) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/qr/generate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userToken}`,
            },
            body: JSON.stringify({ text: qrText }),
          }
        );

        if (!response.ok) {
          throw new Error(`Server error: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.status === "success") {
          const qrImageSrc = data.data.replaceAll("\r\n", "\n");
          setImageSrc(qrImageSrc);
          setGeneratedImage(data.image);
          setScanResult(data.message || "QR code generated successfully.");
        } else {
          setGenerateResult(data.message || "Failed to generate QR code.");
        }
      } catch (err) {
        setGenerateResult("❌ Failed to connect to server.");
      } finally {
        setLoading(false);
      }
    });
  };

  const resetAll = () => {
    setImageSrc(null);
    setGeneratedImage(null);
    setScanResult("");
    setRawScanResult(null);
    setGenerateResult("");
    setQrText("");
    setInputMethod("upload");
  };

  return (
    <div
      className="tool-detail-page min-h-screen"
      style={{
        "--hero-ambient-a": "rgba(16, 185, 129, 0.08)",
        "--hero-ambient-b": "rgba(16, 185, 129, 0.03)",
        "--glow-primary": "0 0 34px rgba(16, 185, 129, 0.16)",
        "--gold": "#10b981",
        "--gold-strong": "#34d399",
        "--gold-dark": "#047857",
        "--ring": "rgba(16, 185, 129, 0.34)",
        "--surface-glow": "rgba(16, 185, 129, 0.14)",
      }}
    >
      <style>{`
        .tool-detail-page .tool-detail-shell {
          padding-top: 3.5rem !important;
        }
        .tool-detail-page ::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.35) !important;
        }
        .tool-detail-page ::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.55) !important;
        }
        .tool-detail-page ::selection {
          background: rgba(16, 185, 129, 0.22) !important;
          color: #e6fffa !important;
        }
        .tool-detail-page .tool-detail-panel,
        .tool-detail-page .bg-gray-900,
        .tool-detail-page .bg-zinc-900\/70,
        .tool-detail-page .bg-black\/60,
        .tool-detail-page .bg-gray-800,
        .tool-detail-page .bg-black\/30 {
          background:
            radial-gradient(circle at center, rgba(16, 185, 129, 0.04), transparent 55%),
            linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)) !important;
          box-shadow:
            inset 0 0 0 1px rgba(255,255,255,0.01),
            0 0 40px rgba(16, 185, 129, 0.04) !important;
          border-color: rgba(16, 185, 129, 0.12) !important;
        }
        .drop-zone-active {
          border-color: rgba(16, 185, 129, 0.5) !important;
          background: rgba(16, 185, 129, 0.04) !important;
        }
      `}</style>

      <div className="tool-detail-shell">
        {/* Top Badge */}
        <div className="flex justify-end mb-8">
          <span className="rounded-full border border-emerald-500/30 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-emerald-400">
            Green Team
          </span>
        </div>

        {/* Title Block */}
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl border border-emerald-500/30 overflow-hidden shadow-lg flex-shrink-0 flex items-center justify-center">
            <QrCode className="h-8 w-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              QR SECURE <span className="text-emerald-400">COMMAND</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Detect malicious redirection links embedded inside QR Codes (Qishing) or generate clean, secure QR codes.
            </p>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Mode selection card */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-emerald-500/10 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-mono font-medium text-zinc-100 flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-emerald-400" />
                  Select Mode
                </h2>
                <button
                  onClick={resetAll}
                  className="bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/50 rounded-xl font-mono font-bold text-[11px] uppercase px-3 py-2 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center gap-1.5 cursor-pointer hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] focus:outline-none"
                >
                  <RefreshCcw size={13} /> Reset
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { value: "scanner", icon: Search, label: "Unsafe QR Detector", desc: "Upload / Capture & scan QR Codes" },
                  { value: "generator", icon: Sparkles, label: "QR Generator", desc: "Encode secure text or links" },
                ].map(({ value, icon: Icon, label, desc }) => (
                  <label
                    key={value}
                    className={`flex items-center gap-3 text-sm cursor-pointer group p-3.5 rounded-xl border transition-all ${
                      tab === value
                        ? "border-emerald-500/50 bg-transparent text-white"
                        : "border-zinc-800/80 bg-transparent text-zinc-300 hover:bg-transparent hover:border-zinc-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="tab"
                      value={value}
                      checked={tab === value}
                      onChange={() => {
                        setTab(value);
                        setImageSrc(null);
                        setGeneratedImage(null);
                        setScanResult("");
                        setGenerateResult("");
                      }}
                      className="text-emerald-500 focus:ring-emerald-500 bg-transparent border-zinc-700"
                    />
                    <Icon className={`h-4 w-4 flex-shrink-0 ${tab === value ? "text-emerald-400" : "text-zinc-500"}`} />
                    <div>
                      <div className="font-mono font-semibold text-xs uppercase tracking-wider">{label}</div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">{desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Main Interactive Action Panel */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-emerald-500/10 transition-all duration-300">
              {tab === "scanner" ? (
                /* SCANNER TAB PANEL */
                <div className="space-y-6">
                  <h2 className="text-lg font-mono font-medium text-zinc-100 flex items-center gap-2">
                    <Search className="h-5 w-5 text-emerald-400" />
                    Unsafe QR Detector
                  </h2>

                  {/* Input method selector buttons */}
                  {/* <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setInputMethod("upload");
                        setImageSrc(null);
                        setScanResult("");
                      }}
                      className={`flex-1 py-2 px-3 rounded-lg border font-mono font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
                        inputMethod === "upload"
                          ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.05)]"
                          : "border-zinc-800 bg-zinc-900/20 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-900/40"
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      onClick={() => {
                        setInputMethod("camera");
                        setImageSrc(null);
                        setScanResult("");
                      }}
                      className={`flex-1 py-2 px-3 rounded-lg border font-mono font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
                        inputMethod === "camera"
                          ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.05)]"
                          : "border-zinc-800 bg-zinc-900/20 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-900/40"
                      }`}
                    >
                      Use Camera
                    </button>
                  </div> */}

                  {/* Drop zone / Upload UI */}
                  {inputMethod === "upload" && (
                    <div
                      onDrop={handleDrop}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add("drop-zone-active");
                      }}
                      onDragLeave={(e) => e.currentTarget.classList.remove("drop-zone-active")}
                      className="border-2 border-dashed border-zinc-700/60 rounded-xl p-8 text-center transition-all duration-200 bg-zinc-900/10"
                    >
                      <Upload className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
                      <p className="text-zinc-400 text-sm font-mono mb-1">Drag & drop QR image here</p>
                      <p className="text-zinc-600 text-xs font-mono mb-4">or click below to browse</p>
                      <label
                        htmlFor="file-upload"
                        className="inline-flex items-center gap-2 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/50 rounded-xl font-mono font-bold text-xs uppercase px-5 py-2.5 transition-all duration-300 cursor-pointer hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                      >
                        <QrCode className="h-4 w-4" /> Browse Images
                      </label>
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileInput}
                        className="hidden"
                      />
                    </div>
                  )}

                  {/* Camera view UI */}
                  {/* {inputMethod === "camera" && (
                    <CameraCapture onCapture={handleImage} />
                  )} */}

                  {/* Captured / Uploaded Image Preview */}
                  {imageSrc && imageSrc.url && (
                    <div className="border border-zinc-800 rounded-xl overflow-hidden bg-black/40 max-w-xs mx-auto p-2">
                      <img
                        src={imageSrc.url}
                        alt="Target QR"
                        className="w-full h-auto object-contain rounded-lg max-h-56"
                      />
                    </div>
                  )}

                  {/* Trigger lookup button */}
                  <button
                    onClick={handleScan}
                    disabled={loading || !imageSrc}
                    className="w-full bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/50 rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] focus:outline-none disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Scanning QR Code...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4" />
                        Inspect QR Code
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* GENERATOR TAB PANEL */
                <div className="space-y-5">
                  <h2 className="text-lg font-mono font-medium text-zinc-100 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-emerald-400" />
                    Secure QR Generator
                  </h2>

                  <div>
                    <label className="block text-xs uppercase tracking-widest font-mono text-zinc-400 mb-2 font-semibold">
                      Text or Link to Encode
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Secure message or https://example.com"
                      value={qrText}
                      onChange={(e) => setQrText(e.target.value)}
                      disabled={loading}
                      className="w-full bg-zinc-900/40 text-zinc-100 border border-zinc-800/80 rounded-xl p-3.5 text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 focus:shadow-[0_0_12px_rgba(16,185,129,0.08)] focus:outline-none transition-all placeholder:text-zinc-600 font-mono"
                    />
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={loading || !qrText.trim()}
                    className="w-full bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/50 rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] focus:outline-none disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating QR Code...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Generate Secure QR
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Results display panel */}
            {loading && (
              <div className="flex flex-col items-center justify-center p-10 bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.15)] animate-pulse">
                <Loader2 className="h-8 w-8 text-emerald-400 animate-spin mb-4" />
                <p className="text-emerald-400 font-mono font-bold text-xs uppercase tracking-widest text-center">
                  Processing cryptographic data...
                </p>
              </div>
            )}

            {/* Scan Result */}
            {scanResult && !loading && (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_12px_40px_rgb(0,0,0,0.2)] space-y-4 hover:border-emerald-500/10 transition-all duration-300">
                <div className="border-b border-zinc-800/50 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                    <span className="font-mono font-bold text-sm uppercase tracking-wider text-emerald-400">
                      Inspection Result
                    </span>
                  </div>
                  {tab === "scanner" && rawScanResult && (
                    <button
                      onClick={() => generateQrPDF(rawScanResult, imageSrc?.file?.name || "qr-code-image.jpg")}
                      className="bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/50 px-3.5 py-1.5 rounded-xl transition-all duration-300 font-mono font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] focus:outline-none self-start sm:self-auto"
                    >
                      <Download size={14} /> PDF Report
                    </button>
                  )}
                </div>
                <div className="bg-zinc-900/30 rounded-xl p-4 border border-zinc-800/50">
                  <pre className="whitespace-pre-wrap break-all text-xs font-mono leading-relaxed text-zinc-300">
                    {scanResult}
                  </pre>
                </div>
              </div>
            )}

            {/* ASCII QR Code Output */}
            {tab === "generator" && imageSrc && typeof imageSrc === "string" && !loading && (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_12px_40px_rgb(0,0,0,0.2)] space-y-6 hover:border-emerald-500/10 transition-all duration-300">
                <div className="border-b border-zinc-800/50 pb-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-emerald-400" />
                    <span className="font-mono font-bold text-sm uppercase tracking-wider text-emerald-400">
                      Generated QR Code
                    </span>
                  </div>
                  {generatedImage && (
                    <a
                      href={generatedImage}
                      download={`qr-code-${Date.now()}.png`}
                      className="bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/50 px-3.5 py-1.5 rounded-xl transition-all duration-300 font-mono font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] focus:outline-none"
                    >
                      <Download size={14} /> Download QR Image
                    </a>
                  )}
                </div>

                <div className="grid md:grid-cols-[1fr_200px] gap-6">
                  {/* ASCII Matrix */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block">ASCII Matrix</span>
                    <div className="bg-white border border-zinc-200 rounded-xl p-6 flex justify-center overflow-x-auto shadow-inner">
                      <pre
                        style={{
                          fontFamily: "Fira Code, Courier New, monospace",
                          lineHeight: 1.0,
                          letterSpacing: "-0.08ch",
                        }}
                        className="text-lg text-black select-all"
                      >
                        {imageSrc}
                      </pre>
                    </div>
                  </div>

                  {/* Visual Image */}
                  {generatedImage && (
                    <div className="space-y-2 flex flex-col items-center md:items-start">
                      <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block self-start">Visual Image</span>
                      <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-center w-full max-w-[200px] aspect-square shadow-md">
                        <img
                          src={generatedImage}
                          alt="Generated QR Code"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-[10px] text-zinc-500 font-mono text-center">
                  * Copy the ASCII characters for terminal use, or click "Download QR Image" to download as a PNG file.
                </p>
              </div>
            )}

            {/* Error Message for generator */}
            {generateResult && !loading && (
              <div className="rounded-xl border border-rose-500/25 bg-rose-500/5 p-4 text-rose-400">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider mb-1">Redemption Error</div>
                    <div className="text-xs text-rose-300">{generateResult}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Specs & Guidance Sidebar */}
          <div className="space-y-6">
            {/* Guidelines Card */}
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Info className="h-4 w-4 text-emerald-400" />
                Detector Guidelines
              </h4>
              <ul className="space-y-3.5 list-none pl-0">
                {[
                  "Upload local QR code image files to scan.",
                  "Inspects target redirection targets to flag malicious domains, DNS parameters, or shorteners.",
                  "Checks domains against updated brand indicators to prevent Qishing scams.",
                  "Allows instant ASCII generation of custom matrix outputs.",
                  "Reduces payload payload risks before dispatching code indicators.",
                  "Maintains high contrast, scalable blocks suitable for print or digital mediums.",
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/60 mt-1.5 flex-shrink-0" />
                    <span className="text-xs text-zinc-400 leading-relaxed">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Spec Card */}
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <QrCode className="h-4 w-4 text-emerald-400" />
                Technical Parameters
              </h4>
              <div className="space-y-2.5">
                {[
                  ["Matrix Formats", "QR Code Model 2"],
                  ["Output Resolution", "Variable Unicode Block"],
                  ["Scanner Speed", "< 500ms Execution"],
                  ["Threat Indicators", "Malicious Link Engine"],
                ].map(([label, val]) => (
                  <div key={label} className="flex items-center justify-between py-1.5 border-b border-zinc-800/40 last:border-0">
                    <span className="text-[11px] text-zinc-500 font-mono uppercase tracking-wider">{label}</span>
                    <span className="text-[11px] text-emerald-400 font-mono font-semibold">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FakeQRCodeDetectorAndQRGenerator;
