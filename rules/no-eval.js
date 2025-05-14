// Example implementation of no-eval.js rule

/**
 * Rule to detect usage of eval() function which is a security risk
 */
const noEvalRule = {
  id: "no-eval",
  description: "Avoid using eval() as it can execute arbitrary code and lead to security vulnerabilities",
  
  /**
   * Detects usage of eval() in AST node
   * @param {Object} node - AST node
   * @returns {boolean} - true if eval is detected
   */
  detect: function(node) {
    // Check for direct eval() calls
    if (
      node.type === "CallExpression" &&
      node.callee.type === "Identifier" &&
      node.callee.name === "eval"
    ) {
      return true;
    }
    
    // Check for Function constructor (another form of eval)
    if (
      node.type === "NewExpression" &&
      node.callee.type === "Identifier" &&
      node.callee.name === "Function"
    ) {
      return true;
    }
    
    // Check for setTimeout/setInterval with string arguments
    if (
      node.type === "CallExpression" &&
      node.callee.type === "Identifier" &&
      (node.callee.name === "setTimeout" || node.callee.name === "setInterval") &&
      node.arguments.length > 0 &&
      node.arguments[0].type === "StringLiteral"
    ) {
      return true;
    }
    
    return false;
  }
};

export default noEvalRule;