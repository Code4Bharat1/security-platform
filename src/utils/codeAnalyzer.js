// src/utils/codeAnalyzer.js

const eslint = require('eslint');

const analyzeCode = async (userCode) => {
  const linter = new eslint.ESLint({ useEslintrc: false });  // Disables .eslintrc usage
  const results = await linter.lintText(userCode);  // Lint the provided code
  return results;
};

module.exports = analyzeCode;

