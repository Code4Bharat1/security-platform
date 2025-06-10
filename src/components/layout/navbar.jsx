import Link from "next/link";

const Navbar = () => {
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
        <div>
          <Link href="/signinForm">
            <button
              className="bg-white text-black w-12 h-7 md:text-lg text-xs md:w-30 md:h-10 md:rounded-xl rounded-sm font-semibold"
              suppressHydrationWarning
            >
              Sign In
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
