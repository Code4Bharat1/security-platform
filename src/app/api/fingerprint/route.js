import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

export async function POST(req) {
  const { url } = await req.json();

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
        'Accept': 'text/html',
      },
    });

    const html = await res.text();
    const headers = res.headers.raw();
    const fingerprints = [];

    // --- Header-based Fingerprints ---
    if (headers['x-powered-by']) {
      fingerprints.push(`🧠 X-Powered-By: ${headers['x-powered-by'].join(', ')}`);
    }
    if (headers['server']) {
      fingerprints.push(`🖥️ Server: ${headers['server'].join(', ')}`);
    }
    if (headers['x-vercel-id']) {
      fingerprints.push('🚀 Hosting: Vercel');
    }
    if (headers['cf-ray']) {
      fingerprints.push('☁️ CDN: Cloudflare');
    }

    // --- HTML Content-based Fingerprints ---
    if (/generator.*wordpress/i.test(html)) fingerprints.push('📝 CMS: WordPress');
    if (/generator.*joomla/i.test(html)) fingerprints.push('🧱 CMS: Joomla');
    if (/generator.*drupal/i.test(html)) fingerprints.push('🌐 CMS: Drupal');
    if (/react/i.test(html)) fingerprints.push('⚛️ JavaScript: React');
    if (/__VUE_DEVTOOLS_GLOBAL_HOOK__/i.test(html)) fingerprints.push('🖖 JavaScript: Vue.js');
    if (/ng-version/i.test(html)) fingerprints.push('📐 JavaScript: Angular');
    if (/bootstrap.*\.css/i.test(html)) fingerprints.push('🎨 CSS Framework: Bootstrap');
    if (/tailwind.*\.css/i.test(html)) fingerprints.push('🌬️ CSS Framework: Tailwind CSS');
    if (/jquery/i.test(html)) fingerprints.push('💡 JavaScript Library: jQuery');
    if (/google-analytics/i.test(html)) fingerprints.push('📊 Analytics: Google Analytics');
    if (/checkout\.stripe\.com/i.test(html)) fingerprints.push('💳 Payment: Stripe');

    return NextResponse.json({
      technologies: fingerprints.length ? fingerprints : ['No identifiable tech found'],
      rawHeaders: headers,
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fingerprint technologies', details: error.message },
      { status: 500 }
    );
  }
}
