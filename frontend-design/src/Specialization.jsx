export default function Specialiazation() {
    return (
        <div className="flex py-10 min-h-screen px-4 sm:px-8">
            <div className="flex flex-col md:flex-row-reverse items-center justify-center gap-10">
                {/* LEFT SECTION — Specialization Text + Flow Approach */}
                <div className="md:w-1/2 text-white space-y-6">
                    <div>
                        <h2 className="mt-2 mb-4 sm:mt-4 sm:mb-6 text-2xl sm:text-4xl lg:text-5xl font-bold underline underline-offset-8 md:underline-offset-12 decoration-[#956af8]">
                            Specialization
                        </h2>
                        <p className="text-sm sm:text-base md:text-lg leading-relaxed">
                            We specialize in defending organizations against today’s most advanced digital threats through cutting-edge services, expert teams, and proven methodologies.
                        </p>
                    </div>

                    {/* Flow-based Cybersecurity Problem Solving Approach */}
                    <div>
                        <h3 className="text-xl sm:text-2xl font-semibold mb-3 text-[#cbb8f5]">
                            We
                        </h3>
                        <ol className="list-decimal list-inside space-y-2 pl-2 text-sm sm:text-base md:text-lg">
                            <li><strong>Identify Threats</strong> – Assess vulnerabilities and potential risks.</li>
                            <li><strong>Analyze Impact</strong> – Evaluate the severity and scope of the threat.</li>
                            <li><strong>Develop Strategy</strong> – Create a tailored response and defense plan.</li>
                            <li><strong>Implement Solutions</strong> – Deploy tools, processes, and safeguards.</li>
                            <li><strong>Monitor & Improve</strong> – Continuously track systems and refine defenses.</li>
                        </ol>
                    </div>
                </div>


                {/* RIGHT SECTION — Cards */}
                <div className="flex flex-col items-center gap-8">
                    <div className="flex flex-col md:flex-row gap-10">
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
                            cardNumber={"translate-x-3 -translate-y-3"}
                        />
                        <Card
                            title="OUR VISION"
                            hrColorDir="to-l"
                            listItem={[
                                "India’s most trusted partner.",
                                "Innovative solutions.",
                                "Intelligence-driven security.",
                                "Protect all sectors.",
                                "Build a safer digital future."
                            ]}
                            cardNumber={"-translate-x-3 -translate-y-3"}
                        />
                    </div>
                    <Card
                        title="OUR VALUES"
                        hrColorDir="to-r"
                        listItem={[
                            "Integrity – Ethical, transparent, and accountable.",
                            "Commitment – Dedicated to securing our clients.",
                            "Excellence – Delivering measurable results.",
                            "Innovation – Staying ahead of cyber adversaries."
                        ]}
                        cardNumber={"translate-y-3 scale-x-105"}
                    />
                </div>
            </div>
        </div>
    );
}


function Card({ title, listItem, hrColorDir, cardNumber }) {
    return (
        <div className="relative w-[300px] md:w-[400px] h-auto">
            {/* Purple Background Card */}
            <div className={`absolute inset-0 rounded-2xl bg-[#9d7af0] shadow-lg ${cardNumber}`}></div>

            {/* White Foreground Card */}
            <div className="relative rounded-2xl bg-white p-6 z-10">
                {/* Title */}
                <h3 className="text-xl font-bold text-center text-purple-800">{title}</h3>

                {/* Gradient Line */}
                <div className={`h-[3px] w-full my-3 bg-gradient-${hrColorDir} from-[#9d7af0] to-white`}></div>

                {/* Content */}
                <ul className="space-y-2 text-base font-semibold text-gray-800">
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

