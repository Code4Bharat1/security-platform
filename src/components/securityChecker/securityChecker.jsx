'use client'
import { jsPDF } from "jspdf";
import { useState } from "react";
import { Search, Loader2, SearchIcon } from 'lucide-react';
export default function SecurityChecker() {
    const [url, setUrl] = useState("");
    const [headers, setHeaders] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const fetchHeaders = async () => {
        try {
            setError(null);
            const response = await fetch(`/api/checkHeaders?url=${url}`);
            const data = await response.json();
            
            if (data.securityHeaders) {
                setHeaders(data.securityHeaders);
            } else {
                setError("Invalid response or missing headers.");
            }
        } catch (err) {
            setError("Failed to fetch headers.");
        }
    };

    const generateReport = () => {
        if (!headers) return;

        const doc = new jsPDF();
        doc.text("HTTP Header Security Report", 20, 20);

        Object.entries(headers).forEach(([header, status], index) => {
            doc.text(`${header}: ${status}`, 20, 40 + (index * 10));
        });

        doc.save("security-report.pdf");
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-100 mb-5">
            <img src="verify.png" alt="verify" className="w-16 h-20 mb-4 mt-7" />
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mt-3">Protect Your Website</h1>
      <p className="text-lg text-slate-600 max-w-2xl mx-auto text-center mt-3">
        Our advanced security scanner identifies vulnerabilities before attackers can exploit them.
      </p>
     <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl mt-10">
     <h1 className="text-2xl font-bold text-center mb-5 mt-4 text-green-800">HTTP Header Security Checker</h1>
            <input 
                type="text" 
                placeholder="Enter website URL" 
                value={url} 
                onChange={(e) => setUrl(e.target.value.trim)}                className="w-full p-2 border rounded mt-3"
            />
            <button
  onClick={fetchHeaders}
  className="w-full bg-green-800 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors duration-300 flex items-center justify-center gap-2 mt-4"
>
  <SearchIcon className="h-5 w-5" />
  Check Headers
</button>

            {error && <p className="text-red-500 mt-3">{error}</p>}

            {headers && (
                <div className="mt-4">
                    <h3 className="text-xl font-semibold">Security Headers Found:</h3>
                    <table className="w-full border mt-2">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="p-2 text-left">Header</th>
                                <th className="p-2 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(headers).map(([key, value]) => (
                                <tr key={key} className="border-t">
                                    <td className="p-2">{key}</td>
                                    <td className={`p-2 ${value === "Missing" ? "text-red-500" : "text-green-500"}`}>
                                        {value}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Download Report Button */}
                    <button onClick={generateReport} className="bg-green-500 text-white px-4 py-2 rounded mt-4">
                        Download Report 📄
                    </button>
                </div>
            )}
     </div>
        </div>
    );
}