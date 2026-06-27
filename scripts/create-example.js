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

const targetDir = path.join(process.cwd(), 'examples', projectName);
const rootPackagePath = path.join(process.cwd(), 'package.json');

// --- GUARDRAIL 1: Check Folder Tree Collision ---
if (fs.existsSync(targetDir)) {
  console.error(`❌ Error: A directory named "examples/${projectName}" already exists on disk.`);
  process.exit(1);
}

// Read Root Configuration Manifest safely
let rootPackage = { scripts: {} };
if (fs.existsSync(rootPackagePath)) {
  try {
    rootPackage = JSON.parse(fs.readFileSync(rootPackagePath, 'utf8'));
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

console.log(`✅ All guardrails passed. ◌ Scaffolding silo: examples/${projectName}...`);

// 2. Create directory tree
fs.mkdirSync(path.join(targetDir, 'src', 'scenes'), { recursive: true });

// 3. Write package.json inside the silo
fs.writeFileSync(
  path.join(targetDir, 'package.json'),
  JSON.stringify({
    name: projectName,
    private: true,
    type: "module",
    scripts: {
      "dev": "vite",
      "build": "tsc && vite build"
    }
  }, null, 2)
);

// 4. Write tsconfig.json inside the silo
fs.writeFileSync(
  path.join(targetDir, 'tsconfig.json'),
  JSON.stringify({
    "extends": "@motion-canvas/2d/tsconfig.project.json",
    "compilerOptions": {
      "target": "ES2022",
      "module": "NodeNext",
      "moduleResolution": "NodeNext",
      "skipLibCheck": true,
      "types": ["node"]
    },
    "include": ["src/**/*", "vite.config.ts"]
  }, null, 2)
);

// 5. Write vite.config.ts
fs.writeFileSync(
  path.join(targetDir, 'vite.config.ts'),
  `import {defineConfig} from 'vite';
import motionCanvas from '@motion-canvas/vite-plugin';
import ffmpeg from '@motion-canvas/ffmpeg';

export default defineConfig({
  plugins: [
    motionCanvas(),
    ffmpeg(),
  ],
});
`
);

// 6. Write src/project.ts
fs.writeFileSync(
  path.join(targetDir, 'src', 'project.ts'),
  `import {makeProject} from '@motion-canvas/core';
import mainScene from './scenes/main';

export default makeProject({
  scenes: [mainScene],
});
`
);

// 7. Write src/scenes/main.tsx
fs.writeFileSync(
  path.join(targetDir, 'src', 'scenes', 'main.tsx'),
  `import {makeScene2D, Txt} from '@motion-canvas/2d';
import {all, createRef} from '@motion-canvas/core';

export default makeScene2D(function* (view) {
  const textRef = createRef<Txt>();

  view.add(
    <Txt
      ref={textRef}
      text="Hello, Motion Canvas!"
      fill="#fff"
      fontFamily="Consolas, monospace"
    />
  );

  yield* textRef().scale(1.5, 1).to(1, 1);
});
`
);

// 8. Safely inject into Root Manifest
if (!rootPackage.scripts) rootPackage.scripts = {};
rootPackage.scripts[projectName] = `npm run dev --workspace=${projectName}`;

fs.writeFileSync(rootPackagePath, JSON.stringify(rootPackage, null, 2), 'utf8');
console.log(`🔗 Automatically added "${projectName}" command to root package.json!`);

console.log(`\n✅ Success! Now do the following to initialize the project:
             \n1. Run "npm install"
             \n2. Run "npm run ${projectName}" to access the live editor.`);
