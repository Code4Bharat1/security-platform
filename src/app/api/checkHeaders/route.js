export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url) {
      return new Response(JSON.stringify({ error: "URL is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await fetch(url, { method: "HEAD" });
    const headers = response.headers;

    const securityHeaders = {
      "Strict-Transport-Security": headers.get("strict-transport-security") || "Missing",
      "Content-Security-Policy": headers.get("content-security-policy") || "Missing",
      "X-Frame-Options": headers.get("x-frame-options") || "Missing",
      "Referrer-Policy": headers.get("referrer-policy") || "Missing",
      "X-XSS-Protection": headers.get("x-xss-protection") || "Missing",
      "Permissions-Policy": headers.get("permissions-policy") || "Missing",
      "Cross-Origin-Resource-Policy": headers.get("cross-origin-resource-policy") || "Missing",
      "Expect-CT": headers.get("expect-ct") || "Missing",
    };

    return new Response(JSON.stringify({ securityHeaders }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in GET API route:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch headers" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
