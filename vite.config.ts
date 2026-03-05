import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { execSync } from 'node:child_process';

let commitHash = 'dev';
try {
  commitHash = execSync('git rev-parse --short HEAD').toString().trim();
} catch {
  // ignore in environments without git
}

const repoUrl = 'https://github.com/keyboard-dictation/keyboard-dictation.github.io';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  define: {
    __APP_COMMIT__: JSON.stringify(commitHash),
    __APP_REPO__: JSON.stringify(repoUrl)
  }
});
