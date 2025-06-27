"use client";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import FileMetadataAnalyzer from "@/components/filemetadata/FileMetadataAnalyzer";

export default function FileMetadataAnalyzerPage() {
  return (
    <main>
      <Navbar />
      <FileMetadataAnalyzer />
      <Footer />
    </main>
  );
}
