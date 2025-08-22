export default function WhyUs() {
    return (
        <div className="mx-20">
            <h2 className="text-white text-5xl font-inter font-bold">
                Why Choose Security Platform<br></br>
                <div className="w-fit">
                    For Cyber Security?
                    <div className="h-2 bg-[#9d7af0] mt-3"></div>
                </div>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-5 bg-[url('/why-us/bg-circle.png')] bg-center bg-no-repeat bg-contain">
                <div className="item-center text-center rounded-xl bg-gradient-to-b from-[#9d7af0] to-black  text-white py-5">
                    <img className="mb-4 w-36 mx-auto" src="/why-us/hub.png"/>
                    <h3 className="text-2xl font-semibold mb-2">All-in-one Cyber Security hub</h3>
                    <p>A single platform with every essential<br />tool to protect your digital presence.</p>
                </div>

                <div className="item-center text-center rounded-xl bg-gradient-to-b from-[#9d7af0] to-black  text-white py-5">
                    <img className="mb-4 w-36 mx-auto"  src="/why-us/shield-lock.png"/>
                    <h3 className="text-2xl font-semibold mb-2">Advance Threat Detection</h3>
                    <p>AI-powered monitoring that identifies<br />and stops threats before they can harm<br />your systems.</p>
                </div>

                <div className="item-center text-center rounded-xl bg-gradient-to-b from-[#9d7af0] to-black  text-white py-5">
                    <img className="mb- w-36 mx-auto" src="/why-us/expert.png"/>
                    <h3 className="text-2xl font-semibold mb-2">Cyber Security Experts</h3>
                    <p>Skilled professionals delivering trusted<br />solutions for any security challenge.</p>
                </div>

                <div className="item-center text-center rounded-xl bg-gradient-to-b from-[#9d7af0] to-black  text-white py-5">
                    <img className="mb-4 w-36 mx-auto" src="/why-us/jamboard-kiosk.png"/>
                    <h3 className="text-2xl font-semibold mb-2">Custom Solution</h3>
                    <p>We create security solutions<br />made just for you.</p>
                </div>
            </div>

        </div>
    )
}