// New rule: no-sql-injection.js

/**
 * Rule to detect potential SQL injection vulnerabilities
 */
const noSqlInjectionRule = {
  id: "no-sql-injection",
  description: "Potential SQL injection vulnerability detected. Use parameterized queries instead",
  
  /**
   * Detects potential SQL injection patterns in AST node
   * @param {Object} node - AST node
   * @returns {boolean} - true if potential SQL injection is detected
   */
  detect: function(node) {
    // Check for string concatenation with SQL keywords
    if (node.type === "BinaryExpression" && node.operator === "+") {
      // Check if we're concatenating strings containing SQL keywords
      const sqlKeywords = ["SELECT", "INSERT", "UPDATE", "DELETE", "DROP", "CREATE", "ALTER"];
      
      // Helper function to check if a literal contains SQL keywords
      const containsSqlKeyword = (strNode) => {
        if (strNode && strNode.type === "StringLiteral") {
          const value = strNode.value.toUpperCase();
          return sqlKeywords.some(keyword => value.includes(keyword));
        }
        return false;
      };
      
      // Check both sides of the concatenation
      if (containsSqlKeyword(node.left) || containsSqlKeyword(node.right)) {
        return true;
      }
      
      // Handle template literals
      if (
        (node.left.type === "TemplateLiteral" || node.right.type === "TemplateLiteral") &&
        // Check if any quasis contain SQL keywords
        ((node.left.type === "TemplateLiteral" && 
          node.left.quasis.some(quasi => 
            sqlKeywords.some(keyword => 
              quasi.value.raw.toUpperCase().includes(keyword)))) ||
         (node.right.type === "TemplateLiteral" && 
          node.right.quasis.some(quasi => 
            sqlKeywords.some(keyword => 
              quasi.value.raw.toUpperCase().includes(keyword)))))
      ) {
        return true;
      }
    }
    
    // Check template literals with SQL keywords
    if (node.type === "TemplateLiteral") {
      const sqlKeywords = ["SELECT", "INSERT", "UPDATE", "DELETE", "DROP", "CREATE", "ALTER"];
      
      // Check if any quasis contain SQL keywords and the template has expressions
      if (
        node.expressions.length > 0 &&
        node.quasis.some(quasi => 
          sqlKeywords.some(keyword => 
            quasi.value.raw.toUpperCase().includes(keyword)))
      ) {
        return true;
      }
    }
    
    return false;
  }
};

export default noSqlInjectionRule;
