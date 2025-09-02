export default function Branches() {
  return (
    <div className="relative my-5 min-h-screen px-4 sm:px-8 lg:mx-10 font-inter text-white overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="ab.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Page Content */}
      <h1 className="mx-auto text-white text-2xl sm:text-4xl lg:text-5xl font-bold mb-8 sm:mb-5 text-center relative z-10">
        <span className="text-[#9d7af0]">About Us</span> | Security Platform
      </h1>

      <div className="flex flex-col lg:flex-row lg:gap-10 justify-between bg-black/70 backdrop-blur-sm my-10 relative z-10 rounded-xl p-6">
        {/* Text Section */}
        <div className="grow">
          <h2 className="mt-6 mb-4 sm:mt-10 sm:mb-6 text-2xl sm:text-4xl lg:text-5xl font-bold underline underline-offset-8 md:underline-offset-12 decoration-[#956af8]">
            Branch
          </h2>

          <p className="flex items-center mb-4 text-sm sm:text-base md:text-lg">
            Security Platform is a premier cybersecurity and IT services company headquartered in:
          </p>

          {/* Branch Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-2 text-white text-sm sm:text-base my-6 sm:my-10">
            {/* Domestic Branches */}
            <div className="bg-[#1e293b]/80 p-3 sm:p-4 lg:p-5 rounded-lg shadow-md border border-[#956af8]">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-[#956af8]">
                Domestic Branches
              </h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Mumbai, Maharashtra</li>
                <li>Assam</li>
                <li>Karnataka</li>
                <li>Uttar Pradesh</li>
                <li>Rajasthan</li>
              </ul>
            </div>

            {/* International Branches */}
            <div className="bg-[#1e293b]/80 p-3 sm:p-4 lg:p-5 rounded-lg shadow-md border border-[#956af8]">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-[#956af8]">
                International Branches
              </h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Dubai, UAE</li>
                <li>Sharjah, UAE</li>
                <li>Oman</li>
                <li>Kuwait</li>
                <li>South Africa</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Map Section (commented out for now) */}
        {/*
        <div className="w-full max-w-full overflow-hidden bg-white rounded-md shadow-md p-2 mt-6 lg:mt-0">
          <img
            src="/about-us/map.png"
            alt="Branches Map"
            className="w-full h-auto object-contain"
          />
        </div>
        */}
      </div>
    </div>
  );
}
