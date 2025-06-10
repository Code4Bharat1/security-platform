import { ESLint } from "eslint";

export async function POST(req) {
  try {
    const { code } = await req.json();

    if (!code || typeof code !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid or missing code" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const eslint = new ESLint({
      overrideConfigFile: true,
      baseConfig: {
        languageOptions: {
          ecmaVersion: "latest",
          sourceType: "module",
        },
        rules: {
          "no-unused-vars": "warn",
          "no-console": "warn",
          semi: ["error", "always"],
          eqeqeq: "error",
          "no-eval": "error",
          "no-var": "error",
          "prefer-const": "warn",
        },
      },
      
    });

    const results = await eslint.lintText(code);

    const issues = results[0].messages.map((msg) => ({
      line: msg.line,
      message: msg.message,
      ruleId: msg.ruleId,
      severity:
        msg.severity === 2
          ? "error"
          : msg.severity === 1
          ? "warning"
          : "info",
    }));

    return new Response(
      JSON.stringify({
        message: "Linting complete",
        issues,
        passed: issues.filter((i) => i.severity !== "error").length,
        failed: issues.filter((i) => i.severity === "error").length,
        results: issues.map(
          (i) => `Line ${i.line}: ${i.message} [${i.severity}]`
        ),
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("API error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
