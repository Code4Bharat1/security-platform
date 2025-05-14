import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";
import noEvalRule from "./rules/no-eval.js";

const customSecurityPlugin = {
  rules: {
    "no-eval": noEvalRule,
  },
};

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ["**/*.{jsx,js}"],
    plugins: ["react"],
    extends: ["plugin:react/recommended"],
    rules: {
      "react/prop-types": "off",
      "react/jsx-uses-react": "off",
    },
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: {
      security: customSecurityPlugin,
    },
    rules: {
      "security/no-eval": "error",
    },
  },
]);
