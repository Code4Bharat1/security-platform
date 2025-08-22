export default function Certificates() {
  return (
    <div className="mx-4 sm:mx-10 md:mx-20 h-screen px-4 sm:px-10 md:px-20 rounded-[50px] md:rounded-[100px] bg-gradient-to-b from-[#9d7af0] to-black">
      <h2 className="text-center text-white text-3xl md:text-5xl pt-7 font-inter font-bold">
        Certifications
      </h2>

      <div className="flex flex-col md:flex-row items-center justify-evenly gap-10 mt-10">
        <img
          src="/aicpa-cert.png"
          className="w-4/5 sm:w-3/4 md:w-[45%] lg:w-[35%] xl:w-[30%] max-w-full"
          alt="AICPA Certificate"
        />
        <img
          src="/iso-cert.png"
          className="w-4/5 sm:w-3/4 md:w-[45%] lg:w-[35%] xl:w-[30%] max-w-full"
          alt="ISO Certificate"
        />
      </div>
    </div>
  );
}
