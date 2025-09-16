import React from 'react';
import { FaWhatsapp } from "react-icons/fa";

function WhatsApp() {
  return (
    <a
      href="https://wa.me/919594430295" 
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-15 right-10 z-50"
    >
      <div className="w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center  shadow-lg hover:scale-110 transition-transform duration-300">
        <FaWhatsapp className="text-white w-20 h-20" />
      </div>
    </a>
  );
}

export default WhatsApp;
