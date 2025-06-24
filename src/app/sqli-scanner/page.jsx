"use client";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import SQLiScanner from "@/components/sqliscanner/SQLiScanner"; // ✅ sahi component

export default function SQLiScannerPage() {
  return (
    <main>
      <Navbar />
      <SQLiScanner />
      <Footer />
    </main>
  );
}
