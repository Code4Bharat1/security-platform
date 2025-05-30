export async function POST(req) {
  const { domain } = await req.json();
  const apiKey = process.env.JSONWHOIS_API_KEY; // store your key in .env file

  if (!domain) {
    return Response.json({ success: false, error: 'Domain is required' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.jsonwhoisapi.com/v1/whois?identifier=${domain}`, {
      headers: {
        Authorization: `Token ${apiKey}`,
      },
    });
    const data = await res.json();

    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
