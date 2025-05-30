export async function POST(req) {
  const { domain, type = 'A' } = await req.json();

  if (!domain) {
    return Response.json({ success: false, error: 'Domain is required' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://dns.google/resolve?name=${domain}&type=${type}`);
    const data = await res.json();

    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
