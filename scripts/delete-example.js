import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// 1. Get and sanitize input name
const userArg = process.argv[2];

if (!userArg) {
  console.error('⛔ Error: Please specify the name of the silo to delete. Example: npm run delete-silo binary-search');
  process.exit(1);
}

const projectName = userArg.toLowerCase().trim().replace(/[^a-z0-9-_]/g, '-');
const TARGET_DIRECTORY = path.join(process.cwd(), 'examples', projectName);
const ROOT_PKG_PATH = path.join(process.cwd(), 'package.json');
const VITE_CACHE_DIRECTORY = path.join(process.cwd(), 'node_modules', '.vite');

console.log(`🧹 Preparing to safely remove workspace silo: examples/${projectName}...`);

// --- GUARDRAIL 1: Check Folder Existence ---
if (!fs.existsSync(TARGET_DIRECTORY)) {
  console.error(`⛔ Error: No directory named "examples/${projectName}" exists on disk.`);
  process.exit(1);
}

// --- GUARDRAIL 2: Read & Verify Root Config ---
let rootPackage = null;
if (fs.existsSync(ROOT_PKG_PATH)) {
  try {
    rootPackage = JSON.parse(fs.readFileSync(ROOT_PKG_PATH, 'utf8'));
  } catch (err) {
    console.error('⛔ Error: Your root package.json file is malformed or corrupted.');
    process.exit(1);
  }
} else {
  console.error('⛔ Error: Root package.json was not found.');
  process.exit(1);
}

// 2. Perform File and Folder Deletion
try {
  // Recursively wipes out the folder (works perfectly on Windows/Mac/Linux natively)
  fs.rmSync(TARGET_DIRECTORY, { recursive: true, force: true });
  console.log(` Successfully deleted "examples/${projectName}" and its child directories.`);
} catch (err) {
  console.error(`⛔ Error deleting folder: ${err.message}`);
  process.exit(1);
}

// 3. Clean and Unregister Script from Root Manifest
if (rootPackage.scripts && rootPackage.scripts[projectName]) {
  delete rootPackage.scripts[projectName];
  
  try {
    fs.writeFileSync(ROOT_PKG_PATH, JSON.stringify(rootPackage, null, 2), 'utf8');
    console.log(`Removed "${projectName}" command from your root package.json.`);
  } catch (err) {
    console.error(`⚠️ Could not update root package.json automatically: ${err.message}`);
  }
} else {
  console.log(`ℹ️ Notice: No script key named "${projectName}" was found in root package.json.`);
}

// 4. Force Prune Vite's internal module dependency mapping
if (fs.existsSync(VITE_CACHE_DIRECTORY)) {
  try {
    fs.rmSync(VITE_CACHE_DIRECTORY, { recursive: true, force: true });
    console.log('⚡ Cleared hidden Vite metadata cache files successfully.');
  } catch (err) {
    console.warn('⚠️ Note: Vite cache directory was busy and couldn\'t be cleared automatically.');
  }
}

// 5. Run native package unlinking synchronously inside the terminal
try {
  console.log('🔄 Re-indexing active npm workspace configurations...');
  // Force clean the cache and update symlinks
  console.log('🔄 Running npm install...');
  execSync('npm install', { stdio: 'ignore' });
  console.log('🔗 Successfully decoupled workspace links from your dependency tree.');
} catch (err) {
  console.log(err);
  console.error('⚠️ Warning: Failed to run automatic npm optimization pass.');
}

console.log(`\n✅ Success! The example has been deleted and the workspace is now cleaned.`);
