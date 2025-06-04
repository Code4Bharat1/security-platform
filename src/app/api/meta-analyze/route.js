import { fetchAndParseMeta } from '@/lib/fetchMeta';
import { NextResponse } from 'next/server'
export async function POST(request) {
  const { url } = await request.json();

  try {
    const meta = await fetchAndParseMeta(url);
    return NextResponse.json({ meta });
  } 
   catch (err) {
  console.error('Meta fetch error:', err);
  return NextResponse.json({ meta: [], error: 'Failed to fetch site.' }, { status: 500 });
}
}
