export default function WhyUs() {
  return (
    <div className="px-2 sm:px-6 md:px-16">
      <h2 className="text-white text-2xl sm:text-4xl font-inter font-bold mb-4 text-center sm:text-left">
        Why Choose Security Platform<br />
        <span className="underline underline-offset-8 decoration-from-font decoration-[#9d7af0]">
          For Cyber Security?
        </span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 p-4 md:bg-[url('/why-us/bg-circle.png')] bg-center bg-no-repeat bg-contain">
        {/* Block 1 */}
        <div className="flex flex-col items-center text-center rounded-lg bg-gradient-to-b from-[#9d7af0] to-black text-white py-4 px-3">
          <img className="mb-3 w-16 sm:w-24" src="/why-us/hub.png" alt="All-in-one Cyber Security hub" />
          <h3 className="text-lg sm:text-xl font-semibold mb-1">All-in-one Cyber Security hub</h3>
          <p className="text-xs sm:text-sm">
            A single platform with every essential<br />tool to protect your digital presence.
          </p>
        </div>

        {/* Block 2 */}
        <div className="flex flex-col items-center text-center rounded-lg bg-gradient-to-b from-[#9d7af0] to-black text-white py-4 px-3">
          <img className="mb-3 w-16 sm:w-24" src="/why-us/shield-lock.png" alt="Advanced Threat Detection" />
          <h3 className="text-lg sm:text-xl font-semibold mb-1">Advanced Threat Detection</h3>
          <p className="text-xs sm:text-sm">
            AI-powered monitoring that identifies<br />and stops threats before they can harm<br />your systems.
          </p>
        </div>

        {/* Block 3 */}
        <div className="flex flex-col items-center text-center rounded-lg bg-gradient-to-b from-[#9d7af0] to-black text-white py-4 px-3">
          <img className="mb-3 w-16 sm:w-24" src="/why-us/expert.png" alt="Cyber Security Experts" />
          <h3 className="text-lg sm:text-xl font-semibold mb-1">Cyber Security Experts</h3>
          <p className="text-xs sm:text-sm">
            Skilled professionals delivering trusted<br />solutions for any security challenge.
          </p>
        </div>

        {/* Block 4 */}
        <div className="flex flex-col items-center text-center rounded-lg bg-gradient-to-b from-[#9d7af0] to-black text-white py-4 px-3">
          <img className="mb-3 w-16 sm:w-24" src="/why-us/jamboard-kiosk.png" alt="Custom Solution" />
          <h3 className="text-lg sm:text-xl font-semibold mb-1">Custom Solution</h3>
          <p className="text-xs sm:text-sm">
            We create security solutions<br />made just for you.
          </p>
        </div>
      </div>
    </div>
  );
}
