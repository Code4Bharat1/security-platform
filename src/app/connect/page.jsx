'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react';

import EngagementCta from '@/components/marketing/EngagementCta';
import SectionIntro from '@/components/marketing/SectionIntro';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const API_URL = process.env.NEXT_PUBLIC_PROD_API_URL || 'http://127.0.0.1:5000/api';
    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, phone }),
      });
      if (res.ok) {
        setStatus('Message sent successfully!');
        setName(''); setPhone(''); setEmail(''); setMessage('');
      } else {
        setStatus('Failed to send message.');
      }
    } catch (err) {
      console.error(err);
      setStatus('Something went wrong.');
    }
  }

  return (
    <main className="site-page-shell bg-[#050505] text-white">
      <section className="border-b border-white/6">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionIntro
            eyebrow="Contact"
            title="Let's talk about your security program."
            description="Tell us about your environment and goals. A senior consultant will get back within one business day."
            className="mb-12"
          />

          <div className="grid gap-6 xl:grid-cols-[1.55fr_0.75fr]">
            <div className="glow-panel p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Full name">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="contact-input"
                      required
                    />
                  </Field>
                  <Field label="Work email">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="contact-input"
                      required
                    />
                  </Field>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Phone">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 95944 30295"
                      className="contact-input"
                    />
                  </Field>
                  <div className="surface-panel flex min-h-[5.8rem] items-center justify-center p-5 text-center text-xs uppercase tracking-[0.28em] text-white/32">
                    Secure intake · NDA on request
                  </div>
                </div>

                <Field label="How can we help?">
                  <textarea
                    rows={7}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your environment, timeline, and goals."
                    className="contact-input min-h-40 resize-y"
                    required
                  />
                </Field>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <button type="submit" className="gold-button">
                    Send Message
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  {status ? (
                    <p className="text-sm text-emerald-300">{status}</p>
                  ) : (
                    <p className="text-sm text-[var(--muted)]">
                      Response target: within one business day.
                    </p>
                  )}
                </div>
              </form>
            </div>

            <div className="space-y-4">
              <InfoCard icon={Mail} label="Email" value="director@nexcorealliance.com" href="mailto:director@nexcorealliance.com" />
              <InfoCard icon={Phone} label="Phone" value="+91 95944 30295" href="tel:+919594430295" />
              <InfoCard icon={MapPin} label="HQ" value="Off BKC, Mumbai, India 400070" />
              <article className="surface-panel p-6">
                <p className="eyebrow mb-5 text-white/40">Response Time</p>
                <p className="text-sm leading-8 text-[var(--muted)]">
                  All inquiries answered within <span className="text-[var(--gold)]">one business day</span>.
                  Critical incidents: 24x7 via our SOC hotline.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <EngagementCta
        title="Ready to harden your security perimeter?"
        primaryHref="/connect"
        primaryLabel="Request Assessment"
        secondaryHref="/gain-access"
        secondaryLabel="Talk To A Consultant"
      />
    </main>
  );
}

function Field({ label, children }) {
  return (
    <label className="block space-y-3">
      <span className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-white/40">
        {label}
      </span>
      {children}
    </label>
  );
}

function InfoCard({ icon: Icon, label, value, href }) {
  const content = (
    <article className="surface-panel flex items-start gap-4 p-5">
      <span className="inline-flex h-11 w-11 items-center justify-center border border-[var(--gold)]/22 text-[var(--gold)]">
        <Icon className="h-4 w-4" />
      </span>
      <div className="space-y-2">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-white/40">
          {label}
        </p>
        <p className="text-sm leading-7 text-white/82">{value}</p>
      </div>
    </article>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
}
