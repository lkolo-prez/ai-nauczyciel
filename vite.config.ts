import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves the project under /ai-nauczyciel/.
// Capacitor / local dev needs a root base, so we switch on an env flag.
const base = process.env.BUILD_TARGET === 'mobile' ? './' : '/ai-nauczyciel/';

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
