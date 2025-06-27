"use client";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import FolderThreatScanner from "@/components/folderthreat/FolderThreatScanner";

export default function FolderScannerPage() {
  return (
    <main>
      <Navbar />
      <FolderThreatScanner />
      <Footer />
    </main>
  );
}
