'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

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
    <div className="min-h-screen w-full text-white overflow-x-hidden relative">
      {/* Video Background */}
      {/* Video Background */}
<video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0">
  <source src="/ct.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>


      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/30 via-black/70 to-black/90 z-10"></div>

      {/* Main Content */}
      <div className="relative z-20 mx-auto w-full max-w-5xl px-4 sm:px-6 py-10 sm:py-14 md:py-16">
        <div className="relative flex min-h-[50vh] items-start justify-end">
          {/* Main form */}
          <div
            className="relative z-0 w-full max-w-lg rounded-[18px] p-[2px]
                       bg-[linear-gradient(to_bottom,#A580FF_0%,#A580FF_05%,#000000_100%)]
                       shadow-[0_0_15px_rgba(255,255,255,0.8),0_0_30px_rgba(255,255,255,0.5)]
                       overflow-visible backdrop-blur-sm"
          >
            {/* Inner form container */}
            <div className="relative rounded-[16px] bg-black/80 backdrop-blur-md px-6 py-8 sm:px-8 sm:py-12 md:px-20 md:py-16">

              {/* Overlapping Contact Details (desktop only) */}
              <div className="hidden md:block">
                <div className="absolute -left-[50%] top-[10%] z-10 w-[272px] md:w-[288px] h-[448px] md:h-[264px]">
                  <div className="h-full rounded-[14px] p-[2px]
                                  bg-[linear-gradient(to_bottom,#A580FF_0%,#A580FF_05%,#000000_100%)]
                                  shadow-[0_20px_56px_-20px_rgba(124,58,237,.55)]">
                    <div className="h-full rounded-[13px] bg-black/80 backdrop-blur-md p-4">
                      <h2 className="mb-0 text-base font-bold text-white">Contact Details</h2>
                      <div className="mb-3 h-[2px] w-22 bg-gradient-to-r from-purple-500 to-black" />
                      <ul className="space-y-2 text-[11px] text-white/90">
                        <li className="flex items-center gap-2">
                          <Mail className="h-5 w-5 shrink-0 text-purple-400" />
                          <a href="mailto:director@nexcorealliance.com" className="hover:text-white">director@nexcorealliance.com</a>
                        </li>
                        <li className="flex items-center gap-2">
                          <Phone className="h-5 w-5 shrink-0 text-purple-400" />
                          <a href="tel:+919594430295" className="hover:text-white">+91 95944 30295</a>
                        </li>
                        <li className="flex items-start gap-2">
                          <MapPin className="h-5 w-5 mt-0.5 shrink-0 text-purple-400" />
                          <span>Off BKC, Mumbai, India 400070</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form fields */}
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <div>
                  <label className="mb-1 block text-sm sm:text-base font-bold text-white">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter Your Name"
                    className="w-full rounded-md border border-white/30 bg-black/50 backdrop-blur-sm px-2 py-2 text-xs sm:text-sm
                               text-white placeholder-white/40 outline-none focus:border-purple-300 focus:bg-black/70"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm sm:text-base font-bold text-white">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter Your Phone Number"
                    className="w-full rounded-md border border-white/30 bg-black/50 backdrop-blur-sm px-2 py-2 text-xs sm:text-sm
                               text-white placeholder-white/40 outline-none focus:border-purple-300 focus:bg-black/70"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm sm:text-base font-bold text-white">E-Mail Id</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter Your E-Mail id"
                    className="w-full rounded-md border border-white/30 bg-black/50 backdrop-blur-sm px-2 py-2 text-xs sm:text-sm
                               text-white placeholder-white/40 outline-none focus:border-purple-300 focus:bg-black/70"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm sm:text-base font-bold text-white">Message</label>
                  <textarea
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your message"
                    className="w-full resize-y rounded-md border border-white/30 bg-black/50 backdrop-blur-sm px-2 py-2 text-xs sm:text-sm
                               text-white placeholder-white/40 outline-none focus:border-purple-300 focus:bg-black/70"
                    required
                  />
                </div>
                <div className="pt-1">
                  <button
                    type="submit"
                    className="mx-auto block w-full sm:w-38 rounded-md bg-gradient-to-r from-purple-600 to-black py-2 text-xs sm:text-sm font-semibold text-white shadow-md hover:from-purple-700 hover:to-gray-900 transition-all duration-300"
                  >
                    Send Message
                  </button>
                </div>
              </form>

              {status && <p className="mt-5 text-center text-xs text-emerald-300">{status}</p>}
            </div>
          </div>

          {/* Mobile contact details */}
          <div className="mt-6 w-full md:hidden">
            <div className="rounded-[14px] p-[2px] bg-[linear-gradient(to_bottom,#A580FF_0%,#A580FF_65%,#000000_100%)]">
              <div className="rounded-[13px] bg-black/80 backdrop-blur-md p-4">
                <h3 className="mb-2 text-base font-semibold text-white">Contact Details</h3>
                <div className="mb-3 h-[2px] w-22 bg-gradient-to-r from-purple-500 to-black" />
                <ul className="space-y-2 text-[11px] text-white/90">
                  <li className="flex items-center gap-2">
                    <Mail className="h-5 w-5 shrink-0 text-purple-400" />
                    <a href="mailto:director@nexcorealliance.com" className="ml-2 hover:text-white">
                      director@nexcorealliance.com
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone className="h-5 w-5 shrink-0 text-purple-400" />
                    <a href="tel:+919594430295" className="ml-2 hover:text-white">
                      +91 95944 30295
                    </a>
                  </li>
                  <li className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 mt-0.5 shrink-0 text-purple-400" />
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