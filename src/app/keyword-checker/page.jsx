import KeywordPage from "@/components/KeywordForm/KeywordForm";
import Footer from "@/components/layout/footer";
import Navbar from "@/components/layout/navbar";
import React from "react";

export default function Home() {
  return (
    <div>
      <Navbar />
      <KeywordPage />
      <Footer />
    </div>
  );
}
