import Link from "next/link";
import { useState, useEffect } from "react";

export default function Blogs() {
  const [dynamicNews, setDynamicNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Static news
  const staticNews = [
    {
      image: "/blogs/1.png",
      text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Cumque dolores asperiores culpa eaque?",
      link: "/"
    },
    {
      image: "/blogs/2.png",
      text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Cumque dolores asperiores culpa eaque?",
      link: "/"
    }
  ];

  // Fetch dynamic news
  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = `${process.env.NEXT_PUBLIC_PROD_API_URL || process.env.NEXT_PUBLIC_DEV_API_URL}/blogs?t=${new Date().getTime()}`;
      const response = await fetch(apiUrl, { cache: "no-store" });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (data.success && data.article) {
        setDynamicNews(data.article);
      } else {
        throw new Error(data.error || "Invalid response from API");
      }
    } catch (err) {
      console.error("Error fetching news:", err);
      setError(err.message);

      // Fallback
      setDynamicNews({
        title: "Latest Cybersecurity News",
        description:
          "Stay updated with the latest cybersecurity threats, vulnerabilities, and security breaches. Click to visit The Hacker News for more information.",
        image:
          "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgVlzRvr9tBHSRQqe_2jj8SrExmcCFhoLUrrMI4GzbM0-GggNMW0BTO02GXh8i_ShmsUpEJyy85FIPBXIbXwMjR68D30ldhn8osa8zG-wKqJu6KDR3Kuri6sd9GXMbhyannAnOJEQMY4tsxJ26pXPujtzzC-8U-kncd-YNj6LfRgiETNHccmSwQQY0zh3gQ/s1600/chrome.png",
        link: "https://thehackernews.com/",
        publishedAt: new Date().toISOString(),
        source: "The Hacker News"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <div id="blogs" className="mb-10 text-white">
      <div className="w-full h-[2px] bg-[#9d7af0]/70 backdrop-blur-xl border border-white/20 shadow-lg mt-6 md:mt-15"></div>

      <div className="flex items-center justify-between mx-5 md:mx-20">
        <h2 className="text-2xl sm:text-3xl md:text-4xl md:mt-10 font-inter font-bold underline underline-offset-8 md:underline-offset-12 decoration-[#9d7af0]/70 shadow-lg">
          Blogs
        </h2>

        <div className="flex items-center gap-2">
          {error && <span className="text-red-400 text-sm hidden md:inline-block">{error}</span>}
          <button
            onClick={fetchNews}
            disabled={loading}
            className="bg-[#9d7af0] hover:bg-[#8b69e0] text-white px-3 py-1 rounded text-sm flex items-center gap-1 disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-10 mt-10 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-lg py-10 flex">
        <div className="flex flex-wrap justify-center gap-6 sm:gap-8 lg:gap-10 w-full max-w-screen-xl mx-auto items-stretch">
          {staticNews.map((blog, idx) => (
            <BlogCard key={idx} {...blog} isStatic={true} />
          ))}

          {loading ? (
            <BlogCardSkeleton />
          ) : (
            <BlogCard
              image={
                dynamicNews?.image
                  ? `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/image-proxy?url=${encodeURIComponent(dynamicNews.image)}&t=${new Date().getTime()}`
                  : "/blogs/3.png"
              }
              text={dynamicNews?.description || dynamicNews?.title || "Latest tech news update"}
              link={dynamicNews?.link || dynamicNews?.url || "https://thehackernews.com/"}
              isStatic={false}
              title={dynamicNews?.title}
              publishedAt={dynamicNews?.publishedAt}
              error={error}
            />
          )}
        </div>
      </div>

      <div className="w-full h-[2px] bg-[#9d7af0]/70 backdrop-blur-xl border border-white/20 shadow-lg mt-6 md:mt-10"></div>
    </div>
  );
}

function BlogCard({ image, text, link, isStatic, title, publishedAt, error }) {
  const [imgError, setImgError] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);

  const hasDynamicImage = image && !image.startsWith("/blogs/");

  return (
    <div className="relative bg-white/90 backdrop-blur-2xl border border-white/20 shadow-lg text-black rounded-br-3xl rounded-tl-3xl w-full sm:w-[80%] md:w-[30%] p-2 lg:p-6">
      <div className="flex-1 flex flex-col gap-5">
        <div className="relative">
          {imgLoading && hasDynamicImage && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9d7af0]"></div>
            </div>
          )}
<img
  src={imgError ? "/blogs/3.png" : image}
  alt="Blog"
  onError={(e) => {
    console.log("Image failed in BlogCard:", e.target.src); // 👀 log actual src
    setImgError(true);
  }}
  onLoad={() => {
    console.log("Image loaded successfully:", image); // 👀 log success
    setImgLoading(false);
  }}
  

            style={{ display: imgLoading && hasDynamicImage ? "none" : "block" }}
          />

          {!isStatic && !error && (
            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              LIVE
            </div>
          )}
          {error && !isStatic && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              ERROR
            </div>
          )}
          {publishedAt && !error && (
            <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
              {new Date(publishedAt).toLocaleDateString()}
            </div>
          )}
        </div>

        {title && <h3 className="text-sm lg:text-base font-semibold line-clamp-2">{title}</h3>}
        <p className="text-sm lg:text-base line-clamp-3">{text}</p>

        <Link
          href={link}
          target={!isStatic ? "_blank" : "_self"}
          rel={!isStatic ? "noopener noreferrer" : ""}
          className="bg-black text-white text-sm sm:text-base py-1 px-4 rounded-md outline outline-[#9d7af0] text-center hover:bg-gray-800 transition-colors"
        >
          Read More
        </Link>
      </div>
    </div>
  );
}

function BlogCardSkeleton() {
  return (
    <div className="relative bg-white/90 backdrop-blur-2xl border border-white/20 shadow-lg text-black rounded-br-3xl rounded-tl-3xl w-full sm:w-[80%] md:w-[30%] p-2 lg:p-6 animate-pulse">
      <div className="flex-1 flex flex-col gap-5">
        <div className="w-full rounded-tl-4xl bg-gray-300 max-h-52 sm:max-h-60 md:max-h-64 h-52"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
        <div className="h-8 bg-gray-300 rounded"></div>
      </div>
    </div>
  );
}
