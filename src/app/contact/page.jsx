'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch('https://zypher.code4bharat.com/api/contact', {
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
    <div className="min-h-screen w-full bg-black text-white overflow-x-hidden relative">
      {/* ===== Top breadcrumb (optional) ===== */}
      <div
        className="relative h-16 md:h-20 w-full overflow-hidden"
        style={{
          backgroundImage: `url('/images/contact-hero.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-700/40 via-purple-700/30 to-indigo-800/40" />
        <div className="absolute inset-x-0 bottom-0 h-[6px] bg-black/90" />
        <div className="relative z-10 flex h-full items-center justify-center">
          <nav className="flex items-center gap-5 text-xs md:text-sm font-semibold tracking-widest text-white uppercase">
            <Link href="/" className="hover:text-white/90">Home</Link>
            <div className="relative flex items-center gap-1">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-1">
                <span className="h-1 w-1 rounded-full bg-white/90" />
                <span className="h-1 w-1 rounded-full bg-white/90" />
                <span className="h-1 w-1 rounded-full bg-white/90" />
              </span>
              <span className="tracking-[0.3em] select-none">››››</span>
            </div>
            <span className="pointer-events-none">Contact</span>
          </nav>
        </div>
      </div>

      {/* ===== Background circles inside black bg (STATIC) ===== */}
      {/* Background circles inside black bg (STATIC) */}
{/* Background circles inside black bg (STATIC, more visible) */}
<div className="absolute inset-0 z-0 pointer-events-none">
  {/* Purple glow */}
  <div className="absolute left-10 top-24 h-80 w-80 rounded-full bg-purple-400/70 blur-2xl" />
  
  {/* Pink glow */}
  <div className="absolute right-16 bottom-28 h-72 w-72 rounded-full bg-purple-400/70 blur-2xl" />
  
  {/* Blue glow */}
  <div className="absolute right-10 top-20 h-72 w-72 rounded-full bg-blue-400/70 blur-2xl" />
  
  {/* Violet glow */}
  <div className="absolute left-20 bottom-16 h-64 w-64 rounded-full bg-violet-400/70 blur-2xl" />
</div>



      {/* ===== Main canvas: push the form to the right ===== */}
      <div className="relative mx-auto w-full max-w-6xl px-4 py-12">
        <div className="relative flex min-h-[70vh] items-start justify-end">
          {/* === MAIN FORM (Right side) === */}
          <div className="relative z-0 w-full max-w-xl rounded-[22px] p-[2px]
                          bg-[linear-gradient(to_bottom,#A580FF_0%,#A580FF_65%,#000000_100%)]
                          shadow-[0_35px_90px_-25px_rgba(124,58,237,.5)] overflow-visible">
            <div className="relative rounded-[20px] bg-transparent px-6 py-12 md:px-8 md:py-14">
              
              {/* === OVERLAPPING CONTACT DETAILS (30% overlap left) — desktop only === */}
              <div className="hidden md:block">
                <div className="absolute -left-[30%] top-[10%] z-10 w-[300px]">
                  <div className="rounded-[18px] p-[2px]
                                  bg-[linear-gradient(to_bottom,#A580FF_0%,#A580FF_65%,#000000_100%)]
                                  shadow-[0_25px_70px_-25px_rgba(124,58,237,.55)]">
                    <div className="rounded-[16px] bg-transparent p-5">
                      <h3 className="mb-3 text-lg font-semibold">Contact Details</h3>
                      <div className="mb-4 h-[2px] w-28 bg-white/20" />
                      <ul className="space-y-3 text-[13.5px] text-white/90">
                        <li className="flex items-center gap-2">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/10">✉</span>
                          <a href="mailto:director@nexcorealliance.com" className="hover:text-white">
                            director@nexcorealliance.com
                          </a>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/10">☎</span>
                          <a href="tel:+919594430295" className="hover:text-white">
                            +91 95944 30295
                          </a>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/10">📍</span>
                          <span>Off BKC, Mumbai, India 400070</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* === FORM === */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="mb-1 block text-sm font-medium text-white/70">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter Your Name"
                    className="w-full rounded-md border border-white/20 bg-black/30 px-3 py-2 
                               text-sm text-white placeholder-white/40 outline-none focus:border-purple-300"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-white/70">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter Your Phone Number"
                    className="w-full rounded-md border border-white/20 bg-black/30 px-3 py-2 
                               text-sm text-white placeholder-white/40 outline-none focus:border-purple-300"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-white/70">E-Mail Id</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter Your E-Mail id"
                    className="w-full rounded-md border border-white/20 bg-black/30 px-3 py-2 
                               text-sm text-white placeholder-white/40 outline-none focus:border-purple-300"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-white/70">Message</label>
                  <textarea
                    rows={7}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your message"
                    className="w-full resize-y rounded-md border border-white/20 bg-black/30 px-3 py-2 
                               text-sm text-white placeholder-white/40 outline-none focus:border-purple-300"
                    required
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    className="mx-auto block w-48 rounded-md bg-black py-2 text-sm font-semibold text-white shadow-md hover:bg-[#1b1b1b]"
                  >
                    Send Message
                  </button>
                </div>
              </form>

              {status && <p className="mt-6 text-center text-sm text-emerald-300">{status}</p>}
            </div>
          </div>

          {/* Mobile: show details below (no overlap) */}
          <div className="mt-8 w-full md:hidden">
            <div className="rounded-[18px] p-[2px]
                            bg-[linear-gradient(to_bottom,#A580FF_0%,#A580FF_65%,#000000_100%)]">
              <div className="rounded-[16px] bg-transparent p-5">
                <h3 className="mb-3 text-lg font-semibold">Contact Details</h3>
                <div className="mb-4 h-[2px] w-28 bg-white/20" />
                <ul className="space-y-3 text-[13.5px] text-white/90">
                  <li className="flex items-center gap-2">✉
                    <a href="mailto:director@nexcorealliance.com" className="ml-2 hover:text-white">
                      director@nexcorealliance.com
                    </a>
                  </li>
                  <li className="flex items-center gap-2">☎
                    <a href="tel:+919594430295" className="ml-2 hover:text-white">
                      +91 95944 30295
                    </a>
                  </li>
                  <li className="flex items-start gap-2">📍
                    <span className="ml-2">Off BKC, Mumbai, India 400070</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
