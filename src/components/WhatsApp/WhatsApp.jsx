import React from 'react';
import { FaWhatsapp } from "react-icons/fa";

function WhatsApp() {
  return (
    <a
      href="https://wa.me/919594430295" 
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 right-5 z-50"
    >
      <FaWhatsapp 
        className="w-16 h-16 text-green-500 hover:scale-110 transition-transform duration-300 bg-white rounded-full shadow-md p-2"
      />
    </a>
  );
}

export default WhatsApp;
