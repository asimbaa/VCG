/**
 * PWA Cache-Busting & GitHub Pages Deployment Hardener
 * Valourian Capital Management OS
 * 
 * Injects deterministic cache-busting versions into manifest.json, sw.js, and index.html
 * to ensure users and installable PWAs immediately receive latest updates without stale caches.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const isPostBuild = process.argv.includes('--post-build');
const buildHash = (process.env.GITHUB_SHA || process.env.BUILD_HASH || Date.now().toString(36)).substring(0, 8);
const timestamp = new Date().toISOString();

console.log(`[PWA CACHE-BUST]: Initializing with buildHash: ${buildHash} (${timestamp})`);

// 1. Update public/manifest.json with dynamic cache version
const publicManifestPath = path.join(rootDir, 'public', 'manifest.json');
if (fs.existsSync(publicManifestPath)) {
  try {
    const manifest = JSON.parse(fs.readFileSync(publicManifestPath, 'utf8'));
    manifest.version = buildHash;
    manifest.build_timestamp = timestamp;
    manifest.id = `/?v=${buildHash}`;
    fs.writeFileSync(publicManifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
    console.log(`[PWA CACHE-BUST]: Updated ${publicManifestPath} with version ${buildHash}`);
  } catch (err) {
    console.warn(`[PWA CACHE-BUST]: Warning updating public manifest:`, err.message);
  }
}

// 2. Sync src/sw.js to public/sw.js and inject cache version
const srcSwPath = path.join(rootDir, 'src', 'sw.js');
const publicSwPath = path.join(rootDir, 'public', 'sw.js');

if (fs.existsSync(srcSwPath)) {
  try {
    let swContent = fs.readFileSync(srcSwPath, 'utf8');
    // Inject dynamic cache version tag
    swContent = swContent.replace(/__BUILD_HASH__/g, buildHash);
    swContent = swContent.replace(/__BUILD_TIMESTAMP__/g, timestamp);
    fs.writeFileSync(publicSwPath, swContent, 'utf8');
    console.log(`[PWA CACHE-BUST]: Synchronized src/sw.js -> public/sw.js with version ${buildHash}`);
  } catch (err) {
    console.warn(`[PWA CACHE-BUST]: Warning syncing sw.js:`, err.message);
  }
}

// 3. Post-build processing on dist/ directory
if (isPostBuild) {
  const distDir = path.join(rootDir, 'dist');
  if (fs.existsSync(distDir)) {
    console.log(`[PWA CACHE-BUST]: Executing post-build distribution hardening in ${distDir}`);

    // Create .nojekyll for GitHub Pages
    const noJekyllPath = path.join(distDir, '.nojekyll');
    fs.writeFileSync(noJekyllPath, '', 'utf8');
    console.log(`[PWA CACHE-BUST]: Created .nojekyll bypass`);

    // Copy index.html -> 404.html for SPA client-side routing on GitHub Pages
    const indexPath = path.join(distDir, 'index.html');
    const notFoundPath = path.join(distDir, '404.html');
    if (fs.existsSync(indexPath)) {
      let indexContent = fs.readFileSync(indexPath, 'utf8');
      
      // Cache-bust manifest reference
      indexContent = indexContent.replace(
        /href="\/manifest\.json"/g,
        `href="/manifest.json?v=${buildHash}"`
      );
      indexContent = indexContent.replace(
        /href="\/manifest\.webmanifest"/g,
        `href="/manifest.webmanifest?v=${buildHash}"`
      );

      fs.writeFileSync(indexPath, indexContent, 'utf8');
      fs.writeFileSync(notFoundPath, indexContent, 'utf8');
      console.log(`[PWA CACHE-BUST]: Injected manifest cache-bust and generated dist/404.html`);
    }

    // Sync sw.js to dist
    const distSwPath = path.join(distDir, 'sw.js');
    if (fs.existsSync(publicSwPath)) {
      fs.copyFileSync(publicSwPath, distSwPath);
      console.log(`[PWA CACHE-BUST]: Copied active service worker to dist/sw.js`);
    }

    // Update dist/manifest.json if exists
    const distManifestPath = path.join(distDir, 'manifest.json');
    if (fs.existsSync(distManifestPath)) {
      try {
        const manifest = JSON.parse(fs.readFileSync(distManifestPath, 'utf8'));
        manifest.version = buildHash;
        manifest.build_timestamp = timestamp;
        manifest.id = `/?v=${buildHash}`;
        fs.writeFileSync(distManifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
      } catch (e) {
        // Ignore
      }
    }
  }
}

console.log(`[PWA CACHE-BUST]: Completed successfully.`);
