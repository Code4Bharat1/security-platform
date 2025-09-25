import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get("url");

    if (!imageUrl) {
      return new NextResponse("Missing url parameter", { status: 400 });
    }

    // Always fetch directly from the source
    const res = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        "Referer": "https://thehackernews.com/", // 🔑 Important for Blogger-hosted images
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Failed to fetch:", res.status, res.statusText);
      return new NextResponse("Failed to fetch image", { status: res.status });
    }

    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "image/jpeg";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (err) {
    console.error("Image Proxy Error:", err);
    return new NextResponse("Error fetching image", { status: 500 });
  }
}
