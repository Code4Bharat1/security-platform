import React from "react";
import {
    ComposableMap,
    Geographies,
    Geography,
    Marker,
} from "react-simple-maps";

// World map TopoJSON
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Locations in Asia + Nearby
const LOCATIONS = [
    { name: "Mumbai", coordinates: [72.8777, 19.0760] },
    { name: "Assam", coordinates: [92.9376, 26.2006] },
    { name: "Karnataka", coordinates: [76.9190, 15.3173] },
    { name: "Uttar Pradesh", coordinates: [80.9462, 26.8467] },
    { name: "Rajasthan", coordinates: [74.2179, 27.0238] },
    { name: "Dubai", coordinates: [55.2708, 25.2048] },
    { name: "Kuwait", coordinates: [47.4818, 29.3759] },
    { name: "Oman", coordinates: [58.3829, 23.5880] },
    { name: "Sharjah", coordinates: [55.4038, 25.3463] },
    { name: "South Africa", coordinates: [22.9375, -30.5595] }, // This is outside Asia but added by your request
];

export default function Branches() {
    return (
        <div className="my-5 min-h-screen px-4 sm:px-8 lg:mx-20 font-inter text-white font-inter">
            <h1 className="mx-auto text-white text-2xl sm:text-4xl lg:text-5xl font-bold mb-8 sm:mb-5 text-center">
                <span className="text-[#9d7af0]">About Us</span> | Security Platform
            </h1>
            <div className="flex justify-evenly bg-black my-10">
                <div className="grow">
                    <h2 className="my-10 text-2xl sm:text-3xl md:text-5xl font-inter font-bold underline underline-offset-8 md:underline-offset-12 decoration-[#956af8]">
                        Branch
                    </h2>
                    <p className="flex items-center">Security Platform is a premier cybersecurity and IT services company headquartered in:</p>
                    {/* Lists section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white text-sm sm:text-base mr-5 my-10 ">
                        {/* Domestic Branches */}
                        <div className="bg-slate-800 p-4 rounded-lg shadow-md border border-[#956af8]">
                            <h3 className="text-lg font-semibold mb-3 text-[#956af8]">Domestic Branches (India)</h3>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Mumbai, Maharashtra</li>
                                <li>Assam</li>
                                <li>Karnataka</li>
                                <li>Uttar Pradesh</li>
                                <li>Rajasthan</li>
                            </ul>
                        </div>

                        {/* International Branches */}
                        <div className="bg-slate-800 p-4 rounded-lg shadow-md border border-[#956af8]">
                            <h3 className="text-lg font-semibold mb-3 text-[#956af8]">International Branches</h3>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Dubai, UAE</li>
                                <li>Sharjah, UAE</li>
                                <li>Oman</li>
                                <li>Kuwait</li>
                                <li>South Africa</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-md shadow-md p-2 w-[100%]">
                    <ComposableMap
                        projection="geoMercator"
                        projectionConfig={{
                            center: [75, 15], // Centered on South Asia
                            scale: 700,
                        }}
                        style={{ width: "100%", height: "auto" }}
                    >
                        <Geographies geography={geoUrl}>
                            {({ geographies }) =>
                                geographies.map((geo) => (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        style={{
                                            default: {
                                                fill: "#1e293b", // slate-800
                                                stroke: "#334155", // slate-700 borders
                                                outline: "none",
                                            },
                                            hover: {
                                                fill: "#1e293b",
                                                outline: "none",
                                            },
                                            pressed: {
                                                fill: "#1e293b",
                                                outline: "none",
                                            },
                                        }}
                                    />
                                ))
                            }
                        </Geographies>

                        {LOCATIONS.map(({ name, coordinates }, index) => {
                            const xOffset = 10;
                            const yOffset = index % 2 === 0 ? -10 : 15;
                            const fontSize = 10;
                            const paddingX = 6;
                            const paddingY = 2;
                            const textWidth = name.length * (fontSize * 0.6); // Rough estimate for width

                            return (
                                <Marker key={name} coordinates={coordinates}>
                                    <g>
                                        {/* Circular marker */}
                                        <circle r={4} fill="#9d7af0" stroke="white" strokeWidth={1} />

                                        {/* Background box behind text */}
                                        <rect
                                            x={xOffset - paddingX}
                                            y={yOffset - fontSize}
                                            width={textWidth + paddingX * 2}
                                            height={fontSize + paddingY * 2}
                                            fill="#1e293b" // slate-800
                                            stroke="#9d7af0"
                                            strokeWidth={0.8}
                                            rx={4}
                                            ry={4}
                                        />

                                        {/* Text label */}
                                        <text
                                            x={xOffset - 2}
                                            y={yOffset - 2}
                                            fontSize={fontSize}
                                            fill="#ffffff"
                                            fontWeight="bold"
                                            textAnchor="start"
                                            dominantBaseline="middle"
                                        >
                                            {name}
                                        </text>
                                    </g>
                                </Marker>
                            );
                        })}
                    </ComposableMap>
                </div>
            </div>

        </div>
    );
}
