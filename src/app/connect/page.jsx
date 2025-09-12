'use client';
import { useState } from 'react';
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
    <div className="min-h-screen w-full text-white overflow-x-hidden relative
                    bg-gradient-to-b from-purple-900 via-purple-800 to-black
                    px-4 sm:px-6 py-10 sm:py-14 md:py-16">
      
      <div className="mx-auto w-full max-w-5xl flex flex-col md:flex-row items-start justify-end gap-8">
        
        {/* === Desktop Contact Details === */}
        <div className="hidden md:block relative w-[288px] h-[264px]">
          <div className="h-full rounded-[16px] p-[2px]
                          bg-gradient-to-b from-purple-400 via-purple-500 to-black
                          shadow-[0_20px_40px_rgba(124,58,237,.6)]">
            <div className="h-full rounded-[14px] bg-black/70 backdrop-blur-md p-4">
              <h2 className="mb-0 text-xl font-bold text-purple-200">Contact Details</h2>
              <div className="mb-3 h-[2px] w-22 bg-purple-400/70" />
              <ul className="space-y-2 text-sm text-white/90">
                <li className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-purple-300 shrink-0" />
                  <a href="mailto:director@nexcorealliance.com" className="hover:text-purple-200">director@nexcorealliance.com</a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-purple-300 shrink-0" />
                  <a href="tel:+919594430295" className="hover:text-purple-200">+91 95944 30295</a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-purple-300 shrink-0 mt-0.5" />
                  <span>Off BKC, Mumbai, India 400070</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* === Contact Form === */}
        <div className="relative z-0 w-full max-w-lg rounded-[20px] p-[2px]
                        bg-gradient-to-b from-purple-400 via-purple-500 to-black
                        shadow-[0_10px_25px_rgba(0,0,0,0.6),0_4px_15px_rgba(165,128,255,0.8)]
                        transform hover:scale-[1.01] transition-transform duration-300">
          <div className="relative rounded-[18px] bg-black/60 backdrop-blur-lg px-6 py-8 sm:px-8 sm:py-12 md:px-20 md:py-16">
            
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div>
                <label className="mb-1 block text-sm sm:text-base font-bold text-purple-200">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter Your Name"
                  className="w-full rounded-md border border-purple-400/60 bg-black/50 px-3 py-2 text-xs sm:text-sm
                             text-white placeholder-purple-200/40 outline-none shadow-inner
                             focus:border-purple-300 focus:shadow-[0_0_12px_rgba(165,128,255,0.8)]"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm sm:text-base font-bold text-purple-200">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter Your Phone Number"
                  className="w-full rounded-md border border-purple-400/60 bg-black/50 px-3 py-2 text-xs sm:text-sm
                             text-white placeholder-purple-200/40 outline-none shadow-inner
                             focus:border-purple-300 focus:shadow-[0_0_12px_rgba(165,128,255,0.8)]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm sm:text-base font-bold text-purple-200">E-Mail Id</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Your E-Mail id"
                  className="w-full rounded-md border border-purple-400/60 bg-black/50 px-3 py-2 text-xs sm:text-sm
                             text-white placeholder-purple-200/40 outline-none shadow-inner
                             focus:border-purple-300 focus:shadow-[0_0_12px_rgba(165,128,255,0.8)]"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm sm:text-base font-bold text-purple-200">Message</label>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your message"
                  className="w-full resize-y rounded-md border border-purple-400/60 bg-black/50 px-3 py-2 text-xs sm:text-sm
                             text-white placeholder-purple-200/40 outline-none shadow-inner
                             focus:border-purple-300 focus:shadow-[0_0_12px_rgba(165,128,255,0.8)]"
                  required
                />
              </div>
              <div className="pt-1">
                <button
                  type="submit"
                  className="mx-auto block w-full sm:w-38 rounded-md bg-gradient-to-r from-purple-500 to-purple-700 py-2 
                             text-xs sm:text-sm font-semibold text-white shadow-lg hover:scale-[1.02] active:scale-[0.98]
                             transition-all duration-200 ease-in-out"
                >
                  Send Message
                </button>
              </div>
            </form>

            {status && <p className="mt-5 text-center text-xs text-emerald-300">{status}</p>}
          </div>
        </div>

        {/* === Mobile Contact Details === */}
        <div className="mt-6 w-full md:hidden">
          <div className="rounded-[14px] p-[2px] bg-gradient-to-b from-purple-400 via-purple-500 to-black shadow-lg">
            <div className="rounded-[13px] bg-black/70 backdrop-blur-md p-4">
              <h3 className="mb-2 text-base font-semibold text-purple-200">Contact Details</h3>
              <div className="mb-3 h-[2px] w-22 bg-purple-400/40" />
              <ul className="space-y-2 text-[11px] text-white/90">
                <li className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-purple-300 shrink-0" />
                  <a href="mailto:director@nexcorealliance.com" className="ml-2 hover:text-purple-200">
                    director@nexcorealliance.com
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-purple-300 shrink-0" />
                  <a href="tel:+919594430295" className="ml-2 hover:text-purple-200">
                    +91 95944 30295
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-purple-300 shrink-0 mt-0.5" />
                  <span className="ml-2">Off BKC, Mumbai, India 400070</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
