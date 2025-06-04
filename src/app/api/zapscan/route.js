// File: pages/api/zapscan.js

export default async function handler(req, res) {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS request (for CORS preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Configuration
    const ZAP_API_URL = "http://127.0.0.1:8080"; // ZAP API base URL

    if (req.method === "POST") {
        console.log("Received POST request to start scan");

        try {
            const { url } = req.body;

            if (!url) {
                console.error("Missing URL in request body");
                return res.status(400).json({ message: "URL is required" });
            }

            console.log("Processing URL:", url);

            // STEP 1: Spider the site
            const spiderUrl = `${ZAP_API_URL}/JSON/spider/action/scan/?url=${encodeURIComponent(url)}`;
            console.log("Spider URL:", spiderUrl);

            const spiderResponse = await fetch(spiderUrl);
            if (!spiderResponse.ok) {
                const errorText = await spiderResponse.text();
                return res.status(500).json({ message: "ZAP Spider API error", error: errorText });
            }

            const spiderData = await spiderResponse.json();
            console.log("Spider scan started:", spiderData);

            // Wait for spider to complete
            console.log("Waiting for spider to complete...");
            await new Promise(resolve => globalThis.setTimeout(resolve, 10000));

            // STEP 2: Start active scan
            const scanUrl = `${ZAP_API_URL}/JSON/ascan/action/scan/?url=${encodeURIComponent(url)}`;
            console.log("Active scan URL:", scanUrl);

            const scanResponse = await fetch(scanUrl);
            if (!scanResponse.ok) {
                const errorText = await scanResponse.text();
                return res.status(500).json({ message: "ZAP Active Scan API error", error: errorText });
            }

            const scanData = await scanResponse.json();
            console.log("Active scan started:", scanData);

            return res.status(200).json({
                message: "Scan process started successfully",
                spiderId: spiderData.scan || "unknown",
                scanId: scanData.scan || "unknown"
            });

        } catch (error) {
            console.error("Error starting scan:", error);
            return res.status(500).json({ message: "Error starting scan", error: error.message });
        }
    }

    if (req.method === "GET") {
        console.log("Received GET request for scan results");

        try {
            const apiUrl = `${ZAP_API_URL}/JSON/core/view/alerts/`;
            const zapResponse = await fetch(apiUrl);

            if (!zapResponse.ok) {
                const errorText = await zapResponse.text();
                return res.status(500).json({ message: "ZAP API error", error: errorText });
            }

            const data = await zapResponse.json();
            console.log("ZAP results retrieved:", data.alerts?.length || 0);

            const formattedResults = (data.alerts || []).map(alert => ({
                name: alert.name || "Unknown Issue",
                url: alert.url || "N/A",
                risk: alert.risk || "Unknown",
                description: alert.description || "No description available"
            }));

            return res.status(200).json({ message: "Scan results retrieved", results: formattedResults });

        } catch (error) {
            console.error("Error fetching results:", error);
            return res.status(500).json({ message: "Error fetching results", error: error.message });
        }
    }

    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}
