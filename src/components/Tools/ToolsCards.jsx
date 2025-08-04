"use client"
import { useState, useEffect } from 'react';

import { tools } from '@/lib/tools';
import ToolCardsPage from './DisplayCards';

function ToolsCard() {
  const [showTechDetails, setShowTechDetails] = useState(false);
  const [toolsList, setToolsList] = useState([]);
  const [toolsTitle, setToolsTitle] = useState("");
  useEffect(() => {
    const savedTab = localStorage.getItem('lastTab');
    if (!savedTab) return;
    console.log(savedTab.replace(" ", "-").toLowerCase())
    if (savedTab) renderCards(savedTab.replace(" ", "-").toLowerCase());
  }, []);

  const renderCards = (type) => {
    console.log(type)
    const filterOnType = (list, type) => list.filter((item) => item.type == type)
    localStorage.setItem('lastTab', type);
    if (type == "blue-team") {
      const list = filterOnType(tools, "blue-team")
      setToolsList(list);
      setToolsTitle("Blue Team");
    } else if (type == "red-team") {
      const list = filterOnType(tools, "red-team")
      setToolsList(list);
      setToolsTitle("Red Team");
    } else if (type == "tech-forensic") {
      const list = filterOnType(tools, "tech-forensic")
      setToolsList(list);
      setToolsTitle("Tech Forensic");
    } else {
      const list = filterOnType(tools, "non-tech")
      setToolsList(list);
      setToolsTitle("Non-Tech");
    }
    setShowTechDetails(false);
  }
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl items-start h-full">
        {/* Non-Tech Card */}
        <div className="bg-white shadow-md rounded-lg p-6 cursor-pointer" onClick={() => renderCards("non-tech")}>
          <h2 className="text-xl font-bold mb-4">Non-Tech</h2>
          <p className="text-gray-600">Tools for everyday usage.</p>
        </div>

        {/* Tech Card */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => setShowTechDetails(!showTechDetails)}
          >
            <h2 className="text-xl font-bold mb-4">Tech</h2>
            <span className="text-sm text-blue-500">
              {showTechDetails ? 'Hide' : 'Show'} details
            </span>
          </div>
          <p className="text-gray-600 cursor-pointer">Tools for Professionals.</p>


          {showTechDetails && (
            <div className="mt-4 space-y-3">
              {/* Red Teaming */}
              <div className="p-4 bg-red-100 rounded-lg cursor-pointer" onClick={() => renderCards("red-team")}>
                <h3 className="font-semibold text-red-700">Red Teaming</h3>
                <p className="text-sm text-red-600">Offensive security topics, penetration testing, etc.</p>
              </div>

              {/* Blue Teaming */}
              <div className="p-4 bg-blue-100 rounded-lg cursor-pointer" onClick={() => renderCards("blue-team")}>
                <h3 className="font-semibold text-blue-700">Blue Teaming</h3>
                <p className="text-sm text-blue-600">Defensive security, monitoring, SIEM, etc.</p>
              </div>

              {/* Forensic */}
              <div className="p-4 bg-purple-100 rounded-lg cursor-pointer" onClick={() => renderCards("tech-forensic")}>
                <h3 className="font-semibold text-purple-700">Forensic</h3>
                <p className="text-sm text-purple-600">Digital forensic investigation techniques and tools.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className='mt-5'>
        {toolsTitle && <ToolCardsPage title={toolsTitle} toolsList={toolsList} />}
      </div>
    </div>
  );
}

export default ToolsCard;
