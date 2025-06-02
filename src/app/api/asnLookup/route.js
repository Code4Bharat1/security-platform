export async function POST(req) {
  try {
    const { ip } = await req.json();

    const ipv4Pattern =
      /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
    const ipv6Pattern =
      /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(([0-9a-fA-F]{1,4}:){1,7}:)|(([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4})|(([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2})|(([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3})|(([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4})|(([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5})|(([0-9a-fA-F]{1,4}:){1}(:[0-9a-fA-F]{1,4}){1,6})|(:((:[0-9a-fA-F]{1,4}){1,7}|:)))$/;

    if (!ipv4Pattern.test(ip) && !ipv6Pattern.test(ip)) {
      return new Response(
        JSON.stringify({ error: "Invalid IPv4 or IPv6 address." }),
        { status: 400 }
      );
    }

    const res = await fetch(`https://api.bgpview.io/ip/${ip}`);
    const data = await res.json();

    if (!data.data || !data.data.asn) {
      return new Response(
        JSON.stringify({ error: "No ASN information found for this IP." }),
        { status: 404 }
      );
    }

    const asnInfo = data.data.asn; // note: singular 'asn'

    return new Response(JSON.stringify({ asnInfo }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Server error: " + error.message }),
      { status: 500 }
    );
  }
}
