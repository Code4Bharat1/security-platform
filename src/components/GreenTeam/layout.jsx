import React from 'react'
export default function GreenLayout({heroData}) {
    return (
        <div>
            <Hero data={heroData}></Hero>
        </div>
    )
}

function Hero({ data }) {
  return (
    <div className="max-w-6xl mx-auto px-6 md:px-12 py-10 flex flex-col md:flex-row items-center justify-center gap-8">
      
      {/* Left side - Image */}
      <div className="flex justify-center">
        <div className="w-28 h-28 rounded-full border-4 border-green-500 flex items-center justify-center bg-black p-2">
          <img
            src={data.imgPath}
            alt={data.title || "Hero image"}
            className="w-20 h-20 object-contain"
          />
        </div>
      </div>
      
      {/* Right side - Text */}
      <div className="flex flex-col justify-center text-center md:text-left md:ml-2">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
          {data.title}
        </h2>
        <p className="text-md md:text-lg text-gray-300 leading-relaxed">
          {data.desc}
        </p>
      </div>
    </div>
  );
}