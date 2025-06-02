export async function POST(req) {
  const { code } = await req.json()
  const issues = []

  // Check for <form> tags without CSRF token fields
  const formRegex = /<form[\s\S]*?>[\s\S]*?<\/form>/gi
  const forms = code.match(formRegex) || []

  forms.forEach((form, index) => {
    const hasToken = /name=['"]?csrf(token)?['"]?/i.test(form)
    if (!hasToken) {
      issues.push(`Form ${index + 1} does not include a CSRF token.`)
    }
  })

  // Check for fetch or XMLHttpRequest POST without CSRF header
  const fetchRegex = /fetch\([`'"][^'"]+[`'"],\s*{[\s\S]*?method:\s*['"]POST['"][\s\S]*?}\)/gi
  const xhrRegex = /new\s+XMLHttpRequest\(\)[\s\S]*?open\(['"]POST['"]/gi

  if (code.match(fetchRegex)) {
    issues.push('Detected `fetch()` call with POST method. Ensure CSRF headers are included.')
  }

  if (code.match(xhrRegex)) {
    issues.push('Detected `XMLHttpRequest` POST call. Ensure CSRF headers are included.')
  }

  // Determine severity
  const vulnerable = issues.length > 0

  return new Response(JSON.stringify({ vulnerable, issues }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

