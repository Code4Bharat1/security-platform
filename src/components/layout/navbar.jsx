'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Menu, UserRound, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import BrandMark from '@/components/marketing/BrandMark';

const navItems = [
  { href: '/services', label: 'Services' },
  { href: '/tools', label: 'Platform' },
  { href: '/about', label: 'Company' },
  { href: '/connect', label: 'Contact' },
  { href: '/history', label: 'History' },
  // { href: '/admin', label: 'Admin Dashboard'}
];

const telemetryItems = [
  'SOC OPERATIONAL',
  'THREAT FEEDS ACTIVE',
  'GLOBAL TELEMETRY 100%',
];

export default function Navbar() {
  const pathname = usePathname();
  const dropdownRef = useRef(null);

  const [userName, setUserName] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUserName(parsed.name || parsed.email || 'User');
    } else {
      setUserName('');
    }
  }, [pathname]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = useMemo(() => {
    if (!userName) {
      return '';
    }

    const parts = userName.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }, [userName]);

  const visibleNavItems = useMemo(() => {
    return navItems.filter((item) => {
      if (item.href === '/history') {
        return !!userName;
      }
      return true;
    });
  }, [userName]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUserName('');
    setShowDropdown(false);
    window.location.href = '/';
  };


  const isActive = (href) => {
    if (href === '/') {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--border)] bg-[color:var(--nav-bg)] backdrop-blur-xl">
      <div className="hidden border-b border-[color:var(--border)] md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 text-[0.62rem] uppercase tracking-[0.32em] text-[color:var(--text-muted)] lg:px-8">
          <div className="flex items-center gap-6">
            {telemetryItems.map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]/85" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-10">
          <BrandMark href={null} />

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/"
              className={`mono-heading text-sm tracking-[-0.02em] transition ${isActive('/') ? 'font-medium text-white' : 'text-white/54 hover:text-white'
                }`}
            >
              Home
            </Link>
            {visibleNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`mono-heading text-sm tracking-[-0.02em] transition ${isActive(item.href)
                    ? 'font-medium text-white'
                    : 'text-white/54 hover:text-white'
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-4 md:flex" ref={dropdownRef}>
          {userName ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDropdown((current) => !current)}
                className="flex h-11 w-11 items-center justify-center border border-[color:var(--border)] bg-[color:var(--surface-card)] font-mono text-sm text-[color:var(--text-heading)] transition hover:border-[color:var(--gold)] hover:text-[color:var(--gold)]"
                aria-label="Open account menu"
              >
                {initials || <UserRound className="h-4 w-4" />}
              </button>
              {showDropdown ? (
                <div className="absolute right-0 top-full mt-3 min-w-44 border border-[color:var(--border)] bg-[color:var(--surface-raised)] p-2 shadow-2xl">
                  <p className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.24em] text-[color:var(--text-muted)] border-b border-[color:var(--border)] mb-1">
                    Account Menu
                  </p>
                  <Link
                    href="/credits"
                    onClick={() => setShowDropdown(false)}
                    className="block px-3 py-2 text-left text-sm text-[color:var(--text-body)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--text-heading)]"
                  >
                    Credits
                  </Link>
                  <Link
                    href="/subscription"
                    onClick={() => setShowDropdown(false)}
                    className="block px-3 py-2 text-left text-sm text-[color:var(--text-body)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--text-heading)] border-b border-[color:var(--border)] pb-2 mb-1"
                  >
                    Billing & Plan
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-3 py-2 text-left text-sm text-[color:var(--text-body)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--text-heading)]"
                  >
                    Sign out
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <Link href="/gain-access" className="mono-heading text-sm tracking-[-0.02em] text-[color:var(--text-body)] transition hover:text-[color:var(--text-heading)]">
              Sign in
            </Link>
          )}
          <Link href="/connect" className="gold-button">
            Request Assessment
          </Link>
        </div>
 
        <button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          className="inline-flex h-11 w-11 items-center justify-center border border-[color:var(--border)] bg-[color:var(--surface-card)] text-[color:var(--text-heading)] transition hover:border-[color:var(--gold)] hover:text-[color:var(--gold)] md:hidden"
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
 
      {menuOpen ? (
        <div className="border-t border-[color:var(--border)] md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 sm:px-6">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className={`border px-4 py-3 text-xs uppercase tracking-[0.18em] transition ${isActive('/')
                  ? 'border-[color:var(--gold)] bg-[color:var(--surface-subtle)] text-[color:var(--text-heading)]'
                  : 'border-[color:var(--border)] bg-[color:var(--surface-card)] text-[color:var(--text-body)] hover:text-[color:var(--text-heading)]'
                }`}
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Home
            </Link>
            {visibleNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`border px-4 py-3 text-xs uppercase tracking-[0.18em] transition ${isActive(item.href)
                    ? 'border-[color:var(--gold)] bg-[color:var(--surface-subtle)] text-[color:var(--text-heading)]'
                    : 'border-[color:var(--border)] bg-[color:var(--surface-card)] text-[color:var(--text-body)] hover:text-[color:var(--text-heading)]'
                  }`}
                style={{ fontFamily: "var(--font-display)" }}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-3 border-t border-[color:var(--border)] pt-4">
              {userName ? (
                <>
                  <Link
                    href="/credits"
                    onClick={() => setMenuOpen(false)}
                    className="flex h-11 items-center justify-center border border-[color:var(--border)] bg-[color:var(--surface-card)] text-xs uppercase tracking-[0.18em] text-[color:var(--text-body)] hover:text-[color:var(--text-heading)]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    Credits
                  </Link>
                  <Link
                    href="/subscription"
                    onClick={() => setMenuOpen(false)}
                    className="flex h-11 items-center justify-center border border-[color:var(--border)] bg-[color:var(--surface-card)] text-xs uppercase tracking-[0.18em] text-[color:var(--text-body)] hover:text-[color:var(--text-heading)] mb-2"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    Billing & Plan
                  </Link>
                  <button type="button" onClick={handleLogout} className="ghost-button justify-center">
                    Sign out
                  </button>
                </>
              ) : (
                <Link href="/gain-access" onClick={() => setMenuOpen(false)} className="ghost-button justify-center">
                  Sign in
                </Link>
              )}
              <Link href="/connect" onClick={() => setMenuOpen(false)} className="gold-button justify-center">
                Request Assessment
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
