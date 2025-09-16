'use client';

import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GreenLayout from '../GreenTeam/layout';

export default function WhatsappPrivacyChecker() {
  const [images, setImages] = useState([]);
  const [score, setScore] = useState(null);
  const [messages, setMessages] = useState([]);
  const [settings, setSettings] = useState({});
  const [isLoading, setIsLoading] = useState(false); 

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
      formData.append('images', img.file);
    });

    setIsLoading(true); // start loading

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/whatsapp-privacy-inspector/inspect`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!res.ok) {
        throw new Error('Failed to analyze images');
      }

      const data = await res.json();

      setScore(data.score);
      setMessages(data.messages);
      setSettings(data.settings);

      toast.success('Images analyzed successfully!');
    } catch (error) {
      toast.error(error.message || 'Something went wrong!');
    } finally {
      setIsLoading(false); // stop loading
    }
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
    <div className="min-h-screen bg-black flex flex-col items-center px-4">
      <GreenLayout  
        heroData={{
          title: "WhatsApp Privacy Inspector",
          imgPath: "/GreenTeam/wp.png",
          desc: "Analyze WhatsApp screenshots to assess your privacy settings and message security.",
        }}
      />
      <div
        className="w-full max-w-xl border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-500 transition cursor-pointer"
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
        <label htmlFor="imageInput" className="block text-center border border-dashed rounded-lg border-green-500 px-5 py-3 text-white cursor-pointer">
          Drag & drop images here, or{' '}
          <span className="text-blue-500 underline cursor-pointer">browse</span> (2–5 images)
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
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700 transition"
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
                     ? 'bg-gray-400 cursor-not-allowed text-white'
                     : 'bg-green-600 hover:bg-green-700 text-white'
                 }`}
               >
                 {isLoading ? 'Analyzing...' : 'Analyze'}
               </button>
        </div>
</div>


      {score !== null && (
        <div className="mt-8 w-full max-w-xl bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">Analysis Results</h2>
          <p className="mb-2 font-semibold">Privacy Score: {score}</p>

          <div className="mb-4">
            <h3 className="font-semibold mb-1">Messages:</h3>
            <ul className="list-disc list-inside max-h-48 overflow-auto">
              {messages.length === 0 ? (
                <li>No messages</li>
              ) : (
                messages.map((msg, i) => <li key={i}>{msg}</li>)
              )}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-1">Settings:</h3>
            <pre className="max-h-48 overflow-auto bg-gray-100 p-2 rounded text-sm">
              {JSON.stringify(settings, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
}
