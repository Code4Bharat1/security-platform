export async function POST(request) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== "string") {
      return Response.json(
        { issues: [], error: "No code provided or invalid format." },
        { status: 400 }
      );
    }

    const lines = code.split("\n");
    const issues = [];

    lines.forEach((line, index) => {
      const lineNumber = index + 1;

      if (line.includes("console.log")) {
        issues.push({
          line: lineNumber,
          message: "Avoid using console.log in production.",
        });
      }

      if (line.includes("eval(")) {
        issues.push({
          line: lineNumber,
          message: "Use of eval() is unsafe.",
        });
      }

      if (/password\s*=\s*['"].+['"]/.test(line)) {
        issues.push({
          line: lineNumber,
          message: "Hardcoded password detected.",
        });
      }
    });

    return Response.json({ issues }, { status: 200 });
  } catch (error) {
    console.error("Error in API:", error);
    return Response.json(
      { issues: [], error: "Internal server error" },
      { status: 500 }
    );
  }
}
