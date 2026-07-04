import fs from 'fs';
import path from 'path';

// Get the project name from the terminal command argument
const userArg = process.argv[2];

if (!userArg) {
  console.error('❌ Error: Please provide a project name. Example: npm run create-example <projectname> (e.g., npm run create-example myproject)');
  process.exit(1);
}

// Convert input to lowercase alphanumeric with hyphens (URL/Package-safe naming syntax)
const projectName = userArg.toLowerCase().trim().replace(/[^a-z0-9-_]/g, '-');

const TEMPLATE_DIRECTORY = path.join(process.cwd(), 'scripts', 'templates');
const TARGET_DIRECTORY = path.join(process.cwd(), 'examples', projectName);
const ROOT_PKG_PATH = path.join(process.cwd(), 'package.json');

// --- GUARDRAIL 1: Check Folder Tree Collision ---
if (fs.existsSync(TARGET_DIRECTORY)) {
  console.error(`❌ Error: A directory named "examples/${projectName}" already exists on disk.`);
  process.exit(1);
}

// Read Root Configuration Manifest safely
let rootPackage = { scripts: {} };
if (fs.existsSync(ROOT_PKG_PATH)) {
  try {
    rootPackage = JSON.parse(fs.readFileSync(ROOT_PKG_PATH, 'utf8'));
  } catch (err) {
    console.error('❌ Error: Your root package.json file is malformed or corrupted.');
    process.exit(1);
  }
}

// --- GUARDRAIL 2: Check Script Signature Collision ---
if (rootPackage.scripts && rootPackage.scripts[projectName]) {
  console.error(`❌ Error: The script command "${projectName}" is already registered in package.json.`);
  process.exit(1);
}

// --- GUARDRAIL 3: Verify Workspace Naming Conflicts ---
if (rootPackage.workspaces) {
  // If explicitly tracking workspace arrays, look for exact duplicates
  const isDuplicate = fs.readdirSync(path.join(process.cwd(), 'examples'), { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .some(dirent => dirent.name.toLowerCase() === projectName);

  if (isDuplicate) {
    console.error(`❌ Error: Case-insensitive match collision detected for "${projectName}" within examples directory.`);
    process.exit(1);
  }
}

console.log(`✅ All guardrails passed. 🔄 Scaffolding silo: examples/${projectName}...`);

// Helper to read and replace placeholders
const getTemplate = (fileName) => {
  return fs.readFileSync(path.join(TEMPLATE_DIRECTORY, `${fileName}.template`), 'utf8')
    .replace(/{{projectName}}/g, projectName);
};

// 2. Create directory tree
fs.mkdirSync(path.join(TARGET_DIRECTORY, 'src', 'scenes'), { recursive: true });

// 3. Write templates
fs.writeFileSync(path.join(TARGET_DIRECTORY, 'package.json'), getTemplate('package.json'));
fs.writeFileSync(path.join(TARGET_DIRECTORY, 'tsconfig.json'), getTemplate('tsconfig.json'));
fs.writeFileSync(path.join(TARGET_DIRECTORY, 'vite.config.ts'), getTemplate('vite.config.ts'));
fs.writeFileSync(path.join(TARGET_DIRECTORY, 'src/project.ts'), getTemplate('project.ts'));
fs.writeFileSync(path.join(TARGET_DIRECTORY, 'src/scenes/main.tsx'), getTemplate('main.tsx'));
fs.writeFileSync(path.join(TARGET_DIRECTORY, 'src/styles.js'), getTemplate('styles.js'));
fs.writeFileSync(path.join(TARGET_DIRECTORY, 'src/motion-canvas.d.ts'), getTemplate('motion-canvas.d.ts'))

// 9. Create a Typescript Ambient Declaration File
fs.writeFileSync(path.join(TARGET_DIRECTORY, 'src', 'motion-canvas.d.ts'), `/// <reference types="@motion-canvas/core/project" />`)

// 9. Safely inject into Root Manifest
if (!rootPackage.scripts) rootPackage.scripts = {};
rootPackage.scripts[projectName] = `npm run dev --workspace=${projectName}`;

fs.writeFileSync(ROOT_PKG_PATH, JSON.stringify(rootPackage, null, 2), 'utf8');
console.log(`🔗 Automatically added "${projectName}" command to root package.json!`);

console.log(`\n✅ Success! Now do the following to initialize the project:\n1. Run "npm install"\n2. Run "npm run ${projectName}" to access the live editor.`);
