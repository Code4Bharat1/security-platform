'use client';
import { useState, useRef } from 'react';
import axios from 'axios';

const FileCracker = () => {
  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadedFile(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:4180/api/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        }
      });
      setUploadedFile(response.data);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCrack = async () => {
    if (!uploadedFile) return;

    try {
      setLoading(true);
      setResult(null);
      const response = await axios.post('http://localhost:4180/api/crack', {
        filename: uploadedFile.filename
      });
      setResult(response.data);
    } catch (error) {
      console.error('Cracking failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setUploadedFile(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">File Password Cracker</h1>
        <p className="text-gray-600">Upload protected files to recover passwords</p>
      </div>

      <div className="space-y-6">
        {/* File Upload Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select a protected file
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex-1 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition-colors"
                >
                  {file ? (
                    <span className="text-gray-700 font-medium">{file.name}</span>
                  ) : (
                    <span className="text-gray-500">Choose file (ZIP, RAR, PDF)...</span>
                  )}
                </label>
                {file && (
                  <button
                    onClick={resetAll}
                    className="px-4 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {file && !uploadedFile && (
              <button
                onClick={handleUpload}
                disabled={loading}
                className={`px-6 py-3 rounded-full font-medium text-white transition-all ${
                  loading
                    ? 'bg-green-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg'
                }`}
              >
                {loading ? `Uploading... ${progress}%` : 'Upload File'}
              </button>
            )}
          </div>
        </div>

        {/* Crack Section */}
        {uploadedFile && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium text-gray-800">{uploadedFile.originalname}</h3>
                <p className="text-sm text-gray-500">
                  {(uploadedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <button
                onClick={handleCrack}
                disabled={loading || result}
                className={`px-6 py-3 rounded-full font-medium text-white transition-all ${
                  loading
                    ? 'bg-blue-400 cursor-not-allowed'
                    : result
                    ? 'bg-purple-600 cursor-default'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                }`}
              >
                {loading
                  ? 'Cracking...'
                  : result
                  ? 'Password Found!'
                  : 'Crack Password'}
              </button>
            </div>

            {loading && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full animate-pulse"
                  style={{ width: `${Math.random() * 30 + 70}%` }}
                ></div>
              </div>
            )}
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div
            className={`p-6 rounded-lg shadow-sm border ${
              result.cracked
                ? 'bg-green-50 border-green-200'
                : 'bg-yellow-50 border-yellow-200'
            }`}
          >
            <h3 className="text-xl font-bold mb-2">
              {result.cracked ? '🎉 Password Found!' : '🔐 Password Not Found'}
            </h3>
            {result.cracked ? (
              <div className="space-y-2">
                <p className="text-gray-700">
                  The password for your file is:
                </p>
                <div className="p-3 bg-white rounded-md border border-green-200">
                  <code className="text-2xl font-mono font-bold text-green-600">
                    {result.password}
                  </code>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Save this password in a secure location.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-gray-700">
                  We couldn't find the password using our current wordlist.
                </p>
                <p className="text-sm text-gray-500">
                  Try again with a different wordlist or file.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default johnRipper;