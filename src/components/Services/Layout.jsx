export default function ServicesLayout({ heroData, methodologyData, approchData }) {
    return (
        <div>
            <DescHero data={heroData}></DescHero>
            <Hero data={heroData}></Hero>
            <Methodology data={methodologyData}></Methodology>
            <OurApproch data={approchData}></OurApproch>
        </div>
    )
}
function DescHero({ data }) {
  const title = data.title;

  return (
    <div className="h-screen font-inter overflow-hidden text-white relative">
      {/* Background Video */}
      <video
        className="absolute top-0 left-0 w-screen h-[110%] object-cover z-0"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={data.videoPath} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay for contrast */}
      <div className="absolute inset-0 bg-black/50 z-0"></div>

      {/* Content */}
      <div className="relative flex flex-col items-center justify-center size-full mx-auto text-center z-10 px-4 sm:px-5 md:px-8 lg:px-12 xl:px-20">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 via-indigo-500 to-indigo-700">
            {title}
          </span>
        </h1>
      </div>
    </div>
  );
}

function Hero({ data }) {
  return (
    <div className="max-w-9xl mx-auto px-6 md:px-25 py-10 grid md:grid-cols-2 gap-12 items-center">
      {/* Left side - Text */}
      <div>
        <p className="text-lg md:text-xl text-gray-200 leading-relaxed">
          {data.desc}
        </p>
      </div>

      {/* Right side - Image */}
      <div className="flex justify-center">
        <img
          src="/OurCoreServices/va-diagram.png" // replace with your actual image path
          alt="Vulnerability Assessment"
          className="rounded-xl shadow-lg w-full max-w-md object-contain"
        />
      </div>
    </div>
  );
}


function Methodology({ data }) {
  return (
    <div className="relative min-h-screen py-16 px-6 md:px-12 lg:px-20">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black opacity-90 z-0"></div>

      {/* Title */}
      <h2 className="relative z-10 text-center text-3xl sm:text-4xl md:text-6xl font-inter font-bold underline underline-offset-8 md:underline-offset-12 decoration-indigo-500/70 text-white mb-16">
        Services
      </h2>

      {/* Single Row Layout */}
      <div className="relative z-10 flex flex-col gap-12">
        {data.map((object, index) => (
          <div
            key={index}
            className="flex flex-col md:flex-row items-center gap-8 bg-white/5 backdrop-blur-xl p-6 rounded-xl shadow-lg hover:scale-[1.02] hover:shadow-indigo-500/30 transition-all duration-300 mx-auto w-full md:w-5/6 lg:w-3/4"
          >
            {/* Image/Icon */}
            <div className="flex-shrink-0 w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
              {/* Replace with actual image if needed */}
              {index + 1}
            </div>

            {/* Text */}
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-indigo-300 mb-2">
                {object.title}
              </h3>
              <p className="text-lg text-gray-200 leading-relaxed">
                {object.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


function OurApproch({ data }) {
    return (
        <div className="">
            <h2 className="text-2xl sm:text-4xl md:text-6xl font-inter font-bold underline underline-offset-8 md:underline-offset-12 decoration-[#9d7af0]/70 shadow-lg text-white mt-10 mb-20 mx-5 text-center">
                Our Approach
            </h2>
            {/* Section 1: Grid Layout */}
            {(
                <div className="hidden md:grid grid-cols-6 gap-x-4 gap-y-8 text-white text-center">
                    {/* Row 1 */}
                    {data.firstRow.map((item, index) => (
                        <div key={index} className="col-span-2 flex justify-center items-center">
                            <div className="rounded-xl font-semibold text-sm md:text-xl border-dashed border-2 border-[#A580FF]/50 p-4 w-full aspect-video bg-white/10 backdrop-blur-xl h-full flex items-center justify-center">
                                {item}
                            </div>
                        </div>
                    ))}

                    {/* Row 2 */}
                    {data.secondRow.map((item, index) => (
                        <div
                            key={index}
                            className={`${item.colStart} col-span-2 flex justify-center items-center`}
                        >
                            <div className="rounded-xl font-semibold text-sm md:text-xl border-dashed border-2 border-[#A580FF]/50 p-4 w-full aspect-video bg-white/10 backdrop-blur-xl h-full flex items-center justify-center">
                                {item.text}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Section 2: Flat Mobile-Style Layout */}
            {(
                <div className="md:hidden flex flex-col gap-y-8 text-white text-center">
                    {[...data.firstRow, ...data.secondRow].map((item, index) => {
                        const content = typeof item === 'string' ? item : item.text;
                        return (
                            <div key={index} className="w-full flex justify-center items-center">
                                <div className="rounded-xl font-semibold text-sm md:text-xl border-dashed border-2 border-[#A580FF]/50 p-4 w-full aspect-video bg-white/10 backdrop-blur-xl h-full flex items-center justify-center">
                                    {content}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    )
}