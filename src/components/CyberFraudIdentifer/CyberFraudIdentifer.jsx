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
        { value: "website", label: "Website URL" },
        { value: "app", label: "App Name" },
    ];

    const handleSubmit = (e)=>{
        e.preventDefault();

        console.log(selectedOption)
        let link = "";
        if (selectedOption in ["upi-id", "mobile", "email", "back-acc", "social-media"]){
            link = "https://cybercrime.gov.in/Webform/suspect_search_repository.aspx"
        } else {
            link = "https://cybercrime.gov.in/Webform/suspect_search_websites.aspx";;
        }
        window.open(link, "_blank");
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-2xl font-semibold text-gray-800 mb-2">
                    Cyber Fraud Identifier
                </h1>
                <p className="text-sm text-gray-500 mb-6">
                    Flags potential online fraud by previous records
                </p>

                <form className="space-y-6">
                    <div>
                        <h2 className="text-sm font-medium text-gray-700 mb-2">
                            Identify By:
                        </h2>
                        <div className="space-y-3">
                            {radioOptions.map((option) => (
                                <label
                                    key={option.value}
                                    className="flex items-center space-x-2 text-gray-700"
                                >
                                    <input
                                        type="radio"
                                        name="identifier"
                                        value={option.value}
                                        className="form-radio text-blue-600"
                                        checked={selectedOption === option.value}
                                        onChange={(e) => setSelectedOption(e.target.value)}
                                    />
                                    <span>{option.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
                        onClick={handleSubmit}
                    >
                        Visit
                    </button>
                </form>
            </div>
        </div>
    );
}
