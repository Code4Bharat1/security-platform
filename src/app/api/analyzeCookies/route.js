import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

export async function POST(req) {
  const { url } = await req.json();

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        // Pretend we're a browser
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'manual',
    });

    // Log raw headers for debugging
    console.log('🔍 Raw Headers:', response.headers.raw());

    const rawCookies = response.headers.raw()['set-cookie'] || [];

    const analyzedCookies = rawCookies.map((cookieStr) => ({
      name: cookieStr.split('=')[0],
      httpOnly: /httponly/i.test(cookieStr),
      secure: /secure/i.test(cookieStr),
      sameSite: /samesite=(lax|strict|none)/i.test(cookieStr),
      sameSiteValue: (cookieStr.match(/samesite=(lax|strict|none)/i) || [])[1] || 'None',
      path: (cookieStr.match(/path=([^;]+)/i) || [])[1] || '/',
      domain: (cookieStr.match(/domain=([^;]+)/i) || [])[1] || '',
      raw: cookieStr,
    }));

    return NextResponse.json({ cookies: analyzedCookies });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to analyze cookies', details: error.message },
      { status: 500 }
    );
  }
}
