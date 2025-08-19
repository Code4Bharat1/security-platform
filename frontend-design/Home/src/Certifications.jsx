export default function Certificates() {
    return (
        <div className="h-full mx-20 pb-10 rounded-[100px] bg-linear-to-b from-[#9d7af0]  to-black">
            <h2 className="text-center text-white text-5xl pt-7 font-inter font-bold">
                Certifications
            </h2>
            <div className="flex justify-evenly m-10">
                <img src="/aicpa-cert.png" className="size-1/4" alt="AICPA Certificate" />
                <img src="/iso-cert.png" className="size-1/4" alt="ISO Certificate" />
            </div>
        </div>
    )
}