export default function ToolsCard() {
  return (
    <div className="my-10 min-h-screen px-4 sm:px-8 lg:mx-20 font-inter flex flex-col">
      <h2 className="mx-auto text-white text-2xl sm:text-4xl lg:text-5xl font-bold mb-8 sm:mb-5 text-center lg:text-left">
        <span className="text-[#9d7af0]">Toolkits</span> | Security Platform
      </h2>

      {/* Team Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 text-white text-center">
        {/* Red Teaming */}
        <div className="transition-transform duration-300 hover:scale-105
rounded-3xl flex flex-col justify-center items-center p-4 sm:p-5 md:p-6 bg-[#FF0000] bg-[url('/tools/red-bg-design.png')] bg-bottom bg-no-repeat bg-contain min-h-[200px] sm:min-h-[180px] md:min-h-[220px] lg:min-h-[250px] cursor-pointer">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 md:mb-3">Red Teaming</h3>
          <p className="text-xs sm:text-sm md:text-base leading-snug">
            Offensive security topics,<br />penetration testing, etc.
          </p>
        </div>

        {/* Blue Teaming */}
        <div className="transition-transform duration-300 hover:scale-105 rounded-3xl flex flex-col justify-center items-center p-4 sm:p-5 md:p-6 bg-[#123AA0] bg-[url('/tools/blue-bg-design.png')] bg-left-top bg-no-repeat bg-[length:75%] min-h-[200px] sm:min-h-[180px] md:min-h-[220px] lg:min-h-[250px] cursor-pointer">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 md:mb-3">Blue Teaming</h3>
          <p className="text-xs sm:text-sm md:text-base leading-snug">
            Defensive security,<br />monitoring, SIEM etc.
          </p>
        </div>

        {/* Non-Tech */}
        <div className="transition-transform duration-300 hover:scale-105
relative rounded-3xl flex flex-col justify-center items-center p-4 sm:p-5 md:p-6 bg-white text-black bg-[url('/tools/white-bg-design-1.png')] bg-right-bottom bg-no-repeat bg-[length:50%] min-h-[200px] sm:min-h-[180px] md:min-h-[220px] lg:min-h-[250px] cursor-pointer">
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
          {
            title: "Session Fixation Tester",
            image: "/tools/card-images/session_fixation.png",
            description: "Detect session fixation vulnerabilities",
            type: "red-team"
          },
          {
            title: "HTTPS Security Checker",
            image: "/tools/card-images/https-security.png",
            description: " Validate HTTPS security implementation.",
            type: "blue-team"
          }, {
            title: "WhatsApp Privacy Inspector",
            image: "/tools/card-images/wp.png",
            description: "Checks WhatsApp settings for potential privacy risks.",
            type: "non-tech"
          },
          {
            title: "Whois Domain Lookup",
            image: "/tools/card-images/whois.png",
            description: "Retrieve domain registration and ownership details.",
            type: "red-team"
          },
          {
            title: "JWT Signature Validator",
            image: "/tools/card-images/jwt_signature.png",
            description: "Ensure JWT signature integrity.",
            type: "blue-team"
          },
          {
            title: "URL Shortener",
            image: "/tools/card-images/shorted-url.png",
            description: "Make Links Short and Simple.",
            type: "non-tech"
          },
        ].map((tool, i) => (
          <SampleToolCard
            key={i}
            img_path={tool.image}
            title={tool.title}
            subtitle={tool.description}
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
