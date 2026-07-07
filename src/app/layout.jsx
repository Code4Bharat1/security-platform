import { Geist, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import WhatsApp from '@/components/WhatsApp/WhatsApp';
import Chatbot from '@/components/Chatbot/chatbot';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from "@/context/AuthContext";

const themeInitScript = `
  (() => {
    try {
      const root = document.documentElement;
      root.classList.remove("theme-light", "theme-dark");
      root.classList.add("theme-dark");
      root.style.colorScheme = "dark";
      root.dataset.theme = "dark";
      localStorage.setItem("nexcore-theme", "dark");
    } catch (error) {
      document.documentElement.classList.add("theme-dark");
      document.documentElement.style.colorScheme = "dark";
      document.documentElement.dataset.theme = "dark";
    }
  })();
`;

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: {
    template: '%s | Security Platform',
    default: 'Security Platform',
  },
  description: "By Code4Bharat",
};

export default function RootLayout({ children }) {
  // let pathname = usePathname()
  // pathname = pathname.split("/")
  // const bgColor = pathname[1] === "tools" && (!pathname[2].includes("red") && !pathname[2].includes("blue") && !pathname[2].includes("green") && !pathname[2].includes("non-tech") && !pathname[2].includes("purple")) && pathname.length < 4 ? "bg-white" : "bg-black";

  // console.log(pathname, bgColor)
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${spaceGrotesk.variable} ${geist.variable} ${jetBrainsMono.variable} antialiased`}
      >
        <AuthProvider>
          <Navbar />
          {children}
          <Toaster position="top-right" toastOptions={{
            style: {
              background: '#333',
              color: '#fff',
            },
          }} />
          < WhatsApp />
          < Chatbot />
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
