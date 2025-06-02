import dns from 'dns/promises';
import net from 'net';

export async function POST(request) {
  try {
    const { ip } = await request.json();

    if (!ip) {
      return new Response(JSON.stringify({ error: 'IP address is required' }), { status: 400 });
    }

    // Validate IP address (IPv4 or IPv6)
    if (!net.isIP(ip)) {
      return new Response(JSON.stringify({ error: 'Invalid IP address format' }), { status: 400 });
    }

    try {
      const domains = await dns.reverse(ip);
      if (domains.length === 0) {
        return new Response(JSON.stringify({ error: 'No PTR record found for this IP' }), { status: 404 });
      }
      return new Response(JSON.stringify({ domains }), { status: 200 });
    } catch (error) {
      // If dns.reverse throws, it's likely no PTR record or lookup failure
      return new Response(JSON.stringify({ error: 'No PTR record found or DNS lookup failed' }), { status: 404 });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 });
  }
}
