import { useRouter } from 'next/navigation';
export default function Hero() {
    const router = useRouter();
    return (
        <div className="font-inter overflow-hidden h-screen">
            <video
                className="absolute top-0 left-0 w-screen h-[110%] object-cover"
                autoPlay
                loop
                muted
                playsInline
            >
                <source src="/4.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Content */}
            <div className="relative flex items-center text-white text-center px-4 md:px-0 h-full">
                {/* Text on top of image */}
                <div className="max-w-3xl mx-auto">
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
                        <button className="cursor-pointer px-2 py-3 bg rounded-lg w-full sm:w-[18ch] hover:bg-blue-950/50 hover:text-white bg-[#9d7af0]/50 backdrop-blur-xl shadow-lg ring-1 ring-black/5"
                        onClick={() => router.push('/gain-access')}>
                            Get Started
                        </button>
                        <button className="cursor-pointer px-0 py-3 text-black rounded-lg w-full sm:w-[18ch] text-nowrap hover:bg-blue-950/50 hover:text-white  bg-white/80 backdrop-blur-2xl shadow-lg ring-1 ring-black/5">
                            Schedule Meeting
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
