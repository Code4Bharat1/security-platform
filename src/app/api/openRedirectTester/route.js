import { NextResponse } from 'next/server';
import fetch from 'node-fetch'; // If not installed, run: npm install node-fetch@2

// Utility to replace redirect param in URL
function replaceRedirectParam(originalUrl, paramName, testUrl) {
  try {
    const url = new URL(originalUrl);
    if (!url.searchParams.has(paramName)) return null;
    url.searchParams.set(paramName, testUrl);
    return url.toString();
  } catch {
    return null;
  }
}

// Utility to follow redirects and get final URL (max 10 redirects)
async function followRedirects(url, maxRedirects = 10) {
  let currentUrl = url;
  for (let i = 0; i < maxRedirects; i++) {
    const res = await fetch(currentUrl, { redirect: 'manual' });
    if (res.status >= 300 && res.status < 400 && res.headers.has('location')) {
      let location = res.headers.get('location');
      // Handle relative redirects
      if (location.startsWith('/')) {
        const base = new URL(currentUrl);
        location = base.origin + location;
      }
      currentUrl = location;
    } else {
      // No more redirects
      break;
    }
  }
  return currentUrl;
}

export async function POST(request) {
  try {
    const { url, paramName = 'redirect' } = await request.json();

    // Validate input URL
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Use a safe test redirect URL
    const testRedirectUrl = 'https://example.com/malicious';

    const testUrl = replaceRedirectParam(url, paramName, testRedirectUrl);
    if (!testUrl) {
      return NextResponse.json({ error: `Redirect parameter '${paramName}' not found in URL.` }, { status: 400 });
    }

    const finalUrl = await followRedirects(testUrl);

    // Determine vulnerability: if final URL matches testRedirectUrl or domain differs from original domain
    const originalDomain = new URL(url).hostname;
    const finalDomain = new URL(finalUrl).hostname;

    const vulnerable = finalUrl === testRedirectUrl || finalDomain !== originalDomain;

    return NextResponse.json({
      originalUrl: url,
      testedUrl: testUrl,
      finalUrl,
      vulnerable,
      originalDomain,
      finalDomain,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}

