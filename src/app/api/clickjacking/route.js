export async function POST(req) {
  const { url } = await req.json();

  try {
    const res = await fetch(url, { method: 'HEAD' }); // Use HEAD to fetch headers only
    const headers = Object.fromEntries(res.headers.entries());

    const xFrame = headers['x-frame-options'] || null;
    const csp = headers['content-security-policy'] || null;

    let protectedBy = [];
    if (xFrame) protectedBy.push(`X-Frame-Options: ${xFrame}`);
    if (csp && csp.includes('frame-ancestors')) protectedBy.push(`CSP: ${csp}`);

    const isProtected = protectedBy.length > 0;

    return Response.json({ isProtected, protectedBy, headers });
  } catch (err) {
    return Response.json({ error: 'Failed to fetch headers. Invalid or unreachable URL.' }, { status: 500 });
  }
}
