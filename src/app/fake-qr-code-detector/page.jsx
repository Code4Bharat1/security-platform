import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import FakeQrCodeDetector from "@/components/fakeqr/FakeQrCodeDetector";

export default function FakeQrPage() {
  return (
    <main>
      <Navbar />
      <FakeQrCodeDetector />
      <Footer />
    </main>
  );
}
