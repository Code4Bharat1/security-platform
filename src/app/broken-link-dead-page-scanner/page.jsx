"use client";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import BrokenLinkScanner from "@/components/brokenlinks/BrokenLinkScanner";

export default function BrokenLinkScannerPage() {
  return (
    <main>
      <Navbar />
      <BrokenLinkScanner />
      <Footer />
    </main>
  );
}
