"use client";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import CaptchaAuditTool from "@/components/captcha/CaptchaAuditTool";

export default function CaptchaAuditToolPage() {
  return (
    <main>
      <Navbar />
      <CaptchaAuditTool />
      <Footer />
    </main>
  );
}
