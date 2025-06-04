import { NextResponse } from "next/server";
import { setTimeout } from "timers/promises"; // server-safe

export async function POST(req) {
  try {
    const { endpoint, method } = await req.json();

    if (!endpoint) {
      return NextResponse.json({ error: "API endpoint is required" }, { status: 400 });
    }

    // Simulate processing time
    await setTimeout(2000);

    // Create a simulated test result
    const testResults = {
      passed: true,
      duration: 1542,
      assertions: [
        { passed: true, message: "Status code indicates success" },
        { passed: true, message: "Response contains a body" },
        { passed: true, message: "Response body is a valid JSON object" },
        { passed: true, message: "Response has JSON content type" }
      ],
      response: {
        success: true,
        message: "API endpoint test completed successfully",
        endpoint,
        method,
        timestamp: new Date().toISOString()
      }
    };

    return NextResponse.json(testResults);
  } catch (error) {
    console.error("Error in Mocha test API route:", error);
    return NextResponse.json(
      { error: "Failed to process request: " + error.message },
      { status: 500 }
    );
  }
}
