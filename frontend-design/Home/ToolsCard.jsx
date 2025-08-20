export default function ToolsCard() {
  return (
    <div className="my-10 min-h-screen px-4 sm:px-8 lg:mx-20 font-inter flex flex-col">
      <h2 className="mx-auto text-white text-2xl sm:text-4xl lg:text-5xl font-bold mb-8 sm:mb-5 text-center lg:text-left">
        <span className="text-[#9d7af0]">Toolkits</span> | Security Platform
      </h2>

      {/* Team Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 text-white text-center">
        {/* Red Teaming */}
        <div className="rounded-3xl flex flex-col justify-center items-center p-4 sm:p-5 md:p-6 bg-[#FF0000] bg-[url('/tools/red-bg-design.png')] bg-bottom bg-no-repeat bg-contain min-h-[200px] sm:min-h-[180px] md:min-h-[220px] lg:min-h-[250px] cursor-pointer">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 md:mb-3">Red Teaming</h3>
          <p className="text-xs sm:text-sm md:text-base leading-snug">
            Offensive security topics,<br />penetration testing, etc.
          </p>
        </div>

        {/* Blue Teaming */}
        <div className="rounded-3xl flex flex-col justify-center items-center p-4 sm:p-5 md:p-6 bg-[#123AA0] bg-[url('/tools/blue-bg-design.png')] bg-left-top bg-no-repeat bg-[length:75%] min-h-[200px] sm:min-h-[180px] md:min-h-[220px] lg:min-h-[250px] cursor-pointer">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 md:mb-3">Blue Teaming</h3>
          <p className="text-xs sm:text-sm md:text-base leading-snug">
            Defensive security,<br />monitoring, SIEM etc.
          </p>
        </div>

        {/* Non-Tech */}
        <div className="relative rounded-3xl flex flex-col justify-center items-center p-4 sm:p-5 md:p-6 bg-white text-black bg-[url('/tools/white-bg-design-1.png')] bg-right-bottom bg-no-repeat bg-[length:50%] min-h-[200px] sm:min-h-[180px] md:min-h-[220px] lg:min-h-[250px] cursor-pointer">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 md:mb-3">Non-Tech</h3>
          <p className="text-xs sm:text-sm md:text-base leading-snug">Tools for everyday usage.</p>
          <img
            src="/tools/white-bg-design-2.png"
            className="absolute top-0 left-0 h-[25%] sm:h-[30%] md:h-[35%] pointer-events-none"
            alt=""
          />
        </div>
      </div>

      {/* Tools Section */}
      <div className="grid grid-cols-2 grid-rows-3 sm:grid-cols-3 sm:grid-rows-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-2 sm:mt-5 place-items-center">
        {[
          { img: "/tools/sample-1.png", title: "Tool 1", desc: "Description of Tool 1" },
          { img: "/tools/sample-2.png", title: "Tool 2", desc: "Description of Tool 2" },
          { img: "/tools/sample-3.png", title: "Tool 3", desc: "Description of Tool 3" },
          { img: "/tools/sample-4.png", title: "Tool 4", desc: "Description of Tool 4" },
          { img: "/tools/sample-5.png", title: "Tool 5", desc: "Description of Tool 5" },
          { img: "/tools/sample-6.png", title: "Tool 6", desc: "Description of Tool 6" },
        ].map((tool, i) => (
          <SampleToolCard
            key={i}
            img_path={tool.img}
            title={tool.title}
            subtitle={tool.desc}
          />
        ))}
      </div>
    </div>
  );
}

function SampleToolCard({ img_path, title, subtitle }) {
  return (
    <div className="flex w-full max-w-[320px] min-h-[160px] sm:min-h-[180px]">
      {/* Colored Stripe */}
      <div className="w-2 mt-4 sm:mt-5 h-16 sm:h-20 rounded-l-lg bg-[#9d7af0]"></div>

      {/* Card Body */}
      <div className="flex flex-col gap-2 sm:gap-3 bg-[#171717] rounded-xl p-3 sm:p-4 w-full justify-center">
        <img
          src={img_path}
          alt={title}
          className="h-12 sm:h-14 object-contain mb-1 sm:mb-2 mx-auto"
        />
        <h3 className="text-white text-sm sm:text-base font-semibold text-center">{title}</h3>
        {/* Hide description on small and tablet screens */}
        <p className="hidden lg:block text-gray-400 text-sm text-center">{subtitle}</p>
      </div>
    </div>
  );
}
