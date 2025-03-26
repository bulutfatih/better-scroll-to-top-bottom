import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure dist directory exists
if (!fs.existsSync("dist")) {
  fs.mkdirSync("dist");
}

// Compile TypeScript files
console.log("Compiling TypeScript files...");
try {
  execSync("npx tsc", { stdio: "inherit" });
  console.log("TypeScript compilation successful!");
} catch (error) {
  console.error("TypeScript compilation failed:", error.message);
  process.exit(1);
}

// Copy specific files from src to dist
const filesToCopy = [
  "manifest.json",
  "options.html",
  "popup.html",
  "styles.css",
  "options.css",
  "popup.css",
];

for (const file of filesToCopy) {
  try {
    fs.copyFileSync(`src/${file}`, `dist/${file}`);
    console.log(`Copied src/${file} to dist/${file}`);
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log(`Warning: ${file} not found in src directory, skipping`);
    } else {
      console.error(`Error copying ${file}: ${err.message}`);
    }
  }
}

// Create icons directory in dist if it doesn't exist
if (!fs.existsSync("dist/icons")) {
  fs.mkdirSync("dist/icons");
}

// Copy icon files from src/icons to dist/icons
try {
  const iconFiles = fs.readdirSync("src/icons");
  for (const file of iconFiles) {
    if (file.endsWith(".png") || file.endsWith(".svg")) {
      fs.copyFileSync(`src/icons/${file}`, `dist/icons/${file}`);
      console.log(`Copied src/icons/${file} to dist/icons/${file}`);
    }
  }
} catch (err) {
  console.error(`Error copying icon files: ${err.message}`);
}

console.log("Build completed successfully!");
