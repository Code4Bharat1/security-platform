"use client";

import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  MessageSquare,
  Upload,
  Info,
  ShieldCheck,
  EyeOff,
  Trash2,
  Loader2,
  FileText,
  Lock,
} from "lucide-react";
import useProtectedAction from "../UseProtectedAction/UseProtectedAction";

export default function WhatsappPrivacyChecker() {
  const [images, setImages] = useState([]);
  const [score, setScore] = useState(null);
  const [messages, setMessages] = useState([]);
  const [settings, setSettings] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const protectedAction = useProtectedAction();

  const MAX_IMAGES = 5;
  const MIN_IMAGES = 2;

  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    const totalImages = images.length + fileArray.length;

    if (totalImages > MAX_IMAGES) {
      toast.error(`You can upload a maximum of ${MAX_IMAGES} images.`);
      return;
    }

    const newImages = fileArray.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages].slice(0, MAX_IMAGES));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drop-zone-active");
    handleFiles(e.dataTransfer.files);
  };

  const handleUpload = (e) => {
    handleFiles(e.target.files);
  };

  const handleAnalyze = async () => {
    if (images.length < MIN_IMAGES) {
      toast.warning(`Please upload at least ${MIN_IMAGES} images to proceed.`);
      return;
    }

    const formData = new FormData();
    images.forEach((img) => {
      formData.append("images", img.file);
    });

    setIsLoading(true);

    await protectedAction(async (userToken) => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/whatsapp-privacy-inspector/inspect`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
            body: formData,
          }
        );

        if (!res.ok) {
          throw new Error("Failed to analyze images");
        }

        const data = await res.json();

        setScore(data.score);
        setMessages(data.messages);
        setSettings(data.settings);

        toast.success("Images analyzed successfully!");
      } catch (error) {
        toast.error(error.message || "Something went wrong!");
      } finally {
        setIsLoading(false);
      }
    });
  };

  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.url));
    };
  }, []);

  const removeImage = (index) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const getScoreColor = (val) => {
    if (val >= 80) return "text-emerald-400 border-emerald-500/25 bg-emerald-950/20";
    if (val >= 50) return "text-orange-400 border-orange-500/25 bg-orange-950/20";
    return "text-rose-400 border-rose-500/25 bg-rose-950/20";
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
            <MessageSquare className="h-8 w-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">
              WHATSAPP <span className="text-emerald-400">PRIVACY</span>
            </h1>
            <p className="mt-2 text-zinc-400 max-w-2xl text-base font-normal">
              Analyze WhatsApp settings screenshots to evaluate account privacy, read receipts, disappearing messages, and layout integrity.
            </p>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Upload Card */}
            <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-emerald-500/10 transition-all duration-300">
              <h2 className="text-lg font-mono font-medium text-zinc-100 mb-6 flex items-center gap-2">
                <Upload className="h-5 w-5 text-emerald-400" />
                Upload Screenshots
              </h2>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add("drop-zone-active");
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove("drop-zone-active");
                }}
                onDrop={handleDrop}
                className="border-2 border-dashed border-zinc-700/60 rounded-xl p-8 text-center transition-all duration-200 mb-5"
              >
                <MessageSquare className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-400 text-sm font-mono mb-1">Drag & drop settings screenshots here</p>
                <p className="text-zinc-600 text-xs font-mono mb-4">or click to browse local files (2–5 images)</p>
                <label
                  htmlFor="imageInput"
                  className="inline-flex items-center gap-2 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/50 rounded-xl font-mono font-bold text-xs uppercase px-5 py-2.5 transition-all duration-300 cursor-pointer hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                >
                  <FileText className="h-4 w-4" /> Browse Images
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  capture="environment"
                  onChange={handleUpload}
                  className="hidden"
                  id="imageInput"
                />
              </div>

              {/* Uploaded Images Preview List */}
              {images.length > 0 && (
                <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-4 mb-5">
                  <p className="text-[10px] uppercase tracking-widest font-mono text-zinc-500 mb-3">
                    Selected Screenshots ({images.length} / {MAX_IMAGES})
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group border border-zinc-800 rounded-lg overflow-hidden bg-black/40">
                        <img
                          src={img.url}
                          alt={`upload-${idx}`}
                          className="w-full h-24 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <button
                            onClick={() => removeImage(idx)}
                            className="bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 border border-rose-500/30 hover:border-rose-500/50 p-2 rounded-lg transition-all"
                            title="Remove image"
                            type="button"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleAnalyze}
                disabled={isLoading || images.length < MIN_IMAGES}
                className="w-full bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/50 rounded-xl font-mono font-bold text-xs uppercase py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-2 focus:ring-offset-black/20 disabled:opacity-40 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing screenshots...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Inspect Privacy Settings
                  </>
                )}
              </button>
            </div>

            {/* Analysis Results */}
            {score !== null && !isLoading && (
              <div className="bg-zinc-950/20 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-[0_12px_40px_rgb(0,0,0,0.2)] space-y-6 hover:border-emerald-500/10 transition-all duration-300">
                <div className="border-b border-zinc-800/50 pb-4 flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  <h2 className="font-mono font-bold text-sm uppercase tracking-wider text-zinc-100">
                    Analysis Results
                  </h2>
                </div>

                {/* Score Section */}
                <div className={`border rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 ${getScoreColor(score)}`}>
                  <div>
                    <h3 className="text-xs uppercase tracking-widest font-mono text-zinc-400 mb-1">
                      Overall Privacy Score
                    </h3>
                    <p className="text-sm text-zinc-300">
                      Evaluated security based on visibility configurations.
                    </p>
                  </div>
                  <div className="text-3xl font-mono font-bold">
                    {score} <span className="text-xs font-normal text-zinc-500">/ 100</span>
                  </div>
                </div>

                {/* Messages Section */}
                <div className="space-y-3">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                    <Info className="h-3.5 w-3.5 text-emerald-400" />
                    Findings & Recommendations
                  </h3>
                  <div className="bg-zinc-900/30 rounded-xl p-4 border border-zinc-800/50">
                    {messages.length === 0 ? (
                      <p className="text-xs text-zinc-500 font-mono">No messages generated.</p>
                    ) : (
                      <ul className="space-y-2 list-none pl-0">
                        {messages.map((msg, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-zinc-300 font-mono">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/60 mt-1.5 flex-shrink-0" />
                            {msg}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Settings Details Section */}
                {Object.keys(settings).length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                      <Lock className="h-3.5 w-3.5 text-emerald-400" />
                      Detected Parameters
                    </h3>
                    <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-4 overflow-x-auto">
                      <pre className="text-xs text-zinc-400 font-mono leading-relaxed">
                        {JSON.stringify(settings, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Guidance Sidebar */}
          <div className="space-y-6">
            {/* Guidance Card */}
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Info className="h-4 w-4 text-emerald-400" />
                Inspector Guidelines
              </h4>
              <ul className="space-y-3.5 list-none pl-0">
                {[
                  "Take clear screenshots of your WhatsApp Privacy settings screen.",
                  "Upload 2 to 5 screenshots covering details like Profile Photo, Last Seen, and Groups settings.",
                  "The analyzer extracts text parameters to evaluate exposure metrics.",
                  "Calculates an overall Privacy Score out of 100 based on standard benchmarks.",
                  "Flags settings like 'Everyone' visibility for sensitive variables.",
                  "Recommends step-by-step hardened configuration adjustments.",
                  "All processing is secured using zero-log policy practices.",
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/60 mt-1.5 flex-shrink-0" />
                    <span className="text-xs text-zinc-400 leading-relaxed">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Score Benchmark Guide */}
            <div className="border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <EyeOff className="h-4 w-4 text-emerald-400" />
                Score Benchmarks
              </h4>
              <div className="space-y-2.5">
                {[
                  { range: "80 – 100", label: "Hardened", color: "text-emerald-400" },
                  { range: "50 – 79", label: "Moderate Risk", color: "text-orange-400" },
                  { range: "0 – 49", label: "Exposed / Critical", color: "text-rose-400" },
                ].map(({ range, label, color }) => (
                  <div key={range} className="flex items-center justify-between py-1.5 border-b border-zinc-800/40 last:border-0">
                    <span className={`text-[11px] font-mono font-bold ${color}`}>{range}</span>
                    <span className="text-[11px] text-zinc-500 font-mono">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
}
