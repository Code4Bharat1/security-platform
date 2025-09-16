import Link from "next/link";
import { useState, useEffect } from "react";

export default function Blogs() {
  const [dynamicNews, setDynamicNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Static news data
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

  // Fetch dynamic news from The Hacker News
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${process.env.NEXT_PUBLIC_DEV_API_URL}/blogs`,
           {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
          }
        });
        

        const data = await response.json();
        console.log('API Response:', data); // Debug log
        
        if (data.success && data.article) {
          setDynamicNews(data.article);
        } else {
          throw new Error(data.error || 'Invalid response from API');
        }
        
      } catch (error) {
        console.error('Error fetching news:', error);
        setError(error.message);
        
        // Fallback to static content
        setDynamicNews({
          title: "Latest Cybersecurity News",
          description: "Stay updated with the latest cybersecurity threats, vulnerabilities, and security breaches. Click to visit The Hacker News for more information.",
          image: "/blogs/3.png",
          link: "https://thehackernews.com/",
          publishedAt: new Date().toISOString(),
          source: 'The Hacker News'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Force refresh news
  const handleRefreshNews = () => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${process.env.NEXT_PUBLIC_DEV_API_URL}/blogs` + new Date().getTime(), {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
          }
        });
        
        const data = await response.json();
        if (data.success) {
          setDynamicNews(data.article);
        } else {
          throw new Error(data.error || 'Failed to refresh');
        }
        
      } catch (error) {
        console.error('Error refreshing news:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNews();
  };

  return (
    <div id="blogs" className="mb-10 text-white">
      {/* Horizontal line */}
      <div className="w-full h-[2px] bg-[#9d7af0]/70 backdrop-blur-xl border border-white/20 shadow-lg mt-6 md:mt-15"></div>
      
      {/* Heading */}
      <div className="flex items-center justify-between mx-5 md:mx-20">
        <h2 className="text-2xl sm:text-3xl md:text-4xl md:mt-10 font-inter font-bold underline underline-offset-8 md:underline-offset-12 decoration-[#9d7af0]/70 shadow-lg">
          Blogs&nbsp;
        </h2>
        
        {/* Refresh button and status */}
    
      </div>

      {/* Blog cards section with gradient background */}
      <div className="px-4 sm:px-6 md:px-10 mt-10 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-lg py-10 flex">
        <div className="flex flex-wrap justify-center gap-6 sm:gap-8 lg:gap-10 w-full max-w-screen-xl mx-auto items-stretch">
          {/* Static Blog Card 1 */}
          <BlogCard
            image={staticNews[0].image}
            text={staticNews[0].text}
            link={staticNews[0].link}
            isStatic={true}
          />

          {/* Static Blog Card 2 */}
          <BlogCard
            image={staticNews[1].image}
            text={staticNews[1].text}
            link={staticNews[1].link}
            isStatic={true}
          />

          {/* Dynamic Blog Card 3 */}
          {loading ? (
            <BlogCardSkeleton />
          ) : (
            <BlogCard
              image={dynamicNews?.image || "/blogs/3.png"}
              text={dynamicNews?.description || dynamicNews?.title || "Latest tech news update"}
              link={dynamicNews?.link || dynamicNews?.url || "https://thehackernews.com/"}
              isStatic={false}
              title={dynamicNews?.title}
              publishedAt={dynamicNews?.publishedAt}
           
            />
          )}
        </div>
      </div>
      {/* Horizontal line */}
      <div className="w-full h-[2px] bg-[#9d7af0]/70 backdrop-blur-xl border border-white/20 shadow-lg mt-6 md:mt-10"></div>
    </div>
  );
}

function BlogCard({ image, text, link, isStatic, title, publishedAt, error }) {
  return (
    <div className="relative bg-white/90 backdrop-blur-2xl border border-white/20 shadow-lg text-black rounded-br-3xl rounded-tl-3xl w-full sm:w-[80%] md:w-[30%] p-2 lg:p-6">
      <div className="flex-1 flex flex-col gap-5">
        {/* Blog Image */}
        <div className="relative">
          <img
            src={image}
            alt="Blog"
            className="w-full rounded-tl-4xl object-cover max-h-52 sm:max-h-60 md:max-h-64"
            onError={(e) => {
              e.target.src = "/blogs/3.png";
            }}
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

        {/* Blog Title (for dynamic content) */}
        {title && (
          <h3 className="text-sm lg:text-base font-semibold line-clamp-2">
            {title}
          </h3>
        )}

        {/* Blog Text */}
        <p className="text-sm lg:text-base line-clamp-3">
          {text}
        </p>

        {/* Read More Button */}
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
        {/* Image Skeleton */}
        <div className="w-full rounded-tl-4xl bg-gray-300 max-h-52 sm:max-h-60 md:max-h-64 h-52"></div>
        
        {/* Text Skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>

        {/* Button Skeleton */}
        <div className="h-8 bg-gray-300 rounded"></div>
      </div>
    </div>
  );
}