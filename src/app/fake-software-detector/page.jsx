"use client";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import FakeSoftwareDetector from "@/components/fakesoftware/FakeSoftwareDetector";

export default function FakeSoftwarePage() {
  return (
    <main>
      <Navbar />
      <FakeSoftwareDetector />
      <Footer />
    </main>
  );
}
