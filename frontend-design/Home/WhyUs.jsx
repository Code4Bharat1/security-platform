export default function WhyUs() {
  return (
    <div className="px-4 md:px-20">
      <h2 className="text-white text-3xl sm:text-5xl font-inter font-bold mb-5 text-center sm:text-left">
        Why Choose Security Platform<br />
        <span className="underline underline-offset-8 decoration-from-font decoration-[#9d7af0]">
          For Cyber Security?
        </span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10 p-5 md:bg-[url('/why-us/bg-circle.png')] bg-center bg-no-repeat bg-contain">
        {/* Block 1 */}
        <div className="flex flex-col items-center text-center rounded-xl bg-gradient-to-b from-[#9d7af0] to-black text-white py-6 md:px-4">
          <img className="mb-4 w-24 sm:w-36" src="/why-us/hub.png" alt="All-in-one Cyber Security hub" />
          <h3 className="text-xl sm:text-2xl font-semibold mb-2">All-in-one Cyber Security hub</h3>
          <p className="text-sm sm:text-base">
            A single platform with every essential<br />tool to protect your digital presence.
          </p>
        </div>

        {/* Block 2 */}
        <div className="flex flex-col items-center text-center rounded-xl bg-gradient-to-b from-[#9d7af0] to-black text-white py-6 md:px-4">
          <img className="mb-4 w-24 sm:w-36" src="/why-us/shield-lock.png" alt="Advanced Threat Detection" />
          <h3 className="text-xl sm:text-2xl font-semibold mb-2">Advanced Threat Detection</h3>
          <p className="text-sm sm:text-base">
            AI-powered monitoring that identifies<br />and stops threats before they can harm<br />your systems.
          </p>
        </div>

        {/* Block 3 */}
        <div className="flex flex-col items-center text-center rounded-xl bg-gradient-to-b from-[#9d7af0] to-black text-white py-6 md:px-4">
          <img className="mb-4 w-24 sm:w-36" src="/why-us/expert.png" alt="Cyber Security Experts" />
          <h3 className="text-xl sm:text-2xl font-semibold mb-2">Cyber Security Experts</h3>
          <p className="text-sm sm:text-base">
            Skilled professionals delivering trusted<br />solutions for any security challenge.
          </p>
        </div>

        {/* Block 4 */}
        <div className="flex flex-col items-center text-center rounded-xl bg-gradient-to-b from-[#9d7af0] to-black text-white py-6 md:px-4">
          <img className="mb-4 w-24 sm:w-36" src="/why-us/jamboard-kiosk.png" alt="Custom Solution" />
          <h3 className="text-xl sm:text-2xl font-semibold mb-2">Custom Solution</h3>
          <p className="text-sm sm:text-base">
            We create security solutions<br />made just for you.
          </p>
        </div>
      </div>
    </div>
  );
}
