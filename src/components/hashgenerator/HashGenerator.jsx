"use client";
import { useState } from "react";
import { FileText } from "lucide-react";
import sha256 from "crypto-js/sha256";
import sha1 from "crypto-js/sha1";
import md5 from "crypto-js/md5";

export default function HashGenerator() {
  const [text, setText] = useState("");
  const [algorithm, setAlgorithm] = useState("SHA-256");
  const [hash, setHash] = useState("");

  const generateHash = () => {
    if (!text) return;

    let result = "";
    switch (algorithm) {
      case "SHA-256":
        result = sha256(text).toString();
        break;
      case "SHA-1":
        result = sha1(text).toString();
        break;
      case "MD5":
        result = md5(text).toString();
        break;
      default:
        break;
    }
    setHash(result);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-20 px-4">
      <div className="text-center mb-10">
        <FileText className="mx-auto mb-4 text-green-600" size={48} />
        <h1 className="text-3xl font-bold text-green-800">Hash Generator</h1>
        <p className="text-gray-600 mt-2">
          This tool generates cryptographic hashes.
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-xl">
        <textarea
          rows={3}
          placeholder="Enter text to hash"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full px-4 py-3 mb-4 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <select
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option>SHA-256</option>
          <option>SHA-1</option>
          <option>MD5</option>
        </select>

        <button
          onClick={generateHash}
          className="w-full py-3 rounded-md text-white font-semibold bg-green-700 hover:bg-green-800"
        >
          Generate Hash
        </button>

        {hash && (
          <div className="mt-6">
            <p className="text-green-800 font-semibold mb-1">Generated Hash:</p>
            <div className="break-all bg-gray-100 p-4 rounded-md border">
              {hash}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
