export default function ServicesLayout({ heroData, methodologyData, keyAspectsData, methodologyLayout = "default" }) {
    return (
        <div>
            <DescHero data={heroData}></DescHero>
            <Hero data={heroData}></Hero>
            <Methodology data={methodologyData} layout={methodologyLayout}></Methodology>
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
          Consultation
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
  const firstTwoWords = words.slice(0, 2).join(" ");
  const rest = words.slice(2).join(" ");

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
          src={data.imgSrc}
          alt={data.imgAlt}
          className="rounded-xl shadow-lg w-full max-w-md object-contain"
        />
      </div>
    </div>
  );
}

function Methodology({ data, layout = "default" }) {
  const renderLayout = () => {
    switch (layout) {
      case "cards":
        return <CardsLayout data={data} />;
      case "timeline":
        return <TimelineLayout data={data} />;
      case "hexagon":
        return <HexagonLayout data={data} />;
      case "circular":
        return <CircularLayout data={data} />;
      case "zigzag":
        return <ZigzagLayout data={data} />;
      default:
        return <DefaultLayout data={data} />;
    }
  };

  return (
    <div className="relative min-h-screen py-16 px-6 md:px-12 lg:px-20">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-black z-0"></div>

      {/* Title */}
      <h2 className="relative z-10 text-center text-3xl sm:text-4xl md:text-6xl font-inter font-bold text-white mb-20">
  Services
  <div className="w-70 h-1 bg-gradient-to-r from-transparent via-[#9d7af0] to-transparent mx-auto mt-3"></div>
</h2>


      {renderLayout()}
    </div>
  );
}

// Layout 1: Default (Original)
function DefaultLayout({ data }) {
  return (
    <div className="relative z-10 flex flex-col gap-8 sm:gap-12">
      {data.map((object, index) => (
        <div
          key={index}
          className="flex flex-col md:flex-row items-center gap-6 sm:gap-8  
          p-4 sm:p-6 rounded-xl shadow-lg 
          hover:scale-[1.02] hover:shadow-indigo-500/30 transition-all duration-300 
          mx-auto w-full max-w-sm sm:max-w-md md:w-5/6 lg:w-3/4"
        >
          {/* Icon / Image */}
          <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center text-white text-lg sm:text-xl md:text-2xl font-bold shadow-md overflow-hidden">
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
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-indigo-300 mb-1 sm:mb-2">
              {object.title}
            </h3>
            <p className="text-sm sm:text-base md:text-lg text-gray-200 leading-relaxed">
              {object.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Layout 2: Modern Cards Grid
function CardsLayout({ data }) {
  return (
    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {data.map((object, index) => (
        <div
          key={index}
          className="group relative bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-indigo-500/20 hover:border-indigo-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/25"
        >
          {/* Floating number */}
          {/* <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
            {index + 1}
          </div> */}
          
          {/* Icon area */}
          <div className="w-20 h-20 to-purple-600/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            {object.imagePath ? (
              <img
                src={object.imagePath}
                alt={object.title}
                className="w-16 h-16 object-cover rounded"
              />
            ) : (
              <div className="w-8 h-8 bg-indigo-400 rounded"></div>
            )}
          </div>

          <h3 className="text-xl font-bold text-white mb-4 group-hover:text-indigo-300 transition-colors duration-300">
            {object.title}
          </h3>
          <p className="text-gray-300 leading-relaxed text-sm">
            {object.desc}
          </p>

          {/* Hover effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
      ))}
    </div>
  );
}

// Layout 3: Timeline Design
// Layout 3: Timeline Design with Image
function TimelineLayout({ data }) {
  return (
    <div className="relative z-10 max-w-4xl mx-auto">
      {/* Central line */}
      <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-indigo-500 to-purple-600 h-full rounded-full"></div>

      {data.map((object, index) => (
        <div
          key={index}
          className={`relative flex items-center mb-16 ${
            index % 2 === 0 ? "justify-start" : "justify-end"
          }`}
        >
          {/* Timeline node */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full border-4 border-gray-800 z-20 shadow-lg"></div>

          {/* Content card */}
          <div
            className={`bg-white/5 backdrop-blur-xl p-6 rounded-xl shadow-lg border border-indigo-500/20 hover:border-indigo-400/50 transition-all duration-300 hover:scale-105 ${
              index % 2 === 0 ? "mr-8 md:mr-16" : "ml-8 md:ml-16"
            } w-full md:w-96`}
          >
            <div
              className={`flex items-start gap-4 ${
                index % 2 === 0 ? "" : "flex-row-reverse"
              }`}
            >
              {/* Image + index circle */}
              <div className="flex flex-col items-center gap-3">
                {/* Image container */}
                <div className="w-16 h-16 rounded-xl overflow-hidden shadow-md border border-indigo-500/30">
                  <img
                    src={`/Services/${object.imageName}`}
                    alt={object.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Step number */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow">
                  {index + 1}
                </div>
              </div>

              {/* Text */}
              <div
                className={`flex-1 ${
                  index % 2 === 0 ? "text-left" : "text-right"
                }`}
              >
                <h3 className="text-lg font-bold text-indigo-300 mb-2">
                  {object.title}
                </h3>
                <p className="text-gray-200 text-sm leading-relaxed">
                  {object.desc}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


function HexagonLayout({ data }) {
  return (
    <div className="relative z-10 flex flex-wrap justify-center gap-6 sm:gap-8 max-w-6xl mx-auto px-4">
      {data.map((object, index) => (
        <div
          key={index}
          className="group relative w-full max-w-xs sm:max-w-sm md:w-80 
                     h-64 sm:h-72 md:h-80"
        >
          {/* Hexagon background: rotated only on md+ */}
          <div className="absolute inset-0 
                          bg-gradient-to-br from-indigo-900/40 to-purple-900/40 
                          backdrop-blur-xl rounded-3xl border border-indigo-500/30 
                          transition-all duration-500 
                          md:transform md:rotate-45 
                          group-hover:scale-105 sm:group-hover:scale-110 md:group-hover:scale-110 
                          group-hover:shadow-xl group-hover:shadow-indigo-500/25">
          </div>

          {/* Content */}
          <div className="relative z-10 p-4 sm:p-6 md:p-8 h-full flex flex-col justify-center items-center text-center">
            <div className="w-12 h-12 sm:w-14 md:w-16 rounded-full flex items-center justify-center 
                            text-white font-bold text-lg sm:text-xl md:text-xl mb-3 sm:mb-6 
                            overflow-hidden group-hover:scale-105 sm:group-hover:scale-110 md:group-hover:scale-110 
                            transition-transform duration-300">
              {index < 6 ? (
                <img
                  src={object.image}
                  alt={`Icon ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                index + 1
              )}
            </div>

            <h3 className="text-sm sm:text-base md:text-lg font-bold text-white mb-2 sm:mb-4 
                           group-hover:text-indigo-300 transition-colors duration-300">
              {object.title}
            </h3>
            <p className="text-xs sm:text-sm md:text-sm text-gray-300 leading-relaxed">
              {object.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}


// Layout 5: Circular Arrangement
// Layout 5: Circular Arrangement with Image
function CircularLayout({ data }) {
  const radius = 300;
  const centerX = 0;
  const centerY = 0;

  return (
    <div className="relative z-10 flex justify-center items-center min-h-[800px]">
      <div className="relative w-[700px] h-[700px]">
        {/* Center circle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-2xl">
          Services
        </div>

        {data.map((object, index) => {
          const angle = (index * 360) / data.length;
          const radian = (angle * Math.PI) / 180;
          const x = centerX + radius * Math.cos(radian);
          const y = centerY + radius * Math.sin(radian);

          return (
            <div
              key={index}
              className="absolute w-48 h-56 transform -translate-x-1/2 -translate-y-1/2 group"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
              }}
            >
              {/* Connection line */}
              <div
                className="absolute w-1 bg-gradient-to-r from-indigo-500/50 to-purple-600/50"
                style={{
                  height: `${radius - 96}px`,
                  transformOrigin: "bottom center",
                  transform: `rotate(${angle + 180}deg)`,
                  bottom: "50%",
                  left: "50%",
                  marginLeft: "-2px",
                }}
              ></div>

              {/* Card */}
              <div className="bg-white/5 backdrop-blur-xl p-4 rounded-xl shadow-lg border border-indigo-500/20 group-hover:border-indigo-400/50 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-indigo-500/25 h-full flex flex-col items-center text-center">
                
                {/* Image */}
                <div className="w-16 h-16 mb-3 rounded-full overflow-hidden shadow-md">
                  <img
                    src={`${object.image}`} 
                    alt={object.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <h3 className="text-sm font-bold text-indigo-300 mb-2 group-hover:text-white transition-colors duration-300">
                  {object.title}
                </h3>
                <p className="text-gray-300 text-xs leading-relaxed line-clamp-3">
                  {object.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


// Layout 6: Zigzag Design
function ZigzagLayout({ data }) {
  return (
    <div className="relative z-10 max-w-6xl mx-auto">
      {data.map((object, index) => (
        <div
          key={index}
          className={`flex flex-col md:flex-row items-center gap-8 mb-16 ${
            index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
          }`}
        >
          {/* Content */}
          <div className="flex-1 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-indigo-500/20 hover:border-indigo-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/25">
            <div className="flex items-center gap-4 mb-4">
              
              <h3 className="text-xl font-bold text-white">
                {object.title}
              </h3>
            </div>
            <p className="text-gray-300 leading-relaxed">
              {object.desc}
            </p>
          </div>

          {/* Decorative element */}
          <div className="flex-shrink-0 w-32 h-32 relative">
            {/* <div "></div> */}
            <div className="absolute flex items-center justify-center">
              {object.imagePath ? (
                <img
                  src={object.imagePath}
                  alt={object.title}
                  className="w-25 h-25 object-cover rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-white/20 rounded"></div>
              )}
            </div>
          </div>
        </div>
      ))}
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
          src={data?.image || "/Services/CS1.png"}
          alt={data?.imgAlt || "Process Illustration"}
          className="w-full max-w-5xl object-contain rounded-lg shadow-xl"
        />
      </div>
    </section>
  );
}

