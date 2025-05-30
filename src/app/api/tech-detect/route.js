// /app/api/techdetect/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
  const { url } = await req.json();

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    const html = await res.text();
    const headers = {};
    res.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // Pattern-based detection
    const tech = [];

    // --- From headers ---
    if (headers['x-powered-by']) tech.push(`X-Powered-By: ${headers['x-powered-by']}`);
    if (headers['server']) tech.push(`Server: ${headers['server']}`);
    if (headers['x-drupal-cache']) tech.push("Drupal");
    if (headers['x-shopify-stage']) tech.push("Shopify");

    // --- From HTML ---
    if (html.includes("/wp-content/")) tech.push("WordPress");
    if (html.includes("window.__NUXT__")) tech.push("Nuxt.js");
    if (html.includes("<div id=\"__next\"")) tech.push("Next.js");
    if (html.includes("cdn.jsdelivr.net/npm/bootstrap")) tech.push("Bootstrap");
    if (html.includes("jquery.js") || html.includes("jquery.min.js")) tech.push("jQuery");
    if (html.includes("react")) tech.push("React (basic match)");

    const uniqueTech = [...new Set(tech)]; // remove duplicates

    return NextResponse.json({
      technologies: uniqueTech.length ? uniqueTech : ["No major technologies detected."],
    });

  } catch (err) {
    return NextResponse.json({ error: "Unable to fetch or analyze the website." }, { status: 500 });
  }
}
