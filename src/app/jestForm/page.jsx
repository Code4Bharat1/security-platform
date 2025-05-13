"use client";
import { useState } from "react";
import JestForm from "@/components/jestForm/jestForm";
import JestReport from "@/components/jestReport/jestReport";

export default function Home() {
  const [report, setReport] = useState("");

  async function analyzeCode(code) {
    const res = await fetch("/api/jest-test", {
      method: "POST",
      body: JSON.stringify({ code }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    setReport(data.report);
  }

  return (
    <div>
      <h1>Jest Testing Platform</h1>
      <JestForm onSubmit={analyzeCode}/>
      <JestReport report={report} />
    </div>
  );
}
