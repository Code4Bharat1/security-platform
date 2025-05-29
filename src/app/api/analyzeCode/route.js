import { ESLint } from 'eslint';

export async function POST(req) {
  try {
    const { code } = await req.json();

    if (!code || typeof code !== 'string') {
      return new Response(JSON.stringify({ error: "Invalid or missing code" }), { status: 400 });
    }

    const eslint = new ESLint({
      overrideConfig: [
        {
          files: ["**/*.js"],
          languageOptions: {
            ecmaVersion: 2021,
            sourceType: "module",
          },
          plugins: {
            security: require("eslint-plugin-security"),
          },
          rules: {
            "no-unused-vars": "warn",
            "no-console": "warn",
            "semi": ["error", "always"],
            "eqeqeq": "error",
            "no-eval": "error",
            "no-var": "error",
            "prefer-const": "warn",
            "complexity": ["warn", 5],
            "security/detect-object-injection": "warn",
          },
        },
      ],
    });

    const results = await eslint.lintText(code, { filePath: "file.js" });

    const issues = results.flatMap(result =>
      result.messages.map(message => ({
        line: message.line,
        message: message.message,
        ruleId: message.ruleId || 'N/A',
        severity:
          message.severity === 2
            ? 'error'
            : message.severity === 1
            ? 'warning'
            : 'info',
      }))
    );

    return new Response(JSON.stringify({ issues }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error("ESLint API error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
