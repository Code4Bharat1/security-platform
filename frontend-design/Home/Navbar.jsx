import { useState } from 'react';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="flex items-center justify-between md:justify-start md:gap-10 z-50 text-white font-semibold font-inter text-base px-4 sm:px-6 lg:px-8 py-3">
        {/* Left: Hamburger (mobile only) */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle Menu"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

          <a href="/">
            <img src="/logo.png" alt="Site Logo" className="h-10 md:h-12 lg:h-15" />
          </a>
        
        {/* Nav links for desktop */}
      <ul className="hidden md:flex md:justify-center md:items-center md:w-full md:gap-10">
        <li>
          <a href="/home" className="hover:text-[#9d7af0] transition-colors duration-200">Home</a>
        </li>
        <li>
          <a href="/about" className="hover:text-[#9d7af0] transition-colors duration-200">About Us</a>
        </li>
        <li>
          <a href="/tools" className="hover:text-[#9d7af0] transition-colors duration-200">Toolkit</a>
        </li>
        <li>
          <a href="/services" className="hover:text-[#9d7af0] transition-colors duration-200">Services</a>
        </li>
        <li>
          <a href="/contact" className="hover:text-[#9d7af0] transition-colors duration-200">Contact</a>
        </li>
      </ul>

      {/* Nav links for mobile */}
      {menuOpen && (
        <ul className="flex flex-col items-center gap-6 mt-4 md:hidden bg-[#1a1a1a] py-6 w-full rounded-lg">
          <li>
            <a href="/home" className="hover:text-[#9d7af0] transition-colors duration-200">Home</a>
          </li>
          <li>
            <a href="/about" className="hover:text-[#9d7af0] transition-colors duration-200">About Us</a>
          </li>
          <li>
            <a href="/tools" className="hover:text-[#9d7af0] transition-colors duration-200">Tools</a>
          </li>
          <li>
            <a href="/services" className="hover:text-[#9d7af0] transition-colors duration-200">Services</a>
          </li>
          <li>
            <a href="/contact" className="hover:text-[#9d7af0] transition-colors duration-200">Contact</a>
          </li>
        </ul>
      )}
        {/* Right: Login button */}
        <div className="md:ml-auto">
          <button className="px-4 sm:px-6 py-1.5 sm:py-2 bg-[#9d7af0] text-white rounded-lg hover:bg-[#a67fea] transition duration-200 text-sm sm:text-base">
            Login
          </button>
        </div>
    </nav>
  );
}
