"use client";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import RogueWiFiDetector from "@/components/roguewifi/RogueWiFiDetector";

export default function RogueWifiDetectorPage() {
  return (
    <main>
      <Navbar />
      <RogueWiFiDetector />
      <Footer />
    </main>
  );
}
