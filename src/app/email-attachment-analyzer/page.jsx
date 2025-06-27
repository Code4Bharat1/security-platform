"use client";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import EmailAttachmentAnalyzer from "@/components/email/EmailAttachmentAnalyzer";

export default function EmailAnalyzerPage() {
  return (
    <main>
      <Navbar />
      <EmailAttachmentAnalyzer />
      <Footer />
    </main>
  );
}
