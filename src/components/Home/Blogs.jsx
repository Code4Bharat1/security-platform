import Link from "next/link";
export default function Blogs() {
  return (
    <div id="blogs" className="mb-10 text-white">

       {/* Horizontal line */}
      <div className="w-full h-[2px] bg-[#9d7af0]/70 backdrop-blur-xl border border-white/20 shadow-lg mt-6 md:mt-15"></div>
      
      {/* Heading */}
      <h2 className="mx-5 md:mx-20 text-2xl sm:text-3xl md:text-4xl md:mt-10 font-inter font-bold underline underline-offset-8 md:underline-offset-12 decoration-[#9d7af0]/70 shadow-lg">
        Blogs&nbsp;
      </h2>

      {/* Blog cards section with gradient background */}
      <div className="px-4 sm:px-6 md:px-10 mt-10 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-lg py-10 flex">
        <div className="flex flex-wrap justify-center gap-6 sm:gap-8 lg:gap-10 w-full max-w-screen-xl mx-auto items-stretch">
          {/* Blog Card 1 */}
          <BlogCard
            image="/blogs/1.png"
            text="Lorem ipsum dolor sit amet consectetur adipisicing elit. Cumque dolores asperiores culpa eaque?"
          />

          {/* Blog Card 2 */}
          <BlogCard
            image="/blogs/2.png"
            text="Lorem ipsum dolor sit amet consectetur adipisicing elit. Cumque dolores asperiores culpa eaque?"
          />

          {/* Blog Card 3 */}
          <BlogCard
            image="/blogs/3.png"
            text="Lorem ipsum dolor sit amet consectetur adipisicing elit. Cumque dolores asperiores culpa eaque?"
          />
        </div>
      </div>
      {/* Horizontal line */}
      <div className="w-full h-[2px] bg-[#9d7af0]/70 backdrop-blur-xl border border-white/20 shadow-lg mt-6 md:mt-10"></div>
    </div>
  );
}

function BlogCard({ image, text }) {
  return (
    <div className="relative bg-white/90 backdrop-blur-2xl border border-white/20 shadow-lg text-black rounded-br-3xl rounded-tl-3xl w-full sm:w-[80%] md:w-[30%] p-2 lg:p-6">
      <div className="flex-1 flex flex-col gap-5">
        {/* Blog Image */}
        <img
          src={image}
          alt="Blog"
          className="w-full rounded-tl-4xl object-cover max-h-52 sm:max-h-60 md:max-h-64"
        />

        {/* Blog Text */}
        <p className="text-sm lg:text-base">
          {text}
        </p>

        {/* Read More Button */}
        <Link href="/" className="bg-black text-white text-sm sm:text-base py-1 rounded-md outline outline-[#9d7af0]">
          Read More
        </Link>
      </div>
    </div>
  );
}
