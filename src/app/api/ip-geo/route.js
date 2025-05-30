// app/api/ip-geo/route.js

export async function POST(req) {
  try {
    const { domain } = await req.json();

    // Step 1: Get the IP address using DNS (Google DNS API)
    const dnsRes = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
    const dnsData = await dnsRes.json();
    const ip = dnsData.Answer?.[0]?.data;

    if (!ip) {
      return new Response(JSON.stringify({ error: 'IP address not found for domain.' }), {
        status: 404,
      });
    }

    // Step 2: Lookup IP geolocation using ip-api
    const geoRes = await fetch(`http://ip-api.com/json/${ip}`);
    const geoData = await geoRes.json();

    return new Response(JSON.stringify({
      domain,
      ip,
      geo: geoData,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Something went wrong.', details: error.message }), {
      status: 500,
    });
  }
}

