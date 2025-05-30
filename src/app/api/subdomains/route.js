// app/api/subdomains/route.js

export async function POST(req) {
  const { domain } = await req.json();
  const apiKey = process.env.SECURITYTRAILS_API_KEY;
  if (!domain) {
    return new Response(JSON.stringify({ error: 'Domain is required' }), { status: 400 });
  }


  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'API key not found. Please set SECURITYTRAILS_API_KEY in .env.local' }),
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`https://api.securitytrails.com/v1/domain/${domain}/subdomains`, {
      headers: {
        'Accept': 'application/json',
        'APIKEY': apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ error: `SecurityTrails API error: ${response.status} - ${errorText}` }),
        { status: response.status }
      );
    }

    const data = await response.json();

    // data.subdomains is an array of subdomain strings
    // We append domain to each to get full subdomain name
    const results = data.subdomains.map((sub) => ({
      subdomain: `${sub}.${domain}`,
    }));

    return new Response(JSON.stringify({ results }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch subdomains' }), { status: 500 });
  }
}

