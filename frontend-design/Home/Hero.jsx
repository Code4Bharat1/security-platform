export default function Hero() {
    return (
        <div className="font-inter h-screen relative overflow-hidden">
            {/* Background Glow */}
            <img
                src="/hero-glow-eclipes.png"
                alt="Glow"
                className="h-[200px] md:h-[300px] mx-auto mt-10 md:mt-0"
            />

            <img
                src="/hero-half-circle.png"
                alt="Half Circle"
                className="mx-auto px-20 mt-[-3rem] md:mt-[-5rem]"
            />

            {/* Content */}
            <div className="relative grid place-items-center text-white text-center px-4 md:px-0 mt-[-3rem] md:mt-[-10rem]">
                {/* Decorative half circle image behind text */}

                {/* Text on top of image */}
                <div className="col-start-1 row-start-1 max-w-3xl">
                    <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold leading-snug">
                        Protecting Your Digital Assets in
                        <br />
                        an <span className="text-[#9d7af0]">Evolving Threat Landscape</span>
                    </h1>

                    <p className="mt-4 text-base md:text-xl leading-relaxed">
                        Our advanced security platform offers comprehensive protection against the
                        most sophisticated cyber threats, keeping your data safe and your business compliant.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-10 mt-8 text-base md:text-xl">
                        <button className="px-6 py-3 bg-[#9d7af0] rounded-lg w-full sm:w-[20ch]">
                            Get Started
                        </button>
                        <button className="px-6 py-3 bg-white text-black rounded-lg w-full sm:w-[20ch]">
                            Schedule Meeting
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
