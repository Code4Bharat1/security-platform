'use client';
import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function WhatsappPrivacyChecker() {
    const [images, setImages] = useState([]);

    const MAX_IMAGES = 5;
    const MIN_IMAGES = 2;

    const handleFiles = (files) => {
        const fileArray = Array.from(files);
        const totalImages = images.length + fileArray.length;

        if (totalImages > MAX_IMAGES) {
            toast.error(`You can upload a maximum of ${MAX_IMAGES} images.`);
            return;
        }

        const newImages = fileArray.map(file => ({
            file,
            url: URL.createObjectURL(file),
        }));

        setImages(prev => [...prev, ...newImages].slice(0, MAX_IMAGES));
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

        await fetch("https://zypher-api.code4bharat.com/whatsapp-privacy-inspector/inspect", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ files: images }),
        });

      const data = await res.json();
      console.log(data)
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Whatsapp Privacy Inspect</h1>
            <p className="text-lg text-gray-600 mb-6">Analyze your privacy and take required measures.</p>

            <div
                className="w-full max-w-xl border-2 border-dashed border-gray-300 rounded-lg p-6 bg-white hover:bg-gray-100 transition cursor-pointer"
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
                <label htmlFor="imageInput" className="block text-center text-gray-500">
                    Drag & drop images here, or <span className="text-blue-500 underline cursor-pointer">browse</span> (2–5 images)
                </label>

                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {images.map((img, idx) => (
                        <div key={idx} className="relative">
                            <img
                                src={img.url}
                                alt={idx}
                                className="w-full h-24 object-cover rounded shadow"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <button
                onClick={handleAnalyze}
                className="mt-6 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
                Analyze
            </button>

            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
        </div>
    );
}
