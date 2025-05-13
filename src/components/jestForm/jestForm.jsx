"use client";
import { useState } from "react";

export default function JestForm({ onSubmit }) {
  const [code, setCode] = useState("");

  return (
    <div>
      <textarea
        placeholder="Enter your application code here"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button onClick={() => onSubmit(code)}>Run Analysis</button>
    </div>
  );
}
