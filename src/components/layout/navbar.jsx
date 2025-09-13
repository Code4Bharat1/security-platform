'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

const Navbar = () => {
  const [userName, setUserName] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const toolkitRef = useRef(null);
  const pathname = usePathname();
  const [toolkitOpen, setToolkitOpen] = useState(false);
  const [textColor, setTextColor] = useState('text-white');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if page has dark background
      const isDark = document.body.className.includes("bg-black") || 
                    document.body.className.includes("dark") ||
                    document.documentElement.className.includes("dark");
      setTextColor(isDark ? "text-white" : "text-black");
      
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUserName(parsedUser.name || parsedUser.email || 'User');
      }
    }

    const handleClickOutside = (event) => {
      // Close user dropdown if clicking outside
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      // Close toolkit dropdown if clicking outside
      if (toolkitRef.current && !toolkitRef.current.contains(event.target)) {
        setToolkitOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [pathname]);

  const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user'); // ✅ sahi tarika
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
    <nav className={`relative flex items-center justify-between md:justify-start md:gap-10 ${textColor} font-semibold font-inter text-base px-2 lg:px-8 py-1 z-10 w-full`}>
      
      {/* Left: Hamburger (mobile only) */}
      <button
        className="relative md:hidden w-6 h-6 z-30"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle Menu"
      >
        <svg
          className={`w-6 h-6 ${textColor} transition-all duration-300 ease-in transform ${menuOpen ? 'rotate-90 scale-110' : 'rotate-0'
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
      <Link href="/" className="z-10">
        <img
          src="/logo.png"
          alt="Site Logo"
          className="h-10 md:h-12"
        />
      </Link>

      {/* Nav links for desktop */}
      <ul className="hidden md:flex md:font-normal lg:font-semibold md:justify-center md:items-center md:w-full md:gap-10 w-screen z-10">
        <li>
          <Link href="/" className={navLinkClasses("/")}>Base</Link>
        </li>
        <li>
          <Link href="/about" className={navLinkClasses("/about")}>Our Vision</Link>
        </li>

        {/* Toolkit Dropdown (Desktop) */}
        <li className="relative group" ref={toolkitRef}>
          <button className={`${navLinkClasses("/toolkit")} flex items-center gap-1`} onClick={() => setToolkitOpen(!toolkitOpen)}>
            Toolkit
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <ul className={`absolute top-full mt-2 left-0 w-40 ${textColor === 'text-white' ? 'bg-black/80' : 'bg-white/80'} backdrop-blur-md rounded-md shadow-lg py-2 z-30 transition-opacity duration-200 ${toolkitOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
            <li><Link href="/tools/red-team" className={`block px-4 py-2 ${textColor === 'text-white' ? 'hover:bg-[#2a2a2a]' : 'hover:bg-gray-200'} ${textColor}`} onClick={() => setToolkitOpen(false)}>Red Team</Link></li>
            <li><Link href="/tools/blue-team" className={`block px-4 py-2 ${textColor === 'text-white' ? 'hover:bg-[#2a2a2a]' : 'hover:bg-gray-200'} ${textColor}`} onClick={() => setToolkitOpen(false)}>Blue Team</Link></li>
            <li><Link href="/tools/green-team" className={`block px-4 py-2 ${textColor === 'text-white' ? 'hover:bg-[#2a2a2a]' : 'hover:bg-gray-200'} ${textColor}`} onClick={() => setToolkitOpen(false)}>Green Team</Link></li>
            <li><Link href="/tools/purple-team" className={`block px-4 py-2 ${textColor === 'text-white' ? 'hover:bg-[#2a2a2a]' : 'hover:bg-gray-200'} ${textColor}`} onClick={() => setToolkitOpen(false)}>Purple Team</Link></li>
          </ul>
        </li>

        <li>
          <Link href="/services" className={navLinkClasses("/services")}>Services</Link>
        </li>
        {/* <li>
          <Link href="/connect" className={navLinkClasses("/connect")}>Connect</Link>
        </li> */}
      </ul>

      {/* Nav links for mobile */}
      <ul
        className={`z-20 absolute top-0 left-0 py-3 flex flex-col items-center gap-6 md:hidden ${textColor === 'text-white' ? 'bg-black/70' : 'bg-white/70'} backdrop-blur-xl w-full rounded-b-2xl transition-all duration-500 ease-in-out transform
    ${menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'}
  `}
      >
        <li>
          <Link href="/" className={navLinkClasses("/")} onClick={() => setMenuOpen(false)}>Home</Link>
        </li>
        <li>
          <Link href="/about" className={navLinkClasses("/about")} onClick={() => setMenuOpen(false)}>About Us</Link>
        </li>
        <li className="w-full">
          <details className="w-full group">
            <summary className={`${navLinkClasses("/toolkit")} cursor-pointer w-full text-center`}>
              Toolkit
            </summary>
            <ul className="flex flex-col gap-2 mt-2 text-sm text-center">
              <li><Link href="/tools/red-team" className={`block px-4 py-1 ${textColor === 'text-white' ? 'hover:bg-[#2a2a2a]' : 'hover:bg-gray-200'}`} onClick={() => setMenuOpen(false)}>Red Team</Link></li>
              <li><Link href="/tools/blue-team" className={`block px-4 py-1 ${textColor === 'text-white' ? 'hover:bg-[#2a2a2a]' : 'hover:bg-gray-200'}`} onClick={() => setMenuOpen(false)}>Blue Team</Link></li>
              <li><Link href="/tools/green-team" className={`block px-4 py-1 ${textColor === 'text-white' ? 'hover:bg-[#2a2a2a]' : 'hover:bg-gray-200'}`} onClick={() => setMenuOpen(false)}>Green Team</Link></li>
              <li><Link href="/tools/purple-team" className={`block px-4 py-1 ${textColor === 'text-white' ? 'hover:bg-[#2a2a2a]' : 'hover:bg-gray-200'}`} onClick={() => setMenuOpen(false)}>Purple Team</Link></li>
            </ul>
          </details>
        </li>
        <li>
          <Link href="/services" className={navLinkClasses("/services")} onClick={() => setMenuOpen(false)}>Services</Link>
        </li>
        <li>
          <Link href="/connect" className={navLinkClasses("/connect")} onClick={() => setMenuOpen(false)}>Connect</Link>
        </li>
      </ul>

      {/* Right: Login / Initials */}
      <div className="md:ml-auto relative" ref={dropdownRef}>
        {userName ? (
          <div>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className={`w-10 h-10 rounded-full hover:bg-blue-950/50 bg-[#9d7af0]/50 backdrop-blur-xl ${textColor} flex items-center justify-center font-bold text-sm transition duration-200`}
            >
              {getInitials(userName)}
            </button>
            {showDropdown && (
              <div className={`absolute right-0 mt-2 ${textColor === 'text-white' ? 'bg-[#1a1a1a]' : 'bg-white border border-gray-200'} ${textColor} rounded-lg shadow-lg py-2 px-4 z-50`}>
                <button
                  onClick={handleLogout}
                  className="hover:bg-blue-950/50 bg-[#9d7af0]/50 backdrop-blur-xl transition duration-200 px-3 py-1 rounded"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/gain-access"
            className={`md:ml-auto font-light cursor-pointer px-2 py-1 ${textColor} rounded-sm hover:bg-blue-950/50 transition duration-200 text-xs w-[8ch] md:w-auto md:text-base bg-[#9d7af0]/50 backdrop-blur-xl md:text-nowrap z-10`}>
            Gain Access
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;