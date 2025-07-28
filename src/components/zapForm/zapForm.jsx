'use client';
import { useState } from "react";

export default function ZapForm() {
    const [url, setUrl] = useState("");
    const [scanResults, setScanResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const handleScan = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");
        setScanResults(null);
        
        if (!url) {
            setError("Please enter a URL to scan");
            setLoading(false);
            return;
        }

        try {
            // Check if URL has protocol, if not add https://
            let formattedUrl = url;
            if (!/^https?:\/\//i.test(url)) {
                formattedUrl = "https://" + url;
            }

            console.log("Starting scan for URL:", formattedUrl);
            
            const startScan = await fetch("https://zypher-api.code4bharat.com/api/zapscan", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    // Add CSRF token if needed by your framework
                },
                body: JSON.stringify({ url: formattedUrl }),
            });
    
            if (!startScan.ok) {
                console.error("Scan error status:", startScan.status);
                const errorData = await startScan.json().catch(() => ({ message: `HTTP error ${startScan.status}` }));
                throw new Error(`Failed to start scan: ${errorData.message || `HTTP error ${startScan.status}`}`);
            }
    
            const data = await startScan.json();
            console.log("✅ Scan started:", data);
            setMessage("Scan started successfully! Getting results in 15 seconds...");
    
            // ZAP scanner needs time to find vulnerabilities
            setTimeout(fetchScanResults, 15000);
        } 
        catch (error) {
            console.error("❌ Error:", error);
            setError(error.message);
            setLoading(false);
        }
    };
    
    const fetchScanResults = async () => {
        try {
            const response = await fetch("https://zypher-api.code4bharat.com/api/zapscan");
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                const errorMessage = errorData?.message || `HTTP error ${response.status}`;
                throw new Error(`Failed to fetch results: ${errorMessage}`);
            }
            
            const data = await response.json();
            
            if (!data.results || !Array.isArray(data.results)) {
                console.warn("Unexpected data format:", data);
                setScanResults([]);
                setMessage("Scan completed, but no results were found.");
            } else {
                setScanResults(data.results);
                if (data.results.length === 0) {
                    setMessage("Scan completed successfully! No vulnerabilities found.");
                } else {
                    setMessage(`Scan completed successfully! Found ${data.results.length} potential issue(s).`);
                }
            }
        } catch (err) {
            console.error("Error fetching scan results:", err);
            setError("Error fetching scan results: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-100 mb-5">
            <img src="verify.png" alt="verify" className="w-16 h-20 mb-4 mt-7" />
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mt-3">Protect Your Website</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto text-center mt-3">
                Our advanced security scanner identifies vulnerabilities before attackers can exploit them.
            </p>
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl mt-10">
                <h1 className="text-2xl font-bold text-center mb-5 mt-4 text-green-800">
                    Zap Scanner
                </h1>

                <form onSubmit={handleScan} className="flex flex-col items-center space-y-4">
                    <input
                        type="text"
                        placeholder="Enter website URL"
                        value={url}
                        onChange={(e) => setUrl(e.target.value.trim())}                       className="border border-gray-300 rounded px-4 py-2 w-full max-w-md"
                    />
                    <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded"
                        disabled={loading}
                    >
                        {loading ? "Scanning..." : "Start Scan"}
                    </button>
                </form>

                {message && <p className="text-green-600 mt-4 text-center">{message}</p>}
                {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

                {scanResults && scanResults.length > 0 && (
                    <div className="mt-10">
                        <h2 className="text-xl font-bold mb-4 text-center">Scan Results:</h2>
                        <table className="min-w-full table-auto border border-gray-300">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="border px-4 py-2">Issue</th>
                                    <th className="border px-4 py-2">URL</th>
                                    <th className="border px-4 py-2">Severity</th>
                                    <th className="border px-4 py-2">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {scanResults.map((alert, index) => (
                                    <tr key={index} className="text-center">
                                        <td className="border px-4 py-2">{alert.name}</td>
                                        <td className="border px-4 py-2">{alert.url}</td>
                                        <td className="border px-4 py-2">{alert.risk}</td>
                                        <td className="border px-4 py-2">{alert.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {scanResults && scanResults.length === 0 && (
                    <p className="mt-6 text-center text-gray-600">No issues found. Your site looks safe!</p>
                )}
            </div>
        </div>
    );
}