'use client'

// import { tools } from "@/lib/tools";

const ToolCardsPage = ({toolsList, title}) => {
  return (
  <>
    <h1 className="text-xl font-bold mb-4">{title} tools</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 p-3">
      {toolsList.map((tool, index) => (
        <div
          key={tool.slug}
          className="card bg-white p-5 rounded-lg shadow-lg flex border flex-col w-full h-[100%] items-center"
        >
          {/* Tool Image/Icon */}
          <img
            src={`${tool.image}`}
            alt={tool.name}
            className={`${tool.className || 'w-16 h-16'} object-contain mb-4 mt-7`}
          />

          {/* Tool Title */}
          <h2 className="text-xl font-bold text-green-800 mb-2">{index+1}. {tool.name}</h2>

          {/* Tool Description */}
          <p className="text-gray-700 text-center mb-6">{tool.description}</p>

          {/* Scan Button */}
          <a
            href={`/tools/${tool.slug}`}
            className="bg-green-800 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors duration-300 cursor-pointer"
          >
            {tool.buttonLabel}
          </a>
        </div>
      ))}
    </div>
  </>
);

};

export default ToolCardsPage;