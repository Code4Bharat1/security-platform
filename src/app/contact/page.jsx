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
      {/* ===== Banner: HOME >>> CONTACT over Rectangle.png ===== */}
      <header className="relative w-full h-[64px] sm:h-[72px] md:h-[92px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/contact/Rectangle.png')" }}
        />
        <div className="absolute inset-x-0 bottom-0 h-4 bg-black/70 blur-[6px]" />
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <nav className="flex items-center gap-5 sm:gap-8 md:gap-10 text-white uppercase font-extrabold tracking-widest text-base sm:text-xl md:text-2xl drop-shadow-[0_2px_6px_rgba(0,0,0,.6)]">
            <Link href="/" className="hover:opacity-90">Home</Link>
            <span aria-hidden className="select-none tracking-[0.35em]">››››</span>
            <span className="pointer-events-none">Contact</span>
          </nav>
        </div>
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-10 hidden sm:flex gap-1">
          <span className="h-1 w-1 rounded-full bg-white/100" />
          <span className="h-1 w-1 rounded-full bg-white/200" />
          <span className="h-1 w-1 rounded-full bg-white/100" />
        </div>
      </header>

      {/* ===== Background ellipses (images) ===== */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Desktop / tablet */}
        <div className="hidden md:block">
          <img src="/contact/Ellipse%20120.png" alt="" className="absolute -left-10 top-24 w-44 h-44 object-contain opacity-90" />
          <img src="/contact/Ellipse%20122.png" alt="" className="absolute left-1/2 -translate-x-1/2 top-20 w-60 h-60 object-contain opacity-80" />
          <img src="/contact/Ellipse%20121.png" alt="" className="absolute -right-20 top-40 w-56 h-56 object-contain opacity-90" />
          <img src="/contact/Ellipse%20123.png" alt="" className="absolute left-4 bottom-10 w-64 h-64 object-contain opacity-85" />
          <img src="/contact/Ellipse%20124.png" alt="" className="absolute right-14 bottom-6 w-60 h-60 object-contain opacity-85" />
        </div>
        {/* Mobile */}
        <div className="block md:hidden">
          <img src="/contact/Ellipse%20120.png" alt="" className="absolute left-3 top-24 w-28 h-28 object-contain opacity-80" />
          <img src="/contact/Ellipse%20122.png" alt="" className="absolute right-3 top-16 w-32 h-32 object-contain opacity-80" />
          <img src="/contact/Ellipse%20124.png" alt="" className="absolute left-6 bottom-10 w-36 h-36 object-contain opacity-80" />
        </div>
      </div>

      {/* ===== Main section ===== */}
      <div className="relative mx-auto w-full max-w-5xl px-4 sm:px-6 py-10 sm:py-14 md:py-16">
        <div className="relative flex min-h-[50vh] items-start justify-end">
          {/* === Main form === */}
          <div className="relative z-0 w-full max-w-xl rounded-[22px] p-[2px]
                          bg-[linear-gradient(to_bottom,#A580FF_0%,#A580FF_35%,#000000_100%)]
                          shadow-[0_35px_90px_-25px_rgba(124,58,237,.5)] overflow-visible">
            {/* inner padding (smaller on mobile) */}
            <div className="relative rounded-[20px] bg-transparent px-5 py-8 sm:px-8 sm:py-12 md:px-10 md:py-16">

              {/* === Overlapping Contact Details (desktop only) === */}
              <div className="hidden md:block">
                <div className="absolute -left-[60%] top-[10%] z-10 w-[340px] md:w-[360px] h-[560px] md:h-[330px]">
                  <div className="h-full rounded-[18px] p-[2px]
                                  bg-[linear-gradient(to_bottom,#A580FF_0%,#A580FF_65%,#000000_100%)]
                                  shadow-[0_25px_70px_-25px_rgba(124,58,237,.55)]">
                    <div className="h-full rounded-[16px] bg-transparent p-5">
                      <h3 className="mb-3 text-lg font-bold text-black">Contact Details</h3>
                      <div className="mb-4 h-[2px] w-28 bg-white/20" />
                      <ul className="space-y-3 text-[13.5px] text-white/90">
                        <li className="flex items-center gap-2">
                          <img src="/contact/mail.png" alt="Mail" className="h-6 w-6 shrink-0 object-contain" />
                          <a href="mailto:director@nexcorealliance.com" className="hover:text-white">director@nexcorealliance.com</a>
                        </li>
                        <li className="flex items-center gap-2">
                          <img src="/contact/call.png" alt="Call" className="h-6 w-6 shrink-0 object-contain" />
                          <a href="tel:+919594430295" className="hover:text-white">+91 95944 30295</a>
                        </li>
                        <li className="flex items-start gap-2">
                          <img src="/contact/distance.png" alt="Location" className="h-6 w-6 mt-0.5 shrink-0 object-contain" />
                          <span>Off BKC, Mumbai, India 400070</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* === Form fields === */}
              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                <div>
                  <label className="mb-1 block text-base sm:text-lg font-bold text-black">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter Your Name"
                    className="w-full rounded-md border border-white/20 bg-white px-3 py-3 text-sm sm:text-base
                               text-black placeholder-black/40 outline-none focus:border-purple-300"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-base sm:text-lg font-bold text-black">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter Your Phone Number"
                    className="w-full rounded-md border border-white/20 bg-white px-3 py-3 text-sm sm:text-base
                               text-black placeholder-black/40 outline-none focus:border-purple-300"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-base sm:text-lg font-bold text-black">E-Mail Id</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter Your E-Mail id"
                    className="w-full rounded-md border border-black/20 bg-white px-3 py-3 text-sm sm:text-base
                               text-black placeholder-black/40 outline-none focus:border-purple-300"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-base sm:text-lg font-bold text-black">Message</label>
                  <textarea
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your message"
                    className="w-full resize-y rounded-md border border-white/20 bg-white px-3 py-3 text-sm sm:text-base
                               text-black placeholder-black/40 outline-none focus:border-purple-300"
                    required
                  />
                </div>
                <div className="pt-1">
                  <button
                    type="submit"
                    className="mx-auto block w-full sm:w-48 rounded-md bg-black py-3 text-sm sm:text-base font-semibold text-white shadow-md hover:bg-[#1b1b1b]"
                  >
                    Send Message
                  </button>
                </div>
              </form>

              {status && <p className="mt-6 text-center text-sm text-emerald-300">{status}</p>}
            </div>
          </div>

          {/* === Mobile contact details (stacked) === */}
          <div className="mt-8 w-full md:hidden">
            <div className="rounded-[18px] p-[2px] bg-[linear-gradient(to_bottom,#A580FF_0%,#A580FF_65%,#000000_100%)]">
              <div className="rounded-[16px] bg-transparent p-5">
                <h3 className="mb-3 text-lg font-semibold text-black">Contact Details</h3>
                <div className="mb-4 h-[2px] w-28 bg-white/20" />
                <ul className="space-y-3 text-[13.5px] text-white/90">
                  <li className="flex items-center gap-2">
                    <img src="/contact/mail.png" alt="Mail" className="h-6 w-6 shrink-0 object-contain" />
                    <a href="mailto:director@nexcorealliance.com" className="ml-2 hover:text-white">
                      director@nexcorealliance.com
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <img src="/contact/call.png" alt="Call" className="h-6 w-6 shrink-0 object-contain" />
                    <a href="tel:+919594430295" className="ml-2 hover:text-white">
                      +91 95944 30295
                    </a>
                  </li>
                  <li className="flex items-start gap-2">
                    <img src="/contact/distance.png" alt="Location" className="h-6 w-6 mt-0.5 shrink-0 object-contain" />
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
