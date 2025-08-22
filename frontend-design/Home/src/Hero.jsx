export default function Hero() {
    return (
        <div className="font-inter h-screen">
            <img src="/hero-glow-eclipes.png" className="h-[300px] mx-auto -mt-15 relative left-[-0.5rem]"></img>
            <div className="mx-auto -mt-35 grid place-items-center text-white font-semibold text-center">
                <img src="/hero-half-circle.png" className="h-[336px] col-start-1 row-start-1" />
                <div className="col-start-1 row-start-1 mt-50">
                    <h1 className="col-start-1 row-start-1 text-5xl">
                        Protecting Your Digital Assets in<br></br>an <span className="text-[#9d7af0]">Evolving Threat Landscape</span>
                    </h1>
                    <p className="col-start-1 row-start-2 mt-5 text-xl">
                        Our advanced security platform offers comprehensive protection against the<br></br>most sophisticated cyber threats, keeping your data safe and your business<br></br>compliant.
                    </p>
                    <div className="flex justify-center gap-10 mt-10 text-xl">
                        <button className="px-4 py-2 bg-[#9d7af0] rounded-lg cursor-pointer w-[20ch]">
                            Get Started
                        </button>
                        <button className="px-4 py-2 bg-white text-black rounded-lg cursor-pointer w-[20ch]">
                            Schedule Meeting
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}