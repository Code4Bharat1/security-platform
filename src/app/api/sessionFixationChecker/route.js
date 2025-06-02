// /app/api/sessionFixationChecker/route.js

import { NextResponse } from 'next/server';

function analyzeSessionFixation(code) {
  const issues = [];

  // Check if code mentions login but no session regeneration
  const hasLogin = /login/i.test(code);
  const regeneratesSession = /session_regenerate_id\(\)|req\.session\.regenerate\(\)/i.test(code);

  if (hasLogin && !regeneratesSession) {
    issues.push({
      severity: 'high',
      message: 'Session ID is NOT regenerated on login — vulnerability to Session Fixation.',
      suggestion: 'Call session_regenerate_id() or equivalent immediately after login.'
    });
  }

  // Check if session ID is passed in URL parameters
  const sessionInUrl = /sessionid=|sid=|sessid=/i.test(code);
  if (sessionInUrl) {
    issues.push({
      severity: 'medium',
      message: 'Session ID appears to be passed in URL parameters — risky practice.',
      suggestion: 'Avoid passing session identifiers in URLs. Use cookies with secure flags instead.'
    });
  }

  // Check if session cookies have HttpOnly and Secure flags
  const missingHttpOnly = !/HttpOnly/i.test(code);
  const missingSecure = !/Secure/i.test(code);

  if (missingHttpOnly || missingSecure) {
    issues.push({
      severity: 'medium',
      message: `Session cookie missing ${missingHttpOnly ? 'HttpOnly' : ''} ${missingSecure ? 'Secure' : ''} flag(s).`,
      suggestion: 'Set HttpOnly and Secure flags on session cookies to protect them.'
    });
  }

  if (issues.length === 0) {
    issues.push({
      severity: 'low',
      message: 'No session fixation vulnerabilities detected.',
      suggestion: 'Session handling looks safe based on the provided code.'
    });
  }

  return issues;
}

export async function POST(request) {
  const { code } = await request.json();

  if (!code || typeof code !== 'string') {
    return NextResponse.json({ error: 'Invalid input: "code" string required.' }, { status: 400 });
  }

  const report = analyzeSessionFixation(code);

  return NextResponse.json({ report });
}
