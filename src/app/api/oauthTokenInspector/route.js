export async function POST(req) {
  try {
    const { token } = await req.json();

    if (!token || typeof token !== 'string') {
      return Response.json({ error: 'Token is required.' }, { status: 400 });
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return Response.json({ error: 'Invalid JWT format.' }, { status: 400 });
    }

    const base64UrlDecode = (str) =>
      JSON.parse(Buffer.from(str, 'base64url').toString('utf-8'));

    const payload = base64UrlDecode(parts[1]);
    const now = Math.floor(Date.now() / 1000);

    const issues = [];

    if (!payload.exp) {
      issues.push('⚠️ Missing `exp` (token has no expiration).');
    } else if (payload.exp - now > 60 * 60 * 24) {
      issues.push('⚠️ Token expiration is over 24h (long-lived token).');
    } else if (payload.exp < now) {
      issues.push('❌ Token has expired.');
    }

    if (!payload.iss) issues.push('⚠️ Missing `iss` (issuer).');
    if (!payload.aud) issues.push('⚠️ Missing `aud` (audience).');
    if (!payload.iat) issues.push('⚠️ Missing `iat` (issued at).');

    return Response.json({ payload, issues });
  } catch (err) {
    return Response.json(
      { error: 'Failed to parse or decode the token.' },
      { status: 500 }
    );
  }
}
