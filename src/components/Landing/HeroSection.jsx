"use client"
import { useRouter } from 'next/navigation';
import { useState } from 'react'

// Utility function to combine classes
function combineClasses(...classes) {
  return classes.filter(Boolean).join(' ')
}

// Button components
function PrimaryButton({ children, large = false, className = '', onMouseEnter, onMouseLeave, ...props }) {
  const baseStyle = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
  const sizeStyle = large ? 'h-12 px-8 text-lg' : 'h-10 px-4 py-2'

  return (
    <button
      className={`${baseStyle} ${sizeStyle} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 ${className}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      {...props}
    >
      {children}
    </button>
  )
}

function OutlineButton({ children, large = false, className = '', ...props }) {
  const baseStyle = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
  const sizeStyle = large ? 'h-12 px-8 text-lg' : 'h-10 px-4 py-2'

  return (
    <button
      className={`${baseStyle} ${sizeStyle} border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-900 focus:ring-gray-500 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

function GradientButtonLink({ children, large = false, className = '', onMouseEnter, onMouseLeave, ...props }) {
  const baseStyle = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
  const sizeStyle = large ? 'h-12 px-8 text-lg' : 'h-10 px-4 py-2'

  return (
    <a
      className={`${baseStyle} ${sizeStyle} bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-500 ${className}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      {...props}
    >
      {children}
    </a>
  )
}

// SVG Icons
function Shield({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 13c0 5-3.5 7.5-8 7.5S4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.5-2.5a1 1 0 0 1 1 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  )
}

function CheckCircle({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22,4 12,14.01 9,11.01" />
    </svg>
  )
}

function ArrowRight({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}

// HeroSection Component
export default function HeroSection() {
    const router = useRouter(); 
  const [isHovered, setIsHovered] = useState(false)

  return (
    <>
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; opacity: 0; }
        .animate-float { animation: float linear infinite; }
      `}</style>

      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/30 via-white to-white -z-10" />
        <div
          className="absolute inset-0 opacity-10 -z-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}
        />
        <div className="absolute inset-0 overflow-hidden -z-10">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-blue-600/10 animate-float"
              style={{
                width: `${Math.random() * 8 + 2}px`,
                height: `${Math.random() * 8 + 2}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 10 + 10}s`,
                animationDelay: `${Math.random() * 5}s`,
                opacity: Math.random() * 0.5 + 0.2
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 py-24 flex flex-col items-center text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 text-blue-600 mb-6 animate-fade-in">
            <Shield size={16} />
            <span className="text-sm font-medium">Enterprise-grade security for everyone</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight max-w-4xl mb-6 animate-fade-in-up text-gray-900" style={{ animationDelay: '0.2s' }}>
            Protecting Your Digital Assets in an
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> Evolving Threat Landscape</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            Our advanced security platform offers comprehensive protection against the most sophisticated cyber threats, keeping your data safe and your business compliant.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12 w-full max-w-md mx-auto animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <GradientButtonLink
              large
              className="relative group flex-1 overflow-hidden cursor-pointer"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              Get Started
              <ArrowRight size={16} className={combineClasses("ml-2 transition-transform duration-300", isHovered && "translate-x-1")} />
              <span className={combineClasses("absolute inset-0 w-full h-full bg-white rounded-md opacity-0 transition-opacity duration-300 -z-10", isHovered && "opacity-10")} />
            </GradientButtonLink>
            <OutlineButton large className="flex-1 cursor-pointer">Schedule Demo</OutlineButton>
          </div>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-gray-600 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            {['SOC 2 Compliant', 'GDPR Ready', 'ISO 27001 Certified', '99.9% Uptime'].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* Hero Image */}
          <div className="relative mt-16 w-full max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: '1s' }}>
            <div className="relative rounded-lg overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-950/30 to-transparent z-10" />
              <img
                src="https://images.pexels.com/photos/5380642/pexels-photo-5380642.jpeg?auto=compress&cs=tinysrgb&w=1600"
                alt="Security Dashboard"
                className="w-full h-auto object-cover"
              />
            </div>

             <GradientButtonLink
      large
      className="relative group flex-1 overflow-hidden mt-5 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      href="/tools" // <-- Navigates in the same tab
    >
      View All Services
      <span
        className={combineClasses(
          "absolute inset-0 w-full h-full bg-white rounded-md opacity-0 transition-opacity duration-300 -z-10",
          isHovered && "opacity-10"
        )}
      />
    </GradientButtonLink>
          </div>
        </div>
      </section>
    </>
  )
}
