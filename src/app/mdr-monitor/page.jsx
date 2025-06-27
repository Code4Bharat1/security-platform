import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import MdrMonitor from "@/components/mdr/MdrMonitor"; // or Mdr

export default function MdrMonitorPage() {
  return (
    <main>
      <Navbar />
      <MdrMonitor />
      <Footer />
    </main>
  );
}
