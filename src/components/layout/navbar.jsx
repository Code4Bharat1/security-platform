'use client';
import Link from "next/link";
import { useEffect, useState, useRef } from "react";

const Navbar = () => {
  const [userName, setUserName] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUserName(parsedUser.name || parsedUser.email || 'User');
      }
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUserName('');
    window.location.href = '/'; // Redirect to homepage
  };

  return (
    <nav className="bg-[#515c40] text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="md:text-lg font-bold text-sm">
          <Link href="/" className="md:text-lg text-md">
            Security Platform
          </Link>
        </div>
        <ul className="flex md:space-x-10 md:text-lg space-x-2 text-sm">
          <li>
            <Link href="/" className="hover:text-gray-300">
              Home
            </Link>
          </li>
          <li>
            <Link href="/about" className="hover:text-gray-300">
              About
            </Link>
          </li>
          <li>
            <Link href="/tools" className="hover:text-gray-300">
              Tools
            </Link>
          </li>
          <li>
            <Link href="/contact" className="hover:text-gray-300">
              Contact
            </Link>
          </li>
        </ul>

        {/* Right Side */}
        <div className="relative" ref={dropdownRef}>
          {userName ? (
            <>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="bg-white text-black w-auto px-3 h-7 md:text-lg text-xs md:h-10 md:rounded-xl rounded-sm font-semibold flex items-center justify-center"
              >
                {userName}
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg py-2 z-50">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    Logout
                  </button>

                </div>
              )}
            </>
          ) : (
            <Link href="/signinForm">
              <button
                className="bg-white text-black w-12 h-7 md:text-lg text-xs md:w-30 md:h-10 md:rounded-xl rounded-sm font-semibold cursor-pointer hover:bg-gray-200 transition-colors duration-300"
                suppressHydrationWarning
              >
                Sign In
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
