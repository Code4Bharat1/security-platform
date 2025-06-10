import crypto from 'crypto'

export async function POST(req) {
  try {
    const { token, secret } = await req.json()

    if (!token || !secret) {
      return Response.json({ error: 'Token and secret are required' }, { status: 400 })
    }

    const [headerB64, payloadB64, signatureB64] = token.split('.')

    if (!headerB64 || !payloadB64 || !signatureB64) {
      return Response.json({ error: 'Invalid JWT format' }, { status: 400 })
    }

    const data = `${headerB64}.${payloadB64}`

    // Proper Base64URL encoding function
    const base64url = (input) =>
      input.toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')

    const expectedSignature = base64url(
      crypto.createHmac('sha256', secret).update(data).digest()
    )

    const valid = expectedSignature === signatureB64

    return Response.json({ valid })
  } catch (err) {
    console.error('Error validating JWT:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
