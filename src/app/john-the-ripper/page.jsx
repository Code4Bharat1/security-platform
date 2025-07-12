"use client";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import JohnRipper from "@/components/john/JohnRipper";
// import johnRipper from "@/components/john/JohnRipper";

export default function Page() {
  return (
    <main>
      <Navbar />
      <JohnRipper/>
      <Footer />
    </main>
  );
}
