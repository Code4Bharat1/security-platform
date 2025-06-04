import { NextResponse } from 'next/server';
import { performance } from 'perf_hooks';
import { Buffer } from 'buffer';

export async function POST(req) {
  const { url } = await req.json();

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const start = performance.now();
    const res = await fetch(url, { cache: 'no-store' });
    const html = await res.text();
    const end = performance.now();

    const timeMs = Math.round(end - start);
    const sizeKb = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(2);

    return NextResponse.json({
      url,
      status: res.status,
      loadTimeMs: timeMs,
      sizeKb,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Fetch failed', details: err.message }, { status: 500 });
  }
}
