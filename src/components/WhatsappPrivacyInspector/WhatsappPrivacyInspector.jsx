"use client";

import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GreenLayout from "../GreenTeam/layout";
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

    setIsLoading(true); // start loading

    await protectedAction(async (userToken) => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/whatsapp-privacy-inspector/inspect`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${userToken}`, // ✅ ADD THIS
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
        setIsLoading(false); // stop loading
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

  return (
    <div className="tool-detail-page flex min-h-screen flex-col items-center px-4">
      <GreenLayout
        heroData={{
          title: "WhatsApp Privacy Inspector",
          imgPath: "/GreenTeam/wp.png",
          desc: "Analyze WhatsApp screenshots to assess your privacy settings and message security.",
        }}
      />
      <div
        className="w-full max-w-xl cursor-pointer rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--surface-card)] p-6 shadow-[var(--shadow-elevated)] transition"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          capture="environment"
          onChange={handleUpload}
          className="hidden"
          id="imageInput"
        />
        <label
          htmlFor="imageInput"
          className="block cursor-pointer rounded-xl border border-dashed border-[color:var(--gold)] px-5 py-3 text-center text-[color:var(--text-body)]"
        >
          Drag & drop images here, or{" "}
          <span className="cursor-pointer text-[color:var(--gold)] underline">browse</span>{" "}
          (2–5 images)
        </label>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((img, idx) => (
            <div key={idx} className="relative">
              <img
                src={img.url}
                alt={`upload-${idx}`}
                className="w-full h-24 object-cover rounded shadow"
              />
              <button
                onClick={() => removeImage(idx)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--danger)] text-xs text-[color:var(--text-inverse)] transition hover:opacity-90"
                title="Remove image"
                type="button"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
        <div className="justify-center text-center mt-2">
          <button
            onClick={handleAnalyze}
            disabled={isLoading}
            className={`mt-6 px-6 py-2 rounded transition font-medium ${
              isLoading
                ? "cursor-not-allowed bg-[color:var(--gold)] text-[color:var(--text-inverse)] opacity-70"
                : "bg-[color:var(--gold)] text-[color:var(--text-inverse)] hover:bg-[color:var(--gold-strong)]"
            }`}
          >
            {isLoading ? "Analyzing..." : "Analyze"}
          </button>
        </div>
      </div>

      {score !== null && (
        <div className="mt-8 w-full max-w-xl rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-card)] p-6 shadow-[var(--shadow-elevated)]">
          <h2 className="mb-4 text-2xl font-semibold text-[color:var(--text-heading)]">Analysis Results</h2>
          <p className="mb-2 font-semibold text-[color:var(--text-heading)]">Privacy Score: {score}</p>

          <div className="mb-4">
            <h3 className="mb-1 font-semibold text-[color:var(--text-heading)]">Messages:</h3>
            <ul className="list-disc list-inside max-h-48 overflow-auto">
              {messages.length === 0 ? (
                <li>No messages</li>
              ) : (
                messages.map((msg, i) => <li key={i}>{msg}</li>)
              )}
            </ul>
          </div>

          <div>
            <h3 className="mb-1 font-semibold text-[color:var(--text-heading)]">Settings:</h3>
            <pre className="max-h-48 overflow-auto rounded bg-[color:var(--surface-subtle)] p-2 text-sm text-[color:var(--text-heading)]">
              {JSON.stringify(settings, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
}
