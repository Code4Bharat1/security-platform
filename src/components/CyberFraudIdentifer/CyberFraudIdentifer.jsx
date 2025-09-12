"use client"

import { useState } from "react";

export default function Cards() {
    const [selectedOption, setSelectedOption] = useState("upi-id");
    const radioOptions = [
        { value: "upi-id", label: "UPI ID" },
        { value: "mobile", label: "Mobile Number" },
        { value: "email", label: "Email ID" },
        { value: "bank-acc", label: "Bank Account Number" },
        { value: "social-media", label: "Social Media" },
        { value: "website", label: "Website" },
        { value: "app", label: "App Name" },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();

        console.log(selectedOption)
        let link = "";
        if (["upi-id", "mobile", "email", "bank-acc", "social-media"].includes(selectedOption)) {
            link = "https://cybercrime.gov.in/Webform/suspect_search_repository.aspx"
        } else {
            link = "https://cybercrime.gov.in/Webform/suspect_search_websites.aspx";
        }
        window.open(link, "_blank");
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
            <div className="max-w-4xl w-full bg-black rounded-2xl p-6">
                {/* Header with logo */}
<div className="flex items-center gap-4 mb-6">
  <div className="w-30 h-30 rounded-full border-4 border-purple-600 overflow-hidden shadow-lg flex-shrink-0">
    <img
      src="/cyber.jpg"
      alt="Logo"
      className="w-full h-full object-cover rounded-full"
    />
  </div>
  <div>
    <h1 className="text-white text-2xl font-medium">
      Cyber Fraud Identifier
    </h1>
    <p className="text-white text-sm">
      Flags potential online fraud by previous records
    </p>
  </div>
</div>


                {/* Form */}
                <div className="bg-black border border-white   rounded-xl p-15">
                    <h2 className="text-white text-xl font-medium mb-6">
                        Identify By;
                    </h2>
                    
                    <div className="space-y-3 mb-6">
                        {radioOptions.map((option) => (
                            <label
                                key={option.value}
                                className="flex items-center space-x-3 text-white cursor-pointer"
                            >
                                <input
                                    type="radio"
                                    name="identifier"
                                    value={option.value}
                                    className="w-4 h-4 text-purple-600 bg-transparent border-2 border-gray-500 focus:ring-purple-500 focus:ring-2"
                                    checked={selectedOption === option.value}
                                    onChange={(e) => setSelectedOption(e.target.value)}
                                />
                                <span className="text-sm">{option.label}</span>
                            </label>
                        ))}
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors text-sm"
                        onClick={handleSubmit}
                    >
                        Visit
                    </button>
                </div>
            </div>
        </div>
    );
}