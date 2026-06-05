import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

import BrandMark from '@/components/marketing/BrandMark';

const columns = [
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Join The Network', href: '/join-the-network' },
      { label: 'Gain Access', href: '/gain-access' },
      { label: 'Schedule A Call', href: '/connect' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'Vulnerability Assessment', href: '/services/vulnerability-assessment' },
      { label: 'Penetration Testing', href: '/services/penetration-testing' },
      { label: 'Managed Detection & Response', href: '/services/security-operations-center' },
      { label: 'Cloud Security', href: '/services/cloud-security' },
      { label: 'Compliance Advisory', href: '/services/cybersecurity-consultancy' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Red Team', href: '/tools' },
      { label: 'Green Team Research', href: '/tools' },
      { label: 'Blue Team', href: '/tools' },
      { label: 'Purple Team', href: '/tools' },
      { label: 'VA', href: '/tools' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/tools/privacypolicy' },
      { label: 'Terms of Service', href: '/tools/termscondition' }
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-[color:var(--border)] bg-[color:var(--nav-bg)]">
      <div className="mx-auto grid max-w-7xl gap-16 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_repeat(4,minmax(0,1fr))] lg:px-8">
        <div className="space-y-8">
          <BrandMark href="/" />
          <p className="max-w-sm text-sm leading-8 text-white">
            Enterprise cybersecurity for organizations operating in regulated, high-stakes
            environments. Assessment, remediation, and 24x7 managed defense.
          </p>
          <div className="space-y-2 text-sm text-white">
            <p>director@nexcorealliance.com</p>
            <p>+91 95944 30295</p>
            <p className="text-white">Mumbai · Dubai · Johannesburg</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="https://www.linkedin.com/company/nexcore-alliance/posts/?feedView=all"
              target="_blank"
              className="inline-flex h-10 w-10 items-center justify-center border border-white/8 text-white transition hover:border-[var(--gold)]/45 hover:text-[var(--gold)]"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
            </Link>
            <Link
              href="https://x.com/Code4Bharat"
              target="_blank"
              className="inline-flex h-10 w-10 items-center justify-center border border-white/8 text-white transition hover:border-[var(--gold)]/45 hover:text-[var(--gold)]"
              aria-label="X"
            >
              <Twitter className="h-4 w-4" />
            </Link>
            <Link
              href="https://www.facebook.com/login/?next=https%3A%2F%2Fwww.facebook.com%2F"
              target="_blank"
              className="inline-flex h-10 w-10 items-center justify-center border border-white/8 text-white transition hover:border-[var(--gold)]/45 hover:text-[var(--gold)]"
              aria-label="Facebook"
            >
              <Facebook className="h-4 w-4" />
            </Link>
            <Link
              href="https://www.instagram.com/"
              target="_blank"
              className="inline-flex h-10 w-10 items-center justify-center border border-white/8 text-white transition hover:border-[var(--gold)]/45 hover:text-[var(--gold)]"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {columns.map((column) => (
          <div key={column.title} className="space-y-5">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-white">
              {column.title}
            </p>
            <ul className="space-y-3">
              {column.links.map((link) => (
                <li key={`${column.title}-${link.href}-${link.label}`}>
                  <Link
                    href={link.href}
                    className="text-sm leading-7 text-white transition hover:text-[var(--gold)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-[color:var(--border)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 text-[0.68rem] uppercase tracking-[0.26em] text-white sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>© 2026 Nexcore Alliance Pvt. Ltd. All rights reserved.</p>
          <p>SOC 2 Type II · ISO 27001:2022 · Cert-In Empanelled</p>
        </div>
      </div>
    </footer>
  );
}
