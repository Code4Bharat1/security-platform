export default function Blogs() {
  return (
    <div className="mb-10 text-white min-h-screen">
      {/* Heading */}
      <h2 className="mx-5 md:mx-20 text-2xl sm:text-3xl md:text-5xl font-inter font-bold underline underline-offset-8 md:underline-offset-12 decoration-[#956af8]">
        Blogs&nbsp;
      </h2>

      {/* Horizontal line */}
      <div className="w-full h-[2px] bg-[#9d7af0] mt-6 md:mt-10"></div>

      {/* Blog cards section with gradient background */}
      <div className="px-4 sm:px-6 md:px-10 mt-10 min-h-[70vh] max-h-screen bg-gradient-to-tr from-[#9d7af0] to-white py-10 flex">
        <div className="flex flex-wrap justify-center gap-6 sm:gap-8 lg:gap-10 w-full max-w-screen-xl mx-auto">
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
      <div className="w-full h-[2px] bg-[#9d7af0] mt-6 md:mt-10"></div>
    </div>
  );
}

function BlogCard({ image, text }) {
  return (
    <div className="relative bg-white text-black rounded-br-4xl rounded-tl-4xl flex flex-col w-full sm:w-[80%] md:w-[45%] lg:w-[30%] pb-20 p-4 sm:p-6">
      {/* Blog Image */}
      <img
        src={image}
        alt="Blog"
        className="w-full rounded-tl-4xl object-cover max-h-52 sm:max-h-60 md:max-h-64"
      />

      {/* Blog Text */}
      <p className="mt-4 text-sm sm:text-base leading-snug">
        {text}
      </p>

      {/* Read More Button */}
      <button className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black text-white text-sm sm:text-base md:text-lg px-4 py-1 sm:px-5 sm:py-2 rounded-md outline outline-[#9d7af0]">
        Read More
      </button>
    </div>
  );
}
