import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import pluginSecurity from "eslint-plugin-security";

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
      "react/prop-types": "off", // If you don't want prop-types validation
      "react/jsx-uses-react": "off", // React 17+ doesn't require this rule
    },
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: ["security"],
    extends: ["plugin:security/recommended"],
  },
]);
