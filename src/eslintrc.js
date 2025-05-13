// .eslintrc.js

module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',  // React-specific linting
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react'],
  rules: {
    // Add your custom rules here
    'react/prop-types': 'off',  // Example: Disable prop-types rule
  },
};

