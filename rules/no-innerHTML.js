// Example implementation of no-innerHTML.js rule

/**
 * Rule to detect usage of innerHTML which can lead to XSS vulnerabilities
 */
const noInnerHTMLRule = {
  id: "no-innerHTML",
  description: "Using innerHTML can lead to XSS vulnerabilities. Consider textContent or innerText instead",
  
  /**
   * Detects usage of innerHTML in AST node
   * @param {Object} node - AST node
   * @returns {boolean} - true if innerHTML is detected
   */
  detect: function(node) {
    // Check for element.innerHTML = value assignment
    if (
      node.type === "AssignmentExpression" &&
      node.left.type === "MemberExpression" &&
      node.left.property.type === "Identifier" &&
      node.left.property.name === "innerHTML"
    ) {
      return true;
    }

    // Check for document.write() calls
    if (
      node.type === "CallExpression" &&
      node.callee.type === "MemberExpression" &&
      node.callee.object.type === "Identifier" &&
      node.callee.object.name === "document" &&
      node.callee.property.type === "Identifier" &&
      node.callee.property.name === "write"
    ) {
      return true;
    }
    
    return false;
  }
};

export default noInnerHTMLRule;