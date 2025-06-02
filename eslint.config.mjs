import js from "@eslint/js";
import pluginSecurity from "eslint-plugin-security";
import pluginNoUnsanitized from "eslint-plugin-no-unsanitized";

/** @type {import("eslint").FlatConfig[]} */
export default [
  js.configs.recommended,
  {
    plugins: {
      security: pluginSecurity,
      "no-unsanitized": pluginNoUnsanitized
    },
    rules: {
      "security/detect-eval-with-expression": "error",
      "no-unsanitized/method": "error",
      "no-unsanitized/property": "error"
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module"
    }
  }
];
