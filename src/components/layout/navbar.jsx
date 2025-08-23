'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

const Navbar = () => {
  const [userName, setUserName] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        console.log(1)
        setUserName(parsedUser.name || parsedUser.email || 'User');
      }
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUserName('');
    window.location.href = '/';
  };

  const getInitials = (name) => {
    const words = name.trim().split(' ');
    if (words.length === 1) return words[0][0].toUpperCase();
    return words[0][0].toUpperCase() + words[1][0].toUpperCase();
  };

  const isActive = (route) => pathname === route;

  const navLinkClasses = (route) =>
    `hover:text-[#9d7af0] transition-colors duration-200 ${isActive(route) ? 'border-b-2 border-[#9d7af0]' : ''
    }`;

  return (
    <nav className="relative bg-black flex items-center justify-between md:justify-start z-50 text-white font-semibold font-inter text-base px-2 sm:px-4 lg:px-5 py-2">

      {/* Hamburger */}
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

      <Link href="/">
        <img src="/logo.png" alt="Site Logo" className="h-8 md:h-10 lg:h-12" />
      </Link>

      {/* Desktop nav */}
      <ul className="hidden md:flex md:gap-10 justify-center items-center absolute left-0 right-0 w-screen px-6 lg:px-12">
        
        <li><Link href="/" className={navLinkClasses('/')}>Base</Link></li>
        <li><Link href="/about" className={navLinkClasses('/about')}>About Us</Link></li>
        <li><Link href="/tools" className={navLinkClasses('/tools')}>Toolkit</Link></li>
        <li><Link href="/services" className={navLinkClasses('/services')}>Services</Link></li>
        <li><Link href="/contact" className={navLinkClasses('/contact')}>Connect</Link></li>
      </ul>

      {/* Mobile nav */}
      {menuOpen && (
        <ul className="absolute top-[100%] left-[0] py-3 flex flex-col items-center gap-6 md:hidden bg-black w-full rounded-lg">
          <li><Link href="/home" className={navLinkClasses('/home')}>Home</Link></li>
          <li><Link href="/about" className={navLinkClasses('/about')}>About Us</Link></li>
          <li><Link href="/tools" className={navLinkClasses('/tools')}>Tools</Link></li>
          <li><Link href="/services" className={navLinkClasses('/services')}>Services</Link></li>
          <li><Link href="/contact" className={navLinkClasses('/contact')}>Contact</Link></li>
        </ul>
      )}

      {/* Right: Login / Initials */}
      <div className="md:ml-auto relative" ref={dropdownRef}>
        {userName ? (
          <div>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-10 h-10 rounded-full bg-[#9d7af0] text-white flex items-center justify-center font-bold text-sm hover:bg-[#a67fea] transition duration-200"
            >
              {getInitials(userName)}
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 bg-[#1a1a1a] text-white rounded-lg shadow-lg py-2 px-4 z-50">
                <button
                  onClick={handleLogout}
                  className="hover:text-[#9d7af0] transition duration-200"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/gain-access"
            className="px-4 sm:px-6 py-1.5 sm:py-2 bg-[#9d7af0] text-white rounded-lg hover:bg-[#a67fea] transition duration-200 text-sm sm:text-base text-nowrap"
          >
            Gain Access
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
