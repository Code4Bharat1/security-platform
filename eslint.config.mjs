import js from "@eslint/js";
import pluginSecurity from "eslint-plugin-security";
import pluginNoUnsanitized from "eslint-plugin-no-unsanitized";
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat();

/** @type {import("eslint").FlatConfig[]} */
export default [

  ...compat.extends('next','next/core-web-vitals'),
  
  js.configs.recommended,
  {
    plugins: {
      security: pluginSecurity,
      "no-unsanitized": pluginNoUnsanitized,
    },
    rules: {
      "security/detect-eval-with-expression": "error",
      "no-unsanitized/method": "error",
      "no-unsanitized/property": "error",
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
        require: "readonly",
        module: "readonly",
        fetch: "readonly",
        Response: "readonly",
        Request: "readonly",         
        AbortController: "readonly", 
        URL: "readonly",
        setTimeout: "readonly",    
        clearTimeout: "readonly",   
      },
    },
  },
];
