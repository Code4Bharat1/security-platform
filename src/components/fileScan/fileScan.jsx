"use client";

import { useState } from "react";

export default function FileScan() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
  };

  const handleSubmit = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("https://zypher-api.code4bharat.com/api/fileScan", {
        method: "POST",
        body: formData,
        // NOTE: DO NOT set Content-Type header manually! Let browser set it with boundary.
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h1>VirusTotal File Scan</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleSubmit} disabled={loading || !file} style={{ marginTop: 10 }}>
        {loading ? "Scanning..." : "Scan File"}
      </button>

      {result && (
        <pre style={{ marginTop: 20, whiteSpace: "pre-wrap", background: "#eee", padding: 10 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
