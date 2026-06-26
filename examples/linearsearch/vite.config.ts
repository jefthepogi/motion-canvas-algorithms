// IMPORTANT: The @motion-canvas/vite-plugin package is distributed as CommonJS, 
// which causes import errors in modern ESM projects. The standard import motionCanvas 
// from '@motion-canvas/vite-plugin' WILL NOT WORK.

// You MUST use the createRequire workaround.

import { defineConfig } from 'vite';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const motionCanvasModule = require('@motion-canvas/vite-plugin');
const motionCanvas = motionCanvasModule.default || motionCanvasModule;
const ffmpegModule = require('@motion-canvas/ffmpeg');
const ffmpeg = ffmpegModule.default || ffmpegModule

export default defineConfig({
  plugins: [motionCanvas(), ffmpeg()],
  server: {
    fs: {
      strict: false, // Optional: useful if you are linking external/local packages
    },
  },
});