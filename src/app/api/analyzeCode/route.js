import { ESLint } from 'eslint';
import { Response } from 'node-fetch';

export async function POST(req) {
  try {
    const { code } = await req.json();

    if (!code || typeof code !== 'string') {
      return new Response(JSON.stringify({ error: "Invalid or missing code" }), { status: 400 });
    }

    // Dynamically import the CommonJS plugin
    const securityPlugin = (await import('eslint-plugin-security')).default || (await import('eslint-plugin-security'));

    const eslint = new ESLint({
      overrideConfig: [
        {
          files: ["**/*.js"],
          languageOptions: {
            ecmaVersion: 2021,
            sourceType: "module",
          },
          plugins: {
            security: securityPlugin,
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
    // Optionally handle logging differently if console is not available
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
