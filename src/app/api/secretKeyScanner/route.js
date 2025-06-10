import { NextResponse } from 'next/server';

const secretPatterns = [
  {
    name: 'AWS Access Key',
    regex: /AKIA[0-9A-Z]{16}/,
    severity: 'High',
    suggestion: 'Rotate this access key immediately and use IAM roles or a secure secret manager.',
  },
  {
    name: 'AWS Secret Key',
    regex: /(?<![A-Z0-9])[A-Za-z0-9/+=]{40}(?![A-Z0-9])/,
    severity: 'High',
    suggestion: 'AWS Secret Keys should never be hardcoded. Use environment variables.',
  },
  {
    name: 'Google API Key',
    regex: /AIza[0-9A-Za-z-_]{35}/,
    severity: 'Medium',
    suggestion: 'Restrict this key in Google Cloud Console to prevent misuse.',
  },
  {
    name: 'Slack Token',
    regex: /xox[baprs]-([0-9a-zA-Z]{10,48})?/,
    severity: 'High',
    suggestion: 'Slack tokens grant access to your workspace. Revoke and rotate immediately.',
  },
  {
    name: 'Private RSA Key',
    regex: /-----BEGIN RSA PRIVATE KEY-----/,
    severity: 'Critical',
    suggestion: 'Do not commit private keys. Move this to a secure, access-controlled vault.',
  },
  {
    name: 'JWT Secret',
    regex: /['"]?secret['"]?\s*[:=]\s*['"].{8,}['"]/i,
    severity: 'High',
    suggestion: 'JWT secrets should be stored in environment variables, not source files.',
  },
  {
    name: 'Generic API Key',
    regex: /(?<![\w])(?:api[_-]?key|secret|token)['"]?\s*[:=]\s*['"][A-Za-z0-9_-]{16,}['"]/i,
    severity: 'Medium',
    suggestion: 'Use a secure configuration method such as a vault or .env file.',
  },
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
          severity: pattern.severity,
          suggestion: pattern.suggestion,
        });
      }
    });
  });

  return NextResponse.json({ secrets });
}
