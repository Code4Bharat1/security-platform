"use client";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import LinkDetector from "@/components/linkdetector/LinkDetector";

export default function LinkDetectorPage() {
  return (
    <main>
      <Navbar />
      <LinkDetector />
      <Footer />
    </main>
  );
}
