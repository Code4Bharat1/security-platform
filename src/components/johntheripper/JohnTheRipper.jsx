"use client";
import { useState } from "react";
import { ShieldOff } from "lucide-react";
import sha256 from "crypto-js/sha256";
import sha1 from "crypto-js/sha1";
import md5 from "crypto-js/md5";

const dictionary = ["password", "admin", "123456", "letmein", "secret"];

export default function JohnTheRipper() {
  const [hash, setHash] = useState("");
  const [algorithm, setAlgorithm] = useState("SHA-256");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const crackHash = () => {
    if (!hash) return;
    setLoading(true);
    setResult(null);

    setTimeout(() => {
      let cracked = null;

      for (let word of dictionary) {
        let testHash = "";
        switch (algorithm) {
          case "SHA-256":
            testHash = sha256(word).toString();
            break;
          case "SHA-1":
            testHash = sha1(word).toString();
            break;
          case "MD5":
            testHash = md5(word).toString();
            break;
          default:
            break;
        }

        if (testHash === hash) {
          cracked = word;
          break;
        }
      }

      setResult(
        cracked
          ? `Password cracked: "${cracked}"`
          : "No match found in dictionary."
      );
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-20 px-4">
      <div className="text-center mb-10">
        <ShieldOff className="mx-auto mb-4 text-red-600" size={48} />
        <h1 className="text-3xl font-bold text-red-800">John The Ripper</h1>
        <p className="text-gray-600 mt-2">
          Cracks password hashes using smart attacks.
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-xl">
        <input
          type="text"
          placeholder="Enter hash to crack"
          value={hash}
          onChange={(e) => setHash(e.target.value)}
          className="w-full px-4 py-3 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
        />

        <select
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option>SHA-256</option>
          <option>SHA-1</option>
          <option>MD5</option>
        </select>

        <button
          onClick={crackHash}
          disabled={loading}
          className={`w-full py-3 rounded-md text-white font-semibold ${
            loading ? "bg-red-400 cursor-not-allowed" : "bg-red-700 hover:bg-red-800"
          }`}
        >
          {loading ? "Cracking..." : "Crack Password"}
        </button>

        {result && (
          <div className="mt-6 text-center">
            <p className="text-lg font-semibold text-red-700">{result}</p>
          </div>
        )}
      </div>
    </div>
  );
}
