// /app/api/secretKeyScanner/route.js
import { NextResponse } from 'next/server';

const secretPatterns = [
  { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/ },
  { name: 'AWS Secret Key', regex: /(?<![A-Z0-9])[A-Za-z0-9\/+=]{40}(?![A-Z0-9])/ },
  { name: 'Google API Key', regex: /AIza[0-9A-Za-z\-_]{35}/ },
  { name: 'Slack Token', regex: /xox[baprs]-([0-9a-zA-Z]{10,48})?/ },
  { name: 'Private RSA Key', regex: /-----BEGIN RSA PRIVATE KEY-----/ },
  { name: 'JWT Secret', regex: /['"]?secret['"]?\s*[:=]\s*['"].{8,}['"]/i },
  { name: 'Generic API Key', regex: /(?<![\w])(?:api[_-]?key|secret|token)['"]?\s*[:=]\s*['"][A-Za-z0-9_\-]{16,}['"]/i },
];

export async function POST(req) {
  const { code } = await req.json();
  const lines = code.split('\n');
  const secrets = [];

  lines.forEach((line, idx) => {
    secretPatterns.forEach((pattern) => {
      const match = line.match(pattern.regex);
      if (match) {
        secrets.push({
          line: idx + 1,
          secret: match[0],
          type: pattern.name,
        });
      }
    });
  });

  return NextResponse.json({ secrets });
}

