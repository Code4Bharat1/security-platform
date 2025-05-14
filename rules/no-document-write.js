// rules/no-document-write.js
export default {
  id: "no-document-write",
  description: "Avoid using document.write() as it can overwrite your HTML content.",
  detect: (code) => code.includes("document.write"),
};
