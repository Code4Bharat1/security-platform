const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const inputDir = path.join(__dirname, "src");
const outputDir = path.join(__dirname, "dist");

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function convertFile(inputFilePath) {
  const relativePath = path.relative(inputDir, inputFilePath);
  const outputFilePath = path.join(outputDir, relativePath);

  // Ensure output subdirectory exists
  const outputSubDir = path.dirname(outputFilePath);
  if (!fs.existsSync(outputSubDir)) {
    fs.mkdirSync(outputSubDir, { recursive: true });
  }

  const command = `npx babel "${inputFilePath}" --out-file "${outputFilePath}"`;
  console.log("Running:", command);
  execSync(command);
}

function processDirectory(dir) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith(".js")) {
      convertFile(fullPath);
    }
  });
}

processDirectory(inputDir);
