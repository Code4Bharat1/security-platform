import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

export async function POST(request) {
  const { target } = await request.json();

  let httpRedirectsToHttps = false;
  let hstsEnabled = false;
  let hstsMaxAge = null;

  async function fetchHeaders(url) {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (HTTPS Enforcement Checker)',
      },
    });
    return response.headers;
  }

  try {
    // 1. Check if HTTP redirects to HTTPS
    const httpResponse = await fetch(`http://${target}`, {
      method: 'HEAD',
      redirect: 'manual',
      headers: {
        'User-Agent': 'Mozilla/5.0 (HTTPS Enforcement Checker)',
      },
    });

    const location = httpResponse.headers.get('location') || '';
    httpRedirectsToHttps = location.startsWith('https://');

    // 2. Check HSTS header on HTTPS root domain
    let headers = await fetchHeaders(`https://${target}`);
    let hstsHeader = headers.get('strict-transport-security');

    // If no HSTS on root, check www subdomain
    if (!hstsHeader) {
      headers = await fetchHeaders(`https://www.${target}`);
      hstsHeader = headers.get('strict-transport-security');
    }

    if (hstsHeader) {
      hstsEnabled = true;
      const match = hstsHeader.match(/max-age=(\d+)/);
      hstsMaxAge = match ? parseInt(match[1], 10) : null;
    }

    return NextResponse.json({
      success: true,
      target,
      httpRedirectsToHttps,
      hstsEnabled,
      hstsMaxAge,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
