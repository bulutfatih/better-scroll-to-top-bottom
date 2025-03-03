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

// Copy static files
const staticFiles = ["manifest.json", "options.html", "styles.css"];
for (const file of staticFiles) {
  const sourcePath = path.join("src", file);
  const destPath = path.join("dist", file);

  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`Copied ${sourcePath} to ${destPath}`);
  } else {
    console.warn(`Warning: ${sourcePath} does not exist`);
  }
}

// Copy icons
const iconsDir = path.join("src", "icons");
const distIconsDir = path.join("dist", "icons");

if (fs.existsSync(iconsDir)) {
  // Create icons directory in dist if it doesn't exist
  if (!fs.existsSync(distIconsDir)) {
    fs.mkdirSync(distIconsDir);
  }

  // Copy all icon files
  const iconFiles = fs.readdirSync(iconsDir);
  for (const file of iconFiles) {
    if (file.endsWith(".png") || file.endsWith(".svg")) {
      const sourcePath = path.join(iconsDir, file);
      const destPath = path.join(distIconsDir, file);
      fs.copyFileSync(sourcePath, destPath);
      console.log(`Copied ${sourcePath} to ${destPath}`);
    }
  }
} else {
  console.warn(`Warning: ${iconsDir} directory does not exist`);
}

console.log("Build completed successfully!");
