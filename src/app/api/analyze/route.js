// Add this to your api/analyze/route.js file

import { runJSAnalysis } from "../../../../analyzer/jsScanner";

export async function POST(req) {
  try {
    const { code } = await req.json();
    
    // Add debug logging to see what's coming in
    console.log("Code received for analysis:", code.substring(0, 100) + "...");
    
    // Run the analysis
    const issues = await runJSAnalysis(code);
    
    // Debug the output
    console.log("Analysis results:", issues);
    console.log("Type of issues:", typeof issues);
    console.log("Is array:", Array.isArray(issues));
    console.log("Length if array:", Array.isArray(issues) ? issues.length : "N/A");
    
    // Return the results
    return Response.json({ issues });
  } catch (error) {
    console.error("Analyzer error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to analyze code", details: error.message }),
      { status: 500 }
    );
  }
}