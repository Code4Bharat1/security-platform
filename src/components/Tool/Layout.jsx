import Link from "next/link";
export default function ToolLayout({ team, toolList, }) {
    const borderColor = {
        "red": "border-[#D01A1A]/70",
        "blue": "border-[#3C6DFF]/70",
        "purple": "border-[#A020F0]/70",
        "green": "border-[#008000]/70"
    }[team] || "team is unknown";

    const textColor = {
        "red": "text-[#D01A1A]/70",
        "blue": "text-[#3C6DFF]/70",
        "purple": "text-[#A020F0]/70",
        "green": "text-[#008000]/70"
    }[team] || "team is unknown";
    const bgColor = {
        "red": "bg-[#D01A1A]/70",
        "blue": "bg-[#3C6DFF]/70",
        "purple": "bg-[#A020F0]/70",
        "green": "bg-[#008000]/70"
    }[team] || "team is unknown";
    toolList['team']=team
    return (
        <div>
            <button className={`block mx-auto p-5 w-2/3 rounded-3xl border-2 ${borderColor} text-white text-2xl sm:text-4xl md:text-6xl font-bold leading-snug text-center`}>
                <span className={`${textColor} `}>{team.toUpperCase()}</span>&nbsp;Team Toolkit
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-5 lg:gap-8 mt-2 sm:mt-5 p-5 sm:p-8 place-items-center">
                {toolList.map((tool, i) => (
                    <Card
                        key={i}
                        data={tool}
                        bgColor={bgColor}
                        textColor={textColor}
                        borderColor={borderColor}
                    />
                ))}
            </div>
        </div>
    )
}

function Card({ data, borderColor, textColor, bgColor}) {
    return (
        <div className={`flex flex-col aspect-4/3 rounded-xl w-full overflow-hidden hover:scale-105 bg-white/10 backdrop-blur-xl border-2 ${borderColor} shadow-lg transition-all duration-200 transform cursor-pointer hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] text-white justify-around px-5`}>
            <img
                src={`${data.image}`}
                alt={data.team}
                className="h-24 object-contain mx-auto aspect-square object-bottom"
            />
            <h3 className={`${textColor} text-xl text-center font-semibold`}>
                {data.name}
            </h3>
            <p className="text-white text-sm sm:text-md xl:text-lg text-center">
                {data.description}
            </p>
            {/* Scan Button */}
            <Link
                href={`/tools/${data.slug}`}
                className={`${bgColor} text-white py-2 w-full rounded-xl hover:scale-102 transition-colors duration-300 cursor-pointer text-center my-2`}
            >
                {data.buttonLabel}
            </Link>
        </div>
    )
}
