import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const srcDir = path.join(rootDir, "node_modules", "maplibre-gl", "dist");
const destDir = path.join(rootDir, "public", "maplibre");

try {
  if (fs.existsSync(srcDir)) {
    fs.mkdirSync(destDir, { recursive: true });
    
    const filesToCopy = [
      "maplibre-gl-worker.mjs",
      "maplibre-gl-shared.mjs",
    ];

    for (const file of filesToCopy) {
      const srcFile = path.join(srcDir, file);
      const destFile = path.join(destDir, file);
      if (fs.existsSync(srcFile)) {
        fs.copyFileSync(srcFile, destFile);
        console.log(`[copy-maplibre-worker] Copied ${file} to public/maplibre/`);
      } else {
        console.warn(`[copy-maplibre-worker] Source file not found: ${srcFile}`);
      }
    }
  } else {
    console.warn(`[copy-maplibre-worker] MapLibre dist directory not found at: ${srcDir}`);
  }
} catch (err) {
  console.error("[copy-maplibre-worker] Error copying worker files:", err);
}
