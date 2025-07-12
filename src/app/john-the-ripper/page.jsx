"use client";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import johnRipper from "@/components/john/JohnRipper";

export default function JohnTheRipperPage() {
  return (
    <main>
      <Navbar />
      <JohnRipper />
      <Footer />
    </main>
  );
}
