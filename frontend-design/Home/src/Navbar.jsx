import { useState } from 'react';

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className="flex items-center justify-between text-white font-semibold font-inter text-base px-8 pt-2">
            {/* Logo */}
            <a href="/">
                <img src="/logo.png" alt="Site Logo" className="h-15" />
            </a>

            {/* Tab name - mobile only*/}
            <div className='md:hidden focus:outline-none'>
                Home
            </div>

            {/* Hamburger Button - mobile only */}
            <button
                className="md:hidden focus:outline-none"
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

            {/* Navigation Links */}
            <ul
                className={`${menuOpen ? 'flex' : 'hidden'
                    } absolute top-[70px] left-0 w-full flex-col items-center gap-6 bg-[#1a1a1a] py-6 z-50 md:static md:flex md:flex-row md:gap-10 md:w-auto md:bg-transparent md:py-0`}
            >
                <li>
                    <a href="/home">Home</a>
                </li>
                <li>
                    <a href="/about">About Us</a>
                </li>
                <li>
                    <a href="/tools">Tools</a>
                </li>
                <li>
                    <a href="/services">Services</a>
                </li>
                <li>
                    <a href="/contact">Contact</a>
                </li>
            </ul>

            {/* Login Button - stays on the right in desktop, stacks on mobile */}
            <div className="hidden md:block">
                <button className="px-8 py-1 bg-[#9d7af0] text-white rounded-lg cursor-pointer">
                    Login
                </button>
            </div>

            {/* Mobile login button under menu if open */}
            {menuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-[#1a1a1a] py-4 flex justify-center">
                    <button className="px-8 py-2 bg-[#A67FEA] text-white rounded-lg">
                        Login
                    </button>
                </div>
            )}
        </nav>
    );
}
