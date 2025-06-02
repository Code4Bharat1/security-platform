import { NextResponse } from 'next/server'

export async function POST(req) {
  const { code } = await req.json()

  // === Obfuscation Analysis ===

  // 1. Short or single-character variables
  const shortVars = [...new Set((code.match(/\b[a-zA-Z_]\b/g) || []))]

  // 2. Encoded strings (hex, unicode, base64-like)
  const encodedStrings = [
    ...(code.match(/\\x[0-9a-fA-F]{2}/g) || []),
    ...(code.match(/\\u[0-9a-fA-F]{4}/g) || []),
    ...(code.match(/(["'`])(?:[A-Za-z0-9+/=]{16,})\1/g) || []) // base64-ish
  ]

  // 3. Use of eval or similar
  const usesEval = /(eval|Function|setTimeout\s*\(|setInterval\s*\()/g.test(code)

  // 4. Entropy score (basic heuristic)
  const score = shortVars.length + encodedStrings.length + (usesEval ? 10 : 0)

  const severity =
    score > 15 ? 'High' : score > 5 ? 'Medium' : 'Low'

  return NextResponse.json({
    severity,
    shortVars,
    encodedStrings,
    usesEval
  })
}

