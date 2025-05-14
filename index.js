import fs from "fs";
import path from "path";
import { runJSAnalysis } from "./analyzer/jsScanner.js"; // Correct path to jsScanner.js

const sampleCode = fs.readFileSync("./samples/sample.js", "utf8");

runJSAnalysis(sampleCode).then((issues) => {
  console.log("Security Issues Found:");
  console.table(issues);
});
