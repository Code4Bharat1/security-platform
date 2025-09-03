export default function Specialiazation() {
  return (
    <div className="py-12 px-4 sm:px-8 overflow-x-hidden bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Specialization Section */}
        <div className="w-full md:w-3/5 text-white space-y-6 mx-auto mb-12 text-center">
          <h2 className="mb-6 text-2xl sm:text-4xl lg:text-5xl font-bold underline underline-offset-8 decoration-[#956af8]">
            Specialization
          </h2>
          <p className="text-sm sm:text-base md:text-lg leading-relaxed">
            We specialize in defending organizations against today’s most advanced digital threats through cutting-edge services, expert teams, and proven methodologies.
          </p>

          {/* Flow-based Cybersecurity Problem Solving Approach */}
          <div className="mt-8">
            <h3 className="text-xl sm:text-2xl font-semibold mb-3 text-[#cbb8f5] text-left">
              We
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm sm:text-base md:text-lg text-left">
              <li>
                <strong>Identify Threats</strong> – Assess vulnerabilities and
                potential risks.
              </li>
              <li>
                <strong>Analyze Impact</strong> – Evaluate the severity and scope
                of the threat.
              </li>
              <li>
                <strong>Develop Strategy</strong> – Create a tailored response and
                defense plan.
              </li>
              <li>
                <strong>Implement Solutions</strong> – Deploy tools, processes,
                and safeguards.
              </li>
              <li>
                <strong>Monitor & Improve</strong> – Continuously track systems
                and refine defenses.
              </li>
            </ol>
          </div>
        </div>

        {/* ROW SECTION — Cards */}
        <div className="flex flex-col md:flex-row justify-between items-stretch gap-8">
          <Card
            title="OUR MISSION"
            hrColorDir="to-r"
            listItem={[
              "Secure businesses.",
              "Strengthen operations.",
              "Proactive cyber defense.",
              "Rapid incident response.",
              "24/7 asset protection."
            ]}
            cardNumber={"translate-x-2 -translate-y-2"}
          />
          <Card
            title="OUR VISION"
            hrColorDir="to-r"
            listItem={[
              "India’s most trusted partner.",
              "Innovative solutions.",
              "Intelligence-driven security.",
              "Protect all sectors.",
              "Build a safer digital future."
            ]}
            cardNumber={"-translate-x-2 -translate-y-2"}
          />
          <Card
  title="OUR VALUES"
  hrColorDir="to-r"
  listItem={[
    "Integrity – Ethical, transparent, and accountable.",
    "Commitment – Dedicated to securing our clients.",
    "Excellence – Delivering measurable results.",
    "Innovation – Staying ahead of cyber adversaries."
  ]}
  cardNumber={"translate-x-2 -translate-y-2"} // SAME as OUR MISSION & OUR VISION
/>
        </div>
      </div>
    </div>
  );
}

function Card({ title, listItem, hrColorDir, cardNumber }) {
  return (
    <div className="relative flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-sm transition-transform duration-300 hover:scale-105 cursor-pointer">
      {/* Purple Background Card */}
      <div
        className={`absolute inset-0 rounded-2xl backdrop-blur-2xl bg-[#9d7af0]/50 shadow-lg ${cardNumber} transition-transform duration-300 hover:shadow-2xl`}
      ></div>

      {/* White Foreground Card */}
      <div className="relative rounded-2xl bg-white/80 backdrop-blur-2xl p-6 z-10 h-full flex flex-col transition-transform duration-300 hover:translate-y-[-5px] hover:shadow-xl">
        {/* Title */}
        <h3 className="text-xl font-bold text-center text-purple-800">
          {title}
        </h3>

        {/* Gradient Line */}
        <div
          className={`h-[3px] w-full my-3 bg-gradient-${hrColorDir} from-[#9d7af0] to-white`}
        ></div>

        {/* Content */}
        <ul className="space-y-2 text-base font-semibold text-gray-800 flex-grow">
          {listItem.map((item, index) => (
            <li key={index} className="leading-snug">
              <span className="text-[#9d7af0]">★</span> {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
