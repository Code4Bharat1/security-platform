import crypto from 'crypto'

export async function POST(req) {
  const { token, secret } = await req.json()

  if (!token || !secret) {
    return Response.json({ error: 'Token and secret are required' }, { status: 400 })
  }

  try {
    const parts = token.split('.')
    if (parts.length !== 3) throw new Error('Invalid JWT format')

    const [headerB64, payloadB64, signatureB64] = parts
    const data = `${headerB64}.${payloadB64}`
    const signature = Buffer.from(signatureB64, 'base64url')
    const computedSig = crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest()

    const isValid = crypto.timingSafeEqual(signature, computedSig)

    if (!isValid) {
      return Response.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString())
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString())

    return Response.json({ valid: true, header, payload })
  } catch (err) {
    return Response.json({ error: 'Failed to parse or verify JWT' }, { status: 400 })
  }
}
