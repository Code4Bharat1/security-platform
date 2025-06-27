"use client";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import SeoScoreAnalyzer from "@/components/seoanalyzer/SeoScoreAnalyzer";

export default function SeoScoreAnalyzerPage() {
  return (
    <main>
      <Navbar />
      <SeoScoreAnalyzer />
      <Footer />
    </main>
  );
}
