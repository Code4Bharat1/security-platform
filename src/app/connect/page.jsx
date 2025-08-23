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
      const res = await fetch('https://zypher-api.code4bharat.com/api/contact', {
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
      {/* ===== Main section ===== */}
<div className="relative mx-auto w-full max-w-5xl px-4 sm:px-6 py-10 sm:py-14 md:py-16">
        <div className="relative flex min-h-[50vh] items-start justify-end">
          {/* === Main form - Reduced by 20% === */}
          <div
  className="relative z-0 w-full max-w-lg rounded-[18px] p-[2px]
             bg-[linear-gradient(to_bottom,#A580FF_0%,#A580FF_05%,#000000_100%)]
             shadow-[0_0_15px_rgba(255,255,255,0.8),0_0_30px_rgba(255,255,255,0.5)]
             overflow-visible"
    >
            {/* inner padding (smaller on mobile) - Reduced padding */}
<div className="relative rounded-[16px] bg-transparent px-6 py-8 sm:px-8 sm:py-12 md:px-20 md:py-16">

              {/* === Overlapping Contact Details (desktop only) - Reduced by 20% === */}
              <div className="hidden md:block">
                <div className="absolute -left-[50%] top-[10%] z-10 w-[272px] md:w-[288px] h-[448px] md:h-[264px]">
                  <div className="h-full rounded-[14px] p-[2px]
                                  bg-[linear-gradient(to_bottom,#A580FF_0%,#A580FF_05%,#000000_100%)]
                                  shadow-[0_20px_56px_-20px_rgba(124,58,237,.55)]">
                    <div className="h-full rounded-[13px] bg-transparent p-4">
                      <h2 className="mb-0 text-base font-bold text-black">Contact Details</h2>
                      <div className="mb-3 h-[2px] w-22 bg-white" />
                      <ul className="space-y-2 text-[11px] text-white/90">
                        <li className="flex items-center gap-2">
                          <img src="/contact/mail.png" alt="Mail" className="h-5 w-5 shrink-0 object-contain" />
                          <a href="mailto:director@nexcorealliance.com" className="hover:text-white">director@nexcorealliance.com</a>
                        </li>
                        <li className="flex items-center gap-2">
                          <img src="/contact/call.png" alt="Call" className="h-5 w-5 shrink-0 object-contain" />
                          <a href="tel:+919594430295" className="hover:text-white">+91 95944 30295</a>
                        </li>
                        <li className="flex items-start gap-2">
                          <img src="/contact/distance.png" alt="Location" className="h-5 w-5 mt-0.5 shrink-0 object-contain" />
                          <span>Off BKC, Mumbai, India 400070</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* === Form fields === */}
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <div>
                  <label className="mb-1 block text-sm sm:text-base font-bold text-black">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter Your Name"
                    className="w-full rounded-md border border-black bg-white px-2 py-2 text-xs sm:text-sm
           text-black placeholder-black/40 outline-none focus:border-purple-300"

                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm sm:text-base font-bold text-black">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter Your Phone Number"
                    className="w-full rounded-md border border-black bg-white px-2 py-2 text-xs sm:text-sm
                               text-black placeholder-black/40 outline-none focus:border-purple-300"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm sm:text-base font-bold text-black">E-Mail Id</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter Your E-Mail id"
                    className="w-full rounded-md border border-black bg-white px-2 py-2 text-xs sm:text-sm
                               text-black placeholder-black/40 outline-none focus:border-purple-300"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm sm:text-base font-bold text-black">Message</label>
                  <textarea
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your message"
                    className="w-full resize-y rounded-md border border-black bg-white px-2 py-2 text-xs sm:text-sm
                               text-black placeholder-black/40 outline-none focus:border-purple-300"
                    required
                  />
                </div>
                <div className="pt-1">
                  <button
                    type="submit"
                    className="mx-auto block w-full sm:w-38 rounded-md bg-black py-2 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-[#1b1b1b]"
                  >
                    Send Message
                  </button>
                </div>
              </form>

              {status && <p className="mt-5 text-center text-xs text-emerald-300">{status}</p>}
            </div>
          </div>

          {/* === Mobile contact details (stacked) - Reduced by 20% === */}
          <div className="mt-6 w-full md:hidden">
            <div className="rounded-[14px] p-[2px] bg-[linear-gradient(to_bottom,#A580FF_0%,#A580FF_65%,#000000_100%)]">
              <div className="rounded-[13px] bg-transparent p-4">
                <h3 className="mb-2 text-base font-semibold text-black">Contact Details</h3>
                <div className="mb-3 h-[2px] w-22 bg-white/20" />
                <ul className="space-y-2 text-[11px] text-white/90">
                  <li className="flex items-center gap-2">
                    <img src="/contact/mail.png" alt="Mail" className="h-5 w-5 shrink-0 object-contain" />
                    <a href="mailto:director@nexcorealliance.com" className="ml-2 hover:text-white">
                      director@nexcorealliance.com
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <img src="/contact/call.png" alt="Call" className="h-5 w-5 shrink-0 object-contain" />
                    <a href="tel:+919594430295" className="ml-2 hover:text-white">
                      +91 95944 30295
                    </a>
                  </li>
                  <li className="flex items-start gap-2">
                    <img src="/contact/distance.png" alt="Location" className="h-5 w-5 mt-0.5 shrink-0 object-contain" />
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