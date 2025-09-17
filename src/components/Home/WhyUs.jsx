export default function WhyUs() {
  return (
    <div id="why-us" className="flex flex-col w-full lg:h-screen min-h-screen bg-[url('/15.jpg')] bg-no-repeat bg-cover px-4 sm:px-6 md:px-15 py-6">
        <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-inter font-bold mb-10 text-center leading-tight py-4">
  Securing the Future with Security Platform
  <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#9d7af0] to-transparent mx-auto mt-3"></div>
</h2>



        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 h-full w-5/6 mx-auto">
          {/* Block Template */}
          {[
            {
              icon: "/why-us/hub.png",
              title: "All-in-one Cyber Security Hub",
              desc: "A single platform with every tool to protect your digital presence.",
            },
            {
              icon: "/why-us/shield-lock.png",
              title: "Advanced Threat Detection",
              desc: "AI monitoring stops threats before they can harm your systems.",
            },
            {
              icon: "/why-us/expert.png",
              title: "Cyber Security Experts",
              desc: "Skilled professionals delivering trusted solutions for you.",
            },
            {
              icon: "/why-us/jamboard-kiosk.png",
              title: "Custom Solutions",
              desc: "Security solutions tailor-made for your organization.",
            },
          ].map((block, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center text-center rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 text-white p-4 sm:p-6 shadow-lg transition-transform duration-300 transform hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              <img
                className="mb-4 w-12 sm:w-16"
                src={block.icon}
                alt={block.title}
              />
              <h3 className="text-base sm:text-lg font-semibold mb-2">
                {block.title}
              </h3>
              <p className="text-sm sm:text-base leading-snug">
                {block.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
  );
}