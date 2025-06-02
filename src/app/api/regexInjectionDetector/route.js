export async function POST(req) {
  try {
    const { code } = await req.json();

    // Simple line-by-line scan (for demo)
    const lines = code.split('\n');
    const issues = [];
    const fixes = [];

    lines.forEach((line, idx) => {
      // Detect unsafe new RegExp usage without escaping input
      const unsafeRegexMatch = line.match(/new RegExp\((.+)\)/);
      if (unsafeRegexMatch) {
        const inputVar = unsafeRegexMatch[1].trim();

        // For demo, flag all new RegExp(inputVar) as risky
        issues.push({
          line: idx + 1,
          pattern: line.trim(),
          risk: 'Unescaped input in RegExp constructor',
        });

        // Suggest fix: escape input before usage
        fixes.push(`// Suggested fix for line ${idx + 1}:`);
        fixes.push(
          `const safeInput = ${inputVar}.replace(/[.*+?^${'{'}()|[\\]\\\\]/g, '\\\\$&');`
        );
        fixes.push(`const regex = new RegExp(safeInput);`);
      }

      // Example: detect regex patterns vulnerable to ReDoS (simple check)
      if (line.includes('(.*)') || line.includes('(.*?)')) {
        issues.push({
          line: idx + 1,
          pattern: line.trim(),
          risk: 'Potential ReDoS pattern detected',
        });
        fixes.push(`// Review regex pattern on line ${idx + 1} for ReDoS risks`);
      }
    });

    return new Response(
      JSON.stringify({
        issues,
        fixes,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
