export default function ServicesLayout({ heroData, methodologyData, approchData ,keyAspectsData}) {
    return (
        <div>
            <DescHero data={heroData}></DescHero>
            <Hero data={heroData}></Hero>
            <Methodology data={methodologyData}></Methodology>
            <KeyAspects data={keyAspectsData} />
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
    
    {/* Title */}
    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 
      bg-clip-text text-transparent 
      bg-gradient-to-r from-white via-indigo-300 to-indigo-600 
      drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] 
      px-4 py-2 rounded-xl bg-black/30 backdrop-blur-sm inline-block">
      {title}
    </h1>

    {/* Subtitle */}
    <p className="text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl text-gray-200 drop-shadow-md mb-8">
      Elevate your experience with modern design, seamless performance, and an immersive interface built just for you.
    </p>

    {/* CTA Buttons */}
    <div className="flex flex-wrap justify-center gap-4">
      <div className="flex justify-center">
        <a
          href="#next-section"
          className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105 w-fit group"
        >
          Free Consultation
        </a>
      </div>
    </div>
  </div>
</div>
  );
}

function Hero({ data }) {
  // Split the description into first two words + rest
  const words = data.desc.split(" ");
  const firstTwoWords = words.slice(0, 2).join(" "); // take first two words
  const rest = words.slice(2).join(" "); // remaining text

  return (
    <div className="max-w-9xl bg-gradient-to-b from-black to-gray-800  mx-auto px-6 md:px-25 py-10 grid md:grid-cols-2 gap-8 items-center">
      {/* Left side - Text */}
      <div>
        <p className="text-lg md:text-xl text-gray-200 leading-relaxed">
          <strong className="font-semibold text-white">{firstTwoWords}</strong>{" "}
          {rest}
        </p>
      </div>

      {/* Right side - Image */}
      <div className="flex justify-center">
        <img
          src={data.imgSrc} // replace with your actual image path
          alt={data.imgAlt}
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
      <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-black z-0"></div>

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
            <div className="flex-shrink-0 w-24 h-24 rounded-full bg-indigo-200 flex items-center justify-center text-white text-2xl font-bold shadow-md overflow-hidden">
              {object.imagePath ? (
                <img
                  src={object.imagePath}
                  alt={object.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                index + 1
              )}
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

function KeyAspects({ data }) {
  return (
    <section className="relative w-full py-16 px-6 sm:px-12 lg:px-20 bg-black text-center text-white">
      {/* Section Heading */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-sm uppercase tracking-wider text-indigo-500 mb-2">
          {data?.desc || "Key Aspects of"}
        </h2>
        <h1 className="text-2xl md:text-4xl font-bold mb-8">
          {data?.title || "Vulnerability Assessment Process"}
        </h1>
      </div>
      
      {/* Bottom Image */}
      <div className="flex justify-center">
        <img
          src={data?.imgPath || "/images/diagram.png"}
          alt={data?.imgAlt || "Process Illustration"}
          className="w-full max-w-5xl object-contain rounded-lg shadow-xl"
        />
      </div>


    </section>
  );
}










// function OurApproch({ data }) {
//     return (
//         <div className="">
//             <h2 className="text-2xl sm:text-4xl md:text-6xl font-inter font-bold underline underline-offset-8 md:underline-offset-12 decoration-[#9d7af0]/70 shadow-lg text-white mt-10 mb-20 mx-5 text-center">
//                 Our Approach
//             </h2>
//             {/* Section 1: Grid Layout */}
//             {(
//                 <div className="hidden md:grid grid-cols-6 gap-x-4 gap-y-8 text-white text-center">
//                     {/* Row 1 */}
//                     {data.firstRow.map((item, index) => (
//                         <div key={index} className="col-span-2 flex justify-center items-center">
//                             <div className="rounded-xl font-semibold text-sm md:text-xl border-dashed border-2 border-[#A580FF]/50 p-4 w-full aspect-video bg-white/10 backdrop-blur-xl h-full flex items-center justify-center">
//                                 {item}
//                             </div>
//                         </div>
//                     ))}

//                     {/* Row 2 */}
//                     {data.secondRow.map((item, index) => (
//                         <div
//                             key={index}
//                             className={`${item.colStart} col-span-2 flex justify-center items-center`}
//                         >
//                             <div className="rounded-xl font-semibold text-sm md:text-xl border-dashed border-2 border-[#A580FF]/50 p-4 w-full aspect-video bg-white/10 backdrop-blur-xl h-full flex items-center justify-center">
//                                 {item.text}
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             )}

//             {/* Section 2: Flat Mobile-Style Layout */}
//             {(
//                 <div className="md:hidden flex flex-col gap-y-8 text-white text-center">
//                     {[...data.firstRow, ...data.secondRow].map((item, index) => {
//                         const content = typeof item === 'string' ? item : item.text;
//                         return (
//                             <div key={index} className="w-full flex justify-center items-center">
//                                 <div className="rounded-xl font-semibold text-sm md:text-xl border-dashed border-2 border-[#A580FF]/50 p-4 w-full aspect-video bg-white/10 backdrop-blur-xl h-full flex items-center justify-center">
//                                     {content}
//                                 </div>
//                             </div>
//                         );
//                     })}
//                 </div>
//             )}
//         </div>
//     )
// }