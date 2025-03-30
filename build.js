import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check for production mode
const isProduction = process.argv.includes("--production");
console.log(`Building in ${isProduction ? "production" : "development"} mode`);

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

// Minify JavaScript files
console.log("Minifying JavaScript files...");
try {
  const jsFiles = fs.readdirSync("dist").filter((file) => file.endsWith(".js"));
  for (const file of jsFiles) {
    const filePath = path.join("dist", file);
    execSync(`npx terser ${filePath} -o ${filePath} --compress --mangle`, {
      stdio: "inherit",
    });
    console.log(`Minified ${file}`);
  }
  console.log("JavaScript minification successful!");
} catch (error) {
  console.error("JavaScript minification failed:", error.message);
}

// Minify CSS files
console.log("Minifying CSS files...");
try {
  const cssFiles = fs
    .readdirSync("dist")
    .filter((file) => file.endsWith(".css"));
  for (const file of cssFiles) {
    const filePath = path.join("dist", file);
    execSync(`npx cleancss -o ${filePath} ${filePath}`, { stdio: "inherit" });
    console.log(`Minified ${file}`);
  }
  console.log("CSS minification successful!");
} catch (error) {
  console.error("CSS minification failed:", error.message);
}

// Minify HTML files
console.log("Minifying HTML files...");
try {
  const htmlFiles = fs
    .readdirSync("dist")
    .filter((file) => file.endsWith(".html"));

  // Import html-minifier-terser dynamically (ESM)
  const { minify } = await import("html-minifier-terser");

  for (const file of htmlFiles) {
    const filePath = path.join("dist", file);
    const html = fs.readFileSync(filePath, "utf8");

    const minified = await minify(html, {
      collapseWhitespace: true,
      removeComments: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      minifyCSS: true,
      minifyJS: true,
    });

    fs.writeFileSync(filePath, minified);
    console.log(`Minified ${file}`);
  }
  console.log("HTML minification successful!");
} catch (error) {
  console.error("HTML minification failed:", error.message);
}

// If in production mode, remove source maps
if (isProduction) {
  console.log("Removing source maps for production...");
  try {
    const mapFiles = fs
      .readdirSync("dist")
      .filter((file) => file.endsWith(".map"));
    for (const file of mapFiles) {
      fs.unlinkSync(path.join("dist", file));
      console.log(`Removed source map: ${file}`);
    }
    console.log("Source maps removed successfully!");
  } catch (error) {
    console.error("Error removing source maps:", error.message);
  }
}

console.log("Build completed successfully!");
