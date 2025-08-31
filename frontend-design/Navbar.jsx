import { useState } from 'react';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="relative flex items-center justify-between md:justify-start md:gap-10 text-white font-semibold font-inter text-base px-2  lg:px-8 py-1 z-10 w-full">

      {/* Left: Hamburger (mobile only) */}
      <button
        className="md:hidden w-6 h-6 z-30"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle Menu"
      >
        <svg
          className={`w-6 h-6 text-white transition-all duration-300 ease-in transform ${menuOpen ? 'rotate-90 scale-110' : 'rotate-0'
            }`}
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
              className="transition-all duration-500 ease-in"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
              className="transition-all duration-500 ease-in"
            />
          )}
        </svg>
      </button>


      {/* Logo */}
        <a href="/" className="z-10">
          <img
            src="/logo.png"
            alt="Site Logo"
            className="h-10 md:h-12"
          />
        </a>
      {/* Nav links for desktop */}
      <ul className="hidden md:flex md:font-normal lg:font-semibold md:justify-center md:items-center md:w-full md:gap-10 w-screen z-10">
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
      <ul
        className={`z-20 absolute top-0 left-0 py-3 flex flex-col items-center gap-6 md:hidden bg-black/70 backdrop-blur-xl w-full rounded-b-2xl transition-all duration-500 ease-in-out transform
    ${menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'}
  `}
      >

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

      {/* Right: Login button */}
      <button className="md:ml-auto font-light cursor-pointer px-2 py-1 text-white rounded-sm hover:bg-blue-950/50 transition duration-200 text-xs w-[8ch] md:w-auto md:text-base bg-[#9d7af0]/50 backdrop-blur-xl md:text-nowrap z-10">
        Gain Access
      </button>
    </nav>
  );
}
