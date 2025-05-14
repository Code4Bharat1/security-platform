import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import noEvalRule from "../rules/no-eval.js";
import noInnerHTMLRule from "../rules/no-innerHTML.js";
import noSqlInjectionRule from "../rules/no-sql-injection.js";

// List of all rules to check
const rules = [
  noEvalRule,
  noInnerHTMLRule,
  noSqlInjectionRule,
  // Add more rules as you implement them
];

/**
 * Run security analysis on JavaScript code
 * @param {string} code - JavaScript code to analyze
 * @returns {Array} - Array of security issues found
 */
export async function runJSAnalysis(code) {
  // Handle empty or invalid input
  if (!code || typeof code !== "string" || code.trim() === "") {
    console.log("Empty or invalid code provided to analyzer");
    return [];
  }

  const issues = [];

  try {
    // Parse code into AST
    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx"],
      errorRecovery: true,
      ranges: true,
      tokens: true,
      attachComment: true,
      allowReturnOutsideFunction: true,
      allowAwaitOutsideFunction: true,
      createParenthesizedExpressions: true,
      allowImportExportEverywhere: true,
      locations: true, // Required for line numbers
    });

    // Traverse AST and apply all rules
    // FIX: Handle traverse correctly depending on how it's imported
    // Option 1: If traverse is a default export
    if (typeof traverse === 'function') {
      traverse(ast, {
        enter(path) {
          checkNode(path.node, code, issues);
        }
      });
    } 
    // Option 2: If traverse has a default property
    else if (traverse && typeof traverse.default === 'function') {
      traverse.default(ast, {
        enter(path) {
          checkNode(path.node, code, issues);
        }
      });
    }
    // Option 3: Fallback if neither works
    else {
      console.error("Could not use traverse function, it may not be properly imported");
      // Try a more direct approach for simple cases
      simpleAnalysis(code, issues);
    }

    console.log(`Analysis complete. Found ${issues.length} issues.`);
    return issues;
  } catch (error) {
    console.error("Error in JS analyzer:", error);
    // Try fallback to simple regex-based analysis if AST parsing fails
    simpleAnalysis(code, issues);
    return issues;
  }
}

/**
 * Check a node against all rules
 */
function checkNode(node, code, issues) {
  // Skip nodes without location info (like program root)
  if (!node.loc) return;
  
  // Apply each rule to the current node
  rules.forEach(rule => {
    if (rule.detect(node)) {
      // Get source code for the line
      const lineIndex = node.loc.start.line - 1;
      const sourceLines = code.split("\n");
      const snippet = lineIndex < sourceLines.length ? sourceLines[lineIndex].trim() : "unknown";
      
      issues.push({
        message: rule.description,
        line: node.loc.start.line,
        snippet: snippet
      });
    }
  });
}

/**
 * Simple regex-based analysis as fallback
 * This is used if AST parsing fails
 */
function simpleAnalysis(code, issues) {
  const lines = code.split("\n");
  
  // Simple patterns to detect common issues
  const patterns = [
    {
      regex: /innerHTML\s*=/,
      message: "Using innerHTML can lead to XSS vulnerabilities. Consider textContent or innerText instead"
    },
    {
      regex: /document\.write\(/,
      message: "Using document.write can lead to XSS vulnerabilities"
    },
    {
      regex: /eval\(/,
      message: "Avoid using eval() as it can execute arbitrary code and lead to security vulnerabilities"
    },
    {
      regex: /new Function\(/,
      message: "Using Function constructor is similar to eval() and can lead to security vulnerabilities"
    },
    {
      regex: /setTimeout\(\s*["']/,
      message: "Passing string arguments to setTimeout can act like eval() and lead to security issues"
    },
    {
      regex: /setInterval\(\s*["']/,
      message: "Passing string arguments to setInterval can act like eval() and lead to security issues"
    },
    {
      regex: /SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER.*\+/i,
      message: "Potential SQL injection vulnerability detected. Use parameterized queries instead"
    }
  ];
  
  // Check each line against our patterns
  lines.forEach((line, index) => {
    patterns.forEach(pattern => {
      if (pattern.regex.test(line)) {
        issues.push({
          message: pattern.message,
          line: index + 1,
          snippet: line.trim()
        });
      }
    });
  });
}