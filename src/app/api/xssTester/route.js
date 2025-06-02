import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

export async function POST(req) {
  try {
    const { url, param, payload } = await req.json();

    // Append payload into query param
    const urlObj = new URL(url);
    urlObj.searchParams.set(param, payload);

    // Send GET request with injected payload
    const response = await fetch(urlObj.toString());
    const text = await response.text();

    return NextResponse.json({
      injectedUrl: urlObj.toString(),
      status: response.status,
      detected: text.includes(payload),
      snippet: text.substring(0, 300), // show partial HTML response
    });
  } catch (error) {
    return NextResponse.json({
      error: error.message,
    }, { status: 500 });
  }
}

