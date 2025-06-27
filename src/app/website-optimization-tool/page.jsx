"use client";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import WebsiteOptimizationTool from "@/components/websiteoptimization/WebsiteOptimizationTool";

export default function WebsiteOptimizationToolPage() {
  return (
    <main>
      <Navbar />
      <WebsiteOptimizationTool />
      <Footer />
    </main>
  );
}
