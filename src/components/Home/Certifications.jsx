export default function Certificates() {
  return (
    <div className="mx-2 sm:mx-6 md:mx-10 px-2 sm:px-6 md:px-10 py-4 rounded-2xl md:rounded-4xl bg-gradient-to-b from-[#9d7af0] to-black">
      <h2 className="text-center text-white text-2xl md:text-4xl font-inter font-bold">
        Certifications
      </h2>

      <div className="flex flex-col md:flex-row items-center justify-evenly gap-4 mt-4">
        <img
          src="/aicpa-cert.png"
          className="w-3/4 sm:w-2/3 md:w-[40%] lg:w-[30%] xl:w-[25%] max-w-full"
          alt="AICPA Certificate"
        />
        <img
          src="/iso-cert.png"
          className="w-3/4 sm:w-2/3 md:w-[40%] lg:w-[30%] xl:w-[25%] max-w-full"
          alt="ISO Certificate"
        />
      </div>
    </div>
  );
}
