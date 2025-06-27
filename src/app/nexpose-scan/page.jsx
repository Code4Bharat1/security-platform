"use client";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import NexposeScanner from "@/components/nexpose/NexposeScanner";

export default function NexposeScanPage() {
  return (
    <main>
      <Navbar />
      <NexposeScanner />
      <Footer />
    </main>
  );
}
