export default function ServicesLayout({ heroData, methodologyData, approchData }) {
    return (
        <div>
            <DescHero data={heroData}></DescHero>
            <Methodology data={methodologyData}></Methodology>
            <OurApproch data={approchData}></OurApproch>
        </div>
    )
}
function DescHero({ data }) {
    // Split the title into two words
    const [firstWord, ...rest] = data.title.split(" ");
    const secondWord = rest.join(" ");

    return (
        <div className="h-screen font-inter overflow-hidden text-white relative">
            <video
                className="absolute top-0 left-0 w-screen h-[110%] object-cover z-0"
                autoPlay
                loop
                muted
                playsInline
            >
                <source src={data.videoPath} type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Content */}
            <div className="relative flex flex-col size-full mx-auto justify-center z-10 px-4 sm:px-5 md:px-8 lg:px-12 xl:px-45">
                <div className="flex justify-between items-center w-full">
                    {/* Left word */}
                    <h1 className="text-2xl sm:text-4xl md:text-7xl font-bold leading-snug text-left">
                        {firstWord}
                    </h1>

                    {/* Right word */}
                    <h1 className="text-2xl sm:text-4xl md:text-7xl font-bold leading-snug text-right">
                        {secondWord}
                    </h1>
                </div>
            </div>
            
        </div>
    );
}


function Methodology({ data }) {
    return (
        <div className="relative min-h-screen">
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black opacity-90 z-0"></div>
            <h2 className="mx-5 md:mx-20 text-2xl sm:text-4xl md:text-6xl font-inter font-bold underline underline-offset-8 md:underline-offset-12 decoration-[#9d7af0]/70 shadow-lg text-white mt-10 mb-20">
                Methodology
            </h2>
            <div className="flex flex-col gap-10 h-full justify-around">
                {data.map((object, index) => (
                    <div className="flex flex-col text-center text-white" key={index}>
                        <h3 className={`w-5/6 md:w-3/4 lg:w-1/2 py-2 flex-1 bg-[#A580FF]/30 backdrop-blur-xl text-xl sm:text-2xl lg:text-3xl xl:4xl font-inter font-bold ${index % 2 == 0 ? "ml-auto" : "mr-auto"}`}>
                            {object.title}
                        </h3>
                        <p className=" bg-white/10 backdrop-blur-xl  py-2 flex-1 font-semibold text-sm md:text-xl leading-relaxed ">
                            {object.desc}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}



function OurApproch({ data }) {
    return (
        <div className="">
            <h2 className="text-2xl sm:text-4xl md:text-6xl font-inter font-bold underline underline-offset-8 md:underline-offset-12 decoration-[#9d7af0]/70 shadow-lg text-white mt-10 mb-20 mx-5 text-center">
                Our Approach
            </h2>
            {/* Section 1: Grid Layout */}
            {(
                <div className="hidden md:grid grid-cols-6 gap-x-4 gap-y-8 text-white text-center">
                    {/* Row 1 */}
                    {data.firstRow.map((item, index) => (
                        <div key={index} className="col-span-2 flex justify-center items-center">
                            <div className="rounded-xl font-semibold text-sm md:text-xl border-dashed border-2 border-[#A580FF]/50 p-4 w-full aspect-video bg-white/10 backdrop-blur-xl h-full flex items-center justify-center">
                                {item}
                            </div>
                        </div>
                    ))}

                    {/* Row 2 */}
                    {data.secondRow.map((item, index) => (
                        <div
                            key={index}
                            className={`${item.colStart} col-span-2 flex justify-center items-center`}
                        >
                            <div className="rounded-xl font-semibold text-sm md:text-xl border-dashed border-2 border-[#A580FF]/50 p-4 w-full aspect-video bg-white/10 backdrop-blur-xl h-full flex items-center justify-center">
                                {item.text}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Section 2: Flat Mobile-Style Layout */}
            {(
                <div className="md:hidden flex flex-col gap-y-8 text-white text-center">
                    {[...data.firstRow, ...data.secondRow].map((item, index) => {
                        const content = typeof item === 'string' ? item : item.text;
                        return (
                            <div key={index} className="w-full flex justify-center items-center">
                                <div className="rounded-xl font-semibold text-sm md:text-xl border-dashed border-2 border-[#A580FF]/50 p-4 w-full aspect-video bg-white/10 backdrop-blur-xl h-full flex items-center justify-center">
                                    {content}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    )
}