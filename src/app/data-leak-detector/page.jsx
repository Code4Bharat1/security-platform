"use client";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import LeakDetector from "@/components/dataleak/LeakDetector";

export default function LeakDetectorPage() {
  return (
    <main>
      <Navbar />
      <LeakDetector />
      <Footer />
    </main>
  );
}
