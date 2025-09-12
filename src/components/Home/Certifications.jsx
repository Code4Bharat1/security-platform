export default function Certificates() {
  return (
    <div id="certificates" className="relative">
      {/* Flipped Background Image */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/15.jpg')] bg-no-repeat bg-cover scale-y-[-1] z-0" />

      {/* Content div over the background */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-around px-2 py-5">
        <h2 className="text-center text-white text-2xl sm:text-3xl md:text-4xl font-inter font-bold">
          Certifications
        </h2>

        <div className="flex flex-col md:flex-row items-center justify-evenly gap-10 mt-10 w-full max-w-6xl ">
          <img
            src="/aicpa-cert.png"
            className="w-4/5 md:w-[40%] max-w-full hover:scale-110 duration-200 transition-all"
            alt="AICPA Certificate"
          />
          <img
            src="/iso-cert.png"
            className="w-4/5 md:w-[40%] max-w-full hover:scale-110 duration-200 transition-all"
            alt="ISO Certificate"
          />
        </div>
      </div>
    </div>
  );
}
