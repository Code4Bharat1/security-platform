'use client'

import { tools } from "@/lib/tools";

const toolsSlice = tools.slice(0, 6);

const CardsList = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6  mb-10 p-10 bg-white">
      {toolsSlice.map((tool) => (
        <div
          key={tool.slug}
          className="card bg-white p-5 rounded-lg shadow-lg flex border flex-col w-full h-[100%] items-center"
        >
          {/* Tool Image/Icon */}
          <img src={tool.image} alt={tool.name} className="w-16 h-16 mb-4 mt-7" />

          {/* Tool Title */}
          <h2 className="text-xl font-bold text-green-800 mb-2">{tool.name}</h2>

          {/* Tool Description */}
          <p className="text-gray-700 text-center mb-6">{tool.description}</p>

          {/* Scan Button */}
          <a
            href={`/${tool.slug}`}
            className="bg-green-800 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors duration-300 cursor-pointer"
          >
            {tool.buttonLabel}
          </a>
        </div>
      ))}
    </div>
  );
};

export default CardsList;