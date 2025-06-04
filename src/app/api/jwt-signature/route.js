import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { Buffer } from 'buffer';

export async function POST(req) {
  const { token, secret } = await req.json()

  if (!token || !secret) {
    return NextResponse.json({ error: 'Token and secret are required' }, { status: 400 })
  }

  try {
    const parts = token.split('.')
    if (parts.length !== 3) throw new Error('Invalid JWT format')

    const [headerB64, payloadB64, signatureB64] = parts
    const data = `${headerB64}.${payloadB64}`

    // Convert base64url to Buffer (Node.js >=16 supports 'base64url')
    const signature = Buffer.from(signatureB64, 'base64url')

    const computedSig = crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest()

    // Use timingSafeEqual only if buffers are same length
    if (signature.length !== computedSig.length) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const isValid = crypto.timingSafeEqual(signature, computedSig)

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString())
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString())

    return NextResponse.json({ valid: true, header, payload })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to parse or verify JWT' }, { status: 400 })
  }
}
