import fs from 'fs';
import path from 'path';

// 1. Get and sanitize input name
const userArg = process.argv[2];

if (!userArg) {
  console.error('❌ Error: Please specify the name of the silo to delete. Example: npm run delete-silo binary-search');
  process.exit(1);
}

const projectName = userArg.toLowerCase().trim().replace(/[^a-z0-9-_]/g, '-');
const targetDir = path.join(process.cwd(), 'examples', projectName);
const rootPackagePath = path.join(process.cwd(), 'package.json');

console.log(`🧹 Preparing to safely remove workspace silo: examples/${projectName}...`);

// --- GUARDRAIL 1: Check Folder Existence ---
if (!fs.existsSync(targetDir)) {
  console.error(`❌ Error: No directory named "examples/${projectName}" exists on disk.`);
  process.exit(1);
}

// --- GUARDRAIL 2: Read & Verify Root Config ---
let rootPackage = null;
if (fs.existsSync(rootPackagePath)) {
  try {
    rootPackage = JSON.parse(fs.readFileSync(rootPackagePath, 'utf8'));
  } catch (err) {
    console.error('❌ Error: Your root package.json file is malformed or corrupted.');
    process.exit(1);
  }
} else {
  console.error('❌ Error: Root package.json was not found.');
  process.exit(1);
}

// 2. Perform File and Folder Deletion
try {
  // Recursively wipes out the folder (works perfectly on Windows/Mac/Linux natively)
  fs.rmSync(targetDir, { recursive: true, force: true });
  console.log(`🗑️ Successfully deleted "examples/${projectName}" and its child directories.`);
} catch (err) {
  console.error(`❌ Error deleting folder: ${err.message}`);
  process.exit(1);
}

// 3. Clean and Unregister Script from Root Manifest
if (rootPackage.scripts && rootPackage.scripts[projectName]) {
  delete rootPackage.scripts[projectName];
  
  try {
    fs.writeFileSync(rootPackagePath, JSON.stringify(rootPackage, null, 2), 'utf8');
    console.log(`✂️ Removed "${projectName}" command from your root package.json.`);
  } catch (err) {
    console.error(`⚠️ Could not update root package.json automatically: ${err.message}`);
  }
} else {
  console.log(`ℹ️ Notice: No script key named "${projectName}" was found in root package.json.`);
}

console.log(`\n✅ Success! Run "npm install" at your project root to clean the workspace tree memory map.`);
